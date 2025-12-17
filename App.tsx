
import React, { useState, useEffect, useCallback } from 'react';
import { LearningNode, TimerState, UserStats, NodeType, DeepContent } from './types';
import { WORK_TIME } from './constants';
import { generateRoadmap, generateNodeContent } from './geminiService';
import RoadmapView from './components/RoadmapView';
import Analytics from './components/Analytics';
import FocusMode from './components/FocusMode';
import Playground from './components/Playground';
import { Layout, BarChart2, Moon, Sun, User, Network, Plus, Zap, Ban, Sliders } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'roadmap' | 'stats' | 'playground'>('roadmap');
  const [activePlaygroundData, setActivePlaygroundData] = useState<{
    type: any,
    initialData: string,
    prompt: string,
    nodeId: string
  } | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('focusly_theme') === 'dark' || 
           (!localStorage.getItem('focusly_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [topic, setTopic] = useState<string>(() => localStorage.getItem('focusly_topic') || '');
  const [noiseTransparency, setNoiseTransparency] = useState(100);
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

  // Timer Tick Logic
  useEffect(() => {
    let interval: number | undefined;
    if (timer.status === 'working' && timer.timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.status === 'working' && timer.timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [timer.status, timer.timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      status: 'completed',
      totalSessions: prev.totalSessions + 1
    }));

    if (timer.activeNodeId) {
      setNodes(prev => prev.map(n => 
        n.id === timer.activeNodeId 
          ? { ...n, pomodorosSpent: n.pomodorosSpent + 1 } 
          : n
      ));

      setStats(prev => ({
        ...prev,
        totalFocusHours: prev.totalFocusHours + (WORK_TIME / 3600),
      }));
    }
  }, [timer.activeNodeId]);

  const handleCreateInitialRoadmap = async (inputTopic: string) => {
    const suggested = await generateRoadmap(inputTopic, 0);
    if (!suggested || suggested.length === 0) return;

    setTopic(inputTopic);
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

  const handleFetchNodeContent = async (nodeId: string, complexity: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const result: DeepContent = await generateNodeContent(node.title, topic || "Expert Mastery", complexity);
    if (result) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { 
        ...n, 
        deepContent: result
      } : n));
    }
  };

  const startFocus = (id: string) => {
    setTimer(prev => ({ ...prev, activeNodeId: id, status: 'working', timeLeft: WORK_TIME }));
  };

  const launchPlayground = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.deepContent) {
      setActivePlaygroundData({
        type: node.deepContent.playground.type,
        initialData: node.deepContent.playground.initialData,
        prompt: node.deepContent.playground.prompt,
        nodeId: nodeId
      });
      setActiveTab('playground');
    }
  };

  if ((timer.status === 'working' || timer.status === 'completed') && timer.activeNodeId) {
    return (
      <FocusMode 
        timer={timer} 
        task={nodes.find(n => n.id === timer.activeNodeId) || null} 
        onExit={() => setTimer(p => ({ ...p, status: 'idle', timeLeft: WORK_TIME, activeNodeId: null }))}
        onToggleTimer={() => setTimer(p => ({ ...p, status: p.status === 'working' ? 'idle' : 'working' }))}
      />
    );
  }

  if (activeTab === 'playground' && activePlaygroundData) {
    return (
      <Playground 
        type={activePlaygroundData.type}
        initialData={activePlaygroundData.initialData}
        prompt={activePlaygroundData.prompt}
        onClose={() => setActiveTab('roadmap')}
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
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 bg-gray-100 dark:bg-white/5 px-6 py-2 rounded-full border border-gray-200 dark:border-white/10">
             <Sliders size={14} className="text-gray-400" />
             <span className="text-[10px] font-black uppercase text-gray-400 whitespace-nowrap">Noise Suppression</span>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={noiseTransparency} 
               onChange={(e) => setNoiseTransparency(parseInt(e.target.value))} 
               className="w-24 h-1.5"
             />
             <span className="text-[10px] font-black text-indigo-500 w-8">{100 - noiseTransparency}%</span>
          </div>

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

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-12">
        {activeTab === 'roadmap' ? (
          <RoadmapView 
            nodes={nodes} 
            noiseTransparency={noiseTransparency}
            onCreate={handleCreateInitialRoadmap} 
            onDrillDown={() => {}} 
            onToggleMastery={() => {}}
            onStartFocus={startFocus}
            onClear={() => { setNodes([]); setTopic(''); }}
            onFetchContent={handleFetchNodeContent}
            onToggleType={() => {}}
            onDelete={() => {}}
            onLaunchPlayground={launchPlayground}
          />
        ) : (
          <Analytics stats={stats} tasks={nodes} />
        )}
      </main>
    </div>
  );
};

export default App;
