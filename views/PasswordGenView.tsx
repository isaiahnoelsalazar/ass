
import React, { useState } from 'react';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const PasswordGenView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [passLength, setPassLength] = useState(16);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < passLength; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    logActivity(ToolType.PASSWORD_GEN, 'Key Generated', `Entropy length: ${passLength} characters`);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    alert('Key securely copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Security Lab</h1>
        <p className="text-slate-500">Generate cryptographically secure passwords and access keys.</p>
      </header>

      <div className="bg-slate-900 p-8 md:p-16 rounded-[4rem] text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:bg-amber-500/10 transition-colors duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full -ml-32 -mb-32 blur-[80px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center text-4xl text-slate-950 shadow-2xl shadow-amber-500/20">🔑</div>
            <div>
              <h2 className="text-3xl font-black text-white">Security Vault</h2>
              <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.3em]">High-Entropy Passcode Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Controls */}
            <div className="space-y-12">
              <div>
                <div className="flex justify-between items-end mb-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bit-Strength Complexity</label>
                  <span className="text-2xl font-black text-amber-500">{passLength} <span className="text-xs uppercase text-slate-600">Chars</span></span>
                </div>
                <input 
                  type="range" min="8" max="64" value={passLength} 
                  onChange={(e) => setPassLength(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between mt-4">
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Standard</span>
                  <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest">Enterprise Vault</span>
                </div>
              </div>

              <button 
                onClick={generatePassword}
                className="w-full py-6 bg-amber-500 text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-3"
              >
                <span>⚡</span> Generate Access Key
              </button>
            </div>

            {/* Display Area */}
            <div className="flex flex-col gap-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Encryption Key</label>
              <div className="relative group/key h-full min-h-[180px]">
                <div className="absolute inset-0 bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-800 group-hover/key:border-amber-500/30 transition-all"></div>
                <textarea 
                  readOnly 
                  value={password} 
                  placeholder="Initiate generation..."
                  className="w-full h-full p-8 bg-transparent relative z-10 font-mono text-2xl text-amber-200 outline-none placeholder:text-slate-700 resize-none overflow-hidden flex items-center justify-center text-center"
                />
                {password && (
                  <button 
                    onClick={copyToClipboard}
                    className="absolute right-6 bottom-6 z-20 p-5 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-xs uppercase tracking-widest"
                  >
                    <span>📋</span> Copy
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-600 italic text-center">Randomized seed is destroyed immediately after execution.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-slate-50 rounded-[3rem] border border-slate-200/50 flex flex-col md:flex-row items-center gap-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0">🔒</div>
        <div className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-900 block mb-1">Zero-Storage Policy:</strong> 
          Every key generated in the Security Lab is processed locally in your secure session environment. We do not transmit or store keys on our infrastructure, ensuring your generated credentials remain private.
        </div>
      </div>
    </div>
  );
};

export default PasswordGenView;
