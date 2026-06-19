"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

type TimeSelectProps = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  minuteStep?: number;
};

export function TimeSelect({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  minuteStep = 15,
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => {
    const opts: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += minuteStep) {
        const hr = h.toString().padStart(2, "0");
        const mn = m.toString().padStart(2, "0");
        opts.push(`${hr}:${mn}`);
      }
    }
    if (!opts.includes(value)) {
      opts.push(value);
      opts.sort();
    }
    return opts;
  }, [minuteStep, value]);

  const filteredOptions = useMemo(() => {
    if (!filter) return allOptions;
    const cleanFilter = filter.replace(/[^\d:]/g, "");
    return allOptions.filter((o) => o.includes(cleanFilter));
  }, [allOptions, filter]);

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = filteredOptions.indexOf(value);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        if (window.innerHeight - rect.bottom < 260 && rect.top > 260) {
          setOpenUpwards(true);
        } else {
          setOpenUpwards(false);
        }
      }
    } else {
      setFilter("");
    }
  }, [isOpen, value, filteredOptions]);

  useEffect(() => {
    function handleMousedown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleMousedown);
    }
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const selectedIndex = filteredOptions.indexOf(value);
      if (selectedIndex >= 0) {
        const el = listboxRef.current.children[selectedIndex] as HTMLElement;
        if (el) {
          el.scrollIntoView({ block: "center" });
        }
      }
    }
  }, [isOpen, filteredOptions, value]);

  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[activeIndex]) {
          onChange(filteredOptions[activeIndex]);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "time-select-listbox" : undefined}
        aria-haspopup="listbox"
        aria-label={ariaLabel || "Select time"}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#06121A] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/40 focus:outline-none transition-colors ${
          disabled ? "opacity-30 cursor-not-allowed" : "hover:border-white/[0.15]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#F7F7F7]/40" />
          <span>{value}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[#F7F7F7]/40 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-full min-w-[12rem] bg-[#0C1B26] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col ${
            openUpwards ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
          }`}
          style={{ maxHeight: "240px" }}
        >
          <div className="p-2 border-b border-white/[0.06] shrink-0">
            <input
              type="text"
              autoFocus
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Type to filter..."
              className="w-full bg-white/[0.04] border border-transparent rounded-lg px-3 py-1.5 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/30 focus:border-[#E6FA50]/40 focus:outline-none focus:bg-[#06121A]"
            />
          </div>
          <div
            id="time-select-listbox"
            ref={listboxRef}
            role="listbox"
            className="flex-1 overflow-y-auto p-1 no-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-[#F7F7F7]/40">
                No times found
              </div>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSelected = opt === value;
                const isActive = i === activeIndex;
                return (
                  <div
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                        : isActive
                        ? "bg-white/[0.04] text-[#F7F7F7]"
                        : "text-[#F7F7F7]/80"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
