import React, { useState, useEffect } from 'react';

interface Props {
  token: string;
  onLogout: () => void;
}

export const AccountPage: React.FC<Props> = ({ token, onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [changingPw, setChangingPw] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUser(d.user))
      .catch(() => {});
  }, [token]);

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });
    const data = await res.json();
    setMsg(data.error || data.message || 'Password changed!');
    if (!data.error) { setOldPw(''); setNewPw(''); setChangingPw(false); }
  };

  if (!user) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Plan</label>
          <p className="font-medium capitalize">{user.plan || 'free'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Member since</label>
          <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <hr />
        {!changingPw ? (
          <button onClick={() => setChangingPw(true)} className="text-green-600 hover:underline text-sm font-medium">
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePw} className="space-y-3">
            <input type="password" placeholder="Current password" value={oldPw} onChange={e => setOldPw(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">Save</button>
              <button type="button" onClick={() => setChangingPw(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
            </div>
          </form>
        )}
        {msg && <p className={`text-sm ${msg.includes('error') || msg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
        <hr />
        <p className="text-sm text-gray-500">Need help? Contact <a href="mailto:seo@dabisoftsolutions.com" className="text-green-600 hover:underline">seo@dabisoftsolutions.com</a></p>
        <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100">
          Sign Out
        </button>
      </div>
    </div>
  );
};
