
import React, { useState } from 'react';
import { analyzeText } from '../services/analyzeText'; // Assuming analyzeText is exported correctly
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

// The actual analyzeText is in geminiService, let me correct the import based on provided files
import { analyzeText as geminiAnalyzeText } from '../services/geminiService';

const TextToolsView: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);

  const tasks = [
    { id: 'SUMMARIZE', name: 'Summarize', icon: '📝', prompt: 'Summarize the following text clearly in bullet points.' },
    { id: 'PROFESSIONAL', name: 'Make Professional', icon: '👔', prompt: 'Rewrite the following text to sound professional and polite for a business environment.' },
    { id: 'KEY_POINTS', name: 'Extract Key Facts', icon: '🔑', prompt: 'Extract the top 5 most important facts or numbers from this text.' },
    { id: 'TRANSLATE', name: 'Translate to Spanish', icon: '🇪🇸', prompt: 'Translate the following text to Spanish perfectly.' },
  ];

  const handleProcess = async (taskPrompt: string, taskId: string, taskName: string) => {
    if (!text.trim() || isLoading) return;
    
    setIsLoading(true);
    setActiveTask(taskId);
    try {
      const res = await geminiAnalyzeText(text, taskPrompt);
      setResult(res || '');
      logActivity(ToolType.TEXT_ANALYSIS, `Processed: ${taskName}`, text.slice(0, 50) + '...');
    } catch (err) {
      console.error(err);
      setResult('Failed to process text. Check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Text Engine</h1>
        <p className="text-slate-500">Fast, smart text processing for summaries, translations, and tone changes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Input Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your long text here..."
              className="w-full h-80 p-6 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm leading-relaxed resize-none"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleProcess(task.prompt, task.id, task.name)}
                  disabled={isLoading || !text.trim()}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTask === task.id && isLoading 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  } disabled:opacity-50`}
                >
                  <span>{task.icon}</span>
                  {task.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Result</label>
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(result);
                   alert('Copied to clipboard!');
                }}
                className="text-xs font-bold text-emerald-600 hover:underline"
                disabled={!result}
              >
                Copy All
              </button>
            </div>
            
            <div className="flex-1 bg-slate-50 rounded-2xl p-6 overflow-y-auto font-mono text-sm leading-relaxed">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p>Processing text...</p>
                </div>
              ) : result ? (
                <p className="whitespace-pre-wrap">{result}</p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <span className="text-6xl mb-4">✨</span>
                  <p>Choose an action to generate results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToolsView;
