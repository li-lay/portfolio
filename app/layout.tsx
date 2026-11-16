import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Statusline from "@/components/UI/Statusline";
import TabTitle from "@/components/UI/TabTitle";
import CommandPaletteLauncher from "@/components/UI/CommandPaletteLauncher";
import HelpLauncher from "@/components/UI/HelpLauncher";
import KeyboardNav from "@/components/UI/KeyboardNav";
import KonamiTheme from "@/components/UI/KonamiTheme";
import PaneDrag from "@/components/UI/PaneDrag";
import { profile } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
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
