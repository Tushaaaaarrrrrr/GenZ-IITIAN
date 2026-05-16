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

const resolveSelectedPricingTier = ({
  pricingOptions,
  selectedPricingTierIndex,
  selectedPricingTierName,
  selectedPricingTierPrice,
  selectedClassType,
  requestedAmount,
  coinsToApply,
}: {
  pricingOptions: any[];
  selectedPricingTierIndex?: number | string;
  selectedPricingTierName?: string;
  selectedPricingTierPrice?: number | string;
  selectedClassType?: string;
  requestedAmount?: number | string;
  coinsToApply?: number | string;
}) => {
  if (!Array.isArray(pricingOptions) || pricingOptions.length === 0) return null;

  const tierIndex = Number(selectedPricingTierIndex);
  if (Number.isInteger(tierIndex) && tierIndex >= 0 && tierIndex < pricingOptions.length) {
    return pricingOptions[tierIndex];
  }

  const tierName = typeof selectedPricingTierName === 'string' ? selectedPricingTierName.trim().toLowerCase() : '';
  if (tierName) {
    const byName = pricingOptions.find((tier: any) => String(tier.name || '').trim().toLowerCase() === tierName);
    if (byName) return byName;
  }

  const tierPrice = Number(selectedPricingTierPrice);
  if (Number.isFinite(tierPrice) && tierPrice > 0) {
    const priceMatches = pricingOptions.filter((tier: any) => Number(tier.price) === tierPrice);
    const typeMatches = selectedClassType
      ? priceMatches.filter((tier: any) => String(tier.type || '').toLowerCase() === String(selectedClassType).toLowerCase())
      : priceMatches;
    if (typeMatches.length === 1) return typeMatches[0];
    if (priceMatches.length === 1) return priceMatches[0];
  }

  const requestedTierPrice = Number(requestedAmount) + Number(coinsToApply || 0);
  if (Number.isFinite(requestedTierPrice) && requestedTierPrice > 0) {
    const amountMatches = pricingOptions.filter((tier: any) => Number(tier.price) === requestedTierPrice);
    const typeMatches = selectedClassType
      ? amountMatches.filter((tier: any) => String(tier.type || '').toLowerCase() === String(selectedClassType).toLowerCase())
      : amountMatches;
    if (typeMatches.length === 1) return typeMatches[0];
    if (amountMatches.length === 1) return amountMatches[0];
  }

  if (selectedClassType) {
    const classTypeMatches = pricingOptions.filter((tier: any) => (
      String(tier.type || '').toLowerCase() === String(selectedClassType).toLowerCase()
    ));
    if (classTypeMatches.length === 1) return classTypeMatches[0];
  }

  return null;
};

const insertWebsiteOrder = async (supabase: any, orderPayload: Record<string, any>) => {
  const { error } = await supabase.from('website_orders').insert(orderPayload);
  if (!error) return null;

  if (error.code === 'PGRST204' && error.message?.includes('selected_class_type')) {
    const { selected_class_type, ...fallbackPayload } = orderPayload;
    console.warn('[website_orders] selected_class_type column is missing; inserting order without it.');
    const { error: fallbackError } = await supabase.from('website_orders').insert(fallbackPayload);
    return fallbackError || null;
  }

  return error;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const razorpay = getRazorpay();
    const {
      amount,
      email,
      courseIds,
      bundleId,
      discountCode,
      referralCode,
      coinsToApply,
      selectedClassType,
      selectedPricingTierIndex,
      selectedPricingTierName,
      selectedPricingTierPrice,
    } = req.body || {};

    if (!email || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: 'Email and at least one course ID are required' });
    }

    let totalAmount = 0;
    let totalOriginalPrice = 0;
    let discountApplied = false;
    let referrerEmail: string | null = null;
    let referralDiscount = 0;
    let orderClassType: string | null = selectedClassType || null;

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

      const validBundleCourseIds = bundleSubCourses.flatMap((bc: any) => [bc.courseId, bc.courseId2, bc.courseId3].filter(Boolean));
      
      // Fixed bundle enforcement
      if (bundle.isFixedBundle) {
        const allBundleCoursesSelected = validBundleCourseIds.every((id: string) => courseIds.includes(id));
        if (!allBundleCoursesSelected || courseIds.length !== validBundleCourseIds.length) {
            return res.status(400).json({ error: 'This is a fixed bundle. You must purchase all courses.' });
        }
      }

      const invalidSelections = courseIds.filter((courseId: string) => !validBundleCourseIds.includes(courseId));
      if (invalidSelections.length > 0) {
        return res.status(400).json({ error: 'Some course IDs do not belong to this bundle' });
      }

      // 1. Calculate Raw Subtotal
      // Fixed bundles with pricing tiers must be priced from the selected tier.
      // Their child course prices may intentionally be 0.
      if (bundle.isFixedBundle && Array.isArray(bundle.pricing_options) && bundle.pricing_options.length > 0) {
        const selectedTier = resolveSelectedPricingTier({
          pricingOptions: bundle.pricing_options,
          selectedPricingTierIndex,
          selectedPricingTierName,
          selectedPricingTierPrice,
          selectedClassType,
          requestedAmount: amount,
          coinsToApply,
        });
        if (selectedTier) {
          totalOriginalPrice = Number(selectedTier.price);
          if (!Number.isFinite(totalOriginalPrice) || totalOriginalPrice <= 0) {
            return res.status(400).json({ error: 'Invalid pricing tier price' });
          }
          orderClassType = selectedTier.type || selectedClassType || null;
        } else {
          return res.status(400).json({ error: 'Invalid pricing tier selected' });
        }
      } else {
        // Fallback: sum individual course prices (for non-fixed bundles)
        totalOriginalPrice = bundleSubCourses
          .filter((bc: any) => courseIds.includes(bc.courseId))
          .reduce((sum: number, bc: any) => sum + Number(bc.price || 0), 0);
      }

      totalAmount = totalOriginalPrice;

      // 2. Process Discount Code strictly if provided
      let couponSavings = 0;
      let refSavings = 0;

      if (discountCode) {
        const codeToApply = String(discountCode).trim().toUpperCase();
        const isAllSelected = validBundleCourseIds.every((id: string) => courseIds.includes(id));
        
        // Handle bundle-specific discount code
        if (bundle.bundleDiscountCode && codeToApply === String(bundle.bundleDiscountCode).trim().toUpperCase()) {
            if (isAllSelected) {
               const bPrice = bundle.bundleDiscountPrice || totalOriginalPrice;
               couponSavings = Math.max(totalOriginalPrice - bPrice, 0);
            } else {
               return res.status(400).json({ error: 'This code requires all courses in the bundle to be selected.' });
            }
        } else {
            // Check global coupons
            const { data: coupon } = await supabase.from('discount_coupons').select('*').eq('code', codeToApply).maybeSingle();
            if (coupon) {
                // Usage check
                const { data: usage } = await supabase.from('coupon_uses').select('*').eq('code', codeToApply).eq('user_email', email).maybeSingle();
                if (!usage) {
                    if (coupon.applies_to === 'ALL' || coupon.applies_to.trim().toLowerCase() === bundleId.trim().toLowerCase()) {
                        couponSavings = coupon.discount_percentage
                            ? Math.floor(totalAmount * (coupon.discount_percentage / 100))
                            : (coupon.discount_amount || 0);
                    }
                }
            }
        }
      }

      if (referralCode && !discountCode) {
        const rProfile = await supabase.from('referral_profiles').select('email').eq('referral_code', referralCode.toUpperCase()).maybeSingle();
        if (rProfile.data && rProfile.data.email.toLowerCase() !== email.toLowerCase()) {
            refSavings = Math.floor(totalAmount * 0.05);
            referrerEmail = rProfile.data.email;
        }
      }

      // 3. APPLY DISCOUNTS (SINGLE DISCOUNT ENFORCEMENT)
      // Mirroring frontend: Priority is given to the discountCode if provided.
      let finalDiscount = 0;
      if (discountCode) {
        finalDiscount = couponSavings;
      } else {
        finalDiscount = refSavings;
      }

      totalAmount = Math.max(totalOriginalPrice - finalDiscount, 0);
      discountApplied = finalDiscount > 0;
      referralDiscount = refSavings;

    } else {
      // Logic for single course purchases remains mostly same
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, price, discountPrice')
        .in('id', courseIds);

      if (coursesError || !courses || courses.length === 0) {
        return res.status(400).json({ error: 'Invalid course IDs' });
      }

      totalOriginalPrice = courses.reduce((sum: number, course: any) => sum + Number(course.price || 0), 0);
      totalAmount = courses.reduce((sum: number, course: any) => {
        const effectivePrice = course.discountPrice && Number(course.discountPrice) > 0 ? Number(course.discountPrice) : Number(course.price || 0);
        return sum + effectivePrice;
      }, 0);

      // Handle Coupons/Referrals for standalone courses (SINGLE DISCOUNT ENFORCEMENT)
      if (discountCode) {
        const codeToApply = String(discountCode).trim().toUpperCase();
        const { data: coupon } = await supabase.from('discount_coupons').select('*').eq('code', codeToApply).maybeSingle();
        if (coupon) {
             const { data: usage } = await supabase.from('coupon_uses').select('*').eq('code', codeToApply).eq('user_email', email).maybeSingle();
             if (!usage && (coupon.applies_to === 'ALL' || courseIds.includes(coupon.applies_to))) {
                 const dVal = coupon.discount_percentage ? Math.floor(totalAmount * (coupon.discount_percentage / 100)) : (coupon.discount_amount || 0);
                 totalAmount = Math.max(totalAmount - dVal, 0);
                 discountApplied = true;
             }
        }
      } else if (referralCode) {
          const refResult = await supabase.from('referral_profiles').select('email').eq('referral_code', referralCode.toUpperCase()).maybeSingle();
          if (refResult.data && refResult.data.email.toLowerCase() !== email.toLowerCase()) {
              const rD = Math.floor(totalAmount * 0.05);
              totalAmount = Math.max(totalAmount - rD, 0);
              referrerEmail = refResult.data.email;
              referralDiscount = rD;
              discountApplied = true;
          }
      }
    }

    // --- COIN WALLET DEDUCTION ---
    let coinsApplied = 0;
    const MAX_COINS_PER_ORDER = 50;
    if (coinsToApply && coinsToApply > 0) {
      const { data: buyerReferral } = await supabase
        .from('referral_profiles')
        .select('wallet_balance')
        .eq('email', email)
        .maybeSingle();

      if (buyerReferral) {
        // Server-side enforcement: cap at 50 coins, actual balance, and keep cart ≥ ₹1
        const maxCoins = Math.min(MAX_COINS_PER_ORDER, buyerReferral.wallet_balance || 0, totalAmount - 1);
        coinsApplied = Math.min(coinsToApply, Math.max(maxCoins, 0));
        if (coinsApplied > 0) {
          totalAmount = totalAmount - coinsApplied;
        }
      }
    }

    if (totalAmount <= 0) totalAmount = 1;
    if (totalAmount < 1) {
      return res.status(400).json({ error: 'Total amount must be at least ₹1' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const insertError = await insertWebsiteOrder(supabase, {
      order_id: order.id,
      user_email: email,
      course_ids: courseIds,
      total_amount: totalAmount,
      original_amount: totalOriginalPrice,
      discount_amount: totalOriginalPrice - totalAmount,
      status: 'CREATED',
      discount_code: discountCode || null,
      referral_code: referralCode || null,
      coins_applied: coinsApplied || 0,
      selected_class_type: orderClassType,
    });

    if (insertError) {
      throw insertError;
    }

    return res.status(200).json({
      ...order,
      _serverTotal: totalAmount,
      _discountApplied: discountApplied,
      _referralDiscount: referralDiscount,
      _coinsApplied: coinsApplied,
      _referrerEmail: referrerEmail,
    });
  } catch (error: any) {
    console.error('create-order error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
