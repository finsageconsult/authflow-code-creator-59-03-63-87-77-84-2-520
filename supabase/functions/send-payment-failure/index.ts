import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, payment } = await req.json();
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Resend API key not found");
      return new Response("Email service not configured", { status: 500 });
    }

    // Format amount for display
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount / 100);
    };

    // Generate failure notification HTML
    const failureHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Failed - Finsage</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e53e3e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .failure-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e53e3e; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .retry-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
            <p>We couldn't process your payment</p>
          </div>
          
          <div class="content">
            <div class="failure-details">
              <h2>Payment Details</h2>
              
              <div class="row">
                <span class="label">Order Number:</span>
                <span>${order.order_number}</span>
              </div>
              
              <div class="row">
                <span class="label">Amount:</span>
                <span>${formatAmount(order.final_amount)}</span>
              </div>
              
              <div class="row">
                <span class="label">Service:</span>
                <span>${order.service_type === '1on1' ? '1-on-1 Coaching' : 'Webinar'}</span>
              </div>
              
              <div class="row">
                <span class="label">Failure Reason:</span>
                <span>${payment.failure_reason || 'Payment could not be processed'}</span>
              </div>
            </div>
            
            <div class="failure-details">
              <h3>What's Next?</h3>
              <p>Don't worry! You can try the following:</p>
              <ul>
                <li>Check if you have sufficient balance in your account</li>
                <li>Verify your card details are correct</li>
                <li>Try using a different payment method</li>
                <li>Contact your bank if the issue persists</li>
              </ul>
              
              <a href="https://finsage.com/retry-payment?order=${order.id}" class="retry-button">
                Retry Payment
              </a>
            </div>
            
            <div class="footer">
              <p>If you continue to face issues, please contact our support team.</p>
              <p>We're here to help you get started with Finsage!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'payments@finsage.com',
        to: [order.users.email],
        subject: `Payment Failed - Order ${order.order_number}`,
        html: failureHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Failed to send email:", errorText);
      throw new Error("Failed to send email");
    }

    const emailResult = await emailResponse.json();
    console.log("Failure email sent successfully:", emailResult.id);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending failure email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send failure email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);