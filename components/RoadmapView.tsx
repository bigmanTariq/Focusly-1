
import React, { useState } from 'react';
import { LearningNode, NodeType } from '../types';
import { 
  CheckCircle2, Play, GitBranch, ArrowRight, Target, Search, 
  BookOpen, Layers, Compass, X, Baby, Zap, ShieldAlert,
  ChevronRight, AlertTriangle, Lightbulb, Microscope, BrainCircuit,
  Ban, Trash2, Repeat
} from 'lucide-react';

interface RoadmapViewProps {
  nodes: LearningNode[];
  onCreate: (topic: string) => void;
  onDrillDown: (id: string) => void;
  onToggleMastery: (id: string) => void;
  onStartFocus: (id: string) => void;
  onClear: () => void;
  onFetchContent: (id: string) => Promise<void>;
  onToggleType: (id: string) => void;
  onDelete: (id: string) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ 
  nodes, onCreate, onDrillDown, onToggleMastery, onStartFocus, onClear, onFetchContent, onToggleType, onDelete 
}) => {
  const [input, setInput] = useState('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isEli7, setIsEli7] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeNode = nodes.find(n => n.id === activeNodeId);

  const handleOpenNode = async (id: string) => {
    setActiveNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node && !node.deepContent) {
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
        <h2 className="text-5xl font-black dark:text-white mb-6 tracking-tighter">Focusly <span className="text-indigo-500">Signal Architect</span></h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-lg text-lg font-medium">
          Architect your learning. Filter the noise. Focus on high-signal mastery.
        </p>
        <div className="relative w-full max-w-2xl group">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="Subject (e.g. Statistical Arbitrage, Game Theory)" 
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
      <div className="max-w-5xl mx-auto">
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10 px-4">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></div>
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">Foundational Context</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
             {breadthNodes.map((node) => (
                <NodeCard key={node.id} node={node} onToggleMastery={onToggleMastery} onStartFocus={onStartFocus} onDrillDown={onDrillDown} onOpen={handleOpenNode} onToggleType={onToggleType} onDelete={onDelete} />
             ))}
          </div>
        </section>

        <section className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-20 w-full px-4">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></div>
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">Vertical Expert Spike</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></div>
          </div>
          <div className="w-full max-w-2xl space-y-16 px-4">
            {depthNodes.map((node, idx) => (
              <div key={node.id} className="relative flex flex-col items-center">
                {idx > 0 && (
                   <div className="absolute -top-16 w-1 h-16 bg-gradient-to-b from-indigo-500/10 via-indigo-500 to-indigo-500/10"></div>
                )}
                <NodeCard node={node} onToggleMastery={onToggleMastery} onStartFocus={onStartFocus} onDrillDown={onDrillDown} onOpen={handleOpenNode} onToggleType={onToggleType} onDelete={onDelete} isLarge />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Structured Deep Learning Overlay */}
      {activeNodeId && activeNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 md:p-12 apple-blur bg-black/60 animate-in fade-in duration-300">
          <div className="relative w-full h-full max-w-6xl bg-white dark:bg-apple-cardDark sm:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 flex flex-col">
            <div className="p-8 sm:p-12 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-black/20 shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-3 py-1 text-white text-[10px] font-black rounded-lg uppercase tracking-widest ${activeNode.type === 'signal' ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                    Level {activeNode.difficultyLevel}
                  </span>
                  <span className={`px-3 py-1 text-white text-[10px] font-black rounded-lg uppercase tracking-widest ${activeNode.type === 'signal' ? 'bg-black dark:bg-white dark:text-black' : 'bg-gray-200 text-gray-600'}`}>
                    {activeNode.type === 'signal' ? 'High Signal' : 'Low Signal / Noise'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black dark:text-white tracking-tighter truncate">{activeNode.title}</h2>
              </div>
              <button onClick={() => { setActiveNodeId(null); setIsEli7(false); }} className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-4">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 md:p-16">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-indigo-500 font-black uppercase tracking-widest text-sm mb-2 text-center">Architecting Expert Knowledge...</p>
                </div>
              ) : activeNode.deepContent && (
                <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10">
                    <button onClick={() => setIsEli7(false)} className={`flex-1 py-4 px-6 rounded-[1.8rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!isEli7 ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30' : 'text-gray-400 hover:text-gray-600'}`}>
                      <Zap size={16} /> Technical Mastery
                    </button>
                    <button onClick={() => setIsEli7(true)} className={`flex-1 py-4 px-6 rounded-[1.8rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isEli7 ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' : 'text-gray-400 hover:text-gray-600'}`}>
                      <Baby size={16} /> No Fluff / ELI7
                    </button>
                  </div>

                  {isEli7 ? (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="bg-amber-50 dark:bg-amber-500/10 p-10 rounded-[3rem] border border-amber-200/50 dark:border-amber-500/20">
                        <div className="flex items-center gap-4 mb-8">
                           <Lightbulb className="text-amber-500" size={32} />
                           <h4 className="text-xl font-black uppercase tracking-widest dark:text-amber-200">The Core Analogy</h4>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-900/80 dark:text-amber-200/80 leading-relaxed italic">"{activeNode.deepContent.eli7}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-20 pb-20">
                      <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <span className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Zap size={24} /></span>
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Executive Summary</h3>
                        </div>
                        <p className="text-2xl font-bold dark:text-white leading-relaxed tracking-tight border-l-4 border-indigo-500 pl-8 py-2">{activeNode.deepContent.executiveSummary}</p>
                      </section>
                      <section className="space-y-10">
                        <div className="flex items-center gap-4">
                           <span className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Microscope size={24} /></span>
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Technical Mechanics</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {activeNode.deepContent.technicalMechanics.map((mech, i) => (
                            <div key={i} className="group p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-indigo-500 transition-colors">
                              <p className="font-bold text-gray-700 dark:text-gray-200 leading-snug"><span className="text-indigo-500 mr-3">0{i+1}</span>{mech}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="space-y-10">
                        <div className="flex items-center gap-4">
                           <span className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><ShieldAlert size={24} /></span>
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Minute Details</h3>
                        </div>
                        <div className="space-y-4">
                          {activeNode.deepContent.minuteDetails.map((detail, i) => (
                            <div key={i} className="flex gap-6 items-start p-8 bg-black/5 dark:bg-white/5 rounded-3xl border border-transparent hover:border-amber-500/30 transition-all">
                              <ChevronRight className="text-amber-500 shrink-0 mt-1" size={20} />
                              <p className="font-bold text-lg dark:text-white leading-relaxed">{detail}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 sm:p-12 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0 flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => { onStartFocus(activeNode.id); setActiveNodeId(null); }}
                className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:scale-[1.01] transition-all shadow-xl active:scale-95"
              >
                <Play size={24} fill="currentColor" /> Initialize focus session
              </button>
              <button 
                 onClick={() => onToggleMastery(activeNode.id)}
                 className={`flex-1 py-5 rounded-[1.8rem] border-2 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                   activeNode.status === 'mastered' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-indigo-500 hover:text-indigo-500'
                 }`}
              >
                <CheckCircle2 size={18} />
                {activeNode.status === 'mastered' ? "Mastered" : "Validate Mastery"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-black/95 border-2 border-gray-100 dark:border-white/10 px-10 py-6 rounded-[3rem] apple-blur shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-50 flex items-center gap-12">
         <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-5 h-5 rounded-lg bg-black dark:bg-white shadow-lg"></div>
            <span className="text-[11px] font-black dark:text-white uppercase tracking-widest">Mastery Path</span>
         </div>
         <button onClick={() => onClear()} className="text-[11px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-8 py-3 rounded-full transition-all border-2 border-transparent hover:border-red-500/20">
           Abandon Current Path
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
  onToggleType: (id: string) => void;
  onDelete: (id: string) => void;
  isLarge?: boolean;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onToggleMastery, onStartFocus, onDrillDown, onOpen, onToggleType, onDelete, isLarge }) => {
  const isNoise = node.type === 'noise';

  return (
    <div 
      onClick={() => onOpen(node.id)}
      className={`relative group cursor-pointer bg-white dark:bg-white/5 border-2 p-10 rounded-[3rem] w-full transition-all hover:scale-[1.01] shadow-2xl ${node.status === 'mastered' ? 'border-indigo-500 shadow-indigo-500/10' : 'border-gray-100 dark:border-white/10'} ${isNoise ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}
    >
      <div className={`absolute -top-4 -right-4 w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform ${isNoise ? 'bg-gray-400 text-white' : 'bg-indigo-500 text-white'}`}>
         <span className="text-[10px] font-black uppercase opacity-70">Lvl</span>
         <span className="text-2xl font-black leading-none">{node.difficultyLevel}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl w-fit ${isNoise ? 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
            {isNoise ? 'Noise / Background' : 'High Signal'}
          </span>
          {isNoise && <span className="text-[9px] font-bold text-gray-400 uppercase italic">Non-essential to core mission</span>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleType(node.id); }} 
            className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
            title="Switch Signal/Noise"
          >
            <Repeat size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleMastery(node.id); }} 
            className={`p-2 transition-colors ${node.status === 'mastered' ? 'text-indigo-500' : 'text-gray-200 dark:text-gray-800 hover:text-indigo-400'}`}
          >
            <CheckCircle2 size={32} fill={node.status === 'mastered' ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      
      <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black dark:text-white mb-6 tracking-tighter leading-none group-hover:text-indigo-500 transition-colors ${isNoise ? 'text-gray-400' : ''}`}>{node.title}</h3>
      <p className={`text-lg mb-8 font-medium leading-relaxed italic border-l-2 pl-6 line-clamp-3 ${isNoise ? 'text-gray-400 border-gray-300' : 'text-gray-500 dark:text-gray-400 border-indigo-500/20'}`}>{node.description}</p>

      <div className="flex gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onStartFocus(node.id); }}
          className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-80 transition-all shadow-xl"
        >
          <Play size={16} fill="currentColor" /> Focus
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDrillDown(node.id); }}
          className="p-4 border-2 border-indigo-500 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
        >
          <GitBranch size={20} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default RoadmapView;
