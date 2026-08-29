<script lang="ts">
interface Props {
  class?: string;
}

let { class: className = "" }: Props = $props();
</script>

<div class="animate-pulse rounded-xl bg-white/[0.06] {className}"></div>
