import React from 'react';
import { Volume2, VolumeX, Trophy, Backpack, Crown, RotateCcw, Key, Sparkles, Gem } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRankTier, DDRAGON_ICONS } from '../services/dataDragon';

interface NavbarProps {
  onOpenInventory: () => void;
  onOpenPrestigeShop: () => void;
  onOpenLeaderboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInventory,
  onOpenPrestigeShop,
  onOpenLeaderboard,
}) => {
  const { state, toggleSound, resetProgress } = useGame();
  const rank = getRankTier(state.level);

  const handleReset = () => {
    if (window.confirm('Tüm seviye, anahtar ve envanter verilerinizi sıfırlamak istediğinize emin misiniz?')) {
      resetProgress();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a1428] border-b-2 border-[#c8aa6e] shadow-lg px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Summoner Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#c89b3c] bg-[#1e2328] flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(200,155,60,0.4)]">
              <img
                src={`${DDRAGON_ICONS}/${state.avatarChampionId || 'MasterYi'}.png`}
                alt={state.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#010a13] border border-[#c8aa6e] rounded-sm text-[9px] px-1 font-bold text-[#c8aa6e]">
              L{state.level}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-base md:text-lg leading-tight uppercase tracking-widest text-[#c8aa6e] font-['Cinzel',serif]">
              {state.username || 'Summoner_Yi'}
            </h2>
            <p className="text-xs text-[#00c8c8] font-bold uppercase tracking-wider">
              {rank.title}
            </p>
          </div>
        </div>

        {/* Center: Vibrant Currencies */}
        <div className="flex items-center gap-6 md:gap-8 bg-[#010a13] px-5 py-2 border border-[#1e2328] rounded-sm">
          {/* Hextech Keys */}
          <div className="text-center" title="Hextech Anahtarı">
            <span className="block text-[9px] md:text-[10px] uppercase text-[#a09b8c] tracking-widest font-bold">
              Hextech Keys
            </span>
            <div className="flex items-center justify-center gap-1">
              <Key className="w-3.5 h-3.5 text-[#c8aa6e]" />
              <span className="text-base md:text-xl font-bold text-[#c8aa6e]">{state.keys}</span>
            </div>
          </div>

          <div className="w-px h-6 bg-[#1e2328]"></div>

          {/* Mythic Essence / Mor Cevher */}
          <div className="text-center" title="Mor Cevher (Mythic Essence)">
            <span className="block text-[9px] md:text-[10px] uppercase text-[#a09b8c] tracking-widest font-bold">
              Mythic Essence
            </span>
            <div className="flex items-center justify-center gap-1">
              <Gem className="w-3.5 h-3.5 text-[#d442f5]" />
              <span className="text-base md:text-xl font-bold text-[#d442f5] drop-shadow-[0_0_8px_rgba(212,66,245,0.6)]">
                {state.gemstones}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-[#1e2328]"></div>

          {/* Orange Essence */}
          <div className="text-center" title="Turuncu Öz">
            <span className="block text-[9px] md:text-[10px] uppercase text-[#a09b8c] tracking-widest font-bold">
              Orange Essence
            </span>
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#ff8200] drop-shadow-[0_0_6px_rgba(255,130,0,0.6)]" />
              <span className="text-base md:text-xl font-bold text-[#ff8200] drop-shadow-[0_0_6px_rgba(255,130,0,0.4)]">
                {state.orangeEssence}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="px-3 py-2 bg-[#1e2328] border border-[#c8aa6e]/60 text-[#c8aa6e] hover:bg-[#c8aa6e]/15 font-bold uppercase text-xs rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
            title="Envanterim & Koleksiyon"
          >
            <Backpack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Envanter</span>
            <span className="text-[10px] bg-[#010a13] px-1 py-0.2 border border-[#c8aa6e]/40 text-white">
              {state.inventory.length}
            </span>
          </button>

          {/* Prestige Shop Button */}
          <button
            onClick={onOpenPrestigeShop}
            className="px-3 py-2 bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13] font-bold uppercase text-xs rounded-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(200,155,60,0.4)]"
            title="Prestij Dükkanı"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prestij</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="px-2.5 py-2 bg-[#0a323c]/40 border border-[#005a82] text-[#00c8c8] hover:bg-[#00c8c8]/10 font-bold uppercase text-xs rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
            title="Liderlik Tablosu"
          >
            <Trophy className="w-3.5 h-3.5 text-[#00c8c8]" />
            <span className="hidden md:inline">Sıralama</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-sm border transition-all cursor-pointer ${
              state.soundEnabled
                ? 'bg-[#1e2328] border-[#c8aa6e] text-[#c8aa6e] hover:brightness-125'
                : 'bg-[#010a13] border-[#1e2328] text-[#a09b8c]'
            }`}
            title={state.soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Save Data */}
          <button
            onClick={handleReset}
            className="p-2 rounded-sm bg-[#1e2328] border border-rose-900/60 text-rose-400 hover:border-rose-500 hover:bg-rose-950/40 transition-all cursor-pointer"
            title="Verileri Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
