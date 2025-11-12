"use client";
import { motion } from "framer-motion";

export const PoliceLightLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      {/* Red ↔ Blue ambient wash */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(255,0,0,0.45), transparent 70%)",
            "radial-gradient(circle at 70% 50%, rgba(0,0,255,0.45), transparent 70%)",
          ],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Subtle white flash to simulate camera glare */}
      <motion.div
        className="absolute inset-0 bg-white/10"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{
          duration: 0.25,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeOut",
        }}
      />

      {/* Moving red/blue lights */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(90deg, rgba(255,0,0,0.6) 0%, transparent 50%, rgba(0,0,255,0.6) 100%)",
            "linear-gradient(90deg, rgba(0,0,255,0.6) 0%, transparent 50%, rgba(255,0,0,0.6) 100%)",
          ],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          filter: "blur(60px)",
        }}
      />

      {/* LOADING text with cinematic flicker */}
      <motion.p
        className="absolute bottom-16 text-white/80 text-lg font-semibold tracking-[0.3em]"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      >
        LOADING...
      </motion.p>
    </div>
  );
};
