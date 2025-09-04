import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Function started, method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request, returning CORS headers");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing POST request");
    const payload = await req.text();
    console.log("Raw payload received:", payload.substring(0, 200) + "...");
    
    // Parse the webhook payload
    const webhookData = JSON.parse(payload);
    console.log("Webhook data keys:", Object.keys(webhookData));
    
    const user = webhookData.user;
    const email_data = webhookData.email_data;
    
    if (!user?.email) {
      console.error("No user email found in payload");
      return new Response(JSON.stringify({ error: "No user email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (!email_data?.token) {
      console.error("No token found in email_data");
      return new Response(JSON.stringify({ error: "No token found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    console.log("Sending email to:", user.email);
    console.log("Token:", email_data.token);
    
    // Create simple branded email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #667eea; font-size: 32px; margin: 0;">Finsage</h1>
          <p style="color: #666; margin: 8px 0 0 0;">Financial Wellness Platform</p>
        </div>
        
        <div style="background: #f8fafc; padding: 32px; border-radius: 12px; margin-bottom: 32px;">
          <h2 style="color: #333; margin: 0 0 16px 0;">Your Login Code</h2>
          <p style="color: #666; margin: 0 0 24px 0;">
            Use this verification code to access your Finsage account:
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${email_data.token}</div>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin: 16px 0 0 0;">
            This code expires in 60 minutes.
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
        console.log("Attempting to send email via Resend...");
        const emailResponse = await resend.emails.send({
          from: "Finsage <noreply@finsage.co>",
          to: [user.email],
          subject: "Your Finsage Login Code",
          html: emailContent,
        });
        console.log("Email sent successfully:", emailResponse);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };
    
    // Use background task to send email without blocking response
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(emailPromise());
    } else {
      // Fallback for local development
      emailPromise();
    }

    // Return immediate success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);