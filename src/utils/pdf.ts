import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Customer } from '../store';

export const generateDaybookPDF = (
    companyName: string,
    transactions: Transaction[],
    customers: Customer[],
    totals: { credits: number, debits: number, net: number }
) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(companyName || 'Daybook', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Rojmel / Day Book Summary`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    // Totals Section
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Credits: Rs. ${totals.credits.toLocaleString()}`, 14, 48);
    doc.text(`Total Debits: Rs. ${totals.debits.toLocaleString()}`, 70, 48);
    doc.text(`Net Change: Rs. ${totals.net.toLocaleString()}`, 130, 48);

    // Table
    const tableData = transactions.map(t => {
        const c = customers.find(x => x.id === t.customerId);
        const namePart = c ? ` - ${c.name}` : '';
        const dateStr = new Date(t.date).toLocaleDateString() + ' ' + new Date(t.date).toLocaleTimeString();

        return [
            dateStr,
            t.desc + namePart,
            t.type === 'debit' ? t.amount.toLocaleString() : '-',
            t.type === 'credit' ? t.amount.toLocaleString() : '-'
        ];
    });

    autoTable(doc, {
        startY: 55,
        head: [['Date / Time', 'Particulars', 'Debit (Rs)', 'Credit (Rs)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
        styles: { fontSize: 9 }
    });

    return doc;
};

export const generatePassbookPDF = (
    companyName: string,
    customer: Customer,
    transactions: { date: string; desc: string; type: string; amount: number; runningBalance: number }[]
) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(companyName || 'Account Statement', 14, 22);

    doc.setFontSize(12);
    doc.text(`Customer: ${customer.name}`, 14, 32);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Phone: ${customer.phone}`, 14, 38);
    if (customer.address) doc.text(`Address: ${customer.address}`, 14, 44);

    const balText = customer.balance < 0 ? `To Pay: Rs. ${Math.abs(customer.balance).toLocaleString()}` :
        `To Receive: Rs. ${Math.abs(customer.balance).toLocaleString()}`;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Current Balance: ${balText}`, 130, 32);

    // Table
    const tableData = transactions.map(t => {
        return [
            new Date(t.date).toLocaleDateString(),
            t.desc,
            t.type === 'credit' ? t.amount.toLocaleString() : '-',
            t.type === 'debit' ? t.amount.toLocaleString() : '-',
            (t.runningBalance < 0 ? '-' : (t.runningBalance > 0 ? '+' : '')) + Math.abs(t.runningBalance).toLocaleString()
        ];
    });

    autoTable(doc, {
        startY: 55,
        head: [['Date', 'Description', 'In (Credit)', 'Out (Debit)', 'Balance']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 }
    });

    return doc;
};
