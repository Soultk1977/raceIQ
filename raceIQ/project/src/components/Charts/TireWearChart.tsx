import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TireWearChartProps {
  grip: number;
  compound: string;
  lapsUsed: number;
  maxLaps: number;
}

export const TireWearChart: React.FC<TireWearChartProps> = ({
  grip,
  compound,
  lapsUsed,
  maxLaps
}) => {
  const wearPercentage = Math.max(0, Math.min(100, 100 - grip));
  
  const data = [
    { name: 'Remaining', value: grip, color: getCompoundColor(compound) },
    { name: 'Worn', value: wearPercentage, color: '#2A2A2A' },
  ];

  function getCompoundColor(compound: string) {
    switch (compound) {
      case 'Soft': return '#FF1E1E';
      case 'Medium': return '#FFD700';
      case 'Hard': return '#F2F2F2';
      case 'Intermediate': return '#39FF14';
      case 'Wet': return '#0080FF';
      default: return '#F2F2F2';
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-race-card border border-race-gray rounded-lg p-3 shadow-xl">
          <p className="text-race-accent">
            {payload[0].name}: {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={450}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold text-race-primary">
              {grip.toFixed(0)}%
            </div>
            <div className="text-xs text-race-accent opacity-70">
              Grip
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="font-orbitron font-semibold text-race-accent mb-1">
          {compound} Compound
        </div>
        <div className="text-sm text-race-accent opacity-70">
          {lapsUsed} / {maxLaps} laps
        </div>
      </div>
    </div>
  );
};