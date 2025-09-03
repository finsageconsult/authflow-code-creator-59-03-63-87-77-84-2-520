import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  orderId: string;
  paymentId: string;
  userEmail: string;
  userName: string;
  programTitle: string;
  amount: number;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Payment receipt function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    if (!resend) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { orderId, paymentId, userEmail, userName, programTitle, amount, currency }: ReceiptRequest = await req.json();

    console.log("Sending receipt to:", userEmail, "for order:", orderId);

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount / 100);
    };

    const receiptDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "Finsage <noreply@finsage.com>",
      to: [userEmail],
      subject: `Payment Receipt - ${programTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Receipt</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; }
            .receipt-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .total-row { background: #eff6ff; padding: 15px; border-radius: 6px; font-weight: bold; font-size: 1.1em; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 0.9em; border-radius: 0 0 8px 8px; }
            .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9em; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Successful!</h1>
              <div class="success-badge">✓ Payment Confirmed</div>
            </div>
            
            <div class="content">
              <p>Dear ${userName},</p>
              
              <p>Thank you for your purchase! Your payment has been successfully processed and you now have access to your content.</p>
              
              <div class="receipt-details">
                <h3 style="margin-top: 0; color: #1f2937;">Receipt Details</h3>
                
                <div class="detail-row">
                  <span>Program:</span>
                  <span><strong>${programTitle}</strong></span>
                </div>
                
                <div class="detail-row">
                  <span>Order ID:</span>
                  <span>${orderId}</span>
                </div>
                
                <div class="detail-row">
                  <span>Payment ID:</span>
                  <span>${paymentId}</span>
                </div>
                
                <div class="detail-row">
                  <span>Date:</span>
                  <span>${receiptDate}</span>
                </div>
                
                <div class="total-row">
                  <div class="detail-row" style="margin: 0; border: none; padding: 0;">
                    <span>Total Paid:</span>
                    <span>${formatAmount(amount)}</span>
                  </div>
                </div>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>You can access your content immediately in your dashboard</li>
                <li>All course materials are now available for download</li>
                <li>For coaching sessions, you'll receive booking instructions separately</li>
              </ul>
              
              <p>If you have any questions or need support, please don't hesitate to contact us.</p>
              
              <p>Thank you for choosing Finsage!</p>
              
              <p>Best regards,<br>The Finsage Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated receipt. Please keep this email for your records.</p>
              <p>© ${new Date().getFullYear()} Finsage. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Receipt sent successfully",
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending payment receipt:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);