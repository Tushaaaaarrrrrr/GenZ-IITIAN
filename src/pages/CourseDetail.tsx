import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 

  CheckCircle2, 
  ChevronRight, 

  Users,
  Star,
  ArrowLeft,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCheckoutPath } from '../utils/courseRouting';

function formatCourseDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}



export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Course not found:', error);
      navigate('/courses');
      return;
    }
    setCourse(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-[#0b1120]" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Header */}
      <div className="bg-[#0b1120] text-white pt-24 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-bold mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            
            <div className="flex gap-3 mb-6">
              {course.subject && (
                <span className="px-4 py-1 bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 rounded-full text-xs font-black uppercase tracking-wider">
                  {course.subject}
                </span>
              )}
              {course.isBundle && (
                <span className="px-4 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Bundle
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              {course.name}
            </h1>
            
            <p className="text-lg text-gray-400 font-bold mb-8 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <Users className="w-7 h-7 text-[#10b981]" />
                <div className="leading-none">
                  <div className="text-3xl font-black text-white">500+</div>
                  <div className="text-gray-400 font-black uppercase tracking-wide mt-2">Students</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                <div className="leading-none">
                  <div className="text-3xl font-black text-white">4.9</div>
                  <div className="text-gray-400 font-black uppercase tracking-wide mt-2">Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-7 h-7 text-blue-400" />
                <div className="leading-none">
                  <div className="text-3xl font-black text-white">95%</div>
                  <div className="text-gray-400 font-black uppercase tracking-wide mt-2">Success</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative lg:block"
          >
            <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-6 shadow-[8px_8px_0px_#10b981] text-[#0b1120]">
              <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Course Starts From</div>
              <div className="flex items-baseline gap-4 mb-6">
                <div className="text-4xl font-black">₹{course.discountPrice || course.price}</div>
                {course.discountPrice && (
                  <div className="text-2xl font-black text-gray-400 line-through">₹{course.price}</div>
                )}
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="font-black text-gray-400 text-sm uppercase tracking-widest border-b-2 border-gray-100 pb-2">Includes</div>
                <div className="flex items-center gap-3 font-bold text-gray-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Access till End Term
                </div>
                {course.startDate && (
                  <div className="flex items-center gap-3 font-bold text-gray-600 text-sm">
                    <Calendar className="w-5 h-5 text-blue-500" /> Class starting from: {formatCourseDate(course.startDate)}
                  </div>
                )}
                {course.endDate && (
                  <div className="flex items-center gap-3 font-bold text-gray-600 text-sm">
                    <Calendar className="w-5 h-5 text-red-500" /> Class ends on: {formatCourseDate(course.endDate)}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Link 
                  to={getCheckoutPath({ id: String(course.id), name: course.name })}
                  className="w-full py-5 bg-[#0b1120] text-white rounded-2xl font-black text-xl border-2 border-[#0b1120] hover:bg-white hover:text-[#0b1120] transition-all flex items-center justify-center gap-2 shadow-[6px_6px_0px_#0b1120] active:translate-y-1 active:shadow-none text-center"
                >
                  Enroll Now <ChevronRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Content */}
      <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Bundle Content */}
          {course.isBundle && course.bundleCourses?.length > 0 && (
            <div>
              <h2 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 border-2 border-[#0b1120]">
                  <Layers className="w-6 h-6" />
                </div>
                Included in this Bundle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.bundleCourses.map((bc: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white border-2 border-[#0b1120] rounded-2xl font-bold flex items-start gap-4 shadow-[4px_4px_0px_#0b1120]">
                    <CheckCircle2 className="w-6 h-6 text-purple-600 mt-0.5 shrink-0" />
                    {bc.courseName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Who is this for? */}
          {course.who && (
            <div>
              <h2 className="text-3xl font-black text-[#0b1120] mb-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 border-2 border-[#0b1120]">
                  <Users className="w-6 h-6" />
                </div>
                Who is this for?
              </h2>
              <div className="bg-gray-50 border-[3px] border-[#0b1120] rounded-3xl p-8 font-bold text-gray-600 leading-relaxed shadow-[6px_6px_0px_#0b1120]">
                {course.who}
              </div>
            </div>
          )}

          {/* What you'll learn */}
          {course.learn?.length > 0 && (
            <div>
              <h2 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 border-2 border-[#0b1120]">
                  <BookOpen className="w-6 h-6" />
                </div>
                What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learn.map((item: string) => (
                  <div key={item} className="p-5 bg-white border-2 border-[#0b1120] rounded-2xl font-bold flex items-start gap-4 shadow-[4px_4px_0px_#0b1120]">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {course.cohortContent && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-3">What You Get in the Cohort</h2>
                <p className="text-base font-bold text-gray-500 max-w-3xl mx-auto">
                  Everything you need to master {course.name} with confidence.
                </p>
              </div>

              <div className="bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-8 lg:p-10 font-bold text-[#0b1120] leading-relaxed shadow-[8px_8px_0px_#10b981] whitespace-pre-wrap text-lg">
                {course.cohortContent}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {course.outcomes && (
            <div>
              <h2 className="text-3xl font-black text-[#0b1120] mb-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 border-2 border-[#0b1120]">
                  <Award className="w-6 h-6" />
                </div>
                Outcomes
              </h2>
              <div className="bg-[#0b1120] text-white rounded-3xl p-8 lg:p-12 font-bold leading-relaxed shadow-[10px_10px_0px_#10b981]">
                {course.outcomes}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar instructor info */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120]">
              <h3 className="text-xl font-black text-[#0b1120] mb-6 border-b-2 border-gray-100 pb-4">GENz IITian</h3>
              <div className="mb-6">
                <div>
                  <div className="font-black text-[#0b1120]">Learn from IITM BS Seniors</div>
                  <div className="text-xs font-bold text-blue-600 uppercase">Real Guidance</div>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                No boring lectures - just real guidance from seniors who&apos;ve been through it. Understand concepts deeply, avoid common mistakes, and level up your prep the right way.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
