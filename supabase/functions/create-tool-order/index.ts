import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateToolOrderRequest {
  toolId: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId, amount }: CreateToolOrderRequest = await req.json();
    console.log("Creating tool order:", { toolId, amount });

    if (!toolId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid tool ID or amount" }),
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
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get tool details
    const { data: tool, error: toolError } = await supabase
      .from('financial_tools')
      .select('*')
      .eq('id', toolId)
      .eq('is_active', true)
      .single();

    if (toolError || !tool) {
      return new Response(
        JSON.stringify({ error: "Tool not found or inactive" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate GST (18%)
    const baseAmount = Math.round(amount * 100); // Convert to paise
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + gstAmount;

    // Create order in database
    const orderNumber = `TOOL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userProfile.id,
        organization_id: userProfile.organization_id,
        user_type: 'individual',
        service_type: 'tool_purchase',
        quantity: 1,
        unit_price: baseAmount,
        gst_amount: gstAmount,
        total_amount: baseAmount,
        final_amount: totalAmount,
        currency: 'INR',
        order_number: orderNumber,
        status: 'pending',
        metadata: { 
          tool_id: toolId,
          tool_name: tool.name,
          razorpay_order_request: true 
        }
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
          tool_id: toolId,
          tool_name: tool.name
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error:", errorText);
      
      // Clean up the order we created
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

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        order_id: orderData.id,
        amount: totalAmount,
        currency: 'INR',
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
        metadata: { razorpay_order_response: razorpayOrder }
      });

    console.log("Tool order and payment created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: orderData.id,
          razorpay_order_id: razorpayOrder.id,
          amount: totalAmount,
          currency: 'INR',
          key: razorpayKeyId,
          tool_name: tool.name
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error creating tool order:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);