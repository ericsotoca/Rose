/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EMDR_MODULES } from './data/modules';
import { Module, QuizQuestion } from './types';

// Importing custom components
import SbaSimulator from './components/SbaSimulator';
import CiblageForm from './components/CiblageForm';
import Glossary from './components/Glossary';
import Certificate from './components/Certificate';
import LoversSpace from './components/LoversSpace';

// Importing lucide icons
import { 
  Heart, Lock, Unlock, Award, BookOpen, Brain, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, 
  Sparkles, Calendar, ClipboardList, HelpCircle, RefreshCw,
  Home, Activity, Layers, PlayCircle, LogOut
} from 'lucide-react';

export default function App() {
  // Password State
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Navigation state
  // Active Space: 'hub' (selector), 'lovers' (Lovers space), 'clinical' (EMDR space)
  const [activeSpace, setActiveSpace] = useState<'hub' | 'lovers' | 'clinical'>('hub');
  
  // Clinical Active Sub-Tab
  // 'curriculum', 'sba', 'target', 'glossary', 'certificate'
  const [clinicalTab, setClinicalTab] = useState<'curriculum' | 'sba' | 'target' | 'glossary' | 'certificate'>('curriculum');

  // Curriculum Slideshow States
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  
  // Custom schema interaction states
  const [selectedBrainPart, setSelectedBrainPart] = useState<string | null>(null);
  const [selectedTimelineStep, setSelectedTimelineStep] = useState<number | null>(null);
  const [selectedResource, setSelectedResource] = useState<'safe' | 'container' | null>(null);
  const [selectedInterweaveAxis, setSelectedInterweaveAxis] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedClosureDecision, setSelectedClosureDecision] = useState<string | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);
  const [triggerCertRefresh, setTriggerCertRefresh] = useState<number>(0);

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
    setActiveSpace('hub');
    triggerNotify("Application verrouillée.");
  };

  // Reset curriculum quiz state when switching modules
  useEffect(() => {
    setActiveSlideIndex(0);
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizAnswers({});
    
    // Reset clinical interactive schema selections
    setSelectedBrainPart(null);
    setSelectedTimelineStep(null);
    setSelectedResource(null);
    setSelectedInterweaveAxis(null);
    setSelectedBodyPart(null);
    setSelectedClosureDecision(null);
  }, [selectedModuleId]);

  const currentModule = EMDR_MODULES.find(m => m.id === selectedModuleId)!;

  // Handle Quiz Submission
  const handleQuizSubmit = (questions: QuizQuestion[]) => {
    let score = 0;
    let allAnswered = true;

    questions.forEach(q => {
      if (quizAnswers[q.id] === undefined) {
        allAnswered = false;
      } else if (quizAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });

    if (!allAnswered) {
      alert("Veuillez répondre à toutes les questions du cas pratique.");
      return;
    }

    setQuizScore(score);
    setQuizSubmitted(true);

    const passThreshold = questions.length; // Must get all right to validate
    if (score === passThreshold) {
      localStorage.setItem(`emdr_module_${selectedModuleId}_quiz_passed`, 'true');
      localStorage.setItem(`emdr_module_${selectedModuleId}_quiz_score`, `${score}/${questions.length}`);
      setTriggerCertRefresh(prev => prev + 1);
      triggerNotify(`Félicitations ! Module ${selectedModuleId} validé avec succès.`);
    } else {
      triggerNotify("Certaines réponses sont incorrectes, lisez la justification clinique.");
    }
  };

  // Render Interactive Clinical Schemas based on module & phase
  const renderInteractiveSchema = (type?: string) => {
    switch (type) {
      case 'neuro':
        return (
          <div className="bg-slate-900 rounded-xl p-4 text-white border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Cartographie Cérébrale Interactive</h4>
            <p className="text-[11px] text-slate-300">Cliquez sur une région cérébrale pour analyser son comportement sous traumatisme :</p>
            <div className="flex flex-wrap gap-2 justify-center py-2">
              <button
                onClick={() => setSelectedBrainPart('amygdale')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  selectedBrainPart === 'amygdale' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                id="btn-brain-amygdale"
              >
                🔴 Amygdale (Système d'alarme)
              </button>
              <button
                onClick={() => setSelectedBrainPart('hippocampe')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  selectedBrainPart === 'hippocampe' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                id="btn-brain-hippocampe"
              >
                🟡 Hippocampe (Archivage temporel)
              </button>
              <button
                onClick={() => setSelectedBrainPart('prefrontal')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  selectedBrainPart === 'prefrontal' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                id="btn-brain-prefrontal"
              >
                🟢 Cortex Préfrontal (Régulation cognitive)
              </button>
            </div>
            {selectedBrainPart && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs animate-fade-in space-y-1">
                {selectedBrainPart === 'amygdale' && (
                  <>
                    <strong className="text-red-400 font-bold block">Amygdale en Hyperactivité :</strong>
                    <p className="text-slate-300">Sous l'effet du choc, elle reste allumée en permanence. Elle ré-injecte l'émotion de terreur comme si l'événement se reproduisait maintenant. Les SBA aident à éteindre cette alarme.</p>
                  </>
                )}
                {selectedBrainPart === 'hippocampe' && (
                  <>
                    <strong className="text-amber-400 font-bold block">Hippocampe Atrophie/Inhibé :</strong>
                    <p className="text-slate-300">Bloqué par le cortisol et l'adrénaline, il n'a pas pu dater le souvenir. Le cerveau ne comprend pas que "c'est du passé". Le retraitement EMDR permet de ré-encoder le marqueur temporel.</p>
                  </>
                )}
                {selectedBrainPart === 'prefrontal' && (
                  <>
                    <strong className="text-emerald-400 font-bold block">Cortex Préfrontal Déconnecté :</strong>
                    <p className="text-slate-300">La régulation rationnelle du soi est désactivée. Le patient est submergé. Les stimulations bilatérales recréent l'équilibre hémisphérique pour ré-associer les pensées logiques.</p>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'timeline':
        return (
          <div className="bg-[#111113] rounded-xl p-4 border border-slate-800/50 space-y-4 text-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Le Fil Conducteur du Float-back</h4>
            <p className="text-[11px] text-slate-400">Suivez les étapes cliniques du pont somato-affectif pour remonter à la source :</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { step: 1, label: 'Déclencheur Actuel' },
                { step: 2, label: 'Sensation Corporelle' },
                { step: 3, label: 'Dérive Temporelle' },
                { step: 4, label: 'Souvenir Source' }
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setSelectedTimelineStep(s.step)}
                  className={`p-2 rounded-lg border transition-all text-xs font-semibold flex flex-col items-center justify-center gap-1 ${
                    selectedTimelineStep === s.step 
                      ? 'bg-blue-600 text-white border-blue-500' 
                      : 'bg-[#161618] hover:bg-slate-800/50 text-slate-300 border-slate-800'
                  }`}
                  id={`btn-timeline-step-${s.step}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedTimelineStep === s.step ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'}`}>
                    {s.step}
                  </span>
                  <span className="text-[9px] leading-tight break-words">{s.label}</span>
                </button>
              ))}
            </div>
            {selectedTimelineStep && (
              <div className="p-3 bg-[#161618] rounded-lg border border-slate-800 text-xs text-slate-300 animate-fade-in space-y-1 shadow-sm">
                {selectedTimelineStep === 1 && (
                  <>
                    <strong className="text-white font-bold block">1. Identifier la situation du présent :</strong>
                    <p className="text-slate-300">On démarre d'une situation anxiogène actuelle vécue par le patient (ex: "Mon patron m'a haussé le ton hier matin").</p>
                  </>
                )}
                {selectedTimelineStep === 2 && (
                  <>
                    <strong className="text-white font-bold block">2. Isoler la signature physique :</strong>
                    <p className="text-slate-300">On localise la tension dans le corps (ex: "Une boule serrée au plexus") et la croyance associée ("Je suis coupable").</p>
                  </>
                )}
                {selectedTimelineStep === 3 && (
                  <>
                    <strong className="text-white font-bold block">3. Lancer la dérive (Float-back) :</strong>
                    <p className="text-slate-300">On demande au patient d'occulter l'analyse logique et de laisser dériver son esprit en se focalisant uniquement sur cette boule somatique.</p>
                  </>
                )}
                {selectedTimelineStep === 4 && (
                  <>
                    <strong className="text-white font-bold block">4. Atteindre le souvenir d'enfance fondateur :</strong>
                    <p className="text-slate-300">Le premier événement brut qui apparaît est identifié comme la cible primaire à retraiter en priorité (ex: "Le maître d'école me crie dessus devant la classe").</p>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'container':
        return (
          <div className="bg-[#111113] rounded-xl p-4 border border-slate-800/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Outils de Stabilisation de Phase 2</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedResource('safe')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedResource === 'safe' ? 'bg-blue-950/40 border-blue-800 text-blue-200 font-medium' : 'bg-[#161618] hover:bg-slate-800/50 text-slate-300 border-slate-800'
                }`}
                id="btn-resource-safe"
              >
                <span className="block text-xs font-bold mb-0.5">🏞️ Le Lieu Sûr</span>
                <span className="text-[10px] text-slate-400 block">Création d'une oasis calme interne pour l'auto-apaisement.</span>
              </button>
              <button
                onClick={() => setSelectedResource('container')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedResource === 'container' ? 'bg-indigo-950/40 border-indigo-800 text-indigo-200 font-medium' : 'bg-[#161618] hover:bg-slate-800/50 text-slate-300 border-slate-800'
                }`}
                id="btn-resource-container"
              >
                <span className="block text-xs font-bold mb-0.5">🧳 Le Contenant</span>
                <span className="text-[10px] text-slate-400 block">Coffre-fort métaphorique pour enfermer le matériel non traité.</span>
              </button>
            </div>
            {selectedResource && (
              <div className="p-3 bg-[#161618] rounded-lg border border-slate-800 text-xs animate-fade-in shadow-sm">
                {selectedResource === 'safe' ? (
                  <>
                    <strong className="text-blue-300 font-bold block">Protocole Lieu Sûr :</strong>
                    <p className="text-slate-300 mt-1">
                      On guide le patient vers une image agréable. Une fois les émotions positives présentes, on applique des <strong>SBA très lentes et courtes</strong> (6 à 8 passes) pour renforcer l'ancrage somatique. On associe un mot-clé pour lui permettre de le réactiver lui-même chez lui.
                    </p>
                  </>
                ) : (
                  <>
                    <strong className="text-indigo-300 font-bold block">Protocole Contenant Métaphorique :</strong>
                    <p className="text-slate-300 mt-1">
                      En fin de séance incomplète, on demande au patient d'imaginer un contenant hautement hermétique (coffre-fort, boîte en acier). Il y place visuellement tous les restes douloureux de la cible. Le contenant est verrouillé jusqu'à la semaine d'après.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'metrics':
        return (
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Échelles Standardisées EMDR</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">VoC (Validité de la croyance)</span>
                <span className="text-3xl font-extrabold text-blue-400 font-sans block my-1">1 ➔ 7</span>
                <p className="text-[10px] text-slate-300 leading-normal">Mesure à quel point la croyance positive semble vraie dans le corps du patient (1 = faux, 7 = vrai).</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUD (Niveau de détresse)</span>
                <span className="text-3xl font-extrabold text-red-400 font-sans block my-1">0 ➔ 10</span>
                <p className="text-[10px] text-slate-300 leading-normal">Mesure l'intensité de la douleur psychologique ressentie instantanément (0 = neutre, 10 = pire angoisse).</p>
              </div>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px] text-slate-400 leading-snug">
              ℹ️ L'objectif thérapeutique ultime de la désensibilisation est d'amener le <strong>SUD à 0</strong> (aucune perturbation) et la <strong>VoC à 7</strong> (la croyance positive est pleinement intégrée).
            </div>
          </div>
        );

      case 'interweave':
        return (
          <div className="bg-[#111113] rounded-xl p-4 border border-slate-800/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Matrice de Tissage Cognitif (Relancer le TAI)</h4>
            <p className="text-[11px] text-slate-400">Sélectionnez l'axe de blocage cognitif pour révéler le type de tissage à utiliser :</p>
            <div className="grid grid-cols-3 gap-2">
              {['Responsabilité', 'Sécurité', 'Choix / Contrôle'].map((axis) => (
                <button
                  key={axis}
                  onClick={() => setSelectedInterweaveAxis(axis)}
                  className={`p-2.5 rounded-lg border text-center transition-all text-xs font-semibold ${
                    selectedInterweaveAxis === axis ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' : 'bg-[#161618] hover:bg-slate-800/50 text-slate-300 border-slate-800'
                  }`}
                  id={`btn-interweave-axis-${axis.replace(/\s/g, '')}`}
                >
                  {axis}
                </button>
              ))}
            </div>
            {selectedInterweaveAxis && (
              <div className="p-3 bg-[#161618] rounded-lg border border-slate-800 text-xs text-slate-300 animate-fade-in space-y-1 shadow-sm">
                {selectedInterweaveAxis === 'Responsabilité' && (
                  <>
                    <strong className="text-white font-bold block">Axe Responsabilité / Culpabilité :</strong>
                    <p className="text-slate-300">Le patient s'attribue une faute irrationnelle (ex: "J'avais 5 ans, j'aurais dû me défendre").</p>
                    <p className="text-emerald-400 font-serif italic mt-1">Verbatim Tissage : « Avec vos yeux d'adulte aujourd'hui, qu'est-ce qu'un enfant de 5 ans peut faire face à un adulte en colère ? »</p>
                  </>
                )}
                {selectedInterweaveAxis === 'Sécurité' && (
                  <>
                    <strong className="text-white font-bold block">Axe Sécurité / Menace :</strong>
                    <p className="text-slate-300">Le patient croit être toujours en danger physique (ex: "Je ressens le feu").</p>
                    <p className="text-emerald-400 font-serif italic mt-1">Verbatim Tissage : « Regardez autour de vous ici dans mon cabinet. Sommes-nous en danger à cet instant précis ? »</p>
                  </>
                )}
                {selectedInterweaveAxis === 'Choix / Contrôle' && (
                  <>
                    <strong className="text-white font-bold block">Axe Choix et Contrôle de soi :</strong>
                    <p className="text-slate-300">Sensation d'être piégé sans issue.</p>
                    <p className="text-emerald-400 font-serif italic mt-1">Verbatim Tissage : « Si la porte était restée déverrouillée, qu'est-ce que vous auriez pu faire différemment ? »</p>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'body':
        return (
          <div className="bg-[#111113] rounded-xl p-4 border border-slate-800/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scanner Corporel (Phase 6)</h4>
            <p className="text-[11px] text-slate-400">Cliquez sur une zone d'accumulation de tension somatique résiduelle pour lancer le traitement :</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {['La Gorge (Nœud)', 'La Poitrine (Pression)', 'L’Estomac (Serré)', 'Les Épaules (Lourdeur)'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedBodyPart(p)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedBodyPart === p ? 'bg-amber-600 text-white border-amber-500 shadow-sm' : 'bg-[#161618] hover:bg-slate-800/50 text-slate-300 border-slate-800'
                  }`}
                  id={`btn-body-part-${p.replace(/\s/g, '')}`}
                >
                  📍 {p}
                </button>
              ))}
            </div>
            {selectedBodyPart && (
              <div className="p-3 bg-[#161618] rounded-lg border border-slate-800 text-xs animate-fade-in shadow-sm space-y-1">
                <strong className="text-amber-400 font-bold block">Traitement du ressenti : {selectedBodyPart}</strong>
                <p className="text-slate-300">
                  Le clinicien demande d'observer cette tension somatique résiduelle sans chercher à l'expliquer, puis applique un <strong>set de SBA rapides de 24 passes</strong> pour désensibiliser la mémoire corporelle fine. On répète jusqu'à neutralité complète.
                </p>
              </div>
            )}
          </div>
        );

      case 'closure':
        return (
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-850/60 text-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Arbre de Décision Clinique : Phase 7</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedClosureDecision('complete')}
                className={`p-2.5 rounded-lg border text-xs text-left font-semibold ${
                  selectedClosureDecision === 'complete' ? 'bg-emerald-600 border-emerald-500' : 'bg-[#161618] border-slate-800 hover:bg-slate-800/50'
                }`}
                id="btn-closure-complete"
              >
                🟢 Séance Complète (SUD=0, VoC=7)
              </button>
              <button
                onClick={() => setSelectedClosureDecision('incomplete')}
                className={`p-2.5 rounded-lg border text-xs text-left font-semibold ${
                  selectedClosureDecision === 'incomplete' ? 'bg-red-600 border-red-500' : 'bg-[#161618] border-slate-800 hover:bg-slate-800/50'
                }`}
                id="btn-closure-incomplete"
              >
                🔴 Séance Incomplète (SUD &gt; 0)
              </button>
            </div>
            {selectedClosureDecision && (
              <div className="p-3 bg-[#161618] rounded-lg border border-slate-800 text-xs text-slate-300 animate-fade-in space-y-1">
                {selectedClosureDecision === 'complete' ? (
                  <>
                    <strong className="text-emerald-400 font-bold block">Protocole de Clôture Complète :</strong>
                    <p className="text-slate-300">On félicite le patient, on ré-ancre la Cognition Positive par un set court de SBA, et on l'invite à observer l'évolution de ses pensées et rêves d'ici la séance suivante.</p>
                  </>
                ) : (
                  <>
                    <strong className="text-red-400 font-bold block">Protocole de Clôture Incomplète (Urgence) :</strong>
                    <p className="text-slate-300">Arrêter l'exposition 15 minutes avant la fin. Activer le protocole du Contenant pour y ranger temporairement les restes de la cible. Effectuer une relaxation Lieu Sûr ou de l'auto-stabilisation Butterfly Hug pour rassurer le système d'alerte.</p>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'reval':
        return (
          <div className="bg-[#111113] rounded-xl p-4 border border-slate-800/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Processus de Réévaluation (Phase 8)</h4>
            <p className="text-[11px] text-slate-400">Chaque nouvelle consultation débute par une vérification stricte :</p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="p-2 bg-[#161618] rounded border border-slate-800 shadow-sm">
                🔍 <strong>Évaluation cognitive :</strong> Demander de repenser à la cible de la semaine passée. La CP est-elle toujours stable ? La VoC reste-t-elle élevée ?
              </div>
              <div className="p-2 bg-[#161618] rounded border border-slate-800 shadow-sm">
                🔍 <strong>Évaluation affective :</strong> Le SUD reste-t-il à 0 ? Des éléments de détresse résiduels sont-ils apparus ?
              </div>
              <div className="p-2 bg-[#161618] rounded border border-slate-800 shadow-sm">
                🔍 <strong>Évolution globale :</strong> Le patient a-t-il noté des changements de comportements dans sa vie quotidienne ? Des rêves marquants ?
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
                Espace Complice & EMDR LMS
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
                    className="w-full pl-9 pr-4 min-h-[44px] bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all text-center tracking-widest font-bold"
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
                <div 
                  onClick={() => setActiveSpace('hub')}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 select-none"
                >
                  <Heart className="text-rose-500 fill-rose-500 shrink-0" size={20} />
                  <span className="font-serif font-extrabold text-lg tracking-tight text-white">Harmonie</span>
                </div>
                <div className="hidden sm:block h-4 w-[1px] bg-slate-800"></div>
                
                {/* Active Indicator Breadcrumb */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  {activeSpace === 'hub' && <span>Accueil Principal</span>}
                  {activeSpace === 'lovers' && <span className="text-pink-400">L'Espace Complice 🔞</span>}
                  {activeSpace === 'clinical' && <span className="text-blue-400">Plateforme EMDR Clinique</span>}
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                {activeSpace !== 'hub' && (
                  <button
                    onClick={() => setActiveSpace('hub')}
                    className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md"
                    id="btn-header-back-hub"
                  >
                    <Home size={13} />
                    <span>Accueil</span>
                  </button>
                )}
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

          {/* MAIN HUB SWITCHER SCREEN */}
          {activeSpace === 'hub' && (
            <div className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-center space-y-6 sm:space-y-8 animate-fade-in" id="hub-selector">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                  Choisissez votre Espace de Travail
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Naviguez de façon hermétique entre la thérapie clinique EMDR et l'intimité linguistique multilingue de votre couple.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT CARD: Lovers Space */}
                <div 
                  onClick={() => setActiveSpace('lovers')}
                  className="bg-[#161618] border-2 border-slate-850 hover:border-pink-500/50 rounded-2xl p-6 sm:p-8 cursor-pointer shadow-md hover:shadow-xl transition-all flex flex-col justify-between text-left space-y-4 group"
                  id="card-lovers-space"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-pink-950/30 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="fill-pink-500 text-pink-500" size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                        L'Espace Complice
                        <span className="text-xs font-semibold bg-pink-950/50 text-pink-300 px-2 py-0.5 rounded-full border border-pink-900/30">Intime</span>
                      </h3>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">FR • EN • TH (ภาษาไทย)</p>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Un traducteur de phrases intimes et coquines conçu pour un homme français et une femme thaïlandaise. Apprenez l’anglais ou exprimez vos désirs coquins en moments complices.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/30 flex items-center justify-between text-xs font-bold text-pink-400">
                    <span>Accéder à l'espace complice</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* RIGHT CARD: EMDR LMS */}
                <div 
                  onClick={() => setActiveSpace('clinical')}
                  className="bg-[#161618] border-2 border-slate-850 hover:border-blue-500/50 rounded-2xl p-6 sm:p-8 cursor-pointer shadow-md hover:shadow-xl transition-all flex flex-col justify-between text-left space-y-4 group"
                  id="card-clinical-space"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-950/30 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                        Cursus & Pratique EMDR
                        <span className="text-xs font-semibold bg-blue-950/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-900/30">LMS Clinique</span>
                      </h3>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Formation Francine Shapiro</p>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      L’école de psychothérapie complète. Étudiez les 8 phases cliniques, utilisez le simulateur interactif de stimulations bilatérales (SBA), remplissez vos fiches de ciblage et générez votre diplôme.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/30 flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>Accéder à la formation EMDR</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOVERS INTIMATE WORKSPACE */}
          {activeSpace === 'lovers' && (
            <div className="flex-grow w-full max-w-5xl mx-auto p-4 sm:p-6 pb-24 animate-fade-in" id="lovers-container">
              <LoversSpace onNotify={triggerNotify} />
            </div>
          )}

          {/* CLINICAL EMDR WORKSPACE */}
          {activeSpace === 'clinical' && (
            <div className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-24 animate-fade-in" id="clinical-container">
              
              {/* Desktop Left Sidebar Navigation */}
              <aside className="hidden lg:block lg:col-span-1 space-y-4">
                <div className="bg-[#161618] border border-slate-800/50 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="border-b border-slate-800/30 pb-3">
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Navigation EMDR</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Structure de la formation clinique</p>
                  </div>

                  <nav className="space-y-1.5 flex flex-col">
                    {[
                      { id: 'curriculum', label: '1. Cursus (8 Modules)', icon: BookOpen },
                      { id: 'sba', label: '2. Simulateur SBA', icon: Activity },
                      { id: 'target', label: '3. Fiche de Ciblage', icon: ClipboardList },
                      { id: 'glossary', label: '4. Glossaire TAI', icon: HelpCircle },
                      { id: 'certificate', label: '5. Attestation Réussite', icon: Award }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setClinicalTab(tab.id as any)}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 text-left border transition-all ${
                            clinicalTab === tab.id
                              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                              : 'bg-transparent hover:bg-slate-800/30 border-transparent text-slate-400'
                          }`}
                          id={`btn-clinical-nav-${tab.id}`}
                        >
                          <Icon size={16} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* Main Clinical Work Area */}
              <main className="lg:col-span-3 space-y-6">
                
                {/* SUB-TAB 1: CURRICULUM (8 MODULES SLIDESHOW + INTERACTIVE SCHEMAS + QUIZ) */}
                {clinicalTab === 'curriculum' && (
                  <div className="space-y-5" id="clinical-curriculum">
                    {/* Top Modules selector drop-down/grid */}
                    {/* Top Modules selector drop-down/grid */}
                    <div className="bg-[#161618] p-4 rounded-xl border border-slate-800/50 shadow-sm">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Choisir le Module EMDR</label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <button
                            key={num}
                            onClick={() => setSelectedModuleId(num)}
                            className={`py-2 rounded-lg text-xs font-extrabold border transition-all ${
                              selectedModuleId === num 
                                ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                                : 'bg-[#111113] text-slate-300 hover:bg-slate-800/50 border-slate-800'
                            }`}
                            id={`btn-select-mod-${num}`}
                          >
                            Mod {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Module Details */}
                    <div className="bg-[#161618] rounded-xl border border-slate-800/50 shadow-sm overflow-hidden">
                      {/* Active Module Title card */}
                      <div className="bg-[#111113] text-white p-4 border-b border-slate-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{currentModule.phases}</span>
                          <h2 className="font-extrabold text-lg tracking-tight">{currentModule.title}</h2>
                          <p className="text-xs text-slate-300 italic font-medium">{currentModule.subtitle}</p>
                        </div>
                        {/* Completed state indicator */}
                        {localStorage.getItem(`emdr_module_${selectedModuleId}_quiz_passed`) === 'true' ? (
                          <span className="self-start sm:self-auto text-xs font-bold bg-green-950/60 text-green-300 border border-green-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Validé</span>
                          </span>
                        ) : (
                          <span className="self-start sm:self-auto text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle size={13} />
                            <span>Non validé</span>
                          </span>
                        )}
                      </div>

                      {/* Reading Content Slideshow */}
                      <div className="p-5 border-b border-slate-800/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                            <Layers size={15} className="text-blue-600" />
                            {currentModule.slides[activeSlideIndex].title}
                          </h3>
                          <span className="text-xs text-slate-400 font-bold">
                            Fiche {activeSlideIndex + 1} / {currentModule.slides.length}
                          </span>
                        </div>

                        {/* Slide text */}
                        <div className="space-y-3 min-h-[140px] text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {currentModule.slides[activeSlideIndex].content.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                        </div>

                        {/* Interactive Scheme Container (Depends on Active Slide's visualType) */}
                        <div className="pt-3 border-t border-slate-50">
                          {renderInteractiveSchema(currentModule.slides[activeSlideIndex].visualType)}
                        </div>

                        {/* Slides Navigation */}
                        <div className="pt-4 flex justify-between items-center">
                          <button
                            disabled={activeSlideIndex === 0}
                            onClick={() => setActiveSlideIndex(prev => prev - 1)}
                            className="min-h-[44px] px-4 rounded-lg border border-slate-800 disabled:opacity-30 text-slate-300 hover:bg-slate-800/50 text-xs font-bold flex items-center gap-1 transition-all"
                            id="btn-slide-prev"
                          >
                            <ChevronLeft size={16} /> Précédent
                          </button>
                          
                          <button
                            disabled={activeSlideIndex === currentModule.slides.length - 1}
                            onClick={() => setActiveSlideIndex(prev => prev + 1)}
                            className="min-h-[44px] px-4 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            id="btn-slide-next"
                          >
                            Suivant <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Verbatim & Pitfalls Section */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#111113]/40 border-b border-slate-800/30">
                        {/* Verbatims */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <span>💬 Dialogue Guide Thérapeute</span>
                          </h4>
                          <div className="space-y-2 text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto">
                            {currentModule.verbatim.map((v, idx) => (
                              <div key={idx} className="p-2.5 bg-[#0D0D0E]/80 border border-slate-800 rounded-lg space-y-1 shadow-inner">
                                <p className="font-semibold text-white">
                                  {v.therapist}
                                </p>
                                <p className="italic text-slate-400 pl-3 border-l-2 border-slate-800">
                                  {v.patient}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pitfalls (pièges) */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <span>⚠️ Pièges Cliniques à éviter</span>
                          </h4>
                          <ul className="space-y-2 text-xs text-slate-300 leading-normal">
                            {currentModule.pitfalls.map((p, idx) => (
                              <li key={idx} className="flex gap-2 items-start bg-rose-950/20 text-rose-200 p-2.5 rounded-lg border border-rose-900/30">
                                <span className="text-rose-400 font-bold shrink-0">❌</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Interactive Quiz Section */}
                      <div className="p-5 space-y-4 bg-[#161618]">
                        <div className="border-b border-slate-850 pb-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="text-blue-500" size={16} />
                            Cas Pratique d'Évaluation : Quiz Clinique
                          </h4>
                          <p className="text-[11px] text-slate-400">Justifiez votre expertise sur ce cas théorique complexe :</p>
                        </div>

                        <div className="space-y-4">
                          {currentModule.quiz.map((q) => {
                            const selectedOption = quizAnswers[q.id];
                            return (
                              <div key={q.id} className="space-y-3 text-left">
                                <p className="text-xs sm:text-sm font-bold text-slate-200">{q.question}</p>
                                <div className="space-y-1.5">
                                  {q.options.map((opt, oIdx) => {
                                    const isSelected = selectedOption === oIdx;
                                    const showCorrect = quizSubmitted && oIdx === q.correctAnswerIndex;
                                    const showIncorrect = quizSubmitted && isSelected && oIdx !== q.correctAnswerIndex;

                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={quizSubmitted}
                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs text-left font-semibold border transition-all ${
                                          showCorrect 
                                            ? 'bg-green-950/40 border-green-500 text-green-200 ring-1 ring-green-500/30'
                                            : showIncorrect 
                                              ? 'bg-red-950/40 border-red-500 text-red-200 ring-1 ring-red-500/30'
                                              : isSelected
                                                ? 'bg-blue-950/40 border-blue-500 text-blue-200 font-bold'
                                                : 'bg-[#111113] hover:bg-slate-800/30 border-slate-800 text-slate-300'
                                        }`}
                                        id={`quiz-opt-${q.id}-${oIdx}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                                            isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-700'
                                          }`}>
                                            {String.fromCharCode(65 + oIdx)}
                                          </span>
                                          <span className="leading-tight">{opt}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                {quizSubmitted && (
                                  <div className="p-3.5 bg-blue-950/20 rounded-lg border border-blue-900/30 text-xs animate-fade-in space-y-1 leading-normal">
                                    <strong className="text-blue-200 font-bold block">
                                      {selectedOption === q.correctAnswerIndex ? '✓ Réponse Correcte !' : '❌ Réponse Incorrecte.'}
                                    </strong>
                                    <p className="text-slate-300 italic">{q.explanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Submit button */}
                        <div className="pt-3 border-t border-slate-800/50 flex justify-end gap-2">
                          {quizSubmitted ? (
                            <button
                              onClick={() => {
                                setQuizSubmitted(false);
                                setQuizScore(null);
                                setQuizAnswers({});
                              }}
                              className="min-h-[44px] px-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 text-slate-300 font-bold text-xs transition-colors"
                              id="btn-quiz-retry"
                            >
                              Recommencer le Quiz
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuizSubmit(currentModule.quiz)}
                              className="min-h-[44px] px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                              id="btn-quiz-submit"
                            >
                              Valider ma réponse
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: SBA SIMULATOR */}
                {clinicalTab === 'sba' && (
                  <div className="space-y-4" id="clinical-sba">
                    <SbaSimulator onBackToHub={() => setActiveSpace('hub')} />
                  </div>
                )}

                {/* SUB-TAB 3: CLINICAL TARGETING WORKSHEET */}
                {clinicalTab === 'target' && (
                  <div className="space-y-4" id="clinical-target">
                    <CiblageForm onNotify={triggerNotify} />
                  </div>
                )}

                {/* SUB-TAB 4: TAI GLOSSARY */}
                {clinicalTab === 'glossary' && (
                  <div className="space-y-4" id="clinical-glossary">
                    <Glossary />
                  </div>
                )}

                {/* SUB-TAB 5: CERTIFICATE OF COMPLETION */}
                {clinicalTab === 'certificate' && (
                  <div className="space-y-4" id="clinical-certificate">
                    <Certificate onNotify={triggerNotify} triggerRefresh={triggerCertRefresh} />
                  </div>
                )}

              </main>
            </div>
          )}

          {/* SMARTPHONE ONLY: MOBILE BOTTOM NAVIGATION BAR */}
          {/* Automatically hides on desktop screens >= 1024px */}
          {activeSpace !== 'hub' && (
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161618] border-t border-slate-800/50 text-white shadow-xl py-2 px-3 flex justify-around items-center" id="mobile-bottom-nav">
              
              {/* BACK TO HUB */}
              <button
                onClick={() => setActiveSpace('hub')}
                className="flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 active:text-rose-400 min-h-[44px] w-12"
                id="btn-mob-hub"
              >
                <Home size={18} />
                <span className="font-semibold text-[8px] tracking-wide uppercase">Accueil</span>
              </button>

              {/* SPACE SPECIFIC TABS */}
              {activeSpace === 'lovers' ? (
                /* LOVERS SPACE BOTTOM CONTROLS */
                <div className="flex justify-around items-center w-full max-w-xs">
                  <div className="flex flex-col items-center justify-center gap-1 text-pink-400 min-h-[44px]">
                    <Heart className="fill-pink-500 text-pink-500 animate-pulse" size={20} />
                    <span className="font-semibold text-[9px] tracking-wide uppercase">Espace Complice</span>
                  </div>
                </div>
              ) : (
                /* CLINICAL SPACE BOTTOM NAV TABS */
                <div className="flex justify-between items-center w-full max-w-sm">
                  {/* Cursus */}
                  <button
                    onClick={() => setClinicalTab('curriculum')}
                    className={`flex flex-col items-center justify-center gap-1 text-[9px] min-h-[44px] w-12 transition-colors ${
                      clinicalTab === 'curriculum' ? 'text-blue-400 font-bold' : 'text-slate-400 active:text-slate-200'
                    }`}
                    id="btn-mob-curriculum"
                  >
                    <BookOpen size={18} />
                    <span className="text-[8px] font-semibold tracking-wide uppercase">Cursus</span>
                  </button>

                  {/* SBA Simulator */}
                  <button
                    onClick={() => setClinicalTab('sba')}
                    className={`flex flex-col items-center justify-center gap-1 text-[9px] min-h-[44px] w-12 transition-colors ${
                      clinicalTab === 'sba' ? 'text-blue-400 font-bold' : 'text-slate-400 active:text-slate-200'
                    }`}
                    id="btn-mob-sba"
                  >
                    <Activity size={18} />
                    <span className="text-[8px] font-semibold tracking-wide uppercase">SBA</span>
                  </button>

                  {/* Fiche Ciblage */}
                  <button
                    onClick={() => setClinicalTab('target')}
                    className={`flex flex-col items-center justify-center gap-1 text-[9px] min-h-[44px] w-12 transition-colors ${
                      clinicalTab === 'target' ? 'text-blue-400 font-bold' : 'text-slate-400 active:text-slate-200'
                    }`}
                    id="btn-mob-target"
                  >
                    <ClipboardList size={18} />
                    <span className="text-[8px] font-semibold tracking-wide uppercase">Fiche</span>
                  </button>

                  {/* Glossary */}
                  <button
                    onClick={() => setClinicalTab('glossary')}
                    className={`flex flex-col items-center justify-center gap-1 text-[9px] min-h-[44px] w-12 transition-colors ${
                      clinicalTab === 'glossary' ? 'text-blue-400 font-bold' : 'text-slate-400 active:text-slate-200'
                    }`}
                    id="btn-mob-glossary"
                  >
                    <HelpCircle size={18} />
                    <span className="text-[8px] font-semibold tracking-wide uppercase">Glossaire</span>
                  </button>

                  {/* Certificate */}
                  <button
                    onClick={() => setClinicalTab('certificate')}
                    className={`flex flex-col items-center justify-center gap-1 text-[9px] min-h-[44px] w-12 transition-colors ${
                      clinicalTab === 'certificate' ? 'text-blue-400 font-bold' : 'text-slate-400 active:text-slate-200'
                    }`}
                    id="btn-mob-certificate"
                  >
                    <Award size={18} />
                    <span className="text-[8px] font-semibold tracking-wide uppercase">Diplôme</span>
                  </button>
                </div>
              )}
            </nav>
          )}

        </div>
      )}

      {/* Shared bottom footer */}
      <footer className="bg-[#161618] border-t border-slate-800/50 text-slate-500 text-center py-4 text-[10px] sm:text-xs tracking-wider uppercase font-medium mt-auto" id="shared-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Harmonie © 2026 • Confidentialité absolue (localStorage)</span>
          <span>Développé pour l'Union Complice & la Psychothérapie Clinique</span>
        </div>
      </footer>
    </div>
  );
}
