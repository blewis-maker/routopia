import React from 'react';
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
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ElevationPoint {
  distance: number;  // Distance in kilometers
  elevation: number; // Elevation in meters
}

interface ElevationProfileProps {
  points: ElevationPoint[];
  className?: string;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  points,
  className = '',
}) => {
  const data = {
    labels: points.map(p => p.distance.toFixed(1)),
    datasets: [
      {
        label: 'Elevation',
        data: points.map(p => p.elevation),
        fill: true,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#10B981',
        pointHoverBorderColor: '#fff',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `Elevation: ${context.parsed.y}m`,
          title: (contexts) => `Distance: ${contexts[0].label}km`,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#10B981',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Distance (km)',
          color: '#6B7280',
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Elevation (m)',
          color: '#6B7280',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
        Elevation Profile
      </h3>
      <div className="h-[calc(100%-2rem)]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}; 