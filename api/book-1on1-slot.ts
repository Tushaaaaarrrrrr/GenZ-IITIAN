import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    level,
    subjects,
    slot_date,
    slot_time,
    plan,
    notes,
    bcc = 'genziitian@gmail.com'
  } = req.body || {};

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  console.log(`[1:1 Booking] Received slot request for ${name} (${normalizedEmail}) - ${slot_date} ${slot_time}`);

  // 1. Supabase logging (if configured)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRole) {
    try {
      const supabase = createClient(supabaseUrl, serviceRole);

      // Max 3 bookings per user per calendar day (IST)
      const istDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
      const dayStart = new Date(`${istDate}T00:00:00+05:30`).toISOString();
      const dayEnd = new Date(`${istDate}T23:59:59.999+05:30`).toISOString();

      const { count, error: countErr } = await supabase
        .from('one_on_one_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('email', normalizedEmail)
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd)
        .neq('status', 'CANCELLED');

      if (!countErr && typeof count === 'number' && count >= 3) {
        return res.status(429).json({
          success: false,
          code: 'DAILY_LIMIT',
          error: 'You can book up to 3 sessions in one day. Please contact us for more help.',
          contact: {
            whatsapp: '+917970495447',
            email: 'genziitian@gmail.com'
          }
        });
      }
      
      // Attempt logging to activity_logs
      const { error: logErr } = await supabase.from('activity_logs').insert({
        email: normalizedEmail,
        action: '1ON1_SLOT_BOOKED',
        metadata: {
          name,
          phone,
          level,
          subjects,
          slot_date,
          slot_time,
          plan,
          notes,
          bcc,
          timestamp: new Date().toISOString()
        }
      });
      if (logErr) console.warn('[1:1 Booking] activity_logs notice:', logErr.message);

      // Attempt to save to one_on_one_bookings table if it exists
      const { error: bookingErr } = await supabase.from('one_on_one_bookings').insert({
        name,
        email: normalizedEmail,
        phone,
        level,
        subjects,
        slot_date,
        slot_time,
        plan,
        notes,
        status: 'CONFIRMED',
        created_at: new Date().toISOString()
      });
      if (bookingErr) console.warn('[1:1 Booking] one_on_one_bookings notice:', bookingErr.message);
    } catch (dbErr: any) {
      console.error('[1:1 Booking] Supabase logging caught error:', dbErr.message);
    }
  }

  // 2. Trigger Google Apps Script / Webhook for Email sending with BCC
  const webhookUrl = process.env.WELCOME_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'one_on_one_booking',
          name,
          email: normalizedEmail,
          phone,
          level,
          subjects,
          slot_date,
          slot_time,
          plan,
          notes,
          bcc: 'genziitian@gmail.com',
          timestamp: new Date().toISOString()
        })
      });
      console.log(`[1:1 Booking] Dispatched email webhook for ${normalizedEmail} with BCC genziitian@gmail.com`);
    } catch (whErr: any) {
      console.error('[1:1 Booking] Webhook call error:', whErr.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Slot successfully booked. Confirmation email dispatched.',
    details: {
      name,
      email: normalizedEmail,
      slot_date,
      slot_time,
      bcc
    }
  });
}
