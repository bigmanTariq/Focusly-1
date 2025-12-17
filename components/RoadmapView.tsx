
import React, { useState } from 'react';
import { LearningNode, NodeType } from '../types';
import { 
  CheckCircle2, Play, GitBranch, ArrowRight, Target, Search, 
  BookOpen, Layers, Compass, X, Baby, Zap, ShieldAlert,
  ChevronRight, AlertTriangle, Lightbulb, Microscope, BrainCircuit,
  Ban, Trash2, Repeat, Trophy, Info
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 animate-pulse shadow-2xl shadow-indigo-500/20 border border-indigo-500/20">
           <Compass size={48} />
        </div>
        <h2 className="text-5xl font-black dark:text-white mb-6 tracking-tighter">Path <span className="text-indigo-500">Architect</span></h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-lg text-lg font-medium leading-relaxed">
          Design a high-fidelity mastery path. 3 levels of <b>Horizontal Breadth</b> followed by a deep <b>Vertical Spike</b>.
        </p>
        <div className="relative w-full max-w-2xl group">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="Topic (e.g. Quantitative Trading, LLM Orchestration)" 
             className="relative w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-white/10 rounded-[2.5rem] py-8 px-10 text-2xl font-bold dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-xl"
             onKeyDown={e => e.key === 'Enter' && onCreate(input)}
           />
           <button 
             onClick={() => onCreate(input)}
             className="absolute right-4 top-4 bottom-4 px-10 rounded-[1.8rem] bg-indigo-500 text-white font-black text-xl flex items-center gap-3 hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-500/40"
           >
             Build <ArrowRight size={24} />
           </button>
        </div>
      </div>
    );
  }

  const sortedNodes = [...nodes].sort((a, b) => a.difficultyLevel - b.difficultyLevel);
  const horizontalNodes = sortedNodes.filter(n => n.difficultyLevel <= 10);
  const verticalNodes = sortedNodes.filter(n => n.difficultyLevel > 10);

  return (
    <div className="relative pb-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto mb-16 text-center">
         <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-6">
            <Layers size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">T-Shaped Pedagogical Growth</span>
         </div>
         <h2 className="text-4xl font-black dark:text-white tracking-tighter">Breadth & Depth Spine</h2>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Horizontal Breadth Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10 px-4">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></div>
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">The Horizontal (Breadth)</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
             {horizontalNodes.map((node) => (
                <NodeCard key={node.id} node={node} onToggleMastery={onToggleMastery} onStartFocus={onStartFocus} onDrillDown={onDrillDown} onOpen={handleOpenNode} onToggleType={onToggleType} onDelete={onDelete} />
             ))}
          </div>
        </section>

        {/* Vertical Depth Section */}
        <section className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-16 w-full px-4">
             <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-indigo-500/20"></div>
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">The Vertical (Depth Spike)</h3>
             <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-indigo-500/20"></div>
          </div>
          <div className="w-full max-w-3xl space-y-16 px-4">
            {verticalNodes.map((node, idx) => (
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 md:p-12 apple-blur bg-black/70 animate-in fade-in duration-300">
          <div className="relative w-full h-full max-w-6xl bg-white dark:bg-apple-cardDark sm:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-8 sm:p-12 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-black/20 shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-3 py-1 text-white text-[10px] font-black rounded-lg uppercase tracking-widest ${activeNode.difficultyLevel === 100 ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
                    Level {activeNode.difficultyLevel}
                  </span>
                  <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black rounded-lg uppercase tracking-widest">
                    {activeNode.difficultyLevel > 10 ? 'Depth Mastery' : 'Breadth Foundation'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-6xl font-black dark:text-white tracking-tighter truncate leading-none">{activeNode.title}</h2>
              </div>
              <button onClick={() => { setActiveNodeId(null); setIsEli7(false); }} className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all hover:scale-110 ml-4">
                <X size={32} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 md:p-16">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8 py-20">
                  <div className="w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="text-center space-y-2">
                    <p className="text-indigo-500 font-black uppercase tracking-[0.3em] text-sm">Synthesizing Domain Knowledge</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Consulting pedagogical frameworks & minute nuances...</p>
                  </div>
                </div>
              ) : activeNode.deepContent && (
                <div className="max-w-4xl mx-auto space-y-20 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  
                  {/* Mode Selector */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 sticky top-0 z-10 apple-blur shadow-xl">
                    <button 
                      onClick={() => setIsEli7(false)} 
                      className={`flex-1 py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${!isEli7 ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Zap size={18} /> High-Fidelity expert training
                    </button>
                    <button 
                      onClick={() => setIsEli7(true)} 
                      className={`flex-1 py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${isEli7 ? 'bg-amber-500 text-white shadow-2xl shadow-amber-500/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Baby size={18} /> No Fluff / Simplified
                    </button>
                  </div>

                  {isEli7 ? (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="bg-amber-50 dark:bg-amber-500/5 p-12 rounded-[3.5rem] border-4 border-dashed border-amber-500/20 text-center">
                         <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500">
                           <Lightbulb size={40} />
                         </div>
                         <h4 className="text-xl font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-6">The No-Fluff Core</h4>
                         <p className="text-2xl sm:text-4xl font-bold text-amber-900/80 dark:text-amber-200/80 leading-tight italic">
                           "{activeNode.deepContent.eli7}"
                         </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-24">
                      {/* Executive Summary */}
                      <section className="space-y-10">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-sm"><Zap size={28} /></div>
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Theoretical Grounding</h3>
                        </div>
                        <p className="text-2xl sm:text-4xl font-black dark:text-white leading-[1.1] tracking-tighter border-l-8 border-indigo-500 pl-10 py-4">
                          {activeNode.deepContent.executiveSummary}
                        </p>
                      </section>

                      {/* Technical Mechanics */}
                      <section className="space-y-12">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-sm"><Microscope size={28} /></div>
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Vertical Mechanics</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {activeNode.deepContent.technicalMechanics.map((mech, i) => (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-indigo-500 transition-all group">
                              <span className="inline-block px-4 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded-full mb-4 uppercase">Protocol {i+1}</span>
                              <p className="font-bold text-xl text-gray-800 dark:text-gray-100 leading-snug group-hover:translate-x-1 transition-transform">{mech}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Minute Details */}
                      <section className="space-y-12">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-sm"><ShieldAlert size={28} /></div>
                           <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Expert Nuances</h3>
                        </div>
                        <div className="space-y-6">
                          {activeNode.deepContent.minuteDetails.map((detail, i) => (
                            <div key={i} className="flex gap-8 items-start p-10 bg-black/[0.03] dark:bg-white/[0.03] rounded-[3rem] border border-transparent hover:border-amber-500/30 transition-all shadow-sm">
                              <ChevronRight className="text-amber-500 shrink-0 mt-1" size={24} />
                              <p className="font-bold text-xl dark:text-white leading-relaxed">{detail}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Mental Model & Pitfalls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           <div className="flex items-center gap-4">
                              <BrainCircuit className="text-indigo-500" size={24} />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Master Cognitive Model</h4>
                           </div>
                           <div className="p-10 bg-indigo-500 text-white rounded-[3rem] shadow-2xl shadow-indigo-500/30">
                              <p className="text-2xl font-black leading-tight italic">"{activeNode.deepContent.expertMentalModel}"</p>
                           </div>
                        </div>
                        <div className="space-y-8">
                           <div className="flex items-center gap-4">
                              <AlertTriangle className="text-red-500" size={24} />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">High-Risk Failures</h4>
                           </div>
                           <div className="space-y-4">
                              {activeNode.deepContent.commonPitfalls.map((pit, i) => (
                                <div key={i} className="flex gap-4 items-center p-5 bg-red-500/10 rounded-3xl border border-red-500/20 text-xs font-black text-red-500 uppercase tracking-widest">
                                   <X size={16} /> {pit}
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-10 sm:p-12 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0 flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => { onStartFocus(activeNode.id); setActiveNodeId(null); }}
                className="flex-[2] py-6 bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
              >
                <Play size={28} fill="currentColor" /> Initialize focus loop
              </button>
              <button 
                 onClick={() => { onToggleMastery(activeNode.id); if (activeNode.status !== 'mastered') setActiveNodeId(null); }}
                 className={`flex-1 py-6 rounded-[2.5rem] border-4 font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${
                   activeNode.status === 'mastered' ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xl shadow-emerald-500/30' : 'border-gray-100 dark:border-white/10 text-gray-400 hover:border-indigo-500 hover:text-indigo-500'
                 }`}
              >
                <Trophy size={20} />
                {activeNode.status === 'mastered' ? "Mastered" : "Validate Completion"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Navigation */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-black/95 border-2 border-gray-100 dark:border-white/10 px-12 py-7 rounded-[3.5rem] apple-blur shadow-[0_30px_70px_rgba(0,0,0,0.5)] z-50 flex items-center gap-16 transition-all hover:scale-[1.02]">
         <div className="flex items-center gap-5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-6 h-6 rounded-lg bg-indigo-500 shadow-lg group-hover:rotate-45 transition-transform"></div>
            <span className="text-xs font-black dark:text-white uppercase tracking-[0.3em]">Mastery Spine</span>
         </div>
         <button onClick={() => onClear()} className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-8 py-3 rounded-full transition-all border-2 border-transparent hover:border-red-500/20 tracking-widest">
           Reset Curriculum
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
      className={`relative group cursor-pointer bg-white dark:bg-white/5 border-2 p-10 rounded-[3.5rem] w-full transition-all hover:scale-[1.01] shadow-2xl ${node.status === 'mastered' ? 'border-indigo-500 shadow-indigo-500/10' : 'border-gray-100 dark:border-white/10'} ${isNoise ? 'opacity-40 grayscale-[0.8] hover:opacity-100 hover:grayscale-0' : 'opacity-100'}`}
    >
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform ${isNoise ? 'bg-gray-400 text-white' : 'bg-indigo-500 text-white'}`}>
         <span className="text-[10px] font-black uppercase opacity-70">Lvl</span>
         <span className="text-2xl font-black leading-none">{node.difficultyLevel}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl w-fit ${isNoise ? 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
            {isNoise ? 'Noise Distraction' : node.difficultyLevel > 10 ? 'Vertical Deep' : 'Breadth Foundation'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleType(node.id); }} 
            className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-indigo-500 transition-colors"
            title="Toggle Signal/Noise"
          >
            <Repeat size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleMastery(node.id); }} 
            className={`p-3 transition-all ${node.status === 'mastered' ? 'text-indigo-500' : 'text-gray-200 dark:text-gray-800 hover:text-indigo-400'}`}
          >
            <CheckCircle2 size={36} fill={node.status === 'mastered' ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      
      <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black dark:text-white mb-6 tracking-tighter leading-[1.1] group-hover:text-indigo-500 transition-colors ${isNoise ? 'text-gray-400' : ''}`}>{node.title}</h3>
      <p className={`text-lg mb-8 font-medium leading-relaxed italic border-l-4 pl-8 line-clamp-3 ${isNoise ? 'text-gray-400 border-gray-300' : 'text-gray-500 dark:text-gray-400 border-indigo-500'}`}>{node.description}</p>

      <div className="flex gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); onStartFocus(node.id); }}
          className="flex-1 bg-black dark:bg-white text-white dark:text-black py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:opacity-80 active:scale-95 transition-all shadow-xl"
        >
          <Play size={18} fill="currentColor" /> Focus
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDrillDown(node.id); }}
          className="p-5 border-2 border-indigo-500 text-indigo-500 rounded-[1.8rem] hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
        >
          <GitBranch size={22} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          className="p-5 rounded-[1.8rem] bg-red-50 dark:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <Trash2 size={22} />
        </button>
      </div>
    </div>
  );
};

export default RoadmapView;
