import React from 'react';
import { Backpack, Crown, Sparkles, Key, Gem, Swords, TrendingUp } from 'lucide-react';
import { useGame, UPGRADE_DEFINITIONS } from '../context/GameContext';
import { getRankTier, DDRAGON_ICONS } from '../services/dataDragon';

interface LeftStatsPanelProps {
  onOpenInventory: () => void;
  onOpenPrestigeShop: () => void;
}

export const LeftStatsPanel: React.FC<LeftStatsPanelProps> = ({
  onOpenInventory,
  onOpenPrestigeShop,
}) => {
  const { state, xpNeeded, xpProgressPercent, buyUpgrade } = useGame();
  const rank = getRankTier(state.level);

  // Take first 6 skins or placeholders for the Vibrant Palette inventory grid
  const recentSkins = state.inventory.slice(-6).reverse();
  const gridSlots = Array.from({ length: 6 }, (_, i) => recentSkins[i] || null);

  return (
    <aside className="w-full lg:w-72 bg-[#010a13] border-r border-[#1e2328] flex flex-col p-4 gap-4 text-[#f0e6d2]">
      {/* 1. Current Statistics Box (Vibrant Palette style) */}
      <div className="bg-[#0a323c]/20 border border-[#005a82] p-4 rounded-sm">
        <h3 className="text-xs font-bold uppercase text-[#00c8c8] mb-3 tracking-widest flex items-center justify-between">
          <span>Current Statistics</span>
          <span className="text-[10px] text-[#c8aa6e]">{rank.title.split(' ')[0]}</span>
        </h3>
        
        <div className="space-y-2 text-sm">
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
          <div className="flex justify-between items-center">
            <span className="text-[#a09b8c] text-xs uppercase tracking-wider">Auto DPS</span>
            <span className="text-[#00c8c8] font-bold">{state.autoDps}/s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#a09b8c] text-xs uppercase tracking-wider">Crit Chance</span>
            <span className="text-rose-400 font-bold">%{Math.round(state.critChance * 100)}</span>
          </div>
        </div>

        {/* XP Mini Bar */}
        <div className="mt-3 pt-3 border-t border-[#005a82]/40">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#a09b8c] mb-1">
            <span>XP Progress</span>
            <span className="text-[#00c8c8] font-bold">{Math.round(state.xp)} / {xpNeeded}</span>
          </div>
          <div className="w-full h-1.5 bg-[#010a13] rounded-full overflow-hidden border border-[#005a82]">
            <div
              className="h-full bg-gradient-to-r from-[#00c8c8] to-[#005a82] shadow-[0_0_8px_#00c8c8] transition-all duration-200"
              style={{ width: `${xpProgressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Inventory Mini Grid Box (Vibrant Palette layout) */}
      <div className="bg-[#1e2328]/30 border border-[#c8aa6e]/20 p-4 rounded-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-[#c8aa6e] tracking-widest">
            Inventory
          </h3>
          <span className="text-[10px] text-[#a09b8c] uppercase">
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

        <button
          onClick={onOpenInventory}
          className="w-full mt-4 py-2 border border-[#c8aa6e] text-[#c8aa6e] text-[10px] uppercase font-bold hover:bg-[#c8aa6e]/10 tracking-widest transition-colors cursor-pointer"
        >
          View Collection ({state.inventory.length})
        </button>
      </div>

      {/* 3. Upgrades & Skill Shop */}
      <div className="bg-[#1e2328]/30 border border-[#005a82]/40 p-4 rounded-sm flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-[#00c8c8] tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00c8c8]" />
            Upgrades
          </h3>
          <span className="text-[9px] uppercase tracking-wider text-[#a09b8c]">XP / T. Öz</span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
          {UPGRADE_DEFINITIONS.map((upgrade) => {
            const currentLevel = state.upgrades[upgrade.id] || 0;
            const isMax = currentLevel >= upgrade.maxLevel;
            const cost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
            const canAfford = upgrade.costCurrency === 'xp' ? state.xp >= cost : state.orangeEssence >= cost;

            return (
              <div
                key={upgrade.id}
                className={`p-2 rounded-sm border text-xs transition-all ${
                  isMax
                    ? 'bg-[#010a13] border-emerald-800/40 opacity-70'
                    : canAfford
                    ? 'bg-[#010a13] border-[#005a82] hover:border-[#00c8c8]'
                    : 'bg-[#010a13]/60 border-[#1e2328]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm p-1 bg-[#1e2328] border border-[#1e2328] rounded-sm">
                      {upgrade.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white text-[11px] uppercase">
                          {upgrade.name}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 bg-[#1e2328] text-[#c8aa6e] font-bold">
                          L{currentLevel}/{upgrade.maxLevel}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#a09b8c] leading-tight mt-0.5">
                        {upgrade.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#1e2328]">
                  <span className="text-[10px] font-bold">
                    {isMax ? (
                      <span className="text-emerald-400">MAX</span>
                    ) : upgrade.costCurrency === 'xp' ? (
                      <span className={state.xp >= cost ? 'text-[#00c8c8]' : 'text-[#5c5b57]'}>
                        {cost} XP
                      </span>
                    ) : (
                      <span className={state.orangeEssence >= cost ? 'text-[#c8aa6e]' : 'text-[#5c5b57]'}>
                        {cost} T.Öz
                      </span>
                    )}
                  </span>

                  {!isMax && (
                    <button
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-sm transition-colors cursor-pointer ${
                        canAfford
                          ? 'bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13]'
                          : 'bg-[#1e2328] text-[#5c5b57] cursor-not-allowed'
                      }`}
                    >
                      Buy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
