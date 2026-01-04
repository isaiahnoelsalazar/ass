
import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user: User;
      if (isRegistering) {
        if (!username || !email || !password) throw new Error('Fill all fields');
        user = registerUser(username, email, password);
      } else {
        if (!username || !password) throw new Error('Enter credentials');
        user = loginUser(username, password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-100 mx-auto mb-4">A</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Automatic System Service</h1>
          <p className="text-slate-500 font-medium">Powering your digital workflow</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username or Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter identifier"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
              />
            </div>

            {isRegistering && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                isRegistering ? 'Start Using Service' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-bold text-indigo-600 hover:underline"
            >
              {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-10 uppercase tracking-widest font-bold">
          &copy; 2025 Automatic System Service &bull; Isaiah Noel Salazar
        </p>
      </div>
    </div>
  );
};

export default AuthView;
