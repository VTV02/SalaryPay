'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoLoader } from '@/components/LogoLoader';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setPending(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Đổi mật khẩu thất bại.');
        setPending(false);
        return;
      }
      window.location.href = '/salary';
    } catch {
      setError('Không thể kết nối đến máy chủ.');
      setPending(false);
    }
  }

  return (
    <>
      {pending && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <LogoLoader text="Đang cập nhật mật khẩu..." />
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="max-w-md mx-auto mt-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-lg space-y-6"
      >
        <div className="text-center space-y-1">
          <img src="/LOGO-THACO-AGRI-02-Copy-e1688459733402.png" alt="THACO AGRI" className="h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-black text-slate-800">Đổi mật khẩu</h1>
          <p className="text-sm text-slate-500">Vui lòng đổi mật khẩu để bảo mật tài khoản</p>
          <p className="text-sm text-slate-500">សូមប្ដូរពាក្យសម្ងាត់ដើម្បីការពារគណនី</p>
          <p className="text-sm text-slate-500">Please change your password to secure your account</p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="newPassword" className="block text-xs font-medium text-slate-600 mb-1">
            Mật khẩu mới / ពាក្យសម្ងាត់ថ្មី / New password
          </label>
          <input
            id="newPassword"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none"
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-600 mb-1">
            Xác nhận mật khẩu / បញ្ជាក់ពាក្យសម្ងាត់ / Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-800 text-white font-semibold py-3 hover:bg-emerald-900 transition-colors disabled:opacity-60"
        >
          {pending ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang xử lý...
            </span>
          ) : 'Xác nhận đổi mật khẩu / បញ្ជាក់ / Confirm'}
        </button>
      </form>
    </>
  );
}
