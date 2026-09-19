import React, { createContext, useContext, useState } from 'react';

export type Transaction = {
    id: string;
    customerId: string | null;
    type: 'credit' | 'debit';
    amount: number;
    date: string;
    desc: string;
};

export type Customer = {
    id: string;
    name: string;
    phone: string;
    address: string;
    idProof?: string;
    notes?: string;
    documents?: string[];
    balance: number;
};

type AppState = {
    companyName: string;
    setCompanyName: (name: string) => void;
    customers: Customer[];
    transactions: Transaction[];
    addCustomer: (c: Omit<Customer, 'id' | 'balance'>) => void;
    addTransaction: (t: Omit<Transaction, 'id' | 'balanceAfter'>) => void;
    transferBetweenCustomers: (fromId: string, toId: string, amount: number, date: string, desc: string) => void;
};

const initialState: AppState = {
    companyName: '',
    setCompanyName: () => { },
    customers: [
        { id: '1', name: 'Alice Smith', phone: '+91 9876543210', address: 'Mumbai, MH', balance: 15000 },
        { id: '2', name: 'Bob Builder', phone: '+91 8765432109', address: 'Pune, MH', balance: -3500 },
    ],
    transactions: [
        { id: '1', customerId: '1', type: 'debit', amount: 30000, date: new Date(Date.now() - 86400000 * 2).toISOString(), desc: 'Project Advance' },
        { id: '2', customerId: '1', type: 'credit', amount: 15000, date: new Date().toISOString(), desc: 'Part Payment Received' },
    ],
    addCustomer: () => { },
    addTransaction: () => { },
    transferBetweenCustomers: () => { },
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [companyName, setCompany] = useState(initialState.companyName);
    const [customers, setCustomers] = useState<Customer[]>(initialState.customers);
    const [transactions, setTransactions] = useState<Transaction[]>(initialState.transactions);

    const addCustomer = (c: Omit<Customer, 'id' | 'balance'>) => {
        setCustomers(prev => [...prev, { ...c, id: Date.now().toString(), balance: 0 }]);
    };

    const addTransaction = (t: Omit<Transaction, 'id' | 'balanceAfter'>) => {
        const newTx = { ...t, id: Date.now().toString() + Math.random() };
        setTransactions(prev => [...prev, newTx]);

        if (t.customerId) {
            setCustomers(prev => prev.map(c => {
                if (c.id === t.customerId) {
                    const change = t.type === 'debit' ? t.amount : -t.amount;
                    return { ...c, balance: c.balance + change };
                }
                return c;
            }));
        }
    };

    const transferBetweenCustomers = (fromId: string, toId: string, amount: number, date: string, desc: string) => {
        const tx1: Omit<Transaction, 'id' | 'balanceAfter'> = {
            customerId: fromId,
            type: 'credit',
            amount,
            date,
            desc: `Transfer out: ${desc}`
        };
        const tx2: Omit<Transaction, 'id' | 'balanceAfter'> = {
            customerId: toId,
            type: 'debit',
            amount,
            date,
            desc: `Transfer in: ${desc}`
        };

        addTransaction(tx1);
        setTimeout(() => addTransaction(tx2), 10);
    };

    return (
        <AppContext.Provider value={{
            companyName, setCompanyName: setCompany,
            customers, transactions,
            addCustomer, addTransaction, transferBetweenCustomers
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
