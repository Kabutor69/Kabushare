import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kabushare - Minimal & Secure Temporary File Sharing",
  description: "Share files securely with auto-expiring links. Files are automatically deleted after 48 hours. Minimal, fast, and private.",
  keywords: ["file sharing", "temporary storage", "secure upload", "privacy", "minimalist app"],
  authors: [{ name: "Kabushare" }],
  creator: "Kabushare",
  publisher: "Kabushare",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kabushare.vercel.app",
    title: "Kabushare - Minimal & Secure Temporary File Sharing",
    description: "Share files securely with auto-expiring links. Files are automatically deleted after 48 hours.",
    siteName: "Kabushare",
    images: ["/card.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kabushare - Minimal & Secure Temporary File Sharing",
    description: "Share files securely with auto-expiring links. Files are automatically deleted after 48 hours.",
    images: ["/card.png"],
  },
  verification: {
    google: "Q2d_2g4XEV5pIiAAxAEDIvhDvj6-4BihRRx9EcNKkDk",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

