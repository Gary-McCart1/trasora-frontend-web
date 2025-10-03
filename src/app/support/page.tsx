"use client";

export default function Support() {
  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 min-h-[60vh] flex items-center justify-center text-white px-4">
      {/* Background blur accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl z-0"></div>

      <div className="relative z-10 w-full max-w-lg space-y-6 border border-zinc-800 bg-zinc-900/90 p-8 rounded-xl shadow-lg backdrop-blur">
        <h1 className="text-3xl font-bold text-center">Support</h1>
        <p className="text-zinc-400 text-center">
          Thanks for using <span className="text-purple-400 font-medium">Trasora</span>.  
          If you’re experiencing issues or have questions, we’re here to help.
        </p>

        <div className="space-y-3 text-center">
          <p className="text-base text-zinc-300">
            📧 Email us anytime at:
          </p>
          <a
            href="mailto:trasoramusic@gmail.com"
            className="inline-block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white font-medium transition"
          >
            trasoramusic@gmail.com
          </a>
        </div>

        <p className="text-xs text-center text-zinc-500">
          We typically respond within 24–48 hours.
        </p>
      </div>
    </section>
  );
}
