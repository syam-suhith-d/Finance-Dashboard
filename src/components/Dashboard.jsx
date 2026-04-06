import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

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

  const filteredTransactions = filterDataByTime();

  // Metrics
  const totalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  const personalExp = filteredTransactions.filter(t => t.type === 'Expense' && t.profile === 'Personal').reduce((sum, t) => sum + t.amount, 0);
  const businessExp = filteredTransactions.filter(t => t.type === 'Expense' && t.profile === 'Business').reduce((sum, t) => sum + t.amount, 0);

  // Pie Chart Data
  const expenseByCategory = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'Expense') acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));

  // Line Chart Data
  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let runningBalance = 0;
  const lineData = sortedTransactions.map(t => {
    runningBalance += t.type === 'Income' ? t.amount : -t.amount;
    return { date: t.date, balance: runningBalance };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Time Filter Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm w-full md:w-max border border-gray-100 dark:border-gray-700">
        <span className="px-3 text-sm font-semibold text-gray-500 hidden sm:block">Overview:</span>
        <div className="flex gap-1">
          {['1D', '1W', '1M', 'ALL'].map(tf => (
            <button key={tf} onClick={() => setTimeFilter(tf)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${timeFilter === tf ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</h3>
          <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>{sym}{balance.toLocaleString()}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{sym}{totalIncome.toLocaleString()}</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{sym}{totalExpenses.toLocaleString()}</p>
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs font-medium">
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">Personal: {sym}{personalExp}</span>
            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">Business: {sym}{businessExp}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-80 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Balance Trend</h3>
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
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Expenses by Category</h3>
          <div className="flex-1 min-h-0"> {/* Helps responsive container not overflow */}
            <ResponsiveContainer width="100%" height="100%">
              {pieData.length > 0 ? (
                <PieChart>
                  {/* FIX: cy shifted up to 45%, outerRadius reduced to 80 */}
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${sym}${value}`, 'Amount']} contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }} />
                  {/* FIX: Wrapper style adds padding so it doesn't get cut off */}
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