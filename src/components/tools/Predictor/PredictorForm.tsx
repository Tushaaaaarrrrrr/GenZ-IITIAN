interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
}

function NumberField({ label, value, onChange, max }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-[var(--gz-ink-soft)] gz-mono">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        step="0.01"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') return onChange(0);
          const n = Number(raw);
          if (Number.isNaN(n)) return;
          onChange(Math.min(max, Math.max(0, n)));
        }}
        className="gz-input px-3 py-2 text-base"
      />
    </label>
  );
}

export type CourseType = 'non-oppe' | 'oppe';

export interface NonOppeFormState {
  qz1: number;
  qz2: number;
  final: number;
  bonus: number;
}

export interface OppeFormState {
  qz1: number;
  final: number;
  pe1: number;
  pe2: number;
  bonus: number;
}

interface PredictorFormProps {
  courseType: CourseType;
  nonOppe: NonOppeFormState;
  oppe: OppeFormState;
  onChangeNonOppe: (patch: Partial<NonOppeFormState>) => void;
  onChangeOppe: (patch: Partial<OppeFormState>) => void;
}

export default function PredictorForm({ courseType, nonOppe, oppe, onChangeNonOppe, onChangeOppe }: PredictorFormProps) {
  if (courseType === 'non-oppe') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NumberField label="Quiz 1" value={nonOppe.qz1} onChange={(v) => onChangeNonOppe({ qz1: v })} max={100} />
        <NumberField label="Quiz 2" value={nonOppe.qz2} onChange={(v) => onChangeNonOppe({ qz2: v })} max={100} />
        <NumberField label="Final" value={nonOppe.final} onChange={(v) => onChangeNonOppe({ final: v })} max={100} />
        <NumberField label="Bonus" value={nonOppe.bonus} onChange={(v) => onChangeNonOppe({ bonus: v })} max={20} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      <NumberField label="Quiz 1" value={oppe.qz1} onChange={(v) => onChangeOppe({ qz1: v })} max={100} />
      <NumberField label="Final" value={oppe.final} onChange={(v) => onChangeOppe({ final: v })} max={100} />
      <NumberField label="PE 1" value={oppe.pe1} onChange={(v) => onChangeOppe({ pe1: v })} max={100} />
      <NumberField label="PE 2" value={oppe.pe2} onChange={(v) => onChangeOppe({ pe2: v })} max={100} />
      <NumberField label="Bonus" value={oppe.bonus} onChange={(v) => onChangeOppe({ bonus: v })} max={20} />
    </div>
  );
}
