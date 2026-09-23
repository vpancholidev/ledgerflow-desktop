import { X } from 'lucide-react';
import { useState } from 'react';
import type { Transaction } from '../../store';

interface EditTransactionModalProps {
    transaction: Transaction;
    onClose: () => void;
    onSave: (amt: number, date: string, desc: string) => void;
}

export function EditTransactionModal({ transaction, onClose, onSave }: EditTransactionModalProps) {
    const [amount, setAmount] = useState(transaction.amount.toString());

    // Convert ISO date to YYYY-MM-DD
    const dateObj = new Date(transaction.date);
    const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const [date, setDate] = useState(localDate);

    const [desc, setDesc] = useState(transaction.desc);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">
                        Edit Transaction
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
                        <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-xl font-semibold focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Description / Notes</label>
                        <textarea
                            rows={3}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors resize-none shadow-sm"
                        ></textarea>
                    </div>
                    {transaction.counterpartyId && (
                        <div className="text-xs font-semibold text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
                            This is part of a P2P Transfer. Editing this will safely update the mirrored transaction on the other customer's account instantly.
                        </div>
                    )}
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
                            const num = Number(amount);
                            if (num <= 0 || isNaN(num)) {
                                alert("Please enter a valid positive amount.");
                                return;
                            }
                            if (!date) {
                                alert("Please select a date.");
                                return;
                            }
                            onSave(num, date, desc);
                            onClose();
                        }}
                        className={`flex-1 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm bg-blue-600 hover:bg-blue-700 text-white`}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
