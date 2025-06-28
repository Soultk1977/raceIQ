import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Calculator, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRacingData } from '../hooks/useRacingData';

interface StrategyStint {
  id: number;
  compound: string;
  startLap: number;
  endLap: number;
  fuelLoad: number;
  expectedPace: number;
}

interface RaceStrategy {
  id: number;
  name: string;
  stints: StrategyStint[];
  totalTime: number;
  position: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const Strategy: React.FC = () => {
  const { currentSession } = useRacingData();
  const [raceLength, setRaceLength] = useState(53);
  const [trackLength, setTrackLength] = useState(5.891);
  const [pitLaneDelta, setPitLaneDelta] = useState(22.5);
  const [averageLapTime, setAverageLapTime] = useState(92.3);
  const [weatherCondition, setWeatherCondition] = useState('Dry');
  const [safetyCarProbability, setSafetyCarProbability] = useState(30);

  // Strategy simulation states
  const [strategies, setStrategies] = useState<RaceStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);

  // Undercut/Overcut scenario
  const [undercutScenario, setUndercutScenario] = useState({
    yourPosition: 3,
    targetPosition: 2,
    gapToTarget: 2.8,
    pitAdvantage: 1.2,
    fresherTireAdvantage: 1.8,
    trackPosition: 0
  });

  // Generate realistic strategies based on current parameters
  useEffect(() => {
    const generateStrategies = () => {
      const baseTime = averageLapTime * raceLength;
      
      const newStrategies: RaceStrategy[] = [
        {
          id: 1,
          name: "One Stop",
          stints: [
            { id: 1, compound: "Medium", startLap: 1, endLap: 35, fuelLoad: 80, expectedPace: averageLapTime + 0.2 },
            { id: 2, compound: "Hard", startLap: 36, endLap: raceLength, fuelLoad: 45, expectedPace: averageLapTime + 0.5 }
          ],
          totalTime: baseTime + pitLaneDelta + 15, // Fuel weight penalty
          position: 2,
          riskLevel: 'Low'
        },
        {
          id: 2,
          name: "Two Stop",
          stints: [
            { id: 1, compound: "Soft", startLap: 1, endLap: 18, fuelLoad: 45, expectedPace: averageLapTime - 0.3 },
            { id: 2, compound: "Medium", startLap: 19, endLap: 36, fuelLoad: 45, expectedPace: averageLapTime },
            { id: 3, compound: "Soft", startLap: 37, endLap: raceLength, fuelLoad: 40, expectedPace: averageLapTime - 0.2 }
          ],
          totalTime: baseTime + (pitLaneDelta * 2) - 8, // Faster pace advantage
          position: 1,
          riskLevel: 'Medium'
        },
        {
          id: 3,
          name: "Aggressive",
          stints: [
            { id: 1, compound: "Soft", startLap: 1, endLap: 15, fuelLoad: 35, expectedPace: averageLapTime - 0.5 },
            { id: 2, compound: "Soft", startLap: 16, endLap: 30, fuelLoad: 35, expectedPace: averageLapTime - 0.3 },
            { id: 3, compound: "Medium", startLap: 31, endLap: raceLength, fuelLoad: 50, expectedPace: averageLapTime + 0.1 }
          ],
          totalTime: baseTime + (pitLaneDelta * 2) - 12,
          position: 1,
          riskLevel: 'High'
        },
        {
          id: 4,
          name: "Conservative",
          stints: [
            { id: 1, compound: "Hard", startLap: 1, endLap: 40, fuelLoad: 90, expectedPace: averageLapTime + 0.8 },
            { id: 2, compound: "Medium", startLap: 41, endLap: raceLength, fuelLoad: 35, expectedPace: averageLapTime + 0.3 }
          ],
          totalTime: baseTime + pitLaneDelta + 25,
          position: 4,
          riskLevel: 'Low'
        }
      ];

      // Adjust for weather
      if (weatherCondition === 'Light Rain') {
        newStrategies.forEach(strategy => {
          strategy.totalTime += 30; // Rain penalty
          strategy.stints.forEach(stint => {
            if (stint.compound !== 'Intermediate') {
              stint.expectedPace += 2.0; // Slower on wrong tires
            }
          });
        });
      }

      // Sort by total time
      newStrategies.sort((a, b) => a.totalTime - b.totalTime);
      newStrategies.forEach((strategy, index) => {
        strategy.position = index + 1;
      });

      setStrategies(newStrategies);
    };

    generateStrategies();
  }, [raceLength, averageLapTime, pitLaneDelta, weatherCondition]);

  const calculateUndercutSuccess = () => {
    const { gapToTarget, pitAdvantage, fresherTireAdvantage } = undercutScenario;
    const totalAdvantage = pitAdvantage + fresherTireAdvantage;
    const successProbability = Math.min(95, Math.max(5, (totalAdvantage / gapToTarget) * 100));
    return {
      success: totalAdvantage > gapToTarget,
      probability: successProbability
    };
  };

  const calculateOvercutSuccess = () => {
    const { gapToTarget } = undercutScenario;
    const trackPosition = gapToTarget + pitLaneDelta;
    const stayOutLaps = 3;
    const timeGained = undercutScenario.pitAdvantage * stayOutLaps;
    const successProbability = Math.min(95, Math.max(5, (timeGained / trackPosition) * 100));
    
    return {
      success: timeGained > trackPosition,
      probability: successProbability
    };
  };

  const undercutResult = calculateUndercutSuccess();
  const overcutResult = calculateOvercutSuccess();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateStrategyRisk = (strategy: RaceStrategy) => {
    let riskScore = 0;
    
    // More stops = more risk
    riskScore += (strategy.stints.length - 1) * 20;
    
    // Soft tires = more risk
    strategy.stints.forEach(stint => {
      if (stint.compound === 'Soft') riskScore += 15;
      if (stint.compound === 'Medium') riskScore += 5;
    });
    
    // Weather risk
    if (weatherCondition === 'Light Rain') riskScore += 25;
    
    return Math.min(100, riskScore);
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
          <TrendingUp className="w-8 h-8 text-race-primary" />
          Race Strategy Tools
        </h1>
        
        <div className="flex gap-3">
          <button className="racing-button flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Strategy Calculator
          </button>
        </div>
      </motion.div>

      {/* Race Parameters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Race Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Race Length (laps)
            </label>
            <input
              type="number"
              value={raceLength}
              onChange={(e) => setRaceLength(Number(e.target.value))}
              className="racing-input w-full"
              min="20"
              max="70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Track Length (km)
            </label>
            <input
              type="number"
              step="0.001"
              value={trackLength}
              onChange={(e) => setTrackLength(Number(e.target.value))}
              className="racing-input w-full"
              min="3"
              max="8"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Pit Lane Delta (s)
            </label>
            <input
              type="number"
              step="0.1"
              value={pitLaneDelta}
              onChange={(e) => setPitLaneDelta(Number(e.target.value))}
              className="racing-input w-full"
              min="15"
              max="35"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Average Lap Time (s)
            </label>
            <input
              type="number"
              step="0.1"
              value={averageLapTime}
              onChange={(e) => setAverageLapTime(Number(e.target.value))}
              className="racing-input w-full"
              min="60"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Weather Condition
            </label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="racing-input w-full"
            >
              <option value="Dry">Dry</option>
              <option value="Light Rain">Light Rain</option>
              <option value="Heavy Rain">Heavy Rain</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-race-accent mb-2">
            Safety Car Probability: {safetyCarProbability}%
          </label>
          <input
            type="range"
            min="0"
            max="80"
            value={safetyCarProbability}
            onChange={(e) => setSafetyCarProbability(Number(e.target.value))}
            className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
            <span>No SC</span>
            <span>High SC Risk</span>
          </div>
        </div>
      </motion.div>

      {/* Strategy Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Strategy Comparison & Analysis
        </h3>
        
        <div className="space-y-6">
          {strategies.map((strategy, index) => {
            const riskScore = calculateStrategyRisk(strategy);
            return (
              <div
                key={strategy.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  strategy.position === 1 
                    ? 'border-race-green bg-race-green bg-opacity-10' 
                    : selectedStrategy === strategy.id
                    ? 'border-race-primary bg-race-primary bg-opacity-10'
                    : 'border-race-gray bg-race-bg hover:border-race-primary'
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-bold ${
                      strategy.position === 1 ? 'bg-race-green text-black' : 
                      strategy.position === 2 ? 'bg-race-purple text-white' :
                      'bg-race-primary text-white'
                    }`}>
                      {strategy.position}
                    </div>
                    <div>
                      <h4 className="font-orbitron font-bold text-race-accent">
                        {strategy.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          strategy.riskLevel === 'Low' ? 'bg-race-green text-black' :
                          strategy.riskLevel === 'Medium' ? 'bg-yellow-500 text-black' :
                          'bg-race-primary text-white'
                        }`}>
                          {strategy.riskLevel} Risk
                        </span>
                        <span className="text-race-accent opacity-70">
                          Risk Score: {riskScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-orbitron font-bold text-race-primary">
                      {formatTime(strategy.totalTime)}
                    </div>
                    <div className="text-sm text-race-accent opacity-70">
                      Total Race Time
                    </div>
                    {strategy.position === 1 && (
                      <div className="text-xs text-race-green font-bold">
                        FASTEST
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Stint Timeline */}
                <div className="space-y-2">
                  {strategy.stints.map((stint, stintIndex) => (
                    <div key={stint.id} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${
                        stint.compound === 'Soft' ? 'bg-race-primary' :
                        stint.compound === 'Medium' ? 'bg-yellow-400' :
                        stint.compound === 'Hard' ? 'bg-race-accent' :
                        stint.compound === 'Intermediate' ? 'bg-race-green' :
                        'bg-blue-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-orbitron text-sm">
                            Stint {stintIndex + 1}: {stint.compound} - Laps {stint.startLap}-{stint.endLap}
                          </span>
                          <span className="text-sm text-race-accent opacity-70">
                            {stint.endLap - stint.startLap + 1} laps | {stint.fuelLoad}L
                          </span>
                        </div>
                        
                        <div className="w-full bg-race-gray rounded-full h-2 mt-1">
                          <div
                            className={`h-full rounded-full ${
                              stint.compound === 'Soft' ? 'bg-race-primary' :
                              stint.compound === 'Medium' ? 'bg-yellow-400' :
                              stint.compound === 'Hard' ? 'bg-race-accent' :
                              stint.compound === 'Intermediate' ? 'bg-race-green' :
                              'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${((stint.endLap - stint.startLap + 1) / raceLength) * 100}%` 
                            }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
                          <span>Pace: {stint.expectedPace.toFixed(3)}s</span>
                          <span>Delta: {stint.expectedPace > averageLapTime ? '+' : ''}{(stint.expectedPace - averageLapTime).toFixed(3)}s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strategy Analysis */}
                {selectedStrategy === strategy.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-race-gray"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-race-accent opacity-70 mb-1">Advantages:</div>
                        <ul className="space-y-1">
                          {strategy.stints.length === 1 && <li>• No pit stop risk</li>}
                          {strategy.stints.length === 2 && <li>• Balanced approach</li>}
                          {strategy.stints.length >= 3 && <li>• Maximum pace potential</li>}
                          {strategy.riskLevel === 'Low' && <li>• High finish probability</li>}
                          {strategy.position <= 2 && <li>• Podium potential</li>}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="text-race-accent opacity-70 mb-1">Risks:</div>
                        <ul className="space-y-1">
                          {strategy.stints.length >= 3 && <li>• Multiple pit stops</li>}
                          {riskScore > 60 && <li>• High strategy risk</li>}
                          {strategy.stints.some(s => s.compound === 'Soft') && <li>• Tire degradation</li>}
                          {weatherCondition !== 'Dry' && <li>• Weather dependency</li>}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="text-race-accent opacity-70 mb-1">Key Factors:</div>
                        <ul className="space-y-1">
                          <li>• Pit stops: {strategy.stints.length - 1}</li>
                          <li>• Time lost: {((strategy.stints.length - 1) * pitLaneDelta).toFixed(1)}s</li>
                          <li>• SC probability: {safetyCarProbability}%</li>
                          <li>• Weather: {weatherCondition}</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Undercut/Overcut Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Undercut Simulator
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Your Position
                </label>
                <input
                  type="number"
                  value={undercutScenario.yourPosition}
                  onChange={(e) => setUndercutScenario({
                    ...undercutScenario,
                    yourPosition: Number(e.target.value)
                  })}
                  className="racing-input w-full"
                  min="1"
                  max="20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Target Position
                </label>
                <input
                  type="number"
                  value={undercutScenario.targetPosition}
                  onChange={(e) => setUndercutScenario({
                    ...undercutScenario,
                    targetPosition: Number(e.target.value)
                  })}
                  className="racing-input w-full"
                  min="1"
                  max="20"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Gap to Target: {undercutScenario.gapToTarget}s
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={undercutScenario.gapToTarget}
                onChange={(e) => setUndercutScenario({
                  ...undercutScenario,
                  gapToTarget: Number(e.target.value)
                })}
                className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Pit Advantage: {undercutScenario.pitAdvantage}s
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={undercutScenario.pitAdvantage}
                  onChange={(e) => setUndercutScenario({
                    ...undercutScenario,
                    pitAdvantage: Number(e.target.value)
                  })}
                  className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Fresh Tire Advantage: {undercutScenario.fresherTireAdvantage}s
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={undercutScenario.fresherTireAdvantage}
                  onChange={(e) => setUndercutScenario({
                    ...undercutScenario,
                    fresherTireAdvantage: Number(e.target.value)
                  })}
                  className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Undercut Result */}
            <div className={`p-4 rounded-lg border ${
              undercutResult.success 
                ? 'border-race-green bg-race-green bg-opacity-10' 
                : 'border-race-primary bg-race-primary bg-opacity-10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron font-bold">
                  Undercut Success
                </span>
                <span className={`font-orbitron font-bold ${
                  undercutResult.success ? 'text-race-green' : 'text-race-primary'
                }`}>
                  {undercutResult.probability.toFixed(0)}%
                </span>
              </div>
              <div className="text-sm text-race-accent opacity-70">
                Total advantage: {(undercutScenario.pitAdvantage + undercutScenario.fresherTireAdvantage).toFixed(1)}s
                vs {undercutScenario.gapToTarget}s gap
              </div>
              <div className="mt-2">
                <div className="w-full bg-race-gray rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      undercutResult.success ? 'bg-race-green' : 'bg-race-primary'
                    }`}
                    style={{ width: `${undercutResult.probability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overcut Simulator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Overcut Simulator
          </h3>
          
          <div className="space-y-4">
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <h4 className="font-orbitron font-semibold text-race-accent mb-3">
                Overcut Strategy Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Stay out extra laps:</span>
                  <span className="text-race-green">3 laps</span>
                </div>
                <div className="flex justify-between">
                  <span>Track position time:</span>
                  <span className="text-race-purple">
                    {(undercutScenario.gapToTarget + pitLaneDelta).toFixed(1)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time gained staying out:</span>
                  <span className="text-race-primary">
                    {(undercutScenario.pitAdvantage * 3).toFixed(1)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tire degradation penalty:</span>
                  <span className="text-race-primary">
                    +{(3 * 0.2).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
            
            {/* Overcut Result */}
            <div className={`p-4 rounded-lg border ${
              overcutResult.success 
                ? 'border-race-green bg-race-green bg-opacity-10' 
                : 'border-race-primary bg-race-primary bg-opacity-10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron font-bold">
                  Overcut Success
                </span>
                <span className={`font-orbitron font-bold ${
                  overcutResult.success ? 'text-race-green' : 'text-race-primary'
                }`}>
                  {overcutResult.probability.toFixed(0)}%
                </span>
              </div>
              <div className="text-sm text-race-accent opacity-70">
                Need clear air and consistent pace advantage
              </div>
              <div className="mt-2">
                <div className="w-full bg-race-gray rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      overcutResult.success ? 'bg-race-green' : 'bg-race-primary'
                    }`}
                    style={{ width: `${overcutResult.probability}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strategy Recommendation */}
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <h4 className="font-orbitron font-semibold text-race-primary mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Recommendation
              </h4>
              <div className="text-sm text-race-accent">
                {undercutResult.success && !overcutResult.success && 
                  "🎯 Go for the UNDERCUT - you have a clear advantage!"
                }
                {!undercutResult.success && overcutResult.success && 
                  "⏰ Try the OVERCUT - stay out for track position!"
                }
                {undercutResult.success && overcutResult.success && 
                  "🔥 Both strategies viable - choose based on race situation and tire condition!"
                }
                {!undercutResult.success && !overcutResult.success && 
                  "⚠️ Neither strategy favorable - consider alternative approach or wait for better opportunity!"
                }
              </div>
              
              <div className="mt-3 text-xs text-race-accent opacity-70">
                <div>Factors to consider:</div>
                <ul className="mt-1 space-y-1">
                  <li>• Current tire condition and degradation rate</li>
                  <li>• Traffic ahead and behind</li>
                  <li>• Weather forecast and track evolution</li>
                  <li>• Safety car probability: {safetyCarProbability}%</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Race Timeline Planner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Race Timeline Planner
        </h3>
        
        <div className="relative">
          {/* Timeline */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-race-accent">Lap 1</div>
            <div className="text-sm text-race-accent">Lap {raceLength}</div>
          </div>
          
          <div className="relative h-12 bg-race-gray rounded-full mb-6 overflow-hidden">
            {/* Pit windows */}
            <div 
              className="absolute h-full bg-race-primary bg-opacity-30 rounded-full"
              style={{
                left: `${(15 / raceLength) * 100}%`,
                width: `${(10 / raceLength) * 100}%`
              }}
            />
            <div 
              className="absolute h-full bg-race-green bg-opacity-30 rounded-full"
              style={{
                left: `${(35 / raceLength) * 100}%`,
                width: `${(10 / raceLength) * 100}%`
              }}
            />
            
            {/* Strategy markers */}
            {selectedStrategy && strategies.find(s => s.id === selectedStrategy)?.stints.map((stint, index) => {
              if (index === 0) return null; // Skip first stint (race start)
              return (
                <div 
                  key={index}
                  className="absolute w-3 h-full bg-race-purple rounded-full border-2 border-white"
                  style={{ left: `${((stint.startLap - 1) / raceLength) * 100}%` }}
                  title={`Pit Stop ${index}: Lap ${stint.startLap}`}
                />
              );
            })}
            
            {/* Safety car zones */}
            {safetyCarProbability > 50 && (
              <div 
                className="absolute h-full bg-yellow-400 bg-opacity-20 rounded-full"
                style={{
                  left: `${(25 / raceLength) * 100}%`,
                  width: `${(5 / raceLength) * 100}%`
                }}
              />
            )}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-race-primary bg-opacity-30 rounded"></div>
              <span>Early pit window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-race-green bg-opacity-30 rounded"></div>
              <span>Optimal pit window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-4 bg-race-purple rounded border border-white"></div>
              <span>Selected strategy pit stops</span>
            </div>
            {safetyCarProbability > 50 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 bg-opacity-20 rounded"></div>
                <span>Potential safety car</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};