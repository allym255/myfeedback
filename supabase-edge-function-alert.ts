// Supabase Edge Function - Deploy this for Phase 2 email alerts
// File: supabase/functions/alert-negative-feedback/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface FeedbackRecord {
  id: string
  branch_id: string
  overall_rating: number
  service_speed: number
  staff_friendliness: number
  cleanliness: number
  comment: string | null
  shift: string
  created_at: string
}

serve(async (req) => {
  try {
    const { type, table, record, old_record } = await req.json()

    // Only process INSERT events on feedback table
    if (type !== 'INSERT' || table !== 'feedback') {
      return new Response('OK', { status: 200 })
    }

    const feedback = record as FeedbackRecord

    // Check if negative feedback
    if (feedback.overall_rating > 2) {
      return new Response('Not negative feedback', { status: 200 })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get branch details
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('name, location')
      .eq('id', feedback.branch_id)
      .single()

    if (branchError) throw branchError

    // Send email via Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const alertEmail = Deno.env.get('ALERT_EMAIL')

    if (!resendApiKey || !alertEmail) {
      console.log('Email credentials not configured')
      return new Response('Email not configured', { status: 200 })
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Localizer Alerts <alerts@localizer.app>',
        to: alertEmail,
        subject: `🚨 Negative Feedback Alert - ${branch.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ Negative Feedback Alert</h1>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #111827;">Branch Details</h2>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${branch.name}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${branch.location}</p>
                <p style="margin: 5px 0;"><strong>Shift:</strong> ${feedback.shift}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(feedback.created_at).toLocaleString()}</p>
              </div>

              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #111827;">Ratings</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div>
                    <p style="margin: 5px 0; color: #6b7280;">Overall Experience</p>
                    <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #dc2626;">
                      ${'★'.repeat(feedback.overall_rating)}${'☆'.repeat(5 - feedback.overall_rating)}
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0; color: #6b7280;">Service Speed</p>
                    <p style="margin: 5px 0; font-size: 20px;">
                      ${'★'.repeat(feedback.service_speed)}${'☆'.repeat(5 - feedback.service_speed)}
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0; color: #6b7280;">Staff Friendliness</p>
                    <p style="margin: 5px 0; font-size: 20px;">
                      ${'★'.repeat(feedback.staff_friendliness)}${'☆'.repeat(5 - feedback.staff_friendliness)}
                    </p>
                  </div>
                  <div>
                    <p style="margin: 5px 0; color: #6b7280;">Cleanliness</p>
                    <p style="margin: 5px 0; font-size: 20px;">
                      ${'★'.repeat(feedback.cleanliness)}${'☆'.repeat(5 - feedback.cleanliness)}
                    </p>
                  </div>
                </div>
              </div>

              ${feedback.comment ? `
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
                  <h2 style="margin-top: 0; color: #111827;">Customer Comment</h2>
                  <p style="font-style: italic; color: #374151; line-height: 1.6;">
                    "${feedback.comment}"
                  </p>
                </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${supabaseUrl.replace('supabase.co', 'localizer.app')}/dashboard" 
                   style="display: inline-block; background: #1D9E75; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Dashboard
                </a>
              </div>
            </div>

            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>This is an automated alert from Localizer Feedback System</p>
              <p>Respond to negative feedback within 24 hours for best results</p>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Failed to send email:', errorData)
      return new Response(`Email failed: ${errorData}`, { status: 500 })
    }

    console.log('✅ Negative feedback alert sent successfully')
    return new Response('Alert sent', { status: 200 })

  } catch (error) {
    console.error('Error in alert function:', error)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
})

/* 
==============================================
DEPLOYMENT INSTRUCTIONS
==============================================

1. Install Supabase CLI:
   npm install -g supabase

2. Initialize Supabase in your project:
   supabase init

3. Create the function:
   supabase functions new alert-negative-feedback

4. Copy this file to:
   supabase/functions/alert-negative-feedback/index.ts

5. Set environment variables:
   supabase secrets set RESEND_API_KEY=your-resend-key
   supabase secrets set ALERT_EMAIL=manager@yourcompany.com

6. Deploy the function:
   supabase functions deploy alert-negative-feedback

7. Create database trigger:
   Run this SQL in Supabase SQL Editor:

   CREATE OR REPLACE FUNCTION trigger_alert_negative_feedback()
   RETURNS trigger AS $$
   DECLARE
     payload json;
   BEGIN
     payload := json_build_object(
       'type', TG_OP,
       'table', TG_TABLE_NAME,
       'record', row_to_json(NEW),
       'old_record', row_to_json(OLD)
     );

     PERFORM net.http_post(
       url := 'https://your-project.supabase.co/functions/v1/alert-negative-feedback',
       headers := json_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer YOUR_ANON_KEY'
       ),
       body := payload::text
     );

     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER on_feedback_insert
   AFTER INSERT ON feedback
   FOR EACH ROW
   EXECUTE FUNCTION trigger_alert_negative_feedback();

8. Test it:
   - Submit feedback with rating ≤ 2
   - Check email inbox
   - Check Supabase function logs

==============================================
RESEND API SETUP
==============================================

1. Sign up at https://resend.com (free tier: 100 emails/day)
2. Verify your domain OR use resend's test domain
3. Get API key from dashboard
4. Add to Supabase secrets (step 5 above)

==============================================
*/
