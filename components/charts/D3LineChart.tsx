"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function D3LineChart({
  data,
  xField,
  yField,
}: {
  data: any[];
  xField: string;
  yField: string;
}) {
  // Check if x-axis data is date-based
  const sample = data[0]?.[xField];
  const isDateX = typeof sample === "string" || sample instanceof Date;

  const chartData = {
    datasets: [
      {
        label: yField,
        data: data.map((item) => ({
          x: isDateX ? new Date(item[xField]) : parseFloat(item[xField]) || 0,
          y: parseFloat(item[yField]) || 0,
        })),
        fill: false,
        borderColor: 'rgb(74, 222, 128)',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        type: isDateX ? ('time' as const) : ('linear' as const),
        ...(isDateX && {
          time: {
            displayFormats: {
              day: 'MMM dd',
              month: 'MMM yyyy',
            },
          },
        }),
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height: '200px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
