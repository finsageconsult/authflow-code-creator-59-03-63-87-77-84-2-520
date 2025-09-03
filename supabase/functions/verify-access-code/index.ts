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

    if (!code || !code.trim()) {
      return new Response(
        JSON.stringify({ error: "Access code is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Verifying access code:", code);

    // Verify access code exists and is valid
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('access_codes')
      .select('*, organizations(*)')
      .eq('code', code.trim())
      .single();

    if (codeError || !codeData) {
      console.log("Access code not found:", codeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid access code. Please check and try again." 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code is expired
    if (new Date(codeData.expires_at) < new Date()) {
      console.log("Access code expired:", codeData.expires_at);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "This access code has expired. Please contact your administrator." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code is used up
    if (codeData.used_count >= codeData.max_uses) {
      console.log("Access code used up:", codeData.used_count, ">=", codeData.max_uses);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "This access code has been used up. Please contact your administrator." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Access code verified successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          code: codeData.code,
          role: codeData.role,
          organization_id: codeData.organization_id,
          organization_name: codeData.organizations.name,
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