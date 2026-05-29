import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Providers } from "@/components/shared/providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Padelhive — Book Courts. Join Matches. Meet Players.",
  description:
    "Indonesia's padel community platform. Book premium courts, join open matches, invite friends, and connect with players across Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontSans.variable} ${fontHeading.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
