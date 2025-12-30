
import React from 'react';
import { TOOLS } from '../constants';
import { ToolType } from '../types';

interface DashboardProps {
  onToolSelect: (tool: ToolType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onToolSelect }) => {
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
            <p className="text-slate-500 leading-relaxed mb-4">{tool.description}</p>
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

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl opacity-50">📂</span>
          </div>
          <p className="text-slate-500">No recent activity found. Start using a tool to see your history.</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
