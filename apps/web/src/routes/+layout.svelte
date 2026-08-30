<script lang="ts">
import "../app.css";
import type { Snippet } from "svelte";
import { page } from "$app/state";
import Footer from "$lib/components/shared/footer.svelte";
import Navbar from "$lib/components/shared/navbar.svelte";

interface Props {
  children?: Snippet;
}

let { children }: Props = $props();

const isDashboardOrAdmin = $derived(
  page.url.pathname.startsWith("/admin") ||
    page.url.pathname.startsWith("/dashboard"),
);
</script>

<div class="flex min-h-screen flex-col bg-[#06121A] text-[#F7F7F7]">
  <Navbar />
  <main class="flex-1">
    {@render children?.()}
  </main>
  {#if !isDashboardOrAdmin}
    <Footer />
  {/if}
</div>
