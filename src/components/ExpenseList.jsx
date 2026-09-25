import { useState, useMemo } from 'react';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency, getCategoryById } from '../utils/formatters';

export default function ExpenseList({ expenses, onDeleteExpense, currency = 'INR' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'settlement') {
          if (!exp.isSettlement) return false;
        } else {
          if (exp.isSettlement || (exp.category || 'general') !== selectedCategory) return false;
        }
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      if (exp.title.toLowerCase().includes(q)) return true;
      if (exp.settlementMeta?.notes?.toLowerCase().includes(q)) return true;
      
      const payers = Object.keys(exp.paidByMap || {}).join(' ').toLowerCase();
      if (payers.includes(q)) return true;

      const splitters = (exp.splitBetween || []).join(' ').toLowerCase();
      if (splitters.includes(q)) return true;

      return false;
    });
  }, [expenses, searchQuery, selectedCategory]);

  return (
    <section className="glass-panel expenses-list-section">
      <div className="section-header list-header">
        <div>
          <h2>Expense History ({expenses.length})</h2>
          <p className="muted-text">Track all transactions, payers, categories, and split breakdowns.</p>
        </div>

        {expenses.length > 0 && (
          <div className="list-controls-bar">
            {/* Category filter */}
            <select
              className="text-input filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">📁 All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                </option>
              ))}
              <option value="settlement">🤝 Settlements</option>
            </select>

            {/* Search input */}
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="text-input search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or person..."
              />
            </div>
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="empty-expenses-box">
          <span className="empty-icon">💸</span>
          <h3>No expenses recorded yet</h3>
          <p className="muted-text">Add your first expense or record a settlement above to start tracking balances!</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="empty-expenses-box">
          <span className="empty-icon">🔎</span>
          <h3>No matching records found</h3>
          <p className="muted-text">Try adjusting your category filter or search keyword.</p>
        </div>
      ) : (
        <div className="expense-items-list">
          {filteredExpenses.map((expense, idx) => {
            const payersList = Object.entries(expense.paidByMap || {});
            const totalAmount = expense.totalAmount || 0;
            const splitters = expense.splitBetween || [];
            const cat = getCategoryById(expense.category);

            // Special card layout for settlements
            if (expense.isSettlement) {
              const meta = expense.settlementMeta || {};
              return (
                <div
                  key={expense.id}
                  className="expense-card settlement-history-card"
                  style={{ '--card-index': Math.min(idx, 12) }}
                >
                  <div className="expense-card-top">
                    <div className="expense-title-group">
                      <div className="settlement-badge-pill">
                        <span>🤝 Settlement</span>
                        {meta.paymentMethod && (
                          <span className="method-tag">via {meta.paymentMethod.toUpperCase()}</span>
                        )}
                      </div>
                      <h3 className="expense-title">{expense.title}</h3>
                      {meta.notes && <p className="settlement-note">"{meta.notes}"</p>}
                      {expense.date && <span className="expense-date">{expense.date}</span>}
                    </div>

                    <div className="expense-amount-badge settlement-amount">
                      {formatCurrency(totalAmount, currency)}
                    </div>
                  </div>

                  <div className="settlement-history-parties">
                    <span><strong>{meta.from}</strong> paid <strong>{meta.to}</strong></span>
                  </div>

                  <div className="expense-card-footer">
                    <button
                      type="button"
                      className="delete-expense-btn"
                      onClick={() => onDeleteExpense(expense.id)}
                      title="Undo this settlement"
                    >
                      ↩️ Revert / Delete
                    </button>
                  </div>
                </div>
              );
            }

            // Normal expense card
            return (
              <div
                key={expense.id}
                className="expense-card"
                style={{ '--card-index': Math.min(idx, 12) }}
              >
                <div className="expense-card-top">
                  <div className="expense-title-group">
                    <div className="category-meta-bar">
                      <span
                        className="cat-badge"
                        style={{ borderColor: `${cat.color}44`, backgroundColor: `${cat.color}18`, color: cat.color }}
                      >
                        {cat.icon} {cat.label}
                      </span>
                      {expense.splitType && (
                        <span className="split-type-badge">
                          {expense.splitType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="expense-title">{expense.title}</h3>
                    {expense.date && <span className="expense-date">{expense.date}</span>}
                  </div>

                  <div className="expense-amount-badge">
                    {formatCurrency(totalAmount, currency)}
                  </div>
                </div>

                <div className="expense-details-grid">
                  <div className="detail-block">
                    <span className="detail-label">💳 Paid By:</span>
                    <div className="payers-tags">
                      {payersList.map(([payer, amt]) => (
                        <span key={payer} className="payer-tag">
                          <strong className="payer-name">{payer}</strong> ({formatCurrency(amt, currency)})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-block">
                    <span className="detail-label">🍕 Split Between ({splitters.length}):</span>
                    <div className="splitters-tags">
                      {splitters.map((person) => {
                        const splitAmt =
                          expense.splitDetails?.[person]?.amount ??
                          (splitters.length > 0 ? totalAmount / splitters.length : 0);

                        return (
                          <span key={person} className="splitter-tag">
                            <strong>{person}</strong> ({formatCurrency(splitAmt, currency)})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="expense-card-footer">
                  <button
                    type="button"
                    className="delete-expense-btn"
                    onClick={() => onDeleteExpense(expense.id)}
                  >
                    🗑️ Delete Expense
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
