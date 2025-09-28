"use client";

import { useEffect } from "react";
import { registerPush } from "./lib/push"; // adjust the path if needed
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import ClientProviders from "./components/ClientProviders";
import { StoriesProvider } from "./context/StoriesContext";
import { AlertProvider } from "./context/AlertContext";
import { ApplePlayerProvider } from "./context/ApplePlayerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trasora",
  description: "Your Social Music Playground",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      registerPush();
    }
  }, []);

  return (
    <html lang="en" className="h-full bg-zinc-950">
      <head>
        {/* ...all your existing head content */}
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full text-zinc-50`}
      >
        <ClientProviders>
          <ApplePlayerProvider>
            <StoriesProvider>
              <AlertProvider>
                <div className="flex flex-col min-h-screen bg-zinc-950">
                  <Navbar />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
              </AlertProvider>
            </StoriesProvider>
          </ApplePlayerProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
