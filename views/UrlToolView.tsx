
import React, { useState } from 'react';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const UrlToolView: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'ENCODE' | 'DECODE'>('ENCODE');

  const rfc3986Encode = (str: string) => {
    // encodeURIComponent misses !, ', (, ), and *
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  };

  const handleProcess = () => {
    if (!input.trim()) return;
    try {
      let result = '';
      if (mode === 'ENCODE') {
        result = rfc3986Encode(input);
        logActivity(ToolType.URL_TOOL, 'URL Encoded', input.slice(0, 30) + '...');
      } else {
        // decodeURIComponent handles %2A etc natively
        result = decodeURIComponent(input);
        logActivity(ToolType.URL_TOOL, 'URL Decoded', input.slice(0, 30) + '...');
      }
      setOutput(result);
    } catch (err) {
      setOutput('Error: Invalid input format for processing. Ensure the string is correctly percent-encoded for decoding.');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert('Result copied to clipboard!');
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">URL Studio</h1>
        <p className="text-slate-500">Fast, reliable character transformation for URLs and web parameters using strict RFC 3986 standards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Input Panel */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input String</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setMode('ENCODE')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'ENCODE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Encode
              </button>
              <button 
                onClick={() => setMode('DECODE')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'DECODE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Decode
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'ENCODE' ? "Paste readable text here (e.g. hello world*)" : "Paste encoded URL here (e.g. hello%20world%2A)"}
            className="w-full h-64 p-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 leading-relaxed font-mono text-sm resize-none"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleProcess}
              disabled={!input.trim()}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{mode === 'ENCODE' ? '🔒' : '🔓'}</span>
              {mode === 'ENCODE' ? 'Encode Text' : 'Decode URL'}
            </button>
            <button
              onClick={clear}
              className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</span>
            {output && (
              <button onClick={handleCopy} className="text-xs font-bold text-blue-600 hover:underline">
                Copy Result
              </button>
            )}
          </div>
          <div className="flex-1 w-full p-6 bg-slate-900 rounded-2xl text-blue-300 font-mono text-sm leading-relaxed overflow-y-auto break-all min-h-[256px]">
            {output || (
              <span className="text-slate-600 italic">Waiting for input transformation...</span>
            )}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Technical Note</h4>
            <p className="text-[11px] text-blue-700 leading-tight">
              {mode === 'ENCODE' 
                ? 'Converts spaces to %20, * to %2A, and other symbols according to RFC 3986 standards.' 
                : 'Restores encoded sequences like %20 and %2A back to readable characters.'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl shrink-0">🔗</div>
          <div>
            <h3 className="text-xl font-bold mb-2">RFC 3986 Percent-Encoding</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              Strict URL encoding ensures that all reserved characters, including "sub-delims" like asterisks (*), exclamation marks (!), and parentheses, are safely escaped. This prevents interpretation errors in complex URL queries and API endpoints.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <span className="text-9xl font-black">URL</span>
        </div>
      </div>
    </div>
  );
};

export default UrlToolView;
