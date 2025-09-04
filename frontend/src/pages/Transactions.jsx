import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Download, Upload, Search, Filter, ChevronDown, 
  Calendar, X, Eye, Edit, Trash2, FileText, BarChart3,
  MoreVertical, RefreshCw, CheckCircle, AlertCircle, Clock,
  Save, ArrowLeft, Package, DollarSign, Hash
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products] = useState([
    { id: 1, name: 'MacBook Pro 16"', sku: 'MBP16-001', stock: 15, price: 2499 },
    { id: 2, name: 'iPhone 15 Pro', sku: 'IP15P-002', stock: 42, price: 999 },
    { id: 3, name: 'AirPods Pro', sku: 'APP-003', stock: 28, price: 249 },
    { id: 4, name: 'iPad Air', sku: 'IPA-004', stock: 18, price: 599 },
    { id: 5, name: 'Apple Watch Series 9', sku: 'AWS9-005', stock: 22, price: 399 },
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [actionLoading, setActionLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'out',
    quantity: '',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});

  // Sample data - replace with API call
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const sampleData = [
        { 
          id: 1, 
          date: '2024-01-15', 
          product_id: 1,
          product: 'MacBook Pro 16"', 
          type: 'in', 
          quantity: 5, 
          price: 2499, 
          total: 12495, 
          reference: 'REF-001', 
          status: 'completed',
          supplier: 'Apple Inc.',
          location: 'Warehouse A',
          notes: 'New stock received from main supplier'
        },
        { 
          id: 2, 
          date: '2024-01-14', 
          product_id: 2,
          product: 'iPhone 15 Pro', 
          type: 'out', 
          quantity: 3, 
          price: 999, 
          total: 2997, 
          reference: 'REF-002', 
          status: 'completed',
          customer: 'TechCorp Ltd.',
          location: 'Store Front',
          notes: 'Bulk order for corporate client'
        },
        { 
          id: 3, 
          date: '2024-01-13', 
          product_id: 3,
          product: 'AirPods Pro', 
          type: 'in', 
          quantity: 20, 
          price: 249, 
          total: 4980, 
          reference: 'REF-003', 
          status: 'pending',
          supplier: 'Audio Distributors',
          location: 'Warehouse B',
          notes: 'Backorder fulfillment'
        },
        { 
          id: 4, 
          date: '2024-01-12', 
          product_id: 4,
          product: 'iPad Air', 
          type: 'out', 
          quantity: 2, 
          price: 599, 
          total: 1198, 
          reference: 'REF-004', 
          status: 'completed',
          customer: 'John Smith',
          location: 'Online Store',
          notes: 'Online purchase with express shipping'
        },
        { 
          id: 5, 
          date: '2024-01-11', 
          product_id: 5,
          product: 'Apple Watch Series 9', 
          type: 'in', 
          quantity: 8, 
          price: 399, 
          total: 3192, 
          reference: 'REF-005', 
          status: 'completed',
          supplier: 'Watch Distributors Inc.',
          location: 'Warehouse A',
          notes: 'Seasonal stock replenishment'
        },
      ];
      setTransactions(sampleData);
      setLoading(false);
    }, 1000);
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        const product = products.find(p => p.id === transaction.product_id) || {};
        const matchesSearch = transaction.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || transaction.type === selectedType;
        const matchesDate = (!dateRange.start || transaction.date >= dateRange.start) &&
                           (!dateRange.end || transaction.date <= dateRange.end);
        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [transactions, searchTerm, selectedType, dateRange, sortConfig, products]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      product_id: transaction.product_id,
      type: transaction.type,
      quantity: transaction.quantity,
      reference: transaction.reference,
      notes: transaction.notes || '',
      date: transaction.date
    });
    setModalMode('edit');
    setShowModal(true);
    setFormErrors({});
  };

  const handleAddNew = () => {
    setSelectedTransaction(null);
    setFormData({
      product_id: '',
      type: 'out',
      quantity: '',
      reference: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setModalMode('add');
    setShowModal(true);
    setFormErrors({});
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete transaction ${transaction.reference}?`)) {
      return;
    }

    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      setActionLoading(false);
    }, 500);
  };

  const handleExport = (format) => {
    setActionLoading(true);
    // Simulate export process
    setTimeout(() => {
      const dataStr = JSON.stringify(filteredTransactions, null, 2);
      const dataUri = format === 'csv' 
        ? 'data:text/csv;charset=utf-8,' + encodeURIComponent(convertToCSV(filteredTransactions))
        : 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setActionLoading(false);
      setShowExportMenu(false);
    }, 1000);
  };

  const convertToCSV = (data) => {
    const headers = ['Date', 'Product', 'Reference', 'Type', 'Quantity', 'Price', 'Total', 'Status'];
    const csvData = data.map(item => [
      item.date,
      item.product,
      item.reference,
      item.type,
      item.quantity,
      item.price,
      item.total,
      item.status
    ]);
    
    return [headers, ...csvData].map(row => row.join(',')).join('\n');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.product_id) {
      errors.product_id = 'Product is required';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'Valid quantity is required';
    }
    
    if (!formData.reference) {
      errors.reference = 'Reference is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    // Check stock availability for stock out transactions
    if (formData.type === 'out' && formData.product_id) {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      if (product && parseInt(formData.quantity) > product.stock) {
        errors.quantity = `Insufficient stock. Only ${product.stock} available`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setActionLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      
      if (modalMode === 'add') {
        // Add new transaction
        const newTransaction = {
          id: Date.now(),
          date: formData.date,
          product_id: parseInt(formData.product_id),
          product: product.name,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          price: product.price,
          total: product.price * parseInt(formData.quantity),
          reference: formData.reference,
          status: 'completed',
          notes: formData.notes
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
      } else if (modalMode === 'edit' && selectedTransaction) {
        // Update existing transaction
        const updatedTransaction = {
          ...selectedTransaction,
          product_id: parseInt(formData.product_id),
          product: product.name,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          price: product.price,
          total: product.price * parseInt(formData.quantity),
          reference: formData.reference,
          notes: formData.notes,
          date: formData.date
        };
        
        setTransactions(prev => 
          prev.map(t => t.id === selectedTransaction.id ? updatedTransaction : t)
        );
      }
      
      setActionLoading(false);
      setShowModal(false);
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const icons = {
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      cancelled: <AlertCircle className="h-3 w-3 mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const SortableHeader = ({ label, sortKey, className = '' }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${
          sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? 'rotate-180' : '') : 'opacity-0 group-hover:opacity-50'
        }`} />
      </div>
    </th>
  );

  const PaginationButton = ({ onClick, disabled, children, active = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white border border-blue-600'
          : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
    >
      {children}
    </button>
  );

  const TransactionForm = () => {
    const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.product_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={modalMode === 'view'}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
            {formErrors.product_id && (
              <p className="mt-1 text-sm text-red-600">{formErrors.product_id}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="flex space-x-2">
              <label className="flex-1 flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="in"
                  checked={formData.type === 'in'}
                  onChange={handleInputChange}
                  className="sr-only"
                  disabled={modalMode === 'view'}
                />
                <div className={`w-full text-center py-2 rounded-lg border transition-colors ${
                  formData.type === 'in' 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  Stock In
                </div>
              </label>
              <label className="flex-1 flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="out"
                  checked={formData.type === 'out'}
                  onChange={handleInputChange}
                  className="sr-only"
                  disabled={modalMode === 'view'}
                />
                <div className={`w-full text-center py-2 rounded-lg border transition-colors ${
                  formData.type === 'out' 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  Stock Out
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={modalMode === 'view'}
              />
            </div>
            {formErrors.quantity && (
              <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.reference ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={modalMode === 'view'}
            />
            {formErrors.reference && (
              <p className="mt-1 text-sm text-red-600">{formErrors.reference}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={modalMode === 'view'}
            />
            {formErrors.date && (
              <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
            )}
          </div>
          
          {selectedProduct && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Unit Price</div>
              <div className="text-lg font-semibold">${selectedProduct.price.toLocaleString()}</div>
            </div>
          )}
        </div>
        
        {selectedProduct && formData.quantity && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700">Total Amount</div>
                <div className="text-xl font-bold text-blue-900">
                  ${(selectedProduct.price * parseInt(formData.quantity || 0)).toLocaleString()}
                </div>
              </div>
              {formData.type === 'out' && (
                <div className="text-right">
                  <div className="text-sm text-blue-700">Remaining Stock</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {selectedProduct.stock - parseInt(formData.quantity || 0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={modalMode === 'view'}
            placeholder="Add any additional notes about this transaction"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all inventory movements</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={fetchTransactions}
              disabled={loading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.type === 'in').length}
                </div>
                <div className="text-sm text-gray-600">Stock Ins</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-red-600">
                  {transactions.filter(t => t.type === 'out').length}
                </div>
                <div className="text-sm text-gray-600">Stock Outs</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-600">
                  ${transactions.reduce((sum, t) => sum + t.total, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, references, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters && <X className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">All Types</option>
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <span className="self-center text-gray-400">to</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <span className="text-sm text-gray-600">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} found
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Search className="h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedType !== 'all' || dateRange.start || dateRange.end
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by recording your first transaction'}
              </p>
              <button 
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Transaction
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortableHeader label="Date" sortKey="date" />
                      <SortableHeader label="Product" sortKey="product" />
                      <SortableHeader label="Reference" sortKey="reference" />
                      <SortableHeader label="Type" sortKey="type" />
                      <SortableHeader label="Qty" sortKey="quantity" />
                      <SortableHeader label="Total" sortKey="total" />
                      <SortableHeader label="Status" sortKey="status" />
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(transaction.date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.product}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-500 font-mono">{transaction.reference}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'in' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.quantity}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${transaction.total.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={transaction.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(transaction)}
                              className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(transaction)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> of{' '}
                      <span className="font-medium">{filteredTransactions.length}</span> results
                    </div>
                    <div className="flex space-x-1">
                      <PaginationButton
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </PaginationButton>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationButton
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            active={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationButton>
                        );
                      })}
                      
                      <PaginationButton
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </PaginationButton>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal for transaction details/edit/add */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {modalMode !== 'view' && (
                      <button
                        onClick={() => setModalMode('view')}
                        className="mr-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                    )}
                    <h3 className="text-lg font-semibold">
                      {modalMode === 'view' ? 'Transaction Details' : 
                       modalMode === 'edit' ? 'Edit Transaction' : 'New Transaction'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {modalMode === 'view' && selectedTransaction ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Transaction Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Reference Number</label>
                            <p className="text-gray-900 font-mono">{selectedTransaction.reference}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Date</label>
                            <p className="text-gray-900">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Type</label>
                            <p className="text-gray-900 capitalize">{selectedTransaction.type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1"><StatusBadge status={selectedTransaction.status} /></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Product Details</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Product</label>
                            <p className="text-gray-900">{selectedTransaction.product}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Quantity</label>
                            <p className="text-gray-900">{selectedTransaction.quantity}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Unit Price</label>
                            <p className="text-gray-900">${selectedTransaction.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Total Amount</label>
                            <p className="text-gray-900 font-semibold">${selectedTransaction.total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedTransaction.notes && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Notes</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTransaction.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <TransactionForm />
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                {modalMode === 'view' ? (
                  <>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => handleEdit(selectedTransaction)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Transaction
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={actionLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {modalMode === 'edit' ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {modalMode === 'edit' ? 'Update Transaction' : 'Create Transaction'}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;