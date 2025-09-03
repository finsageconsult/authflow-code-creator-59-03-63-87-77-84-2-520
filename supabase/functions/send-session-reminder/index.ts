import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SessionReminderRequest {
  sessionId: string;
  reminderType: 'coach' | 'client' | 'both';
  hoursBeforeSession?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Session reminder function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, reminderType, hoursBeforeSession = 24 }: SessionReminderRequest = await req.json();
    console.log("Processing reminder for session:", sessionId, "Type:", reminderType);

    // Fetch session details with coach and client info
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        session_type,
        meeting_link,
        coach:coach_id (name, email),
        client:client_id (name, email),
        organization:organization_id (name)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      throw new Error(`Failed to fetch session: ${sessionError.message}`);
    }

    if (!session) {
      throw new Error("Session not found");
    }

    const sessionDate = new Date(session.scheduled_at);
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const promises = [];

    // Send coach reminder
    if (reminderType === 'coach' || reminderType === 'both') {
      const coachEmailPromise = resend.emails.send({
        from: "FinSage <noreply@finsage.in>",
        to: [session.coach.email],
        subject: `Session Reminder: ${session.session_type} with ${session.client.name}`,
        html: `
          <h2>Upcoming Coaching Session Reminder</h2>
          <p>Dear ${session.coach.name},</p>
          
          <p>This is a reminder about your upcoming coaching session:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Session Details</h3>
            <p><strong>Client:</strong> ${session.client.name}</p>
            <p><strong>Date:</strong> ${formatDate(sessionDate)}</p>
            <p><strong>Time:</strong> ${formatTime(sessionDate)}</p>
            <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
            <p><strong>Type:</strong> ${session.session_type}</p>
            ${session.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${session.meeting_link}">${session.meeting_link}</a></p>` : ''}
          </div>
          
          <p>Please ensure you're prepared for the session and join on time.</p>
          
          <p>Best regards,<br>FinSage Team</p>
        `,
      });
      promises.push(coachEmailPromise);
    }

    // Send client reminder
    if (reminderType === 'client' || reminderType === 'both') {
      const clientEmailPromise = resend.emails.send({
        from: "FinSage <noreply@finsage.in>",
        to: [session.client.email],
        subject: `Session Reminder: ${session.session_type} with ${session.coach.name}`,
        html: `
          <h2>Upcoming Coaching Session Reminder</h2>
          <p>Dear ${session.client.name},</p>
          
          <p>This is a reminder about your upcoming financial coaching session:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Session Details</h3>
            <p><strong>Coach:</strong> ${session.coach.name}</p>
            <p><strong>Date:</strong> ${formatDate(sessionDate)}</p>
            <p><strong>Time:</strong> ${formatTime(sessionDate)}</p>
            <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
            <p><strong>Type:</strong> ${session.session_type}</p>
            ${session.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${session.meeting_link}">Join Meeting</a></p>` : ''}
          </div>
          
          <p>Please join the session on time. If you need to reschedule, please contact your HR team.</p>
          
          <p>Best regards,<br>FinSage Team</p>
        `,
      });
      promises.push(clientEmailPromise);
    }

    const results = await Promise.all(promises);
    console.log("Reminder emails sent:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${reminderType} reminder(s) sent successfully`,
        emailIds: results.map(r => r.data?.id).filter(Boolean)
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-session-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);