
import React, { useState, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const SmartNotepadView: React.FC = () => {
  const [content, setContent] = useState(() => {
    return localStorage.getItem('as_service_notepad') || '';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'processing'>('idle');

  // Auto-save logic
  useEffect(() => {
    setStatus('saving');
    const timeout = setTimeout(() => {
      localStorage.setItem('as_service_notepad', content);
      setStatus('idle');
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content]);

  const handleAIAction = async (action: 'polish' | 'expand' | 'summarize' | 'professional') => {
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatus('processing');

    let prompt = "";
    let activityTitle = "";

    switch (action) {
      case 'polish':
        prompt = `Rewrite the following note to improve grammar, flow, and clarity while keeping the original meaning: "${content}"`;
        activityTitle = "Polished Note";
        break;
      case 'expand':
        prompt = `Expand the following thoughts into a well-structured, detailed note with more context and depth: "${content}"`;
        activityTitle = "Expanded Note";
        break;
      case 'summarize':
        prompt = `Provide a very concise summary of the following note: "${content}"`;
        activityTitle = "Summarized Note";
        break;
      case 'professional':
        prompt = `Rewrite the following note in a formal, professional business tone: "${content}"`;
        activityTitle = "Professional Tone Shift";
        break;
    }

    try {
      const result = await chatWithGemini(prompt);
      if (result) {
        if (action === 'summarize') {
          // For summary, maybe we just alert or append it? 
          // Let's prepend it for now as a "Summary Block"
          setContent(prev => `--- SUMMARY ---\n${result}\n\n--- ORIGINAL NOTE ---\n${prev}`);
        } else {
          setContent(result);
        }
        logActivity(ToolType.SMART_NOTEPAD, activityTitle, `Applied AI ${action} to content.`);
      }
    } catch (err) {
      console.error(err);
      alert("AI failed to process the note.");
    } finally {
      setIsProcessing(false);
      setStatus('idle');
    }
  };

  const downloadNote = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `my-note-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    logActivity(ToolType.SMART_NOTEPAD, 'Exported Note', 'Downloaded content as .txt');
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Smart Notepad</h1>
          <p className="text-slate-500">Your AI-powered creative drafting and writing companion.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            {status === 'idle' ? 'Saved' : status === 'saving' ? 'Saving...' : 'AI Processing...'}
          </div>
          <button 
            onClick={downloadNote}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Download .txt"
          >
            📥
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10 min-h-[500px]">
        {/* Editor Area */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts here..."
            className="flex-1 w-full p-10 bg-transparent text-slate-800 text-lg leading-relaxed outline-none resize-none placeholder:text-slate-300 font-medium"
            spellCheck={false}
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-orange-600 font-bold animate-pulse">Gemini is rewriting...</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-4">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">AI Writing Tools</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleAIAction('polish')}
                disabled={isProcessing || !content.trim()}
                className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group text-left disabled:opacity-30"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">✨</span>
                <div>
                  <p className="text-sm font-bold">Fix & Polish</p>
                  <p className="text-[10px] text-slate-500">Grammar & Flow</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleAIAction('expand')}
                disabled={isProcessing || !content.trim()}
                className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group text-left disabled:opacity-30"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">🚀</span>
                <div>
                  <p className="text-sm font-bold">Expand Ideas</p>
                  <p className="text-[10px] text-slate-500">Add context & depth</p>
                </div>
              </button>

              <button 
                onClick={() => handleAIAction('professional')}
                disabled={isProcessing || !content.trim()}
                className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group text-left disabled:opacity-30"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">👔</span>
                <div>
                  <p className="text-sm font-bold">Formal Tone</p>
                  <p className="text-[10px] text-slate-500">Business ready</p>
                </div>
              </button>

              <button 
                onClick={() => handleAIAction('summarize')}
                disabled={isProcessing || !content.trim()}
                className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all group text-left disabled:opacity-30"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">📝</span>
                <div>
                  <p className="text-sm font-bold">Summarize</p>
                  <p className="text-[10px] text-slate-500">Get the core bits</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100">
            <h4 className="font-bold text-orange-800 text-sm mb-2">Note Stats</h4>
            <div className="space-y-2 text-xs text-orange-600/80">
              <div className="flex justify-between">
                <span>Words</span>
                <span className="font-bold">{content.trim() ? content.trim().split(/\s+/).length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters</span>
                <span className="font-bold">{content.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartNotepadView;
