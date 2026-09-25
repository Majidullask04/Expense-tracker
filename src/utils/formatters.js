import { CURRENCIES, CATEGORIES } from '../constants/categories';

export function formatCurrency(val, currencyCode = 'INR') {
  const num = Number(val) || 0;
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  
  try {
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: curr.code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${curr.symbol}${num.toFixed(2)}`;
  }
}

export function getCurrencySymbol(currencyCode = 'INR') {
  return CURRENCIES[currencyCode]?.symbol || '₹';
}

export function getCategoryById(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
}
