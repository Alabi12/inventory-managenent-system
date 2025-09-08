// src/components/Transactions/TransactionsTable.jsx
import React, { useState, useCallback } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  RefreshCw, 
  Download, 
  Filter, 
  Search,
  MoreVertical,
  FileText,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

const TransactionsTable = ({ 
  transactions = [], 
  sortBy = 'date', 
  sortOrder = 'desc', 
  onSort = () => {},
  onRefresh = () => {},
  onExport = () => {},
  onViewDetails = null,
  onEdit = null,
  onDelete = null,
  onCreate = null,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  onFilter = () => {},
  filters = {},
  canEdit = true,
  canDelete = true,
  pageSize = 20
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [localFilters, setLocalFilters] = useState({
    type: filters.type || 'all',
    status: filters.status || 'all',
    dateRange: filters.dateRange || 'all',
    search: filters.search || ''
  });

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  const formatAmount = useCallback((amount) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    } catch (error) {
      return '$0.00';
    }
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      completed: { 
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '✓',
        label: 'Completed'
      },
      pending: { 
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: '⏳',
        label: 'Pending'
      },
      cancelled: { 
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '✗',
        label: 'Cancelled'
      },
      processing: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '↻',
        label: 'Processing'
      }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.completed;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
        <span className="mr-1.5 text-xs">{config.icon}</span>
        {config.label}
      </span>
    );
  }, []);

  const getTypeBadge = useCallback((type) => {
    const typeConfig = {
      incoming: { 
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <TrendingUp className="h-3 w-3" />,
        label: 'Incoming'
      },
      outgoing: { 
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: <TrendingDown className="h-3 w-3" />,
        label: 'Outgoing'
      },
      adjustment: { 
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: '⚡',
        label: 'Adjustment'
      }
    };
    
    const config = typeConfig[type?.toLowerCase()] || typeConfig.adjustment;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
        <span className="mr-1.5">{config.icon}</span>
        {config.label}
      </span>
    );
  }, []);

  const SortableHeader = useCallback(({ column, children, className = '' }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center">
          {children}
        </span>
        {sortBy === column && (
          <span className="ml-2 text-gray-400">
            {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </span>
        )}
      </div>
    </th>
  ), [sortBy, sortOrder, onSort]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilter('search', value);
  }, [onFilter]);

  const handleExport = useCallback((format) => {
    setShowExportMenu(false);
    onExport(format, { ...filters, search: searchTerm });
  }, [onExport, filters, searchTerm]);

  const handleViewDetails = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    if (onViewDetails) {
      onViewDetails(transaction);
    }
  }, [onViewDetails]);

  const handleEdit = useCallback((transaction) => {
    setShowActionsMenu(null);
    if (onEdit) {
      onEdit(transaction);
    }
  }, [onEdit]);

  const handleDelete = useCallback((transaction) => {
    setDeleteConfirm(transaction.id);
    setShowActionsMenu(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (onDelete && deleteConfirm) {
      onDelete(deleteConfirm);
    }
    setDeleteConfirm(null);
  }, [onDelete, deleteConfirm]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
    }
  }, [onCreate]);

  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    onFilter(filterType, value);
  }, [localFilters, onFilter]);

  const applyFilters = useCallback(() => {
    Object.entries(localFilters).forEach(([key, value]) => {
      onFilter(key, value);
    });
  }, [localFilters, onFilter]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      type: 'all',
      status: 'all',
      dateRange: 'all',
      search: ''
    };
    setLocalFilters(clearedFilters);
    setSearchTerm('');
    Object.entries(clearedFilters).forEach(([key, value]) => {
      onFilter(key, value);
    });
  }, [onFilter]);

  const Pagination = useCallback(() => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
          Showing <span className="font-semibold">{startItem}</span> to{' '}
          <span className="font-semibold">{endItem}</span> of{' '}
          <span className="font-semibold">{totalCount}</span> results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors duration-150"
              >
                1
              </button>
              {startPage > 2 && <span className="px-1 text-gray-400">...</span>}
            </>
          )}

          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors duration-150"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }, [currentPage, totalPages, totalCount, pageSize, onPageChange]);

  const FilterPanel = useCallback(() => (
    <div className="bg-gray-50 p-6 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={localFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="all">All Types</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="processing">Processing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={localFilters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Clear Filters
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  ), [localFilters, searchTerm, handleSearch, handleFilterChange, clearFilters, applyFilters]);

  const ActionMenu = useCallback(({ transaction }) => (
    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      <div className="py-1">
        <button
          onClick={() => handleViewDetails(transaction)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors duration-150"
        >
          <Eye className="h-4 w-4 mr-3 text-gray-500" />
          View Details
        </button>
        
        {canEdit && (
          <button
            onClick={() => handleEdit(transaction)}
            className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left transition-colors duration-150"
          >
            <Edit className="h-4 w-4 mr-3" />
            Edit Transaction
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => handleDelete(transaction)}
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-150"
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Delete
          </button>
        )}
      </div>
    </div>
  ), [canEdit, canDelete, handleViewDetails, handleEdit, handleDelete]);

  const DeleteConfirmation = useCallback(({ transactionId }) => (
    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
      <div className="flex items-start mb-3">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Confirm Deletion</h4>
          <p className="text-sm text-gray-600">Are you sure you want to delete this transaction? This action cannot be undone.</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={cancelDelete}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  ), [cancelDelete, confirmDelete]);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-sm font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 border-b border-gray-200 gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-600">
            {totalCount} transaction{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {onCreate && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
              showFilters
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors duration-150"
                  >
                    <FileText className="h-4 w-4 mr-3 text-gray-500" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors duration-150"
                  >
                    <FileText className="h-4 w-4 mr-3 text-gray-500" />
                    Export Excel
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader column="id" className="w-20">ID</SortableHeader>
              <SortableHeader column="date" className="w-48">Date & Time</SortableHeader>
              <SortableHeader column="product_name">Product</SortableHeader>
              <SortableHeader column="type" className="w-32">Type</SortableHeader>
              <SortableHeader column="quantity" className="w-24">Qty</SortableHeader>
              <SortableHeader column="amount" className="w-32">Amount</SortableHeader>
              <SortableHeader column="status" className="w-32">Status</SortableHeader>
              <SortableHeader column="created_by" className="w-40">Created By</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {Object.values(localFilters).some(filter => filter !== 'all' && filter !== '') 
                        ? 'Try adjusting your filters to see more results.'
                        : 'No transactions have been recorded yet.'
                      }
                    </p>
                    {Object.values(localFilters).some(filter => filter !== 'all' && filter !== '') && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 font-mono">
                      {transaction.id?.slice(-8)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product_name}
                        </div>
                        {transaction.product_sku && (
                          <div className="text-xs text-gray-500">
                            SKU: {transaction.product_sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getTypeBadge(transaction.type)}
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm font-semibold ${
                      transaction.type === 'incoming' 
                        ? 'text-green-600' 
                        : transaction.type === 'outgoing'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      <span className="mr-1 text-xs">
                        {transaction.type === 'incoming' ? '+' : transaction.type === 'outgoing' ? '-' : '±'}
                      </span>
                      {transaction.quantity?.toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatAmount(transaction.amount)}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-900">{transaction.created_by}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-150 rounded-md hover:bg-blue-50"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {(canEdit || canDelete) && (
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === transaction.id ? null : transaction.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-150 rounded-md hover:bg-gray-100"
                            title="More actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          
                          {showActionsMenu === transaction.id && (
                            <ActionMenu transaction={transaction} />
                          )}
                          
                          {deleteConfirm === transaction.id && (
                            <DeleteConfirmation transactionId={transaction.id} />
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && <Pagination />}
    </div>
  );
};

export default TransactionsTable;