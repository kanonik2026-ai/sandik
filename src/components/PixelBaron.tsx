import React from 'react';
import { motion } from 'motion/react';

interface PixelBaronProps {
  isHit: boolean;
}

export const PixelBaron: React.FC<PixelBaronProps> = ({ isHit }) => {
  return (
    <motion.div
      animate={
        isHit
          ? {
              scale: [1, 0.94, 1.05, 1],
              rotate: [0, -3, 3, 0],
              filter: 'brightness(1.5) contrast(1.2)',
            }
          : {
              y: [0, -6, 0],
              scale: [1, 1.02, 1],
            }
      }
      transition={
        isHit
          ? { duration: 0.14 }
          : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
      }
      className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center select-none"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Baron Toxic Glow Aura */}
      <div className="absolute inset-2 bg-gradient-to-t from-[#800080]/30 to-[#a855f7]/10 rounded-full blur-xl pointer-events-none"></div>

      <svg
        viewBox="0 0 40 40"
        className="w-full h-full drop-shadow-[0_8px_24px_rgba(128,0,128,0.7)]"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* --- SHADOW / ACID POOL --- */}
        <ellipse cx="20" cy="36" rx="14" ry="3" fill="#000000" opacity="0.6" />
        <ellipse cx="20" cy="36" rx="10" ry="2" fill="#00ff88" opacity="0.25" />

        {/* --- LOWER BODY / COILS --- */}
        <rect x="14" y="30" width="12" height="6" fill="#140b20" />
        <rect x="12" y="31" width="16" height="4" fill="#2d124d" />
        <rect x="15" y="32" width="10" height="2" fill="#4a1575" />

        {/* --- MAIN TORSO / PURPLE CHITIN PLATES --- */}
        <rect x="13" y="20" width="14" height="11" fill="#1f0933" />
        <rect x="14" y="22" width="12" height="8" fill="#3b0f5e" />
        <rect x="16" y="24" width="8" height="5" fill="#581c87" />
        {/* Purple Vent Spikes */}
        <rect x="10" y="22" width="3" height="4" fill="#581c87" />
        <rect x="27" y="22" width="3" height="4" fill="#581c87" />
        <rect x="8" y="23" width="2" height="2" fill="#a855f7" />
        <rect x="30" y="23" width="2" height="2" fill="#a855f7" />

        {/* --- CHEST VOID CORE (Pulsing Purple Gem) --- */}
        <rect x="18" y="25" width="4" height="3" fill="#a855f7" />
        <rect x="19" y="26" width="2" height="1" fill="#f3e8ff" />

        {/* --- NECK & MANDIBLES --- */}
        <rect x="15" y="14" width="10" height="7" fill="#2a0845" />
        <rect x="16" y="15" width="8" height="5" fill="#4c1d95" />

        {/* Outer Giant Mandibles */}
        {/* Left Mandible */}
        <rect x="8" y="13" width="4" height="3" fill="#3b0764" />
        <rect x="6" y="10" width="3" height="4" fill="#581c87" />
        <rect x="5" y="7" width="2" height="4" fill="#7e22ce" />
        <rect x="6" y="5" width="2" height="3" fill="#a855f7" />
        <rect x="8" y="4" width="2" height="2" fill="#e9d5ff" /> {/* Sharp tooth tip */}

        {/* Right Mandible */}
        <rect x="28" y="13" width="4" height="3" fill="#3b0764" />
        <rect x="31" y="10" width="3" height="4" fill="#581c87" />
        <rect x="33" y="7" width="2" height="4" fill="#7e22ce" />
        <rect x="32" y="5" width="2" height="3" fill="#a855f7" />
        <rect x="30" y="4" width="2" height="2" fill="#e9d5ff" /> {/* Sharp tooth tip */}

        {/* --- HEAD / MAW / TEETH --- */}
        <rect x="14" y="7" width="12" height="8" fill="#1e0533" />
        <rect x="15" y="6" width="10" height="8" fill="#3b0764" />
        <rect x="16" y="5" width="8" height="6" fill="#581c87" />

        {/* Crown Horns */}
        <rect x="17" y="3" width="6" height="3" fill="#6b21a8" />
        <rect x="18" y="2" width="4" height="2" fill="#a855f7" />
        <rect x="19" y="1" width="2" height="2" fill="#d8b4fe" />

        {/* Gaping Void Maw */}
        <rect x="16" y="11" width="8" height="4" fill="#090014" />
        {/* Acid Maw Glow */}
        <rect x="18" y="12" width="4" height="2" fill="#00ff88" opacity="0.85" />
        <rect x="19" y="13" width="2" height="1" fill="#ffffff" />

        {/* Teeth */}
        <rect x="16" y="11" width="1" height="2" fill="#f0e6d2" />
        <rect x="18" y="11" width="1" height="1.5" fill="#f0e6d2" />
        <rect x="21" y="11" width="1" height="1.5" fill="#f0e6d2" />
        <rect x="23" y="11" width="1" height="2" fill="#f0e6d2" />
        <rect x="17" y="14" width="1" height="1.5" fill="#f0e6d2" />
        <rect x="22" y="14" width="1" height="1.5" fill="#f0e6d2" />

        {/* --- GLOWING EYES (Multiple Baron Void Eyes) --- */}
        {/* Left Eyes */}
        <rect x="16" y="8" width="2" height="2" fill={isHit ? '#ffffff' : '#ff0055'} />
        <rect x="14" y="9" width="1.5" height="1.5" fill={isHit ? '#ffffff' : '#ff3366'} />
        <rect x="16" y="10" width="1" height="1" fill="#ffffff" />

        {/* Right Eyes */}
        <rect x="22" y="8" width="2" height="2" fill={isHit ? '#ffffff' : '#ff0055'} />
        <rect x="24.5" y="9" width="1.5" height="1.5" fill={isHit ? '#ffffff' : '#ff3366'} />
        <rect x="23" y="10" width="1" height="1" fill="#ffffff" />

        {/* Forehead Third Eyes */}
        <rect x="19" y="6" width="2" height="1.5" fill={isHit ? '#ffffff' : '#00ffcc'} />
      </svg>
    </motion.div>
  );
};
