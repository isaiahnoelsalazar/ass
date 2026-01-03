
import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

type LanguageMode = 
  | 'PYTHON' | 'WEB' | 'PHP' | 'RUBY' 
  | 'CPP' | 'JAVA' | 'CSHARP' | 'PASCAL' | 'BASIC' 
  | 'KOTLIN' | 'RUST' | 'GO' | 'C' | 'ASSEMBLY' | 'COBOL' | 'OBJECTIVE_C' | 'SWIFT'
  | 'SQL_SERVER' | 'SQLITE' | 'MYSQL';

interface LanguageConfig {
  name: string;
  icon: string;
  template: string;
  isNative: boolean;
  category: 'Core' | 'Systems' | 'Database';
}

const LANGUAGES: Record<LanguageMode, LanguageConfig> = {
  PYTHON: {
    name: 'Python',
    icon: '🐍',
    isNative: true,
    category: 'Core',
    template: 'print("Hello from Python WASM!")\n\nfor i in range(5):\n    print(f"Counting: {i}")'
  },
  WEB: {
    name: 'HTML/JS',
    icon: '🌐',
    isNative: true,
    category: 'Core',
    template: '<div style="text-align: center; margin-top: 50px; font-family: sans-serif;">\n  <h1 style="color: #6366f1;">Hello Web!</h1>\n  <p>Edit this HTML to see live updates.</p>\n  <button onclick="alert(\'Clicked!\')">Click Me</button>\n</div>'
  },
  PHP: {
    name: 'PHP',
    icon: '🐘',
    isNative: false,
    category: 'Core',
    template: '<?php\n\necho "Hello from Simulated PHP!\\n";\n\n$fruits = ["Apple", "Banana", "Cherry"];\nforeach ($fruits as $fruit) {\n    echo "Fruit: $fruit\\n";\n}\n\necho "\\nCurrent server time: " . date("Y-m-d H:i:s");'
  },
  RUBY: {
    name: 'Ruby',
    icon: '💎',
    isNative: false,
    category: 'Core',
    template: 'puts "Hello from Ruby!"\n\n# Calculate squares of first 5 numbers\n(1..5).each do |n|\n  puts "The square of #{n} is #{n**2}"\nend'
  },
  KOTLIN: {
    name: 'Kotlin',
    icon: '🎯',
    isNative: false,
    category: 'Systems',
    template: 'fun main() {\n    val language = "Kotlin"\n    println("Hello from $language!")\n    \n    repeat(3) {\n        println("Kotlin is expressive!")\n    }\n}'
  },
  RUST: {
    name: 'Rust',
    icon: '🦀',
    isNative: false,
    category: 'Systems',
    template: 'fn main() {\n    println!("Hello from Rust!");\n    \n    let vec = vec![10, 20, 30];\n    for x in vec {\n        println!("Value: {}", x);\n    }\n}'
  },
  GO: {
    name: 'Go',
    icon: '🐹',
    isNative: false,
    category: 'Systems',
    template: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n    \n    for i := 0; i < 3; i++ {\n        fmt.Printf("Tick: %d\\n", i)\n    }\n}'
  },
  C: {
    name: 'C',
    icon: '⌨️',
    isNative: false,
    category: 'Systems',
    template: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    int i;\n    for(i = 0; i < 4; i++) {\n        printf("Index %d\\n", i);\n    }\n    return 0;\n}'
  },
  ASSEMBLY: {
    name: 'Assembly',
    icon: '🔌',
    isNative: false,
    category: 'Systems',
    template: '; x86 NASM Syntax Example\nsection .data\n    msg db \'Hello from Assembly!\', 0xA\n    len equ $ - msg\n\nsection .text\n    global _start\n\n_start:\n    mov eax, 4      ; sys_write\n    mov ebx, 1      ; stdout\n    mov ecx, msg\n    mov edx, len\n    int 0x80\n\n    mov eax, 1      ; sys_exit\n    xor ebx, ebx\n    int 0x80'
  },
  COBOL: {
    name: 'COBOL',
    icon: '📠',
    isNative: false,
    category: 'Systems',
    template: '       IDENTIFICATION DIVISION.\n       PROGRAM-ID. HELLO-WORLD.\n       PROCEDURE DIVISION.\n           DISPLAY \'Hello from COBOL!\'.\n           DISPLAY \'Running on legacy virtualization.\'.\n           STOP RUN.'
  },
  OBJECTIVE_C: {
    name: 'Objective-C',
    icon: '🍎',
    isNative: false,
    category: 'Systems',
    template: '#import <Foundation/Foundation.h>\n\nint main(int argc, const char * argv[]) {\n    @autoreleasepool {\n        NSLog(@"Hello from Objective-C!");\n        NSArray *langs = @[@"Objective-C", @"Swift"];\n        for (NSString *l in langs) {\n            NSLog(@"Developing for Apple: %@", l);\n        }\n    }\n    return 0;\n}'
  },
  SWIFT: {
    name: 'Swift',
    icon: '🐦',
    isNative: false,
    category: 'Systems',
    template: 'print("Hello from Swift!")\n\nlet cities = ["Cupertino", "London", "Tokyo"]\nfor city in cities {\n    print("Checking weather in \\(city)...")\n}'
  },
  SQLITE: {
    name: 'SQLite',
    icon: '💾',
    isNative: false,
    category: 'Database',
    template: '-- SQLite Environment\nCREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER);\nINSERT INTO tasks (title, done) VALUES (\'Build App\', 0), (\'Test SQL\', 1);\n\nSELECT * FROM tasks;'
  },
  MYSQL: {
    name: 'MySQL',
    icon: '🐬',
    isNative: false,
    category: 'Database',
    template: '-- MySQL Environment\nCREATE TABLE products (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    name VARCHAR(255),\n    price DECIMAL(10,2)\n);\n\nINSERT INTO products (name, price) VALUES (\'Laptop\', 999.99), (\'Mouse\', 25.50);\n\nSELECT name, price FROM products ORDER BY price DESC;'
  },
  SQL_SERVER: {
    name: 'SQL Server',
    icon: '🏢',
    isNative: false,
    category: 'Database',
    template: '-- SQL Server (T-SQL) Environment\nCREATE TABLE Employees (\n    ID INT PRIMARY KEY,\n    Name NVARCHAR(100),\n    Department NVARCHAR(50)\n);\n\nINSERT INTO Employees VALUES (1, \'Alice\', \'Engineering\'), (2, \'Bob\', \'Design\');\n\nSELECT * FROM Employees WHERE Department = \'Engineering\';'
  },
  CPP: {
    name: 'C++',
    icon: '⚙️',
    isNative: false,
    category: 'Systems',
    template: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from Simulated C++!" << std::endl;\n    for(int i=0; i<3; ++i) {\n        std::cout << "Loop index: " << i << std::endl;\n    }\n    return 0;\n}'
  },
  JAVA: {
    name: 'Java',
    icon: '☕',
    isNative: false,
    category: 'Systems',
    template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Simulated Java!");\n        int sum = 0;\n        for(int i=1; i<=10; i++) sum += i;\n        System.out.println("Sum of 1-10: " + sum);\n    }\n}'
  },
  CSHARP: {
    name: 'C#',
    icon: '🔷',
    isNative: false,
    category: 'Systems',
    template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from Simulated C#!");\n        var now = DateTime.Now;\n        Console.WriteLine($"Current Simulated Time: {now}");\n    }\n}'
  },
  PASCAL: {
    name: 'Pascal',
    icon: '📜',
    isNative: false,
    category: 'Systems',
    template: 'program HelloWorld;\nbegin\n  writeln(\'Hello from Simulated Pascal!\');\n  writeln(\'Classic coding at its best.\');\nend.'
  },
  BASIC: {
    name: 'BASIC',
    icon: '📟',
    isNative: false,
    category: 'Systems',
    template: '10 PRINT "HELLO FROM SIMULATED BASIC!"\n20 FOR I = 1 TO 5\n30 PRINT "STEP "; I\n40 NEXT I\n50 END'
  }
};

const CATEGORIES = ['Core', 'Systems', 'Database'] as const;

const CodePlaygroundView: React.FC = () => {
  const [mode, setMode] = useState<LanguageMode>('PYTHON');
  const [code, setCode] = useState(LANGUAGES['PYTHON'].template);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        const isSql = config.category === 'Database';
        setOutput(`[System] Initializing Virtual ${config.name} ${isSql ? 'Database' : 'Environment'}...\n[System] ${isSql ? 'Executing Queries' : 'Compiling source'}...\n\n`);
        
        const prompt = `Act as a ${config.name} ${isSql ? 'Database Engine' : 'compiler and runtime'}. Execute the following code and return ONLY the resulting output. 
        ${isSql ? 'For SELECT statements, return the data in a clean ASCII markdown table format.' : 'Do not explain the code unless it crashes.'}
        If there are syntax errors, report them as a real ${isSql ? 'DB engine' : 'compiler'} would.

Code:
\`\`\`${mode.toLowerCase()}
${code}
\`\`\``;

        const response = await chatWithGemini(prompt);
        setOutput(prev => prev + (response || "No output returned."));
        logActivity(ToolType.CODE_PLAYGROUND, `Ran ${config.name} Code`, `Used AI-Simulated ${isSql ? 'DB' : 'execution'} engine`);
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
    setIsDropdownOpen(false);
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
    <div className="max-w-6xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Code Playground</h1>
          <p className="text-slate-500">Professional IDE with multi-architecture execution support.</p>
        </div>

        {/* Custom Dropdown Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full md:w-[280px] bg-white border border-slate-200 px-6 py-4 rounded-[1.5rem] flex items-center justify-between shadow-sm hover:border-slate-300 transition-all text-slate-700 font-bold group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{LANGUAGES[mode].icon}</span>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Runtime Environment</p>
                <p className="flex items-center gap-2">
                  {LANGUAGES[mode].name}
                  {!LANGUAGES[mode].isNative && (
                    <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">AI</span>
                  )}
                </p>
              </div>
            </div>
            <span className={`text-slate-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-full md:w-[550px] bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                <div className="flex flex-col">
                  {['Core', 'Database'].map(cat => (
                    <div key={cat} className={`p-5 ${cat === 'Database' ? 'bg-slate-50/50 flex-1' : ''}`}>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat}</p>
                        {cat === 'Core' && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">WASM</span>}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(Object.keys(LANGUAGES) as LanguageMode[])
                          .filter(k => LANGUAGES[k].category === cat)
                          .map((langKey) => (
                            <button
                              key={langKey}
                              onClick={() => changeLanguage(langKey)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative group ${
                                mode === langKey 
                                  ? 'bg-slate-900 text-white shadow-xl' 
                                  : 'hover:bg-white hover:shadow-sm text-slate-600'
                              }`}
                            >
                              <span className="text-lg">{LANGUAGES[langKey].icon}</span>
                              <span className="flex-1 text-left">{LANGUAGES[langKey].name}</span>
                              {!LANGUAGES[langKey].isNative && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${mode === langKey ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>AI</span>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-5 bg-white">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Systems</p>
                    <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">VIRTUAL</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 overflow-y-auto max-h-[400px] no-scrollbar pr-1">
                    {(Object.keys(LANGUAGES) as LanguageMode[])
                      .filter(k => LANGUAGES[k].category === 'Systems')
                      .map((langKey) => (
                        <button
                          key={langKey}
                          onClick={() => changeLanguage(langKey)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative group ${
                            mode === langKey 
                              ? 'bg-slate-900 text-white shadow-xl' 
                              : 'hover:bg-white hover:shadow-sm text-slate-600'
                          }`}
                        >
                          <span className="text-lg">{LANGUAGES[langKey].icon}</span>
                          <span className="flex-1 text-left">{LANGUAGES[langKey].name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${mode === langKey ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>AI</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px] mb-8">
        {/* Editor Side */}
        <div className="flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700">
          <div className="bg-slate-800 px-8 py-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{LANGUAGES[mode].name} EDITOR</span>
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
                    <span>{LANGUAGES[mode].category === 'Database' ? 'Execute Query' : `Run Code`}</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={askAIForHelp}
              disabled={isRunning}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/30 active:scale-[0.98]"
            >
              <span className="text-lg">✨</span>
              <span>AI Debugger</span>
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200">
          <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'WEB' ? 'Live Preview' : 'Output Console'}
            </span>
            {mode !== 'WEB' && (
              <button 
                onClick={() => setOutput('')}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase flex items-center gap-1"
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
              <div className="p-10 font-mono text-xs text-slate-700 leading-relaxed min-h-full">
                <pre className="whitespace-pre-wrap">
                  {output || (mode === 'PYTHON' && isPyodideLoading ? "[System] Initializing Python WASM Runtime..." : "[Console] Waiting for execution...")}
                </pre>
                {isRunning && mode !== 'PYTHON' && (
                  <div className="mt-4 flex items-center gap-2 text-indigo-500 animate-pulse font-bold">
                    <span>⚡</span> Executing on Virtual Machine...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex items-center gap-5 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
          ⚙️
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900 block mb-1">Architecture Note:</strong> 
          Languages marked as <span className="text-emerald-600 font-bold uppercase text-[10px]">WASM</span> run natively in your browser. All others utilize a secure <span className="text-indigo-600 font-bold uppercase text-[10px]">AI-Virtualization</span> layer to simulate execution and state management.
        </div>
      </div>

      <br/>
    </div>
  );
};

export default CodePlaygroundView;
