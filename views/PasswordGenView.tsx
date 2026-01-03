
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
    logActivity(ToolType.PASSWORD_GEN, 'Password Generated', `${passLength} characters`);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Password Generator</h1>
        <p className="text-slate-500 text-sm">Create secure passwords for your accounts.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">Password Length</label>
            <span className="text-lg font-bold text-indigo-600">{passLength}</span>
          </div>
          <input 
            type="range" min="8" max="64" value={passLength} 
            onChange={(e) => setPassLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Short</span>
            <span>Strong</span>
            <span>Extra Secure</span>
          </div>
        </div>

        <button 
          onClick={generatePassword}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <span>⚡</span> Generate Password
        </button>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Result</label>
          <div className="relative group">
            <input 
              readOnly 
              value={password} 
              placeholder="Click generate..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg text-slate-800 outline-none"
            />
            {password && (
              <button 
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <span className="text-base">🛡️</span>
        <p>Your passwords are generated locally and are never stored or transmitted. Close this tab to clear your session data.</p>
      </div>
    </div>
  );
};

export default PasswordGenView;
