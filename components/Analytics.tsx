
import React from 'react';
// Changed Task to LearningNode
import { UserStats, LearningNode } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Zap, Target, TrendingUp } from 'lucide-react';

interface AnalyticsProps {
  stats: UserStats;
  // Changed Task to LearningNode
  tasks: LearningNode[];
}

const Analytics: React.FC<AnalyticsProps> = ({ stats, tasks }) => {
  // Changed stats.history to stats.masteryHistory and mapped to expected chart format
  const chartData = stats.masteryHistory.length > 0 
    ? stats.masteryHistory.map(h => ({ name: h.date, poms: h.count })) 
    : [
        { name: 'Mon', poms: 4, signal: 3 },
        { name: 'Tue', poms: 6, signal: 5 },
        { name: 'Wed', poms: 3, signal: 2 },
        { name: 'Thu', poms: 8, signal: 6 },
        { name: 'Fri', poms: 5, signal: 4 },
        { name: 'Sat', poms: 2, signal: 1 },
        { name: 'Sun', poms: 4, signal: 3 },
      ];

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm"><Target size={28} /></div>
            <h3 className="font-bold text-gray-500 dark:text-gray-400">Distilled Signal</h3>
          </div>
          {/* Changed totalSignalCompleted to totalNodesMastered */}
          <p className="text-5xl font-black text-gray-900 dark:text-white">{stats.totalNodesMastered}</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 font-bold uppercase tracking-tighter">High-impact items closed</p>
        </div>

        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl shadow-sm"><Zap size={28} /></div>
            <h3 className="font-bold text-gray-500 dark:text-gray-400">Focus Streak</h3>
          </div>
          <p className="text-5xl font-black text-gray-900 dark:text-white">{stats.dailyStreak} Days</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 font-bold uppercase tracking-tighter">Chain remains unbroken</p>
        </div>

        <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm"><TrendingUp size={28} /></div>
            <h3 className="font-bold text-gray-500 dark:text-gray-400">Invested Time</h3>
          </div>
          {/* Changed totalPomodoros to totalFocusHours and removed conversion logic as stats.totalFocusHours is already hours */}
          <p className="text-5xl font-black text-gray-900 dark:text-white">{Math.round(stats.totalFocusHours)}h</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-3 font-bold uppercase tracking-tighter">Total deep focus duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm h-[450px]">
          <h3 className="text-xl font-black mb-10 text-gray-800 dark:text-gray-200">Velocity Over Time</h3>
          <ResponsiveContainer width="100%" height="75%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPoms" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f0f0f0"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{
                  borderRadius: '24px', 
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="poms" 
                stroke="#6366f1" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorPoms)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm h-[450px]">
          <h3 className="text-xl font-black mb-10 text-gray-800 dark:text-gray-200">Signal vs Noise Ratio</h3>
          <ResponsiveContainer width="100%" height="75%">
            <BarChart data={tasks.length > 0 ? [
              { name: 'Signal', value: tasks.filter(t => t.type === 'signal').length },
              { name: 'Noise', value: tasks.filter(t => t.type === 'noise').length },
            ] : [{name: 'None', value: 0}]}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12}} dy={10} />
              <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={60}>
                {tasks.length > 0 && [
                  <Cell key="cell-0" fill="#6366f1" />,
                  <Cell key="cell-1" fill={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"} />
                ]}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
