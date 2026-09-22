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

export const generateConfirmationPDF = (
    companyName: string,
    companyAddress: string,
    customer: Customer,
    dateRange: { from: string, to: string },
    filteredTransactions: Transaction[],
    openingBalance: number
) => {
    const doc = new jsPDF();

    // Default dummy data matching the image if missing
    const senderCompany = companyName;
    const senderAddress = companyAddress;

    doc.setFontSize(9);

    // Top Left: To Customer
    doc.text(`To: ${customer.name}`, 14, 20);
    const customerAddrLines = doc.splitTextToSize(customer.address || 'Address Not Provided', 70);
    doc.text(customerAddrLines, 20, 24.5);

    // Top Right: From Company
    doc.text(`From: ${senderCompany}`, 100, 20);
    if (senderAddress) {
        const senderAddrLines = doc.splitTextToSize(senderAddress, 95);
        doc.text(senderAddrLines, 108, 24.5);
    }

    // Salutation
    doc.text(`Dear Sir/Madam,`, 14, 45);

    // Generation Date Map
    doc.text(`Date : ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-')}`, 160, 45);

    // Subject
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Sub: Confirmation of Accounts`, 105, 52, { align: 'center' });
    const fromStr = new Date(dateRange.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    const toStr = new Date(dateRange.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    doc.text(`${fromStr} to ${toStr}`, 105, 56, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    // Paragraphs
    doc.setFontSize(9);
    doc.text(`Given below is the details of your Accounts as standing in my/our Books of Accounts for the above mentioned period.`, 14, 65);

    const p2 = `Kindly return 3 copies stating your I.T. Permanent A/c No., duly signed and sealed, in confirmation of the same. Please note that if no reply is received from you within a fortnight, it will be assumed that you have accepted the balance shown below.`;
    const p2Lines = doc.splitTextToSize(p2, 180);
    doc.text(p2Lines, 14, 72);

    // Table Data Logic
    const debits: any[] = [];
    const credits: any[] = [];

    if (openingBalance > 0) {
        credits.push({ date: fromStr, desc: 'Opening Balance', amount: openingBalance });
    } else if (openingBalance < 0) {
        debits.push({ date: fromStr, desc: 'Opening Balance', amount: Math.abs(openingBalance) });
    }

    filteredTransactions.forEach(t => {
        const item = {
            date: new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
            desc: t.desc,
            amount: t.amount
        };
        if (t.type === 'debit') debits.push(item);
        else credits.push(item);
    });

    const totalDebits = debits.reduce((sum, d) => sum + d.amount, 0);
    const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0);

    const balanceDiff = totalCredits - totalDebits;
    let finalDebitTotal = totalDebits;
    let finalCreditTotal = totalCredits;

    if (balanceDiff > 0) {
        debits.push({ date: '', desc: 'Closing Balance', amount: balanceDiff, isClosing: true });
        finalDebitTotal += balanceDiff;
    } else if (balanceDiff < 0) {
        credits.push({ date: '', desc: 'Closing Balance', amount: Math.abs(balanceDiff), isClosing: true });
        finalCreditTotal += Math.abs(balanceDiff);
    }

    const maxRows = Math.max(debits.length, credits.length);
    const tableData = [];
    for (let i = 0; i < maxRows; i++) {
        const d = debits[i] || { date: '', desc: '', amount: '' };
        const c = credits[i] || { date: '', desc: '', amount: '' };

        let dDesc = d.desc;
        let cDesc = c.desc;
        if (d.isClosing) dDesc = { content: 'Closing Balance', styles: { halign: 'right', fontStyle: 'normal' } };
        if (c.isClosing) cDesc = { content: 'Closing Balance', styles: { halign: 'right', fontStyle: 'normal' } };

        tableData.push([
            d.date, dDesc, d.amount ? d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
            c.date, cDesc, c.amount ? c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''
        ]);
    }

    tableData.push([
        '', '', { content: finalDebitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } },
        '', '', { content: finalCreditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Date', 'Particulars', 'Debit Amount', 'Date', 'Particulars', 'Credit Amount']],
        body: tableData,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: false, textColor: 0, fontStyle: 'normal' },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 50 },
            2: { cellWidth: 25, halign: 'right' },
            3: { cellWidth: 20 },
            4: { cellWidth: 50 },
            5: { cellWidth: 25, halign: 'right' }
        },
        willDrawCell: function (data) {
            // Draw horizontal line below header
            if (data.row.section === 'head') {
                doc.setDrawColor(150);
                doc.setLineWidth(0.2);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
            }
            // Draw center vertical line
            if (data.column.index === 2) {
                doc.setDrawColor(150);
                doc.setLineWidth(0.2);
                doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
            }
            // Draw totals lines
            if (data.row.index === tableData.length - 1) { // Total Row
                doc.setDrawColor(0);
                doc.setLineWidth(0.2);
                if (data.column.index === 2 || data.column.index === 5) { // Amount columns
                    // Line above total
                    doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                    // Double line below total
                    doc.line(data.cell.x, data.cell.y + data.cell.height - 1, data.cell.x + data.cell.width, data.cell.y + data.cell.height - 1);
                    doc.line(data.cell.x, data.cell.y + data.cell.height + 0.5, data.cell.x + data.cell.width, data.cell.y + data.cell.height + 0.5);
                }
            }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.text(`I/We hereby confirm the above`, 14, finalY);
    doc.text(`I.T. PAN No. : _________________`, 14, finalY + 25);

    doc.text(`Yours faithfully,`, 150, finalY, { align: 'center' });

    doc.text(`Authorised Signatory`, 150, finalY + 25, { align: 'center' });
    doc.text(`Our I.T. PAN No. : _________________`, 150, finalY + 30, { align: 'center' });

    return doc;
};
