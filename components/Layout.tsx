
import React from 'react';
import { TOOLS } from '../constants';
import { ToolType, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTool: ToolType | 'DASHBOARD';
  onToolSelect: (tool: ToolType | 'DASHBOARD') => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTool, onToolSelect, user, onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <button 
            onClick={() => onToolSelect('DASHBOARD')}
            className="text-xl font-bold text-slate-900 flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100">A</div>
            ASS
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
          <button
            onClick={() => onToolSelect('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTool === 'DASHBOARD' 
                ? 'bg-slate-100 text-indigo-600 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="text-lg">🏠</span>
            Dashboard
          </button>
          
          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Utility Tools</p>
          </div>
          
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTool === tool.id 
                  ? 'bg-slate-100 text-indigo-600 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="truncate">{tool.name}</span>
            </button>
          ))}
        </nav>
        
        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.username}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
              title="Logout"
            >
              <span className="text-sm">🚪</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <button onClick={() => onToolSelect('DASHBOARD')} className="font-bold flex items-center gap-2 text-slate-900">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]">A</div>
            ASS
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <button onClick={onLogout} className="text-sm">🚪</button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
