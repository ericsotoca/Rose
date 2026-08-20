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
    if (password === '555') {
      setIsUnlocked(true);
      setPasswordError(false);
      localStorage.setItem('app_unlocked', 'true');
      triggerNotify("Bienvenue ! Application déverrouillée.");
    } else {
      setPasswordError(true);
      setPassword('');
      triggerNotify("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('app_unlocked');
    triggerNotify("Application verrouillée.");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0E] flex flex-col justify-between font-sans antialiased text-slate-200">
      
      {/* 1. PASSWORD GATE (LOCKED ENTRANCE SCREEN) - 100% MOBILE FULLSCREEN NO OVERFLOW */}
      {!isUnlocked ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center p-4 bg-gradient-to-b from-[#0B0A0D] via-[#150F13] to-[#08080A] text-white overflow-hidden h-[100dvh] w-full" id="lock-screen">
          {/* Subtle slow pulsing design accents */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

          <div className="w-full max-w-[340px] bg-[#121214]/90 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl space-y-6 text-center animate-fade-in relative z-10">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 shadow-inner">
              <Heart className="fill-pink-500 text-pink-500" size={20} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                ฮาร์โมนี
              </h1>
              <p className="text-[10px] text-pink-400 uppercase tracking-widest font-extrabold font-sans">
                พื้นที่ลับรักเราสองคน 🔞
              </p>
              <div className="h-[1px] bg-slate-800/60 w-16 mx-auto my-2"></div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed px-1">
                กรุณาป้อนรหัสผ่านลับสามหลักเพื่อปลดล็อกเข้าสู่พื้นที่ส่วนตัว
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block pl-1">รหัสผ่านลับเฉพาะกิจ</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="ป้อนรหัสผ่าน..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 min-h-[44px] bg-slate-950 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 outline-none text-center tracking-widest font-extrabold"
                    id="input-password"
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-pink-400 font-semibold mt-1 text-center animate-pulse">
                    ⚠️ รหัสผ่านไม่ถูกต้อง (คำใบ้: 555)
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-bold rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/10"
                id="btn-unlock"
              >
                <Unlock size={14} /> เปิดประตูเข้าสู่ระบบ
              </button>
            </form>

            <p className="text-[9px] text-slate-500 pt-1 font-sans font-medium">
              ระบบส่วนบุคคล • บันทึกแบบออฟไลน์บนโทรศัพท์ • ไม่มีการอัปโหลดข้อมูลใดๆ
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
          <header className="bg-[#161618] text-white border-b border-slate-800/50 p-3 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 select-none">
                  <Heart className="text-pink-500 fill-pink-500 shrink-0 animate-pulse" size={18} />
                  <span className="font-sans font-black text-base tracking-tight text-white">Harmonie</span>
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
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </header>

          {/* LOVERS INTIMATE WORKSPACE DIRECTLY */}
          <div className="flex-grow w-full max-w-5xl mx-auto p-4 pb-20 animate-fade-in" id="lovers-container">
            <LoversSpace onNotify={triggerNotify} />
          </div>

        </div>
      )}

      {/* Shared bottom footer - Only shown when unlocked */}
      {isUnlocked && (
        <footer className="bg-[#161618] border-t border-slate-800/50 text-slate-500 text-center py-3 text-[9px] tracking-wider uppercase font-medium mt-auto" id="shared-footer">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <span>Harmonie © 2026 • Confidentialité absolue (localStorage)</span>
            <span>Développé pour l'Union Complice & le Multilinguisme</span>
          </div>
        </footer>
      )}
    </div>
  );
}
