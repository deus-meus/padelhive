<script lang="ts">
import { MapPin, Star } from "lucide-svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
</script>

<script context="module">
</script>

<div class="w-full">
  <EmptyState
    icon={Star}
    title="Featured venues coming soon"
    description="We're curating the best courts in Indonesia. Check back soon or explore everything available now."
    actionLabel="Browse All Venues"
    actionHref="/venues"
  />
</div>