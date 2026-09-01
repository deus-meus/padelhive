<script lang="ts">
let year = new Date().getFullYear();
</script>

<footer class="border-t border-white/[0.04] bg-[#06121A]">
  <div class="container">
    <!-- Main footer content -->
    <div
      class="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-20"
    >
      <!-- Column 1 — Brand + newsletter -->
      <div class="max-w-[320px]">
        <a href="/" class="inline-block">
          <span class="heading-3 text-[#F7F7F7]">
            Padel<span class="text-[#E6FA50]">hive</span>
          </span>
        </a>
        <p class="mt-5 body text-[#F7F7F7]/25">
          Indonesia's padel community platform. Book courts, join matches, meet
          players.
        </p>
        <div class="mt-8">
          <p class="section-label">Stay in the loop</p>
          <div class="mt-3 flex max-w-[280px]">
            <input
              type="email"
              placeholder="Your email"
              class="h-10 flex-1 min-w-0 rounded-l-lg border border-white/[0.08] bg-white/[0.03] px-4 body text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30"
            />
            <button
              type="button"
              class="h-10 shrink-0 rounded-r-lg bg-[#E6FA50] px-4 label text-[#06121A] transition-colors hover:bg-[#d4e845]"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <!-- Column 2 — Navigation -->
      <div>
        <h4 class="section-label mb-5">Navigation</h4>
        <ul class="space-y-3.5">
          <li>
            <a
              href="/"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/venues"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Venues
            </a>
          </li>
          <li>
            <a
              href="/venues#matches"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Open Matches
            </a>
          </li>
          <li>
            <a
              href="/#community"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Community
            </a>
          </li>
          <li>
            <a
              href="/venues"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Book a Court
            </a>
          </li>
        </ul>
      </div>

      <!-- Column 3 — Company -->
      <div>
        <h4 class="section-label mb-5">Company</h4>
        <ul class="space-y-3.5">
          <li>
            <a
              href="/venues"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="/venues"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Careers
            </a>
          </li>
          <li>
            <a
              href="/venues"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Blog
            </a>
          </li>
          <li>
            <a
              href="/dashboard"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              List Your Venue
            </a>
          </li>
        </ul>
      </div>

      <!-- Column 4 — Social -->
      <div>
        <h4 class="section-label mb-5">Social</h4>
        <ul class="space-y-3.5">
          <li>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Instagram
            </a>
          </li>
          <li>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              TikTok
            </a>
          </li>
          <li>
            <a
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              WhatsApp
            </a>
          </li>
          <li>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
            >
              Telegram
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Divider above wordmark -->
  <div class="container">
    <div class="border-t border-white/[0.04]"></div>
  </div>

  <!-- Wordmark section -->
  <div class="overflow-hidden pt-16 pb-12 md:pt-20 md:pb-14">
    <p class="wordmark select-none text-center uppercase text-[#F7F7F7]/[0.1]">
      PADELHIVE
    </p>
  </div>

  <div class="container">
    <!-- Bottom bar -->
    <div
      class="flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] py-6 md:flex-row"
    >
      <p class="caption text-[#F7F7F7]/25">
        &copy; {year} Padelhive. All rights reserved.
      </p>
      <div class="flex gap-6">
        <span class="caption text-[#F7F7F7]/25 cursor-default">Privacy</span>
        <span class="caption text-[#F7F7F7]/25 cursor-default">Terms</span>
      </div>
    </div>
  </div>
</footer>