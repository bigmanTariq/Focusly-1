
import React, { useEffect, useState } from 'react';
import { TimerState, LearningNode } from '../types';
import { X, Pause, Play, CheckCircle2 } from 'lucide-react';

interface FocusModeProps {
  timer: TimerState;
  task: LearningNode | null;
  onExit: () => void;
  onToggleTimer: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ timer, task, onExit, onToggleTimer }) => {
  const isDone = timer.status === 'completed';
  const isSignal = task?.type === 'signal';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((timer.duration - timer.timeLeft) / timer.duration) * 100;

  // Dopamine Feedback Trigger
  useEffect(() => {
    if (isDone && isSignal) {
      // Subtle micro-confetti
      (window as any).confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ffffff'],
        disableForReducedMotion: true
      });
    }
  }, [isDone, isSignal]);

  return (
    <div className={`fixed inset-0 z-[100] bg-apple-light dark:bg-apple-dark flex flex-col items-center justify-center px-6 transition-all duration-1000 ${isDone && isSignal ? 'animate-signal-glow' : ''}`}>
      <button 
        onClick={onExit}
        className="absolute top-10 right-10 p-4 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:rotate-90 z-[110]"
      >
        <X size={28} />
      </button>

      <div className="text-center max-w-4xl w-full">
        <div className={`mb-8 inline-block px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.4em] transition-all duration-700 ${isDone ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
          {isDone ? 'Objective Secured' : 'Neural Isolation Active'}
        </div>
        
        <h2 className={`text-5xl md:text-8xl font-black tracking-tight text-gray-900 dark:text-white mb-16 leading-tight transition-all duration-700 ${isDone ? 'scale-105' : ''}`}>
          {isDone ? (
            <span className="flex flex-col items-center justify-center gap-6 text-emerald-500 animate-in zoom-in duration-500">
              <CheckCircle2 size={120} className="animate-bounce" />
              Focus Cycle Complete
            </span>
          ) : (
            task?.title || "Deep Focus"
          )}
        </h2>

        {!isDone && (
          <div className="relative mb-32 group">
            <div className={`text-[12rem] md:text-[18rem] font-black tracking-tighter text-gray-900 dark:text-white tabular-nums select-none leading-none transition-all duration-500 ${timer.timeLeft < 10 && timer.timeLeft > 0 ? 'scale-110 text-red-500 animate-pulse' : ''}`}>
              {formatTime(timer.timeLeft)}
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl h-4 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_30px_rgba(99,102,241,0.6)] ${isDone ? 'bg-emerald-500' : 'signal-gradient'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-12">
          {!isDone ? (
            <button 
              onClick={onToggleTimer}
              className="w-32 h-32 rounded-[3rem] signal-gradient text-white flex items-center justify-center hover:scale-110 transition-all shadow-[0_20px_60px_rgba(99,102,241,0.4)] active:scale-95"
            >
              {timer.status === 'working' ? <Pause size={64} fill="currentColor" /> : <Play size={64} fill="currentColor" />}
            </button>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 delay-300">
              <p className="text-gray-500 dark:text-gray-400 font-bold text-xl max-w-lg mx-auto leading-relaxed">
                High-signal progress recorded. Your neural pathways for "{task?.title}" have been solidified.
              </p>
              <button 
                onClick={onExit}
                className="px-16 py-8 rounded-[3rem] bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.5em] text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-transparent hover:border-emerald-500/20"
              >
                Continue Mission
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <span className={`w-3 h-3 rounded-full animate-ping ${isDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
            <p className="text-gray-400 dark:text-gray-600 font-black uppercase text-[12px] tracking-[0.4em]">
              {isDone ? 'Signal Strength 100%' : 'Minimal Noise Detected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
