import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ClassProvider } from "@/hooks/useClasses";
import { ScoreProvider } from "@/hooks/useScore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StenoMaster",
  description: "SAAS platform for stenography students and typing tests.",
  icons: "/logo.png",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ClassProvider>
              <ScoreProvider>
                <Toaster />
                <Sonner />
                {children}
              </ScoreProvider>
            </ClassProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
