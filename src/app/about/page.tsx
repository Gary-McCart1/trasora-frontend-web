import React from "react";
import Hero from "../components/Hero";
import Link from "next/link";

const AboutPage = () => {
  return (
    <div>
      <Hero />
      <div className="flex justify-between w-[10%] mx-auto mt-10">
        <Link className="hover:text-purple-400 transition text-sm text-zinc-200"
            aria-label="Home" href="/support">Support</Link>
        <Link className="hover:text-purple-400 transition text-sm text-zinc-200"href="/privacy">Privacy</Link>
      </div>
    </div>
  );
};

export default AboutPage;
