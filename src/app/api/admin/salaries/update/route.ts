import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const payload = await req.json();
    const { workerId, monthYear, period: rawPeriod, baseSalary, netSalary, details } = payload;
    const period = parseInt(String(rawPeriod ?? '1'), 10);

    if (!workerId || !monthYear) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc (Worker ID, MonthYear)' }, { status: 400 });
    }

    const upsertedSalary = await prisma.salary.upsert({
      where: {
        workerId_monthYear_period: { workerId, monthYear, period }
      },
      update: {
        baseSalary,
        netSalary,
        details: JSON.stringify(details)
      },
      create: {
        workerId,
        monthYear,
        period,
        baseSalary: baseSalary || 0,
        netSalary: netSalary || 0,
        details: JSON.stringify(details)
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'EDIT_SALARY',
        performedBy: adminUsername,
        targetWorker: workerId,
        details: JSON.stringify({ monthYear, updatedNetSalary: netSalary }),
      }
    });

    return NextResponse.json({ message: 'Cập nhật thành công', salary: upsertedSalary }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi cập nhật lương:', error);
    return NextResponse.json({ error: 'Đã có lỗi phía server' }, { status: 500 });
  }
}
