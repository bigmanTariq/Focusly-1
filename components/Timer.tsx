
import React from 'react';
import { TimerState } from '../types';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimerProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ state, onStart, onPause, onReset }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((state.duration - state.timeLeft) / state.duration) * 100;

  return (
    <div className="bg-white dark:bg-white/5 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col items-center">
      <div className="flex items-center gap-3 mb-8">
        <Clock size={16} className="text-indigo-500 animate-pulse" />
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
          {state.status === 'idle' ? 'Ready' : state.status === 'working' ? 'Deep Work' : 'Break'}
        </span>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center mb-10">
        <svg className="absolute w-full h-full -rotate-90">
          <circle 
            cx="112" cy="112" r="104" 
            className="fill-none stroke-gray-50 dark:stroke-white/5" 
            strokeWidth="10"
          />
          <circle 
            cx="112" cy="112" r="104" 
            className={`fill-none transition-all duration-1000 ${state.status === 'working' ? 'stroke-indigo-500' : 'stroke-emerald-500'}`} 
            strokeWidth="10"
            strokeDasharray={653.45}
            strokeDashoffset={653.45 * (1 - progress / 100)}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white tabular-nums">
          {formatTime(state.timeLeft)}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {state.status === 'idle' ? (
          <button 
            onClick={onStart}
            className="w-16 h-16 rounded-[1.5rem] signal-gradient text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
          >
            <Play fill="currentColor" size={28} />
          </button>
        ) : (
          <button 
            onClick={onPause}
            className="w-16 h-16 rounded-[1.5rem] bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
          >
            <Pause fill="currentColor" size={28} />
          </button>
        )}
        <button 
          onClick={onReset}
          className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      <div className="mt-10 pt-10 border-t border-gray-50 dark:border-white/5 w-full">
          <div className="flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Sessions</p>
                  {/* Changed totalPomodorosCompleted to totalSessions to match types.ts */}
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{state.totalSessions}</p>
              </div>
              <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Target</p>
                  <p className="text-2xl font-black text-gray-300 dark:text-gray-800">12</p>
              </div>
          </div>
          <div className="mt-4 h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
             <div 
               className="h-full bg-indigo-500 transition-all duration-1000"
               /* Changed totalPomodorosCompleted to totalSessions */
               style={{ width: `${Math.min((state.totalSessions / 12) * 100, 100)}%` }}
             ></div>
          </div>
      </div>
    </div>
  );
};

export default Timer;
