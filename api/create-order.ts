import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server configuration error (missing Supabase keys)');
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

const getRazorpay = () => {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Server configuration error (missing Razorpay keys)');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const razorpay = getRazorpay();
    const { email, courseIds, bundleId, discountCode } = req.body || {};

    if (!email || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: 'Email and at least one course ID are required' });
    }

    let totalAmount = 0;
    let discountApplied = false;
    let isBundleDiscountUsed = false;

    if (bundleId) {
      const { data: bundle, error: bundleError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', bundleId)
        .eq('isBundle', true)
        .single();

      if (bundleError || !bundle) {
        return res.status(400).json({ error: 'Invalid bundle ID' });
      }

      const bundleSubCourses = Array.isArray(bundle.bundleCourses) ? bundle.bundleCourses : [];
      if (bundleSubCourses.length === 0) {
        return res.status(400).json({ error: 'Bundle has no courses' });
      }

      const validBundleCourseIds = bundleSubCourses.map((bc: any) => bc.courseId);
      const invalidSelections = courseIds.filter((courseId: string) => !validBundleCourseIds.includes(courseId));
      if (invalidSelections.length > 0) {
        return res.status(400).json({ error: 'Some course IDs do not belong to this bundle' });
      }

      if (
        discountCode &&
        bundle.bundleDiscountCode &&
        discountCode.trim().toUpperCase() === String(bundle.bundleDiscountCode).trim().toUpperCase()
      ) {
        const allBundleCoursesSelected = validBundleCourseIds.every((courseId: string) => courseIds.includes(courseId));
        if (!allBundleCoursesSelected) {
          return res.status(400).json({ error: 'Bundle discount requires all courses to be selected' });
        }

        isBundleDiscountUsed = true;
        totalAmount = Number(bundle.bundleDiscountPrice || 0);
        discountApplied = true;
      }

      if (!isBundleDiscountUsed) {
        totalAmount = bundleSubCourses
          .filter((bc: any) => courseIds.includes(bc.courseId))
          .reduce((sum: number, bc: any) => sum + Number(bc.price || 0), 0);
      }
    } else {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, price, discountPrice')
        .in('id', courseIds);

      if (coursesError || !courses || courses.length === 0) {
        return res.status(400).json({ error: 'Invalid course IDs' });
      }

      totalAmount = courses.reduce((sum: number, course: any) => {
        const effectivePrice =
          course.discountPrice && Number(course.discountPrice) > 0
            ? Number(course.discountPrice)
            : Number(course.price || 0);
        return sum + effectivePrice;
      }, 0);
    }

    if (discountCode && !isBundleDiscountUsed) {
      const codeToApply = String(discountCode).trim().toUpperCase();
      const { data: coupon, error: couponError } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', codeToApply)
        .single();

      if (couponError || !coupon) {
        return res.status(400).json({ error: 'Invalid discount code' });
      }

      const { data: usage } = await supabase
        .from('coupon_uses')
        .select('*')
        .eq('code', codeToApply)
        .eq('user_email', email)
        .maybeSingle();

      if (usage) {
        return res.status(400).json({ error: 'Discount code already used' });
      }

      if (coupon.applies_to !== 'ALL') {
        const targetId = String(coupon.applies_to || '').trim().toLowerCase();
        const matchesSelectedCourse = courseIds.some((courseId: string) => courseId.trim().toLowerCase() === targetId);
        const matchesCurrentBundle = bundleId && String(bundleId).trim().toLowerCase() === targetId;

        if (!matchesSelectedCourse && !matchesCurrentBundle) {
          return res.status(400).json({ error: 'Discount code does not apply to selection' });
        }
      }

      const discountValue = coupon.discount_percentage
        ? Math.floor(totalAmount * (Number(coupon.discount_percentage) / 100))
        : Number(coupon.discount_amount || 0);

      totalAmount = Math.max(totalAmount - discountValue, 0);
      discountApplied = true;
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Total amount must be greater than zero' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const { error: insertError } = await supabase.from('website_orders').insert({
      order_id: order.id,
      user_email: email,
      course_ids: courseIds,
      total_amount: totalAmount,
      status: 'CREATED',
    });

    if (insertError) {
      throw insertError;
    }

    return res.status(200).json({
      ...order,
      _serverTotal: totalAmount,
      _discountApplied: discountApplied,
    });
  } catch (error: any) {
    console.error('create-order error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
