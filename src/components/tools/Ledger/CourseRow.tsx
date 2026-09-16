import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { FOUNDATION_COURSE_NAMES } from '../../../lib/foundationCourses';
import type { LetterGrade } from '../../../lib/grading';

export interface LedgerCourse {
  id: string;
  name: string;
  credits: number;
  grade: LetterGrade;
}

const GRADE_OPTIONS: LetterGrade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'U', 'W'];

interface CourseRowProps {
  course: LedgerCourse;
  onChange: (patch: Partial<LedgerCourse>) => void;
  onRemove: () => void;
}

export default function CourseRow({ course, onChange, onRemove }: CourseRowProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions =
    course.name.trim().length > 0
      ? FOUNDATION_COURSE_NAMES.filter((n) => n.toLowerCase().includes(course.name.trim().toLowerCase())).slice(0, 5)
      : [];

  return (
    <div className="gz-row-divider flex flex-wrap items-center gap-2 py-2.5">
      <div className="relative flex-1 min-w-[160px]">
        <input
          type="text"
          value={course.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          placeholder="Course name"
          className="gz-input w-full px-2.5 py-1.5 text-sm"
          aria-label="Course name"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="gz-card absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto text-sm">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full px-2.5 py-1.5 text-left hover:bg-black/5"
                  onMouseDown={() => onChange({ name: s })}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        type="number"
        min={1}
        max={20}
        value={course.credits}
        onChange={(e) => onChange({ credits: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
        placeholder="Credits"
        aria-label="Credits"
        className="gz-input w-20 px-2.5 py-1.5 text-sm text-center"
      />

      <select
        value={course.grade}
        onChange={(e) => onChange({ grade: e.target.value as LetterGrade })}
        aria-label="Grade"
        className="gz-input w-20 px-2 py-1.5 text-sm"
      >
        {GRADE_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove course"
        className="gz-btn gz-btn-danger p-1.5"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
