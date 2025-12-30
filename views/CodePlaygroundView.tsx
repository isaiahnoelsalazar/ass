
import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini } from '../services/geminiService';

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
      } catch (err: any) {
        setOutput(prev => prev + "\n[PYTHON ERROR]\n" + err.message);
      } finally {
        setIsRunning(false);
      }
    } else if (!config.isNative) {
      // AI SIMULATION for C++, Java, C#, Pascal, BASIC
      try {
        setOutput(`[System] Initializing Virtual ${config.name} Environment...\n[System] Compiling source...\n[System] Executing...\n\n`);
        
        const prompt = `Act as a ${config.name} compiler and runtime. Execute the following code and return ONLY the resulting standard output (stdout) and standard error (stderr). Do not explain the code unless it crashes. If there are syntax errors, report them as a real compiler would.

Code:
\`\`\`${mode.toLowerCase()}
${code}
\`\`\``;

        const response = await chatWithGemini(prompt);
        setOutput(prev => prev + (response || "No output returned."));
      } catch (err) {
        setOutput(prev => prev + "\n[SYSTEM ERROR] Failed to connect to virtual compiler.");
      } finally {
        setIsRunning(false);
      }
    } else {
      setIsRunning(false); // Web mode doesn't need a run button trigger
    }
  };

  const changeLanguage = (newMode: LanguageMode) => {
    setMode(newMode);
    setCode(LANGUAGES[newMode].template);
    setOutput('');
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
    } catch (err) {
      alert("AI Service unavailable.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Code Playground</h1>
        <p className="text-slate-500">Professional multi-language IDE with native & AI-powered execution.</p>
      </div>

      {/* Language Selector Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 overflow-x-auto no-scrollbar gap-1">
        {(Object.keys(LANGUAGES) as LanguageMode[]).map((langKey) => (
          <button
            key={langKey}
            onClick={() => changeLanguage(langKey)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              mode === langKey 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            <span>{LANGUAGES[langKey].icon}</span>
            {LANGUAGES[langKey].name}
            {!LANGUAGES[langKey].isNative && (
              <span className="text-[8px] bg-indigo-500/20 text-indigo-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">AI</span>
            )}
          </button>
        ))}
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
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{LANGUAGES[mode].name} EDITOR</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-8 bg-slate-900 text-indigo-300 font-mono text-sm leading-relaxed outline-none resize-none"
            spellCheck={false}
          />
          <div className="p-4 bg-slate-800 flex gap-3">
            {mode !== 'WEB' && (
              <button
                onClick={runCode}
                disabled={isRunning || (mode === 'PYTHON' && isPyodideLoading)}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                {isRunning ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>▶ Run {LANGUAGES[mode].name}</>
                )}
              </button>
            )}
            <button
              onClick={askAIForHelp}
              disabled={isRunning}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              ✨ Debug with AI
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'WEB' ? 'Live Preview' : 'Console Output'}
            </span>
            {mode !== 'WEB' && (
              <button 
                onClick={() => setOutput('')}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase"
              >
                Clear
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
              <pre className="p-8 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {output || (mode === 'PYTHON' && isPyodideLoading ? "[System] Initializing Python WASM Runtime..." : "[Console] Waiting for execution...")}
              </pre>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <div className="text-2xl">⚡</div>
        <p className="text-sm text-indigo-900 leading-relaxed">
          <strong>Language Note:</strong> Python and HTML run natively in your browser. Pascal, BASIC, C++, Java, and C# are executed in an AI-powered cloud simulation for instant testing without server delays.
        </p>
      </div>
    </div>
  );
};

export default CodePlaygroundView;
