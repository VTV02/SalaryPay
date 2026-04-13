'use client';

import { useRef, useState, useEffect } from 'react';

export function QRPrintButton() {
  const [open, setOpen] = useState(false);
  const [qrSrc, setQrSrc] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const loginUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : '/login';

  useEffect(() => {
    if (!open) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(loginUrl, {
        width: 800,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }).then(setQrSrc);
    });
  }, [open, loginUrl]);

  function onPrint() {
    const content = printRef.current;
    if (!content) return;

    const win = window.open('', '_blank', 'width=800,height=1100');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mã QR Tra Cứu Lương</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    .page {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; padding: 32px;
      text-align: center;
    }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 14px; }
    .divider { width: 80px; height: 3px; background: #333; margin: 0 auto 20px; }
    .titles { margin-bottom: 20px; }
    .titles .line { font-size: 16px; font-weight: 700; line-height: 1.6; }
    .subtitles .line { font-size: 12px; color: #555; line-height: 1.5; }
    .subtitles { margin-bottom: 20px; }
    .qr-box {
      display: inline-block; padding: 12px;
      border: 3px solid #1e293b; border-radius: 8px;
      margin-bottom: 24px;
    }
    .qr-box img { width: 260px; height: 260px; display: block; }
    .guides {
      text-align: left; border: 1px solid #ccc; padding: 16px 20px;
      border-radius: 8px; max-width: 480px; margin: 0 auto 20px;
    }
    .guide-block { margin-bottom: 10px; }
    .guide-block:last-child { margin-bottom: 0; }
    .guide-block h3 { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
    .guide-block ol { padding-left: 18px; font-size: 12px; line-height: 1.8; }
    .guide-block strong { font-weight: 600; }
    .lang-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .warnings { font-size: 11px; color: #555; margin-bottom: 10px; line-height: 1.6; font-weight: 500; }
    .url { font-size: 10px; color: #999; word-break: break-all; }
    @media print { .page { padding: 16px; } }
  </style>
</head>
<body>
  <div class="page">
    <h1>THACO AGRI SNUOL COMPLEX</h1>
    <div class="divider"></div>

    <div class="titles">
      <div class="line">QUÉT MÃ ĐỂ XEM PHIẾU LƯƠNG</div>
      <div class="line">ស្កេនកូដដើម្បីមើលប័ណ្ណបៀវត្សរ៍</div>
      <div class="line">SCAN QR TO VIEW PAYSLIP</div>
    </div>

    <div class="subtitles">
      <div class="line">Dùng Camera hoặc Zalo để quét mã QR bên dưới</div>
      <div class="line">ប្រើ Camera ឬ Zalo ដើម្បីស្កេនកូដ QR ខាងក្រោម</div>
      <div class="line">Use Camera or Zalo to scan the QR code below</div>
    </div>

    <div class="qr-box">
      <img src="${qrSrc}" alt="QR Code" />
    </div>

    <div class="guides">
      <div class="guide-block">
        <p class="lang-label">Tiếng Việt</p>
        <ol>
          <li>Mở <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại</li>
          <li>Hướng camera vào mã QR phía trên</li>
          <li>Nhập <strong>Mã Nhân Viên</strong> và <strong>ngày tháng năm sinh</strong></li>
          <li>Xem phiếu lương của bạn</li>
        </ol>
      </div>
      <div class="guide-block">
        <p class="lang-label">ភាសាខ្មែរ</p>
        <ol>
          <li>បើក <strong>Camera</strong> ឬ <strong>Zalo</strong> នៅលើទូរសព្ទ</li>
          <li>ផ្តោត camera ទៅកូដ QR ខាងលើ</li>
          <li>បញ្ចូល <strong>លេខកូដបុគ្គលិក</strong> និង <strong>លេខ ៦ ខ្ទង់ចុងក្រោយនៃអត្តសញ្ញាណប័ណ្ណ</strong></li>
          <li>មើលប័ណ្ណបៀវត្សរ៍របស់អ្នក</li>
        </ol>
      </div>
      <div class="guide-block">
        <p class="lang-label">English</p>
        <ol>
          <li>Open <strong>Camera</strong> or <strong>Zalo</strong> on your phone</li>
          <li>Point the camera at the QR code above</li>
          <li>Enter your <strong>Employee ID</strong> and <strong>last 6 digits of your ID card</strong></li>
          <li>View your payslip</li>
        </ol>
      </div>
    </div>

    <div class="warnings">
      <div>Lương là bảo mật. Mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt theo quy chế Công ty!</div>
      <div>ប្រាក់បៀវត្សរ៍គឺជាការសម្ងាត់។ រាល់ការស្វែងរកប្រាក់បៀវត្សរ៍អ្នកដទៃនឹងត្រូវផាកពិន័យតាមបទបញ្ជារបស់ក្រុមហ៊ុន!</div>
      <div>Salary is confidential. Any attempt to access another person's salary will be subject to company disciplinary action!</div>
    </div>

    <p class="url">${loginUrl}</p>
  </div>
</body>
</html>`);
    win.document.close();
    const img = win.document.querySelector('img');
    if (img && !img.complete) {
      img.onload = () => { win.print(); win.close(); };
    } else {
      setTimeout(() => { win.print(); win.close(); }, 300);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 hover:bg-slate-900"
      >
        In mã QR
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={printRef}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 space-y-5 text-center"
          >
            <h1 className="text-lg font-bold text-slate-900">
              THACO AGRI SNUOL COMPLEX
            </h1>
            <div className="h-0.5 w-16 bg-slate-800 mx-auto" />

            {/* 3 ngôn ngữ tiêu đề */}
            <div className="space-y-1">
              <p className="text-base font-bold text-emerald-800">QUÉT MÃ ĐỂ XEM PHIẾU LƯƠNG</p>
              <p className="text-sm font-bold text-emerald-700">ស្កេនកូដដើម្បីមើលប័ណ្ណបៀវត្សរ៍</p>
              <p className="text-sm font-bold text-emerald-700">SCAN QR TO VIEW PAYSLIP</p>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs text-slate-500">Dùng Camera hoặc Zalo để quét mã QR bên dưới</p>
              <p className="text-xs text-slate-500">ប្រើ Camera ឬ Zalo ដើម្បីស្កេនកូដ QR ខាងក្រោម</p>
              <p className="text-xs text-slate-500">Use Camera or Zalo to scan the QR code below</p>
            </div>

            {qrSrc ? (
              <div className="inline-block p-3 border-4 border-slate-800 rounded-2xl">
                <img src={qrSrc} alt="QR Code" width={220} height={220} />
              </div>
            ) : (
              <div className="w-[220px] h-[220px] mx-auto bg-slate-100 rounded-xl animate-pulse" />
            )}

            {/* Hướng dẫn 3 ngôn ngữ */}
            <div className="bg-slate-50 rounded-xl p-4 text-left text-xs space-y-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Tiếng Việt</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                  <li>Mở <strong>Camera</strong> hoặc <strong>Zalo</strong></li>
                  <li>Hướng camera vào mã QR</li>
                  <li>Nhập <strong>Mã Nhân Viên</strong> và <strong>ngày tháng năm sinh</strong></li>
                  <li>Xem phiếu lương</li>
                </ol>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">ភាសាខ្មែរ</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                  <li>បើក <strong>Camera</strong> ឬ <strong>Zalo</strong> នៅលើទូរសព្ទ</li>
                  <li>ផ្តោត camera ទៅកូដ QR ខាងលើ</li>
                  <li>បញ្ចូល <strong>លេខកូដបុគ្គលិក</strong> និង <strong>លេខ ៦ ខ្ទង់ចុងក្រោយនៃអត្តសញ្ញាណប័ណ្ណ</strong></li>
                  <li>មើលប័ណ្ណបៀវត្សរ៍របស់អ្នក</li>
                </ol>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">English</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                  <li>Open <strong>Camera</strong> or <strong>Zalo</strong> on your phone</li>
                  <li>Point camera at the QR code above</li>
                  <li>Enter <strong>Employee ID</strong> &amp; <strong>last 6 digits of ID card</strong></li>
                  <li>View your payslip</li>
                </ol>
              </div>
            </div>

            <p className="text-xs text-slate-400 break-all">{loginUrl}</p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={onPrint}
                disabled={!qrSrc}
                className="rounded-xl bg-emerald-800 text-white text-sm font-semibold px-6 py-2.5 hover:bg-emerald-900 disabled:opacity-60"
              >
                In
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 text-slate-600 text-sm font-medium px-6 py-2.5 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
