'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [employeeCode, setEmployeeCode] = useState('');
  const [cccdLast6, setCccdLast6] = useState('');
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
        body: JSON.stringify({ employeeCode, cccdLast6 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Đăng nhập thất bại.');
        return;
      }
      const next = searchParams.get('next') || '/';
      window.location.href = next;
    } catch {
      setPending(false);
    }
  }

  return (
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
          Nhập mã nhân viên và 6 số cuối CCCD
          <br />
          បញ្ចូលលេខកូដបុគ្គលិក និងលេខ ៦ ខ្ទង់ចុងក្រោយនៃអត្តសញ្ញាណប័ណ្ណ
          <br />
          Enter Employee ID &amp; last 6 digits of ID card
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
        <label htmlFor="cccdLast6" className="block text-xs font-medium text-slate-600 mb-1">
          6 số cuối CCCD / លេខ ៦ ខ្ទង់ចុងក្រោយ / Last 6 digits of ID
        </label>
        <input
          id="cccdLast6"
          name="cccdLast6"
          inputMode="numeric"
          maxLength={6}
          value={cccdLast6}
          onChange={(e) => setCccdLast6(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 tracking-widest focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-800 text-white font-semibold py-3 hover:bg-emerald-900 transition-colors disabled:opacity-60"
      >
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập / ចូល / Login'}
      </button>
    </form>
  );
}
