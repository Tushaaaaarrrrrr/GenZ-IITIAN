import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { XCircle, RefreshCcw, BookOpen, AlertCircle, MessageCircle, Clock, CreditCard, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function PaymentFailed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<any>(location.state?.orderDetails || null);
  const [courseTitles, setCourseTitles] = useState<string>(location.state?.courseTitle || 'your selected course(s)');
  
  useEffect(() => {
    async function fetchOrder() {
      if (orderDetails || !user?.email) return;
      
      try {
        const lastOrder = await apiService.getLastOrder(user.email);
        // We show the last order even if it's CREATED or FAILED so they can see the details
        if (lastOrder) {
          setOrderDetails(lastOrder);
          if (Array.isArray(lastOrder.course_ids)) {
            const [{ data: catalog }, { data: mainCourses }] = await Promise.all([
              supabase.from('course_catalog').select('id, name').in('id', lastOrder.course_ids),
              supabase.from('courses').select('id, name').in('id', lastOrder.course_ids)
            ]);

            const merged = [...(catalog || []), ...(mainCourses || [])];
            const nameMap = new Map(merged.map(c => [c.id, c.name]));
            const titles = lastOrder.course_ids.map((id: string) => nameMap.get(id) || id);
            
            if (titles.length > 0) {
              setCourseTitles(titles.join(', '));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch fallback order:', err);
      }
    }
    
    fetchOrder();
  }, [user?.email, orderDetails]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pt-24 pb-12 relative overflow-hidden">
      
      {/* 📞 Contact Us Floating Button */}
      <Link 
        to="/contact"
        className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 bg-[#ef4444] text-white rounded-2xl font-black border-[3px] border-white shadow-[6px_6px_0px_#0b1120] hover:translate-y-[-4px] hover:shadow-[6px_10px_0px_#0b1120] transition-all group"
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline">Need Help? Contact Us</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-xl w-full bg-white border-[4px] border-[#0b1120] rounded-3xl p-6 lg:p-10 shadow-[12px_12px_0px_#ef4444] text-center relative"
      >
        {/* Failed Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-red-100 rounded-2xl border-[3px] border-[#0b1120] flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#ef4444]"
          >
            <XCircle className="w-8 h-8 text-[#ef4444]" />
          </motion.div>

          <h1 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-2 tracking-tight">
            Payment Failed
          </h1>
          <p className="text-gray-500 font-bold">Unfortunately, your transaction could not be processed.</p>
        </div>

        {/* 🧾 Failed Transaction Card */}
        <div className="bg-red-50/50 border-[3px] border-dashed border-red-200 rounded-[2rem] p-6 mb-8 text-left space-y-5 relative">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 border-2 border-red-100 rounded-full text-[10px] font-black text-red-500 uppercase tracking-widest">
              Attempt Details
           </div>

           <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Attempted Purchase</p>
                <p className="text-base font-black text-[#0b1120] line-clamp-2">{courseTitles}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t-2 border-red-100/50 pt-4">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Amount</p>
                    <p className="text-xl font-black text-[#ef4444]">
                      {orderDetails ? `₹${orderDetails.total_amount}` : '...'}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</p>
                    <p className="text-sm font-black text-[#0b1120]">
                      {orderDetails?.created_at ? new Date(orderDetails.created_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
                    </p>
                 </div>
              </div>

              <div className="bg-white/80 border-2 border-red-100 rounded-xl p-3">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Code</p>
                        <p className="text-xs font-mono font-bold text-red-600 uppercase tracking-tighter">Transaction_Failed</p>
                    </div>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                 </div>
              </div>
           </div>
        </div>

        {/* Troubleshooting Info */}
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl mb-8 flex gap-4 text-left">
           <HelpCircle className="w-6 h-6 text-amber-600 shrink-0" />
           <div>
              <p className="text-sm font-black text-amber-900 mb-1">What happened?</p>
              <p className="text-xs font-bold text-amber-800/80 leading-relaxed">
                If money was deducted from your account, it will be refunded automatically by your bank within 5-7 business days. 
              </p>
           </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-[#0b1120] text-white rounded-2xl font-black text-lg border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group"
          >
            Try Again <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <Link
            to="/courses"
            className="w-full py-4 bg-white text-[#0b1120] rounded-2xl font-black text-lg border-[3px] border-[#0b1120] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            Browse Other Courses
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                If the issue persists, please <Link to="/contact" className="text-[#0b1120] underline">Contact our support team</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}

