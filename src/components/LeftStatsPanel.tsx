import React from 'react';
import { useGame } from '../context/GameContext';
import { getRankTier } from '../services/dataDragon';
import { AdSenseBanner } from './AdSenseBanner';

interface LeftStatsPanelProps {
  onOpenInventory: () => void;
  onOpenPrestigeShop: () => void;
}

export const LeftStatsPanel: React.FC<LeftStatsPanelProps> = ({
  onOpenInventory,
}) => {
  const { state, xpNeeded, xpProgressPercent } = useGame();
  const rank = getRankTier(state.level);

  // Recent 6 skins for inventory preview
  const recentSkins = state.inventory.slice(-6).reverse();
  const gridSlots = Array.from({ length: 6 }, (_, i) => recentSkins[i] || null);

  return (
    <aside className="w-full lg:w-72 bg-[#010a13] border-r border-[#1e2328] flex flex-col p-4 gap-4 text-[#f0e6d2] select-none">
      {/* 1. Current Statistics Box */}
      <div className="bg-[#0a323c]/20 border border-[#005a82] p-4 rounded-sm">
        <h3 className="text-xs font-bold uppercase text-[#00c8c8] mb-3 tracking-widest flex items-center justify-between">
          <span>Current Statistics</span>
          <span className="text-[10px] text-[#c8aa6e]">{rank.title.split(' ')[0]}</span>
        </h3>
        
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#a09b8c] text-xs uppercase tracking-wider">Level</span>
            <span className="text-white font-bold text-base">{state.level}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#a09b8c] text-xs uppercase tracking-wider">Total Clicks</span>
            <span className="text-white font-bold">{state.totalClicks.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#a09b8c] text-xs uppercase tracking-wider">Skins Owned</span>
            <span className="text-white font-bold">{state.inventory.length}</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[#005a82]/40">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#a09b8c] mb-1.5 font-semibold">
            <span>XP Progress</span>
            <span className="text-[#00c8c8] font-bold">{Math.round(state.xp)} / {xpNeeded}</span>
          </div>
          <div className="w-full h-2 bg-[#010a13] rounded-full overflow-hidden border border-[#005a82] p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#00c8c8] to-[#005a82] rounded-full shadow-[0_0_8px_#00c8c8] transition-all duration-200"
              style={{ width: `${xpProgressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Inventory Preview Box */}
      <div className="bg-[#1e2328]/30 border border-[#c8aa6e]/20 p-4 rounded-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase text-[#c8aa6e] tracking-widest">
              Inventory
            </h3>
            <span className="text-[10px] text-[#a09b8c] uppercase font-semibold">
              {state.inventory.length} Items
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {gridSlots.map((item, idx) => {
              if (item) {
                return (
                  <div
                    key={item.id || idx}
                    onClick={onOpenInventory}
                    title={`${item.championName} - ${item.skinName}`}
                    className="aspect-square bg-[#010a13] border border-[#c8aa6e]/50 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={item.tileUrl || item.splashUrl}
                      alt={item.skinName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#c89b3c]/30 to-transparent"></div>
                    {item.rarity === 'Prestige' && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#d442f5] shadow-[0_0_6px_#d442f5]"></div>
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  className="aspect-square bg-[#010a13] border border-[#1e2328] flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e2328]"></div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onOpenInventory}
          className="w-full mt-4 py-2.5 border border-[#c8aa6e] text-[#c8aa6e] text-[11px] uppercase font-bold hover:bg-[#c8aa6e]/10 tracking-widest transition-colors cursor-pointer"
        >
          View Collection ({state.inventory.length})
        </button>
      </div>

      {/* 3. Google AdSense Unit (Left Sidebar) */}
      <AdSenseBanner
        slotId="9876543210"
        label="Sponsorlu / Reklam"
        className="mt-auto"
      />
    </aside>
  );
};

