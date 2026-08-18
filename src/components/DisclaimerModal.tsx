import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, User, ChevronRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AVATAR_CHAMPIONS, DDRAGON_ICONS } from '../services/dataDragon';

export const DisclaimerModal: React.FC = () => {
  const { state, acceptDisclaimer } = useGame();
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('MasterYi');
  const [errorMsg, setErrorMsg] = useState('');

  if (state.hasAcceptedDisclaimer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg('Lütfen devam etmek için bir Çağrıcı Adı (Kullanıcı Adı) giriniz.');
      return;
    }
    acceptDisclaimer(usernameInput.trim(), selectedAvatar);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010a13]/95 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[#1e2328] border-2 border-[#c8aa6e] shadow-[0_0_50px_rgba(0,0,0,0.8)] text-[#f0e6d2] my-8 p-6 md:p-8 rounded-sm"
        >
          {/* Vibrant Palette Diamond Warning Badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#c8aa6e] rotate-45 border-4 border-[#1e2328] flex items-center justify-center shadow-lg">
            <span className="-rotate-45 font-black text-[#1e2328] text-2xl">!</span>
          </div>

          <div className="text-center mt-4 mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-[#c8aa6e] font-['Cinzel',serif]">
              Yasal Uyarı & Bilgilendirme
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#00c8c8] font-bold mt-1">
              LoL Hextech Clicker Simülatörü
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Legal Notice Box */}
            <div className="bg-[#010a13] border border-[#005a82] p-4 text-center space-y-2 rounded-sm">
              <p className="text-xs md:text-sm text-[#a09b8c] leading-relaxed">
                Bu proje Riot Games ile ilişkili değildir. Tüm görseller ve isimler Riot Games’in mülkiyetindedir.
              </p>
              <p className="text-xs md:text-sm text-white font-medium">
                Bu proje tamamen hayran yapımıdır (fan-made) ve hiçbir kar amacı gütmez.
              </p>
            </div>

            {/* Profile Setup */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#c8aa6e] mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00c8c8]" />
                  Çağrıcı Adınızı Belirleyin
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Örn: Summoner_Yi, Faker, BaronSlayer"
                  maxLength={24}
                  className="w-full bg-[#010a13] border border-[#c8aa6e]/40 focus:border-[#00c8c8] px-4 py-2.5 text-sm text-[#f0e6d2] placeholder-[#5c5b57] focus:outline-none transition-all font-semibold tracking-wide"
                />
                {errorMsg && (
                  <p className="text-xs text-rose-400 font-semibold mt-1">{errorMsg}</p>
                )}
              </div>

              {/* Champion Avatar Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#00c8c8] mb-2">
                  Profil Simgesi Seçin
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-2 bg-[#010a13] border border-[#1e2328]">
                  {AVATAR_CHAMPIONS.map((champ) => {
                    const isSelected = selectedAvatar === champ.id;
                    return (
                      <button
                        key={champ.id}
                        type="button"
                        onClick={() => setSelectedAvatar(champ.id)}
                        className={`relative aspect-square border-2 transition-all p-0.5 group ${
                          isSelected
                            ? 'border-[#c8aa6e] shadow-[0_0_12px_#c8aa6e] scale-105 bg-[#c89b3c]/20'
                            : 'border-[#1e2328] hover:border-[#00c8c8]/60 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={`${DDRAGON_ICONS}/${champ.id}.png`}
                          alt={champ.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-0.5 right-0.5 bg-[#c8aa6e] text-black rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Accept Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#c89b3c] hover:bg-[#f0e6d2] text-[#010a13] font-black uppercase tracking-[0.2em] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Kabul Ediyorum ve Başla</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Riot Legal Footnote */}
            <div className="pt-2 text-[10px] italic text-[#a09b8c]/60 text-center leading-normal">
              Riot Games, League of Legends, and Hextech are trademarks or registered trademarks of Riot Games, Inc.
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
