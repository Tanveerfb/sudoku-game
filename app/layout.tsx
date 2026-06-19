import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Toaster } from "@/components/ui/sonner";
import { ActivityLog } from "@/components/ActivityLog";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  title: "Sudoku",
  description: "A classic Sudoku puzzle game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sudoku",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Navigation header */}
          <header className="w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <nav className="mx-auto flex items-center justify-between px-4 py-3 max-w-lg">
              <Link
                href="/"
                className="text-lg font-bold text-gray-900 tracking-tight hover:text-gray-700 transition-colors dark:text-gray-100 dark:hover:text-gray-300"
              >
                Sudoku
              </Link>
              <div className="flex items-center gap-4">
                <ActivityLog />
                <Link
                  href="/leaderboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Leaderboard
                </Link>
                <ThemeToggle />
              </div>
            </nav>
          </header>

          {children}
          <Toaster position="top-center" richColors />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
