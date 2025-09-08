// src/components/Transactions/TransactionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { inventoryAPI } from '../../services/api';

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction }) => {
  const [formData, setFormData] = useState({
    type: 'outgoing',
    product_id: '',
    quantity: '',
    amount: '',
    notes: '',
    reference: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (transaction) {
        setFormData({
          type: transaction.type,
          product_id: transaction.product_id,
          quantity: transaction.quantity,
          amount: transaction.amount,
          notes: transaction.notes,
          reference: transaction.reference
        });
      } else {
        setFormData({
          type: 'outgoing',
          product_id: '',
          quantity: '',
          amount: '',
          notes: '',
          reference: ''
        });
      }
    }
  }, [isOpen, transaction]);

  const fetchProducts = async () => {
    try {
      const response = await inventoryAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_id) newErrors.product_id = 'Product is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.amount || formData.amount < 0) newErrors.amount = 'Valid amount is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    if (formData.product_id && formData.quantity) {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      if (product) {
        const amount = parseFloat(formData.quantity) * parseFloat(product.price);
        setFormData(prev => ({ ...prev, amount: amount.toFixed(2) }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
              >
                <option value="incoming">Incoming Stock</option>
                <option value="outgoing">Outgoing Stock</option>
                <option value="adjustment">Stock Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                  errors.product_id ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                onBlur={calculateAmount}
                min="1"
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                  errors.quantity ? 'border-red-500' : ''
                }`}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border ${
                  errors.amount ? 'border-red-500' : ''
                }`}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="PO number, invoice number, etc."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes about this transaction..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {transaction ? 'Update' : 'Create'} Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;