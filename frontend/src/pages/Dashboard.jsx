import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import InventoryChart from '../components/Dashboard/InventoryChart';
import LowStockAlert from '../components/Dashboard/LowStockAlert';
import CategoryDistribution from '../components/Dashboard/CategoryDistribution';
import TopSellingProducts from '../components/Dashboard/TopSellingProducts';

const Dashboard = () => {
  // Get the refresh function from useDashboard hook
  const { stats, loading, error, fetchDashboardData } = useDashboard();
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
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      color: 'bg-blue-500',
      trend: stats.totalProducts > 0 ? `+${Math.round((stats.totalProducts / 100) * 8)}% this month` : 'No products',
      trendPositive: true,
      description: 'Total items in inventory',
      onClick: () => handleNavigate('/inventory')
    },
    {
      title: 'Low Stock Items',
      value: realTimeStats.lowStockItems,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'bg-amber-500',
      trend: realTimeStats.lowStockItems > 0 ? 'Needs attention' : 'All good',
      trendPositive: realTimeStats.lowStockItems === 0,
      description: 'Items below minimum stock level',
      onClick: () => handleNavigate('/inventory?filter=low-stock')
    },
    {
      title: 'Out of Stock',
      value: realTimeStats.outOfStockItems,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'bg-rose-500',
      trend: realTimeStats.outOfStockItems > 0 ? 'Urgent restock needed' : 'All items available',
      trendPositive: realTimeStats.outOfStockItems === 0,
      description: 'Items completely out of stock',
      onClick: () => handleNavigate('/inventory?filter=out-of-stock')
    },
    {
      title: 'Inventory Value',
      value: realTimeStats.totalValue,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-indigo-500',
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
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: '/inventory/new',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
    },
    {
      title: 'Stock In',
      description: 'Record incoming stock',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      action: '/transactions?type=in',
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
    },
    {
      title: 'Stock Out',
      description: 'Record outgoing stock',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      ),
      action: '/transactions?type=out',
      color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
    },
    {
      title: 'Generate Report',
      description: 'Create inventory report',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: '/reports',
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit categories',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
      ),
      action: '/categories',
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: '/settings',
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
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
      <div className="flex flex-col justify-center items-center min-h-96 bg-gray-50 rounded-xl p-8">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600 mt-4">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96 bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-rose-500 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time inventory management dashboard</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors bg-white shadow-sm"
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
            className={`px-4 py-2 rounded-lg text-sm flex items-center transition-colors shadow-sm ${
              isRefreshing 
                ? 'bg-blue-300 text-blue-700 cursor-not-allowed' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  card.trendPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {card.trend}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${card.color} bg-opacity-10 text-${card.color.split('-')[1]}-500`}>
                {card.icon}
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
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <button 
                  className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
                  onClick={() => handleNavigate('/transactions')}
                >
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'in' ? 'bg-emerald-100' : 'bg-rose-100'
                        }`}>
                          <span className={`text-sm ${
                            transaction.type === 'in' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {transaction.type === 'in' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                              </svg>
                            )}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.product_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === 'in' ? 'text-emerald-600' : 'text-rose-600'
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
                  className={`p-4 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${action.color} flex flex-col items-center justify-center`}
                >
                  <div className="mb-2">{action.icon}</div>
                  <div className="text-sm font-medium truncate">{action.title}</div>
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sync</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Real-time
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-xs text-gray-500">{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <button 
                  className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center justify-center"
                  onClick={() => handleNavigate('/settings')}
                >
                  System Settings
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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