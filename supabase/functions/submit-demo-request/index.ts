import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoRequestData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData: DemoRequestData = await req.json();
    console.log('Demo request received:', requestData);

    // Insert demo request into database
    const { data: demoRequest, error: insertError } = await supabase
      .from('demo_requests')
      .insert({
        name: requestData.name,
        email: requestData.email,
        company: requestData.company || null,
        message: requestData.message,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting demo request:', insertError);
      throw new Error(`Failed to save demo request: ${insertError.message}`);
    }

    console.log('Demo request saved successfully:', demoRequest);

    // Send email notification if Resend API key is available
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailResponse = await resend.emails.send({
          from: 'Finsage Demo Requests <demo@finsage.co>',
          to: ['support@finsage.co'],
          subject: `New Demo Request from ${requestData.name}`,
          html: `
            <h2>New Demo Request Received</h2>
            <p><strong>Name:</strong> ${requestData.name}</p>
            <p><strong>Email:</strong> ${requestData.email}</p>
            <p><strong>Company:</strong> ${requestData.company || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${requestData.message}</p>
            <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
          `,
        });

        console.log('Email notification sent:', emailResponse);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't throw error here - we still want to return success if the database save worked
      }
    } else {
      console.log('Resend API key not configured - skipping email notification');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo request submitted successfully',
        data: demoRequest 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-demo-request function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
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