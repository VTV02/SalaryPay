import { LogoLoader } from '@/components/LogoLoader';

export default function SalaryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <LogoLoader text="Đang tải phiếu lương..." />
    </div>
  );
}
