'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { LogoLoader } from '@/components/LogoLoader';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [employeeCode, setEmployeeCode] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeCode, dob }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Đăng nhập thất bại.');
        return;
      }
      if (data.mustChangePassword) {
        window.location.href = '/change-password';
        return;
      }
      const next = searchParams.get('next') || '/salary';
      window.location.href = next;
    } catch {
      setPending(false);
    }
  }

  return (
    <>
    {pending && (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <LogoLoader text="Đang đăng nhập..." />
      </div>
    )}
    <form
      onSubmit={onSubmit}
      className="max-w-md mx-auto mt-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-lg space-y-6"
    >
      <div className="text-center space-y-1">
        <img src="/LOGO-THACO-AGRI-02-Copy-e1688459733402.png" alt="THACO AGRI" className="h-16 mx-auto mb-3" />
        <h1 className="text-3xl font-black text-slate-800">SPortal</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Hệ thống quản lý tiền lương</p>
        <p className="text-sm font-semibold text-slate-600">ប្រព័ន្ធគ្រប់គ្រងប្រាក់ខែ</p>
        <p className="text-sm font-semibold text-slate-600">Payroll Management System</p>
        <p className="text-xs text-slate-500 mt-2">
          Nhập mã nhân viên và mật khẩu
          <br />
          បញ្ចូលលេខកូដបុគ្គលិក និងពាក្យសម្ងាត់
          <br />
          Enter Employee ID &amp; password
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm px-4 py-3">
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="employeeCode" className="block text-xs font-medium text-slate-600 mb-1">
          Mã nhân viên / លេខកូដបុគ្គលិក / Employee ID
        </label>
        <input
          id="employeeCode"
          name="employeeCode"
          autoComplete="username"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value.trim())}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="dob" className="block text-xs font-medium text-slate-600 mb-1">
          Mật khẩu / ពាក្យសម្ងាត់ / Password
        </label>
        <input
          id="dob"
          name="dob"
          type="password"
          placeholder="••••••••••"
          autoComplete="current-password"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-800 text-white font-semibold py-3 hover:bg-emerald-900 transition-colors disabled:opacity-60"
      >
        {pending ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Đang đăng nhập...</span>) : 'Đăng nhập / ចូល / Login'}
      </button>
    </form>
    </>
  );
}
