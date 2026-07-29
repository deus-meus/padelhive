import React, { ReactNode } from "react";

export interface FilterTab<T extends string> {
  label: ReactNode;
  value: T;
}

export interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  className?: string;
  tabClassName?: string;
}

export function FilterTabs<T extends string>({ tabs, activeValue, onChange, className = "", tabClassName = "" }: FilterTabsProps<T>) {
  return (
    <div className={`mb-6 flex gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`label shrink-0 rounded-lg px-4 py-2 transition-all ${
            activeValue === tab.value
              ? "bg-[#E6FA50]/10 text-[#E6FA50]"
              : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
          } ${tabClassName}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
