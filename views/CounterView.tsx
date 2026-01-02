
import React, { useState, useEffect } from 'react';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const CounterView: React.FC = () => {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('as_service_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    localStorage.setItem('as_service_count', count.toString());
  }, [count]);

  const handleIncrement = () => {
    const next = count + step;
    setCount(next);
    if (next % 10 === 0 && next !== 0) {
      logActivity(ToolType.SIMPLE_COUNTER, 'Count Milestone', `Reached a total of ${next}`);
    }
  };

  const handleDecrement = () => {
    setCount(count - step);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the counter?")) {
      logActivity(ToolType.SIMPLE_COUNTER, 'Counter Reset', `Reset from ${count} to 0`);
      setCount(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Counter Lab</h1>
        <p className="text-slate-500">Track counts, tallies, and inventory with precision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Main Counter Card */}
        <div className="md:col-span-2 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl flex flex-col items-center text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Current Tally</div>
          
          <div className="text-9xl font-black text-blue-600 mb-12 tabular-nums transition-all">
            {count}
          </div>

          <div className="flex gap-6 w-full">
            <button
              onClick={handleDecrement}
              className="flex-1 py-8 bg-slate-100 text-slate-600 rounded-[2rem] text-4xl font-bold hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
            >
              −
            </button>
            <button
              onClick={handleIncrement}
              className="flex-[2] py-8 bg-blue-600 text-white rounded-[2rem] text-4xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Settings Side */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>⚙️</span> Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Step Size</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl">
                  {[1, 5, 10].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStep(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        step === s ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <input
                    type="number"
                    value={step}
                    onChange={(e) => setStep(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-transparent text-center font-bold text-blue-600 outline-none border-l border-slate-200 ml-1"
                  />
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold hover:bg-rose-100 transition-all"
              >
                Reset Counter
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>📊</span> Analytics
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              Your counting progress is automatically synced with the global activity log on the dashboard.
            </p>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] block opacity-60 uppercase font-bold mb-1">Current Increment</span>
              <span className="text-2xl font-black">±{step}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterView;
