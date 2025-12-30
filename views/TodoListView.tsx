
import React, { useState, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  subTasks?: string[];
}

const TodoListView: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('as_service_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('as_service_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: input,
      completed: false,
    };
    setTodos([newTodo, ...todos]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const suggestSteps = async (id: string, taskText: string) => {
    if (isAiLoading) return;
    setIsAiLoading(id);
    try {
      const prompt = `Act as a productivity expert. For the following task, provide 3-5 clear, actionable sub-tasks or steps. 
      Task: "${taskText}"
      Format the response as a simple bulleted list with no introductory text.`;
      
      const response = await chatWithGemini(prompt);
      const steps = response?.split('\n')
        .map(s => s.replace(/^[•\-\d\.]+\s*/, '').trim())
        .filter(s => s.length > 0) || [];

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, subTasks: steps } : todo
      ));
    } catch (error) {
      console.error(error);
      alert('AI failed to generate steps. Please try again.');
    } finally {
      setIsAiLoading(null);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">AI Task Planner</h1>
        <p className="text-slate-500">Break down complex projects into manageable steps with AI assistance.</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-700">Project Progress</span>
          <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-3 italic">
          {completedCount} of {todos.length} tasks completed
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={addTodo} className="flex gap-3 mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 p-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
        >
          Add Task
        </button>
      </form>

      {/* List Section */}
      <div className="space-y-4 mb-10">
        {todos.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
            <div className="text-4xl mb-4 opacity-30">📋</div>
            <p className="text-slate-400 font-medium">Your planner is empty. Add a task to begin.</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id}
              className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden shadow-sm ${
                todo.completed ? 'border-emerald-100 bg-emerald-50/20 opacity-80' : 'border-slate-100'
              }`}
            >
              <div className="p-6 flex items-start gap-4">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    todo.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {todo.completed && <span>✓</span>}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-slate-800 transition-all ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                    {todo.text}
                  </h3>
                  
                  {todo.subTasks && todo.subTasks.length > 0 && (
                    <div className="mt-4 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span>✨</span> AI Breakdown
                      </p>
                      {todo.subTasks.map((step, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-sm text-slate-600">
                          <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                          {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!todo.completed && !todo.subTasks && (
                    <button 
                      onClick={() => suggestSteps(todo.id, todo.text)}
                      disabled={!!isAiLoading}
                      className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-30"
                      title="AI Suggest Steps"
                    >
                      {isAiLoading === todo.id ? (
                        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-xl">✨</span>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Task"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="bg-indigo-900 text-indigo-100 p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-indigo-500/30 rounded-xl flex items-center justify-center text-xl">💡</div>
          <h2 className="text-xl font-bold text-white">Smart Productivity</h2>
        </div>
        <p className="text-sm opacity-80 leading-relaxed">
          Need help starting a task? Click the magic wand icon (✨) next to any item. Our AI will analyze the task and suggest a step-by-step breakdown to help you overcome procrastination.
        </p>
      </div>
    </div>
  );
};

export default TodoListView;
