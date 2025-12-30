
import React from 'react';
import { TOOLS } from '../constants';
import { ToolType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTool: ToolType | 'DASHBOARD';
  onToolSelect: (tool: ToolType | 'DASHBOARD') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTool, onToolSelect }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <button 
            onClick={() => onToolSelect('DASHBOARD')}
            className="text-xl font-bold text-slate-900 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">A</div>
            ASS
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => onToolSelect('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTool === 'DASHBOARD' 
                ? 'bg-slate-100 text-indigo-600 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>🏠</span>
            Dashboard
          </button>
          
          <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tools</p>
          </div>
          
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTool === tool.id 
                  ? 'bg-slate-100 text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{tool.icon}</span>
              {tool.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <button onClick={() => onToolSelect('DASHBOARD')} className="font-bold">ASS</button>
          <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
