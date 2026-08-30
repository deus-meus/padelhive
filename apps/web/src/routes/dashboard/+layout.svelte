<script lang="ts">
import {
  Building2,
  CalendarDays,
  Clock,
  LayoutDashboard,
  Menu,
  RotateCcw,
  SquareStack,
  TrendingUp,
  X,
} from "lucide-svelte";
import type { Snippet } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authStore } from "$lib/auth/store.svelte";

interface Props {
  children?: Snippet;
}

let { children }: Props = $props();
let sidebarOpen = $state(false);

$effect(() => {
  if (
    authStore.isInitialized &&
    authStore.user &&
    authStore.user.role !== "venue_owner" &&
    authStore.user.role !== "venue_admin" &&
    authStore.user.role !== "super_admin"
  ) {
    goto("/");
  }
});

const currentPath = $derived(page.url.pathname);

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/venues", label: "Venues", icon: Building2 },
  { href: "/dashboard/courts", label: "Courts & Pricing", icon: SquareStack },
  { href: "/dashboard/hours", label: "Operating Hours", icon: Clock },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/dashboard/refunds", label: "Refunds", icon: RotateCcw },
];
</script>

<div class="min-h-screen pt-20 bg-[#06121A]">
  <div class="flex flex-1">
    <!-- Sidebar — desktop -->
    <aside
      class="hidden lg:flex lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.04]"
    >
      <nav class="sticky top-20 flex flex-col gap-1 p-5">
        <p class="section-label mb-4">Venue Owner</p>
        {#each NAV_ITEMS as item (item.href)}
          {@const Icon = item.icon}
          {@const isActive =
            item.href === "/dashboard"
              ? currentPath === "/dashboard"
              : currentPath.startsWith(item.href)}
          <a
            href={item.href}
            class="label flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-150 {isActive
              ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
              : 'text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60'}"
          >
            <Icon class="h-4 w-4" />
            {item.label}
          </a>
        {/each}
      </nav>
    </aside>

    <!-- Mobile Floating Trigger -->
    <div class="fixed bottom-6 right-6 z-40 lg:hidden">
      <button
        type="button"
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FA50] text-[#06121A] shadow-lg shadow-[#E6FA50]/20"
      >
        {#if sidebarOpen}
          <X class="h-5 w-5" />
        {:else}
          <Menu class="h-5 w-5" />
        {/if}
      </button>
    </div>

    <!-- Mobile Navigation Modal -->
    {#if sidebarOpen}
      <div class="fixed inset-0 z-30 lg:hidden">
        <button
          type="button"
          class="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm w-full h-full border-0 cursor-default"
          onclick={() => (sidebarOpen = false)}
          aria-label="Close sidebar"
        ></button>
        <nav
          class="absolute bottom-20 right-6 flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4 shadow-2xl z-10 min-w-[200px]"
        >
          {#each NAV_ITEMS as item (item.href)}
            {@const Icon = item.icon}
            {@const isActive =
              item.href === "/dashboard"
                ? currentPath === "/dashboard"
                : currentPath.startsWith(item.href)}
            <a
              href={item.href}
              onclick={() => (sidebarOpen = false)}
              class="label flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all {isActive
                ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                : 'text-[#F7F7F7]/60 hover:bg-white/[0.03] hover:text-[#F7F7F7]/80'}"
            >
              <Icon class="h-4 w-4" />
              {item.label}
            </a>
          {/each}
        </nav>
      </div>
    {/if}

    <!-- Main content -->
    <main class="flex flex-1 flex-col min-w-0">
      {@render children?.()}
    </main>
  </div>
</div>
