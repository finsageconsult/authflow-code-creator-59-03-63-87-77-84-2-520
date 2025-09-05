import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  itemType: 'program' | 'tool';
  itemId: string;
  amount: number; // in paisa
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemType, itemId, amount }: CreatePaymentRequest = await req.json();
    console.log("Creating unified payment:", { itemType, itemId, amount });

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get Razorpay credentials
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
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (profileError || !userProfile) {
      console.error("User profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // No GST calculation
    const totalAmount = Math.round(amount);

    // Create order in database
    const orderNumber = `${itemType.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userProfile.auth_id, // Use auth user ID to match foreign key constraint
        organization_id: userProfile.organization_id,
        user_type: 'individual',
        service_type: itemType,
        quantity: 1,
        unit_price: totalAmount,
        gst_amount: 0,
        total_amount: totalAmount,
        final_amount: totalAmount,
        currency: 'INR',
        order_number: orderNumber,
        status: 'pending',
        metadata: { item_id: itemId, item_type: itemType }
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Razorpay order
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          order_id: orderData.id,
          user_id: user.id,
          item_type: itemType,
          item_id: itemId
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error:", errorText);
      
      // Clean up the order
      await supabase.from('orders').delete().eq('id', orderData.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to create payment order" }),
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

    // Create payment record with item tracking
    await supabase
      .from('payments')
      .insert({
        order_id: orderData.id,
        amount: totalAmount,
        currency: 'INR',
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
        item_type: itemType,
        item_id: itemId,
        metadata: { razorpay_order_response: razorpayOrder }
      });

    console.log("Unified payment created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: orderData.id,
          razorpay_order_id: razorpayOrder.id,
          amount: totalAmount,
          currency: 'INR',
          key: razorpayKeyId
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error creating unified payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);