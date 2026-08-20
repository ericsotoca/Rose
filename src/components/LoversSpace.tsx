/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LOVERS_PHRASES } from '../data/phrases';
import { CustomPhrase, LoversPhrase } from '../types';
import { Heart, Volume2, Copy, Check, Sparkles, Plus, Trash2, ArrowRightLeft, BookOpen, Layers } from 'lucide-react';

interface LoversSpaceProps {
  onNotify?: (msg: string) => void;
}

export default function LoversSpace({ onNotify }: LoversSpaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [copiedId, setCopiedId] = useState<string>('');
  const [isPlayingId, setIsPlayingId] = useState<string>('');
  
  // Custom phrases state
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [newFrench, setNewFrench] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newThai, setNewThai] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');

  // Flashcards Game states
  const [flashcardMode, setFlashcardMode] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<'french' | 'thai' | 'english'>('thai');
  const [flashcardRole, setFlashcardRole] = useState<'him' | 'her'>('him');
  const [showBuilder, setShowBuilder] = useState<boolean>(false);

  const categories = [
    { id: 'Tous', fr: 'Tous', th: 'ทั้งหมด' },
    { id: 'Romance', fr: 'Romance', th: 'โรแมนติก' },
    { id: 'Désir', fr: 'Désir', th: 'ความปรารถนา' },
    { id: 'Intime', fr: 'Intime', th: 'เรื่องลับ 🔞' },
    { id: 'Après', fr: 'Après', th: 'หลังจากนั้น' }
  ];

  // Load and cache voices for synthesis
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

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

  // Speaks French or English or Thai using native speech synthesis
  const handleSpeak = (text: string, langCode: 'fr-FR' | 'en-US' | 'th-TH', id: string) => {
    if (!window.speechSynthesis) {
      if (onNotify) onNotify('Synthèse vocale non supportée par votre navigateur.');
      return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean up text to replace slashes with a natural pause (comma + space)
    // to prevent the TTS engine from pronouncing "barre oblique" or "slash"
    const cleanedText = text.replace(/\s*\/\s*/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = langCode;
    utterance.rate = langCode === 'th-TH' ? 0.8 : 0.85; // slightly slower for better learning

    // Find the best voice matching the language code
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const targetLang = langCode.toLowerCase().replace('_', '-');
    const targetLangPrefix = targetLang.split('-')[0];

    // Try exact match first (e.g. 'th-th' or 'fr-fr')
    let matchingVoice = currentVoices.find(v => {
      const voiceLang = v.lang.toLowerCase().replace('_', '-');
      return voiceLang === targetLang;
    });

    // Fallback to prefix match (e.g. starts with 'th')
    if (!matchingVoice) {
      matchingVoice = currentVoices.find(v => {
        const voiceLang = v.lang.toLowerCase().replace('_', '-');
        return voiceLang.startsWith(targetLangPrefix);
      });
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else {
      console.warn(`No specific voice matching ${langCode} found. Using default.`);
    }

    utterance.onstart = () => setIsPlayingId(id);
    utterance.onend = () => setIsPlayingId('');
    utterance.onerror = () => setIsPlayingId('');

    window.speechSynthesis.speak(utterance);
  };

  // Create new couple phrase
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
      category: 'Intime' as const, // Put customs in intimate category by default
      french: cp.french,
      english: cp.english,
      thai: cp.thai,
      thaiPhonetic: cp.thaiPhonetic
    }))
  ];

  const filteredPhrases = allPhrasesCombined.filter(p => selectedCategory === 'Tous' || p.category === selectedCategory);

  // Flashcards navigation
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % filteredPhrases.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev - 1 + filteredPhrases.length) % filteredPhrases.length);
    }, 200);
  };

  const activeCat = categories.find(c => c.id === selectedCategory);
  const badgeLabel = activeCat ? `${activeCat.fr} / ${activeCat.th}` : selectedCategory;

  return (
    <div className="space-y-5" id="lovers-workspace">
      {/* Introduction Hero Section - Super compact & simplified */}
      <div className="bg-gradient-to-r from-pink-950/20 via-rose-950/10 to-amber-950/20 p-4 rounded-xl border border-pink-900/20 text-center space-y-1.5 shadow-sm">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
          <Heart className="fill-pink-500 text-pink-500 shrink-0" size={16} />
          <span>L'Espace Complice • ภาษาความรัก</span>
        </h2>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Dictionnaire amoureux bilingue 🇫🇷 🇬🇧 🇹🇭. Exprimez vos désirs en toute complicité.
        </p>
      </div>

      {/* Control Navigation Bars - Highly ergonomic for mobile screens */}
      <div className="flex flex-col gap-3 bg-[#161618] p-3 rounded-xl border border-slate-800/40 shadow-sm">
        {/* Categories horizontally scrollable bar with touch indicators */}
        <div className="flex gap-1.5 overflow-x-auto w-full pb-1.5 scrollbar-none snap-x snap-mandatory">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap min-h-[38px] flex items-center justify-center gap-1.5 snap-start ${
                selectedCategory === cat.id
                  ? 'border-pink-500 bg-pink-950/40 text-pink-300 shadow-inner'
                  : 'border-slate-800/80 bg-[#111113] text-slate-400 hover:bg-slate-850'
              }`}
              id={`btn-cat-${cat.id}`}
            >
              <span>{cat.fr} / {cat.th}</span>
              {cat.id === 'Intime' && <span className="text-[10px]">🔞</span>}
            </button>
          ))}
        </div>

        {/* View mode toggle - Large comfortable touch size */}
        <button
          onClick={() => setFlashcardMode(!flashcardMode)}
          className="w-full min-h-[44px] px-4 py-2.5 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-600/10"
          id="btn-toggle-flashcards"
        >
          {flashcardMode ? (
            <>
              <BookOpen size={14} /> <span>Liste complète / รายการทั้งหมด</span>
            </>
          ) : (
            <>
              <Layers size={14} /> <span>Flashcards / แฟลชการ์ด 🌟</span>
            </>
          )}
        </button>
      </div>

      {/* FLASHCARD INTERACTIVE GAME VIEW - FULLSCREEN OVERLAY ON ACTIVE */}
      {flashcardMode && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1C121A] via-[#100A10] to-[#080508] flex flex-col justify-between p-4 sm:p-6 overflow-hidden h-[100dvh] w-full" id="fc-fullscreen-mode">
          {/* Soft luxury backlights */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Fullscreen Header */}
          <div className="flex items-center justify-between w-full border-b border-white/5 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-pink-300 bg-pink-950/60 px-3.5 py-1.5 rounded-full uppercase border border-pink-500/20 shadow-sm">
                {badgeLabel}
              </span>
            </div>
            
            <button
              onClick={() => setFlashcardMode(false)}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-extrabold border border-white/10 transition-colors"
              id="btn-close-fullscreen-fc"
            >
              ปิด × Quitter
            </button>
          </div>

          {/* Center Card Container */}
          <div className="flex-grow flex flex-col justify-center items-center py-6 relative z-10 w-full max-w-md mx-auto">
            {/* Multi-language role toggle selector inside fullscreen */}
            <div className="grid grid-cols-2 gap-2 w-full bg-[#121214] p-1 rounded-xl border border-slate-850 mb-6">
              <button
                onClick={() => {
                  setFlashcardRole('her');
                  setIsFlipped(false);
                  setCardIndex(0);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-extrabold transition-all text-center ${
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
                  setCardIndex(0);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-extrabold transition-all text-center ${
                  flashcardRole === 'him'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-fc-role-him"
              >
                Pour Lui (🇫🇷 ➔ 🇬🇧)
              </button>
            </div>

            {filteredPhrases.length > 0 ? (
              <div className="w-full flex-grow flex flex-col justify-between max-h-[58vh] sm:max-h-[62vh] space-y-4">
                {/* 3D Flip Card - Large vertical layout */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`relative w-full flex-grow h-[42vh] min-h-[300px] rounded-2xl cursor-pointer select-none transition-all duration-500 [transform-style:preserve-3d] ${
                    isFlipped ? '[transform:rotateY(180deg)] shadow-2xl' : 'shadow-xl border border-white/10'
                  }`}
                  id="flashcard-body"
                >
                  {/* --- ROLE: HIM (Français ➔ Anglais) --- */}
                  {flashcardRole === 'him' && (
                    <>
                      {/* CARD FRONT: French */}
                      <div className="absolute inset-0 bg-[#1D161E]/95 border border-pink-500/20 rounded-2xl p-6 flex flex-col justify-between items-center text-center backface-hidden [backface-visibility:hidden] shadow-inner">
                        <span className="text-[10px] font-black text-pink-400 tracking-widest uppercase flex items-center gap-1 bg-pink-950/40 px-3 py-1 rounded-full">
                          <Heart size={11} className="text-pink-500 fill-pink-500 animate-pulse" />
                          Pour Lui • สำหรับเขา
                        </span>
                        
                        <div className="space-y-3 py-4 my-auto">
                          <p className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed px-2">
                            {filteredPhrases[cardIndex].french}
                          </p>
                          <p className="text-xs text-pink-400 font-bold bg-pink-500/10 px-3.5 py-1.5 rounded-full inline-block">
                            แตะเพื่อดูคำแปล ➔
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(filteredPhrases[cardIndex].french, 'fr-FR', filteredPhrases[cardIndex].id + '_fc_fr_front');
                          }}
                          className="min-h-[44px] px-5 rounded-full bg-pink-600/15 hover:bg-pink-600/30 text-pink-300 border border-pink-500/20 transition-all flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Volume2 size={15} /> <span>Écouter 🇫🇷</span>
                        </button>
                      </div>

                      {/* CARD BACK: English Answer */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2E1825] to-[#140C12] rounded-2xl p-6 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border border-pink-500/30 shadow-2xl">
                        <span className="text-[10px] font-black text-amber-300 tracking-widest uppercase flex items-center gap-1 bg-amber-950/40 px-3 py-1 rounded-full">
                          <Sparkles size={11} className="text-amber-400 animate-bounce" />
                          English 🇬🇧 เฉลย
                        </span>

                        <div className="space-y-4 w-full my-auto py-2">
                          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight px-1">
                            {filteredPhrases[cardIndex].english}
                          </p>
                          
                          {/* Reference translation in Thai */}
                          <div className="bg-[#120A10]/90 p-3 rounded-xl border border-white/5 max-w-[95%] mx-auto shadow-inner">
                            <p className="text-xs text-pink-300 font-extrabold">
                              🇹🇭 {filteredPhrases[cardIndex].thai}
                            </p>
                            <p className="text-[10px] text-slate-400 italic mt-0.5">
                              {filteredPhrases[cardIndex].thaiPhonetic}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(filteredPhrases[cardIndex].english, 'en-US', filteredPhrases[cardIndex].id + '_fc_en_back');
                            }}
                            className="min-h-[44px] px-5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-900/30 transition-colors flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Volume2 size={15} />
                            <span>Listen 🇬🇧</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(filteredPhrases[cardIndex].english, filteredPhrases[cardIndex].id + '_fc_copy');
                            }}
                            className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* --- ROLE: HER (Thaï ➔ Anglais) --- */}
                  {flashcardRole === 'her' && (
                    <>
                      {/* CARD FRONT: Thai */}
                      <div className="absolute inset-0 bg-[#1D161E]/95 border border-pink-500/20 rounded-2xl p-6 flex flex-col justify-between items-center text-center backface-hidden [backface-visibility:hidden] shadow-inner">
                        <span className="text-[10px] font-black text-pink-400 tracking-widest uppercase flex items-center gap-1 bg-pink-950/40 px-3 py-1 rounded-full">
                          <Heart size={11} className="text-pink-500 fill-pink-500 animate-pulse" />
                          Pour Elle • สำหรับเธอ
                        </span>
                        
                        <div className="space-y-3 py-4 my-auto">
                          <p className="text-lg sm:text-xl md:text-2xl font-black text-white leading-relaxed px-2">
                            {filteredPhrases[cardIndex].thai}
                          </p>
                          <p className="text-xs text-pink-300 italic font-medium px-4">
                            {filteredPhrases[cardIndex].thaiPhonetic}
                          </p>
                          <p className="text-xs text-pink-400 font-bold bg-pink-500/10 px-3.5 py-1.5 rounded-full inline-block mt-2">
                            แตะเพื่อดูเฉลยภาษาอังกฤษ ➔
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(filteredPhrases[cardIndex].thai, 'th-TH', filteredPhrases[cardIndex].id + '_fc_th_front');
                          }}
                          className="min-h-[44px] px-5 rounded-full bg-pink-600/15 hover:bg-pink-600/30 text-pink-300 border border-pink-500/20 transition-all flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Volume2 size={15} /> <span>ฟังเสียง 🇹🇭</span>
                        </button>
                      </div>

                      {/* CARD BACK: English Answer */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2E1825] to-[#140C12] rounded-2xl p-6 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border border-pink-500/30 shadow-2xl">
                        <span className="text-[10px] font-black text-amber-300 tracking-widest uppercase flex items-center gap-1 bg-amber-950/40 px-3 py-1 rounded-full">
                          <Sparkles size={11} className="text-amber-400 animate-bounce" />
                          English 🇬🇧 เฉลย
                        </span>

                        <div className="space-y-4 w-full my-auto py-2">
                          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight px-1">
                            {filteredPhrases[cardIndex].english}
                          </p>
                          
                          {/* Reference translation in French */}
                          <div className="bg-[#120A10]/90 p-3 rounded-xl border border-white/5 max-w-[95%] mx-auto shadow-inner">
                            <p className="text-xs text-pink-300 font-semibold">
                              🇫🇷 {filteredPhrases[cardIndex].french}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(filteredPhrases[cardIndex].english, 'en-US', filteredPhrases[cardIndex].id + '_fc_en_her');
                            }}
                            className="min-h-[44px] px-5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-900/30 transition-colors flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Volume2 size={15} /> <span>Listen 🇬🇧</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(filteredPhrases[cardIndex].english, filteredPhrases[cardIndex].id + '_fc_copy_en_her');
                            }}
                            className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Fullscreen Navigation footer - comfortable thumb placement and larger hit area */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <button 
                    onClick={prevCard}
                    className="min-h-[48px] px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black text-slate-300 active:scale-95 transition-all flex-1 mr-3 max-w-[140px] flex items-center justify-center text-center"
                    id="btn-fc-prev"
                  >
                    ย้อนกลับ • Précédent
                  </button>
                  
                  <span className="text-xs font-black text-pink-300 whitespace-nowrap bg-pink-950/40 px-3 py-2 rounded-full border border-pink-500/20">
                    {cardIndex + 1} / {filteredPhrases.length}
                  </span>
                  
                  <button 
                    onClick={nextCard}
                    className="min-h-[48px] px-4 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white rounded-2xl text-[11px] font-black active:scale-95 transition-all flex-1 ml-3 max-w-[140px] flex items-center justify-center text-center shadow-lg shadow-pink-600/20"
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

          {/* Spacer */}
          <div className="h-6"></div>
        </div>
      )}

      {/* STANDARD DICTIONARY LIST VIEW */}
      {!flashcardMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPhrases.length > 0 ? (
            filteredPhrases.map((phrase) => {
              const isCustom = phrase.id.startsWith('custom_');
              return (
                <div 
                  key={phrase.id}
                  className="bg-[#161618] border border-slate-850 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  id={`phrase-card-${phrase.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                        phrase.category === 'Romance' ? 'bg-green-950/30 text-green-300 border-green-900/20' :
                        phrase.category === 'Désir' ? 'bg-purple-950/30 text-purple-300 border-purple-900/20' :
                        phrase.category === 'Intime' ? 'bg-rose-950/30 text-rose-300 border-rose-900/20' :
                        'bg-blue-950/30 text-blue-300 border-blue-900/20'
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
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* French & English */}
                    <div className="space-y-0.5">
                      <p className="font-bold text-white text-[14px] leading-snug">{phrase.french}</p>
                      <p className="text-xs text-slate-400 italic">🇬🇧 {phrase.english}</p>
                    </div>

                    {/* Thai Translation */}
                    <div className="bg-pink-950/5 p-2.5 rounded-lg border border-pink-900/10 space-y-1">
                      <p className="font-extrabold text-pink-200 text-[15px] tracking-wide">🇹🇭 {phrase.thai}</p>
                      <p className="text-xs text-pink-300 italic font-medium leading-relaxed">
                        Phonétique : <strong className="font-semibold text-pink-200">{phrase.thaiPhonetic}</strong>
                      </p>
                      {phrase.frenchPhoneticForThai && (
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Aide pour elle : {phrase.frenchPhoneticForThai}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-slate-800/40 pt-2 flex justify-between items-center">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSpeak(phrase.french, 'fr-FR', phrase.id + '_fr')}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isPlayingId === phrase.id + '_fr' 
                            ? 'bg-blue-950/30 text-blue-200 border-blue-900/30' 
                            : 'border-slate-800 hover:bg-slate-800/50 text-slate-300 bg-[#111113]'
                        }`}
                        title="Prononcer le français"
                        id={`btn-speak-fr-${phrase.id}`}
                      >
                        <Volume2 size={13} />
                        <span>🇫🇷</span>
                      </button>
                      
                      <button
                        onClick={() => handleSpeak(phrase.english, 'en-US', phrase.id + '_en')}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isPlayingId === phrase.id + '_en' 
                            ? 'bg-amber-950/30 text-amber-200 border-amber-900/30' 
                            : 'border-slate-800 hover:bg-slate-800/50 text-slate-300 bg-[#111113]'
                        }`}
                        title="Prononcer l'anglais"
                        id={`btn-speak-en-${phrase.id}`}
                      >
                        <Volume2 size={13} />
                        <span>🇬🇧</span>
                      </button>
                      
                      <button
                        onClick={() => handleSpeak(phrase.thai, 'th-TH', phrase.id + '_th')}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isPlayingId === phrase.id + '_th' 
                            ? 'bg-pink-950/30 text-pink-200 border-pink-900/30' 
                            : 'border-slate-800 hover:bg-slate-800/50 text-slate-300 bg-[#111113]'
                        }`}
                        title="Prononcer le thaï"
                        id={`btn-speak-th-${phrase.id}`}
                      >
                        <Volume2 size={13} />
                        <span>🇹🇭</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(`${phrase.french} ➔ ${phrase.thai} (${phrase.thaiPhonetic})`, phrase.id)}
                      className="min-h-[34px] px-2.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all bg-[#111113]"
                      id={`btn-copy-phrase-${phrase.id}`}
                    >
                      {copiedId === phrase.id ? (
                        <>
                          <Check size={11} className="text-green-500" />
                          <span className="text-green-500 text-[11px]">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span className="text-[11px]">Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-slate-400 italic">
              Aucune phrase dans cette catégorie.
            </div>
          )}
        </div>
      )}

      {/* DISCREET TOGGLE FOR CUSTOM ADDING SECTION */}
      <div className="pt-6">
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="text-slate-600 hover:text-slate-400 active:text-pink-400 text-[10px] mx-auto block py-2 underline tracking-wider transition-colors"
          id="btn-toggle-custom-form"
        >
          {showBuilder ? "× Masquer le formulaire de création" : "⚙️ Gérer les phrases personnalisées"}
        </button>
      </div>

      {/* CUSTOM PHRASE BUILDER / SAVER - Only rendered when discreetly toggled */}
      {showBuilder && (
        <div className="bg-[#161618] rounded-xl border border-slate-800/40 p-4 space-y-3.5 animate-slide-in">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-xs flex items-center gap-1.5">
              <Plus className="text-pink-500" size={15} />
              Ajouter nos expressions personnalisées
            </h3>
            <p className="text-[10px] text-slate-400">
              Enregistrez vos expressions complices. Stockage 100 % local et privé.
            </p>
          </div>

          <form onSubmit={handleAddCustomPhrase} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Version Française</label>
              <input
                type="text"
                placeholder="Ex : J'adore quand tu m'embrasses..."
                value={newFrench}
                onChange={(e) => setNewFrench(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-french"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Version Anglaise</label>
              <input
                type="text"
                placeholder="Ex : I love it when you kiss me..."
                value={newEnglish}
                onChange={(e) => setNewEnglish(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-english"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Version Thaïlandaise</label>
              <input
                type="text"
                placeholder="Ex : ฉันชอบเวลาที่คุณจูบ..."
                value={newThai}
                onChange={(e) => setNewThai(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-thai"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phonétique Thaï</label>
              <input
                type="text"
                placeholder="Ex : Chan chop we-laa..."
                value={newPhonetic}
                onChange={(e) => setNewPhonetic(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-pink-500 outline-none text-white placeholder-slate-700 transition-all"
                id="input-new-phonetic"
              />
            </div>

            <div className="sm:col-span-2 pt-1 flex justify-end">
              <button
                type="submit"
                className="min-h-[38px] w-full sm:w-auto px-5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                id="btn-submit-new-phrase"
              >
                <Heart size={12} className="fill-white" /> Enregistrer localement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
