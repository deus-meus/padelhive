<script lang="ts">
import "../app.css";
import type { Snippet } from "svelte";
import Footer from "$lib/components/shared/footer.svelte";
import Navbar from "$lib/components/shared/navbar.svelte";

interface Props {
  children?: Snippet;
}

let { children }: Props = $props();
</script>

<div class="flex min-h-screen flex-col bg-[#06121A] text-[#F7F7F7]">
  <Navbar />
  <main class="flex-1">
    {@render children?.()}
  </main>
  <Footer />
</div>
