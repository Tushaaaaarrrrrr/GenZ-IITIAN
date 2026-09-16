import { useRef, useState } from 'react';
import { Download, Plus, RotateCcw, Upload } from 'lucide-react';
import TermCard, { LedgerTerm } from './TermCard';
import CgpaStrip from './CgpaStrip';
import { LedgerCourse } from './CourseRow';
import { useLocalStorageState } from '../../../hooks/useLocalStorage';
import { cgpa, percentageFromCgpa } from '../../../lib/grading';
import { FOUNDATION_COURSES } from '../../../lib/foundationCourses';

const STORAGE_KEY = 'gz-cgpa-ledger-v1';

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeEmptyCourse(): LedgerCourse {
  return { id: makeId(), name: '', credits: 4, grade: 'S' };
}

function makeEmptyTerm(name: string): LedgerTerm {
  return { id: makeId(), name, courses: [makeEmptyCourse()] };
}

function makeFoundationTerm(): LedgerTerm {
  return {
    id: makeId(),
    name: 'Foundation Level',
    courses: FOUNDATION_COURSES.map((c) => ({ id: makeId(), name: c.name, credits: c.credits, grade: 'S' as const })),
  };
}

export default function LedgerPanel() {
  const [terms, setTerms] = useLocalStorageState<LedgerTerm[]>(STORAGE_KEY, () => [makeEmptyTerm('Term 1')]);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const overallCgpa = cgpa(terms.map((t) => t.courses.map((c) => ({ credits: c.credits, grade: c.grade }))));
  const totalCredits = terms.reduce((s, t) => s + t.courses.reduce((s2, c) => s2 + c.credits, 0), 0);

  const addTerm = () => setTerms((prev) => [...prev, makeEmptyTerm(`Term ${prev.length + 1}`)]);

  const addFoundationTerm = () => setTerms((prev) => [...prev, makeFoundationTerm()]);

  const removeTerm = (termId: string) => setTerms((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== termId) : prev));

  const duplicateTerm = (termId: string) =>
    setTerms((prev) => {
      const idx = prev.findIndex((t) => t.id === termId);
      if (idx === -1) return prev;
      const source = prev[idx];
      const copy: LedgerTerm = {
        id: makeId(),
        name: `${source.name} (copy)`,
        courses: source.courses.map((c) => ({ ...c, id: makeId() })),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });

  const renameTerm = (termId: string, name: string) =>
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, name } : t)));

  const addCourse = (termId: string) =>
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, courses: [...t.courses, makeEmptyCourse()] } : t)));

  const updateCourse = (termId: string, courseId: string, patch: Partial<LedgerCourse>) =>
    setTerms((prev) =>
      prev.map((t) =>
        t.id === termId
          ? { ...t, courses: t.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)) }
          : t
      )
    );

  const removeCourse = (termId: string, courseId: string) =>
    setTerms((prev) => prev.map((t) => (t.id === termId ? { ...t, courses: t.courses.filter((c) => c.id !== courseId) } : t)));

  const resetLedger = () => {
    setTerms([makeEmptyTerm('Term 1')]);
    setConfirmingReset(false);
  };

  const exportLedger = () => {
    const blob = new Blob([JSON.stringify(terms, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gz-cgpa-ledger.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importLedger = (file: File) => {
    setImportError(null);
    file
      .text()
      .then((text) => {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('Expected a list of terms');
        setTerms(parsed);
      })
      .catch(() => setImportError('Could not read that file — expected a ledger export from this app.'));
  };

  return (
    <div>
      <CgpaStrip cgpaValue={overallCgpa} percentage={percentageFromCgpa(overallCgpa)} totalCredits={totalCredits} />

      <div className="space-y-5">
        {terms.map((term) => (
          <TermCard
            key={term.id}
            term={term}
            onRename={(name) => renameTerm(term.id, name)}
            onAddCourse={() => addCourse(term.id)}
            onUpdateCourse={(courseId, patch) => updateCourse(term.id, courseId, patch)}
            onRemoveCourse={(courseId) => removeCourse(term.id, courseId)}
            onRemoveTerm={() => removeTerm(term.id)}
            onDuplicateTerm={() => duplicateTerm(term.id)}
            canRemoveTerm={terms.length > 1}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[var(--gz-rule)]">
        <button type="button" onClick={addTerm} className="gz-btn flex items-center gap-1.5 px-3 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add term
        </button>
        <button type="button" onClick={addFoundationTerm} className="gz-btn gz-btn-primary flex items-center gap-1.5 px-3 py-2 text-sm">
          <Plus className="w-4 h-4" /> Add foundation-level courses
        </button>
        <button type="button" onClick={exportLedger} className="gz-btn flex items-center gap-1.5 px-3 py-2 text-sm">
          <Download className="w-4 h-4" /> Export JSON
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="gz-btn flex items-center gap-1.5 px-3 py-2 text-sm">
          <Upload className="w-4 h-4" /> Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importLedger(file);
            e.target.value = '';
          }}
        />

        <div className="ml-auto">
          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="gz-btn gz-btn-danger flex items-center gap-1.5 px-3 py-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reset ledger
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--gz-ink-soft)]">Erase all terms?</span>
              <button type="button" onClick={resetLedger} className="gz-btn gz-btn-danger px-3 py-1.5">
                Yes, reset
              </button>
              <button type="button" onClick={() => setConfirmingReset(false)} className="gz-btn px-3 py-1.5">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {importError && <p className="text-sm text-[var(--gz-accent-red-strong)] mt-2">{importError}</p>}
    </div>
  );
}
