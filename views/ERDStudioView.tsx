
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';
import mermaid from 'mermaid';

const ERDStudioView: React.FC = () => {
  const [mermaidCode, setMermaidCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'svg' | 'png' | 'jpg'>('png');
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const diagramRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'neutral',
      securityLevel: 'loose',
      er: {
        useMaxWidth: true
      }
    });
    
    const loadPy = async () => {
      try {
        // @ts-ignore
        const py = await window.loadPyodide();
        setPyodide(py);
      } catch (err) {
        console.error("Failed to load Pyodide:", err);
      }
    };
    loadPy();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || !mermaidCode) return;
      try {
        setError(null);
        diagramRef.current.innerHTML = ''; 
        const { svg } = await mermaid.render('erd-canvas', mermaidCode);
        diagramRef.current.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError('Syntax Error: The generated diagram code is invalid.');
      }
    };
    renderDiagram();
  }, [mermaidCode]);

  const handleGenerate = async (rawSchema: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following SQL schema into a Mermaid erDiagram. 
Return ONLY the code block starting with 'erDiagram'. 
Identify relationships by foreign keys.

Schema:
"${rawSchema}"`,
        config: {
          temperature: 0.1
        }
      });

      const cleanedCode = response.text?.replace(/```mermaid/g, '').replace(/```/g, '').trim();
      if (cleanedCode) {
        setMermaidCode(cleanedCode);
        logActivity(ToolType.ERD_STUDIO, 'Generated ERD', `Diagram visualized for ${fileName}`);
      }
    } catch (err) {
      console.error(err);
      setError('AI failed to process schema.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pyodide) return;

    setFileName(file.name);
    setIsDbLoading(true);
    setError(null);
    
    try {
      const buffer = await file.arrayBuffer();
      const uint8View = new Uint8Array(buffer);
      pyodide.FS.writeFile('/input.db', uint8View);
      
      await pyodide.loadPackage("sqlite3");

      const pythonScript = `
import sqlite3
import os

result = ""
try:
    conn = sqlite3.connect('/input.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    result = "\\n".join([t[0] for t in tables if t[0]])
    conn.close()
except Exception as e:
    result = f"ERROR: {str(e)}"

result
      `;
      
      const schema = await pyodide.runPythonAsync(pythonScript);
      if (schema.startsWith("ERROR:")) throw new Error(schema);
      if (!schema.trim()) throw new Error("Empty database.");

      handleGenerate(schema);
    } catch (err: any) {
      setError(err.message || "Parse failed.");
    } finally {
      setIsDbLoading(false);
    }
  };

  const exportAs = async (format: 'svg' | 'png' | 'jpg') => {
    if (!diagramRef.current) return;
    const svgElement = diagramRef.current.querySelector('svg');
    if (!svgElement) return;

    // Create a clone to modify without affecting UI
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Ensure dimensions are set for rasterization
    const bbox = svgElement.getBBox();
    const width = bbox.width + 40; // add padding
    const height = bbox.height + 40;
    
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    if (format === 'svg') {
      const link = document.createElement('a');
      link.href = url;
      link.download = `erd-${fileName || 'db'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExportOpen(false);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const scale = 2; // High resolution
    canvas.width = width * scale;
    canvas.height = height * scale;

    img.onload = () => {
      if (!ctx) return;
      
      // Clear and set background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (format === 'jpg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 1.0);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `erd-${fileName || 'db'}.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);
      setIsExportOpen(false);
      logActivity(ToolType.ERD_STUDIO, 'Exported ERD', `Downloaded as ${format.toUpperCase()}`);
    };
    
    img.onerror = () => {
      setError("Failed to rasterize image. Try SVG export.");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">ERD Studio</h1>
          <p className="text-slate-500 font-medium italic">Transform your SQLite binary files into visual blueprints.</p>
        </div>
        
        {mermaidCode && (
          <div className="relative flex items-center" ref={dropdownRef}>
             <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-x divide-slate-100">
                <button 
                  onClick={() => exportAs(exportFormat)}
                  className="px-6 py-3 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <span className="text-lg">📥</span>
                  Download as <span className="text-teal-600 uppercase">{exportFormat}</span>
                </button>
                <button 
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className={`px-3 py-3 hover:bg-slate-50 transition-all flex items-center justify-center text-slate-400 ${isExportOpen ? 'bg-slate-50 text-teal-600' : ''}`}
                >
                  <span className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
             </div>

             {isExportOpen && (
               <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Select Format</div>
                  {(['svg', 'png', 'jpg'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        setExportFormat(fmt);
                        // Optional: don't close immediately to let user see selection
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${exportFormat === fmt ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span className="uppercase">{fmt}</span>
                      {exportFormat === fmt && <span>✓</span>}
                    </button>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>

      {!mermaidCode && !isDbLoading && !isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-xl w-full text-center">
            <div 
              className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-16 hover:border-teal-400 transition-all cursor-pointer group shadow-2xl shadow-slate-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 group-hover:scale-110 transition-transform shadow-inner">📁</div>
              <h2 className="text-2xl font-black text-slate-800 mb-3">Inspect Database</h2>
              <p className="text-slate-400 font-medium">Click to select or drag and drop your <span className="text-teal-600 font-bold">.db</span> file here to generate a visual ERD diagram.</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".db,.sqlite,.sqlite3"
                className="hidden" 
              />
            </div>
            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supports Standard SQLite3 Binaries</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 relative group">
          {/* Studio Bar */}
          <div className="bg-slate-900 px-8 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="h-4 w-px bg-slate-700 mx-2"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fileName || 'database.db'}</span>
            </div>
            <div className="flex items-center gap-4">
              {mermaidCode && !isLoading && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Ready
                </span>
              )}
              <button 
                onClick={() => {
                  setMermaidCode('');
                  setFileName(null);
                }}
                className="text-[10px] font-black text-slate-500 uppercase hover:text-rose-500 transition-colors"
              >
                Reset Studio
              </button>
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-12 relative"
            style={{ 
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }}
          >
            {error && (
              <div className="absolute top-10 inset-x-10 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold z-10 text-center shadow-xl max-w-lg mx-auto">
                ⚠️ {error}
              </div>
            )}
            
            <div 
              ref={diagramRef}
              className={`w-full h-full flex items-center justify-center transition-opacity duration-500 ${isLoading || isDbLoading ? 'opacity-20 grayscale' : 'opacity-100'}`}
            />

            {(isLoading || isDbLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center gap-4 p-10 bg-white rounded-[2rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-slate-900 text-sm font-black uppercase tracking-[0.2em] mb-1">
                      {isDbLoading ? 'Extracting Schema' : 'Drafting Architecture'}
                    </p>
                    <p className="text-slate-400 text-[10px] font-bold animate-pulse">Processing locally with WebAssembly...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Viewport Info Overlay (bottom right) */}
          {mermaidCode && (
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg flex items-center gap-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="text-teal-500">Scale</span> Automatic
               </div>
               <div className="w-px h-3 bg-slate-200"></div>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="text-teal-500">Engine</span> Mermaid
               </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center gap-8 border border-slate-800">
        <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 animate-pulse">
          🛡️
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg mb-1 tracking-tight">Enterprise Privacy by Design</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your binary database never leaves your device. We use <span className="text-teal-400 font-bold">Pyodide WebAssembly</span> to run a Python interpreter in your browser thread, ensuring full data isolation. Only structural metadata is shared with the AI visualizer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ERDStudioView;
