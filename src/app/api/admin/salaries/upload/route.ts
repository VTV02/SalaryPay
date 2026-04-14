import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import * as xlsx from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const monthYear = String(formData.get('monthYear') ?? '').trim(); // Format: "YYYY-MM"
    const period = parseInt(String(formData.get('period') ?? '1'), 10); // 1 or 2

    if (!file || typeof file === 'string' || !monthYear) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp cả File Excel và Tháng Lương (YYYY-MM)' },
        { status: 400 }
      );
    }

    if (period !== 1 && period !== 2) {
      return NextResponse.json({ error: 'Đợt phải là 1 hoặc 2' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}$/.test(monthYear)) {
      return NextResponse.json({ error: 'Tháng lương phải đúng định dạng YYYY-MM' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // Giả định dữ liệu nằm ở sheet đầu tiên
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    if (data.length === 0) {
      return NextResponse.json({ error: 'File Excel trống' }, { status: 400 });
    }

    let successCount = 0;
    const errors: string[] = [];

    // Batch fetch: lấy tất cả mã NV từ Excel, query 1 lần thay vì N lần
    const allCodes = new Set<string>();
    for (const row of data) {
      const code = String(row['Mã Nhân Viên'] ?? row['employeeCode'] ?? '').trim();
      if (code) allCodes.add(code);
    }
    const workers = await prisma.worker.findMany({
      where: { employeeCode: { in: [...allCodes] } },
      select: { id: true, employeeCode: true },
    });
    const workerMap = new Map(workers.map((w) => [w.employeeCode, w.id]));

    for (const [index, row] of data.entries()) {
      const employeeCode = String(row['Mã Nhân Viên'] ?? row['employeeCode'] ?? '').trim();
      const baseSalaryRaw = row['Lương Cơ Bản'] ?? row['Lương Cơ bản'] ?? row['baseSalary'];
      const netSalaryRaw = row['Thực Lãnh'] ?? row['netSalary']
        ?? row['Tổng lương thu nhập'] ?? row['Lương thu nhập'];

      if (!employeeCode) {
        errors.push(`Dòng ${index + 2}: Thiếu Mã Nhân Viên.`);
        continue;
      }

      const baseSalary = baseSalaryRaw != null && String(baseSalaryRaw).trim() !== '' && String(baseSalaryRaw).trim() !== '-'
        ? parseFloat(String(baseSalaryRaw))
        : 0;
      const netSalary = netSalaryRaw != null ? parseFloat(String(netSalaryRaw)) : 0;

      if (isNaN(baseSalary)) {
         errors.push(`Dòng ${index + 2}: Lỗi định dạng số ở cột Lương Cơ Bản.`);
         continue;
      }
      if (isNaN(netSalary)) {
         errors.push(`Dòng ${index + 2}: Lỗi định dạng số ở cột Thực Lãnh.`);
         continue;
      }

      try {
        const workerId = workerMap.get(employeeCode);

        if (!workerId) {
           errors.push(`Dòng ${index + 2}: Không tìm thấy Mã Nhân Viên '${employeeCode}' trong hệ thống.`);
           continue;
        }

        // Lưu details JSON nếu có các cột khác
        const detailsObj: Record<string, unknown> = { ...row };
        delete detailsObj['Mã Nhân Viên'];
        delete detailsObj['employeeCode'];
        delete detailsObj['Lương Cơ Bản'];
        delete detailsObj['baseSalary'];
        delete detailsObj['Thực Lãnh'];
        delete detailsObj['netSalary'];

        const detailsString = JSON.stringify(detailsObj);

        await prisma.salary.upsert({
          where: {
            workerId_monthYear_period: {
              workerId,
              monthYear,
              period,
            },
          },
          update: {
            baseSalary,
            netSalary,
            details: detailsString,
          },
          create: {
            workerId,
            monthYear,
            period,
            baseSalary,
            netSalary,
            details: detailsString,
          },
        });
        successCount++;
      } catch (dbError: unknown) {
        const msg = dbError instanceof Error ? dbError.message : String(dbError);
        errors.push(`Dòng ${index + 2}: Database Error - ${msg}`);
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_SALARIES',
        performedBy: adminUsername,
        details: JSON.stringify({ monthYear, period, successCount, errorCount: errors.length, fileName: file.name }),
      },
    });

    return NextResponse.json(
      {
        message: 'Upload bảng lương hoàn tất',
        successCount,
        errorCount: errors.length,
        errors,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Lỗi upload bảng lương:', error);
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json({ error: 'Lỗi server: ' + msg }, { status: 500 });
  }
}
