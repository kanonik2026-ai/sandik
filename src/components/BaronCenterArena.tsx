import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PixelMasterYi } from './PixelMasterYi';
import { PixelBaron } from './PixelBaron';
import arenaBgImg from '../assets/images/baron_pit_sideview_1787093133474.jpg';

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

  const [isAttacking, setIsAttacking] = useState(false);
  const [isBaronHit, setIsBaronHit] = useState(false);
  const [attackVariant, setAttackVariant] = useState(0);
  const [isAlphaActive, setIsAlphaActive] = useState(false);
  const [slashAngle, setSlashAngle] = useState(-30);
  const [slashPosition, setSlashPosition] = useState({ x: 35, y: 55 });
  const arenaRef = useRef<HTMLDivElement>(null);

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    let clickX = e.clientX;
    let clickY = e.clientY;

    if (arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
      setSlashPosition({ x: relativeX, y: relativeY });
    }

    // Cycle through 3 attack animation variations (horizontal slash, overhead chop, piercing thrust)
    setAttackVariant((prev) => (prev + 1) % 3);
    setSlashAngle(Math.floor(Math.random() * 60) - 45);

    setIsAttacking(true);
    setIsBaronHit(true);

    setTimeout(() => setIsAttacking(false), 140);
    setTimeout(() => setIsBaronHit(false), 150);

    clickBaron(clickX, clickY);
  };

  const handleAlphaStrikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAlphaReady) return;

    setIsAlphaActive(true);
    setIsBaronHit(true);
    triggerAlphaStrike();

    setTimeout(() => {
      setIsAlphaActive(false);
      setIsBaronHit(false);
    }, 650);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-start gap-3 min-w-0 max-w-3xl w-full select-none">
      {/* Top Banner: Next Level XP Bar & Progress */}
      <div className="w-full text-center">
        <div className="flex items-center justify-between px-2 text-xs uppercase tracking-[0.2em] text-[#a09b8c] font-bold">
          <span>Level {state.level}</span>
          <span className="tracking-[0.25em] text-[#00c8c8]">
            Next Level: {Math.max(0, xpNeeded - Math.round(state.xp))} XP
          </span>
          <span>Level {state.level + 1}</span>
        </div>

        <div className="w-full h-2.5 bg-[#1e2328] mx-auto mt-2 rounded-full border border-[#c8aa6e]/30 overflow-hidden shadow-inner p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#00c8c8] via-[#38bdf8] to-[#005a82] rounded-full shadow-[0_0_10px_#00c8c8] transition-all duration-200"
            style={{ width: `${xpProgressPercent}%` }}
          ></div>
        </div>

        {/* Combo Multiplier Tag */}
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

      {/* 2D Side-View Battle Arena Stage (Baron on Left in River, Master Yi on Right on Platform) */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className="relative w-full aspect-[16/9] max-h-[460px] bg-[#040c17] border-2 border-[#005a82]/60 hover:border-[#00c8c8] rounded-sm overflow-hidden shadow-[0_0_45px_rgba(0,0,0,0.95)] cursor-pointer group flex items-center justify-center transition-colors duration-200"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Pixel Art 2D Side-View Background Landscape */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={arenaBgImg}
            alt="Baron Pit 2D Battle Stage"
            className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.1] group-hover:brightness-[0.82] transition-all duration-300"
            referrerPolicy="no-referrer"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Atmospheric Dark Vignette & River Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50"></div>
        </div>

        {/* Floating Purple Gemstone Essence Crystals (Atmosphere from user art) */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-[35%] right-[28%] w-3 h-4 bg-[#d442f5] rotate-45 rounded-xs opacity-75 shadow-[0_0_10px_#d442f5] animate-bounce"></div>
          <div className="absolute top-[48%] right-[22%] w-2 h-3 bg-[#a855f7] -rotate-12 rounded-xs opacity-65 shadow-[0_0_8px_#a855f7] animate-pulse"></div>
          <div className="absolute top-[28%] right-[15%] w-2.5 h-3.5 bg-[#e879f9] rotate-12 rounded-xs opacity-80 shadow-[0_0_12px_#e879f9] animate-bounce" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* 2D Combat Arena Layout */}
        <div className="relative z-20 w-full h-full flex items-end justify-between px-4 sm:px-10 pb-4 sm:pb-6">
          {/* LEFT SIDE: BARON NASHOR (Emerging from River Pit) */}
          <div className="flex flex-col items-center justify-end select-none">
            {/* Baron Health / Level Header Tag */}
            <div className="mb-2 flex items-center gap-2 bg-[#010a13]/90 border border-[#800080]/80 px-2.5 py-0.5 rounded-xs shadow">
              <span className="text-[10px] md:text-xs font-black tracking-widest text-[#d442f5] uppercase font-['Cinzel',serif]">
                BARON NASHOR
              </span>
              <span className="text-[9px] text-[#00ff88] font-bold">
                Lv.{state.level}
              </span>
            </div>

            {/* 2D Side-View Baron Sprite Component */}
            <PixelBaron isHit={isBaronHit} />
          </div>

          {/* RIGHT SIDE: MASTER YI (Standing on Stone Platform Facing Left) */}
          <div className="flex flex-col items-center justify-end select-none">
            {/* Master Yi Header Tag */}
            <div className="mb-2 flex items-center gap-1.5 bg-[#010a13]/90 border border-[#00c8c8]/70 px-2.5 py-0.5 rounded-xs shadow">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping"></div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#00c8c8]">
                Master Yi
              </span>
            </div>

            {/* 2D Side-View Master Yi Sprite Component */}
            <PixelMasterYi
              isAttacking={isAttacking}
              attackVariant={attackVariant}
              isAlphaStrike={isAlphaActive}
            />
          </div>
        </div>

        {/* Real-time Pixel Slash Wave Visual FX on Attack */}
        <AnimatePresence>
          {isAttacking && (
            <motion.div
              initial={{ opacity: 1, scaleX: 0.3 }}
              animate={{ opacity: [1, 0.9, 0], scaleX: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{
                position: 'absolute',
                top: `${slashPosition.y}%`,
                left: `${slashPosition.x}%`,
                transform: `translate(-50%, -50%) rotate(${slashAngle}deg)`,
              }}
              className="pointer-events-none z-30 flex items-center justify-center"
            >
              <div className="w-56 h-2.5 bg-gradient-to-r from-transparent via-[#00ffcc] to-transparent shadow-[0_0_24px_#00ffcc]"></div>
              <div className="absolute w-28 h-1 bg-white shadow-[0_0_14px_#ffffff]"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Numbers (XP / Crits / Gems) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: ft.type === 'crit' ? 1.3 : ft.type === 'gem' ? 1.4 : 1 }}
              animate={{ opacity: 0, y: -65, scale: ft.type === 'crit' ? 1.4 : 1.1 }}
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

        {/* Bottom Click Hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#010a13]/85 px-3 py-0.5 rounded-sm border border-[#1e2328] z-20">
          <Sparkles className="w-3 h-3 text-[#c8aa6e]" />
          <span className="text-[9px] text-[#a09b8c] uppercase tracking-widest font-bold">
            Click to attack Baron
          </span>
        </div>
      </div>

      {/* Bottom Skill Bar: Master Yi Q Skill (Alpha Strike) */}
      <div className="w-full mt-2.5 flex items-center justify-between gap-3 bg-[#010a13] border border-[#005a82] p-3 rounded-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAlphaStrikeClick}
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
                Q: Alfa Vuruşu (Alpha Strike)
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
              4 phantom pixel strikes across the river for massive XP burst.
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
