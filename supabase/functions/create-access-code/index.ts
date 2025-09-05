import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAccessCodeRequest {
  code: string;
  organization_id: string;
  role: string;
  max_uses: number;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, organization_id, role, max_uses, email }: CreateAccessCodeRequest = await req.json();

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // For coaches, organization_id should be null as they're not tied to orgs
    const actualOrgId = role === 'COACH' ? null : organization_id;

    // Check if an active access code already exists for this email (for coaches, check globally)
    let checkError = null;
    let existingCodes = null;
    
    if (role === 'COACH') {
      // For coaches, check globally across all records with this email
      const { data, error } = await supabaseAdmin
        .from('access_codes')
        .select('id, code, email')
        .eq('email', email)
        .eq('role', 'COACH')
        .gt('max_uses', 0);
      
      existingCodes = data;
      checkError = error;
    } else {
      // For other roles, check within organization
      const { data, error } = await supabaseAdmin
        .from('access_codes')
        .select('id, code, email')
        .eq('organization_id', actualOrgId)
        .eq('email', email)
        .gt('max_uses', 0);
      
      existingCodes = data;
      checkError = error;
    }

    if (checkError) throw checkError;

    // If there are existing active codes for this email, prevent creation
    if (existingCodes && existingCodes.length > 0) {
      throw new Error(`An active access code already exists for email ${email}. Please use the existing code.`);
    }

    // Insert access code with admin privileges (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('access_codes')
      .insert({
        code,
        organization_id: actualOrgId,
        role,
        max_uses,
        used_count: 0,
        email
      })
      .select()
      .single();

    if (error) throw error;

    console.log("Access code created successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error creating access code:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);