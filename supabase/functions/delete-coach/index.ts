import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteCoachRequest {
  coach_id: string;
  admin_user_id: string;
  coach_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coach_id, admin_user_id, coach_name }: DeleteCoachRequest = await req.json();

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the requester is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', admin_user_id)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin access required' }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the coach's auth_id and email before deletion
    const { data: coachData, error: coachError } = await supabaseAdmin
      .from('users')
      .select('auth_id, name, email')
      .eq('id', coach_id)
      .eq('role', 'COACH')
      .single();

    if (coachError || !coachData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Coach not found' }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Delete access codes associated with this coach's email
    const { error: accessCodeDeleteError } = await supabaseAdmin
      .from('access_codes')
      .delete()
      .eq('email', coachData.email || '');

    if (accessCodeDeleteError) {
      console.error('Error deleting access codes:', accessCodeDeleteError);
    }

    // Delete from users table (this will cascade delete related records due to foreign keys)
    const { error: userDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', coach_id)
      .eq('role', 'COACH');

    if (userDeleteError) {
      console.error('Error deleting from users table:', userDeleteError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete coach from users table' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Delete from auth.users table if auth_id exists
    if (coachData.auth_id) {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        coachData.auth_id
      );

      if (authDeleteError) {
        console.error('Error deleting from auth.users:', authDeleteError);
        // Log this error but don't fail the entire operation since the main user record is already deleted
        console.log('User deleted from users table but auth deletion failed');
      }
    }

    // Log the deletion activity
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'DELETE',
        entity: 'USER',
        entity_id: coach_id,
        actor_id: admin_user_id,
        before_data: { name: coachData.name, role: 'COACH' },
        after_data: null
      });

    console.log(`Coach ${coachData.name} (${coach_id}) deleted successfully by admin ${admin_user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${coachData.name} has been permanently removed from the platform` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error deleting coach:", error);
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