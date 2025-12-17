
import React, { useState, useEffect, useRef } from 'react';
import { PlaygroundType } from '../types';
import { X, Play, Terminal, RotateCcw, LineChart, Cpu, Target, Sliders, CheckCircle, ChevronDown, ChevronUp, Zap, Sparkles, Brain, Lightbulb, Info, Maximize2, Minimize2, Check } from 'lucide-react';

interface PlaygroundProps {
  type: PlaygroundType;
  initialData: string;
  prompt: string;
  onClose: () => void;
}

const Playground: React.FC<PlaygroundProps> = ({ type, initialData, prompt, onClose }) => {
  const [content, setContent] = useState(initialData);
  const [simulationIntensity, setSimulationIntensity] = useState(15);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Environment Stream: Ready for input...']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);
  const [showPrime, setShowPrime] = useState(true);
  
  // Spreadsheet state
  const [grid, setGrid] = useState<string[][]>(() => {
    if (type === 'spreadsheet') {
      const rows = 12;
      const cols = 8;
      const initial = Array(rows).fill(null).map(() => Array(cols).fill(''));
      if (initialData) {
        initialData.split('\n').filter(l => l.trim()).forEach((line, ri) => {
          if (ri < rows) {
            line.split(',').forEach((val, ci) => { if (ci < cols) initial[ri][ci] = val.trim().replace(/^"|"$/g, ''); });
          }
        });
      }
      return initial;
    }
    return [];
  });

  const handleExecute = () => {
    setIsExecuting(true);
    setShowSuccess(false);
    
    const messages = [
      `> Evaluating cognitive vectors...`,
      `> Filtering noise spectrum (${100 - simulationIntensity}% reduction)...`,
      `> Comparing patterns to expert benchmarks...`,
      `> ANALYSIS COMPLETE: Signal isolated.`
    ];

    let i = 0;
    const logInterval = setInterval(() => {
      if (i < messages.length) {
        setTerminalOutput(prev => [...prev, messages[i]]);
        i++;
      } else {
        clearInterval(logInterval);
        setIsExecuting(false);
        setShowSuccess(true);
        if (typeof (window as any).confetti === 'function') {
          (window as any).confetti({ 
            particleCount: 50, 
            spread: 60, 
            origin: { y: 0.5, x: 0.5 },
            colors: ['#6366f1', '#10b981'] 
          });
        }
      }
    }, 400);
  };

  const handleGridChange = (r: number, c: number, val: string) => {
    const newGrid = [...grid];
    newGrid[r][c] = val;
    setGrid(newGrid);
  };

  // Aesthetic Filter Logic: REFACTORED to remove disruptive blur
  // We now use subtle background color shifts instead of blur
  const surfaceBrightness = simulationIntensity > 50 ? 'bg-white' : 'bg-gray-50/50';

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-hidden flex flex-col transition-all duration-700">
      
      {/* Prime Overlay (Non-blocking, centered) */}
      {showPrime && (
        <div className="absolute inset-0 z-[200] bg-black/40 apple-blur flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-[#1c1c1e] p-10 rounded-[3rem] max-w-lg w-full shadow-2xl border border-white/5 text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-6">
                 <Brain size={40} />
              </div>
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-4">Signal Priming</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Identify the high-value 'Signal' amidst the 'Noise'. Recognition is the first step to mastery.</p>
              <button 
                onClick={() => setShowPrime(false)} 
                className="w-full py-5 bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Enter Lab
              </button>
           </div>
        </div>
      )}

      {/* Modern Header */}
      <header className="h-20 bg-white/80 dark:bg-black/80 border-b border-gray-100 dark:border-white/10 apple-blur flex items-center justify-between px-8 shrink-0 z-[120]">
        <div className="flex items-center gap-5">
           <div className={`p-3 rounded-xl ${type === 'code' ? 'bg-indigo-500' : 'bg-emerald-600'} text-white shadow-lg`}>
             {type === 'code' ? <Cpu size={20} /> : <LineChart size={20} />}
           </div>
           <div>
             <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter leading-none">Learning Lab</h2>
             <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Difficulty: {simulationIntensity}%</p>
           </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 bg-gray-50 dark:bg-white/5 px-6 py-2 rounded-full border border-gray-100 dark:border-white/10">
           <div className="flex items-center gap-3">
              <Sliders size={14} className="text-gray-400" />
              <input 
                type="range" min="1" max="100" 
                value={simulationIntensity} 
                onChange={e => setSimulationIntensity(parseInt(e.target.value))} 
                className="w-24 h-1.5"
              />
              <span className="text-[10px] font-black text-indigo-500 w-8">{simulationIntensity}%</span>
           </div>
           <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
           <button onClick={() => setShowPrime(true)} className="text-[9px] font-black uppercase text-gray-500 hover:text-indigo-500 transition-colors">Goal Model</button>
        </div>

        <button onClick={onClose} className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Work Area */}
        <div className={`flex-1 flex flex-col overflow-hidden relative transition-colors duration-500 ${surfaceBrightness} dark:bg-[#08080a]`}>
          
          {/* Directive (Compact & High Contrast) */}
          <div className="px-8 pt-8 shrink-0">
            <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm flex items-start gap-5">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0"><Target size={18} /></div>
              <div>
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mission Objective</h4>
                 <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-relaxed">"{prompt}"</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 flex flex-col overflow-hidden relative">
             {/* Main Sandbox - CLEAR, NO BLUR */}
             <div 
               className="flex-1 bg-white dark:bg-black rounded-[2.5rem] border-2 border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden relative"
               style={{ 
                 boxShadow: isExecuting ? '0 0 60px rgba(99, 102, 241, 0.1)' : 'none'
               }}
             >
                {/* Execution Progress Bar (Inline) */}
                {isExecuting && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-white/5 z-[70] overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[progress_1.6s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                  </div>
                )}

                {type === 'spreadsheet' ? (
                  <div className="flex-1 h-full overflow-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-gray-50 dark:bg-black">
                          <th className="w-10 h-10 border-b border-r border-gray-100 dark:border-white/5 text-[9px] font-black text-gray-400">#</th>
                          {['A','B','C','D','E','F','G','H'].map(c => (
                            <th key={c} className="w-32 h-10 border-b border-r border-gray-100 dark:border-white/5 text-[9px] font-black text-gray-500 uppercase">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grid.map((row, ri) => (
                          <tr key={ri} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-colors">
                            <td className="bg-gray-50 dark:bg-black border-r border-b border-gray-100 dark:border-white/5 text-[9px] font-black text-gray-400 text-center">{ri+1}</td>
                            {row.map((val, ci) => (
                              <td key={ci} className="border-r border-b border-gray-100 dark:border-white/5 p-0">
                                <input 
                                  type="text" value={val} onChange={e => handleGridChange(ri, ci, e.target.value)}
                                  className={`w-full h-10 px-4 bg-transparent text-sm font-medium dark:text-white focus:outline-none focus:bg-indigo-500/5 transition-colors ${ri === 0 ? 'font-black text-indigo-500' : ''}`}
                                />
                              </td>
                            ))}
                        </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <textarea 
                    value={content} onChange={e => setContent(e.target.value)}
                    className="w-full h-full bg-transparent p-10 font-mono text-sm dark:text-gray-300 leading-relaxed resize-none focus:outline-none"
                    spellCheck={false}
                  />
                )}

                {/* SUCCESS STATE - Clean, Floating Modal (Replaces blocking black screen) */}
                {showSuccess && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-black/60 apple-blur z-[80] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-[#1c1c1e] p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/10 text-center max-w-sm w-full scale-100">
                       <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                          <Check size={40} strokeWidth={4} />
                       </div>
                       <h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-4 leading-none">Signal Secured</h3>
                       <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium leading-relaxed">Your neural sync with this logic pattern is complete. Accuracy benchmarks reached.</p>
                       <div className="flex flex-col gap-3">
                          <button onClick={onClose} className="w-full py-5 bg-indigo-500 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Proceed to Path</button>
                          <button onClick={() => setShowSuccess(false)} className="w-full py-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hover:text-indigo-500 transition-colors">Refine Isolation</button>
                       </div>
                    </div>
                  </div>
                )}
             </div>

             {/* Footer Action Suite */}
             <div className="mt-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setActiveHintIndex(prev => Math.min(prev + 1, 2))}
                     className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
                   >
                     <Lightbulb size={16} /> Hint
                   </button>
                   {activeHintIndex >= 0 && (
                     <div className="bg-amber-50 dark:bg-amber-500/5 px-6 py-3 rounded-2xl border border-amber-200/50 dark:border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 animate-in slide-in-from-left-4">
                        Scaffold {activeHintIndex + 1}: Check Row 1 for Signal.
                     </div>
                   )}
                </div>

                <div className="flex items-center gap-3">
                   <button onClick={() => setContent(initialData)} className="p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-400 hover:text-red-500 transition-all shadow-sm">
                      <RotateCcw size={20} />
                   </button>
                   <button 
                     onClick={handleExecute} disabled={isExecuting}
                     className="px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                     {isExecuting ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                     {isExecuting ? 'Syncing...' : 'Execute Lab'}
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Diagnostic Stream (Optimized for Space) */}
        <div 
          className={`bg-white dark:bg-black border-l border-gray-100 dark:border-white/5 transition-all duration-500 flex flex-col z-[110] shadow-2xl ${isTerminalCollapsed ? 'w-16' : 'w-[380px]'}`}
        >
           <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              {!isTerminalCollapsed && (
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-3">
                   <Terminal size={14} /> Diagnostic
                </h4>
              )}
              <button 
                onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-all"
              >
                {isTerminalCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
           </div>

           {!isTerminalCollapsed && (
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar font-mono text-[11px] text-emerald-500/80 bg-gray-50/30 dark:bg-black/40">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="mb-3 animate-in fade-in slide-in-from-left-2">
                    <span className="opacity-30 mr-2">[{i}]</span> {line}
                  </div>
                ))}
                {isExecuting && (
                  <div className="flex items-center gap-2 mt-4 text-white animate-pulse">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                     Validating Signal Strength...
                  </div>
                ) }
             </div>
           )}

           {!isTerminalCollapsed && (
             <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0c0c0e]">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cognitive Sync</span>
                   <span className="text-[10px] font-black dark:text-white">{simulationIntensity}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${simulationIntensity}%` }} />
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// Simple Refresh component for the icon
const RefreshCw = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

export default Playground;
