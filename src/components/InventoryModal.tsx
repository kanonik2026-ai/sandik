import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  ChevronDown,
  LayoutGrid,
  Shield,
  Smile,
  Sparkles,
  HelpCircle,
  Plus,
  Flame,
  Check,
  RefreshCw,
  Trash2,
  Lock,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SkinItem, SkinRarity } from '../types';
import { getRarityColor, getRarityLabel, getRandomSkinFromPool } from '../services/dataDragon';
import { soundFx } from '../services/soundEffects';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrestigeShop?: () => void;
}

type CategoryType =
  | 'ALL'
  | 'MATERIALS'
  | 'CHAMPIONS'
  | 'SKINS'
  | 'EMOTES'
  | 'ICONS'
  | 'ETERNALS'
  | 'MYTHIC';

interface MaterialItem {
  id: string;
  name: string;
  category: 'MATERIALS' | 'MYTHIC';
  count: number;
  iconType: 'chest' | 'key' | 'orange_essence' | 'gemstone' | 'capsule';
  description: string;
  rarity: SkinRarity;
}

interface ChampionShard {
  id: string;
  championId: string;
  championName: string;
  title: string;
  avatarUrl: string;
  beValue: number;
}

const SAMPLE_CHAMPION_SHARDS: ChampionShard[] = [
  {
    id: 'shard_masteryi',
    championId: 'MasterYi',
    championName: 'Master Yi',
    title: 'Wuju Üstadı',
    avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/MasterYi.png',
    beValue: 270,
  },
  {
    id: 'shard_yasuo',
    championId: 'Yasuo',
    championName: 'Yasuo',
    title: 'Günahkâr Kılıç',
    avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/Yasuo.png',
    beValue: 960,
  },
  {
    id: 'shard_ahri',
    championId: 'Ahri',
    championName: 'Ahri',
    title: 'Dokuz Kuyruklu Tilki',
    avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/Ahri.png',
    beValue: 960,
  },
  {
    id: 'shard_jinx',
    championId: 'Jinx',
    championName: 'Jinx',
    title: 'Delifişek',
    avatarUrl: 'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/Jinx.png',
    beValue: 960,
  },
];

const SAMPLE_EMOTES = [
  {
    id: 'emote_pengu',
    name: 'İyi İş Pengu!',
    description: 'Şapkasını kaldıran centilmen Pengu ifadesi.',
    icon: '🐧',
  },
  {
    id: 'emote_yi_eyes',
    name: 'Wuju Odaklanması',
    description: '7 parlayan yeşil gözlük ifadesi.',
    icon: '🕶️',
  },
  {
    id: 'emote_gg',
    name: 'GG WP Baron',
    description: 'Baron Nashor zafer kupası.',
    icon: '🏆',
  },
];

const SAMPLE_ETERNALS = [
  {
    id: 'eternal_yi',
    championName: 'Master Yi',
    name: '1. Seri Ebedi Seti',
    description: 'Alfa Vuruşu ile kaçınılan yetenekler ve biçilen şampiyonlar sayacı.',
  },
  {
    id: 'eternal_yasuo',
    championName: 'Yasuo',
    name: '1. Seri Ebedi Seti',
    description: 'Rüzgâr Duvarı ile engellenen hasar ve hortum isabetleri.',
  },
];

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onOpenPrestigeShop,
}) => {
  const { state, openChest, claimSkin, disenchantSkin, addToast } = useGame();

  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'alpha' | 'rarity' | 'newest'>('alpha');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'skin' | 'material' | 'champion' | 'emote' | 'eternal';
    data: any;
  } | null>(null);

  // Selected skins for re-roll (Yeniden İşle) 3-for-1
  const [rerollSelectedIds, setRerollSelectedIds] = useState<string[]>([]);
  const [isRerollMode, setIsRerollMode] = useState<boolean>(false);

  if (!isOpen) return null;

  // Materials list derived from live state
  const materials: MaterialItem[] = [
    {
      id: 'mat_hextech_chest',
      name: 'Hextech Sandığı',
      category: 'MATERIALS',
      count: state.keys > 0 ? Math.max(1, Math.floor(state.keys / 1)) : 1,
      iconType: 'chest',
      description: 'Hextech Anahtarı ile açılır. İçerisinden Şampiyon, Kostüm veya İhtişamlı içerikler çıkar.',
      rarity: 'Common',
    },
    {
      id: 'mat_hextech_key',
      name: 'Hextech Anahtarı',
      category: 'MATERIALS',
      count: state.keys,
      iconType: 'key',
      description: 'Hextech Sandıklarını açmak için kullanılır. Baron seviye atlamalarında kazanılır.',
      rarity: 'Common',
    },
    {
      id: 'mat_orange_essence',
      name: 'Turuncu Öz',
      category: 'MATERIALS',
      count: state.orangeEssence,
      iconType: 'orange_essence',
      description: 'Kostüm kristallerini kalıcı kostümlere dönüştürmek ve geliştirmeler yapmak için kullanılır.',
      rarity: 'Epic',
    },
    {
      id: 'mat_mythic_essence',
      name: 'İhtişamlı Öz (Mor Cevher)',
      category: 'MYTHIC',
      count: state.gemstones,
      iconType: 'gemstone',
      description: 'Prestij ve İhtişamlı Mağaza kostümlerini üretmek için kullanılan en nadir para birimi.',
      rarity: 'Mythic',
    },
  ];

  // Filter skins
  let filteredSkins = [...state.inventory].filter((skin) => {
    const matchesSearch =
      skin.skinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skin.championName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Sort skins
  if (sortOrder === 'alpha') {
    filteredSkins.sort((a, b) => a.skinName.localeCompare(b.skinName));
  } else if (sortOrder === 'rarity') {
    const rarityWeight: Record<SkinRarity, number> = {
      Prestige: 6,
      Mythic: 5,
      Ultimate: 4,
      Legendary: 3,
      Epic: 2,
      Common: 1,
    };
    filteredSkins.sort((a, b) => (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0));
  } else if (sortOrder === 'newest') {
    filteredSkins.sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
  }

  // Handle re-roll action (Yeniden İşle)
  const handleToggleRerollSkin = (skinId: string) => {
    soundFx.playButtonClick();
    if (rerollSelectedIds.includes(skinId)) {
      setRerollSelectedIds((prev) => prev.filter((id) => id !== skinId));
    } else {
      if (rerollSelectedIds.length >= 3) {
        addToast({
          title: 'Maksimum 3 Kostüm',
          description: 'Yeniden işleme için en fazla 3 kostüm seçebilirsin.',
          type: 'info',
        });
        return;
      }
      setRerollSelectedIds((prev) => [...prev, skinId]);
    }
  };

  const handleExecuteReroll = () => {
    if (rerollSelectedIds.length !== 3) {
      addToast({
        title: '3 Kostüm Gerekli',
        description: 'Yeniden işlemek için tam 3 adet kostüm seçmelisin.',
        type: 'info',
      });
      return;
    }

    soundFx.playChestOpen();
    const newSkin = getRandomSkinFromPool();
    claimSkin(newSkin);

    addToast({
      title: '✨ YENİDEN İŞLEME BAŞARILI!',
      description: `3 kostüm birleştirildi ve kalıcı ${newSkin.skinName} (${getRarityLabel(newSkin.rarity)}) elde edildi!`,
      type: 'skin',
      icon: '✨',
    });

    setRerollSelectedIds([]);
    setIsRerollMode(false);
  };

  // Helper for rendering the small bottom rarity diamond on skin cards
  const getRarityDiamondColor = (rarity: SkinRarity) => {
    switch (rarity) {
      case 'Prestige':
        return 'bg-[#d442f5] border-[#f0abfc] shadow-[0_0_8px_#d442f5]';
      case 'Mythic':
        return 'bg-[#a855f7] border-[#c084fc] shadow-[0_0_8px_#a855f7]';
      case 'Ultimate':
        return 'bg-[#ff9900] border-[#ffe066] shadow-[0_0_8px_#ff9900]';
      case 'Legendary':
        return 'bg-[#c89b3c] border-[#f0e6d2] shadow-[0_0_6px_#c89b3c]';
      case 'Epic':
        return 'bg-[#00c8c8] border-[#38bdf8] shadow-[0_0_6px_#00c8c8]';
      default:
        return 'bg-[#465463] border-[#788896]';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md select-none font-['Plus_Jakarta_Sans',sans-serif]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-7xl h-[92vh] max-h-[900px] bg-[#010a13] border-2 border-[#785a28] rounded-xs overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col text-[#f0e6d2]"
        >
          {/* ========================================================================= */}
          {/* 1. TOP CLIENT BAR (LoL Client Header Replica) */}
          {/* ========================================================================= */}
          <div className="h-14 bg-[#010a13] border-b border-[#1e2328] px-3 md:px-4 flex items-center justify-between shrink-0 relative z-30">
            {/* Left: OYNA Button */}
            <div className="flex items-center gap-4">
              {/* Metallic LoL OYNA Button */}
              <button
                onClick={() => onClose()}
                className="relative px-6 py-1.5 bg-gradient-to-b from-[#1e5a78] via-[#0d344d] to-[#092233] border border-[#00c8c8] text-white font-black tracking-widest text-xs uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_12px_rgba(0,200,200,0.3)] hover:brightness-125 transition-all cursor-pointer rounded-xs flex items-center gap-2"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-[#c8aa6e] flex items-center justify-center bg-[#010a13]">
                  <span className="text-[8px] text-[#c8aa6e] font-bold">L</span>
                </div>
                <span>OYNA</span>
              </button>
            </div>

            {/* Center Tabs: Zanaatkârlık / Sunak / İhtişamlı Mağaza */}
            <div className="flex items-center gap-6 md:gap-8 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveCategory('ALL')}
                className="relative py-4 text-[#f0e6d2] flex flex-col items-center hover:text-white transition-colors cursor-pointer"
              >
                <span>Zanaatkârlık</span>
                <div className="absolute bottom-0 w-full h-[2px] bg-[#00c8c8] shadow-[0_0_8px_#00c8c8]"></div>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('MATERIALS');
                  setSelectedItem({
                    type: 'material',
                    data: materials[0],
                  });
                }}
                className="py-4 text-[#a09b8c] hover:text-[#f0e6d2] transition-colors cursor-pointer"
              >
                Sunak
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenPrestigeShop) onOpenPrestigeShop();
                }}
                className="py-4 text-[#a09b8c] hover:text-[#c8aa6e] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d442f5]" />
                <span>İhtişamlı Mağaza</span>
              </button>
            </div>

            {/* Right: Currency & Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Notification Badge */}
              <div className="relative p-1.5 text-[#c8aa6e] hover:text-white cursor-pointer transition-colors">
                <span className="w-4 h-4 bg-[#c89b3c] text-[#010a13] font-bold text-[9px] rounded-xs flex items-center justify-center shadow">
                  1
                </span>
              </div>

              {/* Crafting Hammer Icon (Active glowing) */}
              <div className="p-1.5 bg-[#1e2328] border border-[#c8aa6e]/60 rounded-xs text-[#c8aa6e] shadow-[0_0_8px_rgba(200,170,110,0.4)]">
                <Sparkles className="w-4 h-4" />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 text-[#a09b8c] hover:text-white hover:bg-[#1e2328] rounded-xs transition-colors cursor-pointer ml-2"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. SUB-HEADER TOOLBAR (Search & Sorting) */}
          {/* ========================================================================= */}
          <div className="h-12 bg-[#020b14] border-b border-[#1e2328] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Grid icon */}
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  activeCategory === 'ALL'
                    ? 'text-[#00c8c8] bg-[#091e2b] border border-[#00c8c8]/40'
                    : 'text-[#a09b8c] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#a09b8c]" />
                <input
                  type="text"
                  placeholder="Ara"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 md:w-56 pl-8 pr-3 py-1 bg-[#010a13] border border-[#785a28] focus:border-[#c8aa6e] rounded-xs text-xs text-[#f0e6d2] placeholder-[#5c5b57] focus:outline-none transition-colors"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  aria-label="Sıralama Seçeneği"
                  className="appearance-none bg-[#010a13] border border-[#785a28] hover:border-[#c8aa6e] text-[#f0e6d2] text-xs py-1 pl-2.5 pr-7 rounded-xs focus:outline-none cursor-pointer"
                >
                  <option value="alpha">Alfabetik</option>
                  <option value="rarity">Nadirliğe Göre</option>
                  <option value="newest">En Yeniler</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#a09b8c] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Re-roll 3-for-1 toggle button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsRerollMode(!isRerollMode);
                  setRerollSelectedIds([]);
                }}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isRerollMode
                    ? 'bg-[#c89b3c] text-[#010a13] border-[#f0e6d2]'
                    : 'bg-[#010a13] text-[#c8aa6e] border-[#785a28] hover:border-[#c8aa6e]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRerollMode ? 'animate-spin' : ''}`} />
                <span>Yeniden İşle ({rerollSelectedIds.length}/3)</span>
              </button>

              {isRerollMode && rerollSelectedIds.length === 3 && (
                <button
                  onClick={handleExecuteReroll}
                  className="px-3 py-1 bg-gradient-to-r from-[#00c8c8] to-[#005a82] text-white text-xs font-black uppercase tracking-widest rounded-xs hover:brightness-125 transition-all shadow-[0_0_12px_#00c8c8] animate-pulse cursor-pointer"
                >
                  Birleştir!
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. MAIN WORKSPACE (Left Category Sidebar + Center Items + Right Crafting Forge) */}
          {/* ========================================================================= */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden bg-gradient-to-b from-[#010a13] via-[#03101d] to-[#010a13]">
            {/* Atmospheric Background Magical Fog / Hextech Vibe */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#005a82] via-transparent to-transparent"></div>

            {/* --------------------------------------------------------------------- */}
            {/* A. LEFT VERTICAL CATEGORY ICON STRIP */}
            {/* --------------------------------------------------------------------- */}
            <div className="w-12 md:w-14 bg-[#010a13] border-r border-[#1e2328] flex flex-col items-center py-3 gap-3 shrink-0 select-none z-10">
              {[
                { id: 'ALL', label: 'Tümü', icon: <LayoutGrid className="w-4 h-4" /> },
                { id: 'MATERIALS', label: 'Malzemeler', icon: <Sparkles className="w-4 h-4" /> },
                { id: 'CHAMPIONS', label: 'Şampiyonlar', icon: <Shield className="w-4 h-4" /> },
                { id: 'SKINS', label: 'Kostümler', icon: <Flame className="w-4 h-4" /> },
                { id: 'EMOTES', label: 'İfadeler', icon: <Smile className="w-4 h-4" /> },
                { id: 'ICONS', label: 'Simgeler', icon: <Shield className="w-4 h-4" /> },
                { id: 'ETERNALS', label: 'Ebediler', icon: <Sparkles className="w-4 h-4" /> },
                { id: 'MYTHIC', label: 'İhtişamlı', icon: <Sparkles className="w-4 h-4 text-[#d442f5]" /> },
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundFx.playButtonClick();
                      setActiveCategory(cat.id as CategoryType);
                    }}
                    title={cat.label}
                    className={`w-9 h-9 rounded-xs flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive
                        ? 'text-[#00c8c8] bg-[#0a1e2b] border border-[#00c8c8] shadow-[0_0_8px_rgba(0,200,200,0.4)]'
                        : 'text-[#5c5b57] hover:text-[#a09b8c] hover:bg-[#1e2328]/50'
                    }`}
                  >
                    {cat.icon}
                    {isActive && (
                      <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#00c8c8] rounded-r-xs"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* B. CENTER CATEGORIZED INVENTORY ITEMS (Scrollable Grid Area) */}
            {/* --------------------------------------------------------------------- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 pr-2 md:pr-4">
              {/* Section 1: MALZEMELER (Materials) */}
              {(activeCategory === 'ALL' || activeCategory === 'MATERIALS' || activeCategory === 'MYTHIC') && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-3 border-b border-[#785a28]/40">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a09b8c] font-['Cinzel',serif]">
                      Malzemeler
                    </h3>
                    <span className="text-[10px] text-[#5c5b57] uppercase">
                      {materials.length} Ürün
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {materials
                      .filter((m) => activeCategory !== 'MYTHIC' || m.category === 'MYTHIC')
                      .map((mat) => {
                        const isSelected = selectedItem?.data?.id === mat.id;
                        return (
                          <div
                            key={mat.id}
                            onClick={() => {
                              soundFx.playButtonClick();
                              setSelectedItem({ type: 'material', data: mat });
                            }}
                            className={`w-20 h-20 sm:w-24 sm:h-24 bg-[#010a13] border-2 rounded-xs flex flex-col items-center justify-center relative cursor-pointer group transition-all ${
                              isSelected
                                ? 'border-[#00c8c8] shadow-[0_0_15px_#00c8c8]'
                                : 'border-[#785a28] hover:border-[#c8aa6e]'
                            }`}
                          >
                            {/* Material Visual Core */}
                            {mat.iconType === 'chest' && (
                              <div className="w-12 h-12 bg-gradient-to-br from-[#c89b3c] to-[#785a28] p-0.5 rounded-xs flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                <div className="w-full h-full bg-[#010a13] border border-[#00c8c8] flex items-center justify-center">
                                  <div className="w-4 h-4 bg-[#00c8c8] rotate-45 animate-pulse shadow-[0_0_8px_#00c8c8]"></div>
                                </div>
                              </div>
                            )}

                            {mat.iconType === 'key' && (
                              <div className="w-12 h-12 bg-gradient-to-b from-[#00c8c8]/30 to-[#005a82]/40 rounded-full flex items-center justify-center border border-[#00c8c8] group-hover:scale-105 transition-transform">
                                <span className="text-xl">🗝️</span>
                              </div>
                            )}

                            {mat.iconType === 'orange_essence' && (
                              <div className="w-12 h-12 bg-gradient-to-b from-[#ff7700]/20 to-[#c89b3c]/30 rounded-xs flex items-center justify-center border border-[#ff7700] group-hover:scale-105 transition-transform">
                                <span className="text-xl text-[#ff7700]">◆</span>
                              </div>
                            )}

                            {mat.iconType === 'gemstone' && (
                              <div className="w-12 h-12 bg-gradient-to-b from-[#d442f5]/20 to-[#800080]/40 rounded-xs flex items-center justify-center border border-[#d442f5] group-hover:scale-105 transition-transform">
                                <span className="text-xl text-[#d442f5] animate-pulse">💎</span>
                              </div>
                            )}

                            {/* Item Count Badge */}
                            <div className="absolute bottom-1 right-1 bg-[#010a13]/90 border border-[#785a28] px-1 rounded-xs text-[9px] font-bold text-[#c8aa6e]">
                              {mat.count}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Section 2: ŞAMPİYONLAR (Champions) */}
              {(activeCategory === 'ALL' || activeCategory === 'CHAMPIONS') && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-3 border-b border-[#785a28]/40">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a09b8c] font-['Cinzel',serif]">
                      Şampiyonlar
                    </h3>
                    <span className="text-[10px] text-[#5c5b57] uppercase">
                      {SAMPLE_CHAMPION_SHARDS.length} Kristal
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {SAMPLE_CHAMPION_SHARDS.map((champ) => {
                      const isSelected = selectedItem?.data?.id === champ.id;
                      return (
                        <div
                          key={champ.id}
                          onClick={() => {
                            soundFx.playButtonClick();
                            setSelectedItem({ type: 'champion', data: champ });
                          }}
                          className={`w-20 h-20 sm:w-24 sm:h-24 bg-[#010a13] border-2 rounded-xs relative overflow-hidden cursor-pointer group transition-all ${
                            isSelected
                              ? 'border-[#00c8c8] shadow-[0_0_15px_#00c8c8]'
                              : 'border-[#005a82] hover:border-[#00c8c8]'
                          }`}
                        >
                          <img
                            src={champ.avatarUrl}
                            alt={champ.championName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 filter contrast-125"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-transparent"></div>

                          {/* Shard Icon Overlay */}
                          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#00c8c8] shadow-[0_0_4px_#00c8c8]"></div>

                          {/* Champion Name */}
                          <span className="absolute bottom-1 left-1 right-1 text-[8.5px] font-bold uppercase tracking-wider text-center text-[#f0e6d2] truncate">
                            {champ.championName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: KOSTÜMLER (Skins - Main Grid) */}
              {(activeCategory === 'ALL' || activeCategory === 'SKINS') && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-3 border-b border-[#785a28]/40">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a09b8c] font-['Cinzel',serif]">
                      Kostümler
                    </h3>
                    <span className="text-[10px] text-[#00c8c8] font-bold uppercase">
                      {filteredSkins.length} Kostüm Sahibi
                    </span>
                  </div>

                  {filteredSkins.length === 0 ? (
                    <div className="py-8 text-center text-[#5c5b57] text-xs">
                      Envanterinde henüz kostüm bulunmuyor. Baron yenerek anahtar kazan ve sandık aç!
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {filteredSkins.map((skin) => {
                        const isSelected = selectedItem?.data?.id === skin.id;
                        const isRerollPicked = rerollSelectedIds.includes(skin.id);

                        return (
                          <div
                            key={skin.id}
                            onClick={() => {
                              if (isRerollMode) {
                                handleToggleRerollSkin(skin.id);
                              } else {
                                soundFx.playButtonClick();
                                setSelectedItem({ type: 'skin', data: skin });
                              }
                            }}
                            className={`w-20 h-20 sm:w-24 sm:h-24 bg-[#010a13] border-2 rounded-xs relative overflow-hidden cursor-pointer group transition-all flex flex-col justify-end ${
                              isRerollPicked
                                ? 'border-[#ff0055] ring-2 ring-[#ff0055] scale-95'
                                : isSelected
                                ? 'border-[#00c8c8] shadow-[0_0_15px_#00c8c8]'
                                : 'border-[#785a28] hover:border-[#c8aa6e]'
                            }`}
                          >
                            {/* Skin Splash Crop */}
                            <img
                              src={skin.splashUrl}
                              alt={skin.skinName}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                            {/* Reroll Selection Checkbox Indicator */}
                            {isRerollMode && (
                              <div
                                className={`absolute top-1 right-1 w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] ${
                                  isRerollPicked
                                    ? 'bg-[#ff0055] border-white text-white'
                                    : 'bg-black/60 border-[#785a28] text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            )}

                            {/* Small Bottom Centered Rarity Diamond Gem (LoL Client Signature Style) */}
                            <div className="relative z-10 w-full flex justify-center pb-1">
                              <div
                                className={`w-2.5 h-2.5 rotate-45 border rounded-xs ${getRarityDiamondColor(
                                  skin.rarity
                                )}`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 4: EBEDİLER (Eternals) */}
              {(activeCategory === 'ALL' || activeCategory === 'ETERNALS') && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-3 border-b border-[#785a28]/40">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a09b8c] font-['Cinzel',serif]">
                      Ebediler
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {SAMPLE_ETERNALS.map((et) => (
                      <div
                        key={et.id}
                        onClick={() => {
                          soundFx.playButtonClick();
                          setSelectedItem({ type: 'eternal', data: et });
                        }}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-[#010a13] border-2 border-[#785a28] hover:border-[#c8aa6e] rounded-xs flex flex-col items-center justify-center p-1.5 text-center cursor-pointer group"
                      >
                        <Sparkles className="w-6 h-6 text-[#c8aa6e] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] uppercase font-bold text-[#f0e6d2] truncate w-full">
                          {et.championName}
                        </span>
                        <span className="text-[7px] text-[#a09b8c] truncate w-full">
                          1. Seri
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: İFADELER (Emotes) */}
              {(activeCategory === 'ALL' || activeCategory === 'EMOTES') && (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-3 border-b border-[#785a28]/40">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#a09b8c] font-['Cinzel',serif]">
                      İfadeler
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {SAMPLE_EMOTES.map((em) => (
                      <div
                        key={em.id}
                        onClick={() => {
                          soundFx.playButtonClick();
                          setSelectedItem({ type: 'emote', data: em });
                        }}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-[#010a13] border-2 border-[#005a82] hover:border-[#00c8c8] rounded-xs flex flex-col items-center justify-center p-1 cursor-pointer group"
                      >
                        <span className="text-2xl mb-1 group-hover:scale-115 transition-transform">{em.icon}</span>
                        <span className="text-[8px] uppercase font-bold text-[#f0e6d2] truncate w-full text-center">
                          {em.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* C. RIGHT SIDE CRAFTING FORGE / ITEM DETAILS INSPECTOR */}
            {/* --------------------------------------------------------------------- */}
            <div className="hidden lg:flex w-80 xl:w-96 bg-[#020b14]/90 border-l border-[#1e2328] flex-col p-5 justify-between shrink-0 relative z-20">
              {selectedItem ? (
                <div className="flex-1 flex flex-col justify-between">
                  {/* Selected Item Preview Top Area */}
                  <div>
                    {/* Item Image / Splash Preview */}
                    <div className="relative aspect-[16/10] w-full rounded-xs overflow-hidden border-2 border-[#785a28] shadow-2xl mb-4 bg-[#010a13]">
                      {selectedItem.type === 'skin' && (
                        <img
                          src={selectedItem.data.splashUrl}
                          alt={selectedItem.data.skinName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {selectedItem.type === 'champion' && (
                        <img
                          src={selectedItem.data.avatarUrl}
                          alt={selectedItem.data.championName}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {selectedItem.type === 'material' && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1e2b] to-[#010a13]">
                          {selectedItem.data.iconType === 'chest' && <span className="text-5xl">📦</span>}
                          {selectedItem.data.iconType === 'key' && <span className="text-5xl">🗝️</span>}
                          {selectedItem.data.iconType === 'orange_essence' && <span className="text-5xl text-[#ff7700]">◆</span>}
                          {selectedItem.data.iconType === 'gemstone' && <span className="text-5xl text-[#d442f5]">💎</span>}
                        </div>
                      )}
                      {selectedItem.type === 'emote' && (
                        <div className="w-full h-full flex items-center justify-center bg-[#0a1e2b] text-6xl">
                          {selectedItem.data.icon}
                        </div>
                      )}
                      {selectedItem.type === 'eternal' && (
                        <div className="w-full h-full flex items-center justify-center bg-[#0a1e2b]">
                          <Sparkles className="w-16 h-16 text-[#c8aa6e]" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#010a13] via-transparent to-transparent"></div>
                    </div>

                    {/* Titles and Details */}
                    <div>
                      {selectedItem.type === 'skin' && (
                        <>
                          <span className="text-xs uppercase font-bold tracking-widest text-[#a09b8c]">
                            {selectedItem.data.championName}
                          </span>
                          <h4 className="text-lg font-black uppercase text-white font-['Cinzel',serif]">
                            {selectedItem.data.skinName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                                getRarityColor(selectedItem.data.rarity).badge
                              }`}
                            >
                              {getRarityLabel(selectedItem.data.rarity)}
                            </span>
                            <span className="text-xs text-[#c8aa6e] font-semibold">
                              {selectedItem.data.rpValue > 0 ? `${selectedItem.data.rpValue} RP` : 'Prestij'}
                            </span>
                          </div>
                        </>
                      )}

                      {selectedItem.type === 'material' && (
                        <>
                          <h4 className="text-lg font-black uppercase text-[#c8aa6e] font-['Cinzel',serif]">
                            {selectedItem.data.name}
                          </h4>
                          <p className="text-xs text-[#a09b8c] mt-2 leading-relaxed">
                            {selectedItem.data.description}
                          </p>
                        </>
                      )}

                      {selectedItem.type === 'champion' && (
                        <>
                          <span className="text-xs uppercase font-bold tracking-widest text-[#00c8c8]">
                            Şampiyon Kristali
                          </span>
                          <h4 className="text-lg font-black uppercase text-white font-['Cinzel',serif]">
                            {selectedItem.data.championName}
                          </h4>
                          <p className="text-xs text-[#a09b8c] mt-1">
                            {selectedItem.data.title}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Crafting Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-[#1e2328]">
                    {/* If Chest selected */}
                    {selectedItem.type === 'material' && selectedItem.data.iconType === 'chest' && (
                      <button
                        onClick={() => openChest(1)}
                        className="w-full py-2.5 bg-gradient-to-r from-[#c89b3c] to-[#785a28] hover:brightness-125 text-[#010a13] text-xs font-black uppercase tracking-widest rounded-xs transition-all shadow-[0_0_12px_rgba(200,155,60,0.5)] cursor-pointer"
                      >
                        Sandığı Aç (1 Anahtar)
                      </button>
                    )}

                    {/* If Skin selected */}
                    {selectedItem.type === 'skin' && (
                      <>
                        <button
                          onClick={() => disenchantSkin(selectedItem.data)}
                          className="w-full py-2 bg-[#1e2328] hover:bg-[#ff7700]/20 border border-[#ff7700]/60 text-[#ff7700] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Öze Ayrıştır (+{selectedItem.data.disenchantValue} ◆)</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsRerollMode(true);
                            setRerollSelectedIds([selectedItem.data.id]);
                            addToast({
                              title: 'Yeniden İşleme Modu',
                              description: 'Birleştirmek için 2 kostüm daha seç.',
                              type: 'info',
                            });
                          }}
                          className="w-full py-2 bg-[#010a13] hover:bg-[#00c8c8]/10 border border-[#00c8c8] text-[#00c8c8] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Yeniden İşle (3 Kostüm)</span>
                        </button>
                      </>
                    )}

                    {/* If Gemstone selected */}
                    {selectedItem.type === 'material' && selectedItem.data.iconType === 'gemstone' && (
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenPrestigeShop) onOpenPrestigeShop();
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-[#d442f5] to-[#800080] text-white text-xs font-black uppercase tracking-widest rounded-xs transition-all shadow-[0_0_12px_#d442f5] cursor-pointer"
                      >
                        İhtişamlı Mağazaya Git
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#5c5b57] p-4">
                  <Sparkles className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#a09b8c]">
                    İçerik Seçin
                  </p>
                  <p className="text-[11px] mt-1">
                    İncelemek veya zanaatkarlık işlemi uygulamak için soldaki bir ögeye tıklayın.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. BOTTOM CLIENT STATUS BAR (Exact Replica from Screenshot) */}
          {/* ========================================================================= */}
          <div className="h-12 bg-[#010a13] border-t border-[#1e2328] px-4 flex items-center justify-between shrink-0 relative z-30">
            {/* Left: Help icon & Buy Hextech Chest Button */}
            <div className="flex items-center gap-3">
              <button
                className="w-7 h-7 rounded-full border border-[#785a28] flex items-center justify-center text-[#a09b8c] hover:text-white hover:border-[#c8aa6e] transition-colors cursor-pointer"
                title="Yardım"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* [ + 📦 ] Buy Chests Button */}
              <button
                onClick={() => openChest(1)}
                className="px-3 py-1 bg-[#010a13] hover:bg-[#c8aa6e]/10 border border-[#c8aa6e] rounded-xs text-[#c8aa6e] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-sm">📦</span>
              </button>
            </div>

            {/* Right: Currency Counter Display (OE, Keys, Chests, Gemstones) */}
            <div className="flex items-center gap-5 md:gap-8 text-xs font-bold">
              {/* Orange Essence (Turuncu Öz) */}
              <div className="flex items-center gap-1.5 text-[#f0e6d2]">
                <div className="w-3.5 h-3.5 bg-[#ff7700] rotate-45 flex items-center justify-center rounded-xs shadow-[0_0_6px_#ff7700]"></div>
                <span className="tracking-wider">{state.orangeEssence}</span>
              </div>

              {/* Hextech Keys (Anahtarlar) */}
              <div className="flex items-center gap-1.5 text-[#f0e6d2]">
                <span className="text-sm">🗝️</span>
                <span className="tracking-wider">{state.keys}</span>
              </div>

              {/* Hextech Chests (Sandıklar) */}
              <div className="flex items-center gap-1.5 text-[#f0e6d2]">
                <span className="text-sm">📦</span>
                <span className="tracking-wider">{state.keys >= 1 ? 1 : 0}</span>
              </div>

              {/* Mythic Essence / Gemstones (Mor Cevher) */}
              <div className="flex items-center gap-1.5 text-[#d442f5]">
                <span className="text-sm">💎</span>
                <span className="tracking-wider">{state.gemstones}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
