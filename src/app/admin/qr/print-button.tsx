'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 hover:bg-emerald-900"
    >
      In mã QR
    </button>
  );
}
