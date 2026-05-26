import React from 'react';

export default function Logo({ className = "", showDotCom = true, size = "text-2xl" }) {
  return (
    <div className={`inline-flex items-center select-none font-sans align-middle ${className}`}>
      {/* "info" part in bright sky blue/cyan */}
      <span className={`text-[#00adef] font-black tracking-tighter lowercase ${size} leading-none`}>
        info
      </span>
      {/* "casa" part with roof and optional .com */}
      <div className="relative flex flex-col items-center">
        {/* SVG Roof above "casa" */}
        <div className="w-[105%] h-4 relative -mb-1">
          <svg
            viewBox="0 0 100 25"
            fill="none"
            className="w-full h-full text-[#cca425]"
          >
            {/* Chimney cap */}
            <rect x="51" y="2" width="8" height="2" fill="currentColor" />
            {/* Chimney body */}
            <rect x="53" y="4" width="4" height="10" fill="currentColor" />
            {/* Roof Line */}
            <path
              d="M 2,18 L 38,6 L 50,13 L 98,13"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        {/* Word "casa" in bold red */}
        <span className={`text-[#d90429] font-black tracking-tighter lowercase leading-none relative ${size}`}>
          casa
          {showDotCom && (
            <span className="absolute bottom-[-10px] right-0 text-[8px] font-black text-slate-800 tracking-normal lowercase">
              .com
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
