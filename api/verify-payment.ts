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
      referralCode,
      coinsToApply,
      coinsApplied, // Keep both for backwards compatibility during deploys
    } = req.body || {};

    const actualCoinsApplied = coinsToApply !== undefined ? coinsToApply : (coinsApplied || 0);

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
      .select('id, name, phone, gender')
      .eq('email', email)
      .single();

    const lmsEnrollUrl = process.env.LMS_ENROLL_URL || 'https://class.genziitian.in/api/external-purchase';
    const externalEnrollSecret = process.env.EXTERNAL_ENROLL_SECRET;

    // === STEP 1: LMS ENROLLMENT (isolated — failures here must NOT block referral/coin processing) ===
    // Fetch course details for class types
    const { data: coursesData } = await supabase.from('courses').select('id, class_type').in('id', courseIds);
    const courseDetails = courseIds.map(id => ({
      type: (coursesData?.find(c => c.id === id)?.class_type || 'recorded').toUpperCase()
    }));

    // Fetch order details for pricing
    const { data: orderData } = await supabase.from('website_orders').select('total_amount, created_at').eq('order_id', razorpay_order_id).single();

    let lmsEnrollmentSucceeded = false;
    try {
      const lmsRes = await fetch(lmsEnrollUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: externalEnrollSecret,
          email,
          name: profile?.name || 'Student',
          phone: profile?.phone || 'N/A',
          gender: profile?.gender || 'MALE',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          purchasedAt: orderData?.created_at || new Date().toISOString(),
          finalPrice: orderData?.total_amount || 0,
          courseIds,
          courseDetails
        }),
      });

      if (!lmsRes.ok) {
        throw new Error(await lmsRes.text());
      }

      lmsEnrollmentSucceeded = true;

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

    // === STEP 2: RECORD COUPON USAGE (runs regardless of LMS result) ===
    if (discountCode) {
      try {
        await supabase.from('coupon_uses').insert({
          code: discountCode,
          user_email: email,
          order_id: razorpay_order_id,
        });
      } catch (couponErr) {
        console.error('Coupon usage tracking error (non-fatal):', couponErr);
      }
    }

    // === STEP 3: REFERRAL REWARD PROCESSING (runs regardless of LMS result) ===
    if (referralCode) {
      try {
        console.log(`[Referral] Processing code: ${referralCode} for buyer: ${email}`);
        const codeToCheck = String(referralCode).trim().toUpperCase();
        const { data: referrerProfile, error: rpErr } = await supabase
          .from('referral_profiles')
          .select('*')
          .eq('referral_code', codeToCheck)
          .maybeSingle();

        if (rpErr) throw rpErr;

        if (!referrerProfile) {
          console.log(`[Referral] Code ${codeToCheck} not found in referral_profiles.`);
        } else if (referrerProfile.email.toLowerCase() === email.toLowerCase()) {
          console.log(`[Referral] Buyer ${email} is using their own code. Skipping reward.`);
        } else {
          console.log(`[Referral] Match found. Referrer: ${referrerProfile.email}`);
          const { data: orderRow, error: orderErr } = await supabase
            .from('website_orders')
            .select('total_amount, original_amount, discount_amount')
            .eq('order_id', razorpay_order_id)
            .single();

          if (orderErr) throw orderErr;
          if (!orderRow) {
            throw new Error(`Order not found for referral processing: ${razorpay_order_id}`);
          }

          const finalPrice = orderRow.total_amount || 0;
          const originalPrice = orderRow.original_amount || finalPrice;
          const buyerDiscount = orderRow.discount_amount || 0;
          const referrerReward = Math.floor(finalPrice * 0.05); // 5% of what was paid

          const newBalance = (referrerProfile.wallet_balance || 0) + referrerReward;
          const newLifetime = (referrerProfile.lifetime_referrals || 0) + 1;
          const newQuarterly = (referrerProfile.quarterly_referrals || 0) + 1;

          const { data: milestones, error: msErr } = await supabase
            .from('referral_milestones')
            .select('*')
            .order('referrals_required', { ascending: true });

          if (msErr) throw msErr;

          let milestoneBonus = 0;
          if (milestones) {
            for (const ms of milestones) {
              if (newQuarterly >= ms.referrals_required && (referrerProfile.quarterly_referrals || 0) < ms.referrals_required) {
                milestoneBonus += ms.bonus_coins;
                console.log(`[Referral] Milestone hit! Bonus: ${ms.bonus_coins}`);
              }
            }
          }

          console.log(`[Referral] Rewarding ${referrerReward + milestoneBonus} coins to ${referrerProfile.email}`);

          const { error: updateErr } = await supabase
            .from('referral_profiles')
            .update({
              wallet_balance: newBalance + milestoneBonus,
              lifetime_referrals: newLifetime,
              quarterly_referrals: newQuarterly,
            })
            .eq('id', referrerProfile.id);

          if (updateErr) throw updateErr;

          const { error: txnErr } = await supabase.from('referral_transactions').insert({
            referrer_email: referrerProfile.email,
            buyer_email: email,
            referral_code: codeToCheck,
            order_id: razorpay_order_id,
            original_price: originalPrice,
            buyer_discount: buyerDiscount,
            final_price: finalPrice,
            referrer_reward: referrerReward + milestoneBonus,
            coins_used: actualCoinsApplied,
          });

          if (txnErr) throw txnErr;
          console.log(`[Referral] Successfully logged transaction.`);
        }
      } catch (referralErr) {
        console.error('Referral processing error (non-fatal):', referralErr);
      }
    }

    // === STEP 4: DEDUCT BUYER COINS (runs regardless of LMS result) ===
    if (actualCoinsApplied && actualCoinsApplied > 0) {
      try {
        const { data: buyerRef } = await supabase
          .from('referral_profiles')
          .select('wallet_balance')
          .eq('email', email)
          .maybeSingle();

        if (buyerRef) {
          const newBal = Math.max((buyerRef.wallet_balance || 0) - actualCoinsApplied, 0);
          await supabase
            .from('referral_profiles')
            .update({ wallet_balance: newBal })
            .eq('email', email);
        }
      } catch (coinErr) {
        console.error('Coin deduction error (non-fatal):', coinErr);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('verify-payment error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
