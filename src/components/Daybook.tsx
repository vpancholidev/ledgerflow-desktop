import { Download, Calendar, Search, MessageCircle } from 'lucide-react';
import { useAppContext } from '../store';
import { useState } from 'react';

export function Daybook() {
    const { transactions, customers, companyName } = useAppContext();
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [search, setSearch] = useState('');

    // Apply filters
    let filteredTxns = [...transactions];
    if (filterStartDate) {
        filteredTxns = filteredTxns.filter(t => new Date(t.date) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        filteredTxns = filteredTxns.filter(t => new Date(t.date) <= end);
    }
    if (search) {
        filteredTxns = filteredTxns.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()));
    }

    // Calculate totals
    const totalCredits = filteredTxns.filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0);
    const totalDebits = filteredTxns.filter(t => t.type === 'debit').reduce((a, b) => a + b.amount, 0);
    const netChange = totalCredits - totalDebits;

    const handleShareWhatsApp = () => {
        const text = `*${companyName} - Daybook Summary*\nTotal Credits: ₹${totalCredits.toLocaleString()}\nTotal Debits: ₹${totalDebits.toLocaleString()}\nNet Change: ₹${netChange.toLocaleString()}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Rojmel / Day Book</h1>
                    <p className="text-slate-500 font-medium">{companyName || 'No Company Name'}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleShareWhatsApp} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                        <MessageCircle size={16} /> Share on WhatsApp
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="flex bg-white rounded-xl border border-slate-200 p-4 gap-4 items-center shadow-sm mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Financial Year</span>
                    <select className="border border-slate-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-emerald-500">
                        <option>2026-27</option>
                    </select>
                </div>
                <div className="text-slate-400 font-medium text-sm">OR</div>
                <div className="flex items-center gap-2">
                    <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-emerald-500" />
                    <span className="text-slate-400">to</span>
                    <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search Particulars..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 relative overflow-hidden shadow-sm">
                    <div className="text-emerald-700/80 text-xs font-semibold uppercase tracking-wider mb-2">Total Period Credits (Deposits)</div>
                    <div className="text-2xl font-bold text-emerald-600">₹{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100/50 relative overflow-hidden shadow-sm">
                    <div className="text-red-700/80 text-xs font-semibold uppercase tracking-wider mb-2">Total Period Debits (Withdrawals)</div>
                    <div className="text-2xl font-bold text-red-500">₹{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 relative overflow-hidden shadow-sm">
                    <div className="text-emerald-700/80 text-xs font-semibold uppercase tracking-wider mb-2">Net Period Change</div>
                    <div className="text-2xl font-bold text-emerald-600 truncate">
                        {netChange >= 0 ? '' : '-'}₹{Math.abs(netChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="overflow-y-auto flex-1 p-0">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm shadow-[0_1px_0_0_rgb(226,232,240)] z-10">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider w-40">Date / Time</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider">Particulars</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider text-right w-32">Debit (₹)</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs tracking-wider text-right w-32">Credit (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredTxns.map(t => {
                                const customer = customers.find(c => c.id === t.customerId);
                                const isCredit = t.type === 'credit';

                                return (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors text-sm">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">{t.desc}</span>
                                            {customer && <span className="text-slate-500 ml-1">- {customer.name}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums font-semibold text-slate-900">
                                            {!isCredit ? `${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums font-semibold text-emerald-600">
                                            {isCredit ? `${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredTxns.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No transactions recorded in this period.</td>
                                </tr>
                            )}
                            {filteredTxns.length > 0 && (
                                <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-200">
                                    <td className="px-6 py-4" colSpan={2}>TOTAL</td>
                                    <td className="px-6 py-4 text-right tabular-nums text-red-500">{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-right tabular-nums text-emerald-600">{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
