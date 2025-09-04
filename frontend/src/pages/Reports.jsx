import React, { useState, useMemo } from 'react';
import { 
  Download, Upload, Filter, FileText, BarChart3, 
  AlertTriangle, TrendingUp, Calendar, RefreshCw,
  ChevronDown, Printer, FileSpreadsheet, FileType,
  ChevronRight, Database, PieChart, Layers,
  Search, X, Save, FileUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

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

  // Sample data
  const sampleProducts = [
    { id: 1, name: 'MacBook Pro 16"', sku: 'MBP16-001', category: 'Electronics', quantity: 45, min_stock: 10, price: 2499, value: 112455 },
    { id: 2, name: 'iPhone 15 Pro', sku: 'IP15P-002', category: 'Electronics', quantity: 8, min_stock: 15, price: 999, value: 7992 },
    { id: 3, name: 'AirPods Pro', sku: 'APP-003', category: 'Audio', quantity: 28, min_stock: 20, price: 249, value: 6972 },
    { id: 4, name: 'iPad Air', sku: 'IPA-004', category: 'Tablets', quantity: 18, min_stock: 10, price: 599, value: 10782 },
    { id: 5, name: 'Apple Watch Series 9', sku: 'AWS9-005', category: 'Wearables', quantity: 22, min_stock: 15, price: 399, value: 8778 },
    { id: 6, name: 'Magic Keyboard', sku: 'MK-006', category: 'Accessories', quantity: 5, min_stock: 8, price: 199, value: 995 },
    { id: 7, name: 'Magic Mouse', sku: 'MM-007', category: 'Accessories', quantity: 3, min_stock: 5, price: 99, value: 297 },
  ];

  const sampleTransactions = [
    { id: 1, date: '2024-01-15', product: 'MacBook Pro 16"', type: 'in', quantity: 20, user: 'Admin', value: 49980 },
    { id: 2, date: '2024-01-14', product: 'iPhone 15 Pro', type: 'out', quantity: 5, user: 'Staff', value: 4995 },
    { id: 3, date: '2024-01-13', product: 'AirPods Pro', type: 'in', quantity: 25, user: 'Admin', value: 6225 },
    { id: 4, date: '2024-01-12', product: 'iPad Air', type: 'out', quantity: 2, user: 'Staff', value: 1198 },
    { id: 5, date: '2024-01-11', product: 'Apple Watch Series 9', type: 'in', quantity: 15, user: 'Admin', value: 5985 },
  ];

  const filteredData = useMemo(() => {
    let data = [];
    
    switch (selectedReport) {
      case 'inventory':
        data = sampleProducts.filter(product => {
          const matchesCategory = !filters.category || product.category === filters.category;
          const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        break;
        
      case 'transactions':
        data = sampleTransactions.filter(transaction => {
          const matchesDate = (!dateRange.start || transaction.date >= dateRange.start) &&
                            (!dateRange.end || transaction.date <= dateRange.end);
          const matchesType = filters.transactionType === 'all' || transaction.type === filters.transactionType;
          const matchesSearch = !searchQuery || 
            transaction.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.user.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesDate && matchesType && matchesSearch;
        });
        break;
        
      case 'low-stock':
        data = sampleProducts.filter(product => 
          product.quantity <= (filters.lowStockThreshold || product.min_stock)
        ).filter(product => 
          !searchQuery || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
        break;
        
      case 'sales':
        data = sampleTransactions.filter(transaction => 
          transaction.type === 'out' &&
          (!dateRange.start || transaction.date >= dateRange.start) &&
          (!dateRange.end || transaction.date <= dateRange.end) &&
          (!searchQuery || transaction.product.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        break;
        
      default:
        data = [];
    }
    
    return data;
  }, [selectedReport, dateRange, filters, searchQuery]);

  const reportStats = useMemo(() => {
    switch (selectedReport) {
      case 'inventory':
        return {
          totalItems: sampleProducts.length,
          totalValue: sampleProducts.reduce((sum, product) => sum + product.value, 0),
          lowStockItems: sampleProducts.filter(p => p.quantity <= p.min_stock).length
        };
        
      case 'transactions':
        return {
          totalTransactions: filteredData.length,
          stockIns: filteredData.filter(t => t.type === 'in').length,
          stockOuts: filteredData.filter(t => t.type === 'out').length
        };
        
      case 'low-stock':
        return {
          criticalItems: filteredData.filter(p => p.quantity <= 5).length,
          warningItems: filteredData.filter(p => p.quantity > 5 && p.quantity <= p.min_stock).length,
          totalValue: filteredData.reduce((sum, product) => sum + product.value, 0)
        };
        
      case 'sales':
        return {
          totalSales: filteredData.length,
          totalRevenue: filteredData.reduce((sum, transaction) => sum + transaction.value, 0),
          averageSale: filteredData.length > 0 ? 
            filteredData.reduce((sum, transaction) => sum + transaction.value, 0) / filteredData.length : 0
        };
        
      default:
        return {};
    }
  }, [selectedReport, filteredData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
  };

  const handleExport = (format) => {
    setExportFormat(format);
    setIsGenerating(true);
    
    setTimeout(() => {
      const dataStr = JSON.stringify(filteredData, null, 2);
      const dataUri = format === 'csv' 
        ? 'data:text/csv;charset=utf-8,' + encodeURIComponent(convertToCSV(filteredData))
        : 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setIsGenerating(false);
      setShowExportMenu(false);
    }, 1000);
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvData = data.map(item => headers.map(header => item[header]));
    
    return [headers, ...csvData].map(row => row.join(',')).join('\n');
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((product) => (
                  <tr key={product.id} className={product.quantity <= product.min_stock ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={product.quantity <= product.min_stock ? 'text-amber-700 font-semibold' : ''}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.min_stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.value)}
                    </td>
                  </tr>
                ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.user}
                    </td>
                  </tr>
                ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((product) => (
                  <tr key={product.id} className={product.quantity <= 5 ? 'bg-red-50 hover:bg-red-100' : 'bg-amber-50 hover:bg-amber-100'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className={product.quantity <= 5 ? 'text-red-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.min_stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        product.quantity <= 5 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {product.quantity <= 5 ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </td>
                  </tr>
                ))}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.value / transaction.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <PieChart className="h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select a report type</h3>
            <p className="text-gray-500 max-w-md mx-auto">Choose a report from the sidebar to generate and view analytical data</p>
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
              disabled={isGenerating}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Refresh Data'}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={filteredData.length === 0}
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
                    onClick={() => handleExport('json')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <FileType className="h-4 w-4 mr-2 text-indigo-500" />
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handlePrint}
              disabled={filteredData.length === 0}
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
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
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
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-200"
                >
                  {isGenerating ? (
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
                      {filteredData.length} records found
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
              {filteredData.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReport === 'inventory' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-indigo-600">{reportStats.totalItems}</div>
                          <div className="text-sm text-gray-600">Total Products</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(reportStats.totalValue)}</div>
                          <div className="text-sm text-gray-600">Total Value</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-amber-600">{reportStats.lowStockItems}</div>
                          <div className="text-sm text-gray-600">Low Stock Items</div>
                        </div>
                      </>
                    )}
                    
                    {selectedReport === 'transactions' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-indigo-600">{reportStats.totalTransactions}</div>
                          <div className="text-sm text-gray-600">Total Transactions</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-green-600">{reportStats.stockIns}</div>
                          <div className="text-sm text-gray-600">Stock Ins</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-red-600">{reportStats.stockOuts}</div>
                          <div className="text-sm text-gray-600">Stock Outs</div>
                        </div>
                      </>
                    )}
                    
                    {selectedReport === 'low-stock' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-red-600">{reportStats.criticalItems}</div>
                          <div className="text-sm text-gray-600">Critical Items</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-amber-600">{reportStats.warningItems}</div>
                          <div className="text-sm text-gray-600">Warning Items</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(reportStats.totalValue)}</div>
                          <div className="text-sm text-gray-600">Total Value at Risk</div>
                        </div>
                      </>
                    )}
                    
                    {selectedReport === 'sales' && (
                      <>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-indigo-600">{reportStats.totalSales}</div>
                          <div className="text-sm text-gray-600">Total Sales</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(reportStats.totalRevenue)}</div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">{formatCurrency(reportStats.averageSale)}</div>
                          <div className="text-sm text-gray-600">Average Sale</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6">
                {filteredData.length === 0 ? (
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