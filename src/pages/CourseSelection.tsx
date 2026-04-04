import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Check, Loader2, ShieldCheck, AlertCircle, User, UserCheck, CreditCard, ArrowRight, BookOpen } from 'lucide-react';

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface SubCourse {
  courseId: string;
  courseName: string;
  price: number;
}

import { CheckCircle2, Star, Quote } from 'lucide-react';

export default function CourseSelection() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, loading: authLoading, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing Enrollment...");
  const [step, setStep] = useState<'profile' | 'selection'>('selection');
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  // Discount Logic
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    gender: '',
    phone: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      openLoginModal();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (profile) {
      setProfileData({
          name: profile.name || '',
          gender: profile.gender || '',
          phone: profile.phone || ''
      });
      
      // If user has existing data, show prompt to confirm
      if (profile.name && profile.gender && profile.phone) {
        setShowProfilePrompt(true);
        setStep('selection');
      } else {
        setStep('profile');
      }
    }
  }, [profile]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
      if (error) throw error;
      setCourse(data);
      
      // Auto-select all if single course, or let user pick if bundle
      if (!data.isBundle && data.bundleCourses?.length > 0) {
          // Fallback if schema is inconsistent but bundleCourses exist
          setSelectedCourses(data.bundleCourses.map((bc: any) => bc.courseId));
      } else if (!data.isBundle) {
          setSelectedCourses([data.id]);
      } else {
          // Pre-select all by default for bundles too, users can uncheck
          setSelectedCourses(data.bundleCourses?.map((bc: any) => bc.courseId) || []);
      }
    } catch (err) {
      console.error(err);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileData.name || !profileData.gender || !profileData.phone) return;

    setIsProcessing(true);
    setLoadingMessage("Saving Profile...");
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        email: user?.email,
        name: profileData.name,
        gender: profileData.gender,
        phone: profileData.phone
      });
      if (error) throw error;
      setStep('selection');
      setShowProfilePrompt(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => {
      const next = prev.includes(courseId) 
        ? prev.filter(i => i !== courseId) 
        : [...prev, courseId];
      
      // Auto-revoke bundle discount if criteria broken
      if (course?.isBundle && appliedDiscountCode === course?.bundleDiscountCode) {
         const allIds = course.bundleCourses.map((bc: any) => bc.courseId);
         const isStillComplete = allIds.every((id: string) => next.includes(id));
         if (!isStillComplete) {
            setAppliedDiscountCode(null);
            setDiscountAmount(0);
         }
      }
      return next;
    });
  };

  const isAllBundleSelected = course?.isBundle && 
    course.bundleCourses?.every((bc: any) => selectedCourses.includes(bc.courseId));

  const calculateTotal = () => {
    if (!course) return 0;
    if (!course.isBundle) return course.discountPrice || course.price;
    
    return course.bundleCourses
      .filter((bc: SubCourse) => selectedCourses.includes(bc.courseId))
      .reduce((sum: number, bc: SubCourse) => sum + bc.price, 0);
  };

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
        const hasValidCourse = selectedCourses.includes(coupon.applies_to);
        if (!hasValidCourse) throw new Error(`This code doesn't apply to the selected courses.`);
      }

      const total = calculateTotal();

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
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3500);
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

  // Re-calculate discount if course selection changes
  useEffect(() => {
    if (appliedDiscountCode) {
       removeDiscount(); // Clear discount if sub-courses change to be safe
    }
  }, [selectedCourses, course]);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (selectedCourses.length === 0) {
      alert("Please select at least one course!");
      return;
    }

    setShowConfirmModal(true);
  };

  const proceedToPayment = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    setLoadingMessage("Preparing Checkout...");
    const total = calculateTotal();

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.max(total - discountAmount, 0),
          email: user?.email,
          courseIds: selectedCourses,
          discountCode: appliedDiscountCode || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server Error (${res.status}): ${text.slice(0, 100)}`);
      }

      const orderData = await res.json();
      if (!orderData.id) throw new Error("Order creation failed");

      const scriptLoaded = await loadScript(RAZORPAY_SCRIPT_URL);
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "GenZ IITIAN",
        description: `Enrollment in ${selectedCourses.length} Courses`,
        order_id: orderData.id,
        handler: async (response: any) => {
          setIsProcessing(true);
          setLoadingMessage("Processing your payment, please wait...");
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: user?.email,
                courseIds: selectedCourses,
                discountCode: appliedDiscountCode || undefined,
              }),
            });

            if (verifyRes.ok) {
              navigate("/payment-success");
            } else {
              navigate("/payment-failed");
            }
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
          name: profileData.name,
          email: user?.email,
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-6">
           <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
           <p className="font-black text-2xl text-[#0b1120] uppercase tracking-widest">Preparing Checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-6 px-6 text-[#0b1120]">
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
            className="bg-white border-[4px] border-[#0b1120] rounded-2xl p-5 md:p-6 flex flex-col items-center gap-4 shadow-[8px_8px_0px_#3b82f6] max-w-sm w-full mx-6"
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-[4px] border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-[4px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-[#0b1120] mb-1 uppercase tracking-tight">Processing Payment</h3>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Please don't close this window</p>
            </div>
          </motion.div>
          </motion.div>
        )}

        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-white border-[4px] border-[#0b1120] rounded-2xl p-4 shadow-[8px_8px_0px_#10b981] flex items-center gap-4 whitespace-nowrap"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center border-2 border-[#0b1120]">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="text-left pr-4">
              <h4 className="font-black text-[#0b1120] uppercase tracking-tight text-base">Discount Applied!</h4>
              <p className="font-bold text-gray-500 text-xs uppercase">Your savings are securely locked in</p>
            </div>
          </motion.div>
        )}

        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0b1120]/80 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-[4px] border-[#0b1120] rounded-2xl p-6 md:p-8 flex flex-col items-center gap-6 shadow-[8px_8px_0px_#10b981] max-w-sm w-full mx-6 text-left"
            >
              <div className="w-full">
                <h3 className="text-xl font-black text-[#0b1120] mb-4 uppercase tracking-tight text-center">Confirm Enrollment</h3>
                
                <div className="space-y-2 mb-4">
                    {course.isBundle ? (
                        course.bundleCourses.filter((bc: SubCourse) => selectedCourses.includes(bc.courseId)).map((bc: SubCourse) => (
                            <div key={bc.courseId} className="flex justify-between font-bold text-gray-600 text-sm">
                                <span>{bc.courseName}</span>
                                <span>₹{bc.price}</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-between font-bold text-gray-600 text-sm">
                            <span>{course.name}</span>
                            <span>₹{course.discountPrice || course.price}</span>
                        </div>
                    )}
                </div>

                <div className="h-0.5 bg-gray-200 mb-4" />

                {appliedDiscountCode && (
                    <div className="flex justify-between font-black text-green-600 text-sm mb-2 pb-2 border-b border-gray-100">
                        <span>Discount ({appliedDiscountCode})</span>
                        <span>-₹{discountAmount}</span>
                    </div>
                )}

                <div className="flex justify-between font-black text-xl text-[#0b1120] mb-6">
                    <span>Total You Pay</span>
                    <span>₹{Math.max(calculateTotal() - discountAmount, 0)}</span>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-[#0b1120] border-2 border-gray-300 rounded-xl font-black transition-colors hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={proceedToPayment}
                        className="flex-1 py-3 bg-[#10b981] text-white border-2 border-[#0b1120] rounded-xl font-black transition-colors hover:bg-[#059669]"
                    >
                        Pay ₹{Math.max(calculateTotal() - discountAmount, 0)}
                    </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
            <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">Complete <span className="text-blue-600">Enrollment</span></h1>
            <p className="text-sm lg:text-base text-gray-500 font-bold max-w-2xl mx-auto italic">You're just one step away from joining {course.name}. Follow the steps below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={() => { setStep('profile'); setShowProfilePrompt(false); }}
              className={`flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl border-[4px] transition-all w-full text-left ${step === 'profile' ? 'bg-blue-600 border-[#0b1120] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100'}`}
            >
                <User className="w-6 h-6" />
                <span className="font-black text-[10px] md:text-sm uppercase tracking-wider">Step 1: Profile</span>
            </button>
            <button 
              disabled={!profileData.name || !profileData.gender || !profileData.phone}
              onClick={() => setStep('selection')}
              className={`flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl border-[4px] transition-all w-full text-left ${step === 'selection' ? 'bg-blue-600 border-[#0b1120] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-white border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
                <BookOpen className="w-6 h-6" />
                <span className="font-black text-[10px] md:text-sm uppercase tracking-wider">Step 2: Selection</span>
            </button>
            <div className="md:col-span-2 bg-white border-2 border-dashed border-gray-300 rounded-xl p-3 lg:p-4 flex items-center justify-center border-[#0b1120]/10">
                <div className="flex items-center gap-2 text-gray-500 font-black text-sm lg:text-base">
                    <ShieldCheck className="w-6 h-6" />
                    Secure Checkout by Razorpay
                </div>
            </div>
        </div>

        <AnimatePresence mode="wait">
          {showProfilePrompt ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-[4px] border-[#0b1120] rounded-2xl p-8 lg:p-12 shadow-[12px_12px_0px_#10b981] text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center border-2 border-[#0b1120] mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-[#0b1120] mb-3">Welcome Back!</h2>
              <p className="text-lg text-gray-500 font-bold mb-8">
                We found your profile: <span className="text-[#0b1120]">{profileData.name}</span> ({profileData.phone}). <br />
                Would you like to use these details for your enrollment?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowProfilePrompt(false)}
                  className="py-4 bg-[#0b1120] text-white rounded-2xl font-black text-lg border-2 border-[#0b1120] shadow-[5px_5px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Yes, Continue
                </button>
                <button
                  onClick={() => { setShowProfilePrompt(false); setStep('profile'); }}
                  className="py-4 bg-white text-[#0b1120] rounded-2xl font-black text-lg border-[3px] border-[#0b1120] hover:bg-gray-50 transition-all"
                >
                  No, Update Details
                </button>
              </div>
            </motion.div>
          ) : step === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-[4px] border-[#0b1120] rounded-2xl p-6 lg:p-8 shadow-[8px_8px_0px_#10b981]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-[#0b1120]">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[#0b1120]">Complete Your Profile</h2>
                    <p className="font-bold text-gray-500 text-xs">We need these details for your course certification.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-[#0b1120] uppercase mb-1.5">Your Full Name (As on Certificate)</label>
                  <input 
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-gray-50 border-[3px] border-[#0b1120] rounded-xl font-black text-base focus:bg-white focus:shadow-[4px_4px_0px_#3b82f6] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-[#0b1120] uppercase mb-1.5">Phone Number (WhatsApp Preferred)</label>
                  <input 
                    required
                    type="tel"
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 bg-gray-50 border-[3px] border-[#0b1120] rounded-xl font-black text-base focus:bg-white focus:shadow-[4px_4px_0px_#3b82f6] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-[#0b1120] uppercase mb-1.5">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['MALE', 'FEMALE'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProfileData({...profileData, gender: g})}
                        className={`py-2.5 rounded-xl border-[3px] font-black text-base transition-all ${profileData.gender === g ? 'bg-[#0b1120] text-white border-[#0b1120] shadow-[3px_3px_0px_#3b82f6]' : 'bg-white text-[#0b1120] border-gray-100 hover:border-[#0b1120]'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-amber-800 font-bold text-xs leading-relaxed">
                        Course access will be granted to <span className="font-black underline text-[10px]">{user?.email}</span>. Please ensure this is correct.
                    </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#0b1120] text-white rounded-xl font-black text-lg border-2 border-[#0b1120] shadow-[5px_5px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <>Continue to Payment <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-5 shadow-[8px_8px_0px_#0b1120]">
                    <h2 className="text-xl font-black text-[#0b1120] mb-4">Select Your Courses</h2>
                    
                    {!course.isBundle ? (
                        <div className="p-3.5 bg-blue-50 border-[2px] border-[#0b1120] rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-[#0b1120] rounded-full flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="font-black text-base text-[#0b1120]">{course.name}</span>
                            </div>
                            <span className="font-black text-lg text-[#10b981]">₹{course.discountPrice || course.price}</span>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {course.bundleCourses.map((bc: SubCourse) => (
                                <button
                                    key={bc.courseId}
                                    onClick={() => toggleCourse(bc.courseId)}
                                    className={`w-full p-3.5 text-left border-[2px] rounded-xl flex items-center justify-between transition-all ${selectedCourses.includes(bc.courseId) ? 'bg-blue-50 border-[#0b1120] shadow-[2px_2px_0px_#0b1120]' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCourses.includes(bc.courseId) ? 'bg-[#0b1120] border-[#0b1120] text-white' : 'bg-white border-gray-300'}`}>
                                            {selectedCourses.includes(bc.courseId) && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <div className="font-black text-sm text-[#0b1120]">{bc.courseName}</div>
                                        </div>
                                    </div>
                                    <span className="font-black text-base text-[#0b1120]">₹{bc.price}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-5 shadow-[8px_8px_0px_#10b981] sticky top-24">
                    <h3 className="text-lg font-black text-[#0b1120] mb-4 border-b-2 border-gray-100 pb-2.5">Enrollment Summary</h3>
                    
                    <div className="space-y-3 mb-6">
                        {course.isBundle && (
                            <div className="space-y-3">
                                {/* Bundle Progress Offer */}
                                <div className={`p-4 rounded-xl border-[3px] transition-all duration-500 ${isAllBundleSelected ? 'bg-green-50 border-[#10b981] shadow-[4px_4px_0px_#10b981]' : 'bg-blue-50 border-blue-200'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-8 h-8 rounded-lg border-2 border-[#0b1120] flex items-center justify-center ${isAllBundleSelected ? 'bg-[#10b981]' : 'bg-white'}`}>
                                            <Star className={`w-4 h-4 ${isAllBundleSelected ? 'text-white' : 'text-blue-500'}`} fill={isAllBundleSelected ? 'white' : 'transparent'} />
                                        </div>
                                        <div className="font-black text-[10px] md:text-xs text-[#0b1120] uppercase tracking-tight leading-tight">
                                            {isAllBundleSelected 
                                                ? "🎉 Bundle Price Unlocked!" 
                                                : `Select All ${course.bundleCourses.length} Courses to Save ₹${course.bundleCourses.reduce((s: any, b: any) => s + b.price, 0) - (course.bundleDiscountPrice || 0)}`
                                            }
                                        </div>
                                    </div>
                                    {isAllBundleSelected ? (
                                        <div className="space-y-2">
                                            <div className="p-2 bg-white border-2 border-[#0b1120] rounded-lg text-center font-mono font-black text-sm tracking-[0.2em] text-[#0b1120]">
                                                {course.bundleDiscountCode}
                                            </div>
                                            {!appliedDiscountCode && (
                                                <button 
                                                    onClick={() => {
                                                        setDiscountCodeInput(course.bundleDiscountCode);
                                                        setTimeout(() => applyDiscount(), 100);
                                                    }}
                                                    className="w-full py-1.5 bg-[#0b1120] text-white rounded-lg font-black text-[10px] uppercase shadow-[2px_2px_0px_#10b981] hover:translate-y-0.5 hover:shadow-none transition-all"
                                                >
                                                    Apply Bundle Pricing
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-1.5 bg-white border border-blue-200 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(selectedCourses.length / course.bundleCourses.length) * 100}%` }}
                                                className="h-full bg-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Summary List */}
                                <div className="space-y-1.5 pt-2">
                                    {course.bundleCourses.filter((bc: SubCourse) => selectedCourses.includes(bc.courseId)).map((bc: SubCourse) => (
                                        <div key={bc.courseId} className="flex justify-between font-bold text-gray-500 text-[9px] uppercase tracking-tight">
                                            <span>{bc.courseName}</span>
                                            <span>₹{bc.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                  className="flex-grow px-3 py-2 bg-gray-50 border-[2px] border-gray-200 rounded-lg font-black text-sm outline-none focus:border-[#10b981] uppercase placeholder:normal-case"
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

                        {appliedDiscountCode && (
                          <div className="flex justify-between font-bold text-gray-500 text-sm">
                            <span>Discount</span>
                            <span className="text-green-600">-₹{discountAmount}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Grand Total</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-2xl font-black text-[#0b1120]">₹{Math.max(calculateTotal() - discountAmount, 0)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || selectedCourses.length === 0}
                        className="w-full py-3.5 bg-[#10b981] text-[#0b1120] rounded-xl font-black text-lg border-[3px] border-[#0b1120] shadow-[5px_5px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <>Enroll Now <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <p className="mt-6 text-center text-[8px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                        Access will be granted immediately <br /> after successful payment verification.
                    </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why Gen-Z IITian? Section */}
        <div className="mt-24 mb-16">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-[#0b1120] mb-4 tracking-tight">Why Gen-Z IITian?</h2>
                <p className="text-lg md:text-xl text-gray-500 font-bold max-w-3xl mx-auto px-4 leading-relaxed">
                    Most students fail the Qualifier not because they lack intelligence — but because they <span className="text-red-500 underline decoration-[3px]">lack structure.</span>
                </p>
            </div>

            <div className="bg-white border-[6px] border-[#0b1120] rounded-[3rem] p-8 md:p-16 shadow-[20px_20px_0px_#0b1120] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-10">
                    {[
                        { title: "Proven Academic Structure", desc: "Meticulously designed roadmap for consistent progress." },
                        { title: "Expert Strategy & Roadmap", desc: "Direct guidance from those who've cracked it." },
                        { title: "Real-Time Accountability", desc: "Live doubt clearing and progress monitoring." },
                        { title: "Extensive Mock Practice", desc: "High-yield PYQ analysis and exam-style simulator." }
                    ].map((item, idx) => (
                        <div key={idx} className="flex gap-6 items-start group">
                            <div className="shrink-0 w-12 h-12 bg-green-50 border-[3px] border-[#0b1120] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#0b1120] group-hover:-translate-y-1 transition-transform">
                                <CheckCircle2 className="w-6 h-6 text-[#10b981]" strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="text-xl md:text-2xl font-black text-[#0b1120] tracking-tight">{item.title}</h4>
                                <p className="text-sm md:text-base text-gray-500 font-bold mt-1 uppercase tracking-tighter">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative group">
                    <div className="absolute -inset-4 bg-blue-50 rounded-[2.5rem] -rotate-1 group-hover:rotate-0 transition-transform -z-10 border-[3px] border-[#0b1120]" />
                    <div className="bg-blue-600 border-[6px] border-[#0b1120] rounded-[2.5rem] p-10 md:p-14 shadow-[20px_20px_0px_#0b1120] relative overflow-hidden">
                        <Quote className="absolute -top-4 -left-4 w-32 h-32 text-white/10 -rotate-12" />
                        <p className="text-xl md:text-2xl font-black text-white italic leading-relaxed relative z-10">
                            "Gen-Z IITian bridges the gap between self-study and success. We don't just teach the syllabus; we prepare you for the challenge of being an IITian."
                        </p>
                        <div className="mt-8 flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-400" />
                            <div>
                                <div className="text-white font-black text-lg tracking-tight">Founder Team</div>
                                <div className="text-blue-200 font-bold text-xs uppercase tracking-widest">IIT Madras Qualifier Mentors</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
