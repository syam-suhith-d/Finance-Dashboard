import { AlertCircle, Award, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Insights() {
  const transactions = useSelector((state) => state.finance.transactions);

  // Filter Data
  const expenses = transactions.filter(t => t.type === 'Expense');
  const incomes = transactions.filter(t => t.type === 'Income');

  // Calculate Totals
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  // Calculate Highest Spending Category
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  let highestCategory = 'N/A';
  let highestAmount = 0;
  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > highestAmount) {
      highestAmount = amount;
      highestCategory = category;
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Financial Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Highest Spending Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Spending Category</h3>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{highestCategory}</p>
            <p className="text-sm text-gray-500 mt-1">${highestAmount.toLocaleString()} spent</p>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Savings Rate</h3>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{savingsRate}%</p>
            <p className="text-sm text-gray-500 mt-1">${savings.toLocaleString()} retained</p>
          </div>
        </div>
      </div>

      {/* Dynamic Observations */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
        <h3 className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300 mb-3">
          <AlertCircle size={20} /> Key Observations
        </h3>
        <ul className="space-y-2 text-blue-900 dark:text-blue-200 text-sm">
          {totalExpense > totalIncome && (
            <li>• <strong>Warning:</strong> Your expenses currently exceed your income by ${(totalExpense - totalIncome).toLocaleString()}. Consider reviewing your {highestCategory} budget.</li>
          )}
          {savingsRate >= 20 && (
            <li>• <strong>Great job!</strong> You are saving 20% or more of your income. This is an excellent financial habit.</li>
          )}
          {highestCategory !== 'N/A' && (
            <li>• <strong>Budget Focus:</strong> The majority of your outgoing cash is going toward {highestCategory}. Tracking these specific transactions closely might yield the best savings.</li>
          )}
          {transactions.length === 0 && (
            <li>• No data available yet. Add some transactions to see your insights!</li>
          )}
        </ul>
      </div>
    </div>
  );
}