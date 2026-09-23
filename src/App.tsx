import { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './store'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './components/Dashboard'
import { Customers } from './components/Customers'
import { Passbook } from './components/Passbook'
import { Daybook } from './components/Daybook'
import { Settings } from './components/Settings'
import { CustomerDetails } from './components/CustomerDetails'
import { ActivationScreen, CreatePinScreen, EnterPinScreen } from './components/AuthScreens'
import { ConfirmationReportModal } from './components/modals/ConfirmationReportModal'

function AppContent() {
  const { isLoaded, companyName, setCompanyName, refreshData } = useAppContext();

  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isGlobalReportModalOpen, setIsGlobalReportModalOpen] = useState(false);

  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [isLicensed, setIsLicensed] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  // Immersive Splash Screen Timeout
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Force the splash animation to run for at least 2.8 seconds
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAuthStatus().then(status => {
        setIsLicensed(status.isLicensed);
        setHasPin(status.hasPin);
        setAuthCheckDone(true);
      });
    } else {
      // Fallback bypass for browser testing
      setIsLicensed(true);
      setPinUnlocked(true);
      setAuthCheckDone(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      refreshData();
    }
  }, [currentTab, isLoaded]);

  // Onboarding states
  const [onboardName, setOnboardName] = useState('');

  const navigateToPassbook = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentTab('Passbook');
  };

  const navigateToCustomerDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentTab('CustomerDetails');
  };

  if (!isLoaded || !authCheckDone || showSplash) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden relative select-none">
        {/* Ambient Dark Glow */}
        <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>

        {/* Core Animated Logo Cluster */}
        <div className="relative z-10 flex flex-col items-center animate-[pulse_2s_ease-in-out_infinite]">
          <img src="/logo.png" alt="LedgerFlow Logo" className="w-32 h-32 object-contain mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3 drop-shadow-lg">
            Ledger<span className="text-emerald-400">Flow</span>
          </h1>
          <p className="text-emerald-200/60 font-semibold tracking-widest text-xs uppercase letter">
            {authCheckDone ? 'Starting Interface...' : 'Booting Financial Engine...'}
          </p>
        </div>

        {/* Progressive Load Bar */}
        <div className="absolute bottom-20 w-64 h-1 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgb(16,185,129)]" style={{ animation: "progress 2.8s ease-in-out forwards" }} />
        </div>

        {/* Agency Branding Footer */}
        <div className="absolute bottom-6 flex flex-col items-center opacity-0" style={{ animation: "fadeUpIn 1.2s ease-out 0.8s forwards" }}>
          <span className="text-emerald-500/50 text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5">Developed By</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-white to-slate-300 font-bold tracking-widest text-sm drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            CODCLAW TECHNOLOGIES
          </span>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes progress {
                0% { width: 0%; opacity: 0; }
                10% { opacity: 1; }
                50% { width: 60%; }
                80% { width: 90%; }
                100% { width: 100%; opacity: 0; }
            }
            @keyframes fadeUpIn {
                0% { transform: translateY(15px) scale(0.95); opacity: 0; filter: blur(4px); }
                100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
            }
        `}} />
      </div>
    );
  }

  if (!isLicensed) {
    return <ActivationScreen onActivated={() => setIsLicensed(true)} />
  }

  if (!hasPin) {
    return <CreatePinScreen onCreated={() => setHasPin(true)} />
  }

  if (!pinUnlocked) {
    return <EnterPinScreen onUnlocked={() => setPinUnlocked(true)} onReset={() => setHasPin(false)} />
  }

  return (
    <>
      <Shell currentTab={currentTab} onTabChange={setCurrentTab} onOpenReport={() => setIsGlobalReportModalOpen(true)}>
        {currentTab === 'Dashboard' && <Dashboard />}
        {currentTab === 'Customers' && (
          <Customers
            onSelectCustomer={navigateToPassbook}
            onViewDetails={navigateToCustomerDetails}
          />
        )}
        {currentTab === 'Passbook' && (
          <Passbook
            customerId={selectedCustomerId}
            onBack={() => setCurrentTab('Customers')}
          />
        )}
        {currentTab === 'CustomerDetails' && (
          <CustomerDetails
            customerId={selectedCustomerId}
            onBack={() => setCurrentTab('Customers')}
          />
        )}
        {currentTab === 'Daybook' && <Daybook />}
        {currentTab === 'Settings' && <Settings />}
      </Shell>

      {/* Onboarding Overlay */}
      {(!companyName) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8 text-center">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to LedgerFlow!</h2>
            <p className="text-slate-500 mb-8">Let's set up your business. Enter your company or organization name to continue.</p>

            <div className="text-left mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1">Company Name</label>
              <input
                type="text"
                value={onboardName}
                onChange={e => setOnboardName(e.target.value)}
                placeholder="e.g. Reliance Industries"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-emerald-500"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && onboardName.trim()) {
                    setCompanyName(onboardName.trim());
                  }
                }}
              />
            </div>

            <button
              disabled={!onboardName.trim()}
              onClick={() => setCompanyName(onboardName.trim())}
              className="w-full bg-emerald-600 disabled:bg-slate-300 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-sm transition-colors text-lg cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      <ConfirmationReportModal
        isOpen={isGlobalReportModalOpen}
        onClose={() => setIsGlobalReportModalOpen(false)}
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
