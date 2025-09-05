import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log("Starting manual completion of pending payments...");

    // Get all pending payments with their orders
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        orders (*)
      `)
      .eq('status', 'pending')
      .not('razorpay_order_id', 'is', null);

    if (paymentsError) {
      console.error("Error fetching pending payments:", paymentsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pending payments" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${pendingPayments?.length || 0} pending payments`);

    const results = [];

    for (const payment of pendingPayments || []) {
      const order = payment.orders;
      if (!order) continue;

      console.log(`Processing payment ${payment.id} for order ${order.id}`);

      try {
        // Update payment status to captured
        await supabase
          .from('payments')
          .update({
            status: 'captured',
            captured_at: new Date().toISOString(),
            metadata: { 
              ...payment.metadata, 
              manual_completion: true,
              completed_at: new Date().toISOString()
            }
          })
          .eq('id', payment.id);

        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', order.id);

        // Handle program purchase
        if (order.service_type === 'short-program' || order.service_type === 'program') {
          const programId = order.metadata?.programId;
          if (programId) {
            // Get user profile ID from auth user ID
            const { data: userProfile } = await supabase
              .from('users')
              .select('id')
              .eq('auth_id', order.user_id)
              .single();

            if (userProfile) {
              // Create program purchase record
              const { error: purchaseError } = await supabase
                .from('individual_purchases')
                .insert({
                  user_id: userProfile.id,
                  program_id: programId,
                  order_id: order.id,
                  amount_paid: order.final_amount,
                  status: 'completed',
                  access_granted_at: new Date().toISOString(),
                  transaction_id: `manual_${payment.id}`
                });

              if (!purchaseError) {
                results.push({
                  payment_id: payment.id,
                  order_id: order.id,
                  program_id: programId,
                  user_id: userProfile.id,
                  status: 'completed'
                });
                console.log(`Program purchase created for user ${userProfile.id}, program ${programId}`);
              } else {
                console.error("Error creating program purchase:", purchaseError);
              }
            }
          }
        }

      } catch (error) {
        console.error(`Error processing payment ${payment.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} payments`,
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in manual payment completion:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);