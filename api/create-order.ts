import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Validate Environment Variables
  const key_id = process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET;
  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key_id || !key_secret || !supabase_url || !service_role) {
    return res.status(500).json({ 
      error: 'Server configuration error (missing env vars)',
      details: {
        razorpay: !!(key_id && key_secret),
        supabase: !!(supabase_url && service_role)
      }
    });
  }

  const { email, courseIds, bundleId, discountCode } = req.body;

  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ error: 'At least one course ID is required' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const supabase = createClient(supabase_url, service_role);

    let totalAmount = 0;
    let discountApplied = false;
    let isBundleDiscountUsed = false;
    let validBundleCourseIds: string[] = [];

    // ─── BUNDLE FLOW ───
    if (bundleId) {
      // Fetch the parent bundle from the database (source of truth)
      const { data: bundle, error: bundleError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', bundleId)
        .eq('isBundle', true)
        .single();

      if (bundleError || !bundle) {
        return res.status(400).json({ error: 'Invalid bundle ID' });
      }

      const bundleSubCourses: { courseId: string; price: number }[] = bundle.bundleCourses || [];
      
      if (bundleSubCourses.length === 0) {
        return res.status(400).json({ error: 'Bundle has no courses configured' });
      }

      // Validate that all submitted courseIds belong to this bundle
      validBundleCourseIds = bundleSubCourses.map(bc => bc.courseId);
      const invalidIds = courseIds.filter((id: string) => !validBundleCourseIds.includes(id));
      
      if (invalidIds.length > 0) {
        return res.status(400).json({ error: 'Some course IDs do not belong to this bundle' });
      }

      // Check if code matches bundle discount
      if (discountCode && discountCode.trim() !== '') {
        const dbCode = bundle.bundleDiscountCode;
        const dbDiscountPrice = bundle.bundleDiscountPrice;

        if (dbCode && dbDiscountPrice && discountCode.trim().toUpperCase() === dbCode.toUpperCase()) {
          const allSelected = validBundleCourseIds.every((id: string) => courseIds.includes(id));
          if (!allSelected) {
            return res.status(400).json({ 
              error: 'Bundle discount code requires all courses in the bundle to be selected' 
            });
          }
          isBundleDiscountUsed = true;
          totalAmount = Number(dbDiscountPrice);
          discountApplied = true;
        }
      }
      
      if (!isBundleDiscountUsed) {
        // No valid bundle discount — sum individual bundle prices
        totalAmount = bundleSubCourses
          .filter(bc => courseIds.includes(bc.courseId))
          .reduce((sum, bc) => sum + Number(bc.price), 0);
      }

    // ─── SINGLE COURSE FLOW (non-bundle) ───
    } else {
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('id, price, discountPrice')
        .in('id', courseIds);

      if (courseError || !courses || courses.length === 0) {
        return res.status(400).json({ error: 'Invalid course IDs' });
      }

      totalAmount = courses.reduce((sum, course) => {
        const priceToUse = (course.discountPrice && course.discountPrice > 0) 
          ? course.discountPrice 
          : course.price;
        return sum + Number(priceToUse);
      }, 0);
    }

    // ─── GLOBAL DISCOUNT COUPON CHECK ───
    if (discountCode && discountCode.trim() !== '' && !isBundleDiscountUsed) {
      const codeToApply = discountCode.trim().toUpperCase();
      const { data: coupon, error: couponError } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', codeToApply)
        .single();
      
      if (!couponError && coupon) {
         // Check uses
         const { data: usage } = await supabase
            .from('coupon_uses')
            .select('*')
            .eq('code', codeToApply)
            .eq('user_email', email)
            .maybeSingle();
            
         if (usage) {
             return res.status(400).json({ error: 'Discount code already used by this user' });
         }

         // Check applies_to
         if (coupon.applies_to !== 'ALL') {
            const hasAppliesTo = courseIds.includes(coupon.applies_to);
            if (!hasAppliesTo) {
               return res.status(400).json({ error: 'Discount code does not apply to selected courses' });
            }
         }

         // Apply discount
         let calculatedDiscount = 0;
         if (coupon.discount_percentage) {
             calculatedDiscount = Math.floor(totalAmount * (coupon.discount_percentage / 100));
         } else if (coupon.discount_amount) {
             calculatedDiscount = coupon.discount_amount;
         }

         totalAmount = Math.max(totalAmount - calculatedDiscount, 0);
         discountApplied = true;
      } else {
          // It didn't match bundle code, and didn't match global code
          return res.status(400).json({ error: 'Invalid discount code' });
      }
    }

    // ─── FINAL VALIDATION ───
    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Calculated amount must be greater than zero' });
    }

    // ─── CREATE RAZORPAY ORDER ───
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // ─── LOG ORDER IN SUPABASE ───
    const { error: supabaseError } = await supabase.from('website_orders').insert({
      order_id: order.id,
      user_email: email,
      course_ids: courseIds,
      total_amount: totalAmount,
      status: 'CREATED',
    });

    if (supabaseError) {
      console.error('Supabase logging error:', supabaseError.message);
      // Don't fail the order just because logging failed
    }

    return res.status(200).json({
      ...order,
      _serverTotal: totalAmount, // Send back so frontend can display the confirmed price
      _discountApplied: discountApplied,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Unknown error during order creation'
    });
  }
}
