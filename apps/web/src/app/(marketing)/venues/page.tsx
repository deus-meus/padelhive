import { Suspense } from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenues } from "@/lib/api";
import VenuesClient from "./client";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

export const metadata = {
  title: "Venues | PadelHive",
  description: "Find and book padel courts across Indonesia.",
};

export default async function VenuesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.venues.all(),
    queryFn: () => getVenues({ revalidate: 60 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<VenuesSkeleton />}>
        <VenuesClient />
      </Suspense>
    </HydrationBoundary>
  );
}

function VenuesSkeleton() {
  return (
    <>
      <section className="border-b border-white/[0.06] pt-32 pb-10 md:pt-36 md:pb-12">
        <div className="container">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="mt-3 h-12 w-64 rounded" />
          <Skeleton className="mt-3 h-6 w-80 rounded" />
        </div>
      </section>

      <section className="sticky top-20 z-30 border-b border-white/[0.06] bg-[#06121A]/90 backdrop-blur-xl">
        <div className="container flex flex-col gap-3 py-4 lg:flex-row lg:items-center">
          <Skeleton className="h-[46px] flex-1 rounded-xl" />
          <div className="flex gap-2 overflow-x-auto">
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
          </div>
          <Skeleton className="h-[46px] w-full lg:w-56 rounded-xl" />
        </div>
      </section>

      <section className="py-section-sm">
        <div className="container">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26]">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
