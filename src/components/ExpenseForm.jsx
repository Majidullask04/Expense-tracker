import { useState, useEffect } from 'react';

export default function ExpenseForm({ users, onAddExpense }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  
  // Single Payer mode state
  const [singlePaidBy, setSinglePaidBy] = useState('');

  // Multi-Payer mode state: object mapping username -> paid amount
  const [paidByMap, setPaidByMap] = useState({});

  // Split Between state: array of usernames
  const [splitBetween, setSplitBetween] = useState([]);

  const [formError, setFormError] = useState('');

  // Update default states when users change
  useEffect(() => {
    if (users.length > 0) {
      setSinglePaidBy((prev) => (!prev || !users.includes(prev) ? users[0] : prev));
      // By default select all users for splitting
      setSplitBetween((prev) => {
        const validPrev = prev.filter((u) => users.includes(u));
        return validPrev.length > 0 ? validPrev : [...users];
      });
    } else {
      setSinglePaidBy('');
      setSplitBetween([]);
      setPaidByMap({});
    }
  }, [users]);

  // Handle toggling splitters
  const toggleSplitUser = (user) => {
    setSplitBetween((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  };

  const handleSelectAllSplitters = () => {
    setSplitBetween([...users]);
  };

  const handleDeselectAllSplitters = () => {
    setSplitBetween([]);
  };

  // Multi-payer helpers
  const togglePayer = (user) => {
    setPaidByMap((prev) => {
      const next = { ...prev };
      if (user in next) {
        delete next[user];
      } else {
        next[user] = '';
      }
      return next;
    });
  };

  const handlePayerAmountChange = (user, val) => {
    setPaidByMap((prev) => ({
      ...prev,
      [user]: val,
    }));
  };

  const splitPaidAmountEqually = () => {
    const total = parseFloat(amount);
    const selectedPayerKeys = Object.keys(paidByMap);
    if (!total || total <= 0 || selectedPayerKeys.length === 0) return;

    const equalShare = (total / selectedPayerKeys.length).toFixed(2);
    const newMap = {};
    let runningSum = 0;

    selectedPayerKeys.forEach((key, idx) => {
      if (idx === selectedPayerKeys.length - 1) {
        // Adjust rounding difference on last key
        newMap[key] = (total - runningSum).toFixed(2);
      } else {
        newMap[key] = equalShare;
        runningSum += parseFloat(equalShare);
      }
    });

    setPaidByMap(newMap);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (users.length === 0) {
      setFormError('Please add group members first before adding an expense.');
      return;
    }

    const trimmedTitle = title.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedTitle) {
      setFormError('Please enter an expense title.');
      return;
    }

    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (splitBetween.length === 0) {
      setFormError('Please select at least one person to split the expense with.');
      return;
    }

    // Construct final paidByMap
    let finalPaidByMap = {};

    if (!isMultiPayer) {
      if (!singlePaidBy) {
        setFormError('Please select who paid for this expense.');
        return;
      }
      finalPaidByMap = { [singlePaidBy]: numAmount };
    } else {
      const payerEntries = Object.entries(paidByMap);
      if (payerEntries.length === 0) {
        setFormError('Please select at least one person who contributed payment.');
        return;
      }

      let totalPaidSum = 0;
      for (const [payer, val] of payerEntries) {
        const valNum = parseFloat(val);
        if (isNaN(valNum) || valNum <= 0) {
          setFormError(`Please enter a valid contribution amount paid by ${payer}.`);
          return;
        }
        finalPaidByMap[payer] = valNum;
        totalPaidSum += valNum;
      }

      // Check if total paid matches total expense amount (with tolerance for small float rounding)
      if (Math.abs(totalPaidSum - numAmount) > 0.05) {
        setFormError(
          `Sum of payments (₹${totalPaidSum.toFixed(
            2
          )}) does not match Total Amount (₹${numAmount.toFixed(2)}).`
        );
        return;
      }
    }

    const newExpense = {
      id: Date.now().toString(),
      title: trimmedTitle,
      totalAmount: numAmount,
      paidByMap: finalPaidByMap,
      splitBetween: [...splitBetween],
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    onAddExpense(newExpense);

    // Reset form
    setTitle('');
    setAmount('');
    setFormError('');
    if (isMultiPayer) {
      setPaidByMap({});
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const perPersonSplit = splitBetween.length > 0 ? (numAmount / splitBetween.length).toFixed(2) : '0.00';

  return (
    <section className="glass-panel expense-form-section">
      <div className="section-header">
        <div>
          <h2>Add New Expense</h2>
          <p className="muted-text">Record an expense, select who paid (single or multiple), and who splits it.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-warning-box">
          <span className="icon">⚠️</span>
          <p>You need to add at least one group member above before you can record expenses.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="field-group">
              <label className="field-label">Expense Title</label>
              <input
                type="text"
                className="text-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Dinner, Grocery Run, Cab Fare"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Total Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="text-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="form-box">
            <div className="box-header">
              <span className="box-title">💳 Who Spent / Paid Money?</span>
              <div className="toggle-switch">
                <button
                  type="button"
                  className={`toggle-btn ${!isMultiPayer ? 'active' : ''}`}
                  onClick={() => setIsMultiPayer(false)}
                >
                  Single Payer
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${isMultiPayer ? 'active' : ''}`}
                  onClick={() => setIsMultiPayer(true)}
                >
                  Multiple Payers
                </button>
              </div>
            </div>

            {!isMultiPayer ? (
              <div className="field-group">
                <select
                  className="select-input"
                  value={singlePaidBy}
                  onChange={(e) => setSinglePaidBy(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u} value={u}>
                      {u} paid full amount (₹{numAmount ? numAmount.toFixed(2) : '0.00'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="multi-payer-box">
                <p className="subtext">Select everyone who paid money and enter their contributed amount:</p>
                <div className="payer-selection-grid">
                  {users.map((u) => {
                    const isSelected = u in paidByMap;
                    return (
                      <div key={u} className={`payer-card ${isSelected ? 'selected' : ''}`}>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePayer(u)}
                          />
                          <span>{u}</span>
                        </label>
                        {isSelected && (
                          <div className="payer-amount-input-wrap">
                            <span className="currency-prefix">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="text-input mini-input"
                              placeholder="0.00"
                              value={paidByMap[u]}
                              onChange={(e) => handlePayerAmountChange(u, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {Object.keys(paidByMap).length > 0 && numAmount > 0 && (
                  <button
                    type="button"
                    className="btn secondary-btn auto-split-btn"
                    onClick={splitPaidAmountEqually}
                  >
                    ⚡ Auto-Split Paid Amount Equally Among Selected Payers
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Splitters Section */}
          <div className="form-box">
            <div className="box-header">
              <span className="box-title">
                🍕 Split Expense Between ({splitBetween.length} selected)
              </span>
              <div className="quick-actions">
                <button type="button" className="text-btn" onClick={handleSelectAllSplitters}>
                  Select All
                </button>
                <span className="divider">•</span>
                <button type="button" className="text-btn" onClick={handleDeselectAllSplitters}>
                  Deselect All
                </button>
              </div>
            </div>

            <div className="splitter-pills-grid">
              {users.map((u) => {
                const isSelected = splitBetween.includes(u);
                return (
                  <label key={u} className={`splitter-pill ${isSelected ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSplitUser(u)}
                    />
                    <span className="pill-avatar">{u.charAt(0)}</span>
                    <span className="pill-name">{u}</span>
                  </label>
                );
              })}
            </div>

            {splitBetween.length > 0 && numAmount > 0 && (
              <div className="split-summary-info">
                <span>Each person pays:</span>
                <strong>₹{perPersonSplit}</strong>
              </div>
            )}
          </div>

          {formError && <div className="form-error-alert">{formError}</div>}

          <button type="submit" className="btn primary-btn submit-expense-btn">
            + Add Expense
          </button>
        </form>
      )}
    </section>
  );
}
