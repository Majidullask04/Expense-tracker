import { useState } from 'react';

export default function ExpenseList({ expenses, onDeleteExpense }) {
  const [searchQuery, setSearchQuery] = useState('');

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  const filteredExpenses = expenses.filter((exp) => {
    const q = searchQuery.toLowerCase();
    if (exp.title.toLowerCase().includes(q)) return true;
    const payers = Object.keys(exp.paidByMap || {}).join(' ').toLowerCase();
    if (payers.includes(q)) return true;
    const splitters = (exp.splitBetween || []).join(' ').toLowerCase();
    if (splitters.includes(q)) return true;
    return false;
  });

  return (
    <section className="glass-panel expenses-list-section">
      <div className="section-header list-header">
        <div>
          <h2>Expense History ({expenses.length})</h2>
          <p className="muted-text">Track all transactions, payers, and split breakdowns.</p>
        </div>

        {expenses.length > 0 && (
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="text-input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses by title or name..."
            />
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="empty-expenses-box">
          <span className="empty-icon">💸</span>
          <h3>No expenses recorded yet</h3>
          <p className="muted-text">Add your first expense above to start tracking balances!</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="empty-expenses-box">
          <span className="empty-icon">🔎</span>
          <h3>No expenses found</h3>
          <p className="muted-text">No expense matches "{searchQuery}". Try a different keyword.</p>
        </div>
      ) : (
        <div className="expense-items-list">
          {filteredExpenses.map((expense) => {
            const payersList = Object.entries(expense.paidByMap || {});
            const totalAmount = expense.totalAmount || 0;
            const splitters = expense.splitBetween || [];
            const perPersonShare = splitters.length > 0 ? totalAmount / splitters.length : 0;

            return (
              <div key={expense.id} className="expense-card">
                <div className="expense-card-top">
                  <div className="expense-title-group">
                    <h3 className="expense-title">{expense.title}</h3>
                    {expense.date && <span className="expense-date">{expense.date}</span>}
                  </div>
                  <div className="expense-amount-badge">
                    {formatINR(totalAmount)}
                  </div>
                </div>

                <div className="expense-details-grid">
                  <div className="detail-block">
                    <span className="detail-label">💳 Paid By:</span>
                    <div className="payers-tags">
                      {payersList.map(([payer, amt]) => (
                        <span key={payer} className="payer-tag">
                          <strong className="payer-name">{payer}</strong> ({formatINR(amt)})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-block">
                    <span className="detail-label">🍕 Split Between ({splitters.length}):</span>
                    <div className="splitters-tags">
                      {splitters.map((person) => (
                        <span key={person} className="splitter-tag">
                          {person}
                        </span>
                      ))}
                      <span className="per-share-note">
                        ({formatINR(perPersonShare)} each)
                      </span>
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
