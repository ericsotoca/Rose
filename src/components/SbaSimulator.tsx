/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, RefreshCw, Settings, Info } from 'lucide-react';

interface SbaSimulatorProps {
  onBackToHub?: () => void;
}

export default function SbaSimulator({ onBackToHub }: SbaSimulatorProps) {
  // Configuration State
  const [speed, setSpeed] = useState<number>(0.8); // frequency in Hz (0.4 to 2.0)
  const [ballSize, setBallSize] = useState<number>(32); // size in px
  const [ballColor, setBallColor] = useState<string>('#3b82f6'); // blue as default (Lieu Sûr)
  const [targetPasses, setTargetPasses] = useState<number>(24); // 6, 24, 30, or 0 (infinite)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(0.4);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [passesCount, setPassesCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs for Animation
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastSideRef = useRef<'left' | 'right' | null>(null); // To detect boundary hits on sine wave

  // Refs for Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Color options linked to EMDR protocols
  const colorOptions = [
    { value: '#3b82f6', name: 'Bleu (Lieu Sûr / Stabilisation)' },
    { value: '#f97316', name: 'Orange (Cognition Positive / Installation)' },
    { value: '#10b981', name: 'Vert (Désensibilisation standard)' },
    { value: '#ec4899', name: 'Rose (Traitement Doux)' },
    { value: '#6366f1', name: 'Indigo (Concentration)' },
    { value: '#1e293b', name: 'Sombre (Minimaliste)' }
  ];

  // Initialize Audio Context lazily
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      // Compatibility fallback
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play stereo tap sound
  const playBinauralTap = (isLeft: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Create Nodes
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Low, soft woody knock sound
      osc.frequency.setValueAtTime(isLeft ? 280 : 320, now); 

      // Stereo Panning
      let panner: StereoPannerNode | null = null;
      if (ctx.createStereoPanner) {
        panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(isLeft ? -0.8 : 0.8, now);
      }

      // Gain Envelope (Quick soft woodblock decay)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(soundVolume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Connect
      if (panner) {
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(ctx.destination);

      // Play and destroy
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.error("Web Audio API not supported or blocked", e);
    }
  };

  // Trigger Haptic feedback (Vibration)
  const triggerHaptic = () => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(40); // Short crisp tap
    }
  };

  // Animation Loop
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
    const container = containerRef.current;
    const ball = ballRef.current;

    if (container && ball) {
      const cWidth = container.clientWidth;
      const bWidth = ball.clientWidth;
      const maxDistance = cWidth - bWidth;

      // Sinusoidal horizontal calculation
      // Phase varies with speed (frequency in Hz)
      const phase = 2 * Math.PI * speed * elapsedSeconds;
      const sineVal = Math.sin(phase);

      // Map to pixels
      const x = (sineVal + 1) * 0.5 * maxDistance;
      ball.style.transform = `translateX(${x}px)`;

      // Detect direction reversal (extrema)
      // Math.sin is at extrema (-1 or +1)
      const threshold = 0.98; // Trigger just before the absolute limit for smooth feel
      if (sineVal < -threshold && lastSideRef.current !== 'left') {
        lastSideRef.current = 'left';
        playBinauralTap(true);
        triggerHaptic();
        setPassesCount((prev) => prev + 1);
      } else if (sineVal > threshold && lastSideRef.current !== 'right') {
        lastSideRef.current = 'right';
        playBinauralTap(false);
        triggerHaptic();
        setPassesCount((prev) => prev + 1);
      }

      // Reset side ref when returning to center
      if (Math.abs(sineVal) < 0.2) {
        lastSideRef.current = null;
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  // Handle Play/Pause
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = null;
      lastSideRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, speed]);

  // Pass Limiter Check
  useEffect(() => {
    if (targetPasses > 0 && passesCount >= targetPasses) {
      setIsRunning(false);
      setPassesCount(targetPasses); // Lock at max
      // Optional sound cue for finished
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(soundVolume * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
    }
  }, [passesCount, targetPasses]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const element = containerRef.current?.parentElement;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Sync fullscreen state if changed via escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const resetCount = () => {
    setPassesCount(0);
  };

  return (
    <div id="sba-simulator" className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-100">
      {/* Simulation Stage (Takes the main space) */}
      <div 
        ref={containerRef}
        className={`relative flex items-center justify-start overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-screen bg-slate-950 flex-grow z-50' 
            : 'h-64 md:h-80 bg-slate-900 border-b border-slate-800'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Fullscreen HUD overlays */}
        {isFullscreen && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-lg pointer-events-auto">
            <span className="text-white font-medium text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: ballColor }}></span>
              SBA en cours : {passesCount} / {targetPasses === 0 ? '∞' : targetPasses} passes
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                id="btn-fs-play-pause"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                id="btn-fs-exit"
              >
                <Minimize size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Center alignment guide */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800 pointer-events-none"></div>

        {/* Oscillating Ball */}
        <div 
          ref={ballRef}
          className="absolute rounded-full shadow-lg transition-transform duration-[16ms] ease-linear"
          style={{
            width: `${ballSize}px`,
            height: `${ballSize}px`,
            backgroundColor: ballColor,
            boxShadow: `0 0 15px ${ballColor}80`
          }}
          id="sba-ball"
        ></div>

        {/* Press space overlay when inactive */}
        {!isRunning && passesCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] text-white select-none pointer-events-none">
            <p className="text-center px-4">
              <span className="block text-lg font-semibold mb-1">Simulateur de Stimulations Bilatérales</span>
              <span className="text-xs text-slate-300">Cliquez sur Lecture pour démarrer la séance</span>
            </p>
          </div>
        )}

        {/* Auto-Stopped alert */}
        {!isRunning && targetPasses > 0 && passesCount >= targetPasses && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] text-white select-none pointer-events-none">
            <div className="text-center px-4 max-w-xs animate-fade-in">
              <RefreshCw className="mx-auto mb-2 text-emerald-400 animate-spin" size={24} style={{ animationDuration: '3s' }} />
              <h4 className="font-semibold text-lg text-emerald-400">Séquence Terminée</h4>
              <p className="text-xs text-slate-300 mt-1">
                Le nombre cible de {targetPasses} passes a été atteint avec succès.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel (Client UI) */}
      <div className="p-5 flex-grow bg-[#161618] flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Left Column: Mechanical adjustments */}
          <div className="space-y-4">
            <div className="bg-[#111113]/60 p-3.5 rounded-lg border border-slate-800/40">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  Vitesse d’oscillation (Fréquence)
                </label>
                <span className="text-xs font-semibold bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-900/30">
                  {speed.toFixed(1)} Hz / {Math.round(speed * 60)} cpm
                </span>
              </div>
              <input 
                type="range" 
                min="0.4" 
                max="2.0" 
                step="0.1" 
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                id="slider-sba-speed"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.4 Hz (Stabilisation lente)</span>
                <span>2.0 Hz (Désensibilisation rapide)</span>
              </div>
            </div>

            <div className="bg-[#111113]/60 p-3.5 rounded-lg border border-slate-800/40">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-200">Taille de la cible</label>
                <span className="text-xs font-semibold text-slate-400">{ballSize}px</span>
              </div>
              <input 
                type="range" 
                min="16" 
                max="80" 
                step="4" 
                value={ballSize} 
                onChange={(e) => setBallSize(parseInt(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                id="slider-sba-size"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">Protocole de Couleur</label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBallColor(opt.value)}
                    className={`flex items-center gap-1.5 p-2 rounded-md border text-[11px] font-semibold transition-all ${
                      ballColor === opt.value 
                        ? 'border-blue-500 bg-blue-950/30 text-blue-200 ring-1 ring-blue-500/30' 
                        : 'border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                    id={`btn-color-${opt.value.replace('#', '')}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: opt.value }}></span>
                    <span className="truncate">{opt.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Audio, Haptics & Sets */}
          <div className="space-y-4">
            <div className="bg-[#111113]/60 p-3.5 rounded-lg border border-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  Générateur Binaural (Web Audio)
                </span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1 rounded-full transition-colors ${soundEnabled ? 'text-blue-400' : 'text-slate-500'}`}
                  id="btn-toggle-sound"
                >
                  {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>
              {soundEnabled && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Volume</span>
                    <span>{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05" 
                    value={soundVolume} 
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-850 rounded-lg cursor-pointer"
                    id="slider-sound-volume"
                  />
                </div>
              )}
            </div>

            <div className="bg-[#111113]/60 p-3.5 rounded-lg border border-slate-800/40 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-200 block">Vibration Haptique (Vibration API)</span>
                <span className="text-[10px] text-slate-400">Impulsion physique lors de l’impact gauche/droite</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={hapticEnabled} 
                  onChange={() => setHapticEnabled(!hapticEnabled)}
                  className="sr-only peer"
                  id="checkbox-haptic"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="bg-[#111113]/60 p-3.5 rounded-lg border border-slate-800/40">
              <label className="text-sm font-medium text-slate-200 block mb-1.5">Nombre cible de passes (Auto-Stop)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[6, 24, 30, 0].map((passes) => (
                  <button
                    key={passes}
                    onClick={() => {
                      setTargetPasses(passes);
                      if (passesCount > passes && passes > 0) {
                        setPassesCount(0);
                      }
                    }}
                    className={`py-1.5 px-1 rounded-md text-xs font-semibold border transition-all ${
                      targetPasses === passes 
                        ? 'border-blue-500 bg-blue-950/30 text-blue-200' 
                        : 'border-slate-800 bg-[#111113] text-slate-400 hover:bg-slate-800/50'
                    }`}
                    id={`btn-target-${passes}`}
                  >
                    {passes === 0 ? 'Infini' : `${passes}`}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5">
                {targetPasses === 6 && '✓ Recommandé pour l’Installation de Ressources (Lieu Sûr)'}
                {(targetPasses === 24 || targetPasses === 30) && '✓ Recommandé pour la Désensibilisation rapide (Phase 4)'}
                {targetPasses === 0 && '✓ Le simulateur oscille en continu jusqu’au clic sur pause.'}
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Controls HUD */}
        <div className="border-t border-slate-800/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-slate-300 text-sm">
              Séquence actuelle : <strong className="text-white font-bold" id="txt-passes-count">{passesCount}</strong>
              {targetPasses > 0 && <span className="text-slate-400"> / {targetPasses}</span>} passes
            </div>
            {passesCount > 0 && (
              <button 
                onClick={resetCount}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                id="btn-reset-counter"
              >
                <RefreshCw size={12} /> Réinitialiser
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (passesCount >= targetPasses && targetPasses > 0) {
                  setPassesCount(0);
                }
                setIsRunning(!isRunning);
              }}
              className={`flex-grow sm:flex-grow-0 min-h-[44px] px-6 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                isRunning 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/15' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/15'
              }`}
              id="btn-play-pause"
            >
              {isRunning ? (
                <>
                  <Pause size={18} /> Mettre en Pause
                </>
              ) : (
                <>
                  <Play size={18} /> Démarrer la Séquence
                </>
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="min-h-[44px] w-12 border border-slate-800 hover:bg-slate-800/50 text-slate-300 rounded-lg flex items-center justify-center transition-colors shrink-0"
              title="Passer en plein écran"
              id="btn-fullscreen-toggle"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
