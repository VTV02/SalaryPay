import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import * as xlsx from 'xlsx';

type RowIssue = { row: number; type: 'error' | 'warning'; message: string };

export async function POST(req: NextRequest) {
  try {
    const { denied } = await requireAdmin();
    if (denied) return denied;

    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const monthYear = String(formData.get('monthYear') ?? '').trim();
    const period = parseInt(String(formData.get('period') ?? '1'), 10);

    if (!file || typeof file === 'string' || !monthYear) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp cả File Excel và Tháng Lương (YYYY-MM)' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}$/.test(monthYear)) {
      return NextResponse.json({ error: 'Tháng lương phải đúng định dạng YYYY-MM' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    if (data.length === 0) {
      return NextResponse.json({ error: 'File Excel trống' }, { status: 400 });
    }

    const issues: RowIssue[] = [];
    const seenCodes = new Map<string, number>();
    let totalBase = 0;
    let totalNet = 0;
    let validCount = 0;

    // Lấy lương tháng trước để so sánh bất thường
    const prevSalaries = new Map<string, number>();
    const workers = await prisma.worker.findMany({ select: { employeeCode: true, id: true } });
    const workerMap = new Map(workers.map((w) => [w.employeeCode, w.id]));

    // Lấy salary kỳ trước để so sánh (cùng đợt, tháng trước)
    const prevMonth = getPrevMonth(monthYear);
    const prevData = await prisma.salary.findMany({
      where: { monthYear: prevMonth, period },
      select: { worker: { select: { employeeCode: true } }, netSalary: true },
    });
    for (const s of prevData) {
      prevSalaries.set(s.worker.employeeCode, Number(s.netSalary));
    }

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2;
      const employeeCode = String(row['Mã Nhân Viên'] ?? row['employeeCode'] ?? '').trim();
      const baseSalaryRaw = row['Lương Cơ Bản'] ?? row['Lương Cơ bản'] ?? row['baseSalary'];
      const netSalaryRaw = row['Thực Lãnh'] ?? row['netSalary']
        ?? row['Tổng lương thu nhập'] ?? row['Lương thu nhập'];

      // Thiếu thông tin
      if (!employeeCode) {
        const cols = Object.keys(row).join(', ');
        issues.push({ row: rowNum, type: 'error', message: `Thiếu Mã Nhân Viên. Cột nhận được: [${cols}]` });
        continue;
      }

      // Scan rác: chữ cái trong cột tiền
      const baseStr = baseSalaryRaw != null && String(baseSalaryRaw).trim() !== '' && String(baseSalaryRaw).trim() !== '-'
        ? String(baseSalaryRaw) : '0';
      const netStr = netSalaryRaw != null && String(netSalaryRaw).trim() !== '' && String(netSalaryRaw).trim() !== '-'
        ? String(netSalaryRaw) : '0';
      const baseSalary = parseFloat(baseStr);
      const netSalary = parseFloat(netStr);

      if (isNaN(baseSalary)) {
        issues.push({ row: rowNum, type: 'error', message: `Cột Lương Cơ Bản chứa giá trị không hợp lệ: '${baseStr}'.` });
        continue;
      }
      if (isNaN(netSalary)) {
        issues.push({ row: rowNum, type: 'error', message: `Cột Thực Lãnh chứa giá trị không hợp lệ: '${netStr}'.` });
        continue;
      }

      // Scan trùng lặp
      if (seenCodes.has(employeeCode)) {
        issues.push({
          row: rowNum,
          type: 'error',
          message: `Mã NV '${employeeCode}' bị trùng lặp (đã xuất hiện ở dòng ${seenCodes.get(employeeCode)}).`,
        });
        continue;
      }
      seenCodes.set(employeeCode, rowNum);

      // Kiểm tra NV có tồn tại
      if (!workerMap.has(employeeCode)) {
        issues.push({ row: rowNum, type: 'error', message: `Mã NV '${employeeCode}' không tồn tại trong hệ thống.` });
        continue;
      }

      // Cảnh báo bất thường: so sánh với tháng trước
      const prevNet = prevSalaries.get(employeeCode);
      if (prevNet !== undefined && prevNet > 0) {
        const ratio = netSalary / prevNet;
        if (ratio > 3) {
          issues.push({
            row: rowNum,
            type: 'warning',
            message: `Lương NV '${employeeCode}' tăng ${(ratio * 100).toFixed(0)}% so với tháng trước (${prevNet.toLocaleString('vi-VN')} → ${netSalary.toLocaleString('vi-VN')}). Có thể dư số 0?`,
          });
        } else if (ratio < 0.3 && netSalary > 0) {
          issues.push({
            row: rowNum,
            type: 'warning',
            message: `Lương NV '${employeeCode}' giảm ${((1 - ratio) * 100).toFixed(0)}% so với tháng trước (${prevNet.toLocaleString('vi-VN')} → ${netSalary.toLocaleString('vi-VN')}). Vui lòng kiểm tra.`,
          });
        }
      }

      totalBase += baseSalary;
      totalNet += netSalary;
      validCount++;
    }

    const errors = issues.filter((i) => i.type === 'error');
    const warnings = issues.filter((i) => i.type === 'warning');

    return NextResponse.json({
      totalRows: data.length,
      validCount,
      errorCount: errors.length,
      warningCount: warnings.length,
      totalBaseSalary: totalBase,
      totalNetSalary: totalNet,
      monthYear,
      period,
      issues,
    });
  } catch (error: unknown) {
    console.error('Validate salary error:', error);
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json({ error: 'Lỗi server: ' + msg }, { status: 500 });
  }
}

function getPrevMonth(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number);
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  return `${prevY}-${String(prevM).padStart(2, '0')}`;
}
