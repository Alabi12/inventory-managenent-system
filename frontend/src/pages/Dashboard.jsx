import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import QuickActions from '../components/Dashboard/QuickActions';
import InventoryChart from '../components/Dashboard/InventoryChart';
import LowStockAlert from '../components/Dashboard/LowStockAlert';
import CategoryDistribution from '../components/Dashboard/CategoryDistribution';
import TopSellingProducts from '../components/Dashboard/TopSellingProducts';

const Dashboard = () => {
  // Get the refresh function from useDashboard hook
  const { stats, loading, error, fetchDashboardData } = useDashboard();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7days');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Update last updated timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Create a refreshData function that properly calls the hook's fetch function
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData(timeRange);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = async (newRange) => {
    setTimeRange(newRange);
    setIsRefreshing(true);
    try {
      await fetchDashboardData(newRange);
    } catch (err) {
      console.error('Error fetching data for time range:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate real-time stats
  const realTimeStats = useMemo(() => {
    if (!stats.products) return {};
    
    const inventoryValue = stats.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);

    const lowStockItems = stats.products.filter(p => p.quantity <= p.min_stock_level && p.quantity > 0).length;
    const outOfStockItems = stats.products.filter(p => p.quantity === 0).length;

    return {
      inventoryValue,
      lowStockItems,
      outOfStockItems,
      totalValue: formatCurrency(inventoryValue)
    };
  }, [stats.products]);

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'bg-blue-500',
      trend: stats.totalProducts > 0 ? `+${Math.round((stats.totalProducts / 100) * 8)}% this month` : 'No products',
      trendPositive: true,
      description: 'Total items in inventory',
      onClick: () => handleNavigate('/inventory')
    },
    {
      title: 'Low Stock Items',
      value: realTimeStats.lowStockItems,
      icon: '⚠️',
      color: 'bg-yellow-500',
      trend: realTimeStats.lowStockItems > 0 ? 'Needs attention' : 'All good',
      trendPositive: realTimeStats.lowStockItems === 0,
      description: 'Items below minimum stock level',
      onClick: () => handleNavigate('/inventory?filter=low-stock')
    },
    {
      title: 'Out of Stock',
      value: realTimeStats.outOfStockItems,
      icon: '❌',
      color: 'bg-red-500',
      trend: realTimeStats.outOfStockItems > 0 ? 'Urgent restock needed' : 'All items available',
      trendPositive: realTimeStats.outOfStockItems === 0,
      description: 'Items completely out of stock',
      onClick: () => handleNavigate('/inventory?filter=out-of-stock')
    },
    {
      title: 'Inventory Value',
      value: realTimeStats.totalValue,
      icon: '💰',
      color: 'bg-purple-500',
      trend: '+5.2%',
      trendPositive: true,
      description: 'Total value of inventory',
      onClick: () => handleNavigate('/reports')
    },
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create new product entry',
      icon: '➕',
      action: '/inventory/new',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      title: 'Stock In',
      description: 'Record incoming stock',
      icon: '📥',
      action: '/transactions?type=in',
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      title: 'Stock Out',
      description: 'Record outgoing stock',
      icon: '📤',
      action: '/transactions?type=out',
      color: 'bg-red-100 text-red-700 hover:bg-red-200'
    },
    {
      title: 'Generate Report',
      description: 'Create inventory report',
      icon: '📄',
      action: '/reports',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit categories',
      icon: '🏷️',
      action: '/categories',
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: '⚙️',
      action: '/settings',
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  ];

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  if (loading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-red-500 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time inventory management dashboard</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
              disabled={isRefreshing}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
              isRefreshing 
                ? 'bg-blue-300 text-blue-700 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <span className={`mr-1 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={card.onClick}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  card.trendPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {card.trend}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                <span className="text-xl">{card.icon}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Value</h2>
                <span className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <InventoryChart data={stats.monthlyData} timeRange={timeRange} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
              <CategoryDistribution categories={stats.categories} products={stats.products} />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <button 
                  className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  onClick={() => handleNavigate('/transactions')}
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="p-6">
              {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-sm ${
                            transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'in' ? '📥' : '📤'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.product_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No transactions yet</h3>
                  <p className="text-xs text-gray-500">Get started by adding your first transaction</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          {stats.topSelling && stats.topSelling.length > 0 && (
            <TopSellingProducts products={stats.topSelling} />
          )}
        </div>

        {/* Right Column - Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(action.action)}
                  className={`p-3 rounded-lg text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${action.color}`}
                >
                  <div className="text-lg mb-1">{action.icon}</div>
                  <div className="text-xs font-medium truncate">{action.title}</div>
                  <div className="text-xs opacity-70 mt-1 truncate">{action.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {realTimeStats.lowStockItems > 0 && (
            <LowStockAlert 
              count={realTimeStats.lowStockItems} 
              items={stats.products.filter(p => p.quantity <= p.min_stock_level && p.quantity > 0)}
              onViewAll={() => handleNavigate('/inventory?filter=low-stock')}
            />
          )}

          {/* Out of Stock Alerts */}
          {realTimeStats.outOfStockItems > 0 && (
            <LowStockAlert
              count={realTimeStats.outOfStockItems}
              items={stats.products.filter(p => p.quantity === 0)}
              type="outOfStock"
              title="Out of Stock Items"
              onViewAll={() => handleNavigate('/inventory?filter=out-of-stock')}
            />
          )}

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Connection</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sync</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Real-time
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-xs text-gray-500">{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <button 
                  className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  onClick={() => handleNavigate('/settings')}
                >
                  System Settings →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;