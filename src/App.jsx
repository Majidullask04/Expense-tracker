import { useState, useMemo, useEffect } from 'react';
import UserManagement from './components/UserManagement';
import ExpenseForm from './components/ExpenseForm';
import SummaryCards from './components/SummaryCards';
import SettlementSummary from './components/SettlementSummary';
import ExpenseList from './components/ExpenseList';
import { CURRENCIES } from './constants/categories';
import { LogoIcon } from './components/Icons';

export default function App() {
  // Initialize currency from localStorage (default INR)
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('et_currency') || 'INR';
    } catch {
      return 'INR';
    }
  });

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
    localStorage.setItem('et_currency', currency);
  }, [currency]);

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
      // Settlements do not count as new group purchases
      if (!expense.isSettlement) {
        totalGroupSpent += Number(expense.totalAmount || 0);
      }

      // Add paid amounts for payers
      const paidMap = expense.paidByMap || {};
      Object.entries(paidMap).forEach(([payer, amt]) => {
        if (perUser[payer]) {
          perUser[payer].paid += Number(amt || 0);
        }
      });

      // Add share amounts for splitters
      if (expense.splitDetails && Object.keys(expense.splitDetails).length > 0) {
        Object.entries(expense.splitDetails).forEach(([person, details]) => {
          if (perUser[person]) {
            const shareAmt = typeof details === 'number' ? details : Number(details.amount || 0);
            perUser[person].share += shareAmt;
          }
        });
      } else {
        const splitters = expense.splitBetween || [];
        if (splitters.length > 0) {
          const shareAmount = Number(expense.totalAmount || 0) / splitters.length;
          splitters.forEach((person) => {
            if (perUser[person]) {
              perUser[person].share += shareAmount;
            }
          });
        }
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
          const newSplitDetails = { ...exp.splitDetails };
          delete newSplitDetails[name];
          
          return {
            ...exp,
            paidByMap: newPaidMap,
            splitBetween: newSplitters,
            splitDetails: newSplitDetails,
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

  // Record a peer-to-peer settlement payment
  const handleRecordSettlement = ({ from, to, amount, paymentMethod, notes }) => {
    const numAmt = Number(amount);
    const newSettlement = {
      id: 'settle_' + Date.now().toString(),
      title: `Settlement: ${from} paid ${to}`,
      totalAmount: numAmt,
      paidByMap: { [from]: numAmt },
      splitBetween: [to],
      splitDetails: { [to]: { amount: numAmt } },
      isSettlement: true,
      settlementMeta: { from, to, paymentMethod, notes },
      date: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    setExpenses((prev) => [newSettlement, ...prev]);
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
    <div className="app-wrapper">
      {/* Dynamic Ambient Mesh Glow Background */}
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-emerald" />
        <div className="ambient-orb orb-violet" />
      </div>

      <div className="app-container">
        {/* Header */}
        <header className="app-header glass-panel">
          <div className="header-brand">
            <div className="logo-badge">
              <LogoIcon size={26} className="logo-icon-svg" />
              <div className="logo-glow" />
            </div>
            <div>
              <h1 className="app-title">Expense Tracker & Splitter</h1>
              <p className="app-subtitle">Multi-payer splitting, debt settlement & group finances</p>
            </div>
          </div>

        <div className="header-controls">
          {/* Currency Selector */}
          <div className="currency-selector-wrapper">
            <span className="currency-label">Currency:</span>
            <select
              className="text-input currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {(users.length > 0 || expenses.length > 0) && (
            <button type="button" className="btn danger-outline-btn" onClick={handleResetData}>
              Clear All Data
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="app-main">
        {/* Top Summary Cards */}
        <SummaryCards users={users} expenses={expenses} totals={totals} currency={currency} />

        {/* Dynamic User Management */}
        <UserManagement
          users={users}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          expenses={expenses}
        />

        {/* Expense Creation Form (Single & Multi Payer, Categories, Split Modes) */}
        <ExpenseForm users={users} onAddExpense={handleAddExpense} currency={currency} />

        {/* Debt Simplification Transfers & Settlement Modal */}
        <SettlementSummary
          users={users}
          totals={totals}
          onRecordSettlement={handleRecordSettlement}
          currency={currency}
        />

        {/* Recent Expenses List with Category & Settlement Filters */}
        <ExpenseList
          expenses={expenses}
          onDeleteExpense={handleDeleteExpense}
          currency={currency}
        />
      </main>
    </div>
  </div>
  );
}