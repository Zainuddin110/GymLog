import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UnitPreference } from '../../types/gym';
import { X, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, resetPasswordForEmail, isCloudConnected } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [unit, setUnit] = useState<UnitPreference>('kg');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setStatusMessage({ type: 'error', text: error.message || 'Failed to sign in' });
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName, unit);
        if (error) {
          setStatusMessage({ type: 'error', text: error.message || 'Failed to sign up' });
        } else {
          setStatusMessage({
            type: 'success',
            text: 'Account created! Check your email to confirm registration or sign in.'
          });
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPasswordForEmail(email);
        if (error) {
          setStatusMessage({ type: 'error', text: error.message || 'Failed to request reset' });
        } else {
          setStatusMessage({ type: 'success', text: 'Password reset instructions sent to your email.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'signin' && 'Sign In to GymLog'}
              {mode === 'signup' && 'Create Free Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isCloudConnected ? 'Cloud Sync & Cross-Device Access' : 'Local Mode Active (Optional cloud backup)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-touch h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`mx-5 mt-5 p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
              statusMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full min-h-touch pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-xs shadow-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full min-h-touch pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-xs shadow-xs"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-touch pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-xs shadow-xs"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Weight Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`min-h-[40px] rounded-xl text-xs font-bold border transition-all ${
                    unit === 'kg'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`min-h-[40px] rounded-xl text-xs font-bold border transition-all ${
                    unit === 'lbs'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Pounds (lbs)
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-touch h-12 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Link'}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          {mode === 'signin' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setStatusMessage(null);
                }}
                className="hover:text-slate-900"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setStatusMessage(null);
                }}
                className="font-bold text-slate-900 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setStatusMessage(null);
              }}
              className="font-bold text-slate-900 hover:underline mx-auto"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
