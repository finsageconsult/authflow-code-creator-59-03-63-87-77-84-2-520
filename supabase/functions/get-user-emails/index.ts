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
    console.log('get-user-emails function called')

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

    const { userIds } = await req.json()
    console.log('Parsed userIds:', userIds)

    if (!userIds || !Array.isArray(userIds)) {
      console.error('Invalid userIds:', userIds)
      return new Response(
        JSON.stringify({ error: 'userIds array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user emails from auth.users table
    console.log('Fetching auth users...')
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching auth users:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user emails' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Auth users fetched:', authUsers?.users?.length, 'users')
    console.log('Sample auth user:', authUsers?.users?.[0])

    // Create mapping of auth_id to real email
    const emailMapping: { [key: string]: string } = {}
    
    authUsers.users.forEach(user => {
      console.log('Processing user:', user.id, user.email)
      if (userIds.includes(user.id)) {
        emailMapping[user.id] = user.email || ''
        console.log('Added to mapping:', user.id, '->', user.email)
      }
    })

    console.log('Final email mapping:', emailMapping)

    return new Response(
      JSON.stringify({ emailMapping }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-user-emails function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})