import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, X, Gem, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PRESTIGE_SHOP_CATALOG } from '../services/dataDragon';

interface PrestigeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrestigeShopModal: React.FC<PrestigeShopModalProps> = ({ isOpen, onClose }) => {
  const { state, buyPrestigeSkin } = useGame();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl h-[88vh] max-h-[820px] bg-[#010a13] border border-[#c8aa6e] rounded-sm overflow-hidden shadow-2xl flex flex-col text-[#f0e6d2]"
        >
          {/* Header */}
          <div className="bg-[#0a1428] px-4 md:px-6 py-4 border-b border-[#1e2328] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-[#010a13] border border-[#c8aa6e] text-[#c8aa6e]">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base md:text-lg text-white uppercase tracking-wider">
                  Mythic & Prestige Skin Workshop
                </h2>
                <p className="text-xs text-[#00c8c8] font-medium">
                  Craft prestigious mythic skins with 5 Gemstones
                </p>
              </div>
            </div>

            {/* Currency Tracker in Header */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#010a13] border border-[#d442f5] px-3 py-1.5 rounded-sm">
                <Gem className="w-4 h-4 text-[#d442f5] animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">
                    {state.gemstones} / 5 Gemstones
                  </span>
                  <span className="text-[10px] text-[#a09b8c]">
                    {state.gemstones >= 5 ? 'Ready to craft' : `${5 - state.gemstones} more needed`}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-sm text-[#a09b8c] hover:text-white hover:bg-[#1e2328] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-[#1e2328]/40 border-b border-[#1e2328] px-4 md:px-6 py-2 flex items-center justify-between text-xs text-[#a09b8c]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00c8c8]" />
              <span>
                <strong>How to get Gemstones?</strong> Every click on Baron Nashor has a <strong>0.10% chance</strong> to drop rare Gemstones.
              </span>
            </div>
          </div>

          {/* Prestige Skins Catalogue Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESTIGE_SHOP_CATALOG.map((item) => {
                const isOwned = state.inventory.some(s => s.championId === item.championId && s.num === item.num);
                const canAfford = state.gemstones >= item.gemstoneCost;

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-sm overflow-hidden border bg-[#010a13] flex flex-col justify-between shadow-xl transition-all ${
                      isOwned
                        ? 'border-emerald-500/70'
                        : canAfford
                        ? 'border-[#c8aa6e]'
                        : 'border-[#1e2328]'
                    }`}
                  >
                    {/* Splash Card */}
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-black">
                      <img
                        src={item.splashUrl}
                        alt={item.skinName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-black/40"></div>

                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase bg-[#c89b3c] text-[#010a13] shadow">
                          PRESTIGE EDITION 👑
                        </span>
                      </div>

                      <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded-xs text-[9px] text-[#c8aa6e] font-bold border border-[#c8aa6e]/40">
                        {item.releaseYear}
                      </div>

                      {isOwned && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-8 h-8" />
                          <span className="text-xs font-bold uppercase">Owned</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#c8aa6e] font-bold uppercase tracking-wider block">
                          {item.championName}
                        </span>
                        <h3 className="text-xs font-bold uppercase text-white mt-0.5">
                          {item.skinName}
                        </h3>
                        <p className="text-[10px] text-[#a09b8c] line-clamp-2 mt-1 leading-tight">
                          {item.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-2 border-t border-[#1e2328]">
                        {isOwned ? (
                          <div className="text-center py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/20 rounded-xs border border-emerald-800">
                            Crafted & Owned
                          </div>
                        ) : (
                          <button
                            onClick={() => buyPrestigeSkin(item)}
                            disabled={!canAfford}
                            className={`w-full py-2 px-3 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              canAfford
                                ? 'bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13]'
                                : 'bg-[#1e2328] text-[#5c5b57] cursor-not-allowed'
                            }`}
                          >
                            <Gem className="w-3.5 h-3.5 text-[#d442f5]" />
                            <span>Craft for 5 Gemstones</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
