import { useState } from 'react';
import { X, Calendar, Download, FileText } from 'lucide-react';
import { useAppContext } from '../../store';
import { generateConfirmationPDF } from '../../utils/pdf';
import { SearchableSelect } from '../common/SearchableSelect';

export function ConfirmationReportModal({ isOpen, onClose, customerId }: { isOpen: boolean, onClose: () => void, customerId?: string }) {
    const { customers, transactions, companyName } = useAppContext();
    const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [counterpartyId, setCounterpartyId] = useState('');

    if (!isOpen) return null;

    const customer = customers.find(c => c.id === selectedCustomerId);

    const handleGenerate = () => {
        if (!customer) {
            alert('Please select a target Customer (To).');
            return;
        }
        if (!fromDate || !toDate) {
            alert('Please select both From and To dates.');
            return;
        }

        const startTimestamp = new Date(fromDate).getTime();
        const endTimestamp = new Date(toDate).getTime() + 86399000; // end of day

        // Filter transactions for this customer
        let filtered = transactions.filter(t => t.customerId === selectedCustomerId);

        // Apply counterparty filter
        if (counterpartyId) {
            filtered = filtered.filter(t => t.counterpartyId === counterpartyId);
        }

        let openingBalance = 0;
        const periodTransactions: typeof transactions = [];

        filtered.forEach(t => {
            const tTime = new Date(t.date).getTime();
            if (tTime < startTimestamp) {
                // Before period - calculate opening balance
                const change = t.type === 'credit' ? t.amount : -t.amount;
                openingBalance += change;
            } else if (tTime <= endTimestamp) {
                // In period
                periodTransactions.push(t);
            }
        });

        // Ensure chronological order
        periodTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const counterpartyObj = counterpartyId ? customers.find(c => c.id === counterpartyId) : undefined;

        const doc = generateConfirmationPDF(
            counterpartyObj ? counterpartyObj.name : (companyName || 'Daybook / Cashbook Demo'),
            counterpartyObj ? (counterpartyObj.address || '') : '',
            customer,
            { from: fromDate, to: toDate },
            periodTransactions,
            openingBalance
        );

        doc.save(`Confirmation_of_Accounts_${customer.name}_${fromDate}_to_${toDate}.pdf`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-500" /> Generate Confirmation
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Customer (To)</label>
                        <SearchableSelect
                            options={customers}
                            value={selectedCustomerId}
                            onChange={setSelectedCustomerId}
                            placeholder="Select Target Customer..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Counterparty (From)</label>
                        <SearchableSelect
                            options={[{ id: '', name: `All Transactions (or standard ${companyName || 'Company'})` }, ...customers.filter(c => c.id !== selectedCustomerId)]}
                            value={counterpartyId}
                            onChange={setCounterpartyId}
                            placeholder="Select Counterparty..."
                        />
                        <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                            If selected, restricts the report to transactions specifically with this customer. Older records might not be visible.
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleGenerate} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                        <Download size={16} /> Generate PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
