<script lang="ts">
import { ArrowLeft, Home } from "lucide-svelte";
import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status || 404} - Halaman Tidak Ditemukan | PadelHive</title>
</svelte:head>

<div class="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#06121A] px-6 py-16 text-center">
  <!-- Clean Solid Dark Card Container -->
  <div class="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-8 text-center shadow-2xl md:p-12">
    <!-- Top Sports Tag Badge -->
    <div class="inline-flex items-center rounded-full bg-[#E6FA50]/10 px-4 py-1.5">
      <span class="section-label text-[#E6FA50]">Out of Bounds</span>
    </div>

    <!-- Clean Solid Error Code Display -->
    <h1 class="display-hero mt-6 font-bold tracking-tight text-[#E6FA50]">
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

    <!-- Clean 2-Button Action Layout -->
    <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <a
        href="/"
        class="btn-lime flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold"
      >
        <Home class="h-4 w-4" />
        Kembali ke Beranda
      </a>
      <button
        type="button"
        onclick={() => history.back()}
        class="btn-outline-white flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium"
      >
        <ArrowLeft class="h-4 w-4" />
        Kembali Sebelumnya
      </button>
    </div>
  </div>
</div>
