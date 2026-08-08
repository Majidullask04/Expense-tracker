import { useState } from 'react'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState('');

  // Add a new expense and reset input fields
  function addExpense() {
    if (!title || !amount || !people) return; // simple validation
    const expense = {
      title,
      amount,
      people,
      id: Date.now(),
    };
    setExpenses([...expenses, expense]);
    // clear inputs for next entry
    setTitle('');
    setAmount('');
    setPeople('');
  }

  return (
    <div style={containerStyle}>
      <h1>Expense Tracker</h1>
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="people"
        value={people}
        onChange={e => setPeople(e.target.value)}
        style={inputStyle}
      />
      <button onClick={addExpense} style={buttonStyle}>Add Expense</button>
      <h2>Expenses</h2>
      {expenses.map(expense => (
        <div key={expense.id} style={expenseCardStyle}>
          <h3>{expense.title}</h3>
          <p>Amount: {expense.amount}</p>
          <p>People: {expense.people}</p>
        </div>
      ))}
    </div>
  );
}

// Simple inline styling for a premium look
const containerStyle = {
  maxWidth: '600px',
  margin: '2rem auto',
  padding: '1.5rem',
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  fontFamily: "'Inter', sans-serif",
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  margin: '0.5rem 0',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '0.5rem',
};

const expenseCardStyle = {
  background: 'rgba(240,240,240,0.8)',
  padding: '0.8rem',
  borderRadius: '8px',
  marginTop: '0.5rem',
};

export default App;