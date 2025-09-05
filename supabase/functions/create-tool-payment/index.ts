import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ToolPaymentRequest {
  toolId: string;
  amount: number;
  currency?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Authentication required");
    }

    const { toolId, amount, currency = "INR" }: ToolPaymentRequest = await req.json();

    // Use service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user profile
    const { data: userProfile } = await supabaseService
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Get tool details
    const { data: tool, error: toolError } = await supabaseService
      .from("financial_tools")
      .select("*")
      .eq("id", toolId)
      .single();

    if (toolError || !tool) {
      throw new Error("Tool not found");
    }

    // Check if user already owns this tool
    const { data: existingPurchase } = await supabaseService
      .from("tool_purchases")
      .select("*")
      .eq("user_id", userProfile.id)
      .eq("tool_id", toolId)
      .eq("status", "completed")
      .single();

    if (existingPurchase) {
      throw new Error("Tool already purchased");
    }

    // Create order record
    const orderNumber = `TOOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalAmount = Math.round(amount * 100); // Convert to paise, no GST

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        organization_id: userProfile.organization_id,
        order_number: orderNumber,
        service_type: "tool_purchase",
        user_type: userProfile.role,
        unit_price: totalAmount,
        quantity: 1,
        total_amount: totalAmount,
        gst_amount: 0,
        final_amount: totalAmount,
        currency: currency,
        status: "pending",
        metadata: {
          tool_id: toolId,
          tool_name: tool.name,
          user_role: userProfile.role
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Razorpay order
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const razorpayOrderData = {
      amount: totalAmount, // amount in paise
      currency: currency,
      receipt: order.id,
      notes: {
        order_id: order.id,
        tool_id: toolId,
        user_id: user.id,
        tool_name: tool.name
      }
    };

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${razorpayAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(razorpayOrderData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay error:", errorText);
      throw new Error("Failed to create Razorpay order");
    }

    const razorpayOrder = await razorpayResponse.json();

    // Update order with Razorpay order ID
    await supabaseService
      .from("orders")
      .update({ 
        metadata: { 
          ...order.metadata, 
          razorpay_order_id: razorpayOrder.id 
        } 
      })
      .eq("id", order.id);

    // Create initial payment record
    await supabaseService
      .from("payments")
      .insert({
        order_id: order.id,
        amount: totalAmount,
        currency: currency,
        status: "pending",
        razorpay_order_id: razorpayOrder.id,
        item_type: "tool",
        item_id: toolId,
        metadata: {
          tool_name: tool.name,
          user_email: user.email
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          amount: totalAmount,
          currency: currency,
          razorpay_order_id: razorpayOrder.id
        },
        razorpay: {
          key: razorpayKeyId,
          order_id: razorpayOrder.id,
          amount: totalAmount,
          currency: currency,
          name: "Finsage",
          description: `Purchase ${tool.name}`,
          prefill: {
            email: user.email,
            name: userProfile.full_name || user.email
          },
          theme: {
            color: "#2563eb"
          }
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});