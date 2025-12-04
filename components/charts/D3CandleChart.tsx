"use client";

import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
);

export default function D3CandleChart({
  data,
  xField,
  openField,
  highField,
  lowField,
  closeField,
}: {
  data: any[];
  xField: string;
  openField: string;
  highField: string;
  lowField: string;
  closeField: string;
}) {
  const chartData = {
    datasets: [
      {
        label: 'Price',
        data: data.map((item) => ({
          x: new Date(item[xField]).getTime(),
          o: parseFloat(item[openField]) || 0,
          h: parseFloat(item[highField]) || 0,
          l: parseFloat(item[lowField]) || 0,
          c: parseFloat(item[closeField]) || 0,
        })),
        color: {
          up: 'rgb(74, 222, 128)',
          down: 'rgb(239, 68, 68)',
          unchanged: 'rgb(148, 163, 184)',
        },
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
        callbacks: {
          title: function (context: any) {
            return new Date(context[0].parsed.x).toLocaleDateString();
          },
          label: function (context: any) {
            const data = context.raw;
            return [
              `Open: ${data.o.toFixed(2)}`,
              `High: ${data.h.toFixed(2)}`,
              `Low: ${data.l.toFixed(2)}`,
              `Close: ${data.c.toFixed(2)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            day: 'MMM dd',
            month: 'MMM yyyy',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <Chart type="candlestick" data={chartData} options={options} />
    </div>
  );
}
