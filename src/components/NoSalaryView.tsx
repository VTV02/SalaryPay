import { LogoutButton } from '@/components/LogoutButton';

type Props = {
  employeeName: string;
  employeeCode: string;
};

export function NoSalaryView({ employeeName, employeeCode }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-lg p-8 text-center space-y-4">
        <h1 className="text-lg font-bold text-slate-800">Chưa có dữ liệu lương</h1>
        <p className="text-sm text-slate-600">
          Xin chào <span className="font-semibold">{employeeName}</span> ({employeeCode}). Hệ thống chưa có
          bảng lương cho tài khoản của bạn. Vui lòng liên hệ bộ phận nhân sự nếu cần hỗ trợ.
        </p>
        <div className="pt-4 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
