import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, ShoppingBag, LogOut, Loader2, Book } from 'lucide-react';
import { motion } from 'motion/react';
import { apiService } from '../lib/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [courseCatalog, setCourseCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchCatalog();
    }
  }, [user]);

  const fetchCatalog = async () => {
    try {
      // Fetch full details from courses table to get community and content links
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id, name, image')
        .order('name');
      
      if (error) throw error;
      setCourseCatalog(courses || []);
    } catch (err) {
      console.error('Catalog fetch error:', err);
    }
  };

  const getEnrolledCourses = () => {
    const paidOrders = orders.filter(o => o.status === 'PAID');
    const allCourseIds = Array.from(new Set(paidOrders.flatMap(o => o.course_ids)));
    return allCourseIds.map(id => courseCatalog.find(c => c.id === id)).filter(Boolean);
  };

  const enrolledCourses = getEnrolledCourses();

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

        {/* Enrolled Courses */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-[#0b1120] flex items-center gap-3">
            <Book className="w-6 h-6 text-[#10b981]" /> My Enrolled Courses
          </h2>

          {loading ? (
            <div className="p-12 text-center text-gray-400 font-bold">Loading your courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="bg-white border-[4px] border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
              <p className="text-xl font-bold text-gray-400">You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="inline-block mt-4 text-[#3b82f6] font-black hover:underline">Browse Courses →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course: any) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-6 shadow-[6px_6px_0px_#0b1120] hover:shadow-[10px_10px_0px_#10b981] transition-all group"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-[#0b1120] overflow-hidden shrink-0">
                      <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#0b1120] leading-tight mb-1">{course.name}</h3>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {course.id}</div>
                    </div>
                  </div>


                </motion.div>
              ))}
            </div>
          )}
        </section>

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
