'use client';

import { motion, useAnimationControls } from 'framer-motion';

interface FloatingParticlesProps {
  color: string;
}

export default function FloatingParticles({ color }: FloatingParticlesProps) {
  const particles = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-x-clip">
      {particles.map((_, i) => {
        const leftStart = Math.random() * 100; // start left %
        const size = Math.random() * 16 + 12; // px
        const duration = Math.random() * 10 + 8; // seconds
        const delay = Math.random() * 5; // seconds
        const bottomStart = Math.random() * 100; // %

        // Horizontal sway amplitude and frequency for this note
        const swayAmplitude = Math.random() * 10 + 5; // px
        const swayFrequency = Math.random() * 2 + 1; // cycles per duration

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${leftStart}%`,
              bottom: `${bottomStart}%`,
              width: size,
              height: size,
              originX: 0.5,
              originY: 0.5,
              // To keep transform origin centered for rotation & scale
            }}
            animate={{
              y: ['0%', '-130%'],
              opacity: [0, 0.9, 0],
              rotate: [ -10, 10, -10 ], // gentle back & forth rotation
              scale: [0.8, 1, 0.8], // subtle scaling
              x: [
                0,
                swayAmplitude,
                0,
                -swayAmplitude,
                0,
              ], // sway left and right smoothly
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1], // matching the x sway keyframes
            }}
          >
            <MusicNote color={color} size={size} />
          </motion.div>
        );
      })}
    </div>
  );
}

const MusicNote = ({ color, size }: { color: string; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md"
  >
    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
  </svg>
);
