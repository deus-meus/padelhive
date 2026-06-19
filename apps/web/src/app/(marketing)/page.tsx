import Link from "next/link";
import { Metadata } from "next";
import { Star, MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "PadelHive - Play. Compete. Connect.",
  description: "Indonesia's premier padel community. Book courts, join matches, meet players.",
};
import { getVenues } from "@/lib/api";
import { HomeSearchBar } from "@/components/home/home-search-bar";
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
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt="Padel doubles match in action"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#06121A]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06121A] via-[#06121A]/40 to-transparent" />
        </div>

        <div className="container relative z-10 flex flex-1 flex-col justify-center pt-24 pb-16 md:pt-28 md:pb-20">
          <h1 className="display-hero text-[#F7F7F7]">
            BOOK.
            <br />
            <span className="text-[#E6FA50]">PLAY.</span>
            <br />
            CONNECT.
          </h1>

          <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between">
            <p className="body-lg max-w-md text-[#F7F7F7]/60">
              Indonesia&apos;s padel community. Book courts, join matches,
              meet players.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/venues"
                className="label btn-lime inline-flex h-12 items-center rounded-full px-8"
              >
                Book a Court
              </Link>
              <Link
                href="#community"
                className="label btn-outline-white inline-flex h-12 items-center rounded-full px-8"
              >
                Join a Match
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ─── STATS ─── */}
      <section className="border-y border-white/[0.06] bg-[#06121A]">
        <div className="container flex items-center justify-between py-5">
          <StatInline value="5,000+" label="Players" />
          <div className="h-4 w-px bg-white/[0.08]" />
          <StatInline value="50+" label="Venues" />
          <div className="h-4 w-px bg-white/[0.08]" />
          <StatInline value="200+" label="Matches/mo" />
          <div className="hidden h-4 w-px bg-white/[0.08] md:block" />
          <StatInline value="15K+" label="Hours Played" className="hidden md:flex" />
        </div>
      </section>

      {/* ─── Search ─── */}
      <section className="pt-10 pb-12 md:pt-12 md:pb-16 border-b border-white/[0.04]">
        <div className="container">
          <HomeSearchBar />
        </div>
      </section>

      {/* ─── FEATURED VENUE ─── */}
      <section className="py-section">
        <div className="container">
          <div className="mb-subsection max-w-xl">
            <span className="section-label">Featured</span>
            <h2 className="heading-2 mt-4 text-[#F7F7F7]">
              This Week&apos;s
              <br />
              <span className="text-[#E6FA50]">Top Venue</span>
            </h2>
          </div>

          {!featuredVenue ? (
            <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center md:py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10">
                <Star className="h-6 w-6 text-[#E6FA50]" />
              </div>
              <h3 className="heading-3 mt-6 text-[#F7F7F7]">Featured venues coming soon</h3>
              <p className="body mt-2 max-w-sm text-[#F7F7F7]/40">
                We&apos;re curating the best courts in Indonesia. Check back soon or explore everything available now.
              </p>
              <Link href="/venues" className="label btn-lime mt-6 inline-flex h-10 items-center justify-center rounded-xl px-6">
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
                    <span className="label text-[#E6FA50]">{featuredVenue.rating}</span>
                    <span className="caption text-[#F7F7F7]/25">· {featuredVenue.reviewCount} reviews</span>
                  </div>

                  <h3 className="heading-2 mt-4 text-[#F7F7F7]">
                    {featuredVenue.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/40">
                    <MapPin className="h-3.5 w-3.5" />
                    {featuredVenue.location} · {featuredVenue.city}
                  </p>

                  <p className="body mt-5 text-[#F7F7F7]/25">
                    {featuredVenue.description}
                  </p>

                  <div className="mt-8">
                    <p className="body-sm text-[#50C8C8]">
                      See availability for pricing
                    </p>
                  </div>

                  <div className="label mt-8 inline-flex items-center gap-2 text-[#E6FA50] transition-all group-hover:gap-3">
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
            <h2 className="display-lg text-[#F7F7F7]">
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
            <h2 className="display-xl text-[#F7F7F7]">
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
                  <span className="text-[#F7F7F7]/60">+2,847</span> joined this month
                </p>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <p className="metric text-[#E6FA50]">10K+</p>
                  <p className="caption mt-2 text-[#F7F7F7]/25">Players</p>
                </div>
                <div>
                  <p className="metric text-[#F7F7F7]">2K+</p>
                  <p className="caption mt-2 text-[#F7F7F7]/25">Matches/mo</p>
                </div>
                <div>
                  <p className="metric text-[#F7F7F7]">95%</p>
                  <p className="caption mt-2 text-[#F7F7F7]/25">Match rate</p>
                </div>
              </div>

              <Link
                href="/venues"
                className="label btn-lime mt-12 inline-flex h-12 w-fit items-center gap-2 rounded-full px-8"
              >
                Join the Community
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-section border-t border-white/[0.04]">
        <div className="container">
          <div className="mb-subsection text-center">
            <h2 className="display-xl text-[#F7F7F7]">
              BOOK. SPLIT.
              <br />
              <span className="text-[#E6FA50]">PLAY.</span>
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2">
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
            <h2 className="heading-2 text-[#F7F7F7]">
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
              <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center md:py-20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10">
                  <MapPin className="h-6 w-6 text-[#E6FA50]" />
                </div>
                <h3 className="heading-3 mt-6 text-[#F7F7F7]">No venues yet</h3>
                <p className="body mt-2 max-w-sm text-[#F7F7F7]/40">
                  New courts are being added across Indonesia. Browse the full directory to see what&apos;s live.
                </p>
                <Link href="/venues" className="label btn-lime mt-6 inline-flex h-10 items-center justify-center rounded-xl px-6">
                  Browse All Venues
                </Link>
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
                          <span className="caption absolute left-4 top-4 rounded-full bg-[#E6FA50] px-3 py-1 uppercase text-[#06121A]">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-8 md:p-10">
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                          <span className="label text-[#E6FA50]">{venue.rating}</span>
                          <span className="caption text-[#F7F7F7]/25">· {venue.reviewCount} reviews</span>
                        </div>
                        <h3 className="heading-3 mt-3 text-[#F7F7F7]">
                          {venue.name}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/25">
                          <MapPin className="h-3.5 w-3.5" />
                          {venue.location} · {venue.city}
                        </p>
                        <div className="mt-6">
                          <p className="body-sm text-[#50C8C8]">
                            See availability for pricing
                          </p>
                        </div>
                        <span className="label mt-6 inline-flex items-center gap-2 text-[#E6FA50] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-3">
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
      <span className="metric text-[#E6FA50]">{value}</span>
      <span className="caption uppercase text-[#F7F7F7]/25">{label}</span>
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
          <h3 className="display-lg mt-2 text-[#F7F7F7]">{name}</h3>
          <p className="body mt-2 max-w-xs text-[#F7F7F7]/40">{tagline}</p>
        </div>
        <div className="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10">
          <ArrowRight className="h-4 w-4 text-[#06121A]" />
        </div>
      </div>
    </Link>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group flex gap-8 py-8 md:gap-12 md:py-10">
      <span className="display-lg text-white/[0.04] transition-colors duration-300 group-hover:text-[#E6FA50]/20">
        {number}
      </span>
      <div className="flex flex-col justify-center">
        <h3 className="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]">
          {title}
        </h3>
        <p className="body mt-2 max-w-md text-[#F7F7F7]/40">{description}</p>
      </div>
    </div>
  );
}
