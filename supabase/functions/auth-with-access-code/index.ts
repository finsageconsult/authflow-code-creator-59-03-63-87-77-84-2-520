import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthWithAccessCodeRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code }: AuthWithAccessCodeRequest = await req.json();
    console.log("Authenticating with access code:", code);

    if (!code || !code.trim()) {
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
    
    const supabaseAdmin = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? ""
    );

    // Verify access code
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

    if (codeError || !codeData) {
      console.log("Invalid access code:", codeError);
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

    const userEmail = codeData.email;

    // Check if user exists in auth.users
    const { data: existingUsers, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    const existingAuthUser = existingUsers?.users?.find(user => user.email === userEmail);
    
    let authUserId: string;
    let isNewUser = false;

    if (!existingAuthUser) {
      // Create new auth user
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: code.trim(),
        email_confirm: true,
        user_metadata: {
          name: userEmail.split('@')[0]
        }
      });

      if (createAuthError || !newAuthUser?.user) {
        console.error("Error creating auth user:", createAuthError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to create user account" 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      authUserId = newAuthUser.user.id;
      isNewUser = true;
    } else {
      // Update existing user's password to match access code
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        { password: code.trim() }
      );

      if (updateError) {
        console.error("Error updating user password:", updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to update user credentials" 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      authUserId = existingAuthUser.id;
    }

    // Update/create user in public.users table
    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        auth_id: authUserId,
        email: userEmail,
        name: userEmail.split('@')[0],
        organization_id: codeData.organization_id,
        role: codeData.role,
        status: 'ACTIVE'
      }, {
        onConflict: 'auth_id'
      });

    if (upsertError) {
      console.error("Error updating user profile:", upsertError);
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

    // Increment access code usage
    const { error: incrementError } = await supabaseAdmin
      .from('access_codes')
      .update({ used_count: codeData.used_count + 1 })
      .eq('code', code.trim());

    if (incrementError) {
      console.error("Error incrementing access code usage:", incrementError);
    }

    console.log("User authenticated successfully:", { authUserId, isNewUser });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          email: userEmail,
          role: codeData.role,
          organizationId: codeData.organization_id,
          organizationName: codeData.organizations?.name || 'Unknown Organization'
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error authenticating with access code:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Authentication failed" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);