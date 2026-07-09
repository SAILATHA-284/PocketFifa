import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface OnscreenControlsProps {
  onPassClick: () => void;
  onShootClick: () => void;
  onTackleClick: () => void;
  onSwitchClick: () => void;
}

export const OnscreenControls: React.FC<OnscreenControlsProps> = ({
  onPassClick,
  onShootClick,
  onTackleClick,
  onSwitchClick,
}) => {
  // Dispatches a synthetic keyboard event so it registers seamlessly in the canvas engine
  const dispatchKeySim = (type: 'keydown' | 'keyup', keyChar: string) => {
    const event = new KeyboardEvent(type, {
      key: keyChar,
      code: `Key${keyChar.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  // Touch start handlers
  const handleTouchStart = (key: string) => {
    dispatchKeySim('keydown', key);
  };

  // Touch end/leave handlers
  const handleTouchEnd = (key: string) => {
    dispatchKeySim('keyup', key);
  };

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row justify-around items-center gap-6 select-none shadow-2xl">
      {/* 1. Tactical Cross D-Pad (Left Section) */}
      <div className="flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 font-mono">
          Virtual Joystick
        </span>
        
        <div className="relative w-40 h-40 bg-slate-950 rounded-full p-2 border border-slate-800 flex items-center justify-center shadow-inner">
          {/* Inner core aesthetic */}
          <div className="absolute w-12 h-12 bg-slate-900 rounded-full border border-slate-800 shadow-md z-10" />

          {/* UP Button */}
          <button
            onMouseDown={() => handleTouchStart('w')}
            onMouseUp={() => handleTouchEnd('w')}
            onMouseLeave={() => handleTouchEnd('w')}
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('w'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('w'); }}
            className="absolute top-1 left-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 border border-slate-700 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 shadow-md"
            title="Move Up"
          >
            <ArrowUp size={20} className="active:scale-110" />
          </button>

          {/* DOWN Button */}
          <button
            onMouseDown={() => handleTouchStart('s')}
            onMouseUp={() => handleTouchEnd('s')}
            onMouseLeave={() => handleTouchEnd('s')}
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('s'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('s'); }}
            className="absolute bottom-1 left-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 border border-slate-700 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 shadow-md"
            title="Move Down"
          >
            <ArrowDown size={20} className="active:scale-110" />
          </button>

          {/* LEFT Button */}
          <button
            onMouseDown={() => handleTouchStart('a')}
            onMouseUp={() => handleTouchEnd('a')}
            onMouseLeave={() => handleTouchEnd('a')}
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('a'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('a'); }}
            className="absolute left-1 top-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 border border-slate-700 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 shadow-md"
            title="Move Left"
          >
            <ArrowLeft size={20} className="active:scale-110" />
          </button>

          {/* RIGHT Button */}
          <button
            onMouseDown={() => handleTouchStart('d')}
            onMouseUp={() => handleTouchEnd('d')}
            onMouseLeave={() => handleTouchEnd('d')}
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('d'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('d'); }}
            className="absolute right-1 top-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 border border-slate-700 rounded-lg flex items-center justify-center text-white cursor-pointer transition-all active:scale-95 shadow-md"
            title="Move Right"
          >
            <ArrowRight size={20} className="active:scale-110" />
          </button>
        </div>
      </div>

      {/* 2. Keyboard Assist Quick Tips (Center Section) */}
      <div className="hidden lg:flex flex-col gap-1.5 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 max-w-xs text-xs font-mono text-slate-400">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Zap size={12} /> Pro Playmaking Tip
        </span>
        <p className="leading-relaxed">
          Move your player near the ball to automatically collect possession. Use <kbd className="bg-slate-800 px-1 py-0.2 rounded border border-slate-700 text-white">Q</kbd> to change target players manually.
        </p>
        <p className="leading-relaxed mt-1">
          Aim shooting curves high/low by pressing <kbd className="bg-slate-800 px-1 py-0.2 rounded border border-slate-700 text-white">W / S</kbd> simultaneously with your shot strike!
        </p>
      </div>

      {/* 3. Action Buttons (Right Section) */}
      <div className="flex flex-col items-center justify-center w-full max-w-sm">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 font-mono">
          Action Control Grid
        </span>

        <div className="grid grid-cols-2 gap-3 w-full">
          {/* PASS */}
          <button
            onClick={onPassClick}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-[4px] cursor-pointer transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-1.5"
            title="Pass to teammate [Space]"
          >
            <RefreshCw size={16} className="animate-pulse" /> PASS
          </button>

          {/* TACKLE */}
          <button
            onClick={onTackleClick}
            className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg border-b-4 border-rose-800 active:border-b-0 active:translate-y-[4px] cursor-pointer transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-1.5"
            title="Tackle opponent [E]"
          >
            <ShieldAlert size={16} /> TACKLE
          </button>

          {/* SWITCH */}
          <button
            onClick={onSwitchClick}
            className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-[4px] cursor-pointer transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-1.5"
            title="Switch Player [Q]"
          >
            <RefreshCw size={16} /> SWITCH
          </button>

          {/* SHOOT */}
          <button
            onClick={onShootClick}
            className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-[4px] cursor-pointer transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-1.5"
            title="Strike Shot [F]"
          >
            <Sparkles size={16} className="fill-slate-950" /> SHOOT
          </button>
        </div>
      </div>
    </div>
  );
};
