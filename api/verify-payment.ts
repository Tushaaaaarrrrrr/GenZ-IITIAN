import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, courseIds } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  const isVerified = expectedSignature === razorpay_signature;

  if (isVerified) {
    try {
      // 1. Update order status
      await supabase.from('website_orders').update({ status: 'PAID' }).eq('order_id', razorpay_order_id);

      // 2. Fetch userId for activity log
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();

      // 3. Automated Enrollment & Activity Logging for each course
      for (const cid of courseIds) {
        // Log activity (Existing Schema: userId, email, action, courseId, timestamp)
        await supabase.from('activity_logs').insert({
          userId: profile?.id,
          email,
          action: 'ENROLLMENT_SUCCESS',
          courseId: cid,
          metadata: { order_id: razorpay_order_id, payment_id: razorpay_payment_id }
        });

        // External LMS Enrollment API
        try {
          const lmsRes = await fetch(process.env.LMS_API_URL + "/api/purchase-success", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.EXTERNAL_ENROLL_SECRET}` 
            },
            body: JSON.stringify({ email, courseId: cid })
          });
          
          if (!lmsRes.ok) throw new Error("LMS Enrollment Failed");
        } catch (lmsErr) {
          console.error(`Failed to enroll ${email} in ${cid}:`, lmsErr);
          // Log failure
          await supabase.from('activity_logs').insert({
            userId: profile?.id,
            email,
            action: 'ENROLLMENT_FAILURE',
            courseId: cid,
            metadata: { error: String(lmsErr) }
          });
        }
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Payment verification data handling error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(400).json({ error: 'Signature mismatch' });
}
