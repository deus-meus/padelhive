<script lang="ts" module>
export interface FilterOption {
  value: string;
  label: string;
}
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { Check, ChevronDown } from "lucide-svelte";

  interface Props {
    label?: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    active?: boolean;
    icon?: any;
    alignRight?: boolean;
    class?: string;
    buttonClass?: string;
  }

  let {
    label,
    value,
    options,
    onChange,
    active = false,
    icon: Icon,
    alignRight = false,
    class: className = "",
    buttonClass = "",
  }: Props = $props();

  let open = $state(false);
  let containerRef = $state<HTMLDivElement | null>(null);

  const selectedOption = $derived(options.find((o) => o.value === value));

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
    class={buttonClass
      ? buttonClass
      : `label flex w-full h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border ${
          active
            ? 'border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]'
            : 'border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]'
        }`}
  >
    <span class="flex items-center gap-2">
      {#if Icon}
        <Icon class="h-4 w-4 shrink-0 opacity-60 text-[#E6FA50]" />
      {/if}
      {selectedOption ? selectedOption.label : label}
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
      class="absolute top-full z-50 mt-2 w-max min-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1B26] shadow-2xl {alignRight
        ? 'right-0 origin-top-right'
        : 'left-0 origin-top-left'}"
    >
      <div class="max-h-60 overflow-y-auto p-1">
        {#each options as opt (opt.value)}
          {@const isSelected = opt.value === value}
          <button
            type="button"
            role="option"
            aria-selected={isSelected}
            onclick={() => {
              onChange(opt.value);
              open = false;
            }}
            class="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left transition-colors {isSelected
              ? 'bg-[#E6FA50]/10 text-[#E6FA50] font-semibold'
              : 'text-[#F7F7F7]/80 hover:bg-white/[0.06] hover:text-[#F7F7F7]'}"
          >
            <span class="label block truncate pr-4">{opt.label}</span>
            {#if isSelected}
              <Check class="h-4 w-4 shrink-0 text-[#E6FA50]" />
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
