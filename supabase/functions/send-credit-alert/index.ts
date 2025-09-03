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
      organizationId,
      hrEmail,
      organizationName,
      currentCredits,
      recommendedTopUp 
    } = await req.json();

    // Create idempotent event key
    const eventKey = `credit_alert_${organizationId}_${new Date().toISOString().split('T')[0]}`;

    // Check if email already sent today
    const { data: existingEvent } = await supabase
      .from('email_events')
      .select('id')
      .eq('event_key', eventKey)
      .single();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Alert already sent today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Finsage Alerts <alerts@finsage.com>',
      to: [hrEmail],
      subject: `⚠️ Low Credits Alert - ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; margin-top: 0;">⚠️ Low Credits Alert</h2>
            <p>Your organization <strong>${organizationName}</strong> is running low on credits.</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Current Status</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <strong>Remaining Credits:</strong> ${currentCredits}
              </li>
              <li style="padding: 8px 0;">
                <strong>Recommended Top-up:</strong> ${recommendedTopUp} credits
              </li>
            </ul>
          </div>
          
          <p>To ensure uninterrupted access to coaching sessions and webinars for your employees, we recommend topping up your credit balance.</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://grjyybmjrzrurlzdqmqc.supabase.co/hr-dashboard/credits" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Top Up Credits Now
            </a>
          </p>
          
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💡 Pro Tip</h4>
            <p style="margin-bottom: 0; color: #1e40af;">Set up automatic credit top-ups to avoid service interruptions. Contact our team to learn more about enterprise plans with unlimited access.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Finsage - Financial Wellness Platform<br>
            This alert was sent to ${hrEmail}
          </p>
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
        email_type: 'credit_alert',
        recipient_email: hrEmail,
        metadata: { organizationId, currentCredits, recommendedTopUp }
      });

    // Create notification for HR
    const { data: hrUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', hrEmail)
      .eq('role', 'HR')
      .single();

    if (hrUser) {
      await supabase.rpc('create_notification', {
        target_user_id: hrUser.id,
        notification_title: 'Low Credits Alert',
        notification_message: `Your organization has ${currentCredits} credits remaining. Consider topping up.`,
        notification_type: 'warning',
        notification_metadata: { currentCredits, recommendedTopUp }
      });
    }

    console.log('Credit alert sent successfully');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending credit alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});