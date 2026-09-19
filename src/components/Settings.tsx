import { Save } from 'lucide-react';
import { useAppContext } from '../store';
import { useState } from 'react';

export function Settings() {
    const { companyName, setCompanyName } = useAppContext();
    const [name, setName] = useState(companyName);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setCompanyName(name);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization Details</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company / Organization Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="E.g. Acme Corp"
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">This name will appear on exported PDFs and WhatsApp messages.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                    {saved && <span className="text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Saved successfully!</span>}
                </div>
            </div>
        </div>
    );
}
