import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, Search, AlertCircle, CheckCircle, Download, Upload, 
  Edit, Trash2, Printer, Plus, Eye, Save, FileText 
} from 'lucide-react';

const TransactionManagementSystem = () => {
  // State for transactions, products, and UI controls
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop', sku: 'LP1001', quantity: 15, unit: 'pcs', price: 999.99 },
    { id: 2, name: 'Mouse', sku: 'MS2002', quantity: 42, unit: 'pcs', price: 24.99 },
    { id: 3, name: 'Keyboard', sku: 'KB3003', quantity: 28, unit: 'pcs', price: 49.99 },
    { id: 4, name: 'Monitor', sku: 'MN4004', quantity: 18, unit: 'pcs', price: 299.99 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'view', 'edit', 'create'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'in', 'out'
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Load sample transactions on component mount
  useEffect(() => {
    const sampleTransactions = [
      { id: 1, product_id: 1, type: 'out', quantity: 2, notes: 'Sold to customer', date: '2023-05-15' },
      { id: 2, product_id: 2, type: 'in', quantity: 10, notes: 'New stock arrived', date: '2023-05-16' },
      { id: 3, product_id: 3, type: 'out', quantity: 5, notes: 'Office use', date: '2023-05-17' },
      { id: 4, product_id: 4, type: 'in', quantity: 3, notes: 'Supplier delivery', date: '2023-05-18' },
    ];
    setTransactions(sampleTransactions);
  }, []);

  // Filter transactions based on search and filter
  const filteredTransactions = transactions.filter(transaction => {
    const product = products.find(p => p.id === transaction.product_id);
    const matchesSearch = product && (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Open modal in different modes
  const openModal = (mode, transaction = null) => {
    setViewMode(mode);
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Close modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setImportError('');
    setImportSuccess('');
  };

  // Handle form submission for create and edit
  const handleSubmitTransaction = (data) => {
    if (viewMode === 'create') {
      // Create new transaction
      const newTransaction = {
        id: transactions.length + 1,
        ...data,
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions([...transactions, newTransaction]);
      
      // Update product quantity
      updateProductQuantity(data.product_id, data.type, parseInt(data.quantity));
    } else if (viewMode === 'edit') {
      // Update existing transaction
      const updatedTransactions = transactions.map(t =>
        t.id === selectedTransaction.id ? { ...t, ...data } : t
      );
      setTransactions(updatedTransactions);
    }
    
    closeModal();
  };

  // Update product quantity based on transaction
  const updateProductQuantity = (productId, type, quantity) => {
    setProducts(products.map(product => {
      if (product.id === parseInt(productId)) {
        return {
          ...product,
          quantity: type === 'in' 
            ? product.quantity + quantity 
            : product.quantity - quantity
        };
      }
      return product;
    }));
  };

  // Delete a transaction
  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Export transactions to CSV
  const handleExport = () => {
    const headers = ['ID', 'Product', 'SKU', 'Type', 'Quantity', 'Date', 'Notes'];
    const csvData = transactions.map(transaction => {
      const product = products.find(p => p.id === transaction.product_id);
      return [
        transaction.id,
        product ? product.name : 'N/A',
        product ? product.sku : 'N/A',
        transaction.type,
        transaction.quantity,
        transaction.date,
        transaction.notes || ''
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import transactions from file
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // Simple CSV parsing (in a real app, use a proper CSV parser)
        const lines = content.split('\n');
        const importedTransactions = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
          return {
            id: parseInt(values[0]),
            product_id: parseInt(values[1]),
            type: values[2],
            quantity: parseInt(values[3]),
            notes: values[4],
            date: values[5]
          };
        }).filter(t => t.id);
        
        setTransactions([...transactions, ...importedTransactions]);
        setImportSuccess(`${importedTransactions.length} transactions imported successfully`);
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        setImportError('Error importing file: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  };

  // Print transaction
  const handlePrint = (transaction) => {
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center; color: #4F46E5;">Transaction Receipt</h2>
        <div style="margin-top: 20px;">
          <p><strong>Transaction ID:</strong> ${transaction.id}</p>
          <p><strong>Date:</strong> ${transaction.date}</p>
          <p><strong>Type:</strong> ${transaction.type.toUpperCase()}</p>
          <p><strong>Quantity:</strong> ${transaction.quantity}</p>
          <p><strong>Notes:</strong> ${transaction.notes || 'N/A'}</p>
        </div>
        <p style="margin-top: 30px; text-align: center; color: #6B7280;">
          Generated on ${new Date().toLocaleDateString()}
        </p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Receipt</title>
        </head>
        <body onload="window.print(); window.close();">
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600">Manage your inventory transactions</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
              
              <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center hover:bg-gray-50">
                <Upload className="h-5 w-5 mr-2 text-gray-600" />
                Import
                <input type="file" className="hidden" accept=".csv" onChange={handleImport} />
              </label>
              
              <button
                onClick={handleExport}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center hover:bg-gray-50"
              >
                <Download className="h-5 w-5 mr-2 text-gray-600" />
                Export
              </button>
              
              <button
                onClick={() => openModal('create')}
                className="bg-primary-600 text-white rounded-lg px-4 py-2 flex items-center hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Transaction
              </button>
            </div>
          </div>

          {/* Import status messages */}
          {(importError || importSuccess) && (
            <div className={`mt-4 p-3 rounded-lg ${importError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {importError ? importError : importSuccess}
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const product = products.find(p => p.id === transaction.product_id);
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product ? product.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openModal('view', transaction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', transaction)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrint(transaction)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new transaction.</p>
              <div className="mt-6">
                <button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  New Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmitTransaction}
          products={products}
          mode={viewMode}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
};

// Transaction Modal Component
const TransactionModal = ({ isOpen, onClose, onSubmit, products, mode, transaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
    clearErrors,
  } = useForm();

  const transactionType = watch('type');
  const quantity = watch('quantity');
  const productId = watch('product_id');

  // Set form values when editing an existing transaction
  useEffect(() => {
    if (transaction && mode === 'edit') {
      reset({
        product_id: transaction.product_id,
        type: transaction.type,
        quantity: transaction.quantity,
        notes: transaction.notes || '',
      });
      
      const product = products.find(p => p.id === transaction.product_id);
      if (product) {
        setSelectedProduct(product);
        setSearchTerm(product.name);
      }
    } else if (mode === 'create') {
      reset({
        product_id: '',
        type: 'out',
        quantity: '',
        notes: '',
      });
    }
  }, [transaction, mode, reset, products]);

  // Filter products based on search term
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setValue('product_id', product.id);
    setSearchTerm(product.name);
    setShowProductDropdown(false);
    clearErrors('product_id');
    if (quantity) {
      trigger('quantity');
    }
  };

  const handleSearchFocus = () => {
    setShowProductDropdown(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowProductDropdown(true);
    if (selectedProduct && e.target.value !== selectedProduct.name) {
      setSelectedProduct(null);
      setValue('product_id', '');
    }
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    setIsSubmitting(false);
  };

  const getNewQuantity = () => {
    if (!selectedProduct || !quantity) return '-';
    const qty = parseInt(quantity);
    return transactionType === 'in' 
      ? selectedProduct.quantity + qty
      : selectedProduct.quantity - qty;
  };

  const isQuantityValid = () => {
    if (!selectedProduct || !quantity) return true;
    const qty = parseInt(quantity);
    if (transactionType === 'out' && qty > selectedProduct.quantity) {
      return false;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Transaction' : mode === 'view' ? 'View Transaction' : 'New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Product Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full transition-colors"
                autoComplete="off"
                readOnly={mode === 'view'}
              />
              {searchTerm && mode !== 'view' && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProduct(null);
                    setValue('product_id', '');
                    setShowProductDropdown(true);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {showProductDropdown && searchTerm && mode !== 'view' && (
              <div className="absolute z-10 mt-1 w-full border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 flex justify-between mt-1">
                      <span>SKU: {product.sku}</span>
                      <span>Stock: {product.quantity} {product.unit}</span>
                    </div>
                    <div className="text-sm font-medium text-primary-600 mt-1">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-4 text-center text-gray-500 flex flex-col items-center">
                    <Search className="h-8 w-8 mb-2 text-gray-300" />
                    <p>No products found</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                )}
              </div>
            )}

            {selectedProduct && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-900">{selectedProduct.name}</div>
                <div className="text-sm text-blue-700 flex justify-between mt-1">
                  <span>SKU: {selectedProduct.sku}</span>
                  <span>Stock: {selectedProduct.quantity} {selectedProduct.unit}</span>
                </div>
                <div className="text-sm font-medium text-blue-900 mt-1">
                  ${selectedProduct.price.toFixed(2)}
                </div>
              </div>
            )}

            <input 
              type="hidden" 
              {...register('product_id', { required: 'Product selection is required' })} 
              readOnly={mode === 'view'}
            />
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.product_id.message}
              </p>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex cursor-pointer rounded-lg overflow-hidden">
                <input
                  type="radio"
                  value="in"
                  {...register('type', { required: 'Transaction type is required' })}
                  className="peer sr-only"
                  disabled={mode === 'view'}
                />
                <div className="flex items-center justify-center p-4 border-2 border-gray-300 w-full rounded-lg transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:ring-2 peer-checked:ring-primary-200 hover:border-gray-400">
                  <span className={`font-medium ${transactionType === 'in' ? 'text-primary-700' : 'text-gray-700'}`}>
                    Stock In
                  </span>
                </div>
              </label>
              <label className="relative flex cursor-pointer rounded-lg overflow-hidden">
                <input
                  type="radio"
                  value="out"
                  {...register('type', { required: 'Transaction type is required' })}
                  className="peer sr-only"
                  disabled={mode === 'view'}
                  defaultChecked
                />
                <div className="flex items-center justify-center p-4 border-2 border-gray-300 w-full rounded-lg transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:ring-2 peer-checked:ring-primary-200 hover:border-gray-400">
                  <span className={`font-medium ${transactionType === 'out' ? 'text-primary-700' : 'text-gray-700'}`}>
                    Stock Out
                  </span>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
                validate: (value) => {
                  if (transactionType === 'out' && selectedProduct) {
                    return parseInt(value) <= selectedProduct.quantity || 
                      `Cannot exceed available stock (${selectedProduct.quantity})`;
                  }
                  return true;
                },
              })}
              className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter quantity"
              readOnly={mode === 'view'}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Stock Information */}
          {selectedProduct && quantity && !isNaN(quantity) && (
            <div className={`p-4 rounded-lg ${isQuantityValid() ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-start">
                {isQuantityValid() ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div className="text-sm">
                  <div className="font-medium mb-1">Stock Update Preview</div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">{selectedProduct.quantity} {selectedProduct.unit}</span>
                    
                    <span className="text-gray-600">Change:</span>
                    <span className={transactionType === 'in' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {transactionType === 'in' ? '+' : '-'} {quantity} {selectedProduct.unit}
                    </span>
                    
                    <span className="text-gray-600">New Total:</span>
                    <span className="font-medium">{getNewQuantity()} {selectedProduct.unit}</span>
                  </div>
                  {!isQuantityValid() && (
                    <div className="mt-2 text-amber-700">
                      Warning: This transaction will result in negative inventory.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows={3}
              {...register('notes')}
              placeholder="Add any notes about this transaction..."
              className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              readOnly={mode === 'view'}
            />
          </div>

          {/* Actions */}
          {mode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
                className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'edit' ? 'Updating...' : 'Processing...'}
                  </span>
                ) : (
                  mode === 'edit' ? 'Update Transaction' : 'Create Transaction'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TransactionManagementSystem;