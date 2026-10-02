import React, { useState } from 'react';
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
  Globe, 
  Award, 
  Link as LinkIcon, 
  Users, 
  HelpCircle, 
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

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

const TUTOR_SUBJECTS = {
  Foundation: [
    'Mathematics for Data Science I',
    'Mathematics for Data Science II',
    'Statistics for Data Science I',
    'Statistics for Data Science II',
    'Computational Thinking',
    'Programming in Python'
  ],
  Diploma: [
    'PDSA (using Python)',
    'Programming Concepts using Java',
    'Database Management Systems',
    'Machine Learning Foundations',
    'Machine Learning Techniques',
    'Machine Learning Practice',
    'Modern Application Development 1 (MAD 1)',
    'Modern Application Development 2 (MAD 2)',
    'Deep Learning & Gen AI'
  ]
};

const MEMBER_RANGES = ['1-10', '11-50', '51-100', '100-500', '500+', '1000+'];

export default function CareerApplicationModal({ isOpen, onClose, role }: CareerApplicationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tutor form state
  const [tutorData, setTutorData] = useState({
    name: '',
    email: '',
    phone: '',
    isIITM: 'Yes',
    level: 'Foundation',
    subject: TUTOR_SUBJECTS.Foundation[0],
    language: 'English',
    cgpa: '',
    resumeLink: ''
  });

  // Campus leader form state
  const [leaderData, setLeaderData] = useState({
    name: '',
    email: '',
    officialEmail: '',
    phone: '',
    isBSStudent: 'Yes',
    isGroupOwner: 'Yes',
    groupLink: '',
    groupMembers: '100-500',
    inquiries: ''
  });

  const handleTutorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'level') {
      const newLevel = value as 'Foundation' | 'Diploma';
      setTutorData(prev => ({
        ...prev,
        level: newLevel,
        subject: TUTOR_SUBJECTS[newLevel][0]
      }));
    } else {
      setTutorData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeaderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const isTutor = role === 'tutor';
    const payload = isTutor
      ? {
          role: 'tutor',
          role_title: 'Subject Tutor (Faculty)',
          full_name: tutorData.name,
          email: tutorData.email,
          phone: tutorData.phone,
          is_iitm: tutorData.isIITM,
          level: tutorData.level,
          subject: tutorData.subject,
          language: tutorData.language,
          cgpa: tutorData.cgpa,
          resume_link: tutorData.resumeLink,
          metadata: { ...tutorData }
        }
      : {
          role: 'campus-leader',
          role_title: 'Campus Leaders',
          full_name: leaderData.name,
          email: leaderData.email,
          official_email: leaderData.officialEmail,
          phone: leaderData.phone,
          is_bs_student: leaderData.isBSStudent,
          is_group_owner: leaderData.isGroupOwner,
          group_link: leaderData.groupLink,
          group_members: leaderData.groupMembers,
          inquiries: leaderData.inquiries,
          metadata: { ...leaderData }
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

      // 2. Preserve whatever that button did today for Subject Teacher (Google Apps Script Webhook)
      if (isTutor) {
        const GOOGLE_SCRIPT_URL = import.meta.env.VITE_CAREERS_SCRIPT_URL;
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tutorData)
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6 overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] max-w-3xl bg-white border-0 sm:border-[3.5px] border-[#0b1120] rounded-none sm:rounded-[2rem] shadow-none sm:shadow-[8px_8px_0px_#0b1120] overflow-hidden flex flex-col min-h-0 sm:my-auto"
        >
          {/* Top Bar with Close button */}
          <div className="bg-[#0b1120] text-white px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b-[3px] sm:border-b-[3.5px] border-[#0b1120] shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider shrink-0 ${
                role === 'tutor' ? 'bg-emerald-400 text-slate-900' : 'bg-blue-400 text-slate-900'
              }`}>
                {role === 'tutor' ? 'Faculty Opening' : 'Campus Ambassador'}
              </span>
              <span className="text-xs text-slate-300 font-bold truncate">
                {role === 'tutor' ? 'Subject Tutor' : 'Campus Leaders'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-8 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {/* SUCCESS: Big Animated Modal State */}
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

                {/* Big Animated Badge */}
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

                {/* Close / Done Button */}
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
              /* INPUT COLLECTOR: Full Page Form */
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
                  <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* ROLE A: Subject Tutor Form */}
                {role === 'tutor' && (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
                            value={tutorData.name}
                            onChange={handleTutorChange}
                            placeholder="e.g. Aryan Sharma"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="email"
                            name="email"
                            value={tutorData.email}
                            onChange={handleTutorChange}
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Phone / WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="tel"
                            name="phone"
                            value={tutorData.phone}
                            onChange={handleTutorChange}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Are you an IITM BS Student? *
                        </label>
                        <select
                          name="isIITM"
                          value={tutorData.isIITM}
                          onChange={handleTutorChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Teaching Level *
                        </label>
                        <select
                          name="level"
                          value={tutorData.level}
                          onChange={handleTutorChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        >
                          <option value="Foundation">Foundation</option>
                          <option value="Diploma">Diploma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Target Subject *
                        </label>
                        <select
                          name="subject"
                          value={tutorData.subject}
                          onChange={handleTutorChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        >
                          {TUTOR_SUBJECTS[tutorData.level as 'Foundation' | 'Diploma'].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Preferred Teaching Language *
                        </label>
                        <select
                          name="language"
                          value={tutorData.language}
                          onChange={handleTutorChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Both (English + Hindi)">Both (English + Hindi)</option>
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
                            name="cgpa"
                            value={tutorData.cgpa}
                            onChange={handleTutorChange}
                            placeholder="e.g. 8.5 or S Grade"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
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
                          name="resumeLink"
                          value={tutorData.resumeLink}
                          onChange={handleTutorChange}
                          placeholder="https://drive.google.com/... (ensure link is viewable)"
                          className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 pb-6 sm:pb-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 min-h-[50px] bg-[#0b1120] hover:bg-slate-800 text-white font-black text-sm sm:text-base rounded-xl border-2 border-[#0b1120] shadow-[4px_4px_0px_#10b981] sm:shadow-[5px_5px_0px_#10b981] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
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

                {/* ROLE B: Campus Leader Form */}
                {role === 'campus-leader' && (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            required
                            type="email"
                            name="email"
                            value={leaderData.email}
                            onChange={handleLeaderChange}
                            placeholder="priyanshu@gmail.com"
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Official Email Address *
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
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Contact Number *
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
                            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Are you a BS student? *
                        </label>
                        <select
                          name="isBSStudent"
                          value={leaderData.isBSStudent}
                          onChange={handleLeaderChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Are you owner of the student group? *
                        </label>
                        <select
                          name="isGroupOwner"
                          value={leaderData.isGroupOwner}
                          onChange={handleLeaderChange}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        If yes, please provide the Group Link (URL) *
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
                          className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Approximately how many members are currently in your group? *
                      </label>
                      <select
                        required
                        name="groupMembers"
                        value={leaderData.groupMembers}
                        onChange={handleLeaderChange}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 min-h-[46px]"
                      >
                        {MEMBER_RANGES.map(range => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>

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
