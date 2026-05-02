// LineChart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { Line } from 'react-chartjs-2';

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define chart data

const LineChart = ({salesData}) => {
  // console.log(salesData.labels)
  const data = {
  labels: salesData.labels,
  datasets: [
    {
      label: 'New User',
      data: salesData.newUserData,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill:true,
      borderWidth: 2, // 🔥 Hides the line
      pointRadius: 2,
    },
     {
      label: 'Returning User',
      data: salesData.repeatedUserData,
      borderColor: 'rgb(255, 205, 99)',
      backgroundColor: 'rgba(255,205,99,0.2)',
      fill:true,
      borderWidth: 2, // 🔥 Hides the line
    pointRadius: 2,

      tension: 0.4,
    }
  ],
};

// Chart options
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      
    },
    title: {
      display: true,
      text: 'Website Visitors Over Time',
    },
  },
  scales: {
  y: {
    ticks: {
      display: false,
    },
    grid: {
      display: false, // 🔥 hides Y-axis grid lines
      drawTicks: false,
    },
  },
  x: {
    ticks: {
      color: '#000',
    },
    grid: {
      display: false, // 🔥 hides X-axis grid lines
    },
  },
}
};


  return <Line data={data} options={options} />;
};

export default LineChart;
