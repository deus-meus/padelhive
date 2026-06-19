"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Search, ArrowUpDown } from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { padelImg } from "@/lib/images";
import { getVenues } from "@/lib/api";
import { EmptyState } from "@/components/ui/error-state";

const CITIES = ["All", "Bali", "Jakarta", "Surabaya"];
const FACILITIES = ["Parking", "Shower", "Locker", "Pro Shop", "Cafe", "WiFi", "AC", "Coaching", "Equipment Rental"];

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

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const [city, setCity] = useState(() => {
    const c = searchParams.get("city");
    return c && CITIES.includes(c) ? c : "All";
  });
  const [ratingMin, setRatingMin] = useState<number | null>(null);
  const [courtType, setCourtType] = useState<"INDOOR" | "OUTDOOR" | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const [sort, setSort] = useState<SortKey>("recommended");

  const { data: apiVenues, isLoading: isLoadingVenues, isError: isVenuesError } = useQuery({
    queryKey: ["venues", { q: debouncedSearch, city, ratingMin, courtType, facilities, priceMin, priceMax }],
    queryFn: () => getVenues({
      q: debouncedSearch,
      city,
      rating: ratingMin ?? undefined,
      type: courtType ?? undefined,
      facilities: facilities.length > 0 ? facilities : undefined,
      priceMin: priceMin ?? undefined,
      priceMax: priceMax ?? undefined,
    }),
  });

  const hasApiData = Boolean(apiVenues && apiVenues.length > 0);
  const isUsingFallback = isVenuesError || (apiVenues && apiVenues.length === 0);
  const apiError = isVenuesError ? "Could not reach the live venue API." : null;
  const shouldShowLoading = isLoadingVenues && !hasApiData && !apiVenues;
  const shouldShowApiError = Boolean(apiError) && !shouldShowLoading;
  const shouldShowFallback = isUsingFallback && !apiError && !shouldShowLoading;

  const filteredVenues = useMemo(() => {
    let list = apiVenues ?? [];
    
    if (isUsingFallback) {
      list = mockVenues.filter((venue) => {
        const matchesSearch = venue.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesCity = city === "All" || venue.city === city;
        const matchesRating = ratingMin === null || (venue.rating ?? 0) >= ratingMin;
        const matchesFacilities = facilities.length === 0 || facilities.every(f => venue.facilities.includes(f));
        const passMin = priceMin === null || (venue.priceFrom ?? 0) >= priceMin;
        const passMax = priceMax === null || (venue.priceFrom ?? 0) <= priceMax;
        return matchesSearch && matchesCity && matchesRating && matchesFacilities && passMin && passMax;
      });
    }

    const sorted = [...list];
    if (sort === "rating") {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "price") {
      sorted.sort((a, b) => {
        const pa = a.priceFrom ?? Number.POSITIVE_INFINITY;
        const pb = b.priceFrom ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    }
    return sorted;
  }, [apiVenues, isUsingFallback, debouncedSearch, city, ratingMin, facilities, priceMin, priceMax, sort]);

  const toggleFacility = (f: string) => {
    setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCity("All");
    setRatingMin(null);
    setCourtType(null);
    setFacilities([]);
    setPriceMin(null);
    setPriceMax(null);
  };

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <section className="border-b border-white/[0.06] pt-32 pb-10 md:pt-36 md:pb-12">
        <div className="container">
          <span className="section-label">All Venues</span>
          <h1 className="heading-1 mt-3 text-[#F7F7F7]">
            Find <span className="text-[#E6FA50]">Courts</span>
          </h1>
          <p className="body-lg mt-3 max-w-md text-[#F7F7F7]/60">
            Browse and book padel courts across Indonesia.
          </p>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <section className="sticky top-20 z-30 border-b border-white/[0.06] bg-[#06121A]/90 backdrop-blur-xl">
        <div className="container flex flex-col gap-4 py-4 lg:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search venues..."
                className="body w-full bg-transparent text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`label shrink-0 rounded-full px-4 py-2 uppercase transition-all duration-200 ${
                    city === c ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60"
                  }`}
                >{c}</button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-4 py-3 lg:w-56 shrink-0">
              <ArrowUpDown className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="body w-full appearance-none bg-transparent text-[#F7F7F7] outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0C1B26]">{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="caption text-[#F7F7F7]/40">Type:</span>
              <div className="flex gap-1.5">
                {[null, "INDOOR", "OUTDOOR"].map(t => (
                  <button key={t ?? "All"} onClick={() => setCourtType(t as any)} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors ${courtType === t ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"}`}>
                    {t === null ? "All" : t === "INDOOR" ? "Indoor" : "Outdoor"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="caption text-[#F7F7F7]/40">Rating:</span>
              <div className="flex gap-1.5">
                {[{l:"Any",v:null},{l:"4.0+",v:4.0},{l:"4.5+",v:4.5}].map(r => (
                  <button key={r.l} onClick={() => setRatingMin(r.v)} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors ${ratingMin === r.v ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"}`}>
                    {r.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="caption text-[#F7F7F7]/40">Price:</span>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => { setPriceMin(null); setPriceMax(null); }} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors ${priceMin === null && priceMax === null ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"}`}>Any</button>
                <button onClick={() => { setPriceMin(null); setPriceMax(100000); }} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors ${priceMin === null && priceMax === 100000 ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"}`}>Under Rp100K</button>
                <button onClick={() => { setPriceMin(100000); setPriceMax(200000); }} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors ${priceMin === 100000 && priceMax === 200000 ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"}`}>Rp100–200K</button>
                <button onClick={() => { setPriceMin(200000); setPriceMax(null); }} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors ${priceMin === 200000 && priceMax === null ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"}`}>Above Rp200K</button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full pt-1 lg:pt-0 lg:w-auto">
              <span className="caption text-[#F7F7F7]/40">Facilities:</span>
              <div className="flex gap-1.5 flex-wrap">
                {FACILITIES.map(f => (
                  <button key={f} onClick={() => toggleFacility(f)} className={`caption shrink-0 rounded-full px-3 py-1 transition-colors border ${facilities.includes(f) ? "bg-[#E6FA50]/10 border-[#E6FA50]/50 text-[#E6FA50]" : "border-white/[0.08] text-[#F7F7F7]/40 hover:border-white/[0.2]"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VENUE LISTINGS ─── */}
      <section className="py-section-sm">
        <div className="container">
          {shouldShowLoading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26]">
                  <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.04]" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.04]" />
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/[0.04]" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {shouldShowApiError && (
            <div className="body-sm mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200/80">
              {apiError} Showing demo venue data.
            </div>
          )}
          {shouldShowFallback && (
            <div className="body-sm mb-6 rounded-xl border border-[#E6FA50]/15 bg-[#E6FA50]/5 px-4 py-3 text-[#E6FA50]/70">
              Live API unavailable. Showing demo venue data.
            </div>
          )}

          {!shouldShowLoading && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="caption text-[#F7F7F7]/40">
                  {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"}
                  {city !== "All" ? ` in ${city}` : ""}
                </p>
                {(search || city !== "All" || ratingMin || courtType || facilities.length > 0 || priceMin || priceMax) && (
                  <button onClick={handleClearFilters} className="caption text-[#E6FA50] hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredVenues.map((venue, i) => {
                  const price = venue.priceFrom ?? 0;
                  const courtCount = venue.courtCount ?? 0;
                  const images = [IMG.venue1, IMG.venue2, IMG.venue3];

                  return (
                    <Link key={venue.id} href={`/venues/${venue.id}`} className="group block">
                      <article className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-200 group-hover:border-[#E6FA50]/15">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img src={images[i % images.length]} alt={venue.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                          {venue.isVerified && (
                            <span className="caption absolute left-3 top-3 rounded-full bg-[#E6FA50] px-2.5 py-0.5 uppercase text-[#06121A]">Verified</span>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2">
                            <Star className="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                            <span className="label text-[#E6FA50]">{venue.rating}</span>
                            <span className="caption text-[#F7F7F7]/25">({venue.reviewCount})</span>
                          </div>
                          <h3 className="heading-3 mt-2 text-[#F7F7F7]">{venue.name}</h3>
                          <p className="mt-1 flex items-center gap-1.5 caption text-[#F7F7F7]/25">
                            <MapPin className="h-3 w-3" />{venue.city}
                          </p>
                          <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
                            <span className="price text-[#50C8C8]">{price > 0 ? `Rp ${(price / 1000).toFixed(0)}K/hr` : "Pricing soon"}</span>
                            <span className="caption text-[#F7F7F7]/25">{courtCount} courts</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {filteredVenues.length === 0 && !shouldShowLoading && (
            <EmptyState icon={Search} title="No venues found" description="Try adjusting your search or filters." actionLabel="Clear filters" onAction={handleClearFilters} />
          )}
        </div>
      </section>
    </>
  );
}
