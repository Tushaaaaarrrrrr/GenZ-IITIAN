import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Play, Star, CheckCircle2, Shield, Zap, CreditCard, Users, Clock, BookOpen, Globe, Award, Briefcase, Search, Target, GraduationCap, Brain, FileText, Video, BarChart3, TrendingUp, Rocket, Trophy, MessageCircle, HelpCircle, Building2, Flame } from 'lucide-react';

const RazorpayButton = ({ buttonId }: { buttonId: string }) => {
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute('data-payment_button_id', buttonId);
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, [buttonId]);

  return <form ref={containerRef} className="w-full flex justify-center" />;
};

export default function CourseDetail() {
  const { id } = useParams();
  const [activeFaq, setActiveFaq] = useState<number | string | null>(null);

  // ─── Course Data ───
  const courseData: Record<string, any> = {
    'reattempt': {
      title: 'Qualifier Reattempt Batch',
      image: '/Image/Qualifier.png',
      tagline: 'Qualifier students reattempt batch (Live + Recording)',
      description: 'Structured reattempt support for qualifier students with live teaching, complete recordings, PYQ practice, doubt lectures and career workshops.',
      paymentLink: 'https://rzp.io/rzp/NS9wNPP',
      useRazorpayButton: false,
      heroPrice: '₹699',
      heroOriginal: '₹999',
      heroDiscount: 'Limited Offer',
      syllabusItems: [
        { title: "Computational Thinking", desc: "Focused reattempt prep with concept clarity and PYQ drills" },
        { title: "Statistics 1", desc: "High-weightage revision and cutoff-focused problem solving" },
        { title: "Mathematics 1", desc: "Topic-wise live + recorded revision strategy for reattempt" },
        { title: "English 1", desc: "Smart scoring strategy for assignment and quiz performance" },
      ],
      plans: [
        {
          name: 'Plan: Live + Recording',
          subtitle: 'Qualifier Reattempt',
          price: '₹699',
          priceLabel: 'Combo Access',
          color: 'gray',
          features: [
            "Week 1-4 detailed recorded + live PYQ and doubt lectures",
            "Live PYQ session",
            "Weekly doubt session",
            "Graded assignment recordings",
          ],
          link: 'https://rzp.io/rzp/NS9wNPP',
        },
        {
          name: 'Plan: Advanced',
          subtitle: 'Most Popular',
          price: '₹799',
          priceLabel: 'Advanced Plan',
          color: 'blue',
          popular: true,
          features: [
            "Subjects: CT, Stats 1, Maths 1, Eng 1",
            "Week 1-4 detailed recorded + live PYQs and doubt lectures",
            "Live PYQs session",
            "Weekly doubt session",
            "Graded assignment recordings",
            "Resume and LinkedIn workshops",
            "Best for learners who prefer live teaching plus full recordings and career support",
          ],
          link: 'https://rzp.io/rzp/NS9wNPP',
        },
      ],
      sidebarPlans: [
        { label: 'Live + Recording Combo - ₹699', value: 'live-rec-combo' },
        { label: 'Advanced Plan - ₹799', value: 'advanced' },
      ],
      sidebarPrice: '₹699',
      sidebarOriginal: '₹999',
      sidebarDiscount: 'limited offer',
      mobilePrice: '₹699',
      mobileOriginal: '₹999',
    },
    'foundation-1': {
      title: 'Foundation Term 1',
      image: '/Image/Fundation Term 1.png',
      tagline: 'IIT Madras BS – Term 1 Quiz 2 Foundation Course',
      description: 'Best & Affordable Course to Master Maths 1, Stats 1, and Computational Thinking.',
      paymentLink: 'https://rzp.io/rzp/fAjfTS7',
      useRazorpayButton: false,
      heroPrice: '₹799',
      heroOriginal: '₹849',
      heroDiscount: 'Best Combo Price',
      syllabusItems: [
        { title: "Mathematics 1", desc: "Foundation-level maths concepts, calculus & algebra" },
        { title: "Statistics 1", desc: "Data analysis, probability & descriptive stats" },
        { title: "Computational Thinking", desc: "Logic, algorithms & problem-solving approach" },
      ],
      plans: [
        {
          name: 'Plan A: Champion (Live)',
          subtitle: 'Most Popular',
          price: '₹849',
          priceLabel: 'Combo All 3 Subjects',
          color: 'blue',
          popular: true,
          features: [
            "Week 1-4 Detailed Recording + 5-8 Live Lectures",
            "Live PYQs Session",
            "Live Revision Session",
            "Weekly Doubt Session",
            "Graded Assignment Recordings",
            "Resume & LinkedIn Workshops",
          ],
          link: 'https://rzp.io/rzp/fAjfTS7',
        },
        {
          name: 'Plan B: Basic (Recordings)',
          price: '₹799',
          priceLabel: 'Combo All 3 Subjects',
          color: 'gray',
          features: [
            "Week 1-8 Detailed Recording Lectures",
            "Recorded PYQs Session",
            "Weekly Doubt Session",
            "Graded Assignment Recordings",
            "Best Handwritten Notes",
            "Subject-wise Most Imp Questions & Blueprint",
          ],
          link: 'https://rzp.io/rzp/fAjfTS7',
        },
      ],
      individualPricing: [
        { subject: 'Maths 1 Live', price: '₹349' },
        { subject: 'Stats 1 Live', price: '₹349' },
        { subject: 'CT Live', price: '₹349' },
        { subject: 'Maths 1 Recording', price: '₹249' },
        { subject: 'Stats 1 Recording', price: '₹249' },
        { subject: 'CT Recording', price: '₹249' },
      ],
      sidebarPlans: [
        { label: '3 Sub Live Combo - ₹849', value: 'live-combo' },
        { label: '3 Sub Recording Combo - ₹799', value: 'rec-combo' },
        { label: 'Individual Subject - from ₹249', value: 'individual' },
      ],
      sidebarPrice: '₹799',
      sidebarOriginal: '₹849',
      sidebarDiscount: 'combo price',
      mobilePrice: '₹799',
      mobileOriginal: '₹849',
    },
    'foundation-2': {
      title: 'Foundation Term 2',
      image: '/Image/Foundation Term 2.png',
      tagline: 'IIT Madras BS – Term 2 Quiz 2 Foundation Course',
      description: 'Best & Affordable Course to Master Maths 2, Stats 2, and Python.',
      paymentLink: 'https://rzp.io/rzp/LOyb6RP',
      useRazorpayButton: false,
      heroPrice: '₹799',
      heroOriginal: '₹849',
      heroDiscount: 'Best Combo Price',
      syllabusItems: [
        { title: "Mathematics 2", desc: "Advanced maths concepts, linear algebra & calculus" },
        { title: "Statistics 2", desc: "Inferential statistics, hypothesis testing & regression" },
        { title: "Python", desc: "Programming fundamentals, data structures & OOP" },
      ],
      plans: [
        {
          name: 'Plan A: Champion (Live)',
          subtitle: 'Most Popular',
          price: '₹849',
          priceLabel: 'Combo All 3 Subjects',
          color: 'blue',
          popular: true,
          features: [
            "Week 1-4 Detailed Recording + 5-8 Live Lectures",
            "Live PYQs Session",
            "Live Revision Session",
            "Weekly Doubt Session",
            "Graded Assignment Recordings",
            "Resume & LinkedIn Workshops",
          ],
          link: 'https://rzp.io/rzp/LOyb6RP',
        },
        {
          name: 'Plan B: Basic (Recordings)',
          price: '₹799',
          priceLabel: 'Combo All 3 Subjects',
          color: 'gray',
          features: [
            "Week 1-8 Detailed Recording Lectures",
            "Recorded PYQs Session",
            "Weekly Doubt Session",
            "Graded Assignment Recordings",
            "Best Handwritten Notes",
            "Subject-wise Most Imp Questions & Blueprint",
          ],
          link: 'https://rzp.io/rzp/LOyb6RP',
        },
      ],
      individualPricing: [
        { subject: 'Maths 2 Live', price: '₹349' },
        { subject: 'Stats 2 Live', price: '₹349' },
        { subject: 'Python Live', price: '₹349' },
        { subject: 'Maths 2 Recording', price: '₹249' },
        { subject: 'Stats 2 Recording', price: '₹249' },
        { subject: 'Python Recording', price: '₹299' },
      ],
      sidebarPlans: [
        { label: '3 Sub Live Combo - ₹849', value: 'live-combo' },
        { label: '3 Sub Recording Combo - ₹799', value: 'rec-combo' },
        { label: 'Individual Subject - from ₹249', value: 'individual' },
      ],
      sidebarPrice: '₹799',
      sidebarOriginal: '₹849',
      sidebarDiscount: 'combo price',
      mobilePrice: '₹799',
      mobileOriginal: '₹849',
    },
    'diploma': {
      title: 'Diploma Quiz 2',
      image: '/Image/Diploma.png',
      tagline: 'Diploma Quiz 2 Batch - Launch by 20 March',
      description: 'Join the waiting list for Diploma Quiz 2. Covers Java, PDSA, DBMS and MLF.',
      paymentLink: '/contact',
      ctaLabel: 'Join Waiting List',
      useRazorpayButton: false,
      heroPrice: 'Waitlist Open',
      heroOriginal: 'Launch on 20 March',
      heroDiscount: 'New Cohort',
      syllabusItems: [
        { title: "Java", desc: "Object-oriented programming, data structures & design patterns" },
        { title: "PDSA", desc: "Programming, Data Structures and Algorithms" },
        { title: "DBMS", desc: "Database Management Systems, SQL & normalization" },
        { title: "MLF", desc: "Machine Learning Foundations & applied concepts" },
      ],
      plans: [
        {
          name: 'Diploma Quiz 2 Waiting List',
          subtitle: 'Launch by 20 March',
          price: 'Join Now',
          priceLabel: 'Priority Access',
          color: 'blue',
          popular: true,
          features: [
            "Early access to Diploma Quiz 2 launch updates",
            "Java, PDSA, DBMS and MLF planned curriculum",
            "Priority onboarding and announcement alerts",
            "Seat confirmation before public launch",
          ],
          link: '/contact',
        },
      ],
      sidebarPlans: [
        { label: 'Join Waiting List', value: 'waitlist' },
      ],
      sidebarPrice: 'Waitlist',
      sidebarOriginal: 'Launch 20 March',
      sidebarDiscount: 'Quiz 2',
      mobilePrice: 'Waitlist',
      mobileOriginal: 'Launch 20 March',
    },
  };

  const course = courseData[id || ''] || courseData['reattempt'];
  const courseTitle = course.title;
  const courseImage = course.image;

  const faqs = [
    {
      question: "When will the January batch start?",
      answer: "The January batch starts in the first week of January. You will get access to the orientation materials as soon as you enroll."
    },
    {
      question: "How does the \"Full Refund\" guarantee work?",
      answer: "If you complete all assignments and attend 80% of live classes but still don't qualify the exam, we will refund 100% of your course fee."
    },
    {
      question: "Can I access on mobile?",
      answer: "Yes, our platform is fully responsive and you can access all lectures, notes, and PYQs on your mobile device."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-6 max-w-7xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-[#10b981] rounded-[2rem] translate-y-4 translate-x-4 border-2 border-[#0b1120]"></div>
          <div className="relative bg-[#0b1120] text-white rounded-[2rem] p-8 lg:p-16 border-[3px] border-[#0b1120] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold border border-blue-500/30">IIT Madras BS Degree</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold border border-purple-500/30">January 2026</span>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold border border-red-500/30 flex items-center gap-1"><Flame className="w-4 h-4" /> Limited Seats</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black leading-tight">
                  {courseTitle}
                </h1>

                <div className="inline-block px-4 py-2 bg-[#10b981] text-[#0b1120] font-black rounded-lg w-fit transform -rotate-1">
                  <Shield className="w-5 h-5 inline-block mr-1" /> {course.tagline}
                </div>

                <p className="text-gray-300 text-lg lg:text-xl font-medium max-w-xl">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#10b981]" />
                    <div>
                      <div className="font-black text-xl">500+</div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Students</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <div>
                      <div className="font-black text-xl">4.9</div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rating</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-black text-xl">95%</div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Success</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Video/Image Card */}
              <div className="relative lg:ml-auto w-full max-w-lg">
                <div className="relative bg-white rounded-3xl border-[3px] border-[#0b1120] overflow-hidden flex flex-col shadow-[8px_8px_0px_#10b981]">
                  <div className="aspect-video bg-gray-200 relative group cursor-pointer">
                    <img src={courseImage} alt="Course Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 text-[#0b1120] ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white text-[#0b1120]">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><BookOpen className="w-4 h-4" /></div>
                        <span>50+ Videos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"><Clock className="w-4 h-4" /></div>
                        <span>40+ Hours</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><Globe className="w-4 h-4" /></div>
                        <span>Hinglish</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><Award className="w-4 h-4" /></div>
                        <span>Beginner</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
                      <div>
                        <div className="text-sm text-gray-500 font-bold line-through mb-0.5">{course.heroOriginal}</div>
                        <div className="text-2xl sm:text-3xl font-black text-[#0b1120]">Starts {course.heroPrice}</div>
                      </div>
                      <div className="px-3 py-1 bg-[#d1fae5] text-[#059669] border-2 border-[#0b1120] rounded-full text-[10px] sm:text-xs font-black">
                        {course.heroDiscount}
                      </div>
                    </div>
                    {course.useRazorpayButton ? (
                      <div className="w-full bg-[#0b1120] rounded-xl p-3 border-2 border-[#0b1120] hover:bg-gray-800 transition-colors shadow-lg flex flex-col items-center gap-1 group">
                        <RazorpayButton buttonId={course.razorpayButtonId} />
                        <div className="text-[10px] sm:text-xs text-[#10b981] font-black uppercase tracking-wider">Get Secured Seat to BS</div>
                      </div>
                    ) : (
                      <a href={course.paymentLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-[#0b1120] text-white rounded-xl font-bold text-lg border-2 border-[#0b1120] hover:bg-gray-800 transition-colors flex flex-col items-center justify-center gap-1 shadow-lg">
                        <div className="flex items-center gap-2">
                          {course.ctaLabel || 'Proceed to Payment'} <ChevronRight className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] sm:text-xs text-[#10b981] font-black uppercase tracking-wider">Get Secured Seat to BS</div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Main Content Column */}
        <div className="lg:col-span-2 flex flex-col gap-16">

          {/* Who is This For? */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-3 flex items-center justify-center gap-2"><Target className="w-8 h-8 text-[#10b981]" /> Who Is This For?</h2>
              <p className="text-gray-600 font-bold max-w-2xl mx-auto">Whether you're starting fresh or leveling up, this cohort is designed for your success in the IIT Madras Qualifier.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#fef08a] rounded-2xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-2xl p-8 h-full flex flex-col transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#fef08a] border-2 border-[#0b1120] flex items-center justify-center mb-4"><GraduationCap className="w-6 h-6 text-[#0b1120]" /></div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-3">Class 12 Students (Any Stream)</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">Students who want to secure admission into the IIT Madras BS Degree without JEE and build a strong academic foundation from Day 1.</p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-[#e0e7ff] rounded-2xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-2xl p-8 h-full flex flex-col transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#e0e7ff] border-2 border-[#0b1120] flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-[#0b1120]" /></div>                  <h3 className="text-xl font-black text-[#0b1120] mb-3">Drop-Year / Gap-Year Aspirants</h3>                  <p className="text-gray-600 font-medium leading-relaxed">Students who want a structured preparation system to crack the IIT Madras Qualifier and enter India’s most innovative online degree program.</p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-[#d1fae5] rounded-2xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-2xl p-8 h-full flex flex-col transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#d1fae5] border-2 border-[#0b1120] flex items-center justify-center mb-4"><Briefcase className="w-6 h-6 text-[#0b1120]" /></div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-3">Working Professionals</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">Professionals who want to transition into Data Science, Analytics, Aerospace, or Management roles through the IIT Madras BS Degree — but need structured guidance to clear the Qualifier first.</p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-[#fee2e2] rounded-2xl translate-y-2 translate-x-2 border-2 border-[#0b1120]"></div>
                <div className="relative bg-white border-[3px] border-[#0b1120] rounded-2xl p-8 h-full flex flex-col transition-transform hover:-translate-y-1 hover:-translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#fee2e2] border-2 border-[#0b1120] flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-[#0b1120]" /></div>
                  <h3 className="text-xl font-black text-[#0b1120] mb-3">Self-Learners & Repeat Attempters</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">Students who attempted the Qualifier before or studied independently but need proper mentorship, accountability, and weekly testing to succeed.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-3">What You Get in the Cohort</h2>
              <p className="text-gray-600 font-bold">Everything you need to clear the IIT Madras BS Qualifier Exam with confidence</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <BookOpen className="w-6 h-6 text-[#0b1120]" />, title: "Structured Foundation Mastery", desc: "Complete preparation for Mathematics 1, Statistics 1, Computational Thinking, and English 1, aligned exactly with the IIT Madras pattern.", color: "bg-blue-100" },
                { icon: <FileText className="w-6 h-6 text-[#0b1120]" />, title: "Weekly Assignment Strategy", desc: "Learn how to score above cutoff, avoid common mistakes, manage time efficiently, and crack conceptual questions.", color: "bg-yellow-100" },
                { icon: <Video className="w-6 h-6 text-[#0b1120]" />, title: "Live Problem-Solving Sessions", desc: "IIT-level explanations for mathematical reasoning, logical thinking, data interpretation, and programming logic.", color: "bg-purple-100" },
                { icon: <BarChart3 className="w-6 h-6 text-[#0b1120]" />, title: "Mock Qualifier Exams", desc: "Full-length simulated Qualifier exams with time-bound practice, performance analytics, and personalized feedback.", color: "bg-green-100" },
                { icon: <Target className="w-6 h-6 text-[#0b1120]" />, title: "Cutoff-Oriented Prep Plan", desc: "We train you specifically to clear weekly assignment thresholds and qualify for the final exam with high scores.", color: "bg-orange-100" },
                { icon: <Award className="w-6 h-6 text-[#0b1120]" />, title: "IIT-Focused Mentorship", desc: "Strategy sessions for Data Science, Mgmt, and Aero degrees, including degree selection and post-qualifier roadmaps.", color: "bg-teal-100" },
                { icon: <Users className="w-6 h-6 text-[#0b1120]" />, title: "Gen-Z IITian Community", desc: "Doubt-solving groups, peer accountability, and a motivated IITM aspirant network for constant updates and strategy.", color: "bg-red-100" }
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-[#10b981] rounded-2xl translate-y-1.5 translate-x-1.5 border-2 border-[#0b1120]"></div>
                  <div className="relative bg-white border-[3px] border-[#0b1120] rounded-2xl p-6 h-full transition-transform hover:-translate-y-1 hover:-translate-x-1">
                    <div className={`w-12 h-12 rounded-xl ${item.color} border-2 border-[#0b1120] flex items-center justify-center mb-4`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-black text-[#0b1120] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Career Outcomes */}
          <section>
            <div className="bg-[#0b1120] rounded-[2.5rem] p-10 lg:p-16 text-white border-[3px] border-[#0b1120] shadow-[12px_12px_0px_#10b981] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>
              <div className="relative z-10 text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-black mb-4 flex items-center justify-center gap-2"><TrendingUp className="w-8 h-8 text-[#10b981]" /> Career Outcomes</h2>
                <p className="text-gray-400 font-bold">Once you enter IIT Madras BS, you unlock:</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {[
                  { icon: <GraduationCap className="w-5 h-5 text-[#10b981]" />, title: "IIT Madras Alumni Status", desc: "Gain the prestigious status of being an alum of India's #1 engineering institute." },
                  { icon: <Briefcase className="w-5 h-5 text-[#10b981]" />, title: "Industry Exposure", desc: "Access to internships, placements, and high-level networking within the tech industry." },
                  { icon: <BarChart3 className="w-5 h-5 text-[#10b981]" />, title: "Strong Academic Base", desc: "A world-class foundation in Data Science, Management, or Aerospace Engineering." },
                  { icon: <Rocket className="w-5 h-5 text-[#10b981]" />, title: "Future Opportunities", desc: "Direct pathway to Masters programs, GATE, or top-tier technical and managerial roles." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1">{item.title}</h4>
                      <p className="text-gray-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Gen-Z IITian? */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0b1120] mb-3 whitespace-nowrap">Why Gen-Z IITian?</h2>
              <p className="text-gray-600 font-bold max-w-xl mx-auto px-4">Most students fail the Qualifier not because they lack intelligence — but because they lack structure.</p>
            </div>
            <div className="bg-white border-[3px] border-[#0b1120] rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  {[
                    "Proven Academic Structure",
                    "Expert Strategy & Roadmap",
                    "Real-Time Accountability",
                    "Extensive Mock Practice"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 text-xl font-black text-[#0b1120]">
                      <div className="w-8 h-8 rounded-lg bg-[#d1fae5] flex items-center justify-center text-[#059669] border-2 border-[#0b1120] group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
                <div className="bg-[#eef2ff] p-8 rounded-3xl border-[3px] border-[#0b1120] shadow-[8px_8px_0px_#0b1120]">
                  <p className="text-lg text-gray-700 font-bold italic leading-relaxed">
                    "Gen-Z IITian bridges the gap between self-study and success. We don't just teach the syllabus; we prepare you for the challenge of being an IITian."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Course Syllabus */}
          <section>
            <h2 className="text-3xl lg:text-4xl font-black text-[#0b1120] mb-8">
              Course Syllabus
            </h2>
            <div className="space-y-4">
              {course.syllabusItems.map((item: any, i: number) => (
                <div key={i} className="bg-white border-[3px] border-[#0b1120] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#0b1120] transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#0b1120]">
                  <button
                    onClick={() => setActiveFaq(activeFaq === `syllabus-${i}` ? null : `syllabus-${i}` as any)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-black text-lg text-[#0b1120] pr-4">{item.title}</span>
                    <div className="w-8 h-8 rounded-full border-2 border-[#0b1120] flex items-center justify-center shrink-0">
                      <ChevronDown className={`w-5 h-5 text-[#0b1120] transition-transform ${activeFaq === `syllabus-${i}` ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {activeFaq === `syllabus-${i}` && (
                    <div className="px-6 pb-5 pt-2 text-gray-600 font-bold border-t-2 border-gray-100">
                      {item.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Plans */}
          <section className="relative">
            <div className="absolute inset-0 bg-[#10b981] rounded-[2rem] translate-y-3 translate-x-3 border-2 border-[#0b1120]"></div>
            <div className="relative bg-[#0b1120] text-white rounded-[2rem] p-8 lg:p-12 border-[3px] border-[#0b1120] overflow-hidden flex flex-col items-center gap-8">
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

              <div className="relative z-10 text-center w-full mb-4">
                <div className="inline-block px-4 py-1.5 bg-[#fef08a] text-[#d97706] font-black text-sm rounded-full mb-4">
                  CHOOSE YOUR PLAN
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-snug mb-2">
                  Flexible Pricing Options
                </h2>
                <p className="text-gray-300 font-medium">Select the plan that fits your learning style</p>
              </div>

              <div className={`grid grid-cols-1 ${course.plans.length >= 3 ? 'md:grid-cols-3' : course.plans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 max-w-5xl mx-auto relative z-10 w-full`}>
                {course.plans.map((plan: any, i: number) => (
                  <div key={i} className={`bg-white text-[#0b1120] border-2 ${plan.popular ? 'border-blue-500' : plan.best ? 'border-[#f59e0b]' : 'border-gray-200'} rounded-3xl p-8 flex flex-col h-full relative hover:-translate-y-1 hover:shadow-lg transition-all ${plan.popular && course.plans.length >= 3 ? 'md:-translate-y-4' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-blue-500 text-white text-sm font-black uppercase tracking-wider rounded-full whitespace-nowrap">
                        {plan.subtitle || 'Popular'}
                      </div>
                    )}
                    {plan.best && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#f59e0b] text-white text-xs font-black uppercase tracking-wider rounded-full text-center whitespace-nowrap shadow-md">
                        <Trophy className="w-3.5 h-3.5 inline-block mr-1" /> BEST VALUE
                      </div>
                    )}
                    <div className={`text-center mb-6 ${plan.popular || plan.best ? 'mt-4' : ''}`}>
                      <h4 className={`font-black ${plan.popular ? 'text-blue-500' : plan.best ? 'text-[#f59e0b]' : 'text-gray-500'} mb-2 uppercase tracking-wider text-sm`}>
                        {plan.name}
                      </h4>
                      {plan.priceLabel && <div className="text-xs text-gray-400 font-bold mb-1">{plan.priceLabel}</div>}
                      <div className="font-black text-5xl">{plan.price}</div>
                    </div>
                    {plan.refund && (
                      <div className="w-full py-2.5 bg-[#10b981] text-white text-xs font-black text-center rounded-lg mb-6 flex items-center justify-center gap-1 shadow-sm">
                        <Shield className="w-3.5 h-3.5 inline-block" /> FULL REFUND IF NOT QUALIFIED
                      </div>
                    )}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.includesFrom && (
                        <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                          <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" /> Everything in {plan.includesFrom}
                        </li>
                      )}
                      {(plan.features || []).map((f: string, j: number) => (
                        <li key={j} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                          {plan.best ? (
                            <Star className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b] shrink-0" />
                          ) : plan.includesFrom ? (
                            <span className="text-blue-500 font-black text-lg w-5 text-center shrink-0">+</span>
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
                          )}
                          {f}
                        </li>
                      ))}
                      {(plan.extras || []).map((f: string, j: number) => (
                        <li key={`e-${j}`} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                          {plan.best ? (
                            <Star className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b] shrink-0" />
                          ) : (
                            <span className="text-blue-500 font-black text-lg w-5 text-center shrink-0">+</span>
                          )}
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a href={plan.link} target="_blank" rel="noopener noreferrer" className={`w-full py-3.5 ${plan.best ? 'bg-[#f59e0b] hover:bg-[#d97706]' : plan.popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-100 hover:bg-gray-200'} ${plan.best || plan.popular ? 'text-white' : 'text-[#0b1120]'} rounded-xl font-bold text-lg transition-all text-center`}>
                      {course.ctaLabel || 'Proceed to Payment'}
                    </a>
                  </div>
                ))}
              </div>

              {/* Individual Subject Pricing */}
              {course.individualPricing && (
                <div className="relative z-10 w-full max-w-5xl mx-auto mt-4">
                  <h3 className="text-xl font-black text-white mb-4 text-center">Or Choose Individual Subjects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {course.individualPricing.map((item: any, i: number) => (
                      <a key={i} href={course.paymentLink} target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/20 transition-all">
                        <div className="font-bold text-white text-sm mb-1">{item.subject}</div>
                        <div className="font-black text-xl text-[#10b981]">{item.price}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Learning Experience */}
          <section className="overflow-hidden">
            <h2 className="text-3xl font-black text-[#0b1120] mb-8 text-center">
              The Learning Experience
            </h2>
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory animate-scroll scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[
                  { icon: <Video className="w-8 h-8 text-[#0b1120]" />, title: "Live Interactive Classes", desc: "A place to explore, create and thrive", color: "bg-blue-50" },
                  { icon: <BookOpen className="w-8 h-8 text-[#0b1120]" />, title: "Premium Study Materials", desc: "Where learning meets inspiration", color: "bg-purple-50" },
                  { icon: <MessageCircle className="w-8 h-8 text-[#0b1120]" />, title: "24/7 Doubt Support", desc: "Success is a journey, not a destination", color: "bg-green-50" },
                  { icon: <FileText className="w-8 h-8 text-[#0b1120]" />, title: "Regular Mock Tests", desc: "Practice makes perfect", color: "bg-yellow-50" },
                  { icon: <Target className="w-8 h-8 text-[#0b1120]" />, title: "Goal Tracking", desc: "Stay on top of your progress", color: "bg-red-50" }
                ].map((item, i) => (
                  <div key={i} className="min-w-[280px] md:min-w-[320px] snap-center bg-white p-8 rounded-3xl border-[3px] border-[#0b1120] text-center shrink-0 shadow-[6px_6px_0px_#0b1120] hover:-translate-y-1 transition-all">
                    <div className={`w-20 h-20 mx-auto ${item.color} rounded-2xl border-2 border-[#0b1120] flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0b1120]`}>
                      {item.icon}
                    </div>
                    <h4 className="font-black text-xl text-[#0b1120] mb-4">{item.title}</h4>
                    <p className="text-sm font-bold text-gray-500 italic">"{item.desc}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Student Reviews */}
          <section>
            <h2 className="text-3xl font-black text-[#0b1120] mb-8 text-center">
              Student Reviews
            </h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-5xl font-black text-[#0b1120]">4.9</div>
              <div>
                <div className="flex text-yellow-400 text-xl mb-1 gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}</div>
                <div className="text-sm text-gray-500 font-bold">(124 reviews)</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  text: "The mock tests were exactly like the real exam. Cleared my qualifier comfortably!",
                  initial: "R",
                  name: "Rahul Sharma",
                  role: "Qualified Sept 2025",
                  color: "bg-blue-100 text-blue-700"
                },
                {
                  text: "As someone from non-maths background, the teaching made everything click!",
                  initial: "A",
                  name: "Anjali Gupta",
                  role: "Qualified May 2025",
                  color: "bg-purple-100 text-purple-700"
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
          </section>

          {/* YouTube Video Section */}
          <section>
            <h2 className="text-3xl font-black text-[#0b1120] mb-4">
              See How Gen-Z IITian Works
            </h2>
            <p className="text-gray-600 font-medium mb-8">
              Watch this quick tour to understand how our platform simplifies your IIT Madras journey
            </p>
            <div className="aspect-video bg-gray-900 rounded-3xl border-[3px] border-[#0b1120] overflow-hidden relative shadow-[8px_8px_0px_#0b1120]">
              <div className="absolute inset-0 flex items-center justify-center">
                <a href="https://www.youtube.com/watch?v=QrGKYmvOo3Q" target="_blank" rel="noopener noreferrer" className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-xl">
                  <Play className="w-8 h-8 text-white ml-2" fill="currentColor" />
                </a>
              </div>
              <img src="https://img.youtube.com/vi/QrGKYmvOo3Q/maxresdefault.jpg" alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-3xl font-black text-[#0b1120] mb-8 flex items-center gap-3">
              <HelpCircle className="w-9 h-9 text-[#10b981]" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-[#0b1120] pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="px-6 pb-5 text-gray-600 font-medium">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar / Pricing */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 flex flex-col gap-8" id="pricing">

            {/* Pricing Card (Image 2 Style) */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#10b981] rounded-3xl translate-y-3 translate-x-3 border-2 border-[#0b1120]"></div>
              <div className="relative bg-white border-[3px] border-[#0b1120] rounded-3xl overflow-hidden flex flex-col">
                <div className="aspect-video bg-gray-200 relative group cursor-pointer">
                  <img src={courseImage} alt="Course Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform transition-transform group-hover:scale-110">
                      <Play className="w-6 h-6 text-[#0b1120] ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-end gap-3">
                      <div className="text-4xl font-black text-[#0b1120]">{course.sidebarPrice}</div>
                      <div className="text-xl text-gray-400 font-bold line-through mb-1">{course.sidebarOriginal}</div>
                    </div>
                    <div className="px-4 py-1.5 bg-[#fef08a] text-[#0b1120] border-2 border-[#0b1120] rounded-full text-sm font-black">
                      {course.sidebarDiscount}
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <select
                      onChange={(e) => {
                        if (e.target.value !== "select") {
                          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full appearance-none bg-white border-2 border-[#0b1120] rounded-xl px-4 py-3 text-base font-bold text-[#0b1120] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    >
                      <option value="select">Select Plan</option>
                      {course.sidebarPlans.map((p: any, i: number) => (
                        <option key={i} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-[#0b1120]" />
                    </div>
                  </div>

                  {course.useRazorpayButton ? (
                    <div className="w-full bg-[#0b1120] rounded-xl p-2 border-2 border-[#0b1120] hover:bg-gray-800 transition-colors">
                      <RazorpayButton buttonId={course.razorpayButtonId} />
                    </div>
                  ) : (
                    <button onClick={() => window.open(course.paymentLink, '_blank')} className="w-full py-4 bg-[#0b1120] text-white rounded-xl font-black text-lg border-2 border-[#0b1120] hover:bg-gray-800 transition-colors">
                      {course.ctaLabel || 'Proceed to Payment'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Related Courses */}
            <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-6 shadow-[8px_8px_0px_#0b1120]">
              <h3 className="text-xl font-black text-[#0b1120] mb-4">Related Courses</h3>
              <div className="space-y-3">
                {id !== 'foundation-1' && (
                  <a href="/courses/foundation-1" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl"><Building2 className="w-6 h-6 text-[#0b1120]" /></div>
                      <div className="font-bold text-[#0b1120]">Term 1 Quiz 2</div>
                    </div>
                    <div className="text-sm font-bold text-gray-500">from ₹799</div>
                  </a>
                )}
                {id !== 'foundation-2' && (
                  <a href="/courses/foundation-2" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl"><Rocket className="w-6 h-6 text-[#0b1120]" /></div>
                      <div className="font-bold text-[#0b1120]">Term 2 Quiz 2</div>
                    </div>
                    <div className="text-sm font-bold text-gray-500">from ₹799</div>
                  </a>
                )}
                {id !== 'diploma' && (
                  <a href="/courses/diploma" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl"><Target className="w-6 h-6 text-[#0b1120]" /></div>
                      <div className="font-bold text-[#0b1120]">Diploma Quiz 2</div>
                    </div>
                    <div className="text-sm font-bold text-gray-500">waitlist open</div>
                  </a>
                )}
                {id !== 'reattempt' && (
                  <a href="/courses/reattempt" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl"><GraduationCap className="w-6 h-6 text-[#0b1120]" /></div>
                      <div className="font-bold text-[#0b1120]">Qualifier Reattempt</div>
                    </div>
                    <div className="text-sm font-bold text-gray-500">from ₹699</div>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-[#0b1120] p-4 lg:hidden z-50 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.1)]">
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Starting from</div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-[#0b1120]">{course.mobilePrice}</span>
            <span className="text-sm font-bold text-gray-400 line-through mb-1">{course.mobileOriginal}</span>
          </div>
        </div>
        <a href={course.paymentLink} target="_blank" rel="noopener noreferrer" className="px-4 py-3 bg-[#10b981] text-[#0b1120] rounded-xl font-black border-2 border-[#0b1120] flex items-center gap-2 hover:bg-[#059669] hover:text-white transition-colors text-sm sm:text-base">
          <span className="hidden sm:inline"><Target className="w-4 h-4" /></span> {course.ctaLabel || 'Enroll Now'}
        </a>
      </div>

    </div>
  );
}
