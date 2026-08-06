import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { WebSiteJSONLD, OrganizationJSONLD } from "../components/JSONLD";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.bylines.dev"),
  title: {
    default: "Bylines Journal — Independent Technical & Editorial Publishing",
    template: "%s | Bylines Journal",
  },
  description: "Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design.",
  keywords: [
    "bylines journal",
    "bylines dev",
    "bylines.dev",
    "systems engineering",
    "artificial intelligence",
    "modern design",
    "cybersecurity",
    "geopolitics",
    "neuroscience",
    "technical essays",
    "developer journalism",
    "tech publishing",
  ],
  authors: [{ name: "Bylines Editorial Board", url: "https://www.bylines.dev" }],
  creator: "Bylines Journal",
  publisher: "Bylines Media",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bylines.dev",
    siteName: "Bylines Journal",
    title: "Bylines Journal — Independent Technical & Editorial Publishing",
    description: "Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Bylines Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bylines Journal — Independent Technical & Editorial Publishing",
    description: "Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, cybersecurity, and design.",
    creator: "@bylines_dev",
    site: "@bylines_dev",
    images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  alternates: {
    canonical: "https://www.bylines.dev",
    types: {
      "application/rss+xml": "https://www.bylines.dev/feed.xml",
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
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
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Bylines.dev RSS Feed" href="https://bylines.dev/feed.xml" />
        <WebSiteJSONLD />
        <OrganizationJSONLD />
      </head>
      <body className="min-h-full flex flex-col bg-grid-dots">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  var preset = localStorage.getItem('selected_theme_preset') || 'default';
                  var root = document.documentElement;
                  var body = document.body;
                  if (theme === 'dark') {
                    root.classList.add('dark', 'dark-mode');
                    body.classList.add('dark', 'dark-mode');
                  } else {
                    root.classList.remove('dark', 'dark-mode');
                    body.classList.remove('dark', 'dark-mode');
                  }
                  if (preset !== 'default') {
                    body.classList.add('preset-' + preset);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <Script
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script id="swg-basic-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAowrbLMDA:openaccess",
                clientOptions: { theme: "light", lang: "en" },
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
