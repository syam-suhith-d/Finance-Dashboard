import { Briefcase, Calendar, PlusCircle, User } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../store/financeSlice';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export default function QuickAddForm() {
  const dispatch = useDispatch();
  const baseCurrency = useSelector(state => state.finance.currency);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    type: 'Expense',
    profile: 'Personal',
    amount: '',
    txCurrency: baseCurrency, // Defaults to base currency
    date: today,
    category: 'Food',
    merchant: '',
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    dispatch(addTransaction({
      id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount)
    }));

    // Reset form but keep date as today
    setFormData({ ...formData, amount: '', merchant: '', note: '', date: today });
    alert("Transaction Added!");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <PlusCircle className="text-blue-500" /> Quick Add Transaction
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggles Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Income vs Expense */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-full sm:w-1/2">
            <button type="button" onClick={() => setFormData({...formData, type: 'Expense'})} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'Expense' ? 'bg-red-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Expense</button>
            <button type="button" onClick={() => setFormData({...formData, type: 'Income'})} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'Income' ? 'bg-green-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Income</button>
          </div>

          {/* Personal vs Business */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-full sm:w-1/2">
            <button type="button" onClick={() => setFormData({...formData, profile: 'Personal'})} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.profile === 'Personal' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
              <User size={14} /> Personal
            </button>
            <button type="button" onClick={() => setFormData({...formData, profile: 'Business'})} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.profile === 'Business' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
              <Briefcase size={14} /> Business
            </button>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Amount & Currency */}
          <div className="relative flex items-center border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <select value={formData.txCurrency} onChange={(e) => setFormData({...formData, txCurrency: e.target.value})} className="p-2.5 bg-transparent border-r dark:border-gray-600 outline-none font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
              {Object.keys(CURRENCY_SYMBOLS).map(c => <option key={c} value={c}>{CURRENCY_SYMBOLS[c]}</option>)}
            </select>
            <input type="number" required placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full p-2.5 bg-transparent outline-none dark:text-white" />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full pl-10 p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white" />
          </div>

          <input type="text" placeholder="Category (e.g., Food, Travel)" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white" />
          <input type="text" placeholder="Merchant (e.g., Starbucks)" value={formData.merchant} onChange={(e) => setFormData({...formData, merchant: e.target.value})} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white" />
          <input type="text" placeholder="Tag / Note" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full p-2.5 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none dark:text-white md:col-span-2" />
        </div>

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors">
          Save Transaction
        </button>
      </form>
    </div>
  );
}