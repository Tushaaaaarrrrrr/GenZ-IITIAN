import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Validate Environment Variables
  const key_id = process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET;
  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  const { email, courseIds } = req.body;

  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ error: 'At least one course ID is required' });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const supabase = createClient(supabase_url, service_role);

    // 2. FETCH REAL PRICES FROM SUPABASE (SECURITY)
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('id, price, discountPrice')
      .in('id', courseIds);

    if (courseError || !courses || courses.length === 0) {
      throw new Error(`Invalid courses: ${courseError?.message || 'No courses found'}`);
    }

    // 3. CALCULATE SECURE TOTAL
    const totalAmount = courses.reduce((sum, course) => {
      // Use discountPrice if it exists and is > 0, otherwise use price
      const priceToUse = (course.discountPrice && course.discountPrice > 0) 
        ? course.discountPrice 
        : course.price;
      return sum + Number(priceToUse);
    }, 0);

    if (totalAmount <= 0) {
      throw new Error('Calculated amount must be greater than zero');
    }

    // 4. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // 5. Log the order in Supabase
    const { error: supabaseError } = await supabase.from('website_orders').insert({
      order_id: order.id,
      user_email: email,
      course_ids: courseIds,
      total_amount: totalAmount, // Log the SECURELY calculated amount
      status: 'CREATED',
    });

    if (supabaseError) throw new Error(`Supabase Error: ${supabaseError.message}`);

    return res.status(200).json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ 
        error: error.message || 'Unknown error during order creation'
    });
  }
}
