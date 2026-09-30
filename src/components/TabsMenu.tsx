"use client";

export type TabOption<T extends string> = {
  value: T;
  label: string;
};

export default function TabsMenu<T extends string>({
  options,
  value,
  onChange,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-black/10 scrollbar-hide">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${value === option.value ? "border-accent text-accent" : "border-transparent text-muted"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
