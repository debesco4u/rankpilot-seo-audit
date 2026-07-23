import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { User, SUPPORT_EMAIL } from '../types';
import { apiSignup, apiLogin, apiForgotPassword } from '../api';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onLogin: (user: User) => void;
  onToggleMode: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onLogin, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (showForgot) {
        const data = await apiForgotPassword(email);
        setSuccess(data.message || 'Reset link sent!');
        setLoading(false);
        return;
      }
      if (mode === 'signup') {
        const data = await apiSignup(email, password, name);
        setSuccess(data.message || 'Account created!');
        setTimeout(() => onLogin(data.user), 1000);
      } else {
        const data = await apiLogin(email, password);
        onLogin(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal modal-open" onClick={onClose}>
      <div className="modal-box relative max-w-sm" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><X size={16} /></button>

        <h3 className="font-bold text-lg text-center mb-4">
          {showForgot ? 'Reset Password' : mode === 'login' ? 'Log In' : 'Create Account'}
        </h3>

        {error && (
          <div className="alert alert-error mb-4 py-2 text-sm">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4 py-2 text-sm">
            <CheckCircle size={16} /> <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && !showForgot && (
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm">Name</span></label>
              <div className="input input-bordered input-sm flex items-center gap-2">
                <UserIcon size={14} className="opacity-50" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="grow bg-transparent outline-none" required />
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label py-1"><span className="label-text text-sm">Email</span></label>
            <div className="input input-bordered input-sm flex items-center gap-2">
              <Mail size={14} className="opacity-50" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="grow bg-transparent outline-none" required />
            </div>
          </div>

          {!showForgot && (
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm">Password</span></label>
              <div className="input input-bordered input-sm flex items-center gap-2">
                <Lock size={14} className="opacity-50" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="grow bg-transparent outline-none" required minLength={6} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-sm w-full text-white" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : showForgot ? 'Send Reset Link' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          {!showForgot && mode === 'login' && (
            <button onClick={() => { setShowForgot(true); setError(''); setSuccess(''); }} className="text-xs text-primary hover:underline">
              Forgot password?
            </button>
          )}

          {showForgot ? (
            <button onClick={() => { setShowForgot(false); setError(''); setSuccess(''); }} className="text-xs text-primary hover:underline">
              Back to login
            </button>
          ) : (
            <p className="text-xs text-base-content/60">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={onToggleMode} className="text-primary hover:underline">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          )}

          <p className="text-xs text-base-content/40">
            Need help? <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  );
};
