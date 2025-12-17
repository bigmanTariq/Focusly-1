
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LearningNode, TimerState, UserStats, NodeType } from './types';
import { WORK_TIME, SHORT_BREAK } from './constants';
import { generateRoadmap, generateNodeContent } from './geminiService';
import RoadmapView from './components/RoadmapView';
import Analytics from './components/Analytics';
import Timer from './components/Timer';
import FocusMode from './components/FocusMode';
import { Layout, BarChart2, Moon, Sun, User, Network } from 'lucide-react';

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

  const handleFetchNodeContent = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.content) return;

    const result = await generateNodeContent(node.title, topic);
    setNodes(prev => prev.map(n => n.id === nodeId ? { 
      ...n, 
      content: result.content, 
      eli7Content: result.eli7Content 
    } : n));
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
           <span className="font-bold tracking-tight dark:text-white uppercase text-xs">Path Architect <span className="text-indigo-500">T-Shape</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-8 w-[1px] bg-gray-100 dark:bg-white/10 mx-1"></div>
          <button className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold dark:text-white">Lead Architect</p>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Growth Tier 5</p>
            </div>
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
          <RoadmapView 
            nodes={nodes} 
            onCreate={handleCreateInitialRoadmap} 
            onDrillDown={handleDrillDown}
            onToggleMastery={toggleNodeMastery}
            onStartFocus={startFocus}
            onClear={() => { setNodes([]); setTopic(''); }}
            onFetchContent={handleFetchNodeContent}
          />
        ) : (
          <Analytics stats={stats} tasks={nodes} />
        )}
      </main>
    </div>
  );
};

export default App;
