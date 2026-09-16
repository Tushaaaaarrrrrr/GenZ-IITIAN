import { GRADE_BANDS, U_GRADE, W_GRADE } from '../../lib/grading';

export default function GradingScale() {
  return (
    <div>
      <div className="gz-card overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="gz-row-divider text-left gz-mono text-xs uppercase tracking-wider text-[var(--gz-ink-soft)]">
              <th className="px-4 py-2.5 font-medium">Score (T)</th>
              <th className="px-4 py-2.5 font-medium">Letter</th>
              <th className="px-4 py-2.5 font-medium">Points</th>
              <th className="px-4 py-2.5 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {GRADE_BANDS.map((band, i) => {
              const next = GRADE_BANDS[i - 1];
              const rangeLabel = i === 0 ? `≥ ${band.min}` : `${band.min} – ${(next.min - 0.01).toFixed(2)}`;
              return (
                <tr key={band.letter} className="gz-row-divider">
                  <td className="px-4 py-2.5 gz-mono">{rangeLabel}</td>
                  <td className="px-4 py-2.5 font-semibold">{band.letter}</td>
                  <td className="px-4 py-2.5 gz-mono">{band.points}</td>
                  <td className="px-4 py-2.5 text-[var(--gz-ink-soft)]">{band.label}</td>
                </tr>
              );
            })}
            <tr className="gz-row-divider">
              <td className="px-4 py-2.5 gz-mono">&lt; 40</td>
              <td className="px-4 py-2.5 font-semibold">{U_GRADE.letter}</td>
              <td className="px-4 py-2.5 gz-mono">{U_GRADE.points}</td>
              <td className="px-4 py-2.5 text-[var(--gz-ink-soft)]">{U_GRADE.label}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 gz-mono">Attendance &lt; 85%</td>
              <td className="px-4 py-2.5 font-semibold">{W_GRADE.letter}</td>
              <td className="px-4 py-2.5 gz-mono">{W_GRADE.points}</td>
              <td className="px-4 py-2.5 text-[var(--gz-ink-soft)]">{W_GRADE.label}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-4 text-sm leading-relaxed max-w-2xl">
        <div>
          <h3 className="font-semibold mb-1">Absolute grading</h3>
          <p className="text-[var(--gz-ink-soft)]">
            These cutoffs are fixed, not curved against the batch's performance. Instructors retain discretion to
            moderate grades in exceptional cases (e.g. a visibly miscalibrated exam), but by default your score T maps
            directly to the table above.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">How U and W affect your CGPA</h3>
          <p className="text-[var(--gz-ink-soft)]">
            Both U (score below 40) and W (attendance below 85%) carry 0 grade points — but the course's credits still
            count in the CGPA denominator until you re-register for and pass that course. They don't just disappear
            from your record; they actively pull your CGPA down until cleared.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">CGPA × 10 = Percentage</h3>
          <p className="text-[var(--gz-ink-soft)]">
            The program's rule of thumb for an equivalent percentage is simply your CGPA multiplied by 10 — e.g. a CGPA
            of 8.5 is quoted as 85%.
          </p>
        </div>
      </div>
    </div>
  );
}
