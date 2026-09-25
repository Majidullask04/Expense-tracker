import { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, SPLIT_TYPES } from '../constants/categories';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import {
  CategoryIcon,
  SplitTypeIcon,
  CreditCardIcon,
  ScaleIcon,
  SparklesIcon,
  RotateCcwIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
} from './Icons';

export default function ExpenseForm({ users, onAddExpense, currency = 'INR' }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  
  // Single Payer mode state
  const [singlePaidBy, setSinglePaidBy] = useState('');

  // Multi-Payer mode state: object mapping username -> paid amount string
  const [paidByMap, setPaidByMap] = useState({});

  // Split mode: 'equal' | 'unequal' | 'percentage' | 'shares'
  const [splitType, setSplitType] = useState('equal');

  // Selected participants for splitting
  const [splitBetween, setSplitBetween] = useState([]);

  // Custom split inputs
  const [customAmounts, setCustomAmounts] = useState({});
  const [customPercentages, setCustomPercentages] = useState({});
  const [customShares, setCustomShares] = useState({});

  const [formError, setFormError] = useState('');

  const currSymbol = getCurrencySymbol(currency);
  const numAmount = parseFloat(amount) || 0;

  // Sync users with form defaults
  useEffect(() => {
    if (users.length > 0) {
      setSinglePaidBy((prev) => (!prev || !users.includes(prev) ? users[0] : prev));
      
      setSplitBetween((prev) => {
        const validPrev = prev.filter((u) => users.includes(u));
        return validPrev.length > 0 ? validPrev : [...users];
      });

      // Initialize default shares of 1 for new users
      setCustomShares((prev) => {
        const updated = { ...prev };
        users.forEach((u) => {
          if (!updated[u]) updated[u] = 1;
        });
        return updated;
      });
    } else {
      setSinglePaidBy('');
      setSplitBetween([]);
      setPaidByMap({});
      setCustomAmounts({});
      setCustomPercentages({});
      setCustomShares({});
    }
  }, [users]);

  // Toggle participant in split
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
    const selectedPayerKeys = Object.keys(paidByMap);
    if (!numAmount || numAmount <= 0 || selectedPayerKeys.length === 0) return;

    const equalShare = (numAmount / selectedPayerKeys.length).toFixed(2);
    const newMap = {};
    let runningSum = 0;

    selectedPayerKeys.forEach((key, idx) => {
      if (idx === selectedPayerKeys.length - 1) {
        newMap[key] = (numAmount - runningSum).toFixed(2);
      } else {
        newMap[key] = equalShare;
        runningSum += parseFloat(equalShare);
      }
    });

    setPaidByMap(newMap);
  };

  // Calculations for custom split types
  const unequalStats = useMemo(() => {
    let sum = 0;
    splitBetween.forEach((u) => {
      const val = parseFloat(customAmounts[u]) || 0;
      sum += val;
    });
    const diff = numAmount - sum;
    return { sum, diff };
  }, [splitBetween, customAmounts, numAmount]);

  const percentageStats = useMemo(() => {
    let totalPct = 0;
    splitBetween.forEach((u) => {
      const val = parseFloat(customPercentages[u]) || 0;
      totalPct += val;
    });
    const diffPct = 100 - totalPct;
    return { totalPct, diffPct };
  }, [splitBetween, customPercentages]);

  const sharesStats = useMemo(() => {
    let totalShares = 0;
    splitBetween.forEach((u) => {
      const s = parseInt(customShares[u], 10) || 0;
      totalShares += s;
    });
    return { totalShares };
  }, [splitBetween, customShares]);

  // Quick auto-distribute helpers for split modes
  const handleAutoDistributeUnequal = () => {
    if (!numAmount || splitBetween.length === 0) return;
    const share = (numAmount / splitBetween.length).toFixed(2);
    const newAmounts = {};
    let running = 0;
    splitBetween.forEach((u, i) => {
      if (i === splitBetween.length - 1) {
        newAmounts[u] = (numAmount - running).toFixed(2);
      } else {
        newAmounts[u] = share;
        running += parseFloat(share);
      }
    });
    setCustomAmounts(newAmounts);
  };

  const handleAutoDistributePercentages = () => {
    if (splitBetween.length === 0) return;
    const pct = (100 / splitBetween.length).toFixed(1);
    const newPercentages = {};
    let running = 0;
    splitBetween.forEach((u, i) => {
      if (i === splitBetween.length - 1) {
        newPercentages[u] = (100 - running).toFixed(1);
      } else {
        newPercentages[u] = pct;
        running += parseFloat(pct);
      }
    });
    setCustomPercentages(newPercentages);
  };

  const handleResetShares = () => {
    const newShares = {};
    splitBetween.forEach((u) => {
      newShares[u] = 1;
    });
    setCustomShares(newShares);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (users.length === 0) {
      setFormError('Please add group members first before adding an expense.');
      return;
    }

    const trimmedTitle = title.trim();
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

    // 1. Construct final paidByMap
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

      if (Math.abs(totalPaidSum - numAmount) > 0.05) {
        setFormError(
          `Sum of payments (${formatCurrency(totalPaidSum, currency)}) does not match Total Amount (${formatCurrency(numAmount, currency)}).`
        );
        return;
      }
    }

    // 2. Construct splitDetails according to splitType
    const finalSplitDetails = {};

    if (splitType === 'equal') {
      const equalShare = (numAmount / splitBetween.length);
      let allocated = 0;
      splitBetween.forEach((u, idx) => {
        if (idx === splitBetween.length - 1) {
          finalSplitDetails[u] = { amount: Number((numAmount - allocated).toFixed(2)) };
        } else {
          const roundedShare = Number(equalShare.toFixed(2));
          finalSplitDetails[u] = { amount: roundedShare };
          allocated += roundedShare;
        }
      });
    } else if (splitType === 'unequal') {
      if (Math.abs(unequalStats.diff) > 0.05) {
        setFormError(
          `Sum of split amounts (${formatCurrency(unequalStats.sum, currency)}) must match Total Amount (${formatCurrency(numAmount, currency)}). Difference: ${formatCurrency(Math.abs(unequalStats.diff), currency)}.`
        );
        return;
      }
      splitBetween.forEach((u) => {
        finalSplitDetails[u] = { amount: parseFloat(customAmounts[u]) || 0 };
      });
    } else if (splitType === 'percentage') {
      if (Math.abs(percentageStats.diffPct) > 0.5) {
        setFormError(
          `Total percentage must equal 100%. Currently: ${percentageStats.totalPct.toFixed(1)}%.`
        );
        return;
      }
      let allocated = 0;
      splitBetween.forEach((u, idx) => {
        const pct = parseFloat(customPercentages[u]) || 0;
        if (idx === splitBetween.length - 1) {
          const rem = Number((numAmount - allocated).toFixed(2));
          finalSplitDetails[u] = { amount: rem, percentage: pct };
        } else {
          const amt = Number(((pct / 100) * numAmount).toFixed(2));
          finalSplitDetails[u] = { amount: amt, percentage: pct };
          allocated += amt;
        }
      });
    } else if (splitType === 'shares') {
      if (sharesStats.totalShares <= 0) {
        setFormError('Total shares must be greater than 0.');
        return;
      }
      let allocated = 0;
      splitBetween.forEach((u, idx) => {
        const s = parseInt(customShares[u], 10) || 0;
        if (idx === splitBetween.length - 1) {
          const rem = Number((numAmount - allocated).toFixed(2));
          finalSplitDetails[u] = { amount: rem, shares: s };
        } else {
          const amt = Number(((s / sharesStats.totalShares) * numAmount).toFixed(2));
          finalSplitDetails[u] = { amount: amt, shares: s };
          allocated += amt;
        }
      });
    }

    const newExpense = {
      id: Date.now().toString(),
      title: trimmedTitle,
      totalAmount: numAmount,
      category,
      splitType,
      paidByMap: finalPaidByMap,
      splitBetween: [...splitBetween],
      splitDetails: finalSplitDetails,
      date: new Date().toLocaleDateString('en-US', {
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
    setCustomAmounts({});
    setCustomPercentages({});
  };

  const perPersonEqual = splitBetween.length > 0 ? (numAmount / splitBetween.length).toFixed(2) : '0.00';

  return (
    <section className="glass-panel expense-form-section">
      <div className="section-header">
        <div>
          <h2>Add New Expense</h2>
          <p className="muted-text">Record an expense, categorize it, and choose single/multi-payer with flexible splitting.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-warning-box">
          <div className="warning-icon-wrapper">
            <AlertCircleIcon size={20} />
          </div>
          <p>You need to add at least one group member above before you can record expenses.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="expense-form">
          {/* Title & Amount */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="exp-title">Expense Title / Description</label>
              <input
                id="exp-title"
                type="text"
                className="text-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Grocery run, Team dinner, Airport taxi..."
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="exp-amount">Total Amount ({currSymbol})</label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">{currSymbol}</span>
                <input
                  id="exp-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="text-input amount-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div className="form-group">
            <label>Category</label>
            <div className="category-chips-grid">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                    style={isSelected ? { borderColor: cat.color, backgroundColor: `${cat.color}22` } : {}}
                  >
                    <CategoryIcon id={cat.id} size={15} className="cat-icon-svg" />
                    <span className="cat-label">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid By Section */}
          <div className="form-group-section">
            <div className="section-subtitle-bar">
              <div className="section-title-with-icon">
                <CreditCardIcon size={16} />
                <label className="section-title">Paid By</label>
              </div>
              <button
                type="button"
                className="toggle-mode-btn"
                onClick={() => setIsMultiPayer(!isMultiPayer)}
              >
                {isMultiPayer ? 'Switch to Single Payer' : 'Multiple people paid? Click here'}
              </button>
            </div>

            {!isMultiPayer ? (
              <div className="payer-chips-list">
                {users.map((user) => (
                  <button
                    key={user}
                    type="button"
                    className={`user-chip ${singlePaidBy === user ? 'selected' : ''}`}
                    onClick={() => setSinglePaidBy(user)}
                  >
                    <span className="chip-avatar">{user.charAt(0)}</span>
                    <span>{user}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="multi-payer-box">
                <div className="multi-payer-actions">
                  <span className="hint-text">Select who paid and enter their contribution:</span>
                  {numAmount > 0 && Object.keys(paidByMap).length > 0 && (
                    <button
                      type="button"
                      className="text-btn btn-with-icon"
                      onClick={splitPaidAmountEqually}
                    >
                      <SparklesIcon size={13} />
                      <span>Split paid amount equally</span>
                    </button>
                  )}
                </div>

                <div className="payer-inputs-grid">
                  {users.map((user) => {
                    const isChecked = user in paidByMap;
                    return (
                      <div
                        key={user}
                        className={`payer-input-item ${isChecked ? 'active' : ''}`}
                      >
                        <div
                          className="payer-toggle"
                          onClick={() => togglePayer(user)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                          />
                          <span className="user-name-text">{user}</span>
                        </div>
                        {isChecked && (
                          <div className="payer-amount-field">
                            <span className="currency-prefix-small">{currSymbol}</span>
                            <input
                              type="number"
                              step="0.01"
                              className="text-input mini-input"
                              placeholder="0.00"
                              value={paidByMap[user]}
                              onChange={(e) => handlePayerAmountChange(user, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Split Mode Selector Tabs */}
          <div className="form-group-section">
            <div className="section-subtitle-bar">
              <div className="section-title-with-icon">
                <ScaleIcon size={16} />
                <label className="section-title">Split Method</label>
              </div>
            </div>

            <div className="split-type-tabs">
              {SPLIT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`split-type-tab ${splitType === type.id ? 'active' : ''}`}
                  onClick={() => setSplitType(type.id)}
                >
                  <SplitTypeIcon id={type.id} size={15} />
                  <span className="tab-label">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Split Participants Selection */}
            <div className="split-participants-bar">
              <span className="hint-text">Split between ({splitBetween.length} selected):</span>
              <div className="quick-select-actions">
                <button
                  type="button"
                  className="text-btn"
                  onClick={handleSelectAllSplitters}
                >
                  Select All
                </button>
                <span className="divider">|</span>
                <button
                  type="button"
                  className="text-btn"
                  onClick={handleDeselectAllSplitters}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Split Details Body Based on splitType */}
            {splitType === 'equal' && (
              <div className="equal-split-view">
                <div className="splitter-chips-list">
                  {users.map((user) => {
                    const isSelected = splitBetween.includes(user);
                    return (
                      <button
                        key={user}
                        type="button"
                        className={`splitter-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSplitUser(user)}
                      >
                        <span className="chip-avatar">{user.charAt(0)}</span>
                        <span>{user}</span>
                        {isSelected && <CheckCircleIcon size={14} className="check-mark-svg" />}
                      </button>
                    );
                  })}
                </div>
                {numAmount > 0 && splitBetween.length > 0 && (
                  <div className="split-summary-badge">
                    <span>Breakdown:</span>
                    <strong>{formatCurrency(perPersonEqual, currency)}</strong>
                    <span className="muted-text">per person ({splitBetween.length} sharing)</span>
                  </div>
                )}
              </div>
            )}

            {splitType === 'unequal' && (
              <div className="custom-split-view">
                <div className="custom-split-header">
                  <div className="status-indicator">
                    <span>Sum: <strong>{formatCurrency(unequalStats.sum, currency)}</strong></span>
                    <span> / Total: {formatCurrency(numAmount, currency)}</span>
                    {Math.abs(unequalStats.diff) > 0.01 ? (
                      <span className="diff-badge warning">
                        {unequalStats.diff > 0 ? `${formatCurrency(unequalStats.diff, currency)} left` : `${formatCurrency(Math.abs(unequalStats.diff), currency)} over`}
                      </span>
                    ) : (
                      <span className="diff-badge success">Balanced</span>
                    )}
                  </div>
                  <button type="button" className="text-btn btn-with-icon" onClick={handleAutoDistributeUnequal}>
                    <SparklesIcon size={13} />
                    <span>Distribute evenly</span>
                  </button>
                </div>

                <div className="custom-inputs-list">
                  {users.map((user) => {
                    const isSelected = splitBetween.includes(user);
                    return (
                      <div key={user} className={`custom-input-row ${isSelected ? 'active' : ''}`}>
                        <label className="user-toggle-label" onClick={() => toggleSplitUser(user)}>
                          <input type="checkbox" checked={isSelected} onChange={() => {}} />
                          <span className="user-name">{user}</span>
                        </label>
                        {isSelected && (
                          <div className="custom-input-field">
                            <span className="prefix">{currSymbol}</span>
                            <input
                              type="number"
                              step="0.01"
                              className="text-input mini-input"
                              placeholder="0.00"
                              value={customAmounts[user] || ''}
                              onChange={(e) =>
                                setCustomAmounts({ ...customAmounts, [user]: e.target.value })
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {splitType === 'percentage' && (
              <div className="custom-split-view">
                <div className="custom-split-header">
                  <div className="status-indicator">
                    <span>Total: <strong>{percentageStats.totalPct.toFixed(1)}%</strong> / 100%</span>
                    {Math.abs(percentageStats.diffPct) > 0.1 ? (
                      <span className="diff-badge warning">
                        {percentageStats.diffPct > 0 ? `${percentageStats.diffPct.toFixed(1)}% left` : `${Math.abs(percentageStats.diffPct).toFixed(1)}% over`}
                      </span>
                    ) : (
                      <span className="diff-badge success">Balanced</span>
                    )}
                  </div>
                  <button type="button" className="text-btn btn-with-icon" onClick={handleAutoDistributePercentages}>
                    <SparklesIcon size={13} />
                    <span>Split % equally</span>
                  </button>
                </div>

                <div className="custom-inputs-list">
                  {users.map((user) => {
                    const isSelected = splitBetween.includes(user);
                    const pctVal = parseFloat(customPercentages[user]) || 0;
                    const calculatedAmt = numAmount > 0 ? (pctVal / 100) * numAmount : 0;

                    return (
                      <div key={user} className={`custom-input-row ${isSelected ? 'active' : ''}`}>
                        <label className="user-toggle-label" onClick={() => toggleSplitUser(user)}>
                          <input type="checkbox" checked={isSelected} onChange={() => {}} />
                          <span className="user-name">{user}</span>
                        </label>
                        {isSelected && (
                          <div className="custom-input-group">
                            <span className="calculated-preview">{formatCurrency(calculatedAmt, currency)}</span>
                            <div className="custom-input-field">
                              <input
                                type="number"
                                step="0.5"
                                className="text-input mini-input"
                                placeholder="0"
                                value={customPercentages[user] || ''}
                                onChange={(e) =>
                                  setCustomPercentages({ ...customPercentages, [user]: e.target.value })
                                }
                              />
                              <span className="suffix">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {splitType === 'shares' && (
              <div className="custom-split-view">
                <div className="custom-split-header">
                  <div className="status-indicator">
                    <span>Total Shares: <strong>{sharesStats.totalShares}</strong></span>
                  </div>
                  <button type="button" className="text-btn btn-with-icon" onClick={handleResetShares}>
                    <RotateCcwIcon size={13} />
                    <span>Reset to 1 share each</span>
                  </button>
                </div>

                <div className="custom-inputs-list">
                  {users.map((user) => {
                    const isSelected = splitBetween.includes(user);
                    const s = parseInt(customShares[user], 10) || 0;
                    const calculatedAmt =
                      sharesStats.totalShares > 0 && numAmount > 0
                        ? (s / sharesStats.totalShares) * numAmount
                        : 0;

                    return (
                      <div key={user} className={`custom-input-row ${isSelected ? 'active' : ''}`}>
                        <label className="user-toggle-label" onClick={() => toggleSplitUser(user)}>
                          <input type="checkbox" checked={isSelected} onChange={() => {}} />
                          <span className="user-name">{user}</span>
                        </label>
                        {isSelected && (
                          <div className="custom-input-group">
                            <span className="calculated-preview">{formatCurrency(calculatedAmt, currency)}</span>
                            <div className="custom-input-field">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="text-input mini-input"
                                placeholder="1"
                                value={customShares[user] ?? 1}
                                onChange={(e) =>
                                  setCustomShares({ ...customShares, [user]: e.target.value })
                                }
                              />
                              <span className="suffix">shares</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {formError && <p className="error-message form-alert">{formError}</p>}

          <button type="submit" className="btn primary-btn submit-btn btn-with-icon">
            <PlusIcon size={16} />
            <span>Save Expense</span>
          </button>
        </form>
      )}
    </section>
  );
}
