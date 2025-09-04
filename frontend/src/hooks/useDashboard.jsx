import { useState, useEffect } from 'react';
import { productsAPI, transactionsAPI } from '../services/api';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalTransactions: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, transactionsRes] = await Promise.all([
        productsAPI.getAll(),
        transactionsAPI.getAll(),
      ]);

      const products = productsRes.data;
      const transactions = transactionsRes.data;

      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.quantity <= p.min_stock_level).length;
      const totalTransactions = transactions.length;
      const recentTransactions = transactions.slice(0, 5);

      setStats({
        totalProducts,
        lowStockItems,
        totalTransactions,
        recentTransactions,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchDashboardData,
  };
};