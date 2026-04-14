import Link from "next/link";

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-zinc-200 px-6 md:px-12 py-16 flex flex-col items-center relative overflow-hidden">

      {/* soft purple glow background (matches hero style) */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20 blur-3xl pointer-events-none" />

      {/* Title section */}
      <div className="relative z-10 text-center max-w-3xl mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          See <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Trasora</span> in action
        </h1>

        <p className="text-zinc-300 text-lg md:text-xl">
          Watch how you can share music, discover new tracks, and connect with others in a social music experience.
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
      <div className="relative z-10 mt-12 flex flex-col items-center gap-4 text-center">
        <Link
          href="/signup"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all duration-300 transform hover:scale-105"
        >
          Get Started Free
        </Link>

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