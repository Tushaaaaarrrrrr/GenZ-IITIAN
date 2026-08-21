import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, RefreshCcw, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CourseCard, { CourseCardData } from '../components/CourseCard';
import MobileCourses from '../components/mobile/MobileCourses';
import { Link } from 'react-router-dom';

const DEFAULT_BOX_CONFIG: Record<string, string[]> = {
  Qualifier: ['Qualifier'],
  'Re-attempt': ['Re-attempt'],
  Foundation: ['Quiz 1', 'Quiz 2', 'End Term', 'Full Term'],
  DIPLOMA: ['Quiz 1', 'Quiz 2', 'End Term', 'Full Term']
};

export default function Courses() {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom states for manager configurations
  const [examVisibility, setExamVisibility] = useState<Record<string, string[]>>(DEFAULT_BOX_CONFIG);
  const [boxesLoaded, setBoxesLoaded] = useState(false);
  const [stagePricing, setStagePricing] = useState<Record<string, any>>({});
  const [selectedExamStage, setSelectedExamStage] = useState<string | null>(() => {
    return localStorage.getItem('selected_exam_stage');
  });

  const [selectedTerm, setSelectedTerm] = useState<string | null>(() => {
    return localStorage.getItem('selected_term');
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  // Clear the selected exam if it does not belong to the selected term anymore.
  useEffect(() => {
    if (!selectedTerm) {
      setSelectedExamStage(null);
      localStorage.removeItem('selected_exam_stage');
      return;
    }

    if (!boxesLoaded) return;

    const visibleStages = examVisibility[selectedTerm] || DEFAULT_BOX_CONFIG[selectedTerm] || [];
    if (selectedExamStage && !visibleStages.includes(selectedExamStage)) {
      setSelectedExamStage(null);
      localStorage.removeItem('selected_exam_stage');
    }
  }, [selectedTerm, selectedExamStage, examVisibility, boxesLoaded]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('isPinned', { ascending: false })
        .order('created_at', { ascending: false });
      setCourses(coursesData || []);

      // Fetch visibility configs
      const { data: visData } = await supabase.from('settings').select('*').eq('key', 'exam_visibility').maybeSingle();
      if (visData) {
        setExamVisibility({
          ...DEFAULT_BOX_CONFIG,
          ...JSON.parse(visData.value)
        });
      }
      setBoxesLoaded(true);

      // Fetch stage pricing configs
      const { data: priceData } = await supabase.from('settings').select('*').eq('key', 'stage_pricing').maybeSingle();
      if (priceData) {
        setStagePricing(JSON.parse(priceData.value));
      }
    } catch (err) {
      console.error('Failed to load courses & settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTerm = (term: string) => {
    setSelectedTerm(term);
    setSelectedExamStage(null);
    localStorage.setItem('selected_term', term);
    localStorage.removeItem('selected_exam_stage');
  };

  const handleSelectExamStage = (stage: string) => {
    setSelectedExamStage(stage);
    localStorage.setItem('selected_exam_stage', stage);
  };

  const handleClearTerm = () => {
    setSelectedTerm(null);
    localStorage.removeItem('selected_term');
    localStorage.removeItem('selected_exam_stage');
    setSelectedExamStage(null);
  };

  const handleClearExam = () => {
    setSelectedExamStage(null);
    localStorage.removeItem('selected_exam_stage');
  };

  // Filter courses by selected academic term and selected exam stage:
  const filteredCourses = courses.filter(course => {
    const matchesTerm = !selectedTerm || course.term === selectedTerm;
    
    // Only filter by stage if a stage is selected
    const matchesStage = !selectedExamStage || 
      (Array.isArray(course.exam_stages) && course.exam_stages.includes(selectedExamStage));

    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTerm && matchesStage && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20 px-6">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b1120] mb-4" />
        <span className="font-black text-gray-400">Loading courses...</span>
      </div>
    );
  }

  // Define our term configurations
  const termOptions = [
    {
      id: 'Qualifier',
      name: 'Qualifier',
      icon: BookOpen,
      color: 'border-[#0b1120] hover:shadow-[8px_8px_0px_#eab308]',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-300',
      iconColor: 'text-yellow-600',
      desc: 'Crack the qualifier exam. Get comprehensive study plans, live tutorials, and mock papers to guarantee your admission.'
    },
    {
      id: 'Re-attempt',
      name: 'Re-attempt',
      icon: RefreshCcw,
      color: 'border-[#0b1120] hover:shadow-[8px_8px_0px_#ef4444]',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-300',
      iconColor: 'text-red-600',
      desc: 'Ready to try again? Get targeted preparation strategies, intensive practice, and guidance to ace your next attempt.'
    },
    {
      id: 'Foundation',
      name: 'Foundation',
      icon: BookOpen,
      color: 'border-[#0b1120] hover:shadow-[8px_8px_0px_#3b82f6]',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-300',
      iconColor: 'text-blue-600',
      desc: 'Build a rock-solid academic base. Master core fundamentals with senior IITM BS students and conceptual live sessions.'
    },
    {
      id: 'DIPLOMA',
      name: 'DIPLOMA',
      icon: GraduationCap,
      color: 'border-[#0b1120] hover:shadow-[8px_8px_0px_#10b981]',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-300',
      iconColor: 'text-emerald-600',
      desc: 'Deep-dive into advanced coursework. Excel in project labs, coding assignments, and specialized diploma curriculum.'
    }
  ];

  // Dynamic filter: only show a term if there is at least one course configured for it
  const hasAnyTermAssigned = courses.some(c => c.term && ['Re-attempt', 'Foundation', 'DIPLOMA', 'Qualifier'].includes(c.term));
  const activeTerms = termOptions.filter(option => {
    if (!hasAnyTermAssigned) return true; // Fallback: show all if no terms are assigned yet
    return courses.some(course => course.term === option.id);
  });

  if (!selectedTerm) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20 px-6">

        <div className="max-w-6xl w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-[#0b1120] mb-4 leading-tight tracking-tight">
              Please Select Your <span className="text-blue-600">Term</span>
            </h1>
            <p className="text-gray-500 font-bold max-w-xl mx-auto text-sm md:text-base">
              Choose your academic tier to explore the courses, schedules, and guidance curated specifically for you.
            </p>
          </motion.div>

          <div className={`grid grid-cols-1 ${activeTerms.length === 4 ? 'md:grid-cols-4' : activeTerms.length === 3 ? 'md:grid-cols-3' : activeTerms.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8 text-left max-w-5xl mx-auto`}>
            {activeTerms.map((term, index) => {
              const IconComponent = term.icon;
              return (
                <motion.div
                  key={term.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => handleSelectTerm(term.id)}
                  className={`group bg-white border-[4px] rounded-[2rem] p-8 cursor-pointer transition-all flex flex-col justify-between shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 ${term.color}`}
                >
                  <div>
                    <div className={`w-14 h-14 border-[3px] rounded-2xl flex items-center justify-center mb-6 ${term.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${term.iconColor}`} />
                    </div>
                    <h3 className={`text-2xl font-black mb-3 text-[#0b1120] tracking-tight`}>
                      {term.name}
                    </h3>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6">
                      {term.desc}
                    </p>
                  </div>
                  <div className={`mt-auto pt-4 flex items-center justify-between text-xs font-black uppercase transition-transform group-hover:translate-x-1 ${term.textColor}`}>
                    <span>Select {term.name} ›</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeBoxes = examVisibility[selectedTerm] || DEFAULT_BOX_CONFIG[selectedTerm] || [];

  if (!selectedExamStage) {
    return (
      <>
        <MobileCourses selectedTerm={selectedTerm} selectedExamStage={selectedExamStage} onClearTerm={handleClearTerm} onSelectExamStage={handleSelectExamStage} />

        <div className="hidden md:flex min-h-screen bg-gray-50 flex-col justify-center items-center py-20 px-6">
          <div className="max-w-5xl w-full text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="mb-5 flex justify-center">
                <span className="px-4 py-1.5 bg-[#0b1120] text-white border-2 border-[#0b1120] shadow-[3px_3px_0px_#2563eb] rounded-xl text-xs font-black uppercase tracking-wider">
                  {selectedTerm}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#0b1120] mb-4 leading-tight tracking-tight">
                Choose <span className="text-blue-600">Exam</span>
              </h1>
              <p className="text-gray-500 font-bold max-w-xl mx-auto text-sm md:text-base">
                Pick the exam box you want to prepare for.
              </p>
            </motion.div>

            {activeBoxes.length === 0 ? (
              <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-10 shadow-[8px_8px_0px_#0b1120]">
                <h3 className="text-2xl font-black text-gray-400 mb-6">No exams are available for this term yet.</h3>
                <button
                  onClick={handleClearTerm}
                  className="px-6 py-3 border-[3px] border-[#0b1120] rounded-xl font-black text-sm bg-white hover:bg-gray-50 text-[#0b1120] shadow-[4px_4px_0px_#0b1120] active:translate-y-1 active:shadow-none transition-all"
                >
                  Change Term
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6">
                {activeBoxes.map((box, index) => (
                  <motion.button
                    key={box}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                    whileHover={{ scale: 1.04, y: -3 }}
                    onClick={() => handleSelectExamStage(box)}
                    className="min-w-[180px] px-8 py-6 bg-white border-[4px] border-[#0b1120] rounded-[1.5rem] text-[#0b1120] font-black text-xl shadow-[6px_6px_0px_#0b1120] hover:shadow-[6px_6px_0px_#2563eb] transition-all"
                  >
                    {box}
                  </motion.button>
                ))}
              </div>
            )}

            <button
              onClick={handleClearTerm}
              className="mt-10 inline-flex items-center gap-2 px-5 py-3 border-[2.5px] border-[#0b1120] rounded-xl font-black text-xs bg-white hover:bg-gray-50 text-[#0b1120] shadow-[3px_3px_0px_#0b1120] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Change Term
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
    {/* Mobile cohorts screen (md:hidden) — matches the Gen-Z IITian mobile design */}
    <MobileCourses selectedTerm={selectedTerm} selectedExamStage={selectedExamStage} onClearTerm={handleClearTerm} onClearExam={handleClearExam} onSelectExamStage={handleSelectExamStage} />

    <div className="hidden md:block min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#0b1120] py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Start Early, Stay Strong</span>
          </motion.h1>
          
          <div className="max-w-3xl mx-auto mb-10">
            <p className="text-lg md:text-xl text-gray-300 font-bold mb-3 leading-relaxed">
              Learn from <span className="text-white">IITM BS seniors</span> with a practical-first approach, clear concepts, real strategies, and zero unnecessary theory.
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.2em] opacity-80 italic">
              Note: Access is granted immediately after successful payment verification
            </p>
          </div>
        </div>
      </section>

      {/* Active Term and Exam Selector */}
      <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-gray-100 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Active:</span>
          <span className="px-4 py-1.5 bg-[#0b1120] text-white border-2 border-[#0b1120] shadow-[3px_3px_0px_#2563eb] rounded-xl text-xs font-black uppercase tracking-wider">
            {selectedTerm}
          </span>
          <span className="px-4 py-1.5 bg-white text-[#0b1120] border-2 border-[#0b1120] shadow-[3px_3px_0px_#10b981] rounded-xl text-xs font-black uppercase tracking-wider">
            {selectedExamStage}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleClearExam}
            className="sm:self-center px-4 py-2 border-[2.5px] border-[#0b1120] rounded-xl font-black text-xs bg-white hover:bg-gray-50 text-[#0b1120] shadow-[3px_3px_0px_#0b1120] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 justify-center cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Change Exam
          </button>
          <button 
            onClick={handleClearTerm}
            className="sm:self-center px-4 py-2 border-[2.5px] border-[#0b1120] rounded-xl font-black text-xs bg-white hover:bg-gray-50 text-[#0b1120] shadow-[3px_3px_0px_#0b1120] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 justify-center cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Change Term
          </button>
        </div>
      </div>

      {/* Exam Selector Tabs */}
      {selectedTerm && !loading && (
        <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-wrap justify-center gap-3">
          {activeBoxes.map((stage) => (
            <button
              key={stage}
              onClick={() => handleSelectExamStage(stage)}
              className={`px-6 py-3 rounded-2xl font-black text-sm border-[3px] border-[#0b1120] transition-all cursor-pointer ${
                selectedExamStage === stage
                  ? 'bg-[#0b1120] text-white shadow-[4px_4px_0px_#2563eb]'
                  : 'bg-white text-[#0b1120] hover:bg-gray-50'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#0b1120]" />
            <span className="font-black text-gray-400">Loading courses...</span>
          </div>
        ) : (
          <>
            {/* End Term Pricing Section */}
            {selectedTerm && selectedExamStage === 'End Term' && (() => {
              const pricingConfig = stagePricing[selectedTerm] || { quiz1: 0, quiz2: 0, endTerm: 0, fullTerm: 0, calculationMode: 'fixed', fixedTotal: 0 };
              const quiz1Price = pricingConfig.quiz1 || 0;
              const quiz2Price = pricingConfig.quiz2 || 0;
              const endTermPrice = pricingConfig.endTerm || 0;
              const isFixedMode = pricingConfig.calculationMode === 'fixed';
              const finalPrice = isFixedMode ? (pricingConfig.fixedTotal || 0) : (quiz1Price + quiz2Price + endTermPrice);
              
              const endTermCourse = courses.find(c => c.term === selectedTerm && Array.isArray(c.exam_stages) && c.exam_stages.includes('End Term'));

              return (
                <div className="max-w-2xl mx-auto mb-16 bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 md:p-12 shadow-[12px_12px_0px_#0b1120] space-y-6">
                  <div className="text-center border-b-4 border-[#0b1120] pb-6">
                    <span className="px-3.5 py-1.5 bg-blue-100 text-blue-700 text-xs font-black rounded-xl border-2 border-blue-200 uppercase tracking-widest">
                      End Term Package
                    </span>
                    <h2 className="text-3xl font-black text-[#0b1120] mt-3">Syllabus Package Breakdown</h2>
                    <p className="text-gray-500 font-bold text-sm mt-1">Get complete syllabus coverage with all classes and final mocks</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                      <span>Quiz 1 Prep Syllabus</span>
                      <span className="font-black text-[#0b1120]">₹{quiz1Price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                      <span>Quiz 2 Prep Syllabus</span>
                      <span className="font-black text-[#0b1120]">₹{quiz2Price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500 border-b-2 border-dashed border-gray-100 pb-4">
                      <span>End Term Final Mock Papers</span>
                      <span className="font-black text-[#0b1120]">₹{endTermPrice}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-black text-[#0b1120] uppercase tracking-wide">Final Package Price</span>
                      <span className="text-3xl font-black text-[#0b1120]">₹{finalPrice}</span>
                    </div>
                  </div>

                  {endTermCourse ? (
                    <div className="pt-4 flex justify-center">
                      <Link
                        to={`/checkout/${endTermCourse.id}`}
                        className="w-full text-center py-5 bg-[#10b981] text-[#0b1120] rounded-2xl font-black text-lg border-[4px] border-[#0b1120] shadow-[8px_8px_0px_#0b1120] hover:translate-y-0.5 hover:shadow-[6px_6px_0px_#0b1120] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Unlock End Term Package
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-xs font-bold text-gray-400">
                      End Term package checkout is currently offline. Please contact the administrator.
                    </div>
                  )}
                </div>
              );
            })()}

            {filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-black text-gray-400">No courses found for the selected stage.</h3>
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
          </>
        )}
      </section>
    </div>
    </>
  );
}
