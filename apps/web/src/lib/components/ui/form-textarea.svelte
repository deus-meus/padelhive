<script lang="ts">
interface Props {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  icon?: any;
  error?: string | null;
  class?: string;
}

let {
  id,
  label,
  required = false,
  value = $bindable(""),
  placeholder = "",
  rows = 3,
  disabled = false,
  icon: IconComp,
  error,
  class: className = "",
}: Props = $props();
</script>

<div class="w-full space-y-1.5 {className}">
  {#if label}
    <label
      for={id}
      class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F7F7F7]/60"
    >
      {#if IconComp}
        <IconComp class="h-3.5 w-3.5 text-[#E6FA50]" />
      {/if}
      <span>{label}</span>
      {#if required}
        <span class="text-[#E6FA50]">*</span>
      {/if}
    </label>
  {/if}

  <div
    class="relative flex w-full overflow-hidden rounded-xl border bg-white/[0.03] transition-all duration-200 focus-within:border-[#E6FA50]/60 focus-within:ring-2 focus-within:ring-[#E6FA50]/15 {error
      ? 'border-red-500/50 bg-red-500/[0.02]'
      : 'border-white/[0.08] hover:border-white/[0.15]'}"
  >
    {#if IconComp}
      <div class="pointer-events-none pt-3 pl-3.5 pr-1 text-[#F7F7F7]/40">
        <IconComp class="h-4 w-4 shrink-0" />
      </div>
    {/if}

    <textarea
      {id}
      {rows}
      {disabled}
      {placeholder}
      bind:value={value}
      class="w-full bg-transparent p-3 text-sm font-normal text-[#F7F7F7] placeholder:text-[#F7F7F7]/30 placeholder:font-normal outline-none resize-none disabled:cursor-not-allowed disabled:opacity-40"
    ></textarea>
  </div>

  {#if error}
    <p class="text-[11px] font-medium text-red-400">{error}</p>
  {/if}
</div>
