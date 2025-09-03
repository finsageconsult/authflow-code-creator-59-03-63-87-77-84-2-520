import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRequest {
  type: 'org' | 'coach' | 'employee';
  frequency: 'weekly' | 'monthly';
  email: string;
  organizationId?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, frequency, email, organizationId, userId }: ScheduleRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Store the scheduled report configuration
    const { error: scheduleError } = await supabase
      .from('scheduled_reports')
      .insert({
        report_type: type,
        frequency,
        email,
        organization_id: organizationId,
        user_id: userId,
        is_active: true
      });

    if (scheduleError) {
      throw scheduleError;
    }

    // Send confirmation email
    const confirmationEmail = await resend.emails.send({
      from: "Finsage Analytics <analytics@finsage.com>",
      to: [email],
      subject: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Analytics Report Scheduled`,
      html: `
        <h1>Report Scheduling Confirmed</h1>
        <p>Your ${frequency} ${type} analytics report has been successfully scheduled.</p>
        <p><strong>Report Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Analytics</p>
        <p><strong>Frequency:</strong> ${frequency.charAt(0).toUpperCase() + frequency.slice(1)}</p>
        <p><strong>Next Report:</strong> ${frequency === 'weekly' ? 'Next week' : 'Next month'}</p>
        <p>You will receive your reports at this email address: ${email}</p>
        <br>
        <p>Best regards,<br>The Finsage Analytics Team</p>
      `,
    });

    console.log('Report scheduled and confirmation sent:', confirmationEmail);

    return new Response(
      JSON.stringify({ success: true, messageId: confirmationEmail.data?.id }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Schedule report error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function getNextSendDate(frequency: 'weekly' | 'monthly'): Date {
  const now = new Date();
  if (frequency === 'weekly') {
    now.setDate(now.getDate() + 7);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now;
}

serve(handler);