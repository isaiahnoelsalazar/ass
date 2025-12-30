
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";

const DocStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'EXTRACT'>('CREATE');
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleExportPDF = () => {
    if (!textContent.trim()) return;
    const doc = new jsPDF();
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    const splitText = doc.splitTextToSize(textContent, 180);
    
    let cursorY = 20;
    splitText.forEach((line: string) => {
      if (cursorY + 10 > pageHeight) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, margin, cursorY);
      cursorY += 7;
    });
    
    doc.save('converted-document.pdf');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setExtractedText('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'application/pdf'
                }
              },
              { text: "Please extract all text from this PDF and format it cleanly. If it contains tables, represent them in markdown." }
            ]
          }
        });
        
        setExtractedText(response.text || 'No text could be extracted.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Failed to process PDF. Check your API key and file format.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Document Studio</h1>
          <p className="text-slate-500">Professional conversion and extraction toolkit.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('CREATE')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'CREATE' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create PDF
          </button>
          <button 
            onClick={() => setActiveTab('EXTRACT')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'EXTRACT' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Extract PDF
          </button>
        </div>
      </div>

      {activeTab === 'CREATE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Editor</span>
                <span className="text-xs text-slate-400">{textContent.length} characters</span>
              </div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Start typing your document here... You can copy-paste from any source."
                className="w-full h-[500px] p-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-800 leading-relaxed"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl sticky top-8">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleExportPDF}
                  disabled={!textContent.trim()}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>📥</span> Export to PDF
                </button>
                <button 
                  onClick={() => setTextContent('')}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Clear Editor
                </button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Document Tips</p>
                <ul className="text-xs text-slate-500 space-y-3">
                  <li className="flex gap-2"><span>•</span> Use double enters for paragraphs.</li>
                  <li className="flex gap-2"><span>•</span> This tool generates a clean A4 layout.</li>
                  <li className="flex gap-2"><span>•</span> Best for reports, letters, and simple docs.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-12 rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-3xl mb-6 text-purple-600">📄</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Extract Text from PDF</h2>
            <p className="text-slate-500 max-w-md mb-8">Upload any PDF file. Our AI will analyze the layout and provide you with an editable text version.</p>
            
            <label className="cursor-pointer bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-100">
              {isLoading ? 'Processing...' : 'Choose PDF File'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
            </label>
          </div>

          {(extractedText || isLoading) && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Extracted Content</h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(extractedText);
                    alert('Text copied!');
                  }}
                  className="text-sm font-bold text-purple-600 hover:underline"
                >
                  Copy to Clipboard
                </button>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl min-h-[200px] font-mono text-sm whitespace-pre-wrap text-slate-700 leading-relaxed border border-slate-100">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-4">
                    <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">Gemini is reading your document...</p>
                  </div>
                ) : (
                  extractedText
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocStudioView;
