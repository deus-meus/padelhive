export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col justify-center min-h-[100dvh]">
      {children}
    </main>
  );
}
