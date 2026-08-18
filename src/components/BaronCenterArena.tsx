import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const BaronCenterArena: React.FC = () => {
  const {
    state,
    clickBaron,
    triggerAlphaStrike,
    isAlphaReady,
    alphaCooldownPercent,
    combo,
    comboMultiplier,
    floatingTexts,
    xpNeeded,
    xpProgressPercent,
  } = useGame();

  const [isSlashing, setIsSlashing] = useState(false);
  const [isBaronHit, setIsBaronHit] = useState(false);
  const [slashAngle, setSlashAngle] = useState(45);
  const [slashPosition, setSlashPosition] = useState({ x: 50, y: 50 });
  const arenaRef = useRef<HTMLDivElement>(null);

  const handleBaronClick = (e: React.MouseEvent<HTMLDivElement>) => {
    let clickX = e.clientX;
    let clickY = e.clientY;

    if (arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
      setSlashPosition({ x: relativeX, y: relativeY });
    }

    setSlashAngle(Math.floor(Math.random() * 90) - 45);

    setIsSlashing(true);
    setIsBaronHit(true);

    setTimeout(() => setIsSlashing(false), 140);
    setTimeout(() => setIsBaronHit(false), 120);

    clickBaron(clickX, clickY);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-between min-w-0 max-w-2xl w-full select-none">
      {/* Top Banner: Vibrant Next Level XP Bar */}
      <div className="w-full text-center mb-3">
        <div className="flex items-center justify-between px-2 text-xs uppercase tracking-[0.2em] text-[#a09b8c] font-bold">
          <span>Level {state.level}</span>
          <span className="tracking-[0.3em] text-[#00c8c8]">
            Next Level: {Math.max(0, xpNeeded - Math.round(state.xp))} XP
          </span>
          <span>Level {state.level + 1}</span>
        </div>

        <div className="w-full h-2.5 bg-[#1e2328] mx-auto mt-2 rounded-full border border-[#c89b3c]/30 overflow-hidden shadow-inner p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#00c8c8] via-[#38bdf8] to-[#005a82] rounded-full shadow-[0_0_10px_#00c8c8] transition-all duration-200"
            style={{ width: `${xpProgressPercent}%` }}
          ></div>
        </div>

        {/* Combo Multiplier Meter */}
        {combo > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#0a1428] border border-[#00c8c8] text-[#00c8c8] shadow-[0_0_12px_rgba(0,200,200,0.5)]"
          >
            <Flame className="w-3.5 h-3.5 text-[#c89b3c]" />
            <span>{combo} Combo! ({comboMultiplier}x XP)</span>
          </motion.div>
        )}
      </div>

      {/* Center Interactive Battle Arena (Vibrant Palette Diamond Design) */}
      <div
        ref={arenaRef}
        onClick={handleBaronClick}
        className="relative w-full aspect-square max-h-[460px] bg-gradient-to-b from-[#0a1428] to-[#010a13] border-2 border-[#1e2328] rounded-sm overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] cursor-pointer group flex flex-col items-center justify-center p-4 relative"
      >
        {/* Radiant Cyan Glow on Hover */}
        <div className="absolute -inset-12 bg-[#00c8c8] rounded-full opacity-5 blur-3xl group-hover:opacity-10 transition-opacity pointer-events-none"></div>

        {/* Diamond Rotated Baron Crest */}
        <div className="relative group cursor-pointer active:scale-95 transition-transform duration-75 flex flex-col items-center justify-center">
          <div className="w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
            <div className="w-44 h-44 sm:w-48 sm:h-48 bg-[#1e2328] border-4 border-[#c8aa6e] rotate-45 shadow-2xl overflow-hidden flex items-center justify-center relative">
              <div className="-rotate-45 w-[140%] h-[140%] flex flex-col items-center justify-center relative">
                <img
                  src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/ChoGath_0.jpg"
                  alt="Baron Nashor"
                  className={`w-full h-full object-cover transition-transform duration-100 ${
                    isBaronHit ? 'scale-110 brightness-150' : 'group-hover:scale-105'
                  }`}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-black/30"></div>

                <span className="absolute bottom-6 font-black tracking-widest text-[#c8aa6e] drop-shadow-lg text-lg uppercase font-['Cinzel',serif]">
                  BARON
                </span>
              </div>
            </div>
          </div>

          {/* Master Yi Striker Tag & Avatar */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            <div className="w-12 h-12 bg-[#0a1428] border-2 border-[#00c8c8] rounded-full p-0.5 overflow-hidden shadow-[0_0_12px_#00c8c8]">
              <img
                src="https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/MasterYi.png"
                alt="Master Yi"
                className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
            <span className="font-bold uppercase tracking-wider text-xs text-[#00c8c8]">
              Striking...
            </span>
          </div>
        </div>

        {/* Slash Visual FX Overlay */}
        <AnimatePresence>
          {isSlashing && (
            <motion.div
              initial={{ opacity: 1, scaleX: 0.2 }}
              animate={{ opacity: [1, 0.8, 0], scaleX: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: `${slashPosition.y}%`,
                left: `${slashPosition.x}%`,
                transform: `translate(-50%, -50%) rotate(${slashAngle}deg)`,
              }}
              className="pointer-events-none z-30 flex items-center justify-center"
            >
              <div className="w-56 h-1.5 bg-gradient-to-r from-transparent via-[#00c8c8] to-transparent shadow-[0_0_20px_#00c8c8]"></div>
              <div className="absolute w-28 h-1 bg-white shadow-[0_0_15px_#ffffff]"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Numbers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: ft.type === 'crit' ? 1.3 : ft.type === 'gem' ? 1.4 : 1 }}
              animate={{ opacity: 0, y: -60, scale: ft.type === 'crit' ? 1.4 : 1.1 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              style={{ left: ft.x, top: ft.y, position: 'fixed' }}
              className={`font-black tracking-wider px-2 py-0.5 rounded shadow-lg text-sm md:text-base ${
                ft.type === 'crit'
                  ? 'text-rose-400 bg-black/90 border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : ft.type === 'gem'
                  ? 'text-[#d442f5] bg-purple-950/90 border border-[#d442f5] shadow-[0_0_20px_#d442f5] animate-bounce'
                  : ft.type === 'alphastrike'
                  ? 'text-cyan-300 bg-cyan-950/90 border border-cyan-400'
                  : 'text-[#00c8c8] bg-black/80 border border-[#00c8c8]/40'
              }`}
            >
              {ft.text}
            </motion.div>
          ))}
        </div>

        {/* Bottom Hint & Dots */}
        <div className="absolute bottom-3 flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#a09b8c] uppercase tracking-widest font-bold">
            Click to earn XP
          </span>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c89b3c]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] opacity-50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] opacity-25"></div>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Master Yi Q Skill (Alpha Strike) */}
      <div className="w-full mt-3 flex items-center justify-between gap-3 bg-[#010a13] border border-[#005a82] p-3 rounded-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerAlphaStrike();
            }}
            disabled={!isAlphaReady}
            className={`relative w-12 h-12 rounded-sm border-2 overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
              isAlphaReady
                ? 'border-[#00c8c8] bg-[#0a1428] shadow-[0_0_15px_#00c8c8] hover:scale-105 active:scale-95'
                : 'border-[#1e2328] bg-[#1e2328] opacity-70 cursor-not-allowed'
            }`}
            title="Q: Alfa Vuruşu"
          >
            <img
              src="https://ddragon.leagueoflegends.com/cdn/14.20.1/img/spell/AlphaStrike.png"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/MasterYi.png';
              }}
              alt="Alpha Strike"
              className="w-full h-full object-cover"
            />
            
            {!isAlphaReady && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center font-bold text-xs text-[#00c8c8]">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#00c8c8]/30"
                  style={{ height: `${100 - alphaCooldownPercent}%` }}
                ></div>
                <span className="relative z-10">Q</span>
              </div>
            )}

            {isAlphaReady && (
              <div className="absolute top-0.5 left-0.5 bg-[#00c8c8] text-black font-black text-[9px] px-1 rounded-xs">
                Q
              </div>
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-xs text-[#c8aa6e]">
                Q: Alfa Vuruşu
              </span>
              {isAlphaReady ? (
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#0a323c] text-[#00c8c8] border border-[#005a82]">
                  READY
                </span>
              ) : (
                <span className="text-[9px] text-[#a09b8c]">COOLDOWN</span>
              )}
            </div>
            <p className="text-[10px] text-[#a09b8c] mt-0.5">
              Deals 4 critical strikes for massive XP burst.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right text-xs">
          <span className="text-[#a09b8c] text-[10px] uppercase tracking-wider">Per Level:</span>
          <span className="font-bold text-[#c8aa6e] text-xs uppercase tracking-wider">
            +1 Hextech Key
          </span>
        </div>
      </div>
    </main>
  );
};
