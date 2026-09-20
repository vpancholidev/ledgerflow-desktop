import { ArrowLeft, Download, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../store';
import { AddTransactionModal } from './modals/AddTransactionModal';
import { generatePassbookPDF } from '../utils/pdf';
import { Pagination } from './common/Pagination';

export function Passbook({ customerId, onBack }: { customerId: string | null, onBack?: () => void }) {
    const { customers, transactions, addTransaction, companyName } = useAppContext();
    const [modalType, setModalType] = useState<'in' | 'out' | null>(null);
    const [search, setSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-slate-500 mb-4">Customer not found or not selected.</div>
                <button onClick={onBack} className="text-emerald-600 font-medium hover:underline cursor-pointer">Go back</button>
            </div>
        );
    }

    let customerTxns = transactions.filter(t => t.customerId === customerId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (search) {
        customerTxns = customerTxns.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()));
    }

    let runningBalance = 0;
    const displayTxns = customerTxns.map(t => {
        const change = t.type === 'credit' ? t.amount : -t.amount;
        runningBalance += change;
        return { ...t, runningBalance };
    }).reverse();

    const totalPages = Math.ceil(displayTxns.length / ITEMS_PER_PAGE);
    const paginatedTxns = displayTxns.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSave = (amt: number, date: string, desc: string) => {
        addTransaction({
            customerId: customer.id,
            type: modalType === 'in' ? 'credit' : 'debit',
            amount: amt,
            date: new Date(date).toISOString(),
            desc: desc || (modalType === 'in' ? 'Payment Received' : 'Credit Given')
        });
    }

    const handleExportPDF = () => {
        const doc = generatePassbookPDF(companyName, customer, displayTxns);
        doc.save(`${customer.name.replace(/[^a-z0-9]/gi, '_')}_Passbook.pdf`);
    };



    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative text-slate-900">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer shadow-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        {customer.name}
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">Customer</span>
                    </h1>
                    <div className="text-slate-500 text-sm mt-1">{customer.phone}</div>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-sm text-slate-500 mb-1 font-medium">Current Balance</div>
                    <div className={`text-2xl font-bold ${customer.balance > 0 ? 'text-emerald-600' : customer.balance < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                        {customer.balance < 0 ? '-' : (customer.balance > 0 ? '+' : '')}₹ {Math.abs(customer.balance).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setModalType('in')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer text-center shadow-sm shadow-emerald-600/20"
                >
                    Add Payment (In)
                </button>
                <button
                    onClick={() => setModalType('out')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer text-center shadow-sm shadow-red-500/20"
                >
                    Give Credit (Out)
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm font-medium">
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider w-32">Date</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">In (Credit)</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Out (Debit)</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {paginatedTxns.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors bg-white text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">{t.desc}</td>
                                    <td className="px-6 py-4 text-right tabular-nums text-emerald-600 font-medium">
                                        {t.type === 'credit' ? `₹ ${t.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-red-500 font-medium">
                                        {t.type === 'debit' ? `₹ ${t.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums font-semibold text-slate-900">
                                        {t.runningBalance < 0 ? '-' : (t.runningBalance > 0 ? '+' : '')}₹ {Math.abs(t.runningBalance).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {paginatedTxns.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transactions recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {modalType && (
                <AddTransactionModal
                    type={modalType}
                    onSave={handleSave}
                    onClose={() => setModalType(null)}
                />
            )}
        </div>
    );
}
