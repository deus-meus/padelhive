<script lang="ts">
interface TabOption {
  label: string;
  value: string;
  badge?: string | number;
}

interface Props {
  tabs: TabOption[];
  selected: string;
  onSelect: (value: string) => void;
  class?: string;
}

let { tabs, selected, onSelect, class: className = "" }: Props = $props();
</script>

<div class="inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.06] {className}">
  {#each tabs as tab}
    <button
      type="button"
      onclick={() => onSelect(tab.value)}
      class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all {selected === tab.value ? 'bg-[#0C1B26] text-[#E6FA50] shadow-sm border border-white/[0.08]' : 'text-white/60 hover:text-white hover:bg-white/[0.02]'}"
    >
      {tab.label}
      {#if tab.badge !== undefined}
        <span class="rounded-full bg-white/[0.1] px-2 py-0.5 text-xs text-white/80">{tab.badge}</span>
      {/if}
    </button>
  {/each}
</div>
