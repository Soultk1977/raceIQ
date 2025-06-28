import React, { useState, useEffect } from 'react';
import { Zap, Fuel, AlertTriangle, Target, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { TireWearChart } from '../components/Charts/TireWearChart';
import { useRacingData } from '../hooks/useRacingData';
import { TireCompound } from '../types/racing';

export const TireFuel: React.FC = () => {
  const { calculateTireGripDecay, calculateFuelConsumption, currentSession } = useRacingData();
  const [selectedCompound, setSelectedCompound] = useState<TireCompound>('Medium');
  const [lapsUsed, setLapsUsed] = useState(0);
  const [initialFuel, setInitialFuel] = useState(110);
  const [fuelConsumptionRate, setFuelConsumptionRate] = useState(2.3);
  const [raceLaps, setRaceLaps] = useState(53);
  const [throttlePercent, setThrottlePercent] = useState(75);
  const [fuelSavingMode, setFuelSavingMode] = useState(0); // 0, 1, 2

  const tireCompoundData = {
    Soft: { maxLaps: 25, initialGrip: 100, color: '#FF1E1E', degradationRate: 0.08 },
    Medium: { maxLaps: 35, initialGrip: 95, color: '#FFD700', degradationRate: 0.05 },
    Hard: { maxLaps: 50, initialGrip: 90, color: '#F2F2F2', degradationRate: 0.03 },
    Intermediate: { maxLaps: 30, initialGrip: 85, color: '#39FF14', degradationRate: 0.06 },
    Wet: { maxLaps: 20, initialGrip: 80, color: '#0080FF', degradationRate: 0.10 },
  };

  const currentTireData = tireCompoundData[selectedCompound];
  const currentGrip = calculateTireGripDecay(currentTireData.initialGrip, lapsUsed, selectedCompound);
  
  // Calculate fuel with saving mode
  const fuelSavings = [0, 0.2, 0.4][fuelSavingMode];
  const adjustedConsumption = Math.max(1.5, fuelConsumptionRate - fuelSavings);
  const fuelUsed = calculateFuelConsumption(lapsUsed, throttlePercent);
  const fuelRemaining = Math.max(0, initialFuel - fuelUsed);
  const fuelLapsRemaining = fuelRemaining / adjustedConsumption;

  const shouldPitForTires = currentGrip < 70;
  const shouldPitForFuel = fuelLapsRemaining < 5;
  const shouldPit = shouldPitForTires || shouldPitForFuel;

  const calculateOptimalPitWindow = () => {
    const gripThreshold = 70;
    const fuelThreshold = 3; // laps
    
    let pitLap = 0;
    let currentLapGrip = currentTireData.initialGrip;
    let currentLapFuel = initialFuel;
    
    for (let lap = 1; lap <= raceLaps; lap++) {
      currentLapGrip = calculateTireGripDecay(currentTireData.initialGrip, lap, selectedCompound);
      currentLapFuel = initialFuel - calculateFuelConsumption(lap, throttlePercent);
      const lapsLeft = (currentLapFuel / adjustedConsumption);
      
      if (currentLapGrip < gripThreshold || lapsLeft < fuelThreshold) {
        pitLap = lap;
        break;
      }
    }
    
    return Math.max(1, pitLap);
  };

  const optimalPitLap = calculateOptimalPitWindow();

  // Calculate lap time penalty from tire degradation
  const lapTimePenalty = ((100 - currentGrip) * 0.02).toFixed(2);
  
  // Calculate fuel saving lap time penalty
  const fuelSavingPenalty = [0, 0.1, 0.3][fuelSavingMode];

  // Simulate tire degradation over stint
  const generateTireDegradationData = () => {
    const data = [];
    for (let lap = 0; lap <= currentTireData.maxLaps; lap++) {
      const grip = calculateTireGripDecay(currentTireData.initialGrip, lap, selectedCompound);
      data.push({
        lap,
        grip,
        lapTimePenalty: (100 - grip) * 0.02
      });
    }
    return data;
  };

  const tireDegradationData = generateTireDegradationData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="section-title">
          <Zap className="w-8 h-8 text-race-primary" />
          Tire & Fuel Management
        </h1>
        
        {shouldPit && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-race-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 animate-pulse"
          >
            <AlertTriangle className="w-5 h-5" />
            PIT WINDOW OPEN
          </motion.div>
        )}
      </motion.div>

      {/* Quick Status Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-6"
      >
        <div className="metric-card">
          <div className={`text-3xl font-orbitron font-bold mb-2 ${
            currentGrip > 85 ? 'text-race-green' :
            currentGrip > 70 ? 'text-yellow-400' : 'text-race-primary'
          }`}>
            {currentGrip.toFixed(0)}%
          </div>
          <div className="text-race-accent opacity-70">Tire Grip</div>
        </div>
        
        <div className="metric-card">
          <div className={`text-3xl font-orbitron font-bold mb-2 ${
            fuelRemaining > 30 ? 'text-race-green' :
            fuelRemaining > 15 ? 'text-yellow-400' : 'text-race-primary'
          }`}>
            {fuelRemaining.toFixed(1)}L
          </div>
          <div className="text-race-accent opacity-70">Fuel Remaining</div>
        </div>
        
        <div className="metric-card">
          <div className={`text-3xl font-orbitron font-bold mb-2 ${
            fuelLapsRemaining > 10 ? 'text-race-green' :
            fuelLapsRemaining > 5 ? 'text-yellow-400' : 'text-race-primary'
          }`}>
            {fuelLapsRemaining.toFixed(1)}
          </div>
          <div className="text-race-accent opacity-70">Fuel Laps Left</div>
        </div>
        
        <div className="metric-card">
          <div className="text-3xl font-orbitron font-bold text-race-accent mb-2">
            {optimalPitLap}
          </div>
          <div className="text-race-accent opacity-70">Optimal Pit Lap</div>
        </div>

        <div className="metric-card">
          <div className={`text-3xl font-orbitron font-bold mb-2 ${
            parseFloat(lapTimePenalty) < 0.5 ? 'text-race-green' :
            parseFloat(lapTimePenalty) < 1.0 ? 'text-yellow-400' : 'text-race-primary'
          }`}>
            +{lapTimePenalty}s
          </div>
          <div className="text-race-accent opacity-70">Lap Time Penalty</div>
        </div>
      </motion.div>

      {/* Tire and Fuel Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tire Management */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
            Tire Management
          </h3>
          
          <div className="space-y-6">
            {/* Tire Selection */}
            <div>
              <label className="block text-sm font-medium text-race-accent mb-3">
                Tire Compound
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tireCompoundData).map(([compound, data]) => (
                  <button
                    key={compound}
                    onClick={() => setSelectedCompound(compound as TireCompound)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedCompound === compound
                        ? 'border-race-primary bg-race-primary bg-opacity-20'
                        : 'border-race-gray hover:border-race-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-orbitron text-sm">{compound}</span>
                    </div>
                    <div className="text-xs text-race-accent opacity-70 mt-1">
                      Max: {data.maxLaps} laps
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Laps Used Slider */}
            <div>
              <label className="block text-sm font-medium text-race-accent mb-3">
                Laps Used: {lapsUsed} / {currentTireData.maxLaps}
              </label>
              <input
                type="range"
                min="0"
                max={currentTireData.maxLaps}
                value={lapsUsed}
                onChange={(e) => setLapsUsed(Number(e.target.value))}
                className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${currentTireData.color} 0%, ${currentTireData.color} ${(lapsUsed / currentTireData.maxLaps) * 100}%, #2A2A2A ${(lapsUsed / currentTireData.maxLaps) * 100}%, #2A2A2A 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
                <span>Fresh</span>
                <span>Worn Out</span>
              </div>
            </div>
            
            {/* Tire Wear Visualization */}
            <div className="flex justify-center">
              <TireWearChart
                grip={currentGrip}
                compound={selectedCompound}
                lapsUsed={lapsUsed}
                maxLaps={currentTireData.maxLaps}
              />
            </div>
            
            {/* Tire Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-race-bg p-3 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70">Performance</div>
                <div className={`text-lg font-orbitron font-bold ${
                  currentGrip > 85 ? 'text-race-green' :
                  currentGrip > 70 ? 'text-yellow-400' : 'text-race-primary'
                }`}>
                  {currentGrip > 85 ? 'Excellent' :
                   currentGrip > 70 ? 'Good' : 
                   currentGrip > 50 ? 'Degraded' : 'Critical'}
                </div>
              </div>
              
              <div className="bg-race-bg p-3 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70">Degradation Rate</div>
                <div className="text-lg font-orbitron font-bold text-race-accent">
                  {(currentTireData.degradationRate * 100).toFixed(1)}%/lap
                </div>
              </div>
            </div>

            {/* Tire Strategy Recommendation */}
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <h4 className="font-orbitron font-semibold text-race-accent mb-2">
                🎯 Tire Strategy
              </h4>
              <div className="text-sm text-race-accent">
                {currentGrip > 85 ? "✅ Tires in excellent condition - continue pushing" :
                 currentGrip > 70 ? "⚠️ Tires degrading - consider pit window" :
                 currentGrip > 50 ? "🔴 Significant degradation - pit soon" :
                 "🚨 Critical tire wear - pit immediately!"}
              </div>
              <div className="text-xs text-race-accent opacity-70 mt-2">
                Estimated laps remaining: {Math.max(0, Math.floor((70 - currentGrip) / currentTireData.degradationRate))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fuel Management */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            Fuel Management
          </h3>
          
          <div className="space-y-6">
            {/* Fuel Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Initial Fuel (L)
                </label>
                <input
                  type="number"
                  value={initialFuel}
                  onChange={(e) => setInitialFuel(Number(e.target.value))}
                  className="racing-input w-full"
                  min="50"
                  max="150"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Base Consumption (L/lap)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fuelConsumptionRate}
                  onChange={(e) => setFuelConsumptionRate(Number(e.target.value))}
                  className="racing-input w-full"
                  min="1.5"
                  max="4.0"
                />
              </div>
            </div>

            {/* Throttle Usage */}
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Average Throttle Usage: {throttlePercent}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={throttlePercent}
                onChange={(e) => setThrottlePercent(Number(e.target.value))}
                className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #39FF14 0%, #39FF14 ${throttlePercent}%, #2A2A2A ${throttlePercent}%, #2A2A2A 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
            
            {/* Fuel Bar */}
            <div>
              <div className="flex justify-between text-sm text-race-accent mb-2">
                <span>Fuel Level</span>
                <span>{fuelRemaining.toFixed(1)}L / {initialFuel}L</span>
              </div>
              <div className="w-full bg-race-gray rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    fuelRemaining / initialFuel > 0.5 ? 'bg-race-green' :
                    fuelRemaining / initialFuel > 0.25 ? 'bg-yellow-400' : 'bg-race-primary'
                  }`}
                  style={{ width: `${(fuelRemaining / initialFuel) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
                <span>Empty</span>
                <span>Full</span>
              </div>
            </div>
            
            {/* Race Laps Setting */}
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Race Distance: {raceLaps} laps
              </label>
              <input
                type="range"
                min="20"
                max="70"
                value={raceLaps}
                onChange={(e) => setRaceLaps(Number(e.target.value))}
                className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
                <span>Sprint</span>
                <span>Endurance</span>
              </div>
            </div>
            
            {/* Fuel Strategy */}
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <h4 className="font-orbitron font-semibold text-race-accent mb-3">
                Fuel Strategy
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Stint:</span>
                  <span className="text-race-green">{lapsUsed} laps</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel for finish:</span>
                  <span className={fuelRemaining >= (raceLaps - lapsUsed) * adjustedConsumption 
                    ? 'text-race-green' : 'text-race-primary'}>
                    {((raceLaps - lapsUsed) * adjustedConsumption).toFixed(1)}L needed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pit window:</span>
                  <span className="text-race-purple">Lap {Math.max(1, optimalPitLap - 2)} - {optimalPitLap + 2}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel saving penalty:</span>
                  <span className="text-race-primary">+{fuelSavingPenalty.toFixed(1)}s/lap</span>
                </div>
              </div>
            </div>
            
            {/* Fuel Saving Mode */}
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <h4 className="font-orbitron font-semibold text-race-accent mb-3">
                Fuel Saving Mode
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'None', saving: 0, delta: 0, index: 0 },
                  { mode: 'Mode 1', saving: 0.2, delta: 0.1, index: 1 },
                  { mode: 'Mode 2', saving: 0.4, delta: 0.3, index: 2 },
                ].map(({ mode, saving, delta, index }) => (
                  <button
                    key={mode}
                    onClick={() => setFuelSavingMode(index)}
                    className={`p-2 border rounded-lg transition-colors ${
                      fuelSavingMode === index 
                        ? 'border-race-primary bg-race-primary bg-opacity-20' 
                        : 'border-race-gray hover:border-race-primary'
                    }`}
                  >
                    <div className="text-xs font-orbitron font-bold">{mode}</div>
                    <div className="text-xs text-race-green">-{saving}L/lap</div>
                    <div className="text-xs text-race-primary">+{delta}s</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pit Strategy Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Pit Strategy Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conservative Strategy */}
          <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
            <h4 className="font-orbitron font-bold text-race-green mb-3">Conservative</h4>
            <div className="space-y-2 text-sm">
              <div>• Pit on Lap {Math.max(1, optimalPitLap - 3)}</div>
              <div>• Hard compound</div>
              <div>• Full fuel load ({initialFuel}L)</div>
              <div>• Lower risk strategy</div>
              <div className="text-race-green">• Guaranteed finish</div>
            </div>
            <div className="mt-3 text-xs text-race-accent opacity-70">
              Estimated position: 3rd-5th
            </div>
          </div>
          
          {/* Optimal Strategy */}
          <div className="bg-race-bg p-4 rounded-lg border border-race-primary">
            <h4 className="font-orbitron font-bold text-race-primary mb-3">Optimal ⭐</h4>
            <div className="space-y-2 text-sm">
              <div>• Pit on Lap {optimalPitLap}</div>
              <div>• {selectedCompound} compound</div>
              <div>• Calculated fuel load</div>
              <div>• Best time balance</div>
              <div className="text-race-primary">• Risk vs reward optimized</div>
            </div>
            <div className="mt-3 text-xs text-race-accent opacity-70">
              Estimated position: 1st-3rd
            </div>
          </div>
          
          {/* Aggressive Strategy */}
          <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
            <h4 className="font-orbitron font-bold text-race-purple mb-3">Aggressive</h4>
            <div className="space-y-2 text-sm">
              <div>• Pit on Lap {Math.min(raceLaps - 5, optimalPitLap + 3)}</div>
              <div>• Soft compound</div>
              <div>• Minimum fuel</div>
              <div>• High risk, high reward</div>
              <div className="text-race-purple">• Maximum attack mode</div>
            </div>
            <div className="mt-3 text-xs text-race-accent opacity-70">
              Estimated position: 1st or DNF
            </div>
          </div>
        </div>

        {/* Real-time Recommendations */}
        <div className="mt-6 bg-race-bg p-4 rounded-lg border border-race-gray">
          <h4 className="font-orbitron font-semibold text-race-accent mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Real-time Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-race-accent opacity-70 mb-2">Current Situation:</div>
              <ul className="space-y-1">
                <li>• Tire grip: {currentGrip.toFixed(1)}% ({currentGrip > 70 ? 'Good' : 'Degraded'})</li>
                <li>• Fuel remaining: {fuelLapsRemaining.toFixed(1)} laps</li>
                <li>• Lap time penalty: +{lapTimePenalty}s</li>
                <li>• Pit window: {shouldPit ? 'OPEN' : 'Closed'}</li>
              </ul>
            </div>
            
            <div>
              <div className="text-race-accent opacity-70 mb-2">Recommendations:</div>
              <ul className="space-y-1">
                {shouldPitForTires && <li className="text-race-primary">🔴 Pit for tires (grip critical)</li>}
                {shouldPitForFuel && <li className="text-race-primary">🔴 Pit for fuel (running low)</li>}
                {!shouldPit && currentGrip > 80 && <li className="text-race-green">✅ Continue current stint</li>}
                {!shouldPit && currentGrip <= 80 && <li className="text-yellow-400">⚠️ Monitor tire degradation</li>}
                {fuelSavingMode === 0 && fuelLapsRemaining < 10 && <li className="text-race-purple">💡 Consider fuel saving mode</li>}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};