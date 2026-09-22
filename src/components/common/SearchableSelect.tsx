import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Search..."
}: {
    options: { id: string, name: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const selectedOption = options.find(o => o.id === value);
    const filteredOptions = options.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus-within:border-emerald-500 bg-white text-sm cursor-pointer flex items-center justify-between"
                onClick={() => { setIsOpen(!isOpen); setSearchTerm(''); }}
            >
                <div className="truncate text-slate-800">
                    {selectedOption ? selectedOption.name : <span className="text-slate-400">{placeholder}</span>}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-60">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white">
                        <Search size={14} className="text-slate-400" />
                        <input
                            type="text"
                            className="w-full focus:outline-none text-sm bg-transparent"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="p-2 text-sm text-slate-500 text-center italic">No matches found...</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${value === opt.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="truncate">{opt.name}</span>
                                    {value === opt.id && <Check size={14} className="text-emerald-600" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
