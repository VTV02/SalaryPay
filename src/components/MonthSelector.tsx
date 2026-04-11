'use client';

import { useRouter, useSearchParams } from 'next/navigation';

function formatKey(key: string): string {
  const [monthYear, periodStr] = key.split(':');
  const [y, mo] = monthYear.split('-');
  const period = parseInt(periodStr || '1', 10);
  const periodLabel = period === 1 ? 'Đợt 1 (Tạm ứng)' : 'Đợt 2';
  return `Tháng ${mo}/${y} — ${periodLabel}`;
}

export function MonthSelector({ keys, current }: { keys: string[]; current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const [month, period] = val.split(':');
    const params = new URLSearchParams(searchParams.toString());
    if (month && period) {
      params.set('month', month);
      params.set('period', period);
    } else {
      params.delete('month');
      params.delete('period');
    }
    router.push(`/?${params.toString()}`);
  }

  if (keys.length <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <label htmlFor="month-select" className="text-sm font-medium text-slate-600">
        Chọn kỳ lương:
      </label>
      <select
        id="month-select"
        value={current}
        onChange={onChange}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
      >
        {keys.map((k) => (
          <option key={k} value={k}>
            {formatKey(k)}
          </option>
        ))}
      </select>
    </div>
  );
}
