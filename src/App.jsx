import { useMemo, useState } from 'react';

const defaultUsers = ['Alice', 'Bob', 'Charlie'];

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

function App() {
  const [users, setUsers] = useState(defaultUsers);
  const [newUser, setNewUser] = useState('');
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: 'Groceries',
      amount: 120,
      paidBy: 'Alice',
      users: ['Alice', 'Bob', 'Charlie'],
    },
    {
      id: 2,
      title: 'Movie night',
      amount: 60,
      paidBy: 'Bob',
      users: ['Alice', 'Bob'],
    },
  ]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(defaultUsers[0]);
  const [selectedUsers, setSelectedUsers] = useState(defaultUsers);

  const totals = useMemo(() => {
    const perUser = {};

    users.forEach((user) => {
      perUser[user] = { paid: 0, share: 0, balance: 0 };
    });

    expenses.forEach((expense) => {
      const expenseUsers = expense.users.length ? expense.users : [expense.paidBy];
      const splitValue = expense.amount / expenseUsers.length;

      perUser[expense.paidBy].paid += expense.amount;

      expenseUsers.forEach((user) => {
        if (perUser[user]) {
          perUser[user].share += splitValue;
        }
      });
    });

    Object.keys(perUser).forEach((user) => {
      perUser[user].balance = perUser[user].paid - perUser[user].share;
    });

    const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return { totalSpent, perUser };
  }, [expenses, users]);

  function addUser() {
    const trimmedName = newUser.trim();

    if (!trimmedName) {
      return;
    }

    const cleanedName = `${trimmedName.charAt(0).toUpperCase()}${trimmedName.slice(1).toLowerCase()}`;

    if (users.some((user) => user.toLowerCase() === cleanedName.toLowerCase())) {
      setNewUser('');
      return;
    }

    setUsers((currentUsers) => [...currentUsers, cleanedName]);
    setSelectedUsers((currentUsers) => [...currentUsers, cleanedName]);
    setPaidBy(cleanedName);
    setNewUser('');
  }

  function toggleUser(username) {
    setSelectedUsers((currentUsers) => {
      if (currentUsers.includes(username)) {
        return currentUsers.filter((user) => user !== username);
      }

      return [...currentUsers, username];
    });
  }

  function addExpense() {
    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle || !numericAmount || selectedUsers.length === 0) {
      return;
    }

    const expense = {
      id: Date.now(),
      title: trimmedTitle,
      amount: numericAmount,
      paidBy,
      users: selectedUsers,
    };

    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
    setTitle('');
    setAmount('');
    setPaidBy(users[0] || '');
    setSelectedUsers(users);
  }

  function deleteExpense(id) {
    setExpenses((currentExpenses) => currentExpenses.filter((expense) => expense.id !== id));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Group finance</p>
          <h1>Expense Tracker</h1>
        </div>
        <div className="total-badge">
          <span>Total spent</span>
          <strong>{formatMoney(totals.totalSpent)}</strong>
        </div>
      </header>

      <section className="panel">
        <h2>Add a user</h2>
        <div className="inline-form">
          <input
            type="text"
            value={newUser}
            onChange={(event) => setNewUser(event.target.value)}
            placeholder="Add a name"
          />
          <button type="button" onClick={addUser}>Add user</button>
        </div>
      </section>

      <section className="panel">
        <h2>Add expense</h2>
        <div className="form-grid">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Expense title"
          />
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Amount"
            min="0"
            step="0.01"
          />
          <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)}>
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        <div className="split-box">
          <span className="split-label">Split among</span>
          <div className="user-pills">
            {users.map((user) => (
              <label key={user} className={`pill ${selectedUsers.includes(user) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user)}
                  onChange={() => toggleUser(user)}
                />
                <span>{user}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="button" className="primary-btn" onClick={addExpense}>
          Add expense
        </button>
      </section>

      <section className="summary-grid">
        {users.map((user) => {
          const userData = totals.perUser[user];
          const balanceText = userData.balance >= 0 ? `Gets back ${formatMoney(userData.balance)}` : `Owes ${formatMoney(Math.abs(userData.balance))}`;

          return (
            <div key={user} className="summary-card">
              <p className="person-name">{user}</p>
              <div className="summary-row">
                <span>Paid</span>
                <strong>{formatMoney(userData.paid)}</strong>
              </div>
              <div className="summary-row">
                <span>Share</span>
                <strong>{formatMoney(userData.share)}</strong>
              </div>
              <div className={`balance ${userData.balance >= 0 ? 'positive' : 'negative'}`}>
                {balanceText}
              </div>
            </div>
          );
        })}
      </section>

      <section className="panel expenses-panel">
        <h2>Recent expenses</h2>

        {expenses.length === 0 ? (
          <p className="empty-state">No expenses yet. Add your first one above.</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-main">
                <div>
                  <h3>{expense.title}</h3>
                  <p className="muted">Paid by {expense.paidBy}</p>
                </div>
                <strong className="amount">{formatMoney(expense.amount)}</strong>
              </div>

              <div className="expense-meta">
                <span>Split between: {expense.users.join(', ')}</span>
                <button type="button" onClick={() => deleteExpense(expense.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;