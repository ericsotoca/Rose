/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle, AlertTriangle, Printer, Download, RefreshCw } from 'lucide-react';

interface CertificateProps {
  onNotify?: (msg: string) => void;
  // Trigger to force refresh quiz completion state
  triggerRefresh?: number;
}

export default function Certificate({ onNotify, triggerRefresh }: CertificateProps) {
  const [practitionerName, setPractitionerName] = useState('');
  const [completedQuizzes, setCompletedQuizzes] = useState<{ [key: string]: boolean }>({});
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check which modules have completed quizzes in localStorage
  useEffect(() => {
    const completions: { [key: string]: boolean } = {};
    let count = 0;
    
    for (let i = 1; i <= 8; i++) {
      const isCompleted = localStorage.getItem(`emdr_module_${i}_quiz_passed`) === 'true';
      completions[`Module ${i}`] = isCompleted;
      if (isCompleted) {
        count++;
      }
    }

    setCompletedQuizzes(completions);
    // Unlocked only if all 8 modules are passed (true)
    setIsUnlocked(count === 8);
  }, [triggerRefresh]);

  const totalPassed = Object.values(completedQuizzes).filter(Boolean).length;

  const handlePrint = () => {
    if (!practitionerName.trim()) {
      alert("Veuillez saisir votre Nom complet pour générer l'attestation.");
      return;
    }
    window.print();
  };

  const handleResetProgress = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser tout votre cursus clinique ? Cela effacera vos scores aux quiz.")) {
      for (let i = 1; i <= 8; i++) {
        localStorage.removeItem(`emdr_module_${i}_quiz_passed`);
        localStorage.removeItem(`emdr_module_${i}_quiz_score`);
      }
      setCompletedQuizzes({});
      setIsUnlocked(false);
      if (onNotify) onNotify("Progression pédagogique réinitialisée.");
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#161618] rounded-xl shadow-sm border border-slate-800/50 overflow-hidden" id="certificate-panel">
      <div className="p-5 border-b border-slate-800/60 bg-[#111113]">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Award className="text-amber-500" size={22} />
          Attestation de Réussite Académique
        </h3>
        <p className="text-xs text-slate-400">
          Suivi de votre progression pédagogique et délivrance du certificat d’aptitude clinique EMDR
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#161618]">
        {/* Left column: Checklist & Requirements */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111113] p-4 rounded-xl border border-slate-800/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Cursus Théorique</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                isUnlocked 
                  ? 'bg-green-950/40 text-green-300 border-green-900/30' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-900/30'
              }`}>
                {totalPassed} / 8 Validés
              </span>
            </h4>

            {/* Checklist items */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const title = [
                  'Fondations & Modèle TAI',
                  'Phase 1 : Float-back',
                  'Phase 2 : Lieu Sûr',
                  'Phase 3 : Évaluation',
                  'Phase 4 : Désensibilisation',
                  'Phase 5 & 6 : Scanner',
                  'Phase 7 : Clôture',
                  'Phase 8 : Réévaluation'
                ][num - 1];

                const isPassed = completedQuizzes[`Module ${num}`];

                return (
                  <div key={num} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/60 border border-slate-850 shadow-sm">
                    <span className="text-slate-300 font-medium truncate pr-2">
                      {num}. {title}
                    </span>
                    {isPassed ? (
                      <span className="text-emerald-400 flex items-center gap-0.5 font-semibold shrink-0">
                        <CheckCircle size={14} /> Acquis
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-0.5 font-medium shrink-0">
                        <Lock size={12} /> Quiz requis
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Locked alert or Success message */}
            {!isUnlocked ? (
              <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-900/30 flex gap-2 text-xs text-amber-300 leading-relaxed">
                <AlertTriangle className="shrink-0 text-amber-500" size={16} />
                <div>
                  <strong className="font-bold block mb-0.5">Certificat verrouillé</strong>
                  Vous devez réussir le cas pratique de chacun des 8 modules du cursus pour débloquer l’attestation académique officielle.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-950/20 rounded-lg border border-green-900/30 flex gap-2 text-xs text-green-300 leading-relaxed animate-pulse">
                <Award className="shrink-0 text-green-500 animate-bounce" size={16} style={{ animationDuration: '3s' }} />
                <div>
                  <strong className="font-bold block mb-0.5">Cursus Complété !</strong>
                  Félicitations, vous avez validé toutes les compétences cliniques EMDR. Saisissez votre nom pour éditer votre diplôme.
                </div>
              </div>
            )}

            {/* Quick reset button */}
            <div className="pt-2">
              <button 
                onClick={handleResetProgress}
                className="w-full py-2 bg-slate-950/40 border border-dashed border-red-900/40 hover:bg-red-950/20 hover:text-red-300 text-red-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                id="btn-reset-progress"
              >
                <RefreshCw size={10} /> Réinitialiser la progression
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Certificate rendering space */}
        <div className="lg:col-span-2 space-y-4">
          {isUnlocked ? (
            <div className="space-y-4">
              {/* Name field */}
              <div className="bg-[#111113] p-4 rounded-xl border border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-grow">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Saisir le Nom et Prénom du Praticien
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Jean DUPONT, Psychothérapeute"
                    value={practitionerName}
                    onChange={(e) => setPractitionerName(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-600 transition-all font-sans"
                    id="input-practitioner-name"
                  />
                </div>
                <button
                  onClick={handlePrint}
                  disabled={!practitionerName.trim()}
                  className="min-h-[44px] bg-amber-650 hover:bg-amber-700 disabled:opacity-50 disabled:hover:bg-amber-650 text-white font-bold px-6 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors shadow-sm shrink-0 self-end sm:self-auto"
                  id="btn-print-diploma"
                >
                  <Printer size={15} /> Imprimer l'Attestation
                </button>
              </div>

              {/* Diploma Preview Paper (Styling modeled to print correctly on A4) */}
              <div 
                id="printable-certificate"
                className="relative bg-[#FDFBF7] border-8 border-double border-amber-800/40 p-8 sm:p-12 rounded-lg text-center font-serif text-amber-950 shadow-inner flex flex-col justify-between items-center space-y-6 aspect-[1.414/1] bg-[radial-gradient(#f7f5ef_1px,transparent_1px)] bg-[size:16px_16px]"
              >
                {/* Vintage Corners */}
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-amber-800/20 pointer-events-none"></div>

                {/* Seal / Emblem */}
                <div className="flex justify-center">
                  <Award size={48} className="text-amber-800/80 filter drop-shadow" />
                </div>

                {/* Heading */}
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-3xl font-bold tracking-wide uppercase text-amber-900 font-serif">
                    Attestation Clinique de Formation
                  </h1>
                  <p className="text-[10px] sm:text-xs tracking-widest text-amber-800 uppercase font-sans font-semibold">
                    Institut de Psychothérapie Intégrative - Modèle TAI
                  </p>
                </div>

                {/* Recipient */}
                <div className="space-y-1.5 w-full">
                  <p className="text-xs italic text-amber-800">Le comité pédagogique certifie que</p>
                  <div className="text-lg sm:text-2xl font-bold border-b border-dashed border-amber-900/30 pb-1 max-w-md mx-auto min-h-[36px] px-4 font-serif text-slate-900">
                    {practitionerName || "(Saisissez votre nom ci-dessus)"}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] sm:text-xs max-w-lg leading-relaxed text-amber-900 font-sans font-medium">
                  A complété avec succès le cursus théorique complet et résolu de façon satisfaisante l’évaluation des cas pratiques cliniques portant sur les <strong>8 phases de la Psychothérapie EMDR</strong> basées sur le modèle du Traitement Adaptatif de l’Information (TAI).
                </p>

                {/* Signatures & Seal Grid */}
                <div className="grid grid-cols-3 gap-4 w-full pt-4 items-end border-t border-amber-900/10 font-sans">
                  {/* President */}
                  <div className="text-left space-y-1">
                    <p className="text-[9px] text-amber-800">Date d'édition :</p>
                    <p className="text-[10px] font-bold text-slate-800">{new Date().toLocaleDateString('fr-FR')}</p>
                    <p className="text-[9px] border-t border-amber-800/20 pt-0.5 text-amber-800/70">Conseil d'Évaluation</p>
                  </div>

                  {/* Stamp Seal */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full border border-dashed border-amber-800/50 flex items-center justify-center bg-amber-100/30 text-amber-800 font-serif font-bold text-[10px] rotate-12">
                      TAI OK
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="text-right space-y-1">
                    <p className="text-[9px] text-amber-800">Signature Numérique :</p>
                    <p className="font-serif italic text-[11px] text-slate-800 font-bold">F. Shapiro (TAI)</p>
                    <p className="text-[9px] border-t border-amber-800/20 pt-0.5 text-amber-800/70">Directrice Académique</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-slate-800/60 rounded-xl bg-[#111113] text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
              <Lock size={36} className="text-slate-500" />
              <h4 className="font-bold text-slate-200 text-sm">Diplôme non débloqué</h4>
              <p className="text-xs text-slate-400 max-w-sm font-sans">
                Vous devez acquérir les notions cliniques des 8 modules d’apprentissage et valider le cas pratique de chaque module pour débloquer votre attestation imprimable.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
