
import React, { useState, useEffect } from 'react';
import { TOOLS } from '../constants';
import { ToolType } from '../types';
import { getActivities, Activity, getToolInfo, clearActivities } from '../services/activityService';

interface DashboardProps {
  onToolSelect: (tool: ToolType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onToolSelect }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const loadActivities = () => {
    setActivities(getActivities());
  };

  useEffect(() => {
    loadActivities();
    window.addEventListener('activity_updated', loadActivities);
    return () => window.removeEventListener('activity_updated', loadActivities);
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-lg">What would you like to build or automate today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
              {tool.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{tool.name}</h3>
            <p className="text-slate-500 leading-relaxed mb-4 text-sm">{tool.description}</p>
            <div className="flex items-center text-indigo-600 font-semibold gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Launch Tool <span>→</span>
            </div>
          </button>
        ))}
        
        {/* Placeholder for future tools */}
        <div className="bg-slate-100 border-2 border-dashed border-slate-200 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-2 text-slate-400">⊕</div>
          <p className="font-semibold text-slate-500">More Tools Coming Soon</p>
          <p className="text-xs text-slate-400 px-8">We are building specialized tools for productivity.</p>
        </div>
      </div>

      <section className="mt-16 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          {activities.length > 0 && (
            <button 
              onClick={clearActivities}
              className="text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl opacity-50">📂</span>
            </div>
            <p className="text-slate-500 font-medium">No recent activity found.</p>
            <p className="text-slate-400 text-sm mt-1">Start using a tool to see your history here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity) => {
              const info = getToolInfo(activity.toolId);
              return (
                <div 
                  key={activity.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-indigo-100 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{activity.title}</h4>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button 
                      onClick={() => activity.toolId !== 'SYSTEM' && onToolSelect(activity.toolId as ToolType)}
                      className="text-indigo-500 text-sm font-bold"
                    >
                      ↗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
