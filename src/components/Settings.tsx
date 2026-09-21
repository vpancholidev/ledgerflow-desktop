import { Save, Cloud, Loader2, DownloadCloud, RefreshCw } from 'lucide-react';
import { useAppContext } from '../store';
import { useState, useEffect } from 'react';

export function Settings() {
    const { companyName, setCompanyName } = useAppContext();
    const [name, setName] = useState(companyName);
    const [saved, setSaved] = useState(false);

    // Supabase States
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    // OTA Updater States
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'downloading' | 'ready' | 'error' | 'no-update'>('idle');
    const [updateVersion, setUpdateVersion] = useState('');
    const [updateProgress, setUpdateProgress] = useState(0);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getSupabaseConfig().then(config => {
                setSupabaseUrl(config.url);
                setSupabaseKey(config.key);
            });

            // Initialize Auto-Updater Listeners once
            window.electronAPI.onUpdateAvailable((info) => {
                setUpdateStatus('downloading');
                setUpdateVersion(info.version || 'New Patch');
            });
            window.electronAPI.onUpdateNotAvailable(() => {
                setUpdateStatus('no-update');
            });
            window.electronAPI.onUpdateProgress((p) => {
                setUpdateProgress(Math.round(p.percent || 0));
            });
            window.electronAPI.onUpdateDownloaded(() => {
                setUpdateStatus('ready');
            });
            window.electronAPI.onUpdateError(() => {
                setUpdateStatus('error');
            });
        }
    }, []);

    const handleCheckUpdate = async () => {
        if (!window.electronAPI) return;
        setUpdateStatus('checking');
        setUpdateProgress(0);
        try {
            const res = await window.electronAPI.checkForUpdates();
            if (res && res.error === 'DEV_MODE') {
                alert("OTA Updater is disabled during local development. You must build the .exe to test this!");
                setUpdateStatus('idle');
                return;
            }
            if (res && res.error) {
                setUpdateStatus('error');
            }
        } catch {
            setUpdateStatus('error');
        }
    };

    const handleInstallUpdate = async () => {
        if (!window.electronAPI) return;
        await window.electronAPI.installUpdate();
    }

    const handleSave = async () => {
        setCompanyName(name);
        if (window.electronAPI) {
            await window.electronAPI.saveSupabaseConfig({ url: supabaseUrl, key: supabaseKey });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    const handleBackup = async () => {
        if (!supabaseUrl || !supabaseKey) {
            alert("Please enter Supabase URL and Key first.");
            return;
        }

        // Auto-save the keys so the background task has them when the app closes!
        if (window.electronAPI) {
            await window.electronAPI.saveSupabaseConfig({ url: supabaseUrl, key: supabaseKey });
        }

        setIsSyncing(true);
        setSyncMessage('');
        try {
            const result = await window.electronAPI?.backupToCloud({ url: supabaseUrl, key: supabaseKey });
            if (result?.success) {
                setSyncMessage('Backup completed successfully!');
            } else {
                setSyncMessage('Error: ' + result?.error);
            }
        } catch (e: any) {
            setSyncMessage('Upload Error: ' + e.message);
        }
        setIsSyncing(false);
        setTimeout(() => setSyncMessage(''), 5000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col overflow-y-auto pb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization Details</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company / Organization Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="E.g. Acme Corp"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
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

            {/* CLOUD BACKUP SECTION */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl border-t-[4px] border-t-emerald-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><Cloud size={20} /></div>
                    <h2 className="text-lg font-semibold text-slate-900">Cloud Backup Integration (Supabase)</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">
                    Configure your free Supabase bucket to automatically sync your local SQLite database and client files securely to the cloud. Make sure the storage bucket is named <b>backups</b>.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Supabase Project URL</label>
                    <input
                        type="text"
                        value={supabaseUrl}
                        onChange={e => setSupabaseUrl(e.target.value)}
                        placeholder="https://xxxxxx.supabase.co"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm font-mono text-sm"
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Supabase Anon Key</label>
                    <input
                        type="password"
                        value={supabaseKey}
                        onChange={e => setSupabaseKey(e.target.value)}
                        placeholder="eyJhb..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 shadow-sm font-mono text-xs tracking-wider"
                    />
                </div>

                <button
                    onClick={handleBackup}
                    disabled={isSyncing}
                    className="flex w-full justify-center items-center gap-2 bg-slate-900 hover:bg-black text-white font-medium px-4 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-75 shadow-sm"
                >
                    {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />}
                    {isSyncing ? 'Syncing securely to Cloud...' : 'Force Backup to Cloud Now'}
                </button>

                {syncMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm border font-medium ${syncMessage.includes('Error') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {syncMessage}
                    </div>
                )}
            </div>

            {/* SOFTWARE UPDATES SECTION */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl mb-12 border-t-[4px] border-t-indigo-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><DownloadCloud size={20} /></div>
                    <h2 className="text-lg font-semibold text-slate-900">Software Updates (OTA)</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">
                    Ensure your application is running the latest security patches and features natively.
                </p>

                {updateStatus === 'idle' || updateStatus === 'error' || updateStatus === 'no-update' ? (
                    <button
                        onClick={handleCheckUpdate}
                        className="flex w-full justify-center items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-3 rounded-lg transition-colors cursor-pointer border border-indigo-200"
                    >
                        <RefreshCw size={18} className={updateStatus === 'error' ? "text-red-500" : ""} />
                        {updateStatus === 'error' ? "Connection Error - Retry Update Check" :
                            updateStatus === 'no-update' ? "You are on the latest version! (Check Again)" :
                                "Check for Updates"}
                    </button>
                ) : updateStatus === 'checking' ? (
                    <button disabled className="flex w-full justify-center items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 font-medium px-4 py-3 rounded-lg cursor-not-allowed">
                        <Loader2 size={18} className="animate-spin" />
                        checking updates...
                    </button>
                ) : updateStatus === 'downloading' ? (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                            <span>Downloading {updateVersion}...</span>
                            <span>{updateProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${updateProgress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallUpdate}
                        className="flex w-full justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 rounded-lg transition-colors cursor-pointer shadow-sm animate-pulse"
                    >
                        <DownloadCloud size={18} />
                        Install Update Now & Restart!
                    </button>
                )}
            </div>
        </div>
    );
}
