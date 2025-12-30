
import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

type LanguageMode = 'PYTHON' | 'WEB' | 'CPP' | 'JAVA' | 'CSHARP' | 'PASCAL' | 'BASIC';

interface LanguageConfig {
  name: string;
  icon: string;
  template: string;
  isNative: boolean;
}

const LANGUAGES: Record<LanguageMode, LanguageConfig> = {
  PYTHON: {
    name: 'Python',
    icon: '🐍',
    isNative: true,
    template: 'print("Hello from Python WASM!")\n\nfor i in range(5):\n    print(f"Counting: {i}")'
  },
  WEB: {
    name: 'HTML/JS',
    icon: '🌐',
    isNative: true,
    template: '<div style="text-align: center; margin-top: 50px; font-family: sans-serif;">\n  <h1 style="color: #6366f1;">Hello Web!</h1>\n  <p>Edit this HTML to see live updates.</p>\n  <button onclick="alert(\'Clicked!\')">Click Me</button>\n</div>'
  },
  CPP: {
    name: 'C++',
    icon: '⚙️',
    isNative: false,
    template: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from Simulated C++!" << std::endl;\n    for(int i=0; i<3; ++i) {\n        std::cout << "Loop index: " << i << std::endl;\n    }\n    return 0;\n}'
  },
  JAVA: {
    name: 'Java',
    icon: '☕',
    isNative: false,
    template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Simulated Java!");\n        int sum = 0;\n        for(int i=1; i<=10; i++) sum += i;\n        System.out.println("Sum of 1-10: " + sum);\n    }\n}'
  },
  CSHARP: {
    name: 'C#',
    icon: '🔷',
    isNative: false,
    template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from Simulated C#!");\n        var now = DateTime.Now;\n        Console.WriteLine($"Current Simulated Time: {now}");\n    }\n}'
  },
  PASCAL: {
    name: 'Pascal',
    icon: '📜',
    isNative: false,
    template: 'program HelloWorld;\nbegin\n  writeln(\'Hello from Simulated Pascal!\');\n  writeln(\'Classic coding at its best.\');\nend.'
  },
  BASIC: {
    name: 'BASIC',
    icon: '📟',
    isNative: false,
    template: '10 PRINT "HELLO FROM SIMULATED BASIC!"\n20 FOR I = 1 TO 5\n30 PRINT "STEP "; I\n40 NEXT I\n50 END'
  }
};

const CodePlaygroundView: React.FC = () => {
  const [mode, setMode] = useState<LanguageMode>('PYTHON');
  const [code, setCode] = useState(LANGUAGES['PYTHON'].template);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load Pyodide for Python
  useEffect(() => {
    if (mode === 'PYTHON' && !pyodide && !isPyodideLoading) {
      const load = async () => {
        setIsPyodideLoading(true);
        try {
          // @ts-ignore
          const py = await window.loadPyodide();
          setPyodide(py);
          setIsPyodideLoading(false);
        } catch (err) {
          setOutput("Error: Failed to load Python runtime.");
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

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");

    const config = LANGUAGES[mode];

    if (mode === 'PYTHON') {
      if (!pyodide) return;
      try {
        pyodide.setStdout({ batched: (str: string) => setOutput(prev => prev + str + "\n") });
        await pyodide.runPythonAsync(code);
        logActivity(ToolType.CODE_PLAYGROUND, 'Ran Python Code', 'Executed native WASM Python scripts');
      } catch (err: any) {
        setOutput(prev => prev + "\n[PYTHON ERROR]\n" + err.message);
      } finally {
        setIsRunning(false);
      }
    } else if (!config.isNative) {
      try {
        setOutput(`[System] Initializing Virtual ${config.name} Environment...\n[System] Compiling source...\n[System] Executing...\n\n`);
        
        const prompt = `Act as a ${config.name} compiler and runtime. Execute the following code and return ONLY the resulting standard output (stdout) and standard error (stderr). Do not explain the code unless it crashes. If there are syntax errors, report them as a real compiler would.

Code:
\`\`\`${mode.toLowerCase()}
${code}
\`\`\``;

        const response = await chatWithGemini(prompt);
        setOutput(prev => prev + (response || "No output returned."));
        logActivity(ToolType.CODE_PLAYGROUND, `Ran ${config.name} Code`, 'Used AI-Simulated execution engine');
      } catch (err) {
        setOutput(prev => prev + "\n[SYSTEM ERROR] Failed to connect to virtual compiler.");
      } finally {
        setIsRunning(false);
      }
    } else {
      setIsRunning(false);
    }
  };

  const changeLanguage = (newMode: LanguageMode) => {
    setMode(newMode);
    setCode(LANGUAGES[newMode].template);
    setOutput('');
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const askAIForHelp = async () => {
    setIsRunning(true);
    try {
      const prompt = `I am using the Automatic Systems Code Playground. I am writing ${LANGUAGES[mode].name}. 
Code:
\`\`\`${mode.toLowerCase()}
${code}
\`\`\`

Current Output/Errors:
${output}

Please help me debug or optimize this code. Provide a short explanation and the corrected code block.`;
      const response = await chatWithGemini(prompt);
      setOutput(prev => prev + "\n\n--- AI DEBUGGER ASSISTANCE ---\n" + response);
      logActivity(ToolType.CODE_PLAYGROUND, 'Code Debugged', `Used AI to analyze ${LANGUAGES[mode].name} code`);
    } catch (err) {
      alert("AI Service unavailable.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Code Playground</h1>
        <p className="text-slate-500">Professional multi-language IDE with native & AI-powered execution.</p>
      </div>

      {/* Enhanced Scrollable Language Selector with Controls */}
      <div className="relative mb-8 group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 -ml-5"
        >
          ←
        </button>
        
        <div 
          ref={scrollContainerRef}
          className="bg-slate-100 p-2 rounded-2xl flex items-center overflow-x-auto gap-2 no-scrollbar scroll-smooth relative z-10"
        >
          {(Object.keys(LANGUAGES) as LanguageMode[]).map((langKey) => (
            <button
              key={langKey}
              onClick={() => changeLanguage(langKey)}
              className={`flex-shrink-0 px-6 py-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3 whitespace-nowrap min-w-[140px] justify-center ${
                mode === langKey 
                  ? 'bg-slate-800 text-white shadow-xl shadow-slate-300' 
                  : 'bg-transparent text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
              }`}
            >
              <span className="text-xl">{LANGUAGES[langKey].icon}</span>
              <span>{LANGUAGES[langKey].name}</span>
              {!LANGUAGES[langKey].isNative && (
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                  mode === langKey ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>AI</span>
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 -mr-5"
        >
          →
        </button>
        
        {/* Visual Fade Indicator for horizontal scroll */}
        <div className="absolute right-2 top-2 bottom-2 w-16 bg-gradient-to-l from-slate-100 to-transparent pointer-events-none z-15 rounded-r-2xl"></div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[650px] mb-10">
        {/* Editor Side */}
        <div className="flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700">
          <div className="bg-slate-800 px-8 py-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{LANGUAGES[mode].name} EDITOR</span>
              {isRunning && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-10 bg-slate-900 text-indigo-300 font-mono text-sm leading-relaxed outline-none resize-none"
            spellCheck={false}
          />
          <div className="p-6 bg-slate-800 flex flex-col sm:flex-row gap-4">
            {mode !== 'WEB' && (
              <button
                onClick={runCode}
                disabled={isRunning || (mode === 'PYTHON' && isPyodideLoading)}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/30 active:scale-[0.98]"
              >
                {isRunning ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-lg">▶</span>
                    <span>Run {LANGUAGES[mode].name}</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={askAIForHelp}
              disabled={isRunning}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/30 active:scale-[0.98]"
            >
              <span className="text-lg">✨</span>
              <span>Debug with AI</span>
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200">
          <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'WEB' ? 'Live Preview' : 'Console Output'}
            </span>
            {mode !== 'WEB' && (
              <button 
                onClick={() => setOutput('')}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase flex items-center gap-1"
              >
                <span>🗑️</span>
                <span>Clear</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto bg-slate-50 relative">
            {mode === 'WEB' ? (
              <iframe 
                ref={iframeRef}
                title="preview"
                className="w-full h-full border-none bg-white"
              />
            ) : (
              <div className="p-10 font-mono text-sm text-slate-700 leading-relaxed min-h-full">
                <pre className="whitespace-pre-wrap">
                  {output || (mode === 'PYTHON' && isPyodideLoading ? "[System] Initializing Python WASM Runtime..." : "[Console] Waiting for execution...")}
                </pre>
                {isRunning && mode !== 'PYTHON' && (
                  <div className="mt-4 flex items-center gap-2 text-indigo-500 animate-pulse font-bold">
                    <span>⚡</span> Processing execution...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5 shadow-sm mb-10">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-500 flex-shrink-0">
          💡
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong className="text-slate-900">Developer Note:</strong> This playground supports 7 programming languages. Use the scroll arrows at the top to access all of them, including <strong>Pascal</strong> and <strong>BASIC</strong>.
        </p>
      </div>
    </div>
  );
};

export default CodePlaygroundView;
