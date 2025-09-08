// src/components/Transactions/Transactions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Download, 
  Filter, 
  Search,
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Package
} from 'lucide-react';
import { transactionsAPI } from '../services/api';
import TransactionModal from '../components/Transactions/TransactionModal';
import TransactionStats from '../components/Transactions/TransactionStats';
import TransactionsTable from '../components/Transactions/TransactionsTable';

const Transactions = ({ onError, onSuccess }) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionsAPI.getTransactions({
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        start_date: filters.startDate,
        end_date: filters.endDate,
        sortBy,
        sortOrder
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.response?.data?.message || 'Failed to fetch transactions');
      if (onError) onError(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, onError]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await transactionsAPI.getTransactionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      const response = await transactionsAPI.createTransaction(transactionData);
      await Promise.all([fetchTransactions(), fetchStats()]);
      setShowModal(false);
      if (onSuccess) onSuccess('Transaction completed successfully');
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError(error.response?.data?.message || 'Failed to create transaction');
      if (onError) onError(error.response?.data?.message || 'Failed to create transaction');
    }
  };

  const exportTransactions = async (format = 'csv') => {
    try {
      const response = await transactionsAPI.exportTransactions(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (onSuccess) onSuccess('Transactions exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      setError('Failed to export transactions');
      if (onError) onError('Failed to export transactions');
    }
  };

  if (loading && !transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <span className="text-gray-600 text-sm font-medium">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          </div>
          <p className="text-gray-500 text-sm">Track inventory movements and transactions</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportTransactions('csv')}
            className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-xs hover:shadow-sm"
          >
            <Download className="h-4 w-4 mr-2 text-gray-500" />
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Transaction Overview
            </h2>
          </div>
          <TransactionStats stats={stats} />
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            Recent Transactions
          </h2>
        </div>
        <TransactionsTable
          transactions={transactions}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRefresh={() => {
            fetchTransactions();
            fetchStats();
          }}
          loading={loading}
        />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleTransactionSubmit}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
};

export default Transactions;