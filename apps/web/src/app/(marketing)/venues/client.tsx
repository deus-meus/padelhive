"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { MapPin, Star, Search, ArrowRight, Users, Calendar, Clock, CreditCard, Trophy } from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { PlayerAvatarStack } from "@/components/ui/player-avatar-stack";
import { padelImg } from "@/lib/images";
import { getVenueCourts, getVenues } from "@/lib/api";
import { Court, Venue } from "@/types";

const CITIES = ["All", "Bali", "Jakarta", "Surabaya"];

const IMG = {
  hero: padelImg(1920, 85),
  featured: padelImg(1400, 85),
  community: padelImg(900),
  bali: padelImg(800),
  jakarta: padelImg(800),
  surabaya: padelImg(800),
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

function groupCourtsByVenue(courts: Court[]) {
  return courts.reduce<Record<string, Court[]>>((acc, court) => {
    acc[court.venueId] = [...(acc[court.venueId] ??[]), court];
    return acc;
  },{});
}

const OPEN_MATCHES = [
  { id: 1, venue: "Padel Bali Arena", venueId: "venue-1", date: "Tomorrow", time: "18:00", level: "Intermediate", spots: 2 },
  { id: 2, venue: "Jakarta Padel Club", venueId: "venue-2", date: "Sat, 31 May", time: "09:00", level: "Beginner", spots: 1 },
  { id: 3, venue: "Surabaya Padel Center", venueId: "venue-3", date: "Sun, 1 Jun", time: "16:00", level: "Advanced", spots: 3 },
];

export default function VenuesPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const { data: apiVenues, isLoading: isLoadingVenues, isError: isVenuesError } = useQuery({
    queryKey: queryKeys.venues.all(),
    queryFn: getVenues,
  });

  const venues = apiVenues && apiVenues.length > 0 ? apiVenues : mockVenues;
  const hasLiveVenues = !!(apiVenues && apiVenues.length > 0);

  const courtQueries = useQueries({
    queries: venues.map((venue) => ({
      queryKey: queryKeys.venues.courts(venue.id),
      queryFn: () => getVenueCourts(venue.id),
      enabled: hasLiveVenues,
    })),
  });

  const courtsByVenue = hasLiveVenues
    ? courtQueries.reduce<Record<string, Court[]>>((acc, query, index) => {
        acc[venues[index].id] = query.data ?? [];
        return acc;
      }, {})
    : groupCourtsByVenue(mockCourts);

  const isUsingFallback = isVenuesError || (apiVenues && apiVenues.length === 0);
  const apiError = isVenuesError ? "Could not reach the live venue API." : null;

  const hasApiData = Boolean(apiVenues && apiVenues.length > 0);
  const shouldShowLoading = isLoadingVenues && !hasApiData;
  const shouldShowApiError = Boolean(apiError) && !shouldShowLoading;
  const shouldShowFallback = isUsingFallback && !apiError && !shouldShowLoading;

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(search.toLowerCase());
    const matchesCity = city === "All" || venue.city === city;
    return matchesSearch && matchesCity;
  });

  const featured = venues[0] ?? mockVenues[0];
  const featuredCourts = courtsByVenue[featured.id] ?? [];
  const featuredPrice = featuredCourts.length
    ? Math.min(...featuredCourts.map((c) => c.pricing.weekdayOffPeak))
    : 0;

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[75vh] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="Padel court with glass walls" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#06121A]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06121A] via-[#06121A]/30 to-transparent" />
        </div>
        <div className="container relative z-10 pb-20 pt-40">
          <h1 className="display-xl text-[clamp(3.5rem,10vw,9rem)] text-[#F7F7F7]">
            DISCOVER.
            <br />
            <span className="text-[#E6FA50]">PLAY.</span>
          </h1>
          <p className="body-lg mt-5 max-w-md text-[#F7F7F7]/50">
            Premium padel venues across Indonesia. Find your court, join a match, meet your crew.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="#venues" className="btn-lime inline-flex h-11 items-center rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.08em]">
              Find a Court
            </Link>
            <Link href="#matches" className="btn-outline-white inline-flex h-11 items-center rounded-full px-7 text-[11px] font-medium uppercase tracking-[0.08em]">
              Join a Match
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED VENUE ─── */}
      <section className="py-section-sm">
        <div className="container">
          <span className="section-label">Featured Venue</span>
          <Link href={`/venues/${featured.id}`} className="group mt-6 block">
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1B26] lg:grid-cols-[1.2fr_1fr] lg:h-[520px]">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full">
                <img src={IMG.featured} alt={featured.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#06121A]/20 to-transparent" />
                {featured.isVerified && (
                  <span className="absolute left-5 top-5 rounded-full bg-[#E6FA50] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#06121A]">
                    Verified Venue
                  </span>
                )}
                <span className="absolute left-5 bottom-5 rounded-full bg-[#06121A]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#F7F7F7]/60 backdrop-blur-sm">
                  {featured.city}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <h2 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">{featured.name}</h2>

                <div className="mt-3 flex items-center gap-3">
                  <Star className="h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" />
                  <span className="label font-semibold text-[#E6FA50]">{featured.rating}</span>
                  <span className="caption text-[#F7F7F7]/25">({featured.reviewCount} reviews)</span>
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
                  <MapPin className="h-4 w-4" />
                  {featured.location}
                </p>

                <p className="mt-5 text-sm font-light leading-relaxed text-[#F7F7F7]/30">{featured.description}</p>

                {/* Facilities */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {featured.facilities.map((f) => (
                    <span key={f} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-[#F7F7F7]/40">{f}</span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="mt-7 flex items-center gap-5 border-t border-white/[0.06] pt-6">
                  <div>
                    <p className="price text-xl text-[#50C8C8]">{featuredPrice > 0 ? `Rp ${(featuredPrice / 1000).toFixed(0)}K` : "Pricing soon"}</p>
                    <p className="caption mt-0.5 text-[#F7F7F7]/20">per hour</p>
                  </div>
                  <div className="h-9 w-px bg-white/[0.06]" />
                  <div>
                    <p className="metric text-xl text-[#F7F7F7]">{featuredCourts.length}</p>
                    <p className="caption mt-0.5 text-[#F7F7F7]/20">courts</p>
                  </div>
                  <div className="h-9 w-px bg-white/[0.06]" />
                  <div>
                    <p className="text-sm font-medium text-[#E6FA50]">Available today</p>
                    <p className="caption mt-0.5 text-[#F7F7F7]/20">open slots</p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-7 flex gap-3">
                  <span className="btn-lime inline-flex h-11 items-center gap-2 rounded-full px-7 text-[11px] font-semibold uppercase tracking-[0.08em]">
                    View Availability <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="inline-flex h-11 items-center rounded-full border border-white/10 px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/40 transition-colors group-hover:border-white/20 group-hover:text-[#F7F7F7]/70">
                    See Details
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── OPEN MATCHES ─── */}
      <section id="matches" className="py-section-sm border-t border-white/[0.04]">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="section-label">Open Matches</span>
              <h2 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-3xl">Join a <span className="text-[#E6FA50]">Match</span></h2>
            </div>
            <Link href="/venues#venues" className="group hidden items-center gap-2 label text-[#F7F7F7]/30 transition-colors hover:text-[#E6FA50] md:flex">
              All matches <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {OPEN_MATCHES.map((match) => (
              <div key={match.id} className="group flex flex-col rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] ${
                  match.level === "Beginner" ? "bg-[#50C8C8]/10 text-[#50C8C8]" :
                  match.level === "Intermediate" ? "bg-[#E6FA50]/10 text-[#E6FA50]" :
                  "bg-white/[0.05] text-[#F7F7F7]/50"
                }`}>{match.level}</span>

                <h3 className="heading-3 mt-4 text-base text-[#F7F7F7]">{match.venue}</h3>
                <div className="mt-2 flex items-center gap-3 caption text-[#F7F7F7]/30">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{match.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{match.time}</span>
                </div>

                <div className="mt-4">
                  <PlayerAvatarStack
                    players={[
                      { id: `m${match.id}-1`, name: "Andi P", avatarUrl: "https://i.pravatar.cc/150?img=11" },
                      { id: `m${match.id}-2`, name: "Sari D", avatarUrl: "https://i.pravatar.cc/150?img=32" },
                      { id: `m${match.id}-3`, name: "Michael R", avatarUrl: "https://i.pravatar.cc/150?img=15" },
                    ]}
                    totalSpots={4}
                    size={28}
                  />
                </div>

                <Link href={`/venues/${match.venueId}/book`} className="btn-lime mt-5 flex w-full items-center justify-center rounded-full py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                  Join Match
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CITIES ─── */}
      <section className="py-section-sm border-t border-white/[0.04]">
        <div className="container">
          <div className="mb-8">
            <span className="section-label">Destinations</span>
            <h2 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-3xl">Explore <span className="text-[#E6FA50]">Cities</span></h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: "Bali", venues: 12, image: IMG.bali },
              { name: "Jakarta", venues: 24, image: IMG.jakarta },
              { name: "Surabaya", venues: 8, image: IMG.surabaya },
            ].map((c) => (
              <Link key={c.name} href={`/venues?city=${c.name}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <img src={c.image} alt={`Padel in ${c.name}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <p className="section-label">{c.venues} venues</p>
                    <h3 className="display-lg mt-1 text-2xl text-[#F7F7F7] md:text-3xl">{c.name.toUpperCase()}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY PADELHIVE ─── */}
      <section className="py-12 md:py-16 border-t border-white/[0.04]">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
            {/* Left — heading */}
            <div>
              <h2 className="display-lg text-[clamp(2rem,5vw,3.5rem)] text-[#F7F7F7]">
                BOOK. SPLIT.
                <br />
                <span className="text-[#E6FA50]">PLAY.</span>
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-[#F7F7F7]/35 max-w-sm">
                Everything you need to organize your next padel session — from court booking to friends and split payments.
              </p>
            </div>

            {/* Right — 2x2 grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FeatureCard icon={Calendar} title="Book Courts" description="Real-time slot availability. Reserve in seconds." />
              <FeatureCard icon={Users} title="Invite Friends" description="Share link and RSVP. Build your squad." />
              <FeatureCard icon={CreditCard} title="Split Payments" description="Auto cost sharing. No awkward chasing." />
              <FeatureCard icon={Trophy} title="Join Matches" description="Find players by level. Compete weekly." />
            </div>
          </div>
        </div>
      </section>

      {/* ─── VENUE LISTINGS ─── */}
      <section id="venues" className="py-section-sm border-t border-white/[0.04]">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-label">All Venues</span>
              <h2 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-3xl">Browse <span className="text-[#E6FA50]">Courts</span></h2>
            </div>
          </div>

          {shouldShowLoading && (
            <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-[#F7F7F7]/40">
              Loading live venue data...
            </div>
          )}
          {shouldShowApiError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200/80">
              {apiError} Showing demo venue data.
            </div>
          )}
          {shouldShowFallback && (
            <div className="mb-4 rounded-xl border border-[#E6FA50]/15 bg-[#E6FA50]/5 px-4 py-3 text-sm text-[#E6FA50]/70">
              Live API unavailable. Showing demo venue data.
            </div>
          )}

          {/* Search */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search venues..."
                className="w-full bg-transparent text-sm font-light text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
              />
            </div>
            <div className="flex gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-all duration-200 ${
                    city === c ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/35 hover:bg-white/[0.06] hover:text-[#F7F7F7]/70"
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue, i) => {
              const courts = courtsByVenue[venue.id] ?? [];
              const price = courts.length ? Math.min(...courts.map((c) => c.pricing.weekdayOffPeak)) : 0;
              const images = [IMG.venue1, IMG.venue2, IMG.venue3];

              return (
                <Link key={venue.id} href={`/venues/${venue.id}`} className="group block">
                  <article className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-200 group-hover:border-[#E6FA50]/15">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={images[i % images.length]} alt={venue.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                      {venue.isVerified && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#E6FA50] px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#06121A]">Verified</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                        <span className="label font-semibold text-[#E6FA50]">{venue.rating}</span>
                        <span className="caption text-[#F7F7F7]/25">({venue.reviewCount})</span>
                      </div>
                      <h3 className="heading-3 mt-2 text-base text-[#F7F7F7]">{venue.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 caption text-[#F7F7F7]/30">
                        <MapPin className="h-3 w-3" />{venue.city}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
                        <span className="price text-sm text-[#50C8C8]">{price > 0 ? `Rp ${(price / 1000).toFixed(0)}K/hr` : "Pricing soon"}</span>
                        <span className="caption text-[#F7F7F7]/20">{courts.length} courts</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          {filteredVenues.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#F7F7F7]/30">No venues found.</p>
              <button onClick={() => { setSearch(""); setCity("All"); }} className="mt-3 label font-semibold text-[#E6FA50]">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-7 transition-all duration-200 hover:border-[#E6FA50]/15 hover:-translate-y-0.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6FA50]/10">
        <Icon className="h-5 w-5 text-[#E6FA50]" />
      </div>
      <h3 className="heading-3 mt-4 text-sm text-[#F7F7F7]">{title}</h3>
      <p className="caption mt-2 text-[#F7F7F7]/30 leading-relaxed">{description}</p>
    </div>
  );
}
