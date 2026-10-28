import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, availableAccounts, switchAccount } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!username.trim() || !displayName.trim() || !email.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      await signup(username, displayName, email);
    } else {
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      await login(email, password);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#12141c] p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="VidZelio" className="h-6 w-6" />
            <h2 className="text-base font-bold text-white">
              {mode === 'login' ? 'Sign In to VidZelio' : 'Join VidZelio Creator Platform'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Brand Tagline */}
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-blue-400">Watch. Create. Earn.</span> Secure authentication with verified advertising revenue ledger.
        </p>

        {error && (
          <div className="rounded-xl bg-red-950/50 border border-red-800/80 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="creator_handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name or Channel"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Never stored in plain text. Handled by secure salted session hashing.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm mt-2"
          >
            {mode === 'login' ? 'Sign In' : 'Register & Start Creating'}
          </button>
        </form>

        {/* Demo One-Click Sign In Options */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block text-center">
            Or quick demo sign in as:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {availableAccounts.slice(0, 4).map((acc) => (
              <button
                key={acc.uid}
                type="button"
                onClick={() => {
                  switchAccount(acc.uid);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-left hover:border-slate-700 transition"
              >
                <img
                  src={acc.photoURL}
                  alt={acc.displayName}
                  className="h-6 w-6 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-white truncate">{acc.displayName}</div>
                  <div className="text-[9px] text-slate-400 capitalize">{acc.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
