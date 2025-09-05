import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();
    
    console.log("Webhook received with signature:", signature);

    if (!signature) {
      console.error("No signature provided");
      return new Response("No signature", { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return new Response("Webhook not configured", { status: 500 });
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const dataBuffer = encoder.encode(body);

    // Create Supabase client early so we can log verification failures too
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    const bytes = new Uint8Array(signatureBuffer);
    const expectedHex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const expectedBase64 = btoa(String.fromCharCode(...bytes));
    
    console.log("Expected hex:", expectedHex.substring(0,12)+"...");
    console.log("Expected base64:", expectedBase64.substring(0,12)+"...");
    console.log("Received signature:", (signature||'').substring(0,12)+"...");
    
    if (signature !== expectedHex && signature !== expectedBase64) {
      console.error("Invalid signature - potential security threat");
      
      // Log security event for invalid webhook signature
      await supabase.rpc('log_security_event', {
        p_event_type: 'webhook_invalid_signature',
        p_event_details: { 
          webhook_type: 'razorpay',
          expected_signature: expectedHex.substring(0, 10) + '...',
          received_signature: signature.substring(0, 10) + '...'
        },
        p_success: false,
        p_risk_level: 'high'
      });
      
      return new Response("Invalid signature", { status: 400 });
    }
    
    const event = JSON.parse(body);
    console.log("Processing webhook event:", event.event);

    // Supabase client already initialized above
    
    // Log successful webhook verification
    await supabase.rpc('log_security_event', {
      p_event_type: 'webhook_verified',
      p_event_details: { 
        webhook_type: 'razorpay',
        event_type: event.event 
      },
      p_success: true,
      p_risk_level: 'low'
    });

    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(supabase, event.payload.payment.entity);
        break;
      
      case 'payment.captured':
        await handlePaymentCaptured(supabase, event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(supabase, event.payload.payment.entity);
        break;
      
      default:
        console.log("Unhandled event type:", event.event);
    }

    return new Response("OK", { status: 200 });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response("Internal error", { status: 500 });
  }
};

async function handlePaymentAuthorized(supabase: any, payment: any) {
  console.log("Handling payment.authorized:", payment.id);
  
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'authorized',
      razorpay_payment_id: payment.id,
      payment_method: payment.method,
      metadata: { payment_details: payment }
    })
    .eq('razorpay_order_id', payment.order_id);

  if (error) {
    console.error("Error updating payment status:", error);
  }
}

async function handlePaymentCaptured(supabase: any, payment: any) {
  console.log("Handling payment.captured:", payment.id);
  
  // Update payment status
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'captured',
      razorpay_payment_id: payment.id,
      payment_method: payment.method,
      captured_at: new Date().toISOString(),
      metadata: { payment_details: payment }
    })
    .eq('razorpay_order_id', payment.order_id)
    .select()
    .single();

  if (paymentError) {
    console.error("Error updating payment:", paymentError);
    return;
  }

  // Update order status
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', paymentData.order_id)
    .select(`
      *,
      users:user_id (name, email)
    `)
    .single();

  if (orderError) {
    console.error("Error updating order:", orderError);
    return;
  }

  // Handle different service types
  if (orderData.service_type === 'tool_purchase') {
    // Handle tool purchase
    await handleToolPurchase(supabase, orderData);
  } else if (orderData.service_type === 'short-program' || orderData.service_type === 'program') {
    // Handle program purchase
    await handleProgramPurchase(supabase, orderData);
  } else if (orderData.user_type === 'employee') {
    // Create credits for employee
    await createCreditsForEmployee(supabase, orderData);
  }

  // Send payment receipt email
  await sendPaymentReceiptEmail(supabase, orderData, paymentData);
  
  console.log("Payment captured successfully");
}

async function handlePaymentFailed(supabase: any, payment: any) {
  console.log("Handling payment.failed:", payment.id);
  
  // Update payment status
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      razorpay_payment_id: payment.id,
      failure_reason: payment.error_description || 'Payment failed',
      metadata: { payment_details: payment }
    })
    .eq('razorpay_order_id', payment.order_id)
    .select()
    .single();

  if (paymentError) {
    console.error("Error updating payment:", paymentError);
    return;
  }

  // Update order status
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .update({ status: 'failed' })
    .eq('id', paymentData.order_id)
    .select(`
      *,
      users:user_id (name, email)
    `)
    .single();

  if (orderError) {
    console.error("Error updating order:", orderError);
    return;
  }

  // Send payment failure email
  await sendPaymentFailureEmail(supabase, orderData, paymentData);
  
  console.log("Payment failure handled");
}

async function handleProgramPurchase(supabase: any, order: any) {
  try {
    console.log("Processing program purchase for order:", order.id);
    
    const programId = order.metadata?.programId;
    if (!programId) {
      console.error("No programId found in order metadata");
      return;
    }

    // Get user profile ID from auth user ID
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', order.user_id)
      .single();

    if (userError || !userProfile) {
      console.error("Error getting user profile:", userError);
      return;
    }

    // Create program purchase record
    const { error: purchaseError } = await supabase
      .from('individual_purchases')
      .insert({
        user_id: userProfile.id, // Use profile ID instead of auth ID  
        program_id: programId,
        order_id: order.id,
        amount_paid: order.final_amount,
        status: 'completed',
        access_granted_at: new Date().toISOString()
      });

    if (purchaseError) {
      console.error("Error creating program purchase:", purchaseError);
      return;
    }

    console.log(`Program purchase completed for user ${userProfile.id}, program ${programId}`);
  } catch (error) {
    console.error("Error handling program purchase:", error);
  }
}

async function handleToolPurchase(supabase: any, order: any) {
  try {
    console.log("Processing tool purchase for order:", order.id);
    
    const toolId = order.metadata?.tool_id;
    if (!toolId) {
      console.error("No tool_id found in order metadata");
      return;
    }

    // Get user profile ID from auth user ID
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', order.user_id)
      .single();

    if (userError || !userProfile) {
      console.error("Error getting user profile:", userError);
      return;
    }

    // Create tool purchase record
    const { error: purchaseError } = await supabase
      .from('tool_purchases')
      .insert({
        user_id: userProfile.id, // Use profile ID instead of auth ID
        tool_id: toolId,
        order_id: order.id,
        amount_paid: order.final_amount,
        status: 'completed',
        access_granted_at: new Date().toISOString()
      });

    if (purchaseError) {
      console.error("Error creating tool purchase:", purchaseError);
      return;
    }

    console.log(`Tool purchase completed for user ${userProfile.id}, tool ${toolId}`);
  } catch (error) {
    console.error("Error handling tool purchase:", error);
  }
}

async function createCreditsForEmployee(supabase: any, order: any) {
  try {
    // Get or create user's credit wallet
    let { data: wallet } = await supabase
      .from('credit_wallets')
      .select('*')
      .eq('owner_type', 'USER')
      .eq('owner_id', order.user_id)
      .eq('credit_type', order.service_type === '1on1' ? '1ON1' : 'WEBINAR')
      .single();

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('credit_wallets')
        .insert({
          owner_type: 'USER',
          owner_id: order.user_id,
          credit_type: order.service_type === '1on1' ? '1ON1' : 'WEBINAR',
          balance: 0
        })
        .select()
        .single();
      
      wallet = newWallet;
    }

    // Create credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        wallet_id: wallet.id,
        delta: order.quantity,
        reason: `Credits purchased - Order ${order.order_number}`,
        created_by: order.user_id
      });

    console.log(`Created ${order.quantity} credits for user ${order.user_id}`);
  } catch (error) {
    console.error("Error creating credits:", error);
  }
}

async function sendPaymentReceiptEmail(supabase: any, order: any, payment: any) {
  try {
    await supabase.functions.invoke('send-payment-receipt', {
      body: { order, payment }
    });
  } catch (error) {
    console.error("Error sending receipt email:", error);
  }
}

async function sendPaymentFailureEmail(supabase: any, order: any, payment: any) {
  try {
    await supabase.functions.invoke('send-payment-failure', {
      body: { order, payment }
    });
  } catch (error) {
    console.error("Error sending failure email:", error);
  }
}

serve(handler);