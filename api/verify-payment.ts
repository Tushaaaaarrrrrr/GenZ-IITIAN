import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, courseIds } = req.body;

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const razorpay_secret = process.env.RAZORPAY_SECRET;
  const lms_enroll_url = process.env.LMS_ENROLL_URL || "https://class.genziitian.in/api/external-enroll";

  if (!supabase_url || !service_role || !razorpay_secret) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  const supabase = createClient(supabase_url, service_role);

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  const isVerified = expectedSignature === razorpay_signature;

  if (isVerified) {
    try {
      // 1. Parallelize Order Update and Profile Fetch
      const [orderUpdate, profileRes] = await Promise.all([
        supabase.from('website_orders').update({ status: 'PAID' }).eq('order_id', razorpay_order_id),
        supabase.from('profiles').select('id, name').eq('email', email).single()
      ]);

      const profile = profileRes.data;

      // 3. External LMS Enrollment API (Bulk)
      try {
        const payload = {
          secret: process.env.EXTERNAL_ENROLL_SECRET,
          email: email,
          name: profile?.name || "Student",
          courseIds: courseIds
        };

        console.log("LMS PAYLOAD:", payload);

        const lmsRes = await fetch(lms_enroll_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const responseText = await lmsRes.text();
        console.log("LMS STATUS:", lmsRes.status);
        console.log("LMS RESPONSE:", responseText);

        if (!lmsRes.ok) throw new Error(`LMS Enrollment Failed: ${responseText}`);

        // 4. Bulk Log Success
        const successLogs = courseIds.map((cid: string) => ({
          userId: profile?.id,
          email,
          action: 'ENROLLMENT_SUCCESS',
          courseId: cid,
          metadata: { order_id: razorpay_order_id, payment_id: razorpay_payment_id }
        }));
        await supabase.from('activity_logs').insert(successLogs);

      } catch (lmsErr) {
        console.error(`LMS Enrollment Error for ${email}:`, lmsErr);
        // Bulk Log Failure
        const failureLogs = courseIds.map((cid: string) => ({
          userId: profile?.id,
          email,
          action: 'ENROLLMENT_FAILURE',
          courseId: cid,
          metadata: { error: String(lmsErr) }
        }));
        await supabase.from('activity_logs').insert(failureLogs);
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Payment verification data handling error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Signature mismatch' });
}
