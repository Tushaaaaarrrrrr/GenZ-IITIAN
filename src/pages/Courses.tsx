import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, GraduationCap, Award, ShoppingCart, Loader2 } from 'lucide-react';
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
      <section className="bg-[#0b1120] py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
          >
            Master the Skills of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">the Future</span>
          </motion.h1>
          <p className="text-xl text-gray-400 font-bold mb-12 max-w-2xl mx-auto">
            Industry-relevant courses designed and taught by IITians and Industry Experts.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for courses (Python, Web Dev, AI...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white/5 border-2 border-white/10 rounded-[2rem] text-white font-bold text-lg focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group bg-white border-[3px] border-[#0b1120] rounded-[2.5rem] overflow-hidden hover:shadow-[12px_12px_0px_#10b981] transition-all flex flex-col ${
                  course.isPinned ? 'ring-4 ring-blue-500/20' : ''
                }`}
              >
                <div className="relative aspect-video overflow-hidden border-b-[3px] border-[#0b1120]">
                  <img
                    src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full border-2 border-[#0b1120] font-black text-sm shadow-[4px_4px_0px_#0b1120]">
                    ₹{course.price}
                  </div>
                  {course.isPinned && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full border-2 border-[#0b1120] text-xs font-black shadow-[4px_4px_0px_#0b1120]">
                      FEATURED
                    </div>
                  )}
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  {course.learn?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.learn.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 border-2 border-[#0b1120] rounded-lg text-xs font-black uppercase text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-[#0b1120] mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-gray-500 font-bold text-sm mb-6 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 bg-gray-50 p-2 rounded-xl border-2 border-transparent hover:border-gray-100 transition-colors">
                      <GraduationCap className="w-4 h-4 text-blue-500" /> IITian Instructor
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 bg-gray-50 p-2 rounded-xl">
                      <Award className="w-4 h-4 text-green-500" /> Certificate
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex-1 py-4 bg-white text-[#0b1120] rounded-2xl font-black text-center border-2 border-[#0b1120] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => buyNow({
                        id: course.id,
                        name: course.name,
                        price: course.price,
                        lms_course_id: String(course.id)
                      })}
                      className="flex-1 py-4 bg-[#10b981] text-white rounded-2xl border-2 border-[#0b1120] hover:bg-[#059669] transition-all font-black shadow-[4px_4px_0px_#0b1120] active:translate-y-1 active:translate-x-1 active:shadow-none"
                    >
                      Buy Now
                    </button>
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
