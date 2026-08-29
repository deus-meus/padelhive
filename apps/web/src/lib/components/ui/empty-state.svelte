<script lang="ts">
import { Inbox } from "lucide-svelte";

interface Props {
  icon?: any;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

let {
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: Props = $props();
</script>

<div
  class="flex min-h-[360px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center"
>
  <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10">
    <Icon class="h-6 w-6 text-[#E6FA50]" />
  </div>
  <p class="mt-5 heading-3 text-[#F7F7F7]">{title}</p>
  {#if description}
    <p class="mt-1.5 max-w-sm body text-[#F7F7F7]/40">{description}</p>
  {/if}
  {#if actionLabel}
    {#if actionHref}
      <a
        href={actionHref}
        class="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] px-6 font-semibold label text-[#0A1628] hover:bg-[#E6FA50]/90 transition-colors"
      >
        {actionLabel}
      </a>
    {:else}
      <button
        type="button"
        onclick={onAction}
        class="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] px-6 font-semibold label text-[#0A1628] hover:bg-[#E6FA50]/90 transition-colors"
      >
        {actionLabel}
      </button>
    {/if}
  {/if}
</div>