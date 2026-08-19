import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameState, SkinItem, PrestigeItem, RecentDrop, FloatingText, LootDrop } from '../types';
import { loadSavedGame, saveGameState, resetSavedGame } from '../services/storage';
import { getRandomSkinFromPool, BASE_SKINS_CATALOG, getRarityLabel } from '../services/dataDragon';
import { soundFx } from '../services/soundEffects';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'level_up' | 'key' | 'gemstone' | 'skin' | 'prestige' | 'info';
  icon?: string;
  rarityColor?: string;
}

interface GameContextType {
  state: GameState;
  xpNeeded: number;
  xpProgressPercent: number;
  combo: number;
  comboMultiplier: number;
  floatingTexts: FloatingText[];
  toasts: ToastMessage[];
  alphaCooldownPercent: number;
  isAlphaReady: boolean;
  activeChestModal: {
    isOpen: boolean;
    unboxedSkins: SkinItem[];
    unboxedDrops?: LootDrop[];
    currentIndex: number;
  } | null;
  
  // Actions
  acceptDisclaimer: (username: string, avatarId: string) => void;
  clickBaron: (x?: number, y?: number) => void;
  triggerAlphaStrike: () => void;
  openChest: (count?: number) => boolean;
  claimSkin: (skin: SkinItem) => void;
  claimDrop?: (drop: LootDrop) => void;
  disenchantSkin: (skin: SkinItem) => void;
  buyPrestigeSkin: (item: PrestigeItem) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  toggleSound: () => void;
  setVolume: (vol: number) => void;
  resetProgress: () => void;
  closeChestModal: () => void;
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const UPGRADE_DEFINITIONS = [
  {
    id: 'wuju_style',
    name: 'Wuju Stili (Vuruş Gücü)',
    description: 'Master Yi her vuruşta daha fazla XP ve hasar verir.',
    costCurrency: 'xp' as const,
    baseCost: 80,
    costMultiplier: 1.55,
    powerPerLevel: 25,
    icon: '⚔️',
    maxLevel: 100,
  },
  {
    id: 'guinsoo_blade',
    name: "Guinsoo'nun Hiddeti (Otomatik Saldırı)",
    description: 'Saniyede otomatik vuruş yaparak dinlenirken bile XP kazandırır.',
    costCurrency: 'xp' as const,
    baseCost: 200,
    costMultiplier: 1.65,
    powerPerLevel: 15,
    icon: '⚡',
    maxLevel: 50,
  },
  {
    id: 'infinity_edge',
    name: 'Ebedi Kılıç (Kritik Vuruş)',
    description: 'Kritik vuruş şansını +%2.5 ve kritik çarpanını artırır.',
    costCurrency: 'orangeEssence' as const,
    baseCost: 150,
    costMultiplier: 1.8,
    powerPerLevel: 0.025,
    icon: '🗡️',
    maxLevel: 25,
  },
  {
    id: 'alpha_mastery',
    name: 'Alfa Vuruşu Ustalığı',
    description: 'Q Alfa Vuruşu bekleme süresini 1 saniye kısaltır.',
    costCurrency: 'xp' as const,
    baseCost: 400,
    costMultiplier: 2.0,
    powerPerLevel: 1,
    icon: '🌪️',
    maxLevel: 8,
  },
  {
    id: 'gem_prospector',
    name: 'Mor Cevher Sezgisi',
    description: 'Barondan Mor Cevher düşme ihtimalini +%0.05 artırır.',
    costCurrency: 'orangeEssence' as const,
    baseCost: 350,
    costMultiplier: 2.2,
    powerPerLevel: 0.0005,
    icon: '💎',
    maxLevel: 10,
  },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => loadSavedGame());
  const [combo, setCombo] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeChestModal, setActiveChestModal] = useState<{
    isOpen: boolean;
    unboxedSkins: SkinItem[];
    currentIndex: number;
  } | null>(null);

  const comboTimerRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Sync sound settings with SoundEngine
  useEffect(() => {
    soundFx.setEnabled(state.soundEnabled);
    soundFx.setVolume(state.sfxVolume);
  }, [state.soundEnabled, state.sfxVolume]);

  // Persistent save
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Calculate Linear XP required for next level: level * 100 (as required)
  const xpNeeded = state.level * 100;
  const xpProgressPercent = Math.min(100, Math.max(0, (state.xp / xpNeeded) * 100));

  // Combo multiplier: 1x to 2.5x based on combo count
  const comboMultiplier = combo >= 50 ? 2.5 : combo >= 25 ? 2.0 : combo >= 10 ? 1.5 : 1.0;

  // Alpha strike cooldown progress
  const alphaStrikeCD = Math.max(4, 12 - (state.upgrades['alpha_mastery'] || 0));
  const timeSinceAlpha = (Date.now() - state.lastAlphaStrikeUsedAt) / 1000;
  const isAlphaReady = timeSinceAlpha >= alphaStrikeCD;
  const alphaCooldownPercent = isAlphaReady ? 100 : Math.min(100, (timeSinceAlpha / alphaStrikeCD) * 100);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerConfetti = (type: 'level' | 'gem' | 'prestige' = 'level') => {
    if (typeof window === 'undefined') return;
    if (type === 'gem') {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#c084fc', '#e879f9', '#f0abfc']
      });
    } else if (type === 'prestige') {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff']
      });
    } else {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#c8aa6e', '#f0e6d2', '#22c55e']
      });
    }
  };

  // Helper to add XP and handle Level Ups (1 Key granted per level up)
  const addXP = useCallback((amount: number) => {
    setState(prev => {
      let curXP = prev.xp + amount;
      let curLevel = prev.level;
      let newKeys = prev.keys;
      let leveledUp = false;

      // Handle potentially multiple level-ups on large XP bursts
      while (curXP >= curLevel * 100) {
        curXP -= curLevel * 100;
        curLevel += 1;
        newKeys += 1;
        leveledUp = true;
      }

      if (leveledUp) {
        soundFx.playLevelUp();
        setTimeout(() => soundFx.playKeyEarned(), 400);
        triggerConfetti('level');
        addToast({
          title: `SEVİYE ATLADIN! Seviye ${curLevel}`,
          description: `Tebrikler! +1 Hextech Anahtarı kazandın. (Toplam: ${newKeys})`,
          type: 'level_up',
          icon: '🗝️'
        });
      }

      return {
        ...prev,
        level: curLevel,
        xp: curXP,
        keys: newKeys,
      };
    });
  }, [addToast]);

  // Click Baron mechanics
  const clickBaron = useCallback((clickX?: number, clickY?: number) => {
    // Reset combo timeout
    if (comboTimerRef.current) {
      window.clearTimeout(comboTimerRef.current);
    }
    setCombo(prev => Math.min(prev + 1, 100));
    comboTimerRef.current = window.setTimeout(() => {
      setCombo(0);
    }, 1600);

    const currentState = stateRef.current;
    
    // Check Crit
    const isCrit = Math.random() < currentState.critChance;
    const baseDamage = currentState.clickPower;
    const critDmg = isCrit ? baseDamage * currentState.critMultiplier : baseDamage;
    const totalGainedXP = Math.round(critDmg * comboMultiplier);

    if (isCrit) {
      soundFx.playCrit();
    } else {
      soundFx.playSlash();
    }

    // Check Gemstone drop: 0.1% (0.001) base + upgrades
    const gemRoll = Math.random();
    const isGemstoneDrop = gemRoll < currentState.gemFinderChance;

    if (isGemstoneDrop) {
      soundFx.playGemstoneDrop();
      triggerConfetti('gem');
      addToast({
        title: '💎 NADİR DÜŞÜŞ: MOR CEVHER!',
        description: 'Barondan 1 adet Mor Cevher (Mythic Essence) düştü! (Prestij dükkanında harcayabilirsin)',
        type: 'gemstone',
        icon: '💎'
      });
    }

    // Add floating combat numbers
    const spawnX = clickX ?? (window.innerWidth / 2 + (Math.random() * 80 - 40));
    const spawnY = clickY ?? (window.innerHeight / 2 + (Math.random() * 80 - 40));
    
    const newFloatingTexts: FloatingText[] = [
      {
        id: `float_${Date.now()}_${Math.random()}`,
        text: isCrit ? `⚔️ KRİTİK +${totalGainedXP} XP!` : `+${totalGainedXP} XP`,
        x: spawnX,
        y: spawnY,
        type: isCrit ? 'crit' : 'xp'
      }
    ];

    if (isGemstoneDrop) {
      newFloatingTexts.push({
        id: `gem_${Date.now()}`,
        text: '+1 💎 MOR CEVHER!',
        x: spawnX,
        y: spawnY - 45,
        type: 'gem'
      });
    }

    setFloatingTexts(prev => [...prev.slice(-15), ...newFloatingTexts]);

    // Clean floating texts after 1s
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => !newFloatingTexts.some(nft => nft.id === t.id)));
    }, 1000);

    // Update state
    setState(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      totalDamageDealt: prev.totalDamageDealt + totalGainedXP,
      gemstones: isGemstoneDrop ? prev.gemstones + 1 : prev.gemstones,
    }));

    addXP(totalGainedXP);
  }, [addXP, comboMultiplier, addToast]);

  // Master Yi Q: Alpha Strike
  const triggerAlphaStrike = useCallback(() => {
    if (!isAlphaReady) return;

    soundFx.playAlphaStrike();
    
    const burstXP = Math.round(state.clickPower * 12 * comboMultiplier);
    
    // Spawn multiple floating hits
    const floats: FloatingText[] = [
      { id: `alpha_1_${Date.now()}`, text: '⚔️ ALFA VURUŞU!', x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 80, type: 'alphastrike' },
      { id: `alpha_2_${Date.now()}`, text: `+${burstXP} XP`, x: window.innerWidth / 2 + 40, y: window.innerHeight / 2 - 40, type: 'crit' },
    ];
    setFloatingTexts(prev => [...prev.slice(-15), ...floats]);

    setState(prev => ({
      ...prev,
      lastAlphaStrikeUsedAt: Date.now(),
      totalDamageDealt: prev.totalDamageDealt + burstXP,
    }));

    addXP(burstXP);
  }, [isAlphaReady, state.clickPower, comboMultiplier, addXP]);

  // Auto DPS tick interval
  useEffect(() => {
    if (state.autoDps <= 0) return;

    const interval = setInterval(() => {
      const dpsGained = Math.round(state.autoDps / 2);
      if (dpsGained > 0) {
        addXP(dpsGained);
        setState(prev => ({
          ...prev,
          totalDamageDealt: prev.totalDamageDealt + dpsGained
        }));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [state.autoDps, addXP]);

  // Hextech Chest Opening
  const openChest = useCallback((count: number = 1): boolean => {
    if (state.keys < count) {
      addToast({
        title: 'Yetersiz Anahtar!',
        description: `Sandık açmak için en az ${count} adet Hextech Anahtarı gerekiyor. Seviye atlayarak anahtar kazanabilirsin!`,
        type: 'info',
        icon: '🗝️'
      });
      return false;
    }

    soundFx.playChestOpen();

    const unboxedList: SkinItem[] = [];
    const dropItems: LootDrop[] = [];

    for (let i = 0; i < count; i++) {
      const skin = getRandomSkinFromPool();
      unboxedList.push(skin);

      // Primary Skin Drop
      dropItems.push({
        id: `drop_skin_${Date.now()}_${i}_${Math.random()}`,
        type: 'skin',
        title: skin.skinName,
        subtitle: `${getRarityLabel(skin.rarity)} Kostüm Kristali`,
        rarity: skin.rarity,
        imageUrl: skin.splashUrl,
        skin: skin,
      });

      // Bonus Drop Chance (35% chance per chest, just like real LoL & video)
      const bonusChance = Math.random();
      if (bonusChance < 0.35) {
        const bonusRoll = Math.random();
        if (bonusRoll < 0.35) {
          // Extra Hextech Key
          dropItems.push({
            id: `drop_key_${Date.now()}_${i}`,
            type: 'key',
            title: 'Hextech Anahtarı',
            subtitle: 'Malzeme',
            keysAmount: 1,
          });
        } else if (bonusRoll < 0.65) {
          // Orange Essence
          const essenceGained = 150;
          dropItems.push({
            id: `drop_oe_${Date.now()}_${i}`,
            type: 'essence',
            title: `${essenceGained} Turuncu Öz`,
            subtitle: 'Malzeme',
            essenceAmount: essenceGained,
          });
        } else if (bonusRoll < 0.85) {
          // Bonus Hextech Chest
          dropItems.push({
            id: `drop_chest_${Date.now()}_${i}`,
            type: 'chest',
            title: 'Hextech Sandığı',
            subtitle: 'Sandık',
            keysAmount: 1, // grants a key to open the bonus chest
          });
        } else {
          // Mor Cevher / Mythic Essence
          dropItems.push({
            id: `drop_gem_${Date.now()}_${i}`,
            type: 'gemstone',
            title: '1 Mor Cevher',
            subtitle: 'İhtişamlı Öz',
            rarity: 'Mythic',
            gemstonesAmount: 1,
          });
        }
      }
    }

    // Deduct keys and track total chests opened
    setState(prev => {
      const newRecent: RecentDrop[] = unboxedList.map(s => ({
        id: `drop_${Date.now()}_${Math.random()}`,
        skin: s,
        username: prev.username || 'Sen',
        timestamp: Date.now(),
        isPrestige: s.rarity === 'Prestige',
        isCurrentUser: true,
      }));

      return {
        ...prev,
        keys: prev.keys - count,
        totalChestsOpened: prev.totalChestsOpened + count,
        recentDrops: [...newRecent, ...prev.recentDrops].slice(0, 20),
      };
    });

    setActiveChestModal({
      isOpen: true,
      unboxedSkins: unboxedList,
      unboxedDrops: dropItems,
      currentIndex: 0,
    });

    return true;
  }, [state.keys, addToast]);

  const claimSkin = useCallback((skin: SkinItem) => {
    soundFx.playButtonClick();
    setState(prev => {
      // Check if skin is already in inventory
      const exists = prev.inventory.some(s => s.championId === skin.championId && s.num === skin.num);
      if (exists) {
        // Auto convert duplicate to Orange Essence
        const refundEssence = skin.disenchantValue;
        addToast({
          title: 'Zaten Koleksiyonda!',
          description: `${skin.skinName} zaten envanterinde var. +${refundEssence} Turuncu Öz dönüştürüldü.`,
          type: 'info',
          icon: '🔶'
        });
        return {
          ...prev,
          orangeEssence: prev.orangeEssence + refundEssence
        };
      }

      addToast({
        title: 'Koleksiyona Eklendi!',
        description: `${skin.skinName} (${skin.rarity}) başarıyla envanterine eklendi!`,
        type: 'skin',
        icon: '✨'
      });

      return {
        ...prev,
        inventory: [{ ...skin, isOwned: true }, ...prev.inventory]
      };
    });
  }, [addToast]);

  const claimDrop = useCallback((drop: LootDrop) => {
    soundFx.playAddToLoot();
    if (drop.type === 'skin' && drop.skin) {
      claimSkin(drop.skin);
    } else if (drop.type === 'key' && drop.keysAmount) {
      setState(prev => ({ ...prev, keys: prev.keys + drop.keysAmount! }));
      addToast({
        title: '+1 Hextech Anahtarı!',
        description: 'Envanterine yeni bir anahtar eklendi.',
        type: 'key',
        icon: '🗝️'
      });
    } else if (drop.type === 'essence' && drop.essenceAmount) {
      setState(prev => ({ ...prev, orangeEssence: prev.orangeEssence + drop.essenceAmount! }));
      addToast({
        title: `+${drop.essenceAmount} Turuncu Öz!`,
        description: 'Öz ganimetine eklendi.',
        type: 'info',
        icon: '🔶'
      });
    } else if (drop.type === 'gemstone' && drop.gemstonesAmount) {
      setState(prev => ({ ...prev, gemstones: prev.gemstones + drop.gemstonesAmount! }));
      soundFx.playGemstoneDrop();
      addToast({
        title: '+1 Mor Cevher!',
        description: 'İhtişamlı Mağazada harcanabilir!',
        type: 'gemstone',
        icon: '💎'
      });
    } else if (drop.type === 'chest') {
      setState(prev => ({ ...prev, keys: prev.keys + 1 }));
      addToast({
        title: '+1 Hextech Sandığı & Anahtarı!',
        description: 'Bonus sandık kazandın!',
        type: 'info',
        icon: '🎁'
      });
    }
  }, [claimSkin, addToast]);

  const disenchantSkin = useCallback((skin: SkinItem) => {
    soundFx.playButtonClick();
    setState(prev => {
      const gained = skin.disenchantValue;
      addToast({
        title: 'Öze Ayrıştırıldı!',
        description: `${skin.skinName} ayrıştırıldı ve +${gained} Turuncu Öz kazanıldı.`,
        type: 'info',
        icon: '🔶'
      });
      return {
        ...prev,
        orangeEssence: prev.orangeEssence + gained
      };
    });
  }, [addToast]);

  const buyPrestigeSkin = useCallback((item: PrestigeItem): boolean => {
    if (state.gemstones < item.gemstoneCost) {
      addToast({
        title: 'Yetersiz Mor Cevher!',
        description: `Bu Prestij kostümü almak için ${item.gemstoneCost} Mor Cevher gerekiyor. (Mevcut: ${state.gemstones})`,
        type: 'info',
        icon: '💎'
      });
      return false;
    }

    // Check if already owned
    if (state.inventory.some(s => s.championId === item.championId && s.num === item.num)) {
      addToast({
        title: 'Zaten Sahipsin!',
        description: `${item.skinName} zaten prestij koleksiyonunda bulunuyor!`,
        type: 'info',
        icon: '👑'
      });
      return false;
    }

    soundFx.playGemstoneDrop();
    triggerConfetti('prestige');

    const prestigeSkin: SkinItem = {
      id: `prestige_${item.championId}_${item.num}_${Date.now()}`,
      championId: item.championId,
      championName: item.championName,
      skinName: item.skinName,
      num: item.num,
      rarity: 'Prestige',
      splashUrl: item.splashUrl,
      loadingUrl: item.loadingUrl,
      tileUrl: `https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/${item.championId}.png`,
      rpValue: 0,
      disenchantValue: 1500,
      isPrestige: true,
      isOwned: true,
      unlockedAt: Date.now()
    };

    setState(prev => ({
      ...prev,
      gemstones: prev.gemstones - item.gemstoneCost,
      inventory: [prestigeSkin, ...prev.inventory],
      recentDrops: [
        {
          id: `drop_prestige_${Date.now()}`,
          skin: prestigeSkin,
          username: prev.username || 'Sen',
          timestamp: Date.now(),
          isPrestige: true,
          isCurrentUser: true,
        },
        ...prev.recentDrops
      ].slice(0, 20)
    }));

    addToast({
      title: '👑 PRESTİJ KOSTÜM KAZANILDI!',
      description: `${item.skinName} başarıyla üretildi ve envanterine katıldı!`,
      type: 'prestige',
      icon: '👑'
    });

    return true;
  }, [state.gemstones, state.inventory, addToast]);

  const buyUpgrade = useCallback((upgradeId: string): boolean => {
    const def = UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
    if (!def) return false;

    const currentLvl = state.upgrades[upgradeId] || 0;
    if (currentLvl >= def.maxLevel) {
      addToast({ title: 'Maksimum Seviye', description: 'Bu geliştirme maksimum seviyeye ulaştı.', type: 'info' });
      return false;
    }

    const currentCost = Math.round(def.baseCost * Math.pow(def.costMultiplier, currentLvl));

    if (def.costCurrency === 'xp') {
      if (state.xp < currentCost) {
        addToast({
          title: 'Yetersiz XP!',
          description: `Bu geliştirme için ${currentCost} XP gerekiyor. Baron'a vurarak XP topla!`,
          type: 'info'
        });
        return false;
      }
    } else if (def.costCurrency === 'orangeEssence') {
      if (state.orangeEssence < currentCost) {
        addToast({
          title: 'Yetersiz Turuncu Öz!',
          description: `Bu geliştirme için ${currentCost} Turuncu Öz gerekiyor. Sandıklardan çıkan kostümleri ayrıştırarak elde edebilirsin.`,
          type: 'info'
        });
        return false;
      }
    }

    soundFx.playButtonClick();

    setState(prev => {
      const nextLvl = currentLvl + 1;
      const newUpgrades = { ...prev.upgrades, [upgradeId]: nextLvl };

      // Recalculate derived combat stats
      const newClickPower = 25 + (newUpgrades['wuju_style'] || 0) * 25;
      const newAutoDps = (newUpgrades['guinsoo_blade'] || 0) * 15;
      const newCritChance = 0.05 + (newUpgrades['infinity_edge'] || 0) * 0.025;
      const newCritMult = 2.0 + (newUpgrades['infinity_edge'] || 0) * 0.1;
      const newGemFinder = 0.001 + (newUpgrades['gem_prospector'] || 0) * 0.0005;

      const newXP = def.costCurrency === 'xp' ? prev.xp - currentCost : prev.xp;
      const newOE = def.costCurrency === 'orangeEssence' ? prev.orangeEssence - currentCost : prev.orangeEssence;

      return {
        ...prev,
        xp: newXP,
        orangeEssence: newOE,
        upgrades: newUpgrades,
        clickPower: newClickPower,
        autoDps: newAutoDps,
        critChance: newCritChance,
        critMultiplier: newCritMult,
        gemFinderChance: newGemFinder,
      };
    });

    addToast({
      title: `${def.name} Seviye ${currentLvl + 1}!`,
      description: `Geliştirme başarıyla satın alındı.`,
      type: 'info',
      icon: def.icon
    });

    return true;
  }, [state.upgrades, state.xp, state.orangeEssence, addToast]);

  const acceptDisclaimer = useCallback((username: string, avatarId: string) => {
    setState(prev => ({
      ...prev,
      hasAcceptedDisclaimer: true,
      username: username.trim() || 'Çağrıcı',
      avatarChampionId: avatarId || 'MasterYi',
    }));
    soundFx.playButtonClick();
  }, []);

  const toggleSound = useCallback(() => {
    setState(prev => {
      const nextVal = !prev.soundEnabled;
      soundFx.setEnabled(nextVal);
      return { ...prev, soundEnabled: nextVal };
    });
  }, []);

  const setVolume = useCallback((vol: number) => {
    soundFx.setVolume(vol);
    setState(prev => ({ ...prev, sfxVolume: vol }));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = resetSavedGame();
    setState(fresh);
    addToast({
      title: 'İlerleme Sıfırlandı',
      description: 'Tüm oyun verileri başarıyla sıfırlandı.',
      type: 'info'
    });
  }, [addToast]);

  const closeChestModal = useCallback(() => {
    setActiveChestModal(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        xpNeeded,
        xpProgressPercent,
        combo,
        comboMultiplier,
        floatingTexts,
        toasts,
        alphaCooldownPercent,
        isAlphaReady,
        activeChestModal,
        acceptDisclaimer,
        clickBaron,
        triggerAlphaStrike,
        openChest,
        claimSkin,
        claimDrop,
        disenchantSkin,
        buyPrestigeSkin,
        buyUpgrade,
        toggleSound,
        setVolume,
        resetProgress,
        closeChestModal,
        removeToast,
        addToast,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
