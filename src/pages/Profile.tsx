import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, ShoppingBag, LogOut, Loader2, CheckCircle2, Gift, Coins, Copy, Share2, Trophy, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { apiService } from '../lib/api';
import { getReferralProfile, getReferralHistory, getMilestones, type ReferralProfile, type ReferralTransaction } from '../lib/referral';

export default function Profile() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [courseCatalog, setCourseCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Referral states
  const [referralProfile, setReferralProfile] = useState<ReferralProfile | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralTransaction[]>([]);
  const [milestones, setMilestones] = useState<{ referrals_required: number; bonus_coins: number }[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchCatalog();
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

  const fetchCatalog = async () => {
    try {
      const { data } = await supabase.from('course_catalog').select('*');
      setCourseCatalog(data || []);
    } catch (err) {
      console.error('Catalog fetch error:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiService.getOrders(user?.email || '');
      setOrders(data || []);
    } catch (err) {
      console.error('Order fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

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
  if (!user) return <div className="min-h-screen flex items-center justify-center font-black">PLEASE LOG IN TO VIEW PROFILE</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Profile Card */}
        <section className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-8 lg:p-10 shadow-[8px_8px_0px_#3b82f6] flex flex-col md:flex-row gap-8 items-center">
          <div className="w-24 h-24 bg-blue-100 border-[4px] border-[#0b1120] rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#0b1120]">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <div className="flex-grow text-center md:text-left space-y-3">
            <h1 className="text-3xl lg:text-4xl font-black text-[#0b1120]">{profile?.name || 'Student'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 font-bold text-gray-500">
                <Mail className="w-5 h-5 text-blue-500" /> {user.email}
              </div>
              <div className="flex items-center gap-2 font-bold text-gray-500">
                <Calendar className="w-5 h-5 text-red-500" /> Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={signOut}
              className="px-6 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 w-full text-sm"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </section>

        {/* ===== REFERRAL DASHBOARD ===== */}
        {!referralLoading && referralProfile && (
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-[#0b1120] flex items-center gap-3">
              <Gift className="w-6 h-6 text-purple-600" /> Referral Dashboard
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

        {referralLoading && (
          <div className="text-center py-8 text-gray-400 font-bold">Loading referral dashboard...</div>
        )}

        {/* Order History */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#0b1120] flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-blue-600" /> Order History
          </h2>

          {loading ? (
            <div className="p-12 text-center text-gray-400 font-bold">Checking for orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border-[4px] border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
              <p className="text-xl font-bold text-gray-400">No courses purchased yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-6 hover:shadow-[6px_6px_0px_#10b981] transition-all flex justify-between items-center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black border-2 border-[#0b1120] ${
                        order.status === 'PAID' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {order.status === 'PAID' ? 'PAYMENT SUCCESS' : 'PENDING'}
                      </span>
                      <span className="text-sm font-black text-gray-400">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.course_ids.map((cid: string) => {
                        const course = courseCatalog.find(c => c.id === cid);
                        return (
                          <div key={cid} className="px-3 py-1 bg-gray-50 border-2 border-[#0b1120] rounded-lg text-xs font-black uppercase text-gray-600">
                            {course?.name || cid}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#0b1120]">₹{order.total_amount}</div>
                    <div className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">ID: {order.order_id}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
