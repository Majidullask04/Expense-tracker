# 💸 Expense Tracker & Splitter

A modern, fast, and feature-packed React application to track group expenses, manage multi-person payments, split costs evenly or customly, and automatically calculate simplified debt settlements.

![React 19](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/Design-Glassmorphism-1572B6?logo=css3&logoColor=white)

---

## ✨ Features

- **👥 Custom Group Management**: Start completely clean without default users. Add or remove group members dynamically.
- **💳 Multi-Payer Support**:
  - **Single Payer**: Easily select one person paying the total amount.
  - **Multiple Payers**: Record expenses where multiple people contributed money (e.g. Alex paid ₹500, Sarah paid ₹300) with a quick ⚡ *Auto-Split Paid Amount Equally* helper.
- **🍕 Flexible Expense Splitting**: Select specific participants to share an expense with instant per-person cost breakdown.
- **🤝 Debt Simplification Algorithm**: Calculates optimal debt transfer suggestions (e.g., *“Bob pays Alice ₹150.00”*) to clear all balances with minimal payments.
- **📊 Real-time Dashboard & Metrics**:
  - Group total spending tracker.
  - Per-person net balance cards with color-coded status badges (`Gets back`, `Owes`, or `Settled Up 🎉`).
- **🔍 Search & Filter**: Search recorded expenses by title, payer, or participant name.
- **💾 LocalStorage Persistence**: Automatically saves group members and expense history in browser local storage.
- **🎨 Glassmorphism UI**: Styled with sleek dark mode aesthetics, dynamic HSL colors, smooth transitions, and responsive design for mobile & desktop.

---

## 📁 Project Structure

```text
Expense-tracker/
├── public/                 # Static assets
├── src/
│   ├── components/         # Modular React components
│   │   ├── ExpenseForm.jsx        # Add expense with single/multi-payer & multi-splitter
│   │   ├── ExpenseList.jsx        # Searchable expense history feed
│   │   ├── SettlementSummary.jsx  # Debt transfer simplification
│   │   ├── SummaryCards.jsx       # Group spending & member net balance cards
│   │   └── UserManagement.jsx     # Dynamic group member addition/removal
│   ├── App.jsx             # Main state orchestration & localStorage sync
│   ├── App.css             # Component-level styles
│   ├── index.css           # Global glassmorphism design system & utility classes
│   └── main.jsx            # Application entry point
├── package.json            # Project dependencies & scripts
└── vite.config.js          # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port indicated in your terminal) to view the application in your browser.

---

## 🛠️ Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode with Hot Module Replacement (HMR).
- `npm run build`: Bundles the app into static files for production in `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs `oxlint` to analyze code for potential errors and warnings.

---

## 💡 How Expense Calculations Work

1. **Total Spent**: Sum of all recorded expense amounts.
2. **Total Paid**: Sum of all payments contributed by a person across all expenses.
3. **Total Share**: Sum of cost shares owed by a person for expenses they participated in.
4. **Net Balance**: `Total Paid - Total Share`
   - **Positive balance (`> 0`)**: Person gets money back.
   - **Negative balance (`< 0`)**: Person owes money to the group.
   - **Zero balance (`= 0`)**: Person is fully settled up.
5. **Settlements**: A greedy matching algorithm balances creditors and debtors to generate minimal peer-to-peer transfer steps.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
