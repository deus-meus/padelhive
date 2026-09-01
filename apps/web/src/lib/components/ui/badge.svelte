<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
  variant?: "success" | "warning" | "error" | "neutral" | "lime" | "info";
  children?: Snippet;
  class?: string;
}

let { variant = "neutral", children, class: className = "" }: Props = $props();

const variantClasses = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-white/[0.06] text-white/70 border-white/[0.08]",
  lime: "bg-[#E6FA50]/10 text-[#E6FA50] border-[#E6FA50]/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors {variantClasses[variant]} {className}"
>
  {@render children?.()}
</span>
