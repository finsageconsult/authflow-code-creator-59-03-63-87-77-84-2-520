import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  type: 'org' | 'coach' | 'employee';
  format: 'csv' | 'pdf';
  organizationId?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, format, organizationId, userId }: ExportRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let content = '';

    if (format === 'csv') {
      switch (type) {
        case 'org':
          content = await generateOrgCSV(supabase, organizationId!);
          break;
        case 'coach':
          content = await generateCoachCSV(supabase, userId!);
          break;
        case 'employee':
          content = await generateEmployeeCSV(supabase, userId!);
          break;
      }
    } else {
      // PDF generation would go here
      content = `PDF export for ${type} not yet implemented`;
    }

    return new Response(
      JSON.stringify({ content }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function generateOrgCSV(supabase: any, organizationId: string): Promise<string> {
  // Get organization data
  const { data: employees } = await supabase
    .from('users')
    .select('name, email, status, created_at')
    .eq('organization_id', organizationId)
    .eq('role', 'EMPLOYEE');

  const { data: sessions } = await supabase
    .from('coaching_sessions')
    .select('scheduled_at, status, session_type')
    .eq('organization_id', organizationId);

  const { data: webinars } = await supabase
    .from('webinars')
    .select('title, scheduled_date, current_participants, status')
    .eq('organization_id', organizationId);

  // Generate CSV
  const csvRows = [
    ['Type', 'Name/Title', 'Date', 'Status', 'Participants/Email'],
    ...employees.map(emp => ['Employee', emp.name, emp.created_at, emp.status, emp.email]),
    ...sessions.map(session => ['Session', session.session_type, session.scheduled_at, session.status, '']),
    ...webinars.map(webinar => ['Webinar', webinar.title, webinar.scheduled_date, webinar.status, webinar.current_participants.toString()])
  ];

  return csvRows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
}

async function generateCoachCSV(supabase: any, userId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('coaching_sessions')
    .select('scheduled_at, status, session_type, duration_minutes')
    .eq('coach_id', userId);

  const { data: bookings } = await supabase
    .from('individual_bookings')
    .select('scheduled_at, status, duration_minutes, rating')
    .eq('coach_id', userId);

  const allSessions = [...(sessions || []), ...(bookings || [])];

  const csvRows = [
    ['Date', 'Type', 'Duration', 'Status', 'Rating'],
    ...allSessions.map(session => [
      session.scheduled_at,
      session.session_type || 'Individual Coaching',
      session.duration_minutes.toString(),
      session.status,
      session.rating?.toString() || ''
    ])
  ];

  return csvRows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
}

async function generateEmployeeCSV(supabase: any, userId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('coaching_sessions')
    .select('scheduled_at, status, session_type')
    .eq('client_id', userId);

  const { data: moodCheckins } = await supabase
    .from('mood_check_ins')
    .select('created_at, stress_level, confidence_level, financial_concerns')
    .eq('user_id', userId);

  const csvRows = [
    ['Type', 'Date', 'Details'],
    ...sessions.map(session => ['Session', session.scheduled_at, `${session.session_type} - ${session.status}`]),
    ...moodCheckins.map(checkin => ['Mood Check-in', checkin.created_at, `Stress: ${checkin.stress_level}, Confidence: ${checkin.confidence_level}`])
  ];

  return csvRows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
}

serve(handler);