<script lang="ts">
import { Check, ChevronDown } from "lucide-svelte";
import { onMount } from "svelte";

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear?: () => void;
  alignRight?: boolean;
  class?: string;
}

let {
  label,
  options,
  selected,
  onToggle,
  onClear,
  alignRight = false,
  class: className = "",
}: Props = $props();

let open = $state(false);
let containerRef = $state<HTMLDivElement | null>(null);

const active = $derived(selected.length > 0);

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

<div
  bind:this={containerRef}
  class="relative inline-block text-left shrink-0 {className}"
>
  <button
    type="button"
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={() => (open = !open)}
    class="label flex h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border {active
      ? 'border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]'
      : 'border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]'}"
  >
    <span>
      {label} {active ? `· ${selected.length}` : ""}
    </span>
    <ChevronDown
      class="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 {open
        ? 'rotate-180 text-[#E6FA50]'
        : ''}"
    />
  </button>

  {#if open}
    <div
      role="listbox"
      tabindex="-1"
      class="absolute top-full z-50 mt-2 w-max min-w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1B26] shadow-2xl {alignRight
        ? 'right-0 origin-top-right'
        : 'left-0 origin-top-left'}"
    >
      <div class="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
        {#each options as opt (opt)}
          {@const isSelected = selected.includes(opt)}
          <button
            type="button"
            role="option"
            aria-selected={isSelected}
            onclick={() => onToggle(opt)}
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
          >
            <div
              class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors {isSelected
                ? 'border-[#E6FA50] bg-[#E6FA50]'
                : 'border-white/20 bg-transparent'}"
            >
              {#if isSelected}
                <Check class="h-3 w-3 text-[#06121A]" />
              {/if}
            </div>
            <span class="label block truncate text-[#F7F7F7]/80">{opt}</span>
          </button>
        {/each}
      </div>

      {#if selected.length > 0 && onClear}
        <div class="border-t border-white/[0.06] p-1.5">
          <button
            type="button"
            onclick={() => {
              onClear();
              open = false;
            }}
            class="label flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[#E6FA50] hover:bg-white/[0.03]"
          >
            Clear selection
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>