/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TargetingData } from '../types';
import { Plus, Download, Trash2, ShieldCheck, FileText, Calendar, Smile } from 'lucide-react';

interface CiblageFormProps {
  onNotify?: (msg: string) => void;
}

export default function CiblageForm({ onNotify }: CiblageFormProps) {
  const [fiches, setFiches] = useState<TargetingData[]>([]);
  const [selectedFicheId, setSelectedFicheId] = useState<string>('');

  // Form states
  const [situation, setSituation] = useState('');
  const [cognitionNegative, setCognitionNegative] = useState('');
  const [cognitionPositive, setCognitionPositive] = useState('');
  const [voc, setVoc] = useState<number>(3);
  const [sud, setSud] = useState<number>(7);
  const [emotions, setEmotions] = useState('');
  const [somatization, setSomatization] = useState('');
  const [somatizationLocation, setSomatizationLocation] = useState('');

  // Loading fiches
  useEffect(() => {
    const stored = localStorage.getItem('emdr_ciblage_fiches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TargetingData[];
        setFiches(parsed);
        if (parsed.length > 0) {
          setSelectedFicheId(parsed[0].id);
          loadFicheIntoForm(parsed[0]);
        }
      } catch (e) {
        console.error("Error reading clinical fiches", e);
      }
    } else {
      // Create initial sample fiche so screen is never empty
      const sample: TargetingData = {
        id: 'sample_1',
        date: new Date().toLocaleDateString('fr-FR'),
        situation: 'Accident de voiture sur l\'autoroute A8, phares qui se rapprochent rapidement.',
        cognitionNegative: 'Je suis totalement impuissant.',
        cognitionPositive: 'Je suis en sécurité maintenant.',
        voc: 3,
        sud: 8,
        emotions: 'Terreur, angoisse, impuissance.',
        somatization: 'Sensation de nœud serré et de chaleur oppressante.',
        somatizationLocation: 'Poitrine et plexus solaire'
      };
      setFiches([sample]);
      setSelectedFicheId(sample.id);
      loadFicheIntoForm(sample);
      localStorage.setItem('emdr_ciblage_fiches', JSON.stringify([sample]));
    }
  }, []);

  const loadFicheIntoForm = (fiche: TargetingData) => {
    setSituation(fiche.situation);
    setCognitionNegative(fiche.cognitionNegative);
    setCognitionPositive(fiche.cognitionPositive);
    setVoc(fiche.voc);
    setSud(fiche.sud);
    setEmotions(fiche.emotions);
    setSomatization(fiche.somatization);
    setSomatizationLocation(fiche.somatizationLocation);
  };

  const handleSelectFiche = (id: string) => {
    setSelectedFicheId(id);
    const found = fiches.find(f => f.id === id);
    if (found) {
      loadFicheIntoForm(found);
    }
  };

  const handleCreateNew = () => {
    const newFiche: TargetingData = {
      id: 'fiche_' + Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      situation: '',
      cognitionNegative: '',
      cognitionPositive: '',
      voc: 1,
      sud: 5,
      emotions: '',
      somatization: '',
      somatizationLocation: ''
    };
    const updated = [newFiche, ...fiches];
    setFiches(updated);
    setSelectedFicheId(newFiche.id);
    loadFicheIntoForm(newFiche);
    localStorage.setItem('emdr_ciblage_fiches', JSON.stringify(updated));
    if (onNotify) onNotify('Nouvelle fiche clinique créée.');
  };

  const handleSaveCurrent = () => {
    if (!selectedFicheId) return;
    const updated = fiches.map(f => {
      if (f.id === selectedFicheId) {
        return {
          ...f,
          situation,
          cognitionNegative,
          cognitionPositive,
          voc,
          sud,
          emotions,
          somatization,
          somatizationLocation
        };
      }
      return f;
    });
    setFiches(updated);
    localStorage.setItem('emdr_ciblage_fiches', JSON.stringify(updated));
    if (onNotify) onNotify('Fiche clinique sauvegardée localement.');
  };

  const handleDelete = (id: string) => {
    const filtered = fiches.filter(f => f.id !== id);
    setFiches(filtered);
    localStorage.setItem('emdr_ciblage_fiches', JSON.stringify(filtered));
    if (filtered.length > 0) {
      setSelectedFicheId(filtered[0].id);
      loadFicheIntoForm(filtered[0]);
    } else {
      setSelectedFicheId('');
      setSituation('');
      setCognitionNegative('');
      setCognitionPositive('');
      setVoc(1);
      setSud(0);
      setEmotions('');
      setSomatization('');
      setSomatizationLocation('');
    }
    if (onNotify) onNotify('Fiche supprimée.');
  };

  const handleExportText = () => {
    const current = fiches.find(f => f.id === selectedFicheId);
    if (!current) return;

    const content = `==================================================
FICHE DE CIBLAGE EMDR - PROTOCOLE STANDARD
Date d'évaluation : ${current.date}
==================================================

1. SITUATION DÉCLENCHANTE / IMAGE CIBLE :
   ${situation || "Non définie"}

2. COGNITION NÉGATIVE (CN) :
   ${cognitionNegative || "Non définie"}

3. COGNITION POSITIVE (CP) :
   ${cognitionPositive || "Non définie"}

4. ÉVALUATION DE LA COGNITION POSITIVE (VoC) :
   Score : ${voc} / 7 (1 = totalement faux, 7 = totalement vrai)

5. NIVEAU DE DÉTRESSE SUBJECTIF (SUD) :
   Score : ${sud} / 10 (0 = calme plat, 10 = perturbation maximale)

6. ÉMOTIONS RESSENTIES :
   ${emotions || "Non définies"}

7. SOMATISATION (Sensations corporelles) :
   Description : ${somatization || "Non renseignée"}
   Localisation précise : ${somatizationLocation || "Non précisée"}

--------------------------------------------------
Harmonie EMDR LMS - Système d'évaluation clinique
==================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ciblage_EMDR_${current.date.replace(/\//g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#161618] rounded-xl shadow-sm border border-slate-800/50 overflow-hidden" id="ciblage-panel">
      {/* Header bar */}
      <div className="bg-[#111113] border-b border-slate-800/60 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2 text-slate-100">
            <FileText className="text-blue-400" size={20} />
            Évaluation Clinique : Phase 3
          </h3>
          <p className="text-xs text-slate-400">Remplir les 7 composantes de la cible selon Shapiro</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreateNew}
            className="flex-1 sm:flex-none min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors"
            id="btn-new-fiche"
          >
            <Plus size={15} /> Nouvelle Fiche
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none min-h-[44px] bg-[#161618] hover:bg-slate-800 text-slate-200 font-semibold px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs border border-slate-800 transition-colors"
            id="btn-print-fiche"
          >
            Imprimer / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
        {/* Left Sidebar: Select Saved Drafts */}
        <div className="lg:col-span-1 border-r border-slate-800/60 p-4 bg-[#111113] space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fiches Enregistrées</h4>
          {fiches.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucune fiche.</p>
          ) : (
            <div className="space-y-1 max-h-64 lg:max-h-none overflow-y-auto">
              {fiches.map(f => (
                <div 
                  key={f.id}
                  onClick={() => handleSelectFiche(f.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-left border ${
                    selectedFicheId === f.id 
                      ? 'bg-blue-950/40 text-blue-300 border-blue-900/40 font-medium' 
                      : 'hover:bg-slate-850/50 text-slate-400 border-transparent'
                  }`}
                  id={`fiche-item-${f.id}`}
                >
                  <div className="min-w-0 flex-grow pr-2">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {f.date}
                    </div>
                    <div className="text-xs font-semibold truncate">
                      {f.situation ? f.situation : '(Fiche vierge)'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(f.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 rounded transition-opacity"
                    title="Supprimer la fiche"
                    id={`btn-del-fiche-${f.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-3 p-5 space-y-5 bg-[#161618]">
          {selectedFicheId ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Situation */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  1. Situation / Image Cible
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Ex : Accident de voiture, phares de l'autre véhicule qui foncent sur moi à toute allure..."
                  className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-650 transition-all font-sans"
                  rows={2}
                  id="input-ciblage-situation"
                />
              </div>

              {/* CN & CP Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    2. Cognition Négative (CN)
                  </label>
                  <input
                    type="text"
                    value={cognitionNegative}
                    onChange={(e) => setCognitionNegative(e.target.value)}
                    placeholder="Ex : Je suis impuissant / Je suis coupable"
                    className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-650 transition-all font-sans"
                    id="input-ciblage-cn"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Parole de soi sur soi, irrationnelle au présent.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    3. Cognition Positive (CP)
                  </label>
                  <input
                    type="text"
                    value={cognitionPositive}
                    onChange={(e) => setCognitionPositive(e.target.value)}
                    placeholder="Ex : Je suis en sécurité maintenant / J'ai fait de mon mieux"
                    className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-650 transition-all font-sans"
                    id="input-ciblage-cp"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Ce que le patient souhaite croire de lui adaptativement.</span>
                </div>
              </div>

              {/* VoC & SUD Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111113] p-4 rounded-xl border border-slate-800/50">
                {/* VoC Evaluation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      4. Validité de la Cognition (VoC)
                    </label>
                    <span className="text-xs font-extrabold bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-900/30">
                      Score : {voc} / 7
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={voc}
                    onChange={(e) => setVoc(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-850 rounded-lg"
                    id="slider-ciblage-voc"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 (Totalement Faux)</span>
                    <span>7 (Totalement Vrai)</span>
                  </div>
                </div>

                {/* SUD Evaluation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      5. Perturbation Émotionnelle (SUD)
                    </label>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                      sud >= 7 
                        ? 'bg-red-950/30 text-red-300 border-red-900/30' 
                        : sud >= 4 
                          ? 'bg-amber-950/30 text-amber-300 border-amber-900/30' 
                          : 'bg-green-950/30 text-green-300 border-green-900/30'
                    }`}>
                      Score : {sud} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={sud}
                    onChange={(e) => setSud(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-850 rounded-lg"
                    id="slider-ciblage-sud"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 (Calme Plat)</span>
                    <span>10 (Pire Détresse)</span>
                  </div>
                </div>
              </div>

              {/* Emotions and Somatization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    6. Émotion(s) ressentie(s)
                  </label>
                  <input
                    type="text"
                    value={emotions}
                    onChange={(e) => setEmotions(e.target.value)}
                    placeholder="Ex : Peur viscérale, honte, tristesse profonde..."
                    className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-650 transition-all font-sans"
                    id="input-ciblage-emotions"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    7. Somatisation (Sensation physique)
                  </label>
                  <input
                    type="text"
                    value={somatization}
                    onChange={(e) => setSomatization(e.target.value)}
                    placeholder="Ex : Nœud dans la gorge, souffle court, pression..."
                    className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-650 transition-all font-sans"
                    id="input-ciblage-somatization"
                  />
                </div>
              </div>

              {/* Somatization Location precisely */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Localisation corporelle précise
                </label>
                <input
                  type="text"
                  value={somatizationLocation}
                  onChange={(e) => setSomatizationLocation(e.target.value)}
                  placeholder="Ex : Milieu de la poitrine, estomac, trapèze gauche..."
                  className="w-full text-sm p-3 bg-slate-950/60 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none text-white placeholder-slate-650 transition-all font-sans"
                  id="input-ciblage-location"
                />
              </div>

              {/* Form Action buttons */}
              <div className="pt-3 border-t border-slate-800/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleExportText}
                  className="min-h-[44px] px-4 rounded-lg bg-[#111113] border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 flex items-center justify-center gap-1.5 text-xs transition-colors"
                  id="btn-export-text"
                >
                  <Download size={14} /> Télécharger (.TXT)
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  className="min-h-[44px] px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 text-xs transition-colors shadow-sm"
                  id="btn-save-fiche"
                >
                  <ShieldCheck size={14} /> Sauvegarder la Fiche
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="italic">Sélectionnez une fiche clinique ou créez-en une nouvelle pour commencer l'évaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
