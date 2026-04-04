import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiService } from '../lib/api';

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export default function Cart() {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const { user, profile, openLoginModal } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing Order...");
  const navigate = useNavigate();

  // Discount logic states
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const applyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    if (!user) {
      openLoginModal();
      return;
    }
    setIsApplyingDiscount(true);
    setDiscountError('');
    try {
      const codeToApply = discountCodeInput.trim().toUpperCase();
      // 1. Check if it exists
      const { data: coupon, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', codeToApply)
        .single();
      
      if (error || !coupon) throw new Error('Invalid or expired discount code.');

      // 2. Check if user already used it
      const { data: usage } = await supabase
        .from('coupon_uses')
        .select('*')
        .eq('code', coupon.code)
        .eq('user_email', user.email)
        .maybeSingle();
      
      if (usage) throw new Error('You have already used this discount code.');

      // 3. Check if applies to these courses
      if (coupon.applies_to !== 'ALL') {
        const hasValidCourse = cart.some(item => item.id === coupon.applies_to);
        if (!hasValidCourse) throw new Error(`This code doesn't apply to the selected courses.`);
      }

      // 4. Calculate discount
      let calculatedDiscount = 0;
      if (coupon.discount_percentage) {
        calculatedDiscount = Math.floor(total * (coupon.discount_percentage / 100));
      } else if (coupon.discount_amount) {
        calculatedDiscount = coupon.discount_amount;
      }

      if (calculatedDiscount > total) calculatedDiscount = total;

      setDiscountAmount(calculatedDiscount);
      setAppliedDiscountCode(coupon.code);
      setDiscountCodeInput('');
    } catch (err: any) {
      setDiscountError(err.message);
      setDiscountAmount(0);
      setAppliedDiscountCode(null);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscountCode(null);
    setDiscountAmount(0);
    setDiscountError('');
  };

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    // Ask for name if missing at checkout
    let finalName = profile?.name;
    if (!finalName) {
      const promptedName = window.prompt("Please enter your full name for the certificate:");
      if (!promptedName) return;
      finalName = promptedName;
      
      // Sync this name back to profile
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: finalName
        });
      } catch (err) {
        console.warn('Profile update failed:', err);
      }
    }

    setIsProcessing(true);
    setLoadingMessage("Preparing Checkout...");
    try {
      const orderData = await apiService.createOrder({
        amount: Math.max(total - discountAmount, 0), // Backend will recalculate, this is mostly ignored
        email: user.email,
        courseIds: cart.flatMap((item) => 
          item.isBundle && item.bundleCourses && item.bundleCourses.length > 0
            ? item.bundleCourses.map(b => b.courseId)
            : [item.id]
        ),
        discountCode: appliedDiscountCode || undefined, // Pass global discount code
      });
      if (!orderData.id) throw new Error("Order creation failed");

      const scriptLoaded = await loadScript(RAZORPAY_SCRIPT_URL);
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "GenZ IITIAN",
        description: `Enrollment in ${cart.length} Courses`,
        order_id: orderData.id,
        handler: async (response: any) => {
          setIsProcessing(true);
          setLoadingMessage("Processing your payment, please wait...");
          try {
            // Verify payment
            await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: user.email,
              courseIds: cart.flatMap((item) => 
                item.isBundle && item.bundleCourses && item.bundleCourses.length > 0
                  ? item.bundleCourses.map(b => b.courseId)
                  : [item.id]
              ),
              discountCode: appliedDiscountCode || undefined,
            });

            clearCart();
            navigate("/payment-success");
          } catch (err) {
            console.error("Payment verification error:", err);
            navigate("/payment-failed");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            navigate("/payment-failed");
          }
        },
        prefill: {
          name: finalName || "",
          email: user.email,
        },
        theme: { color: "#0b1120" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      navigate("/payment-failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-6">
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0b1120]/80 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-white border-[4px] border-[#0b1120] rounded-2xl p-6 shadow-[10px_10px_0px_#3b82f6]"
            >
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-black text-[#0b1120] mb-4">{loadingMessage}</h2>
              <p className="text-gray-500 font-bold leading-relaxed">
                Please do not refresh or change the tab <br />
                while we confirm your order.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between border-b-[4px] border-[#0b1120] pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#0b1120] mb-1">Your Cart</h1>
            <p className="text-base text-gray-500 font-bold tracking-tight">Ready to level up your skills?</p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm font-black text-gray-400">
            <ShieldCheck className="w-5 h-5 text-green-500" /> Secure Checkout
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-white border-[3px] border-dashed border-gray-200 rounded-2xl">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-[#0b1120] mb-2">Your cart is empty</h3>
            <p className="text-gray-500 font-bold text-sm mb-8">Don't let your future wait. Pick a course and start learning.</p>
            <Link to="/courses" className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#0b1120] text-white rounded-xl font-black text-lg border-[3px] border-[#0b1120] shadow-[5px_5px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all">
              Browse Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-4 flex gap-4 items-center shadow-[6px_6px_0px_#0b1120]"
                  >
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-2xl border-2 border-[#0b1120] overflow-hidden flex-shrink-0">
                      <img src={item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300'} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-black text-[#0b1120] mb-1">{item.name}</h3>
                      <div className="text-xl font-black text-[#10b981]">₹{item.price}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1 sticky top-24">
              <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[8px_8px_0px_#0b1120]">
                <h3 className="text-lg font-black text-[#0b1120] mb-6 border-b-2 border-gray-100 pb-3">Order Summary</h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between font-bold text-gray-500 text-sm">
                    <span>Items ({cart.length})</span>
                    <span>₹{total}</span>
                  </div>

                  {/* Discount Applier */}
                  <div className="py-2 border-t border-b border-gray-100 my-4">
                    {!appliedDiscountCode ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Discount Code" 
                            value={discountCodeInput}
                            onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                            className="flex-grow px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg font-black text-sm outline-none focus:border-[#10b981] uppercase placeholder:normal-case"
                          />
                          <button 
                            onClick={applyDiscount}
                            disabled={isApplyingDiscount || !discountCodeInput.trim()}
                            className="px-4 py-2 bg-[#0b1120] text-white rounded-lg font-black text-xs hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {isApplyingDiscount ? 'WAIT...' : 'APPLY'}
                          </button>
                        </div>
                        {discountError && <p className="text-red-500 font-bold text-[10px] uppercase">{discountError}</p>}
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-black text-green-600 uppercase">Discount Applied!</div>
                          <div className="text-sm font-black text-[#0b1120] font-mono tracking-widest">{appliedDiscountCode}</div>
                        </div>
                        <button onClick={removeDiscount} className="text-[10px] font-black text-red-500 hover:underline uppercase">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between font-bold text-gray-500 text-sm">
                    <span>Discount</span>
                    <span className="text-green-600">-₹{discountAmount}</span>
                  </div>
                  <div className="h-0.5 bg-gray-100 my-3" />
                  <div className="flex justify-between items-end">
                    <span className="font-black text-[#0b1120] text-sm">Total</span>
                    <span className="text-2xl font-black text-[#0b1120]">₹{Math.max(total - discountAmount, 0)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#10b981] text-[#0b1120] rounded-xl font-black text-lg border-[3px] border-[#0b1120] shadow-[5px_5px_0px_#0b1120] flex items-center justify-center gap-2.5 hover:shadow-none hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>Checkout Now <ArrowRight className="w-5 h-5" /></>
                  )}
                </motion.button>

                <p className="mt-8 text-center text-xs font-black text-gray-400 leading-relaxed uppercase tracking-widest">
                  By clicking checkout, you agree to our <br /> Terms and Conditions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
