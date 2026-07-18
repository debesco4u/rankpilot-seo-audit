import React, { useState } from 'react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setMsg('Passwords do not match'); return; }
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); return; }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.error) setMsg(data.error);
      else { setMsg('Password reset successfully! You can now log in.'); setDone(true); }
    } catch { setMsg('An error occurred. Please try again.'); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Reset Link</h2>
        <p className="text-gray-600">This password reset link is invalid or has expired.</p>
        <a href="/" className="mt-4 inline-block text-green-600 hover:underline">Back to home</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
        {done ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">{msg}</p>
            <a href="/" className="bg-green-500 text-white px-6 py-2 rounded-lg inline-block hover:bg-green-600">Go to Login</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg px-3 py-2" />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
            {msg && <p className="text-red-500 text-sm">{msg}</p>}
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
};
