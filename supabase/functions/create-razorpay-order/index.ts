import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  amount: number;
  currency?: string;
  serviceType: string;
  quantity?: number;
  userType: 'INDIVIDUAL' | 'EMPLOYEE' | 'ORGANIZATION';
  organizationId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', serviceType, quantity = 1, userType, organizationId }: CreateOrderRequest = await req.json();
    console.log("Creating Razorpay order:", { amount, currency, serviceType, userType });

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get Razorpay key from secrets
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not found");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user info
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile
    console.log("Getting user profile for auth_id:", user.id);
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle();

    console.log("User profile result:", { userProfile, profileError });
    if (profileError || !userProfile) {
      console.error("User profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found", details: profileError?.message }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate GST (18%)
    const baseAmount = Math.round(amount * 100); // Convert to paise
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + gstAmount;

    // Create order in database first
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    console.log("Creating order with user_id:", user.id);
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id, // Use auth user ID directly (auth.users.id)
        organization_id: organizationId || userProfile.organization_id,
        user_type: userType.toLowerCase() as any,
        service_type: serviceType,
        quantity,
        unit_price: baseAmount,
        gst_amount: gstAmount,
        total_amount: baseAmount,
        final_amount: totalAmount,
        currency,
        order_number: orderNumber,
        status: 'pending',
        metadata: { razorpay_order_request: true }
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order", details: orderError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Razorpay order
    console.log("Creating Razorpay order with amount:", totalAmount);
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayRequestBody = {
      amount: totalAmount,
      currency,
      receipt: orderNumber,
      notes: {
        order_id: orderData.id,
        user_id: user.id,
        service_type: serviceType,
        user_type: userType
      }
    };
    console.log("Razorpay request body:", razorpayRequestBody);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayRequestBody)
    });

    console.log("Razorpay response status:", razorpayResponse.status);
    
    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error details:", {
        status: razorpayResponse.status,
        statusText: razorpayResponse.statusText,
        error: errorText,
        keyId: razorpayKeyId ? `${razorpayKeyId.substring(0, 8)}...` : 'undefined'
      });
      
      // Clean up the order we created
      await supabase.from('orders').delete().eq('id', orderData.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create payment order", 
          details: `Razorpay API error: ${razorpayResponse.status} ${razorpayResponse.statusText}`,
          razorpayError: errorText 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    
    // Update order with Razorpay order ID
    await supabase
      .from('orders')
      .update({ 
        metadata: { 
          ...orderData.metadata,
          razorpay_order_id: razorpayOrder.id 
        }
      })
      .eq('id', orderData.id);

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        order_id: orderData.id,
        amount: totalAmount,
        currency,
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
        metadata: { razorpay_order_response: razorpayOrder }
      });

    console.log("Order and payment created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: orderData.id,
          razorpay_order_id: razorpayOrder.id,
          amount: totalAmount,
          currency,
          key: razorpayKeyId
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);