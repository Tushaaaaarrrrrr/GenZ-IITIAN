import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { XCircle, RefreshCcw, BookOpen, AlertCircle } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-32 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-2xl w-full bg-white border-[6px] border-[#0b1120] rounded-[3.5rem] p-10 lg:p-16 shadow-[24px_24px_0px_#0b1120] text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-red-100 rounded-3xl border-[4px] border-[#0b1120] flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_0px_#ef4444]"
        >
          <XCircle className="w-12 h-12 text-[#ef4444]" />
        </motion.div>

        <h1 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-6 tracking-tight">
          ❌ Payment Failed
        </h1>

        <div className="space-y-6 mb-12">
          <p className="text-xl text-gray-500 font-bold leading-relaxed">
            Your payment could not be completed. <br />
            Please try again.
          </p>

          <div className="p-6 bg-amber-50 border-[3px] border-amber-100 rounded-3xl flex gap-4 text-left">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
            <p className="text-amber-800 font-bold text-sm leading-relaxed">
              Your amount will be refunded automatically if deducted by the bank. Please contact us if the issue persists.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-6 bg-[#0b1120] text-white rounded-3xl font-black text-2xl border-[4px] border-[#0b1120] shadow-[8px_8px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 group"
          >
            Try Again <RefreshCcw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <button
            onClick={() => navigate('/courses')}
            className="w-full py-5 bg-white text-[#0b1120] rounded-3xl font-black text-xl border-[4px] border-[#0b1120] hover:bg-gray-50 transition-all flex items-center justify-center gap-4 group"
          >
            Go to Courses <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                Need help? <a href="/contact" className="text-[#0b1120] underline">Contact our support team</a>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
