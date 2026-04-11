import type { Salary, Worker } from '@prisma/client';
import type { DetailRow, SalarySlipViewProps } from '@/components/SalarySlipView';

const EXCLUDE_DETAIL_KEYS = new Set([
  'Mã Nhân Viên',
  'employeeCode',
  'Họ Tên',
  'Tên Nhân viên',
  'fullName',
  'Lương Cơ Bản',
  'Lương Cơ bản',
  'Lương Cơ bản (Đóng BHXH)',
  'baseSalary',
  'Thực Lãnh',
  'LƯƠNG THỰC NHẬN (1) – (2)',
  'netSalary',
  'Chức vụ',
  'Chức Vụ',
  'Phòng ban',
  'Bộ phận',
  'Địa chỉ mail',
  'Email',
  'Mail',
  'Đơn vị tính',
  'Tỷ giá USD/VNĐ',
  'Tỷ giá',
  'Lương thu nhập',
  'Tổng lương thu nhập',
  'Tổng thu nhập',
  'Tổng giảm trừ',
  'Tổng khấu trừ',
]);

function str(v: unknown): string {
  if (v == null || v === '') return '-';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return String(v);
}

function pick(d: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = d[k];
    if (v != null && v !== '') return str(v);
  }
  return '-';
}

const DEDUCTION_KEYS = [
  'số tiền đã ứng',
  'truy thu',
  'diễn giải truy thu',
  'tang chế',
];

const DED_SUBSTR = ['khấu trừ', 'giảm trừ', 'truy thu', 'đã ứng', 'tang chế'];

function isDeductionKey(key: string): boolean {
  const low = key.toLowerCase();
  if (DEDUCTION_KEYS.some((d) => low.includes(d))) return true;
  return DED_SUBSTR.some((s) => low.includes(s));
}

export function buildSlipProps(worker: Worker, salary: Salary): SalarySlipViewProps {
  const rawDetails = salary.details;
  let parsed: unknown = {};
  if (typeof rawDetails === 'string') {
    try { parsed = JSON.parse(rawDetails); } catch { parsed = {}; }
  } else if (rawDetails && typeof rawDetails === 'object' && !Array.isArray(rawDetails)) {
    parsed = rawDetails;
  }
  const details = parsed as Record<string, unknown>;

  const monthYear = salary.monthYear;
  const period = salary.period; // 1 = Tạm ứng, 2 = Quyết toán
  const [y, m] = monthYear.split('-');
  const slipDateLabel =
    y && m ? `Snuol, kỳ lương tháng ${m} năm ${y}` : 'Snuol, kỳ lương';

  const base = salary.baseSalary.toString();
  const net = salary.netSalary.toString();

  const incomeRows: DetailRow[] = [];
  const deductionRows: DetailRow[] = [];

  for (const [key, val] of Object.entries(details)) {
    if (EXCLUDE_DETAIL_KEYS.has(key)) continue;
    const row: DetailRow = { label: key, value: str(val) };
    if (isDeductionKey(key)) deductionRows.push(row);
    else incomeRows.push(row);
  }

  if (incomeRows.length === 0) {
    incomeRows.push({ label: 'Thực lãnh (hệ thống)', value: net });
  }

  const totalIncome =
    pick(details, ['Tổng lương thu nhập', 'Tổng thu nhập']) !== '-'
      ? pick(details, ['Tổng lương thu nhập', 'Tổng thu nhập'])
      : net;
  const totalDeduction = pick(details, ['Tổng giảm trừ', 'Tổng khấu trừ']);

  const gross =
    pick(details, ['Lương thu nhập']) !== '-' ? pick(details, ['Lương thu nhập']) : net;

  return {
    companyName: worker.company || 'THACO AGRI SNUOL COMPLEX',
    slipDateLabel,
    period,
    slipTitle: period === 1
      ? `PHIẾU LƯƠNG TẠM ỨNG THÁNG ${m}`
      : `PHIẾU LƯƠNG THÁNG ${m}`,
    currency: pick(details, ['Đơn vị tính']) !== '-' ? pick(details, ['Đơn vị tính']) : 'USD',
    exchangeRate: pick(details, ['Tỷ giá USD/VNĐ', 'Tỷ giá']),
    employeeName: worker.fullName,
    employeeCode: worker.employeeCode,
    position: pick(details, ['Chức vụ', 'Chức Vụ']),
    department: pick(details, ['Phòng ban', 'Bộ phận']),
    email: pick(details, ['Địa chỉ mail', 'Email', 'Mail']),
    grossIncome: gross,
    baseInsurance: base,
    incomeRows,
    deductionRows,
    totalIncome,
    totalDeduction: totalDeduction === '-' ? '-' : totalDeduction,
    netPay: net,
  };
}
