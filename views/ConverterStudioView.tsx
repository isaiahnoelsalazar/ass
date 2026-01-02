
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
      { id: 'kg', name: 'kg', factor: 1 },
      { id: 'g', name: 'g', factor: 0.001 },
      { id: 'lb', name: 'lb', factor: 0.453592 },
      { id: 'oz', name: 'oz', factor: 0.0283495 },
      { id: 'mt', name: 't', factor: 1000 },
    ]
  },
  LENGTH: {
    base: 'm',
    units: [
      { id: 'km', name: 'km', factor: 1000 },
      { id: 'm', name: 'm', factor: 1 },
      { id: 'cm', name: 'cm', factor: 0.01 },
      { id: 'mi', name: 'mi', factor: 1609.34 },
      { id: 'ft', name: 'ft', factor: 0.3048 },
      { id: 'in', name: 'in', factor: 0.0254 },
    ]
  },
  TEMPERATURE: {
    base: 'C',
    units: [
      { id: 'C', name: '°C', factor: 1 },
      { id: 'F', name: '°F', factor: 1 },
      { id: 'K', name: 'K', factor: 1 },
    ]
  },
  DATA: {
    base: 'MB',
    units: [
      { id: 'B', name: 'Bytes', factor: 1 / 1048576 },
      { id: 'KB', name: 'KB', factor: 1 / 1024 },
      { id: 'MB', name: 'MB', factor: 1 },
      { id: 'GB', name: 'GB', factor: 1024 },
      { id: 'TB', name: 'TB', factor: 1048576 },
    ]
  },
  VOLUME: {
    base: 'L',
    units: [
      { id: 'L', name: 'Liters', factor: 1 },
      { id: 'ml', name: 'ml', factor: 0.001 },
      { id: 'gal', name: 'Gal', factor: 3.78541 },
      { id: 'qt', name: 'Qt', factor: 0.946353 },
      { id: 'pt', name: 'Pt', factor: 0.473176 },
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
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Conversion Tool</h1>
        <p className="text-slate-500 text-sm">Convert units for mass, length, temperature, and more.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Category Selection */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          {(Object.keys(UNIT_MAP) as UnitCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 min-w-[100px] py-4 px-6 text-sm font-semibold transition-all border-b-2 ${
                category === cat 
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50/30' 
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* From */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">From</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={unitValue} 
                  onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-semibold text-slate-800"
                />
                <select 
                  value={fromUnit} 
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {UNIT_MAP[category].units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center pt-4 md:pt-6">
              <button 
                onClick={handleSwap}
                className="w-10 h-10 bg-slate-50 border border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-90"
              >
                <span className="text-xl">⇄</span>
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">To</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-indigo-50 rounded-xl border border-indigo-100 font-bold text-indigo-700 truncate flex items-center">
                  {convertUnits()}
                </div>
                <select 
                  value={toUnit} 
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {UNIT_MAP[category].units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
        Conversion logic is handled locally in your browser for instant results.
      </div>
    </div>
  );
};

export default ConverterStudioView;
