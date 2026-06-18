"use client";

import Link from "next/link";
import { formatBookingDate } from "@/lib/format";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Shield,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  Wind,
  ShowerHead,
  Lock,
  Navigation,
} from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { padelImg } from "@/lib/images";
import { getVenue, getVenueCourts, getVenueReviews, ApiRequestError } from "@/lib/api";
import { EmptyState, ErrorBanner } from "@/components/ui/error-state";
import { Court, Venue } from "@/types";

const IMG = {
  gallery: [
    padelImg(1200, 85),
    padelImg(600),
    padelImg(600),
    padelImg(600),
  ],
};

const TIME_SLOTS = [
  { time: "06:00", available: true, peak: false },
  { time: "07:00", available: true, peak: false },
  { time: "08:00", available: false, peak: false },
  { time: "09:00", available: false, peak: true },
  { time: "10:00", available: true, peak: true },
  { time: "11:00", available: true, peak: true },
  { time: "12:00", available: true, peak: false },
  { time: "13:00", available: false, peak: false },
  { time: "14:00", available: true, peak: false },
  { time: "15:00", available: true, peak: false },
  { time: "16:00", available: false, peak: true },
  { time: "17:00", available: false, peak: true },
  { time: "18:00", available: true, peak: true },
  { time: "19:00", available: true, peak: true },
  { time: "20:00", available: true, peak: true },
  { time: "21:00", available: false, peak: true },
];

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  Parking: <Car className="h-3.5 w-3.5" />,
  Shower: <ShowerHead className="h-3.5 w-3.5" />,
  Locker: <Lock className="h-3.5 w-3.5" />,
  "Pro Shop": <Dumbbell className="h-3.5 w-3.5" />,
  Cafe: <Coffee className="h-3.5 w-3.5" />,
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  AC: <Wind className="h-3.5 w-3.5" />,
  Coaching: <Users className="h-3.5 w-3.5" />,
  "Equipment Rental": <Dumbbell className="h-3.5 w-3.5" />,
};

export default function VenueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const fallbackVenue = mockVenues.find((v) => v.id === params.id);
  const { data: apiVenue, isLoading: isLoadingVenue, isError: isVenueError, error: venueError, refetch: refetchVenue, isFetching: isFetchingVenue } = useQuery({
    queryKey: queryKeys.venues.detail(params.id),
    queryFn: () => getVenue(params.id),
  });

  const { data: apiCourts, isLoading: isLoadingCourts, isError: isCourtsError, refetch: refetchCourts } = useQuery({
    queryKey: queryKeys.venues.courts(params.id),
    queryFn: () => getVenueCourts(params.id),
  });

  const { data: reviews, isLoading: isLoadingReviews, isError: isReviewsError, refetch: refetchReviews, isFetching: isFetchingReviews } = useQuery({
    queryKey: queryKeys.reviews.venue(params.id),
    queryFn: () => getVenueReviews(params.id),
  });

  const venue = apiVenue ?? fallbackVenue ?? null;
  const fallbackCourts = useMemo(() => fallbackVenue ? mockCourts.filter((c) => c.venueId === fallbackVenue.id) : [], [fallbackVenue]);
  const courts = apiCourts && apiCourts.length > 0 ? apiCourts : fallbackCourts;

  const isLoading = isLoadingVenue || isLoadingCourts;
  const isUsingFallback = isVenueError || (!apiVenue && Boolean(fallbackVenue));
  const apiError = isVenueError || isCourtsError ? "Could not reach the live venue API." : null;

  const minPrice = useMemo(() => (courts.length ? Math.min(...courts.map((c) => c.pricing.weekdayOffPeak)) : 0), [courts]);
  const maxPrice = useMemo(() => (courts.length ? Math.max(...courts.map((c) => c.pricing.weekendPeak)) : 0), [courts]);

  if (isLoading && !venue) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
            <div className="col-span-2 md:row-span-2 h-[240px] md:h-full rounded-2xl animate-pulse bg-white/[0.04]" />
            <div className="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]" />
            <div className="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]" />
            <div className="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]" />
          </div>
          <div className="mt-8 space-y-4">
            <div className="h-7 w-2/3 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 space-y-3">
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const venueNotFound =
    venueError && venueError instanceof ApiRequestError && venueError.status === 404;

  if (!venue && isVenueError && !venueNotFound) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container py-12">
          <ErrorBanner
            title="Couldn't load this venue"
            description="We couldn't reach the server. Check your connection and try again."
            onRetry={() => {
              refetchVenue();
              refetchCourts();
            }}
            isRetrying={isFetchingVenue}
          />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container py-16 text-center">
          <EmptyState icon={MapPin} title="Venue not found" description="This venue is unavailable or no longer listed." actionLabel="Back to venues" actionHref="/venues" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {(isLoading || isUsingFallback || apiError) && (
        <section className="container pt-6">
          <div className={`rounded-xl border px-4 py-3 text-sm ${apiError && !isLoading ? "border-red-500/20 bg-red-500/10 text-red-200/80" : "border-white/[0.06] bg-white/[0.03] text-[#F7F7F7]/40"}`}>
            {isLoading ? "Loading live venue data..." : apiError ? `${apiError} Showing demo venue data.` : "Live API unavailable. Showing demo venue data."}
          </div>
        </section>
      )}
      {/* ─── IMAGE GALLERY ─── */}
      <section className="container pt-8 pb-10">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
          <div className="relative col-span-2 md:row-span-2">
            <div className="h-[240px] overflow-hidden rounded-2xl md:h-full">
              <img
                src={IMG.gallery[0]}
                alt={venue.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-white/90">
                1 / {IMG.gallery.length}
              </span>
            </div>
          </div>
          {IMG.gallery.slice(1).map((src, i) => (
            <div key={i} className={`${i === 0 ? "block" : "hidden md:block"}`}>
              <div className="h-[116px] overflow-hidden rounded-2xl md:h-[200px]">
                <img
                  src={src}
                  alt={`${venue.name} ${i + 2}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="container pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          {/* Left — venue info */}
          <div>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
                    {venue.name}
                  </h1>
                  {venue.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-[#E6FA50] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#06121A]">
                      <Shield className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/40">
                  <MapPin className="h-3.5 w-3.5" />
                  {venue.location} · {venue.city}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" />
                <span className="label font-semibold text-[#E6FA50]">
                  {venue.rating}
                </span>
                <span className="caption text-[#F7F7F7]/25">
                  ({venue.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="mt-6 text-sm font-light leading-relaxed text-[#F7F7F7]/60">
              {venue.description}
            </p>

            {/* Operating hours */}
            <div className="mt-6 flex items-center gap-2 caption text-[#F7F7F7]/40">
              <Clock className="h-3.5 w-3.5" />
              Open daily {venue.operatingHours.open} –{" "}
              {venue.operatingHours.close}
            </div>

            {/* Facilities */}
            <div className="mt-10">
              <h2 className="heading-2 text-lg text-[#F7F7F7]">Facilities</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {venue.facilities.map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-4 py-3"
                  >
                    <span className="text-[#50C8C8]">
                      {FACILITY_ICONS[facility] ?? (
                        <Dumbbell className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="caption text-[#F7F7F7]/60">
                      {facility}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courts & Pricing */}
            <div className="mt-10">
              <h2 className="heading-2 text-lg text-[#F7F7F7]">
                Courts & Pricing
              </h2>
              <div className="mt-4 space-y-3">
                {courts.map((court) => (
                  <div
                    key={court.id}
                    className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="heading-3 text-sm text-[#F7F7F7]">
                          {court.name}
                        </p>
                        <p className="caption mt-0.5 text-[#F7F7F7]/25">
                          {court.type} court
                        </p>
                      </div>
                      <div className="rounded-lg bg-[#50C8C8]/10 px-3 py-1">
                        <p className="text-[11px] font-medium text-[#50C8C8]">
                          From Rp{" "}
                          {(court.pricing.weekdayOffPeak / 1000).toFixed(0)}K/hr
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="flex flex-col justify-center rounded-lg bg-white/[0.02] px-4 py-3 text-center">
                        <p className="whitespace-nowrap text-[11px] text-[#F7F7F7]/40">
                          Weekday Off-Peak
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#F7F7F7]/70">
                          Rp {(court.pricing.weekdayOffPeak / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="flex flex-col justify-center rounded-lg bg-white/[0.02] px-4 py-3 text-center">
                        <p className="whitespace-nowrap text-[11px] text-[#F7F7F7]/40">
                          Weekday Peak
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#F7F7F7]/70">
                          Rp {(court.pricing.weekdayPeak / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="flex flex-col justify-center rounded-lg bg-white/[0.02] px-4 py-3 text-center">
                        <p className="whitespace-nowrap text-[11px] text-[#F7F7F7]/40">
                          Weekend Off-Peak
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#F7F7F7]/70">
                          Rp {(court.pricing.weekendOffPeak / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="flex flex-col justify-center rounded-lg bg-[#E6FA50]/5 px-4 py-3 text-center">
                        <p className="whitespace-nowrap text-[11px] text-[#E6FA50]/60">
                          Weekend Peak
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#E6FA50]/80">
                          Rp {(court.pricing.weekendPeak / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-[#F7F7F7]/25">
                Peak hours: 09:00–11:00 & 16:00–21:00. Prices include court
                rental only.
              </p>
            </div>

            {/* Availability */}
            <div className="mt-10">
              <h2 className="heading-2 text-lg text-[#F7F7F7]">
                Today&apos;s Availability
              </h2>
              <p className="caption mt-1 text-[#F7F7F7]/25">
                {courts[0]?.name ?? "Court A"} ·{" "}
                {formatBookingDate(new Date())}
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    className={`rounded-lg py-2.5 text-center text-[11px] font-medium transition-all ${
                      !slot.available
                        ? "bg-white/[0.02] text-[#F7F7F7]/15 cursor-not-allowed"
                        : slot.peak
                          ? "border border-[#E6FA50]/20 bg-[#E6FA50]/5 text-[#E6FA50]/70 hover:border-[#E6FA50]/40 hover:text-[#E6FA50]"
                          : "border border-white/[0.08] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-[#50C8C8]/30 hover:text-[#50C8C8]"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-[#0C1B26]" />
                  <span className="text-[10px] text-[#F7F7F7]/25">
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-[#E6FA50]/20 bg-[#E6FA50]/5" />
                  <span className="text-[10px] text-[#F7F7F7]/25">
                    Peak Hour
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-white/[0.02]" />
                  <span className="text-[10px] text-[#F7F7F7]/25">Booked</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mt-10">
              <h2 className="heading-2 text-lg text-[#F7F7F7]">Location</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
                <div className="flex h-[200px] items-center justify-center bg-[#0C1B26]">
                  <div className="text-center">
                    <Navigation className="mx-auto h-8 w-8 text-[#50C8C8]/40" />
                    <p className="mt-3 text-sm text-[#F7F7F7]/40">
                      {venue.location}
                    </p>
                    <p className="mt-1 text-xs text-[#F7F7F7]/25">
                      {venue.city}, Indonesia
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${venue.location}, ${venue.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#50C8C8] hover:text-[#50C8C8]/80"
              >
                <MapPin className="h-3 w-3" />
                Open in Google Maps
              </a>
            </div>

            {/* Refund Policy */}
            <div className="mt-10">
              <h2 className="heading-2 text-lg text-[#F7F7F7]">
                Refund Policy
              </h2>
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-green-400" />
                    <div>
                      <p className="text-sm text-[#F7F7F7]/60">
                        Full refund if cancelled more than 24 hours before
                        booking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-yellow-400" />
                    <div>
                      <p className="text-sm text-[#F7F7F7]/60">
                        50% refund if cancelled 12–24 hours before booking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-red-400" />
                    <div>
                      <p className="text-sm text-[#F7F7F7]/60">
                        Non-refundable if cancelled less than 12 hours before
                        booking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-10">
              <h2 className="heading-2 text-lg text-[#F7F7F7]">Reviews</h2>
              {isLoadingReviews ? (
                <div className="mt-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5 space-y-3">
                      <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/[0.04]" />
                      <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/[0.04]" />
                    </div>
                  ))}
                </div>
              ) : isReviewsError ? (
                <div className="mt-4">
                  <ErrorBanner title="Couldn't load reviews" onRetry={() => refetchReviews()} isRetrying={isFetchingReviews} />
                </div>
              ) : !reviews || reviews.length === 0 ? (
                <div className="mt-4">
                  <EmptyState icon={Star} title="No reviews yet" description="Be the first to review this venue after your visit." />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
                      <div className="flex items-center justify-between">
                        <p className="heading-3 text-sm text-[#F7F7F7]">{review.authorName}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? "fill-[#E6FA50] text-[#E6FA50]" : "text-[#F7F7F7]/15"}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm font-light leading-relaxed text-[#F7F7F7]/60">{review.comment}</p>
                      )}
                      <p className="caption mt-2 text-[#F7F7F7]/25">{formatBookingDate(review.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — booking sidebar (sticky) */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="price text-2xl text-[#F7F7F7]">
                      {minPrice > 0 ? `Rp ${(minPrice / 1000).toFixed(0)}K` : "Pricing soon"}
                    </p>
                    <p className="caption mt-0.5 text-[#F7F7F7]/25">
                      per hour, starting from
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="caption text-[#F7F7F7]/25">Date</p>
                    <p className="heading-3 mt-1 text-sm text-[#F7F7F7]">
                      Today
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="caption text-[#F7F7F7]/25">Start</p>
                      <p className="heading-3 mt-1 text-sm text-[#F7F7F7]">
                        10:00
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="caption text-[#F7F7F7]/25">End</p>
                      <p className="heading-3 mt-1 text-sm text-[#F7F7F7]">
                        11:00
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="caption text-[#F7F7F7]/25">Court</p>
                    <p className="heading-3 mt-1 text-sm text-[#F7F7F7]">
                      {courts[0]?.name ?? "Court A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <p className="caption text-[#F7F7F7]/40">Total</p>
                  <p className="price text-xl text-[#F7F7F7]">
                    {minPrice > 0 ? `Rp ${(minPrice / 1000).toFixed(0)}K` : "Pricing soon"}
                  </p>
                </div>

                <Link
                  href={`/venues/${venue.id}/book`}
                  className="btn-lime mt-6 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                  Book Court
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 caption text-[#F7F7F7]/25">
                  <Users className="h-3 w-3" />
                  <span>Invite friends & split payment after booking</span>
                </div>
              </div>

              {/* Quick info */}
              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="caption text-[#F7F7F7]/25">Courts</span>
                    <span className="label text-[#F7F7F7]/60">
                      {courts.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="caption text-[#F7F7F7]/25">
                      Price range
                    </span>
                    <span className="label text-[#F7F7F7]/60">
                      {minPrice > 0 && maxPrice > 0 ? `Rp ${(minPrice / 1000).toFixed(0)}K – ${(maxPrice / 1000).toFixed(0)}K` : "Pricing soon"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="caption text-[#F7F7F7]/25">Hours</span>
                    <span className="label text-[#F7F7F7]/60">
                      {venue.operatingHours.open} – {venue.operatingHours.close}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="caption text-[#F7F7F7]/25">Rating</span>
                    <span className="label text-[#E6FA50]">
                      {venue.rating}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="caption text-[#F7F7F7]/25">Refund</span>
                    <span className="label text-[#F7F7F7]/60">
                      Free cancel &gt;24h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
