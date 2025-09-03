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
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            padding: 20px 0;
          }
          .code-box {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .access-code {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }
          .role-badge {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin: 10px 0;
          }
          .details {
            background: #fefefe;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .btn {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Finsage</div>
          <p>Welcome to Your Learning Platform</p>
        </div>
        
        <div class="content">
          <h2>Welcome to ${organizationName}!</h2>
          
          <p>You've been invited to join as a <strong>${role}</strong>. Use the access code below to complete your registration:</p>
          
          <div class="code-box">
            <div class="role-badge">${role} Access</div>
            <div class="access-code">${code}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              Copy this code to complete your registration
            </p>
          </div>
          
          <div class="details">
            <h3 style="margin-top: 0;">Next Steps:</h3>
            <ol>
              <li>Click the registration link (or visit our platform)</li>
              <li>Enter this access code during signup</li>
              <li>Complete your profile setup</li>
              <li>Start your learning journey!</li>
            </ol>
          </div>
          
          <p><strong>Important:</strong> This access code expires on <strong>${expiryDate}</strong>. Please use it before then.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to reach out to your administrator.</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by Finsage for ${organizationName}.</p>
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