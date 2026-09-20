import { Search, Plus, X, UploadCloud, File as FileIcon, Info } from 'lucide-react';
import { useAppContext } from '../store';
import { useState } from 'react';
import { Pagination } from './common/Pagination';

export function Customers({ onSelectCustomer, onViewDetails }: { onSelectCustomer: (id: string) => void, onViewDetails: (id: string) => void }) {
    const { customers, addCustomer } = useAppContext();
    const [showAdd, setShowAdd] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        address: '',
        idProof: '',
        notes: '',
        documents: [] as string[]
    });

    const handleAdd = () => {
        if (newCustomer.name && newCustomer.phone && newCustomer.address) {
            addCustomer(newCustomer);
            setShowAdd(false);
            setNewCustomer({ name: '', phone: '', address: '', idProof: '', notes: '', documents: [] });
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                    <Plus size={18} />
                    Add Customer
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_rgb(226,232,240)] z-10">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone Number</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {paginatedCustomers.map(c => {
                                const isReceivable = c.balance > 0;
                                const isPayable = c.balance < 0;
                                return (
                                    <tr key={c.id} onClick={() => onSelectCustomer(c.id)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">{c.name}</div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails(c.id);
                                                }}
                                                className="text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                                                title="View Profile Details"
                                            >
                                                <Info size={16} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{c.phone}</td>
                                        <td className={`px-6 py-4 text-right font-semibold tabular-nums ${isReceivable ? 'text-emerald-600' :
                                            isPayable ? 'text-red-500' : 'text-slate-400'
                                            }`}>
                                            {isPayable ? '-' : (isReceivable ? '+' : '')}₹ {Math.abs(c.balance).toLocaleString()}
                                        </td>
                                    </tr>
                                )
                            })}
                            {paginatedCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {showAdd && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">Add New Customer</h2>
                            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newCustomer.name}
                                        onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Address <span className="text-red-500">*</span></label>
                                <textarea
                                    rows={2}
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">ID Proof Reference (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Aadhar / PAN / Driving License Number"
                                    value={newCustomer.idProof}
                                    onChange={e => setNewCustomer({ ...newCustomer, idProof: e.target.value })}
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Notes (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Any internal notes about this customer..."
                                    value={newCustomer.notes}
                                    onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Attach Documents (Max 2, Optional)</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={async () => {
                                            if (window.electronAPI) {
                                                const allowance = 2 - newCustomer.documents.length;
                                                if (allowance <= 0) {
                                                    alert("Maximum 2 documents are allowed total.");
                                                    return;
                                                }
                                                const newlySavedDocs = await window.electronAPI.selectFiles(allowance);
                                                if (newlySavedDocs && newlySavedDocs.length > 0) {
                                                    setNewCustomer({ ...newCustomer, documents: [...newCustomer.documents, ...newlySavedDocs] });
                                                }
                                            } else {
                                                alert("Bridge Missing! Native File Uploader requires Desktop App Sandbox.");
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer transition-colors border border-slate-200"
                                    >
                                        <UploadCloud size={18} />
                                        <span>Browse Files</span>
                                    </button>
                                    {newCustomer.documents.length > 0 && (
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <FileIcon size={16} className="text-emerald-500" />
                                            {newCustomer.documents.length} file(s) selected
                                        </div>
                                    )}
                                </div>
                                {newCustomer.documents.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {newCustomer.documents.map((doc, idx) => (
                                            <li key={idx} className="text-xs text-slate-400 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {doc}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex gap-3 bg-slate-50/50 justify-end">
                            <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button
                                disabled={!newCustomer.name || !newCustomer.phone || !newCustomer.address}
                                onClick={handleAdd}
                                className="px-6 py-2.5 bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
                            >
                                Save Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
