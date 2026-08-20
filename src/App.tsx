/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoversSpace from './components/LoversSpace';
import { Heart, Lock, Unlock, LogOut, Sparkles } from 'lucide-react';

export default function App() {
  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0E] flex flex-col justify-between font-sans antialiased text-slate-200">
      
      {/* MAIN APPLICATION CONTENT (UNLOCKED DIRECT ACCESS) */}
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
          </div>
        </header>

        {/* LOVERS INTIMATE WORKSPACE DIRECTLY */}
        <div className="flex-grow w-full max-w-5xl mx-auto p-4 pb-20 animate-fade-in" id="lovers-container">
          <LoversSpace onNotify={triggerNotify} />
        </div>

      </div>

      {/* Shared bottom footer */}
      <footer className="bg-[#161618] border-t border-slate-800/50 text-slate-500 text-center py-3 text-[9px] tracking-wider uppercase font-medium mt-auto" id="shared-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>Harmonie © 2026 • Confidentialité absolue (localStorage)</span>
          <span>Développé pour l'Union Complice & le Multilinguisme</span>
        </div>
      </footer>
    </div>
  );
}
