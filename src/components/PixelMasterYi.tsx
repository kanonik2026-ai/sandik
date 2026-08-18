import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PixelMasterYiProps {
  isAttacking: boolean;
  attackVariant: number; // 0, 1, 2 for varied slash combos
  isAlphaStrike: boolean;
}

export const PixelMasterYi: React.FC<PixelMasterYiProps> = ({
  isAttacking,
  attackVariant,
  isAlphaStrike,
}) => {
  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none">
      {/* Alpha Strike Phantom Clones (When Q is active) */}
      <AnimatePresence>
        {isAlphaStrike && (
          <>
            {[-40, 40, -80, 80].map((offset, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: offset * 1.5, y: -20, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  x: [offset * 1.5, 0, offset * -1.5],
                  y: [-20, 10, -40],
                  scale: [0.8, 1.2, 0.6],
                }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="absolute z-20"
                style={{ imageRendering: 'pixelated' }}
              >
                <div className="w-20 h-24 filter drop-shadow-[0_0_12px_#00ffaa] opacity-75">
                  <MasterYiPixelSprite isAttacking={true} frame={index} isAlpha={true} />
                </div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Pixel Master Yi Sprite */}
      <motion.div
        animate={
          isAttacking
            ? {
                x: attackVariant === 0 ? 36 : attackVariant === 1 ? 42 : 28,
                y: attackVariant === 2 ? -18 : -8,
                rotate: attackVariant === 0 ? 12 : attackVariant === 1 ? -8 : 18,
                scale: 1.15,
              }
            : {
                x: 0,
                y: [0, -4, 0],
                rotate: 0,
                scale: 1,
              }
        }
        transition={
          isAttacking
            ? { type: 'spring', stiffness: 500, damping: 20 }
            : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative z-10 w-28 h-32 md:w-32 md:h-36 flex items-center justify-center"
        style={{ imageRendering: 'pixelated' }}
      >
        <MasterYiPixelSprite
          isAttacking={isAttacking}
          frame={attackVariant}
          isAlpha={false}
        />

        {/* Pixel Slash Energy Wave on Attack */}
        <AnimatePresence>
          {isAttacking && (
            <motion.div
              initial={{ opacity: 1, scale: 0.6, rotate: attackVariant * 40 - 20 }}
              animate={{ opacity: 0, scale: 1.4, x: 25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute -right-6 top-2 pointer-events-none"
            >
              <svg width="60" height="60" viewBox="0 0 32 32" className="overflow-visible">
                {/* Pixelated curved sword slash arc */}
                <rect x="18" y="4" width="4" height="4" fill="#ffffff" />
                <rect x="22" y="8" width="4" height="4" fill="#00ffcc" />
                <rect x="24" y="12" width="4" height="4" fill="#00e5ff" />
                <rect x="24" y="16" width="4" height="4" fill="#38ef7d" />
                <rect x="20" y="20" width="4" height="4" fill="#c8aa6e" />
                <rect x="14" y="24" width="4" height="4" fill="#c89b3c" />
                <rect x="8" y="26" width="4" height="4" fill="#c8aa6e" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* Pixel Art Vector Renderer for Master Yi */
interface SpriteProps {
  isAttacking: boolean;
  frame: number;
  isAlpha: boolean;
}

const MasterYiPixelSprite: React.FC<SpriteProps> = ({ isAttacking, frame, isAlpha }) => {
  const primaryGlow = isAlpha ? '#00ffcc' : '#39ff14';
  const robeColor = isAlpha ? '#0a323c' : '#c89b3c';
  const darkRobe = isAlpha ? '#001a24' : '#785a28';
  const armorGold = isAlpha ? '#38bdf8' : '#f0e6d2';
  const bladeGlow = isAlpha ? '#00ffff' : '#00ffaa';

  return (
    <svg
      viewBox="0 0 36 36"
      className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* --- SHADOW --- */}
      <ellipse cx="18" cy="33" rx="9" ry="2.5" fill="#000000" opacity="0.5" />

      {/* --- LEGS & BOOTS --- */}
      <rect x="13" y="26" width="3" height="5" fill="#1e2328" />
      <rect x="20" y="26" width="3" height="5" fill="#1e2328" />
      {/* Gold Boot Guards */}
      <rect x="12" y="29" width="4" height="3" fill={robeColor} />
      <rect x="20" y="29" width="4" height="3" fill={robeColor} />
      <rect x="11" y="31" width="5" height="2" fill="#010a13" />
      <rect x="20" y="31" width="5" height="2" fill="#010a13" />

      {/* --- ROBES & SASH (TUNIC) --- */}
      <rect x="13" y="17" width="10" height="9" fill={darkRobe} />
      <rect x="14" y="16" width="8" height="8" fill={robeColor} />
      <rect x="16" y="18" width="4" height="6" fill="#1e2328" />
      {/* Belt / Sash */}
      <rect x="13" y="22" width="10" height="2" fill="#005a82" />
      <rect x="17" y="22" width="2" height="2" fill={armorGold} />

      {/* --- SHOULDERS / PAULDRONS --- */}
      <rect x="10" y="14" width="4" height="4" fill={robeColor} />
      <rect x="22" y="14" width="4" height="4" fill={robeColor} />
      <rect x="9" y="15" width="2" height="2" fill={armorGold} />
      <rect x="25" y="15" width="2" height="2" fill={armorGold} />

      {/* --- HEAD & HELMET --- */}
      {/* Helmet Shell */}
      <rect x="14" y="8" width="8" height="7" fill="#1e2328" />
      <rect x="15" y="7" width="6" height="2" fill={robeColor} />
      <rect x="16" y="5" width="4" height="2" fill={armorGold} />

      {/* 7 Visor Goggles Lights (Iconic Master Yi) */}
      <rect x="15" y="10" width="1.5" height="1.5" fill={primaryGlow} className="animate-pulse" />
      <rect x="17.2" y="9.5" width="1.5" height="1.5" fill={primaryGlow} className="animate-pulse" />
      <rect x="19.5" y="10" width="1.5" height="1.5" fill={primaryGlow} className="animate-pulse" />
      <rect x="15.5" y="12" width="1.5" height="1.5" fill={primaryGlow} className="animate-pulse" />
      <rect x="17.2" y="12.5" width="1.5" height="1.5" fill={primaryGlow} className="animate-pulse" />
      <rect x="19" y="12" width="1.5" height="1.5" fill={primaryGlow} className="animate-pulse" />
      <rect x="17.2" y="11" width="1.5" height="1.5" fill="#ffffff" />

      {/* Chin / Beard guard */}
      <rect x="16" y="14" width="4" height="2" fill="#010a13" />

      {/* --- WUJU KATANA SWORD & ARMS --- */}
      {isAttacking ? (
        // Attack Stance: Sword extended forward with green energy
        <g>
          {/* Right Arm swinging forward */}
          <rect x="22" y="16" width="6" height="3" fill={robeColor} />
          <rect x="26" y="16" width="3" height="3" fill="#1e2328" />

          {/* Glowing Wuju Blade Blade */}
          <rect x="27" y="14" width="2" height="6" fill={robeColor} /> {/* Hilt */}
          <rect x="29" y="15" width="7" height="2" fill={bladeGlow} /> {/* Blade body */}
          <rect x="30" y="14" width="6" height="1" fill="#ffffff" /> {/* Sharp edge */}
          <rect x="36" y="15" width="2" height="1" fill="#ffffff" /> {/* Tip */}
          {/* Energy Sparks */}
          <rect x="31" y="12" width="1" height="1" fill={bladeGlow} />
          <rect x="35" y="18" width="1" height="1" fill={bladeGlow} />
        </g>
      ) : (
        // Idle Stance: Master Yi holding katana at ready angle
        <g>
          {/* Left Hand holding sheath/guard */}
          <rect x="11" y="18" width="3" height="3" fill="#1e2328" />

          {/* Right Arm & Sword tilted upward */}
          <rect x="22" y="17" width="3" height="4" fill={robeColor} />
          <rect x="23" y="19" width="3" height="3" fill="#1e2328" />

          {/* Diagonal Katana */}
          <rect x="24" y="18" width="2" height="2" fill={robeColor} /> {/* Guard */}
          <rect x="25" y="15" width="2" height="3" fill={bladeGlow} />
          <rect x="26" y="11" width="2" height="4" fill={bladeGlow} />
          <rect x="27" y="7" width="2" height="4" fill={bladeGlow} />
          <rect x="28" y="4" width="2" height="3" fill="#ffffff" /> {/* Tip */}
        </g>
      )}
    </svg>
  );
};
