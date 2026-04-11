'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Đăng nhập thất bại.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md w-full p-8 bg-white rounded-3xl border border-slate-100 shadow-lg space-y-6"
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800">Đăng nhập quản trị</h1>
        <p className="text-sm text-slate-500 mt-1">THACO AGRI SNUOL COMPLEX</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-xs font-medium text-slate-600 mb-1">
          Tên đăng nhập
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-slate-600/30 focus:border-slate-600 outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-slate-600/30 focus:border-slate-600 outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-800 text-white font-semibold py-3 hover:bg-slate-900 transition-colors disabled:opacity-60"
      >
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  );
}
