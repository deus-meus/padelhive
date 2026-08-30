<script lang="ts">
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-svelte";
import { onMount } from "svelte";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  alignRight?: boolean;
  class?: string;
  buttonClass?: string;
}

let {
  value = $bindable(""),
  onChange,
  placeholder = "Select Date",
  alignRight = false,
  class: className = "",
  buttonClass = "",
}: Props = $props();

let open = $state(false);
let containerRef = $state<HTMLDivElement | null>(null);

// Calendar view state
let viewDate = $state(new Date());

const todayStr = new Date().toISOString().split("T")[0];

const displayLabel = $derived.by(() => {
  if (!value) return placeholder;
  if (value === todayStr) {
    const d = new Date();
    return `Today, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const monthYearLabel = $derived(
  viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
);

const daysGrid = $derived.by(() => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days: {
    day: number | null;
    iso: string;
    isPast: boolean;
    isToday: boolean;
  }[] = [];

  // Empty slots before 1st of month
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, iso: "", isPast: true, isToday: false });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isPast = dateObj < now;
    const isToday = iso === todayStr;
    days.push({ day: d, iso, isPast, isToday });
  }

  return days;
});

function prevMonth() {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
}

function nextMonth() {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
}

function selectDate(iso: string) {
  value = iso;
  if (onChange) onChange(iso);
  open = false;
}

function clearDate(e: MouseEvent) {
  e.stopPropagation();
  value = "";
  if (onChange) onChange("");
}

onMount(() => {
  function handleClickOutside(e: MouseEvent) {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      open = false;
    }
  }
  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleEscape);
  };
});
</script>

<div bind:this={containerRef} class="relative inline-block text-left shrink-0 {className}">
  <button
    type="button"
    onclick={() => (open = !open)}
    class={buttonClass
      ? buttonClass
      : `label flex w-full h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border ${
          value
            ? 'border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]'
            : 'border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]'
        }`}
  >
    <span class="flex items-center gap-2 truncate">
      <CalendarIcon class="h-4 w-4 shrink-0 opacity-60 text-[#E6FA50]" />
      <span class="truncate">{displayLabel}</span>
    </span>
    {#if value}
      <span
        role="button"
        tabindex="0"
        onclick={clearDate}
        onkeydown={(e) => e.key === "Enter" && clearDate(e as any)}
        class="flex h-4 w-4 items-center justify-center rounded-full text-white/40 hover:text-white"
      >
        <X class="h-3 w-3" />
      </span>
    {/if}
  </button>

  {#if open}
    <div
      role="dialog"
      aria-modal="true"
      class="absolute top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-4 shadow-2xl {alignRight
        ? 'right-0 origin-top-right'
        : 'left-0 origin-top-left'}"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <button
          type="button"
          onclick={prevMonth}
          class="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="label font-semibold text-[#F7F7F7]">{monthYearLabel}</span>
        <button
          type="button"
          onclick={nextMonth}
          class="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <!-- Weekdays -->
      <div class="grid grid-cols-7 gap-1 text-center mb-1">
        {#each ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as day}
          <span class="caption font-medium text-white/30 text-[10px] uppercase">{day}</span>
        {/each}
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-1 text-center">
        {#each daysGrid as item}
          {#if item.day === null}
            <div></div>
          {:else}
            {@const isSelected = item.iso === value}
            <button
              type="button"
              disabled={item.isPast}
              onclick={() => selectDate(item.iso)}
              class="flex h-8 w-8 items-center justify-center rounded-xl text-xs transition-all mx-auto {isSelected
                ? 'bg-[#E6FA50] text-[#06121A] font-bold shadow-[0_0_12px_rgba(230,250,80,0.3)]'
                : item.isToday
                  ? 'border border-[#E6FA50]/40 text-[#E6FA50]'
                  : item.isPast
                    ? 'text-white/15 cursor-not-allowed'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'}"
            >
              {item.day}
            </button>
          {/if}
        {/each}
      </div>

      <!-- Footer Quick Button -->
      <div class="mt-3 pt-2 border-t border-white/[0.06] flex justify-between items-center">
        <button
          type="button"
          onclick={() => selectDate(todayStr)}
          class="caption text-[#E6FA50] hover:underline"
        >
          Today
        </button>
        <button
          type="button"
          onclick={() => (open = false)}
          class="caption text-white/40 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  {/if}
</div>
