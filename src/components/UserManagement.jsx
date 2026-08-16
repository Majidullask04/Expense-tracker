import { useState } from 'react';

export default function UserManagement({ users, onAddUser, onDeleteUser, expenses }) {
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Please enter a valid name.');
      return;
    }

    const formattedName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (users.some((u) => u.toLowerCase() === formattedName.toLowerCase())) {
      setError('A member with this name already exists.');
      return;
    }

    onAddUser(formattedName);
    setNameInput('');
    setError('');
  };

  const isUserInExpenses = (user) => {
    return expenses.some((exp) => {
      const payers = Object.keys(exp.paidByMap || {});
      const splitters = exp.splitBetween || [];
      return payers.includes(user) || splitters.includes(user);
    });
  };

  return (
    <section className="glass-panel user-management-section">
      <div className="section-header">
        <div>
          <h2>Group Members ({users.length})</h2>
          <p className="muted-text">Add people to split expenses with. Create your own custom members list.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="add-user-form">
        <div className="input-group">
          <input
            type="text"
            className="text-input"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter person's name (e.g., Alex, Priya)..."
          />
          <button type="submit" className="btn primary-btn">
            + Add Person
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="users-pill-grid">
        {users.length === 0 ? (
          <div className="empty-state-mini">
            <span className="icon">👥</span>
            <p>No group members added yet. Start by adding a member above!</p>
          </div>
        ) : (
          users.map((user) => {
            const inUse = isUserInExpenses(user);
            return (
              <div key={user} className="user-badge">
                <div className="user-avatar">{user.charAt(0)}</div>
                <span className="user-name">{user}</span>
                <button
                  type="button"
                  className="delete-user-btn"
                  onClick={() => onDeleteUser(user)}
                  title={inUse ? "Remove member from group" : "Remove person"}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
