<script lang="ts">
import { AlertTriangle, RefreshCw } from "lucide-svelte";

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  class?: string;
}

let {
  title = "Something went wrong",
  description = "We couldn't load the data. Please try again.",
  onRetry,
  isRetrying = false,
  class: className = "",
}: Props = $props();
</script>

<div
  class="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center {className}"
>
  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
    <AlertTriangle class="h-6 w-6" />
  </div>
  <h3 class="text-lg font-semibold text-[#F7F7F7]">{title}</h3>
  <p class="mt-1.5 max-w-sm text-sm text-white/60">{description}</p>
  {#if onRetry}
    <button
      type="button"
      onclick={onRetry}
      disabled={isRetrying}
      class="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/5 active:scale-95 disabled:opacity-50"
    >
      <RefreshCw class="h-4 w-4 {isRetrying ? 'animate-spin' : ''}" />
      {isRetrying ? "Retrying..." : "Try again"}
    </button>
  {/if}
</div>
