import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Sparkles, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRarityLabel } from '../services/dataDragon';
import { AdSenseBanner } from './AdSenseBanner';

export const RightHextechPanel: React.FC = () => {
  const { state, openChest } = useGame();
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);

  const handleChestClick = (count: number) => {
    if (state.keys < count) {
      openChest(count);
      return;
    }
    setIsOpeningAnim(true);
    setTimeout(() => {
      openChest(count);
      setIsOpeningAnim(false);
    }, 280);
  };

  return (
    <aside className="w-full lg:w-72 bg-[#010a13] border-l border-[#1e2328] flex flex-col p-4 gap-4 text-[#f0e6d2] select-none">
      {/* 1. Open Hextech Chest Box */}
      <div className="bg-[#1e2328]/30 border border-[#c8aa6e]/20 p-4 rounded-sm flex flex-col items-center">
        <h3 className="text-xs font-bold uppercase text-[#c8aa6e] mb-3 tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00c8c8]" />
          <span>Hextech Sandığı Aç</span>
        </h3>

        {/* Chest 3D Visual Box */}
        <motion.div
          animate={
            isOpeningAnim
              ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -8, 8, -4, 0] }
              : { y: [0, -4, 0] }
          }
          transition={
            isOpeningAnim
              ? { duration: 0.28 }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
          onClick={() => handleChestClick(1)}
          className="w-32 h-28 bg-gradient-to-b from-[#092233] to-[#010a13] p-2 rounded-sm border border-[#c8aa6e]/60 shadow-[0_0_20px_rgba(0,200,200,0.25)] cursor-pointer hover:border-[#f0e6d2] hover:shadow-[0_0_25px_rgba(200,170,110,0.4)] transition-all flex flex-col items-center justify-center group relative overflow-hidden"
        >
          {/* Subtle cyan inner glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,200,200,0.15)_0%,_transparent_70%)] pointer-events-none"></div>

          {/* Mini Vector Hextech Chest Preview */}
          <svg viewBox="0 0 100 80" className="w-20 h-16 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            {/* Base Body */}
            <rect x="25" y="32" width="50" height="34" rx="2" fill="#0d1b22" stroke="#c89b3c" strokeWidth="2" />
            <polygon points="25,32 33,32 25,40" fill="#c89b3c" />
            <polygon points="75,32 67,32 75,40" fill="#c89b3c" />
            
            {/* Flanking Mini Brackets */}
            <path d="M 18 30 C 12 42 12 56 18 64" stroke="#c89b3c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 82 30 C 88 42 88 56 82 64" stroke="#c89b3c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 19 36 C 15 44 15 52 19 58" stroke="#00ffff" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M 81 36 C 85 44 85 52 81 58" stroke="#00ffff" strokeWidth="1" strokeLinecap="round" fill="none" />

            {/* Lid */}
            <polygon points="22,32 30,16 70,16 78,32" fill="#1a2e38" stroke="#f0e6d2" strokeWidth="2" />
            <rect x="42" y="12" width="16" height="6" fill="#c89b3c" rx="1" />

            {/* Cyan Core Crystal */}
            <polygon points="50,30 58,40 50,50 42,40" fill="#c89b3c" />
            <polygon points="50,33 55,40 50,47 45,40" fill="#00ffff" className="animate-pulse" />
            <circle cx="50" cy="40" r="1.5" fill="#ffffff" />
          </svg>

          <span className="text-[10px] font-bold text-[#c8aa6e] tracking-widest uppercase mt-1 group-hover:text-[#f0e6d2] transition-colors">
            AÇ (OPEN)
          </span>
        </motion.div>

        <p className="text-[10px] text-[#a09b8c] mt-2.5 uppercase tracking-wider font-semibold">
          1 Anahtar Gerekir • Sende: <span className="text-[#00c8c8] font-bold">{state.keys}</span>
        </p>

        {/* Action buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => handleChestClick(1)}
            disabled={state.keys < 1}
            className={`py-2 px-2 rounded-xs font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              state.keys >= 1
                ? 'bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13] shadow'
                : 'bg-[#1e2328] text-[#5c5b57] cursor-not-allowed'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>1x Aç</span>
          </button>

          <button
            onClick={() => handleChestClick(5)}
            disabled={state.keys < 5}
            className={`py-2 px-2 rounded-xs font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              state.keys >= 5
                ? 'border border-[#00c8c8] text-[#00c8c8] hover:bg-[#00c8c8]/10 shadow'
                : 'bg-[#1e2328] text-[#5c5b57] cursor-not-allowed'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>5x Aç</span>
          </button>
        </div>
      </div>

      {/* 2. Live Loot Feed */}
      <div className="flex-1 min-h-[160px] overflow-hidden flex flex-col bg-[#1e2328]/20 border border-[#005a82]/30 p-3 rounded-sm">
        <h3 className="text-xs font-bold uppercase text-[#00c8c8] mb-3 tracking-widest flex items-center justify-between">
          <span>Live Loot</span>
          <span className="text-[9px] text-[#a09b8c] uppercase font-semibold">Feed</span>
        </h3>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {state.recentDrops.length === 0 ? (
            <div className="text-center py-6 text-[#5c5b57] text-[10px] uppercase tracking-wider">
              No recent loot opened yet.
            </div>
          ) : (
            state.recentDrops.map((drop) => {
              const isMythicOrPrestige = drop.skin.rarity === 'Prestige' || drop.skin.rarity === 'Mythic';
              const isLegendary = drop.skin.rarity === 'Legendary' || drop.skin.rarity === 'Ultimate';

              const borderClass = isMythicOrPrestige
                ? 'border-[#d442f5]'
                : isLegendary
                ? 'border-[#c89b3c]'
                : 'border-[#00c8c8]';

              return (
                <div
                  key={drop.id}
                  className={`flex items-center gap-2.5 p-2 bg-[#010a13] border-l-2 ${borderClass} rounded-sm transition-all hover:bg-[#1e2328]/60`}
                >
                  <div className="w-8 h-8 rounded-xs overflow-hidden bg-gray-900 border border-gray-700 shrink-0">
                    <img
                      src={drop.skin.splashUrl}
                      alt={drop.skin.skinName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase leading-none text-[#f0e6d2] truncate">
                      {drop.skin.skinName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[8px] text-[#a09b8c] uppercase truncate">
                        {getRarityLabel(drop.skin.rarity)}
                      </p>
                      <span className="text-[8px] text-[#c8aa6e] font-semibold">
                        {drop.username}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Google AdSense Unit (Right Sidebar) */}
      <AdSenseBanner
        slotId="1234567890"
        label="Sponsorlu / Reklam"
        className="mt-auto"
      />
    </aside>
  );
};

