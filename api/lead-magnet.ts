import { createClient } from '@supabase/supabase-js';

const PDF_NAME = 'GenZ IITian Free Resource PDF';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, level } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const trimmedName = String(name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const digitsOnly = String(phone || '').replace(/\D/g, '');
  const validPhone = digitsOnly.length === 12 && digitsOnly.startsWith('91') ? digitsOnly.slice(2) : digitsOnly;
  if (!/^[6-9]\d{9}$/.test(validPhone)) {
    return res.status(400).json({ error: 'Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9' });
  }

  const normalizedLevel = level === 'Diploma' ? 'Diploma' : 'Foundation';

  console.log(`[Lead Magnet] PDF request from ${trimmedName} (${normalizedEmail}) - ${normalizedLevel}`);

  // 1. Supabase logging (best-effort, if configured)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRole) {
    try {
      const supabase = createClient(supabaseUrl, serviceRole);
      const { error: logErr } = await supabase.from('activity_logs').insert({
        email: normalizedEmail,
        action: 'LEAD_MAGNET_PDF_REQUEST',
        metadata: { name: trimmedName, phone: validPhone, level: normalizedLevel, timestamp: new Date().toISOString() }
      });
      if (logErr) console.warn('[Lead Magnet] activity_logs notice:', logErr.message);
    } catch (dbErr: any) {
      console.error('[Lead Magnet] Supabase logging caught error:', dbErr.message);
    }
  }

  // 2. Trigger Google Apps Script webhook: logs to sheet + emails the PDF link
  const webhookUrl =
    process.env.LEAD_MAGNET_WEBHOOK_URL ||
    process.env.VITE_LEAD_MAGNET_WEBHOOK_URL ||
    process.env.GOOGLE_SHEET_WEBHOOK_URL ||
    process.env.APP_SCRIPT_URL;

  if (webhookUrl) {
    try {
      const whRes = await fetch(webhookUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: trimmedName,
          email: normalizedEmail,
          phone: validPhone,
          level: normalizedLevel,
          pdf_name: PDF_NAME,
          timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        })
      });
      const resText = await whRes.text();
      console.log(`[Lead Magnet] Dispatched webhook for ${normalizedEmail} with response:`, resText.slice(0, 150));
    } catch (whErr: any) {
      console.error('[Lead Magnet] Webhook call error:', whErr.message);
    }
  } else {
    console.warn('[Lead Magnet] No webhook URL configured! Checked: LEAD_MAGNET_WEBHOOK_URL, GOOGLE_SHEET_WEBHOOK_URL, APP_SCRIPT_URL');
  }

  return res.status(200).json({
    success: true,
    message: 'Request received. Check your email for the download link.',
    drive_link: 'https://drive.google.com/uc?export=download&id=1uKq2UKsIkdNiv3VKx2_BV_j2UXkjB2fA'
  });
}
