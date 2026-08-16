import { useState, useMemo, useEffect } from 'react';
import UserManagement from './components/UserManagement';
import ExpenseForm from './components/ExpenseForm';
import SummaryCards from './components/SummaryCards';
import SettlementSummary from './components/SettlementSummary';
import ExpenseList from './components/ExpenseList';

export default function App() {
  // Initialize from localStorage (default to empty arrays if not present)
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('et_group_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('et_group_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('et_group_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('et_group_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Compute totals & per-user breakdown
  const totals = useMemo(() => {
    const perUser = {};

    users.forEach((u) => {
      perUser[u] = { paid: 0, share: 0, balance: 0 };
    });

    let totalGroupSpent = 0;

    expenses.forEach((expense) => {
      totalGroupSpent += Number(expense.totalAmount || 0);

      // Add paid amounts for payers
      const paidMap = expense.paidByMap || {};
      Object.entries(paidMap).forEach(([payer, amt]) => {
        if (perUser[payer]) {
          perUser[payer].paid += Number(amt || 0);
        }
      });

      // Add share amounts for splitters
      const splitters = expense.splitBetween || [];
      if (splitters.length > 0) {
        const shareAmount = Number(expense.totalAmount || 0) / splitters.length;
        splitters.forEach((person) => {
          if (perUser[person]) {
            perUser[person].share += shareAmount;
          }
        });
      }
    });

    // Compute net balance for each user
    Object.keys(perUser).forEach((u) => {
      perUser[u].balance = perUser[u].paid - perUser[u].share;
    });

    return { totalGroupSpent, perUser };
  }, [users, expenses]);

  // User Actions
  const handleAddUser = (name) => {
    setUsers((prev) => [...prev, name]);
  };

  const handleDeleteUser = (name) => {
    setUsers((prev) => prev.filter((u) => u !== name));
    // Clean deleted user from existing expenses if needed
    setExpenses((prevExpenses) =>
      prevExpenses
        .map((exp) => {
          const newPaidMap = { ...exp.paidByMap };
          delete newPaidMap[name];
          const newSplitters = (exp.splitBetween || []).filter((u) => u !== name);
          
          return {
            ...exp,
            paidByMap: newPaidMap,
            splitBetween: newSplitters,
          };
        })
        .filter((exp) => Object.keys(exp.paidByMap).length > 0 && exp.splitBetween.length > 0)
    );
  };

  // Expense Actions
  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all members and expenses?')) {
      setUsers([]);
      setExpenses([]);
      localStorage.removeItem('et_group_users');
      localStorage.removeItem('et_group_expenses');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="header-brand">
          <div className="logo-badge">💸</div>
          <div>
            <h1 className="app-title">Expense Tracker & Splitter</h1>
            <p className="app-subtitle">Custom group expense sharing & multi-payer manager</p>
          </div>
        </div>

        {(users.length > 0 || expenses.length > 0) && (
          <button type="button" className="btn danger-outline-btn" onClick={handleResetData}>
            Clear All Data
          </button>
        )}
      </header>

      {/* Main Grid */}
      <main className="app-main">
        {/* Top Summary Cards */}
        <SummaryCards users={users} expenses={expenses} totals={totals} />

        {/* Dynamic User Management (No defaults) */}
        <UserManagement
          users={users}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          expenses={expenses}
        />

        {/* Expense Creation Form (Single & Multi Payer, Multi Splitter) */}
        <ExpenseForm users={users} onAddExpense={handleAddExpense} />

        {/* Debt Simplification Transfers */}
        <SettlementSummary users={users} totals={totals} />

        {/* Recent Expenses List */}
        <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
      </main>
    </div>
  );
}