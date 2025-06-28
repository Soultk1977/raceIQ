import React, { useState, useEffect } from 'react';
import { Gauge, Zap, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { SpeedGauge } from '../components/Charts/SpeedGauge';
import { useRacingData } from '../hooks/useRacingData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export const Performance: React.FC = () => {
  const { generateRealisticTelemetry, calculateRPMFromSpeed, currentSession } = useRacingData();
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentRPM, setCurrentRPM] = useState(800);
  const [currentGear, setCurrentGear] = useState(1);
  const [throttleInput, setThrottleInput] = useState(0);
  const [brakeInput, setBrakeInput] = useState(0);
  const [gForces, setGForces] = useState({ x: 0, y: -1, z: 0 });
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    // Generate initial telemetry data
    const data = generateRealisticTelemetry(120, currentSession?.trackName); // 2 minutes of data
    setTelemetryData(data.map((point, index) => ({
      time: index / 10,
      speed: point.speed,
      rpm: point.rpm,
      throttle: point.throttle,
      brake: point.brake,
      gForceX: point.gForceX,
      gForceY: point.gForceY,
      gForceZ: point.gForceZ,
      gear: point.gear,
    })));
  }, [generateRealisticTelemetry, currentSession?.trackName]);

  // Manual control effects
  useEffect(() => {
    if (manualMode) {
      // Calculate speed based on throttle/brake inputs
      const acceleration = (throttleInput - brakeInput) / 100;
      const newSpeed = Math.max(0, Math.min(350, currentSpeed + acceleration * 5));
      setCurrentSpeed(newSpeed);
      
      // Calculate gear based on speed
      const newGear = Math.max(1, Math.min(8, Math.floor(newSpeed / 45) + 1));
      setCurrentGear(newGear);
      
      // Calculate RPM
      const newRPM = calculateRPMFromSpeed(newSpeed, newGear);
      setCurrentRPM(newRPM);
      
      // Calculate G-forces based on acceleration
      const gForceZ = acceleration * 0.3; // Longitudinal
      const gForceX = (Math.random() - 0.5) * 2 * (newSpeed / 200); // Lateral based on speed
      const gForceY = -1 + Math.random() * 0.3; // Vertical
      
      setGForces({ x: gForceX, y: gForceY, z: gForceZ });
    }
  }, [throttleInput, brakeInput, currentSpeed, manualMode, calculateRPMFromSpeed]);

  const startSimulation = () => {
    setIsSimulating(true);
    setManualMode(false);
    setSimulationIndex(0);
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationIndex(0);
    setCurrentSpeed(0);
    setCurrentRPM(800);
    setCurrentGear(1);
    setThrottleInput(0);
    setBrakeInput(0);
    setGForces({ x: 0, y: -1, z: 0 });
  };

  // Simulation loop
  useEffect(() => {
    if (!isSimulating || simulationIndex >= telemetryData.length) {
      if (simulationIndex >= telemetryData.length) {
        setIsSimulating(false);
      }
      return;
    }
    
    const interval = setInterval(() => {
      const point = telemetryData[simulationIndex];
      if (point) {
        setCurrentSpeed(point.speed);
        setCurrentRPM(point.rpm);
        setCurrentGear(point.gear);
        setThrottleInput(point.throttle);
        setBrakeInput(point.brake);
        setGForces({
          x: point.gForceX,
          y: point.gForceY,
          z: point.gForceZ
        });
        setSimulationIndex(prev => prev + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, simulationIndex, telemetryData]);

  const calculateGForceTotal = () => {
    return Math.sqrt(gForces.x ** 2 + gForces.y ** 2 + gForces.z ** 2);
  };

  const RPMGauge = ({ rpm }: { rpm: number }) => {
    const percentage = Math.min((rpm / 15000) * 100, 100);
    const rotation = (percentage / 100) * 270 - 135; // -135 to 135 degrees
    
    // RPM zones for color coding
    const getZoneColor = (rpm: number) => {
      if (rpm < 8000) return '#39FF14'; // Green zone
      if (rpm < 12000) return '#FFD700'; // Yellow zone
      if (rpm < 14000) return '#FF8C00'; // Orange zone
      return '#FF1E1E'; // Red zone
    };
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-40 mb-4">
          <svg
            className="w-full h-full"
            viewBox="0 0 200 140"
            style={{ overflow: 'visible' }}
          >
            {/* Background arc */}
            <path
              d="M 20 120 A 80 80 0 1 1 180 120"
              fill="none"
              stroke="#2A2A2A"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* RPM zone arcs */}
            <path
              d="M 20 120 A 80 80 0 0 1 80 50"
              fill="none"
              stroke="#39FF14"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M 80 50 A 80 80 0 0 1 120 50"
              fill="none"
              stroke="#FFD700"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M 120 50 A 80 80 0 0 1 180 120"
              fill="none"
              stroke="#FF1E1E"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
            />
            
            {/* Progress arc */}
            <path
              d="M 20 120 A 80 80 0 1 1 180 120"
              fill="none"
              stroke={getZoneColor(rpm)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 4.71} 471`}
              className="transition-all duration-300 ease-out"
            />
            
            {/* RPM markers */}
            {[0, 3000, 6000, 9000, 12000, 15000].map((mark, index) => {
              const angle = (index / 5) * 270 - 135;
              const x1 = 100 + 60 * Math.cos((angle * Math.PI) / 180);
              const y1 = 120 + 60 * Math.sin((angle * Math.PI) / 180);
              const x2 = 100 + 70 * Math.cos((angle * Math.PI) / 180);
              const y2 = 120 + 70 * Math.sin((angle * Math.PI) / 180);
              
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
                    y={120 + 80 * Math.sin((angle * Math.PI) / 180)}
                    fill="#F2F2F2"
                    fontSize="8"
                    textAnchor="middle"
                    className="font-orbitron"
                  >
                    {mark / 1000}k
                  </text>
                </g>
              );
            })}
            
            {/* Needle */}
            <g transform={`translate(100, 120) rotate(${rotation})`}>
              <line
                x1="0"
                y1="0"
                x2="50"
                y2="0"
                stroke={getZoneColor(rpm)}
                strokeWidth="3"
                strokeLinecap="round"
                className="gauge-needle"
              />
              <circle cx="0" cy="0" r="4" fill={getZoneColor(rpm)} />
            </g>
          </svg>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-orbitron font-bold text-race-primary mb-2">
            {rpm.toFixed(0)}
          </div>
          <div className="text-sm text-race-accent opacity-70">RPM</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="section-title">
          <Gauge className="w-8 h-8 text-race-primary" />
          Performance Dashboard
        </h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => setManualMode(!manualMode)}
            className={`racing-button ${manualMode ? 'bg-race-green text-black' : ''}`}
          >
            {manualMode ? 'Manual Mode' : 'Auto Mode'}
          </button>
          
          {!manualMode && (
            <>
              <button
                onClick={isSimulating ? pauseSimulation : startSimulation}
                className="racing-button flex items-center gap-2"
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Pause' : 'Start'} Simulation
              </button>
              
              <button
                onClick={resetSimulation}
                className="racing-button flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Manual Controls */}
      {manualMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4">
            Manual Controls
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Throttle: {throttleInput}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={throttleInput}
                onChange={(e) => setThrottleInput(Number(e.target.value))}
                className="w-full h-3 bg-race-gray rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #39FF14 0%, #39FF14 ${throttleInput}%, #2A2A2A ${throttleInput}%, #2A2A2A 100%)`
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Brake: {brakeInput}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={brakeInput}
                onChange={(e) => setBrakeInput(Number(e.target.value))}
                className="w-full h-3 bg-race-gray rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #FF1E1E 0%, #FF1E1E ${brakeInput}%, #2A2A2A ${brakeInput}%, #2A2A2A 100%)`
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Gauges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="racing-card text-center">
          <SpeedGauge speed={currentSpeed} />
        </div>
        
        <div className="racing-card text-center">
          <RPMGauge rpm={currentRPM} />
        </div>
        
        <div className="racing-card text-center">
          <div className="mb-4">
            <div className="text-6xl font-orbitron font-bold text-race-primary mb-2">
              {currentGear}
            </div>
            <div className="text-race-accent opacity-70">Current Gear</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="bg-race-bg p-2 rounded border border-race-gray">
              <div className="text-race-green font-bold">
                Throttle: {throttleInput.toFixed(0)}%
              </div>
            </div>
            <div className="bg-race-bg p-2 rounded border border-race-gray">
              <div className="text-race-primary font-bold">
                Brake: {brakeInput.toFixed(0)}%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-race-green font-bold">
                X: {gForces.x.toFixed(2)}g
              </div>
            </div>
            <div>
              <div className="text-race-purple font-bold">
                Y: {gForces.y.toFixed(2)}g
              </div>
            </div>
            <div>
              <div className="text-race-primary font-bold">
                Total: {calculateGForceTotal().toFixed(2)}g
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Speed vs Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Speed Profile
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryData.slice(0, simulationIndex + 50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" strokeOpacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#F2F2F2"
                fontSize={12}
                fontFamily="Orbitron"
              />
              <YAxis 
                stroke="#F2F2F2"
                fontSize={12}
                fontFamily="Orbitron"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E1E',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F2F2F2'
                }}
              />
              <Area
                type="monotone"
                dataKey="speed"
                stroke="#FF1E1E"
                strokeWidth={2}
                fill="url(#speedGradient)"
              />
              <defs>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1E1E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF1E1E" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Throttle & Brake Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Throttle & Brake Input
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryData.slice(0, simulationIndex + 50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" strokeOpacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#F2F2F2"
                fontSize={12}
                fontFamily="Orbitron"
              />
              <YAxis 
                domain={[0, 100]}
                stroke="#F2F2F2"
                fontSize={12}
                fontFamily="Orbitron"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E1E',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F2F2F2'
                }}
              />
              <Line
                type="monotone"
                dataKey="throttle"
                stroke="#39FF14"
                strokeWidth={3}
                dot={false}
                name="Throttle %"
              />
              <Line
                type="monotone"
                dataKey="brake"
                stroke="#FF1E1E"
                strokeWidth={3}
                dot={false}
                name="Brake %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* G-Force Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4">
          G-Force Monitor
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* G-Force Circle */}
          <div className="flex justify-center items-center">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Background circles */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#2A2A2A" strokeWidth="2" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#2A2A2A" strokeWidth="1" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="#2A2A2A" strokeWidth="1" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#2A2A2A" strokeWidth="1" />
                
                {/* Center lines */}
                <line x1="20" y1="100" x2="180" y2="100" stroke="#2A2A2A" strokeWidth="1" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#2A2A2A" strokeWidth="1" />
                
                {/* G-Force indicator */}
                <circle
                  cx={100 + gForces.x * 20}
                  cy={100 - gForces.z * 20} // Negative because SVG Y is inverted
                  r="8"
                  fill="#FF1E1E"
                  className="animate-pulse"
                />
                
                {/* Trail effect */}
                {telemetryData.slice(Math.max(0, simulationIndex - 20), simulationIndex).map((point, index) => (
                  <circle
                    key={index}
                    cx={100 + point.gForceX * 20}
                    cy={100 - point.gForceZ * 20}
                    r={2 + index * 0.2}
                    fill="#FF1E1E"
                    opacity={0.1 + index * 0.04}
                  />
                ))}
                
                {/* Labels */}
                <text x="100" y="15" textAnchor="middle" fill="#F2F2F2" fontSize="12" fontFamily="Orbitron">
                  Acceleration
                </text>
                <text x="100" y="195" textAnchor="middle" fill="#F2F2F2" fontSize="12" fontFamily="Orbitron">
                  Braking
                </text>
                <text x="15" y="105" textAnchor="middle" fill="#F2F2F2" fontSize="12" fontFamily="Orbitron">
                  Left
                </text>
                <text x="185" y="105" textAnchor="middle" fill="#F2F2F2" fontSize="12" fontFamily="Orbitron">
                  Right
                </text>
              </svg>
            </div>
          </div>
          
          {/* G-Force Values */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Lateral (X)</div>
                <div className="text-2xl font-orbitron font-bold text-race-green">
                  {gForces.x.toFixed(2)}g
                </div>
              </div>
              
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Longitudinal (Z)</div>
                <div className="text-2xl font-orbitron font-bold text-race-purple">
                  {gForces.z.toFixed(2)}g
                </div>
              </div>
              
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Vertical (Y)</div>
                <div className="text-2xl font-orbitron font-bold text-race-accent">
                  {gForces.y.toFixed(2)}g
                </div>
              </div>
              
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Total</div>
                <div className="text-2xl font-orbitron font-bold text-race-primary">
                  {calculateGForceTotal().toFixed(2)}g
                </div>
              </div>
            </div>
            
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <div className="text-sm text-race-accent opacity-70 mb-2">G-Force Zones</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Comfortable:</span>
                  <span className="text-race-green">0.0 - 1.5g</span>
                </div>
                <div className="flex justify-between">
                  <span>Aggressive:</span>
                  <span className="text-yellow-400">1.5 - 3.0g</span>
                </div>
                <div className="flex justify-between">
                  <span>Extreme:</span>
                  <span className="text-race-primary">3.0g+</span>
                </div>
              </div>
            </div>

            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <div className="text-sm text-race-accent opacity-70 mb-2">Current Status</div>
              <div className="text-sm text-race-accent">
                {calculateGForceTotal() < 1.5 ? "🟢 Comfortable driving" :
                 calculateGForceTotal() < 3.0 ? "🟡 Aggressive driving" :
                 "🔴 Extreme forces detected!"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};