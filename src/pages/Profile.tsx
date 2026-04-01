import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, ShoppingBag, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/get-orders?email=${encodeURIComponent(user?.email || '')}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error('Order fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center font-black">PLEASE LOG IN TO VIEW PROFILE</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Profile Card */}
        <section className="bg-white border-[4px] border-[#0b1120] rounded-[3rem] p-10 lg:p-14 shadow-[12px_12px_0px_#3b82f6] flex flex-col md:flex-row gap-10 items-center">
          <div className="w-32 h-32 bg-blue-100 border-[4px] border-[#0b1120] rounded-[2rem] flex items-center justify-center shrink-0 shadow-[6px_6px_0px_#0b1120]">
            <User className="w-16 h-16 text-blue-600" />
          </div>
          <div className="flex-grow text-center md:text-left space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-[#0b1120]">{profile?.name || 'Student'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2 font-bold text-gray-500">
                <Mail className="w-5 h-5 text-blue-500" /> {user.email}
              </div>
              <div className="flex items-center gap-2 font-bold text-gray-500">
                <Calendar className="w-5 h-5 text-red-500" /> Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.open('https://class.genziitian.in', '_blank', 'noopener,noreferrer')}
              className="px-8 py-4 bg-blue-600 text-white border-2 border-[#0b1120] rounded-2xl font-black hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0b1120] hover:shadow-none whitespace-nowrap"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={signOut}
              className="px-8 py-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 w-full"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </section>

        {/* Order History */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-[#0b1120] flex items-center gap-4">
            <ShoppingBag className="w-8 h-8 text-blue-600" /> Order History
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
                  className="bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-8 hover:shadow-[10px_10px_0px_#10b981] transition-all flex justify-between items-center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black border-2 border-[#0b1120] ${
                        order.status === 'PAID' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {order.status === 'PAID' ? 'PAYMENT SUCCESS' : 'PENDING'}
                      </span>
                      <span className="text-sm font-black text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.course_ids.map((cid: string) => (
                        <div key={cid} className="px-3 py-1 bg-gray-50 border-2 border-[#0b1120] rounded-lg text-xs font-black uppercase text-gray-600">
                          {cid}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#0b1120]">₹{order.total_amount}</div>
                    <div className="text-xs font-black text-gray-400 mt-1 uppercase tracking-widest">Transaction ID: {order.order_id}</div>
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
