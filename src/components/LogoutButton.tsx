'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoLoader } from '@/components/LogoLoader';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {pending && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <LogoLoader text="Đang đăng xuất..." />
        </div>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={onLogout}
        className="flex items-center px-6 py-2.5 bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60"
      >
        Đăng xuất
      </button>
    </>
  );
}
