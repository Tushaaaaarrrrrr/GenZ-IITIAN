import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Award, CheckCircle2, X as XIcon, Star } from 'lucide-react';
import { useInView, animate } from 'motion/react';
import { Link } from 'react-router-dom';
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
      .order('created_at', { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

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
              <Link to="/courses" className="px-6 py-3 sm:px-8 sm:py-4 lg:text-lg bg-[#10b981] text-white rounded-xl font-bold text-base border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#10b981] transition-all flex items-center gap-2">
                Explore Courses <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <a href="https://chat.whatsapp.com/Gi4D9yAd99p7q1XeVh0J1e" target="_blank" rel="noopener noreferrer" className="px-6 py-3 sm:px-8 sm:py-4 lg:text-lg bg-white text-[#0b1120] rounded-xl font-bold text-base border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#10b981] transition-all flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-xs text-white">💬</span>
                </div>
                WhatsApp Community
              </a>
              <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 sm:px-8 sm:py-4 lg:text-lg bg-white text-[#0b1120] rounded-xl font-bold text-base border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#10b981] transition-all flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="sm:w-3 sm:h-3"><path d="M8 5v14l11-7z" /></svg>
                </div>
                YouTube
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
            <h2 className="text-2xl lg:text-3xl font-black text-white">Featured Cohorts</h2>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-black text-[#0b1120] bg-white border-[3px] border-[#0b1120] rounded-xl px-5 py-3 shadow-[4px_4px_0px_#10b981] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#10b981] transition-all"
            >
              See All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin w-8 h-8 border-[3px] border-[#10b981] border-t-white rounded-full"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white border-[3px] border-[#0b1120] rounded-2xl p-8 text-center shadow-[8px_8px_0px_#10b981]">
              <h3 className="text-2xl font-black text-[#0b1120] mb-2">No courses published yet</h3>
              <p className="text-sm font-bold text-gray-500">Add courses from the manager panel and they will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats & Ecosystem Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* New Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { value: 13, suffix: "K+", label: "YouTube Subscribers", bgColor: "bg-[#f1f5f9]" },
            { value: 1000, suffix: "+", label: "Students Learning", bgColor: "bg-[#10b981]", textColor: "text-white" },
            { value: 50, suffix: "+", label: "IIT-Level Courses", bgColor: "bg-white" }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bgColor} border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[6px_6px_0px_#0b1120] text-center hover:translate-y-[-4px] transition-transform`}>
              <div className={`text-4xl lg:text-5xl font-black ${stat.textColor || 'text-[#0b1120]'} mb-2`}>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className={`text-sm lg:text-base font-black ${stat.textColor || 'text-[#0b1120]'} uppercase tracking-tight`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ecosystem Triple Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: Ecosystem Features */}
          <div className="bg-[#10b981] border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-12 shadow-[10px_10px_0px_#0b1120] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full border-l-4 border-b-4 border-[#0b1120]/20 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black text-white leading-[1.1] mb-6">
                Experience the Powerful and Best Ecosystem
              </h2>
              <p className="text-white/90 font-bold text-lg mb-10 max-w-lg">
                See how our platform simplifies complex concepts and helps you ace your exams with ease.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {[
                  "Daily Live", "Recorded classes", "Weekly Mock Test", 
                  "Live Doubts", "Graded Practice", "Assignments", 
                  "Imp Ques & Blueprint", "Curated"
                ].map((tag, i) => (
                  <span key={i} className="px-5 py-2.5 bg-white border-[3px] border-[#0b1120] rounded-full text-sm font-black text-[#0b1120] shadow-[3px_3px_0px_#0b1120] whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: Mentoring */}
          <div className="bg-[#0b1120] border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-12 shadow-[10px_10px_0px_#10b981] relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black text-white leading-[1.1] mb-6">
                Personally mentoring India's next top engineers
              </h2>
              <p className="text-gray-400 font-bold text-lg leading-relaxed max-w-lg">
                Taking you from basics to advanced through practical learning and real-world problem solving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Shapes */}
        <div className="absolute top-20 left-[5%] w-16 h-16 bg-yellow-200 rounded-full border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-40 right-[8%] w-20 h-20 bg-blue-200 rounded-2xl border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] opacity-50 rotate-12"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-[#f3e8ff] text-[#7c3aed] border-[2px] border-[#7c3aed] rounded-full font-black text-sm mb-4">
              The Clear Choice
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-[#0b1120] mb-4">Why Gen-Z IITian?</h2>
            <p className="text-gray-500 font-bold text-lg">Compare and see the difference for yourself.</p>
          </div>

          <div className="relative overflow-x-auto pb-8">
            <div className="min-w-[800px] border-[4px] border-[#0b1120] rounded-[2rem] bg-white shadow-[12px_12px_0px_#0b1120] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b1120] text-white">
                    <th className="p-8 text-2xl font-black border-b-[4px] border-[#0b1120]">Features</th>
                    <th className="p-8 text-2xl font-black text-center bg-[#dcfce7] text-[#0b1120] relative border-b-[4px] border-[#0b1120]">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#10b981] text-white text-xs font-black rounded-full border-2 border-[#0b1120] uppercase tracking-wider whitespace-nowrap">
                        Your Best Bet
                      </div>
                      GenZ IITian
                    </th>
                    <th className="p-8 text-xl font-black text-center border-b-[4px] border-[#0b1120]">YouTube Lectures</th>
                    <th className="p-8 text-xl font-black text-center border-b-[4px] border-[#0b1120]">Other Courses</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[3px] divide-[#0b1120]">
                  {[
                    "Affordable", "Live Lec + Recordings", "Premium Notes",
                    "Live Doubt Session", "Revision Session", "Mentorship Session",
                    "Resume + LinkedIn Workshops", "Short Notes", "Subject wise blueprint"
                  ].map((feature, i) => (
                    <tr key={i} className="group hover:bg-gray-50 transition-colors">
                      <td className="p-6 font-black text-[#0b1120] text-lg flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#0b1120]"></div>
                        {feature}
                      </td>
                      <td className="p-6 text-center bg-[#f0fdf4] border-x-[3px] border-[#0b1120]/10">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-[#10b981] bg-white shadow-[2px_2px_0px_#10b981]">
                          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                        </div>
                      </td>
                      <td className="p-6 text-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                        <XIcon className="w-8 h-8 text-red-400 mx-auto" />
                      </td>
                      <td className="p-6 text-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                        <XIcon className="w-8 h-8 text-red-400 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
