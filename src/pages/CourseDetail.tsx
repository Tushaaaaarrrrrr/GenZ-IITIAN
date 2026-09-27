import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Check, Sparkles, Layout, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  COURSE_PAGE_SETTINGS_KEY,
  parseCoursePageSettings,
  reviewsForCourse,
  videoForCourse,
  themeForCourse,
  updateCourseTheme,
  type CoursePageSettings,
  type CoursePageTheme,
  type FeedbackNote,
} from '../data/coursePage';
import CourseDetailClassic from '../components/course/CourseDetailClassic';
import CourseDetailModern from '../components/course/CourseDetailModern';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isManager } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [, setSettings] = useState<CoursePageSettings | null>(null);
  const [reviews, setReviews] = useState<FeedbackNote[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Active theme: 'old' (classic) by default, or 'new' (modern)
  const [activeTheme, setActiveTheme] = useState<CoursePageTheme>('old');
  const [savedDbTheme, setSavedDbTheme] = useState<CoursePageTheme>('old');
  const [savingTheme, setSavingTheme] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showManagerControls, setShowManagerControls] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
        let settingsValue: string | null = null;
        try {
          const settingsRes = await supabase
            .from('settings')
            .select('value')
            .eq('key', COURSE_PAGE_SETTINGS_KEY)
            .maybeSingle();
          settingsValue = settingsRes.data?.value ?? null;
        } catch {
          settingsValue = null;
        }

        if (cancelled) return;
        if (error || !data || data.active === false) {
          navigate('/courses');
          return;
        }

        const parsed = parseCoursePageSettings(settingsValue);
        const resolvedTheme = themeForCourse(parsed, data.id, data);
        
        // If theme query param is passed (e.g. ?theme=new or ?theme=old), respect it for preview
        const queryTheme = searchParams.get('theme');
        const initialTheme: CoursePageTheme = (queryTheme === 'new' || queryTheme === 'old')
          ? queryTheme
          : resolvedTheme;

        setCourse(data);
        setSettings(parsed);
        setReviews(reviewsForCourse(parsed, data.id));
        setVideoUrl(videoForCourse(parsed, data.id));
        setActiveTheme(initialTheme);
        setSavedDbTheme(resolvedTheme);
        setLoading(false);
      } catch {
        if (!cancelled) navigate('/courses');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, searchParams]);

  const handleSelectTheme = (newTheme: CoursePageTheme) => {
    setActiveTheme(newTheme);
    setSaveStatus(null);
  };

  const handleSaveTheme = async () => {
    if (!course?.id) return;
    setSavingTheme(true);
    setSaveStatus(null);
    try {
      const { error } = await updateCourseTheme(course.id, activeTheme);
      if (error) {
        setSaveStatus('Error saving theme');
      } else {
        setSavedDbTheme(activeTheme);
        setSaveStatus('Theme saved successfully!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch {
      setSaveStatus('Failed to update');
    } finally {
      setSavingTheme(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f9]">
        <Loader2 className="animate-spin w-8 h-8 text-slate-800" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Collapsed Manager Button & Expanded Controls */}
      {isManager && (
        <div className="fixed bottom-6 right-6 z-[120]">
          {!showManagerControls ? (
            <button
              type="button"
              onClick={() => setShowManagerControls(true)}
              className="px-4 py-2.5 bg-[#0b1120] text-white border-2 border-amber-400 rounded-2xl shadow-[4px_4px_0px_#f59e0b] font-black text-xs flex items-center gap-2 hover:bg-slate-900 transition-all hover:-translate-y-0.5 cursor-pointer"
              title="Manager Course Theme Options"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Theme: {activeTheme === 'new' ? 'Modern Redesign' : 'Classic (Old)'}</span>
              <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-bold uppercase">
                Manager
              </span>
            </button>
          ) : (
            <div className="bg-[#0b1120] border-2 border-amber-400 text-white p-4 rounded-2xl shadow-[8px_8px_0px_#0b1120] w-80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Manager Theme Control
                </span>
                <button
                  type="button"
                  onClick={() => setShowManagerControls(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-gray-300 font-medium">
                Default is Classic. Only manager can turn ON the Modern Redesign.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('old')}
                  className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                    activeTheme === 'old'
                      ? 'border-amber-400 bg-amber-400/20 text-white'
                      : 'border-slate-700 bg-slate-800/80 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-xs">
                    <Layout className="w-3 h-3" /> Classic (Old)
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Default layout</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTheme('new')}
                  className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                    activeTheme === 'new'
                      ? 'border-amber-400 bg-amber-400/20 text-white'
                      : 'border-slate-700 bg-slate-800/80 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-xs">
                    <Sparkles className="w-3 h-3" /> Modern Redesign
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Turned ON</div>
                </button>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  disabled={savingTheme || activeTheme === savedDbTheme}
                  className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    activeTheme === savedDbTheme
                      ? 'bg-slate-800 text-gray-500 cursor-default border border-slate-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow cursor-pointer'
                  }`}
                >
                  {savingTheme ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {activeTheme === savedDbTheme ? 'Active Default in DB' : 'Save as Default'}
                </button>
              </div>

              {saveStatus && (
                <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {saveStatus}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Render selected theme */}
      {activeTheme === 'new' ? (
        <CourseDetailModern
          course={course}
          reviews={reviews}
          videoUrl={videoUrl}
        />
      ) : (
        <CourseDetailClassic
          course={course}
        />
      )}
    </div>
  );
}
