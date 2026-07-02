"use client";

import { Star, MapPin } from "lucide-react";
import { EmptyState } from "@/components/ui/error-state";

export function FeaturedVenueEmpty() {
  return (
    <EmptyState
      icon={Star}
      title="Featured venues coming soon"
      description="We're curating the best courts in Indonesia. Check back soon or explore everything available now."
      actionLabel="Browse All Venues"
      actionHref="/venues"
    />
  );
}

export function AllVenuesEmpty() {
  return (
    <EmptyState
      icon={MapPin}
      title="No venues yet"
      description="New courts are being added across Indonesia. Browse the full directory to see what's live."
      actionLabel="Browse All Venues"
      actionHref="/venues"
    />
  );
}
