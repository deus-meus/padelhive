<script lang="ts">
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-svelte";
import { authStore } from "$lib/auth/store.svelte";

let mobileMenuOpen = $state(false);

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
}
</script>

<header class="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#06121A]/80 backdrop-blur-xl">
  <div class="container flex h-16 items-center justify-between">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-2.5 transition-opacity hover:opacity-90">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6FA50] text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.3)] font-bold">
        P
      </div>
      <span class="font-heading text-lg font-bold tracking-tight text-[#F7F7F7]">
        PADELHIVE
      </span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="hidden items-center gap-6 md:flex">
      <a href="/venues" class="text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">
        Venues
      </a>
      <a href="/vouchers" class="text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">
        Vouchers
      </a>

      {#if authStore.user}
        <a href="/bookings" class="text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">
          My Bookings
        </a>

        {#if authStore.user.role === "venue_owner" || authStore.user.role === "venue_admin" || authStore.user.role === "super_admin"}
          <a href="/dashboard" class="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">
            <LayoutDashboard class="h-4 w-4" />
            Dashboard
          </a>
        {/if}

        {#if authStore.user.role === "super_admin"}
          <a href="/admin" class="flex items-center gap-1.5 text-sm font-medium text-[#E6FA50] hover:text-[#E6FA50]/80 transition-colors">
            <Shield class="h-4 w-4" />
            Super Admin
          </a>
        {/if}
      {/if}
    </nav>

    <!-- User Actions / Auth Buttons -->
    <div class="hidden items-center gap-3 md:flex">
      {#if authStore.user}
        <a href="/notifications" aria-label="Notifications" class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all">
          <Bell class="h-4 w-4" />
        </a>

        <div class="flex items-center gap-3 pl-2">
          <div class="flex flex-col text-right">
            <span class="text-sm font-semibold text-[#F7F7F7]">{authStore.user.name}</span>
            <span class="text-[10px] font-medium text-white/40 uppercase tracking-wider">{authStore.user.role}</span>
          </div>
          <button
            type="button"
            onclick={() => authStore.logout()}
            aria-label="Log out"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
            title="Log Out"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      {:else}
        <a href="/auth/login" class="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2">
          Sign In
        </a>
        <a href="/auth/signup" class="inline-flex items-center justify-center rounded-xl bg-[#E6FA50] px-4 py-2 text-sm font-semibold text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.25)] hover:bg-[#d4e845] transition-all">
          Book Court
        </a>
      {/if}
    </div>

    <!-- Mobile Hamburger Trigger -->
    <button
      type="button"
      onclick={toggleMobileMenu}
      aria-label="Toggle Menu"
      class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 md:hidden"
    >
      {#if mobileMenuOpen}
        <X class="h-5 w-5" />
      {:else}
        <Menu class="h-5 w-5" />
      {/if}
    </button>
  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="border-b border-white/[0.06] bg-[#0C1B26] px-4 py-6 md:hidden space-y-4">
      <nav class="flex flex-col gap-3">
        <a href="/venues" onclick={toggleMobileMenu} class="rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">
          Venues
        </a>
        <a href="/vouchers" onclick={toggleMobileMenu} class="rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">
          Vouchers
        </a>

        {#if authStore.user}
          <a href="/bookings" onclick={toggleMobileMenu} class="rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">
            My Bookings
          </a>
          <a href="/notifications" onclick={toggleMobileMenu} class="rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">
            Notifications
          </a>

          {#if authStore.user.role === "venue_owner" || authStore.user.role === "venue_admin" || authStore.user.role === "super_admin"}
            <a href="/dashboard" onclick={toggleMobileMenu} class="rounded-lg px-3 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">
              Owner Dashboard
            </a>
          {/if}

          {#if authStore.user.role === "super_admin"}
            <a href="/admin" onclick={toggleMobileMenu} class="rounded-lg px-3 py-2 text-base font-medium text-[#E6FA50] hover:bg-white/5">
              Super Admin
            </a>
          {/if}

          <button
            type="button"
            onclick={() => { toggleMobileMenu(); authStore.logout(); }}
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut class="h-4 w-4" />
            Sign Out
          </button>
        {:else}
          <div class="pt-2 flex flex-col gap-2">
            <a href="/auth/login" onclick={toggleMobileMenu} class="rounded-xl border border-white/20 py-2.5 text-center text-sm font-medium text-white">
              Sign In
            </a>
            <a href="/auth/signup" onclick={toggleMobileMenu} class="rounded-xl bg-[#E6FA50] py-2.5 text-center text-sm font-semibold text-[#06121A]">
              Get Started
            </a>
          </div>
        {/if}
      </nav>
    </div>
  {/if}
</header>
