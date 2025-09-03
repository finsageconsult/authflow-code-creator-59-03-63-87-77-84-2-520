import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      bookingId,
      clientEmail,
      coachEmail,
      clientName,
      coachName,
      sessionType,
      scheduledAt,
      duration,
      meetingLink,
      status // 'confirmed' or 'cancelled'
    } = await req.json();

    // Create idempotent event key
    const eventKey = `booking_${status}_${bookingId}`;

    // Check if email already sent
    const { data: existingEvent } = await supabase
      .from('email_events')
      .select('id')
      .eq('event_key', eventKey)
      .single();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isConfirmation = status === 'confirmed';
    const sessionDate = new Date(scheduledAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const sessionTime = new Date(scheduledAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Email to client
    const clientSubject = isConfirmation 
      ? `✅ Session Confirmed - ${sessionType}`
      : `❌ Session Cancelled - ${sessionType}`;

    const clientEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${isConfirmation ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isConfirmation ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: ${isConfirmation ? '#16a34a' : '#dc2626'}; margin-top: 0;">
            ${isConfirmation ? '✅' : '❌'} Session ${isConfirmation ? 'Confirmed' : 'Cancelled'}
          </h2>
          <p>Hi ${clientName},</p>
          <p>Your ${sessionType} session has been <strong>${status}</strong>.</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Coach:</strong> ${coachName}</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong> ${sessionDate}</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong> ${sessionTime}</li>
            <li style="padding: 8px 0;"><strong>Duration:</strong> ${duration} minutes</li>
          </ul>
        </div>
        
        ${isConfirmation && meetingLink ? `
          <p style="text-align: center; margin: 30px 0;">
            <a href="${meetingLink}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Session
            </a>
          </p>
          
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>📅 Add to Calendar:</strong> Don't forget to add this session to your calendar. We'll send you a reminder 15 minutes before the session starts.</p>
          </div>
        ` : ''}
        
        ${!isConfirmation ? `
          <p>If you need to reschedule, please contact your coach or book a new session through your dashboard.</p>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Finsage - Financial Wellness Platform<br>
          This email was sent to ${clientEmail}
        </p>
      </div>
    `;

    // Email to coach
    const coachSubject = isConfirmation 
      ? `📅 New Session Booking - ${sessionType}`
      : `❌ Session Cancelled - ${sessionType}`;

    const coachEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${isConfirmation ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isConfirmation ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: ${isConfirmation ? '#16a34a' : '#dc2626'}; margin-top: 0;">
            ${isConfirmation ? '📅' : '❌'} Session ${isConfirmation ? 'Booking' : 'Cancelled'}
          </h2>
          <p>Hi ${coachName},</p>
          <p>A ${sessionType} session has been <strong>${status}</strong> with you.</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Client:</strong> ${clientName}</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Date:</strong> ${sessionDate}</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong> ${sessionTime}</li>
            <li style="padding: 8px 0;"><strong>Duration:</strong> ${duration} minutes</li>
          </ul>
        </div>
        
        ${isConfirmation ? `
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://grjyybmjrzrurlzdqmqc.supabase.co/coach-dashboard" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </p>
          
          <p>Please prepare for the session and ensure you have the meeting link ready. The client will receive the meeting details separately.</p>
        ` : `
          <p>This session has been removed from your calendar. The time slot is now available for other bookings.</p>
        `}
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Finsage - Coach Portal<br>
          This email was sent to ${coachEmail}
        </p>
      </div>
    `;

    // Send emails to both client and coach
    const emailPromises = [
      resend.emails.send({
        from: 'Finsage Bookings <bookings@finsage.com>',
        to: [clientEmail],
        subject: clientSubject,
        html: clientEmailContent,
      }),
      resend.emails.send({
        from: 'Finsage Coach Portal <coaches@finsage.com>',
        to: [coachEmail],
        subject: coachSubject,
        html: coachEmailContent,
      })
    ];

    const emailResults = await Promise.allSettled(emailPromises);
    
    // Check for any email failures
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Email ${index + 1} failed:`, result.reason);
      }
    });

    // Record email event
    await supabase
      .from('email_events')
      .insert({
        event_key: eventKey,
        email_type: `booking_${status}`,
        recipient_email: `${clientEmail}, ${coachEmail}`,
        metadata: { bookingId, sessionType, scheduledAt }
      });

    console.log(`Booking ${status} emails sent successfully`);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});