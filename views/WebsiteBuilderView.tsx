
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

type EditorTab = 'HTML' | 'CSS' | 'JS';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const WebsiteBuilderView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [html, setHtml] = useState('<!-- Describe a site to begin -->\n<div class="welcome">\n  <h1>Website Builder</h1>\n  <p>Use the AI Prompt to generate a full design.</p>\n</div>');
  const [css, setCss] = useState('.welcome {\n  font-family: sans-serif;\n  text-align: center;\n  padding: 50px;\n  color: #6366f1;\n}');
  const [js, setJs] = useState('console.log("Ready to build!");');
  const [activeTab, setActiveTab] = useState<EditorTab>('HTML');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    updatePreview();
  }, [html, css, js]);

  const updatePreview = () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}<\/script>
        </body>
      </html>
    `;
    doc.open();
    doc.write(combined);
    doc.close();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional website based on this description: "${prompt}". 
        The website should be modern, clean, and fully responsive. 
        Provide the HTML, CSS, and JavaScript. 
        Note: The HTML should only contain the contents of the body tag (don't include <html>, <head>, or <body> tags).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              html: { type: Type.STRING, description: "The HTML structure (inside body only)" },
              css: { type: Type.STRING, description: "The full CSS styling" },
              js: { type: Type.STRING, description: "The JavaScript logic" }
            },
            required: ["html", "css", "js"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.html) setHtml(data.html);
      if (data.css) setCss(data.css);
      if (data.js) setJs(data.js);
      
      logActivity(ToolType.WEBSITE_BUILDER, 'Generated Website', `AI created site for: ${prompt.slice(0, 30)}...`);
    } catch (err) {
      console.error(err);
      alert('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProject = () => {
    const combined = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Website</title>
    <style>
    ${css}
    </style>
</head>
<body>
    ${html}
    <script>
    ${js}
    </script>
</body>
</html>`;
    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-website.html';
    a.click();
    logActivity(ToolType.WEBSITE_BUILDER, 'Downloaded Website', 'Exported single-file HTML bundle');
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Website Builder</h1>
          <p className="text-slate-500 font-medium">AI-driven architectural design for modern web interfaces.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadProject}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <span>📥</span> Download HTML
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
        {/* Left Control Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">AI Designer</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A sleek landing page for a coffee shop with a hero section, menu grid, and contact form..."
              className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-lg">🏗️</span>
                  <span>Build Website</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source Code</h3>
              <div className="flex bg-slate-800 p-1 rounded-xl">
                {(['HTML', 'CSS', 'JS'] as EditorTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={activeTab === 'HTML' ? html : activeTab === 'CSS' ? css : js}
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === 'HTML') setHtml(val);
                else if (activeTab === 'CSS') setCss(val);
                else setJs(val);
              }}
              className="flex-1 w-full bg-transparent font-mono text-xs text-indigo-200 outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
          <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500/80 shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-inner"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-inner"></div>
            </div>
            
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button 
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                title="Desktop"
              >
                🖥️
              </button>
              <button 
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                title="Tablet"
              >
                📱
              </button>
              <button 
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-white shadow-sm' : 'opacity-40'}`}
                title="Mobile"
              >
                🤳
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-200/20 flex items-center justify-center p-4">
            <div 
              className="bg-white shadow-2xl transition-all duration-500 ease-in-out border border-slate-200/50 overflow-hidden"
              style={{ width: getViewportWidth(), height: '100%', borderRadius: viewport === 'desktop' ? '0' : '2rem' }}
            >
              <iframe 
                ref={iframeRef}
                title="website-preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex items-center gap-6 shadow-sm">
        <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
          📐
        </div>
        <div className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          <strong className="text-slate-900 block mb-1">Architectural Engine:</strong> 
          The Website Builder combines a high-level LLM with a responsive CSS injector. It is designed for rapid prototyping of multi-component interfaces. For custom interactivity beyond basic scripting, you can manually refine the <span className="font-bold text-indigo-600">JS source</span> in the code editor.
        </div>
      </div>

      <br/>
    </div>
  );
};

export default WebsiteBuilderView;
