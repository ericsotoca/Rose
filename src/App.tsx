/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoversSpace from './components/LoversSpace';
import { Heart, Lock, Unlock, LogOut, Sparkles } from 'lucide-react';

export default function App() {
  // Password State
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Check login on mount
  useEffect(() => {
    const unlocked = localStorage.getItem('app_unlocked') === 'true';
    if (unlocked) {
      setIsUnlocked(true);
    }
  }, []);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toUpperCase() === 'LOVE') {
      setIsUnlocked(true);
      setPasswordError(false);
      localStorage.setItem('app_unlocked', 'true');
      triggerNotify("Bienvenue ! Application déverrouillée.");
    } else {
      setPasswordError(true);
      setPassword('');
      triggerNotify("Code d’accès incorrect.");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('app_unlocked');
    triggerNotify("Application verrouillée.");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0E] flex flex-col justify-between font-sans antialiased text-slate-200">
      
      {/* 1. PASSWORD GATE (LOCKED ENTRANCE SCREEN) */}
      {!isUnlocked ? (
        <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white relative overflow-hidden" id="lock-screen">
          {/* Soft background glow decoration */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner mb-2 animate-pulse">
              <Heart className="fill-rose-500 text-rose-500" size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
                Harmonie
              </h1>
              <p className="text-xs text-rose-400 uppercase tracking-widest font-semibold font-sans">
                Espace Complice Intime
              </p>
              <div className="h-[1px] bg-slate-800 w-24 mx-auto my-3"></div>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Veuillez saisir le code d’accès secret partagé pour déverrouiller la plateforme.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Code Secret d'Accès</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    placeholder="Saisissez le mot de passe..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 min-h-[44px] bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none text-center tracking-widest font-bold"
                    id="input-password"
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 font-semibold mt-1 text-center animate-pulse">
                    ⚠️ Mot de passe erroné (Indice : LOVE)
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/15"
                id="btn-unlock"
              >
                <Unlock size={16} /> Déverrouiller la Plateforme
              </button>
            </form>

            <p className="text-[10px] text-slate-500 pt-2 font-sans font-medium">
              Système confidentiel • Sécurisé localement • Sans transfert serveur
            </p>
          </div>
        </div>
      ) : (
        
        /* 2. MAIN APPLICATION CONTENT (UNLOCKED) */
        <div className="flex-grow flex flex-col bg-[#0D0D0E]" id="app-workspace">
          
          {/* Notification Banner */}
          {notification && (
            <div className="fixed top-4 right-4 z-50 bg-[#161618] text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-800 animate-slide-in">
              <Sparkles className="text-amber-400" size={14} />
              <span>{notification}</span>
            </div>
          )}

          {/* Core Header */}
          <header className="bg-[#161618] text-white border-b border-slate-800/50 p-4 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 select-none">
                  <Heart className="text-rose-500 fill-rose-500 shrink-0 animate-pulse" size={20} />
                  <span className="font-serif font-extrabold text-lg tracking-tight text-white">Harmonie</span>
                </div>
                <div className="hidden sm:block h-4 w-[1px] bg-slate-800"></div>
                
                {/* Active Indicator Breadcrumb */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <span className="text-pink-400">Espace Complice 🔞</span>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLock}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white/5 hover:bg-white/10 rounded-lg"
                  title="Verrouiller l'application"
                  id="btn-header-lock"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* LOVERS INTIMATE WORKSPACE DIRECTLY */}
          <div className="flex-grow w-full max-w-5xl mx-auto p-4 sm:p-6 pb-24 animate-fade-in" id="lovers-container">
            <LoversSpace onNotify={triggerNotify} />
          </div>

        </div>
      )}

      {/* Shared bottom footer */}
      <footer className="bg-[#161618] border-t border-slate-800/50 text-slate-500 text-center py-4 text-[10px] sm:text-xs tracking-wider uppercase font-medium mt-auto" id="shared-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Harmonie © 2026 • Confidentialité absolue (localStorage)</span>
          <span>Développé pour l'Union Complice & le Multilinguisme</span>
        </div>
      </footer>
    </div>
  );
}
