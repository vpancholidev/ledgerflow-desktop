import { Maximize, Minus, X } from 'lucide-react';

export function TitleBar() {
    return (
        <div
            className="flex h-10 w-full items-center justify-between bg-white border-b border-slate-200 px-4 pt-1 select-none"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div className="text-sm font-bold text-emerald-600 tracking-tight flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-100 rounded-md flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-emerald-600 rounded-br-lg" />
                </div>
                LedgerFlow
            </div>
            <div
                className="flex space-x-2"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <button className="flex h-7 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                    <Minus size={16} />
                </button>
                <button className="flex h-7 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
                    <Maximize size={14} />
                </button>
                <button className="flex h-7 w-8 items-center justify-center rounded hover:bg-red-500 hover:text-white text-slate-500 transition-colors cursor-pointer">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
