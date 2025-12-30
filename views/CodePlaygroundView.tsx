
import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini } from '../services/geminiService';

const CodePlaygroundView: React.FC = () => {
  const [mode, setMode] = useState<'PYTHON' | 'WEB'>('PYTHON');
  const [code, setCode] = useState(mode === 'PYTHON' ? 'print("Hello from Automatic Systems!")\n\nfor i in range(5):\n    print(f"Counting: {i}")' : '<div style="text-align: center; margin-top: 50px; font-family: sans-serif;">\n  <h1 style="color: #6366f1;">Hello Web!</h1>\n  <p>Edit this HTML to see live updates.</p>\n  <button onclick="alert(\'Clicked!\')">Click Me</button>\n</div>');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize Pyodide
  useEffect(() => {
    if (mode === 'PYTHON' && !pyodide && !isPyodideLoading) {
      const load = async () => {
        setIsPyodideLoading(true);
        try {
          // @ts-ignore
          const py = await window.loadPyodide();
          setPyodide(py);
        } catch (err) {
          console.error("Pyodide failed to load", err);
          setOutput("Error: Failed to load Python runtime.");
        } finally {
          setIsPyodideLoading(false);
        }
      };
      load();
    }
  }, [mode, pyodide]);

  // Update Web Preview
  useEffect(() => {
    if (mode === 'WEB' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, mode]);

  const runPython = async () => {
    if (!pyodide) return;
    setIsRunning(true);
    setOutput("");
    
    try {
      // Capture stdout
      pyodide.setStdout({
        batched: (str: string) => setOutput(prev => prev + str + "\n")
      });
      
      await pyodide.runPythonAsync(code);
    } catch (err: any) {
      setOutput(prev => prev + "\n[ERROR]\n" + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const askAIForHelp = async () => {
    setIsRunning(true);
    try {
      const prompt = `I am using your Code Playground. Here is my ${mode} code:\n\n\`\`\`${mode.toLowerCase()}\n${code}\n\`\`\`\n\nAnd here is the output/error:\n${output}\n\nPlease help me debug this or suggest an improvement. Return code and explanation.`;
      const response = await chatWithGemini(prompt);
      setOutput(prev => prev + "\n\n--- AI ASSISTANCE ---\n" + response);
    } catch (err) {
      alert("AI Service unavailable.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Code Playground</h1>
          <p className="text-slate-500">Experiment with logic and layouts in real-time.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => { setMode('PYTHON'); setOutput(''); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'PYTHON' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Python
          </button>
          <button 
            onClick={() => { setMode('WEB'); setOutput(''); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'WEB' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            HTML / JS
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px] mb-8">
        {/* Editor Side */}
        <div className="flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700">
          <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{mode} EDITOR</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-8 bg-slate-900 text-indigo-300 font-mono text-sm leading-relaxed outline-none resize-none spellcheck-false"
            spellCheck={false}
          />
          <div className="p-4 bg-slate-800 flex gap-3">
            {mode === 'PYTHON' && (
              <button
                onClick={runPython}
                disabled={isRunning || !pyodide}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {isPyodideLoading ? "Loading Runtime..." : isRunning ? "Running..." : "▶ Run Code"}
              </button>
            )}
            <button
              onClick={askAIForHelp}
              disabled={isRunning}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              ✨ Help me Debug
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mode === 'PYTHON' ? 'Terminal Output' : 'Live Preview'}</span>
          </div>
          
          <div className="flex-1 overflow-auto bg-slate-50 relative">
            {mode === 'PYTHON' ? (
              <pre className="p-8 font-mono text-sm text-slate-700 whitespace-pre-wrap">
                {output || (isPyodideLoading ? "Python is initializing (WASM)..." : "Waiting for execution...")}
              </pre>
            ) : (
              <iframe 
                ref={iframeRef}
                title="preview"
                className="w-full h-full border-none bg-white"
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <div className="text-2xl">💡</div>
        <p className="text-sm text-indigo-900 leading-relaxed">
          <strong>Quick Tip:</strong> The Python runtime includes many standard libraries. You can import <code>math</code>, <code>datetime</code>, or <code>json</code> directly in the editor!
        </p>
      </div>
    </div>
  );
};

export default CodePlaygroundView;
