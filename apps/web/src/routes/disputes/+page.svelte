<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";

onMount(() => {
  goto("/bookings");
});
</script>

<svelte:head>
  <title>Disputes | PadelHive</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 bg-[#06121A] flex items-center justify-center">
  <div class="animate-pulse text-[#F7F7F7]/40 body-sm">
    Redirecting to bookings...
  </div>
</div>
