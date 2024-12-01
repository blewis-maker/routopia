import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { ElevationData } from '@/types/routes';

interface Props {
  elevationData: ElevationData[];
  activityType: 'car' | 'bike' | 'walk' | 'ski';
  onHover?: (index: number) => void;
}

export const ElevationProfile: React.FC<Props> = ({
  elevationData,
  activityType,
  onHover
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !elevationData.length) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: elevationData.map(point => point.distance.toFixed(1)),
        datasets: [{
          label: 'Elevation',
          data: elevationData.map(point => point.elevation),
          fill: true,
          borderColor: getActivityColor(activityType),
          backgroundColor: getActivityColor(activityType, 0.2),
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = elevationData[context.dataIndex];
                return `Elevation: ${point.elevation}m | Grade: ${point.grade}%`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Distance (km)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Elevation (m)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [elevationData, activityType]);

  return (
    <div className="elevation-profile p-4 bg-stone-800 rounded-lg">
      <h3 className="text-white text-lg mb-2">Elevation Profile</h3>
      <div className="h-48">
        <canvas ref={chartRef} />
      </div>
      <div className="mt-2 text-sm text-stone-400">
        <span>Total Climb: {calculateTotalClimb(elevationData)}m</span>
        <span className="mx-2">|</span>
        <span>Max Grade: {calculateMaxGrade(elevationData)}%</span>
      </div>
    </div>
  );
};

function getActivityColor(activity: string, alpha = 1): string {
  const colors = {
    car: `rgba(63, 81, 181, ${alpha})`,
    bike: `rgba(76, 175, 80, ${alpha})`,
    walk: `rgba(255, 152, 0, ${alpha})`,
    ski: `rgba(33, 150, 243, ${alpha})`
  };
  return colors[activity as keyof typeof colors] || colors.car;
}

function calculateTotalClimb(data: ElevationData[]): number {
  let total = 0;
  for (let i = 1; i < data.length; i++) {
    const gain = data[i].elevation - data[i - 1].elevation;
    if (gain > 0) total += gain;
  }
  return Math.round(total);
}

function calculateMaxGrade(data: ElevationData[]): number {
  return Math.max(...data.map(point => Math.abs(point.grade)));
} 