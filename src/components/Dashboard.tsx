import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, TrendingUp, Users } from 'lucide-react';
import { useAppContext } from '../store';
import { useState, useMemo } from 'react';
import { TransferModal } from './modals/TransferModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
    const { customers, transactions } = useAppContext();
    const [showTransfer, setShowTransfer] = useState(false);

    // Compute receivables and payables
    const totalReceivables = customers.filter(c => c.balance > 0).reduce((acc, c) => acc + c.balance, 0);
    const totalPayables = customers.filter(c => c.balance < 0).reduce((acc, c) => acc + Math.abs(c.balance), 0);
    const activeCustomers = customers.length;

    // Chart Data Generation
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayTxns = transactions.filter(t => new Date(t.date).toDateString() === d.toDateString());
            const cashIn = dayTxns.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
            const cashOut = dayTxns.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);

            data.push({ name: dateStr, In: cashIn, Out: cashOut });
        }
        return data;
    }, [transactions]);

    // Top Debtors (People who owe me the most)
    const topDebtors = [...customers].filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 4);

    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="w-full max-w-6xl mx-auto relative pb-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Insights</h1>
                <button
                    onClick={() => setShowTransfer(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                    <ArrowRightLeft size={18} />
                    Transfer Amount
                </button>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Receivables" amount={`₹ ${totalReceivables.toLocaleString()}`} type="positive" />
                <StatCard title="Total Payables" amount={`₹ ${totalPayables.toLocaleString()}`} type="negative" />
                <StatCard title="Total Accounts" amount={activeCustomers} type="neutral" />
                <StatCard title="7-Day Actions" amount={transactions.filter(t => new Date(t.date).getTime() > Date.now() - 7 * 86400000).length} type="neutral" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Cash Flow Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" size={18} />
                        7-Day Cash Flow Velocity
                    </h2>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis tickFormatter={(val) => val >= 1000 ? `₹${(val / 1000)}k` : `₹${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹ ${Number(value).toLocaleString()}`, '']}
                                />
                                <Bar dataKey="In" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="Out" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Debtors List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                        <Users className="text-blue-500" size={18} />
                        <h2 className="text-base font-bold text-slate-800">Top Receivables (To Collect)</h2>
                    </div>
                    <div className="flex-1 flex flex-col">
                        {topDebtors.map((c, i) => (
                            <div key={c.id} className={`px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${i !== topDebtors.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                <div>
                                    <div className="font-semibold text-slate-800">{c.name}</div>
                                    <div className="text-xs text-slate-500">{c.phone}</div>
                                </div>
                                <div className="font-bold text-emerald-600">
                                    ₹ {c.balance.toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {topDebtors.length === 0 && (
                            <div className="m-auto text-center text-slate-400 p-6 text-sm">
                                All clear! No customers currently owe you any money.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Global Activity */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Most Recent Global Network Transactions</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentTransactions.map(t => {
                        const customer = customers.find(c => c.id === t.customerId);
                        return (
                            <TransactionRow
                                key={t.id}
                                name={customer ? customer.name : 'System Generated'}
                                date={new Date(t.date).toLocaleDateString()}
                                amount={`₹ ${t.amount.toLocaleString()}`}
                                type={t.type}
                            />
                        )
                    })}
                    {recentTransactions.length === 0 && (
                        <div className="px-6 py-8 text-center text-slate-500">No transactions recorded inside the network yet.</div>
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
