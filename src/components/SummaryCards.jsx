import { formatCurrency, getCategoryById } from '../utils/formatters';

export default function SummaryCards({ users, expenses, totals, currency = 'INR' }) {
  // Exclude settlements from group purchase count
  const regularExpenses = expenses.filter((e) => !e.isSettlement);
  const settlementsCount = expenses.filter((e) => e.isSettlement).length;

  // Compute category spending breakdown
  const categorySpending = {};
  let totalCategorySpent = 0;
  regularExpenses.forEach((exp) => {
    const cat = exp.category || 'general';
    const amt = Number(exp.totalAmount || 0);
    categorySpending[cat] = (categorySpending[cat] || 0) + amt;
    totalCategorySpent += amt;
  });

  const topCategoryEntries = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);

  return (
    <section className="summary-section">
      <div className="metrics-grid">
        <div className="metric-card glass-panel" style={{ '--card-index': 0 }}>
          <div className="metric-icon">💰</div>
          <div>
            <span className="metric-label">Total Group Spent</span>
            <h3 className="metric-value">{formatCurrency(totals.totalGroupSpent, currency)}</h3>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ '--card-index': 1 }}>
          <div className="metric-icon">🧾</div>
          <div>
            <span className="metric-label">Expenses & Settlements</span>
            <h3 className="metric-value">
              {regularExpenses.length} <span className="sub-count">({settlementsCount} settled)</span>
            </h3>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ '--card-index': 2 }}>
          <div className="metric-icon">👥</div>
          <div>
            <span className="metric-label">Group Members</span>
            <h3 className="metric-value">{users.length}</h3>
          </div>
        </div>
      </div>

      {/* Category breakdown bar if expenses exist */}
      {topCategoryEntries.length > 0 && (
        <div className="category-spending-bar glass-panel">
          <div className="category-bar-header">
            <span className="category-bar-title">Spending Distribution by Category</span>
            <span className="category-bar-total">{formatCurrency(totalCategorySpent, currency)}</span>
          </div>

          {/* Segmented Visual Progress Bar */}
          <div className="spending-progress-bar">
            {topCategoryEntries.map(([catId, amt]) => {
              const catObj = getCategoryById(catId);
              const percentage = totalCategorySpent > 0 ? (amt / totalCategorySpent) * 100 : 0;
              return (
                <div
                  key={catId}
                  className="progress-segment"
                  style={{
                    width: `${Math.max(percentage, 2)}%`,
                    backgroundColor: catObj.color,
                  }}
                  title={`${catObj.label}: ${percentage.toFixed(1)}% (${formatCurrency(amt, currency)})`}
                />
              );
            })}
          </div>

          <div className="category-pills-row">
            {topCategoryEntries.slice(0, 5).map(([catId, amt]) => {
              const catObj = getCategoryById(catId);
              const pct = totalCategorySpent > 0 ? ((amt / totalCategorySpent) * 100).toFixed(0) : 0;
              return (
                <div
                  key={catId}
                  className="cat-stat-chip"
                  style={{ borderColor: `${catObj.color}33` }}
                >
                  <span className="cat-color-dot" style={{ backgroundColor: catObj.color }} />
                  <span>{catObj.icon} {catObj.label}</span>
                  <span className="cat-pct-badge">{pct}%</span>
                  <strong>{formatCurrency(amt, currency)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="glass-panel member-balances-section">
          <div className="section-header">
            <h2>Individual Balances</h2>
            <p className="muted-text">Overview of total paid, split share, and net balance for each person.</p>
          </div>

          <div className="member-cards-grid">
            {users.map((user, idx) => {
              const data = totals.perUser[user] || { paid: 0, share: 0, balance: 0 };
              const balance = data.balance;
              const isPositive = balance > 0.01;
              const isNegative = balance < -0.01;

              return (
                <div
                  key={user}
                  className={`member-balance-card ${
                    isPositive ? 'positive-border' : isNegative ? 'negative-border' : ''
                  }`}
                  style={{ '--card-index': idx }}
                >
                  <div className="member-card-header">
                    <div className="avatar-circle">{user.charAt(0)}</div>
                    <div>
                      <h4 className="user-title">{user}</h4>
                      <span
                        className={`status-chip ${
                          isPositive
                            ? 'chip-positive'
                            : isNegative
                            ? 'chip-negative'
                            : 'chip-neutral'
                        }`}
                      >
                        <span className="pulse-dot" />
                        {isPositive
                          ? `Gets back ${formatCurrency(balance, currency)}`
                          : isNegative
                          ? `Owes ${formatCurrency(Math.abs(balance), currency)}`
                          : 'Settled Up 🎉'}
                      </span>
                    </div>
                  </div>

                  <div className="card-stats-rows">
                    <div className="stat-row">
                      <span className="stat-label">Total Paid:</span>
                      <span className="stat-value">{formatCurrency(data.paid, currency)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Share:</span>
                      <span className="stat-value">{formatCurrency(data.share, currency)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
