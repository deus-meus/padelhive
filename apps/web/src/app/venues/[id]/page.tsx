import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenue, getVenueCourts } from "@/lib/api";
import VenueDetailClient from "./client";

export const revalidate = 60;

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }) {
  try {
    const venue = await getVenue(params.id);
    return {
      title: `${venue.name} | PadelHive`,
      description: venue.description,
    };
  } catch (error) {
    return {
      title: "Venue | PadelHive",
    };
  }
}

export default async function VenueDetailPage({ params }: { params: Params }) {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.venues.detail(params.id),
      queryFn: () => getVenue(params.id),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.venues.courts(params.id),
      queryFn: () => getVenueCourts(params.id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VenueDetailClient params={params} />
    </HydrationBoundary>
  );
}
