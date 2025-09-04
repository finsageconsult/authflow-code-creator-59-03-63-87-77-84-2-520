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
    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    console.log("Testing Razorpay credentials:", {
      keyId: razorpayKeyId ? `${razorpayKeyId.substring(0, 8)}...` : 'NOT_FOUND',
      keySecret: razorpayKeySecret ? 'EXISTS' : 'NOT_FOUND'
    });

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ 
          error: "Razorpay credentials not configured",
          details: {
            keyId: razorpayKeyId ? 'present' : 'missing',
            keySecret: razorpayKeySecret ? 'present' : 'missing'
          }
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Test API connection by creating a minimal test order
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const testResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 100, // ₹1.00 test amount
        currency: 'INR',
        receipt: `test_${Date.now()}`,
        notes: {
          test: 'API connectivity check'
        }
      })
    });

    const responseText = await testResponse.text();
    
    console.log("Razorpay API test response:", {
      status: testResponse.status,
      response: responseText
    });

    if (testResponse.ok) {
      const orderData = JSON.parse(responseText);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Razorpay API keys are valid and working",
          testOrder: {
            id: orderData.id,
            amount: orderData.amount,
            status: orderData.status
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Razorpay API authentication failed",
          status: testResponse.status,
          details: responseText
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

  } catch (error: any) {
    console.error("Error testing Razorpay API:", error);
    return new Response(
      JSON.stringify({ 
        error: "Test failed", 
        details: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);