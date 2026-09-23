import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ActivationScreen({ onActivated }: { onActivated: () => void }) {
    const [machineId, setMachineId] = useState('LOADING...');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getMachineId().then(setMachineId);
        }
    }, []);

    const handleActivate = async () => {
        setError('');
        if (!window.electronAPI) return;
        const success = await window.electronAPI.activateLicense(key);
        if (success) {
            onActivated();
        } else {
            setError('Invalid License Key. Please verify with your provider.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-sm" />

                <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Software Not Activated</h1>
                <p className="text-slate-500 text-center mb-8 text-sm">
                    This software is legally bound to your hardware. Please send your Machine ID to your administrator to receive an activation key.
                </p>

                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Machine ID</div>
                    <div className="text-xl font-mono font-bold text-slate-800 tracking-widest">{machineId}</div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Enter License Key</label>
                    <input
                        type="text"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors uppercase font-mono tracking-wider text-center"
                    />
                    {error && <div className="text-red-500 text-sm mt-2 flex items-center gap-1 justify-center"><AlertTriangle size={14} /> {error}</div>}
                </div>

                <button
                    onClick={handleActivate}
                    disabled={key.length < 16}
                    className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Activate License
                </button>
            </div>
        </div>
    );
}

export function CreatePinScreen({ onCreated }: { onCreated: () => void }) {
    const [pin, setPin] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleCreate = async () => {
        if (pin !== confirm) {
            alert("PINs do not match!");
            return;
        }
        if (pin.length < 4) {
            alert("PIN must be at least 4 digits.");
            return;
        }
        if (window.electronAPI) {
            await window.electronAPI.setPin(pin);
            onCreated();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full text-center">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-sm" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Security PIN</h1>
                <p className="text-slate-500 mb-8 text-sm">Create a daily PIN to prevent unauthorized staff from accessing your documents.</p>

                <input type="password" placeholder="4-Digit PIN" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-widest text-2xl bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-emerald-500" />
                <input type="password" placeholder="Confirm PIN" maxLength={4} value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-widest text-2xl bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-8 focus:outline-none focus:border-emerald-500" />

                <button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    Save PIN
                </button>
            </div>
        </div>
    );
}

export function EnterPinScreen({ onUnlocked, onReset }: { onUnlocked: () => void, onReset: () => void }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetKey, setResetKey] = useState('');
    const [resetError, setResetError] = useState('');

    const handleUnlock = async () => {
        if (window.electronAPI) {
            const valid = await window.electronAPI.verifyPin(pin);
            if (valid) {
                onUnlocked();
            } else {
                setError(true);
                setPin('');
            }
        }
    };

    const handleReset = async () => {
        if (window.electronAPI) {
            const success = await window.electronAPI.resetPinViaLicense(resetKey);
            if (success) {
                onReset(); // Force app back to "CreatePIN" status!
            } else {
                setResetError("Invalid License Key!");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-sm" />
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">LedgerFlow Secured</h1>

                {isResetMode ? (
                    <>
                        <p className="text-slate-500 mb-6 text-sm">Enter your Master License Key to wipe your PIN.</p>
                        <input
                            type="text"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            value={resetKey}
                            onChange={e => { setResetKey(e.target.value); setResetError(''); }}
                            className={`w-full text-center tracking-widest bg-slate-50 border ${resetError ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-3 mb-4 focus:outline-none uppercase font-mono`}
                        />
                        {resetError && <div className="text-red-500 text-sm mb-4">{resetError}</div>}
                        <button onClick={handleReset} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors mb-3">
                            Confirm Wipe PIN
                        </button>
                        <button onClick={() => setIsResetMode(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium">
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-slate-500 mb-8 text-sm">Enter your PIN to access your ledgers.</p>
                        <input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            value={pin}
                            onChange={e => {
                                setPin(e.target.value.replace(/\D/g, ''));
                                setError(false);
                                if (e.target.value.length === 4) {
                                    setTimeout(() => document.getElementById('unlock-btn')?.click(), 50);
                                }
                            }}
                            className={`w-full text-center tracking-widest text-3xl bg-slate-50 border ${error ? 'border-red-500 text-red-500' : 'border-slate-200 text-slate-900'} rounded-lg px-4 py-4 mb-6 focus:outline-none focus:border-slate-900 transition-colors`}
                            autoFocus
                        />
                        <button id="unlock-btn" onClick={handleUnlock} className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors mb-4">
                            Unlock App
                        </button>
                        <button onClick={() => setIsResetMode(true)} className="text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors cursor-pointer">
                            Forgot your PIN?
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
