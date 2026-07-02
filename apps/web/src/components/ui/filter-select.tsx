"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  active,
  icon: Icon,
  alignRight,
  className = "",
}: {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  active?: boolean;
  icon?: any;
  alignRight?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`label flex w-full h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border ${
          active
            ? "border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]"
            : "border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]"
        }`}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0 opacity-60" />}
          {selectedOption ? selectedOption.label : label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute top-full z-40 mt-2 w-max min-w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#0C1B26] shadow-xl ${
            alignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-white/[0.03] text-[#E6FA50]" : "text-[#F7F7F7] hover:bg-white/[0.06]"
                }`}
              >
                <span className="label block truncate pr-4">{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-[#E6FA50]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterMultiSelect({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const active = selected.length > 0;

  return (
    <div className="relative inline-block text-left shrink-0" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`label flex h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border ${
          active
            ? "border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]"
            : "border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]"
        }`}
      >
        <span>
          {label} {active ? `· ${selected.length}` : ""}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-40 mt-2 w-max min-w-[200px] origin-top-left overflow-hidden rounded-xl border border-white/[0.06] bg-[#0C1B26] shadow-xl"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <button
                  key={opt}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(opt)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-[#E6FA50] bg-[#E6FA50]"
                        : "border-white/[0.2] bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-[#06121A]" />}
                  </div>
                  <span className={`label block truncate ${isSelected ? "text-[#E6FA50]" : "text-[#F7F7F7]"}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
          {active && onClear && (
            <div className="border-t border-white/[0.06] p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="label w-full rounded-lg px-2 py-1.5 text-center text-[#F7F7F7]/60 hover:bg-white/[0.06] hover:text-[#F7F7F7]"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
