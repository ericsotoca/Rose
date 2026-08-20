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

  const categories = ['Tous', 'Romance', 'Désir', 'Intime', 'Après'];

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

  return (
    <div className="space-y-6" id="lovers-workspace">
      {/* Introduction Hero Section */}
      <div className="bg-gradient-to-r from-pink-950/20 via-rose-950/10 to-amber-950/20 p-6 rounded-2xl border border-pink-900/30 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-950/30 text-pink-500 border border-pink-900/30 shadow-sm">
          <Heart className="fill-pink-500 text-pink-500 animate-pulse" size={24} />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          L'Espace Complice • ภาษาความรัก
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Un dictionnaire sensuel et coquin conçu pour aider un Français et une Thaïlandaise à communiquer librement et à exprimer leurs désirs les plus intimes en <strong>Français, Anglais, et Thaï</strong>.
        </p>
      </div>

      {/* Control Navigation Bars */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161618] p-4 rounded-xl border border-slate-800/50 shadow-sm">
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap min-h-[40px] sm:min-h-0 flex items-center gap-1 ${
                selectedCategory === cat
                  ? 'border-pink-500 bg-pink-950/30 text-pink-300 font-bold shadow-sm'
                  : 'border-slate-800 bg-[#111113] text-slate-400 hover:bg-slate-800/50'
              }`}
              id={`btn-cat-${cat}`}
            >
              {cat === 'Tous' ? 'Tout voir' : cat}
              {cat === 'Intime' && '🔞'}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <button
          onClick={() => setFlashcardMode(!flashcardMode)}
          className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          id="btn-toggle-flashcards"
        >
          {flashcardMode ? (
            <>
              <BookOpen size={14} /> Mode Liste complète
            </>
          ) : (
            <>
              <Layers size={14} /> Mode Flashcards interactives
            </>
          )}
        </button>
      </div>

      {/* FLASHCARD INTERACTIVE GAME VIEW */}
      {flashcardMode ? (
        <div className="max-w-md mx-auto space-y-4">
          {/* Multi-language role toggle selector */}
          <div className="flex flex-col gap-1.5 bg-[#111113] p-2.5 rounded-xl border border-slate-800/60 w-full shadow-sm" id="fc-role-selector">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block mb-0.5">Apprentissage de l'Anglais 🇬🇧</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setFlashcardRole('him');
                  setIsFlipped(false);
                  setCardIndex(0);
                }}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center min-h-[44px] ${
                  flashcardRole === 'him'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-900/40 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                id="btn-fc-role-him"
              >
                <span>Pour Lui 🇫🇷 ➔ 🇬🇧</span>
                <span className="text-[9px] opacity-80 font-normal">Français ➔ Anglais</span>
              </button>
              
              <button
                onClick={() => {
                  setFlashcardRole('her');
                  setIsFlipped(false);
                  setCardIndex(0);
                }}
                className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center min-h-[44px] ${
                  flashcardRole === 'her'
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-900/40 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                id="btn-fc-role-her"
              >
                <span>Pour Elle 🇹🇭 ➔ 🇬🇧</span>
                <span className="text-[9px] opacity-80 font-normal">ภาษาไทย ➔ ภาษาอังกฤษ</span>
              </button>
            </div>
          </div>

          {filteredPhrases.length > 0 ? (
            <>
              {/* Flashcard container */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full aspect-[4/3] rounded-2xl cursor-pointer select-none transition-all duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)] shadow-xl' : 'shadow-md border border-slate-800/50'
                }`}
                id="flashcard-body"
              >
                {/* --- ROLE: HIM (Français ➔ Anglais) --- */}
                {flashcardRole === 'him' && (
                  <>
                    {/* CARD FRONT: French */}
                    <div className="absolute inset-0 bg-[#161618] border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between items-center text-center backface-hidden [backface-visibility:hidden]">
                      <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase flex items-center gap-1">
                        <Heart size={10} className="text-blue-500 fill-blue-500 animate-pulse" />
                        Français • Pour Lui (Devinez l'Anglais)
                      </span>
                      
                      <div className="space-y-2">
                        <p className="text-lg sm:text-xl font-bold text-white font-sans leading-relaxed">
                          {filteredPhrases[cardIndex].french}
                        </p>
                        <p className="text-[10px] text-slate-500 italic">
                          Tapez sur la carte pour révéler la réponse en Anglais.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(filteredPhrases[cardIndex].french, 'fr-FR', filteredPhrases[cardIndex].id + '_fc_fr_front');
                          }}
                          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 text-[10px] font-bold px-3"
                          title="Écouter le français"
                        >
                          <Volume2 size={13} /> <span>🇫🇷 Écouter</span>
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-pink-300 bg-pink-950/40 border border-pink-900/20 px-2.5 py-1 rounded-full">
                        {filteredPhrases[cardIndex].category}
                      </span>
                    </div>

                    {/* CARD BACK: English Answer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-[#161618] rounded-2xl p-6 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border border-blue-900/30">
                      <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase flex items-center gap-1">
                        <Sparkles size={10} />
                        Réponse en Anglais 🇬🇧
                      </span>

                      <div className="space-y-4 w-full">
                        <p className="text-xl sm:text-2xl font-extrabold text-white leading-snug font-sans">
                          {filteredPhrases[cardIndex].english}
                        </p>
                        
                        {/* Reference translation in Thai */}
                        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 max-w-[90%] mx-auto">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Équivalent Thaïlandais :</p>
                          <p className="text-xs text-blue-300 font-medium">
                            {filteredPhrases[cardIndex].thai}
                          </p>
                          <p className="text-[10px] text-slate-400 italic">
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
                          className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-900/40 transition-colors flex items-center gap-1 text-[10px] font-bold px-3"
                          title="Écouter la prononciation"
                        >
                          <Volume2 size={15} />
                          <span>🇬🇧 Écouter l'Anglais</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(filteredPhrases[cardIndex].english, filteredPhrases[cardIndex].id + '_fc_copy');
                          }}
                          className="p-2 rounded-full bg-[#111113] border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Copier l'anglais"
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
                    <div className="absolute inset-0 bg-[#161618] border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between items-center text-center backface-hidden [backface-visibility:hidden]">
                      <span className="text-[10px] font-bold text-pink-400 tracking-widest uppercase flex items-center gap-1">
                        <Heart size={10} className="text-pink-500 fill-pink-500 animate-pulse" />
                        ภาษาไทย • สำหรับเธอ (แตะเพื่อดูเฉลย)
                      </span>
                      
                      <div className="space-y-2">
                        <p className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                          {filteredPhrases[cardIndex].thai}
                        </p>
                        <p className="text-xs text-slate-400 italic">
                          {filteredPhrases[cardIndex].thaiPhonetic}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(filteredPhrases[cardIndex].thai, 'th-TH', filteredPhrases[cardIndex].id + '_fc_th_front');
                          }}
                          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 text-[10px] font-bold px-3"
                          title="Écouter le thaï"
                        >
                          <Volume2 size={13} /> <span>🇹🇭 ฟังเสียง</span>
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-pink-300 bg-pink-950/40 border border-pink-900/20 px-2.5 py-1 rounded-full">
                        {filteredPhrases[cardIndex].category}
                      </span>
                    </div>

                    {/* CARD BACK: English Answer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-950/20 to-[#161618] rounded-2xl p-6 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] border border-pink-900/30">
                      <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase flex items-center gap-1">
                        <Sparkles size={10} />
                        เฉลยภาษาอังกฤษ 🇬🇧 (English Answer)
                      </span>

                      <div className="space-y-4 w-full">
                        <p className="text-xl sm:text-2xl font-extrabold text-white leading-snug font-sans">
                          {filteredPhrases[cardIndex].english}
                        </p>
                        
                        {/* Reference translation in French */}
                        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 max-w-[90%] mx-auto">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">คำแปลภาษาฝรั่งเศs (French Translation) :</p>
                          <p className="text-xs text-pink-300 font-semibold">
                            {filteredPhrases[cardIndex].french}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(filteredPhrases[cardIndex].english, 'en-US', filteredPhrases[cardIndex].id + '_fc_en_her');
                          }}
                          className="p-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-900/40 transition-colors flex items-center gap-1 text-[10px] font-bold px-3"
                          title="Listen in English"
                        >
                          <Volume2 size={15} /> <span>🇬🇧 ฟังภาษาอังกฤษ</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(filteredPhrases[cardIndex].english, filteredPhrases[cardIndex].id + '_fc_copy_en_her');
                          }}
                          className="p-2 rounded-full bg-[#111113] border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Copier"
                        >
                          <Copy size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation and counter */}
              <div className="flex items-center justify-between px-2">
                <button 
                  onClick={prevCard}
                  className="px-4 py-2 bg-[#111113] border border-slate-800 hover:bg-slate-800/50 rounded-lg text-xs font-semibold text-slate-300 transition-all"
                  id="btn-fc-prev"
                >
                  Précédent
                </button>
                <span className="text-xs text-slate-400 font-medium">
                  {cardIndex + 1} / {filteredPhrases.length} phrases
                </span>
                <button 
                  onClick={nextCard}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-semibold transition-all"
                  id="btn-fc-next"
                >
                  Suivant
                </button>
              </div>
            </>
          ) : (
            <p className="text-center py-12 text-slate-400 italic">Aucune phrase dans cette catégorie.</p>
          )}
        </div>
      ) : (
        /* STANDARD DICTIONARY LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPhrases.length > 0 ? (
            filteredPhrases.map((phrase) => {
              const isCustom = phrase.id.startsWith('custom_');
              return (
                <div 
                  key={phrase.id}
                  className="bg-[#161618] border border-slate-850 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  id={`phrase-card-${phrase.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
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
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* French & English */}
                    <div className="space-y-1">
                      <p className="font-semibold text-white text-[15px]">{phrase.french}</p>
                      <p className="text-xs text-slate-400 italic">🇬🇧 {phrase.english}</p>
                    </div>

                    {/* Thai Translation */}
                    <div className="bg-pink-950/10 p-3 rounded-lg border border-pink-900/20 space-y-1.5">
                      <p className="font-extrabold text-pink-200 text-lg tracking-wide">🇹🇭 {phrase.thai}</p>
                      <p className="text-xs text-pink-300 italic font-medium leading-relaxed">
                        Phonétique : <strong className="font-semibold text-pink-200">{phrase.thaiPhonetic}</strong>
                      </p>
                      {phrase.frenchPhoneticForThai && (
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Aide pour elle (Français phonétique) : {phrase.frenchPhoneticForThai}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-slate-800/40 pt-3 flex justify-between items-center">
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
                        title="Prononcer l'anglais (TTS)"
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
                        title="Prononcer le thaï (TTS)"
                        id={`btn-speak-th-${phrase.id}`}
                      >
                        <Volume2 size={13} />
                        <span>🇹🇭</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(`${phrase.french} ➔ ${phrase.thai} (${phrase.thaiPhonetic})`, phrase.id)}
                      className="min-h-[36px] px-3 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all bg-[#111113]"
                      id={`btn-copy-phrase-${phrase.id}`}
                    >
                      {copiedId === phrase.id ? (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span className="text-green-500">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copier</span>
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

      {/* CUSTOM PHRASE BUILDER / SAVER */}
      <div className="bg-[#161618] rounded-xl border border-slate-800/50 shadow-sm p-5 space-y-4">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
          <Plus className="text-pink-500" size={18} />
          Ajouter nos expressions personnalisées
        </h3>
        <p className="text-xs text-slate-400">
          Enregistrez les mots doux ou les coquineries propres à votre couple. Vos phrases seront sauvegardées de façon privée et sécurisée sur votre téléphone.
        </p>

        <form onSubmit={handleAddCustomPhrase} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Version Française</label>
            <input
              type="text"
              placeholder="Ex : J'adore quand tu m'embrasses le cou."
              value={newFrench}
              onChange={(e) => setNewFrench(e.target.value)}
              className="w-full text-xs p-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none text-white placeholder-slate-600 transition-all"
              id="input-new-french"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Version Anglaise (Passerelle)</label>
            <input
              type="text"
              placeholder="Ex : I love it when you kiss my neck."
              value={newEnglish}
              onChange={(e) => setNewEnglish(e.target.value)}
              className="w-full text-xs p-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none text-white placeholder-slate-600 transition-all"
              id="input-new-english"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Version Thaïlandaise</label>
            <input
              type="text"
              placeholder="Ex : ฉันชอบเวลาที่คุณจูบต้นคอของฉัน"
              value={newThai}
              onChange={(e) => setNewThai(e.target.value)}
              className="w-full text-xs p-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none text-white placeholder-slate-600 transition-all"
              id="input-new-thai"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prononciation Thaï (Phonétique)</label>
            <input
              type="text"
              placeholder="Ex : Chan chop we-laa thee khun juup dton-kho khong chan"
              value={newPhonetic}
              onChange={(e) => setNewPhonetic(e.target.value)}
              className="w-full text-xs p-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none text-white placeholder-slate-600 transition-all"
              id="input-new-phonetic"
            />
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              className="min-h-[44px] px-6 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              id="btn-submit-new-phrase"
            >
              <Heart size={14} className="fill-white" /> Enregistrer dans notre dictionnaire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
