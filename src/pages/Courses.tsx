import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, GraduationCap, Award, ShoppingCart, Loader2, Star, Calendar, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, buyNow } = useCart();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#0b1120] py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight"
          >
            Master the Skills of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">the Future</span>
          </motion.h1>
          <p className="text-base text-gray-400 font-bold mb-8 max-w-2xl mx-auto">
            Industry-relevant courses designed and taught by IITians and Industry Experts.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for courses (Python, Web Dev, AI...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white font-bold text-base focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#0b1120]" />
            <span className="font-black text-gray-400">Loading courses...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-black text-gray-400">No courses found matching your search.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group bg-white border-[3px] border-[#0b1120] rounded-2xl overflow-hidden hover:shadow-[12px_12px_0px_#10b981] transition-all flex flex-col ${
                  course.isPinned ? 'ring-4 ring-blue-500/20' : ''
                }`}
              >
                <div className="p-6 flex-grow flex flex-col relative bg-white">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.subject && (
                      <span className="px-4 py-1.5 bg-yellow-100 border-2 border-[#0b1120] rounded-xl text-xs font-black uppercase text-yellow-800">
                        {course.subject}
                      </span>
                    )}
                    {course.isBundle && (
                      <span className="px-4 py-1.5 bg-purple-100 border-2 border-[#0b1120] rounded-xl text-xs font-black uppercase text-purple-800 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Bundle
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-[#0b1120] mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  
                  <p className="text-gray-500 font-bold text-sm mb-6">
                    {course.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Starts From</div>
                        <div className="flex flex-col">
                          {course.discountPrice && (
                            <span className="text-xs font-black text-gray-400 line-through">₹{course.price}</span>
                          )}
                          <span className="text-3xl font-black text-[#10b981]">
                            ₹{course.discountPrice || course.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        to={`/courses/${course.id}`}
                        className="w-full py-3 bg-white text-[#0b1120] rounded-xl font-black text-center text-lg border-[3px] border-[#0b1120] hover:bg-gray-50 transition-all active:translate-y-1"
                      >
                        Explore
                      </Link>
                      <Link
                        to={`/checkout/${course.id}`}
                        className="w-full py-3 bg-[#10b981] text-[#0b1120] rounded-xl border-[3px] border-[#0b1120] hover:bg-[#0ea5e9] transition-all font-black text-lg shadow-[4px_4px_0px_#0b1120] active:translate-y-1 active:translate-x-1 active:shadow-none text-center"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
