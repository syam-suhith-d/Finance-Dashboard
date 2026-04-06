import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Info, LayoutDashboard, Lightbulb, ListOrdered, Moon, Plus, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import QuickAddForm from './components/QuickAddForm';
import { setRole, toggleTheme } from './store/financeSlice';
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };


import Dashboard from './components/Dashboard';
import Insights from './components/Insights';
import Transactions from './components/Transactions';

export default function App() {
  const dispatch = useDispatch();
  const { role, theme, transactions, currency } = useSelector((state) => state.finance);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State
  
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

// 1. Bulletproof CSV Export using Blob
  const exportToCSV = () => {
    try {
      // Define headers (Added Profile since we added that feature!)
      const headers = ["Date", "Amount", "Currency", "Category", "Type", "Profile", "Merchant", "Note"];
      
      // Map transactions to properly escaped CSV rows
      const csvRows = transactions.map(t => {
        // Handle undefined fields gracefully
        const merchant = t.merchant || "";
        const note = t.note || "";
        const txCurrency = t.txCurrency || currency;
        
        return `"${t.date}","${t.amount}","${txCurrency}","${t.category}","${t.type}","${t.profile}","${merchant}","${note}"`;
      });

      // Combine headers and rows
      const csvContent = headers.join(",") + "\n" + csvRows.join("\n");
      
      // CREATE BLOB 
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Trigger Download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "finance_transactions.csv");
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV Downloaded!");

    } catch (error) {
      console.error("CSV Generation Error:", error);
      toast.error("Failed to generate CSV. Check console.");
    }
  };

 // 2. New PDF Export 
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add Document Title
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55); 
      doc.text("Financial Transactions Report", 14, 22);
      
      // Add Timestamp
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128); 
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Prepare table data (Added Note Column)
      const tableColumn = ["Date", "Category", "Type", "Note", "Amount"];
      
      const tableRows = transactions.map(t => {
        // Use standard currency codes (INR, USD) to avoid jsPDF font rendering issues with ₹
        const txCurrencyCode = t.txCurrency || 'INR';
        const amountString = `${txCurrencyCode} ${t.amount.toLocaleString()}`;
        const noteString = t.note ? t.note : '-';

        return [t.date, t.category, t.type, noteString, amountString];
      });

      // Generate AutoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 36,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 3: { cellWidth: 40 } }, 
        alternateRowStyles: { fillColor: [249, 250, 251] }
      });
      
      doc.save("finance_transactions.pdf");
      toast.success("PDF Downloaded!");

    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Check console.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <QuickAddForm onClose={() => setIsModalOpen(false)} />
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-10 flex flex-col xl:flex-row justify-between items-center p-4 bg-white dark:bg-gray-800 border-b-2 shadow-sm gap-4 transition-colors ${role === 'Admin' ? 'border-orange-500' : 'border-gray-200 dark:border-gray-700'}`}>
        
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">FinanceTracker</h1>
      {/* Add Transaction Modal Trigger OR Viewer Disclaimer */}
          {role === 'Admin' ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex w-full sm:w-auto justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md font-semibold transition-colors"
            >
              <Plus size={18} /> Add Record
            </button>
          ) : (
            <div className="flex w-full sm:w-auto items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
              <Info size={16} className="text-blue-500 flex-shrink-0" /> 
              <span>Switch to <strong>Admin</strong> role to add records.</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          
          {/* New One-Click Role Toggle */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-inner">
            <button 
              onClick={() => dispatch(setRole('Viewer'))} 
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${role === 'Viewer' ? 'bg-white text-gray-800 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              Viewer
            </button>
            <button 
              onClick={() => dispatch(setRole('Admin'))} 
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${role === 'Admin' ? 'bg-orange-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              Admin
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>



          <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
            <button onClick={exportToCSV} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded shadow-sm border border-green-200 dark:border-green-800 transition-colors" title="Download CSV"><Download size={16} /></button>
            <button onClick={exportToPDF} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded shadow-sm border border-red-200 dark:border-red-800 transition-colors" title="Download PDF"><FileText size={16} /></button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 shrink-0 w-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg w-full sm:w-max shadow-inner">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}><LayoutDashboard size={16} /> Dashboard</button>
            <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'transactions' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}><ListOrdered size={16} /> Transactions</button>
            <button onClick={() => setActiveTab('insights')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'insights' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}><Lightbulb size={16} /> Insights</button>
          </div>

          {/* Add Transaction Modal Trigger */}
          {role === 'Admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex w-full sm:w-auto justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md font-semibold transition-colors"
            >
              <Plus size={18} /> Add Record
            </button>
          )}
        </div>

        {/* Tab Content Routing */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'insights' && <Insights />}
        </div>
      </main>

{/* Footer Section */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          
          {/* Left: Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>All systems operational</span>
          </div>
          
          {/* Center: Copyright */}
          <p className="text-center">© {new Date().getFullYear()} FinanceTracker. Designed for financial clarity.</p>
          
          {/* Right: Developer Links */}
          <div className="flex items-center gap-4">
            <span>Built by <strong>Syam Suhith</strong></span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="https://github.com/syam-suhith-d" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
            <a href="https://linkedin.com/in/syam-suhith-dondapati-/" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">LinkedIn</a>
          </div>

        </div>
      </footer>

    </div>
  );
}