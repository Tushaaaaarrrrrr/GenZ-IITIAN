interface ResultStampProps {
  letter: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';
  T: number;
  points: number;
}

export default function ResultStamp({ letter, T, points }: ResultStampProps) {
  const isGold = letter === 'S';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`gz-stamp ${isGold ? 'gz-stamp-gold' : 'gz-stamp-red'}`} aria-hidden="true">
        <span className="text-4xl">{letter}</span>
      </div>
      <div className="text-center">
        <p className="gz-mono text-2xl">{T.toFixed(2)}</p>
        <p className="text-sm text-[var(--gz-ink-soft)]">Score T out of 100 · {points} grade point{points === 1 ? '' : 's'}</p>
      </div>
    </div>
  );
}
