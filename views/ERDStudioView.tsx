
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
  
  const diagramRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    if (format === 'svg') {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `erd-${fileName || 'db'}.svg`;
      link.click();
      return;
    }

    // Raster export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set high resolution for clarity
    const scale = 2; 
    const svgRect = svgElement.getBoundingClientRect();
    canvas.width = svgRect.width * scale;
    canvas.height = svgRect.height * scale;

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (!ctx) return;
      if (format === 'jpg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `erd-${fileName || 'db'}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
    
    logActivity(ToolType.ERD_STUDIO, 'Exported ERD', `Downloaded as ${format.toUpperCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">ERD Studio</h1>
          <p className="text-slate-500 font-medium italic">Upload a database to visualize structure.</p>
        </div>
        
        {mermaidCode && (
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => exportAs('svg')} className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-teal-600 transition-colors">SVG</button>
            <div className="w-px h-4 bg-slate-200"></div>
            <button onClick={() => exportAs('png')} className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-teal-600 transition-colors">PNG</button>
            <div className="w-px h-4 bg-slate-200"></div>
            <button onClick={() => exportAs('jpg')} className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-teal-600 transition-colors">JPG</button>
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
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 relative">
          <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{fileName || 'database.db'}</span>
            </div>
            <button 
              onClick={() => {
                setMermaidCode('');
                setFileName(null);
              }}
              className="text-[10px] font-black text-rose-500 uppercase hover:underline"
            >
              Close Inspector
            </button>
          </div>
          
          <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-10 relative">
            {error && (
              <div className="absolute top-10 inset-x-10 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold z-10 text-center">
                ⚠️ {error}
              </div>
            )}
            
            <div 
              ref={diagramRef}
              className={`w-full h-full flex items-center justify-center transition-opacity duration-300 ${isLoading || isDbLoading ? 'opacity-20' : 'opacity-100'}`}
            />

            {(isLoading || isDbLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                  <p className="text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                    {isDbLoading ? 'Extracting Schema...' : 'Architecting Diagram...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center gap-8 border border-slate-800">
        <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
          📊
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg mb-1">Local Processing Architecture</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your database file is processed strictly within your browser's private memory sandbox using WebAssembly. The AI only receives the table schemas to generate the visual graph, ensuring your data values remain <span className="text-teal-400 font-bold">100% private</span> and off-server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ERDStudioView;
