<script lang="ts">
import { ChevronDown, Clock } from "lucide-svelte";
import { onMount } from "svelte";

interface Props {
  value: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  minuteStep?: number;
  class?: string;
}

let {
  value = $bindable("06:00"),
  onChange,
  disabled = false,
  ariaLabel = "Select time",
  minuteStep = 15,
  class: className = "",
}: Props = $props();

let isOpen = $state(false);
let openUpwards = $state(false);
let containerRef = $state<HTMLDivElement | null>(null);
let triggerRef = $state<HTMLButtonElement | null>(null);

// Staged states inside popover
let stagedHour = $state(12);
let stagedMinute = $state("00");
let stagedAmpm = $state<"AM" | "PM">("AM");

function formatTo12Hour(time24: string): string {
  if (!time24) return "";
  const [h24, m] = time24.split(":").map(Number);
  if (Number.isNaN(h24) || Number.isNaN(m)) return time24;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

$effect(() => {
  if (isOpen && value) {
    const [h24, m] = value.split(":").map(Number);
    if (!Number.isNaN(h24) && !Number.isNaN(m)) {
      stagedAmpm = h24 >= 12 ? "PM" : "AM";
      stagedHour = h24 % 12 === 0 ? 12 : h24 % 12;
      stagedMinute = String(m).padStart(2, "0");
    }

    if (triggerRef) {
      const rect = triggerRef.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 260 && rect.top > 260) {
        openUpwards = true;
      } else {
        openUpwards = false;
      }
    }
  }
});

function handleApply() {
  let h24 = stagedHour % 12;
  if (stagedAmpm === "PM") h24 += 12;
  const out = `${String(h24).padStart(2, "0")}:${stagedMinute}`;
  value = out;
  if (onChange) onChange(out);
  isOpen = false;
}

const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const minuteOptions = $derived.by(() => {
  const opts: string[] = [];
  for (let m = 0; m < 60; m += minuteStep) {
    opts.push(m.toString().padStart(2, "0"));
  }
  if (!opts.includes(stagedMinute)) {
    opts.push(stagedMinute);
    opts.sort();
  }
  return opts;
});

onMount(() => {
  function handleClickOutside(e: MouseEvent) {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      isOpen = false;
    }
  }
  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
      isOpen = false;
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleEscape);
  };
});

// Internal Hour/Minute Dropdown
let hourOpen = $state(false);
let minuteOpen = $state(false);
</script>

<div
  bind:this={containerRef}
  class="relative inline-block {className}"
>
  <button
    bind:this={triggerRef}
    type="button"
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-label={ariaLabel}
    {disabled}
    onclick={() => (isOpen = !isOpen)}
    class="flex h-11 w-full whitespace-nowrap items-center justify-between gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none {disabled
      ? 'opacity-30 cursor-not-allowed border-white/[0.08] bg-white/[0.02]'
      : isOpen
        ? 'border-[#50C8C8]/40 bg-white/[0.02] text-[#F7F7F7]'
        : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7] hover:border-white/[0.15]'}"
  >
    <div class="flex items-center gap-2 whitespace-nowrap">
      <Clock class="h-4 w-4 shrink-0 text-[#F7F7F7]/40" />
      <span class="text-sm font-normal tracking-tight text-[#F7F7F7] whitespace-nowrap">{formatTo12Hour(value)}</span>
    </div>
    <ChevronDown
      class="h-4 w-4 shrink-0 text-[#F7F7F7]/40 transition-transform duration-200 {isOpen
        ? 'rotate-180 text-[#F7F7F7]'
        : ''}"
    />
  </button>

  {#if isOpen}
    <div
      role="dialog"
      aria-label="Select time"
      class="absolute z-50 flex w-72 flex-col rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl {openUpwards
        ? 'bottom-[calc(100%+8px)] origin-bottom-left'
        : 'top-[calc(100%+8px)] origin-top-left'}"
    >
      <div class="flex items-center">
        <h3 class="text-lg font-semibold text-[#F7F7F7]">Select Time</h3>
      </div>

      <div class="mt-5 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Hour Dropdown -->
          <div class="relative">
            <button
              type="button"
              onclick={() => {
                hourOpen = !hourOpen;
                minuteOpen = false;
              }}
              class="flex h-10 w-16 items-center justify-between gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#F7F7F7] hover:border-white/[0.15]"
            >
              <span>{stagedHour}</span>
              <ChevronDown class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
            </button>
            {#if hourOpen}
              <ul class="absolute left-0 top-full z-30 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0C1B26] py-1 shadow-2xl no-scrollbar">
                {#each hourOptions as h}
                  <li>
                    <button
                      type="button"
                      onclick={() => {
                        stagedHour = h;
                        hourOpen = false;
                      }}
                      class="block w-full px-3 py-1.5 text-center text-sm font-medium transition-colors {stagedHour === h
                        ? 'bg-[#E6FA50] text-[#06121A] font-bold'
                        : 'text-[#F7F7F7]/80 hover:bg-white/[0.06]'}"
                    >
                      {h}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>

          <span class="text-[#F7F7F7]/40 font-bold">:</span>

          <!-- Minute Dropdown -->
          <div class="relative">
            <button
              type="button"
              onclick={() => {
                minuteOpen = !minuteOpen;
                hourOpen = false;
              }}
              class="flex h-10 w-16 items-center justify-between gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#F7F7F7] hover:border-white/[0.15]"
            >
              <span>{stagedMinute}</span>
              <ChevronDown class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
            </button>
            {#if minuteOpen}
              <ul class="absolute left-0 top-full z-30 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0C1B26] py-1 shadow-2xl no-scrollbar">
                {#each minuteOptions as m}
                  <li>
                    <button
                      type="button"
                      onclick={() => {
                        stagedMinute = m;
                        minuteOpen = false;
                      }}
                      class="block w-full px-3 py-1.5 text-center text-sm font-medium transition-colors {stagedMinute === m
                        ? 'bg-[#E6FA50] text-[#06121A] font-bold'
                        : 'text-[#F7F7F7]/80 hover:bg-white/[0.06]'}"
                    >
                      {m}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>

        <!-- AM/PM Toggle -->
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            onclick={() => (stagedAmpm = "AM")}
            class="px-2 py-1 text-sm font-semibold transition-colors {stagedAmpm === 'AM'
              ? 'text-[#E6FA50] font-bold'
              : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
          >
            AM
          </button>
          <button
            type="button"
            onclick={() => (stagedAmpm = "PM")}
            class="px-2 py-1 text-sm font-semibold transition-colors {stagedAmpm === 'PM'
              ? 'text-[#E6FA50] font-bold'
              : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
          >
            PM
          </button>
        </div>
      </div>

      <!-- Popover Footer -->
      <div class="mt-6 flex items-center justify-end gap-4 border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="text-sm font-medium text-[#F7F7F7]/60 hover:text-[#F7F7F7] transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={handleApply}
          class="btn-lime rounded-full px-6 py-2 text-sm font-semibold bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  {/if}
</div>
