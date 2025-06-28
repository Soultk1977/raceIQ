import React from 'react';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  label?: string;
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({ 
  speed, 
  maxSpeed = 350, 
  label = "Speed (km/h)" 
}) => {
  const percentage = Math.min((speed / maxSpeed) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  const getSpeedColor = (speed: number) => {
    if (speed < 100) return '#39FF14'; // Green
    if (speed < 200) return '#FFD700'; // Yellow
    if (speed < 280) return '#FF8C00'; // Orange
    return '#FF1E1E'; // Red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-32 mb-4">
        {/* Gauge background */}
        <svg
          className="w-full h-full"
          viewBox="0 0 200 120"
          style={{ overflow: 'visible' }}
        >
          {/* Background arc */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="#2A2A2A"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke={getSpeedColor(speed)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.199} 220`}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Speed markers */}
          {[0, 50, 100, 150, 200, 250, 300, 350].map((mark, index) => {
            const angle = (index / 7) * 180 - 90;
            const x1 = 100 + 60 * Math.cos((angle * Math.PI) / 180);
            const y1 = 100 + 60 * Math.sin((angle * Math.PI) / 180);
            const x2 = 100 + 70 * Math.cos((angle * Math.PI) / 180);
            const y2 = 100 + 70 * Math.sin((angle * Math.PI) / 180);
            
            return (
              <g key={mark}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#F2F2F2"
                  strokeWidth="2"
                />
                <text
                  x={100 + 80 * Math.cos((angle * Math.PI) / 180)}
                  y={100 + 80 * Math.sin((angle * Math.PI) / 180)}
                  fill="#F2F2F2"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-orbitron"
                >
                  {mark}
                </text>
              </g>
            );
          })}
          
          {/* Needle */}
          <g transform={`translate(100, 100) rotate(${rotation})`}>
            <line
              x1="0"
              y1="0"
              x2="50"
              y2="0"
              stroke="#FF1E1E"
              strokeWidth="3"
              strokeLinecap="round"
              className="gauge-needle"
            />
            <circle
              cx="0"
              cy="0"
              r="4"
              fill="#FF1E1E"
            />
          </g>
        </svg>
      </div>
      
      {/* Digital display */}
      <div className="text-center">
        <div className="text-4xl font-orbitron font-bold text-race-primary mb-2">
          {speed.toFixed(0)}
        </div>
        <div className="text-sm text-race-accent opacity-70">
          {label}
        </div>
      </div>
    </div>
  );
};