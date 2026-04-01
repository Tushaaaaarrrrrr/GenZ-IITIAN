import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Validate Environment Variables
  const key_id = process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET;
  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const razorpay_secret = process.env.RAZORPAY_SECRET;

  if (!key_id || !razorpay_secret || !supabase_url || !service_role) {
    return res.status(500).json({ 
        error: 'Server configuration error (missing env vars)',
        details: {
            razorpay: !!(key_id && razorpay_secret),
            supabase: !!(supabase_url && service_role)
        }
    });
  }

  const { amount, email, courseIds } = req.body;

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const supabase = createClient(supabase_url, service_role);

    // 2. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // 3. Log the order in Supabase
    const { error: supabaseError } = await supabase.from('website_orders').insert({
      order_id: order.id,
      user_email: email,
      course_ids: courseIds,
      total_amount: amount,
      status: 'CREATED',
    });

    if (supabaseError) throw new Error(`Supabase Error: ${supabaseError.message}`);

    return res.status(200).json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ 
        error: error.message || 'Unknown error during order creation',
        status: 'error'
    });
  }
}
