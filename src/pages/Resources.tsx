import { Share, ChevronRight, ChevronDown, X, ClipboardList, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const levels = ["Qualifier", "Foundation", "Diploma"] as const;

const levelSubjects: Record<string, string[]> = {
  Qualifier: ["Maths 1", "Stats 1", "CT", "English 1"],
  Foundation: ["Maths 1", "Stats 1", "Maths 2", "Stats 2", "English 1", "English 2", "Python", "CT"],
  Diploma: ["MLF", "BDM", "MLT", "MLP", "TDS", "DBMS", "Java", "PDSA", "MAD 1", "MAD 2", "BA", "Deep Learning & Gen AI", "System Commands"],
};

const allSubjects = [...new Set(Object.values(levelSubjects).flat())].filter(Boolean);

type TabKey = 'notes' | 'pyqs' | 'tools' | 'dates' | 'updates';

interface PYQResource {
  id: number;
  level: string;
  subject: string;
  resource_type: string;
  sub_type: string;
  title: string;
  description: string;
  url: string;
}

export default function Resources() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('notes');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // PYQ state
  const [pyqLevel, setPyqLevel] = useState<string>("Foundation");
  const [pyqSubject, setPyqSubject] = useState<string | null>(null);
  const [pyqExam, setPyqExam] = useState<string | null>(null);
  const [pyqResources, setPyqResources] = useState<PYQResource[]>([]);
  const [pyqLoading, setPyqLoading] = useState(false);
  const [availableExamTypes, setAvailableExamTypes] = useState<string[]>([]);

  // Gate popup state
  const [showGate, setShowGate] = useState(false);
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check localStorage for access on mount
  useEffect(() => {
    const access = localStorage.getItem('resource_access');
    if (access) {
      setHasAccess(true);
    } else {
      setShowGate(true);
    }
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch PYQ resources when level+subject change, derive exam types
  useEffect(() => {
    if (activeTab !== 'pyqs' || !pyqSubject) {
      setPyqResources([]);
      setAvailableExamTypes([]);
      return;
    }
    setPyqLoading(true);
    fetch(`/api/resources?level=${encodeURIComponent(pyqLevel)}&subject=${encodeURIComponent(pyqSubject)}&type=pyq`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Derive available exam types from data
          const types = [...new Set(data.map((r: PYQResource) => r.sub_type).filter(Boolean))];
          // Sort in preferred order
          const order = ["Qualifier Exam", "Quiz 1", "Quiz 2", "End Term", "OPPE 1", "OPPE 2"];
          types.sort((a, b) => order.indexOf(a) - order.indexOf(b));
          setAvailableExamTypes(types);
          // If current exam selection is valid, filter; otherwise show all
          if (pyqExam && types.includes(pyqExam)) {
            setPyqResources(data.filter((r: PYQResource) => r.sub_type === pyqExam));
          } else {
            setPyqResources(data);
            setPyqExam(null);
          }
        }
        setPyqLoading(false);
      })
      .catch(() => { setPyqResources([]); setAvailableExamTypes([]); setPyqLoading(false); });
  }, [activeTab, pyqLevel, pyqSubject]);

  // Filter by exam type when it changes
  useEffect(() => {
    if (activeTab !== 'pyqs' || !pyqSubject) return;
    if (!pyqExam) return;
    setPyqLoading(true);
    fetch(`/api/resources?level=${encodeURIComponent(pyqLevel)}&subject=${encodeURIComponent(pyqSubject)}&type=pyq`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPyqResources(data.filter((r: PYQResource) => r.sub_type === pyqExam));
        }
        setPyqLoading(false);
      })
      .catch(() => { setPyqResources([]); setPyqLoading(false); });
  }, [pyqExam]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setSelectedSubject(null);
    setOpenDropdown(null);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setOpenDropdown(null);
  };

  const clearFilters = () => { setSelectedLevel(null); setSelectedSubject(null); };

  const availableSubjects = selectedLevel ? levelSubjects[selectedLevel] : allSubjects;
  const filteredLevels = selectedLevel ? (["Qualifier", "Foundation", "Diploma"] as const).filter((l) => l === selectedLevel) : (["Qualifier", "Foundation", "Diploma"] as const);

  const pyqSubjects = levelSubjects[pyqLevel] || [];

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const params = new URLSearchParams(window.location.search);

    const payload = new URLSearchParams();
    payload.append('form_type', 'Resource Gate');
    payload.append('name', formData.get('entry.name') as string);
    payload.append('email', formData.get('entry.email') as string);
    payload.append('phone', formData.get('entry.phone') as string);
    payload.append('level', formData.get('entry.level') as string);
    payload.append('utm_source', params.get('utm_source') || 'direct');
    payload.append('utm_medium', params.get('utm_medium') || 'organic');
    payload.append('utm_campaign', params.get('utm_campaign') || 'none');

    try {
      // Replace YOUR_SCRIPT_URL with your Google Apps Script Web App URL
      await fetch('https://script.google.com/macros/s/AKfycbysGFbxo9r41D5kMnKmO90rr9u_mzn5aBuhZG6AFvRZOhDtFJ9dclTHgJJqdcBNS-Ny/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: payload
      });
    } catch { /* no-cors ignores response */ }

    localStorage.setItem('resource_access', JSON.stringify({
      name: formData.get('entry.name'),
      email: formData.get('entry.email'),
      phone: formData.get('entry.phone'),
      level: formData.get('entry.level'),
      timestamp: new Date().toISOString()
    }));
    setGateSubmitting(false);
    setHasAccess(true);
    setShowGate(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">

      {/* ====== GATE POPUP ====== */}
      {showGate && !hasAccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-[3px] border-[#0b1120] rounded-3xl p-8 lg:p-10 max-w-lg w-full shadow-[16px_16px_0px_#10b981] relative animate-[fadeIn_0.3s_ease-out]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#eef2ff] border-[3px] border-[#0b1120] mb-4 shadow-[4px_4px_0px_#0b1120]">
                <span className="text-3xl">📚</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-[#0b1120] mb-2">Access Free Resources</h2>
              <p className="text-gray-500 font-medium text-sm">Please fill this form to continue to the resource page</p>
            </div>

            <form onSubmit={handleGateSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#0b1120] text-sm">Full Name *</label>
                <input
                  name="entry.name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-[3px] border-[#0b1120] text-[#0b1120] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#10b981] transition-colors font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#0b1120] text-sm">Email Address *</label>
                <input
                  name="entry.email"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-[3px] border-[#0b1120] text-[#0b1120] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#10b981] transition-colors font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#0b1120] text-sm">WhatsApp / Phone Number *</label>
                <div className="flex gap-3">
                  <div className="w-20 px-3 py-3.5 rounded-xl bg-gray-100 border-[3px] border-[#0b1120] text-[#0b1120] font-bold flex items-center justify-center shrink-0 text-sm">
                    +91
                  </div>
                  <input
                    name="entry.phone"
                    type="tel"
                    placeholder="98765 43210"
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-[3px] border-[#0b1120] text-[#0b1120] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#10b981] transition-colors font-medium"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#0b1120] text-sm">Your Level *</label>
                <select
                  name="entry.level"
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-[3px] border-[#0b1120] text-[#0b1120] focus:outline-none focus:bg-white focus:border-[#10b981] transition-colors font-medium appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select your level</option>
                  <option value="Qualifier">Qualifier</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={gateSubmitting}
                className="w-full py-4 bg-[#10b981] text-white rounded-xl font-black text-lg border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#0b1120] transition-all mt-2 disabled:opacity-60"
              >
                {gateSubmitting ? '⏳ Submitting...' : '🚀 Continue to Resources'}
              </button>
              <p className="text-center text-xs font-medium text-gray-400 mt-1">
                Your data is safe with us. We only use it to send you relevant updates.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h1 className="text-4xl md:text-5xl font-black text-[#0b1120] tracking-tight">
            IITM BS DEGREE RESOURCES
          </h1>
          <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 bg-white border-[3px] border-[#0b1120] rounded-xl text-sm font-bold text-[#0b1120] hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[6px_6px_0px_#0b1120] transition-all w-fit shrink-0">
            <Share className="w-4 h-4" /> {copied ? "Copied!" : "Share"}
          </button>
        </div>

        <div className="mt-8 bg-[#fff7ed] border-[3px] border-[#0b1120] rounded-2xl p-6 shadow-[6px_6px_0px_#f59e0b]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 mb-2">New Section</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#0b1120]">Graded Assignment</h2>
              <p className="text-gray-600 font-medium mt-1">
                Open the dedicated page, choose your level and subject, then browse Week 1 to Week 12.
              </p>
            </div>
            <Link
              to="/graded-assignment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b1120] text-white border-[3px] border-[#0b1120] rounded-xl font-black text-sm hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#10b981] transition-all"
            >
              Open Graded Assignment <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full bg-white border-y-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 py-4 text-sm font-black whitespace-nowrap border-b-[3px] transition-colors ${activeTab === 'notes' ? 'border-[#10b981] text-[#0b1120]' : 'border-transparent text-gray-500 hover:text-[#0b1120]'}`}
            >
              <FileText className="w-4 h-4" /> Study Notes
            </button>
            <button
              onClick={() => setActiveTab('pyqs')}
              className={`flex items-center gap-2 py-4 text-sm font-black whitespace-nowrap border-b-[3px] transition-colors ${activeTab === 'pyqs' ? 'border-[#f59e0b] text-[#0b1120]' : 'border-transparent text-gray-500 hover:text-[#0b1120]'}`}
            >
              <ClipboardList className="w-4 h-4" /> PYQs
            </button>
          </div>
        </div>
      </div>

      {/* ====== NOTES TAB ====== */}
      {activeTab === 'notes' && (
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8" ref={dropdownRef}>
            <div className="relative">
              <button onClick={() => toggleDropdown('level')} className={`flex items-center gap-2 px-5 py-2.5 border-[3px] border-[#0b1120] rounded-xl text-sm font-bold hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[6px_6px_0px_#0b1120] transition-all ${selectedLevel ? 'bg-[#10b981] text-white' : 'bg-white text-[#0b1120]'}`}>
                {selectedLevel || "Level"} <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'level' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border-[3px] border-[#0b1120] rounded-xl shadow-[4px_4px_0px_#0b1120] z-50 overflow-hidden">
                  {levels.map((item, i) => (
                    <button key={i} onClick={() => handleLevelSelect(item)} className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${selectedLevel === item ? 'bg-[#10b981] text-white' : 'text-[#0b1120] hover:bg-gray-100'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => toggleDropdown('subjects')} className={`flex items-center gap-2 px-5 py-2.5 border-[3px] border-[#0b1120] rounded-xl text-sm font-bold hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[6px_6px_0px_#0b1120] transition-all ${selectedSubject ? 'bg-[#10b981] text-white' : 'bg-white text-[#0b1120]'}`}>
                {selectedSubject || "Subjects"} <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'subjects' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'subjects' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border-[3px] border-[#0b1120] rounded-xl shadow-[4px_4px_0px_#0b1120] z-50 overflow-hidden max-h-64 overflow-y-auto">
                  {availableSubjects.map((item, i) => (
                    <button key={i} onClick={() => handleSubjectSelect(item)} className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${selectedSubject === item ? 'bg-[#10b981] text-white' : 'text-[#0b1120] hover:bg-gray-100'}`}>{item}</button>
                  ))}
                </div>
              )}
            </div>

            {(selectedLevel || selectedSubject) && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border-[3px] border-red-400 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Subject Cards */}
          <div className="space-y-16 pb-24">
            {filteredLevels.map((level) => {
              const subjects = levelSubjects[level];
              const filteredSubjects = selectedSubject ? subjects.filter((s) => s === selectedSubject) : subjects;
              if (filteredSubjects.length === 0) return null;
              return (
                <section key={level}>
                  <h2 className="text-3xl font-black text-[#0b1120] mb-6 border-b-4 border-gray-100 pb-3">{level} Level</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredSubjects.map((subj, i) => (
                      <Link key={i} to={`/resources/${encodeURIComponent(level)}/${encodeURIComponent(subj)}`} className="p-6 bg-white border-[3px] border-[#0b1120] rounded-2xl hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[8px_8px_0px_#0b1120] transition-all cursor-pointer group flex flex-col h-full">
                        <div className="font-black text-[#0b1120] text-xl mb-4 group-hover:text-[#10b981] transition-colors">{subj}</div>
                        <div className="mt-auto flex items-center gap-2 text-sm text-gray-600 font-bold">
                          View Resources <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== PYQs TAB ====== */}
      {activeTab === 'pyqs' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-500 font-medium mb-8 max-w-2xl">
            Select your level, subject, and exam type to find previous year question papers.
          </p>

          {/* Step 1: Level Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Step 1 — Select Level</h3>
            <div className="flex flex-wrap gap-3">
              {(["Qualifier", "Foundation", "Diploma"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => { setPyqLevel(lv); setPyqSubject(null); setPyqExam(null); }}
                  className={`px-6 py-3 border-[3px] border-[#0b1120] rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 ${pyqLevel === lv ? 'bg-[#f59e0b] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-white text-[#0b1120] shadow-[3px_3px_0px_#0b1120]'}`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Subject Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Step 2 — Select Subject</h3>
            <div className="flex flex-wrap gap-3">
              {pyqSubjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => { setPyqSubject(subj); setPyqExam(null); }}
                  className={`px-5 py-2.5 border-[3px] border-[#0b1120] rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${pyqSubject === subj ? 'bg-[#0b1120] text-white shadow-[4px_4px_0px_#f59e0b]' : 'bg-white text-[#0b1120] shadow-[3px_3px_0px_#0b1120]'}`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Exam Type Selection (only show when multiple types) */}
          {pyqSubject && availableExamTypes.length > 1 && (
            <div className="mb-10">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Step 3 — Select Exam Type</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPyqExam(null)}
                  className={`px-5 py-2.5 border-[3px] border-[#0b1120] rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${pyqExam === null ? 'bg-[#10b981] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-white text-[#0b1120] shadow-[3px_3px_0px_#0b1120]'}`}
                >
                  All
                </button>
                {availableExamTypes.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPyqExam(ex)}
                    className={`px-5 py-2.5 border-[3px] border-[#0b1120] rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${pyqExam === ex ? 'bg-[#10b981] text-white shadow-[4px_4px_0px_#0b1120]' : 'bg-white text-[#0b1120] shadow-[3px_3px_0px_#0b1120]'}`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {pyqSubject && (
            <div className="pb-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 rounded-full bg-[#f59e0b]" />
                <h2 className="text-2xl font-black text-[#0b1120]">
                  {pyqSubject} {pyqExam ? `— ${pyqExam}` : '— All PYQs'}
                </h2>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200">
                  {pyqLevel}
                </span>
              </div>

              {pyqLoading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-500 font-bold text-sm">Loading PYQs...</p>
                </div>
              ) : pyqResources.length === 0 ? (
                <div className="text-center py-16 px-6 bg-gray-50 border-[3px] border-dashed border-gray-200 rounded-2xl">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-lg font-black text-[#0b1120] mb-2">No PYQs Found</h3>
                  <p className="text-gray-500 font-medium text-sm">
                    No previous year questions available for {pyqSubject} {pyqExam ? `— ${pyqExam}` : ''} ({pyqLevel}) yet. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pyqResources.map((res) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 p-5 bg-white border-[3px] border-[#0b1120] rounded-2xl hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[8px_8px_0px_#0b1120] transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-amber-50">
                        <ClipboardList className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[#0b1120] mb-1 group-hover:text-[#10b981] transition-colors">{res.title}</h3>
                        {res.description && <p className="text-sm text-gray-500 font-medium">{res.description}</p>}
                        {!pyqExam && res.sub_type && (
                          <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200">{res.sub_type}</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#10b981] transition-colors shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Placeholder when nothing selected */}
          {!pyqSubject && (
            <div className="text-center py-20 px-6">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-black text-[#0b1120] mb-2">Select a Subject</h3>
              <p className="text-gray-500 font-medium text-sm max-w-md mx-auto">
                Choose your level and subject above to browse previous year question papers.
              </p>
            </div>
          )}

          {pyqSubject && !pyqLoading && pyqResources.length > 0 && !pyqExam && availableExamTypes.length > 0 && (
            <div className="text-center pt-2 pb-4">
              <p className="text-gray-400 font-medium text-sm">
                Filter by exam type above, or browse all PYQs below.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
