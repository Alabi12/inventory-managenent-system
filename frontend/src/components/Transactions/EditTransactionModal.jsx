// src/components/Transactions/EditTransactionModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  AlertCircle,
  Calendar,
  Package,
  User,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

const EditTransactionModal = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false
}) => {
  const [formData, setFormData] = useState({
    product_name: '',
    product_sku: '',
    type: 'incoming',
    quantity: 0,
    amount: 0,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    created_by: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      const transactionDate = transaction.date 
        ? new Date(transaction.date).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
      
      setFormData({
        product_name: transaction.product_name || '',
        product_sku: transaction.product_sku || '',
        type: transaction.type || 'incoming',
        quantity: transaction.quantity || 0,
        amount: transaction.amount || 0,
        status: transaction.status || 'pending',
        date: transactionDate,
        created_by: transaction.created_by || ''
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }
    
    if (!formData.created_by.trim()) {
      newErrors.created_by = 'Created by field is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare the data for saving
    const saveData = {
      ...formData,
      quantity: Number(formData.quantity),
      amount: Number(formData.amount),
      // Convert date string to ISO format
      date: new Date(formData.date).toISOString()
    };
    
    onSave(transaction.id, saveData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      onDelete(transaction.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Create Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.product_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
              </div>
              {errors.product_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.product_name}
                </p>
              )}
            </div>
            
            {/* Product SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product SKU
              </label>
              <input
                type="text"
                name="product_sku"
                value={formData.product_sku}
                onChange={handleChange}
                className="pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter SKU (optional)"
              />
            </div>
            
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="incoming">Incoming</option>
                <option value="outgoing">Outgoing</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`pl-4 pr-4 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`pl-10 pr-4 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="processing">Processing</option>
              </select>
            </div>
            
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
            
            {/* Created By */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created By *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="created_by"
                  value={formData.created_by}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.created_by ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter creator name"
                />
              </div>
              {errors.created_by && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.created_by}
                </p>
              )}
            </div>
          </div>
          
          {/* Footer with Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {transaction && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Transaction'}
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;