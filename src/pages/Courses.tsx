import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CourseCard, { CourseCardData } from '../components/CourseCard';

export default function Courses() {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('isPinned', { ascending: false })
      .order('created_at', { ascending: false });
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
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-6 py-2 bg-yellow-400 text-[#0b1120] font-black text-sm md:text-base rounded-full mb-8 shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-bounce"
          >
            ⌛ SALE ENDS ON 25 MAY — DON'T MISS OUT!
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight"
          >
            🚀 MAY TERM EARLY BIRD SALE: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Start Strong, Save More!</span>
          </motion.h1>
          
          <div className="max-w-3xl mx-auto mb-10">
            <p className="text-lg md:text-xl text-gray-300 font-bold mb-3 leading-relaxed">
              Learn from <span className="text-white">IITM BS seniors</span> with a practical-first approach, clear concepts, real strategies, and zero unnecessary theory.
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.2em] opacity-80 italic">
              Note: Access is granted immediately after successful payment verification
            </p>
            <p className="w-full text-right text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60 mt-8">
               📅 Class access till end term • 💬 Language: Hinglish
            </p>
          </div>

          {/* Search bar removed per user request */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex"
              >
                <CourseCard course={course} className="w-full" />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
