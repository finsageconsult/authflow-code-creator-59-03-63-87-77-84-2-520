import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get due reports
    const { data: dueReports } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('is_active', true)
      .lte('next_send_date', new Date().toISOString());

    if (!dueReports?.length) {
      return new Response(
        JSON.stringify({ message: 'No reports due' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    for (const report of dueReports) {
      try {
        // Generate report content based on type
        const reportContent = await generateReportContent(supabase, report);
        
        // Send email
        await resend.emails.send({
          from: "Finsage Analytics <analytics@finsage.com>",
          to: [report.email],
          subject: `Your ${report.frequency} ${report.report_type} Analytics Report`,
          html: reportContent,
        });

        // Update next send date
        const nextSendDate = new Date(report.next_send_date);
        if (report.frequency === 'weekly') {
          nextSendDate.setDate(nextSendDate.getDate() + 7);
        } else {
          nextSendDate.setMonth(nextSendDate.getMonth() + 1);
        }

        await supabase
          .from('scheduled_reports')
          .update({ 
            next_send_date: nextSendDate.toISOString(),
            last_sent_at: new Date().toISOString()
          })
          .eq('id', report.id);

        console.log(`Report sent to ${report.email} for ${report.report_type}`);
      } catch (error) {
        console.error(`Failed to send report to ${report.email}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ message: `Processed ${dueReports.length} reports` }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Send scheduled reports error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function generateReportContent(supabase: any, report: any): Promise<string> {
  switch (report.report_type) {
    case 'org':
      return await generateOrgReport(supabase, report.organization_id);
    case 'coach':
      return await generateCoachReport(supabase, report.user_id);
    case 'employee':
      return await generateEmployeeReport(supabase, report.user_id);
    default:
      return '<p>Report type not supported</p>';
  }
}

async function generateOrgReport(supabase: any, organizationId: string): Promise<string> {
  const { data: employees } = await supabase
    .from('users')
    .select('id, status')
    .eq('organization_id', organizationId)
    .eq('role', 'EMPLOYEE');

  const { data: sessions } = await supabase
    .from('coaching_sessions')
    .select('status')
    .eq('organization_id', organizationId);

  const { data: insights } = await supabase
    .from('anonymized_insights')
    .select('*')
    .eq('organization_id', organizationId)
    .order('insight_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(emp => emp.status === 'ACTIVE').length || 0;
  const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;

  return `
    <h1>Organization Analytics Report</h1>
    <h2>Key Metrics</h2>
    <ul>
      <li><strong>Total Employees:</strong> ${totalEmployees}</li>
      <li><strong>Active Participants:</strong> ${activeEmployees} (${totalEmployees > 0 ? (activeEmployees/totalEmployees*100).toFixed(1) : 0}%)</li>
      <li><strong>Completed Sessions:</strong> ${completedSessions}</li>
    </ul>
    
    ${insights ? `
      <h2>Wellness Metrics</h2>
      <ul>
        <li><strong>Average Stress Level:</strong> ${insights.avg_stress_level?.toFixed(1) || 'N/A'}/10</li>
        <li><strong>Average Confidence:</strong> ${insights.avg_confidence_level?.toFixed(1) || 'N/A'}/10</li>
        <li><strong>Webinar Attendance Rate:</strong> ${(insights.webinar_attendance_rate || 0).toFixed(1)}%</li>
      </ul>
    ` : ''}
    
    <p>This automated report provides insights into your organization's financial wellness program engagement.</p>
    <p>Best regards,<br>The Finsage Team</p>
  `;
}

async function generateCoachReport(supabase: any, userId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('coaching_sessions')
    .select('status, scheduled_at')
    .eq('coach_id', userId);

  const { data: bookings } = await supabase
    .from('individual_bookings')
    .select('status, rating')
    .eq('coach_id', userId);

  const allSessions = [...(sessions || []), ...(bookings || [])];
  const completedSessions = allSessions.filter(s => s.status === 'completed').length;
  const avgRating = bookings?.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / (bookings?.filter(b => b.rating).length || 1) || 0;

  return `
    <h1>Coach Performance Report</h1>
    <h2>Session Summary</h2>
    <ul>
      <li><strong>Total Sessions:</strong> ${allSessions.length}</li>
      <li><strong>Completed Sessions:</strong> ${completedSessions}</li>
      <li><strong>Completion Rate:</strong> ${allSessions.length > 0 ? (completedSessions/allSessions.length*100).toFixed(1) : 0}%</li>
      <li><strong>Average Rating:</strong> ${avgRating.toFixed(1)}/5</li>
    </ul>
    
    <p>Keep up the excellent work supporting your clients' financial wellness journey!</p>
    <p>Best regards,<br>The Finsage Team</p>
  `;
}

async function generateEmployeeReport(supabase: any, userId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('coaching_sessions')
    .select('status')
    .eq('client_id', userId);

  const { data: moodCheckins } = await supabase
    .from('mood_check_ins')
    .select('stress_level, confidence_level, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
  const avgConfidence = moodCheckins?.reduce((sum, m) => sum + m.confidence_level, 0) / (moodCheckins?.length || 1) || 0;

  return `
    <h1>Your Financial Wellness Report</h1>
    <h2>Progress Summary</h2>
    <ul>
      <li><strong>Completed Sessions:</strong> ${completedSessions}</li>
      <li><strong>Mood Check-ins:</strong> ${moodCheckins?.length || 0}</li>
      <li><strong>Current Confidence Level:</strong> ${avgConfidence.toFixed(1)}/10</li>
    </ul>
    
    <p>You're making great progress on your financial wellness journey. Keep it up!</p>
    <p>Best regards,<br>The Finsage Team</p>
  `;
}

serve(handler);