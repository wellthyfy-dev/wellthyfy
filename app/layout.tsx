import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MetaPixel from "@/components/analytics/MetaPixel";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { siteConfig } from "@/lib/site";
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

const description =
  "Wellthyfy Lifestyle Ventures empowers individuals through wellness programs, financial education, skill development, community growth, and professional courses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Wellthyfy Lifestyle Ventures | Empowering Health, Wealth & Happiness",
    template: "%s | Wellthyfy Lifestyle Ventures",
  },
  description,
  applicationName: siteConfig.name,
  keywords: [
    "Wellthyfy",
    "lifestyle company Puducherry",
    "holistic wellness programs",
    "yoga instructor course",
    "basic beautician course",
    "digital marketing course",
    "financial literacy training",
    "skill development Puducherry",
    "community empowerment",
    "health wealth happiness",
  ],
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  alternates: { canonical: "/" },
  category: "Health & Wellness",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Wellthyfy Lifestyle Ventures | Empowering Health, Wealth & Happiness",
    description,
    images: [
      {
        url: "/logo-full.png",
        width: 900,
        height: 882,
        alt: "Wellthyfy Lifestyle Ventures — Empowering Health, Wealth & Happiness",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wellthyfy Lifestyle Ventures | Empowering Health, Wealth & Happiness",
    description,
    images: ["/logo-full.png"],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.legalName,
  alternateName: "Wellthyfy",
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo-full.png`,
  description,
  slogan: siteConfig.tagline,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "No.34, First Floor, Kasthuribai Nagar",
    addressLocality: "Puducherry",
    postalCode: "605009",
    addressCountry: "IN",
  },
  areaServed: "IN",
  knowsAbout: [
    "Holistic wellness",
    "Yoga",
    "Financial literacy",
    "Skill development",
    "Community empowerment",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        <GoogleAnalytics />
        <MetaPixel />
      </body>
    </html>
  );
}
