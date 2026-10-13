import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RRMS — Resource Reservation Management System",
    template: "%s | RRMS",
  },
  description:
    "PrimeWave Lab's centralized platform for managing and reserving shared organizational resources — meeting rooms, lab hardware, and equipment.",
  keywords: ["resource reservation", "booking system", "RRMS", "PrimeWave Lab"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
