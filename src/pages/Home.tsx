import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Award, CheckCircle2, X as XIcon, Star } from 'lucide-react';
import { useInView, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import HeroAnimation from '../components/HeroAnimation';


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


  return (
    <div className="min-h-screen bg-white text-[#0b1120] font-sans selection:bg-blue-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Text Content */}
          <div className="relative z-10 flex flex-col items-start">
            <div className="inline-block px-4 py-1.5 bg-[#eef2ff] text-[#0b1120] font-bold text-sm rounded-full border-2 border-[#0b1120] mb-6">
              India's Best platform for Online/Hybrid Degree students.
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-4 sm:mb-6 text-[#0b1120]">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Gen-Z IITian
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-medium mb-6 sm:mb-8 max-w-xl leading-relaxed">
              We help online and hybrid degree students master IIT-level courses with smart notes, quizzes, PYQs, and expert-led lectures.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link to="/courses" className="px-5 py-3 sm:px-8 sm:py-4 bg-[#10b981] text-white rounded-xl font-bold text-base sm:text-lg border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all flex items-center gap-2">
                Explore Courses <ChevronRight className="w-5 h-5" />
              </Link>
              <a href="https://youtube.com/@Gen-ZIITian/" target="_blank" rel="noopener noreferrer" className="px-5 py-3 sm:px-8 sm:py-4 bg-white text-[#0b1120] rounded-xl font-bold text-base sm:text-lg border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
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
      <section className="bg-[#0b1120] py-24 border-t-[3px] border-b-[3px] border-[#0b1120] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-12">
            Featured Cohorts
          </h2>

          <div className="flex flex-col gap-8">
            {/* Main Reattempt Course Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[#10b981] rounded-3xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
              <div className="relative bg-white border-[3px] border-[#0b1120] rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-8 transition-transform hover:-translate-y-1 hover:-translate-x-1">
                {/* Image */}
                <div className="w-full lg:w-1/2 aspect-video bg-gray-100 rounded-2xl border-2 border-[#0b1120] overflow-hidden relative">
                  <img src="/Image/Qualifier.png" alt="Qualifier Reattempt Batch" className="w-full h-full object-contain" />
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 bg-[#10b981] text-white font-black text-xs rounded-full border-2 border-[#0b1120] w-fit mb-4 uppercase tracking-wide">
                    Most Popular
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-4 leading-tight">Qualifier Reattempt Batch</h3>
                  <p className="text-gray-600 font-bold mb-8 text-sm lg:text-base">
                    For qualifier students: live + recording batch with weekly doubt support, PYQ lectures and graded assignment recordings.
                  </p>

                  <div className="flex items-end gap-3 mb-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-500 mb-0.5">Starting at</span>
                      <span className="text-4xl font-black text-[#0b1120] leading-none">₹699</span>
                    </div>
                    <span className="text-xl font-bold text-gray-400 line-through mb-1">₹999</span>
                    <span className="px-2 py-1 bg-[#d1fae5] text-[#059669] border-2 border-[#0b1120] rounded-full text-xs font-black mb-2">Live + Rec</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <Link to="/courses/reattempt" className="w-full py-3 bg-[#0b1120] text-white rounded-xl font-bold text-lg border-2 border-[#0b1120] hover:bg-gray-800 transition-colors text-center flex items-center justify-center">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Courses Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Term 1 Quiz 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#10b981] rounded-3xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-3xl p-6 flex flex-col h-full transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-full aspect-video bg-gray-100 rounded-xl border-2 border-[#0b1120] overflow-hidden mb-6">
                    <img src="/Image/Fundation Term 1.png" alt="Term 1 Quiz 2" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-2">Term 1 Quiz 2</h3>
                  <p className="text-gray-600 font-bold text-xs mb-6 flex-grow">
                    IIT Madras BS Term 1 Quiz 2. Maths 1, Stats 1 and CT.
                  </p>

                  <div className="flex items-end gap-2 mb-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 mb-0.5">Starting at</span>
                      <span className="text-2xl font-black text-[#0b1120] leading-none">₹799</span>
                    </div>
                    <span className="text-sm font-bold text-gray-400 line-through mb-1">₹849</span>
                    <span className="px-2 py-0.5 bg-[#d1fae5] text-[#059669] border-2 border-[#0b1120] rounded-full text-[10px] font-black mb-1.5">Quiz 2</span>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link to="/courses/foundation-1" className="w-full py-2 bg-[#0b1120] text-white rounded-lg font-bold text-sm border-2 border-[#0b1120] hover:bg-gray-800 transition-colors text-center flex items-center justify-center">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Term 2 Quiz 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#10b981] rounded-3xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-3xl p-6 flex flex-col h-full transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-full aspect-video bg-gray-100 rounded-xl border-2 border-[#0b1120] overflow-hidden mb-6">
                    <img src="/Image/Foundation Term 2.png" alt="Term 2 Quiz 2" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-2">Term 2 Quiz 2</h3>
                  <p className="text-gray-600 font-bold text-xs mb-6 flex-grow">
                    IIT Madras BS Term 2 Quiz 2. Maths 2, Stats 2 and Python.
                  </p>

                  <div className="flex items-end gap-2 mb-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 mb-0.5">Starting at</span>
                      <span className="text-2xl font-black text-[#0b1120] leading-none">₹799</span>
                    </div>
                    <span className="text-sm font-bold text-gray-400 line-through mb-1">₹849</span>
                    <span className="px-2 py-0.5 bg-[#d1fae5] text-[#059669] border-2 border-[#0b1120] rounded-full text-[10px] font-black mb-1.5">Quiz 2</span>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link to="/courses/foundation-2" className="w-full py-2 bg-[#0b1120] text-white rounded-lg font-bold text-sm border-2 border-[#0b1120] hover:bg-gray-800 transition-colors text-center flex items-center justify-center">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Diploma Quiz 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#10b981] rounded-3xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-3xl p-6 flex flex-col h-full transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-full aspect-video bg-gray-100 rounded-xl border-2 border-[#0b1120] overflow-hidden mb-6">
                    <img src="/Image/Diploma.png" alt="Diploma Quiz 2" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-2">Diploma Quiz 2</h3>
                  <p className="text-gray-600 font-bold text-xs mb-6 flex-grow">
                    Launch by 20 March. Join waiting list for Java, PDSA, DBMS and MLF.
                  </p>

                  <div className="flex items-end gap-2 mb-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 mb-0.5">Starting at</span>
                      <span className="text-2xl font-black text-[#0b1120] leading-none">Waitlist</span>
                    </div>
                    <span className="text-sm font-bold text-gray-400 mb-1">20 March</span>
                    <span className="px-2 py-0.5 bg-[#d1fae5] text-[#059669] border-2 border-[#0b1120] rounded-full text-[10px] font-black mb-1.5">Quiz 2</span>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link to="/courses/diploma" className="w-full py-2 bg-[#0b1120] text-white rounded-lg font-bold text-sm border-2 border-[#0b1120] hover:bg-gray-800 transition-colors text-center flex items-center justify-center">
                      Join Waiting List
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats & Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Stat Card 1 */}
          <div className="bg-[#eef2ff] border-[3px] border-[#0b1120] rounded-3xl p-8 text-center shadow-[8px_8px_0px_#0b1120]">
            <h3 className="text-5xl font-black text-[#0b1120] mb-2">
              <AnimatedNumber value={13.8} decimals={1} suffix="K+" />
            </h3>
            <p className="text-[#0b1120] font-bold">YouTube Subscribers</p>
          </div>
          {/* Stat Card 2 */}
          <div className="bg-[#10b981] border-[3px] border-[#0b1120] rounded-3xl p-8 text-center shadow-[8px_8px_0px_#0b1120]">
            <h3 className="text-5xl font-black text-white mb-2">
              <AnimatedNumber value={623} suffix="+" />
            </h3>
            <p className="text-[#0b1120] font-bold">Students Learning</p>
          </div>
          {/* Stat Card 3 */}
          <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 text-center shadow-[8px_8px_0px_#0b1120]">
            <h3 className="text-5xl font-black text-[#0b1120] mb-2">
              <AnimatedNumber value={34} suffix="+" />
            </h3>
            <p className="text-[#0b1120] font-bold">IIT-Level Courses</p>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-[#10b981] border-[3px] border-[#0b1120] rounded-3xl p-10 shadow-[8px_8px_0px_#0b1120] relative overflow-hidden">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(#0b1120 2px, transparent 2px), linear-gradient(90deg, #0b1120 2px, transparent 2px)',
                backgroundSize: '40px 40px'
              }}
            ></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">Experience the Powerful and Best Ecosystem</h2>
              <p className="text-white font-medium text-lg mb-10 max-w-md">
                See how our platform simplifies complex concepts and helps you ace your exams with ease.
              </p>

              <div className="flex flex-wrap gap-4">
                {[
                  "Daily Live",
                  "Recorded classes",
                  "Weekly Mock Test",
                  "Live Doubts",
                  "Graded Practice",
                  "Assignments",
                  "Imp Ques & Blueprint",
                  "Curated",
                  "Gen-Z IITian Strategy"
                ].map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      rotate: i % 2 === 0 ? 1 : -1,
                      boxShadow: "8px 8px 0px #0b1120" 
                    }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 260,
                      damping: 20 
                    }}
                    className="bg-white border-[3px] border-[#0b1120] rounded-full px-5 py-2 font-bold text-[#059669] text-sm lg:text-base shadow-[4px_4px_0px_#0b1120] cursor-default"
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-[#0b1120] border-[3px] border-[#0b1120] rounded-3xl p-10 shadow-[8px_8px_0px_#10b981] relative overflow-hidden flex flex-col justify-center">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            ></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">Personally mentoring India's next top engineers</h2>
              <p className="text-gray-300 font-medium text-lg max-w-md">
                Taking you from basics to advanced through practical learning and real-world problem solving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="bg-[#10b981] py-32 border-b-[3px] border-[#0b1120] relative overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#0b1120 2px, transparent 2px), linear-gradient(90deg, #0b1120 2px, transparent 2px)',
            backgroundSize: '40px 40px'
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-4">Experience Gen-Z IITian</h2>
            <p className="text-[#0b1120] text-lg font-bold max-w-2xl mx-auto">
              See how our platform simplifies complex concepts and helps you ace your exams with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: "yZ2RjBIXkpM", title: "Latest Placement Report 2026: Why You Should NOT Do Only IIT Madras BS Degree" },
              { id: "Xml7SkIqKqw", title: "Fee Waiver Verification Mandatory | PAN, ITR & 26A Step-by-Step Verification Guide" },
              { id: "fqdPVCuJzzs", title: "IIT Madras Launches New Degree for Space & Aeronautics" }
            ].map((video, i) => (
              <div key={i} className="bg-white border-[3px] border-[#0b1120] rounded-3xl overflow-hidden shadow-[8px_8px_0px_#0b1120] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_#0b1120] transition-all duration-300">
                <div className="aspect-video relative bg-gray-100 border-b-[3px] border-[#0b1120]">
                  <img src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] cursor-pointer hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-xl text-[#0b1120]">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Gen-Z IITian Comparison */}
      <section className="bg-white py-32 border-t-[3px] border-[#0b1120] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-300 rounded-3xl border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] rotate-12 opacity-50"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-800 font-bold text-sm rounded-full border-2 border-purple-800 w-fit mb-4">
              The Clear Choice
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-4">Why Gen-Z IITian?</h2>
            <p className="text-gray-600 text-lg font-medium">Compare and see the difference for yourself.</p>
          </div>

          <div className="relative pt-5">
            {/* Badge positioned outside overflow-hidden to prevent clipping */}
            <div className="absolute top-1 left-[calc(40%+10%)] -translate-x-1/2 bg-[#10b981] text-white text-[10px] md:text-xs py-1 px-2 md:px-3 rounded-full border-2 border-[#0b1120] whitespace-nowrap shadow-[2px_2px_0px_#0b1120] z-20">
              Your Best Bet
            </div>
            <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl shadow-[12px_12px_0px_#0b1120] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#0b1120] text-white">
                      <th className="p-4 md:p-6 font-black text-base md:text-lg border-b-[3px] border-r-[3px] border-[#0b1120] w-2/5">Features</th>
                      <th className="p-4 md:p-6 font-black text-lg md:text-xl text-[#059669] border-b-[3px] border-r-[3px] border-[#0b1120] bg-[#d1fae5] text-center w-1/5">
                        GenZ IITian
                      </th>
                      <th className="p-4 md:p-6 font-black text-base md:text-lg border-b-[3px] border-r-[3px] border-[#0b1120] text-center w-1/5">YouTube Lectures</th>
                      <th className="p-4 md:p-6 font-black text-base md:text-lg border-b-[3px] border-[#0b1120] text-center w-1/5">Other Courses</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold text-gray-700">
                    {[
                      "Affordable",
                      "Live Lec + Recordings",
                      "Premium Notes",
                      "Live Doubt Session",
                      "Revision Session",
                      "Mentorship Session",
                      "Resume + LinkedIn Workshops",
                      "Short Notes",
                      "Subject wise blueprint"
                    ].map((feature, i) => (
                      <tr key={i} className="border-b-[3px] border-[#0b1120] last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4 md:p-6 border-r-[3px] border-[#0b1120] bg-white flex items-center gap-2 md:gap-3 text-sm md:text-base">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#0b1120] shrink-0"></div>
                          {feature}
                        </td>
                        <td className="p-4 md:p-6 border-r-[3px] border-[#0b1120] bg-[#ecfdf5] text-center"><CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-[#10b981] mx-auto" /></td>
                        <td className="p-4 md:p-6 border-r-[3px] border-[#0b1120] text-center opacity-50 bg-white"><XIcon className="w-6 h-6 md:w-7 md:h-7 text-red-400 mx-auto" /></td>
                        <td className="p-4 md:p-6 text-center opacity-50 bg-white"><XIcon className="w-6 h-6 md:w-7 md:h-7 text-red-400 mx-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-[#1e293b] border-[3px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-16 shadow-[12px_12px_0px_#0b1120] relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center">

          {/* Text Content */}
          <div className="w-full lg:w-1/2 relative z-10">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-8 leading-tight">
              A Community That Has Your Back
            </h2>

            <ul className="space-y-6">
              {[
                "Active WhatsApp with 24/7 community support",
                "Collaborate on open source and build together",
                "Weekly study groups and peer code reviews",
                "Job referrals and opportunity sharing"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-lg font-bold text-white">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-white shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic Content */}
          <div className="w-full lg:w-1/2 relative z-10 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Custom SVG Shape for Image Mask */}
              <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full drop-shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                <defs>
                  <clipPath id="community-mask">
                    <path d="M50 450 L150 150 L250 100 L350 200 L450 250 L400 450 Z" />
                  </clipPath>
                </defs>
                <path d="M50 450 L150 150 L250 100 L350 200 L450 250 L400 450 Z" fill="white" stroke="white" strokeWidth="16" strokeLinejoin="round" />
                <image href="https://picsum.photos/seed/community/800/800" width="500" height="500" preserveAspectRatio="xMidYMid slice" clipPath="url(#community-mask)" />
              </svg>

              {/* Decorative Lines */}
              <div className="absolute top-12 right-24 w-12 h-12">
                <svg viewBox="0 0 50 50" stroke="white" strokeWidth="6" strokeLinecap="round">
                  <line x1="10" y1="40" x2="20" y2="20" />
                  <line x1="30" y1="30" x2="40" y2="10" />
                </svg>
              </div>
              <div className="absolute bottom-32 right-8 w-12 h-12">
                <svg viewBox="0 0 50 50" stroke="white" strokeWidth="6" strokeLinecap="round">
                  <line x1="10" y1="10" x2="20" y2="30" />
                  <line x1="30" y1="20" x2="40" y2="40" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <a
            href="https://chat.whatsapp.com/Gi4D9yAd99p7q1XeVh0J1e"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-[#0b1120] rounded-2xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
            <div className="relative bg-[#25D366] text-white border-[3px] border-[#0b1120] rounded-2xl px-8 py-6 md:px-12 md:py-8 flex items-center justify-center gap-4 transition-transform hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0">
              <span className="text-xl md:text-3xl font-black uppercase tracking-tight text-center">JOIN OUR Whatsapp Community</span>
              <svg className="w-8 h-8 md:w-10 md:h-10 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#f8fafc] py-24 border-t-[3px] border-[#0b1120]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-4 max-w-[18rem] md:max-w-none mx-auto leading-tight">Student Reviews &amp; Shared Experiences</h2>
            <p className="text-gray-600 text-lg font-medium">Discover honest reviews and inspiring stories from students across India.</p>
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
              <div key={i} className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[6px_6px_0px_#0b1120] flex flex-col h-full hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#0b1120] transition-all">
                <p className="text-gray-700 font-bold text-lg mb-8 flex-grow">"{review.text}"</p>

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
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-[#eef2ff] border-[3px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-16 shadow-[12px_12px_0px_#0b1120] relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center">

          {/* Left Side: Stats/Callout */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 relative z-10">
            <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 shadow-[6px_6px_0px_#0b1120]">
              <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-[3px] border-[#0b1120] flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-[#10b981]" />
              </div>
              <h3 className="text-2xl font-black text-[#0b1120] mb-4">Revenue Share: <span className="text-[#10b981]">60% from Batches</span></h3>
              <p className="text-gray-600 font-bold mb-6">
                Do you know our tutor earns 60% of direct revenue from Batches? Start earning today.
              </p>
              <button className="w-full py-4 bg-[#0b1120] text-white whitespace-nowrap rounded-xl font-bold text-lg border-2 border-[#0b1120] hover:bg-gray-800 transition-colors">
                Become Instructor
              </button>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-2/3 relative z-10 lg:pl-8">
            <h2 className="text-4xl lg:text-5xl font-black text-[#0b1120] mb-6 leading-tight">
              Start Sharing Skills, Build Courses, Earn Revenue.
            </h2>
            <p className="text-gray-600 text-lg font-bold mb-10 max-w-xl">
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

            <button className="px-8 py-4 bg-[#10b981] text-white rounded-xl font-bold text-lg border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] whitespace-nowrap hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120] transition-all">
              Become Instructor
            </button>
          </div>
        </div>
      </section>



    </div>
  );
}
