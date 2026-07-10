import type { Metadata, Viewport } from "next";
import { Amiri, Aref_Ruqaa, IBM_Plex_Sans_Arabic, Cairo } from "next/font/google";
import "./globals.css";

// Mobile-first viewport: notch-safe rendering + branded status bar on Android/iOS.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F2EA" },
    { media: "(prefers-color-scheme: dark)", color: "#0E3440" },
  ],
};

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "هبة الشريف — منصة التعلّم والتطوير",
    template: "%s | هبة الشريف",
  },
  description:
    "منصة هبة الشريف: دورات، كتب، ورش عمل، وجلسات فردية لرحلة تطوّر واعية.",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "هبة الشريف",
    title: "هبة الشريف — منصة التعلّم والتطوير",
    description: "دورات، كتب، ورش عمل، وجلسات فردية لرحلة تطوّر واعية.",
  },
  twitter: {
    card: "summary_large_image",
  },
  appleWebApp: {
    capable: true,
    title: "هبة الشريف",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${arefRuqaa.variable} ${plexArabic.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
