import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommunicationRequest {
  organizationId: string;
  webinarId?: string;
  type: 'reminder' | 'nudge' | 'announcement' | 'follow_up';
  subject: string;
  messageBody: string;
  recipientEmails: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { 
      organizationId, 
      webinarId, 
      type, 
      subject, 
      messageBody, 
      recipientEmails 
    }: CommunicationRequest = await req.json();

    console.log(`Sending ${type} communication to ${recipientEmails.length} recipients`);

    // Get organization details
    const { data: organization } = await supabaseClient
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    // Get webinar details if applicable
    let webinarDetails = null;
    if (webinarId) {
      const { data: webinar } = await supabaseClient
        .from('webinars')
        .select('title, scheduled_date, meeting_link')
        .eq('id', webinarId)
        .single();
      webinarDetails = webinar;
    }

    // Create personalized email content
    const createEmailContent = (recipientEmail: string) => {
      let content = messageBody;
      
      // Add webinar details if applicable
      if (webinarDetails) {
        content += `

<div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
  <h3 style="color: #2563eb; margin-bottom: 10px;">📅 Webinar Details</h3>
  <p><strong>Title:</strong> ${webinarDetails.title}</p>
  <p><strong>Date:</strong> ${new Date(webinarDetails.scheduled_date).toLocaleString()}</p>
  ${webinarDetails.meeting_link ? `<p><strong>Join Link:</strong> <a href="${webinarDetails.meeting_link}" style="color: #2563eb;">Click here to join</a></p>` : ''}
</div>`;
      }

      // Add footer
      content += `

<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
  <p>Best regards,<br>
  The ${organization?.name || 'Finsage'} Team</p>
  
  <p style="margin-top: 15px; font-size: 12px;">
    This email was sent to ${recipientEmail}. You're receiving this because you're part of our financial wellness program.
  </p>
</div>`;

      return content;
    };

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      batches.push(recipientEmails.slice(i, i + batchSize));
    }

    let totalSent = 0;
    const failedEmails = [];

    for (const batch of batches) {
      try {
        const emailPromises = batch.map(email => 
          resend.emails.send({
            from: "Finsage Program <program@resend.dev>",
            to: [email],
            subject: subject,
            html: createEmailContent(email),
          })
        );

        const results = await Promise.allSettled(emailPromises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            totalSent++;
          } else {
            failedEmails.push({
              email: batch[index],
              error: result.reason?.message || 'Unknown error'
            });
          }
        });

        // Small delay between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Batch sending error:', error);
        batch.forEach(email => {
          failedEmails.push({
            email,
            error: error.message || 'Batch sending failed'
          });
        });
      }
    }

    // Record the communication in database
    const { error: insertError } = await supabaseClient
      .from('program_communications')
      .insert({
        organization_id: organizationId,
        webinar_id: webinarId,
        communication_type: type,
        subject: subject,
        message_body: messageBody,
        recipient_count: totalSent,
        sent_at: new Date().toISOString(),
        status: totalSent > 0 ? 'sent' : 'failed'
      });

    if (insertError) {
      console.error('Error recording communication:', insertError);
    }

    console.log(`Communication sent: ${totalSent}/${recipientEmails.length} successful`);

    return new Response(JSON.stringify({
      success: true,
      totalSent,
      totalRequested: recipientEmails.length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-program-communication function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);