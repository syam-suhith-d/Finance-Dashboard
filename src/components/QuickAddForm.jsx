import { Briefcase, Calendar, PlusCircle, User, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast'; // <-- Perfect
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../store/financeSlice';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Groceries', 'Utilities', 'Transportation', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Past Loan Returned', 'Interest', 'Gift', 'Other'];

export default function QuickAddForm({ onClose }) { 
  const dispatch = useDispatch();
  const baseCurrency = useSelector(state => state.finance.currency);
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    type: 'Expense', 
    profile: 'Personal', 
    amount: '', 
    txCurrency: baseCurrency, 
    date: today, 
    category: EXPENSE_CATEGORIES[0], 
    merchant: '', 
    note: ''
  });

  const handleTypeChange = (newType) => {
    setFormData({ 
      ...formData, 
      type: newType, 
      category: newType === 'Expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0] 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    dispatch(addTransaction({
      id: Date.now().toString(), ...formData, amount: parseFloat(formData.amount)
    }));

    setFormData({ ...formData, amount: '', merchant: '', note: '', date: today });
    
    // --> TRIGGER THE TOAST HERE <--
    toast.success('Transaction added successfully!');
    
    if (onClose) onClose(); 
  };

  const activeCategories = formData.type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg relative animate-fade-in text-gray-900 dark:text-gray-100">
      
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
        <X size={24} />
      </button>

      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <PlusCircle className="text-blue-500" /> Add Transaction
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggles Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-full sm:w-1/2">
            <button type="button" onClick={() => handleTypeChange('Expense')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'Expense' ? 'bg-red-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Expense</button>
            <button type="button" onClick={() => handleTypeChange('Income')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'Income' ? 'bg-green-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Income</button>
          </div>
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-full sm:w-1/2">
            <button type="button" onClick={() => setFormData({...formData, profile: 'Personal'})} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.profile === 'Personal' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}><User size={14} /> Personal</button>
            <button type="button" onClick={() => setFormData({...formData, profile: 'Business'})} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.profile === 'Business' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}><Briefcase size={14} /> Business</button>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative flex items-center border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
            <select value={formData.txCurrency} onChange={(e) => setFormData({...formData, txCurrency: e.target.value})} className="p-2.5 bg-transparent border-r dark:border-gray-600 outline-none font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
              {Object.keys(CURRENCY_SYMBOLS).map(c => (
                // FIX: Added dark mode background to options
                <option key={c} value={c} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{CURRENCY_SYMBOLS[c]}</option>
              ))}
            </select>
            <input type="number" required placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full p-2.5 bg-transparent outline-none dark:text-white" />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full pl-10 p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white" />
          </div>

          <select 
            required 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white cursor-pointer"
          >
            {activeCategories.map(cat => (
              // FIX: Added dark mode background to options
              <option key={cat} value={cat} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{cat}</option>
            ))}
          </select>

          <input type="text" placeholder="Merchant (e.g., Amazon)" value={formData.merchant} onChange={(e) => setFormData({...formData, merchant: e.target.value})} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white" />
          
          <input type="text" placeholder="Tag / Note" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white md:col-span-2" />
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors">Save Transaction</button>
      </form>
    </div>
  );
}