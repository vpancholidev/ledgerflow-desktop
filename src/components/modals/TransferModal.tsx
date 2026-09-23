import { X, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../../store';
import { SearchableSelect } from '../common/SearchableSelect';

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
                        <div className="flex-1 w-1/2 min-w-0">
                            <label className="block text-sm font-medium text-slate-600 mb-1">From Customer <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                options={customers}
                                value={fromId}
                                onChange={setFromId}
                                placeholder="Select Sender..."
                            />
                        </div>
                        <div className="flex-1 w-1/2 min-w-0">
                            <label className="block text-sm font-medium text-slate-600 mb-1">To Customer <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                options={customers}
                                value={toId}
                                onChange={setToId}
                                placeholder="Select Target..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-xl font-semibold focus:outline-none focus:border-emerald-500 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date <span className="text-red-500">*</span></label>
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
                            const num = Number(amount);
                            if (!fromId) return alert("Please select a sender (From Customer).");
                            if (!toId) return alert("Please select a receiver (To Customer).");
                            if (fromId === toId) return alert("Sender and receiver cannot be the exact same customer.");
                            if (num <= 0 || isNaN(num)) return alert("Please enter a valid positive transfer amount.");
                            if (!date) return alert("Please select a transfer date.");

                            transferBetweenCustomers(fromId, toId, num, date, desc || 'Internal Transfer');
                            onClose();
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
