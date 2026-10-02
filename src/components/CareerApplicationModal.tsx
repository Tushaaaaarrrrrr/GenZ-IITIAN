import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Rocket, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Link as LinkIcon, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Tablet,
  Check,
  Calendar,
  Briefcase,
  HelpCircle,
  Laptop
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CareerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'tutor' | 'campus-leader';
}

const CONFETTI_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0b1120'];
const CONFETTI_PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: (i % 2 === 0 ? -1 : 1) * (25 + (i % 8) * 14 + (i % 3) * 8),
  y: -70 - (i % 5) * 22 - (i % 4) * 12,
  rotate: (i % 2 === 0 ? 1 : -1) * (140 + i * 20),
  size: 5 + (i % 4) * 2,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: (i % 8) * 0.035,
  isCircle: i % 3 === 0
}));

const COURSES_DATA = {
  foundation: [
    { id: 'maths-1', name: 'Mathematics for Data Science I', short: 'Maths 1' },
    { id: 'maths-2', name: 'Mathematics for Data Science II', short: 'Maths 2' },
    { id: 'stats-1', name: 'Statistics for Data Science I', short: 'Stats 1' },
    { id: 'stats-2', name: 'Statistics for Data Science II', short: 'Stats 2' },
    { id: 'ct', name: 'Computational Thinking', short: 'CT' },
    { id: 'python', name: 'Programming in Python', short: 'Python' },
    { id: 'eng-1', name: 'English I', short: 'English 1' },
    { id: 'eng-2', name: 'English II', short: 'English 2' }
  ],
  diploma: [
    { id: 'pdsa', name: 'PDSA (using Python)', short: 'PDSA' },
    { id: 'java', name: 'Programming Concepts using Java', short: 'Java' },
    { id: 'dbms', name: 'Database Management Systems', short: 'DBMS' },
    { id: 'mad-1', name: 'Modern Application Development 1 (MAD 1)', short: 'MAD 1' },
    { id: 'mad-2', name: 'Modern Application Development 2 (MAD 2)', short: 'MAD 2' },
    { id: 'mlf', name: 'Machine Learning Foundations (MLF)', short: 'MLF' },
    { id: 'mlt', name: 'Machine Learning Techniques (MLT)', short: 'MLT' },
    { id: 'mlp', name: 'Machine Learning Practice (MLP)', short: 'MLP' },
    { id: 'dl-genai', name: 'Deep Learning & Gen AI', short: 'DL & Gen AI' },
    { id: 'bdm', name: 'Business Data Management', short: 'BDM' },
    { id: 'ba', name: 'Business Analytics', short: 'BA' },
    { id: 'sys-cmds', name: 'System Commands', short: 'System Cmds' }
  ]
};

const MEMBER_RANGES = ['1-10', '11-50', '51-100', '100-500', '500+', '1000+'];
const STORAGE_KEY = 'gzi_applicant_saved_profile_v2';

export default function CareerApplicationModal({ isOpen, onClose, role }: CareerApplicationModalProps) {
  const { user, profile, openLoginModal } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Wizard Step for Tutor (1: Personal, 2: Teaching)
  const [step, setStep] = useState<1 | 2>(1);
  const [courseFilter, setCourseFilter] = useState<'all' | 'foundation' | 'diploma'>('all');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tutor Form State
  const [tutorData, setTutorData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    studentType: 'Standalone', // Standalone, Dual Degree, Working Professional
    degreeLevel: 'Foundation', // Foundation, Diploma, Degree
    selectedCourses: ['Mathematics for Data Science I'] as string[],
    experienceAndWhy: '',
    hasTablet: 'Yes', // 'Yes' or 'No'
    language: 'Both (English + Hindi)',
    cgpa: '',
    resumeLink: ''
  });

  // Campus Leader Form State
  const [leaderData, setLeaderData] = useState({
    name: '',
    officialEmail: '',
    phone: '',
    isBSStudent: 'Yes',
    isGroupOwner: 'Yes',
    groupLink: '',
    groupMembers: '100-500',
    inquiries: ''
  });

  // Hydrate profile data & local storage memory
  useEffect(() => {
    if (!isOpen) return;

    // Check auth
    if (!user) {
      openLoginModal();
      return;
    }

    // Try reading cached draft from localStorage
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      const saved = savedRaw ? JSON.parse(savedRaw) : {};

      setTutorData(prev => ({
        ...prev,
        name: saved.name || profile?.name || user.user_metadata?.full_name || '',
        phone: saved.phone || profile?.phone || user.user_metadata?.phone || '',
        age: saved.age || prev.age,
        gender: saved.gender || prev.gender,
        studentType: saved.studentType || prev.studentType,
        degreeLevel: saved.degreeLevel || prev.degreeLevel,
        selectedCourses: Array.isArray(saved.selectedCourses) && saved.selectedCourses.length > 0 
          ? saved.selectedCourses 
          : prev.selectedCourses,
        experienceAndWhy: saved.experienceAndWhy || prev.experienceAndWhy,
        hasTablet: saved.hasTablet || prev.hasTablet,
        language: saved.language || prev.language,
        cgpa: saved.cgpa || prev.cgpa,
        resumeLink: saved.resumeLink || prev.resumeLink
      }));

      setLeaderData(prev => ({
        ...prev,
        name: saved.name || profile?.name || user.user_metadata?.full_name || '',
        phone: saved.phone || profile?.phone || user.user_metadata?.phone || '',
        officialEmail: saved.officialEmail || prev.officialEmail,
        isBSStudent: saved.isBSStudent || prev.isBSStudent,
        isGroupOwner: saved.isGroupOwner || prev.isGroupOwner,
        groupLink: saved.groupLink || prev.groupLink,
        groupMembers: saved.groupMembers || prev.groupMembers,
        inquiries: saved.inquiries || prev.inquiries
      }));
    } catch (e) {
      // Fallback to auth profile
      if (profile?.name || user.user_metadata?.full_name) {
        const defaultName = profile?.name || user.user_metadata?.full_name || '';
        setTutorData(prev => ({ ...prev, name: defaultName }));
        setLeaderData(prev => ({ ...prev, name: defaultName }));
      }
      if (profile?.phone || user.user_metadata?.phone) {
        const defaultPhone = profile?.phone || user.user_metadata?.phone || '';
        setTutorData(prev => ({ ...prev, phone: defaultPhone }));
        setLeaderData(prev => ({ ...prev, phone: defaultPhone }));
      }
    }
  }, [isOpen, user, profile]);

  // Persist draft to local storage on changes
  const saveDraft = (updatedTutor?: Partial<typeof tutorData>, updatedLeader?: Partial<typeof leaderData>) => {
    try {
      const currentTutor = { ...tutorData, ...updatedTutor };
      const currentLeader = { ...leaderData, ...updatedLeader };
      const toPersist = {
        name: currentTutor.name || currentLeader.name,
        phone: currentTutor.phone || currentLeader.phone,
        age: currentTutor.age,
        gender: currentTutor.gender,
        studentType: currentTutor.studentType,
        degreeLevel: currentTutor.degreeLevel,
        selectedCourses: currentTutor.selectedCourses,
        experienceAndWhy: currentTutor.experienceAndWhy,
        hasTablet: currentTutor.hasTablet,
        language: currentTutor.language,
        cgpa: currentTutor.cgpa,
        resumeLink: currentTutor.resumeLink,
        officialEmail: currentLeader.officialEmail,
        isBSStudent: currentLeader.isBSStudent,
        isGroupOwner: currentLeader.isGroupOwner,
        groupLink: currentLeader.groupLink,
        groupMembers: currentLeader.groupMembers,
        inquiries: currentLeader.inquiries
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch (e) {}
  };

  const handleTutorChange = (name: keyof typeof tutorData, value: any) => {
    setTutorData(prev => {
      const next = { ...prev, [name]: value };
      saveDraft({ [name]: value });
      return next;
    });
  };

  const toggleCourseSelection = (courseName: string) => {
    setTutorData(prev => {
      const exists = prev.selectedCourses.includes(courseName);
      const updated = exists 
        ? prev.selectedCourses.filter(c => c !== courseName)
        : [...prev.selectedCourses, courseName];
      
      saveDraft({ selectedCourses: updated });
      return { ...prev, selectedCourses: updated };
    });
  };

  const handleLeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeaderData(prev => {
      const next = { ...prev, [name]: value };
      saveDraft(undefined, { [name]: value });
      return next;
    });
  };

  // Step 1 Validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!tutorData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!tutorData.phone.trim()) {
      setErrorMessage('Please provide a valid phone or WhatsApp number.');
      return;
    }
    if (!tutorData.age.trim()) {
      setErrorMessage('Please enter your age.');
      return;
    }
    if (!tutorData.gender) {
      setErrorMessage('Please select your gender.');
      return;
    }
    if (!tutorData.studentType) {
      setErrorMessage('Please select whether you are Standalone, Dual Degree, or Working Professional.');
      return;
    }
    if (!tutorData.degreeLevel) {
      setErrorMessage('Please select your current degree level.');
      return;
    }

    setStep(2);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const isTutor = role === 'tutor';

    if (isTutor) {
      if (!tutorData.selectedCourses || tutorData.selectedCourses.length === 0) {
        setErrorMessage('Please select at least one course you are comfortable teaching.');
        setSubmitting(false);
        return;
      }
      if (!tutorData.experienceAndWhy.trim()) {
        setErrorMessage('Please describe your teaching experience and why you want to teach at GenZ IITian.');
        setSubmitting(false);
        return;
      }
      if (!tutorData.cgpa.trim()) {
        setErrorMessage('Please provide your CGPA or grade in the target subject(s).');
        setSubmitting(false);
        return;
      }
      if (!tutorData.resumeLink.trim()) {
        setErrorMessage('Please provide a link to your Resume / CV.');
        setSubmitting(false);
        return;
      }
    }

    const payload = isTutor
      ? {
          role: 'tutor',
          role_title: 'Subject Tutor (Faculty)',
          full_name: tutorData.name.trim(),
          email: (user?.email || '').trim().toLowerCase(),
          phone: tutorData.phone.trim(),
          age: tutorData.age.trim(),
          gender: tutorData.gender,
          student_type: tutorData.studentType,
          degree_level: tutorData.degreeLevel,
          courses: tutorData.selectedCourses,
          subject: tutorData.selectedCourses.join(', '),
          has_tablet: tutorData.hasTablet,
          experience_and_why: tutorData.experienceAndWhy.trim(),
          language: tutorData.language,
          cgpa: tutorData.cgpa.trim(),
          resume_link: tutorData.resumeLink.trim(),
          is_iitm: 'Yes',
          metadata: { ...tutorData, auth_email: user?.email }
        }
      : {
          role: 'campus-leader',
          role_title: 'Campus Leaders',
          full_name: leaderData.name.trim(),
          email: (user?.email || '').trim().toLowerCase(),
          official_email: leaderData.officialEmail.trim(),
          phone: leaderData.phone.trim(),
          is_bs_student: leaderData.isBSStudent,
          is_group_owner: leaderData.isGroupOwner,
          group_link: leaderData.groupLink.trim(),
          group_members: leaderData.groupMembers,
          inquiries: leaderData.inquiries.trim(),
          metadata: { ...leaderData, auth_email: user?.email }
        };

    try {
      // 1. Submit to platform API
      const apiPromise = fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.warn('[Careers] API error fallback:', err);
      });

      // 2. Google Apps Script Webhook trigger (legacy support for faculty button)
      if (isTutor) {
        const GOOGLE_SCRIPT_URL = import.meta.env.VITE_CAREERS_SCRIPT_URL;
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(err => console.warn('[Careers] Google script notice:', err));
        }
      }

      // 3. Fallback cache in localStorage for safety
      try {
        const cached = localStorage.getItem('gzi_job_applications');
        const list = cached ? JSON.parse(cached) : [];
        list.unshift({
          ...payload,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          status: 'PENDING'
        });
        localStorage.setItem('gzi_job_applications', JSON.stringify(list));
      } catch (e) {}

      await apiPromise;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Job application submission error:', err);
      setErrorMessage(err.message || 'Something went wrong submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrorMessage('');
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  // Filter courses for tutor view
  const visibleCourses = courseFilter === 'all' 
    ? [...COURSES_DATA.foundation, ...COURSES_DATA.diploma]
    : courseFilter === 'foundation' 
      ? COURSES_DATA.foundation 
      : COURSES_DATA.diploma;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6 overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] max-w-3xl bg-white border-0 sm:border-[3.5px] border-[#0b1120] rounded-none sm:rounded-[2rem] shadow-none sm:shadow-[8px_8px_0px_#0b1120] overflow-hidden flex flex-col min-h-0 sm:my-auto"
        >
          {/* Top Bar with Branding & Step Counter */}
          <div className="bg-[#0b1120] text-white px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b-[3px] sm:border-b-[3.5px] border-[#0b1120] shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider shrink-0 ${
                role === 'tutor' ? 'bg-emerald-400 text-slate-950' : 'bg-blue-400 text-slate-950'
              }`}>
                {role === 'tutor' ? 'Faculty Opening' : 'Campus Ambassador'}
              </span>

              <div className="flex items-center gap-2 truncate">
                <span className="text-xs sm:text-sm text-slate-200 font-bold truncate">
                  {role === 'tutor' ? 'Subject Tutor' : 'Campus Leaders'}
                </span>
                {role === 'tutor' && !submitted && (
                  <span className="hidden xs:inline-block text-[11px] font-black px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/15">
                    Step {step} of 2
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Close"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar (for Tutor role only) */}
          {role === 'tutor' && !submitted && (
            <div className="bg-slate-100 border-b-2 border-slate-200 px-4 sm:px-8 py-2.5 shrink-0">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                {/* Step 1 Pill */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all cursor-pointer text-left ${
                    step === 1 
                      ? 'bg-blue-600 text-white shadow-xs font-black' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    step === 1 ? 'bg-white text-blue-700' : 'bg-slate-300 text-slate-700'
                  }`}>
                    1
                  </span>
                  <span className="truncate">1. Personal Profile</span>
                </button>

                <div className="flex-1 h-1 bg-slate-300 rounded-full overflow-hidden max-w-[80px] sm:max-w-xs mx-1">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                  />
                </div>

                {/* Step 2 Pill */}
                <button
                  type="button"
                  onClick={() => {
                    if (tutorData.name && tutorData.phone && tutorData.age) {
                      setStep(2);
                    }
                  }}
                  className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all text-left ${
                    step === 2 
                      ? 'bg-emerald-600 text-white shadow-xs font-black' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    step === 2 ? 'bg-white text-emerald-700' : 'bg-slate-300 text-slate-700'
                  }`}>
                    2
                  </span>
                  <span className="truncate">2. Teaching Setup</span>
                </button>
              </div>
            </div>
          )}

          {/* Modal Main Scrollable Content */}
          <div 
            ref={scrollContainerRef}
            className="p-4 sm:p-8 overflow-y-auto flex-1 min-h-0 overscroll-contain pb-28 sm:pb-8"
          >
            {/* SUCCESS: Big Animated Celebration Dialog */}
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, type: 'spring' }}
                className="relative py-6 sm:py-12 text-center space-y-5 sm:space-y-6 px-2 overflow-hidden"
              >
                {/* Confetti Explosion Particles */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                  {CONFETTI_PARTICLES.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        x: p.x,
                        y: p.y,
                        scale: [0, 1.3, 0.8],
                        rotate: p.rotate
                      }}
                      transition={{
                        duration: 1.4,
                        delay: p.delay,
                        ease: [0.15, 0.8, 0.25, 1]
                      }}
                      style={{
                        position: 'absolute',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        borderRadius: p.isCircle ? '50%' : '3px'
                      }}
                    />
                  ))}
                </div>

                {/* Big Animated Rocket Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.15, 1] }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-emerald-100 border-[3px] sm:border-[3.5px] border-[#0b1120] rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#0b1120] sm:shadow-[6px_6px_0px_#0b1120] flex items-center justify-center text-emerald-600"
                >
                  <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-700 animate-bounce" />
                </motion.div>

                {/* Headline: "Welcome to one Step ahead of 99% people" */}
                <div className="space-y-2.5 sm:space-y-3 max-w-xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-[11px] sm:text-xs font-black uppercase tracking-wider"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Application Received</span>
                  </motion.div>

                  <motion.h2 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-2xl sm:text-4xl font-black text-[#0b1120] tracking-tight leading-tight px-1"
                  >
                    Welcome to One Step Ahead of 99% of People 🚀
                  </motion.h2>

                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="text-xs sm:text-base text-slate-600 font-bold leading-relaxed max-w-lg mx-auto px-2"
                  >
                    We review your application and get back to you shortly via WhatsApp & Email.
                  </motion.p>
                </div>

                {/* Inspiring Banner: "Work with Best , and be best" */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 }}
                  className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border-2 sm:border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#10b981] sm:shadow-[6px_6px_0px_#10b981] max-w-md mx-auto"
                >
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">Our Motto</p>
                  <p className="text-base sm:text-xl font-black tracking-tight text-white">
                    “Work with Best, and be best.”
                  </p>
                </motion.div>

                {/* Close Button */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                  className="pt-2 pb-4 sm:pb-0"
                >
                  <button
                    onClick={handleClose}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0b1120] hover:bg-slate-800 text-white font-black text-sm rounded-xl border-2 border-[#0b1120] shadow-[4px_4px_0px_#0b1120] transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Done & Return to Site</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              /* APPLICATION COLLECTOR */
              <div className="space-y-5 sm:space-y-6">
                {/* Big Headline */}
                <div className="border-b-2 border-slate-100 pb-4 sm:pb-5">
                  <h1 className="text-2xl sm:text-4xl font-black text-[#0b1120] tracking-tight leading-tight">
                    GenZ IITian Careers
                  </h1>
                  <p className="text-xs sm:text-base font-bold text-slate-600 mt-1">
                    Please fill all info correct as of your knowledge
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ========================================================= */}
                {/* ROLE A: SUBJECT TUTOR (2-PAGE STEP FLOW)                  */}
                {/* ========================================================= */}
                {role === 'tutor' && (
                  <div>
                    {/* PAGE 1: Personal & Academic Profile */}
                    {step === 1 && (
                      <form onSubmit={handleProceedToStep2} className="space-y-4 sm:space-y-5">
                        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 sm:p-4 text-xs font-bold text-blue-950 flex items-center gap-2.5">
                          <User className="w-5 h-5 text-blue-600 shrink-0" />
                          <span>Step 1: Tell us about yourself and your IITM BS degree progress.</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                          {/* 1. Full Name (Editable, pre-filled) */}
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                              Full Name *
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                required
                                type="text"
                                value={tutorData.name}
                                onChange={e => handleTutorChange('name', e.target.value)}
                                placeholder="e.g. Aryan Sharma"
                                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                              />
                            </div>
                          </div>

                          {/* 2. Email Address (Fixed & Locked to Account) */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Email Address (Locked) *
                              </label>
                              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Account Email
                              </span>
                            </div>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                readOnly
                                disabled
                                type="email"
                                value={user?.email || ''}
                                title="Email is fixed to your logged-in GenZ IITian account"
                                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-100/90 border-2 border-slate-300 text-slate-600 rounded-xl text-base sm:text-sm font-bold cursor-not-allowed min-h-[48px] select-none"
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              Fixed to your verified account email and cannot be changed.
                            </p>
                          </div>

                          {/* 3. Contact Number / WhatsApp (Editable, prefilled) */}
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                              Phone / WhatsApp *
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                required
                                type="tel"
                                value={tutorData.phone}
                                onChange={e => handleTutorChange('phone', e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                              />
                            </div>
                          </div>

                          {/* 4. Age */}
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                              Age (in years) *
                            </label>
                            <div className="relative">
                              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                required
                                type="number"
                                min={16}
                                max={80}
                                value={tutorData.age}
                                onChange={e => handleTutorChange('age', e.target.value)}
                                placeholder="e.g. 21"
                                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 5. Gender Selection */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                            Gender *
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['Male', 'Female', 'Other', 'Prefer not to say'].map(gen => {
                              const active = tutorData.gender === gen;
                              return (
                                <button
                                  key={gen}
                                  type="button"
                                  onClick={() => handleTutorChange('gender', gen)}
                                  className={`py-2.5 px-3 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 ${
                                    active 
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  <span>{gen}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 6. Are you: Standalone / Dual Degree / Working Professional */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                            Are you: (Current Status) *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {[
                              { id: 'Standalone', label: 'Standalone BS', desc: 'Pursuing only the IITM BS Degree' },
                              { id: 'Dual Degree', label: 'Dual Degree', desc: 'Pursuing regular college + IITM BS' },
                              { id: 'Working Professional', label: 'Working Pro', desc: 'Working full/part-time job + BS' }
                            ].map(item => {
                              const active = tutorData.studentType === item.id;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleTutorChange('studentType', item.id)}
                                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[82px] ${
                                    active 
                                      ? 'bg-indigo-50/80 border-indigo-600 shadow-xs' 
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-black ${active ? 'text-indigo-900' : 'text-slate-900'}`}>
                                      {item.label}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                      active ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'
                                    }`}>
                                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-tight">
                                    {item.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 7. Level in Degree: Foundation / Diploma / Degree */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                            Your Level in Degree *
                          </label>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {['Foundation', 'Diploma', 'Degree'].map(lvl => {
                              const active = tutorData.degreeLevel === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleTutorChange('degreeLevel', lvl)}
                                  className={`py-3 px-2 rounded-xl border-2 text-xs sm:text-sm font-black transition-all text-center cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5 ${
                                    active 
                                      ? 'bg-[#0b1120] text-white border-[#0b1120] shadow-[2px_2px_0px_#10b981]' 
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <GraduationCap className="w-4 h-4 shrink-0" />
                                  <span>{lvl}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Step 1 Action Button */}
                        <div className="pt-4 pb-2">
                          <button
                            type="submit"
                            className="w-full py-4 min-h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base rounded-xl border-2 border-transparent shadow-[4px_4px_0px_#0b1120] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                          >
                            <span>Proceed to Teaching Profile (Step 2)</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    )}

                    {/* PAGE 2: Teaching & Practical Setup */}
                    {step === 2 && (
                      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 text-xs font-bold text-emerald-950 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>Step 2: Teaching subjects, hardware setup & peer experience.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                          >
                            ← Edit Step 1
                          </button>
                        </div>

                        {/* 1. Multi-Course Selector */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                              Which courses can you teach? (Choose Multiple) *
                            </label>
                            <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full inline-block w-fit">
                              {tutorData.selectedCourses.length} selected
                            </span>
                          </div>

                          {/* Level Filter Tabs */}
                          <div className="flex items-center gap-1.5 mb-3 bg-slate-100 p-1 rounded-xl w-fit">
                            <button
                              type="button"
                              onClick={() => setCourseFilter('all')}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                                courseFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              All Courses
                            </button>
                            <button
                              type="button"
                              onClick={() => setCourseFilter('foundation')}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                                courseFilter === 'foundation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              Foundation
                            </button>
                            <button
                              type="button"
                              onClick={() => setCourseFilter('diploma')}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                                courseFilter === 'diploma' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              Diploma
                            </button>
                          </div>

                          {/* Multi-Select Chips Container */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border-2 border-slate-200 rounded-2xl bg-slate-50/50">
                            {visibleCourses.map(course => {
                              const isSelected = tutorData.selectedCourses.includes(course.name);
                              return (
                                <button
                                  key={course.id}
                                  type="button"
                                  onClick={() => toggleCourseSelection(course.name)}
                                  className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-black shadow-2xs'
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold'
                                  }`}
                                >
                                  <div className="min-w-0 pr-1">
                                    <p className="text-xs truncate">{course.name}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                    isSelected 
                                      ? 'border-emerald-600 bg-emerald-600 text-white' 
                                      : 'border-slate-300 bg-white'
                                  }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Teaching Experience & Why GenZ IITian Textarea */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                            Do you have any experience in teaching and why GenZ IITian? *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={tutorData.experienceAndWhy}
                            onChange={e => handleTutorChange('experienceAndWhy', e.target.value)}
                            placeholder="Share any past teaching, mentoring, doubt solving experience, and why you want to guide fellow peers at GenZ IITian..."
                            className="w-full px-3.5 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none min-h-[85px]"
                          />
                        </div>

                        {/* 3. Hardware Availability: Tablet & Stylus Question */}
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                            Do you have a Tablet or a tablet with stylus to write? *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Yes', 'No'].map(ans => {
                              const active = tutorData.hasTablet === ans;
                              return (
                                <button
                                  key={ans}
                                  type="button"
                                  onClick={() => handleTutorChange('hasTablet', ans)}
                                  className={`py-3 px-4 rounded-xl border-2 font-black text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer min-h-[50px] ${
                                    active 
                                      ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs' 
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Tablet className="w-4 h-4 text-slate-500" />
                                    <span>{ans}</span>
                                  </div>
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    active ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                                  }`}>
                                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 4. Preferred Language, CGPA & Resume Link */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                              Teaching Language *
                            </label>
                            <select
                              value={tutorData.language}
                              onChange={e => handleTutorChange('language', e.target.value)}
                              className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                            >
                              <option value="Both (English + Hindi)">Both (English + Hindi)</option>
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                              Subject CGPA / Grade *
                            </label>
                            <div className="relative">
                              <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                required
                                type="text"
                                value={tutorData.cgpa}
                                onChange={e => handleTutorChange('cgpa', e.target.value)}
                                placeholder="e.g. 8.5 or S Grade"
                                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                            Resume / CV Link *
                          </label>
                          <div className="relative">
                            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              required
                              type="url"
                              value={tutorData.resumeLink}
                              onChange={e => handleTutorChange('resumeLink', e.target.value)}
                              placeholder="https://drive.google.com/... (ensure link is viewable)"
                              className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                            />
                          </div>
                        </div>

                        {/* Navigation Buttons for Step 2 */}
                        <div className="pt-3 pb-2 flex flex-col sm:flex-row items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-xl border-2 border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer order-2 sm:order-1"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Step 1</span>
                          </button>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:flex-1 py-4 min-h-[50px] bg-[#0b1120] hover:bg-slate-800 text-white font-black text-sm sm:text-base rounded-xl border-2 border-[#0b1120] shadow-[4px_4px_0px_#10b981] sm:shadow-[5px_5px_0px_#10b981] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98 order-1 sm:order-2"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting Application...</span>
                              </>
                            ) : (
                              <span>Submit Tutor Application 🚀</span>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* ========================================================= */}
                {/* ROLE B: CAMPUS LEADER APPLICATION                         */}
                {/* ========================================================= */}
                {role === 'campus-leader' && (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="text"
                            name="name"
                            value={leaderData.name}
                            onChange={handleLeaderChange}
                            placeholder="e.g. Priyanshu Roy"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                          />
                        </div>
                      </div>

                      {/* Locked Email */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                            Email (Locked) *
                          </label>
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Account Email
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            readOnly
                            disabled
                            type="email"
                            value={user?.email || ''}
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-100/90 border-2 border-slate-300 text-slate-600 rounded-xl text-base sm:text-sm font-bold cursor-not-allowed min-h-[48px]"
                          />
                        </div>
                      </div>

                      {/* Official Email */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Official IITM Email Address *
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="email"
                            name="officialEmail"
                            value={leaderData.officialEmail}
                            onChange={handleLeaderChange}
                            placeholder="e.g. 21f1000000@ds.study.iitm.ac.in"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Contact Number / WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="tel"
                            name="phone"
                            value={leaderData.phone}
                            onChange={handleLeaderChange}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                          />
                        </div>
                      </div>

                      {/* BS Student Check */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Are you a BS student? *
                        </label>
                        <select
                          name="isBSStudent"
                          value={leaderData.isBSStudent}
                          onChange={handleLeaderChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      {/* Group Owner Check */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Are you owner of the student group? *
                        </label>
                        <select
                          name="isGroupOwner"
                          value={leaderData.isGroupOwner}
                          onChange={handleLeaderChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>

                    {/* Group Link */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Group Link (URL) *
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          required
                          type="url"
                          name="groupLink"
                          value={leaderData.groupLink}
                          onChange={handleLeaderChange}
                          placeholder="e.g. https://chat.whatsapp.com/... or https://t.me/..."
                          className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                        />
                      </div>
                    </div>

                    {/* Group Members */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Approximately how many members are in your group? *
                      </label>
                      <select
                        required
                        name="groupMembers"
                        value={leaderData.groupMembers}
                        onChange={handleLeaderChange}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[48px]"
                      >
                        {MEMBER_RANGES.map(range => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>

                    {/* Inquiries */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Any Questions / Inquiries (Optional)
                      </label>
                      <textarea
                        rows={3}
                        name="inquiries"
                        value={leaderData.inquiries}
                        onChange={handleLeaderChange}
                        placeholder="Ask anything or tell us more about your community..."
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none min-h-[70px]"
                      />
                    </div>

                    <div className="pt-2 pb-6 sm:pb-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 min-h-[50px] bg-[#0b1120] hover:bg-slate-800 text-white font-black text-sm sm:text-base rounded-xl border-2 border-[#0b1120] shadow-[4px_4px_0px_#3b82f6] sm:shadow-[5px_5px_0px_#3b82f6] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <span>Submit Application</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
