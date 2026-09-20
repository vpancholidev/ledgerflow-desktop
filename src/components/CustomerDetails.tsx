import { useState } from 'react';
import { ArrowLeft, Edit, FileText, Phone, MapPin, CreditCard, StickyNote, Folder, Check, X, UploadCloud } from 'lucide-react';
import { useAppContext } from '../store';

export function CustomerDetails({ customerId, onBack }: { customerId: string | null, onBack?: () => void }) {
    const { customers, updateCustomer } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);

    const customer = customers.find(c => c.id === customerId);

    const [editData, setEditData] = useState({
        customerNo: '', name: '', phone: '', address: '', idProof: '', notes: '', documents: [] as string[]
    });

    if (!customer) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-slate-500 mb-4">Customer not found or not selected.</div>
                <button onClick={onBack} className="text-emerald-600 font-medium hover:underline cursor-pointer">Go back</button>
            </div>
        );
    }

    const handleEditClick = () => {
        setEditData({
            customerNo: customer.customerNo || '',
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            idProof: customer.idProof || '',
            notes: customer.notes || '',
            documents: customer.documents || []
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (editData.name && editData.phone && editData.address) {
            updateCustomer(customer.id, editData);
            setIsEditing(false);
        } else {
            alert('Name, Phone, and Address are required!');
        }
    };

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
                    {isEditing ? (
                        <div className="flex flex-col gap-1">
                            <input
                                value={editData.customerNo}
                                onChange={(e) => setEditData({ ...editData, customerNo: e.target.value })}
                                placeholder="Customer ID"
                                className="text-sm font-bold text-slate-500 border-b-2 border-slate-200 focus:outline-none bg-transparent"
                            />
                            <input
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                className="text-2xl font-bold text-slate-900 border-b-2 border-emerald-500 focus:outline-none bg-transparent"
                            />
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            {customer.customerNo && <span className="text-slate-400 font-mono text-lg px-2 py-1 bg-slate-100 rounded">{customer.customerNo}</span>}
                            {customer.name}
                        </h1>
                    )}
                    <div className="text-slate-500 text-sm mt-1">Customer Profile Details</div>
                </div>

                <div className="ml-auto text-right flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-slate-500 font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                <X size={16} /> Cancel
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                                <Check size={16} /> Save Profile
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEditClick} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                            <Phone size={16} /> Phone Number
                        </div>
                        {isEditing ? (
                            <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full text-lg border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500" />
                        ) : (
                            <div className="text-lg font-semibold text-slate-900">{customer.phone}</div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                            <CreditCard size={16} /> ID Proof Reference
                        </div>
                        {isEditing ? (
                            <input value={editData.idProof} onChange={(e) => setEditData({ ...editData, idProof: e.target.value })} className="w-full text-lg border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500" />
                        ) : (
                            <div className="text-lg font-semibold text-slate-900">{customer.idProof || 'Not provided'}</div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                        <MapPin size={16} /> Full Address
                    </div>
                    {isEditing ? (
                        <textarea value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="w-full text-base border border-slate-200 rounded-lg p-3 min-h-[80px] focus:outline-none focus:border-emerald-500" />
                    ) : (
                        <div className="text-base text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[80px]">
                            {customer.address}
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm font-medium">
                        <StickyNote size={16} /> Internal Notes
                    </div>
                    {isEditing ? (
                        <textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="w-full text-base border border-emerald-200 rounded-lg p-3 min-h-[100px] bg-emerald-50/30 focus:outline-none focus:border-emerald-500" />
                    ) : (
                        <div className="text-base text-slate-800 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50 min-h-[100px] whitespace-pre-wrap">
                            {customer.notes || <span className="text-slate-400 italic">No internal notes added.</span>}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <Folder size={16} /> Attached Documents
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mb-4">
                            <div className="flex items-center gap-4 mb-2">
                                <button
                                    onClick={async () => {
                                        if (window.electronAPI) {
                                            const allowance = 2 - editData.documents.length;
                                            if (allowance <= 0) {
                                                alert("Maximum 2 documents are allowed total.");
                                                return;
                                            }
                                            const newlySavedDocs = await window.electronAPI.selectFiles(allowance);
                                            if (newlySavedDocs && newlySavedDocs.length > 0) {
                                                setEditData({ ...editData, documents: [...editData.documents, ...newlySavedDocs] });
                                            }
                                        } else {
                                            alert("Bridge Missing! Native File Uploader requires Desktop App Sandbox.");
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer transition-colors border border-slate-200"
                                >
                                    <UploadCloud size={18} />
                                    <span>Browse / Add More Files</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 flex-wrap">
                        {((isEditing ? editData.documents : (customer.documents || [])) || []).length > 0 ? (
                            (isEditing ? editData.documents : (customer.documents || [])).map((doc, idx) => (
                                <div key={idx}
                                    onClick={() => {
                                        if (!isEditing && window.electronAPI) {
                                            window.electronAPI.openFile(doc);
                                        }
                                    }}
                                    title={!isEditing ? "Click to open document" : ""}
                                    className={`flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-emerald-500 transition-all ${!isEditing ? 'cursor-pointer hover:shadow-md hover:bg-emerald-50/50' : ''}`}
                                >
                                    <div className="bg-slate-100 p-2 rounded text-slate-500">
                                        <FileText size={20} />
                                    </div>
                                    <span className="font-medium text-slate-700 text-sm truncate max-w-[200px]">{doc}</span>
                                    {isEditing && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newDocs = editData.documents.filter((_, i) => i !== idx);
                                                setEditData({ ...editData, documents: newDocs });
                                            }}
                                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
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
