import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { XCircle, RefreshCcw, BookOpen, AlertCircle } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-xl w-full bg-white border-[4px] border-[#0b1120] rounded-xl p-6 lg:p-8 shadow-[10px_10px_0px_#0b1120] text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-12 h-12 bg-red-100 rounded-2xl border-[3px] border-[#0b1120] flex items-center justify-center mx-auto mb-5 shadow-[3px_3px_0px_#ef4444]"
        >
          <XCircle className="w-6 h-6 text-[#ef4444]" />
        </motion.div>

        <h1 className="text-2xl lg:text-3xl font-black text-[#0b1120] mb-3 tracking-tight">
          ❌ Payment Failed
        </h1>

        <div className="space-y-3 mb-6">
          <p className="text-base text-gray-500 font-bold leading-relaxed">
            Your payment could not be completed. <br />
            Please try again.
          </p>

          <div className="p-3 bg-amber-50 border-[2px] border-amber-100 rounded-xl flex gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 font-bold text-xs leading-relaxed">
              Your amount will be refunded automatically if deducted by the bank. Please contact us if the issue persists.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-[#0b1120] text-white rounded-xl font-black text-lg border-[3px] border-[#0b1120] shadow-[5px_5px_0px_#3b82f6] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group"
          >
            Try Again <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <button
            onClick={() => navigate('/courses')}
            className="w-full py-2.5 bg-white text-[#0b1120] rounded-xl font-black text-base border-[3px] border-[#0b1120] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group"
          >
            Go to Courses <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                Need help? <a href="/contact" className="text-[#0b1120] underline">Contact our support team</a>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
