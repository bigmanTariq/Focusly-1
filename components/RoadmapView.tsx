
import React, { useState, useEffect } from 'react';
import { LearningNode } from '../types';
import { 
  Sparkles, CheckCircle2, Play, GitBranch, ArrowRight, Target, Search, 
  BookOpen, Layers, Compass, X, Info, Baby, Zap, ShieldAlert 
} from 'lucide-react';

interface RoadmapViewProps {
  nodes: LearningNode[];
  onCreate: (topic: string) => void;
  onDrillDown: (id: string) => void;
  onToggleMastery: (id: string) => void;
  onStartFocus: (id: string) => void;
  onClear: () => void;
  onFetchContent: (id: string) => Promise<void>;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ 
  nodes, onCreate, onDrillDown, onToggleMastery, onStartFocus, onClear, onFetchContent 
}) => {
  const [input, setInput] = useState('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isEli7, setIsEli7] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeNode = nodes.find(n => n.id === activeNodeId);

  const handleOpenNode = async (id: string) => {
    setActiveNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node && !node.content) {
      setIsGenerating(true);
      await onFetchContent(id);
      setIsGenerating(false);
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 animate-pulse shadow-2xl shadow-indigo-500/20 border border-indigo-500/20">
           <Compass size={48} />
        </div>
        <h2 className="text-5xl font-black dark:text-white mb-6 tracking-tighter">Path Architect <span className="text-indigo-500">T-Shape</span></h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-lg text-lg font-medium">
          Enter a domain. We'll architect a T-shaped curriculum: 3 levels of broad foundations feeding into a deep vertical mastery spike.
        </p>
        <div className="relative w-full max-w-2xl group">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="Topic (e.g. Quantitative Modelling, GANs)" 
             className="relative w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 rounded-[2.5rem] py-8 px-10 text-2xl font-bold dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-xl"
             onKeyDown={e => e.key === 'Enter' && onCreate(input)}
           />
           <button 
             onClick={() => onCreate(input)}
             className="absolute right-4 top-4 bottom-4 px-10 rounded-[1.8rem] bg-indigo-500 text-white font-black text-xl flex items-center gap-3 hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-500/40"
           >
             Architect <ArrowRight size={24} />
           </button>
        </div>
      </div>
    );
  }

  const sortedNodes = [...nodes].sort((a, b) => a.difficultyLevel - b.difficultyLevel);
  const breadthNodes = sortedNodes.filter(n => n.difficultyLevel <= 10);
  const depthNodes = sortedNodes.filter(n => n.difficultyLevel > 10);

  return (
    <div className="relative pb-40">
      <div className="max-w-6xl mx-auto mb-20 text-center">
         <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-6">
            <Layers size={18} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Pedagogical Structure: T-Shaped Growth</span>
         </div>
         <h2 className="text-4xl font-black dark:text-white tracking-tighter">Breadth & Depth Architecture</h2>
      </div>

      <div className="max-w-5xl mx-auto">
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10 px-4">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></div>
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">Horizontal Breadth (Lvl 0-10)</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
             {breadthNodes.map((node) => (
                <NodeCard key={node.id} node={node} onToggleMastery={onToggleMastery} onStartFocus={onStartFocus} onDrillDown={onDrillDown} onOpen={handleOpenNode} />
             ))}
          </div>
        </section>

        <section className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-20 w-full px-4">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></div>
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">Vertical Spike (Lvl 11-100)</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></div>
          </div>
          <div className="w-full max-w-2xl space-y-24 px-4">
            {depthNodes.map((node, idx) => (
              <div key={node.id} className="relative flex flex-col items-center">
                {idx > 0 && (
                   <div className="absolute -top-24 w-1 h-24 bg-gradient-to-b from-indigo-500/10 via-indigo-500 to-indigo-500/10"></div>
                )}
                <NodeCard node={node} onToggleMastery={onToggleMastery} onStartFocus={onStartFocus} onDrillDown={onDrillDown} onOpen={handleOpenNode} isLarge />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Deep Learning Overlay / Modal */}
      {activeNodeId && activeNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 apple-blur bg-black/40 animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-4xl bg-white dark:bg-apple-cardDark rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20">
            {/* Header */}
            <div className="p-8 sm:p-12 border-b border-gray-100 dark:border-white/5 flex justify-between items-start bg-gray-50/50 dark:bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Level {activeNode.difficultyLevel}</span>
                  <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black rounded-full uppercase tracking-widest">{activeNode.type}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black dark:text-white tracking-tighter leading-none">{activeNode.title}</h2>
              </div>
              <button 
                onClick={() => { setActiveNodeId(null); setIsEli7(false); }}
                className="p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 sm:p-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Architecting Deep Knowledge...</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isEli7 ? <Baby className="text-amber-500" size={24} /> : <Zap className="text-indigo-500" size={24} />}
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">
                        {isEli7 ? "ELI7: The No-Fluff Analogy" : "Wharton Deep-Dive Analysis"}
                      </h4>
                    </div>
                    
                    <button 
                      onClick={() => setIsEli7(!isEli7)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        isEli7 
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105' 
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-indigo-500 hover:text-white'
                      }`}
                    >
                      {isEli7 ? <Zap size={14} /> : <Baby size={14} />}
                      {isEli7 ? "Switch to Pro" : "Explain to a 7yr Old"}
                    </button>
                  </div>

                  <div className={`text-lg sm:text-xl leading-relaxed font-medium transition-all duration-300 ${isEli7 ? 'text-amber-900/80 dark:text-amber-100/80' : 'text-gray-700 dark:text-gray-200'}`}>
                    {isEli7 ? activeNode.eli7Content : activeNode.content}
                  </div>

                  <div className="pt-8 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Target size={12} /> Key Learning Outcome
                      </h5>
                      <p className="font-bold dark:text-white">{activeNode.learningOutcome}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <BookOpen size={12} /> Masterclass Sources
                      </h5>
                      <ul className="space-y-1">
                        {activeNode.resources.map((r, i) => (
                          <li key={i} className="text-xs font-bold text-indigo-500">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
              <button 
                onClick={() => { onStartFocus(activeNode.id); setActiveNodeId(null); }}
                className="flex-1 py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <Play size={20} fill="currentColor" /> Initialize deep focus
              </button>
              <button 
                 onClick={() => onToggleMastery(activeNode.id)}
                 className={`px-10 py-5 rounded-3xl border-2 font-black uppercase tracking-widest text-xs transition-all ${
                   activeNode.status === 'mastered' 
                   ? 'bg-green-500 border-green-500 text-white' 
                   : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-indigo-500 hover:text-indigo-500'
                 }`}
              >
                {activeNode.status === 'mastered' ? "Mastered" : "Mark as Mastered"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-black/95 border-2 border-gray-100 dark:border-white/10 px-10 py-6 rounded-[3rem] apple-blur shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-50 flex items-center gap-12">
         <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-5 h-5 rounded-lg bg-black dark:bg-white shadow-lg"></div>
            <span className="text-[11px] font-black dark:text-white uppercase tracking-widest">Spine</span>
         </div>
         <button 
           onClick={() => onClear()} 
           className="text-[11px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-8 py-3 rounded-full transition-all border-2 border-transparent hover:border-red-500/20"
         >
           Reset Path
         </button>
      </div>
    </div>
  );
};

interface NodeCardProps {
  node: LearningNode;
  onToggleMastery: (id: string) => void;
  onStartFocus: (id: string) => void;
  onDrillDown: (id: string) => void;
  onOpen: (id: string) => void;
  isLarge?: boolean;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onToggleMastery, onStartFocus, onDrillDown, onOpen, isLarge }) => {
  return (
    <div 
      onClick={() => onOpen(node.id)}
      className={`relative group cursor-pointer bg-white dark:bg-white/5 border-2 p-8 rounded-[2.5rem] w-full transition-all hover:scale-[1.01] shadow-2xl ${node.status === 'mastered' ? 'border-indigo-500 shadow-indigo-500/10' : 'border-gray-100 dark:border-white/10'}`}
    >
      <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-indigo-500 text-white flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
         <span className="text-[8px] font-black uppercase opacity-70">Lvl</span>
         <span className="text-lg font-black leading-none">{node.difficultyLevel}</span>
      </div>

      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg">
          {node.type === 'signal' ? 'Core Signal' : 'Deep Dive'}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleMastery(node.id); }} 
          className={`p-2 transition-colors ${node.status === 'mastered' ? 'text-indigo-500' : 'text-gray-200 dark:text-gray-800 hover:text-indigo-400'}`}
        >
          <CheckCircle2 size={24} fill={node.status === 'mastered' ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-black dark:text-white mb-4 tracking-tighter leading-tight group-hover:text-indigo-500 transition-colors`}>{node.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed italic line-clamp-2">{node.description}</p>

      <div className="flex items-start gap-2 mb-6 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
         <Zap size={14} className="text-indigo-500 shrink-0 mt-0.5" />
         <p className="text-[11px] font-bold dark:text-gray-300 leading-tight">Click to initiate Deep Learning</p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); onStartFocus(node.id); }}
          className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-all"
        >
          <Play size={14} fill="currentColor" /> Focus
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDrillDown(node.id); }}
          className="p-3 border-2 border-indigo-500 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
        >
          <GitBranch size={16} />
        </button>
      </div>
    </div>
  );
};

export default RoadmapView;
