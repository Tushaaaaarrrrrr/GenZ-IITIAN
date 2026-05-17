import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Layers,
  Languages,
  X
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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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
            <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-6 shadow-[8px_8px_0px_#10b981] text-[#0b1120] relative">
              <div className="absolute -top-4 right-4 bg-red-500 text-white font-black px-4 py-1.5 rounded-xl border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] text-sm tracking-widest uppercase rotate-6 animate-pulse z-10">
                SALE IS LIVE!
              </div>
              <div className="text-xs font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                Special Offer Price
              </div>
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
                <div className="flex items-center gap-3 font-bold text-gray-600 text-sm">
                  <Languages className="w-5 h-5 text-purple-500" /> Language: Hinglish
                </div>
                {course.courseCategory && course.courseCategory !== 'NONE' && (
                  <div className="flex items-center gap-3 font-bold text-gray-600 text-sm">
                    <span className={`text-lg ${
                      course.courseCategory === 'QUALIFIER' ? 'text-blue-600' :
                      course.courseCategory === 'LIVE' ? 'text-purple-600' :
                      course.courseCategory === 'RECORDED' ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {course.courseCategory === 'QUALIFIER' && '🎯'} {course.courseCategory === 'LIVE' && '📺'} {course.courseCategory === 'RECORDED' && '📹'}
                    </span>
                    <span className="font-black">{course.courseCategory}</span>
                  </div>
                )}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {course.bundleCourses.map((bc: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white border-2 border-[#0b1120] rounded-xl font-bold flex items-center gap-2 shadow-[3px_3px_0px_#0b1120] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="line-clamp-2">{bc.courseName}</span>
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

          {/* Comparison Cards Section */}
          <div className="mt-12 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#0b1120] mb-3">Compare Our Batches</h2>
              <p className="text-base font-bold text-gray-500 max-w-2xl mx-auto">
                Choose the perfect format that fits your learning style, schedule, and goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Live Batch Card */}
              <div className="bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-6 shadow-[6px_6px_0px_#8b5cf6] flex flex-col justify-between relative group hover:-translate-y-1 transition-transform duration-200">
                <div>
                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 border-2 border-[#0b1120] rounded-full text-xs font-black uppercase tracking-wider mb-4">
                    📺 Live Batch
                  </div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-4">Interactive Learning</h3>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Daily live classes</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Access to all lecture recordings</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>PYQ & GA live-solving sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Weekly live doubt-solving sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Full syllabus-focused preparation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Practice test discussions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Study anytime, anywhere</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Recorded Batch Card */}
              <div className="bg-white border-[3px] border-[#0b1120] rounded-[2rem] p-6 shadow-[6px_6px_0px_#f97316] flex flex-col justify-between relative group hover:-translate-y-1 transition-transform duration-200">
                <div>
                  <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 border-2 border-[#0b1120] rounded-full text-xs font-black uppercase tracking-wider mb-4">
                    📹 Recorded Batch
                  </div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-4">Self-Paced Study</h3>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>Access to all lecture recordings</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>PYQ & GA Recorded sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>Weekly live doubt-solving sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>Full syllabus-focused preparation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>Practice test discussions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>Study anytime, anywhere</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-100">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-center">
                    <span className="text-[11px] font-black text-orange-700 uppercase tracking-wider block">
                      🔥 BEST FOR DUAL DEGREE & WORKING PROFESSIONALS
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualifier Batch Card */}
              <div className="bg-[#f0fdfa] border-[3px] border-[#0b1120] rounded-[2rem] p-6 shadow-[6px_6px_0px_#10b981] flex flex-col justify-between relative group hover:-translate-y-1 transition-transform duration-200">
                <div className="absolute -top-3 right-4 bg-emerald-500 text-white font-black px-3 py-1 rounded-lg border-2 border-[#0b1120] text-[10px] tracking-wide uppercase rotate-3 shadow-[2px_2px_0px_#0b1120]">
                  Risk Free
                </div>

                <div>
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 border-2 border-[#0b1120] rounded-full text-xs font-black uppercase tracking-wider mb-4">
                    🎯 CHAMPION Batch
                  </div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-2">Only for Qualifiers</h3>
                  <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-4">Guaranteed Success</p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Daily live classes</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Access to all lecture recordings</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>PYQ & GA live-solving sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Weekly live doubt-solving sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Full syllabus-focused preparation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>GA live-solving sessions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Practice test discussions & solutions</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-bold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Study anytime, anywhere</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm font-black text-blue-600">
                      <Star className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0 mt-0.5" />
                      <span>Best Test series for free</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto pt-4 border-t-2 border-dashed border-emerald-200">
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 text-center mb-2">
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider block">
                      💎 FULL REFUND IF NOT QUALIFIED
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsTermsModalOpen(true)}
                    className="w-full text-center text-xs font-black text-blue-600 hover:text-blue-800 underline decoration-2 cursor-pointer transition-colors block"
                  >
                    *Terms and conditions apply
                  </button>
                </div>
              </div>
            </div>
          </div>

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
          <div className="sticky top-24 space-y-6">
            {/* Dynamic Content Cards Based on Course Category */}
            {course.courseCategory === 'QUALIFIER' && (
              <>
                <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">🎯</span>
                    <h3 className="text-xl font-black text-[#0b1120]">Qualifier Prep</h3>
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">
                    Master the fundamentals with intensive qualifier-focused Content . Comprehensive coverage of all major topics with practice tests and doubt resolution.
                  </p>
                </div>
                <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#10b981]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">✅</span>
                    <h3 className="text-xl font-black text-[#0b1120]">What You Get</h3>
                  </div>
                  <ul className="text-sm font-bold text-gray-600 space-y-2">
                    <li>✓ Complete qualifier Week 1- 4 syllabus coverage</li>
                    <li>✓ Topic-wise mock tests and test series</li>
                    <li>✓ 1-on-1 GUIDANCE</li>
                    <li>✓ Daily live classes</li>
                  </ul>
                </div>
              </>
            )}
            
            {course.courseCategory === 'LIVE' && (
              <>
                <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">📺</span>
                    <h3 className="text-xl font-black text-[#0b1120]">Live Sessions</h3>
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">
                    Interactive daily live classes with real-time Q&A. Connect directly with instructors and peers. Ask doubts instantly and get clarifications on the spot.
                  </p>
                </div>
                <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#10b981]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">⚡</span>
                    <h3 className="text-xl font-black text-[#0b1120]">Live Features</h3>
                  </div>
                  <ul className="text-sm font-bold text-gray-600 space-y-2">
                    <li>✓ Instant doubt solving in live class</li>
                    <li>✓ all lectures recordings available</li>
                    <li>✓ and more..</li>
                  </ul>
                </div>
              </>
            )}
            
            {course.courseCategory === 'RECORDED' && (
              <>
                <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#0b1120]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">📹</span>
                    <h3 className="text-xl font-black text-[#0b1120]">Self-Paced Learning</h3>
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">
                    Learn at your own pace with pre recorded video lessons. Rewatch, pause, and learn every concept without time pressure.
                  </p>
                </div>
                <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[8px_8px_0px_#10b981]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">🎓</span>
                    <h3 className="text-xl font-black text-[#0b1120]">Recorded Benefits</h3>
                  </div>
                  <ul className="text-sm font-bold text-gray-600 space-y-2">
                    <li>✓ No time bound</li>
                    <li>✓ Watch anytime, anywhere</li>
                    <li>✓ HD quality videos</li>
                    <li>✓ Weekly live doubt session</li>
                    <li>✓ Downloadable resources</li>
                  </ul>
                </div>
              </>
            )}

            {/* GENz IITian Card - Always Visible */}
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

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 text-[#0b1120]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTermsModalOpen(false)}
              className="absolute inset-0 bg-[#0b1120]/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] w-full max-w-2xl p-6 md:p-8 relative shadow-[12px_12px_0px_#10b981] overflow-hidden max-h-[85vh] flex flex-col z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border-2 border-[#0b1120] shadow-[2px_2px_0px_#0b1120] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="border-b-4 border-[#0b1120] pb-4 mb-6 pr-12 text-left">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 border-2 border-[#0b1120] rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  📜 Official Policy
                </span>
                <h2 className="text-2xl md:text-3xl font-black leading-tight text-[#0b1120]">
                  Qualifier Champion Batch <br />
                  <span className="text-[#3b82f6]">Terms & Conditions</span>
                </h2>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto space-y-4 pr-2 font-bold text-gray-700 leading-relaxed text-sm scrollbar-thin text-left">
                <p>
                  Students who ENROLL in Qualify Champion Badge will be eligible for a full refund or free reattempt support, provided all the conditions below are fulfilled.
                </p>

                <div>
                  <h3 className="text-base font-black text-[#0b1120] mt-4 mb-2">Eligibility Criteria</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You must attend at least 80% of live classes.</li>
                    <li>Weekly tests will be conducted based on the topics taught in class. You must score the minimum required marks in these tests.</li>
                    <li>You must regularly share your GA marks/progress with the team. and Be eligible for GIVING QUALIFIER exam offline</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#0b1120] mt-4 mb-2">What We Provide</h3>
                  <p className="mb-2">We are committed to giving you:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Complete academic support</li>
                    <li>Live classes and study resources</li>
                    <li>Weekly practice and evaluation</li>
                    <li>Premium guidance and mentorship</li>
                    <li>1-to-1 mentorship to help you choose the best strategy and action plan for your preparation</li>
                  </ul>
                </div>

                <p className="mt-4">
                  We will provide everything needed from our side. In return, we expect dedication, discipline, and focus from yours.
                </p>

                <p className="mt-4">
                  That’s all — maintain:
                </p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>80% attendance</li>
                  <li>Weekly test qualification</li>
                  <li>Active participation and seriousness toward studies</li>
                </ul>

                <p className="mt-4 font-black text-[#0b1120]">
                  Thank you.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 mt-6 border-t-2 border-gray-100 flex justify-end">
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="px-6 py-3 bg-[#0b1120] text-white rounded-xl font-black text-sm border-2 border-[#0b1120] hover:bg-[#10b981] hover:border-[#10b981] transition-all shadow-[4px_4px_0px_#3b82f6] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
