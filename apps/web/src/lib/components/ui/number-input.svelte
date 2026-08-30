<script lang="ts">
import { ChevronDown, ChevronUp } from "lucide-svelte";

interface Props {
  value?: string | number;
  onChange?: (val: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  class?: string;
  id?: string;
}

let {
  value = $bindable(""),
  onChange,
  placeholder = "—",
  min,
  max,
  step = 1000,
  disabled = false,
  class: className = "",
  id = "",
}: Props = $props();

function handleIncrement() {
  if (disabled) return;
  const curr = Number(value) || 0;
  const next = curr + step;
  if (max !== undefined && next > max) return;
  value = String(next);
  if (onChange) onChange(value);
}

function handleDecrement() {
  if (disabled) return;
  const curr = Number(value) || 0;
  const next = curr - step;
  if (min !== undefined && next < min) return;
  value = String(next);
  if (onChange) onChange(value);
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  value = target.value;
  if (onChange) onChange(value);
}
</script>

<div
  class="relative flex w-full items-center rounded-xl border border-white/[0.08] bg-white/[0.02] transition-all focus-within:border-[#50C8C8]/40 {disabled
    ? 'opacity-40 pointer-events-none'
    : ''} {className}"
>
  <input
    {id}
    type="number"
    value={value}
    oninput={handleInput}
    {placeholder}
    {disabled}
    class="body w-full bg-transparent px-4 py-2.5 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  />

  <div class="flex flex-col border-l border-white/[0.06] py-1 px-1 shrink-0">
    <button
      type="button"
      tabindex="-1"
      onclick={handleIncrement}
      {disabled}
      class="flex h-3.5 w-5 items-center justify-center text-[#F7F7F7]/40 hover:text-[#E6FA50] active:scale-95 transition-colors"
      aria-label="Increase value"
    >
      <ChevronUp class="h-3 w-3" />
    </button>
    <button
      type="button"
      tabindex="-1"
      onclick={handleDecrement}
      {disabled}
      class="flex h-3.5 w-5 items-center justify-center text-[#F7F7F7]/40 hover:text-[#E6FA50] active:scale-95 transition-colors"
      aria-label="Decrease value"
    >
      <ChevronDown class="h-3 w-3" />
    </button>
  </div>
</div>
