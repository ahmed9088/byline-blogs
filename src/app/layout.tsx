import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { WebSiteJSONLD } from "../components/JSONLD";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "https://bylines.dev")
  ),
  title: {
    default: "Bylines.dev — Independent Technical & Editorial Publishing",
    template: "%s | Bylines.dev",
  },
  description: "Expert-driven engineering papers, technical journalism, and research reports covering systems architecture, AI models, neuroscience, cybersecurity, and modern design.",
  keywords: [
    "bylines dev",
    "systems engineering",
    "artificial intelligence",
    "modern design",
    "cybersecurity",
    "geopolitics",
    "neuroscience",
    "technical essays",
    "developer journalism",
  ],
  authors: [{ name: "Bylines.dev Editorial Board", url: "https://bylines.dev" }],
  creator: "Bylines.dev Journal",
  publisher: "Bylines.dev Media",
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
    url: "https://bylines.dev",
    siteName: "Bylines.dev Journal",
    title: "Bylines.dev — Independent Technical & Editorial Publishing",
    description: "Expert-driven engineering papers, technical journalism, and research reports covering systems engineering, AI, science, and design.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Bylines.dev Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bylines.dev — Independent Technical & Editorial Publishing",
    description: "Expert-driven engineering papers, technical journalism, and research reports covering systems engineering, AI, science, and design.",
    creator: "@bylines_dev",
    site: "@bylines_dev",
    images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  alternates: {
    canonical: "https://bylines.dev",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
        <link rel="preconnect" href="https://images.unsplash.com" />
        <WebSiteJSONLD />
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
      </body>
    </html>
  );
}
