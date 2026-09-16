import { useMemo, useState } from 'react';
import PredictorForm, { CourseType, NonOppeFormState, OppeFormState } from './PredictorForm';
import ResultStamp from './ResultStamp';
import NeedTable from './NeedTable';
import { computeNonOppe, computeOppe, neededFinalNonOppe, neededFinalOppe } from '../../../lib/grading';

const DEFAULT_NON_OPPE: NonOppeFormState = { qz1: 0, qz2: 0, final: 0, bonus: 0 };
const DEFAULT_OPPE: OppeFormState = { qz1: 0, final: 0, pe1: 0, pe2: 0, bonus: 0 };

export default function PredictorPanel() {
  const [courseType, setCourseType] = useState<CourseType>('non-oppe');
  const [nonOppe, setNonOppe] = useState<NonOppeFormState>(DEFAULT_NON_OPPE);
  const [oppe, setOppe] = useState<OppeFormState>(DEFAULT_OPPE);

  const nonOppeResult = useMemo(() => computeNonOppe(nonOppe), [nonOppe]);
  const oppeResult = useMemo(() => computeOppe(oppe), [oppe]);

  const needRows = useMemo(
    () =>
      courseType === 'non-oppe'
        ? neededFinalNonOppe(nonOppe.qz1, nonOppe.qz2, nonOppe.bonus)
        : neededFinalOppe(oppe.qz1, oppe.pe1, oppe.pe2, oppe.bonus),
    [courseType, nonOppe, oppe]
  );

  const activeResult = courseType === 'non-oppe' ? nonOppeResult : oppeResult;

  return (
    <div>
      <div className="flex gap-2 mb-6" role="tablist" aria-label="Course type">
        <button
          type="button"
          role="tab"
          aria-selected={courseType === 'non-oppe'}
          onClick={() => setCourseType('non-oppe')}
          className={`gz-btn px-4 py-2 text-sm ${courseType === 'non-oppe' ? 'gz-btn-primary' : ''}`}
        >
          Non-OPPE (theory)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={courseType === 'oppe'}
          onClick={() => setCourseType('oppe')}
          className={`gz-btn px-4 py-2 text-sm ${courseType === 'oppe' ? 'gz-btn-primary' : ''}`}
        >
          OPPE (programming)
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
        <div className="gz-card p-5">
          <PredictorForm
            courseType={courseType}
            nonOppe={nonOppe}
            oppe={oppe}
            onChangeNonOppe={(patch) => setNonOppe((prev) => ({ ...prev, ...patch }))}
            onChangeOppe={(patch) => setOppe((prev) => ({ ...prev, ...patch }))}
          />

          {courseType === 'non-oppe' && (
            <div className="mt-5 pt-4 border-t border-dashed border-[var(--gz-rule-strong)] gz-mono text-sm text-[var(--gz-ink-soft)] flex flex-wrap gap-x-6 gap-y-1">
              <span>
                Formula A: <strong className={nonOppeResult.used === 'A' ? 'text-[var(--gz-ink)]' : ''}>{nonOppeResult.formulaA.toFixed(2)}</strong>
              </span>
              <span>
                Formula B: <strong className={nonOppeResult.used === 'B' ? 'text-[var(--gz-ink)]' : ''}>{nonOppeResult.formulaB.toFixed(2)}</strong>
              </span>
              <span>Using: Formula {nonOppeResult.used} (higher of the two)</span>
            </div>
          )}
        </div>

        <ResultStamp letter={activeResult.letter} T={activeResult.T} points={activeResult.points} />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">What do I need in the Final?</h3>
        <p className="text-sm text-[var(--gz-ink-soft)] mb-3">
          Based on the marks entered above (excluding the Final), here's the minimum Final-exam score needed for each grade.
        </p>
        <NeedTable rows={needRows} />
      </div>
    </div>
  );
}
