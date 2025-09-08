import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CategoryDistribution = ({ data }) => {
  // Sample data structure if none provided
  const sampleData = [
    { category: 'Electronics', count: 45 },
    { category: 'Clothing', count: 32 },
    { category: 'Books', count: 28 },
    { category: 'Home & Garden', count: 22 },
    { category: 'Sports', count: 18 }
  ];

  const chartData = data || sampleData;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-indigo-600">
            {payload[0].value} items
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Category Distribution</h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">Items per category</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ 
              value: 'Number of Items', 
              angle: -90, 
              position: 'insideLeft', 
              offset: -10,
              style: { fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#4f46e5" 
            radius={[4, 4, 0, 0]}
            name="Items"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Distribution of inventory across product categories
      </div>
    </div>
  );
};

export default CategoryDistribution;