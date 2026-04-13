"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { AdminUpload } from '@/app/admin/admin-upload';
import { AdminManage } from '@/app/admin/admin-manage';
import { LogoLoader } from '@/components/LogoLoader';

interface Worker { id: string; employeeCode: string; fullName: string; failedAttempts: number; lockUntil: string | null; }

const InputField = ({ name, align = 'center', weight = 'normal', value, onChange }: {name:string, align?: string, weight?: string, value: string, onChange: any}) => (
  <input type="text" name={name} value={value || ''} onChange={onChange} className={`w-full bg-slate-100/50 hover:bg-amber-50 focus:bg-amber-100 text-${align} border border-dashed border-slate-300 focus:border-amber-500 outline-none p-1 text-slate-800 ${weight === 'bold' ? 'font-bold' : ''} transition-colors`} />
)

const LabelTrilingual = ({ vi, en, km }: { vi: string, en: string, km: string }) => (
  <div className="flex flex-col">
    <span className="font-bold">{vi}</span>
    <span className="text-[10px] text-slate-600 font-normal leading-tight italic">{en}</span>
    <span className="text-[11px] text-slate-500 font-normal leading-tight">{km}</span>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'EMPLOYEES' | 'SALARY_EDIT' | 'QR_PRINT'>('UPLOAD');
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
  const [salaryFile, setSalaryFile] = useState<File | null>(null);
  const [monthYear, setMonthYear] = useState('');
  
  const [loadingType, setLoadingType] = useState<'EMPLOYEE'|'SALARY'|null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const router = useRouter();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  const [searchEmpCode, setSearchEmpCode] = useState('');
  const [searchMonth, setSearchMonth] = useState('2026-03');
  const [searchPeriod, setSearchPeriod] = useState<number>(1);
  const [foundWorker, setFoundWorker] = useState<any>(null);
  const [salaryDetails, setSalaryDetails] = useState<any>(null);
  const [salarySaving, setSalarySaving] = useState(false);
  const [searchingSalary, setSearchingSalary] = useState(false);
  const [fullLoading, setFullLoading] = useState<string | null>(null);

  const fetchWorkers = async () => { /*...*/ };
  const handleUploadEmployees = async () => { /*...*/ };
  const handleUploadSalaries = async () => { /*...*/ };
  const unlockWorker = async () => { /*...*/ };
  const handleLogout = async () => { setFullLoading('Đang đăng xuất...'); await fetch('/api/admin/auth/logout', { method: 'POST' }); router.push('/admin/login'); };

  const handleSearchSalary = async () => {
    if (!searchEmpCode || !searchMonth) { alert("Vui lòng nhập Mã NV và Tháng (YYYY-MM)"); return; }
    setSearchingSalary(true);
    try {
      const res = await fetch(`/api/admin/salaries/search?employeeCode=${searchEmpCode}&monthYear=${searchMonth}&period=${searchPeriod}`);
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setFoundWorker(data.worker);
      let initialDetails: any = {};
      if (data.salary && data.salary.details) {
        try { initialDetails = JSON.parse(data.salary.details); } catch(e){}
      }

      const getVal = (keys: string[]) => {
        for (const k of keys) {
           if (initialDetails[k] !== undefined && initialDetails[k] !== null && initialDetails[k] !== '') {
              return initialDetails[k];
           }
        }
        return '';
      };

      setSalaryDetails({
        id: data.salary?.id,
        grossSalary: getVal(['grossSalary', 'Lương thu nhập', 'Mức Lương Gốc', 'Lương Thu Nhập']),
        baseSalary: getVal(['baseSalary', 'Lương cơ bản', 'Lương Cơ Bản (Đóng BHXH)', 'Lương Cơ Bản', 'Lương tham gia BHXH']) || data.salary?.baseSalary || '',
        companyName: getVal(['companyName', 'Tên Công Ty']) || 'CÔNG TY TNHH EASTERN RUBBER CAMBODIA',
        currency: getVal(['currency', 'Đơn vị tính']) || 'USD',
        exchangeRate: getVal(['exchangeRate', 'Tỷ giá', 'Tỷ giá USD', 'Tỷ giá USD/VNĐ']),
        role: getVal(['role', 'Chức vụ', 'Vị trí', 'Job Title']),
        department: getVal(['department', 'Phòng ban', 'Bộ phận', 'Department']),
        email: getVal(['email', 'Địa chỉ mail', 'Email', 'Hòm thư']),
        supervisor: getVal(['supervisor', 'Phụ trách/quản lý trực tiếp']),
        // Thu nhập
        standardWorkingDays: getVal(['standardWorkingDays', 'Ngày công chuẩn/tháng', 'Ngày công chuẩn']),
        actualWorkingDays: getVal(['actualWorkingDays', 'Ngày công làm việc thực tế', 'Ngày thực tế']),
        actualWorkingDaysSalary: getVal(['actualWorkingDaysSalary', 'Lương ngày công làm việc thực tế']),
        sundayRestSalary: getVal(['Lương nghỉ nhật']),
        sundayRestDays: getVal(['Ngày công nghỉ nhật']),
        annualLeaveSalary: getVal(['Lương ngày nghỉ phép']),
        annualLeaveDays: getVal(['Ngày công nghỉ phép']),
        saturdaySalary: getVal(['Lương ngày nghỉ Thứ 7']),
        saturdayDays: getVal(['Ngày công nghỉ Thứ 7']),
        holidaySalary: getVal(['holidaySalary', 'Lương làm việc ngày Lễ/Tết']),
        holidayWorkingDays: getVal(['holidayWorkingDays', 'Ngày công làm việc ngày Lễ/Tết']),
        paidLeaveSalary: getVal(['paidLeaveSalary', 'Lương ngày nghỉ Lễ/Tết/Nghỉ bù']),
        paidLeaveDays: getVal(['paidLeaveDays', 'Ngày công nghỉ Lễ/Tết/NB']),
        compLeaveSalary: getVal(['Lương ngày LVTN/Nghỉ bù']),
        compLeaveDays: getVal(['Ngày công LVTN/NB']),
        welfareLeaveSalary: getVal(['welfareLeaveSalary', 'Lương ngày nghỉ Chế độ']),
        welfareLeaveDays: getVal(['welfareLeaveDays', 'Ngày công nghỉ Chế độ']),
        overtimeHours: getVal(['overtimeHours', 'Giờ tăng ca']),
        overtimeSalary: getVal(['overtimeSalary', 'Lương tăng ca']),
        addOvertimeHours: getVal(['Giờ bổ tăng ca']),
        addOvertimeSalary: getVal(['Lương bổ tăng ca']),
        arrears: getVal(['arrears', 'Truy lĩnh']),
        arrearsNote: getVal(['arrearsNote', 'Diễn giải truy lĩnh']),
        positionAllowance: getVal(['Phụ cấp Chức danh', 'Phụ cấp chức danh']),
        gasAllowance: getVal(['Phụ cấp xăng xe']),
        mealAllowance: getVal(['Phụ cấp ăn ca']),
        phoneAllowance: getVal(['Phụ cấp điện thoại']),
        concurrentAllowance: getVal(['Phụ cấp Kiêm nhiệm', 'Phụ cấp kiêm nhiệm']),
        attendanceBonus: getVal(['Thưởng chuyên cần']),
        gift8d3: getVal(['gift8d3', 'Quà 8/3', 'Quà lễ']),
        birthdayCeremonyGift: getVal(['Quà sinh nhật, thuật lễ', 'Quà sinh nhật/thuật lễ']),
        flightTicket: getVal(['flightTicket', 'Chi phí về phép/ vé máy bay']),
        totalIncome: getVal(['totalIncome', 'Tổng lương thu nhập', 'Tổng thu nhập']),
        // Khấu trừ
        socialInsurance: getVal(['Bảo hiểm xã hội CCPC', 'BHXH CCPC', 'Bảo hiểm xã hội']),
        incomeTax: getVal(['Thuế thu nhập', 'Thuế thu nhập cá nhân', 'Thuế TNCN']),
        mealDeduction: getVal(['Tiền ăn']),
        utilities: getVal(['Tiền điện nước']),
        advancedPayment: getVal(['advancedPayment', 'Số tiền đã ứng', 'Tạm ứng']),
        phase1Advance: getVal(['Tạm ứng lương Kỳ 1', 'Tạm ứng lương kỳ 1']),
        deduction: getVal(['deduction', 'Truy thu']),
        deductionNote: getVal(['deductionNote', 'Diễn giải truy thu']),
        funeralAllowance: getVal(['funeralAllowance', 'Tang chế Kỳ 1', 'Tang chế']),
        birthdayFund: getVal(['Quỹ sinh nhật']),
        unionAllowance: getVal(['Phụ cấp ĐDCĐ']),
        totalDeduction: getVal(['totalDeduction', 'Tổng giảm trừ', 'Tổng khấu trừ']),
        netSalary: data.salary?.netSalary || '',
        ...initialDetails
      });
    } catch (e) { alert("Lỗi kết nối"); } finally { setSearchingSalary(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSalaryDetails({ ...salaryDetails, [name]: value });
  };

  const hasVal = (...keys: string[]) => keys.some(k => {
    const v = salaryDetails?.[k];
    return v != null && v !== '' && v !== '0' && v !== 0;
  });

  const handleSaveSalary = async () => {
    setSalarySaving(true);
    const detailsObj = { ...salaryDetails };
    delete detailsObj.id;
    delete detailsObj.netSalary;

    const baseSalary = typeof detailsObj.baseSalary === 'string'
      ? (parseFloat(detailsObj.baseSalary.replace(/,/g, '')) || 0)
      : (detailsObj.baseSalary || 0);
    delete detailsObj.baseSalary;

    const netSalary = typeof salaryDetails.netSalary === 'string'
      ? (parseFloat(salaryDetails.netSalary.replace(/,/g, '')) || 0)
      : (salaryDetails.netSalary || 0);

    try {
      const res = await fetch('/api/admin/salaries/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: foundWorker.id,
          monthYear: searchMonth,
          period: searchPeriod,
          baseSalary,
          netSalary,
          details: detailsObj
        })
      });
      if (!res.ok) alert("Có lỗi cập nhật!"); else alert("Đã Chốt Biên lai Lương thành công!");
    } catch(e) { alert("Lỗi máy chủ rớt mạng"); }
    setSalarySaving(false);
  };

  const printQR = () => { window.print(); };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 pt-12 text-slate-800 printable-bg relative">
      <style dangerouslySetInnerHTML={{__html:`@media print { .no-print { display: none !important; } .printable-bg { background: white !important; padding: 0 !important; } }`}}></style>

      {fullLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <LogoLoader text={fullLoading} />
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-start no-print">
          <div className="flex items-center gap-3"><img src="/LOGO-THACO-AGRI-02-Copy-e1688459733402.png" alt="THACO AGRI" className="h-12" /><div><h1 className="text-3xl font-black text-slate-900">SPortal</h1><p className="text-xs text-slate-500 uppercase tracking-widest">Hệ thống quản lý tiền lương</p></div></div>
          <button onClick={handleLogout} className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-full">Đăng xuất</button>
        </div>

        <div className="flex space-x-2 border-b border-slate-200 pb-px no-print overflow-x-auto">
          <button onClick={() => setActiveTab('UPLOAD')} className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'UPLOAD' ? 'border-amber-500 text-amber-600' : 'border-transparent'}`}>Nạp Dữ Liệu</button>
          <button onClick={() => setActiveTab('EMPLOYEES')} className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'EMPLOYEES' ? 'border-amber-500 text-amber-600' : 'border-transparent'}`}>Nhân Viên</button>
          <button onClick={() => setActiveTab('SALARY_EDIT')} className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'SALARY_EDIT' ? 'border-amber-500 text-amber-600' : 'border-transparent'}`}>Tra cứu sửa đổi Phiếu lương</button>
          <button onClick={() => setActiveTab('QR_PRINT')} className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'QR_PRINT' ? 'border-amber-500 text-amber-600' : 'border-transparent'}`}>In Mã QR Đa Ngôn Ngữ</button>
        </div>

        {/* TAB 1: NẠP DỮ LIỆU */}
        {activeTab === 'UPLOAD' && (
          <div className="max-w-2xl mx-auto">
            <AdminUpload />
          </div>
        )}

        {/* TAB 2: NHÂN VIÊN */}
        {activeTab === 'EMPLOYEES' && (
          <div className="max-w-2xl mx-auto">
            <AdminManage />
          </div>
        )}

        {/* TAB 3: SALARY EDIT WITH TRILINGUAL */}
        {activeTab === 'SALARY_EDIT' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                 <input type="text" placeholder="Nhập Mã Nhân Viên..." value={searchEmpCode} onChange={e => setSearchEmpCode(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-300 w-48 outline-none" />
                 <input type="month" value={searchMonth} onChange={e => setSearchMonth(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-300 w-48 outline-none" />
                 <select value={searchPeriod} onChange={e => setSearchPeriod(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-slate-300 outline-none">
                   <option value={1}>Đợt 1 — Tạm ứng</option>
                   <option value={2}>Đợt 2 — Quyết toán</option>
                 </select>
                 <button onClick={handleSearchSalary} disabled={searchingSalary} className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium shadow disabled:opacity-60 flex items-center">{searchingSalary ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Đang tải...</>) : 'Tải Phiếu Lương'}</button>
              </div>

              {searchingSalary && (
                <div className="py-16">
                  <LogoLoader text="Đang tải dữ liệu phiếu lương..." />
                </div>
              )}

              {!searchingSalary && foundWorker && salaryDetails && (
                <div className="border-t-2 border-slate-200 pt-8 mt-4 bg-slate-50 relative pb-12">
                  {salarySaving && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
                      <LogoLoader text="Đang lưu dữ liệu lên máy chủ..." />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded">Chỉnh sửa trực tiếp</div>
                  <div className="max-w-4xl mx-auto border p-8 bg-white shadow-lg font-serif text-slate-800">
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-[300px]">
                          <InputField name="companyName" value={salaryDetails.companyName} onChange={handleChange} align="left" weight="bold" />
                          <InputField name="companyLocation" value={salaryDetails.companyLocation} onChange={handleChange} align="left" weight="bold" />
                        </div>
                        <div className="text-right italic mt-2">Snuol, ngày 21 tháng 03 năm 2026</div>
                     </div>
                     
                     <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold uppercase tracking-wide">
                          {searchPeriod === 1 ? `PHIẾU LƯƠNG TẠM ỨNG THÁNG ${searchMonth.split('-')[1]}` : `PHIẾU LƯƠNG THÁNG ${searchMonth.split('-')[1]}`}
                        </h1>
                        <p className="text-sm font-semibold italic text-slate-600">
                          {searchPeriod === 1 ? `ADVANCE SALARY SLIP FOR MONTH ${searchMonth.split('-')[1]}` : `SALARY SLIP FOR MONTH ${searchMonth.split('-')[1]}`}
                        </p>
                        <p className="text-sm fn-khmer mt-1">
                          {searchPeriod === 1 ? `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍បណ្ដោះអាសន្នខែ ${searchMonth.split('-')[1]}` : `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ប្រចាំខែ ${searchMonth.split('-')[1]}`}
                        </p>
                     </div>
                     
                     <div className="flex justify-end mb-4">
                       <div className="w-64 text-right font-medium italic space-y-1">
                         <div className="flex items-center justify-end"><LabelTrilingual vi="Đơn vị tính:" en="Unit:" km="ឯកតារង្វាស់:" />
                           <select name="currency" value={salaryDetails.currency || 'USD'} onChange={(e: any) => handleChange(e)} className="ml-2 w-20 border border-dashed border-slate-300 focus:border-amber-500 outline-none p-1 text-center font-bold bg-slate-100/50 hover:bg-amber-50 focus:bg-amber-100 transition-colors">
                             <option value="USD">USD</option>
                             <option value="KHR">KHR</option>
                           </select>
                         </div>
                         {(salaryDetails.currency || 'USD') === 'USD' && (
                         <div className="flex items-center justify-end"><LabelTrilingual vi="Tỷ giá USD/VNĐ:" en="Exchange Rate:" km="អត្រាប្តូរប្រាក់:" /> <div className="ml-2 w-20"><InputField name="exchangeRate" value={salaryDetails.exchangeRate} onChange={handleChange} align="right" weight="bold"/></div></div>
                         )}
                       </div>
                     </div>
                     
                     <table className="w-full border-collapse border border-blue-300 mb-4 text-sm bg-white">
                        <tbody>
                          <tr className="bg-blue-50/60">
                             <td className="border border-blue-200 p-2 w-1/4"><LabelTrilingual vi="Mã Nhân viên" en="Emp ID" km="លេខសម្គាល់បុគ្គលិក" /></td>
                             <td className="border border-blue-200 p-2 text-center font-bold tracking-wider text-lg lg:text-xl">{foundWorker.employeeCode}</td>
                             <td className="border border-blue-200 p-2 w-1/4"><LabelTrilingual vi="Chức vụ" en="Position / Job Title" km="មុខតំណែង" /></td>
                             <td className="border border-blue-200 p-1 text-center italic font-bold"><InputField name="role" value={salaryDetails.role} onChange={handleChange} /></td>
                          </tr>
                          <tr>
                             <td className="border border-blue-200 p-2"><LabelTrilingual vi="Tên Nhân viên" en="Full Name" km="ឈ្មោះពេញ" /></td>
                             <td className="border border-blue-200 p-2 text-center font-bold uppercase">{foundWorker.fullName}</td>
                             <td className="border border-blue-200 p-2"><LabelTrilingual vi="Phòng ban" en="Department" km="នាយកដ្ឋាន" /></td>
                             <td className="border border-blue-200 p-1 text-center italic font-bold"><InputField name="department" value={salaryDetails.department} onChange={handleChange} /></td>
                          </tr>
                          <tr className="bg-blue-50/60">
                             <td colSpan={2} className="border border-blue-200 p-2 text-center"><LabelTrilingual vi="Địa chỉ mail / Email" en="" km="អាស័យដ្ឋានអ៊ីម៉ែល" /></td>
                             <td colSpan={2} className="border border-blue-200 p-1 text-center text-blue-600 underline font-medium"><InputField name="email" value={salaryDetails.email} onChange={handleChange} align="center" /></td>
                          </tr>
                        </tbody>
                     </table>

                     <table className="w-full border-collapse border border-blue-300 text-sm bg-white">
                        <tbody>
                           <tr className="bg-[#a3d29c] border-b-2 border-white">
                              <td className="p-2 border border-blue-300 w-1/4"><LabelTrilingual vi="Lương thu nhập" en="Gross Salary" km="ប្រាក់ខែសរុប" /></td>
                              <td className="p-1 border border-blue-300 w-1/4"><InputField name="grossSalary" value={salaryDetails.grossSalary} onChange={handleChange} weight="bold" /></td>
                              <td className="p-2 border border-blue-300 w-1/4"><LabelTrilingual vi="Lương Cơ bản (Đóng BHXH)" en="Base Salary (Social Ins.)" km="ប្រាក់ខែសុទ្ធ" /></td>
                              <td className="p-1 border border-blue-300 w-1/4"><InputField name="baseSalary" value={salaryDetails.baseSalary} onChange={handleChange} weight="bold"/></td>
                           </tr>

                           <tr>
                              <td className="p-2 border border-blue-200 italic"><LabelTrilingual vi="❖ Các khoản thu nhập:" en="❖ Incomes:" km="❖ ប្រាក់ចំណូល:" /></td>
                              <td className="p-0 border border-blue-200 bg-slate-50"></td>
                              <td className="p-2 border border-blue-200 italic"><LabelTrilingual vi="❖ Ngày công chuẩn/tháng:" en="❖ Standard Working Days/Mo:" km="❖ ថ្ងៃធ្វើការស្តង់ដារ:" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="standardWorkingDays" value={salaryDetails.standardWorkingDays} onChange={handleChange} /></td>
                           </tr>

                           {hasVal('actualWorkingDaysSalary','actualWorkingDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương ngày công làm việc thực tế" en="Actual Working Days Salary" km="ប្រាក់ខែថ្ងៃធ្វើការជាក់ស្តែង" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="actualWorkingDaysSalary" value={salaryDetails.actualWorkingDaysSalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công làm việc thực tế" en="Actual Working Days" km="ថ្ងៃធ្វើការជាក់ស្តែង" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="actualWorkingDays" value={salaryDetails.actualWorkingDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('sundayRestSalary','sundayRestDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương nghỉ nhật" en="Sunday Rest Salary" km="ប្រាក់ឈប់សម្រាកថ្ងៃអាទិត្យ" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="sundayRestSalary" value={salaryDetails.sundayRestSalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công nghỉ nhật" en="Sunday Rest Days" km="ថ្ងៃឈប់សម្រាកអាទិត្យ" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="sundayRestDays" value={salaryDetails.sundayRestDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('annualLeaveSalary','annualLeaveDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương ngày nghỉ phép" en="Annual Leave Salary" km="ប្រាក់ឈប់សម្រាកប្រចាំឆ្នាំ" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="annualLeaveSalary" value={salaryDetails.annualLeaveSalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công nghỉ phép" en="Annual Leave Days" km="ថ្ងៃឈប់សម្រាកប្រចាំឆ្នាំ" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="annualLeaveDays" value={salaryDetails.annualLeaveDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('saturdaySalary','saturdayDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương ngày nghỉ Thứ 7" en="Saturday Rest Salary" km="ប្រាក់ឈប់សម្រាកថ្ងៃសៅរ៍" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="saturdaySalary" value={salaryDetails.saturdaySalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công nghỉ Thứ 7" en="Saturday Rest Days" km="ថ្ងៃឈប់សម្រាកសៅរ៍" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="saturdayDays" value={salaryDetails.saturdayDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('holidaySalary','holidayWorkingDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương làm việc ngày Lễ/Tết" en="Holiday Salary" km="ប្រាក់ខែថ្ងៃឈប់សម្រាក" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="holidaySalary" value={salaryDetails.holidaySalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công làm việc ngày Lễ/Tết" en="Holiday Working Days" km="ថ្ងៃធ្វើការថ្ងៃឈប់សម្រាក" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="holidayWorkingDays" value={salaryDetails.holidayWorkingDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('paidLeaveSalary','paidLeaveDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương ngày nghỉ Lễ/Tết/Nghỉ bù" en="Paid Leave Salary" km="ប្រាក់បៀវត្សរ៍សម្រាក" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="paidLeaveSalary" value={salaryDetails.paidLeaveSalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công nghỉ Lễ/Tết/NB" en="Paid Leave Days" km="ថ្ងៃឈប់សម្រាក" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="paidLeaveDays" value={salaryDetails.paidLeaveDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('compLeaveSalary','compLeaveDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương ngày LVTN/Nghỉ bù" en="Comp Leave Salary" km="ប្រាក់ឈប់សម្រាកជំនួស" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="compLeaveSalary" value={salaryDetails.compLeaveSalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công LVTN/NB" en="Comp Leave Days" km="ថ្ងៃឈប់សម្រាកជំនួស" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="compLeaveDays" value={salaryDetails.compLeaveDays} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('welfareLeaveSalary','welfareLeaveDays') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương ngày nghỉ Chế độ" en="Welfare Leave Salary" km="ប្រាក់ខែសម្រាកសុខុមាលភាព" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="welfareLeaveSalary" value={salaryDetails.welfareLeaveSalary} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Ngày công nghỉ Chế độ" en="Welfare Leave Days" km="ថ្ងៃឈប់សម្រាកសុខុមាលភាព" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="welfareLeaveDays" value={salaryDetails.welfareLeaveDays} onChange={handleChange} /></td>
                           </tr>}

                           {hasVal('overtimeHours','overtimeSalary') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Giờ tăng ca" en="Overtime Hours" km="ម៉ោងថែមម៉ោង" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="overtimeHours" value={salaryDetails.overtimeHours} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương tăng ca" en="Overtime Salary" km="ប្រាក់បៀវត្សរ៍ថែមម៉ោង" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="overtimeSalary" value={salaryDetails.overtimeSalary} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('addOvertimeHours','addOvertimeSalary') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Giờ bổ tăng ca" en="Add. Overtime Hours" km="ម៉ោងថែមម៉ោងបន្ថែម" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="addOvertimeHours" value={salaryDetails.addOvertimeHours} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Lương bổ tăng ca" en="Add. Overtime Salary" km="ប្រាក់បៀវត្សរ៍ថែមម៉ោងបន្ថែម" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="addOvertimeSalary" value={salaryDetails.addOvertimeSalary} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('arrears','arrearsNote') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Truy lĩnh" en="Arrears" km="ប្រាក់ជំពាក់" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="arrears" value={salaryDetails.arrears} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200 italic"><LabelTrilingual vi="D.giải truy lĩnh" en="Arrears Note" km="កំណត់ចំណាំប្រាក់ជំពាក់" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="arrearsNote" value={salaryDetails.arrearsNote} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('positionAllowance','gasAllowance') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Phụ cấp Chức danh" en="Position Allowance" km="ប្រាក់ឧបត្ថម្ភមុខតំណែង" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="positionAllowance" value={salaryDetails.positionAllowance} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Phụ cấp xăng xe" en="Gas Allowance" km="ប្រាក់ឧបត្ថម្ភសាំង" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="gasAllowance" value={salaryDetails.gasAllowance} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('mealAllowance','phoneAllowance') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Phụ cấp ăn ca" en="Meal Allowance" km="ប្រាក់ឧបត្ថម្ភអាហារ" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="mealAllowance" value={salaryDetails.mealAllowance} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Phụ cấp điện thoại" en="Phone Allowance" km="ប្រាក់ឧបត្ថម្ភទូរស័ព្ទ" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="phoneAllowance" value={salaryDetails.phoneAllowance} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('concurrentAllowance','attendanceBonus') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Phụ cấp Kiêm nhiệm" en="Concurrent Allowance" km="ប្រាក់ឧបត្ថម្ភរួមគ្នា" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="concurrentAllowance" value={salaryDetails.concurrentAllowance} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Thưởng chuyên cần" en="Attendance Bonus" km="ប្រាក់រង្វាន់វត្តមាន" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="attendanceBonus" value={salaryDetails.attendanceBonus} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('gift8d3','birthdayCeremonyGift') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Quà 8/3" en="Holiday Gift" km="អំណោយថ្ងៃឈប់សម្រាក" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="gift8d3" value={salaryDetails.gift8d3} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Quà sinh nhật/thuật lễ" en="Birthday/Ceremony Gift" km="អំណោយថ្ងៃកំណើត" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="birthdayCeremonyGift" value={salaryDetails.birthdayCeremonyGift} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('flightTicket') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Chi phí vé máy bay/về phép" en="Flight Ticket / Vacation" km="សំបុត្រយន្តហោះ/វិស្សមកាល" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="flightTicket" value={salaryDetails.flightTicket} onChange={handleChange} /></td>
                              <td colSpan={2} className="border border-blue-200 bg-slate-50"></td>
                           </tr>}

                           {/* ── Khấu trừ ── */}
                           {hasVal('socialInsurance','incomeTax','mealDeduction','utilities','advancedPayment','phase1Advance','deduction','funeralAllowance','birthdayFund','unionAllowance') && <tr>
                              <td colSpan={4} className="p-2 border border-blue-200 italic bg-rose-50/50"><LabelTrilingual vi="❖ Các khoản khấu trừ:" en="❖ Deductions:" km="❖ ការកាត់កង:" /></td>
                           </tr>}
                           {hasVal('socialInsurance','incomeTax') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Bảo hiểm xã hội CCPC" en="Social Insurance" km="ធានារ៉ាប់រងសង្គម" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="socialInsurance" value={salaryDetails.socialInsurance} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Thuế thu nhập" en="Income Tax" km="ពន្ធលើប្រាក់ចំណូល" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="incomeTax" value={salaryDetails.incomeTax} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('mealDeduction','utilities') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Tiền ăn" en="Meal Deduction" km="កាត់ប្រាក់អាហារ" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="mealDeduction" value={salaryDetails.mealDeduction} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Tiền điện nước" en="Utilities" km="ថ្លៃទឹកភ្លើង" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="utilities" value={salaryDetails.utilities} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('advancedPayment','phase1Advance') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Số tiền đã ứng" en="Advanced Payment" km="ប្រាក់កក់ដែលបានបង់" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="advancedPayment" value={salaryDetails.advancedPayment} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Tạm ứng lương Kỳ 1" en="Phase 1 Advance" km="ប្រាក់កម្ចីដំណាក់កាលទី១" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="phase1Advance" value={salaryDetails.phase1Advance} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('deduction','deductionNote') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Truy thu" en="Deduction" km="ការកាត់ប្រាក់" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="deduction" value={salaryDetails.deduction} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200 italic"><LabelTrilingual vi="D.giải truy thu" en="Deduction Note" km="កំណត់ចំណាំការកាត់" /></td>
                              <td className="p-1 border border-blue-200"><InputField name="deductionNote" value={salaryDetails.deductionNote} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('funeralAllowance','birthdayFund') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Tang chế" en="Funeral Allowance" km="ប្រាក់ឧបត្ថម្ភបុណ្យសព" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="funeralAllowance" value={salaryDetails.funeralAllowance} onChange={handleChange} /></td>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Quỹ sinh nhật" en="Birthday Fund" km="មូលនិធិថ្ងៃកំណើត" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="birthdayFund" value={salaryDetails.birthdayFund} onChange={handleChange} /></td>
                           </tr>}
                           {hasVal('unionAllowance') && <tr>
                              <td className="p-2 border border-blue-200"><LabelTrilingual vi="Phụ cấp ĐDCĐ" en="Union Allowance" km="ប្រាក់ឧបត្ថម្ភសហជីព" /></td>
                              <td className="p-1 border border-blue-200 text-rose-600"><InputField name="unionAllowance" value={salaryDetails.unionAllowance} onChange={handleChange} /></td>
                              <td colSpan={2} className="border border-blue-200 bg-slate-50"></td>
                           </tr>}

                           {/* ── Tổng cộng ── */}
                           <tr className="bg-[#a3d29c]">
                              <td className="p-3 border border-blue-300"><LabelTrilingual vi="Tổng lương thu nhập (1)" en="Total Income (1)" km="ប្រាក់ចំណូលសរុប (1)" /></td>
                              <td className="p-1 border border-blue-300"><InputField name="totalIncome" value={salaryDetails.totalIncome} onChange={handleChange} weight="bold" /></td>
                              <td className="p-3 border border-blue-300"><LabelTrilingual vi="Tổng giảm trừ (2)" en="Total Deduction (2)" km="ការកាត់កងសរុប (2)" /></td>
                              <td className="p-1 border border-blue-300 text-rose-600"><InputField name="totalDeduction" value={salaryDetails.totalDeduction} onChange={handleChange} weight="bold" /></td>
                           </tr>
                           <tr className="bg-[#fee197]">
                              <td colSpan={2} className="p-5 border border-blue-300 text-center uppercase tracking-wider">
                                 <div className="font-bold text-xl">Lương Thực Nhận (1) - (2)</div>
                                 <div className="text-sm text-slate-700 italic">NET SALARY / ប្រាក់កម្រៃសុទ្ធ</div>
                              </td>
                              <td colSpan={2} className="p-3 border border-blue-300 text-center"><InputField name="netSalary" value={salaryDetails.netSalary} onChange={handleChange} weight="bold" align="center" /></td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div className="flex justify-center mt-8 space-x-6">
                     <button onClick={handleSaveSalary} disabled={salarySaving} className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl shadow-xl shadow-amber-500/40 disabled:opacity-60 flex items-center justify-center">
                        {salarySaving ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Đang lưu...</>) : 'CẬP NHẬT TRÊN MÁY CHỦ SẴN SÀNG CHO CÔNG NHÂN XEM'}
                     </button>
                  </div>
                </div>
              )}
           </div>
        )}

        {/* TAB 4: QR PRINT - TRILINGUAL POSTER */}
        {activeTab === 'QR_PRINT' && (
           <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden text-center printable-bg print:rounded-none print:shadow-none print:border-none">
              <style dangerouslySetInnerHTML={{__html:`
                @media print {
                  @page { margin: 0; size: A4 portrait; }
                  html, body { margin: 0 !important; padding: 0 !important; }
                  * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
                  .qr-poster { height: 100vh; padding: 10mm 12mm !important; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
                  .qr-poster .qr-instructions { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; }
                }
              `}}></style>
              <div className="p-8 md:p-10 max-w-3xl mx-auto flex flex-col items-center qr-poster">

                 {/* Header: Logo + SPortal + Company */}
                 <div className="flex flex-col items-center mb-4">
                   <img src="/LOGO-THACO-AGRI-02-Copy-e1688459733402.png" alt="THACO AGRI" className="h-16 mb-2" />
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight">SPortal</h1>
                   <p className="text-xs text-slate-400 uppercase tracking-[0.3em] font-semibold mt-0.5">THACO AGRI SNUOL COMPLEX</p>
                 </div>

                 {/* Divider */}
                 <div className="w-16 h-0.5 bg-emerald-600 rounded-full mb-4"></div>

                 {/* Trilingual title */}
                 <div className="mb-3 space-y-0.5">
                   <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">TRA CỨU PHIẾU LƯƠNG</h2>
                   <div className="flex items-center justify-center gap-3 text-sm md:text-base">
                     <span className="font-bold text-slate-500 uppercase">SALARY SLIP LOOKUP</span>
                     <span className="text-slate-300">|</span>
                     <span className="font-bold text-slate-500">ការស្វែងរកប្រាក់បៀវត្សរ៍</span>
                   </div>
                 </div>

                 {/* Scan instruction */}
                 <p className="text-sm text-slate-500 mb-4 font-medium border-y border-slate-200 py-2 w-full">
                    Quét mã QR bằng Camera / Zalo / Messenger &middot;
                    <span className="italic"> Scan QR with your phone</span> &middot;
                    <span> ស្កេនកូដ QR ដោយទូរស័ព្ទ</span>
                 </p>

                 {/* QR Code */}
                 <div className="p-4 bg-white border-4 border-slate-800 rounded-xl mb-2 inline-block">
                    <QRCodeSVG value={typeof window !== 'undefined' ? window.location.origin + '/login' : (process.env.NEXT_PUBLIC_APP_URL || '') + '/login'} size={220} level="H" includeMargin={false} fgColor="#0f172a" />
                 </div>
                 <p className="text-xs text-slate-400 mb-4">pay.snuol.com.vn/login</p>

                 {/* Instructions - always 3 columns */}
                 <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 grid grid-cols-3 gap-4 text-left qr-instructions">
                    {/* VN */}
                    <div>
                       <h4 className="font-bold text-sm text-blue-700 border-b border-blue-200 pb-1 mb-2">Tiếng Việt</h4>
                       <ul className="text-slate-700 space-y-1.5 font-medium text-xs">
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">1</span> Quét mã QR</li>
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">2</span> Nhập Mã nhân viên</li>
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">3</span> Nhập ngày tháng năm sinh</li>
                       </ul>
                    </div>
                    {/* EN */}
                    <div>
                       <h4 className="font-bold text-sm text-rose-700 border-b border-rose-200 pb-1 mb-2">English</h4>
                       <ul className="text-slate-700 space-y-1.5 font-medium text-xs">
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">1</span> Scan QR code</li>
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">2</span> Enter Employee ID</li>
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">3</span> Enter last 6 of ID</li>
                       </ul>
                    </div>
                    {/* KH */}
                    <div>
                       <h4 className="font-bold text-sm text-emerald-700 border-b border-emerald-200 pb-1 mb-2">ភាសាខ្មែរ</h4>
                       <ul className="text-slate-700 space-y-1.5 font-medium text-xs">
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">1</span> ស្កេនកូដ QR</li>
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">2</span> បញ្ចូលលេខបុគ្គលិក</li>
                          <li className="flex items-start"><span className="shrink-0 w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mr-1.5 font-bold text-[10px] mt-px">3</span> បញ្ចូលលេខ ៦ ខ្ទង់</li>
                       </ul>
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                   <div className="w-6 h-px bg-slate-300"></div>
                   <span>THACO AGRI SNUOL COMPLEX</span>
                   <div className="w-6 h-px bg-slate-300"></div>
                 </div>

                 <button onClick={printQR} className="no-print mt-6 w-full md:w-auto px-14 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    In Poster A4 / A3
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
