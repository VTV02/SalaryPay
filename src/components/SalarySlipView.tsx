import React from 'react';
import { LogoutButton } from '@/components/LogoutButton';

export type DetailRow = { label: string; sub?: string; value: string };

export type SalarySlipViewProps = {
  companyName: string;
  slipDateLabel: string;
  slipTitle: string;
  period?: number; // 1 = Tạm ứng (Đợt 1), 2 = Quyết toán (Đợt 2)
  currency: string;
  exchangeRate: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  department: string;
  email: string;
  grossIncome: string;
  baseInsurance: string;
  incomeRows: DetailRow[];
  deductionRows: DetailRow[];
  totalIncome: string;
  totalDeduction: string;
  netPay: string;
  pdfDownloadHref?: string;
};

/* ── Trilingual label mapping ── */
const LABEL_MAP: Record<string, { en: string; km: string }> = {
  'Ngày công chuẩn/tháng': { en: 'Standard Working Days/Mo', km: 'ថ្ងៃធ្វើការស្តង់ដារ' },
  'Ngày công làm việc thực tế': { en: 'Actual Working Days', km: 'ថ្ងៃធ្វើការជាក់ស្តែង' },
  'Lương ngày công làm việc thực tế': { en: 'Actual Working Days Salary', km: 'ប្រាក់ខែថ្ងៃធ្វើការជាក់ស្តែង' },
  'Lương làm việc ngày Lễ/Tết': { en: 'Holiday Salary', km: 'ប្រាក់ខែថ្ងៃឈប់សម្រាក' },
  'Ngày công làm việc ngày Lễ/Tết': { en: 'Holiday Working Days', km: 'ថ្ងៃធ្វើការថ្ងៃឈប់សម្រាក' },
  'Lương ngày nghỉ Lễ/Tết/Nghỉ bù': { en: 'Paid Leave Salary', km: 'ប្រាក់បៀវត្សរ៍សម្រាក' },
  'Ngày công nghỉ Lễ/Tết/NB': { en: 'Paid Leave Days', km: 'ថ្ងៃឈប់សម្រាក' },
  'Lương ngày nghỉ Chế độ': { en: 'Welfare Leave Salary', km: 'ប្រាក់ខែសម្រាកសុខុមាលភាព' },
  'Ngày công nghỉ Chế độ': { en: 'Welfare Leave Days', km: 'ថ្ងៃឈប់សម្រាកសុខុមាលភាព' },
  'Giờ tăng ca': { en: 'Overtime Hours', km: 'ម៉ោងថែមម៉ោង' },
  'Lương tăng ca': { en: 'Overtime Salary', km: 'ប្រាក់បៀវត្សរ៍ថែមម៉ោង' },
  'Truy lĩnh': { en: 'Arrears', km: 'ប្រាក់ជំពាក់' },
  'Diễn giải truy lĩnh': { en: 'Arrears Note', km: 'កំណត់ចំណាំប្រាក់ជំពាក់' },
  'Quà 8/3': { en: 'Holiday Gift', km: 'អំណោយថ្ងៃឈប់សម្រាក' },
  'Quà lễ': { en: 'Holiday Gift', km: 'អំណោយថ្ងៃឈប់សម្រាក' },
  'Chi phí về phép/ vé máy bay': { en: 'Flight Ticket / Vacation', km: 'សំបុត្រយន្តហោះ/វិស្សមកាល' },
  'Số tiền đã ứng': { en: 'Advanced Payment', km: 'ប្រាក់កក់ដែលបានបង់' },
  'Truy thu': { en: 'Deduction', km: 'ការកាត់ប្រាក់' },
  'Diễn giải truy thu': { en: 'Deduction Note', km: 'កំណត់ចំណាំការកាត់' },
  'Tang chế Kỳ 1': { en: 'Funeral Allowance', km: 'ប្រាក់ឧបត្ថម្ភបុណ្យសព' },
  'Tang chế': { en: 'Funeral Allowance', km: 'ប្រាក់ឧបត្ថម្ភបុណ្យសព' },
};

function Tri({ vi, en, km }: { vi: string; en?: string; km?: string }) {
  const mapped = LABEL_MAP[vi];
  const enText = en || mapped?.en || '';
  const kmText = km || mapped?.km || '';
  return (
    <div className="flex flex-col leading-tight">
      <span className="font-semibold text-slate-800">{vi}</span>
      {enText && <span className="text-[10px] text-slate-500 italic">{enText}</span>}
      {kmText && <span className="text-[11px] text-slate-500">{kmText}</span>}
    </div>
  );
}

function Val({ children, bold, deduction }: { children: React.ReactNode; bold?: boolean; deduction?: boolean }) {
  return (
    <span className={`${bold ? 'font-bold' : 'font-medium'} ${deduction ? 'text-rose-700' : 'text-slate-800'}`}>
      {children}
    </span>
  );
}

export default function SalarySlipView(props: SalarySlipViewProps) {
  const {
    companyName,
    slipDateLabel,
    slipTitle,
    period,
    currency,
    exchangeRate,
    employeeName,
    employeeCode,
    position,
    department,
    email,
    grossIncome,
    baseInsurance,
    incomeRows,
    deductionRows,
    totalIncome,
    totalDeduction,
    netPay,
    pdfDownloadHref,
  } = props;

  const monthNum = slipTitle.replace(/[^\d]/g, '').trim();

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 font-serif text-slate-800">
      <div className="max-w-3xl mx-auto">

        {/* ── Phiếu lương chính ── */}
        <div className="bg-white border border-slate-300 shadow-lg overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src="/LOGO-THACO-AGRI-02-Copy-e1688459733402.png" alt="THACO AGRI" className="h-12" />
                <p className="font-bold text-lg text-slate-900">{companyName}</p>
              </div>
              <p className="text-sm italic text-slate-600 text-right">{slipDateLabel}</p>
            </div>

            <div className="text-center mt-4 mb-2 space-y-0.5">
              <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
                {period === 1
                  ? `PHIẾU LƯƠNG TẠM ỨNG THÁNG ${monthNum}`
                  : `PHIẾU LƯƠNG THÁNG ${monthNum}`}
              </h1>
              <p className="text-sm font-semibold italic text-slate-600">
                {period === 1
                  ? `ADVANCE SALARY SLIP FOR MONTH ${monthNum}`
                  : `SALARY SLIP FOR MONTH ${monthNum}`}
              </p>
              <p className="text-sm text-slate-600">
                {period === 1
                  ? `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍បណ្ដោះអាសន្នខែ ${monthNum}`
                  : `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ប្រចាំខែ ${monthNum}`}
              </p>
            </div>

            {/* Currency / rate */}
            <div className="flex justify-end text-xs text-slate-600 mt-3 gap-6">
              <div className="flex items-center gap-1">
                <Tri vi="Đơn vị tính:" en="Unit:" km="ឯកតារង្វាស់:" />
                <span className="ml-1 font-bold text-slate-800">{currency}</span>
              </div>
              {exchangeRate !== '-' && (
                <div className="flex items-center gap-1">
                  <Tri vi="Tỷ giá USD/VNĐ:" en="Exchange Rate:" km="អត្រាប្តូរប្រាក់:" />
                  <span className="ml-1 font-bold text-slate-800">{exchangeRate}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Thông tin nhân viên ── */}
          <div className="px-2 sm:px-4">
            <table className="w-full border-collapse border border-blue-300 text-sm mb-1">
              <tbody>
                <tr className="bg-blue-50/60">
                  <td className="border border-blue-200 p-2 w-1/4">
                    <Tri vi="Mã Nhân viên" en="Emp ID" km="លេខសម្គាល់បុគ្គលិក" />
                  </td>
                  <td className="border border-blue-200 p-2 text-center font-bold tracking-wider text-lg">
                    {employeeCode}
                  </td>
                  <td className="border border-blue-200 p-2 w-1/4">
                    <Tri vi="Chức vụ" en="Position / Job Title" km="មុខតំណែង" />
                  </td>
                  <td className="border border-blue-200 p-2 text-center font-bold italic">
                    {position}
                  </td>
                </tr>
                <tr>
                  <td className="border border-blue-200 p-2">
                    <Tri vi="Tên Nhân viên" en="Full Name" km="ឈ្មោះពេញ" />
                  </td>
                  <td className="border border-blue-200 p-2 text-center font-bold uppercase">
                    {employeeName}
                  </td>
                  <td className="border border-blue-200 p-2">
                    <Tri vi="Phòng ban" en="Department" km="នាយកដ្ឋាន" />
                  </td>
                  <td className="border border-blue-200 p-2 text-center font-bold italic">
                    {department}
                  </td>
                </tr>
                {email !== '-' && (
                  <tr className="bg-blue-50/60">
                    <td colSpan={2} className="border border-blue-200 p-2 text-center">
                      <Tri vi="Địa chỉ mail / Email" en="" km="អាស័យដ្ឋានអ៊ីម៉ែល" />
                    </td>
                    <td colSpan={2} className="border border-blue-200 p-2 text-center text-blue-600 underline font-medium">
                      {email}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ── Bảng lương chi tiết ── */}
            <table className="w-full border-collapse border border-blue-300 text-sm">
              <tbody>
                {/* Gross + Base */}
                <tr className="bg-[#a3d29c] border-b-2 border-white">
                  <td className="p-2 border border-blue-300 w-1/4">
                    <Tri vi="Lương thu nhập" en="Gross Salary" km="ប្រាក់ខែសរុប" />
                  </td>
                  <td className="p-2 border border-blue-300 w-1/4 text-center font-bold text-lg">
                    {grossIncome}
                  </td>
                  <td className="p-2 border border-blue-300 w-1/4">
                    <Tri vi="Lương Cơ bản (Đóng BHXH)" en="Base Salary (Social Ins.)" km="ប្រាក់ខែសុទ្ធ" />
                  </td>
                  <td className="p-2 border border-blue-300 w-1/4 text-center font-bold text-lg">
                    {baseInsurance}
                  </td>
                </tr>

                {/* Thu nhập header */}
                {incomeRows.length > 0 && (
                  <tr>
                    <td className="p-2 border border-blue-200 italic" colSpan={2}>
                      <Tri vi="❖ Các khoản thu nhập:" en="❖ Incomes:" km="❖ ប្រាក់ចំណូល:" />
                    </td>
                    {/* pair with deduction header if deductions exist */}
                    {deductionRows.length > 0 ? (
                      <td className="p-2 border border-blue-200 italic" colSpan={2}>
                        <Tri vi="❖ Các khoản khấu trừ:" en="❖ Deductions:" km="❖ ការកាត់កង:" />
                      </td>
                    ) : (
                      <td colSpan={2} className="border border-blue-200 bg-slate-50" />
                    )}
                  </tr>
                )}

                {/* Income + Deduction rows side by side */}
                {Array.from({ length: Math.max(incomeRows.length, deductionRows.length) }).map((_, i) => {
                  const inc = incomeRows[i];
                  const ded = deductionRows[i];
                  return (
                    <tr key={i}>
                      {inc ? (
                        <>
                          <td className="p-2 border border-blue-200">
                            <Tri vi={inc.label} />
                            {inc.sub && <span className="text-[10px] text-slate-400 block">{inc.sub}</span>}
                          </td>
                          <td className="p-2 border border-blue-200 text-center">
                            <Val>{inc.value}</Val>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border border-blue-200 bg-slate-50" />
                          <td className="border border-blue-200 bg-slate-50" />
                        </>
                      )}
                      {ded ? (
                        <>
                          <td className="p-2 border border-blue-200">
                            <Tri vi={ded.label} />
                            {ded.sub && <span className="text-[10px] text-slate-400 block">{ded.sub}</span>}
                          </td>
                          <td className="p-2 border border-blue-200 text-center">
                            <Val deduction>{ded.value}</Val>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border border-blue-200 bg-slate-50" />
                          <td className="border border-blue-200 bg-slate-50" />
                        </>
                      )}
                    </tr>
                  );
                })}

                {/* Totals row */}
                <tr className="bg-[#a3d29c]">
                  <td className="p-3 border border-blue-300">
                    <Tri vi="Tổng lương thu nhập (1)" en="Total Income (1)" km="ប្រាក់ចំណូលសរុប (1)" />
                  </td>
                  <td className="p-3 border border-blue-300 text-center font-black text-lg">
                    {totalIncome}
                  </td>
                  <td className="p-3 border border-blue-300">
                    <Tri vi="Tổng giảm trừ (2)" en="Total Deduction (2)" km="ការកាត់កងសរុប (2)" />
                  </td>
                  <td className="p-3 border border-blue-300 text-center font-black text-lg text-rose-600">
                    {totalDeduction}
                  </td>
                </tr>

                {/* Net pay */}
                <tr className="bg-[#fee197]">
                  <td colSpan={2} className="p-4 border border-blue-300 text-center uppercase tracking-wider">
                    <div className="font-bold text-lg">Lương Thực Nhận (1) - (2)</div>
                    <div className="text-xs text-slate-700 italic">NET SALARY / ប្រាក់កម្រៃសុទ្ធ</div>
                  </td>
                  <td colSpan={2} className="p-4 border border-blue-300 text-center text-3xl font-black text-rose-700">
                    {netPay}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Warning */}
          <div className="mx-4 my-4 flex items-start bg-amber-50 border border-amber-200 rounded-lg p-3">
            <svg
              className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-[11px] leading-relaxed space-y-0.5">
              <p className="font-bold text-amber-900">Lương là bảo mật, mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt theo quy chế Công ty!</p>
              <p className="text-amber-800 italic">Salary is confidential. Any attempt to access others&apos; salary will be disciplined per company policy.</p>
              <p className="text-amber-800">ប្រាក់ខែគឺជាការសម្ងាត់ ។ រាល់សកម្មភាពស្វែងរកប្រាក់ខែអ្នកដទៃនឹងត្រូវពិន័យតាមបទប្បញ្ញត្តិក្រុមហ៊ុន!</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center space-x-4 mb-8">
          {pdfDownloadHref ? (
            <a
              href={pdfDownloadHref}
              className="inline-flex items-center px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-50 hover:text-emerald-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải PDF / Download
            </a>
          ) : (
            <span className="inline-flex items-center px-6 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-full text-sm font-medium cursor-not-allowed">
              Tải PDF
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
