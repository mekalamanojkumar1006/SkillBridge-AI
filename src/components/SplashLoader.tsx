import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface SplashLoaderProps {
  onComplete: () => void;
}

export default function SplashLoader({ onComplete }: SplashLoaderProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Staged animation timing
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 1800);
    const t3 = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050608] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative flex flex-col items-center">
        {/* Animated Accent Rings */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-64 h-64 rounded-full border border-blue-500/10 blur-sm"
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.4, 1], opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
          className="absolute w-80 h-80 rounded-full border border-purple-500/10 blur-md"
        />

        {/* Brand Name Animation */}
        <div className="flex items-center space-x-1 font-sans text-4xl sm:text-5xl font-black tracking-tighter">
          <motion.span
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            SkillBridge
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={stage >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="px-2 py-0.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md font-mono tracking-normal font-bold shadow-lg"
          >
            AI
          </motion.span>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={stage >= 1 ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-3 text-xs sm:text-sm text-gray-400 font-mono tracking-widest text-center max-w-xs"
        >
          MULTI-AGENT CAREER INTELLIGENCE
        </motion.p>

        {/* Loading status bar */}
        <div className="mt-12 w-48 h-[2px] bg-gray-900 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          />
        </div>

        {/* Sub-status text */}
        <motion.span
          key={stage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.5, y: 0 }}
          className="mt-3 text-[10px] font-mono text-gray-500 tracking-wider uppercase"
        >
          {stage === 0 && "Initializing core agents..."}
          {stage === 1 && "Synthesizing career algorithms..."}
          {stage >= 2 && "Securing neural bridge..."}
        </motion.span>
      </div>
    </div>
  );
}
