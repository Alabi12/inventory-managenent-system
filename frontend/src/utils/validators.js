export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters';
  }

  if (!product.sku || product.sku.trim().length < 3) {
    errors.sku = 'SKU must be at least 3 characters';
  }

  if (!product.price || product.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!product.quantity || product.quantity < 0) {
    errors.quantity = 'Quantity cannot be negative';
  }

  if (!product.min_stock_level || product.min_stock_level < 0) {
    errors.min_stock_level = 'Minimum stock level cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTransaction = (transaction) => {
  const errors = {};

  if (!transaction.product_id) {
    errors.product_id = 'Product is required';
  }

  if (!transaction.quantity || transaction.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  if (!transaction.type || !['in', 'out'].includes(transaction.type)) {
    errors.type = 'Transaction type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};