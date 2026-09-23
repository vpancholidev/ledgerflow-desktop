import { useEffect, useState } from 'react';
import { Maximize, Minus, X, Maximize2 } from 'lucide-react';

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const checkMaximized = async () => {
            if (window.electronAPI?.isMaximized) {
                const maximized = await window.electronAPI.isMaximized();
                setIsMaximized(maximized);
            }
        };
        checkMaximized();
    }, []);

    const handleMinimize = () => {
        window.electronAPI?.minimize?.();
    };

    const handleMaximize = () => {
        window.electronAPI?.maximize?.();
        // Toggle local state immediately for UI responsiveness
        setIsMaximized(!isMaximized);
    };

    const handleClose = () => {
        window.electronAPI?.close?.();
    };

    return (
        <div
            className="flex h-10 w-full items-center justify-between bg-white border-b border-slate-200 px-4 pt-1 select-none"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div className="text-sm font-bold text-emerald-600 tracking-tight flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                LedgerFlow
            </div>
            <div
                className="flex space-x-2"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <button
                    onClick={handleMinimize}
                    className="flex h-7 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                    <Minus size={16} />
                </button>
                <button
                    onClick={handleMaximize}
                    className="flex h-7 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                    {isMaximized ? <Maximize2 size={14} /> : <Maximize size={14} />}
                </button>
                <button
                    onClick={handleClose}
                    className="flex h-7 w-8 items-center justify-center rounded hover:bg-red-500 hover:text-white text-slate-500 transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
