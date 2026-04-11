import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const { denied } = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // "summary" | "search"
    const department = searchParams.get('department') ?? undefined;
    const search = searchParams.get('q') ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

    // Mode: summary — trả tổng số NV + danh sách phòng ban (luôn nhẹ)
    if (mode === 'summary' || !mode) {
      const totalWorkers = await prisma.worker.count();

      // Lấy danh sách phòng ban distinct
      const depts = await prisma.worker.findMany({
        where: { department: { not: '' } },
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' },
      });

      // Đếm số NV mỗi phòng ban
      const deptCounts = await prisma.worker.groupBy({
        by: ['department'],
        _count: { id: true },
        orderBy: { department: 'asc' },
      });

      const departments = depts.map((d) => {
        const count = deptCounts.find((c) => c.department === d.department)?._count.id ?? 0;
        return { name: d.department, count };
      });

      return NextResponse.json({ totalWorkers, departments });
    }

    // Mode: search — lọc theo phòng ban hoặc tìm kiếm, có phân trang
    const where: Record<string, unknown> = {};
    if (department) {
      where.department = department;
    }
    if (search) {
      where.OR = [
        { employeeCode: { contains: search } },
        { fullName: { contains: search } },
      ];
    }

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        orderBy: { employeeCode: 'asc' },
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          company: true,
          department: true,
          failedAttempts: true,
          lockUntil: true,
        },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.worker.count({ where }),
    ]);

    return NextResponse.json({
      workers,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error: unknown) {
    console.error('Lỗi lấy danh sách nhân viên:', error);
    return NextResponse.json({ error: 'Đã có lỗi phía server' }, { status: 500 });
  }
}
