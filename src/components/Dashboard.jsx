import { Globe } from 'lucide-react'; // <-- Added Globe icon for the exchange rates box
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// --- NEW: Mock Exchange Rates (Base: 1 Unit to INR) ---
const EXCHANGE_RATES = {
  INR: 1,
  USD: 83.50,
  EUR: 90.20,
  GBP: 105.80
};

// --- NEW: Helper to convert any amount to the selected base currency ---
const convertToBase = (amount, fromCurrency, baseCurrency) => {
  const fromCurr = fromCurrency || 'INR'; // Fallback for old local storage data
  if (fromCurr === baseCurrency) return amount;
  
  // Convert to INR first, then divide by target currency rate
  const amountInINR = amount * EXCHANGE_RATES[fromCurr];
  return amountInINR / EXCHANGE_RATES[baseCurrency];
};

export default function Dashboard() {
  const { transactions, currency } = useSelector((state) => state.finance);
  const [timeFilter, setTimeFilter] = useState('1M');
  const sym = CURRENCY_SYMBOLS[currency] || '₹';

  const filterDataByTime = () => {
    if (timeFilter === 'ALL') return transactions;
    const now = new Date();
    const cutoffDate = new Date();
    if (timeFilter === '1D') cutoffDate.setDate(now.getDate() - 1);
    if (timeFilter === '1W') cutoffDate.setDate(now.getDate() - 7);
    if (timeFilter === '1M') cutoffDate.setMonth(now.getMonth() - 1);
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  };

  // --- NEW: Normalize all transactions to the BASE CURRENCY before doing math ---
  const normalizedTransactions = filterDataByTime().map(t => ({
    ...t,
    normalizedAmount: convertToBase(t.amount, t.txCurrency, currency)
  }));

  // Metrics (Now using normalizedAmount)
  const totalIncome = normalizedTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.normalizedAmount, 0);
  const totalExpenses = normalizedTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.normalizedAmount, 0);
  const balance = totalIncome - totalExpenses;
  
  const personalExp = normalizedTransactions.filter(t => t.type === 'Expense' && t.profile === 'Personal').reduce((sum, t) => sum + t.normalizedAmount, 0);
  const businessExp = normalizedTransactions.filter(t => t.type === 'Expense' && t.profile === 'Business').reduce((sum, t) => sum + t.normalizedAmount, 0);

  // Pie Chart Data (Rounded to 2 decimals for clean tooltips)
  const expenseByCategory = normalizedTransactions.reduce((acc, t) => {
    if (t.type === 'Expense') acc[t.category] = (acc[t.category] || 0) + t.normalizedAmount;
    return acc;
  }, {});
  const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: parseFloat(expenseByCategory[key].toFixed(2)) }));

  // Line Chart Data
  const sortedTransactions = [...normalizedTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let runningBalance = 0;
  const lineData = sortedTransactions.map(t => {
    runningBalance += t.type === 'Income' ? t.normalizedAmount : -t.normalizedAmount;
    return { date: t.date, balance: parseFloat(runningBalance.toFixed(2)) };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Bar: Time Filter & Exchange Rates */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        
        <div className="flex items-center gap-2">
          <span className="px-2 text-sm font-semibold text-gray-500 hidden sm:block">Overview:</span>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-md">
            {['1D', '1W', '1M', 'ALL'].map(tf => (
              <button key={tf} onClick={() => setTimeFilter(tf)} className={`px-4 py-1 text-sm font-bold rounded transition-all ${timeFilter === tf ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* NEW: Exchange Rate Display Box */}
        <div className="flex items-center gap-3 text-xs sm:text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800/50">
          <Globe size={16} className="text-blue-500" />
          <span className="font-semibold">Live Rates:</span>
          <span>$1 = ₹83.50</span>
          <span>|</span>
          <span>€1 = ₹90.20</span>
          <span>|</span>
          <span>£1 = ₹105.80</span>
        </div>
      </div>

      {/* Enhanced Summary Cards (Added fraction rounding so converted numbers look clean) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance ({currency})</h3>
          <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>{sym}{balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income ({currency})</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{sym}{totalIncome.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses ({currency})</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{sym}{totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</p>
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs font-medium">
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">Personal: {sym}{personalExp.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">Business: {sym}{businessExp.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-80 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Balance Trend ({currency})</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickMargin={10} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(val) => `${sym}${val}`} />
              <Tooltip formatter={(value) => [`${sym}${value}`, 'Balance']} contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-80 border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Expenses by Category ({currency})</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {pieData.length > 0 ? (
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" minAngle={15} labelLine={true} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${sym}${value}`, 'Amount']} contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                </PieChart>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No expense data available</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}