import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('update-user-email function called')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, newEmail } = await req.json()
    console.log('Updating email for user:', userId, 'to:', newEmail)

    if (!userId || !newEmail) {
      return new Response(
        JSON.stringify({ error: 'userId and newEmail are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update email in auth.users table
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail }
    )

    if (authError) {
      console.error('Error updating auth user email:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to update user email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Also update in public.users table
    const { data: publicUser, error: publicError } = await supabaseAdmin
      .from('users')
      .update({ email: newEmail })
      .eq('auth_id', userId)

    if (publicError) {
      console.error('Error updating public user email:', publicError)
      // Don't fail completely if public update fails, auth is primary
    }

    console.log('Email updated successfully for user:', userId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email updated successfully',
        user: authUser.user 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-user-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})