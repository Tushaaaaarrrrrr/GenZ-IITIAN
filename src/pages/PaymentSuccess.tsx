import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, GraduationCap } from 'lucide-react';

export default function PaymentSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);
  const LMS_URL = "https://class.genziitian.in";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = LMS_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          className="w-12 h-12 bg-green-100 rounded-2xl border-[3px] border-[#0b1120] flex items-center justify-center mx-auto mb-5 shadow-[3px_3px_0px_#059669]"
        >
          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
        </motion.div>

        <h1 className="text-2xl lg:text-3xl font-black text-[#0b1120] mb-3 tracking-tight">
          🎉 Payment Successful!
        </h1>

        <div className="space-y-3 mb-6">
          <p className="text-base text-gray-500 font-bold leading-relaxed">
            You have successfully enrolled in your selected course(s). <br />
            Your access has been granted.
          </p>

          <div className="p-3 bg-blue-50 border-[2px] border-blue-100 rounded-xl inline-block">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Access provided to:</p>
            <p className="text-base font-black text-[#0b1120]">{user?.email || 'your-email@example.com'}</p>
          </div>

          <p className="text-sm text-[#0b1120] font-bold">
            You will now be redirected to your learning dashboard.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => window.open(LMS_URL, '_blank', 'noopener,noreferrer')}
            className="w-full py-3.5 bg-[#10b981] text-[#0b1120] rounded-xl font-black text-lg border-[3px] border-[#0b1120] shadow-[5px_5px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center font-black text-sm text-gray-400">
                {countdown}
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
              Redirecting in {countdown} seconds...
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                Please login using the same email to <br /> access your course material immediately.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
