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

const isErrorPage = $derived(!!page.error || page.status >= 400);

const shouldHideFooter = $derived(
  page.url.pathname.startsWith("/admin") ||
    page.url.pathname.startsWith("/dashboard") ||
    page.url.pathname.startsWith("/vouchers") ||
    page.url.pathname.startsWith("/bookings") ||
    page.url.pathname.startsWith("/booking") ||
    isErrorPage,
);
</script>

<div class="flex min-h-screen flex-col bg-[#06121A] text-[#F7F7F7]">
  {#if !isErrorPage}
    <Navbar />
  {/if}
  <main class="flex-1">
    {@render children?.()}
  </main>
  {#if !shouldHideFooter}
    <Footer />
  {/if}
</div>
