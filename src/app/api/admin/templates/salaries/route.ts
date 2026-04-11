import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const data = [
    {
      'Mã Nhân Viên': '25023001',
      'Lương Cơ Bản': 600,
      'Thực Lãnh': 737,
      'Chức vụ': 'Công nhân',
      'Bộ phận': 'Sản xuất',
      'Đơn vị tính': 'USD',
      'Ngày công chuẩn/tháng': 26,
      'Ngày công làm việc thực tế': 24,
      'Lương ngày công làm việc thực tế': 550,
      'Giờ tăng ca': 12,
      'Lương tăng ca': 80,
      'Lương thu nhập': 800,
      'Tổng lương thu nhập': 800,
      'Số tiền đã ứng': 0,
      'Tổng khấu trừ': 63,
    },
    {
      'Mã Nhân Viên': '25023002',
      'Lương Cơ Bản': 550,
      'Thực Lãnh': 620,
      'Chức vụ': 'Công nhân',
      'Bộ phận': 'Chế biến',
      'Đơn vị tính': 'USD',
      'Ngày công chuẩn/tháng': 26,
      'Ngày công làm việc thực tế': 25,
      'Lương ngày công làm việc thực tế': 520,
      'Giờ tăng ca': 8,
      'Lương tăng ca': 50,
      'Lương thu nhập': 680,
      'Tổng lương thu nhập': 680,
      'Số tiền đã ứng': 0,
      'Tổng khấu trừ': 60,
    },
  ];

  const ws = xlsx.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 22 }, { wch: 26 }, { wch: 30 }, { wch: 12 },
    { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 16 },
  ];
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Bảng lương');
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="mau_bang_luong.xlsx"',
    },
  });
}
