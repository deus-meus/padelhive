<script lang="ts">
export interface FilterTab<T extends string = string> {
  label: string;
  value: T;
}

interface Props<T extends string = string> {
  tabs: FilterTab<T>[];
  activeValue: T;
  onChange: (val: T) => void;
  className?: string;
}

let { tabs, activeValue, onChange, className = "" }: Props = $props();
</script>

<div class="mb-6 flex gap-2 overflow-x-auto no-scrollbar {className}">
  {#each tabs as tab (tab.value)}
    <button
      type="button"
      onclick={() => onChange(tab.value)}
      class="label shrink-0 rounded-xl px-4 py-2 transition-all {activeValue ===
      tab.value
        ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
        : 'text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60'}"
    >
      {tab.label}
    </button>
  {/each}
</div>
