<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";

interface Props extends HTMLButtonAttributes {
  variant?: "lime" | "outline-white" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  children?: Snippet;
  class?: string;
}

let {
  variant = "lime",
  size = "md",
  children,
  class: className = "",
  type = "button",
  ...restProps
}: Props = $props();

const variantClasses = {
  lime: "bg-[#E6FA50] text-[#06121A] hover:bg-[#d4e845] active:bg-[#c8d63e] shadow-[0_0_24px_rgba(230,250,80,0.25)] font-semibold",
  "outline-white":
    "border border-white/20 text-white font-medium bg-transparent hover:border-white/40 hover:bg-white/5 active:border-white/50 active:bg-white/10",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  secondary:
    "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5",
};
</script>

<button
  {type}
  class="inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6FA50]/50 disabled:pointer-events-none disabled:opacity-50 {variantClasses[variant]} {sizeClasses[size]} {className}"
  {...restProps}
>
  {@render children?.()}
</button>
