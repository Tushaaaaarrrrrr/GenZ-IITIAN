import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export default function Cart() {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const { user, profile, openLoginModal } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

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
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email: user.email,
          courseIds: cart.flatMap((item) => 
            item.isBundle && item.bundleCourses && item.bundleCourses.length > 0
              ? item.bundleCourses.map(b => b.courseId)
              : [item.id]
          ),
        }),
      });

      const orderData = await res.json();
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
          // Verify payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: user.email,
              courseIds: cart.flatMap((item) => 
                item.isBundle && item.bundleCourses && item.bundleCourses.length > 0
                  ? item.bundleCourses.map(b => b.courseId)
                  : [item.id]
              ),
            }),
          });

          if (verifyRes.ok) {
            clearCart();
            window.location.href = "/profile?status=success";
          } else {
            alert("Payment verification failed. Please contact support.");
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
      alert(err.message || "An error occurred during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between border-b-[6px] border-[#0b1120] pb-8 mb-12">
          <div>
            <h1 className="text-5xl font-black text-[#0b1120] mb-2">Your Cart</h1>
            <p className="text-xl text-gray-500 font-bold tracking-tight">Ready to level up your skills?</p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm font-black text-gray-400">
            <ShieldCheck className="w-5 h-5 text-green-500" /> Secure Checkout
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white border-[4px] border-dashed border-gray-200 rounded-[3rem]">
            <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-[#0b1120] mb-4">Your cart is empty</h3>
            <p className="text-gray-500 font-bold mb-10">Don't let your future wait. Pick a course and start learning.</p>
            <Link to="/courses" className="inline-flex items-center gap-3 px-10 py-5 bg-[#0b1120] text-white rounded-2xl font-black text-xl border-[4px] border-[#0b1120] shadow-[8px_8px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all">
              Browse Courses <ArrowRight className="w-6 h-6" />
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
                    className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-6 flex gap-6 items-center shadow-[8px_8px_0px_#0b1120]"
                  >
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-100 rounded-3xl border-2 border-[#0b1120] overflow-hidden flex-shrink-0">
                      <img src={item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300'} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl lg:text-2xl font-black text-[#0b1120] mb-2">{item.name}</h3>
                      <div className="text-2xl font-black text-[#10b981]">₹{item.price}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors shrink-0">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1 sticky top-32">
              <div className="bg-white border-[4px] border-[#0b1120] rounded-[3rem] p-10 shadow-[12px_12px_0px_#0b1120]">
                <h3 className="text-2xl font-black text-[#0b1120] mb-8 border-b-2 border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between font-bold text-gray-500">
                    <span>Items ({cart.length})</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-500">
                    <span>Discount</span>
                    <span className="text-green-600">₹0</span>
                  </div>
                  <div className="h-0.5 bg-gray-100 my-4" />
                  <div className="flex justify-between items-end">
                    <span className="font-black text-[#0b1120]">Total</span>
                    <span className="text-4xl font-black text-[#0b1120]">₹{total}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                  onClick={handleCheckout}
                  className="w-full py-5 bg-[#10b981] text-[#0b1120] rounded-2xl font-black text-xl border-[4px] border-[#0b1120] shadow-[8px_8px_0px_#0b1120] flex items-center justify-center gap-3 hover:shadow-none hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
                  ) : (
                    <>Checkout Now <ArrowRight className="w-6 h-6" /></>
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
