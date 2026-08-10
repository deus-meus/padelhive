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
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className={`z-50 overflow-hidden border border-white/[0.06] bg-[#0C1B26] shadow-xl 
              fixed bottom-0 left-0 right-0 w-full rounded-t-2xl border-b-0 pb-8 pt-4
              lg:absolute lg:bottom-auto lg:top-full lg:mt-2 lg:w-max lg:min-w-full lg:rounded-xl lg:border-b lg:p-0 lg:pb-0
              ${alignRight ? "lg:right-0 lg:origin-top-right" : "lg:left-0 lg:origin-top-left"}
            `}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10 lg:hidden" />
            <div className="px-4 pb-2 lg:hidden">
              <p className="caption text-[#F7F7F7]/60">{label}</p>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto lg:max-h-none">
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
                    className={`flex w-full items-center justify-between px-6 py-3.5 lg:px-4 lg:py-2.5 text-left transition-colors ${
                      isSelected ? "bg-white/[0.03] text-[#E6FA50]" : "text-[#F7F7F7] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="label block truncate pr-4">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-[#E6FA50]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
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
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className="z-50 overflow-hidden border border-white/[0.06] bg-[#0C1B26] shadow-xl 
              fixed bottom-0 left-0 right-0 w-full rounded-t-2xl border-b-0 pb-8 pt-4
              lg:absolute lg:left-0 lg:top-full lg:bottom-auto lg:mt-2 lg:w-max lg:min-w-[200px] lg:origin-top-left lg:rounded-xl lg:border-b lg:p-0 lg:pb-0"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10 lg:hidden" />
            <div className="px-4 pb-2 lg:hidden">
              <p className="caption text-[#F7F7F7]/60">{label}</p>
            </div>

            <div className="max-h-[60vh] lg:max-h-64 overflow-y-auto py-1">
              {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onToggle(opt)}
                    className="flex w-full items-center gap-3 px-6 py-3.5 lg:px-4 lg:py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <div
                      className={`flex h-4 w-4 lg:h-4 lg:w-4 shrink-0 items-center justify-center rounded border transition-colors ${
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
              <div className="border-t border-white/[0.06] p-4 lg:p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="caption w-full rounded-lg bg-white/[0.03] py-2 lg:py-1.5 text-center text-[#F7F7F7] hover:bg-white/[0.06]"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
