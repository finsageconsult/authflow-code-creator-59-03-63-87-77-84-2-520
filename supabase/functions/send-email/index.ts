import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    if (!hookSecret) {
      console.error("SEND_EMAIL_HOOK_SECRET not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    console.log("Processing email for user:", user.email, "action:", email_action_type);

    // Create branded email based on action type
    let subject = "";
    let emailContent = "";

    if (email_action_type === "recovery") {
      subject = "Your Finsage Login Code";
      emailContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <!-- Header with Finsage branding -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Finsage</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Financial Wellness Platform</p>
            </div>
          </div>

          <!-- Main content -->
          <div style="background-color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Your Login Code</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Use the verification code below to securely access your Finsage account:
            </p>
            
            <!-- OTP Code Display -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Your verification code</div>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${token}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 16px 0 0 0; text-align: center;">
              This code will expire in 60 minutes for your security.
            </p>
          </div>

          <!-- Security notice -->
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 20px; height: 20px; background-color: #f59e0b; border-radius: 50%; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 12px; font-weight: bold;">!</span>
              </div>
              <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0;">Security Notice</h3>
            </div>
            <p style="color: #b45309; font-size: 14px; margin: 0; line-height: 1.5;">
              If you didn't request this login code, please ignore this email. Never share your verification codes with anyone.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              This email was sent from Finsage Financial Wellness Platform
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Empowering your financial journey with expert guidance and tools
            </p>
          </div>
        </div>
      `;
    } else if (email_action_type === "magiclink") {
      subject = "Your Finsage Login Code";
      emailContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          <!-- Header with Finsage branding -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Finsage</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Financial Wellness Platform</p>
            </div>
          </div>

          <!-- Main content -->
          <div style="background-color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Your Login Code</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Use the verification code below to securely access your Finsage account:
            </p>
            
            <!-- OTP Code Display -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Your verification code</div>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${token}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 16px 0 0 0; text-align: center;">
              This code will expire in 60 minutes for your security.
            </p>
          </div>

          <!-- Security notice -->
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 20px; height: 20px; background-color: #f59e0b; border-radius: 50%; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 12px; font-weight: bold;">!</span>
              </div>
              <h3 style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0;">Security Notice</h3>
            </div>
            <p style="color: #b45309; font-size: 14px; margin: 0; line-height: 1.5;">
              If you didn't request this login code, please ignore this email. Never share your verification codes with anyone.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              This email was sent from Finsage Financial Wellness Platform
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Empowering your financial journey with expert guidance and tools
            </p>
          </div>
        </div>
      `;
    } else {
      // Default fallback
      subject = "Finsage Account Verification";
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Finsage</h1>
          <p>Your verification code: <strong>${token}</strong></p>
          <p>This code will expire in 60 minutes.</p>
        </div>
      `;
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: "Finsage <noreply@finsage.com>",
      to: [user.email],
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
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