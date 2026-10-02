"use client";

export type TabOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

export default function TabsMenu<T extends string>({
  options,
    value,
    onChange,
    showCount = false,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  showCount?: boolean;
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
          <span>{option.label}</span>
          {showCount && typeof option.count === "number" && (
            <span
              className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                value === option.value
                  ? "bg-accent text-white"
                  : "bg-black/5 text-muted"
              }`}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
