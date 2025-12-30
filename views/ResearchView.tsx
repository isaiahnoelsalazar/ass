
import React, { useState } from 'react';
import { researchQuery } from '../services/geminiService';

const ResearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await researchQuery(query);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert('Search failed. Check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Smart Researcher</h1>
        <p className="text-slate-500">Grounded web search for facts, news, and complex queries.</p>
      </div>

      <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for recent events, facts, or news..."
            className="flex-1 p-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-teal-500 outline-none text-lg"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-10 py-5 bg-teal-600 text-white rounded-3xl font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Search'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-400 font-medium">Scanning the web for answers...</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Verified Insight
            </div>
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap">
              {result.text}
            </div>
          </div>

          <div className="bg-slate-100/50 p-8 rounded-[3rem]">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🔗</span> Sources & Citations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.sources.length > 0 ? (
                result.sources.map((chunk, idx) => (
                  <a
                    key={idx}
                    href={chunk.web?.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group"
                  >
                    <p className="text-sm font-bold text-slate-800 mb-1 group-hover:text-teal-600 line-clamp-1">
                      {chunk.web?.title || 'External Source'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{chunk.web?.uri}</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No direct links available for this summary.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchView;
