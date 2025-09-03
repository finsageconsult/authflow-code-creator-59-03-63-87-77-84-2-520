import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      organizationName, 
      hrEmail, 
      accessCode, 
      claimLink 
    } = await req.json();

    // Create idempotent event key
    const eventKey = `org_invite_${organizationName}_${hrEmail}_${Date.now()}`;

    // Check if email already sent
    const { data: existingEvent } = await supabase
      .from('email_events')
      .select('id')
      .eq('event_key', eventKey)
      .single();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Finsage <noreply@finsage.com>',
      to: [hrEmail],
      subject: `Welcome to Finsage - Your Organization Setup`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Welcome to Finsage!</h2>
          
          <p>Your organization <strong>${organizationName}</strong> has been successfully created on Finsage.</p>
          
          <p>As the HR administrator, you can now:</p>
          <ul>
            <li>Invite employees to join your organization</li>
            <li>Manage credit allocations</li>
            <li>Track engagement and wellness metrics</li>
            <li>Schedule webinars and coaching sessions</li>
          </ul>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Access Code</h3>
            <p style="font-family: monospace; font-size: 18px; background: white; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; text-align: center;">
              <strong>${accessCode}</strong>
            </p>
            <p style="font-size: 14px; color: #666;">Share this code with your employees to invite them to the platform.</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${claimLink}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Dashboard
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Need help? Reply to this email or contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Finsage - Financial Wellness Platform<br>
            This email was sent to ${hrEmail}
          </p>
        </div>
      `,
    });

    if (emailError) {
      throw emailError;
    }

    // Record email event
    await supabase
      .from('email_events')
      .insert({
        event_key: eventKey,
        email_type: 'org_invite',
        recipient_email: hrEmail,
        metadata: { organizationName, accessCode }
      });

    console.log('Organization invite email sent successfully');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending organization invite:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});