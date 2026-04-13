'use client';

import { useEffect, useState } from 'react';

export function LogoLoader({ text = 'Đang tải...' }: { text?: string }) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFill((prev) => {
        if (prev >= 100) return 0; // loop
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-5">
      {/* Logo container */}
      <div className="relative w-24 h-24">
        {/* Gray logo (empty state) */}
        <img
          src="/LOGO-THACO-AGRI-02-Copy-e1688459733402.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain opacity-20 grayscale"
          draggable={false}
        />

        {/* Green fill masked by logo shape */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            maskImage: 'url(/LOGO-THACO-AGRI-02-Copy-e1688459733402.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/LOGO-THACO-AGRI-02-Copy-e1688459733402.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        >
          {/* Water fill rising from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-100 ease-linear"
            style={{
              height: `${fill}%`,
              background: 'linear-gradient(to top, #047857, #10b981, #34d399)',
            }}
          />
          {/* Water surface wave */}
          <div
            className="absolute left-0 right-0 h-2 transition-all duration-100 ease-linear"
            style={{
              bottom: `${fill}%`,
              background: 'linear-gradient(to top, rgba(52,211,153,0.6), transparent)',
            }}
          >
            <div
              className="w-full h-full animate-pulse"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">THACO AGRI</p>
      </div>
    </div>
  );
}
