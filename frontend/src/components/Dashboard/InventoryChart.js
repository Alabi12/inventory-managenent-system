import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryChart = () => {
  const data = {
    labels: ['Electronics', 'Clothing', 'Books', 'Food', 'Furniture'],
    datasets: [
      {
        label: 'Items in Stock',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Inventory by Category',
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Inventory Overview
        </Typography>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
};

export default InventoryChart;