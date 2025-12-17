
import React, { useState } from 'react';
// Changed Task/TaskType to LearningNode/NodeType to match types.ts
import { LearningNode, NodeType } from '../types';
import { Plus, Play, Trash2, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';

interface DashboardProps {
  // Changed Task to LearningNode
  signalTasks: LearningNode[];
  allTasks: LearningNode[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  // Changed TaskType to NodeType
  onAdd: (title: string, type?: NodeType) => void;
  onTypeChange: (id: string, type: NodeType) => void;
  onStartTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  signalTasks, 
  allTasks, 
  onToggle, 
  onDelete, 
  onAdd, 
  onTypeChange,
  onStartTask 
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      setIsClassifying(true);
      await onAdd(newTaskTitle);
      setNewTaskTitle('');
      setIsClassifying(false);
    }
  };

  // Changed task.completed to task.status === 'mastered'
  const completedTasks = allTasks.filter(t => t.status === 'mastered');

  return (
    <div className="space-y-12">
      {/* Top Signal Tasks */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 dark:text-white">
            <Sparkles className="text-indigo-500" size={24} />
            High Signal
          </h2>
          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
            Daily Focus
          </span>
        </div>

        <div className="space-y-5">
          {signalTasks.length > 0 ? (
            signalTasks.map(task => (
              <div 
                key={task.id} 
                className="group relative bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex items-center gap-5 border-l-8 border-l-indigo-500"
              >
                <button 
                  onClick={() => onToggle(task.id)}
                  className="w-10 h-10 rounded-2xl border-2 border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/10 group-hover:scale-105 shadow-sm"
                >
                  <CheckCircle2 className="text-gray-100 dark:text-gray-800 group-hover:text-indigo-300 transition-colors" size={24} />
                </button>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{task.title}</h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="flex -space-x-1">
                      {/* Changed task.pomodoros to task.pomodorosSpent */}
                      {[...Array(Math.min(task.pomodorosSpent, 4))].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white dark:border-apple-dark"></div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                      {task.pomodorosSpent} sessions deep
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onStartTask(task.id)}
                    className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-2 group/btn"
                  >
                    <Play className="group-hover/btn:scale-110 transition-transform" size={20} fill="currentColor" />
                    <span className="text-sm font-black uppercase tracking-tighter hidden sm:inline">Focus</span>
                  </button>
                  <button 
                    onClick={() => onDelete(task.id)}
                    className="p-3 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-indigo-50/20 dark:bg-indigo-500/5 border-4 border-dashed border-indigo-100 dark:border-indigo-500/10 p-12 rounded-[2.5rem] text-center">
              <p className="text-indigo-400 dark:text-indigo-500/60 font-bold text-lg">No active signal. Use the field below to define your mission.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add Task Input */}
      <form onSubmit={handleSubmit} className="relative group/form">
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          disabled={isClassifying}
          placeholder={isClassifying ? "AI is distilling the signal..." : "Distill a new signal..."}
          className="w-full bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-[2rem] py-7 pl-8 pr-20 text-xl font-semibold shadow-lg shadow-gray-200/20 dark:shadow-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:placeholder-gray-600"
        />
        <button 
          type="submit"
          disabled={isClassifying || !newTaskTitle.trim()}
          className={`absolute right-5 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl signal-gradient text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-indigo-500/30 active:scale-95 ${isClassifying ? 'opacity-50' : ''}`}
        >
          {isClassifying ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Plus size={32} />}
        </button>
      </form>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <section className="pt-4">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-3 text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full"
          >
            <ChevronDown size={14} className={`transition-transform duration-300 ${showCompleted ? 'rotate-180' : ''}`} />
            History ({completedTasks.length})
          </button>
          
          {showCompleted && (
            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-gray-50/50 dark:bg-white/[0.02] border border-transparent hover:border-gray-100 dark:hover:border-white/10 group">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-green-500" />
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 line-through font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase">{task.type}</span>
                    <button onClick={() => onDelete(task.id)} className="text-gray-300 dark:text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
