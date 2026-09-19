import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { useAppContext } from '../store';
import { useState } from 'react';
import { TransferModal } from './modals/TransferModal';

export function Dashboard() {
    const { customers, transactions } = useAppContext();
    const [showTransfer, setShowTransfer] = useState(false);

    // Compute receivables and payables
    const totalReceivables = customers.filter(c => c.balance > 0).reduce((acc, c) => acc + c.balance, 0);
    const totalPayables = customers.filter(c => c.balance < 0).reduce((acc, c) => acc + Math.abs(c.balance), 0);
    const activeCustomers = customers.length;

    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="w-full max-w-5xl mx-auto relative">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <button
                    onClick={() => setShowTransfer(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                    <ArrowRightLeft size={18} />
                    Transfer Amount
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Receivables" amount={`₹ ${totalReceivables.toLocaleString()}`} type="positive" />
                <StatCard title="Total Payables" amount={`₹ ${totalPayables.toLocaleString()}`} type="negative" />
                <StatCard title="Active Customers" amount={activeCustomers} type="neutral" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentTransactions.map(t => {
                        const customer = customers.find(c => c.id === t.customerId);
                        return (
                            <TransactionRow
                                key={t.id}
                                name={customer ? customer.name : 'System'}
                                date={new Date(t.date).toLocaleDateString()}
                                amount={`₹ ${t.amount.toLocaleString()}`}
                                type={t.type}
                            />
                        )
                    })}
                    {recentTransactions.length === 0 && (
                        <div className="px-6 py-8 text-center text-slate-500">No transactions recorded yet.</div>
                    )}
                </div>
            </div>

            {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
        </div>
    );
}

function StatCard({ title, amount, type }: { title: string, amount: string | number, type: 'positive' | 'negative' | 'neutral' }) {
    const colors = {
        positive: 'text-emerald-600',
        negative: 'text-red-500',
        neutral: 'text-slate-900'
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-sm mb-1 font-medium">{title}</div>
            <div className={`text-3xl font-bold ${colors[type]}`}>{amount}</div>
        </div>
    );
}

function TransactionRow({ name, date, amount, type }: { name: string, date: string, amount: string, type: 'credit' | 'debit' }) {
    const isCredit = type === 'credit';
    return (
        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                    <div className="font-medium text-slate-900">{name}</div>
                    <div className="text-sm text-slate-500">{date}</div>
                </div>
            </div>
            <div className={`font-semibold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                {isCredit ? '+' : '-'}{amount}
            </div>
        </div>
    );
}
