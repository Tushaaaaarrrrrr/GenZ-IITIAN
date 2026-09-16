import { Copy, Plus, Trash2 } from 'lucide-react';
import CourseRow, { LedgerCourse } from './CourseRow';
import { sgpa } from '../../../lib/grading';

export interface LedgerTerm {
  id: string;
  name: string;
  courses: LedgerCourse[];
}

interface TermCardProps {
  term: LedgerTerm;
  onRename: (name: string) => void;
  onAddCourse: () => void;
  onUpdateCourse: (courseId: string, patch: Partial<LedgerCourse>) => void;
  onRemoveCourse: (courseId: string) => void;
  onRemoveTerm: () => void;
  onDuplicateTerm: () => void;
  canRemoveTerm: boolean;
}

export default function TermCard({
  term,
  onRename,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  onRemoveTerm,
  onDuplicateTerm,
  canRemoveTerm,
}: TermCardProps) {
  const termSgpa = sgpa(term.courses.map((c) => ({ credits: c.credits, grade: c.grade })));
  const totalCredits = term.courses.reduce((s, c) => s + c.credits, 0);

  return (
    <div className="gz-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <input
          type="text"
          value={term.name}
          onChange={(e) => onRename(e.target.value)}
          className="gz-input px-2.5 py-1.5 text-base font-semibold flex-1 min-w-[140px]"
          style={{ fontFamily: "'Source Serif 4', serif" }}
          aria-label="Term name"
        />
        <div className="flex items-center gap-3 gz-mono text-sm">
          <span className="text-[var(--gz-ink-soft)]">{totalCredits} cr</span>
          <span>
            SGPA <strong className="text-base">{termSgpa.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      <div>
        {term.courses.length === 0 && (
          <p className="text-sm text-[var(--gz-ink-soft)] py-3">No courses yet — add one below.</p>
        )}
        {term.courses.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            onChange={(patch) => onUpdateCourse(course.id, patch)}
            onRemove={() => onRemoveCourse(course.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1">
        <button type="button" onClick={onAddCourse} className="gz-btn flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <Plus className="w-3.5 h-3.5" /> Add course
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onDuplicateTerm} className="gz-btn flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          {canRemoveTerm && (
            <button type="button" onClick={onRemoveTerm} className="gz-btn gz-btn-danger flex items-center gap-1.5 px-3 py-1.5 text-sm">
              <Trash2 className="w-3.5 h-3.5" /> Remove term
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
