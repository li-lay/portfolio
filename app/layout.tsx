import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Statusline from "@/components/UI/Statusline";
import TabTitle from "@/components/UI/TabTitle";
import CommandPaletteLauncher from "@/components/UI/CommandPaletteLauncher";
import HelpLauncher from "@/components/UI/HelpLauncher";
import KeyboardNav from "@/components/UI/KeyboardNav";
import KonamiTheme from "@/components/UI/KonamiTheme";
import PaneDrag from "@/components/UI/PaneDrag";
import { profile } from "@/lib/content";

// `font-sans` only appears in the /projects and /contact prose panes, but
// next/font preloads per-route regardless, so `/` paid 29 KB of preload for a
// face it never paints. Landing text is mono or Patua; the doc still ships for
// the routes that need it, just off the critical path.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

// Iosevka ships ~24k glyphs upstream, so the file in assets/fonts/iosevka/
// is a subset (see the README in public/fonts/iosevka/). Weight 400 only:
// nothing in the UI uses mono bold, and the browser may synthesise it.
const iosevka = localFont({
  src: [
    {
      path: "../assets/fonts/iosevka/iosevka-regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-iosevka",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

// Display face for the h1s, i.e. the LCP element on `/`. Previously a 34 KB
// TTF declared in CSS, so the browser only discovered it after the stylesheet
// parsed and re-painted the h1 on swap. As a woff2 subset (12 KB, Latin +
// punctuation) through next/font it gets hashed, preloaded and swapped early.
const patuaOne = localFont({
  src: [
    {
      path: "../assets/fonts/patua/patua-one-regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-patua-one",
  display: "swap",
  preload: true,
  fallback: ["serif"],
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: "#1d2021",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lilay.dev"),
  title: "LILAY",
  description: profile.summary,
  keywords: [
    "Lilay",
    "portfolio",
    "DevOps",
    "Linux",
    "homelab",
    "open source",
    "computer science",
    "Cambodia",
  ],
  openGraph: {
    type: "website",
    url: "https://lilay.dev/",
    title: "LILAY",
    description: profile.summary,
    locale: "en_US",
    siteName: "Lilay's Portfolio",
    images: [
      {
        url: "/images/pf.jpg",
        width: 640,
        height: 640,
        alt: "Portrait of Lilay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ImLiLay",
    creator: "@ImLiLay",
    images: ["/images/pf.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${iosevka.variable} ${patuaOne.variable}`}
    >
      <body className="antialiased">
        <TabTitle />
        <KonamiTheme />
        <PaneDrag />
        <KeyboardNav />
        <CommandPaletteLauncher />
        <HelpLauncher />
        <a
          href="#main-content"
          className="sr-only rounded-pane border-2 border-bg3 bg-bg1 px-3 py-2 font-mono text-sm text-fg0 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:text-yellow"
        >
          $ skip to content
        </a>
        <Statusline />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1400px] px-4 pb-10 md:px-6"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
