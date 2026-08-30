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
  class="relative w-full {className}"
>
  <button
    bind:this={triggerRef}
    type="button"
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-label={ariaLabel}
    {disabled}
    onclick={() => (isOpen = !isOpen)}
    class="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 label text-[#F7F7F7] focus:border-[#E6FA50]/40 focus:outline-none transition-colors {disabled
      ? 'opacity-30 cursor-not-allowed'
      : 'hover:border-white/[0.15]'}"
  >
    <div class="flex items-center gap-2">
      <Clock class="h-4 w-4 text-[#E6FA50]" />
      <span>{formatTo12Hour(value)}</span>
    </div>
    <ChevronDown
      class="h-4 w-4 text-[#F7F7F7]/40 transition-transform {isOpen
        ? 'rotate-180 text-[#E6FA50]'
        : ''}"
    />
  </button>

  {#if isOpen}
    <div
      role="dialog"
      aria-label="Select time"
      class="absolute z-50 flex w-72 flex-col rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-5 shadow-2xl {openUpwards
        ? 'bottom-[calc(100%+8px)] origin-bottom-left'
        : 'top-[calc(100%+8px)] origin-top-left'}"
    >
      <div class="flex items-center">
        <h3 class="heading-3 text-[#F7F7F7]/80">Select Time</h3>
      </div>

      <div class="mt-5 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Hour Dropdown -->
          <div class="relative">
            <button
              type="button"
              onclick={() => (hourOpen = !hourOpen)}
              class="flex w-16 items-center justify-center gap-1 rounded-lg border border-white/[0.08] bg-[#06121A] px-3 py-2 label text-[#F7F7F7]"
            >
              <span>{stagedHour}</span>
              <ChevronDown class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
            </button>
            {#if hourOpen}
              <ul class="absolute left-0 top-full z-30 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0C1B26] py-1 shadow-2xl no-scrollbar">
                {#each hourOptions as h}
                  <li>
                    <button
                      type="button"
                      onclick={() => {
                        stagedHour = h;
                        hourOpen = false;
                      }}
                      class="block w-full px-3 py-1.5 text-center label transition-colors {stagedHour === h
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
              onclick={() => (minuteOpen = !minuteOpen)}
              class="flex w-16 items-center justify-center gap-1 rounded-lg border border-white/[0.08] bg-[#06121A] px-3 py-2 label text-[#F7F7F7]"
            >
              <span>{stagedMinute}</span>
              <ChevronDown class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
            </button>
            {#if minuteOpen}
              <ul class="absolute left-0 top-full z-30 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0C1B26] py-1 shadow-2xl no-scrollbar">
                {#each minuteOptions as m}
                  <li>
                    <button
                      type="button"
                      onclick={() => {
                        stagedMinute = m;
                        minuteOpen = false;
                      }}
                      class="block w-full px-3 py-1.5 text-center label transition-colors {stagedMinute === m
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
        <div class="flex items-center gap-1">
          <button
            type="button"
            onclick={() => (stagedAmpm = "AM")}
            class="px-2 py-1 label transition-colors {stagedAmpm === 'AM'
              ? 'text-[#E6FA50] font-bold'
              : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
          >
            AM
          </button>
          <button
            type="button"
            onclick={() => (stagedAmpm = "PM")}
            class="px-2 py-1 label transition-colors {stagedAmpm === 'PM'
              ? 'text-[#E6FA50] font-bold'
              : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
          >
            PM
          </button>
        </div>
      </div>

      <!-- Popover Footer -->
      <div class="mt-5 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onclick={() => (isOpen = false)}
          class="label text-[#F7F7F7]/60 hover:text-[#F7F7F7] px-3 py-1.5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={handleApply}
          class="btn-lime rounded-full px-5 py-1.5 label bg-[#E6FA50] text-[#06121A] font-semibold"
        >
          Apply
        </button>
      </div>
    </div>
  {/if}
</div>
