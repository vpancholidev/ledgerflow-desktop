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

function AppContent() {
  const { isLoaded, companyName, setCompanyName } = useAppContext();

  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [isLicensed, setIsLicensed] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);

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

  if (!isLoaded || !authCheckDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium tracking-wide">Booting Secure Local Database...</div>
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
      <Shell currentTab={currentTab} onTabChange={setCurrentTab}>
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
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-4 border-emerald-600 rounded-br-2xl" />
            </div>
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
