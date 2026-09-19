import { X } from 'lucide-react';
import { useState } from 'react';

interface AddTransactionModalProps {
    onClose: () => void;
    onSave: (amt: number, date: string, desc: string) => void;
    type: 'in' | 'out'; // 'in' = payment received, 'out' = credit given
}

export function AddTransactionModal({ onClose, type, onSave }: AddTransactionModalProps) {
    const isCredit = type === 'in';
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [desc, setDesc] = useState('');

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isCredit ? 'Add Payment (In)' : 'Give Credit (Out)'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-xl font-semibold focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Description / Notes</label>
                        <textarea
                            placeholder="Optional details..."
                            rows={3}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors resize-none shadow-sm"
                        ></textarea>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 flex gap-3 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (Number(amount) > 0) {
                                onSave(Number(amount), date, desc);
                                onClose();
                            }
                        }}
                        className={`flex-1 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm ${isCredit
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        Save Transaction
                    </button>
                </div>
            </div>
        </div>
    );
}
