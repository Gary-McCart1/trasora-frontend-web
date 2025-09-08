import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white min-h-[80vh] flex flex-col justify-center items-center px-6 md:px-12 text-center overflow-hidden">
      {/* Gradient overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 pointer-events-none blur-3xl" />

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-70 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <h1 className="relative text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-tight drop-shadow-lg z-10">
        Welcome to{" "}
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
          Trasora
        </span>
        ,<br />
        Your{" "}
        <span className="underline decoration-purple-500 decoration-4">
          Social Music Playground
        </span>
      </h1>

      <p className="relative max-w-3xl text-lg md:text-2xl text-zinc-300 mb-10 drop-shadow-md z-10">
        Share your favorite tracks,
        discover fresh sounds, and build your ultimate playlist community — all
        in one place.
      </p>

      <Link
        href="/signup"
        className="relative z-10 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-12 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.6)] hover:shadow-[0_0_10px_rgba(168,85,247,0.9)] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500"
      >
        Signup Now — It’s Free!
      </Link>

      {/* Pulsing glow ring */}
      <div className="absolute -bottom-12 w-[700px] h-[700px] bg-purple-500 opacity-10 blur-[250px] rounded-full animate-pulse-slow pointer-events-none" />
    </section>
  );
}
