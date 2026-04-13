import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import Link from 'next/link';
import { getAdminSession } from '@/lib/admin-session';
import { PrintButton } from './print-button';

export const metadata: Metadata = {
  title: 'Mã QR Tra Cứu Lương',
};

export default async function QRPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { url } = await searchParams;

  const baseUrl = url || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/login`;

  const qrDataUrl = await QRCode.toDataURL(loginUrl, {
    width: 800,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  const qrSvg = await QRCode.toString(loginUrl, {
    type: 'svg',
    width: 800,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Nút điều khiển - ẩn khi in */}
      <div className="print:hidden bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/admin"
          className="text-sm text-emerald-800 font-medium hover:underline underline-offset-2"
        >
          &larr; Về trang quản trị
        </Link>
        <div className="flex gap-3">
          <PrintButton />
        </div>
      </div>

      {/* Trang in QR */}
      <div className="flex flex-col items-center justify-center px-8 py-12 print:py-0 print:px-0 print:min-h-screen">
        <div className="max-w-lg w-full text-center space-y-8 print:space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 print:text-3xl">
              THACO AGRI SNUOL COMPLEX
            </h1>
            <div className="mt-4 h-1 w-24 bg-emerald-700 mx-auto rounded-full print:bg-black" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-emerald-800 print:text-2xl print:text-black">
              QUÉT MÃ ĐỂ XEM PHIẾU LƯƠNG
            </h2>
            <p className="mt-2 text-slate-600 text-sm print:text-base print:text-black">
              Dùng Camera hoặc Zalo để quét mã QR bên dưới
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 border-4 border-slate-800 rounded-2xl print:border-2 print:rounded-none inline-block">
              <img
                src={qrDataUrl}
                alt="QR Code tra cứu lương"
                width={300}
                height={300}
                className="print:w-[280px] print:h-[280px]"
              />
            </div>
          </div>

          {/* Hướng dẫn */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 print:bg-white print:border print:border-black print:rounded-none print:p-4">
            <h3 className="font-bold text-slate-800 text-base print:text-lg">
              HƯỚNG DẪN:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm print:text-base">
              <li>
                Mở <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại
              </li>
              <li>Hướng camera vào mã QR phía trên</li>
              <li>
                Nhập <strong>Mã Nhân Viên</strong> và{' '}
                <strong>ngày tháng năm sinh</strong>
              </li>
              <li>Xem phiếu lương của bạn</li>
            </ol>
          </div>

          {/* Cảnh báo */}
          <div className="text-xs text-slate-500 print:text-sm print:text-black print:font-medium">
            Lương là bảo mật. Mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt
            theo quy chế Công ty!
          </div>

          {/* URL nhỏ dưới cùng */}
          <div className="text-xs text-slate-400 print:text-slate-600 break-all">
            {loginUrl}
          </div>
        </div>
      </div>

      {/* SVG download ẩn */}
      <a
        href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`}
        download="qr-tra-cuu-luong.svg"
        className="print:hidden fixed bottom-6 right-6 rounded-xl bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 hover:bg-slate-900 shadow-lg"
      >
        Tải ảnh SVG
      </a>
    </div>
  );
}
