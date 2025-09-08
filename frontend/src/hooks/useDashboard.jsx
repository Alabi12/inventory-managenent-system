import { useState, useEffect } from 'react';
import { productsAPI, transactionsAPI } from '../services/api';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalTransactions: 0,
    recentTransactions: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      // Use the correct API methods that actually exist
      const [productsRes, transactionsRes, statsRes] = await Promise.all([
        productsAPI.getProducts(), // Changed from getAll() to getProducts()
        transactionsAPI.getTransactions(), // Changed from getAll() to getTransactions()
        transactionsAPI.getTransactionStats() // Added to get transaction statistics
      ]);

      const products = productsRes.data;
      const transactions = transactionsRes.data;
      const transactionStats = statsRes.data;

      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.quantity <= p.min_stock_level).length;
      const totalTransactions = transactions.length;
      const recentTransactions = transactions.slice(0, 5);

      setStats({
        totalProducts,
        lowStockItems,
        totalTransactions,
        recentTransactions,
        transactionStats, // Include the transaction statistics
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data'
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    loading: stats.loading,
    error: stats.error,
    refetch: fetchDashboardData,
  };
};