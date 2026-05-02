import { Bar } from 'react-chartjs-2';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SalesChart({pincodedata}) {
  

  const colorPalette = [
    '#4CAF50', '#2196F3', '#FFC107', '#FF5722',
    '#9C27B0', '#00BCD4', '#795548', '#3F51B5',
    '#E91E63', '#009688', '#CDDC39', '#607D8B'
  ];

  const data = {
    labels: pincodedata.map((item) => item.pincode),
    datasets: [
      {
        label: 'total customer',
        data: pincodedata.map((item) => item.totalOrders),
        backgroundColor: pincodedata.map((_, i) => colorPalette[i % colorPalette.length]),
        borderRadius: 8,
        barThickness: 20
      }
    ]
  };

  const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.raw}`
      }
    },
    title: {
      display: true,
      text: '📍 Sales by Pincode',
      color: '#333',
      font: { size: 18, weight: 'bold' },
      padding: { top: 10, bottom: 20 }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { color: '#555' },
      grid: { display: false } // ✨ remove vertical grid
    },
    y: {
      ticks: { color: '#555' },
      grid: { display: false } // ✨ remove horizontal grid
    }
  }
};


  // Height per bar, max height 600px, scroll if more


  return (
    <div className=" shadow-xl rounded-xl p-6 w-full max-w-5xl mx-auto mt-8">
      <div className="overflow-y-auto min-h-50 max-h-200">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
