export const formatPrice = (amount, currency = 'INR') => {
  if (amount == null || isNaN(amount)) return '—';
  const symbols = { INR: '₹', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || '';
  return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const calculateDiscount = (price, salePrice) => {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

export const generateOrderNumber = () => {
  const prefix = 'NEB';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getEstimatedDelivery = (days = 5) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed', icon: 'CheckCircle' },
  { key: 'confirmed', label: 'Confirmed', icon: 'PackageCheck' },
  { key: 'packed', label: 'Packed', icon: 'Box' },
  { key: 'shipped', label: 'Shipped', icon: 'Truck' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: ' Bike' },
  { key: 'delivered', label: 'Delivered', icon: 'Home' },
];

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: 'CreditCard' },
  { id: 'upi', label: 'UPI', icon: 'Smartphone' },
  { id: 'netbanking', label: 'Net Banking', icon: 'Building2' },
  { id: 'wallet', label: 'Wallet', icon: 'Wallet' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'Banknote' },
];