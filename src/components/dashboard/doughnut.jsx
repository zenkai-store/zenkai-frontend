// DoughnutChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['DIRECT', 'FACEBOOK', 'INSTRAGRAM'],
  datasets: [
    {
      label: 'Traffic',
      data: [300, 150, 100],
      borderRadius:8,
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      enabled: true,
    }
  },
};

const DoughnutChart = () => {
  return <Doughnut data={data} options={options} />;
};

export default DoughnutChart;
