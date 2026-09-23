import React, { createContext, useContext, useState, useEffect } from 'react';

export type Transaction = {
    id: string;
    customerId: string | null;
    counterpartyId?: string;
    type: 'credit' | 'debit';
    amount: number;
    date: string;
    desc: string;
};

export type Customer = {
    id: string;
    customerNo: string;
    name: string;
    phone: string;
    address: string;
    idProof?: string;
    notes?: string;
    documents?: string[];
    balance: number;
};

type AppState = {
    isLoaded: boolean;
    companyName: string;
    setCompanyName: (name: string) => void;
    customers: Customer[];
    transactions: Transaction[];
    addCustomer: (c: Omit<Customer, 'id' | 'balance'>) => Promise<void>;
    updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'balance'>>) => Promise<void>;
    addTransaction: (t: Omit<Transaction, 'id' | 'balanceAfter'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'balanceAfter'>>) => Promise<void>;
    transferBetweenCustomers: (fromId: string, toId: string, amount: number, date: string, desc: string) => Promise<void>;
    refreshData: () => Promise<void>;
};

const initialState: AppState = {
    isLoaded: false,
    companyName: '',
    setCompanyName: () => { },
    customers: [],
    transactions: [],
    addCustomer: async () => { },
    updateCustomer: async () => { },
    addTransaction: async () => { },
    deleteTransaction: async () => { },
    updateTransaction: async () => { },
    transferBetweenCustomers: async () => { },
    refreshData: async () => { },
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [companyName, setCompany] = useState('');
    const [rawCustomers, setRawCustomers] = useState<Omit<Customer, 'balance'>[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const refreshData = async () => {
        if (!window.electronAPI) return;
        try {
            const txs = await window.electronAPI.getTransactions();
            const custs = await window.electronAPI.getCustomers();
            const sets = await window.electronAPI.getSettings();

            const formattedTxs = txs.map((t: any) => ({
                ...t,
                date: new Date(t.date).toISOString()
            }));

            const formattedCusts = custs.map((c: any) => ({
                ...c,
                customerNo: c.customerNo || c.customer_no || ''
            }));

            setTransactions(formattedTxs);
            setRawCustomers(formattedCusts);

            const companySetting = sets.find((s: any) => s.key === 'companyName');
            if (companySetting) {
                setCompany(companySetting.value);
            }
        } catch (e) {
            console.error("Failed to load initial data", e);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        if (!window.electronAPI) {
            setIsLoaded(true);
            return;
        }
        refreshData();
    }, []);

    const setCompanyNameWrap = async (name: string) => {
        setCompany(name);
        if (window.electronAPI) {
            await window.electronAPI.saveSetting('companyName', name);
        }
    }

    const addCustomer = async (c: Omit<Customer, 'id' | 'balance'>) => {
        if (window.electronAPI) {
            try {
                const res = await window.electronAPI.addCustomer(c);
                const newId = (res && typeof res === 'object') ? (res as any).id : res;
                const setNo = (res && typeof res === 'object') ? (res as any).customerNo : c.customerNo;
                setRawCustomers(prev => [...prev, { ...c, id: newId, customerNo: setNo }]);
            } catch (err: any) {
                alert('DB Error (Customer): ' + err.message);
                console.error(err);
            }
        } else { alert('Bridge missing! Please make sure you are testing inside the actual LedgerFlow Desktop App window that popped up, and NOT your standard Web Browser (Chrome/Edge)!'); }
    };

    const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'balance'>>) => {
        if (window.electronAPI) {
            try {
                await window.electronAPI.updateCustomer(id, data);
                setRawCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
            } catch (err: any) {
                alert('DB Error (Update Customer): ' + err.message);
            }
        }
    };

    const addTransaction = async (t: Omit<Transaction, 'id' | 'balanceAfter'>) => {
        if (window.electronAPI) {
            try {
                const newId = await window.electronAPI.addTransaction(t);
                setTransactions(prev => [...prev, { ...t, id: newId } as Transaction]);
            } catch (err: any) {
                alert('DB Error (Txn): ' + err.message);
                console.error(err);
            }
        } else { alert('Bridge missing! Desktop Window Required.'); }
    };

    const deleteTransaction = async (id: string) => {
        if (window.electronAPI) {
            try {
                await window.electronAPI.deleteTransaction?.(id);
                // Also trigger a refresh to properly clear mirrors, but realistically we can just refresh everything
                refreshData();
            } catch (err: any) { alert('Delete Error: ' + err.message); }
        }
    };

    const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id' | 'balanceAfter'>>) => {
        if (window.electronAPI) {
            try {
                await window.electronAPI.updateTransaction?.(id, data);
                refreshData(); // Refresh catches any mirrored transfer edits seamlessly
            } catch (err: any) { alert('Update Error: ' + err.message); }
        }
    };

    const transferBetweenCustomers = async (fromId: string, toId: string, amount: number, date: string, desc: string) => {
        const tx1: Omit<Transaction, 'id' | 'balanceAfter'> = {
            customerId: fromId,
            counterpartyId: toId,
            type: 'debit',
            amount,
            date,
            desc: `Transfer out: ${desc}`
        };
        const tx2: Omit<Transaction, 'id' | 'balanceAfter'> = {
            customerId: toId,
            counterpartyId: fromId,
            type: 'credit',
            amount,
            date,
            desc: `Transfer in: ${desc}`
        };

        if (window.electronAPI) {
            try {
                const id1 = await window.electronAPI.addTransaction(tx1);
                const id2 = await window.electronAPI.addTransaction(tx2);
                setTransactions(prev => [...prev, { ...tx1, id: id1 } as Transaction, { ...tx2, id: id2 } as Transaction]);
            } catch (err: any) {
                alert('DB Error (Transfer): ' + err.message);
            }
        }
    };

    // Compute balances dynamically
    const customersWithBalances = rawCustomers.map(c => {
        let balance = 0;
        transactions.forEach(t => {
            if (t.customerId === c.id) {
                const change = t.type === 'credit' ? t.amount : -t.amount;
                balance += change;
            }
        });
        return { ...c, balance };
    });

    return (
        <AppContext.Provider value={{
            isLoaded,
            companyName, setCompanyName: setCompanyNameWrap,
            customers: customersWithBalances,
            transactions,
            addCustomer, updateCustomer, addTransaction, deleteTransaction, updateTransaction, transferBetweenCustomers, refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
