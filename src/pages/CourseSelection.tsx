import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Check, Loader2, ShieldCheck, AlertCircle, User, UserCheck, CreditCard, ArrowRight } from 'lucide-react';

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface SubCourse {
  courseId: string;
  courseName: string;
  price: number;
}

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
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (profile) {
      setProfileData({
          name: profile.name || '',
          gender: profile.gender || '',
          phone: profile.phone || ''
      });
      if (!profile.name || !profile.gender || !profile.phone) {
        setStep('profile');
      } else {
        setStep('selection');
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(i => i !== courseId) 
        : [...prev, courseId]
    );
  };

  const calculateTotal = () => {
    if (!course) return 0;
    if (!course.isBundle) return course.discountPrice || course.price;
    
    return course.bundleCourses
      .filter((bc: SubCourse) => selectedCourses.includes(bc.courseId))
      .reduce((sum: number, bc: SubCourse) => sum + bc.price, 0);
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

  const handlePayment = async () => {
    if (selectedCourses.length === 0) {
      alert("Please select at least one course!");
      return;
    }

    setIsProcessing(true);
    setLoadingMessage("Preparing Checkout...");
    const total = calculateTotal();

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email: user?.email,
          courseIds: selectedCourses,
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
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
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
              className="max-w-md w-full bg-white border-[6px] border-[#0b1120] rounded-[3rem] p-10 shadow-[16px_16px_0px_#3b82f6]"
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

      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-[#0b1120] mb-4 tracking-tight">Complete Enrollment</h1>
            <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto">You're just one step away from joining {course.name}. Follow the steps below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <button 
              onClick={() => setStep('profile')}
              className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-[3px] transition-all w-full text-left ${step === 'profile' ? 'bg-blue-600 border-[#0b1120] text-white shadow-[8px_8px_0px_#0b1120]' : 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100'}`}
            >
                <User className="w-8 h-8" />
                <span className="font-black text-xs uppercase">Step 1: Profile</span>
            </button>
            <button 
              disabled={!profileData.name || !profileData.gender || !profileData.phone}
              onClick={() => setStep('selection')}
              className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-[3px] transition-all w-full text-left ${step === 'selection' ? 'bg-blue-600 border-[#0b1120] text-white shadow-[8px_8px_0px_#0b1120]' : 'bg-white border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
                <CreditCard className="w-8 h-8" />
                <span className="font-black text-xs uppercase">Step 2: Payment</span>
            </button>
            <div className="md:col-span-2 bg-white/50 border-2 border-dashed border-gray-300 rounded-3xl p-6 flex items-center justify-center border-[#0b1120]/10">
                <div className="flex items-center gap-3 text-gray-400 font-bold">
                    <ShieldCheck className="w-6 h-6" />
                    Secure Checkout by Razorpay
                </div>
            </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-[6px] border-[#0b1120] rounded-[3.5rem] p-10 lg:p-16 shadow-[24px_24px_0px_#0b1120]"
            >
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-[#0b1120]">
                    <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-[#0b1120]">Complete Your Profile</h2>
                    <p className="font-bold text-gray-500">We need these details for your course certification.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div>
                  <label className="block text-sm font-black text-[#0b1120] uppercase mb-4">Your Full Name (As on Certificate)</label>
                  <input 
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-8 py-5 bg-gray-50 border-[4px] border-[#0b1120] rounded-2xl font-black text-xl focus:bg-white focus:shadow-[8px_8px_0px_#3b82f6] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0b1120] uppercase mb-4">Phone Number (WhatsApp Preferred)</label>
                  <input 
                    required
                    type="tel"
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-8 py-5 bg-gray-50 border-[4px] border-[#0b1120] rounded-2xl font-black text-xl focus:bg-white focus:shadow-[8px_8px_0px_#3b82f6] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0b1120] uppercase mb-4">Gender</label>
                  <div className="grid grid-cols-2 gap-6">
                    {['MALE', 'FEMALE'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProfileData({...profileData, gender: g})}
                        className={`py-5 rounded-2xl border-[4px] font-black text-xl transition-all ${profileData.gender === g ? 'bg-[#0b1120] text-white border-[#0b1120] shadow-[8px_8px_0px_#3b82f6]' : 'bg-white text-[#0b1120] border-gray-100 hover:border-[#0b1120]'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-amber-50 border-[3px] border-amber-200 rounded-3xl flex gap-4 items-start">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                    <p className="text-amber-800 font-bold text-sm leading-relaxed">
                        Course access will be granted to <span className="font-black underline">{user?.email}</span>. Please ensure this is the correct email associated with your LMS account.
                    </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-6 bg-[#0b1120] text-white rounded-3xl font-black text-2xl border-2 border-[#0b1120] shadow-[12px_12px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : <>Continue to Payment <ArrowRight className="w-8 h-8" /></>}
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
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-white border-[4px] border-[#0b1120] rounded-[3rem] p-10 shadow-[16px_16px_0px_#0b1120]">
                    <h2 className="text-3xl font-black text-[#0b1120] mb-8">Select Your Courses</h2>
                    
                    {!course.isBundle ? (
                        <div className="p-6 bg-blue-50 border-[3px] border-[#0b1120] rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0b1120] rounded-full flex items-center justify-center text-white">
                                    <Check className="w-6 h-6" />
                                </div>
                                <span className="font-black text-xl text-[#0b1120]">{course.name}</span>
                            </div>
                            <span className="font-black text-2xl text-[#10b981]">₹{course.discountPrice || course.price}</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {course.bundleCourses.map((bc: SubCourse) => (
                                <button
                                    key={bc.courseId}
                                    onClick={() => toggleCourse(bc.courseId)}
                                    className={`w-full p-6 text-left border-[3px] rounded-3xl flex items-center justify-between transition-all ${selectedCourses.includes(bc.courseId) ? 'bg-blue-50 border-[#0b1120] shadow-[4px_4px_0px_#0b1120]' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedCourses.includes(bc.courseId) ? 'bg-[#0b1120] border-[#0b1120] text-white' : 'bg-white border-gray-300'}`}>
                                            {selectedCourses.includes(bc.courseId) && <Check className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-black text-lg text-[#0b1120]">{bc.courseName}</div>
                                        </div>
                                    </div>
                                    <span className="font-black text-xl text-[#0b1120]">₹{bc.price}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white border-[4px] border-[#0b1120] rounded-[3rem] p-10 shadow-[16px_16px_0px_#10b981] sticky top-32">
                    <h3 className="text-2xl font-black text-[#0b1120] mb-8 border-b-2 border-gray-100 pb-4">Enrollment Summary</h3>
                    
                    <div className="space-y-4 mb-12">
                        {course.isBundle && (
                            <div className="space-y-3">
                                {course.bundleCourses.filter((bc: SubCourse) => selectedCourses.includes(bc.courseId)).map((bc: SubCourse) => (
                                    <div key={bc.courseId} className="flex justify-between font-bold text-gray-500 text-sm">
                                        <span>{bc.courseName}</span>
                                        <span>₹{bc.price}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="h-0.5 bg-gray-100 my-6" />
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xs font-black uppercase text-gray-400 mb-1">Grand Total</div>
                                <div className="text-5xl font-black text-[#0b1120]">₹{calculateTotal()}</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || selectedCourses.length === 0}
                        className="w-full py-6 bg-[#10b981] text-[#0b1120] rounded-3xl font-black text-2xl border-[4px] border-[#0b1120] shadow-[8px_8px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="animate-spin w-8 h-8" /> : <>Enroll Now <ArrowRight className="w-8 h-8" /></>}
                    </button>

                    <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                        Access will be granted immediately <br /> after successful payment verification.
                    </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
