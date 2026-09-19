import { ArrowLeft, Edit, FileText, Phone, MapPin, CreditCard, StickyNote, Folder } from 'lucide-react';
import { useAppContext } from '../store';

export function CustomerDetails({ customerId, onBack }: { customerId: string | null, onBack?: () => void }) {
    const { customers } = useAppContext();

    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-slate-500 mb-4">Customer not found or not selected.</div>
                <button onClick={onBack} className="text-emerald-600 font-medium hover:underline cursor-pointer">Go back</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer shadow-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        {customer.name}
                    </h1>
                    <div className="text-slate-500 text-sm mt-1">Customer Profile Details</div>
                </div>
                <div className="ml-auto text-right flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                        <Edit size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
                            <Phone size={16} /> Phone Number
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{customer.phone}</div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
                            <CreditCard size={16} /> ID Proof Reference
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{customer.idProof || 'Not provided'}</div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                        <MapPin size={16} /> Full Address
                    </div>
                    <div className="text-base text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[80px]">
                        {customer.address}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                        <StickyNote size={16} /> Internal Notes
                    </div>
                    <div className="text-base text-slate-800 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50 min-h-[100px] whitespace-pre-wrap">
                        {customer.notes || <span className="text-slate-400 italic">No internal notes added.</span>}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-3 text-sm font-medium">
                        <Folder size={16} /> Attached Documents
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        {(customer.documents && customer.documents.length > 0) ? (
                            customer.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all">
                                    <div className="bg-slate-100 p-2 rounded text-slate-500">
                                        <FileText size={20} />
                                    </div>
                                    <span className="font-medium text-slate-700 text-sm truncate max-w-[200px]">{doc}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 italic text-sm py-2">No documents attached.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
