
import React from 'react';
// Changed Task to LearningNode to match types.ts
import { TimerState, LearningNode } from '../types';
import { X, Pause, Play } from 'lucide-react';

interface FocusModeProps {
  timer: TimerState;
  // Changed Task to LearningNode
  task: LearningNode | null;
  onExit: () => void;
  onToggleTimer: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ timer, task, onExit, onToggleTimer }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((timer.duration - timer.timeLeft) / timer.duration) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-apple-light dark:bg-apple-dark flex flex-col items-center justify-center px-6 transition-colors duration-700">
      <button 
        onClick={onExit}
        className="absolute top-10 right-10 p-4 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:rotate-90"
      >
        <X size={28} />
      </button>

      <div className="text-center max-w-2xl">
        <div className="mb-6 inline-block px-6 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
          Deep Work State
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-16 leading-tight">
          {task?.title || "Focusing..."}
        </h2>

        <div className="relative mb-24">
          <div className="text-[10rem] md:text-[16rem] font-black tracking-tighter text-gray-900 dark:text-white tabular-nums select-none opacity-100 leading-none">
            {formatTime(timer.timeLeft)}
          </div>
          <div className="absolute -bottom-8 left-0 w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full signal-gradient transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-10">
          <button 
            onClick={onToggleTimer}
            className="w-24 h-24 rounded-[2rem] signal-gradient text-white flex items-center justify-center hover:scale-110 transition-all shadow-2xl shadow-indigo-500/40 active:scale-95"
          >
            {timer.status === 'working' ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <p className="text-gray-400 dark:text-gray-600 font-bold uppercase text-[10px] tracking-widest">
              Neural pathways aligned
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
