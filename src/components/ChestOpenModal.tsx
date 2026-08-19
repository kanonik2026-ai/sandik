import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Backpack, X, Check, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRarityColor, getRarityLabel } from '../services/dataDragon';
import { HextechChestAnimation } from './HextechChestAnimation';

export const ChestOpenModal: React.FC = () => {
  const { state, activeChestModal, closeChestModal, claimSkin, disenchantSkin } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnimation, setShowAnimation] = useState(true);

  // Reset animation state whenever active modal opens
  useEffect(() => {
    if (activeChestModal?.isOpen) {
      setCurrentIndex(0);
      setShowAnimation(true);
    }
  }, [activeChestModal?.isOpen]);

  if (!activeChestModal || !activeChestModal.isOpen || activeChestModal.unboxedSkins.length === 0) {
    return null;
  }

  const skins = activeChestModal.unboxedSkins;
  const currentSkin = skins[currentIndex] || skins[0];
  const rarityStyle = getRarityColor(currentSkin.rarity);
  const totalCount = skins.length;
  const hasMore = currentIndex < totalCount - 1;

  const handleClaim = () => {
    claimSkin(currentSkin);
    if (hasMore) {
      setCurrentIndex(prev => prev + 1);
      setShowAnimation(true); // show animation for next chest
    } else {
      closeChestModal();
    }
  };

  const handleDisenchant = () => {
    disenchantSkin(currentSkin);
    if (hasMore) {
      setCurrentIndex(prev => prev + 1);
      setShowAnimation(true);
    } else {
      closeChestModal();
    }
  };

  const handleClaimAll = () => {
    skins.forEach(s => claimSkin(s));
    closeChestModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-lg bg-[#010a13] border-2 border-[#c8aa6e] rounded-sm overflow-hidden shadow-2xl"
        >
          {/* Top Bar */}
          <div className="bg-[#0a1428] px-4 py-3 border-b border-[#1e2328] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00c8c8]" />
              <span className="font-bold text-xs uppercase tracking-widest text-[#f0e6d2]">
                Hextech Loot {totalCount > 1 && `(${currentIndex + 1} / ${totalCount})`}
              </span>
            </div>

            <button
              onClick={closeChestModal}
              className="p-1 rounded-sm text-[#a09b8c] hover:text-[#f0e6d2] hover:bg-[#1e2328] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Chest Opening Animation or Skin Reveal Card */}
          {showAnimation ? (
            <HextechChestAnimation
              onAnimationComplete={() => setShowAnimation(false)}
              rarity={currentSkin.rarity}
              isSoundEnabled={state.soundEnabled}
              volume={state.sfxVolume}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="p-5 md:p-6 flex flex-col items-center text-center"
            >
              {/* High Res Splash Art from Riot Data Dragon */}
              <div className={`relative w-full aspect-[16/9] max-w-md rounded-sm overflow-hidden border-2 shadow-[0_0_35px_rgba(0,0,0,0.9)] group mb-4 ${rarityStyle.border}`}>
                <img
                  src={currentSkin.splashUrl}
                  alt={currentSkin.skinName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 pointer-events-none"></div>

                {/* Rarity Tag */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-0.5 rounded-xs text-[10px] uppercase font-bold shadow ${rarityStyle.badge}`}>
                    {getRarityLabel(currentSkin.rarity)}
                  </span>
                </div>

                {currentSkin.rpValue > 0 && (
                  <div className="absolute top-3 right-3 bg-black/80 px-2 py-0.5 rounded-xs text-[10px] font-bold text-[#c8aa6e] border border-[#c8aa6e]/40">
                    {currentSkin.rpValue} RP Value
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-4 text-left">
                  <span className="text-[10px] font-bold text-[#a09b8c] uppercase tracking-widest block">
                    {currentSkin.championName}
                  </span>
                  <h3 className={`text-lg font-bold tracking-wide drop-shadow-md ${rarityStyle.text}`}>
                    {currentSkin.skinName}
                  </h3>
                </div>
              </div>

              {/* Skin Description / Stats */}
              <div className="w-full max-w-md bg-[#1e2328]/50 p-2.5 rounded-sm border border-[#1e2328] mb-5 flex items-center justify-around text-xs">
                <div>
                  <span className="text-[#a09b8c] text-[10px] uppercase tracking-wider block">Disenchant Value</span>
                  <span className="font-bold text-[#c8aa6e]">+{currentSkin.disenchantValue} Orange Essence</span>
                </div>
                <div className="w-px h-6 bg-[#1e2328]"></div>
                <div>
                  <span className="text-[#a09b8c] text-[10px] uppercase tracking-wider block">Rarity</span>
                  <span className={`font-bold ${rarityStyle.text}`}>
                    {getRarityLabel(currentSkin.rarity)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-md grid grid-cols-2 gap-3">
                <button
                  onClick={handleClaim}
                  className="py-2.5 px-4 rounded-sm bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Backpack className="w-4 h-4" />
                  <span>{hasMore ? 'Claim & Next' : 'Add to Collection'}</span>
                  {hasMore && <ArrowRight className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleDisenchant}
                  className="py-2.5 px-4 rounded-sm bg-[#010a13] border border-[#00c8c8] text-[#00c8c8] hover:bg-[#00c8c8]/10 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Disenchant</span>
                </button>
              </div>

              {totalCount > 1 && (
                <button
                  onClick={handleClaimAll}
                  className="mt-3 text-xs text-[#00c8c8] hover:underline font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add All Remaining Skins</span>
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
