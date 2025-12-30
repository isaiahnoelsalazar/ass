
import React, { useState } from 'react';

const UtilityBoxView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [passLength, setPassLength] = useState(16);
  const [unitValue, setUnitValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < passLength; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
  };

  const convertUnits = () => {
    if (fromUnit === 'kg' && toUnit === 'lb') return (unitValue * 2.20462).toFixed(2);
    if (fromUnit === 'lb' && toUnit === 'kg') return (unitValue / 2.20462).toFixed(2);
    if (fromUnit === 'km' && toUnit === 'mi') return (unitValue * 0.621371).toFixed(2);
    if (fromUnit === 'mi' && toUnit === 'km') return (unitValue / 0.621371).toFixed(2);
    return unitValue;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Utility Box</h1>
        <p className="text-slate-500">Quick tools for common everyday tasks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Gen */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl text-white mb-6">🔑</div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Secure Password Generator</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Length: {passLength}</label>
              <input 
                type="range" min="8" max="64" value={passLength} 
                onChange={(e) => setPassLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            
            <div className="flex gap-2">
              <input 
                readOnly value={password} 
                placeholder="Click Generate..."
                className="flex-1 p-4 bg-slate-50 rounded-xl font-mono text-sm border-none focus:ring-0"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  alert('Copied!');
                }}
                className="px-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                title="Copy"
              >
                📋
              </button>
            </div>
            
            <button 
              onClick={generatePassword}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-100"
            >
              Generate New Password
            </button>
          </div>
        </div>

        {/* Unit Converter */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl text-white mb-6">⚖️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Converter</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input 
                type="number" value={unitValue} 
                onChange={(e) => setUnitValue(parseFloat(e.target.value))}
                className="w-24 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
              />
              <select 
                value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                className="flex-1 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-center py-2 text-slate-300">
              <span className="text-2xl">↓</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-24 p-4 bg-indigo-50 text-indigo-700 font-bold text-center rounded-xl border border-indigo-100">
                {convertUnits()}
              </div>
              <select 
                value={toUnit} onChange={(e) => setToUnit(e.target.value)}
                className="flex-1 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="lb">Pounds (lb)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="mi">Miles (mi)</option>
                <option value="km">Kilometers (km)</option>
              </select>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 italic">Common conversion factors applied locally.</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-100">
        <div>
          <h2 className="text-2xl font-bold mb-2">Need a custom tool?</h2>
          <p className="opacity-90 max-w-md">Our automatic systems are constantly evolving. Suggest a tool and we might build it into the next update!</p>
        </div>
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 transition-transform">
          Submit Suggestion
        </button>
      </div>
    </div>
  );
};

export default UtilityBoxView;
