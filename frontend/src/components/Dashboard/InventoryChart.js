import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InventoryChart = ({ data, timeRange }) => {
  // Sample data structure if none provided
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Inventory Value',
        data: [65, 59, 80, 81, 56, 55, 72, 68, 75, 80, 85, 90],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `$${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
  };

  // Time range filter options
  const timeRangeLabels = {
    'today': 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '90days': 'Last 90 Days'
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Inventory Value Trend</h3>
          <p className="text-sm text-gray-600">Value over time</p>
        </div>
        {timeRange && (
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
            {timeRangeLabels[timeRange] || timeRange}
          </div>
        )}
      </div>
      
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Inventory Value</span>
        </div>
        <div className="text-xs text-gray-500">
          Updated just now
        </div>
      </div>
    </div>
  );
};

export default InventoryChart;