
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';
import mermaid from 'mermaid';

const ERDStudioView: React.FC = () => {
  const [input, setInput] = useState('Create a database for a social media app with users, posts, comments, and likes.');
  const [mermaidCode, setMermaidCode] = useState('erDiagram\n    USER ||--o{ POST : writes\n    USER ||--o{ COMMENT : makes\n    POST ||--o{ COMMENT : contains\n    USER ||--o{ LIKE : gives\n    POST ||--o{ LIKE : receives');
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  
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
    
    // Lazy load Pyodide for DB processing
    const loadPy = async () => {
      try {
        // @ts-ignore
        const py = await window.loadPyodide();
        setPyodide(py);
      } catch (err) {
        console.error("Failed to load Pyodide for ERD extraction:", err);
      }
    };
    loadPy();
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || !mermaidCode) return;
      try {
        setError(null);
        diagramRef.current.innerHTML = ''; // Clear previous
        const { svg } = await mermaid.render('erd-canvas', mermaidCode);
        diagramRef.current.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError('The generated diagram syntax is invalid. Try refining the prompt.');
      }
    };
    renderDiagram();
  }, [mermaidCode]);

  const handleGenerate = async (rawSchema?: string) => {
    const textToProcess = rawSchema || input;
    if (!textToProcess.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following ${rawSchema ? 'SQL schema' : 'database description'} into a Mermaid erDiagram syntax for SQLite. 
Only return the Mermaid code block starting with 'erDiagram'. Do not include markdown code block markers like \`\`\`mermaid.
Include primary keys (PK) and foreign keys (FK). Map relationships accurately based on standard database naming conventions.

Input: "${textToProcess}"`,
        config: {
          temperature: 0.1
        }
      });

      const cleanedCode = response.text?.replace(/```mermaid/g, '').replace(/```/g, '').trim();
      if (cleanedCode) {
        setMermaidCode(cleanedCode);
        logActivity(ToolType.ERD_STUDIO, 'Generated ERD', `Diagram created from ${rawSchema ? 'uploaded DB file' : 'text prompt'}`);
      }
    } catch (err) {
      console.error(err);
      setError('AI service failed to generate the diagram. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDBUpload = async () => {
    const [fileHandle] = await window.showOpenFilePicker();  
    let fh = await fileHandle.getFile()
    if (!fh || !pyodide) return;

    setIsDbLoading(true);
    setError(null);
    
    try {
      await pyodide.loadPackage("sqlite3");

      // Write to Pyodide FS
      pyodide.FS.writeFile('/input.db', fh);
      
      // Extract schema using Python
      const pythonScript = `
import sqlite3
import os

try:
    conn = sqlite3.connect('/input.db')
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = cursor.fetchall()
    schema = "\\n".join([t[0] for t in tables if t[0]])
    conn.close()
    schema
except Exception as e:
    f"ERROR: {str(e)}"
      `;
      
      const schema = await pyodide.runPythonAsync(pythonScript);
      
      if (schema === undefined || schema === null) {
        throw new Error("Failed to extract schema from database.");
      }

      if (schema.startsWith("ERROR:")) {
        throw new Error(schema);
      }
      
      if (!schema.trim()) {
        throw new Error("No table schemas found in the database file.");
      }

      setInput(schema); // Show extracted SQL in the input area
      handleGenerate(schema); // Send to AI
    } catch (err: any) {
      console.error(err);
      setError(`Database Error: ${err.message || "Failed to parse SQLite file."}`);
    } finally {
      setIsDbLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pyodide) return;

    setIsDbLoading(true);
    setError(null);
    
    try {
      await pyodide.loadPackage("sqlite3");

      // Write to Pyodide FS
      pyodide.FS.writeFile('/input.db', file);
      
      // Extract schema using Python
      const pythonScript = `
import sqlite3
import os

try:
    conn = sqlite3.connect('/input.db')
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = cursor.fetchall()
    schema = "\\n".join([t[0] for t in tables if t[0]])
    conn.close()
    schema
except Exception as e:
    f"ERROR: {str(e)}"
      `;
      
      const schema = await pyodide.runPythonAsync(pythonScript);
      
      if (schema === undefined || schema === null) {
        throw new Error("Failed to extract schema from database.");
      }

      if (schema.startsWith("ERROR:")) {
        throw new Error(schema);
      }
      
      if (!schema.trim()) {
        throw new Error("No table schemas found in the database file.");
      }

      setInput(schema); // Show extracted SQL in the input area
      handleGenerate(schema); // Send to AI
    } catch (err: any) {
      console.error(err);
      setError(`Database Error: ${err.message || "Failed to parse SQLite file."}`);
    } finally {
      setIsDbLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadSVG = () => {
    if (!diagramRef.current) return;
    const svgData = diagramRef.current.innerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database-diagram.svg';
    link.click();
    logActivity(ToolType.ERD_STUDIO, 'Exported ERD', 'Downloaded SVG version of the diagram');
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">ERD Studio</h1>
          <p className="text-slate-500 font-medium">Architectural database design with AI-powered SQLite visualization.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".db,.sqlite,.sqlite3"
            className="hidden" 
          />
          <button 
            // onClick={() => fileInputRef.current?.click()}
            onClick={handleDBUpload}
            disabled={!pyodide || isDbLoading || isLoading}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span>📁</span> {isDbLoading ? 'Reading DB...' : 'Upload .db file'}
          </button>
          <button 
            onClick={downloadSVG}
            disabled={!mermaidCode}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span>📥</span> Download SVG
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
        {/* Input & Code Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Schema Designer</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your tables or paste SQL CREATE TABLE statements..."
              className="w-full h-40 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || isDbLoading || !input.trim()}
              className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-lg">📊</span>
                  <span>Generate Diagram</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mermaid Source</h3>
              <span className="text-[10px] text-slate-500 font-mono">Syntax Highlighting</span>
            </div>
            
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              className="flex-1 w-full bg-transparent font-mono text-xs text-teal-300 outline-none resize-none leading-relaxed selection:bg-teal-500/30"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Visualization Column */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
          <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-inner"></div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Architectural Preview</span>
          </div>
          
          <div className="flex-1 overflow-auto bg-slate-50 p-10 flex items-center justify-center relative">
            {error && (
              <div className="absolute top-10 left-10 right-10 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold z-10 animate-in fade-in slide-in-from-top-4">
                ⚠️ {error}
              </div>
            )}
            
            <div 
              ref={diagramRef}
              className="w-full h-full flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: (isLoading || isDbLoading) ? 0.3 : 1 }}
            />

            {(isLoading || isDbLoading) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                  <p className="text-teal-600 text-xs font-bold animate-pulse">
                    {isDbLoading ? 'Reading Database Schema...' : 'Designing Schema Architecture...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-teal-50/50 p-6 rounded-[2rem] border border-teal-100 flex items-center gap-6 shadow-sm">
        <div className="w-14 h-14 bg-white text-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
          💾
        </div>
        <div className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          <strong className="text-slate-900 block mb-1">Database Intelligence:</strong> 
          ERD Studio now supports direct <span className="font-bold text-teal-700">SQLite file analysis</span>. Upload any valid DB file to automatically extract table definitions and visualize their relationships. All processing occurs locally in your browser via WebAssembly (Pyodide).
        </div>
      </div>
    </div>
  );
};

export default ERDStudioView;
