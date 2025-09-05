// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import ClientProviders from "./components/ClientProviders";
import { SpotifyPlayerProvider } from "./context/SpotifyContext";
import { StoriesProvider } from "./context/StoriesContext"; // ← import it

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !m-0 !pt-0 bg-zinc-950 overflow-x-clip text-zinc-50`}
      >
        <ClientProviders>
          <SpotifyPlayerProvider>
            <StoriesProvider> {/* ← wrap here */}
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </StoriesProvider>
          </SpotifyPlayerProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
