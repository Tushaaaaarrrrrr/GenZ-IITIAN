import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, Gift, Coins, Copy, Share2, Trophy, Target, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getReferralProfile, getReferralHistory, getMilestones, type ReferralProfile, type ReferralTransaction } from '../lib/referral';

const REFERRAL_FAQs = [
  {
    question: "How can I refer someone?",
    answer: "You can refer your friends by sharing your unique referral code or referral link. When your friend uses your code while purchasing any course, the referral will be successfully applied."
  },
  {
    question: "What happens when someone uses my referral code?",
    answer: "When your friend applies your referral code, they get a 5% discount, and you earn 5% of the course value as coins in your account."
  },
  {
    question: "How can I use my coins?",
    answer: "Your coins can be used as discounts while purchasing courses. The value is simple: 1 coin = ₹1. You can use a maximum of 50 coins per purchase."
  },
  {
    question: "Can I transfer my coins to my bank account?",
    answer: "No, coins cannot be withdrawn or transferred to a bank account. They can only be used for discounts on our platform."
  },
  {
    question: "I didn’t receive my cashback/coins. What should I do?",
    answer: "If you didn’t receive your coins, please contact us through the Contact Us page. Our team will review the issue and help resolve it."
  }
];

function FAQItem({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void;
}) {
  return (
    <div className={`border-[3px] border-[#0b1120] rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-[#f8fafc] shadow-[6px_6px_0px_#0b1120]' : 'bg-white hover:bg-gray-50'}`}>
      <button 
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg border-2 border-[#0b1120] flex items-center justify-center ${isOpen ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0b1120]' : 'bg-purple-50 text-purple-600'}`}>
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-lg font-black text-[#0b1120]">{question}</span>
        </div>
        {isOpen ? <ChevronUp className="w-6 h-6 text-purple-600" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-2">
              <div className="h-[2px] bg-[#0b1120]/10 mb-4 rounded-full"></div>
              <p className="text-gray-600 font-bold leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Referral() {
  const { user, loading: authLoading } = useAuth();
  
  // Referral states
  const [referralProfile, setReferralProfile] = useState<ReferralProfile | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralTransaction[]>([]);
  const [milestones, setMilestones] = useState<{ referrals_required: number; bonus_coins: number }[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchReferralData();

      // Real-time subscription: wallet updates live when someone uses your code
      const channel = supabase
        .channel('referral-profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'referral_profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as ReferralProfile;
            setReferralProfile(updated);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;
    setReferralLoading(true);
    try {
      const [refProfile, history, ms] = await Promise.all([
        getReferralProfile(user.id, user.email || '', user.user_metadata?.full_name || ''),
        getReferralHistory(user.email || ''),
        getMilestones(),
      ]);
      setReferralProfile(refProfile);
      setReferralHistory(history);
      setMilestones(ms);
    } catch (err) {
      console.error('Referral data error:', err);
    } finally {
      setReferralLoading(false);
    }
  };

  const copyCode = () => {
    if (!referralProfile) return;
    navigator.clipboard.writeText(referralProfile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    if (!referralProfile) return;
    const link = `${window.location.origin}?ref=${referralProfile.referral_code}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Milestone progress calculation
  const getNextMilestone = () => {
    if (!referralProfile || milestones.length === 0) return null;
    const current = referralProfile.quarterly_referrals;
    for (const ms of milestones) {
      if (current < ms.referrals_required) {
        return ms;
      }
    }
    return null; // all milestones achieved
  };

  const nextMilestone = getNextMilestone();
  const progressPercent = nextMilestone
    ? Math.min((referralProfile?.quarterly_referrals || 0) / nextMilestone.referrals_required * 100, 100)
    : 100;
  const remaining = nextMilestone
    ? nextMilestone.referrals_required - (referralProfile?.quarterly_referrals || 0)
    : 0;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">PLEASE LOG IN TO VIEW REFERRALS</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-[#0b1120] mb-4 tracking-tight">Refer & Earn</h1>
            <p className="text-gray-500 font-bold text-lg">Help your friends join IIT Madras Online Degree and get rewarded!</p>
        </div>

        {/* ===== REFERRAL DASHBOARD ===== */}
        {!referralLoading && referralProfile && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-[#0b1120] flex items-center gap-3">
              <Gift className="w-6 h-6 text-purple-600" /> My Referral Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Referral Code Card */}
              <div className="md:col-span-2 bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-8 shadow-[8px_8px_0px_#8b5cf6]">
                <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Your Referral Code</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl lg:text-4xl font-black text-[#0b1120] font-mono tracking-[0.3em]">
                    {referralProfile.referral_code}
                  </div>
                  <button
                    onClick={copyCode}
                    className="p-3 bg-purple-100 text-purple-600 border-2 border-purple-200 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
                    title="Copy Code"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-5 py-3 bg-[#0b1120] text-white rounded-xl font-black text-sm border-2 border-[#0b1120] shadow-[4px_4px_0px_#8b5cf6] hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <Share2 className="w-4 h-4" /> {linkCopied ? 'Link Copied! ✓' : 'Copy Referral Link'}
                  </button>
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400">
                  Share your code → They get <span className="text-purple-600">5% off</span>, you earn <span className="text-amber-600">5% in coins</span>.
                </p>
              </div>

              {/* Wallet Card */}
              <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-8 shadow-[8px_8px_0px_#f59e0b] flex flex-col items-center justify-center text-center">
                <Coins className="w-10 h-10 text-amber-500 mb-3" />
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Wallet Balance</div>
                <div className="text-4xl font-black text-[#0b1120] mb-1">{referralProfile.wallet_balance}</div>
                <div className="text-sm font-bold text-gray-400">Coins = ₹{referralProfile.wallet_balance}</div>
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-8 shadow-[8px_8px_0px_#0b1120]">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-black text-[#0b1120]">Quarterly Milestone Progress</h3>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black text-gray-500">
                    {referralProfile.quarterly_referrals} Referral{referralProfile.quarterly_referrals !== 1 ? 's' : ''} this quarter
                  </span>
                  {nextMilestone ? (
                    <span className="text-sm font-black text-purple-600">
                      {remaining} more for {nextMilestone.bonus_coins} Coins
                    </span>
                  ) : (
                    <span className="text-sm font-black text-green-600">All milestones achieved! 🎉</span>
                  )}
                </div>
                <div className="w-full h-5 bg-gray-100 border-2 border-[#0b1120] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>

              {/* Milestone Tiers */}
              <div className="grid grid-cols-3 gap-4">
                {milestones.map((ms) => {
                  const achieved = (referralProfile.quarterly_referrals || 0) >= ms.referrals_required;
                  return (
                    <div
                      key={ms.referrals_required}
                      className={`p-4 rounded-2xl border-[3px] text-center transition-all ${
                        achieved
                          ? 'bg-green-50 border-green-500 shadow-[4px_4px_0px_#10b981]'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`text-2xl font-black mb-1 ${achieved ? 'text-green-600' : 'text-gray-300'}`}>
                        {achieved ? '✅' : '🔒'}
                      </div>
                      <div className="text-lg font-black text-[#0b1120]">{ms.referrals_required} Referrals</div>
                      <div className={`text-sm font-black ${achieved ? 'text-green-600' : 'text-gray-400'}`}>
                        +{ms.bonus_coins} Coins
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lifetime Counter */}
              <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <Trophy className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-black text-[#0b1120]">
                  Lifetime Referrals: <span className="text-blue-600">{referralProfile.lifetime_referrals}</span>
                </span>
              </div>
            </div>

            {/* Referral History */}
            {referralHistory.length > 0 && (
              <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_#0b1120]">
                <div className="p-6 border-b-[3px] border-gray-100">
                  <h3 className="text-lg font-black text-[#0b1120]">Referral History</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b-[3px] border-gray-100 font-black text-[10px] uppercase text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Buyer</th>
                      <th className="px-6 py-4">Reward</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[3px] divide-gray-50 font-bold">
                    {referralHistory.map((tx) => (
                      <tr key={tx.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tx.buyer_email.replace(/(.{3}).+(@.+)/, '$1***$2')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 font-black text-sm">+{tx.referrer_reward} Coins</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* FAQ Section */}
        <div className="mt-16 pt-12 border-t-[4px] border-[#0b1120]">
          <h2 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-purple-600" /> Referral FAQs
          </h2>
          <div className="flex flex-col gap-4">
            {REFERRAL_FAQs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === index}
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>

        {referralLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
            <p className="mt-4 text-gray-400 font-bold">Loading your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
