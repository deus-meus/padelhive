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
          className={`absolute z-50 bg-[#0C1B26] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 p-4 w-64 flex flex-col ${
            openUpwards ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
          }`}
        >
          <h3 className="text-sm font-medium text-[#F7F7F7]">Select Time</h3>

          <div className="flex items-center gap-2 mt-4">
            <select
              value={stagedHour}
              onChange={(e) => setStagedHour(Number(e.target.value))}
              className="bg-[#06121A] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/40 focus:outline-none [color-scheme:dark]"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-[#F7F7F7]/40 font-medium">:</span>
            <select
              value={stagedMinute}
              onChange={(e) => setStagedMinute(e.target.value)}
              className="bg-[#06121A] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/40 focus:outline-none [color-scheme:dark]"
            >
              {minuteOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <div className="flex gap-1 ml-auto">
              <button
                type="button"
                onClick={() => setStagedAmpm("AM")}
                className={`rounded-lg px-3 py-1.5 text-xs uppercase transition-colors ${
                  stagedAmpm === "AM"
                    ? "bg-[#E6FA50] text-[#06121A] font-semibold"
                    : "bg-white/[0.04] text-[#F7F7F7]/50 hover:text-[#F7F7F7]/80"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setStagedAmpm("PM")}
                className={`rounded-lg px-3 py-1.5 text-xs uppercase transition-colors ${
                  stagedAmpm === "PM"
                    ? "bg-[#E6FA50] text-[#06121A] font-semibold"
                    : "bg-white/[0.04] text-[#F7F7F7]/50 hover:text-[#F7F7F7]/80"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-[#F7F7F7]/60 hover:text-[#F7F7F7] px-3 py-1.5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-lime rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] bg-[#E6FA50] text-[#06121A]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
