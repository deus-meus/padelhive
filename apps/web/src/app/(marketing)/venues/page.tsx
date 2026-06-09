import { Suspense } from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenues } from "@/lib/api";
import VenuesClient from "./client";

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
      <Suspense fallback={null}>
        <VenuesClient />
      </Suspense>
    </HydrationBoundary>
  );
}
