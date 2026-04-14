import Link from "next/link";
import Image from "next/image";

const STATIC_PROFILES = [
  { id: 1, src: "/profile-pictures/1760554669748-IMG_3253.jpeg", alt: "User 1" },
  { id: 2, src: "/profile-pictures/1760638840090-IMG_2281.jpeg", alt: "User 2" },
  { id: 3, src: "/profile-pictures/1760740589490-IMG_8324.jpeg", alt: "User 3" },
  { id: 4, src: "/profile-pictures/1760808321561-IMG_0145.jpeg", alt: "User 4" },
  { id: 5, src: "/profile-pictures/1761007358479-IMG_8337.jpeg", alt: "User 5" },
  { id: 6, src: "/profile-pictures/1761015314870-IMG_2830.jpeg", alt: "User 6" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-6 text-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-zinc-900 to-zinc-950" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" />

      <div className="relative z-10 max-w-4xl">
        <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
          <div className="flex -space-x-3 overflow-hidden p-1">
            {STATIC_PROFILES.map((profile, index) => (
              <div
                key={profile.id}
                className="relative transition-all duration-200 hover:-translate-y-1 hover:z-30 animate-profile-drop"
                style={{
                  zIndex: STATIC_PROFILES.length - index,
                  animationDelay: `${index * 60}ms`,
                  animationFillMode: "both",
                }}
              >
                <Image
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800/50 shadow-xl"
                  src={profile.src}
                  alt={profile.alt}
                  width={50}
                  height={50}
                  quality={60}        // ✅ No need for high quality at 50px
                  sizes="50px"        // ✅ Tells Next.js exactly how big to generate it
                  priority
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex text-purple-400 text-[10px] tracking-widest">
              {"★★★★★".split("").map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <p className="text-zinc-300 text-[12px] font-semibold uppercase tracking-tighter">
              Trusted by music lovers
            </p>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
          Share music.
          <br />
          Discover new tracks.
          <br />
          <span className="text-purple-400">Connect through sound.</span>
        </h1>

        <p className="max-w-xl mx-auto text-lg md:text-xl text-zinc-400 font-normal mb-10 leading-relaxed">
          Trasora is a social music platform designed for sharing songs,
          discovering new artists, and building playlists with your friends.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-10 py-4 bg-purple-600 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
          >
            Get Started Free
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto px-10 py-4 bg-zinc-900 text-zinc-300 font-semibold rounded-xl border border-zinc-800 transition-all hover:bg-zinc-800 hover:text-white"
          >
            See how it works
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            Join the community today
          </p>
          <span className="text-zinc-500 font-bold">·</span>
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            Free
          </p>
        </div>
      </div>
    </section>
  );
}