"use client"; // Required for Framer Motion in Next.js App Router

import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // Add Variants here
import { trackEvent } from "../lib/analytics";
import { getTrackingData } from "../utils/getTrackingData";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut", // TypeScript now knows this is a valid Easing type
    },
  },
};

const features = [
  {
    title: "Sync & Capture",
    benefit: "Preserve spontaneous moments",
    gradient: "from-purple-600/60 to-pink-600/60",
    border:
      "hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    image: "/feature-images/03fabdb4dd1785b12c0c5302dba5995f.jpg",
  },
  {
    title: "Discover & Share",
    benefit: "Explore personalized recommendations",
    gradient: "from-blue-600/60 to-purple-600/60",
    border:
      "hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]",
    image: "/feature-images/972c86205836ea66177613c55857c747.jpg",
  },
  {
    title: "Build Mixtapes",
    benefit: "Organize and remix tracks",
    gradient: "from-indigo-600/60 to-blue-600/60",
    border:
      "hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]",
    image: "/feature-images/2921d6e091815585a090f99b05108f53.jpg",
  },
  {
    title: "Connect & Engage",
    benefit: "Share reactions and comments",
    gradient: "from-pink-600/60 to-red-600/60",
    border:
      "hover:border-pink-400 hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]",
    image: "/feature-images/d6559837665f965bfb947605d8479679.jpg",
  },
  {
    title: "Explore New Music",
    benefit: "Handpicked tracks for you",
    gradient: "from-cyan-600/60 to-blue-600/60",
    border: "hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]",
    image: "/feature-images/e3c151dec3e48d267fd9ffe9dc2e8f38.jpg",
  },
  {
    title: "Share with Friends",
    benefit: "Curate playlists together",
    gradient: "from-purple-600/60 to-indigo-600/60",
    border:
      "hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    image: "/feature-images/e402275ce3876b99128a1d7ebee72f46.jpg",
  },
];

const AboutPage = () => {

  useEffect(() => {
    trackEvent("landing_page_viewed", {
      ...getTrackingData()
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-purple-500/30">
      <Hero />

      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Animated Grid Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className={`group relative overflow-hidden rounded-[2.5rem] border-2 border-zinc-800 bg-zinc-900 min-h-[400px] transition-all duration-500 transform hover:scale-125 hover:-translate-y-4 hover:p-20 ${feature.border}`}
            >
              {/* Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundImage: `url(${feature.image})` }}
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-zinc-950/40 transition-opacity duration-500 group-hover:opacity-20" />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-500`}
              />

              {/* Content */}
              <div className="relative z-10 h-full p-10 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <h3 className="text-3xl font-black tracking-tighter text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-300 font-bold mt-2 text-lg drop-shadow-md">
                    {feature.benefit}
                  </p>
                </div>
              </div>

              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-zinc-900">
          <div className="flex flex-wrap justify-center gap-12 text-sm font-medium text-zinc-500">
            <Link
              href="/support"
              className="hover:text-purple-400 transition-colors uppercase tracking-widest"
            >
              Support
            </Link>
            <Link
              href="/privacy"
              className="hover:text-purple-400 transition-colors uppercase tracking-widest"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-use"
              className="hover:text-purple-400 transition-colors uppercase tracking-widest"
            >
              Terms of Use
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AboutPage;
