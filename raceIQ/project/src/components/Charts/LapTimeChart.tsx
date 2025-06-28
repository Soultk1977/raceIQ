import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { LapData } from '../../types/racing';

interface LapTimeChartProps {
  laps: LapData[];
  selectedLap?: number;
}

export const LapTimeChart: React.FC<LapTimeChartProps> = ({ laps, selectedLap }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
  };

  const data = laps.map(lap => ({
    lap: lap.lapNumber,
    time: lap.lapTime,
    isPersonalBest: lap.isPersonalBest,
    isSessionBest: lap.isSessionBest,
    compound: lap.compound,
  }));

  const bestLapTime = Math.min(...laps.map(lap => lap.lapTime));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-race-card border border-race-gray rounded-lg p-4 shadow-xl">
          <p className="font-orbitron font-bold text-race-primary">
            Lap {label}
          </p>
          <p className="text-race-accent">
            Time: {formatTime(payload[0].value)}
          </p>
          <p className="text-race-accent">
            Compound: {data.compound}
          </p>
          {data.isPersonalBest && (
            <p className="text-race-green font-semibold">Personal Best!</p>
          )}
          {data.isSessionBest && (
            <p className="text-race-purple font-semibold">Session Best!</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    let fill = '#F2F2F2';
    
    if (payload.isSessionBest) fill = '#AE00FF';
    else if (payload.isPersonalBest) fill = '#39FF14';
    else if (payload.lap === selectedLap) fill = '#FF1E1E';

    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={payload.isPersonalBest || payload.isSessionBest ? 6 : 4} 
        fill={fill}
        stroke={fill}
        strokeWidth={2}
        className="animate-pulse"
      />
    );
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#2A2A2A" 
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="lap" 
            stroke="#F2F2F2"
            fontSize={12}
            fontFamily="Orbitron"
          />
          <YAxis 
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={formatTime}
            stroke="#F2F2F2"
            fontSize={12}
            fontFamily="Orbitron"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={bestLapTime} 
            stroke="#39FF14" 
            strokeDasharray="5 5"
            label={{ value: "Best Lap", position: "topRight" }}
          />
          <Line
            type="monotone"
            dataKey="time"
            stroke="#FF1E1E"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 8, fill: '#FF1E1E' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};