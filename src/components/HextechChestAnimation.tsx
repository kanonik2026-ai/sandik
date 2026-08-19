import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, Key, Shield } from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import { LootDrop } from '../types';
import { getRarityColor, getRarityLabel } from '../services/dataDragon';

interface HextechChestAnimationProps {
  drops: LootDrop[];
  onClaimDrop: (drop: LootDrop) => void;
  onClaimAllRemaining?: () => void;
  onClose: () => void;
  isSoundEnabled: boolean;
  volume: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
}

export const HextechChestAnimation: React.FC<HextechChestAnimationProps> = ({
  drops,
  onClaimDrop,
  onClaimAllRemaining,
  onClose,
  isSoundEnabled,
  volume,
}) => {
  // Phase: 'OPENING' (Chest bursting) | 'PORTAL' (Arcane ring reveal)
  const [phase, setPhase] = useState<'OPENING' | 'PORTAL'>('OPENING');
  const [openStep, setOpenStep] = useState<number>(0); // 0: gears unlocking, 1: radiant blast, 2: explode to portal
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioningDrop, setIsTransitioningDrop] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalDrops = drops.length;
  const currentDrop = drops[currentIndex] || drops[0];
  const hasMore = currentIndex < totalDrops - 1;

  // Canvas particle explosion system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    resize();

    // Spawn burst particles on step 1 and step 2
    const spawnExplosion = (count: number) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const colors = ['#00ffff', '#38bdf8', '#c8aa6e', '#ffffff', '#0070ba'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          life: 1,
        });
      }
    };

    // Ambient floating arcane dust motes
    const spawnAmbientMote = () => {
      if (particles.length < 35) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 1.5 + 0.5),
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.4 ? '#00ffff' : '#c8aa6e',
          alpha: Math.random() * 0.7 + 0.3,
          decay: 0.005,
          life: 1,
        });
      }
    };

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (tick % 6 === 0) {
        spawnAmbientMote();
      }

      // Update & render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Trigger burst on timing
    const tSpawn1 = setTimeout(() => spawnExplosion(45), 600);
    const tSpawn2 = setTimeout(() => spawnExplosion(80), 1200);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(tSpawn1);
      clearTimeout(tSpawn2);
    };
  }, []);

  // Trigger opening audio & stages on mount
  useEffect(() => {
    if (isSoundEnabled) {
      soundFx.setVolume(volume);
      soundFx.playChestOpen();
    }

    // Step 0 -> Step 1 (Brackets flare, seams burst with cyan light)
    const t1 = setTimeout(() => {
      setOpenStep(1);
    }, 600);

    // Step 1 -> Step 2 (Full arcane explosion)
    const t2 = setTimeout(() => {
      setOpenStep(2);
    }, 1300);

    // Transition to Portal Reveal
    const t3 = setTimeout(() => {
      setPhase('PORTAL');
      if (currentDrop?.rarity === 'Legendary' || currentDrop?.rarity === 'Ultimate' || currentDrop?.rarity === 'Prestige') {
        if (isSoundEnabled) soundFx.playGemstoneDrop();
      }
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleAddToLoot = () => {
    if (!currentDrop) return;
    
    // Claim current drop
    onClaimDrop(currentDrop);

    if (hasMore) {
      // Arcane shimmer transition to next item in portal
      setIsTransitioningDrop(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsTransitioningDrop(false);
      }, 300);
    } else {
      // All loot collected
      onClose();
    }
  };

  const rarityColor = currentDrop?.rarity ? getRarityColor(currentDrop.rarity) : null;

  return (
    <div className="relative w-full min-h-[520px] md:min-h-[580px] flex flex-col items-center justify-between p-4 md:p-6 overflow-hidden select-none bg-radial from-[#091e30]/80 via-[#030d17]/95 to-[#010a13] text-[#f0e6d2]">
      {/* Background Arcane Canvas for Sparks & Light Motes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* 1. Background Arcane Mist / Particle Rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle cyan smoke bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,_rgba(0,200,200,0.18)_0%,_rgba(10,50,80,0.12)_45%,_transparent_70%)] blur-2xl"></div>
        
        {/* Arcane subtle rotating cosmic ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-[#00c8c8]/10 animate-[spin_60s_linear_infinite] opacity-40"></div>
      </div>

      {/* 2. Top Header: HEXTECH CHEST ❓ */}
      <div className="relative z-20 flex items-center justify-center gap-2 pt-2">
        <h2 className="font-serif uppercase tracking-[0.25em] text-xs md:text-sm text-[#f0e6d2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">
          Hextech Sandığı
        </h2>
        <div className="w-4 h-4 rounded-full border border-[#c8aa6e]/60 flex items-center justify-center bg-[#010a13]/80 cursor-pointer hover:border-[#f0e6d2] transition-colors" title="Hextech Ganimet İçeriği">
          <HelpCircle className="w-2.5 h-2.5 text-[#c8aa6e]" />
        </div>
      </div>

      {/* 3. Main Center Stage: Chest Burst Animation OR Arcane Portal Ring */}
      <div className="relative z-20 flex-1 w-full flex items-center justify-center my-auto">
        <AnimatePresence mode="wait">
          {phase === 'OPENING' ? (
            /* ========================================================================= */
            /* PHASE 1: 3D HEXTECH CHEST WITH SIDE WINGS BURSTING OPEN (00:00 - 00:02)   */
            /* ========================================================================= */
            <motion.div
              key="chest-burst"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.15, filter: 'brightness(2)' }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-sm h-64 md:h-72 flex items-center justify-center"
            >
              {/* Expanding Shockwave Ring on Burst */}
              {openStep >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: [0, 0.9, 0], scale: [0.2, 1.8, 2.5] }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                  <div className="w-64 h-64 rounded-full border-2 border-[#00ffff] shadow-[0_0_30px_#00ffff]"></div>
                </motion.div>
              )}

              {/* Radial Magic Rays on Burst */}
              {openStep >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: [0, 1, 0.7], scale: [0.3, 1.6, 2] }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                  <div className="w-72 h-72 rounded-full bg-[radial-gradient(circle,_rgba(0,255,240,0.6)_0%,_rgba(0,180,216,0.3)_40%,_transparent_75%)] blur-xl"></div>
                </motion.div>
              )}

              {/* Main Chest with Left & Right Wings Container */}
              <motion.div
                animate={
                  openStep === 0
                    ? {
                        rotate: [0, -2, 2, -3, 3, 0],
                        scale: [1, 1.03, 1],
                        y: [0, -3, 0],
                      }
                    : openStep === 1
                    ? {
                        scale: 1.12,
                        y: -10,
                        filter: 'brightness(1.5)',
                      }
                    : {
                        scale: 1.25,
                        y: -15,
                        opacity: 0,
                      }
                }
                transition={{ duration: openStep === 0 ? 0.6 : 0.45 }}
                className="relative flex items-center justify-center"
              >
                {/* SVG LoL Hextech Chest with Flanking Brass Wings */}
                <svg
                  viewBox="0 0 320 220"
                  className="w-72 h-56 sm:w-80 sm:h-60 md:w-96 md:h-72 drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] overflow-visible"
                >
                  <defs>
                    {/* Gold Metallic Gradients */}
                    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f0e6d2" />
                      <stop offset="40%" stopColor="#c89b3c" />
                      <stop offset="100%" stopColor="#785a28" />
                    </linearGradient>
                    <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9b7832" />
                      <stop offset="100%" stopColor="#4a3712" />
                    </linearGradient>

                    {/* Dark Iron Chassis Gradient */}
                    <linearGradient id="ironPlate" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a2e38" />
                      <stop offset="50%" stopColor="#0d1b22" />
                      <stop offset="100%" stopColor="#060c10" />
                    </linearGradient>

                    {/* Glowing Cyan Core Gradient */}
                    <linearGradient id="cyanCore" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="45%" stopColor="#00ffff" />
                      <stop offset="100%" stopColor="#006680" />
                    </linearGradient>

                    {/* Glow Filter */}
                    <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ground Shadow */}
                  <ellipse cx="160" cy="190" rx="90" ry="16" fill="#000000" opacity="0.75" />

                  {/* ================================================================= */}
                  {/* LEFT WING / BRACKET: Curved brass arm flaring outward on open   */}
                  {/* ================================================================= */}
                  <motion.g
                    animate={
                      openStep >= 1
                        ? { x: -26, rotate: -10, originX: '110px', originY: '140px' }
                        : { x: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    {/* Left Wing Outer Arc */}
                    <path
                      d="M 100 80 C 85 100 80 140 100 175 L 108 170 C 92 140 96 105 108 85 Z"
                      fill="url(#goldLight)"
                      stroke="#4a3712"
                      strokeWidth="1.5"
                    />
                    {/* Left Wing Support Base */}
                    <path
                      d="M 98 165 L 80 182 L 95 185 L 108 170 Z"
                      fill="url(#goldDark)"
                      stroke="#4a3712"
                      strokeWidth="1"
                    />
                    {/* Left Wing Cyan Inner Rune Inset */}
                    <path
                      d="M 98 95 C 88 120 88 145 98 162"
                      stroke="#00ffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      filter="url(#cyanGlow)"
                      opacity={openStep >= 1 ? 1 : 0.7}
                    />
                  </motion.g>

                  {/* ================================================================= */}
                  {/* RIGHT WING / BRACKET: Symmetrical brass arm flaring outward       */}
                  {/* ================================================================= */}
                  <motion.g
                    animate={
                      openStep >= 1
                        ? { x: 26, rotate: 10, originX: '210px', originY: '140px' }
                        : { x: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    {/* Right Wing Outer Arc */}
                    <path
                      d="M 220 80 C 235 100 240 140 220 175 L 212 170 C 228 140 224 105 212 85 Z"
                      fill="url(#goldLight)"
                      stroke="#4a3712"
                      strokeWidth="1.5"
                    />
                    {/* Right Wing Support Base */}
                    <path
                      d="M 222 165 L 240 182 L 225 185 L 212 170 Z"
                      fill="url(#goldDark)"
                      stroke="#4a3712"
                      strokeWidth="1"
                    />
                    {/* Right Wing Cyan Inner Rune Inset */}
                    <path
                      d="M 222 95 C 232 120 232 145 222 162"
                      stroke="#00ffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      filter="url(#cyanGlow)"
                      opacity={openStep >= 1 ? 1 : 0.7}
                    />
                  </motion.g>

                  {/* ================================================================= */}
                  {/* CHEST BODY: Heavy Iron Cube with Gold Chamfers & Front U-Brace    */}
                  {/* ================================================================= */}
                  <g>
                    {/* Main Dark Body */}
                    <rect
                      x="115"
                      y="85"
                      width="90"
                      height="85"
                      rx="4"
                      fill="url(#ironPlate)"
                      stroke="url(#goldDark)"
                      strokeWidth="3"
                    />

                    {/* Corner Gold Reinforcements */}
                    <polygon points="115,85 130,85 115,100" fill="url(#goldLight)" />
                    <polygon points="205,85 190,85 205,100" fill="url(#goldLight)" />
                    <polygon points="115,170 130,170 115,155" fill="url(#goldLight)" />
                    <polygon points="205,170 190,170 205,155" fill="url(#goldLight)" />

                    {/* Front Lower U-Brace Bracket */}
                    <path
                      d="M 130 110 C 130 150 190 150 190 110 L 196 110 C 196 160 124 160 124 110 Z"
                      fill="url(#goldLight)"
                      stroke="#4a3712"
                      strokeWidth="1"
                    />
                    <rect x="156" y="152" width="8" height="18" fill="url(#goldLight)" />
                  </g>

                  {/* ================================================================= */}
                  {/* CHEST LID: Top Arc & Hinge (Lifts up and tilts on burst)          */}
                  {/* ================================================================= */}
                  <motion.g
                    animate={
                      openStep >= 1
                        ? { y: -30, rotate: -18, originX: '160px', originY: '70px' }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.38, ease: 'easeOut' }}
                  >
                    {/* Lid Main Trapeze */}
                    <polygon
                      points="110,85 125,55 195,55 210,85"
                      fill="url(#ironPlate)"
                      stroke="url(#goldLight)"
                      strokeWidth="3"
                    />
                    {/* Lid Top Gold Crest / Lock Hook */}
                    <polygon points="135,55 145,45 175,45 185,55" fill="url(#goldLight)" />
                    <rect x="150" y="42" width="20" height="8" rx="2" fill="url(#goldLight)" stroke="#4a3712" strokeWidth="1" />
                    {/* Gold Ribs on Lid */}
                    <line x1="145" y1="55" x2="140" y2="85" stroke="url(#goldLight)" strokeWidth="2.5" />
                    <line x1="175" y1="55" x2="180" y2="85" stroke="url(#goldLight)" strokeWidth="2.5" />
                  </motion.g>

                  {/* ================================================================= */}
                  {/* CENTRAL HEXTECH CRYSTAL CORE (Blinds with light when opening)     */}
                  {/* ================================================================= */}
                  <motion.g
                    animate={
                      openStep >= 1
                        ? { scale: [1, 1.4, 2], opacity: [1, 1, 0.2] }
                        : { scale: [1, 1.08, 1] }
                    }
                    transition={{ duration: 0.6, repeat: openStep === 0 ? Infinity : 0 }}
                  >
                    {/* Outer Gold Hex Rim */}
                    <polygon
                      points="160,82 178,95 178,125 160,138 142,125 142,95"
                      fill="url(#goldLight)"
                      stroke="#4a3712"
                      strokeWidth="1.5"
                    />

                    {/* Cyan Glowing Crystal Facet */}
                    <polygon
                      points="160,86 174,97 174,123 160,134 146,123 146,97"
                      fill="url(#cyanCore)"
                      filter="url(#cyanGlow)"
                    />

                    {/* Center White Hot Slit / Core */}
                    <line
                      x1="160"
                      y1="94"
                      x2="160"
                      y2="126"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </motion.g>

                  {/* Radiant light beams bursting from inside on Step 1 */}
                  {openStep >= 1 && (
                    <g>
                      <line x1="160" y1="85" x2="160" y2="10" stroke="#00ffff" strokeWidth="6" filter="url(#cyanGlow)" opacity="0.9" />
                      <line x1="130" y1="85" x2="60" y2="25" stroke="#00ffff" strokeWidth="4" filter="url(#cyanGlow)" opacity="0.8" />
                      <line x1="190" y1="85" x2="260" y2="25" stroke="#00ffff" strokeWidth="4" filter="url(#cyanGlow)" opacity="0.8" />
                    </g>
                  )}
                </svg>
              </motion.div>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* PHASE 2: THE ARCANE PORTAL RING & REWARD REVEAL (00:03 - 00:14 in Video) */
            /* ========================================================================= */
            <motion.div
              key="portal-reveal"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative flex flex-col items-center justify-center w-full max-w-md"
            >
              {/* Top Gold Filigree Accent: -- ∧ -- */}
              <div className="flex items-center justify-center gap-3 w-full max-w-[280px] mb-2 opacity-80">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c8aa6e] to-[#c8aa6e]"></div>
                <div className="w-3 h-3 rotate-45 border-t border-l border-[#c8aa6e] bg-[#010a13]"></div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c8aa6e] to-[#c8aa6e]"></div>
              </div>

              {/* The Circular Arcane Portal Frame */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
                {/* SVG Rotating Arcane Notched Rings & Cyan Aura */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
                >
                  <defs>
                    <filter id="portalGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Outer Cyan Soft Glow Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="#00c8c8"
                    strokeWidth="1.5"
                    opacity="0.85"
                    filter="url(#portalGlow)"
                  />

                  {/* Inner Rotating Tech Notches / Runes */}
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="#00c8c8"
                    strokeWidth="2"
                    strokeDasharray="4 3 1 3 8 4 1 4"
                    opacity="0.7"
                    className="animate-[spin_25s_linear_infinite]"
                    style={{ transformOrigin: 'center' }}
                  />

                  {/* Slower Counter-Rotating Outer Perimeter Tick Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="#005a82"
                    strokeWidth="1"
                    strokeDasharray="1 5"
                    opacity="0.6"
                    className="animate-[spin_40s_linear_infinite_reverse]"
                    style={{ transformOrigin: 'center' }}
                  />

                  {/* Four Symmetrical Gold Compass Nodes */}
                  <circle cx="100" cy="8" r="2.5" fill="#c8aa6e" />
                  <circle cx="100" cy="192" r="2.5" fill="#c8aa6e" />
                  <circle cx="8" cy="100" r="2.5" fill="#c8aa6e" />
                  <circle cx="192" cy="100" r="2.5" fill="#c8aa6e" />
                </svg>

                {/* Circular Portal Window Mask */}
                <div className="relative w-[86%] h-[86%] rounded-full overflow-hidden bg-[#020b14] border-2 border-[#00c8c8]/60 shadow-[inset_0_0_35px_rgba(0,200,200,0.4),0_0_25px_rgba(0,200,200,0.35)] flex items-center justify-center z-10">
                  <AnimatePresence mode="wait">
                    {currentDrop && !isTransitioningDrop ? (
                      <motion.div
                        key={currentDrop.id || currentIndex}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.35 }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        {currentDrop.type === 'skin' && currentDrop.skin ? (
                          /* High-Res Splash Art cropped inside the portal circle */
                          <div className="relative w-full h-full">
                            <img
                              src={currentDrop.skin.splashUrl}
                              alt={currentDrop.title}
                              className="w-full h-full object-cover scale-110 hover:scale-115 transition-transform duration-700"
                            />
                            {/* Cosmic circular edge vignette */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(1,10,19,0.7)_80%,_rgba(1,10,19,0.95)_100%)] pointer-events-none"></div>
                          </div>
                        ) : currentDrop.type === 'key' ? (
                          /* 3D Floating Hextech Key */
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-5 rounded-full bg-gradient-to-b from-[#092233] to-[#010a13] border border-[#c8aa6e] shadow-[0_0_20px_rgba(0,200,200,0.5)] animate-pulse">
                              <Key className="w-16 h-16 text-[#c8aa6e] drop-shadow-[0_0_10px_#00c8c8]" />
                            </div>
                          </div>
                        ) : currentDrop.type === 'chest' ? (
                          /* 3D Floating Chest Icon */
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-5 rounded-full bg-gradient-to-b from-[#092233] to-[#010a13] border border-[#c8aa6e] shadow-[0_0_20px_rgba(200,170,110,0.5)]">
                              <Shield className="w-16 h-16 text-[#c8aa6e] drop-shadow-[0_0_10px_#00c8c8]" />
                            </div>
                          </div>
                        ) : currentDrop.type === 'gemstone' ? (
                          /* Mor Cevher (Mythic Essence) */
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-6 rounded-full bg-[#1a0826] border border-[#d442f5] shadow-[0_0_25px_rgba(212,66,245,0.6)] animate-pulse">
                              <Sparkles className="w-16 h-16 text-[#d442f5]" />
                            </div>
                          </div>
                        ) : (
                          /* Orange Essence / Default Material */
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-5 rounded-full bg-gradient-to-b from-[#2a1705] to-[#010a13] border border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                              <Sparkles className="w-16 h-16 text-[#f59e0b]" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Gold Filigree Accent: -- ∨ -- */}
              <div className="flex items-center justify-center gap-3 w-full max-w-[280px] mt-2 opacity-80">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c8aa6e] to-[#c8aa6e]"></div>
                <div className="w-3 h-3 rotate-45 border-b border-r border-[#c8aa6e] bg-[#010a13]"></div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c8aa6e] to-[#c8aa6e]"></div>
              </div>

              {/* 4. Drop Information (Title, Rarity Badges, Diamond Progress Dots) */}
              <motion.div
                key={`info-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 flex flex-col items-center text-center max-w-sm px-4"
              >
                {/* Glowing Cyan Triangle Indicator */}
                <div className="text-[#00c8c8] text-xs leading-none mb-1 drop-shadow-[0_0_6px_#00c8c8]">
                  ▲
                </div>

                {/* Loot Title: e.g. DRX Maokai / Hextech Key */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-[#f0e6d2] drop-shadow-md">
                  {currentDrop?.title || 'Hextech Loot'}
                </h3>

                {/* Subtitle / Rarity Badges */}
                <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-[#a09b8c]">
                  {currentDrop?.type === 'skin' ? (
                    <>
                      <span className={`font-semibold flex items-center gap-1 ${rarityColor?.text || 'text-[#00c8c8]'}`}>
                        <span className="text-[10px]">▲</span>
                        <span>{currentDrop.subtitle || getRarityLabel(currentDrop.rarity || 'Epic')}</span>
                      </span>
                      <span className="text-[#5c5b57]">•</span>
                      <span className="text-[11px] text-[#c8aa6e] flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>Hatıra İçerik</span>
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-[#c8aa6e] tracking-wider uppercase text-[11px]">
                      {currentDrop?.subtitle || 'Malzeme'}
                    </span>
                  )}
                </div>

                {/* Diamond Progress Indicators: ◇ ◆ ◇ */}
                {totalDrops > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3.5">
                    {drops.map((_, idx) => (
                      <span
                        key={idx}
                        className={`text-[11px] transition-all ${
                          idx === currentIndex
                            ? 'text-[#c8aa6e] scale-125 drop-shadow-[0_0_4px_#c8aa6e]'
                            : idx < currentIndex
                            ? 'text-[#785a28]'
                            : 'text-[#3c3c41]'
                        }`}
                      >
                        {idx === currentIndex ? '◆' : '◇'}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Bottom Action Button: ADD TO LOOT (GANİMETE EKLE) */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center gap-2 pt-3 pb-1">
        {phase === 'PORTAL' ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleAddToLoot}
              className="relative px-8 py-2.5 bg-gradient-to-b from-[#1e2837] via-[#0d1722] to-[#08101a] border-2 border-[#c8aa6e] hover:border-[#f0e6d2] text-[#f0e6d2] hover:text-white font-bold tracking-[0.2em] text-xs uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_15px_rgba(200,170,110,0.3)] hover:brightness-125 transition-all cursor-pointer rounded-xs flex items-center justify-center gap-2 min-w-[190px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c8aa6e]" />
              <span>{hasMore ? 'Ganimete Ekle' : 'Ganimete Ekle'}</span>
            </button>

            {totalDrops > 1 && onClaimAllRemaining && (
              <button
                onClick={onClaimAllRemaining}
                className="text-[11px] font-semibold text-[#a09b8c] hover:text-[#00c8c8] underline uppercase tracking-wider cursor-pointer px-3 py-1 transition-colors"
              >
                Tümünü Al ({totalDrops - currentIndex})
              </button>
            )}
          </div>
        ) : (
          <div className="h-10 flex items-center justify-center">
            <span className="text-[11px] text-[#00c8c8] font-bold tracking-widest uppercase animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Açılıyor...</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
