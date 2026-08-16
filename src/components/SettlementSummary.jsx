import { useMemo } from 'react';

export default function SettlementSummary({ users, totals }) {
  const settlements = useMemo(() => {
    if (!users || users.length === 0) return [];

    const debtors = [];
    const creditors = [];

    users.forEach((u) => {
      const bal = totals.perUser[u]?.balance || 0;
      if (bal < -0.01) {
        debtors.push({ user: u, amount: Math.abs(bal) });
      } else if (bal > 0.01) {
        creditors.push({ user: u, amount: bal });
      }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const results = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 0.01) {
        results.push({
          from: debtor.user,
          to: creditor.user,
          amount: settlementAmount,
        });
      }

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return results;
  }, [users, totals]);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  if (users.length === 0) return null;

  return (
    <section className="glass-panel settlement-section">
      <div className="section-header">
        <div>
          <h2>Debt Settlements</h2>
          <p className="muted-text">Simplified transactions to clear all group debts with minimal payments.</p>
        </div>
      </div>

      {settlements.length === 0 ? (
        <div className="empty-settled-box">
          <span className="settled-icon">✨</span>
          <p className="settled-text">Everyone is fully settled up! No pending payments.</p>
        </div>
      ) : (
        <div className="settlements-grid">
          {settlements.map((item, idx) => (
            <div key={idx} className="settlement-card">
              <div className="settlement-party from-party">
                <span className="avatar">{item.from.charAt(0)}</span>
                <span className="name">{item.from}</span>
              </div>

              <div className="settlement-arrow">
                <span className="pays-text">pays</span>
                <div className="arrow-line">
                  <span className="amount-tag">{formatINR(item.amount)}</span>
                  <span className="arrow-head">➔</span>
                </div>
              </div>

              <div className="settlement-party to-party">
                <span className="avatar">{item.to.charAt(0)}</span>
                <span className="name">{item.to}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
