<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: Snippet;
  class?: string;
}

let { children, class: className = "", ...restProps }: Props = $props();
</script>

<div
  class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-[#F7F7F7] {className}"
  {...restProps}
>
  {@render children?.()}
</div>
