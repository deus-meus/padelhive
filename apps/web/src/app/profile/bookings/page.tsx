import { redirect } from "next/navigation";

export default function ProfileBookingsRedirect() {
  redirect("/bookings");
}
