import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-provider";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "react-day-picker/style.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3d5a80" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Wagner Tool Management",
    template: "%s | Wagner Tools",
  },
  description: "Tool inventory and checkout management for Wagner Vehicle Management Limited",
  applicationName: "Wagner Tools",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wagner Tools",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/wagner-logo.png",
    apple: "/wagner-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConvexClientProvider>
            <PwaProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </PwaProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
