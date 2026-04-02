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
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-6 text-[#0b1120]">
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
            className="bg-white border-[4px] border-[#0b1120] rounded-2xl p-6 md:p-8 flex flex-col items-center gap-4 shadow-[12px_12px_0px_#3b82f6] max-w-sm w-full mx-6"
          >
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-[4px] border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-[4px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-[#0b1120] mb-1 uppercase tracking-tight">Processing Payment</h3>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Please don't close this window</p>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 text-center">
            <h1 className="text-2xl lg:text-3xl font-black mb-1 tracking-tight">Complete Enrollment</h1>
            <p className="text-sm text-gray-500 font-bold max-w-2xl mx-auto italic">You're just one step away from joining {course.name}. Follow the steps below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <button 
              onClick={() => { setStep('profile'); setShowProfilePrompt(false); }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-[3px] transition-all w-full text-left ${step === 'profile' ? 'bg-blue-600 border-[#0b1120] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100'}`}
            >
                <User className="w-5 h-5" />
                <span className="font-black text-[9px] uppercase tracking-wider">Step 1: Profile</span>
            </button>
            <button 
              disabled={!profileData.name || !profileData.gender || !profileData.phone}
              onClick={() => setStep('selection')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-[3px] transition-all w-full text-left ${step === 'selection' ? 'bg-blue-600 border-[#0b1120] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-white border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            >
                <BookOpen className="w-5 h-5" />
                <span className="font-black text-[9px] uppercase tracking-wider">Step 2: Selection</span>
            </button>
            <div className="md:col-span-2 bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-center border-[#0b1120]/10">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
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
              <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center border-2 border-[#0b1120] mx-auto mb-8">
                <UserCheck className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-4xl font-black text-[#0b1120] mb-4">Welcome Back!</h2>
              <p className="text-xl text-gray-500 font-bold mb-12">
                We found your profile: <span className="text-[#0b1120]">{profileData.name}</span> ({profileData.phone}). <br />
                Would you like to use these details for your enrollment?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setShowProfilePrompt(false)}
                  className="py-6 bg-[#0b1120] text-white rounded-3xl font-black text-xl border-2 border-[#0b1120] shadow-[8px_8px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Yes, Continue
                </button>
                <button
                  onClick={() => { setShowProfilePrompt(false); setStep('profile'); }}
                  className="py-6 bg-white text-[#0b1120] rounded-3xl font-black text-xl border-[4px] border-[#0b1120] hover:bg-gray-50 transition-all"
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
              className="bg-white border-[4px] border-[#0b1120] rounded-2xl p-8 lg:p-12 shadow-[12px_12px_0px_#10b981]"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-[#0b1120]">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-[#0b1120]">Complete Your Profile</h2>
                    <p className="font-bold text-gray-500 text-sm">We need these details for your course certification.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#0b1120] uppercase mb-2">Your Full Name (As on Certificate)</label>
                  <input 
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-gray-50 border-[3px] border-[#0b1120] rounded-xl font-black text-lg focus:bg-white focus:shadow-[4px_4px_0px_#3b82f6] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#0b1120] uppercase mb-2">Phone Number (WhatsApp Preferred)</label>
                  <input 
                    required
                    type="tel"
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-3 bg-gray-50 border-[3px] border-[#0b1120] rounded-xl font-black text-lg focus:bg-white focus:shadow-[4px_4px_0px_#3b82f6] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#0b1120] uppercase mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['MALE', 'FEMALE'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProfileData({...profileData, gender: g})}
                        className={`py-3 rounded-xl border-[3px] font-black text-lg transition-all ${profileData.gender === g ? 'bg-[#0b1120] text-white border-[#0b1120] shadow-[4px_4px_0px_#3b82f6]' : 'bg-white text-[#0b1120] border-gray-100 hover:border-[#0b1120]'}`}
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
                  className="w-full py-4 bg-[#0b1120] text-white rounded-2xl font-black text-xl border-2 border-[#0b1120] shadow-[8px_8px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <>Continue to Payment <ArrowRight className="w-6 h-6" /></>}
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
                <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[12px_12px_0px_#0b1120]">
                    <h2 className="text-2xl font-black text-[#0b1120] mb-6">Select Your Courses</h2>
                    
                    {!course.isBundle ? (
                        <div className="p-4 bg-blue-50 border-[2px] border-[#0b1120] rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0b1120] rounded-full flex items-center justify-center text-white">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="font-black text-lg text-[#0b1120]">{course.name}</span>
                            </div>
                            <span className="font-black text-xl text-[#10b981]">₹{course.discountPrice || course.price}</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {course.bundleCourses.map((bc: SubCourse) => (
                                <button
                                    key={bc.courseId}
                                    onClick={() => toggleCourse(bc.courseId)}
                                    className={`w-full p-4 text-left border-[2px] rounded-xl flex items-center justify-between transition-all ${selectedCourses.includes(bc.courseId) ? 'bg-blue-50 border-[#0b1120] shadow-[2px_2px_0px_#0b1120]' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${selectedCourses.includes(bc.courseId) ? 'bg-[#0b1120] border-[#0b1120] text-white' : 'bg-white border-gray-300'}`}>
                                            {selectedCourses.includes(bc.courseId) && <Check className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="font-black text-base text-[#0b1120]">{bc.courseName}</div>
                                        </div>
                                    </div>
                                    <span className="font-black text-lg text-[#0b1120]">₹{bc.price}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[12px_12px_0px_#10b981] sticky top-24">
                    <h3 className="text-xl font-black text-[#0b1120] mb-6 border-b-2 border-gray-100 pb-3">Enrollment Summary</h3>
                    
                    <div className="space-y-3 mb-8">
                        {course.isBundle && (
                            <div className="space-y-2">
                                {course.bundleCourses.filter((bc: SubCourse) => selectedCourses.includes(bc.courseId)).map((bc: SubCourse) => (
                                    <div key={bc.courseId} className="flex justify-between font-bold text-gray-500 text-xs">
                                        <span>{bc.courseName}</span>
                                        <span>₹{bc.price}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="h-0.5 bg-gray-100 my-4" />
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Grand Total</div>
                                <div className="text-3xl font-black text-[#0b1120]">₹{calculateTotal()}</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || selectedCourses.length === 0}
                        className="w-full py-4 bg-[#10b981] text-[#0b1120] rounded-2xl font-black text-xl border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <>Enroll Now <ArrowRight className="w-6 h-6" /></>}
                    </button>

                    <p className="mt-6 text-center text-[8px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
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
