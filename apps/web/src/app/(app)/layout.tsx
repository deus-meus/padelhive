import { Navbar } from "@/components/shared/navbar";
import { RequireAuth } from "@/components/auth/require-auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <Navbar />
      <main className="flex-1">{children}</main>
    </RequireAuth>
  );
}
