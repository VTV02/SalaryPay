import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const { denied } = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const employeeCode = searchParams.get('employeeCode');
    const monthYear = searchParams.get('monthYear');
    const period = parseInt(searchParams.get('period') ?? '1', 10);

    if (!employeeCode || !monthYear) {
      return NextResponse.json({ error: 'Cần Mã Nhân Viên và Tháng Lương (YYYY-MM)' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { employeeCode }
    });

    if (!worker) {
      return NextResponse.json({ error: 'Không tìm thấy Mã Nhân Viên' }, { status: 404 });
    }

    const salary = await prisma.salary.findFirst({
      where: { workerId: worker.id, monthYear, period: period === 2 ? 2 : 1 }
    });

    if (!salary) {
      return NextResponse.json({ worker, error: 'Chưa có bảng lương tháng này. Vui lòng tạo mới hoặc upload.', salary: null }, { status: 200 });
    }

    return NextResponse.json({ worker, salary }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi tìm kiếm lương:', error);
    return NextResponse.json({ error: 'Đã có lỗi phía server' }, { status: 500 });
  }
}
