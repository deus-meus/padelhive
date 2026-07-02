"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MapPin, Star, Search, ArrowUpDown } from "lucide-react";
import { padelImg } from "@/lib/images";
import { getVenues } from "@/lib/api";
import { EmptyState, ErrorBanner } from "@/components/ui/error-state";
import { FilterSelect, FilterMultiSelect } from "@/components/ui/filter-select";

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

  const { data: apiVenues, isLoading: isLoadingVenues, isError: isVenuesError, isFetching } = useQuery({
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
    placeholderData: keepPreviousData,
  });

  const hasApiData = Boolean(apiVenues && apiVenues.length > 0);
  const shouldShowLoading = isLoadingVenues && !hasApiData && !apiVenues;

  const filteredVenues = useMemo(() => {
    const list = apiVenues ?? [];
    
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
  }, [apiVenues, sort]);

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

            <div className="shrink-0 lg:w-56 flex justify-end">
              <FilterSelect
                icon={ArrowUpDown}
                value={sort}
                options={SORTS}
                onChange={(v) => setSort(v as SortKey)}
                alignRight
                className="w-full lg:w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <FilterSelect
              value={courtType ?? "all"}
              onChange={(v) => setCourtType(v === "all" ? null : (v as "INDOOR" | "OUTDOOR"))}
              active={courtType !== null}
              options={[
                { value: "all", label: "All types" },
                { value: "INDOOR", label: "Indoor" },
                { value: "OUTDOOR", label: "Outdoor" },
              ]}
            />
            <FilterSelect
              value={ratingMin === null ? "all" : String(ratingMin)}
              onChange={(v) => setRatingMin(v === "all" ? null : Number(v))}
              active={ratingMin !== null}
              options={[
                { value: "all", label: "All ratings" },
                { value: "4", label: "4.0+" },
                { value: "4.5", label: "4.5+" },
              ]}
            />
            <FilterSelect
              value={priceMin === null && priceMax === null ? "all" : priceMax === 100000 ? "u100" : priceMin === 100000 ? "100-200" : "200"}
              onChange={(v) => {
                if (v === "all") { setPriceMin(null); setPriceMax(null); }
                else if (v === "u100") { setPriceMin(null); setPriceMax(100000); }
                else if (v === "100-200") { setPriceMin(100000); setPriceMax(200000); }
                else if (v === "200") { setPriceMin(200000); setPriceMax(null); }
              }}
              active={priceMin !== null || priceMax !== null}
              options={[
                { value: "all", label: "All prices" },
                { value: "u100", label: "Under Rp100K" },
                { value: "100-200", label: "Rp100–200K" },
                { value: "200", label: "Above Rp200K" },
              ]}
            />
            <FilterMultiSelect
              label="Facilities"
              options={FACILITIES}
              selected={facilities}
              onToggle={toggleFacility}
              onClear={() => setFacilities([])}
            />
            {(search || city !== "All" || ratingMin !== null || courtType !== null || facilities.length > 0 || priceMin !== null || priceMax !== null) && (
               <button onClick={handleClearFilters} className="caption text-[#E6FA50] hover:underline px-3 h-10 flex items-center">
                 Clear all filters
               </button>
            )}
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
          {isVenuesError && !shouldShowLoading && (
            <div className="mb-6">
              <ErrorBanner
                title="Couldn't load venues"
                description="An error occurred while fetching venues. Please try again later."
              />
            </div>
          )}

          {!shouldShowLoading && (
            <>
              <p className="caption mb-6 text-[#F7F7F7]/40">
                {filteredVenues.length} {filteredVenues.length === 1 ? "venue" : "venues"}
                {city !== "All" ? ` in ${city}` : ""}
              </p>

              <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300 ${isFetching ? "opacity-60" : "opacity-100"}`}>
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
            <EmptyState icon={Search} title="No venues found" description="Try adjusting your search or filters." actionLabel="Browse all venues" actionHref="/venues" />
          )}
        </div>
      </section>
    </>
  );
}
