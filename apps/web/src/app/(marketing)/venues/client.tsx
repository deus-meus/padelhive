"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { MapPin, Star, Search, ArrowUpDown } from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { padelImg } from "@/lib/images";
import { getVenueCourts, getVenues } from "@/lib/api";
import { Court } from "@/types";

const CITIES = ["All", "Bali", "Jakarta", "Surabaya"];

type SortKey = "recommended" | "rating" | "price";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "price", label: "Price: low to high" },
];

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

function groupCourtsByVenue(courts: Court[]) {
  return courts.reduce<Record<string, Court[]>>((acc, court) => {
    acc[court.venueId] = [...(acc[court.venueId] ?? []), court];
    return acc;
  }, {});
}

export default function VenuesPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const [sort, setSort] = useState<SortKey>("recommended");

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

  const filteredVenues = useMemo(() => {
    const list = venues.filter((venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(search.toLowerCase());
      const matchesCity = city === "All" || venue.city === city;
      return matchesSearch && matchesCity;
    });

    const sorted = [...list];
    if (sort === "rating") {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "price") {
      sorted.sort((a, b) => {
        const ca = courtsByVenue[a.id] ?? [];
        const cb = courtsByVenue[b.id] ?? [];
        const pa = ca.length ? Math.min(...ca.map((c) => c.pricing.weekdayOffPeak)) : Number.POSITIVE_INFINITY;
        const pb = cb.length ? Math.min(...cb.map((c) => c.pricing.weekdayOffPeak)) : Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    }
    return sorted;
  }, [venues, search, city, sort, courtsByVenue]);

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <section className="border-b border-white/[0.06] pt-32 pb-10 md:pt-36 md:pb-12">
        <div className="container">
          <span className="section-label">All Venues</span>
          <h1 className="heading-1 mt-3 text-4xl text-[#F7F7F7] md:text-5xl">
            Find <span className="text-[#E6FA50]">Courts</span>
          </h1>
          <p className="body-lg mt-3 max-w-md text-[#F7F7F7]/60">
            Browse and book padel courts across Indonesia.
          </p>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <section className="sticky top-20 z-30 border-b border-white/[0.06] bg-[#06121A]/90 backdrop-blur-xl">
        <div className="container flex flex-col gap-3 py-4 lg:flex-row lg:items-center">
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

          <div className="flex gap-2 overflow-x-auto">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-all duration-200 ${
                  city === c ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60"
                }`}
              >{c}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-4 py-3 lg:w-56">
            <ArrowUpDown className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full appearance-none bg-transparent text-sm font-light text-[#F7F7F7] outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#0C1B26]">{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ─── VENUE LISTINGS ─── */}
      <section className="py-section-sm">
        <div className="container">
          {shouldShowLoading && (
            <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-[#F7F7F7]/40">
              Loading live venue data...
            </div>
          )}
          {shouldShowApiError && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200/80">
              {apiError} Showing demo venue data.
            </div>
          )}
          {shouldShowFallback && (
            <div className="mb-6 rounded-xl border border-[#E6FA50]/15 bg-[#E6FA50]/5 px-4 py-3 text-sm text-[#E6FA50]/70">
              Live API unavailable. Showing demo venue data.
            </div>
          )}

          <p className="mb-6 caption text-[#F7F7F7]/40">
            {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"}
            {city !== "All" ? ` in ${city}` : ""}
          </p>

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
                    <div className="p-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                        <span className="label font-semibold text-[#E6FA50]">{venue.rating}</span>
                        <span className="caption text-[#F7F7F7]/25">({venue.reviewCount})</span>
                      </div>
                      <h3 className="heading-3 mt-2 text-base text-[#F7F7F7]">{venue.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 caption text-[#F7F7F7]/25">
                        <MapPin className="h-3 w-3" />{venue.city}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
                        <span className="price text-sm text-[#50C8C8]">{price > 0 ? `Rp ${(price / 1000).toFixed(0)}K/hr` : "Pricing soon"}</span>
                        <span className="caption text-[#F7F7F7]/25">{courts.length} courts</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          {filteredVenues.length === 0 && !shouldShowLoading && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#F7F7F7]/25">No venues found.</p>
              <button onClick={() => { setSearch(""); setCity("All"); }} className="mt-3 label font-semibold text-[#E6FA50]">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
