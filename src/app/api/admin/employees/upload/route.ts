import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import * as xlsx from 'xlsx';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { denied, adminUsername } = await requireAdmin();
    if (denied) return denied;

    const formData = await req.formData();

    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 });
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

    for (const [index, row] of data.entries()) {
      const employeeCode = String(row['Mã Nhân Viên'] ?? row['employeeCode'] ?? '').trim();
      const fullName = String(row['Họ Tên'] ?? row['fullName'] ?? '').trim();
      const dob = String(row['Ngày Sinh'] ?? row['dob'] ?? '').trim();
      const company = String(row['Công Ty'] ?? row['company'] ?? '').trim();
      const department = String(row['Phòng Ban'] ?? row['Bộ Phận'] ?? row['department'] ?? '').trim();

      if (!employeeCode || !fullName || !dob) {
        errors.push(`Dòng ${index + 2}: Thiếu thông tin bắt buộc (Mã NV, Họ Tên, Ngày Sinh).`);
        continue;
      }

      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
        errors.push(`Dòng ${index + 2}: Ngày sinh phải đúng định dạng DD/MM/YYYY, phát hiện '${dob}'.`);
        continue;
      }

      const dobHash = crypto.createHash('sha256').update(dob).digest('hex');

      try {
        await prisma.worker.upsert({
          where: { employeeCode },
          update: { fullName, dobHash, company, department },
          create: { employeeCode, fullName, dobHash, company, department }
        });
        successCount++;
      } catch (dbError: unknown) {
        const msg = dbError instanceof Error ? dbError.message : String(dbError);
        errors.push(`Dòng ${index + 2}: Lỗi DB - ${msg}`);
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_EMPLOYEES',
        performedBy: adminUsername,
        details: JSON.stringify({ successCount, errorCount: errors.length, fileName: file.name }),
      },
    });

    return NextResponse.json(
      {
        message: 'Cập nhật hoàn tất',
        successCount,
        errorCount: errors.length,
        errors,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Lỗi upload nhân viên:', error);
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json({ error: 'Lỗi server: ' + msg }, { status: 500 });
  }
}
