<script lang="ts">
import { ArrowLeft, Home, Search } from "lucide-svelte";
import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status || 404} - Halaman Tidak Ditemukan | PadelHive</title>
</svelte:head>

<div class="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#06121A] px-6 py-8 text-[#F7F7F7]">
  <!-- Top Brand Logo Bar -->
  <header class="container z-10 flex items-center justify-between py-4">
    <a href="/" class="flex items-center gap-2">
      <span class="heading-3 text-[#F7F7F7]">
        Padel<span class="text-[#E6FA50]">hive</span>
      </span>
    </a>
  </header>

  <!-- Ambient Glowing Background Effect -->
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6FA50]/[0.08] blur-[160px]"
  ></div>
  <div
    class="pointer-events-none absolute right-1/4 top-1/3 -z-10 h-[350px] w-[350px] rounded-full bg-[#50C8C8]/[0.05] blur-[140px]"
  ></div>

  <!-- Decorative Court Grid Background Lines -->
  <div class="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] bg-[radial-gradient(#E6FA50_1px,transparent_1px)] [background-size:32px_32px]"></div>

  <!-- Main Center Content -->
  <main class="container z-10 my-auto flex flex-col items-center justify-center py-12 text-center">
    <!-- Top Sports Tag Badge -->
    <div class="inline-flex items-center gap-2.5 rounded-full border border-[#E6FA50]/20 bg-[#E6FA50]/10 px-5 py-2 backdrop-blur-md">
      <span class="h-2 w-2 rounded-full bg-[#E6FA50] animate-pulse"></span>
      <span class="section-label text-[#E6FA50]">Out of Bounds</span>
    </div>

    <!-- Error Code Display -->
    <h1 class="display-hero mt-6 font-bold tracking-tight text-[#E6FA50] drop-shadow-[0_0_50px_rgba(230,250,80,0.3)]">
      {page.status || 404}
    </h1>

    <!-- Main Headline -->
    <h2 class="display-lg mt-4 text-[#F7F7F7]">
      {#if page.status === 404}
        Smash Kamu Out dari Lapangan!
      {:else}
        Terjadi Kesalahan pada Server
      {/if}
    </h2>

    <!-- Description Subtext -->
    <p class="body-lg mt-4 max-w-lg text-[#F7F7F7]/60">
      {#if page.status === 404}
        Halaman atau rute yang kamu cari tidak dapat ditemukan. Mungkin URL salah, telah dipindahkan, atau lapangan belum tersedia.
      {:else}
        {page.error?.message || "Sistem kami mengalami gangguan teknis sementara. Silakan coba beberapa saat lagi."}
      {/if}
    </p>

    <!-- Action Buttons -->
    <div class="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
      <a
        href="/"
        class="btn-lime flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-semibold shadow-xl shadow-[#E6FA50]/10 transition-transform hover:scale-105"
      >
        <Home class="h-5 w-5" />
        Kembali ke Beranda
      </a>
      <a
        href="/venues"
        class="btn-outline-white flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-medium transition-transform hover:scale-105"
      >
        <Search class="h-5 w-5" />
        Jelajahi Lapangan
      </a>
    </div>

    <!-- Back Navigation Link -->
    <button
      type="button"
      onclick={() => history.back()}
      class="mt-8 inline-flex items-center gap-2 text-sm text-[#F7F7F7]/40 transition-colors hover:text-[#E6FA50]"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali ke halaman sebelumnya
    </button>
  </main>

  <!-- Bottom Brand Footer Line -->
  <footer class="container z-10 text-center py-4">
    <p class="caption text-[#F7F7F7]/25">
      &copy; {new Date().getFullYear()} Padelhive Inc. All rights reserved.
    </p>
  </footer>
</div>
