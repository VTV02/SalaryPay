'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    <button
      type="button"
      disabled={pending}
      onClick={onLogout}
      className="flex items-center px-6 py-2.5 bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60"
    >
      {pending ? 'Đang xử lý…' : 'Đăng xuất'}
    </button>
  );
}
