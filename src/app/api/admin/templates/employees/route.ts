import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  const data = [
    {
      'Mã Nhân Viên': '25023001',
      'Họ Tên': 'Nguyễn Văn A',
      'Ngày Sinh': '15/03/1990',
      'Công Ty': 'THACO AGRI SNUOL COMPLEX',
      'Phòng Ban': 'Sản xuất',
    },
    {
      'Mã Nhân Viên': '25023002',
      'Họ Tên': 'Trần Thị B',
      'Ngày Sinh': '22/07/1985',
      'Công Ty': 'THACO AGRI SNUOL COMPLEX',
      'Phòng Ban': 'Chế biến',
    },
    {
      'Mã Nhân Viên': '25023003',
      'Họ Tên': 'Lê Văn C',
      'Ngày Sinh': '01/12/1992',
      'Công Ty': 'THACO AUTO',
      'Phòng Ban': 'P. Chuyển đổi số',
    },
  ];

  const ws = xlsx.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 30 }, { wch: 22 }];
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Danh sách nhân viên');
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="mau_danh_sach_nhan_vien.xlsx"',
    },
  });
}
