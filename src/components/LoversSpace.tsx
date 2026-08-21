/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LOVERS_PHRASES } from '../data/phrases';
import { CustomPhrase, LoversPhrase } from '../types';
import { 
  Heart, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  BookOpen, 
  Layers, 
  ArrowLeft, 
  Play, 
  CheckSquare, 
  Square, 
  Search, 
  X,
  Flame,
  Moon,
  Smile,
  FastForward
} from 'lucide-react';

interface LoversSpaceProps {
  onNotify?: (msg: string) => void;
}

type AppView = 'home' | 'flashcard_setup' | 'flashcard_play' | 'lessons';

export default function LoversSpace({ onNotify }: LoversSpaceProps) {
  // Navigation View
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Flashcards configuration
  const [selectedFcCategories, setSelectedFcCategories] = useState<string[]>([
    'Romance',
    'Désir',
    'Intime',
    'Après'
  ]);
  const [flashcardRole, setFlashcardRole] = useState<'him' | 'her'>('her');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Long press timer & state (2 seconds to skip to next card)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Lesson mode filters
  const [selectedLessonCategory, setSelectedLessonCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio & interaction states
  const [copiedId, setCopiedId] = useState<string>('');
  const [isPlayingId, setIsPlayingId] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Custom phrases state
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [newFrench, setNewFrench] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newThai, setNewThai] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [showBuilder, setShowBuilder] = useState<boolean>(false);

  const categories = [
    { id: 'Romance', fr: 'Romance', th: 'โรแมนติก', icon: Heart, color: 'from-rose-500/20 to-pink-500/20 border-pink-500/30 text-pink-300' },
    { id: 'Désir', fr: 'Désir', th: 'ความปรารถนา', icon: Flame, color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-300' },
    { id: 'Intime', fr: 'Intime', th: 'เรื่องลับ 🔞', icon: Sparkles, color: 'from-red-500/20 to-rose-500/20 border-rose-500/30 text-rose-300' },
    { id: 'Après', fr: 'Après', th: 'หลังจากนั้น', icon: Moon, color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('lovers_custom_phrases');
    if (saved) {
      try {
        setCustomPhrases(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading custom phrases", e);
      }
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onNotify) onNotify('Phrase copiée dans le presse-papiers !');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleSpeak = (text: string, langCode: 'fr-FR' | 'en-US' | 'th-TH', id: string) => {
    if (!window.speechSynthesis) {
      if (onNotify) onNotify('Synthèse vocale non supportée par votre navigateur.');
      return;
    }
    
    window.speechSynthesis.cancel();
    const cleanedText = text.replace(/\s*\/\s*/g, ', ');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = langCode;
    utterance.rate = langCode === 'th-TH' ? 0.8 : 0.85;

    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const targetLang = langCode.toLowerCase().replace('_', '-');
    const targetLangPrefix = targetLang.split('-')[0];

    let matchingVoice = currentVoices.find(v => {
      const voiceLang = v.lang.toLowerCase().replace('_', '-');
      return voiceLang === targetLang;
    });

    if (!matchingVoice) {
      matchingVoice = currentVoices.find(v => {
        const voiceLang = v.lang.toLowerCase().replace('_', '-');
        return voiceLang.startsWith(targetLangPrefix);
      });
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsPlayingId(id);
    utterance.onend = () => setIsPlayingId('');
    utterance.onerror = () => setIsPlayingId('');

    window.speechSynthesis.speak(utterance);
  };

  const handleAddCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrench || !newThai) {
      alert("Veuillez remplir au moins la version Française et la version Thaï.");
      return;
    }
    const newPhrase: CustomPhrase = {
      id: 'custom_' + Date.now(),
      french: newFrench,
      english: newEnglish || '(Sans traduction anglaise)',
      thai: newThai,
      thaiPhonetic: newPhonetic || '(Pas de phonétique)'
    };
    const updated = [...customPhrases, newPhrase];
    setCustomPhrases(updated);
    localStorage.setItem('lovers_custom_phrases', JSON.stringify(updated));
    setNewFrench('');
    setNewEnglish('');
    setNewThai('');
    setNewPhonetic('');
    if (onNotify) onNotify('Phrase personnalisée ajoutée avec succès !');
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customPhrases.filter(p => p.id !== id);
    setCustomPhrases(updated);
    localStorage.setItem('lovers_custom_phrases', JSON.stringify(updated));
    if (onNotify) onNotify('Phrase personnalisée supprimée.');
  };

  // Combine standard and custom phrases
  const allPhrasesCombined: LoversPhrase[] = [
    ...LOVERS_PHRASES,
    ...customPhrases.map(cp => ({
      id: cp.id,
      category: 'Intime' as const,
      french: cp.french,
      english: cp.english,
      thai: cp.thai,
      thaiPhonetic: cp.thaiPhonetic
    }))
  ];

  // Flashcards active pool based on selected topics
  const flashcardPhrasesPool = allPhrasesCombined.filter(p => selectedFcCategories.includes(p.category));

  // Toggle flashcard category selection
  const toggleFcCategory = (catId: string) => {
    if (selectedFcCategories.includes(catId)) {
      if (selectedFcCategories.length === 1) {
        if (onNotify) onNotify('Veuillez sélectionner au moins une thématique.');
        return;
      }
      setSelectedFcCategories(prev => prev.filter(c => c !== catId));
    } else {
      setSelectedFcCategories(prev => [...prev, catId]);
    }
  };

  const selectAllFcCategories = () => {
    setSelectedFcCategories(['Romance', 'Désir', 'Intime', 'Après']);
  };

  const startFlashcards = () => {
    if (flashcardPhrasesPool.length === 0) {
      if (onNotify) onNotify('Veuillez sélectionner au moins une thématique.');
      return;
    }
    setCardIndex(0);
    setIsFlipped(false);
    setCurrentView('flashcard_play');
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex(prev => (prev + 1) % flashcardPhrasesPool.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex(prev => (prev - 1 + flashcardPhrasesPool.length) % flashcardPhrasesPool.length);
    }, 200);
  };

  // Long press handler (2 seconds to skip to next card)
  const handleTouchStart = () => {
    isLongPressTriggeredRef.current = false;
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsPressing(false);
      // Trigger subtle haptic vibration if supported on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch {
          // ignore
        }
      }
      if (onNotify) {
        onNotify('Passage à la carte suivante (appui 2s) • ถัดไป');
      }
      nextCard();
    }, 2000);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleCardClick = () => {
    // If a long press was triggered, ignore the click to avoid flipping
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    setIsFlipped(!isFlipped);
  };

  // Filter phrases for Lesson mode
  const lessonPhrases = allPhrasesCombined.filter(p => {
    const matchesCat = selectedLessonCategory === 'Tous' || p.category === selectedLessonCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.english.toLowerCase().includes(q) ||
      p.french.toLowerCase().includes(q) ||
      p.thai.toLowerCase().includes(q) ||
      p.thaiPhonetic.toLowerCase().includes(q)
    );
  });

  // =========================================================================
  // 1. PAGE D'ACCUEIL (2 GROS BOUTONS : FLASHCARD vs LEÇON)
  // =========================================================================
  if (currentView === 'home') {
    return (
      <div className="w-full flex-1 flex flex-col justify-center min-h-[calc(100dvh-140px)] gap-4 sm:gap-6 py-2 sm:py-4 animate-fade-in select-none" id="home-mode-selection">
        {/* Subtle sub-header banner */}
        <div className="text-center py-1 sm:py-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-950/40 border border-pink-500/20 text-pink-300 text-xs sm:text-sm font-black">
            <Heart size={14} className="fill-pink-500 text-pink-500 animate-pulse" />
            <span>L'Espace Complice • ภาษาความรัก • 400 Phrases</span>
          </div>
        </div>

        {/* 2 HUGE BUTTONS FILLING ALL THE SPACE */}
        <div className="flex-1 grid grid-rows-2 gap-4 sm:gap-6 w-full max-w-4xl mx-auto">
          {/* BOUTON 1 : MODE FLASHCARDS */}
          <button
            onClick={() => setCurrentView('flashcard_setup')}
            className="group relative w-full h-full min-h-[220px] sm:min-h-[260px] rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#2D1226] via-[#1E0B19] to-[#12070F] border-2 border-pink-500/40 hover:border-pink-400 active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-pink-950/60 hover:shadow-pink-600/20 flex flex-col justify-between items-center text-center overflow-hidden"
            id="btn-home-flashcard-mode"
          >
            {/* Ambient backdrop glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/25 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Badge Top */}
            <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <Sparkles size={16} className="text-pink-300 animate-bounce" />
              <span>Cartes Interactives • บัตรคำศัพท์</span>
            </div>

            {/* Huge bilingual Titles */}
            <div className="relative z-10 space-y-2 sm:space-y-4 my-auto">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg group-hover:text-pink-100 transition-colors">
                MODE FLASHCARDS
              </h2>
              <p className="text-2xl sm:text-4xl md:text-5xl font-black text-pink-300 tracking-wide drop-shadow-md">
                โหมดแฟลชการ์ด
              </p>
            </div>

            {/* Action pill bottom */}
            <div className="relative z-10 flex items-center gap-2 text-xs sm:text-base font-black text-pink-200 bg-pink-950/80 px-6 py-2.5 rounded-full border border-pink-500/40 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-md">
              <Layers size={18} />
              <span>Choisir les thématiques ➔ เลือกหมวดหมู่</span>
            </div>
          </button>

          {/* BOUTON 2 : MODE LEÇONS */}
          <button
            onClick={() => setCurrentView('lessons')}
            className="group relative w-full h-full min-h-[220px] sm:min-h-[260px] rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#121E2D] via-[#0B1520] to-[#070D14] border-2 border-cyan-500/40 hover:border-cyan-400 active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-cyan-950/60 hover:shadow-cyan-600/20 flex flex-col justify-between items-center text-center overflow-hidden"
            id="btn-home-lesson-mode"
          >
            {/* Ambient backdrop glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Badge Top */}
            <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm">
              <BookOpen size={16} className="text-cyan-300" />
              <span>Dictionnaire Complet • รายการประโยค</span>
            </div>

            {/* Huge bilingual Titles */}
            <div className="relative z-10 space-y-2 sm:space-y-4 my-auto">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg group-hover:text-cyan-100 transition-colors">
                MODE LEÇONS
              </h2>
              <p className="text-2xl sm:text-4xl md:text-5xl font-black text-cyan-300 tracking-wide drop-shadow-md">
                โหมดบทเรียน
              </p>
            </div>

            {/* Action pill bottom */}
            <div className="relative z-10 flex items-center gap-2 text-xs sm:text-base font-black text-cyan-200 bg-cyan-950/80 px-6 py-2.5 rounded-full border border-cyan-500/40 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-md">
              <BookOpen size={18} />
              <span>Consulter la liste ➔ ดูรายการทั้งหมด</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PAGE INTERMÉDIAIRE DU MODE FLASHCARDS (CHOIX DES THÉMATIQUES)
  // =========================================================================
  if (currentView === 'flashcard_setup') {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col justify-between min-h-[calc(100dvh-130px)] py-2 sm:py-4 animate-fade-in select-none gap-3 sm:gap-4" id="flashcard-setup-screen">
        {/* Navigation Back & Count Badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
          <button
            onClick={() => setCurrentView('home')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white rounded-xl text-sm sm:text-base font-black flex items-center gap-2 border border-white/15 transition-all"
            id="btn-back-to-home"
          >
            <ArrowLeft size={18} />
            <span>Accueil • หน้าแรก</span>
          </button>

          <span className="text-sm font-black text-pink-300 bg-pink-950/70 px-4 py-1.5 rounded-full border border-pink-500/30">
            {flashcardPhrasesPool.length} / {allPhrasesCombined.length} phrases
          </span>
        </div>

        {/* Title Header - Much larger text */}
        <div className="text-center space-y-1 sm:space-y-2 shrink-0 my-1">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Choisir les thématiques
          </h2>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black text-pink-300 tracking-wide">
            เลือกหมวดหมู่ที่ต้องการฝึก
          </p>
        </div>

        {/* Category Selector Grid - 2 columns with significantly larger fonts */}
        <div className="flex-1 flex flex-col justify-center space-y-2.5 min-h-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300">
              Thématiques ({selectedFcCategories.length}/4)
            </span>
            <button
              onClick={selectAllFcCategories}
              className="text-xs sm:text-sm font-bold text-pink-400 hover:text-pink-300 underline"
            >
              Tout sélectionner / เลือกทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {categories.map(cat => {
              const isSelected = selectedFcCategories.includes(cat.id);
              const Icon = cat.icon;
              const count = allPhrasesCombined.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleFcCategory(cat.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[110px] sm:min-h-[135px] text-left relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br ' + cat.color + ' border-pink-500 shadow-lg ring-1 ring-pink-500/30'
                      : 'bg-[#141416] border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                  id={`btn-select-topic-${cat.id}`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon size={22} />
                    </div>

                    <div className="text-pink-400">
                      {isSelected ? (
                        <CheckSquare size={24} className="text-pink-500" />
                      ) : (
                        <Square size={24} className="text-slate-600" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <p className={`text-lg sm:text-2xl font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {cat.fr}
                    </p>
                    <p className="text-base sm:text-xl font-bold text-pink-300 leading-tight">
                      {cat.th}
                    </p>
                    <span className="text-xs sm:text-sm text-slate-400 font-semibold block pt-0.5">
                      {count} phrases
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Launch Button - Fixed and visible immediately with larger typography */}
        <div className="shrink-0 pt-2">
          <button
            onClick={startFlashcards}
            disabled={flashcardPhrasesPool.length === 0}
            className="w-full min-h-[64px] sm:min-h-[72px] rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:to-rose-500 active:scale-[0.98] text-white font-black text-lg sm:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-pink-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn-start-flashcards"
          >
            <Play size={24} className="fill-white" />
            <span>Lancer les Flashcards ({flashcardPhrasesPool.length}) • เริ่มฝึก</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. JEU FLASHCARD INTERACTIF
  // =========================================================================
  if (currentView === 'flashcard_play') {
    const currentPhrase = flashcardPhrasesPool[cardIndex];

    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1C121A] via-[#100A10] to-[#080508] flex flex-col justify-between p-3 sm:p-5 overflow-hidden h-[100dvh] w-full select-none" id="fc-fullscreen-mode">
        {/* Soft luxury backlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Fullscreen Header */}
        <div className="flex items-center justify-between w-full max-w-xl mx-auto border-b border-white/10 pb-2.5 shrink-0 relative z-10">
          <button
            onClick={() => setCurrentView('flashcard_setup')}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-black border border-white/15 transition-all flex items-center gap-1.5"
            id="btn-return-fc-setup"
          >
            <ArrowLeft size={14} />
            <span>Thèmes • หมวดหมู่</span>
          </button>

          <span className="text-xs sm:text-sm font-black text-pink-300 bg-pink-950/70 px-4 py-1.5 rounded-full uppercase border border-pink-500/30 shadow-sm">
            {currentPhrase?.category} {currentPhrase?.category === 'Intime' ? '🔞' : ''}
          </span>
          
          <button
            onClick={() => setCurrentView('home')}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-black border border-white/15 transition-all"
            id="btn-close-fullscreen-fc"
          >
            Accueil × หน้าแรก
          </button>
        </div>

        {/* Center Card Container */}
        <div className="flex-1 flex flex-col justify-between w-full max-w-xl mx-auto min-h-0 py-2 relative z-10">
          {/* Multi-language role toggle selector inside fullscreen */}
          <div className="grid grid-cols-2 gap-2 w-full bg-[#140D14] p-1.5 rounded-2xl border border-white/10 mb-2 shrink-0 shadow-lg">
            <button
              onClick={() => {
                setFlashcardRole('her');
                setIsFlipped(false);
              }}
              className={`min-h-[44px] py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center ${
                flashcardRole === 'her'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="btn-fc-role-her"
            >
              สำหรับเธอ (🇹🇭 ➔ 🇬🇧)
            </button>

            <button
              onClick={() => {
                setFlashcardRole('him');
                setIsFlipped(false);
              }}
              className={`min-h-[44px] py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center ${
                flashcardRole === 'him'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="btn-fc-role-him"
            >
              Pour Lui (🇫🇷 ➔ 🇬🇧)
            </button>
          </div>

          {currentPhrase ? (
            <div className="w-full flex-1 flex flex-col justify-between min-h-0 gap-2">
              {/* 3D Flip Card */}
              <div 
                onClick={handleCardClick}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className={`relative w-full flex-1 min-h-[340px] rounded-3xl cursor-pointer select-none transition-all duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)] shadow-2xl' : 'shadow-2xl border border-white/15'
                }`}
                id="flashcard-body"
              >
                {/* Hold progress indicator bar - Left to Right filling */}
                {isPressing && (
                  <div className="absolute top-0 left-0 right-0 h-3 bg-black/40 rounded-t-3xl overflow-hidden z-30 pointer-events-none">
                    <div className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 animate-hold-progress origin-left" />
                  </div>
                )}

                {/* Hold 2s visual badge banner when pressing */}
                {isPressing && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-pink-500 text-pink-200 text-sm sm:text-base font-black flex items-center gap-2.5 shadow-2xl animate-pulse pointer-events-none whitespace-nowrap">
                    <FastForward size={22} className="text-pink-400 animate-spin" />
                    <span>Maintien 2s : Carte suivante ➔</span>
                  </div>
                )}
                {/* --- ROLE: HIM (Français ➔ Anglais) --- */}
                {flashcardRole === 'him' && (
                  <>
                    {/* CARD FRONT: French */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#281624] to-[#140B12] border-2 border-pink-500/30 rounded-3xl p-5 sm:p-8 flex flex-col justify-between items-center text-center backface-hidden [backface-visibility:hidden] shadow-2xl shadow-pink-950/50">
                      <span className="text-sm sm:text-base font-black text-pink-300 tracking-wider uppercase flex items-center gap-1.5 bg-pink-950/70 px-5 py-2 rounded-full border border-pink-500/30">
                        <Heart size={16} className="text-pink-500 fill-pink-500 animate-pulse" />
                        Pour Lui • สำหรับเขา
                      </span>
                      
                      <div className="space-y-6 py-4 my-auto w-full">
                        <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight px-2 drop-shadow-md">
                          {currentPhrase.french}
                        </p>
                        <div>
                          <span className="text-base sm:text-lg text-pink-200 font-black bg-pink-500/25 border border-pink-500/35 px-6 py-3 rounded-full inline-block shadow-md">
                            แตะเพื่อดูคำแปล ➔
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentPhrase.french, 'fr-FR', currentPhrase.id + '_fc_fr_front');
                        }}
                        className="min-h-[58px] px-9 rounded-2xl bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-black shadow-xl shadow-pink-600/30 flex items-center gap-3 text-lg sm:text-xl transition-all"
                      >
                        <Volume2 size={24} /> <span>Écouter 🇫🇷</span>
                      </button>
                    </div>

                    {/* CARD BACK: English Answer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#381629] via-[#240E1B] to-[#140810] rounded-3xl p-5 sm:p-8 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-amber-500/40 shadow-2xl shadow-amber-950/40">
                      <span className="text-sm sm:text-base font-black text-amber-300 tracking-wider uppercase flex items-center gap-1.5 bg-amber-950/70 px-5 py-2 rounded-full border border-amber-500/30">
                        <Sparkles size={16} className="text-amber-400 animate-bounce" />
                        English 🇬🇧 เฉลย
                      </span>

                      <div className="space-y-6 w-full my-auto py-2">
                        <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight px-1 drop-shadow-md">
                          {currentPhrase.english}
                        </p>
                        
                        {/* Reference translation in Thai */}
                        <div className="bg-[#180A15]/95 p-5 sm:p-7 rounded-2xl border border-white/15 max-w-full w-full mx-auto shadow-inner space-y-2">
                          <p className="text-2xl sm:text-3xl text-pink-200 font-black tracking-wide">
                            🇹🇭 {currentPhrase.thai}
                          </p>
                          <p className="text-base sm:text-lg text-pink-300 font-bold italic">
                            {currentPhrase.thaiPhonetic}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3.5 w-full justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(currentPhrase.english, 'en-US', currentPhrase.id + '_fc_en_back');
                          }}
                          className="min-h-[58px] px-9 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black shadow-xl shadow-amber-500/20 flex items-center gap-3 text-lg sm:text-xl transition-all"
                        >
                          <Volume2 size={24} />
                          <span>Listen 🇬🇧</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(currentPhrase.english, currentPhrase.id + '_fc_copy');
                          }}
                          className="min-h-[58px] min-w-[58px] rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 flex items-center justify-center border border-white/15 transition-colors"
                        >
                          <Copy size={24} />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* --- ROLE: HER (Thaï ➔ Anglais) --- */}
                {flashcardRole === 'her' && (
                  <>
                    {/* CARD FRONT: Thai */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#281624] to-[#140B12] border-2 border-pink-500/30 rounded-3xl p-5 sm:p-8 flex flex-col justify-between items-center text-center backface-hidden [backface-visibility:hidden] shadow-2xl shadow-pink-950/50">
                      <span className="text-sm sm:text-base font-black text-pink-300 tracking-wider uppercase flex items-center gap-1.5 bg-pink-950/70 px-5 py-2 rounded-full border border-pink-500/30">
                        <Heart size={16} className="text-pink-500 fill-pink-500 animate-pulse" />
                        Pour Elle • สำหรับเธอ
                      </span>
                      
                      <div className="space-y-5 py-4 my-auto w-full">
                        <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight px-2 drop-shadow-md">
                          {currentPhrase.thai}
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl text-pink-300 font-bold italic px-3">
                          {currentPhrase.thaiPhonetic}
                        </p>
                        <div className="pt-2">
                          <span className="text-base sm:text-lg text-pink-200 font-black bg-pink-500/25 border border-pink-500/35 px-6 py-3 rounded-full inline-block shadow-md">
                            แตะเพื่อดูเฉลยภาษาอังกฤษ ➔
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentPhrase.thai, 'th-TH', currentPhrase.id + '_fc_th_front');
                        }}
                        className="min-h-[58px] px-9 rounded-2xl bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-black shadow-xl shadow-pink-600/30 flex items-center gap-3 text-lg sm:text-xl transition-all"
                      >
                        <Volume2 size={24} /> <span>ฟังเสียง 🇹🇭</span>
                      </button>
                    </div>

                    {/* CARD BACK: English Answer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#381629] via-[#240E1B] to-[#140810] rounded-3xl p-5 sm:p-8 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-amber-500/40 shadow-2xl shadow-amber-950/40">
                      <span className="text-sm sm:text-base font-black text-amber-300 tracking-wider uppercase flex items-center gap-1.5 bg-amber-950/70 px-5 py-2 rounded-full border border-amber-500/30">
                        <Sparkles size={16} className="text-amber-400 animate-bounce" />
                        English 🇬🇧 เฉลย
                      </span>

                      <div className="space-y-6 w-full my-auto py-2">
                        <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight px-1 drop-shadow-md">
                          {currentPhrase.english}
                        </p>
                        
                        {/* Reference translation in French */}
                        <div className="bg-[#180A15]/95 p-5 sm:p-7 rounded-2xl border border-white/15 max-w-full w-full mx-auto shadow-inner">
                          <p className="text-2xl sm:text-3xl text-pink-200 font-black tracking-wide">
                            🇫🇷 {currentPhrase.french}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3.5 w-full justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(currentPhrase.english, 'en-US', currentPhrase.id + '_fc_en_her');
                          }}
                          className="min-h-[58px] px-9 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black shadow-xl shadow-amber-500/20 flex items-center gap-3 text-lg sm:text-xl transition-all"
                        >
                          <Volume2 size={24} /> <span>Listen 🇬🇧</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(currentPhrase.english, currentPhrase.id + '_fc_copy_en_her');
                          }}
                          className="min-h-[58px] min-w-[58px] rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 flex items-center justify-center border border-white/15 transition-colors"
                        >
                          <Copy size={24} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Fullscreen Navigation footer */}
              <div className="w-full flex items-center justify-between gap-3 pt-1 shrink-0">
                <button 
                  onClick={prevCard}
                  className="min-h-[52px] px-5 bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 rounded-2xl text-xs sm:text-sm font-black text-slate-200 transition-all flex-1 flex items-center justify-center text-center shadow-md"
                  id="btn-fc-prev"
                >
                  ย้อนกลับ • Précédent
                </button>
                
                <span className="text-sm sm:text-base font-black text-pink-300 whitespace-nowrap bg-pink-950/70 px-4 py-3 rounded-2xl border border-pink-500/30 shadow-inner">
                  {cardIndex + 1} / {flashcardPhrasesPool.length}
                </span>
                
                <button 
                  onClick={nextCard}
                  className="min-h-[52px] px-5 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex-1 flex items-center justify-center text-center shadow-xl shadow-pink-600/30"
                  id="btn-fc-next"
                >
                  ถัดไป • Suivant
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400 italic">Aucune phrase dans cette catégorie.</p>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. MODE LEÇONS (LISTE COMPLÈTE LES UNES SOUS LES AUTRES)
  // =========================================================================
  return (
    <div className="space-y-4 animate-fade-in" id="lessons-view">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161618] p-3 rounded-2xl border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('home')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 border border-white/15 transition-all"
            id="btn-lessons-back-home"
          >
            <ArrowLeft size={16} />
            <span>Accueil • หน้าแรก</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>

          <span className="text-xs font-black text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            {lessonPhrases.length} phrases trouvées
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher / ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-8 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition-all"
            id="input-search-lessons"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
        {[{ id: 'Tous', fr: 'Tous', th: 'ทั้งหมด' }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedLessonCategory(cat.id)}
            className={`px-2.5 py-2.5 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 text-center min-h-[44px] ${
              selectedLessonCategory === cat.id
                ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 shadow-md ring-1 ring-cyan-500/20'
                : 'border-slate-800/80 bg-[#111113] text-slate-400 hover:bg-slate-850'
            } ${cat.id === 'Tous' ? 'col-span-2 sm:col-span-1' : 'col-span-1'}`}
            id={`btn-lesson-cat-${cat.id}`}
          >
            <span>{cat.fr} / {cat.th}</span>
            {cat.id === 'Intime' && <span className="text-[10px] shrink-0">🔞</span>}
          </button>
        ))}
      </div>

      {/* STANDARD DICTIONARY LIST VIEW (LES UNES SOUS LES AUTRES) */}
      <div className="space-y-3.5">
        {lessonPhrases.length > 0 ? (
          lessonPhrases.map((phrase) => {
            const isCustom = phrase.id.startsWith('custom_');
            return (
              <div 
                key={phrase.id}
                className="bg-[#161618] border border-slate-850 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col space-y-3.5"
                id={`phrase-card-${phrase.id}`}
              >
                {/* Header badge */}
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                    phrase.category === 'Romance' ? 'bg-pink-950/40 text-pink-300 border-pink-900/30' :
                    phrase.category === 'Désir' ? 'bg-purple-950/40 text-purple-300 border-purple-900/30' :
                    phrase.category === 'Intime' ? 'bg-rose-950/40 text-rose-300 border-rose-900/30' :
                    'bg-blue-950/40 text-blue-300 border-blue-900/30'
                  }`}>
                    {phrase.category} {phrase.category === 'Intime' ? '🔞' : ''}
                  </span>
                  {isCustom && (
                    <button
                      onClick={() => handleDeleteCustom(phrase.id)}
                      className="text-slate-500 hover:text-red-500 transition-colors p-1 rounded"
                      title="Supprimer cette phrase"
                      id={`btn-del-custom-${phrase.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* 1. Main Primary Headline: English in largest typography */}
                <div className="space-y-1">
                  <p className="font-black text-white text-xl sm:text-2xl leading-snug tracking-tight">
                    {phrase.english}
                  </p>
                </div>

                {/* 2. Thai Translation Block */}
                <div className="bg-pink-950/25 p-4 rounded-xl border border-pink-900/35 space-y-1.5 shadow-inner">
                  <p className="font-black text-pink-200 text-lg sm:text-2xl tracking-wide">
                    🇹🇭 {phrase.thai}
                  </p>
                  <p className="text-sm sm:text-base text-pink-300 italic font-medium leading-relaxed">
                    Phonétique : <strong className="font-bold text-pink-100">{phrase.thaiPhonetic}</strong>
                  </p>
                </div>

                {/* 3. French Translation */}
                <div className="bg-[#121215] px-4 py-3 rounded-xl border border-white/5 flex items-center gap-2.5">
                  <span className="text-base">🇫🇷</span>
                  <p className="text-base sm:text-lg font-bold text-slate-200 leading-snug">
                    {phrase.french}
                  </p>
                </div>

                {/* 4. Actions Bar with 3 Oral/Audio buttons (🇬🇧, 🇹🇭, 🇫🇷) & Copy */}
                <div className="border-t border-slate-800/60 pt-3 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSpeak(phrase.english, 'en-US', phrase.id + '_en')}
                      className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                        isPlayingId === phrase.id + '_en' 
                          ? 'bg-amber-950/40 text-amber-200 border-amber-800 shadow-sm ring-1 ring-amber-500/30' 
                          : 'border-slate-800 hover:bg-slate-800/60 text-slate-300 bg-[#111113]'
                      }`}
                      title="Prononcer l'anglais"
                      id={`btn-speak-en-${phrase.id}`}
                    >
                      <Volume2 size={16} />
                      <span>🇬🇧 English</span>
                    </button>

                    <button
                      onClick={() => handleSpeak(phrase.thai, 'th-TH', phrase.id + '_th')}
                      className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                        isPlayingId === phrase.id + '_th' 
                          ? 'bg-pink-950/40 text-pink-200 border-pink-800 shadow-sm ring-1 ring-pink-500/30' 
                          : 'border-slate-800 hover:bg-slate-800/60 text-slate-300 bg-[#111113]'
                      }`}
                      title="Prononcer le thaï"
                      id={`btn-speak-th-${phrase.id}`}
                    >
                      <Volume2 size={16} />
                      <span>🇹🇭 ไทย</span>
                    </button>

                    <button
                      onClick={() => handleSpeak(phrase.french, 'fr-FR', phrase.id + '_fr')}
                      className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                        isPlayingId === phrase.id + '_fr' 
                          ? 'bg-blue-950/40 text-blue-200 border-blue-800 shadow-sm ring-1 ring-blue-500/30' 
                          : 'border-slate-800 hover:bg-slate-800/60 text-slate-300 bg-[#111113]'
                      }`}
                      title="Prononcer le français"
                      id={`btn-speak-fr-${phrase.id}`}
                    >
                      <Volume2 size={16} />
                      <span>🇫🇷 Français</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(`${phrase.english} ➔ 🇹🇭 ${phrase.thai} (${phrase.thaiPhonetic}) / 🇫🇷 ${phrase.french}`, phrase.id)}
                    className="min-h-[44px] px-4 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all bg-[#111113]"
                    id={`btn-copy-phrase-${phrase.id}`}
                  >
                    {copiedId === phrase.id ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        <span className="text-green-400">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#161618] rounded-2xl border border-slate-800/60 text-slate-400 space-y-2">
            <p className="text-base font-bold">Aucune phrase ne correspond à votre recherche.</p>
            <p className="text-xs text-slate-500">Essayez avec un autre mot ou une autre catégorie.</p>
          </div>
        )}
      </div>

      {/* DISCREET TOGGLE FOR CUSTOM ADDING SECTION */}
      <div className="pt-4">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="text-slate-600 hover:text-slate-400 active:text-pink-400 text-[11px] mx-auto block py-2 underline tracking-wider transition-colors"
          id="btn-toggle-custom-form"
        >
          {showBuilder ? "× Masquer le formulaire de création" : "⚙️ Gérer les phrases personnalisées"}
        </button>
      </div>

      {/* CUSTOM PHRASE BUILDER */}
      {showBuilder && (
        <div className="bg-[#161618] rounded-2xl border border-slate-800/60 p-5 space-y-4 animate-slide-in">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Plus className="text-pink-500" size={16} />
              Ajouter nos expressions personnalisées
            </h3>
            <p className="text-xs text-slate-400">
              Enregistrez vos expressions complices. Stockage 100 % local et privé sur votre appareil.
            </p>
          </div>

          <form onSubmit={handleAddCustomPhrase} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version Française</label>
              <input
                type="text"
                placeholder="Ex : J'adore quand tu m'embrasses..."
                value={newFrench}
                onChange={(e) => setNewFrench(e.target.value)}
                className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-french"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version Anglaise</label>
              <input
                type="text"
                placeholder="Ex : I love it when you kiss me..."
                value={newEnglish}
                onChange={(e) => setNewEnglish(e.target.value)}
                className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-english"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version Thaïlandaise</label>
              <input
                type="text"
                placeholder="Ex : ฉันชอบเวลาที่คุณจูบ..."
                value={newThai}
                onChange={(e) => setNewThai(e.target.value)}
                className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-thai"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phonétique Thaï</label>
              <input
                type="text"
                placeholder="Ex : Chan chop we-laa..."
                value={newPhonetic}
                onChange={(e) => setNewPhonetic(e.target.value)}
                className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-phonetic"
              />
            </div>

            <div className="sm:col-span-2 pt-2 flex justify-end">
              <button
                type="submit"
                className="min-h-[44px] w-full sm:w-auto px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-600/20"
                id="btn-submit-new-phrase"
              >
                <Heart size={14} className="fill-white" /> Enregistrer localement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

