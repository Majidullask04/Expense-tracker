export default function SummaryCards({ users, expenses, totals }) {
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <section className="summary-section">
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon">💰</div>
          <div>
            <span className="metric-label">Total Group Spent</span>
            <h3 className="metric-value">{formatINR(totals.totalGroupSpent)}</h3>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon">🧾</div>
          <div>
            <span className="metric-label">Total Expenses</span>
            <h3 className="metric-value">{expenses.length}</h3>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon">👥</div>
          <div>
            <span className="metric-label">Group Members</span>
            <h3 className="metric-value">{users.length}</h3>
          </div>
        </div>
      </div>

      {users.length > 0 && (
        <div className="glass-panel member-balances-section">
          <div className="section-header">
            <h2>Individual Balances</h2>
            <p className="muted-text">Overview of total paid, split share, and net balance for each person.</p>
          </div>

          <div className="member-cards-grid">
            {users.map((user) => {
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
                        {isPositive
                          ? `Gets back ${formatINR(balance)}`
                          : isNegative
                          ? `Owes ${formatINR(Math.abs(balance))}`
                          : 'Settled Up 🎉'}
                      </span>
                    </div>
                  </div>

                  <div className="card-stats-rows">
                    <div className="stat-row">
                      <span className="stat-label">Total Paid:</span>
                      <span className="stat-value">{formatINR(data.paid)}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Share:</span>
                      <span className="stat-value">{formatINR(data.share)}</span>
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
