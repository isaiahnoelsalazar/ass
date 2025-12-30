
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const ImageGenView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const url = await generateImage(prompt);
      setGeneratedImage(url);
      logActivity(ToolType.IMAGE_GEN, 'Generated Image', prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''));
    } catch (err) {
      setError('Generation failed. Please try a different prompt or check API settings.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center text-4xl text-white mx-auto mb-6 shadow-xl shadow-rose-100">🎨</div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Visual Creator</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Describe what you want to see, and our AI will dream it into reality. Be as descriptive as possible!</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A futuristic city at sunset in cyberpunk style..."
            className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none text-lg"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : 'Generate'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl mb-6 text-sm font-medium border border-rose-100">
            ⚠️ {error}
          </div>
        )}

        <div className="min-h-[400px] w-full bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group">
          {generatedImage ? (
            <>
              <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a href={generatedImage} download="ai-creation.png" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Download</a>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4 opacity-20">🖼️</div>
              <p className="text-slate-400 font-medium">Your creation will appear here</p>
              <p className="text-xs text-slate-300 mt-2 italic">Try: "A cozy library with floating books and warm light"</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ratio</p>
          <p className="text-sm font-semibold text-slate-700">1:1 Square</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Model</p>
          <p className="text-sm font-semibold text-slate-700">Gemini 2.5</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Quality</p>
          <p className="text-sm font-semibold text-slate-700">Ultra HD</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Speed</p>
          <p className="text-sm font-semibold text-slate-700">Fast</p>
        </div>
      </div>
    </div>
  );
};

export default ImageGenView;
