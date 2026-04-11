'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── Types ─── */
type ApiResult = {
  message?: string;
  successCount?: number;
  errorCount?: number;
  errors?: string[];
  error?: string;
} | null;

type ValidationResult = {
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  totalBaseSalary: number;
  totalNetSalary: number;
  monthYear: string;
  issues: { row: number; type: 'error' | 'warning'; message: string }[];
  error?: string;
} | null;

type WorkerSummary = {
  id: string;
  employeeCode: string;
  fullName: string;
  failedAttempts: number;
  lockUntil: string | null;
};

/* ─── Sub-components ─── */

function StepBadge({ step, active }: { step: number; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
        active
          ? 'bg-emerald-700 text-white'
          : 'bg-slate-100 text-slate-500 border border-slate-200'
      }`}
    >
      {step}
    </span>
  );
}

function ColumnTable({ columns }: { columns: { name: string; required: boolean; note: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-500">
            <th className="px-3 py-2 font-medium border border-slate-200">Tên cột Excel</th>
            <th className="px-3 py-2 font-medium border border-slate-200 w-16 text-center">Bắt buộc</th>
            <th className="px-3 py-2 font-medium border border-slate-200">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((c) => (
            <tr key={c.name} className="hover:bg-slate-50/50">
              <td className="px-3 py-1.5 border border-slate-200 font-mono font-semibold text-slate-800">
                {c.name}
              </td>
              <td className="px-3 py-1.5 border border-slate-200 text-center">
                {c.required ? (
                  <span className="text-rose-600 font-bold">*</span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>
              <td className="px-3 py-1.5 border border-slate-200 text-slate-600">{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileDropZone({
  name,
  file,
  onFileChange,
}: {
  name: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      onFileChange(f);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed px-6 py-5 text-center transition-colors ${
        dragOver
          ? 'border-emerald-500 bg-emerald-50'
          : file
            ? 'border-emerald-300 bg-emerald-50/50'
            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <span className="font-semibold text-emerald-800">{file.name}</span>
            <span className="text-slate-500 ml-2">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="ml-2 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <svg className="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-emerald-700">Nhấn chọn file</span> hoặc kéo thả file Excel vào đây
          </p>
          <p className="text-xs text-slate-400">.xlsx, .xls</p>
        </div>
      )}
    </div>
  );
}

function ResultBlock({ result, onClose }: { result: ApiResult; onClose?: () => void }) {
  if (!result) return null;
  const isError = !!result.error;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        isError ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {isError ? (
            <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div>
            {isError ? (
              <p>{result.error}</p>
            ) : (
              <>
                <p>
                  {result.message} — Thành công: <strong>{result.successCount ?? 0}</strong>, lỗi:{' '}
                  <strong>{result.errorCount ?? 0}</strong>
                </p>
                {result.errors && result.errors.length > 0 && (
                  <ul className="mt-2 max-h-32 overflow-auto text-xs list-disc pl-4 space-y-0.5 opacity-80">
                    {result.errors.slice(0, 30).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.errors.length > 30 && <li>… và {result.errors.length - 30} dòng nữa.</li>}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Constants ─── */

const EMP_COLUMNS = [
  { name: 'Mã Nhân Viên', required: true, note: 'Mã duy nhất, VD: 25023492' },
  { name: 'Họ Tên', required: true, note: 'Họ tên đầy đủ' },
  { name: '6 Số CCCD', required: true, note: '6 chữ số cuối CCCD/CMND — dùng để đăng nhập' },
  { name: 'Công Ty', required: false, note: 'Tên công ty — hiển thị trên phiếu lương' },
  { name: 'Phòng Ban', required: false, note: 'Phòng ban / Bộ phận — dùng để lọc nhân viên' },
];

const SAL_COLUMNS = [
  { name: 'Mã Nhân Viên', required: true, note: 'Phải khớp với danh sách đã nạp' },
  { name: 'Lương Cơ Bản', required: true, note: 'Lương đóng BHXH' },
  { name: 'Thực Lãnh', required: true, note: 'Số tiền thực nhận' },
  { name: 'Chức vụ, Phòng ban, Email…', required: false, note: 'Tự động hiển thị trên phiếu lương' },
  { name: 'Các khoản thu nhập / khấu trừ', required: false, note: 'Ngày công, tăng ca, truy lĩnh, truy thu…' },
];

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/* ─── Main Component ─── */

export function AdminUpload() {
  // Summary
  const [totalWorkers, setTotalWorkers] = useState<number | null>(null);

  // Step 1: Employees
  const [empFile, setEmpFile] = useState<File | null>(null);
  const [empPending, setEmpPending] = useState(false);
  const [empResult, setEmpResult] = useState<ApiResult>(null);

  // Step 2: Salary
  const [salFile, setSalFile] = useState<File | null>(null);
  const [salMonth, setSalMonth] = useState(getCurrentMonth);
  const [salPeriod, setSalPeriod] = useState<1 | 2>(1);
  const [salValidating, setSalValidating] = useState(false);
  const [salCommitting, setSalCommitting] = useState(false);
  const [salValidation, setSalValidation] = useState<ValidationResult>(null);
  const [salResult, setSalResult] = useState<ApiResult>(null);
  const [salFormRef, setSalFormRef] = useState<FormData | null>(null);

  // Guide toggle
  const [showEmpGuide, setShowEmpGuide] = useState(false);
  const [showSalGuide, setShowSalGuide] = useState(false);

  // Fetch worker count on mount
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/employees?mode=summary');
      if (res.ok) {
        const data = await res.json();
        setTotalWorkers(data.totalWorkers ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* ── Handlers ── */

  async function onEmployees(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!empFile) return;
    setEmpResult(null);
    const form = new FormData();
    form.set('file', empFile);
    setEmpPending(true);
    try {
      const res = await fetch('/api/admin/employees/upload', { method: 'POST', body: form });
      const data = (await res.json()) as ApiResult;
      setEmpResult(!res.ok ? { error: data?.error ?? `HTTP ${res.status}` } : data ?? {});
      if (res.ok) {
        setEmpFile(null);
        fetchSummary();
      }
    } finally {
      setEmpPending(false);
    }
  }

  async function onSalariesValidate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!salFile) return;
    setSalValidation(null);
    setSalResult(null);
    const form = new FormData();
    form.set('file', salFile);
    form.set('monthYear', salMonth);
    form.set('period', String(salPeriod));
    setSalFormRef(form);
    setSalValidating(true);
    try {
      const res = await fetch('/api/admin/salaries/validate', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setSalValidation({ ...data, error: data.error ?? `HTTP ${res.status}` } as ValidationResult);
      } else {
        setSalValidation(data as ValidationResult);
      }
    } finally {
      setSalValidating(false);
    }
  }

  async function onSalariesCommit() {
    if (!salFormRef) return;
    setSalResult(null);
    setSalCommitting(true);
    try {
      const res = await fetch('/api/admin/salaries/upload', { method: 'POST', body: salFormRef });
      const data = (await res.json()) as ApiResult;
      if (!res.ok) {
        setSalResult({ error: data?.error ?? `HTTP ${res.status}` });
      } else {
        setSalResult(data ?? {});
        setSalValidation(null);
        setSalFormRef(null);
        setSalFile(null);
      }
    } finally {
      setSalCommitting(false);
    }
  }

  function onCancelValidation() {
    setSalValidation(null);
    setSalFormRef(null);
  }

  /* ── Render ── */

  return (
    <div className="space-y-6">
      {/* ─ Summary bar ─ */}
      {totalWorkers !== null && (
        <div className="flex items-center gap-4 rounded-xl bg-slate-800 px-5 py-3 text-white text-sm">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            Hệ thống hiện có <strong className="text-emerald-400">{totalWorkers}</strong> nhân viên
          </span>
        </div>
      )}

      {/* ════════════════════════ STEP 1: EMPLOYEES ════════════════════════ */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StepBadge step={1} active />
            <div>
              <h2 className="text-base font-bold text-slate-800">Nạp danh sách nhân viên</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật hoặc thêm mới nhân viên từ file Excel. Nếu mã NV đã tồn tại sẽ tự động cập nhật.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEmpGuide((v) => !v)}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
          >
            {showEmpGuide ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn'}
          </button>
        </div>

        {showEmpGuide && (
          <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 space-y-3">
            <p className="text-sm font-semibold text-blue-900">Yêu cầu file Excel (sheet đầu tiên):</p>
            <ColumnTable columns={EMP_COLUMNS} />
            <div className="text-xs text-blue-700 space-y-1">
              <p>- Nếu mã NV trùng: hệ thống <strong>cập nhật</strong> thông tin (tên, CCCD) thay vì tạo mới.</p>
              <p>- Mật khẩu đăng nhập nhân viên chính là 6 số cuối CCCD — được mã hóa an toàn.</p>
            </div>
          </div>
        )}

        <form onSubmit={onEmployees} className="px-6 py-5 space-y-4">
          <FileDropZone name="file" file={empFile} onFileChange={setEmpFile} />
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={empPending || !empFile}
              className="rounded-xl bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {empPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Đang xử lý…
                </span>
              ) : (
                'Tải lên & Cập nhật'
              )}
            </button>
            <a
              href="/api/admin/templates/employees"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium px-5 py-2.5 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải file mẫu
            </a>
            {!empFile && <span className="text-xs text-slate-400">Chọn file Excel trước</span>}
          </div>
          <ResultBlock result={empResult} onClose={() => setEmpResult(null)} />
        </form>
      </section>

      {/* ════════════════════════ STEP 2: SALARY ════════════════════════ */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StepBadge step={2} active />
            <div>
              <h2 className="text-base font-bold text-slate-800">Nạp bảng lương theo tháng</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hệ thống kiểm tra dữ liệu trước, xác nhận rồi mới cập nhật — an toàn, không sợ sai.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSalGuide((v) => !v)}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
          >
            {showSalGuide ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn'}
          </button>
        </div>

        {showSalGuide && (
          <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 space-y-3">
            <p className="text-sm font-semibold text-blue-900">Yêu cầu file Excel (sheet đầu tiên):</p>
            <ColumnTable columns={SAL_COLUMNS} />
            <div className="text-xs text-blue-700 space-y-1">
              <p>- Mã NV phải đã có trong hệ thống (nạp nhân viên ở bước 1 trước).</p>
              <p>- Nếu tháng + mã NV đã tồn tại: dữ liệu cũ bị <strong>ghi đè</strong>.</p>
              <p>
                - Tất cả cột ngoài 3 cột bắt buộc đều tự động hiển thị trên phiếu lương (VD: Ngày công, Tăng ca,
                Truy lĩnh…).
              </p>
              <p>- Hệ thống tự cảnh báo nếu lương tăng/giảm bất thường so với tháng trước.</p>
            </div>
          </div>
        )}

        <form onSubmit={onSalariesValidate} className="px-6 py-5 space-y-4">
          {/* Month + Period picker */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="monthYear" className="block text-sm font-medium text-slate-700 mb-1.5">
                Kỳ lương
              </label>
              <input
                id="monthYear"
                name="monthYear"
                type="month"
                value={salMonth}
                onChange={(e) => setSalMonth(e.target.value)}
                required
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-slate-700 mb-1.5">
                Đợt
              </label>
              <select
                id="period"
                name="period"
                value={salPeriod}
                onChange={(e) => setSalPeriod(Number(e.target.value) as 1 | 2)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
              >
                <option value={1}>Đợt 1 — Tạm ứng (13 ngày đầu tháng)</option>
                <option value={2}>Đợt 2 — Quyết toán (các ngày còn lại)</option>
              </select>
            </div>
          </div>

          <FileDropZone name="file" file={salFile} onFileChange={(f) => { setSalFile(f); setSalValidation(null); setSalFormRef(null); }} />

          {/* Action buttons */}
          {!salValidation && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="submit"
                disabled={salValidating || !salFile}
                className="rounded-xl bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {salValidating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Đang kiểm tra…
                  </span>
                ) : (
                  'Kiểm tra dữ liệu'
                )}
              </button>
              <a
                href="/api/admin/templates/salaries"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium px-5 py-2.5 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Tải file mẫu
              </a>
              {!salFile && <span className="text-xs text-slate-400">Chọn file Excel trước</span>}
            </div>
          )}
        </form>

        {/* Validation Result */}
        {salValidation && !salValidation.error && (
          <div className="mx-6 mb-5 rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
            <div className="px-5 py-4 border-b border-blue-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-semibold text-blue-900">
                Kết quả kiểm tra — Tháng {salValidation.monthYear} — {(salValidation as any).period === 1 ? 'Đợt 1 (Tạm ứng)' : 'Đợt 2 (Quyết toán)'}
              </p>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-slate-100 p-3 text-center">
                  <p className="text-xs text-slate-500">Tổng dòng</p>
                  <p className="text-xl font-bold text-slate-800">{salValidation.totalRows}</p>
                </div>
                <div className="bg-white rounded-lg border border-emerald-100 p-3 text-center">
                  <p className="text-xs text-emerald-600">Hợp lệ</p>
                  <p className="text-xl font-bold text-emerald-700">{salValidation.validCount}</p>
                </div>
                <div className={`bg-white rounded-lg border p-3 text-center ${salValidation.errorCount > 0 ? 'border-rose-200' : 'border-slate-100'}`}>
                  <p className="text-xs text-slate-500">Lỗi</p>
                  <p className={`text-xl font-bold ${salValidation.errorCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {salValidation.errorCount}
                  </p>
                </div>
                <div className={`bg-white rounded-lg border p-3 text-center ${salValidation.warningCount > 0 ? 'border-amber-200' : 'border-slate-100'}`}>
                  <p className="text-xs text-slate-500">Cảnh báo</p>
                  <p className={`text-xl font-bold ${salValidation.warningCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {salValidation.warningCount}
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-wrap gap-6 text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3">
                <div>
                  Tổng quỹ lương cơ bản:{' '}
                  <strong className="text-slate-900">
                    {salValidation.totalBaseSalary.toLocaleString('vi-VN')}
                  </strong>
                </div>
                <div>
                  Tổng thực lãnh:{' '}
                  <strong className="text-emerald-800">
                    {salValidation.totalNetSalary.toLocaleString('vi-VN')}
                  </strong>
                </div>
              </div>

              {/* Issues list */}
              {salValidation.issues.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <p className="text-xs font-semibold text-slate-600">Chi tiết vấn đề ({salValidation.issues.length})</p>
                  </div>
                  <ul className="max-h-48 overflow-auto text-xs divide-y divide-slate-50">
                    {salValidation.issues.slice(0, 100).map((issue, i) => (
                      <li
                        key={i}
                        className={`px-4 py-2 flex items-start gap-2 ${
                          issue.type === 'error' ? 'bg-rose-50/50' : 'bg-amber-50/50'
                        }`}
                      >
                        <span
                          className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            issue.type === 'error'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {issue.type === 'error' ? '!' : '?'}
                        </span>
                        <span className={issue.type === 'error' ? 'text-rose-800' : 'text-amber-800'}>
                          <strong>Dòng {issue.row}:</strong> {issue.message}
                        </span>
                      </li>
                    ))}
                    {salValidation.issues.length > 100 && (
                      <li className="px-4 py-2 text-blue-600 bg-blue-50/30">
                        … và {salValidation.issues.length - 100} vấn đề khác.
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onSalariesCommit}
                  disabled={salCommitting || salValidation.errorCount > 0}
                  className={`rounded-xl text-white text-sm font-semibold px-6 py-2.5 transition-colors ${
                    salValidation.errorCount > 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {salCommitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Đang cập nhật…
                    </span>
                  ) : salValidation.errorCount > 0 ? (
                    'Sửa lỗi rồi thử lại'
                  ) : (
                    `Xác nhận & Cập nhật (${salValidation.validCount} phiếu lương)`
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCancelValidation}
                  className="rounded-xl border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  Chọn lại file
                </button>
              </div>
            </div>
          </div>
        )}

        {salValidation?.error && (
          <div className="mx-6 mb-5">
            <ResultBlock result={{ error: salValidation.error }} onClose={() => setSalValidation(null)} />
          </div>
        )}

        {salResult && (
          <div className="mx-6 mb-5">
            <ResultBlock result={salResult} onClose={() => setSalResult(null)} />
          </div>
        )}
      </section>
    </div>
  );
}
