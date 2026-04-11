import { Suspense } from 'react';
import { LoginForm } from '@/app/login/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <Suspense fallback={<div className="max-w-md mx-auto mt-16 text-center text-slate-500">Đang tải…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
