import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import GoogleTags from "@/components/analytics/GoogleTags";
import MetaPixel from "@/components/analytics/MetaPixel";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { BRAND, COMPANY_DESCRIPTION, DEFAULT_OG_IMAGE, LEGAL_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

// Defaults for every page. Public pages override title/description/canonical
// (and their full Open Graph + X card) through `pageMetadata` in lib/seo.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wellthyfy | Official Website",
    template: `%s | ${BRAND}`,
  },
  description: COMPANY_DESCRIPTION,
  applicationName: BRAND,
  authors: [{ name: LEGAL_NAME }],
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND,
    url: SITE_URL,
    title: "Wellthyfy | Official Website",
    description: COMPANY_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wellthyfy | Official Website",
    description: COMPANY_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#2E8B57",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <LoadingScreen />
        <AnimatedBackground />
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-navy-800 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ScrollToTop />
        <GoogleTags />
        <MetaPixel />
      </body>
    </html>
  );
}
