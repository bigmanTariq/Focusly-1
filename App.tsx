
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
      description: "Manual task entry",
      type: type,
      difficultyLevel: type === 'signal' ? 50 : 0,
      learningOutcome: "Completion of manual task",
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
    if (!node || node.deepContent) return;

    const result: DeepContent = await generateNodeContent(node.title, topic || "Productivity");
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
           (window as any).confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7'] });
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
           <span className="font-bold tracking-tight dark:text-white uppercase text-xs">Focusly <span className="text-indigo-500">Signal Architect</span></span>
        </div>
        
        {topic && (
          <div className="hidden lg:flex items-center gap-4 bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mission</span>
            <span className="text-xs font-bold dark:text-white truncate max-w-[200px]">{topic}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setHideNoise(!hideNoise)} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${hideNoise ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
          >
            <Ban size={14} /> {hideNoise ? 'Noise Hidden' : 'Showing All'}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-8 w-[1px] bg-gray-100 dark:bg-white/10 mx-1"></div>
          <button className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <User size={20} />
            </div>
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/80 dark:bg-black/80 border-t border-gray-100 dark:border-white/10 flex items-center justify-around px-4 md:flex-col md:w-24 md:h-full md:border-t-0 md:border-r z-50 apple-blur">
        <div className="hidden md:flex flex-col items-center gap-2 mb-12 mt-6">
          <div className="w-14 h-14 rounded-2xl signal-gradient flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-indigo-500/20">F</div>
        </div>
        <button onClick={() => setActiveTab('roadmap')} className={`p-4 rounded-2xl transition-all ${activeTab === 'roadmap' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
          <Layout size={24} />
        </button>
        <button onClick={() => setActiveTab('stats')} className={`p-4 rounded-2xl transition-all ${activeTab === 'stats' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
          <BarChart2 size={24} />
        </button>
        <div className="flex-1"></div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-12">
        {activeTab === 'roadmap' ? (
          <>
            {nodes.length > 0 && (
              <div className="max-w-2xl mx-auto mb-16 space-y-4">
                <form className="relative group/form flex items-center gap-3">
                  <input 
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Capture a new thought..."
                    className="flex-1 bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <button 
                    onClick={(e) => handleAddTask(e, 'signal')}
                    title="Add as Signal"
                    className="p-4 rounded-2xl signal-gradient text-white shadow-lg hover:scale-105 transition-all"
                  >
                    <Zap size={20} fill="currentColor" />
                  </button>
                  <button 
                    onClick={(e) => handleAddTask(e, 'noise')}
                    title="Add as Noise"
                    className="p-4 rounded-2xl bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 shadow-lg hover:scale-105 transition-all"
                  >
                    <Ban size={20} />
                  </button>
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
