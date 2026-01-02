
import React, { useState, useEffect } from 'react';
import { logActivity } from '../services/activityService';
import { chatWithGemini } from '../services/geminiService';
import { ToolType } from '../types';

interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  completed: boolean;
  category?: string;
}

const ShoppingListView: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('as_service_shopping_list');
    return saved ? JSON.parse(saved) : [];
  });
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('as_service_shopping_list', JSON.stringify(items));
  }, [items]);

  const addItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!nameInput.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      price: parseFloat(priceInput) || 0,
      quantity: 1,
      completed: false
    };

    setItems([newItem, ...items]);
    setNameInput('');
    setPriceInput('');
    logActivity(ToolType.SHOPPING_LIST, 'Item Added', `Added ${newItem.name} to list`);
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleSmartOrganize = async () => {
    if (items.length === 0 || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const prompt = `Categorize the following shopping list into logical groups (e.g., Produce, Dairy, Meat, Pantry, Household). 
      Return the categorized list in a clear format. 
      List: ${items.map(i => i.name).join(', ')}`;
      
      const response = await chatWithGemini(prompt);
      // We log the activity but since updating categories locally from raw text is complex, 
      // we'll just show the user the AI's "Shopping Plan".
      alert("AI Suggestion:\n\n" + response);
      logActivity(ToolType.SHOPPING_LIST, 'AI Organization', 'Used AI to plan shopping trip');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const remainingPrice = items.filter(i => !i.completed).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Smart Shopping List</h1>
          <p className="text-slate-500">Manage your groceries and budget with AI assistance.</p>
        </div>
        <button
          onClick={handleSmartOrganize}
          disabled={isAiLoading || items.length === 0}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
        >
          {isAiLoading ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : '✨'}
          Smart Plan
        </button>
      </div>

      {/* Budget Summary Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Total Estimated Budget</p>
            <h2 className="text-5xl font-black mb-4">${totalPrice.toFixed(2)}</h2>
            <p className="text-sm opacity-90">{items.length} items total in your list</p>
          </div>
          <div className="absolute -right-10 -bottom-10 text-[12rem] opacity-10 pointer-events-none select-none font-black">
            $
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Remaining to Buy</p>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {items.length - completedCount} Left
            </span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">${remainingPrice.toFixed(2)}</h2>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <form onSubmit={addItem} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col sm:flex-row gap-3 mb-10">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Item name (e.g. Milk, Eggs...)"
          className="flex-1 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
        />
        <div className="flex gap-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="0.00"
              className="w-28 p-4 pl-8 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      {/* List Items */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <div className="text-6xl mb-4">🥗</div>
            <p className="font-bold text-slate-400">Your shopping list is empty</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              className={`group flex items-center gap-4 p-5 bg-white rounded-3xl border transition-all ${
                item.completed ? 'opacity-60 border-emerald-100 bg-emerald-50/10' : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                  item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {item.completed && <span>✓</span>}
              </button>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-slate-800 truncate transition-all ${item.completed ? 'line-through text-slate-400' : ''}`}>
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  ${item.price.toFixed(2)} / unit
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-slate-400"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-slate-700">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-slate-400"
                >
                  +
                </button>
              </div>

              <div className="w-24 text-right font-black text-slate-900 font-mono">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button 
                onClick={() => deleteItem(item.id)}
                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button 
            onClick={() => {
              if (window.confirm("Clear all items from your list?")) {
                setItems([]);
                logActivity(ToolType.SHOPPING_LIST, 'List Cleared', 'Removed all items from shopping list');
              }
            }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            Clear Entire List
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;
