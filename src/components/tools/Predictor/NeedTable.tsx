import { NeedRow } from '../../../lib/grading';

interface NeedTableProps {
  rows: NeedRow[];
}

export default function NeedTable({ rows }: NeedTableProps) {
  return (
    <div className="gz-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="gz-row-divider text-left gz-mono text-xs uppercase tracking-wider text-[var(--gz-ink-soft)]">
            <th className="px-4 py-2.5 font-medium">Grade</th>
            <th className="px-4 py-2.5 font-medium">Points</th>
            <th className="px-4 py-2.5 font-medium text-right">Final needed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.letter} className="gz-row-divider last:border-b-0">
              <td className="px-4 py-2.5 font-semibold">{row.letter}</td>
              <td className="px-4 py-2.5 gz-mono">{row.points}</td>
              <td className="px-4 py-2.5 text-right gz-mono">
                {row.status === 'already' && <span className="text-[var(--gz-focus)]">Already there</span>}
                {row.status === 'unreachable' && <span className="text-[var(--gz-accent-red-strong)]">Not reachable</span>}
                {row.status === 'value' && <span>{row.requiredFinal!.toFixed(1)}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
