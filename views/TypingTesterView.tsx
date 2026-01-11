
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const DEFAULT_WORDS = "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and data management. Swift keyboards allow for rapid data entry in modern computing systems. Artificial intelligence is transforming how we interact with information and automate repetitive tasks across various industries around the world today.".split(' ');

const TypingTesterView: React.FC = () => {
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with random words
  useEffect(() => {
    resetTest();
  }, []);

  const resetTest = (newText?: string) => {
    const text = newText || DEFAULT_WORDS.sort(() => Math.random() - 0.5).slice(0, 40).join(' ');
    setTargetText(text);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (endTime) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Calculate mistakes
    let currentMistakes = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        currentMistakes++;
      }
    }
    setMistakes(currentMistakes);

    setUserInput(value);

    // End condition
    if (value.length === targetText.length) {
      setEndTime(Date.now());
      logActivity(ToolType.TYPING_TESTER, 'Test Completed', `Speed: ${wpm} WPM | Accuracy: ${accuracy}%`);
    }
  };

  // Live Stats Calculation
  useEffect(() => {
    if (!startTime || endTime) return;

    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const wordsTyped = userInput.length / 5;
      const currentWpm = Math.round(wordsTyped / elapsedMinutes);
      setWpm(currentWpm > 0 ? currentWpm : 0);

      const currentAccuracy = Math.max(0, Math.round(((userInput.length - mistakes) / userInput.length) * 100));
      setAccuracy(isNaN(currentAccuracy) ? 100 : currentAccuracy);
    }, 500);

    return () => clearInterval(interval);
  }, [startTime, endTime, userInput, mistakes]);

  const generateAiChallenge = async (theme: string) => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a challenging typing test paragraph (approx 50 words) about: ${theme}. 
        Keep it to standard ASCII characters. No formatting, just the text.`,
      });
      const text = response.text?.trim();
      if (text) resetTest(text);
    } catch (err) {
      console.error(err);
      alert("AI failed to generate challenge. Using defaults.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderCharacters = () => {
    return targetText.split('').map((char, index) => {
      let colorClass = 'text-slate-300';
      let bgClass = '';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = 'text-emerald-500';
        } else {
          colorClass = 'text-rose-500';
          bgClass = 'bg-rose-50';
        }
      } else if (index === userInput.length) {
        bgClass = 'bg-amber-200 animate-pulse rounded-sm';
        colorClass = 'text-slate-900';
      }

      return (
        <span 
          key={index} 
          className={`inline-block font-mono text-2xl transition-all duration-75 px-[1px] ${colorClass} ${bgClass}`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col px-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Typing Speed Lab</h1>
          <p className="text-slate-500 font-medium italic">Master your efficiency with real-time telemetry.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={() => generateAiChallenge('Cyberpunk Future')}
            disabled={isAiLoading}
            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-50"
           >
            {isAiLoading ? 'Dreaming...' : '✨ AI Challenge'}
           </button>
           <button 
            onClick={() => resetTest()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm"
           >
            🔄 Reset
           </button>
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Speed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-amber-600 tabular-nums">{endTime ? Math.round((userInput.length / 5) / ((endTime - (startTime || 0)) / 60000)) : wpm}</span>
            <span className="text-xl font-bold text-slate-300">WPM</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-emerald-500 tabular-nums">{accuracy}</span>
            <span className="text-xl font-bold text-slate-300">%</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-slate-900 tabular-nums">
              {startTime ? Math.max(0, Math.floor(((endTime || Date.now()) - startTime) / 1000)) : 0}
            </span>
            <span className="text-xl font-bold text-slate-300">SEC</span>
          </div>
        </div>
      </div>

      {/* Action Indicator / Tooltip Section */}
      <div className="h-12 flex items-center justify-center mb-2">
        {!startTime && !endTime && (
          <div className="flex items-center gap-3 px-6 py-2 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] animate-bounce shadow-sm">
            <span className="text-lg">⌨️</span> Start typing to begin...
          </div>
        )}
        {startTime && !endTime && (
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Recording Performance...
          </div>
        )}
      </div>

      {/* Typing Workspace */}
      <div 
        className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 relative cursor-text group min-h-[400px]"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="max-w-4xl mx-auto leading-relaxed select-none relative z-0">
          {renderCharacters()}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="absolute inset-0 opacity-0 cursor-default pointer-events-none"
          autoFocus
        />

        {endTime && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-[3rem] z-20 animate-in fade-in duration-500">
            <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100 max-w-md w-full">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🏆</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Test Complete!</h2>
              <p className="text-slate-500 mb-8 font-medium">You reached <span className="text-amber-600 font-bold">{wpm} WPM</span> with <span className="text-emerald-600 font-bold">{accuracy}% accuracy</span>.</p>
              <button 
                onClick={() => resetTest()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Knowledge Base Overlay */}
      <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center gap-8 border border-slate-800">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
          🧠
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg mb-1 tracking-tight">The 5-Character Rule</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard WPM is calculated by taking the number of characters typed and dividing by 5 (the average length of an English word). This ensures your speed metric is normalized across different vocabularies and AI-generated technical challenges.
          </p>
        </div>
      </div>

      <br />
    </div>
  );
};

export default TypingTesterView;
