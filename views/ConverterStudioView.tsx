
import React, { useState, useEffect } from 'react';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

type UnitCategory = 'MASS' | 'LENGTH' | 'TEMPERATURE' | 'DATA' | 'VOLUME';

interface Unit {
  id: string;
  name: string;
  factor: number;
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

const ConverterStudioView: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('MASS');
  const [unitValue, setUnitValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');

  useEffect(() => {
    const config = UNIT_MAP[category];
    setFromUnit(config.units[0].id);
    setToUnit(config.units[1]?.id || config.units[0].id);
  }, [category]);

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
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Converter Studio</h1>
        <p className="text-slate-500">Precision unit transformation for engineering and daily calculations.</p>
      </header>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full -mr-48 -mt-48 blur-3xl -z-0"></div>
        
        <div className="flex items-center gap-6 mb-12 relative z-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl text-white shadow-xl shadow-indigo-100">⚖️</div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Transformation Hub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Universal Physical Scalar Matrix</p>
          </div>
        </div>

        <div className="flex bg-slate-50 p-2 rounded-3xl mb-12 relative z-10 overflow-x-auto no-scrollbar gap-1">
          {(Object.keys(UNIT_MAP) as UnitCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 min-w-[130px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                category === cat 
                ? 'bg-white text-indigo-600 shadow-lg translate-y-[-1px]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 relative z-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Source Value</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="number" 
                value={unitValue} 
                onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                className="flex-[2] p-7 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all text-3xl font-black text-slate-800 outline-none"
              />
              <select 
                value={fromUnit} 
                onChange={(e) => setFromUnit(e.target.value)}
                className="flex-1 p-7 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-500 appearance-none cursor-pointer"
              >
                {UNIT_MAP[category].units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="lg:col-span-1 flex items-center justify-center pt-4 lg:pt-0">
            <button 
              onClick={handleSwap}
              className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all hover:rotate-180 duration-500 shadow-md active:scale-90"
              title="Swap Units"
            >
              <span className="text-2xl">⇄</span>
            </button>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Converted Output</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-[2] p-7 bg-indigo-600 text-white rounded-[2rem] font-black text-3xl flex items-center shadow-2xl shadow-indigo-100/50 truncate">
                {convertUnits()}
              </div>
              <select 
                value={toUnit} 
                onChange={(e) => setToUnit(e.target.value)}
                className="flex-1 p-7 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-500 appearance-none cursor-pointer"
              >
                {UNIT_MAP[category].units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Calculation Logic</p>
              <p className="text-xs font-bold text-slate-500">IEEE 754 Compliant</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Runtime</p>
              <p className="text-xs font-bold text-slate-500">Local Browser JS</p>
            </div>
          </div>
          <div className="hidden md:block text-[10px] font-bold text-slate-300 uppercase tracking-widest animate-pulse">
            Ready for Input
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterStudioView;
