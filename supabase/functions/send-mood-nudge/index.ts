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
      userId,
      userEmail,
      userName,
      daysSinceLastCheckIn 
    } = await req.json();

    // Create idempotent event key (send once per week)
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const eventKey = `mood_nudge_${userId}_week_${weekNumber}`;

    // Check if email already sent this week
    const { data: existingEvent } = await supabase
      .from('email_events')
      .select('id')
      .eq('event_key', eventKey)
      .single();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nudge already sent this week' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('mood_check_nudges')
      .eq('user_id', userId)
      .single();

    if (preferences && !preferences.mood_check_nudges) {
      return new Response(
        JSON.stringify({ success: true, message: 'User has disabled mood check nudges' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Finsage Wellness <wellness@finsage.com>',
      to: [userEmail],
      subject: '💙 How are you feeling about your finances?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💙 Money Mood Check</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0;">How are you feeling financially?</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
            <p>Hi ${userName},</p>
            
            <p>It's been <strong>${daysSinceLastCheckIn} days</strong> since your last mood check-in. We hope you're doing well!</p>
            
            <p>Taking a moment to reflect on your financial wellbeing can help you:</p>
            <ul style="color: #4a5568; line-height: 1.6;">
              <li>🎯 Track your progress over time</li>
              <li>📊 Get personalized insights</li>
              <li>💪 Build better financial habits</li>
              <li>🧘 Reduce money-related stress</li>
            </ul>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #2d3748; font-weight: 500;">It only takes 2 minutes</p>
              <a href="https://grjyybmjrzrurlzdqmqc.supabase.co/dashboard/mood-check" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Take Mood Check 💙
              </a>
            </div>
            
            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #c2410c; margin-top: 0; font-size: 16px;">💡 Did you know?</h4>
              <p style="margin-bottom: 0; color: #c2410c; font-size: 14px;">Regular financial wellness check-ins can help reduce money-related anxiety by up to 40% according to recent studies.</p>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-top: 25px;">
              Your responses are confidential and help us provide better support. You can adjust your notification preferences anytime in your dashboard settings.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
            <p style="margin: 0;">Finsage - Financial Wellness Platform</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://grjyybmjrzrurlzdqmqc.supabase.co/dashboard/settings" style="color: #a0aec0;">Manage preferences</a> | 
              <a href="#" style="color: #a0aec0;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      throw emailError;
    }

    // Record email event
    await supabase
      .from('email_events')
      .insert({
        event_key: eventKey,
        email_type: 'mood_nudge',
        recipient_email: userEmail,
        metadata: { userId, daysSinceLastCheckIn }
      });

    // Create notification
    await supabase.rpc('create_notification', {
      target_user_id: userId,
      notification_title: 'Money Mood Check Reminder',
      notification_message: `It's been ${daysSinceLastCheckIn} days since your last check-in. How are you feeling?`,
      notification_type: 'info',
      notification_metadata: { daysSinceLastCheckIn }
    });

    console.log('Mood nudge sent successfully');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending mood nudge:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});