
import React, { useState, useEffect } from 'react';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

type UnitCategory = 'MASS' | 'LENGTH' | 'TEMPERATURE' | 'DATA' | 'VOLUME';

interface Unit {
  id: string;
  name: string;
  factor: number; // Multiplier relative to category base unit
}

const UNIT_MAP: Record<UnitCategory, { base: string; units: Unit[] }> = {
  MASS: {
    base: 'kg',
    units: [
      { id: 'kg', name: 'Kilograms (kg)', factor: 1 },
      { id: 'g', name: 'Grams (g)', factor: 0.001 },
      { id: 'lb', name: 'Pounds (lb)', factor: 0.453592 },
      { id: 'oz', name: 'Ounces (oz)', factor: 0.0283495 },
      { id: 'mt', name: 'Metric Tons (t)', factor: 1000 },
    ]
  },
  LENGTH: {
    base: 'm',
    units: [
      { id: 'km', name: 'Kilometers (km)', factor: 1000 },
      { id: 'm', name: 'Meters (m)', factor: 1 },
      { id: 'cm', name: 'Centimeters (cm)', factor: 0.01 },
      { id: 'mi', name: 'Miles (mi)', factor: 1609.34 },
      { id: 'ft', name: 'Feet (ft)', factor: 0.3048 },
      { id: 'in', name: 'Inches (in)', factor: 0.0254 },
    ]
  },
  TEMPERATURE: {
    base: 'C',
    units: [
      { id: 'C', name: 'Celsius (°C)', factor: 1 },
      { id: 'F', name: 'Fahrenheit (°F)', factor: 1 },
      { id: 'K', name: 'Kelvin (K)', factor: 1 },
    ]
  },
  DATA: {
    base: 'MB',
    units: [
      { id: 'B', name: 'Bytes (B)', factor: 1 / 1048576 },
      { id: 'KB', name: 'Kilobytes (KB)', factor: 1 / 1024 },
      { id: 'MB', name: 'Megabytes (MB)', factor: 1 },
      { id: 'GB', name: 'Gigabytes (GB)', factor: 1024 },
      { id: 'TB', name: 'Terabytes (TB)', factor: 1048576 },
    ]
  },
  VOLUME: {
    base: 'L',
    units: [
      { id: 'L', name: 'Liters (L)', factor: 1 },
      { id: 'ml', name: 'Milliliters (ml)', factor: 0.001 },
      { id: 'gal', name: 'Gallons (gal)', factor: 3.78541 },
      { id: 'qt', name: 'Quarts (qt)', factor: 0.946353 },
      { id: 'pt', name: 'Pints (pt)', factor: 0.473176 },
      { id: 'cup', name: 'Cups', factor: 0.24 },
    ]
  }
};

const UtilityBoxView: React.FC = () => {
  // Password Gen State
  const [password, setPassword] = useState('');
  const [passLength, setPassLength] = useState(16);

  // Converter State
  const [category, setCategory] = useState<UnitCategory>('MASS');
  const [unitValue, setUnitValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');

  // Sync units when category changes
  useEffect(() => {
    const config = UNIT_MAP[category];
    setFromUnit(config.units[0].id);
    setToUnit(config.units[1]?.id || config.units[0].id);
  }, [category]);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < passLength; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    logActivity(ToolType.QUICK_TOOLS, 'Password Generated', `Length: ${passLength}`);
  };

  const convertUnits = (): string => {
    if (category === 'TEMPERATURE') {
      let celsius = unitValue;
      if (fromUnit === 'F') celsius = (unitValue - 32) * 5/9;
      if (fromUnit === 'K') celsius = unitValue - 273.15;

      if (toUnit === 'C') return celsius.toFixed(2);
      if (toUnit === 'F') return (celsius * 9/5 + 32).toFixed(2);
      if (toUnit === 'K') return (celsius + 273.15).toFixed(2);
      return unitValue.toString();
    }

    const config = UNIT_MAP[category];
    const fromFactor = config.units.find(u => u.id === fromUnit)?.factor || 1;
    const toFactor = config.units.find(u => u.id === toUnit)?.factor || 1;
    
    const result = (unitValue * fromFactor) / toFactor;
    return result < 0.0001 ? result.toExponential(4) : result.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Utility Box</h1>
        <p className="text-slate-500">Essential tools for your daily digital workflows.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Universal Converter Studio - Takes more space */}
        <div className="lg:col-span-3 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg shadow-indigo-100">⚖️</div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Converter Studio</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Universal Unit Transformation</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 overflow-x-auto no-scrollbar">
            {(Object.keys(UNIT_MAP) as UnitCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-1 min-w-[100px] py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  category === cat 
                  ? 'bg-white text-indigo-600 shadow-md' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">From</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={unitValue} 
                    onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                    className="flex-1 p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-slate-700"
                  />
                  <select 
                    value={fromUnit} 
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-40 p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-500"
                  >
                    {UNIT_MAP[category].units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="hidden md:flex items-end justify-center pb-2">
                <button 
                  onClick={handleSwap}
                  className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-all hover:rotate-180 duration-500"
                >
                  ⇄
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">To</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl flex items-center shadow-lg shadow-indigo-100">
                    {convertUnits()}
                  </div>
                  <select 
                    value={toUnit} 
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-40 p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-500"
                  >
                    {UNIT_MAP[category].units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">Precision: High</span>
              <span className="text-[10px] font-medium italic">Factors synced locally</span>
            </div>
          </div>
        </div>

        {/* Password Generator - Sidebar style */}
        <div className="lg:col-span-2 bg-slate-900 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl text-white mb-8 shadow-lg shadow-amber-900/40">🔑</div>
            <h2 className="text-2xl font-bold mb-2">Secure Pass Gen</h2>
            <p className="text-slate-400 text-sm mb-8">Generate military-grade encryption keys instantly.</p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Complexity</label>
                  <span className="text-sm font-black text-amber-500">{passLength} Chars</span>
                </div>
                <input 
                  type="range" min="8" max="64" value={passLength} 
                  onChange={(e) => setPassLength(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              
              <div className="relative group">
                <input 
                  readOnly value={password} 
                  placeholder="Click Generate Below..."
                  className="w-full p-5 bg-slate-800 border border-slate-700 rounded-2xl font-mono text-sm text-amber-200 outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
                />
                {password && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(password);
                      alert('Key Copied to Clipboard!');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={generatePassword}
            className="w-full mt-10 py-5 bg-amber-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/20 active:scale-95"
          >
            Generate Access Key
          </button>
        </div>
      </div>

      {/* Suggestion Section */}
      <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-3">Custom System Integration?</h2>
          <p className="opacity-80 max-w-lg leading-relaxed">Our Automatic System Service is built to scale. If your enterprise needs a specific conversion or utility tool, submit a feature request to our core engineering team.</p>
        </div>
        <button className="relative z-10 px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl active:scale-95">
          Submit Suggestion
        </button>
      </div>
    </div>
  );
};

export default UtilityBoxView;
