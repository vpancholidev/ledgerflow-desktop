import { X, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../../store';

interface TransferModalProps {
    onClose: () => void;
}

export function TransferModal({ onClose }: TransferModalProps) {
    const { customers, transferBetweenCustomers } = useAppContext();
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [desc, setDesc] = useState('');

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ArrowRightLeft className="text-emerald-600" size={20} />
                        Transfer Amount
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-600 mb-1">From Customer</label>
                            <select
                                value={fromId} onChange={e => setFromId(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
                            >
                                <option value="">Select...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-600 mb-1">To Customer</label>
                            <select
                                value={toId} onChange={e => setToId(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
                            >
                                <option value="">Select...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
                        <input
                            type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-xl font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                        <input
                            type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                        <textarea
                            rows={2} value={desc} onChange={e => setDesc(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 flex gap-3 bg-slate-50/50">
                    <button onClick={onClose} className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-lg cursor-pointer shadow-sm transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (fromId && toId && Number(amount) > 0 && fromId !== toId) {
                                transferBetweenCustomers(fromId, toId, Number(amount), date, desc || 'Internal Transfer');
                                onClose();
                            }
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg cursor-pointer shadow-sm transition-colors"
                    >
                        Confirm Transfer
                    </button>
                </div>
            </div>
        </div>
    );
}
