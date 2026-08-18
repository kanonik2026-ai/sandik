import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { DisclaimerModal } from './components/DisclaimerModal';
import { Navbar } from './components/Navbar';
import { LeftStatsPanel } from './components/LeftStatsPanel';
import { BaronCenterArena } from './components/BaronCenterArena';
import { RightHextechPanel } from './components/RightHextechPanel';
import { ChestOpenModal } from './components/ChestOpenModal';
import { InventoryModal } from './components/InventoryModal';
import { PrestigeShopModal } from './components/PrestigeShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ToastContainer } from './components/ToastContainer';

export function GameApp() {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isPrestigeShopOpen, setIsPrestigeShopOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#010a13] text-[#f0e6d2] flex flex-col selection:bg-[#c8aa6e]/30 selection:text-[#f0e6d2] relative">
      {/* 1. Mandatory Disclaimer & Username Modal */}
      <DisclaimerModal />

      {/* 2. Top Navigation Bar */}
      <Navbar
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenPrestigeShop={() => setIsPrestigeShopOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* 3. Main 3-Column Game Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-4 flex flex-col lg:flex-row items-stretch justify-center gap-4">
        {/* Left Panel: Statistics & Upgrades */}
        <LeftStatsPanel
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenPrestigeShop={() => setIsPrestigeShopOpen(true)}
        />

        {/* Center Panel: Baron Arena */}
        <BaronCenterArena />

        {/* Right Panel: Hextech Chest Crafting & Live Loot */}
        <RightHextechPanel />
      </div>

      {/* 4. Modals & Overlays */}
      <ChestOpenModal />
      <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
      <PrestigeShopModal isOpen={isPrestigeShopOpen} onClose={() => setIsPrestigeShopOpen(false)} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
