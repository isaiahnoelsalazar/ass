
import React, { useState, useEffect, useRef } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

type LanguageMode = 
  | 'PYTHON' | 'WEB' | 'PHP' | 'RUBY' | 'LUA'
  | 'CPP' | 'JAVA' | 'CSHARP' | 'PASCAL' | 'BASIC' 
  | 'KOTLIN' | 'RUST' | 'GO' | 'C' | 'ASSEMBLY' | 'COBOL' | 'OBJECTIVE_C' | 'SWIFT'
  | 'SQL_SERVER' | 'SQLITE' | 'MYSQL' | 'MONGODB' | 'NOSQL' | 'ORACLE';

interface LanguageConfig {
  name: string;
  icon: string;
  template: string;
  isNative: boolean;
  category: 'Core' | 'Systems' | 'Database';
  description?: string;
}

const LANGUAGES: Record<LanguageMode, LanguageConfig> = {
  PYTHON: {
    name: 'Python',
    icon: '🐍',
    isNative: true,
    category: 'Core',
    description: 'High-level, interpreted language for general-purpose programming.',
    template: 'print("Hello from Python WASM!")\n\nfor i in range(5):\n    print(f"Counting: {i}")'
  },
  WEB: {
    name: 'HTML/JS',
    icon: '🌐',
    isNative: true,
    category: 'Core',
    description: 'Front-end development environment with live rendering.',
    template: '<div style="text-align: center; margin-top: 50px; font-family: sans-serif;">\n  <h1 style="color: #6366f1;">Hello Web!</h1>\n  <p>Edit this HTML to see live updates.</p>\n  <button onclick="alert(\'Clicked!\')">Click Me</button>\n</div>'
  },
  PHP: {
    name: 'PHP',
    icon: '🐘',
    isNative: false,
    category: 'Core',
    description: 'Server-side scripting for web development.',
    template: '<?php\n\necho "Hello from Simulated PHP!\\n";\n\n$fruits = ["Apple", "Banana", "Cherry"];\nforeach ($fruits as $fruit) {\n    echo "Fruit: $fruit\\n";\n}\n\necho "\\nCurrent server time: " . date("Y-m-d H:i:s");'
  },
  RUBY: {
    name: 'Ruby',
    icon: '💎',
    isNative: false,
    category: 'Core',
    description: 'A dynamic, open source programming language with a focus on simplicity.',
    template: 'puts "Hello from Ruby!"\n\n# Calculate squares of first 5 numbers\n(1..5).each do |n|\n  puts "The square of #{n} is #{n**2}"\nend'
  },
  LUA: {
    name: 'Lua',
    icon: '🌙',
    isNative: false,
    category: 'Core',
    description: 'Lightweight, high-level, multi-paradigm programming language.',
    template: '-- Hello from Lua!\nprint("Hello World from the Moon!")\n\nlocal fruits = {"Apple", "Banana", "Orange"}\n\nfor i, fruit in ipairs(fruits) do\n    print("Fruit #" .. i .. ": " .. fruit)\nend\n\nfunction greet(name)\n    return "Welcome to AS Service, " .. name\nend\n\nprint(greet("Developer"))'
  },
  KOTLIN: {
    name: 'Kotlin',
    icon: '🎯',
    isNative: false,
    category: 'Systems',
    description: 'Modern, cross-platform, statically typed programming language.',
    template: 'fun main() {\n    val language = "Kotlin"\n    println("Hello from $language!")\n    \n    repeat(3) {\n        println("Kotlin is expressive!")\n    }\n}'
  },
  RUST: {
    name: 'Rust',
    icon: '🦀',
    isNative: false,
    category: 'Systems',
    description: 'Blazingly fast and memory-efficient systems programming.',
    template: 'fn main() {\n    println!("Hello from Rust!");\n    \n    let vec = vec![10, 20, 30];\n    for x in vec {\n        println!("Value: {}", x);\n    }\n}'
  },
  GO: {
    name: 'Go',
    icon: '🐹',
    isNative: false,
    category: 'Systems',
    description: 'Open source programming language that makes it easy to build simple, reliable, and efficient software.',
    template: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n    \n    for i := 0; i < 3; i++ {\n        fmt.Printf("Tick: %d\\n", i)\n    }\n}'
  },
  C: {
    name: 'C',
    icon: '⌨️',
    isNative: false,
    category: 'Systems',
    description: 'The foundation of modern computing.',
    template: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    int i;\n    for(i = 0; i < 4; i++) {\n        printf("Index %d\\n", i);\n    }\n    return 0;\n}'
  },
  ASSEMBLY: {
    name: 'Assembly',
    icon: '🔌',
    isNative: false,
    category: 'Systems',
    description: 'Low-level hardware interaction using x86 syntax.',
    template: '; x86 NASM Syntax Example\nsection .data\n    msg db \'Hello from Assembly!\', 0xA\n    len equ $ - msg\n\nsection .text\n    global _start\n\n_start:\n    mov eax, 4      ; sys_write\n    mov ebx, 1      ; stdout\n    mov ecx, msg\n    mov edx, len\n    int 0x80\n\n    mov eax, 1      ; sys_exit\n    xor ebx, ebx\n    int 0x80'
  },
  COBOL: {
    name: 'COBOL',
    icon: '📠',
    isNative: false,
    category: 'Systems',
    description: 'Business-oriented programming language for legacy systems.',
    template: '       IDENTIFICATION DIVISION.\n       PROGRAM-ID. HELLO-WORLD.\n       PROCEDURE DIVISION.\n           DISPLAY \'Hello from COBOL!\'.\n           DISPLAY \'Running on legacy virtualization.\'.\n           STOP RUN.'
  },
  OBJECTIVE_C: {
    name: 'Objective-C',
    icon: '🍎',
    isNative: false,
    category: 'Systems',
    description: 'Object-oriented programming used by Apple.',
    template: '#import <Foundation/Foundation.h>\n\nint main(int argc, const char * argv[]) {\n    @autoreleasepool {\n        NSLog(@"Hello from Objective-C!");\n        NSArray *langs = @[@"Objective-C", @"Swift"];\n        for (NSString *l in langs) {\n            NSLog(@"Developing for Apple: %@", l);\n        }\n    }\n    return 0;\n}'
  },
  SWIFT: {
    name: 'Swift',
    icon: '🐦',
    isNative: false,
    category: 'Systems',
    description: 'Fast, modern, and safe language for Apple platforms.',
    template: 'print("Hello from Swift!")\n\nlet cities = ["Cupertino", "London", "Tokyo"]\nfor city in cities {\n    print("Checking weather in \\(city)...")\n}'
  },
  SQLITE: {
    name: 'SQLite',
    icon: '💾',
    isNative: false,
    category: 'Database',
    description: 'Self-contained, serverless, zero-configuration SQL database.',
    template: '-- SQLite Environment\nCREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER);\nINSERT INTO tasks (title, done) VALUES (\'Build App\', 0), (\'Test SQL\', 1);\n\nSELECT * FROM tasks;'
  },
  MYSQL: {
    name: 'MySQL',
    icon: '🐬',
    isNative: false,
    category: 'Database',
    description: 'The world\'s most popular open-source database.',
    template: '-- MySQL Environment\nCREATE TABLE products (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    name VARCHAR(255),\n    price DECIMAL(10,2)\n);\n\nINSERT INTO products (name, price) VALUES (\'Laptop\', 999.99), (\'Mouse\', 25.50);\n\nSELECT name, price FROM products ORDER BY price DESC;'
  },
  SQL_SERVER: {
    name: 'SQL Server',
    icon: '🏢',
    isNative: false,
    category: 'Database',
    description: 'Enterprise relational database management system by Microsoft.',
    template: '-- SQL Server (T-SQL) Environment\nCREATE TABLE Employees (\n    ID INT PRIMARY KEY,\n    Name NVARCHAR(100),\n    Department NVARCHAR(50)\n);\n\nINSERT INTO Employees VALUES (1, \'Alice\', \'Engineering\'), (2, \'Bob\', \'Design\');\n\nSELECT * FROM Employees WHERE Department = \'Engineering\';'
  },
  MONGODB: {
    name: 'MongoDB',
    icon: '🍃',
    isNative: false,
    category: 'Database',
    description: 'Leading NoSQL document database.',
    template: '// MongoDB Shell Script\ndb.users.insertMany([\n  { name: "Alice", role: "Dev", age: 28 },\n  { name: "Bob", role: "Designer", age: 32 },\n  { name: "Charlie", role: "Dev", age: 22 }\n]);\n\n// Aggregate or Find data\ndb.users.find({ role: "Dev" }).sort({ age: -1 });'
  },
  NOSQL: {
    name: 'NoSQL Store',
    icon: '🗳️',
    isNative: false,
    category: 'Database',
    description: 'Generic key-value store simulation.',
    template: '// Generic NoSQL Document Interaction\nSET "session:user_123" {\n    "login": "2025-05-20",\n    "active": true,\n    "metadata": { "ip": "192.168.1.1" }\n}\n\nGET "session:user_123"\n\nQUERY "SELECT * FROM sessions WHERE active = true"'
  },
  ORACLE: {
    name: 'Oracle DB',
    icon: '🚩',
    isNative: false,
    category: 'Database',
    description: 'Multi-model database management system by Oracle.',
    template: '-- Oracle PL/SQL Environment\nCREATE TABLE Projects (\n    project_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n    title VARCHAR2(100) NOT NULL,\n    start_date DATE DEFAULT SYSDATE\n);\n\nINSERT INTO Projects (title) VALUES (\'Global Expansion\');\nINSERT INTO Projects (title) VALUES (\'AI Integration\');\n\nSELECT title, TO_CHAR(start_date, \'YYYY-MM-DD\') as date_formed FROM Projects;\nSELECT SYSDATE FROM DUAL;'
  },
  CPP: {
    name: 'C++',
    icon: '⚙️',
    isNative: false,
    category: 'Systems',
    description: 'Powerful, performance-oriented systems language.',
    template: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from Simulated C++!" << std::endl;\n    for(int i=0; i<3; ++i) {\n        std::cout << "Loop index: " << i << std::endl;\n    }\n    return 0;\n}'
  },
  JAVA: {
    name: 'Java',
    icon: '☕',
    isNative: false,
    category: 'Systems',
    description: 'Platform-independent, object-oriented language.',
    template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Simulated Java!");\n        int sum = 0;\n        for(int i=1; i<=10; i++) sum += i;\n        System.out.println("Sum of 1-10: " + sum);\n    }\n}'
  },
  CSHARP: {
    name: 'C#',
    icon: '🔷',
    isNative: false,
    category: 'Systems',
    description: 'Modern language for building secure and robust applications that run on .NET.',
    template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from Simulated C#!");\n        var now = DateTime.Now;\n        Console.WriteLine($"Current Simulated Time: {now}");\n    }\n}'
  },
  PASCAL: {
    name: 'Pascal',
    icon: '📜',
    isNative: false,
    category: 'Systems',
    description: 'Classic programming language for structured programming.',
    template: 'program HelloWorld;\nbegin\n  writeln(\'Hello from Simulated Pascal!\');\n  writeln(\'Classic coding at its best.\');\nend.'
  },
  BASIC: {
    name: 'BASIC',
    icon: '📟',
    isNative: false,
    category: 'Systems',
    description: 'Simple, easy-to-learn language from the classic computing era.',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

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
    setSearchQuery('');
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

  const filteredLanguages = (Object.keys(LANGUAGES) as LanguageMode[]).filter(key => 
    LANGUAGES[key].name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    LANGUAGES[key].category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Code Playground</h1>
          <p className="text-slate-500 font-medium">Professional development IDE with multi-arch virtualization.</p>
        </div>

        {/* Remodeled Language Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full md:w-[320px] bg-white border border-slate-200 px-6 py-4 rounded-[2rem] flex items-center justify-between shadow-lg transition-all hover:border-indigo-400 group ring-4 ring-transparent ${isDropdownOpen ? 'ring-indigo-50 border-indigo-400' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                {LANGUAGES[mode].icon}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none mb-1">Active Runtime</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{LANGUAGES[mode].name}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${LANGUAGES[mode].isNative ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {LANGUAGES[mode].isNative ? 'Native' : 'AI-Sim'}
                  </span>
                </div>
              </div>
            </div>
            <span className={`text-slate-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-full md:w-[320px] bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border-indigo-50">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Language List */}
              <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                {CATEGORIES.map(cat => {
                  const catLangs = filteredLanguages.filter(k => LANGUAGES[k].category === cat);
                  if (catLangs.length === 0) return null;
                  
                  return (
                    <div key={cat}>
                      <div className="px-6 py-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat}</span>
                      </div>
                      <div className="px-3 space-y-1 pb-4">
                        {catLangs.map((langKey) => (
                          <button
                            key={langKey}
                            onClick={() => changeLanguage(langKey)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden ${
                              mode === langKey 
                                ? 'bg-slate-900 text-white shadow-xl scale-[1.02] z-10' 
                                : 'hover:bg-indigo-50 text-slate-700'
                            }`}
                          >
                            <span className="text-xl shrink-0 group-hover:scale-125 transition-transform">{LANGUAGES[langKey].icon}</span>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-bold text-sm truncate">{LANGUAGES[langKey].name}</p>
                              {mode !== langKey && (
                                <p className="text-[10px] text-slate-400 truncate opacity-60 group-hover:opacity-100">{LANGUAGES[langKey].description || 'IDE Runtime'}</p>
                              )}
                            </div>
                            {!LANGUAGES[langKey].isNative && (
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${mode === langKey ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>AI</span>
                            )}
                            {mode === langKey && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {filteredLanguages.length === 0 && (
                  <div className="py-10 text-center opacity-30">
                    <span className="text-4xl block mb-2">🔎</span>
                    <p className="text-xs font-bold uppercase tracking-widest">No results found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px] mb-8">
        {/* Editor Side */}
        <div className="flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700 relative">
          <div className="bg-slate-800 px-8 py-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-inner"></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{LANGUAGES[mode].name.toUpperCase()} REPL</span>
              {isRunning && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>}
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-10 bg-slate-900 text-indigo-200 font-mono text-sm leading-relaxed outline-none resize-none selection:bg-indigo-500/30"
            spellCheck={false}
          />
          
          <div className="p-6 bg-slate-800/50 backdrop-blur-md flex flex-col sm:flex-row gap-4 border-t border-slate-700">
            {mode !== 'WEB' && (
              <button
                onClick={runCode}
                disabled={isRunning || (mode === 'PYTHON' && isPyodideLoading)}
                className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 active:scale-[0.98] disabled:opacity-50"
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
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/40 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="text-lg">✨</span>
              <span>AI Debugger</span>
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
          <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between border-b border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {mode === 'WEB' ? 'Interactive Render' : 'Virtual Console'}
            </span>
            {mode !== 'WEB' && (
              <button 
                onClick={() => setOutput('')}
                className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase flex items-center gap-1.5"
              >
                <span>🗑️</span>
                <span>Clear Console</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto bg-slate-50 relative group">
            {mode === 'WEB' ? (
              <iframe 
                ref={iframeRef}
                title="preview"
                className="w-full h-full border-none bg-white"
              />
            ) : (
              <div className="p-10 font-mono text-xs text-slate-700 leading-relaxed min-h-full selection:bg-indigo-100">
                <pre className="whitespace-pre-wrap break-all">
                  {output || (mode === 'PYTHON' && isPyodideLoading ? "[System] Booting Python WASM Kernel..." : "[Console] Environment ready. Waiting for input...")}
                </pre>
                {isRunning && mode !== 'PYTHON' && (
                  <div className="mt-6 flex items-center gap-3 text-indigo-600 font-bold bg-indigo-50 w-fit px-4 py-2 rounded-xl animate-pulse">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span>AI Cloud Execution in Progress...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-xl">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
          🛡️
        </div>
        <div className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          <strong className="text-slate-900 block mb-1">Compute Policy:</strong> 
          AS Service utilizes a hybrid compute model. <span className="font-black text-emerald-600">NATIVE</span> modes run strictly on your CPU using WebAssembly. <span className="font-black text-indigo-600">VIRTUAL</span> modes use low-latency AI inference to simulate architecture-specific behavior and state transitions.
        </div>
      </div>
    </div>
  );
};

export default CodePlaygroundView;
