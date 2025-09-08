      
 import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Download, Upload, Filter, FileText, BarChart3, 
  AlertTriangle, TrendingUp, Calendar, RefreshCw,
  ChevronDown, Printer, FileSpreadsheet, FileType,
  ChevronRight, Database, PieChart, Layers,
  Search, X, Save, FileUp, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { productsAPI, transactionsAPI } from '../services/api'; // Import your API functions

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    lowStockThreshold: 10,
    transactionType: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const reportTypes = [
    { 
      id: 'inventory', 
      name: 'Inventory Summary', 
      description: 'Current stock levels and values',
      icon: <Database className="h-5 w-5" />,
      color: 'bg-indigo-500'
    },
    { 
      id: 'transactions', 
      name: 'Transaction History', 
      description: 'All inventory movements',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    { 
      id: 'low-stock', 
      name: 'Low Stock Alert', 
      description: 'Products below minimum stock levels',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-amber-500'
    },
    { 
      id: 'sales', 
      name: 'Sales Report', 
      description: 'Revenue and product sales',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-emerald-500'
    },
  ];

  // API fetch functions using your API service
  const fetchInventoryData = useCallback(async () => {
    try {
      const response = await productsAPI.getProducts();
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      throw new Error('Failed to fetch inventory data. Please check your connection.');
    }
  }, []);

  const fetchTransactionsData = useCallback(async () => {
    try {
      const params = {};
      
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      if (filters.transactionType !== 'all') params.type = filters.transactionType;
      
      const response = await transactionsAPI.getTransactions(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions data:', error);
      throw new Error('Failed to fetch transactions data. Please check your connection.');
    }
  }, [dateRange, filters.transactionType]);

  const fetchTransactionStats = useCallback(async () => {
    try {
      const response = await transactionsAPI.getTransactionStats();
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw new Error('Failed to fetch transaction statistics.');
    }
  }, []);

  // Mock data fallback for development
  const getMockData = useCallback((reportType) => {
    switch (reportType) {
      case 'inventory':
        return [
          { id: 1, name: 'Product A', sku: 'SKU001', category: 'Electronics', quantity: 15, min_stock_level: 10, price: 99.99 },
          { id: 2, name: 'Product B', sku: 'SKU002', category: 'Books', quantity: 5, min_stock_level: 8, price: 24.99 },
          { id: 3, name: 'Product C', sku: 'SKU003', category: 'Electronics', quantity: 0, min_stock_level: 5, price: 149.99 }
        ];
      case 'transactions':
        return [
          { id: 1, date: new Date(), product_name: 'Product A', type: 'incoming', quantity: 10, previous_stock: 5, new_stock: 15, amount: 999.90, created_by: 'admin' },
          { id: 2, date: new Date(), product_name: 'Product B', type: 'outgoing', quantity: 3, previous_stock: 8, new_stock: 5, amount: 74.97, created_by: 'user' }
        ];
      case 'low-stock':
        return [
          { id: 2, name: 'Product B', sku: 'SKU002', category: 'Books', quantity: 5, min_stock_level: 8, price: 24.99 },
          { id: 4, name: 'Product D', sku: 'SKU004', category: 'Office', quantity: 2, min_stock_level: 10, price: 12.50 }
        ];
      case 'sales':
        return [
          { id: 2, date: new Date(), product_name: 'Product B', type: 'outgoing', quantity: 3, previous_stock: 8, new_stock: 5, amount: 74.97, created_by: 'user' }
        ];
      default:
        return [];
    }
  }, []);

  // Load report data with fallback to mock data
  const loadReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      let statsData = {};
      
      // Try to fetch real data first, fall back to mock data if it fails
      try {
        switch (selectedReport) {
          case 'inventory':
            data = await fetchInventoryData();
            statsData = {
              totalItems: data.length,
              totalValue: data.reduce((sum, product) => sum + (product.price * product.quantity), 0),
              lowStockItems: data.filter(p => p.quantity <= p.min_stock_level && p.quantity > 0).length,
              outOfStockItems: data.filter(p => p.quantity === 0).length
            };
            break;
            
          case 'transactions':
            data = await fetchTransactionsData();
            statsData = {
              totalTransactions: data.length,
              stockIns: data.filter(t => t.type === 'incoming').length,
              stockOuts: data.filter(t => t.type === 'outgoing').length,
              adjustments: data.filter(t => t.type === 'adjustment').length
            };
            break;
            
          case 'low-stock':
            const inventoryData = await fetchInventoryData();
            data = inventoryData.filter(product => 
              product.quantity <= (filters.lowStockThreshold || product.min_stock_level)
            );
            statsData = {
              criticalItems: data.filter(p => p.quantity <= 5).length,
              warningItems: data.filter(p => p.quantity > 5 && p.quantity <= p.min_stock_level).length,
              totalValue: data.reduce((sum, product) => sum + (product.price * product.quantity), 0)
            };
            break;
            
          case 'sales':
            const transactions = await fetchTransactionsData();
            data = transactions.filter(t => t.type === 'outgoing');
            statsData = await fetchTransactionStats();
            break;
            
          default:
            data = [];
        }
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        data = getMockData(selectedReport);
        
        // Generate mock stats based on mock data
        switch (selectedReport) {
          case 'inventory':
            statsData = {
              totalItems: data.length,
              totalValue: data.reduce((sum, product) => sum + (product.price * product.quantity), 0),
              lowStockItems: data.filter(p => p.quantity <= p.min_stock_level && p.quantity > 0).length,
              outOfStockItems: data.filter(p => p.quantity === 0).length
            };
            break;
          case 'transactions':
            statsData = {
              totalTransactions: data.length,
              stockIns: data.filter(t => t.type === 'incoming').length,
              stockOuts: data.filter(t => t.type === 'outgoing').length,
              adjustments: data.filter(t => t.type === 'adjustment').length
            };
            break;
          case 'low-stock':
            statsData = {
              criticalItems: data.filter(p => p.quantity <= 5).length,
              warningItems: data.filter(p => p.quantity > 5 && p.quantity <= p.min_stock_level).length,
              totalValue: data.reduce((sum, product) => sum + (product.price * product.quantity), 0)
            };
            break;
          case 'sales':
            statsData = {
              totalSales: data.length,
              totalRevenue: data.reduce((sum, sale) => sum + sale.amount, 0)
            };
            break;
        }
      }
      
      // Apply search filter
      if (searchQuery) {
        data = data.filter(item => {
          if (selectedReport === 'inventory' || selectedReport === 'low-stock') {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
          } else if (selectedReport === 'transactions' || selectedReport === 'sales') {
            return item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (item.product_sku && item.product_sku.toLowerCase().includes(searchQuery.toLowerCase()));
          }
          return true;
        });
      }
      
      // Apply category filter for inventory reports
      if (selectedReport === 'inventory' && filters.category) {
        data = data.filter(item => item.category === filters.category);
      }
      
      setReportData(data);
      setStats(statsData);
    } catch (error) {
      setError(error.message);
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedReport, 
    searchQuery, 
    filters.category, 
    filters.lowStockThreshold, 
    fetchInventoryData, 
    fetchTransactionsData, 
    fetchTransactionStats,
    getMockData
  ]);

  // Load data when report type or filters change
  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange, filters, searchQuery, loadReportData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await loadReportData();
    setIsGenerating(false);
  };

  const handleExport = async (format) => {
    setExportFormat(format);
    setIsGenerating(true);
    
    try {
      let response;
      
      // Use the appropriate API based on selected report
      if (selectedReport === 'inventory' || selectedReport === 'low-stock') {
        response = await productsAPI.exportProducts(format);
      } else if (selectedReport === 'transactions' || selectedReport === 'sales') {
        response = await transactionsAPI.exportTransactions(format);
      } else {
        throw new Error('Unsupported report type for export');
      }
      
      // Handle file download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      
      // Fallback: create CSV from current data if API export fails
      try {
        const csvContent = reportData.map(item => 
          Object.values(item).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (fallbackError) {
        setError('Export failed: ' + error.message);
      }
    } finally {
      setIsGenerating(false);
      setShowExportMenu(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setFilters({
      category: '',
      lowStockThreshold: 10,
      transactionType: 'all'
    });
    setSearchQuery('');
  };     

const renderReportContent = () => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading report data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-lg border border-red-200">
        <div className="mx-auto h-16 w-16 text-red-500 mb-4">
          <AlertCircle className="h-16 w-16" />
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadReportData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  switch (selectedReport) {
    case 'inventory':
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((product) => {
                const status = (product.quantity || 0) === 0 ? 'out_of_stock' : 
                             (product.quantity || 0) <= (product.min_stock_level || 0) ? 'low_stock' : 'in_stock';
                const value = (product.price || 0) * (product.quantity || 0);
                
                return (
                  <tr key={product.id} className={status !== 'in_stock' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name || 'Unnamed Product'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{product.sku || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category || 'Uncategorized'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={status !== 'in_stock' ? 'text-amber-700 font-semibold' : ''}>
                        {product.quantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.min_stock_level || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                        status === 'low_stock' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {status === 'out_of_stock' ? 'OUT OF STOCK' :
                         status === 'low_stock' ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      
    case 'transactions':
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((transaction) => {
                // FIXED: Add safety check for transaction.type
                const transactionType = transaction.type || 'unknown';
                const typeClass = transactionType === 'incoming' ? 'bg-green-100 text-green-800' : 
                                transactionType === 'outgoing' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800';
                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.date ? formatDate(transaction.date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.product_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${typeClass}`}>
                        {transactionType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.previous_stock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.new_stock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.created_by || 'System'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      
    case 'low-stock':
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((product) => {
                const status = (product.quantity || 0) === 0 ? 'out_of_stock' : 
                             (product.quantity || 0) <= (product.min_stock_level || 0) ? 'low_stock' : 'in_stock';
                const value = (product.price || 0) * (product.quantity || 0);
                
                return (
                  <tr key={product.id} className={status !== 'in_stock' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name || 'Unnamed Product'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{product.sku || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category || 'Uncategorized'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={status !== 'in_stock' ? 'text-amber-700 font-semibold' : ''}>
                        {product.quantity || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.min_stock_level || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                        status === 'low_stock' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {status === 'out_of_stock' ? 'OUT OF STOCK' :
                         status === 'low_stock' ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      
    case 'sales':
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {sale.date ? formatDate(sale.date) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.product_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sale.unit_price || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sale.amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {sale.customer_name || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      
    default:
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a report type</h3>
          <p className="text-gray-600">Choose a report type from the sidebar to view data</p>
        </div>
      );
  }
};

  const currentReport = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive inventory reports and insights</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating || loading}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating || loading ? 'animate-spin' : ''}`} />
              {isGenerating || loading ? 'Generating...' : 'Refresh Data'}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={reportData.length === 0 || loading}
                className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10 py-2 overflow-hidden">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <FileType className="h-4 w-4 mr-2 text-indigo-500" />
                    Export as Excel
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handlePrint}
              disabled={reportData.length === 0 || loading}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Selection Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2 text-indigo-500" />
                Report Types
              </h2>
              <div className="space-y-2">
                {reportTypes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      selectedReport === report.id
                        ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-indigo-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`p-2 rounded-lg ${report.color} text-white shadow-sm`}>
                        {report.icon}
                      </span>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-sm">{report.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                      </div>
                      {selectedReport === report.id && (
                        <ChevronRight className="h-4 w-4 text-indigo-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-gray-500" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {selectedReport === 'inventory' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">All Categories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Tablets">Tablets</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                )}

                {selectedReport === 'transactions' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                    <select
                      value={filters.transactionType}
                      onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="all">All Types</option>
                      <option value="incoming">Stock In</option>
                      <option value="outgoing">Stock Out</option>
                      <option value="adjustment">Adjustment</option>
                    </select>
                  </div>
                )}

                {selectedReport === 'low-stock' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={filters.lowStockThreshold}
                      onChange={(e) => setFilters(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || loading}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-200"
                >
                  {isGenerating || loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Applying Filters...
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <span className={`p-2 rounded-lg mr-3 ${currentReport?.color} text-white shadow-sm`}>
                        {currentReport?.icon}
                      </span>
                      {currentReport?.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {reportData.length} records found
                      {dateRange.start && dateRange.end && ` from ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                    <span className="text-sm text-gray-500">
                      {exportFormat && isGenerating ? `Exporting as ${exportFormat.toUpperCase()}...` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report Stats */}
              {reportData.length > 0 && !loading && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReport === 'inventory' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-indigo-600">{stats.totalItems}</div>
                          <div className="text-sm text-gray-600">Total Products</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalValue)}</div>
                          <div className="text-sm text-gray-600">Total Value</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</div>
                          <div className="text-sm text-gray-600">Low Stock Items</div>
                        </div>
                      </>
                    )}
                    
                    {selectedReport === 'transactions' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-indigo-600">{stats.totalTransactions}</div>
                          <div className="text-sm text-gray-600">Total Transactions</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-green-600">{stats.stockIns}</div>
                          <div className="text-sm text-gray-600">Stock Ins</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-red-600">{stats.stockOuts}</div>
                          <div className="text-sm text-gray-600">Stock Outs</div>
                        </div>
                      </>
                    )}
                    
                    {selectedReport === 'low-stock' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-red-600">{stats.criticalItems}</div>
                          <div className="text-sm text-gray-600">Critical Items</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-amber-600">{stats.warningItems}</div>
                          <div className="text-sm text-gray-600">Warning Items</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalValue)}</div>
                          <div className="text-sm text-gray-600">Total Value at Risk</div>
                        </div>
                      </>
                    )}
                    
                    {selectedReport === 'sales' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-indigo-600">{stats.totalSales}</div>
                          <div className="text-sm text-gray-600">Total Sales</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.profit)}</div>
                          <div className="text-sm text-gray-600">Profit</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6">
                {reportData.length === 0 && !loading && !error ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                      <FileText className="h-16 w-16" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No data available</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {dateRange.start || filters.category || filters.transactionType !== 'all' || searchQuery
                        ? 'Try adjusting your filters to see results'
                        : 'No data found for the selected report type'
                      }
                    </p>
                  </div>
                ) : (
                  renderReportContent()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;