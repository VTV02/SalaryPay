import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const salaries = await prisma.salary.findMany({
    where: { workerId: session.workerId },
    select: { monthYear: true, period: true },
    orderBy: [{ monthYear: 'desc' }, { period: 'asc' }],
  });

  // Return unique keys like "2026-03:1", "2026-03:2"
  return NextResponse.json({
    months: salaries.map((s) => `${s.monthYear}:${s.period}`),
  });
}
