import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server configuration error (missing Supabase keys)');
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

const getRazorpaySecret = () => {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    throw new Error('Server configuration error (missing Razorpay secret)');
  }
  return secret;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const razorpaySecret = getRazorpaySecret();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      courseIds,
      discountCode,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !Array.isArray(courseIds)) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Signature mismatch' });
    }

    const { error: orderUpdateError } = await supabase
      .from('website_orders')
      .update({ status: 'PAID' })
      .eq('order_id', razorpay_order_id);

    if (orderUpdateError) {
      throw orderUpdateError;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('email', email)
      .single();

    const lmsEnrollUrl = process.env.LMS_ENROLL_URL || 'https://class.genziitian.in/api/external-enroll';
    const externalEnrollSecret = process.env.EXTERNAL_ENROLL_SECRET;

    try {
      const lmsRes = await fetch(lmsEnrollUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: externalEnrollSecret,
          email,
          name: profile?.name || 'Student',
          courseIds,
        }),
      });

      if (!lmsRes.ok) {
        throw new Error(await lmsRes.text());
      }

      const successLogs = courseIds.map((courseId: string) => ({
        userId: profile?.id,
        email,
        action: 'ENROLLMENT_SUCCESS',
        courseId,
        created_at: new Date().toISOString(),
        metadata: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
        },
      }));

      await supabase.from('activity_logs').insert(successLogs);

      if (discountCode) {
        await supabase.from('coupon_uses').insert({
          code: discountCode,
          user_email: email,
          order_id: razorpay_order_id,
        });
      }
    } catch (lmsError) {
      console.error('LMS enrollment error:', lmsError);

      const failureLogs = courseIds.map((courseId: string) => ({
        userId: profile?.id,
        email,
        action: 'ENROLLMENT_FAILURE',
        courseId,
        created_at: new Date().toISOString(),
        metadata: { error: String(lmsError) },
      }));

      await supabase.from('activity_logs').insert(failureLogs);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('verify-payment error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
