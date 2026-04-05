import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, GraduationCap, Calendar, CreditCard, MessageCircle, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { apiService } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<any>(location.state?.orderDetails || null);
  const [courseTitles, setCourseTitles] = useState<string>(location.state?.courseTitle || 'your selected course(s)');
  const [loadingOrder, setLoadingOrder] = useState(!orderDetails);
  const [countdown, setCountdown] = useState(15); // Increased to give time to read receipt
  const LMS_URL = "https://class.genziitian.in";

  useEffect(() => {
    async function fetchOrder() {
      if (orderDetails || !user?.email) return;
      
      try {
        const lastOrder = await apiService.getLastOrder(user.email);
        if (lastOrder && lastOrder.status === 'PAID') {
          setOrderDetails(lastOrder);
          // If we have IDs but no titles, try to fetch titles
          if (Array.isArray(lastOrder.course_ids)) {
            const { data: courses } = await supabase.from('courses').select('name').in('id', lastOrder.course_ids);
            if (courses && courses.length > 0) {
              setCourseTitles(courses.map(c => c.name).join(', '));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch fallback order:', err);
      } finally {
        setLoadingOrder(false);
      }
    }
    
    fetchOrder();
  }, [user?.email, orderDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // window.location.href = LMS_URL; // Commented out for now so user can see their receipt
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pt-24 pb-12 relative overflow-hidden">
      
      {/* 📞 Contact Us Floating Button */}
      <Link 
        to="/contact"
        className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 bg-[#0b1120] text-white rounded-2xl font-black border-[3px] border-white shadow-[6px_6px_0px_#3b82f6] hover:translate-y-[-4px] hover:shadow-[6px_10px_0px_#3b82f6] transition-all group"
      >
        <MessageCircle className="w-6 h-6 text-blue-400 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline">Contact Support</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-xl w-full bg-white border-[4px] border-[#0b1120] rounded-3xl p-6 lg:p-10 shadow-[12px_12px_0px_#0b1120] text-center relative"
      >
        {/* Success Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-2xl border-[3px] border-[#0b1120] flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#10b981]"
          >
            <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
          </motion.div>

          <h1 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-2 tracking-tight">
            Order Complete!
          </h1>
          <p className="text-gray-500 font-bold">Thank you for your purchase.</p>
        </div>

        {/* 🧾 Receipt Card */}
        <div className="bg-gray-50 border-[3px] border-dashed border-gray-200 rounded-[2rem] p-6 mb-8 text-left space-y-5 relative">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 border-2 border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Transaction Details
           </div>

           <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Purchased Items</p>
                <p className="text-base font-black text-[#0b1120] line-clamp-2">{courseTitles}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-100/50 pt-4">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Amount Paid</p>
                    <p className="text-xl font-black text-[#10b981]">
                      {orderDetails ? `₹${orderDetails.total_amount}` : 'Processing...'}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Date & Time</p>
                    <p className="text-sm font-black text-[#0b1120]">
                      {orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleString() : new Date().toLocaleString()}
                    </p>
                 </div>
              </div>

              <div className="bg-white/50 border-2 border-gray-100 rounded-xl p-3">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                 <p className="text-xs font-mono font-bold text-gray-500 break-all">{orderDetails?.order_id || 'Generating...'}</p>
              </div>
           </div>
        </div>

        {/* Action Section */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-bold mb-4">
             Your access has been granted to <span className="text-[#0b1120]">{user?.email}</span>.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => window.location.href = LMS_URL}
              className="flex-grow py-4 bg-[#10b981] text-[#0b1120] rounded-2xl font-black text-lg border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <Link
              to="/courses"
              className="px-8 py-4 bg-white text-[#0b1120] rounded-2xl font-black text-lg border-[3px] border-[#0b1120] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Back Home
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center font-black text-sm text-gray-400">
                {countdown}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              LMS sync in {countdown}s...
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

