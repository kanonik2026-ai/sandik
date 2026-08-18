import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Backpack, X, Search, Eye } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SkinItem } from '../types';
import { getRarityColor, getRarityLabel } from '../services/dataDragon';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
  const { state } = useGame();
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkinDetail, setSelectedSkinDetail] = useState<SkinItem | null>(null);

  if (!isOpen) return null;

  const filteredSkins = state.inventory.filter((skin) => {
    const matchesRarity = selectedRarity === 'ALL' || skin.rarity === selectedRarity;
    const matchesSearch =
      skin.skinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skin.championName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRarity && matchesSearch;
  });

  const totalRpValue = state.inventory.reduce((acc, curr) => acc + (curr.rpValue || 0), 0);
  const prestigeCount = state.inventory.filter(s => s.rarity === 'Prestige' || s.isPrestige).length;

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
                <Backpack className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base md:text-lg text-white uppercase tracking-wider">
                  Skin Collection & Inventory
                </h2>
                <p className="text-xs text-[#00c8c8] font-medium">
                  {state.inventory.length} Skins Owned • {prestigeCount} Prestige • {totalRpValue.toLocaleString()} RP Value
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-[#a09b8c] hover:text-white hover:bg-[#1e2328] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-3 bg-[#1e2328]/30 border-b border-[#1e2328] flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a09b8c]" />
              <input
                type="text"
                placeholder="Search champion or skin name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#010a13] border border-[#005a82] focus:border-[#00c8c8] rounded-sm text-xs md:text-sm text-[#f0e6d2] placeholder-[#5c5b57] focus:outline-none"
              />
            </div>

            {/* Rarity Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'Prestige', label: 'Prestige 👑' },
                { key: 'Ultimate', label: 'Ultimate' },
                { key: 'Legendary', label: 'Legendary' },
                { key: 'Epic', label: 'Epic' },
                { key: 'Common', label: 'Standard' },
              ].map((tab) => {
                const isActive = selectedRarity === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedRarity(tab.key)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#c89b3c] text-[#010a13]'
                        : 'bg-[#010a13] text-[#a09b8c] hover:text-white border border-[#1e2328]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skins Grid Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {filteredSkins.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-[#5c5b57]">
                <Backpack className="w-16 h-16 opacity-30 mb-3" />
                <p className="text-sm font-semibold uppercase">No matching skins in inventory.</p>
                <p className="text-xs text-[#a09b8c] mt-1">Level up by defeating Baron to earn keys and open Hextech chests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {filteredSkins.map((skin) => {
                  const rarityStyle = getRarityColor(skin.rarity);
                  return (
                    <div
                      key={skin.id}
                      onClick={() => setSelectedSkinDetail(skin)}
                      className={`relative rounded-sm overflow-hidden border bg-[#010a13] cursor-pointer group shadow-lg transition-all flex flex-col ${rarityStyle.border}`}
                    >
                      {/* Splash Thumbnail */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                        <img
                          src={skin.splashUrl}
                          alt={skin.skinName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {/* Rarity Badge */}
                        <div className="absolute top-1.5 left-1.5">
                          <span className={`px-1.5 py-0.2 rounded-xs text-[9px] font-bold uppercase shadow ${rarityStyle.badge}`}>
                            {getRarityLabel(skin.rarity)}
                          </span>
                        </div>

                        {/* View overlay icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <Eye className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-[#a09b8c] font-bold uppercase tracking-wider block truncate">
                            {skin.championName}
                          </span>
                          <h4 className={`text-xs font-bold truncate ${rarityStyle.text}`}>
                            {skin.skinName}
                          </h4>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[9px] text-[#a09b8c] pt-1.5 border-t border-[#1e2328]">
                          {skin.rpValue > 0 ? (
                            <span className="text-[#c8aa6e] font-semibold">{skin.rpValue} RP</span>
                          ) : (
                            <span className="text-[#d442f5] font-semibold">Prestige</span>
                          )}
                          <span className="text-emerald-400 font-bold uppercase">Owned</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lightbox Modal for Selected Skin View */}
          {selectedSkinDetail && (
            <div
              onClick={() => setSelectedSkinDetail(null)}
              className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full bg-[#010a13] border-2 border-[#c8aa6e] rounded-sm overflow-hidden shadow-2xl"
              >
                <div className="relative aspect-[16/9] w-full">
                  <img
                    src={selectedSkinDetail.splashUrl}
                    alt={selectedSkinDetail.skinName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-black/50"></div>

                  <button
                    onClick={() => setSelectedSkinDetail(null)}
                    className="absolute top-4 right-4 p-2 rounded-sm bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-widest text-[#a09b8c]">
                        {selectedSkinDetail.championName}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold uppercase text-white font-['Cinzel',serif]">
                        {selectedSkinDetail.skinName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-xs text-xs font-bold uppercase ${getRarityColor(selectedSkinDetail.rarity).badge}`}>
                          {getRarityLabel(selectedSkinDetail.rarity)}
                        </span>
                        {selectedSkinDetail.rpValue > 0 && (
                          <span className="text-xs text-[#c8aa6e] font-semibold">
                            {selectedSkinDetail.rpValue} RP Value
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
