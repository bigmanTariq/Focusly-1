
import React, { useState, useEffect } from 'react';
import { LearningNode, TimerState, UserStats, NodeType, DeepContent } from './types';
import { WORK_TIME } from './constants';
import { generateRoadmap, generateNodeContent } from './geminiService';
import RoadmapView from './components/RoadmapView';
import Analytics from './components/Analytics';
import FocusMode from './components/FocusMode';
import { Layout, BarChart2, Moon, Sun, User, Network, Plus, Zap, Ban } from 'lucide-react';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<LearningNode[]>(() => {
    const saved = localStorage.getItem('focusly_nodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [timer, setTimer] = useState<TimerState>({
    status: 'idle',
    timeLeft: WORK_TIME,
    activeNodeId: null,
    duration: WORK_TIME,
    totalSessions: 0,
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('focusly_stats');
    return saved ? JSON.parse(saved) : {
      dailyStreak: 0,
      totalNodesMastered: 0,
      totalFocusHours: 0,
      masteryHistory: [],
    };
  });

  const [activeTab, setActiveTab] = useState<'roadmap' | 'stats'>('roadmap');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('focusly_theme') === 'dark' || 
           (!localStorage.getItem('focusly_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [topic, setTopic] = useState<string>(() => localStorage.getItem('focusly_topic') || '');
  const [hideNoise, setHideNoise] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('focusly_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('focusly_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('focusly_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('focusly_topic', topic);
  }, [topic]);

  const handleCreateInitialRoadmap = async (inputTopic: string) => {
    setTopic(inputTopic);
    const suggested = await generateRoadmap(inputTopic, 0);
    const newNodes: LearningNode[] = suggested.map((n: any, i: number) => ({
      id: crypto.randomUUID(),
      parentId: null,
      title: n.title,
      description: n.description,
      type: n.type as NodeType,
      difficultyLevel: n.difficulty_level,
      learningOutcome: n.learning_outcome,
      searchQueries: n.search_queries || [],
      resources: n.resources || [],
      status: i === 0 ? 'available' : 'locked',
      depth: 0,
      pomodorosSpent: 0,
      childrenIds: [],
      createdAt: Date.now(),
    }));
    setNodes(newNodes);
  };

  const handleAddTask = (e: React.FormEvent, type: NodeType) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newNode: LearningNode = {
      id: crypto.randomUUID(),
      parentId: null,
      title: newTaskTitle,
      description: "Manual expert capture",
      type: type,
      difficultyLevel: type === 'signal' ? 50 : 0,
      learningOutcome: "Manual objective completion",
      searchQueries: [],
      resources: [],
      status: 'available',
      depth: 0,
      pomodorosSpent: 0,
      childrenIds: [],
      createdAt: Date.now(),
    };
    setNodes(prev => [newNode, ...prev]);
    setNewTaskTitle('');
  };

  const handleFetchNodeContent = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    // Check if content already exists to save AI credits
    if (!node || node.deepContent) return;

    const result: DeepContent = await generateNodeContent(node.title, topic || "Expert Mastery");
    if (result) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { 
        ...n, 
        deepContent: result
      } : n));
    }
  };

  const toggleNodeType = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, type: n.type === 'signal' ? 'noise' : 'signal' } : n));
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleDrillDown = async (parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const suggested = await generateRoadmap(parentNode.title, parentNode.depth + 1);
    const newSubNodes: LearningNode[] = suggested.map((n: any) => ({
      id: crypto.randomUUID(),
      parentId: parentId,
      title: n.title,
      description: n.description,
      type: n.type as NodeType,
      difficultyLevel: n.difficulty_level,
      learningOutcome: n.learning_outcome,
      searchQueries: n.search_queries || [],
      resources: n.resources || [],
      status: 'available',
      depth: parentNode.depth + 1,
      pomodorosSpent: 0,
      childrenIds: [],
      createdAt: Date.now(),
    }));

    setNodes(prev => {
      const updatedParent = { ...parentNode, childrenIds: [...parentNode.childrenIds, ...newSubNodes.map(sn => sn.id)] };
      return [...prev.filter(n => n.id !== parentId), updatedParent, ...newSubNodes];
    });
  };

  const toggleNodeMastery = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const newStatus = n.status === 'mastered' ? 'available' : 'mastered';
        if (newStatus === 'mastered') {
           (window as any).confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#10b981'] });
           setStats(prevStats => ({
             ...prevStats,
             totalNodesMastered: prevStats.totalNodesMastered + 1,
           }));
        }
        return { ...n, status: newStatus };
      }
      return n;
    }));
  };

  const startFocus = (id: string) => {
    setTimer(prev => ({ ...prev, activeNodeId: id, status: 'working', timeLeft: WORK_TIME }));
  };

  if (timer.status === 'working' && timer.activeNodeId) {
    return (
      <FocusMode 
        timer={timer} 
        task={nodes.find(n => n.id === timer.activeNodeId) || null} 
        onExit={() => setTimer(p => ({ ...p, status: 'idle' }))}
        onToggleTimer={() => setTimer(p => ({ ...p, status: p.status === 'working' ? 'idle' : 'working' }))}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-24 transition-colors duration-300 dark:bg-black bg-[#fbfbfd]">
      <header className="fixed top-0 left-0 md:left-24 right-0 h-16 bg-white/70 dark:bg-black/70 apple-blur z-40 px-8 flex items-center justify-between border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3">
           <Network className="text-indigo-500" size={24} />
           <span className="font-black tracking-tight dark:text-white uppercase text-xs">Path Architect <span className="text-indigo-500">Expert v2</span></span>
        </div>
        
        {topic && (
          <div className="hidden lg:flex items-center gap-4 bg-gray-100 dark:bg-white/5 px-6 py-1.5 rounded-full border border-gray-200 dark:border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mission Vector</span>
            <span className="text-xs font-black dark:text-white truncate max-w-[300px] uppercase tracking-wider text-indigo-500">{topic}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setHideNoise(!hideNoise)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${hideNoise ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'}`}
          >
            <Ban size={14} /> {hideNoise ? 'Signal Only' : 'Signal + Noise'}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <User size={20} />
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/80 dark:bg-black/80 border-t border-gray-100 dark:border-white/10 flex items-center justify-around px-4 md:flex-col md:w-24 md:h-full md:border-t-0 md:border-r z-50 apple-blur">
        <div className="hidden md:flex flex-col items-center gap-2 mb-12 mt-6">
          <div className="w-14 h-14 rounded-3xl signal-gradient flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-500/30">F</div>
        </div>
        <button onClick={() => setActiveTab('roadmap')} className={`p-5 rounded-[1.5rem] transition-all ${activeTab === 'roadmap' ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
          <Layout size={26} />
        </button>
        <button onClick={() => setActiveTab('stats')} className={`p-5 rounded-[1.5rem] transition-all ${activeTab === 'stats' ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
          <BarChart2 size={26} />
        </button>
        <div className="flex-1"></div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-12 animate-in fade-in duration-1000">
        {activeTab === 'roadmap' ? (
          <>
            {nodes.length > 0 && (
              <div className="max-w-3xl mx-auto mb-16 space-y-4">
                <form className="relative group/form flex items-center gap-3">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400">
                    <Plus size={20} />
                  </div>
                  <input 
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Capture expert nuance or tasks..."
                    className="flex-1 bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-[2rem] py-5 pl-14 pr-8 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-xl"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => handleAddTask(e, 'signal')}
                      title="Add as Signal"
                      className="p-5 rounded-[1.5rem] bg-black dark:bg-white text-white dark:text-black shadow-2xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Zap size={22} fill="currentColor" />
                    </button>
                    <button 
                      onClick={(e) => handleAddTask(e, 'noise')}
                      title="Add as Noise"
                      className="p-5 rounded-[1.5rem] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Ban size={22} />
                    </button>
                  </div>
                </form>
              </div>
            )}
            <RoadmapView 
              nodes={hideNoise ? nodes.filter(n => n.type === 'signal') : nodes} 
              onCreate={handleCreateInitialRoadmap} 
              onDrillDown={handleDrillDown}
              onToggleMastery={toggleNodeMastery}
              onStartFocus={startFocus}
              onClear={() => { setNodes([]); setTopic(''); }}
              onFetchContent={handleFetchNodeContent}
              onToggleType={toggleNodeType}
              onDelete={handleDeleteNode}
            />
          </>
        ) : (
          <Analytics stats={stats} tasks={nodes} />
        )}
      </main>
    </div>
  );
};

export default App;
