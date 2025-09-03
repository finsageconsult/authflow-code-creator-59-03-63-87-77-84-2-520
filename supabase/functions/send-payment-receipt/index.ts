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

    // Generate receipt HTML
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt - Finsage</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .receipt-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .total { border-top: 2px solid #667eea; padding-top: 10px; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Thank you for your payment!</p>
          </div>
          
          <div class="content">
            <div class="receipt-details">
              <h2>Receipt Details</h2>
              
              <div class="row">
                <span class="label">Order Number:</span>
                <span>${order.order_number}</span>
              </div>
              
              <div class="row">
                <span class="label">Payment ID:</span>
                <span>${payment.razorpay_payment_id}</span>
              </div>
              
              <div class="row">
                <span class="label">Date:</span>
                <span>${new Date(payment.captured_at).toLocaleDateString('en-IN')}</span>
              </div>
              
              <div class="row">
                <span class="label">Service:</span>
                <span>${order.service_type === '1on1' ? '1-on-1 Coaching' : 'Webinar'}</span>
              </div>
              
              <div class="row">
                <span class="label">Quantity:</span>
                <span>${order.quantity}</span>
              </div>
              
              <div class="row">
                <span class="label">Unit Price:</span>
                <span>${formatAmount(order.unit_price)}</span>
              </div>
              
              <div class="row">
                <span class="label">Subtotal:</span>
                <span>${formatAmount(order.total_amount)}</span>
              </div>
              
              <div class="row">
                <span class="label">GST (18%):</span>
                <span>${formatAmount(order.gst_amount)}</span>
              </div>
              
              <div class="row total">
                <span class="label">Total Amount:</span>
                <span>${formatAmount(order.final_amount)}</span>
              </div>
            </div>
            
            ${order.user_type === 'EMPLOYEE' ? `
              <div class="receipt-details">
                <h3>Credits Added</h3>
                <p>We've added <strong>${order.quantity} credits</strong> to your account for ${order.service_type === '1on1' ? '1-on-1 coaching sessions' : 'webinar access'}.</p>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>This is an automated receipt from Finsage.</p>
              <p>If you have any questions, please contact our support team.</p>
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
        subject: `Payment Receipt - Order ${order.order_number}`,
        html: receiptHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Failed to send email:", errorText);
      throw new Error("Failed to send email");
    }

    const emailResult = await emailResponse.json();
    console.log("Receipt email sent successfully:", emailResult.id);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending receipt:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send receipt" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);