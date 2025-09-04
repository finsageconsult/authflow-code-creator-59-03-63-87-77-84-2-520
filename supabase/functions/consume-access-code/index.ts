import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsumeAccessCodeRequest {
  userId: string;
  code: string;
  role: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code, role, organizationId }: ConsumeAccessCodeRequest = await req.json();
    console.log("Consuming access code:", { userId, code, role, organizationId });

    if (!userId || !code || !role || !organizationId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters" 
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
    
    const supabaseAdmin = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? ""
    );

    // Start a transaction-like process
    // First, verify the access code is still valid and increment usage
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('access_codes')
      .select('used_count, max_uses, expires_at')
      .eq('code', code)
      .eq('organization_id', organizationId)
      .eq('role', role)
      .single();

    if (codeError || !codeData) {
      console.error("Access code validation failed:", codeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid access code" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code is expired
    const expiresAt = new Date(codeData.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Access code has expired" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Usage limit disabled — allow unlimited uses
    console.log('Usage limit ignored for access codes', { used: codeData.used_count, max: codeData.max_uses });

    // Check if user exists in users table first
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, auth_id')
      .eq('auth_id', userId)
      .single();

    if (!existingUser && !userCheckError) {
      // User doesn't exist in users table, create them
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: userId,
          email: codeData.email,
          name: codeData.email.split('@')[0],
          organization_id: organizationId,
          role: role,
          status: 'ACTIVE'
        });

      if (createUserError) {
        console.error("Error creating user record:", createUserError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to create user record" 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    } else {
      // Update existing user's role and organization
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({
          organization_id: organizationId,
          role: role,
          status: 'ACTIVE'
        })
        .eq('auth_id', userId);

      if (updateUserError) {
        console.error("Error updating user profile:", updateUserError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to update user profile" 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Increment access code usage count
    const { error: incrementError } = await supabaseAdmin
      .from('access_codes')
      .update({ used_count: codeData.used_count + 1 })
      .eq('code', code);

    if (incrementError) {
      console.error("Error incrementing access code usage:", incrementError);
      // This is not critical, so we don't fail the request
    }

    console.log("Access code consumed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          role,
          organizationId
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error consuming access code:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to consume access code" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);