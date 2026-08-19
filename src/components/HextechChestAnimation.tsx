import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Key, Zap } from 'lucide-react';
import { playChestOpenSound, playLegendarySound } from '../services/soundEffects';

interface HextechChestAnimationProps {
  onAnimationComplete: () => void;
  rarity?: string;
  isSoundEnabled: boolean;
  volume: number;
}

export const HextechChestAnimation: React.FC<HextechChestAnimationProps> = ({
  onAnimationComplete,
  rarity = 'Epic',
  isSoundEnabled,
  volume,
}) => {
  // Stage: 0 = Key inserting & rattle, 1 = Unlock & radiant blast, 2 = Opened / Reveal ready
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    // Play sound
    if (isSoundEnabled) {
      playChestOpenSound(volume);
    }

    // Stage 0: 0 -> 700ms (Key insertion & chest shaking)
    const t1 = setTimeout(() => {
      setStage(1);
    }, 750);

    // Stage 1 -> Stage 2 (Burst open & light beams)
    const t2 = setTimeout(() => {
      setStage(2);
      if (rarity === 'Legendary' || rarity === 'Ultimate' || rarity === 'Prestige') {
        if (isSoundEnabled) playLegendarySound(volume);
      }
    }, 1500);

    // Complete transition to skin reveal
    const t3 = setTimeout(() => {
      onAnimationComplete();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="relative w-full h-80 md:h-96 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background Radiant Blast Sunburst Rays */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{ opacity: [0, 0.9, 0.4], scale: [0.2, 1.8, 2.2], rotate: 180 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-96 h-96 rounded-full bg-[radial-gradient(circle,_rgba(0,200,200,0.5)_0%,_rgba(200,155,60,0.3)_40%,_transparent_70%)] blur-xl"></div>
            {/* Hextech Magic Radial Beams */}
            <div className="absolute w-[600px] h-[600px] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_rgba(0,255,200,0.4)_20deg,_transparent_40deg,_rgba(255,215,0,0.4)_60deg,_transparent_80deg,_rgba(0,255,200,0.4)_100deg,_transparent_120deg)] opacity-60 animate-spin"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hextech Key Flying In to Unlock (Stage 0) */}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 2, y: -80, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute z-30 top-12 flex flex-col items-center pointer-events-none"
          >
            <div className="p-3 bg-[#0a1428] border-2 border-[#c8aa6e] rounded-full shadow-[0_0_20px_#00c8c8]">
              <Key className="w-8 h-8 text-[#c8aa6e] drop-shadow-[0_0_8px_#00c8c8] animate-pulse" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#00c8c8] tracking-widest mt-1">
              Unlocking...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hextech 3D Animated Chest Box */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        <motion.div
          animate={
            stage === 0
              ? {
                  rotate: [0, -4, 4, -6, 6, -2, 2, 0],
                  scale: [1, 1.05, 1.02, 1.08, 1],
                  y: [0, -4, 0],
                }
              : stage === 1
              ? {
                  scale: [1, 1.3, 1.15],
                  y: -15,
                  filter: 'brightness(1.8) contrast(1.3)',
                }
              : {
                  scale: 1.1,
                  y: 5,
                  opacity: [1, 0.8, 0],
                }
          }
          transition={{
            duration: stage === 0 ? 0.75 : 0.65,
            ease: 'easeInOut',
          }}
          className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center cursor-pointer"
        >
          {/* Hextech Chest Vector Artwork */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] overflow-visible"
          >
            <defs>
              {/* Gold border gradient */}
              <linearGradient id="chestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0e6d2" />
                <stop offset="50%" stopColor="#c89b3c" />
                <stop offset="100%" stopColor="#785a28" />
              </linearGradient>
              {/* Cyan Hextech Core gradient */}
              <linearGradient id="hextechCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#00ffcc" />
                <stop offset="100%" stopColor="#005a82" />
              </linearGradient>
              {/* Dark iron body */}
              <linearGradient id="ironBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2328" />
                <stop offset="100%" stopColor="#010a13" />
              </linearGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="50" cy="90" rx="35" ry="8" fill="#000000" opacity="0.6" />

            {/* Base Chest Body */}
            <rect x="20" y="44" width="60" height="42" rx="4" fill="url(#ironBody)" stroke="url(#chestGold)" strokeWidth="3" />
            
            {/* Hextech Metallic Corner Reinforcements */}
            <polygon points="20,44 32,44 20,56" fill="url(#chestGold)" />
            <polygon points="80,44 68,44 80,56" fill="url(#chestGold)" />
            <polygon points="20,86 32,86 20,74" fill="url(#chestGold)" />
            <polygon points="80,86 68,86 80,74" fill="url(#chestGold)" />

            {/* Center Front Inset Panel */}
            <rect x="28" y="52" width="44" height="26" rx="2" fill="#091428" stroke="#005a82" strokeWidth="1.5" />

            {/* Glowing Hextech Rune Inscription Lines */}
            <line x1="30" y1="65" x2="42" y2="65" stroke="#00c8c8" strokeWidth="2" opacity={stage >= 1 ? 1 : 0.7} />
            <line x1="58" y1="65" x2="70" y2="65" stroke="#00c8c8" strokeWidth="2" opacity={stage >= 1 ? 1 : 0.7} />

            {/* Chest Lid (Flips up during stage 1 & 2) */}
            <motion.g
              animate={
                stage >= 1
                  ? { y: -24, rotate: -20, originX: '50px', originY: '30px' }
                  : { y: 0, rotate: 0 }
              }
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Lid Top Arc */}
              <path
                d="M 18 42 L 24 24 L 76 24 L 82 42 Z"
                fill="url(#ironBody)"
                stroke="url(#chestGold)"
                strokeWidth="3"
              />
              {/* Lid Gold Trim */}
              <polygon points="24,24 34,24 28,34 18,34" fill="url(#chestGold)" />
              <polygon points="76,24 66,24 72,34 82,34" fill="url(#chestGold)" />
              {/* Lid Top Center Crest */}
              <rect x="42" y="22" width="16" height="6" rx="1" fill="url(#chestGold)" />
            </motion.g>

            {/* Hextech Crystal Gem Lock (Center Core) */}
            <motion.g
              animate={
                stage >= 1
                  ? { scale: [1, 1.4, 1.8], opacity: [1, 1, 0] }
                  : { scale: [1, 1.1, 1] }
              }
              transition={{ duration: 0.6, repeat: stage === 0 ? Infinity : 0 }}
            >
              {/* Diamond Lock Housing */}
              <polygon points="50,38 62,50 50,62 38,50" fill="url(#chestGold)" />
              {/* Glowing Magic Diamond Crystal */}
              <polygon
                points="50,42 58,50 50,58 42,50"
                fill="url(#hextechCyan)"
                className="drop-shadow-[0_0_8px_#00ffff]"
              />
              <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
            </motion.g>

            {/* Light Rays bursting from seams when unlocked */}
            {stage >= 1 && (
              <g>
                <polygon points="50,40 10,10 90,10" fill="url(#hextechCyan)" opacity="0.6" />
                <line x1="20" y1="44" x2="5" y2="30" stroke="#00ffff" strokeWidth="2" />
                <line x1="80" y1="44" x2="95" y2="30" stroke="#00ffff" strokeWidth="2" />
              </g>
            )}
          </svg>
        </motion.div>

        {/* Status text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-[#00c8c8] animate-spin" />
          <span className="text-xs uppercase font-bold tracking-widest text-[#f0e6d2]">
            {stage === 0
              ? 'Opening Hextech Chest...'
              : stage === 1
              ? 'Magic Releasing...'
              : 'Loot Discovered!'}
          </span>
        </motion.div>
      </div>

      {/* Quick Skip Button */}
      <button
        onClick={onAnimationComplete}
        className="absolute bottom-3 text-[10px] uppercase tracking-wider text-[#a09b8c] hover:text-[#00c8c8] underline cursor-pointer"
      >
        Skip Animation
      </button>
    </div>
  );
};
