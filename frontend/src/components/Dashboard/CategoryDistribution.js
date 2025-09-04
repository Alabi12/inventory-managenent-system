import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistribution;