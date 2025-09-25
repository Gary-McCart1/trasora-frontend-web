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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-zinc-950">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* iOS splash screens */}
        {/* <link
          rel="apple-touch-startup-image"
          href="/icons/iphone-splash.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/ipad-splash.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        /> */}

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <style>{`
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #18181B; /* bg-zinc-950 */
          }
          input, select, textarea, button {
            font-size: 16px;
          }
        `}</style>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-x-clip text-zinc-50`}
      >
        <ClientProviders>
          <ApplePlayerProvider>
            <StoriesProvider>
              <AlertProvider>
                {/* Full height flex container */}
                <div className="flex flex-col min-h-full bg-zinc-950">
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
