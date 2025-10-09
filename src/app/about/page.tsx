import React from "react";
import Hero from "../components/Hero";
import Link from "next/link";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Hero />
      <div className="mt-10 px-6 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md sm:max-w-2xl mx-auto text-center">
          <Link
            className="hover:text-purple-400 transition text-sm sm:text-base"
            aria-label="Support"
            href="/support"
          >
            Support
          </Link>
          <Link
            className="hover:text-purple-400 transition text-sm sm:text-base"
            aria-label="Privacy"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="hover:text-purple-400 transition text-sm sm:text-base"
            aria-label="Terms of Use"
            href="/terms-of-use"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
