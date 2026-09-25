import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/formatters';

export default function SettlementSummary({ users, totals, onRecordSettlement, currency = 'INR' }) {
  const [activeSettlementModal, setActiveSettlementModal] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');

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
          amount: Number(settlementAmount.toFixed(2)),
        });
      }

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return results;
  }, [users, totals]);

  const handleOpenModal = (item) => {
    setActiveSettlementModal(item);
    setSettlementAmount(item.amount.toString());
    setPaymentMethod('upi');
    setNotes('');
  };

  const handleCloseModal = () => {
    setActiveSettlementModal(null);
  };

  const handleConfirmSettlement = (e) => {
    e.preventDefault();
    if (!activeSettlementModal) return;

    const amt = parseFloat(settlementAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (onRecordSettlement) {
      onRecordSettlement({
        from: activeSettlementModal.from,
        to: activeSettlementModal.to,
        amount: amt,
        paymentMethod,
        notes: notes.trim(),
      });
    }

    handleCloseModal();
  };

  if (users.length === 0) return null;

  return (
    <section className="glass-panel settlement-section">
      <div className="section-header">
        <div>
          <h2>Debt Settlements</h2>
          <p className="muted-text">Simplified transactions to clear all group debts with minimal peer-to-peer transfers.</p>
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
            <div key={`${item.from}-${item.to}-${idx}`} className="settlement-card">
              <div className="settlement-content">
                <div className="settlement-party from-party">
                  <span className="avatar">{item.from.charAt(0)}</span>
                  <span className="name">{item.from}</span>
                </div>

                <div className="settlement-arrow">
                  <span className="pays-text">pays</span>
                  <div className="arrow-line">
                    <span className="amount-tag">{formatCurrency(item.amount, currency)}</span>
                    <span className="arrow-head">➔</span>
                  </div>
                </div>

                <div className="settlement-party to-party">
                  <span className="avatar">{item.to.charAt(0)}</span>
                  <span className="name">{item.to}</span>
                </div>
              </div>

              <div className="settlement-card-actions">
                <button
                  type="button"
                  className="btn settle-btn"
                  onClick={() => handleOpenModal(item)}
                >
                  🤝 Settle Up
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Settlement Modal */}
      {activeSettlementModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-dialog glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Settlement Payment</h3>
              <button type="button" className="close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="settlement-form">
              <div className="settlement-party-display">
                <div className="party-box from">
                  <span className="party-role">From (Payer)</span>
                  <strong className="party-name">{activeSettlementModal.from}</strong>
                </div>
                <span className="party-arrow">➔</span>
                <div className="party-box to">
                  <span className="party-role">To (Recipient)</span>
                  <strong className="party-name">{activeSettlementModal.to}</strong>
                </div>
              </div>

              <div className="form-group">
                <label>Amount Settled</label>
                <div className="amount-input-wrapper">
                  <span className="currency-prefix">{currency === 'INR' ? '₹' : currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={activeSettlementModal.amount * 1.5}
                    className="text-input"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    required
                  />
                </div>
                <small className="muted-text">
                  Suggested full balance: {formatCurrency(activeSettlementModal.amount, currency)}
                </small>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods-grid">
                  {[
                    { id: 'upi', label: 'UPI / GPay', icon: '📱' },
                    { id: 'cash', label: 'Cash', icon: '💵' },
                    { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                    { id: 'other', label: 'Other', icon: '💳' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`method-chip ${paymentMethod === m.id ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Reference (Optional)</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g., Sent via PhonePe, dinner split..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn secondary-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn primary-btn">
                  ✓ Confirm & Clear Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
