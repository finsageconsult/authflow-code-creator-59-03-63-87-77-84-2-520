import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AccessCodeRequest {
  email: string;
  code: string;
  role: string;
  organizationName: string;
  expiresAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, role, organizationName, expiresAt }: AccessCodeRequest = await req.json();

    console.log(`Sending access code to ${email} for role ${role}`);

    const expiryDate = new Date(expiresAt).toLocaleDateString();
    
    const baseUrl = "https://f73c8ec8-3e23-417e-a056-7a97888723ba.sandbox.lovable.dev";
    const loginUrl = `${baseUrl}/auth?code=${code}`;
    
    const subject = `Your ${role} Access Code for ${organizationName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 2px solid #f3f4f6;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          }
          .tagline {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
          }
          .welcome-title {
            color: #1f2937;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 16px;
            text-align: center;
          }
          .code-section {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border: 2px solid #d1d5db;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            position: relative;
          }
          .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .access-code {
            font-size: 42px;
            font-weight: bold;
            color: #1f2937;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #d1d5db;
          }
          .code-note {
            margin: 15px 0 0 0; 
            color: #6b7280; 
            font-size: 14px;
            font-style: italic;
          }
          .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            transition: transform 0.2s ease;
          }
          .login-button:hover {
            transform: translateY(-2px);
          }
          .steps-section {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 25px;
            margin: 30px 0;
            border-radius: 0 12px 12px 0;
          }
          .steps-title {
            margin-top: 0;
            color: #1f2937;
            font-weight: 600;
          }
          .steps-list {
            margin: 0;
            padding-left: 20px;
          }
          .steps-list li {
            margin-bottom: 8px;
            color: #374151;
          }
          .expiry-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .expiry-info strong {
            color: #92400e;
          }
          .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #f3f4f6;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .footer-logo {
            font-weight: 600;
            color: #3b82f6;
          }
          .support-text {
            color: #6b7280;
            font-size: 14px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Finsage</div>
            <p class="tagline">Your Financial Learning Platform</p>
          </div>
          
          <div class="welcome-title">Welcome to ${organizationName}!</div>
          
          <p style="text-align: center; font-size: 16px; color: #374151; margin-bottom: 30px;">
            You've been invited to join as a <strong>${role}</strong>. Get started with your access code below:
          </p>
          
          <div class="code-section">
            <div class="role-badge">${role} Access</div>
            <div class="access-code">${code}</div>
            <p class="code-note">Your unique access code</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="login-button">
              🚀 Login with Access Code
            </a>
          </div>
          
          <div class="steps-section">
            <h3 class="steps-title">Get Started in 3 Easy Steps:</h3>
            <ol class="steps-list">
              <li><strong>Click the login button above</strong> or visit <a href="${baseUrl}/auth" style="color: #3b82f6;">${baseUrl}/auth</a></li>
              <li><strong>Enter your access code:</strong> ${code}</li>
              <li><strong>Complete your profile</strong> and start your learning journey!</li>
            </ol>
          </div>
          
          <div class="expiry-info">
            <strong>⏰ Important:</strong> This access code expires on <strong>${expiryDate}</strong>
          </div>
          
          <p class="support-text">
            Need help? Contact your administrator or reply to this email for assistance.
          </p>
        </div>
        
        <div class="footer">
          <p><span class="footer-logo">Finsage</span> - Empowering Financial Learning</p>
          <p>This invitation was sent for ${organizationName}</p>
          <p>If you didn't expect this email, you can safely ignore it.</p>
        </div>
      </body>
     </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Finsage <no-reply@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-access-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);