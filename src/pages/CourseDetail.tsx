import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Check, Sparkles, Layout, Save } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { isManager } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [settings, setSettings] = useState<CoursePageSettings | null>(null);
  const [reviews, setReviews] = useState<FeedbackNote[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Active theme: 'old' (classic) by default, or 'new' (modern)
  const [activeTheme, setActiveTheme] = useState<CoursePageTheme>('old');
  const [savedDbTheme, setSavedDbTheme] = useState<CoursePageTheme>('old');
  const [savingTheme, setSavingTheme] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
        // Clear status after 3 seconds
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
    <div>
      {/* Manager Theme Selector Bar - Visible only to Managers */}
      {isManager && (
        <div className="bg-[#0b1120] border-b-2 border-amber-400 text-white px-4 py-2.5 sticky top-16 md:top-20 z-[90] shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 bg-amber-400 text-[#0b1120] font-black rounded text-[10px] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Manager Control
              </span>
              <span className="font-bold text-gray-300 hidden sm:inline">Theme for this course:</span>
              <span className="text-gray-400 text-xs hidden sm:inline">
                (Saved in database: <strong className="text-amber-300">{savedDbTheme === 'new' ? 'Modern Redesign' : 'Classic (Old)'}</strong>)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-800/80 p-0.5 rounded-lg flex items-center border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('old')}
                  className={`px-3 py-1 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${
                    activeTheme === 'old'
                      ? 'bg-amber-400 text-[#0b1120] shadow font-black'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Layout className="w-3 h-3" />
                  Classic (Old)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTheme('new')}
                  className={`px-3 py-1 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${
                    activeTheme === 'new'
                      ? 'bg-amber-400 text-[#0b1120] shadow font-black'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Modern Redesign
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveTheme}
                disabled={savingTheme || activeTheme === savedDbTheme}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
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
                {activeTheme === savedDbTheme ? 'Active Theme' : 'Save as Default'}
              </button>

              {saveStatus && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {saveStatus}
                </span>
              )}
            </div>
          </div>
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
