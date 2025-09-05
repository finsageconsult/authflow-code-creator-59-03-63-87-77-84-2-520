import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendAccessCodeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendAccessCodeRequest = await req.json();
    console.log("Sending access code to email:", email);

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email is required" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabaseAdmin = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? ""
    );

    // Find active access codes for this email
    const { data: accessCodes, error: fetchError } = await supabaseAdmin
      .from('access_codes')
      .select(`
        *,
        organizations (
          id,
          name,
          plan,
          status
        )
      `)
      .eq('email', email.trim())
      .gt('max_uses', 0)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error fetching access codes:", fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to find access codes" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!accessCodes || accessCodes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No active access codes found for this email" 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the most recent access code
    const accessCode = accessCodes[0];
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #667eea; font-size: 32px; margin: 0;">Finsage</h1>
          <p style="color: #666; margin: 8px 0 0 0;">Financial Wellness Platform</p>
        </div>
        
        <div style="background: #f8fafc; padding: 32px; border-radius: 12px; margin-bottom: 32px;">
          <h2 style="color: #333; margin: 0 0 16px 0;">Your Access Code</h2>
          <p style="color: #666; margin: 0 0 24px 0;">
            Here is your access code for ${accessCode.organizations?.name || 'your organization'}:
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${accessCode.code}</div>
          </div>
          
          <p style="color: #666; margin: 16px 0 0 0;">
            <strong>Role:</strong> ${accessCode.role}<br>
            <strong>Organization:</strong> ${accessCode.organizations?.name || 'N/A'}
          </p>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 16px 0 0 0;">
            This code does not expire and can be used multiple times.
          </p>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Powered by Finsage
        </p>
      </div>
    `;

    // Send email in background to avoid timeout
    const emailPromise = async () => {
      try {
        console.log("Attempting to send access code email via Resend...");
        const emailResponse = await resend.emails.send({
          from: "Finsage <noreply@finsage.co>",
          to: [email.trim()],
          subject: "Your Finsage Access Code",
          html: emailContent,
        });
        console.log("Access code email sent successfully:", emailResponse);
      } catch (error) {
        console.error("Error sending access code email:", error);
      }
    };
    
    // Use background task to send email without blocking response
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(emailPromise());
    } else {
      // Fallback for local development
      emailPromise();
    }

    console.log("Access code email request processed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Access code sent to your email!"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-access-code function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send access code" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);