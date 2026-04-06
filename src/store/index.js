import { configureStore } from '@reduxjs/toolkit';
import financeReducer from './financeSlice';

export const store = configureStore({
  reducer: {
    finance: financeReducer,
  },
});

// Sync Redux state to localStorage on every change
store.subscribe(() => {
  const state = store.getState().finance;
  localStorage.setItem('financeState', JSON.stringify({
    transactions: state.transactions,
    role: state.role,
    theme: state.theme,
    currency: state.currency
  }));
});