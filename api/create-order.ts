import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_SECRET || '',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, email, courseIds } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Log the order in Supabase using existing schema field names
    await supabase.from('website_orders').insert({
      order_id: order.id,
      user_email: email,
      course_ids: courseIds,
      total_amount: amount,
      status: 'CREATED',
    });

    return res.status(200).json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
