// src/components/Transactions/TransactionStats.jsx
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';

const TransactionStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Transactions',
      value: stats.total_transactions,
      icon: BarChart3,
      color: 'blue',
      trend: 'neutral'
    },
    {
      label: 'Total Incoming',
      value: stats.total_incoming,
      icon: TrendingUp,
      color: 'green',
      trend: 'up'
    },
    {
      label: 'Total Outgoing',
      value: stats.total_outgoing,
      icon: TrendingDown,
      color: 'red',
      trend: 'down'
    },
    {
      label: 'Total Revenue',
      value: `$${stats.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      icon: DollarSign,
      color: 'purple',
      trend: 'up'
    },
    {
      label: 'Total Cost',
      value: `$${stats.total_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      icon: Package,
      color: 'orange',
      trend: 'down'
    },
    {
      label: 'Profit',
      value: `$${stats.profit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      icon: DollarSign,
      color: stats.profit >= 0 ? 'green' : 'red',
      trend: stats.profit >= 0 ? 'up' : 'down'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        text: 'text-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-700'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-700'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        text: 'text-purple-700'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        text: 'text-orange-700'
      }
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-6">
      {statCards.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        
        return (
          <div
            key={index}
            className={`${colors.bg} rounded-xl p-5 border border-gray-100 shadow-xs hover:shadow-sm transition-shadow duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${colors.icon} p-2 rounded-lg`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  {stat.trend !== 'neutral' && (
                    <div className="p-1 bg-white rounded-full shadow-xs">
                      {getTrendIcon(stat.trend)}
                    </div>
                  )}
                </div>
                
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                
                <p className={`text-xl font-bold text-gray-900 ${colors.text}`}>
                  {stat.value}
                </p>
                
                {stat.label === 'Profit' && (
                  <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stats.profit >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stats.profit >= 0 ? '+' : ''}
                    {((stats.profit / (stats.total_revenue || 1)) * 100).toFixed(1)}% margin
                  </div>
                )}
              </div>
            </div>
            
            {/* Subtle gradient accent */}
            <div className={`h-1 mt-3 rounded-full bg-gradient-to-r ${
              stat.color === 'blue' ? 'from-blue-200 to-blue-300' :
              stat.color === 'green' ? 'from-green-200 to-green-300' :
              stat.color === 'red' ? 'from-red-200 to-red-300' :
              stat.color === 'purple' ? 'from-purple-200 to-purple-300' :
              'from-orange-200 to-orange-300'
            }`} />
          </div>
        );
      })}
    </div>
  );
};

export default TransactionStats;