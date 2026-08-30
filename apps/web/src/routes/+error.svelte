<script lang="ts">
import { ArrowLeft, Home, Search } from "lucide-svelte";
import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status || 404} - Halaman Tidak Ditemukan | PadelHive</title>
</svelte:head>

<div class="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
  <!-- Subtle Background Radial Glow -->
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6FA50]/[0.05] blur-[120px]"
  ></div>

  <div class="card-surface glass-card relative mx-auto w-full max-w-xl p-8 md:p-12">
    <!-- Top Sports Tag Badge -->
    <div class="inline-flex items-center gap-2 rounded-full border border-[#E6FA50]/20 bg-[#E6FA50]/10 px-4 py-1.5 backdrop-blur-md">
      <span class="h-2 w-2 rounded-full bg-[#E6FA50] animate-pulse"></span>
      <span class="section-label text-[#E6FA50]">Out of Bounds</span>
    </div>

    <!-- Error Code Display -->
    <h1 class="display-hero mt-6 font-bold tracking-tight text-[#E6FA50] drop-shadow-[0_0_35px_rgba(230,250,80,0.25)]">
      {page.status || 404}
    </h1>

    <!-- Headline -->
    <h2 class="heading-2 mt-4 text-[#F7F7F7]">
      {#if page.status === 404}
        Smash Kamu Out dari Lapangan!
      {:else}
        Terjadi Kesalahan pada Server
      {/if}
    </h2>

    <!-- Subtext -->
    <p class="body mt-3 text-[#F7F7F7]/60">
      {#if page.status === 404}
        Halaman atau rute yang kamu cari tidak dapat ditemukan. Mungkin URL salah, telah dipindahkan, atau lapangan belum tersedia.
      {:else}
        {page.error?.message || "Sistem kami mengalami gangguan teknis sementara. Silakan coba beberapa saat lagi."}
      {/if}
    </p>

    <!-- Action Buttons -->
    <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <a
        href="/"
        class="btn-lime flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg shadow-[#E6FA50]/10"
      >
        <Home class="h-4 w-4" />
        Kembali ke Beranda
      </a>
      <a
        href="/venues"
        class="btn-outline-white flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium"
      >
        <Search class="h-4 w-4" />
        Jelajahi Lapangan
      </a>
    </div>

    <!-- Additional Hint / Back Navigation -->
    <div class="mt-8 border-t border-white/[0.06] pt-6">
      <button
        onclick={() => history.back()}
        class="inline-flex items-center gap-1.5 text-xs text-[#F7F7F7]/40 transition-colors hover:text-[#E6FA50]"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Kembali ke halaman sebelumnya
      </button>
    </div>
  </div>
</div>
