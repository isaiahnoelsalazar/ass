
import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', desc: 'Warm & Professional' },
  { id: 'Kore', name: 'Kore', desc: 'Bright & Energetic' },
  { id: 'Puck', name: 'Puck', desc: 'Calm & Steady' },
  { id: 'Charon', name: 'Charon', desc: 'Deep & Resonant' },
];

const VoiceHubView: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeak = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate speech. Check API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-cyan-600 rounded-3xl flex items-center justify-center text-4xl text-white mx-auto mb-6 shadow-xl shadow-cyan-100">🔊</div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Voice Hub</h1>
        <p className="text-slate-500">Transform text into crystal-clear speech with advanced AI voices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Content to Speak</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here to hear it read aloud..."
              className="w-full h-64 p-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-lg text-slate-800"
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSpeak}
                disabled={isGenerating || !text.trim()}
                className="px-10 py-4 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all disabled:opacity-50 shadow-xl shadow-cyan-100 flex items-center gap-2"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : '🔊 Speak Text'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>🎭</span> Select Voice
            </h3>
            <div className="space-y-3">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${
                    selectedVoice === voice.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <p className={`font-bold ${selectedVoice === voice.id ? 'text-cyan-700' : 'text-slate-700'}`}>
                    {voice.name}
                  </p>
                  <p className="text-xs text-slate-400">{voice.desc}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-3xl text-white shadow-lg">
            <h4 className="font-bold mb-2">Pro Tip</h4>
            <p className="text-xs opacity-90 leading-relaxed">
              Use "Say cheerfully:" or "Speak sadly:" in your text to influence the AI's emotional tone!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceHubView;
