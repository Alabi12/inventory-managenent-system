import React from 'react';

const TopSellingProducts = ({ products }) => {
  // Sample data structure if none provided
  const sampleProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 156, revenue: '$3,450' },
    { id: 2, name: 'Smart Watch', sales: 128, revenue: '$2,880' },
    { id: 3, name: 'Running Shoes', sales: 95, revenue: '$1,710' },
    { id: 4, name: 'Coffee Maker', sales: 87, revenue: '$1,305' },
    { id: 5, name: 'Bluetooth Speaker', sales: 76, revenue: '$1,140' }
  ];

  const productData = products || sampleProducts;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productData.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSellingProducts;