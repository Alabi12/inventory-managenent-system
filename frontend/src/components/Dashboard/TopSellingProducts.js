import React from 'react';

const TopSellingProducts = ({ products }) => {
  // Sample data structure if none provided
  const sampleProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 156, revenue: 3450 },
    { id: 2, name: 'Smart Watch', sales: 128, revenue: 2880 },
    { id: 3, name: 'Running Shoes', sales: 95, revenue: 1710 },
    { id: 4, name: 'Coffee Maker', sales: 87, revenue: 1305 },
    { id: 5, name: 'Bluetooth Speaker', sales: 76, revenue: 1140 }
  ];

  const productData = products || sampleProducts;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
          <span className="text-xs text-gray-500">Last 30 days</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {productData.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">SKU: {product.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 ml-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{product.sales.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total from {productData.length} products</span>
            <div className="flex items-center space-x-6">
              <span className="font-semibold text-gray-900">
                {productData.reduce((total, product) => total + product.sales, 0).toLocaleString()} units
              </span>
              <span className="font-semibold text-indigo-600">
                {formatCurrency(productData.reduce((total, product) => total + product.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
          View sales report →
        </button>
      </div>
    </div>
  );
};

export default TopSellingProducts;