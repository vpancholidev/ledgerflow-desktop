import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange
}: {
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200">
            <div className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-900">{currentPage}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
