"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Clock, ChevronDown } from "lucide-react";

type TimeSelectProps = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  minuteStep?: number;
};

function formatTo12Hour(time24: string): string {
  if (!time24) return "";
  const [h24, m] = time24.split(":").map(Number);
  if (isNaN(h24) || isNaN(m)) return time24;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function ThemedSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleMousedown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleMousedown);
    }
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
    };
  }, [open]);

  useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex w-16 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#06121A] px-3 py-2 text-sm text-[#F7F7F7] transition-colors hover:border-white/[0.15] focus:border-[#E6FA50]/40 focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#F7F7F7]/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-44 overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0C1B26] py-1 shadow-2xl shadow-black/40 no-scrollbar"
        >
          {options.map((opt) => {
            const isSel = opt === value;
            return (
              <li key={opt} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  ref={isSel ? selectedRef : undefined}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-1.5 text-center text-sm transition-colors ${
                    isSel
                      ? "bg-[#E6FA50] text-[#06121A] font-semibold"
                      : "text-[#F7F7F7]/80 hover:bg-white/[0.06]"
                  }`}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function TimeSelect({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  minuteStep = 15,
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  // Staged states
  const [stagedHour, setStagedHour] = useState<number>(12);
  const [stagedMinute, setStagedMinute] = useState<string>("00");
  const [stagedAmpm, setStagedAmpm] = useState<"AM" | "PM">("AM");

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse incoming value when popover opens
  useEffect(() => {
    if (isOpen && value) {
      const [h24, m] = value.split(":").map(Number);
      if (!isNaN(h24) && !isNaN(m)) {
        setStagedAmpm(h24 >= 12 ? "PM" : "AM");
        setStagedHour(h24 % 12 === 0 ? 12 : h24 % 12);
        setStagedMinute(String(m).padStart(2, "0"));
      }

      // Check space
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        if (window.innerHeight - rect.bottom < 260 && rect.top > 260) {
          setOpenUpwards(true);
        } else {
          setOpenUpwards(false);
        }
      }
    }
  }, [isOpen, value]);

  // Click outside closes without saving
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

  // Escape closes without saving
  function handleKeyDown(e: React.KeyboardEvent) {
    if (isOpen && e.key === "Escape") {
      e.stopPropagation();
      setIsOpen(false);
    }
  }

  function handleApply() {
    let h24 = stagedHour % 12;
    if (stagedAmpm === "PM") h24 += 12;
    const out = `${String(h24).padStart(2, "0")}:${stagedMinute}`;
    onChange(out);
    setIsOpen(false);
  }

  // Options
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = useMemo(() => {
    const opts: string[] = [];
    for (let m = 0; m < 60; m += minuteStep) {
      opts.push(m.toString().padStart(2, "0"));
    }
    if (!opts.includes(stagedMinute)) {
      opts.push(stagedMinute);
      opts.sort();
    }
    return opts;
  }, [minuteStep, stagedMinute]);

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel || "Select time"}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#06121A] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/40 focus:outline-none transition-colors ${
          disabled ? "opacity-30 cursor-not-allowed" : "hover:border-white/[0.15]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#F7F7F7]/40" />
          <span>{formatTo12Hour(value)}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[#F7F7F7]/40 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Select time"
          className={`absolute z-50 bg-[#0C1B26] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 p-5 w-72 flex flex-col ${
            openUpwards ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#F7F7F7]/80">Select Time</h3>
            <span className="text-sm font-semibold text-[#E6FA50]">
              {stagedHour}:{stagedMinute} {stagedAmpm}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <ThemedSelect
              ariaLabel="Hour"
              value={String(stagedHour)}
              options={hourOptions.map(String)}
              onChange={(v) => setStagedHour(Number(v))}
            />
            <span className="text-[#F7F7F7]/40 font-medium">:</span>
            <ThemedSelect
              ariaLabel="Minute"
              value={stagedMinute}
              options={minuteOptions}
              onChange={(v) => setStagedMinute(v)}
            />
          </div>

          <div className="mt-4 self-center inline-flex rounded-lg bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setStagedAmpm("AM")}
              className={`rounded-md px-6 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                stagedAmpm === "AM"
                  ? "bg-[#E6FA50] text-[#06121A]"
                  : "text-[#F7F7F7]/50 hover:text-[#F7F7F7]/80"
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setStagedAmpm("PM")}
              className={`rounded-md px-6 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                stagedAmpm === "PM"
                  ? "bg-[#E6FA50] text-[#06121A]"
                  : "text-[#F7F7F7]/50 hover:text-[#F7F7F7]/80"
              }`}
            >
              PM
            </button>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-[#F7F7F7]/60 hover:text-[#F7F7F7] px-3 py-1.5 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-lime rounded-full px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] bg-[#E6FA50] text-[#06121A]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
