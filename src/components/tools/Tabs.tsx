export interface TabDef<T extends string> {
  key: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabDef<T>[];
  active: T;
  onChange: (key: T) => void;
}

export default function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-[var(--gz-rule)] mb-6 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          data-active={active === tab.key}
          onClick={() => onChange(tab.key)}
          className="gz-tab px-1 py-3 text-sm whitespace-nowrap"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
