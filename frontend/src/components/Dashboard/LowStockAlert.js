import React from 'react';

const LowStockAlert = ({ count, items, type = "lowStock", title = "Low Stock Alerts", onViewAll }) => {
  // Sample data if none provided
  const lowStockItems = items || [
    { id: 1, name: 'iPhone 13', currentStock: 2, minStock: 5 },
    { id: 2, name: 'MacBook Pro', currentStock: 3, minStock: 5 },
    { id: 3, name: 'AirPods', currentStock: 4, minStock: 10 },
    { id: 4, name: 'iPad Air', currentStock: 1, minStock: 3 },
  ];

  const alertCount = count || lowStockItems.length;

  // Determine colors based on alert type
  const getColors = () => {
    if (type === "outOfStock") {
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-800',
        icon: 'text-rose-500',
        badge: 'bg-rose-100 text-rose-800',
        button: 'text-rose-600 hover:text-rose-800'
      };
    }
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-800',
      button: 'text-amber-600 hover:text-amber-800'
    };
  };

  const colors = getColors();

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${colors.bg} mr-3`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${colors.icon}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{alertCount} item{alertCount !== 1 ? 's' : ''} need attention</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
          {alertCount}
        </span>
      </div>
      
      <div className="p-4">
        <ul className="space-y-3">
          {lowStockItems.slice(0, 4).map((item) => (
            <li key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">Stock: {item.currentStock}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-xs text-gray-500">Min: {item.minStock}</span>
                </div>
              </div>
              <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                {type === "outOfStock" ? "Out of Stock" : "Low Stock"}
              </div>
            </li>
          ))}
        </ul>
        
        {lowStockItems.length > 4 && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              +{lowStockItems.length - 4} more item{(lowStockItems.length - 4) !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {onViewAll && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onViewAll}
            className={`w-full text-center text-sm font-medium ${colors.button} transition-colors flex items-center justify-center`}
          >
            View all{alertCount > 4 ? ` ${alertCount}` : ''} items
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;