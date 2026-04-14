import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { buildSlipProps } from '@/lib/map-salary-slip';
import SalarySlipView from '@/components/SalarySlipView';
import { NoSalaryView } from '@/components/NoSalaryView';
import { MonthSelector } from '@/components/MonthSelector';

type Props = {
  searchParams: Promise<{ month?: string; period?: string }>;
};

export default async function SalaryPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const worker = await prisma.worker.findUnique({
    where: { id: session.workerId },
  });

  if (!worker) {
    redirect('/login');
  }

  if (worker.mustChangePassword) {
    redirect('/change-password');
  }

  // Lấy danh sách tháng + đợt có lương
  const salaries = await prisma.salary.findMany({
    where: { workerId: worker.id },
    select: { monthYear: true, period: true },
    orderBy: [{ monthYear: 'desc' }, { period: 'asc' }],
  });

  // Key format: "2026-03:1" (tháng:đợt)
  const keys = salaries.map((s) => `${s.monthYear}:${s.period}`);

  if (keys.length === 0) {
    return <NoSalaryView employeeName={worker.fullName} employeeCode={worker.employeeCode} />;
  }

  const params = await searchParams;
  const selectedKey =
    params.month && params.period
      ? `${params.month}:${params.period}`
      : keys[0];

  const [selectedMonth, selectedPeriodStr] = selectedKey.split(':');
  const selectedPeriod = parseInt(selectedPeriodStr || '1', 10);

  // Nếu key không hợp lệ, fallback về đầu tiên
  const validKey = keys.includes(selectedKey) ? selectedKey : keys[0];
  const [finalMonth, finalPeriodStr] = validKey.split(':');
  const finalPeriod = parseInt(finalPeriodStr || '1', 10);

  const salary = await prisma.salary.findUnique({
    where: {
      workerId_monthYear_period: {
        workerId: worker.id,
        monthYear: finalMonth,
        period: finalPeriod,
      },
    },
  });

  if (!salary) {
    return <NoSalaryView employeeName={worker.fullName} employeeCode={worker.employeeCode} />;
  }

  const props = buildSlipProps(worker, salary);

  return (
    <>
      <Suspense>
        <MonthSelector keys={keys} current={validKey} />
      </Suspense>
      <SalarySlipView
        {...props}
        pdfDownloadHref={`/api/me/salary/pdf?month=${finalMonth}&period=${finalPeriod}`}
      />
    </>
  );
}
