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
        <div className="max-w-3xl w-full text-center space-y-6 print:space-y-4">

          {/* Title */}
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight print:text-5xl">
              TRA CỨU PHIẾU LƯƠNG
            </h1>
            <p className="mt-2 text-base text-slate-500 print:text-lg">
              <span className="font-semibold text-slate-700">SALARY SLIP LOOKUP</span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="font-semibold text-blue-800">ការស្វែងរកប្រាក់បៀវត្សរ៍</span>
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-slate-500 print:text-base">
            Quét mã QR bằng Camera / Zalo / Messenger
            <span className="mx-1">&middot;</span>
            <span className="italic">Scan QR with your phone</span>
            <span className="mx-1">&middot;</span>
            <span className="text-blue-800">ស្កេនកូដ QR ដោយទូរស័ព្ទ</span>
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-5 border-4 border-slate-800 rounded-2xl print:border-2 print:rounded-none inline-block">
              <img
                src={qrDataUrl}
                alt="QR Code tra cứu lương"
                width={320}
                height={320}
                className="print:w-[300px] print:h-[300px]"
              />
            </div>
          </div>

          {/* URL dưới QR */}
          <div className="text-sm text-slate-400 print:text-slate-600 font-medium">
            pay.snuol.com.vn/login
          </div>

          {/* Hướng dẫn 3 cột */}
          <div className="border border-slate-200 rounded-xl overflow-hidden print:rounded-none print:border-slate-400">
            <div className="grid grid-cols-3 divide-x divide-slate-200">
              {/* Tiếng Việt */}
              <div className="p-5 text-left">
                <h3 className="font-bold text-slate-800 mb-3 text-sm">Tiếng Việt</h3>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">1</span>
                    Quét mã QR
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">2</span>
                    Nhập Mã nhân viên
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">3</span>
                    Nhập ngày tháng năm sinh
                  </li>
                </ol>
              </div>

              {/* English */}
              <div className="p-5 text-left">
                <h3 className="font-bold text-slate-800 mb-3 text-sm">English</h3>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">1</span>
                    Scan QR code
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">2</span>
                    Enter Employee ID
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">3</span>
                    Enter last 6 of ID
                  </li>
                </ol>
              </div>

              {/* ភាសាខ្មែរ */}
              <div className="p-5 text-left">
                <h3 className="font-bold text-blue-800 mb-3 text-sm">ភាសាខ្មែរ</h3>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">1</span>
                    ស្កេនកូដ QR
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">2</span>
                    បញ្ជូលលេខបុគ្គលិក
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-emerald-700">3</span>
                    បញ្ជូលលេខ ៦ ខ្ទង់
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-bold text-slate-700 tracking-wide">
              THACO AGRI SNUOL COMPLEX
            </p>
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
