import { createClient } from '@supabase/supabase-js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const normalizeEmail = (email: string) => String(email || '').trim().toLowerCase();

async function hasRealPaidPurchase(supabaseClient: any, email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !supabaseClient) return false;

  const { data, error } = await supabaseClient
    .from('website_orders')
    .select('order_id')
    .ilike('user_email', normalizedEmail)
    .eq('status', 'PAID')
    .not('order_id', 'like', 'AUTO_%')
    .gt('total_amount', 0)
    .limit(1);

  if (error) {
    console.error('[Automated Emails] Purchase check failed:', error.message);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

export default async function handler(req: any, res: any) {
  // Allow GET or POST for cron triggers
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized cron request' });
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const welcomeWebhookUrl = process.env.WELCOME_WEBHOOK_URL;

  if (!supabaseUrl || !serviceRole || !welcomeWebhookUrl) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  const supabaseClient = createClient(supabaseUrl, serviceRole);

  const report = {
    abandonedSent: [] as string[],
    nudgeSent: [] as string[],
    missyouSent: [] as string[]
  };

  try {
    console.log('[Automated Emails] Processing automated emails check via Serverless API...');
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Abandoned Checkout Recovery (Created between 7 days ago and 2 hours ago, status = CREATED)
    const { data: abandonedOrders } = await supabaseClient
      .from('website_orders')
      .select('user_email, course_ids, created_at')
      .eq('status', 'CREATED')
      .gte('created_at', sevenDaysAgo.toISOString())
      .lte('created_at', twoHoursAgo.toISOString());

    if (abandonedOrders && abandonedOrders.length > 0) {
      console.log(`[Automated Emails] Found ${abandonedOrders.length} potential abandoned checkouts.`);
      for (const order of abandonedOrders) {
        if (!order.user_email) continue;
        
        // Check if already sent
        const { data: sentLogs } = await supabaseClient
          .from('activity_logs')
          .select('id')
          .eq('email', order.user_email)
          .eq('action', 'EMAIL_SENT')
          .contains('metadata', { type: 'abandoned' });

        if (sentLogs && sentLogs.length > 0) continue;

        const hasPaid = await hasRealPaidPurchase(supabaseClient, order.user_email);
        if (hasPaid) continue;

        // Fetch course names from DB using course_ids array
        let courseNames = 'your course';
        if (order.course_ids && Array.isArray(order.course_ids) && order.course_ids.length > 0) {
          const { data: coursesData } = await supabaseClient
            .from('courses')
            .select('name')
            .in('id', order.course_ids);
          if (coursesData && coursesData.length > 0) {
            courseNames = coursesData.map((c: any) => c.name).join(', ');
          }
        }

        const name = order.user_email.split('@')[0];
        try {
          await fetch(welcomeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: order.user_email,
              name,
              courseName: courseNames,
              type: 'abandoned',
              timestamp: new Date().toISOString()
            })
          });
          console.log(`[Automated Emails] Sent abandoned email to ${order.user_email}`);

          // Log to activity_logs
          await supabaseClient
            .from('activity_logs')
            .insert({
              email: order.user_email,
              action: 'EMAIL_SENT',
              metadata: { type: 'abandoned', timestamp: new Date().toISOString() }
            });
          
          report.abandonedSent.push(order.user_email);
        } catch (e) {
          console.error(`Failed to trigger abandoned email to ${order.user_email}:`, e);
        }
        await delay(2000); 
      }
    }

    // 2. Nudge (Created between 7 days ago and 4 hours ago, no paid orders)
    const { data: nudgeProfiles } = await supabaseClient
      .from('profiles')
      .select('email, name, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .lte('created_at', fourHoursAgo.toISOString());

    if (nudgeProfiles && nudgeProfiles.length > 0) {
      console.log(`[Automated Emails] Found ${nudgeProfiles.length} potential nudges.`);
      for (const profile of nudgeProfiles) {
        if (!profile.email) continue;

        const { data: sentNudge } = await supabaseClient
          .from('activity_logs')
          .select('id')
          .eq('email', profile.email)
          .eq('action', 'EMAIL_SENT')
          .contains('metadata', { type: 'nudge' });

        if (sentNudge && sentNudge.length > 0) continue;

        const hasPaid = await hasRealPaidPurchase(supabaseClient, profile.email);
        if (hasPaid) continue;

        try {
          await fetch(welcomeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              type: 'nudge',
              timestamp: new Date().toISOString()
            })
          });
          console.log(`[Automated Emails] Sent nudge email to ${profile.email}`);

          await supabaseClient
            .from('activity_logs')
            .insert({
              email: profile.email,
              action: 'EMAIL_SENT',
              metadata: { type: 'nudge', timestamp: new Date().toISOString() }
            });

          report.nudgeSent.push(profile.email);
        } catch (e) {
          console.error(`Failed to trigger nudge email to ${profile.email}:`, e);
        }
        await delay(2000);
      }
    }

    // 3. Miss You (Created between 30 days ago and 7 days ago, no paid orders)
    const { data: missYouProfiles } = await supabaseClient
      .from('profiles')
      .select('email, name, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .lte('created_at', sevenDaysAgo.toISOString());

    if (missYouProfiles && missYouProfiles.length > 0) {
      console.log(`[Automated Emails] Found ${missYouProfiles.length} potential missyou profiles.`);
      for (const profile of missYouProfiles) {
        if (!profile.email) continue;

        const { data: sentMissyou } = await supabaseClient
          .from('activity_logs')
          .select('id')
          .eq('email', profile.email)
          .eq('action', 'EMAIL_SENT')
          .contains('metadata', { type: 'missyou' });

        if (sentMissyou && sentMissyou.length > 0) continue;

        const hasPaid = await hasRealPaidPurchase(supabaseClient, profile.email);
        if (hasPaid) continue;

        try {
          await fetch(welcomeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              type: 'missyou',
              timestamp: new Date().toISOString()
            })
          });
          console.log(`[Automated Emails] Sent missyou email to ${profile.email}`);

          await supabaseClient
            .from('activity_logs')
            .insert({
              email: profile.email,
              action: 'EMAIL_SENT',
              metadata: { type: 'missyou', timestamp: new Date().toISOString() }
            });

          report.missyouSent.push(profile.email);
        } catch (e) {
          console.error(`Failed to trigger missyou email to ${profile.email}:`, e);
        }
        await delay(2000);
      }
    }

    console.log('[Automated Emails] Automated emails check completed.');
    return res.status(200).json({ success: true, report });
  } catch (error: any) {
    console.error('[API Cron] Error processing automated emails:', error);
    return res.status(500).json({ error: error.message });
  }
}
