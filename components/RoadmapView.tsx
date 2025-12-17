
import React, { useState } from 'react';
import { LearningNode, NodeType } from '../types';
import { 
  CheckCircle2, Play, GitBranch, ArrowRight, Compass, X, Zap, 
  ChevronRight, Sliders, Trash2, Terminal, AlertCircle, RefreshCw
} from 'lucide-react';

interface RoadmapViewProps {
  nodes: LearningNode[];
  noiseTransparency: number;
  onCreate: (topic: string) => void;
  onDrillDown: (id: string) => void;
  onToggleMastery: (id: string) => void;
  onStartFocus: (id: string) => void;
  onClear: () => void;
  onFetchContent: (id: string, complexity: number) => Promise<void>;
  onToggleType: (id: string) => void;
  onDelete: (id: string) => void;
  onLaunchPlayground: (id: string) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ 
  nodes, noiseTransparency, onCreate, onDrillDown, onToggleMastery, onStartFocus, onClear, onFetchContent, onToggleType, onDelete, onLaunchPlayground 
}) => {
  const [input, setInput] = useState('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [complexity, setComplexity] = useState(50);
  const [isEli7, setIsEli7] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeNode = nodes.find(n => n.id === activeNodeId);

  const handleOpenNode = (id: string) => {
    setActiveNodeId(id);
    setError(null);
  };

  const triggerGeneration = async () => {
    if (activeNodeId) {
      setIsGenerating(true);
      setError(null);
      try {
        await onFetchContent(activeNodeId, complexity);
      } catch (err: any) {
        console.error(err);
        setError(err?.message?.includes('429') ? "API Rate Limit Exceeded. Our experts are busy. Please wait a moment and retry." : "Architectural failure. The signal was lost.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      await onCreate(input);
    } catch (err: any) {
      console.error(err);
      setError(err?.message?.includes('429') ? "Quota exhausted. Please try again in 60 seconds." : "Failed to architect roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 animate-pulse shadow-2xl border border-indigo-500/20">
           <Compass size={48} />
        </div>
        <h2 className="text-5xl font-black dark:text-white mb-6 tracking-tighter">Path Architect</h2>
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="relative w-full max-w-2xl group">
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             disabled={isGenerating}
             placeholder={isGenerating ? "Architecting..." : "Topic (e.g. Quantitative Trading)"} 
             className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 rounded-[2.5rem] py-8 px-10 text-2xl font-bold dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-xl disabled:opacity-50"
             onKeyDown={e => e.key === 'Enter' && handleCreate()}
           />
           <button 
            onClick={handleCreate} 
            disabled={isGenerating}
            className="absolute right-4 top-4 bottom-4 px-10 rounded-[1.8rem] bg-indigo-500 text-white font-black text-xl flex items-center gap-3 hover:bg-indigo-600 active:scale-95 transition-all shadow-lg disabled:opacity-50"
           >
             {isGenerating ? <RefreshCw className="animate-spin" /> : <>Build <ArrowRight size={24} /></>}
           </button>
        </div>
      </div>
    );
  }

  const sortedNodes = [...nodes].sort((a, b) => a.difficultyLevel - b.difficultyLevel);
  const horizontalNodes = sortedNodes.filter(n => n.difficultyLevel <= 10);
  const verticalNodes = sortedNodes.filter(n => n.difficultyLevel > 10);

  return (
    <div className="relative pb-40">
      <div className="max-w-6xl mx-auto mb-16 text-center">
         <h2 className="text-4xl font-black dark:text-white tracking-tighter">Breadth & Depth Spine</h2>
      </div>

      <div className="max-w-6xl mx-auto">
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
             {horizontalNodes.map((node) => (
                <NodeCard key={node.id} node={node} noiseTransparency={noiseTransparency} onOpen={handleOpenNode} />
             ))}
          </div>
        </section>

        <section className="flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-16 px-4">
            {verticalNodes.map((node) => (
              <div key={node.id} className="relative flex flex-col items-center">
                <NodeCard node={node} noiseTransparency={noiseTransparency} onOpen={handleOpenNode} isLarge />
              </div>
            ))}
          </div>
        </section>
      </div>

      {activeNodeId && activeNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 md:p-12 apple-blur bg-black/70 animate-in fade-in duration-300">
          <div className="relative w-full h-full max-w-6xl bg-white dark:bg-apple-cardDark sm:rounded-[4rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
            <div className="p-8 sm:p-12 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-black/20 shrink-0 z-30">
              <div className="flex-1">
                <h2 className="text-3xl sm:text-6xl font-black dark:text-white tracking-tighter truncate leading-none">{activeNode.title}</h2>
              </div>
              <button onClick={() => { setActiveNodeId(null); setIsEli7(false); setError(null); }} className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all hover:scale-110 ml-4">
                <X size={32} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="p-8 sm:p-12 md:p-16 pt-2">
                {error && (
                  <div className="max-w-md mx-auto mb-10 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-center">
                    <AlertCircle size={40} className="mx-auto mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest mb-2">Error Detected</p>
                    <p className="font-bold mb-6">{error}</p>
                    <button onClick={triggerGeneration} className="px-8 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20">Retry Isolation</button>
                  </div>
                )}

                {!activeNode.deepContent && !isGenerating && !error ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto space-y-10">
                     <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                        <Sliders size={40} />
                     </div>
                     <div className="space-y-6 w-full">
                        <div className="flex justify-between items-center">
                           <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Technical Depth</h3>
                           <span className="text-xl font-black text-indigo-500">{complexity}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={complexity} 
                          onChange={(e) => setComplexity(parseInt(e.target.value))} 
                          className="w-full"
                        />
                     </div>
                     <button 
                       onClick={triggerGeneration}
                       className="w-full py-6 bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                     >
                       Generate Mastery Deep Dive
                     </button>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] space-y-8">
                    <div className="w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-indigo-500 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Architecting High-Signal Content...</p>
                  </div>
                ) : activeNode.deepContent && (
                  <div className="max-w-4xl mx-auto space-y-20 pb-20">
                    <div className="flex items-center justify-between p-2 bg-white/95 dark:bg-black/95 rounded-[2.5rem] border border-gray-100 dark:border-white/10 sticky top-0 z-20 apple-blur shadow-2xl">
                      <button onClick={() => setIsEli7(false)} className={`flex-1 py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${!isEli7 ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}>High-Fidelity</button>
                      <button onClick={() => setIsEli7(true)} className={`flex-1 py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${isEli7 ? 'bg-amber-500 text-white' : 'text-gray-400'}`}>No Fluff</button>
                    </div>

                    {!isEli7 ? (
                      <div className="space-y-24 pt-8">
                        <p className="text-2xl sm:text-4xl font-black dark:text-white leading-[1.1] tracking-tighter border-l-8 border-indigo-500 pl-10 py-4">
                          {activeNode.deepContent.executiveSummary}
                        </p>
                        {activeNode.deepContent.playground.type !== 'none' && (
                          <section className="p-10 rounded-[3.5rem] bg-indigo-500 text-white shadow-2xl">
                             <div className="flex flex-col sm:flex-row items-center gap-8">
                                <Terminal size={48} />
                                <div className="flex-1 text-center sm:text-left">
                                   <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Interactive Simulation Ready</h3>
                                   <button onClick={() => onLaunchPlayground(activeNode.id)} className="px-10 py-5 bg-white text-indigo-500 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">Launch Full Page Playground</button>
                                </div>
                             </div>
                          </section>
                        )}
                      </div>
                    ) : (
                      <div className="bg-amber-50 dark:bg-amber-500/5 p-12 rounded-[3.5rem] border-4 border-dashed border-amber-500/20 text-center">
                         <p className="text-2xl sm:text-4xl font-bold text-amber-900/80 dark:text-amber-200/80 italic">"{activeNode.deepContent.eli7}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 sm:p-12 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0 flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => onStartFocus(activeNode.id)} 
                disabled={!activeNode.deepContent}
                className="flex-[2] py-6 bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg flex items-center justify-center gap-4 hover:scale-[1.02] shadow-2xl disabled:opacity-50"
              >
                <Play size={28} fill="currentColor" /> Initialize focus loop
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-black/95 border-2 border-gray-100 dark:border-white/10 px-12 py-7 rounded-[3.5rem] apple-blur shadow-2xl z-50 flex items-center gap-16">
         <button onClick={() => onClear()} className="text-[10px] font-black uppercase text-red-500 tracking-widest">Reset Curriculum</button>
      </div>
    </div>
  );
};

const NodeCard: React.FC<{node: LearningNode, noiseTransparency: number, onOpen: any, isLarge?: boolean}> = ({ node, noiseTransparency, onOpen, isLarge }) => {
  const isNoise = node.type === 'noise';
  const opacity = isNoise ? (noiseTransparency / 100) : 1;

  return (
    <div 
      onClick={() => onOpen(node.id)}
      style={{ opacity: opacity }}
      className={`relative group cursor-pointer bg-white dark:bg-white/5 border-2 p-10 rounded-[3.5rem] w-full transition-all hover:scale-[1.01] shadow-2xl ${node.status === 'mastered' ? 'border-indigo-500' : 'border-gray-100 dark:border-white/10'}`}
    >
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform ${isNoise ? 'bg-gray-400 text-white' : 'bg-indigo-500 text-white'}`}>
         <span className="text-[10px] font-black uppercase opacity-70">Lvl</span>
         <span className="text-2xl font-black leading-none">{node.difficultyLevel}</span>
      </div>
      <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black dark:text-white mb-6 tracking-tighter leading-[1.1] group-hover:text-indigo-500 transition-colors`}>{node.title}</h3>
      <p className="text-lg mb-8 font-medium leading-relaxed italic border-l-4 pl-8 line-clamp-3 text-gray-500 dark:text-gray-400 border-indigo-500">{node.description}</p>
      <div className="flex gap-4">
        <button onClick={(e) => { e.stopPropagation(); onOpen(node.id); }} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl"><Play size={18} fill="currentColor" /> Open Deep Dive</button>
      </div>
    </div>
  );
};

export default RoadmapView;
