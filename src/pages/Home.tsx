import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Award, CheckCircle2, X as XIcon, Star, Layers, GraduationCap } from 'lucide-react';
import { useInView, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CourseCard, { CourseCardData } from '../components/CourseCard';
import HeroAnimation from '../components/HeroAnimation';
import { supabase } from '../lib/supabase';

function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number, decimals?: number, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(value.toFixed(decimals));
        }
      });
      return () => controls.stop();
    }
  }, [value, decimals, isInView]);

  return <span ref={nodeRef}>{displayValue}{suffix}</span>;
}

export default function Home() {
  const { buyNow } = useCart();
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const featuredCourse = courses[0];
  const secondaryCourses = courses.slice(1);

  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Text Content */}
          <div className="relative z-10 flex flex-col items-start">
            <div className="inline-block px-4 py-1.5 bg-[#eef2ff] text-[#0b1120] font-bold text-xs sm:text-sm rounded-full border-2 border-[#0b1120] mb-5 sm:mb-6">
              India's Best platform for Online/Hybrid Degree students.
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4 sm:mb-6 text-[#0b1120]">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Gen-Z IITian
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              We help online and hybrid degree students master IIT-level courses with smart notes, quizzes, PYQs, and expert-led lectures.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link to="/courses" className="px-6 py-3 sm:px-8 sm:py-4 lg:text-lg bg-[#10b981] text-white rounded-xl font-bold text-base border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all flex items-center gap-2">
                Explore Courses <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 sm:px-8 sm:py-4 lg:text-lg bg-white text-[#0b1120] rounded-xl font-bold text-base border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="sm:w-3 sm:h-3"><path d="M8 5v14l11-7z" /></svg>
                </div>
                Watch on YouTube
              </a>
            </div>
          </div>

          {/* Graphic/Animation Area */}
          <HeroAnimation />
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="bg-[#0b1120] py-12 border-t-[3px] border-b-[3px] border-[#0b1120] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white">Featured Cohorts</h2>
              <p className="text-sm font-bold text-gray-300 mt-2">
                This section now pulls directly from the live courses list, so every new course or bundle also appears here.
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-black text-[#0b1120] bg-white border-[3px] border-[#0b1120] rounded-xl px-5 py-3 shadow-[4px_4px_0px_#10b981] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#10b981] transition-all"
            >
              See All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-12">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin w-8 h-8 border-[3px] border-[#10b981] border-t-white rounded-full"></div>
              </div>
            ) : !featuredCourse ? (
              <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-8 text-center shadow-[8px_8px_0px_#10b981]">
                <h3 className="text-2xl font-black text-[#0b1120] mb-2">No courses published yet</h3>
                <p className="text-sm font-bold text-gray-500">Add courses from the manager panel and they will appear here automatically.</p>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#10b981] rounded-2xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                  <div className="relative bg-white border-[3px] border-[#0b1120] rounded-2xl p-4 lg:p-6 flex flex-col lg:flex-row gap-8 transition-transform hover:-translate-y-1 hover:-translate-x-1">
                    <div className="w-full lg:w-1/2 aspect-video rounded-2xl border-2 border-[#0b1120] overflow-hidden relative bg-[linear-gradient(135deg,#0b1120_0%,#172554_55%,#10b981_100%)]">
                      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                      <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between text-white">
                        <div className="flex flex-wrap gap-2">
                          {featuredCourse.isPinned && (
                            <span className="px-3 py-1 bg-[#10b981] text-white font-black text-[10px] rounded-full border-2 border-white/20 uppercase tracking-wide">
                              Most Popular
                            </span>
                          )}
                          <span className="px-3 py-1 bg-white text-[#0b1120] font-black text-[10px] rounded-full border-2 border-[#0b1120] uppercase tracking-wide">
                            {featuredCourse.isBundle ? 'Bundle' : featuredCourse.subject || 'Course'}
                          </span>
                        </div>

                        <div>
                          <div className="w-16 h-16 bg-white text-[#0b1120] rounded-2xl border-[3px] border-[#0b1120] flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(11,17,32,0.4)]">
                            {featuredCourse.isBundle ? <Layers className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-black leading-tight mb-3">{featuredCourse.name}</h3>
                          <p className="text-sm sm:text-base font-bold text-white/80 max-w-lg">
                            {featuredCourse.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="px-4 py-2 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-sm">
                            <div className="text-[10px] font-black uppercase tracking-wider text-white/60">Starts From</div>
                            <div className="text-2xl font-black">₹{featuredCourse.discountPrice || featuredCourse.price}</div>
                          </div>
                          {featuredCourse.isBundle && (
                            <div className="px-4 py-2 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-sm">
                              <div className="text-[10px] font-black uppercase tracking-wider text-white/60">Included Courses</div>
                              <div className="text-2xl font-black">{featuredCourse.bundleCourses?.length || 0}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="inline-block px-3 py-1 bg-[#10b981] text-white font-black text-[10px] rounded-full border-2 border-[#0b1120] uppercase tracking-wide">
                          {featuredCourse.isPinned ? 'Most Popular' : 'Featured'}
                        </div>
                        {featuredCourse.isBundle && (
                          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 font-black text-[10px] rounded-full border-2 border-purple-300 uppercase tracking-wide">
                            Bundle Offer
                          </div>
                        )}
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-black text-[#0b1120] mb-3 leading-tight">
                        {featuredCourse.name}
                      </h3>
                      <p className="text-gray-600 font-bold mb-6 text-xs lg:text-sm">
                        {featuredCourse.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredCourse.isBundle ? (
                          featuredCourse.bundleCourses?.map((bundleCourse, idx) => (
                            <span
                              key={`${bundleCourse.courseId}-${idx}`}
                              className="px-3 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-black text-gray-700"
                            >
                              {bundleCourse.courseName}
                            </span>
                          ))
                        ) : (
                          featuredCourse.subject && (
                            <span className="px-3 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-black text-gray-700">
                              {featuredCourse.subject}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-end gap-3 mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-500 mb-0.5">Starting at</span>
                          <span className="text-3xl font-black text-[#0b1120] leading-none">₹{featuredCourse.discountPrice || featuredCourse.price}</span>
                        </div>
                        {featuredCourse.discountPrice && (
                          <span className="text-lg font-bold text-gray-400 line-through mb-1">₹{featuredCourse.price}</span>
                        )}
                        <span className="px-2 py-0.5 bg-[#d1fae5] text-[#059669] border-2 border-[#0b1120] rounded-full text-[10px] font-black mb-2">
                          {featuredCourse.isBundle ? 'Bundle' : 'Live + Rec'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        <Link
                          to={`/courses/${featuredCourse.id}`}
                          className="flex-1 py-3 bg-white text-[#0b1120] rounded-xl font-bold text-lg border-2 border-[#0b1120] hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
                        >
                          Explore Details
                        </Link>
                        <Link 
                          onClick={() => buyNow(featuredCourse)}
                          to="/cart"
                          className="flex-1 py-3 bg-[#10b981] text-white rounded-xl font-bold text-lg border-2 border-[#0b1120] hover:bg-[#059669] transition-colors shadow-[4px_4px_0px_#0b1120] active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center justify-center"
                        >
                          Enroll Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {secondaryCourses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {secondaryCourses.map((course) => (
                      <div key={course.id}>
                        <CourseCard course={course} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats & Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {[
            { value: 15, suffix: "K+", label: "Active Learners", sub: "Across India" },
            { value: 95, suffix: "%", label: "Success Rate", sub: "In Qualifier Exams" },
            { value: 50, suffix: "+", label: "Expert Tutors", sub: "IITians & Experts" },
            { value: 4.9, suffix: "/5", label: "Student Rating", sub: "Verified Reviews", decimals: 1 }
          ].map((stat, i) => (
            <div key={i} className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[5px_5px_0px_#0b1120] text-center hover:translate-y-[-4px] transition-transform">
              <div className="text-3xl font-black text-[#0b1120] mb-1">
                <AnimatedNumber value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-black text-blue-600 uppercase tracking-tight">{stat.label}</div>
              <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0b1120] leading-tight">
              Why thousands of IITians <br />
              <span className="text-[#10b981]">choose Gen-Z.</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: "IIT Level Curriculum", desc: "Courses designed matching the exact standard of IIT Madras degree programs." },
                { title: "PYQ Analysis Blocks", desc: "Step-by-step breakdown of previous year questions to master exam patterns." },
                { title: "Live Doubt Clearing", desc: "Interact with tutors who have already cracked the qualifier and diploma." }
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-[#e0f2fe] border-2 border-[#0b1120] rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#0b1120]">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#0b1120] text-lg mb-1">{f.title}</h4>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#0b1120] rounded-[2.5rem] rotate-3 -z-10 shadow-[10px_10px_0px_#10b981]"></div>
            <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-10 relative overflow-hidden h-[400px] flex items-center justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full border-l-4 border-b-4 border-[#0b1120]"></div>
              <div className="relative text-center">
                <div className="inline-block p-4 bg-orange-100 rounded-2xl border-[3px] border-[#0b1120] mb-6 animate-bounce">
                  <Award className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-[#0b1120] mb-4">Master Your <br /> Future Today</h3>
                <p className="text-gray-500 font-bold max-w-[200px] mx-auto text-sm">Join the most active community of online IITians.</p>
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-blue-50 border-[3px] border-[#0b1120] rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-[#0b1120]" />
                <div className="flex-1">
                  <div className="h-2 w-24 bg-[#0b1120]/20 rounded-full mb-2" />
                  <div className="h-2 w-16 bg-[#0b1120]/10 rounded-full" />
                </div>
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview CTA */}
      <section className="bg-blue-600 py-16 px-6 border-t-[3px] border-b-[3px] border-[#0b1120]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-block p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-md border border-white/20">
             <Star className="w-8 h-8 text-yellow-300 fill-current" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black mb-8 leading-tight">Start your preparation journey with expert guidance.</h2>
          <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center gap-4 bg-white text-[#0b1120] px-10 py-5 rounded-2xl font-black text-xl border-[4px] border-[#0b1120] shadow-[8px_8px_0px_#0b1120] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#0b1120] active:translate-y-[2px] active:shadow-[4px_4px_0px_#0b1120] transition-all">
            Unlock Full Potential
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#f8fafc] py-16 border-t-[3px] border-[#0b1120]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-black text-[#0b1120] mb-2 max-w-[18rem] md:max-w-none mx-auto leading-tight">Student Reviews &amp; Shared Experiences</h2>
            <p className="text-gray-600 text-sm font-medium">Discover honest reviews and inspiring stories from students across India.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                text: "The reattempt batch was a game changer. The mock tests were exactly like the real exam pattern and helped me clear comfortably!",
                initial: "A",
                name: "Aryan Sharma",
                role: "Qualifier Student",
                color: "bg-blue-100 text-blue-700"
              },
              {
                text: "Maths 2 concepts were tough, but the Foundation course simplified everything. The doubt sessions helped a lot.",
                initial: "P",
                name: "Priya Patel",
                role: "Maths 2 Student",
                color: "bg-green-100 text-green-700"
              },
              {
                text: "I am pursuing the Diploma now, and Gen-z IITian has been with me since day 1. Best notes and community.",
                initial: "R",
                name: "Rohan Das",
                role: "Diploma Student",
                color: "bg-purple-100 text-purple-700"
              },
              {
                text: "Affordable and high quality. The structure of the Foundation course is perfect for beginners like me.",
                initial: "S",
                name: "Sanya Verma",
                role: "Foundation Student",
                color: "bg-pink-100 text-pink-700"
              },
              {
                text: "The instructors explain everything so clearly. My GPA improved significantly after joining.",
                initial: "V",
                name: "Vikram Singh",
                role: "Maths 2 Student",
                color: "bg-orange-100 text-orange-700"
              },
              {
                text: "Highly recommended for anyone looking for serious prep. The community is very supportive.",
                initial: "M",
                name: "Meera Iyer",
                role: "Diploma Student",
                color: "bg-teal-100 text-teal-700"
              }
            ].map((review, i) => (
              <div key={i} className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[4px_4px_0px_#0b1120] flex flex-col h-full hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all">
                <p className="text-gray-700 font-bold text-base mb-6 flex-grow">"{review.text}"</p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${review.color} border-2 border-[#0b1120] flex items-center justify-center font-black text-xl`}>
                      {review.initial}
                    </div>
                    <div>
                      <div className="font-black text-[#0b1120]">{review.name}</div>
                      <div className="text-sm font-bold text-gray-500">{review.role}</div>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become Instructor Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[#eef2ff] border-[3px] border-[#0b1120] rounded-2xl p-5 lg:p-8 shadow-[6px_6px_0px_#0b1120] relative overflow-hidden flex flex-col lg:flex-row gap-10 items-center">

          {/* Left Side: Stats/Callout */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 relative z-10">
            <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[4px_4px_0px_#0b1120]">
              <div className="w-12 h-12 rounded-full bg-[#ecfdf5] border-[3px] border-[#0b1120] flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-[#10b981]" />
              </div>
              <h3 className="text-xl font-black text-[#0b1120] mb-3">Revenue Share: <span className="text-[#10b981]">60% from Batches</span></h3>
              <p className="text-gray-600 font-bold mb-4 text-sm">
                Do you know our tutor earns 60% of direct revenue from Batches? Start earning today.
              </p>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSd-56OO4DsZ7Dx6jzq7hNr8mcJ1hL0WTgSEtSocyWCa3ayVCQ/viewform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#0b1120] text-white whitespace-nowrap rounded-xl font-bold text-base border-2 border-[#0b1120] hover:bg-gray-800 transition-colors block text-center"
              >
                Become Instructor
              </a>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-2/3 relative z-10 lg:pl-8">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-4 leading-tight">
              Start Sharing Skills, Build Courses, Earn Revenue.
            </h2>
            <p className="text-gray-600 text-base font-bold mb-8 max-w-xl">
              Join our platform, share your expertise, reach thousands of learners, and earn income effortlessly online today.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {[
                "Flexible Teaching Schedule",
                "Global Student Reach",
                "Earn Extra Income",
                "Build Personal Brand"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10b981] border-2 border-[#0b1120] flex items-center justify-center text-white shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-bold text-[#0b1120]">{benefit}</span>
                </div>
              ))}
            </div>

            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSd-56OO4DsZ7Dx6jzq7hNr8mcJ1hL0WTgSEtSocyWCa3ayVCQ/viewform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#10b981] text-white rounded-xl font-bold text-lg border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] whitespace-nowrap hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all inline-block"
            >
              Become Instructor
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
