<script lang="ts">
import {
  CalendarDays,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Ticket,
  X,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import NotificationBell from "./notification-bell.svelte";

let scrolled = $state(false);
let mobileOpen = $state(false);
let avatarOpen = $state(false);
let avatarRef = $state<HTMLDivElement | null>(null);

let nextBooking = $state<any | null>(null);
let activeVoucherCount = $state<number>(0);

const user = $derived(authStore.user);
const isDashboardOrAdmin = $derived(
  page.url.pathname.startsWith("/admin") ||
    page.url.pathname.startsWith("/dashboard"),
);
const showDashboard = $derived(
  user?.role === "venue_owner" || user?.role === "venue_admin",
);
const showAdmin = $derived(user?.role === "super_admin");
const isPlayer = $derived(!!user && !showDashboard && !showAdmin);

onMount(() => {
  const handleScroll = () => {
    scrolled = window.scrollY > 20;
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
});

onMount(() => {
  function handleClickOutside(e: MouseEvent) {
    if (avatarRef && !avatarRef.contains(e.target as Node)) {
      avatarOpen = false;
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
});

$effect(() => {
  if (isPlayer && authStore.firebaseUser) {
    authStore.firebaseUser.getIdToken().then((token) => {
      if (!token) return;
      api.bookings.me
        .get({
          query: { filter: "upcoming" },
          headers: { authorization: `Bearer ${token}` },
        })
        .then((res: any) => {
          if (res.data && Array.isArray(res.data)) {
            nextBooking = res.data.find(
              (b: any) =>
                b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT",
            );
          }
        })
        .catch(() => {});

      api.vouchers
        .get({
          headers: { authorization: `Bearer ${token}` },
        })
        .then((res: any) => {
          if (res.data && Array.isArray(res.data)) {
            activeVoucherCount = res.data.filter((v: any) => v.isActive).length;
          }
        })
        .catch(() => {});
    });
  }
});

function handleLogout() {
  authStore.logout();
  avatarOpen = false;
  mobileOpen = false;
  window.location.href = "/";
}
</script>

<header
  class="fixed top-0 z-50 w-full transition-all duration-300 ease-out {mobileOpen
    ? 'glass-nav'
    : scrolled
      ? 'bg-[#06121A]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
      : 'bg-transparent backdrop-blur-none border-b border-transparent shadow-none'}"
>
  <div class="container flex h-20 items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-2">
      <span class="heading-3 text-[#F7F7F7]">
        Padel<span class="text-[#E6FA50]">hive</span>
      </span>
    </a>

    <!-- Nav links when unauthenticated -->
    {#if !user && !isDashboardOrAdmin}
      <nav class="hidden items-center gap-8 md:flex">
        <a
          href="/venues"
          class="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]"
        >
          Venues
        </a>
        <a
          href="/#how-it-works"
          class="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]"
        >
          How It Works
        </a>
        <a
          href="/#community"
          class="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]"
        >
          Community
        </a>
      </nav>
    {/if}

    <div class="flex items-center gap-4">
      {#if isPlayer}
        <div class="flex items-center gap-1">
          <a
            href="/bookings"
            aria-label="Bookings"
            title={nextBooking
              ? `Next: ${nextBooking.venue?.name ?? "Court"} · ${nextBooking.bookingDate}`
              : "No upcoming bookings"}
            class="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
          >
            <CalendarDays class="h-[18px] w-[18px]" />
            {#if nextBooking}
              <span
                class="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E6FA50] ring-2 ring-[#06121A]"
              ></span>
            {/if}
          </a>

          <a
            href="/vouchers"
            aria-label="Vouchers"
            title="{activeVoucherCount} active voucher{activeVoucherCount === 1 ? '' : 's'}"
            class="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
          >
            <Ticket class="h-[18px] w-[18px]" />
            {#if activeVoucherCount > 0}
              <span
                class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E6FA50] px-1 caption text-[#06121A]"
              >
                {activeVoucherCount}
              </span>
            {/if}
          </a>
        </div>
      {/if}

      {#if !authStore.isInitialized}
        <div class="h-10 w-10 animate-pulse rounded-full bg-white/[0.04]"></div>
      {:else if user}
        <NotificationBell enabled={!!user} />
        <div bind:this={avatarRef} class="relative">
          <button
            type="button"
            onclick={() => (avatarOpen = !avatarOpen)}
            class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-[#E6FA50]/30"
          >
            {#if user.avatarUrl}
              <img
                src={user.avatarUrl}
                alt={user.name}
                class="h-full w-full rounded-full object-cover"
              />
            {:else}
              <span
                class="flex h-full w-full items-center justify-center rounded-full bg-[#E6FA50]/10 label text-[#E6FA50]"
              >
                {user.name?.trim().charAt(0).toUpperCase() || "?"}
              </span>
            {/if}
          </button>

          {#if avatarOpen}
            <div
              class="absolute right-0 top-12 w-56 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-2 shadow-2xl"
            >
              <div class="px-3 py-2 mb-1">
                <p class="label text-[#F7F7F7]">{user.name}</p>
                <p class="caption text-[#F7F7F7]/25">{user.email}</p>
                <span
                  class="mt-1 inline-block rounded-full bg-[#E6FA50]/10 px-2 py-0.5 caption uppercase text-[#E6FA50]"
                >
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <div class="border-t border-white/[0.04] my-1"></div>

              {#if showDashboard}
                <a
                  href="/dashboard"
                  onclick={() => (avatarOpen = false)}
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 label text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.03] hover:text-[#F7F7F7]"
                >
                  <LayoutDashboard class="h-4 w-4 text-[#50C8C8]" /> Dashboard
                </a>
              {/if}

              {#if showAdmin}
                <a
                  href="/admin"
                  onclick={() => (avatarOpen = false)}
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 label text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.03] hover:text-[#F7F7F7]"
                >
                  <Shield class="h-4 w-4 text-[#50C8C8]" /> Admin Panel
                </a>
              {/if}

              <div class="border-t border-white/[0.04] my-1"></div>
              <button
                type="button"
                onclick={handleLogout}
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 label text-red-400/70 transition-colors hover:bg-red-500/5 hover:text-red-400"
              >
                <LogOut class="h-4 w-4" /> Sign Out
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <a
          href="/auth/login"
          class="btn-lime hidden h-10 items-center gap-2 rounded-full px-6 label md:inline-flex"
        >
          <LogIn class="h-4 w-4" /> Sign In
        </a>
      {/if}

      {#if !user}
        <button
          type="button"
          onclick={() => (mobileOpen = !mobileOpen)}
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F7F7F7] md:hidden"
          aria-label="Toggle menu"
        >
          {#if mobileOpen}
            <X class="h-5 w-5" />
          {:else}
            <Menu class="h-5 w-5" />
          {/if}
        </button>
      {/if}
    </div>
  </div>

  {#if mobileOpen}
    <div class="border-t border-white/[0.06] md:hidden">
      <nav class="container flex flex-col gap-1 py-4">
        <a
          href="/venues"
          onclick={() => (mobileOpen = false)}
          class="flex h-12 items-center rounded-xl px-4 label text-[#F7F7F7]/60 transition-colors hover:bg-white/5 hover:text-[#F7F7F7]"
        >
          Venues
        </a>
        <a
          href="/#how-it-works"
          onclick={() => (mobileOpen = false)}
          class="flex h-12 items-center rounded-xl px-4 label text-[#F7F7F7]/60 transition-colors hover:bg-white/5 hover:text-[#F7F7F7]"
        >
          How It Works
        </a>
        <a
          href="/#community"
          onclick={() => (mobileOpen = false)}
          class="flex h-12 items-center rounded-xl px-4 label text-[#F7F7F7]/60 transition-colors hover:bg-white/5 hover:text-[#F7F7F7]"
        >
          Community
        </a>

        {#if user && isPlayer}
          <a
            href="/bookings"
            onclick={() => (mobileOpen = false)}
            class="flex h-12 items-center rounded-xl px-4 label text-[#F7F7F7]/60 transition-colors hover:bg-white/5 hover:text-[#F7F7F7]"
          >
            My Bookings
          </a>
          <a
            href="/vouchers"
            onclick={() => (mobileOpen = false)}
            class="flex h-12 items-center rounded-xl px-4 label text-[#F7F7F7]/60 transition-colors hover:bg-white/5 hover:text-[#F7F7F7]"
          >
            My Vouchers
          </a>
        {/if}

        {#if !user}
          <a
            href="/auth/login"
            onclick={() => (mobileOpen = false)}
            class="btn-lime mt-3 flex h-12 items-center justify-center gap-2 rounded-full label"
          >
            <LogIn class="h-4 w-4" /> Sign In
          </a>
        {/if}
      </nav>
    </div>
  {/if}
</header>