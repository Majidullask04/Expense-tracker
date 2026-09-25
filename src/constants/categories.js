export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', iconName: 'UtensilsIcon', color: '#f59e0b' },
  { id: 'transport', label: 'Transport & Fuel', iconName: 'CarIcon', color: '#3b82f6' },
  { id: 'groceries', label: 'Groceries & Mart', iconName: 'ShoppingCartIcon', color: '#10b981' },
  { id: 'housing', label: 'Rent & Housing', iconName: 'HomeIcon', color: '#8b5cf6' },
  { id: 'entertainment', label: 'Entertainment', iconName: 'FilmIcon', color: '#ec4899' },
  { id: 'utilities', label: 'Bills & Utilities', iconName: 'ZapIcon', color: '#06b6d4' },
  { id: 'shopping', label: 'Shopping', iconName: 'ShoppingBagIcon', color: '#f43f5e' },
  { id: 'general', label: 'General / Other', iconName: 'TagIcon', color: '#64748b' },
];

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
};

export const SPLIT_TYPES = [
  { id: 'equal', label: 'Equal', iconName: 'ScaleIcon', description: 'Split equally among participants' },
  { id: 'unequal', label: 'Exact Amounts', iconName: 'HashIcon', description: 'Specify exact amounts for each person' },
  { id: 'percentage', label: 'Percentages (%)', iconName: 'PercentIcon', description: 'Split by custom percentages' },
  { id: 'shares', label: 'Shares / Weights', iconName: 'PieChartIcon', description: 'Split by custom shares (e.g., 2:1:1)' },
];
