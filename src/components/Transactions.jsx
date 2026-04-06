import { ArrowUpDown, Briefcase, Filter, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTransaction } from '../store/financeSlice';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export default function Transactions() {
  const dispatch = useDispatch();
  const { transactions, role, currency } = useSelector((state) => state.finance);
  
  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Income, Expense
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  const sym = CURRENCY_SYMBOLS[currency] || '₹';

  // 1. Filter Logic
  let processedData = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.merchant && t.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // 2. Sort Logic
  processedData.sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  // Toggle sort direction
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Add this right before your return statement
const handleDelete = (id) => {
  if (window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
    dispatch(deleteTransaction(id));
    toast.success("Record deleted successfully!");
  }
};

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Bar: Search, Filter, and Sort Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search category, type, or merchant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>


{/* Filters & Sorting Dropdowns */}
<div className="flex flex-wrap gap-3 w-full md:w-auto">
  <div className="flex items-center gap-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-1.5">
    <Filter size={16} className="text-gray-500" />
    <select 
      value={filterType} 
      onChange={(e) => setFilterType(e.target.value)}
      className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
    >
      {/* FIX: Added bg-white dark:bg-gray-800 to options */}
      <option className="bg-white dark:bg-gray-800" value="All">All Types</option>
      <option className="bg-white dark:bg-gray-800" value="Income">Income Only</option>
      <option className="bg-white dark:bg-gray-800" value="Expense">Expense Only</option>
    </select>
  </div>

  <div className="flex items-center gap-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-1.5">
    <ArrowUpDown size={16} className="text-gray-500" />
    <select 
      value={`${sortConfig.key}-${sortConfig.direction}`} 
      onChange={(e) => {
        const [key, direction] = e.target.value.split('-');
        setSortConfig({ key, direction });
      }}
      className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
    >
      {/* FIX: Added bg-white dark:bg-gray-800 to options */}
      <option className="bg-white dark:bg-gray-800" value="date-desc">Newest First</option>
      <option className="bg-white dark:bg-gray-800" value="date-asc">Oldest First</option>
      <option className="bg-white dark:bg-gray-800" value="amount-desc">Amount: High to Low</option>
      <option className="bg-white dark:bg-gray-800" value="amount-asc">Amount: Low to High</option>
    </select>
  </div>
</div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                <th className="p-4 font-semibold text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition" onClick={() => requestSort('date')}>
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4 font-semibold text-sm">Profile</th>
                <th className="p-4 font-semibold text-sm">Category</th>
                <th className="p-4 font-semibold text-sm">Type</th>
                <th className="p-4 font-semibold text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition" onClick={() => requestSort('amount')}>
                  Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                {role === 'Admin' && <th className="p-4 font-semibold text-sm text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">No transactions match your filters.</td>
                </tr>
              ) : (
                processedData.map((t) => (
                  <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">{t.date}</td>
                    <td className="p-4">
                      {t.profile === 'Business' ? 
                        <span className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400"><Briefcase size={12}/> Business</span> : 
                        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"><User size={12}/> Personal</span>
                      }
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm">{t.category}</div>
                      {t.merchant && <div className="text-xs text-gray-500 dark:text-gray-400">{t.merchant}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'Income' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm whitespace-nowrap">
                      {t.txCurrency && t.txCurrency !== currency ? CURRENCY_SYMBOLS[t.txCurrency] : sym}
                      {t.amount.toLocaleString()}
                    </td>
                    
   {role === 'Admin' && (
  <td className="p-4 text-right">
    <button 
      onClick={() => handleDelete(t.id)} 
      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  </td>
)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}