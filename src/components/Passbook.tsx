import { ArrowLeft, Download, Filter, Search, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../store';
import { AddTransactionModal } from './modals/AddTransactionModal';

export function Passbook({ customerId, onBack }: { customerId: string | null, onBack?: () => void }) {
    const { customers, transactions, addTransaction, companyName } = useAppContext();
    const [modalType, setModalType] = useState<'in' | 'out' | null>(null);

    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-slate-500 mb-4">Customer not found or not selected.</div>
                <button onClick={onBack} className="text-emerald-600 font-medium hover:underline cursor-pointer">Go back</button>
            </div>
        );
    }

    const customerTxns = transactions.filter(t => t.customerId === customerId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const displayTxns = customerTxns.map(t => {
        const change = t.type === 'debit' ? t.amount : -t.amount;
        runningBalance += change;
        return { ...t, runningBalance };
    }).reverse();

    const handleSave = (amt: number, date: string, desc: string) => {
        addTransaction({
            customerId: customer.id,
            type: modalType === 'in' ? 'credit' : 'debit',
            amount: amt,
            date: new Date(date).toISOString(),
            desc: desc || (modalType === 'in' ? 'Payment Received' : 'Credit Given')
        });
    }

    const handleShareWhatsApp = () => {
        const text = `*${companyName} - Statement for ${customer.name}*\nCurrent Balance: ₹ ${Math.abs(customer.balance).toLocaleString()} (${customer.balance < 0 ? 'To Pay' : 'To Receive'})\n\nPlease check your account on record.`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative print:bg-white text-slate-900">
            <div className="flex flex-col gap-1 mb-4 hidden print:block text-center border-b pb-4">
                <h1 className="text-2xl font-bold">{companyName}</h1>
                <p className="text-sm">Passbook Statement for: <strong>{customer.name}</strong></p>
            </div>

            <div className="flex items-center gap-4 mb-6 print:hidden">
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

            <div className="flex gap-4 mb-6 print:hidden">
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0 print:border-none print:shadow-none">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 print:hidden">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-emerald-700 hover:hover:bg-emerald-50 transition-colors cursor-pointer shadow-sm font-medium">
                            <MessageCircle size={16} /> WhatsApp
                        </button>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm font-medium">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-0 print:overflow-visible">
                    <table className="w-full text-left border-collapse print:text-sm">
                        <thead className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_rgb(226,232,240)] z-10 print:static print:bg-transparent print:shadow-none print:border-b-2 print:border-slate-900">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider w-32 print:px-2">Date</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider print:px-2">Description</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right print:px-2">In (Credit)</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right print:px-2">Out (Debit)</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right print:px-2">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {displayTxns.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors print:hover:bg-white text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 print:px-2">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-900 font-medium print:px-2">{t.desc}</td>
                                    <td className="px-6 py-4 text-right tabular-nums text-emerald-600 font-medium print:px-2 print:text-black">
                                        {t.type === 'credit' ? `₹ ${t.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-red-500 font-medium print:px-2 print:text-black">
                                        {t.type === 'debit' ? `₹ ${t.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums font-semibold text-slate-900 print:px-2">
                                        {t.runningBalance < 0 ? '-' : (t.runningBalance > 0 ? '+' : '')}₹ {Math.abs(t.runningBalance).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {displayTxns.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 print:px-2">No transactions recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
