import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: PaymentVerificationRequest = await req.json();

    // Use service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify signature
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    const crypto = await import("https://deno.land/std@0.190.0/crypto/mod.ts");
    const expected_signature = await crypto.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = await crypto.crypto.subtle.sign(
      "HMAC",
      expected_signature,
      new TextEncoder().encode(payload)
    );

    const generated_signature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (generated_signature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Get user profile
    const { data: userProfile } = await supabaseService
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Find the order
    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("metadata->>razorpay_order_id", razorpay_order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Update payment record
    const { error: paymentError } = await supabaseService
      .from("payments")
      .update({
        status: "completed",
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        captured_at: new Date().toISOString(),
        metadata: {
          verified: true,
          verified_at: new Date().toISOString()
        }
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (paymentError) {
      console.error("Payment update error:", paymentError);
      throw new Error("Failed to update payment");
    }

    // Update order status
    await supabaseService
      .from("orders")
      .update({
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    // Create tool purchase record
    const toolId = order.metadata.tool_id;
    const { error: purchaseError } = await supabaseService
      .from("tool_purchases")
      .insert({
        user_id: userProfile.id,
        tool_id: toolId,
        status: "completed",
        amount_paid: order.final_amount,
        order_id: order.id,
        transaction_id: razorpay_payment_id,
        access_granted_at: new Date().toISOString()
      });

    if (purchaseError) {
      console.error("Purchase record error:", purchaseError);
      // Don't throw here as payment is already processed
    }

    // Send confirmation email (optional)
    try {
      await supabaseService.functions.invoke("send-payment-receipt", {
        body: {
          user_email: user.email,
          order_id: order.id,
          tool_name: order.metadata.tool_name,
          amount: order.final_amount,
          currency: order.currency
        }
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail the payment for email issues
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        tool_id: toolId,
        access_granted: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
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