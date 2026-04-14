import type { Salary, Worker } from '@prisma/client';
import type { DetailRow, SalarySlipViewProps } from '@/components/SalarySlipView';

function str(v: unknown): string {
  if (v == null || v === '') return '';
  if (typeof v === 'number' && Number.isFinite(v)) {
    // Làm tròn 2 chữ số thập phân, bỏ trailing zeros
    const rounded = Math.round(v * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '');
  }
  // Nếu string là số → cũng làm tròn 2 decimal
  const s = String(v).trim();
  const n = parseFloat(s);
  if (!isNaN(n) && /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) {
    const rounded = Math.round(n * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '');
  }
  return s;
}

function pick(d: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = d[k];
    if (v != null && v !== '') return str(v);
  }
  return '';
}

function row(label: string, value: string): DetailRow | null {
  if (!value) return null;
  return { label, value };
}

/** Keys không hiển thị trong danh sách income/deduction (đã hiện ở header hoặc metadata) */
const EXCLUDE_KEYS = new Set([
  // Metadata / header
  'Mã Nhân Viên', 'employeeCode',
  'Họ Tên', 'Tên Nhân viên', 'fullName',
  'Lương Cơ Bản', 'Lương Cơ bản', 'Lương Cơ bản (Đóng BHXH)', 'Lương Cơ Bản (Đóng BHXH)', 'baseSalary',
  'Thực Lãnh', 'netSalary',
  'Lương thu nhập', 'Lương Thu Nhập', 'Mức Lương Gốc', 'grossSalary',
  'Chức vụ', 'Chức Vụ', 'role',
  'Phòng ban', 'Bộ phận', 'department',
  'Địa chỉ mail', 'Email', 'Mail', 'email',
  'Đơn vị tính', 'currency',
  'Tỷ giá USD/VNĐ', 'Tỷ giá', 'Tỷ giá USD', 'exchangeRate',
  'Tên Công Ty', 'companyName', 'companyLocation',
  'Phụ trách/quản lý trực tiếp', 'supervisor',
  // Totals (hiện riêng ở footer)
  'Tổng lương thu nhập', 'Tổng thu nhập', 'totalIncome',
  'Tổng giảm trừ', 'Tổng khấu trừ', 'totalDeduction',
  'LƯƠNG THỰC NHẬN (1) – (2)',
  'Lương Cơ bản (đóng BHXH)', 'Lương tham gia BHXH',
]);

/** Keywords để nhận diện khoản khấu trừ */
const DED_SUBSTR = [
  'khấu trừ', 'giảm trừ', 'truy thu', 'đã ứng', 'tang chế', 'tạm ứng',
  'quỹ sinh nhật', 'bảo hiểm', 'thuế', 'tiền ăn', 'tiền điện', 'điện nước',
];

function isDeductionKey(key: string): boolean {
  const low = key.toLowerCase();
  return DED_SUBSTR.some((s) => low.includes(s));
}

/** Danh sách field cố định theo thứ tự ưu tiên (hiện trước) */
const INCOME_ORDER: [string, string[]][] = [
  ['Ngày công chuẩn/tháng', ['standardWorkingDays', 'Ngày công chuẩn/tháng', 'Ngày công chuẩn']],
  ['Ngày công làm việc thực tế', ['actualWorkingDays', 'Ngày công làm việc thực tế', 'Ngày thực tế']],
  ['Lương ngày công làm việc thực tế', ['Lương ngày công làm việc thực tế', 'actualWorkingDaysSalary']],
  ['Lương nghỉ nhật', ['Lương nghỉ nhật']],
  ['Ngày công nghỉ nhật', ['Ngày công nghỉ nhật']],
  ['Lương ngày nghỉ phép', ['Lương ngày nghỉ phép']],
  ['Ngày công nghỉ phép', ['Ngày công nghỉ phép']],
  ['Lương ngày nghỉ Thứ 7', ['Lương ngày nghỉ Thứ 7']],
  ['Ngày công nghỉ Thứ 7', ['Ngày công nghỉ Thứ 7']],
  ['Lương làm việc ngày Lễ/Tết', ['Lương làm việc ngày Lễ/Tết', 'holidaySalary']],
  ['Ngày công làm việc ngày Lễ/Tết', ['Ngày công làm việc ngày Lễ/Tết', 'holidayWorkingDays']],
  ['Lương ngày nghỉ Lễ/Tết/Nghỉ bù', ['Lương ngày nghỉ Lễ/Tết/Nghỉ bù', 'paidLeaveSalary']],
  ['Ngày công nghỉ Lễ/Tết/NB', ['Ngày công nghỉ Lễ/Tết/NB', 'paidLeaveDays']],
  ['Lương ngày LVTN/Nghỉ bù', ['Lương ngày LVTN/Nghỉ bù']],
  ['Ngày công LVTN/NB', ['Ngày công LVTN/NB']],
  ['Lương ngày nghỉ Chế độ', ['Lương ngày nghỉ Chế độ', 'welfareLeaveSalary']],
  ['Ngày công nghỉ Chế độ', ['Ngày công nghỉ Chế độ', 'welfareLeaveDays']],
  ['Giờ tăng ca', ['Giờ tăng ca', 'overtimeHours']],
  ['Lương tăng ca', ['Lương tăng ca', 'overtimeSalary']],
  ['Giờ bổ tăng ca', ['Giờ bổ tăng ca']],
  ['Lương bổ tăng ca', ['Lương bổ tăng ca']],
  ['Truy lĩnh', ['Truy lĩnh', 'arrears']],
  ['Diễn giải truy lĩnh', ['Diễn giải truy lĩnh', 'arrearsNote']],
  ['Phụ cấp Chức danh', ['Phụ cấp Chức danh', 'Phụ cấp chức danh']],
  ['Phụ cấp xăng xe', ['Phụ cấp xăng xe']],
  ['Phụ cấp ăn ca', ['Phụ cấp ăn ca']],
  ['Phụ cấp điện thoại', ['Phụ cấp điện thoại']],
  ['Phụ cấp Kiêm nhiệm', ['Phụ cấp Kiêm nhiệm', 'Phụ cấp kiêm nhiệm']],
  ['Thưởng chuyên cần', ['Thưởng chuyên cần']],
  ['Quà 8/3', ['Quà 8/3', 'Quà lễ']],
  ['Quà sinh nhật/thuật lễ', ['Quà sinh nhật, thuật lễ', 'Quà sinh nhật/thuật lễ']],
  ['Chi phí về phép/ vé máy bay', ['Chi phí về phép/ vé máy bay']],
];

const DEDUCTION_ORDER: [string, string[]][] = [
  ['Bảo hiểm xã hội CCPC', ['Bảo hiểm xã hội CCPC', 'BHXH CCPC', 'Bảo hiểm xã hội']],
  ['Thuế thu nhập', ['Thuế thu nhập', 'Thuế thu nhập cá nhân', 'Thuế TNCN']],
  ['Tiền ăn', ['Tiền ăn']],
  ['Tiền điện nước', ['Tiền điện nước']],
  ['Số tiền đã ứng', ['Số tiền đã ứng', 'Tạm ứng']],
  ['Tạm ứng lương Kỳ 1', ['Tạm ứng lương Kỳ 1', 'Tạm ứng lương kỳ 1']],
  ['Truy thu', ['Truy thu']],
  ['Diễn giải truy thu', ['Diễn giải truy thu']],
  ['Tang chế', ['Tang chế Kỳ 1', 'Tang chế']],
  ['Quỹ sinh nhật', ['Quỹ sinh nhật']],
  ['Phụ cấp ĐDCĐ', ['Phụ cấp ĐDCĐ']],
];

export function buildSlipProps(worker: Worker, salary: Salary): SalarySlipViewProps {
  const rawDetails = salary.details;
  let parsed: unknown = {};
  if (typeof rawDetails === 'string') {
    try { parsed = JSON.parse(rawDetails); } catch { parsed = {}; }
  } else if (rawDetails && typeof rawDetails === 'object' && !Array.isArray(rawDetails)) {
    parsed = rawDetails;
  }
  const d = parsed as Record<string, unknown>;

  const monthYear = salary.monthYear;
  const period = salary.period;
  const [y, m] = monthYear.split('-');
  const slipDateLabel =
    y && m ? `Snuol, kỳ lương tháng ${m} năm ${y}` : 'Snuol, kỳ lương';

  const base = Number(salary.baseSalary) ? salary.baseSalary.toString() : '';
  const net = salary.netSalary.toString();
  const grossRaw = pick(d, ['grossSalary', 'Lương thu nhập', 'Mức Lương Gốc', 'Lương Thu Nhập']);
  const gross = (grossRaw && grossRaw !== '0') ? grossRaw : (net !== '0' ? net : '');

  // ── Track which keys have been used ──
  const usedKeys = new Set<string>();
  for (const k of EXCLUDE_KEYS) {
    if (k in d) usedKeys.add(k);
  }

  function pickAndTrack(keys: string[]): string {
    for (const k of keys) {
      const v = d[k];
      if (v != null && v !== '') {
        usedKeys.add(k);
        return str(v);
      }
    }
    return '';
  }

  // ── Fixed income rows (in order) ──
  const incomeRows: DetailRow[] = [];
  for (const [label, keys] of INCOME_ORDER) {
    const val = pickAndTrack(keys);
    if (val && val !== '0') incomeRows.push({ label, value: val });
  }

  // ── Fixed deduction rows (in order) ──
  const deductionRows: DetailRow[] = [];
  for (const [label, keys] of DEDUCTION_ORDER) {
    const val = pickAndTrack(keys);
    if (val && val !== '0') deductionRows.push({ label, value: val });
  }

  // ── Remaining fields from Excel (not in fixed lists) ──
  for (const [key, val] of Object.entries(d)) {
    if (usedKeys.has(key)) continue;
    if (EXCLUDE_KEYS.has(key)) continue;
    const value = str(val);
    if (!value || value === '0') continue;

    if (isDeductionKey(key)) {
      deductionRows.push({ label: key, value });
    } else {
      incomeRows.push({ label: key, value });
    }
    usedKeys.add(key);
  }

  // ── Đọc trực tiếp từ Excel, không tính toán ──
  const rawTotalIncome = pick(d, ['totalIncome', 'Tổng lương thu nhập', 'Tổng thu nhập']);
  const rawTotalDeduction = pick(d, ['totalDeduction', 'Tổng giảm trừ', 'Tổng khấu trừ']);
  const totalIncome = (rawTotalIncome && rawTotalIncome !== '0') ? rawTotalIncome : '';
  const totalDeduction = (rawTotalDeduction && rawTotalDeduction !== '0') ? rawTotalDeduction : '';
  const netPay = net;

  return {
    companyName: pick(d, ['companyName', 'Tên Công Ty']) || worker.company || 'THACO AGRI SNUOL COMPLEX',
    slipDateLabel,
    period,
    slipTitle: period === 1
      ? `PHIẾU LƯƠNG TẠM ỨNG THÁNG ${m}`
      : `PHIẾU LƯƠNG THÁNG ${m}`,
    currency: pick(d, ['currency', 'Đơn vị tính']) || 'USD',
    exchangeRate: pick(d, ['exchangeRate', 'Tỷ giá USD/VNĐ', 'Tỷ giá']) || '-',
    employeeName: worker.fullName,
    employeeCode: worker.employeeCode,
    position: pick(d, ['role', 'Chức vụ', 'Chức Vụ']),
    department: pick(d, ['department', 'Phòng ban', 'Bộ phận']) || worker.department,
    email: pick(d, ['email', 'Địa chỉ mail', 'Email', 'Mail']),
    grossIncome: gross,
    baseInsurance: base,
    incomeRows,
    deductionRows,
    totalIncome,
    totalDeduction,
    netPay,
  };
}
