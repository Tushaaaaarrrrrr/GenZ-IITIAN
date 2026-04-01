import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, ShoppingBag, ScrollText, BookOpen, Plus, Search, Trash2, Edit, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

type Tab = 'orders' | 'logs' | 'courses';

export default function Manager() {
  const { isManager, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);

  useEffect(() => {
    if (!authLoading && !isManager) navigate('/');
  }, [isManager, authLoading]);

  useEffect(() => {
    if (isManager) fetchData();
  }, [activeTab, isManager]);

  const fetchData = async () => {
    setLoading(true);
    let query;
    if (activeTab === 'orders') {
      query = supabase.from('website_orders').select('*').order('createdAt', { ascending: false });
    } else if (activeTab === 'logs') {
      query = supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
    } else {
      query = supabase.from('courses').select('*').order('createdAt', { ascending: false });
    }

    const { data: res } = await query;
    setData(res || []);
    setLoading(false);
  };

  const handleCourseAction = async (course: any, isDelete = false) => {
    if (isDelete) {
      if (!confirm('Are you sure you want to delete this course?')) return;
      await supabase.from('courses').delete().eq('id', course.id);
    } else {
      // Ensure specific fields for existing schema
      const cleanedCourse = {
        id: course.id || course.name.toLowerCase().replace(/ /g, '-'),
        name: course.name,
        description: course.description,
        price: parseInt(course.price as string),
        isPinned: course.isPinned || false,
        learn: typeof course.learn === 'string' ? course.learn.split(',').map((s: string) => s.trim()) : course.learn,
        who: course.who,
        outcomes: course.outcomes
      };

      const { error } = await supabase.from('courses').upsert(cleanedCourse);
      if (error) alert(error.message);
      setEditingCourse(null);
      setShowAddCourse(false);
    }
    fetchData();
  };

  if (authLoading || !isManager) return <div className="min-h-screen flex items-center justify-center font-black">ACCESS DENIED</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-[#0b1120] text-white p-6 flex flex-col gap-8 h-screen sticky top-0 border-r-4 border-[#0b1120]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center font-black text-xl text-white border-2 border-white shadow-[2px_2px_0px_#fff]">G</div>
          <span className="hidden lg:block font-black text-xl tracking-tight">GenZ Manager</span>
        </div>
        
        <nav className="space-y-4 flex-grow">
          {(['orders', 'logs', 'courses'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all border-2 ${
                activeTab === tab ? 'bg-blue-600 border-white shadow-[4px_4px_0px_#fff]' : 'hover:bg-white/5 border-transparent text-gray-400'
              }`}
            >
              {tab === 'orders' && <ShoppingBag className="w-6 h-6" />}
              {tab === 'logs' && <ScrollText className="w-6 h-6" />}
              {tab === 'courses' && <BookOpen className="w-6 h-6" />}
              <span className="hidden lg:block capitalize">{tab}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-end border-b-[6px] border-[#0b1120] pb-8">
            <div>
              <h1 className="text-5xl font-black text-[#0b1120] capitalize mb-2">{activeTab}</h1>
              <p className="text-xl text-gray-500 font-bold tracking-tight">Platform administration dashboard.</p>
            </div>
            {activeTab === 'courses' && (
              <button 
                onClick={() => setShowAddCourse(true)}
                className="flex items-center gap-3 px-8 py-4 bg-[#10b981] text-[#0b1120] rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Plus className="w-6 h-6" /> Create Course
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center p-24 text-gray-300 animate-pulse font-black text-2xl uppercase tracking-widest">Loading Data...</div>
          ) : (
            <div className="space-y-8">
              {activeTab === 'orders' && (
                <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_#0b1120]">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b-[3px] border-gray-100 font-black text-sm uppercase text-gray-400">
                      <tr>
                        <th className="px-8 py-6">User</th>
                        <th className="px-8 py-6">Courses</th>
                        <th className="px-8 py-6 text-right">Amount</th>
                        <th className="px-8 py-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[3px] divide-gray-50 font-bold">
                      {data.map((order) => (
                        <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="text-[#0b1120]">{order.user_email}</div>
                            <div className="text-xs text-gray-400 font-mono mt-1">{order.order_id}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                              {order.course_ids?.map((cid: string) => (
                                <span key={cid} className="px-3 py-1 bg-white border-2 border-[#0b1120] rounded-lg text-[10px] font-black uppercase text-gray-500">{cid}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-xl">₹{order.total_amount}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border-2 border-[#0b1120] inline-block ${
                              order.status === 'PAID' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="grid grid-cols-1 gap-6">
                  {data.map((log) => (
                    <div key={log.id} className="bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-8 flex justify-between items-center hover:shadow-[8px_8px_0px_#3b82f6] transition-all">
                      <div className="flex gap-6 items-center">
                        <div className={`p-4 rounded-2xl border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] ${
                          log.action.includes('SUCCESS') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <ScrollText className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-[#0b1120]">{log.action}</div>
                          <div className="text-lg font-bold text-gray-500">{log.email} • {new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-sm font-mono bg-gray-100 px-6 py-3 rounded-2xl border-2 border-[#0b1120]">
                        ID: {log.courseId || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {data.map((course) => (
                    <div key={course.id} className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 shadow-[10px_10px_0px_#0b1120] flex flex-col hover:shadow-[10px_10px_0px_#10b981] transition-all">
                      <div className="w-full aspect-video bg-gray-100 rounded-2xl border-2 border-[#0b1120] mb-6 overflow-hidden">
                        <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-2xl font-black text-[#0b1120] mb-2">{course.name}</h3>
                      <div className="text-3xl font-black text-[#10b981] mb-6">₹{course.price}</div>
                      
                      <div className="space-y-2 mb-8">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Database ID (Text)</div>
                        <div className="text-sm font-bold p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">{course.id}</div>
                      </div>

                      <div className="flex gap-4 mt-auto">
                        <button 
                          onClick={() => setEditingCourse(course)}
                          className="flex-grow py-4 bg-[#0b1120] text-white rounded-2xl font-black border-2 border-[#0b1120] hover:bg-white hover:text-[#0b1120] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0b1120] hover:shadow-none translate-y-[-4px] hover:translate-y-0 active:translate-y-1"
                        >
                          <Edit className="w-5 h-5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleCourseAction(course, true)}
                          className="p-4 text-red-500 bg-red-50 border-2 border-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {(showAddCourse || editingCourse) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowAddCourse(false); setEditingCourse(null); }} className="absolute inset-0 bg-[#0b1120]/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="relative bg-white border-[6px] border-[#0b1120] rounded-[3.5rem] p-10 lg:p-16 w-full max-w-4xl shadow-[20px_20px_0px_#0b1120] overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-5xl font-black text-[#0b1120] mb-12 flex items-center gap-4">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Course Name</label>
                    <input type="text" defaultValue={editingCourse?.name} id="c-name" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Price (₹)</label>
                      <input type="number" defaultValue={editingCourse?.price} id="c-price" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Pinned?</label>
                      <select id="c-pinned" defaultValue={editingCourse?.isPinned ? 'true' : 'false'} className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-black focus:ring-[6px] ring-blue-100 outline-none bg-white">
                        <option value="false">Regular</option>
                        <option value="true">Pinned</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Target Audience (Who is this for?)</label>
                    <input type="text" defaultValue={editingCourse?.who} id="c-who" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Topics learned (comma separated)</label>
                    <textarea defaultValue={editingCourse?.learn?.join(', ')} id="c-learn" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none h-32" />
                  </div>
                </div>

                <div className="space-y-6">
                  {!editingCourse && (
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">URL ID (Unique Text)</label>
                      <input type="text" placeholder="python-basics" id="c-id" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none bg-blue-50" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Brief Description</label>
                    <textarea defaultValue={editingCourse?.description} id="c-desc" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none h-24" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Learning Outcomes (Long text)</label>
                    <textarea defaultValue={editingCourse?.outcomes} id="c-outcomes" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none h-32" />
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-16">
                <button 
                  onClick={() => {
                    const id = (document.getElementById('c-id') as HTMLInputElement)?.value || editingCourse?.id;
                    const name = (document.getElementById('c-name') as HTMLInputElement).value;
                    const price = (document.getElementById('c-price') as HTMLInputElement).value;
                    const isPinned = (document.getElementById('c-pinned') as HTMLSelectElement).value === 'true';
                    const who = (document.getElementById('c-who') as HTMLInputElement).value;
                    const learn = (document.getElementById('c-learn') as HTMLTextAreaElement).value;
                    const description = (document.getElementById('c-desc') as HTMLTextAreaElement).value;
                    const outcomes = (document.getElementById('c-outcomes') as HTMLTextAreaElement).value;
                    handleCourseAction({ id, name, price, isPinned, who, learn, description, outcomes });
                  }}
                  className="flex-grow py-5 bg-[#10b981] text-[#0b1120] rounded-2xl font-black text-xl border-[4px] border-[#0b1120] flex items-center justify-center gap-3 shadow-[8px_8px_0px_#0b1120] active:translate-y-1 active:shadow-none"
                >
                  <Save className="w-6 h-6" /> Confirm Changes
                </button>
                <button onClick={() => { setShowAddCourse(false); setEditingCourse(null); }} className="px-10 py-5 bg-white text-[#0b1120] rounded-2xl font-black border-[4px] border-[#0b1120] hover:bg-gray-50 flex items-center justify-center">
                  Abort
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
