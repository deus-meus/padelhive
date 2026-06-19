import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#06121A]">
      <div className="container">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-20">
          {/* Column 1 — Brand + newsletter */}
          <div className="max-w-[320px]">
            <Link href="/" className="inline-block">
              <span className="heading-3 text-[#F7F7F7]">
                Padel<span className="text-[#E6FA50]">hive</span>
              </span>
            </Link>
            <p className="mt-5 body text-[#F7F7F7]/25">
              Indonesia&apos;s padel community platform. Book courts, join
              matches, meet players.
            </p>
            <div className="mt-8">
              <p className="section-label">
                Stay in the loop
              </p>
              <div className="mt-3 flex max-w-[280px]">
                <input
                  type="email"
                  placeholder="Your email"
                  className="h-10 flex-1 min-w-0 rounded-l-lg border border-white/[0.08] bg-white/[0.03] px-4 body text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30"
                />
                <button className="h-10 shrink-0 rounded-r-lg bg-[#E6FA50] px-4 label uppercase text-[#06121A] transition-colors hover:bg-[#d4e845]">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Column 2 — Navigation */}
          <div>
            <h4 className="section-label mb-5">Navigation</h4>
            <ul className="space-y-3.5">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/venues">Venues</FooterLink>
              <FooterLink href="/venues#matches">Open Matches</FooterLink>
              <FooterLink href="/#community">Community</FooterLink>
              <FooterLink href="/venues">Book a Court</FooterLink>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h4 className="section-label mb-5">Company</h4>
            <ul className="space-y-3.5">
              <FooterLink href="/venues">About</FooterLink>
              <FooterLink href="/venues">Careers</FooterLink>
              <FooterLink href="/venues">Blog</FooterLink>
              <FooterLink href="/dashboard">List Your Venue</FooterLink>
            </ul>
          </div>

          {/* Column 4 — Social */}
          <div>
            <h4 className="section-label mb-5">Social</h4>
            <ul className="space-y-3.5">
              <FooterLink href="https://instagram.com" external>Instagram</FooterLink>
              <FooterLink href="https://tiktok.com" external>TikTok</FooterLink>
              <FooterLink href="https://wa.me" external>WhatsApp</FooterLink>
              <FooterLink href="https://t.me" external>Telegram</FooterLink>
            </ul>
          </div>
        </div>

        {/* Wordmark section */}
        <div className="border-t border-white/[0.04] pt-20 pb-12 md:pt-24 md:pb-14">
          <p
            className="wordmark select-none text-center uppercase text-[#F7F7F7]/[0.1]"
          >
            PADELHIVE
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] py-6 md:flex-row">
          <p className="caption text-[#F7F7F7]/25">
            &copy; {new Date().getFullYear()} Padelhive. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="caption text-[#F7F7F7]/25 cursor-default">
              Privacy
            </span>
            <span className="caption text-[#F7F7F7]/25 cursor-default">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
        >
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60"
      >
        {children}
      </Link>
    </li>
  );
}
