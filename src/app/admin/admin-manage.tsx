'use client';

import { useCallback, useEffect, useState } from 'react';

type SalaryRecord = {
  id: string;
  monthYear: string;
  period: number;
  baseSalary: string;
  netSalary: string;
  details: string | Record<string, unknown> | null;
};

type WorkerInfo = {
  id: string;
  employeeCode: string;
  fullName: string;
  company: string;
  failedAttempts: number;
  isLocked: boolean;
  lockUntil: string | null;
  salaries: SalaryRecord[];
};

type WorkerRow = {
  id: string;
  employeeCode: string;
  fullName: string;
  company: string;
  department: string;
  failedAttempts: number;
  lockUntil: string | null;
};

type DeptInfo = { name: string; count: number };

function parseDetails(details: string | Record<string, unknown> | null): Record<string, unknown> {
  if (!details) return {};
  if (typeof details === 'string') {
    try { return JSON.parse(details); } catch { return {}; }
  }
  return details;
}

export function AdminManage() {
  // Summary
  const [totalWorkers, setTotalWorkers] = useState<number | null>(null);
  const [departments, setDepartments] = useState<DeptInfo[]>([]);

  // Browse by department
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptWorkers, setDeptWorkers] = useState<WorkerRow[]>([]);
  const [deptTotal, setDeptTotal] = useState(0);
  const [deptPage, setDeptPage] = useState(1);
  const [deptTotalPages, setDeptTotalPages] = useState(1);
  const [deptLoading, setDeptLoading] = useState(false);

  // Search by code
  const [searchCode, setSearchCode] = useState('');
  const [worker, setWorker] = useState<WorkerInfo | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  // View salary detail
  const [viewSalary, setViewSalary] = useState<SalaryRecord | null>(null);

  // Edit salary state
  const [editMonth, setEditMonth] = useState('');
  const [editPeriod, setEditPeriod] = useState<number>(1);
  const [editBase, setEditBase] = useState('');
  const [editNet, setEditNet] = useState('');
  const [editMsg, setEditMsg] = useState('');
  const [editPending, setEditPending] = useState(false);

  // Delete salary state
  const [deletePending, setDeletePending] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SalaryRecord | null>(null);

  // Delete worker state
  const [confirmDeleteWorker, setConfirmDeleteWorker] = useState(false);
  const [deleteWorkerPending, setDeleteWorkerPending] = useState(false);

  // Unlock state
  const [unlockMsg, setUnlockMsg] = useState('');
  const [unlockPending, setUnlockPending] = useState(false);

  // Reset password state
  const [resetPwMsg, setResetPwMsg] = useState('');
  const [resetPwPending, setResetPwPending] = useState(false);

  const jsonHeaders: HeadersInit = { 'Content-Type': 'application/json' };

  // Fetch summary on mount
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/employees?mode=summary');
      if (res.ok) {
        const data = await res.json();
        setTotalWorkers(data.totalWorkers ?? 0);
        setDepartments(data.departments ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // Fetch workers by department
  async function fetchDeptWorkers(dept: string, page: number) {
    setDeptLoading(true);
    try {
      const res = await fetch(`/api/admin/employees?mode=search&department=${encodeURIComponent(dept)}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setDeptWorkers(data.workers ?? []);
        setDeptTotal(data.total ?? 0);
        setDeptPage(data.page ?? 1);
        setDeptTotalPages(data.totalPages ?? 1);
      }
    } finally {
      setDeptLoading(false);
    }
  }

  function onSelectDept(dept: string) {
    if (selectedDept === dept) {
      setSelectedDept(null);
      setDeptWorkers([]);
      return;
    }
    setSelectedDept(dept);
    setWorker(null);
    setViewSalary(null);
    fetchDeptWorkers(dept, 1);
  }

  function onDeptPageChange(page: number) {
    if (!selectedDept) return;
    fetchDeptWorkers(selectedDept, page);
  }

  // Select a worker from department list
  function onSelectWorker(code: string) {
    setSearchCode(code);
    doSearch(code);
  }

  // Search worker by code
  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchCode.trim()) return;
    doSearch(searchCode.trim());
  }

  async function doSearch(code: string) {
    setSearchError('');
    setWorker(null);
    setViewSalary(null);
    setEditMsg('');
    setUnlockMsg('');
    setResetPwMsg('');
    setSearching(true);
    try {
      const res = await fetch('/api/admin/workers/search', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ employeeCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setWorker(data.worker);
      if (data.worker.salaries.length > 0) {
        const latest = data.worker.salaries[0];
        setEditMonth(latest.monthYear);
        setEditPeriod(latest.period);
        setEditBase(latest.baseSalary);
        setEditNet(latest.netSalary);
      } else {
        setEditMonth('');
        setEditPeriod(1);
        setEditBase('');
        setEditNet('');
      }
    } finally {
      setSearching(false);
    }
  }

  async function onEditSalary(e: React.FormEvent) {
    e.preventDefault();
    if (!worker) return;
    setEditMsg('');
    setEditPending(true);
    try {
      const res = await fetch('/api/admin/salaries/edit', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          employeeCode: worker.employeeCode,
          monthYear: editMonth,
          period: editPeriod,
          baseSalary: editBase,
          netSalary: editNet,
        }),
      });
      const data = await res.json();
      setEditMsg(data.message ?? data.error ?? 'Đã xử lý.');
      if (res.ok) {
        const r2 = await fetch('/api/admin/workers/search', {
          method: 'POST',
          headers: jsonHeaders,
          body: JSON.stringify({ employeeCode: worker.employeeCode }),
        });
        const d2 = await r2.json();
        if (r2.ok) setWorker(d2.worker);
      }
    } finally {
      setEditPending(false);
    }
  }

  async function onUnlock() {
    if (!worker) return;
    setUnlockMsg('');
    setUnlockPending(true);
    try {
      const res = await fetch('/api/admin/workers/unlock', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ employeeCode: worker.employeeCode }),
      });
      const data = await res.json();
      setUnlockMsg(data.message ?? data.error ?? 'Đã xử lý.');
      if (res.ok) {
        setWorker({ ...worker, isLocked: false, failedAttempts: 0, lockUntil: null });
      }
    } finally {
      setUnlockPending(false);
    }
  }

  async function onResetPassword() {
    if (!worker) return;
    setResetPwMsg('');
    setResetPwPending(true);
    try {
      const res = await fetch('/api/admin/workers/reset-password', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ workerId: worker.id }),
      });
      const data = await res.json();
      setResetPwMsg(data.message ?? data.error ?? 'Đã xử lý.');
    } finally {
      setResetPwPending(false);
    }
  }

  async function onDeleteSalary(sal: SalaryRecord) {
    if (!worker) return;
    setConfirmDelete(null);
    setDeletePending(sal.id);
    try {
      const res = await fetch('/api/admin/salaries/delete', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          employeeCode: worker.employeeCode,
          monthYear: sal.monthYear,
          period: sal.period,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh worker data
        const r2 = await fetch('/api/admin/workers/search', {
          method: 'POST',
          headers: jsonHeaders,
          body: JSON.stringify({ employeeCode: worker.employeeCode }),
        });
        const d2 = await r2.json();
        if (r2.ok) setWorker(d2.worker);
        if (viewSalary?.id === sal.id) setViewSalary(null);
        setEditMsg(data.message ?? 'Đã xóa.');
      } else {
        setEditMsg(data.error ?? 'Lỗi khi xóa.');
      }
    } finally {
      setDeletePending(null);
    }
  }

  async function onDeleteWorker() {
    if (!worker) return;
    setConfirmDeleteWorker(false);
    setDeleteWorkerPending(true);
    try {
      const res = await fetch('/api/admin/workers/delete', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ employeeCode: worker.employeeCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setWorker(null);
        setViewSalary(null);
        setEditMsg('');
        setSearchCode('');
        fetchSummary();
        if (selectedDept) fetchDeptWorkers(selectedDept, deptPage);
      } else {
        setEditMsg(data.error ?? 'Lỗi khi xóa nhân viên.');
      }
    } finally {
      setDeleteWorkerPending(false);
    }
  }

  function loadSalary(sal: SalaryRecord) {
    setEditMonth(sal.monthYear);
    setEditPeriod(sal.period);
    setEditBase(sal.baseSalary);
    setEditNet(sal.netSalary);
    setEditMsg('');
  }

  return (
    <div className="space-y-6">
      {/* ═══ Confirm Delete Modal ═══ */}
      {confirmDelete && worker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-rose-900">Xóa phiếu lương</h3>
                <p className="text-sm text-rose-700">Thao tác này không thể hoàn tác</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-slate-700">
                Bạn có chắc muốn xóa phiếu lương sau?
              </p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nhân viên:</span>
                  <span className="font-semibold text-slate-900">{worker.employeeCode} — {worker.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tháng:</span>
                  <span className="font-semibold text-slate-900">{confirmDelete.monthYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đợt:</span>
                  <span className="font-semibold text-slate-900">
                    {confirmDelete.period === 1 ? 'Đợt 1 (Tạm ứng)' : 'Đợt 2 (Quyết toán)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thực lãnh:</span>
                  <span className="font-bold text-rose-700">{Number(confirmDelete.netSalary).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2.5 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => onDeleteSalary(confirmDelete)}
                className="rounded-xl bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-rose-700 transition-colors"
              >
                Xóa phiếu lương
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Confirm Delete Worker Modal ═══ */}
      {confirmDeleteWorker && worker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteWorker(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-rose-900">Xóa nhân viên</h3>
                <p className="text-sm text-rose-700">Toàn bộ dữ liệu lương sẽ bị xóa theo</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-slate-700">
                Bạn có chắc muốn xóa nhân viên này? Thao tác không thể hoàn tác.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã nhân viên:</span>
                  <span className="font-semibold text-slate-900">{worker.employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Họ tên:</span>
                  <span className="font-semibold text-slate-900">{worker.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Công ty:</span>
                  <span className="font-semibold text-slate-900">{worker.company || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số phiếu lương:</span>
                  <span className="font-bold text-rose-700">{worker.salaries.length} phiếu sẽ bị xóa</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteWorker(false)}
                className="rounded-xl border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2.5 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={onDeleteWorker}
                className="rounded-xl bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-rose-700 transition-colors"
              >
                Xóa nhân viên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Summary ═══ */}
      {totalWorkers !== null && (
        <div className="flex items-center gap-4 rounded-xl bg-slate-800 px-5 py-3 text-white text-sm">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            Tổng cộng <strong className="text-emerald-400">{totalWorkers.toLocaleString('vi-VN')}</strong> nhân viên
            {departments.length > 0 && <> · <strong className="text-emerald-400">{departments.length}</strong> phòng ban</>}
          </span>
        </div>
      )}

      {/* ═══ Search by code ═══ */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Tìm theo mã nhân viên</h2>
        <form onSubmit={onSearch} className="flex gap-3">
          <input
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Nhập mã nhân viên..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 hover:bg-slate-900 disabled:opacity-60"
          >
            {searching ? 'Đang tìm…' : 'Tìm kiếm'}
          </button>
        </form>
        {searchError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {searchError}
          </div>
        )}
      </section>

      {/* ═══ Browse by department ═══ */}
      {departments.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Lọc theo phòng ban</h2>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept.name}
                onClick={() => onSelectDept(dept.name)}
                className={`rounded-xl px-4 py-2 text-sm font-medium border transition-colors ${
                  selectedDept === dept.name
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {dept.name}
                <span className={`ml-1.5 text-xs ${selectedDept === dept.name ? 'text-emerald-200' : 'text-slate-400'}`}>
                  ({dept.count})
                </span>
              </button>
            ))}
          </div>

          {/* Danh sách NV trong phòng ban */}
          {selectedDept && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-600">
                  Phòng ban: <strong className="text-slate-900">{selectedDept}</strong> — {deptTotal} nhân viên
                </p>
                {deptTotalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDeptPageChange(deptPage - 1)}
                      disabled={deptPage <= 1 || deptLoading}
                      className="px-2 py-1 rounded border border-slate-200 text-xs disabled:opacity-40 hover:bg-slate-50"
                    >
                      ‹
                    </button>
                    <span className="text-xs text-slate-500 px-2">
                      {deptPage}/{deptTotalPages}
                    </span>
                    <button
                      onClick={() => onDeptPageChange(deptPage + 1)}
                      disabled={deptPage >= deptTotalPages || deptLoading}
                      className="px-2 py-1 rounded border border-slate-200 text-xs disabled:opacity-40 hover:bg-slate-50"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {deptLoading ? (
                <div className="text-center py-8 text-sm text-slate-500">Đang tải...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="pb-2 font-medium">Mã NV</th>
                        <th className="pb-2 font-medium">Họ tên</th>
                        <th className="pb-2 font-medium">Công ty</th>
                        <th className="pb-2 font-medium">Trạng thái</th>
                        <th className="pb-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deptWorkers.map((w) => {
                        const isLocked = w.lockUntil && new Date(w.lockUntil) > new Date();
                        return (
                          <tr key={w.id} className="hover:bg-slate-50">
                            <td className="py-2 font-mono font-semibold text-slate-800">{w.employeeCode}</td>
                            <td className="py-2 text-slate-700">{w.fullName}</td>
                            <td className="py-2 text-slate-600 text-xs">{w.company || '—'}</td>
                            <td className="py-2">
                              {isLocked ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">Đang khóa</span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">OK</span>
                              )}
                            </td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => onSelectWorker(w.employeeCode)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                              >
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ═══ Worker detail ═══ */}
      {worker && (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Thông tin nhân viên</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Mã nhân viên</p>
                <p className="font-bold text-lg text-slate-900">{worker.employeeCode}</p>
              </div>
              <div>
                <p className="text-slate-500">Họ tên</p>
                <p className="font-semibold text-slate-900">{worker.fullName}</p>
              </div>
              <div>
                <p className="text-slate-500">Công ty</p>
                <p className="font-semibold text-slate-900">{worker.company || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Trạng thái</p>
                <p className={`font-semibold ${worker.isLocked ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {worker.isLocked ? 'Đang khóa' : 'Bình thường'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setConfirmDeleteWorker(true)}
                disabled={deleteWorkerPending}
                className="rounded-xl border border-rose-200 text-rose-600 text-sm font-medium px-4 py-2 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                {deleteWorkerPending ? 'Đang xóa…' : 'Xóa nhân viên'}
              </button>
              <button
                onClick={onResetPassword}
                disabled={resetPwPending}
                className="rounded-xl border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                {resetPwPending ? 'Đang reset…' : 'Reset mật khẩu'}
              </button>
              {resetPwMsg && <span className="text-sm text-emerald-700">{resetPwMsg}</span>}
            </div>

            {worker.isLocked && (
              <div className="flex items-center gap-3 mt-2 p-3 bg-rose-50 rounded-xl border border-rose-200">
                <div className="text-sm text-rose-800">
                  Khóa đến: <strong>{new Date(worker.lockUntil!).toLocaleString('vi-VN')}</strong>
                  {' · '}Nhập sai: <strong>{worker.failedAttempts}</strong> lần
                </div>
                <button
                  onClick={onUnlock}
                  disabled={unlockPending}
                  className="ml-auto rounded-xl bg-amber-600 text-white text-sm font-semibold px-4 py-2 hover:bg-amber-700 disabled:opacity-60"
                >
                  {unlockPending ? 'Đang mở…' : 'Mở khóa'}
                </button>
                {unlockMsg && <span className="text-sm text-emerald-700">{unlockMsg}</span>}
              </div>
            )}
          </section>

          {/* Salary history */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              Lịch sử lương
              {worker.salaries.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">({worker.salaries.length} phiếu)</span>
              )}
            </h3>

            {worker.salaries.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Chưa có dữ liệu lương.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">Tháng</th>
                      <th className="pb-2 font-medium">Đợt</th>
                      <th className="pb-2 font-medium">Lương cơ bản</th>
                      <th className="pb-2 font-medium">Thực lãnh</th>
                      <th className="pb-2 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {worker.salaries.map((sal) => (
                      <tr key={sal.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium text-slate-800">{sal.monthYear}</td>
                        <td className="py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            sal.period === 1 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {sal.period === 1 ? 'Đợt 1 · Tạm ứng' : 'Đợt 2 · Quyết toán'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-700">{Number(sal.baseSalary).toLocaleString('vi-VN')}</td>
                        <td className="py-2.5 font-semibold text-slate-900">{Number(sal.netSalary).toLocaleString('vi-VN')}</td>
                        <td className="py-2.5 text-right space-x-3">
                          <button
                            onClick={() => setViewSalary(viewSalary?.id === sal.id ? null : sal)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                          >
                            {viewSalary?.id === sal.id ? 'Ẩn' : 'Xem chi tiết'}
                          </button>
                          <button
                            onClick={() => loadSalary(sal)}
                            className="text-emerald-700 hover:text-emerald-900 text-xs font-medium underline underline-offset-2"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => setConfirmDelete(sal)}
                            disabled={deletePending === sal.id}
                            className="text-rose-500 hover:text-rose-700 text-xs font-medium underline underline-offset-2 disabled:opacity-50"
                          >
                            {deletePending === sal.id ? 'Đang xóa…' : 'Xóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewSalary && (
              <div className="mt-4 border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-5 py-3 border-b border-blue-200 flex items-center justify-between">
                  <p className="font-semibold text-blue-900">
                    Phiếu lương {viewSalary.monthYear} — {viewSalary.period === 1 ? 'Đợt 1 (Tạm ứng)' : 'Đợt 2 (Quyết toán)'}
                  </p>
                  <button onClick={() => setViewSalary(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                      <p className="text-xs text-emerald-600">Lương cơ bản</p>
                      <p className="text-lg font-bold text-emerald-800">{Number(viewSalary.baseSalary).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <p className="text-xs text-amber-600">Thực lãnh</p>
                      <p className="text-lg font-bold text-amber-800">{Number(viewSalary.netSalary).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  {(() => {
                    const d = parseDetails(viewSalary.details);
                    const entries = Object.entries(d).filter(
                      ([, val]) => val != null && val !== '' && String(val) !== '0'
                    );
                    if (entries.length === 0) return <p className="text-sm text-slate-500 italic">Không có dữ liệu chi tiết.</p>;

                    // Nhóm theo loại
                    const META_KEYS = new Set([
                      'Tên Công Ty', 'Chức vụ', 'Chức Vụ', 'Phòng ban', 'Bộ phận',
                      'Địa chỉ mail', 'Email', 'Đơn vị tính', 'Tỷ giá USD/VNĐ', 'Tỷ giá',
                      'Phụ trách/quản lý trực tiếp', 'Lương thu nhập', 'Lương Thu Nhập',
                      'Lương Cơ bản', 'Lương Cơ Bản',
                    ]);
                    const DED_KEYWORDS = [
                      'khấu trừ', 'giảm trừ', 'truy thu', 'đã ứng', 'tang chế', 'tạm ứng',
                      'quỹ sinh nhật', 'bảo hiểm', 'thuế', 'tiền ăn', 'tiền điện', 'điện nước',
                    ];
                    const TOTAL_KEYS = new Set([
                      'Tổng lương thu nhập', 'Tổng thu nhập', 'Tổng giảm trừ', 'Tổng khấu trừ',
                    ]);
                    const isDed = (key: string) => {
                      const low = key.toLowerCase();
                      return DED_KEYWORDS.some((s) => low.includes(s));
                    };

                    const meta: [string, unknown][] = [];
                    const income: [string, unknown][] = [];
                    const deduction: [string, unknown][] = [];
                    const totals: [string, unknown][] = [];

                    for (const [key, val] of entries) {
                      if (META_KEYS.has(key)) meta.push([key, val]);
                      else if (TOTAL_KEYS.has(key)) totals.push([key, val]);
                      else if (isDed(key)) deduction.push([key, val]);
                      else income.push([key, val]);
                    }

                    const renderSection = (title: string, rows: [string, unknown][], color: string) => {
                      if (rows.length === 0) return null;
                      return (
                        <div className="mb-3" key={title}>
                          <p className={`text-xs font-bold ${color} mb-1`}>{title}</p>
                          <table className="w-full text-sm border-collapse">
                            <tbody>
                              {rows.map(([key, val]) => (
                                <tr key={key} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-1.5 border border-slate-200 text-slate-700 w-1/2">{key}</td>
                                  <td className="px-3 py-1.5 border border-slate-200 font-medium text-slate-900">
                                    {typeof val === 'number' ? val.toLocaleString('vi-VN') : String(val)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    };

                    return (
                      <div>
                        {renderSection('Thông tin', meta, 'text-blue-700')}
                        {renderSection('Các khoản thu nhập', income, 'text-emerald-700')}
                        {renderSection('Các khoản khấu trừ', deduction, 'text-rose-700')}
                        {renderSection('Tổng cộng', totals, 'text-amber-700')}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </section>

          {/* Edit salary */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Chỉnh sửa lương</h3>
            <form onSubmit={onEditSalary} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tháng</label>
                  <input
                    type="month"
                    value={editMonth}
                    onChange={(e) => setEditMonth(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Đợt</label>
                  <select
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
                  >
                    <option value={1}>Đợt 1 (Tạm ứng)</option>
                    <option value={2}>Đợt 2 (Quyết toán)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Lương cơ bản</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editBase}
                    onChange={(e) => setEditBase(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Thực lãnh</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editNet}
                    onChange={(e) => setEditNet(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={editPending}
                className="rounded-xl bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 hover:bg-emerald-900 disabled:opacity-60"
              >
                {editPending ? 'Đang lưu…' : 'Lưu chỉnh sửa'}
              </button>
            </form>
            {editMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {editMsg}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
