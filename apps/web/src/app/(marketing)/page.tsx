import Link from "next/link";
import { Metadata } from "next";
import { Star, MapPin, ArrowRight, Users, Calendar, Search, Clock as ClockIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "PadelHive - Play. Compete. Connect.",
  description: "Indonesia's premier padel community. Book courts, join matches, meet players.",
};
import { getVenues } from "@/lib/api";
import { PlayerAvatarStack } from "@/components/ui/player-avatar-stack";
import { padelImg } from "@/lib/images";

const IMG = {
  hero: padelImg(1920, 85),
  featured: padelImg(1400, 85),
  bali: padelImg(900),
  jakarta: padelImg(900),
  surabaya: padelImg(900),
  community: padelImg(1000),
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

export default async function HomePage() {
  let venues: Awaited<ReturnType<typeof getVenues>> = [];
  try {
    venues = await getVenues({ revalidate: 60 });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to fetch venues for home page");
    }
  }

  const featuredVenue = venues.length > 0 ? venues[0] : null;

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt="Padel doubles match in action"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#06121A]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06121A] via-[#06121A]/40 to-transparent" />
        </div>

        <div className="container relative z-10 pb-24 md:pb-28">
          <h1 className="display-xl text-[clamp(4.5rem,14vw,13rem)] text-[#F7F7F7]">
            PLAY.
            <br />
            <span className="text-[#E6FA50]">COMPETE.</span>
            <br />
            CONNECT.
          </h1>

          <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between">
            <p className="body-lg max-w-md text-[#F7F7F7]/60">
              Indonesia&apos;s padel community. Book courts, join matches,
              meet players.
            </p>

            <div className="flex gap-3">
              <Link
                href="/venues"
                className="btn-lime inline-flex h-12 items-center rounded-full px-8 text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Book a Court
              </Link>
              <Link
                href="#community"
                className="btn-outline-white inline-flex h-12 items-center rounded-full px-8 text-[11px] font-medium uppercase tracking-[0.08em]"
              >
                Join a Match
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 border-t border-white/[0.06] bg-[#06121A]/80 backdrop-blur-sm">
          <div className="container flex items-center justify-between py-4">
            <StatInline value="5,000+" label="Players" />
            <div className="h-4 w-px bg-white/[0.08]" />
            <StatInline value="50+" label="Venues" />
            <div className="h-4 w-px bg-white/[0.08]" />
            <StatInline value="200+" label="Matches/mo" />
            <div className="hidden h-4 w-px bg-white/[0.08] md:block" />
            <StatInline value="15K+" label="Hours Played" className="hidden md:flex" />
          </div>
        </div>
      </section>

      {/* ─── SEARCH ─── */}
      <section className="py-section-sm border-b border-white/[0.04]">
        <div className="container">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 md:p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
                <input
                  type="text"
                  placeholder="Search venues or locations..."
                  className="w-full bg-transparent text-sm font-light text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
                <select className="w-full appearance-none bg-transparent text-sm font-light text-[#F7F7F7] outline-none">
                  <option value="" className="bg-[#0C1B26]">All Cities</option>
                  <option value="Bali" className="bg-[#0C1B26]">Bali</option>
                  <option value="Jakarta" className="bg-[#0C1B26]">Jakarta</option>
                  <option value="Surabaya" className="bg-[#0C1B26]">Surabaya</option>
                </select>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                <Calendar className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
                <input type="date" className="w-full bg-transparent text-sm font-light text-[#F7F7F7] outline-none [color-scheme:dark]" />
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                <ClockIcon className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
                <select className="w-full appearance-none bg-transparent text-sm font-light text-[#F7F7F7] outline-none">
                  <option value="" className="bg-[#0C1B26]">Any Time</option>
                  <option value="morning" className="bg-[#0C1B26]">Morning</option>
                  <option value="afternoon" className="bg-[#0C1B26]">Afternoon</option>
                  <option value="evening" className="bg-[#0C1B26]">Evening</option>
                </select>
              </div>
              <Link
                href="/venues"
                className="btn-lime flex h-[46px] items-center justify-center rounded-xl px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED VENUE ─── */}
      <section className="py-section">
        <div className="container">
          <div className="mb-subsection max-w-xl">
            <span className="section-label">Featured</span>
            <h2 className="heading-1 mt-4 text-4xl text-[#F7F7F7] md:text-5xl">
              This Week&apos;s
              <br />
              <span className="text-[#E6FA50]">Top Venue</span>
            </h2>
          </div>

          {!featuredVenue ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8 text-center md:p-12">
              <p className="text-[#F7F7F7]/60 mb-4">No featured venue available at the moment.</p>
              <Link href="/venues" className="btn-lime inline-flex h-10 items-center justify-center rounded-xl px-6 text-[11px] font-semibold uppercase tracking-[0.08em]">
                Browse All Venues
              </Link>
            </div>
          ) : (
            <Link href={`/venues/${featuredVenue.id}`} className="group block">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[16/10]">
                  <img
                    src={IMG.featured}
                    alt={featuredVenue.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" />
                    <span className="label font-semibold text-[#E6FA50]">{featuredVenue.rating}</span>
                    <span className="caption text-[#F7F7F7]/25">· {featuredVenue.reviewCount} reviews</span>
                  </div>

                  <h3 className="heading-2 mt-4 text-2xl text-[#F7F7F7] md:text-3xl">
                    {featuredVenue.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/40">
                    <MapPin className="h-3.5 w-3.5" />
                    {featuredVenue.location} · {featuredVenue.city}
                  </p>

                  <p className="mt-5 text-sm font-light leading-relaxed text-[#F7F7F7]/25">
                    {featuredVenue.description}
                  </p>

                  <div className="mt-8">
                    <p className="text-sm font-medium text-[#50C8C8]">
                      See availability for pricing
                    </p>
                  </div>

                  <div className="mt-8 inline-flex items-center gap-2 label font-semibold text-[#E6FA50] transition-all group-hover:gap-3">
                    View Availability
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ─── CITIES ─── */}
      <section className="py-section">
        <div className="container">
          <div className="mb-subsection">
            <h2 className="display-lg text-[clamp(3rem,8vw,7rem)] text-[#F7F7F7]">
              WHERE
              <br />
              WILL YOU
              <br />
              <span className="text-[#E6FA50]">PLAY?</span>
            </h2>
          </div>

          <div className="space-y-4">
            <CityBlock
              name="BALI"
              venues={12}
              tagline="Island courts. Ocean breeze. Sunset sessions."
              image={IMG.bali}
              href="/venues?city=Bali"
              height="h-[50vh] min-h-[400px]"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CityBlock
                name="JAKARTA"
                venues={24}
                tagline="Premium indoor facilities in the city center."
                image={IMG.jakarta}
                href="/venues?city=Jakarta"
                height="h-[40vh] min-h-[340px]"
              />
              <CityBlock
                name="SURABAYA"
                venues={8}
                tagline="East Java's emerging padel scene."
                image={IMG.surabaya}
                href="/venues?city=Surabaya"
                height="h-[40vh] min-h-[340px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY ─── */}
      <section id="community" className="py-section">
        <div className="container">
          <div className="mb-subsection text-center">
            <h2 className="display-xl text-[clamp(2.5rem,8vw,7rem)] text-[#F7F7F7]">
              FIND PLAYERS.
              <br />
              <span className="text-[#E6FA50]">NOT JUST COURTS.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                <img
                  src={IMG.community}
                  alt="Padel players after a doubles match"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -right-4 w-64 rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-5 shadow-2xl shadow-black/60 md:-right-6 md:w-72">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#E6FA50]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#E6FA50]">
                    Open Match
                  </span>
                  <span className="flex items-center gap-1 caption text-[#F7F7F7]/40">
                    <Users className="h-3 w-3" /> 2 spots
                  </span>
                </div>
                <p className="heading-3 mt-3 text-sm text-[#F7F7F7]">Padel Bali Arena</p>
                <p className="mt-1 flex items-center gap-2 caption text-[#F7F7F7]/25">
                  <Calendar className="h-3 w-3" /> Tomorrow · 18:00
                </p>
                <Link href="/venues/venue-1/book" className="btn-lime mt-4 flex w-full items-center justify-center rounded-full py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                  Join Match
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              <p className="body-lg max-w-md text-[#F7F7F7]/60">
                Padelhive is where Indonesia&apos;s padel community lives.
                Join open matches, find partners at your level, split costs,
                and grow your network.
              </p>

              <div className="mt-10">
                <PlayerAvatarStack
                  players={[
                    { id: "p1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11" },
                    { id: "p2", name: "Sari Dewi", avatarUrl: "https://i.pravatar.cc/150?img=32" },
                    { id: "p3", name: "Budi Santoso", avatarUrl: "https://i.pravatar.cc/150?img=15" },
                    { id: "p4", name: "Clara Wijaya", avatarUrl: "https://i.pravatar.cc/150?img=25" },
                    { id: "p5", name: "Dewi Lestari", avatarUrl: "https://i.pravatar.cc/150?img=44" },
                  ]}
                  maxVisible={5}
                  size={36}
                  showCount={false}
                />
                <p className="caption mt-3 text-[#F7F7F7]/25">
                  <span className="font-medium text-[#F7F7F7]/60">+2,847</span> joined this month
                </p>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <p className="metric text-3xl text-[#E6FA50] md:text-4xl">10K+</p>
                  <p className="caption mt-2 text-[#F7F7F7]/25">Players</p>
                </div>
                <div>
                  <p className="metric text-3xl text-[#F7F7F7] md:text-4xl">2K+</p>
                  <p className="caption mt-2 text-[#F7F7F7]/25">Matches/mo</p>
                </div>
                <div>
                  <p className="metric text-3xl text-[#F7F7F7] md:text-4xl">95%</p>
                  <p className="caption mt-2 text-[#F7F7F7]/25">Match rate</p>
                </div>
              </div>

              <Link
                href="/venues"
                className="btn-lime mt-12 inline-flex h-12 w-fit items-center gap-2 rounded-full px-8 text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Join the Community
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-section border-t border-white/[0.04]">
        <div className="container">
          <div className="mb-subsection text-center">
            <h2 className="display-xl text-[clamp(3rem,8vw,7rem)] text-[#F7F7F7]">
              BOOK. SPLIT.
              <br />
              <span className="text-[#E6FA50]">PLAY.</span>
            </h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <Step number="01" title="Book a Court" description="Browse premium venues. Check real-time availability. Reserve your court in seconds." />
            <Step number="02" title="Invite Your Crew" description="Share your booking link. Friends RSVP instantly. Build your squad for every session." />
            <Step number="03" title="Split the Cost" description="Everyone pays their share automatically. No awkward conversations." />
            <Step number="04" title="Play" description="Show up. Compete. Connect. Build your padel story." />
          </div>
        </div>
      </section>

      {/* ─── ALL VENUES ─── */}
      <section id="venues" className="py-section border-t border-white/[0.04]">
        <div className="container">
          <div className="mb-subsection flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
              All <span className="text-[#E6FA50]">Venues</span>
            </h2>
            <Link
              href="/venues"
              className="group flex items-center gap-2 label text-[#F7F7F7]/40 transition-colors hover:text-[#E6FA50]"
            >
              Browse all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="space-y-5">
            {venues.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8 text-center text-[#F7F7F7]/60">
                No venues found.
              </div>
            ) : (
              venues.map((venue, i) => {
                const images = [IMG.venue1, IMG.venue2, IMG.venue3];

                return (
                  <Link key={venue.id} href={`/venues/${venue.id}`} className="group block">
                    <article className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-300 group-hover:border-[#E6FA50]/15 md:grid-cols-[1fr_1fr]">
                      <div className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]">
                        <img
                          src={images[i % images.length]}
                          alt={venue.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                        />
                        {venue.isVerified && (
                          <span className="absolute left-4 top-4 rounded-full bg-[#E6FA50] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#06121A]">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-8 md:p-10">
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                          <span className="label font-semibold text-[#E6FA50]">{venue.rating}</span>
                          <span className="caption text-[#F7F7F7]/25">· {venue.reviewCount} reviews</span>
                        </div>
                        <h3 className="heading-2 mt-3 text-xl text-[#F7F7F7] md:text-2xl">
                          {venue.name}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/25">
                          <MapPin className="h-3.5 w-3.5" />
                          {venue.location} · {venue.city}
                        </p>
                        <div className="mt-6">
                          <p className="text-sm font-medium text-[#50C8C8]">
                            See availability for pricing
                          </p>
                        </div>
                        <span className="mt-6 inline-flex items-center gap-2 label font-semibold text-[#E6FA50] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-3">
                          View Availability <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function StatInline({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-heading text-base font-semibold text-[#E6FA50] tracking-[-0.02em] md:text-lg">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#F7F7F7]/25">{label}</span>
    </div>
  );
}

function CityBlock({
  name,
  venues,
  tagline,
  image,
  href,
  height,
}: {
  name: string;
  venues: number;
  tagline: string;
  image: string;
  href: string;
  height: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className={`relative overflow-hidden rounded-2xl ${height}`}>
        <img
          src={image}
          alt={`Padel courts in ${name}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-10">
          <p className="section-label">{venues} venues</p>
          <h3 className="display-lg mt-2 text-4xl text-[#F7F7F7] md:text-6xl">{name}</h3>
          <p className="mt-2 max-w-xs text-sm font-light text-[#F7F7F7]/40">{tagline}</p>
        </div>
        <div className="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:border-[#E6FA50] md:bottom-10 md:right-10">
          <ArrowRight className="h-4 w-4 text-[#E6FA50]" />
        </div>
      </div>
    </Link>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group flex gap-8 border-b border-white/[0.04] py-10 last:border-0 md:gap-12 md:py-12">
      <span className="font-heading text-5xl font-bold text-white/[0.04] transition-colors duration-300 group-hover:text-[#E6FA50]/20 md:text-6xl tracking-[-0.04em]">
        {number}
      </span>
      <div className="flex flex-col justify-center">
        <h3 className="heading-2 text-lg text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50] md:text-xl">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm text-[#F7F7F7]/35 font-light leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
