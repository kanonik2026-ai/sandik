import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Sparkles, Volume2, VolumeX, History, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRarityLabel } from '../services/dataDragon';

export const RightHextechPanel: React.FC = () => {
  const { state, openChest, toggleSound, setVolume } = useGame();
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
    <aside className="w-full lg:w-72 bg-[#010a13] border-l border-[#1e2328] flex flex-col p-4 gap-4 text-[#f0e6d2]">
      {/* 1. Open Hextech Chest Box (Vibrant Palette style) */}
      <div className="bg-[#1e2328]/30 border border-[#c8aa6e]/20 p-3 rounded-sm flex flex-col items-center">
        <h3 className="text-[10px] font-bold uppercase text-[#c8aa6e] mb-2 tracking-widest">
          Open Hextech Chest
        </h3>

        {/* Vibrant Palette Chest Visual */}
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
          className="w-24 h-24 bg-gradient-to-br from-[#c89b3c] to-[#785a28] p-1 rounded-sm shadow-xl cursor-pointer hover:brightness-125 transition-all"
        >
          <div className="w-full h-full bg-[#010a13] flex flex-col items-center justify-center border border-[#c89b3c]/50 relative group">
            <Sparkles className="w-6 h-6 text-[#c8aa6e] mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-[#c8aa6e] tracking-widest uppercase">
              CHEST
            </span>
          </div>
        </motion.div>

        <p className="text-[9px] text-[#a09b8c] mt-2 uppercase tracking-wider font-semibold">
          Costs 1 Key • You have {state.keys}
        </p>

        {/* Action buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => handleChestClick(1)}
            disabled={state.keys < 1}
            className={`py-2 px-2 rounded-sm font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              state.keys >= 1
                ? 'bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13]'
                : 'bg-[#1e2328] text-[#5c5b57] cursor-not-allowed'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>Open x1</span>
          </button>

          <button
            onClick={() => handleChestClick(5)}
            disabled={state.keys < 5}
            className={`py-2 px-2 rounded-sm font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
              state.keys >= 5
                ? 'border border-[#00c8c8] text-[#00c8c8] hover:bg-[#00c8c8]/10'
                : 'bg-[#1e2328] text-[#5c5b57] cursor-not-allowed'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Open x5</span>
          </button>
        </div>
      </div>

      {/* 2. Audio Controller Bar */}
      <div className="bg-[#1e2328]/30 border border-[#005a82]/40 p-2.5 rounded-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-sm border transition-colors cursor-pointer ${
              state.soundEnabled
                ? 'bg-[#0a1428] border-[#00c8c8] text-[#00c8c8]'
                : 'bg-[#010a13] border-[#1e2328] text-[#a09b8c]'
            }`}
            title={state.soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {state.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] uppercase tracking-wider text-[#a09b8c] font-bold">
            SFX Audio
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={state.sfxVolume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 accent-[#00c8c8] cursor-pointer"
        />
      </div>

      {/* 3. Live Loot Feed (Vibrant Palette border-l accents) */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-xs font-bold uppercase text-[#00c8c8] mb-3 tracking-widest flex items-center justify-between">
          <span>Live Loot</span>
          <span className="text-[9px] text-[#a09b8c] uppercase">Feed</span>
        </h3>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {state.recentDrops.length === 0 ? (
            <div className="text-center py-6 text-[#5c5b57] text-[10px] uppercase">
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
                  className={`flex items-center gap-2.5 p-2 bg-[#1e2328]/50 border-l-2 ${borderClass} rounded-sm transition-all hover:bg-[#1e2328]`}
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
    </aside>
  );
};
