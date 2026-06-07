import Link from "next/link";

export default function InvitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#06121A]/90 backdrop-blur-xl">
        <div className="container flex h-20 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold tracking-[-0.02em] text-[#F7F7F7]">
              Padel<span className="text-[#E6FA50]">hive</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
