import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('financeState');
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const initialState = loadState() || {
  transactions: [
    { id: '1', date: new Date().toISOString().split('T')[0], amount: 5000, category: 'Salary', type: 'Income', profile: 'Personal', merchant: 'Tech Corp', note: 'Monthly Salary' },
    { id: '2', date: new Date().toISOString().split('T')[0], amount: 120, category: 'Food', type: 'Expense', profile: 'Business', merchant: 'Starbucks', note: 'Coffee with client' },
  ],
  role: 'Admin', // Set to Admin by default so you can test adding
  theme: 'light',
  currency: 'INR', // Default currency
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addTransaction: (state, action) => { state.transactions.push(action.payload); },
    deleteTransaction: (state, action) => { state.transactions = state.transactions.filter(t => t.id !== action.payload); },
    setRole: (state, action) => { state.role = action.payload; },
    toggleTheme: (state) => { state.theme = state.theme === 'light' ? 'dark' : 'light'; },
    setCurrency: (state, action) => { state.currency = action.payload; } // New action
  }
});

export const { addTransaction, deleteTransaction, setRole, toggleTheme, setCurrency } = financeSlice.actions;
export default financeSlice.reducer;