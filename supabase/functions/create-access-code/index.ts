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
  expires_at: string;
  max_uses: number;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, organization_id, role, expires_at, max_uses, email }: CreateAccessCodeRequest = await req.json();

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if an active access code already exists for this email in this organization
    const { data: existingCodes, error: checkError } = await supabaseAdmin
      .from('access_codes')
      .select('id, code, expires_at')
      .eq('organization_id', organization_id)
      .eq('role', role)
      .gt('expires_at', new Date().toISOString())
      .gt('max_uses', 0);

    if (checkError) throw checkError;

    // Filter codes that might be associated with this email by checking recent email events
    const { data: emailEvents, error: emailError } = await supabaseAdmin
      .from('email_events')
      .select('metadata')
      .eq('recipient_email', email)
      .eq('email_type', 'access_code')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (emailError) console.warn('Could not check email events:', emailError);

    // If there are existing codes and recent email events for this email, prevent creation
    if (existingCodes && existingCodes.length > 0 && emailEvents && emailEvents.length > 0) {
      throw new Error(`An active access code already exists for email ${email}. Please use the existing code or wait for it to expire.`);
    }

    // Insert access code with admin privileges (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('access_codes')
      .insert({
        code,
        organization_id,
        role,
        expires_at,
        max_uses,
        used_count: 0
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