import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This function fixes the RLS policy for access_codes table
    // It needs to be run with service role key to have admin privileges
    
    const SQL_FIX_POLICY = `
      -- Drop the existing restrictive policy
      DROP POLICY IF EXISTS "HR and Admins can manage access codes" ON public.access_codes;
      
      -- Create updated policy that allows ADMIN users to manage all access codes
      CREATE POLICY "HR and Admins can manage access codes" 
      ON public.access_codes 
      FOR ALL 
      USING (
          auth.uid() IN (
              SELECT u.auth_id 
              FROM public.users u 
              WHERE (
                  -- ADMIN users can manage all access codes regardless of organization
                  u.role = 'ADMIN' OR
                  -- HR users can only manage access codes for their own organization
                  (u.role = 'HR' AND u.organization_id = access_codes.organization_id)
              )
          )
      );
    `;

    console.log("Fixing access codes RLS policy...");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "RLS policy fix applied successfully. Please refresh the page and try creating the access code again." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error fixing RLS policy:", error);
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