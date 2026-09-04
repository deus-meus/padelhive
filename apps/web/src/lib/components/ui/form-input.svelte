<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
  id?: string;
  label?: string;
  required?: boolean;
  type?: string;
  value: string | number;
  placeholder?: string;
  disabled?: boolean;
  icon?: any;
  step?: string | number;
  error?: string | null;
  class?: string;
  children?: Snippet;
}

let {
  id,
  label,
  required = false,
  type = "text",
  value = $bindable(""),
  placeholder = "",
  disabled = false,
  icon: IconComp,
  step,
  error,
  class: className = "",
  children,
}: Props = $props();
</script>

<div class="w-full space-y-1.5 {className}">
  {#if label}
    <label
      for={id}
      class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F7F7F7]/60"
    >
      {#if IconComp}
        <IconComp class="h-3.5 w-3.5 text-[#50C8C8]" />
      {/if}
      <span>{label}</span>
      {#if required}
        <span class="text-[#50C8C8]">*</span>
      {/if}
    </label>
  {/if}

  <div
    class="relative flex h-11 w-full items-center overflow-hidden rounded-xl border bg-white/[0.03] transition-all duration-200 focus-within:border-[#50C8C8]/60 focus-within:ring-2 focus-within:ring-[#50C8C8]/15 {error
      ? 'border-red-500/50 bg-red-500/[0.02]'
      : 'border-white/[0.08] hover:border-white/[0.15]'}"
  >
    {#if IconComp}
      <div class="pointer-events-none flex items-center justify-center pl-3.5 pr-1 text-[#F7F7F7]/40">
        <IconComp class="h-4 w-4 shrink-0 transition-colors group-focus-within:text-[#50C8C8]" />
      </div>
    {/if}

    <input
      {id}
      {type}
      {step}
      {disabled}
      {placeholder}
      bind:value={value}
      class="h-full w-full bg-transparent px-3.5 text-sm font-normal text-[#F7F7F7] placeholder:text-[#F7F7F7]/30 placeholder:font-normal outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:cursor-not-allowed disabled:opacity-40"
    />

    {#if children}
      <div class="flex h-full shrink-0 items-center">
        {@render children()}
      </div>
    {/if}
  </div>

  {#if error}
    <p class="text-[11px] font-medium text-red-400">{error}</p>
  {/if}
</div>
