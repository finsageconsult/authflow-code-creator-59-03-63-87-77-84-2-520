import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyAccessCodeRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code }: VerifyAccessCodeRequest = await req.json();
    console.log("Received request to verify code:", code);

    if (!code || !code.trim()) {
      console.log("No code provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Access code is required" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Service key exists:", !!supabaseServiceKey);

    const supabaseAdmin = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? ""
    );

    console.log("Querying access code:", code.trim());

    // Verify access code exists and is valid
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('access_codes')
      .select(`
        *,
        organizations (
          id,
          name,
          plan,
          status
        )
      `)
      .eq('code', code.trim())
      .single();

    console.log("Query result:", { codeData, codeError });

    if (codeError) {
      console.log("Database error:", codeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid access code. Please check and try again." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!codeData) {
      console.log("No code data found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid access code. Please check and try again." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code is expired
    const expiresAt = new Date(codeData.expires_at);
    const now = new Date();
    console.log("Expiry check:", { expiresAt, now, expired: expiresAt < now });
    
    if (expiresAt < now) {
      console.log("Access code expired");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "This access code has expired. Please contact your administrator." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code is used up
    // Usage limit disabled — allow unlimited uses
    console.log("Usage check (ignored):", { used: codeData.used_count, max: codeData.max_uses });

    console.log("Access code verified successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          code: codeData.code,
          role: codeData.role,
          organization_id: codeData.organization_id,
          organization_name: codeData.organizations?.name || 'Unknown Organization',
          email: codeData.email,
          expires_at: codeData.expires_at
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error verifying access code:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to verify access code. Please try again." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);