"use client";
import Link from "next/link";
import { trackEvent } from "../lib/analytics";
import { getTrackingData } from "../utils/getTrackingData";


const DemoPage = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-zinc-200 px-6 md:px-12 py-16 flex flex-col items-center relative overflow-hidden">
      {/* soft purple glow background (matches hero style) */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20 blur-3xl pointer-events-none" />

      {/* Title section */}
      <div className="relative z-10 text-center max-w-3xl mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          See{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Trasora
          </span>{" "}
          in action
        </h1>

        <p className="text-zinc-300 text-lg md:text-xl">
          Watch how you can share music, discover new tracks, and connect with
          others in a social music experience.
        </p>
      </div>

      {/* Video container */}
      <div className="relative z-10 w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-zinc-800 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/KeeL2OHnpFM?rel=0&modestbranding=1"
          title="Trasora Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* CTA section */}
      <div className="relative z-10 mt-12 flex flex-col items-center gap-6 text-center">
        {/* Buttons */}
        {/* CTA section */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-6 text-center">
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Primary CTA */}
            <Link
              href="/signup"
              onClick={() =>
                trackEvent("click_continue_web", {
                  location: "demo-page",
                  ...getTrackingData()
                })
              }
              className="px-10 py-4 rounded-xl bg-purple-600 text-white font-semibold 
      shadow-lg shadow-purple-500/20 
      hover:bg-purple-500 hover:shadow-purple-500/40 
      transition-all duration-200 active:scale-95"
            >
              Get Started Free
            </Link>

            {/* Secondary CTA (App Store) */}
            <a
              href="https://apps.apple.com/us/app/trasora/id6753359214"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("click_app_store", {
                  location: "demo-page",
                  ...getTrackingData()
                })
              }
              className="px-8 py-4 rounded-xl border border-zinc-700 
      bg-zinc-900 text-zinc-300 font-semibold 
      flex items-center gap-3 
      hover:bg-zinc-800 hover:text-white hover:border-zinc-600
      transition-all duration-200"
            >
              {/* Apple Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16.365 1.43c0 1.14-.464 2.222-1.288 3.046-.854.854-2.23 1.512-3.446 1.412-.154-1.14.464-2.345 1.258-3.139.854-.854 2.345-1.482 3.476-1.319zm3.225 16.873c-.62 1.43-1.38 2.844-2.59 2.874-1.2.03-1.586-.72-2.96-.72-1.374 0-1.8.69-2.96.75-1.18.06-2.08-1.5-2.7-2.93-1.35-3.06-2.38-8.63.99-10.9 1.67-1.14 3.5-.93 4.6-.36 1.15.57 2.2.54 3.7 0 1.42-.57 3.06-.41 4.3.33-3.77 2.29-3.16 7.73.56 10.95z" />
              </svg>
              Download App
            </a>
          </div>

          {/* Back (separate row = cleaner hierarchy) */}
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 
    hover:text-white transition-colors"
          >
            <span className="text-purple-400">←</span>
            Back
          </Link>
        </div>

        {/* Subtext */}
        <p className="text-sm text-zinc-500">
          No credit card required • Free to join
        </p>
      </div>

      {/* bottom glow */}
      <div className="absolute -bottom-20 w-[600px] h-[600px] bg-purple-500 opacity-10 blur-[220px] rounded-full pointer-events-none" />
    </div>
  );
};

export default DemoPage;
