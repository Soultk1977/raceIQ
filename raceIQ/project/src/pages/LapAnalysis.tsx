import React, { useState, useEffect } from 'react';
import { Timer, Plus, Download, Upload, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { LapTimeChart } from '../components/Charts/LapTimeChart';
import { useRacingData } from '../hooks/useRacingData';
import { LapData, TireCompound } from '../types/racing';
import { getAllTrackNames } from '../data/tracks';

export const LapAnalysis: React.FC = () => {
  const { currentSession, setCurrentSession, addLapData } = useRacingData();
  const [selectedLap, setSelectedLap] = useState<number | undefined>();
  const [comparisonLap, setComparisonLap] = useState<number | undefined>();
  const [newLap, setNewLap] = useState({
    lapTime: '',
    sector1: '',
    sector2: '',
    sector3: '',
    speed: '',
    compound: 'Medium' as TireCompound,
    fuelLoad: '',
    notes: ''
  });

  // Initialize session if none exists
  useEffect(() => {
    if (!currentSession) {
      setCurrentSession({
        driverName: 'Tanmay Kumar Singh',
        carNumber: '44',
        team: 'RaceIQ Racing',
        sessionType: 'Practice',
        trackName: 'Monaco Grand Prix',
        weather: 'Sunny',
        laps: [],
        createdAt: new Date()
      });
    }
  }, [currentSession, setCurrentSession]);

  const laps = currentSession?.laps || [];
  const bestLap = laps.length > 0 ? Math.min(...laps.map(lap => lap.lapTime)) : 0;
  const averageLap = laps.length > 0 ? laps.reduce((sum, lap) => sum + lap.lapTime, 0) / laps.length : 0;
  const consistency = laps.length > 1 ? 
    Math.sqrt(laps.reduce((sum, lap) => sum + Math.pow(lap.lapTime - averageLap, 2), 0) / laps.length) : 0;

  const handleAddLap = () => {
    if (!newLap.lapTime || !newLap.sector1 || !newLap.sector2 || !newLap.sector3) {
      alert('Please fill in lap time and all sector times');
      return;
    }

    const sectorSum = parseFloat(newLap.sector1) + parseFloat(newLap.sector2) + parseFloat(newLap.sector3);
    const lapTime = parseFloat(newLap.lapTime);
    
    if (Math.abs(sectorSum - lapTime) > 0.1) {
      alert('Warning: Sector times do not add up to lap time');
    }

    const lapData: Omit<LapData, 'isPersonalBest' | 'isSessionBest'> = {
      lapNumber: laps.length + 1,
      lapTime: lapTime,
      sector1: parseFloat(newLap.sector1),
      sector2: parseFloat(newLap.sector2),
      sector3: parseFloat(newLap.sector3),
      speed: parseFloat(newLap.speed) || 250,
      compound: newLap.compound,
      fuelLoad: parseFloat(newLap.fuelLoad) || 50,
      notes: newLap.notes
    };

    addLapData(lapData);
    
    // Reset form
    setNewLap({
      lapTime: '',
      sector1: '',
      sector2: '',
      sector3: '',
      speed: '',
      compound: 'Medium',
      fuelLoad: '',
      notes: ''
    });
  };

  const handleQuickLap = (lapType: 'fast' | 'average' | 'slow') => {
    const baseTime = currentSession?.trackName === 'Monaco Grand Prix' ? 70.5 :
                    currentSession?.trackName === 'Silverstone' ? 85.5 :
                    currentSession?.trackName === 'Monza' ? 79.2 : 90.0;
    
    let lapTime: number;
    let compound: TireCompound;
    
    switch (lapType) {
      case 'fast':
        lapTime = baseTime + (Math.random() - 0.8) * 2;
        compound = 'Soft';
        break;
      case 'average':
        lapTime = baseTime + (Math.random() - 0.5) * 3;
        compound = 'Medium';
        break;
      case 'slow':
        lapTime = baseTime + (Math.random() + 0.5) * 4;
        compound = 'Hard';
        break;
    }

    const sector1 = lapTime * (0.32 + (Math.random() - 0.5) * 0.04);
    const sector2 = lapTime * (0.34 + (Math.random() - 0.5) * 0.04);
    const sector3 = lapTime - sector1 - sector2;

    const lapData: Omit<LapData, 'isPersonalBest' | 'isSessionBest'> = {
      lapNumber: laps.length + 1,
      lapTime,
      sector1,
      sector2,
      sector3,
      speed: 200 + Math.random() * 150,
      compound,
      fuelLoad: 60 + Math.random() * 40,
      notes: `Generated ${lapType} lap`
    };

    addLapData(lapData);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
  };

  const calculateDelta = (lap1: LapData, lap2: LapData) => {
    return {
      total: lap1.lapTime - lap2.lapTime,
      sector1: lap1.sector1 - lap2.sector1,
      sector2: lap1.sector2 - lap2.sector2,
      sector3: lap1.sector3 - lap2.sector3,
    };
  };

  const selectedLapData = laps.find(lap => lap.lapNumber === selectedLap);
  const comparisonLapData = laps.find(lap => lap.lapNumber === comparisonLap);
  const delta = selectedLapData && comparisonLapData ? calculateDelta(selectedLapData, comparisonLapData) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="section-title">
          <Timer className="w-8 h-8 text-race-primary" />
          Lap Analysis
        </h1>
        
        <div className="flex gap-3">
          <button className="racing-button flex items-center gap-2 bg-race-green text-black">
            <Plus className="w-4 h-4" />
            Quick Lap
          </button>
          <button className="racing-button flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button className="racing-button flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </motion.div>

      {/* Quick Lap Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <button
          onClick={() => handleQuickLap('fast')}
          className="px-4 py-2 bg-race-green text-black rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold"
        >
          + Fast Lap (Soft)
        </button>
        <button
          onClick={() => handleQuickLap('average')}
          className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold"
        >
          + Average Lap (Medium)
        </button>
        <button
          onClick={() => handleQuickLap('slow')}
          className="px-4 py-2 bg-race-accent text-black rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold"
        >
          + Slow Lap (Hard)
        </button>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="metric-card">
          <div className="text-3xl font-orbitron font-bold text-race-green mb-2">
            {bestLap > 0 ? formatTime(bestLap) : '--:--.---'}
          </div>
          <div className="text-race-accent opacity-70">Best Lap Time</div>
        </div>
        
        <div className="metric-card">
          <div className="text-3xl font-orbitron font-bold text-race-accent mb-2">
            {averageLap > 0 ? formatTime(averageLap) : '--:--.---'}
          </div>
          <div className="text-race-accent opacity-70">Average Lap</div>
        </div>
        
        <div className="metric-card">
          <div className="text-3xl font-orbitron font-bold text-race-primary mb-2">
            {laps.length}
          </div>
          <div className="text-race-accent opacity-70">Total Laps</div>
        </div>

        <div className="metric-card">
          <div className="text-3xl font-orbitron font-bold text-race-purple mb-2">
            {consistency > 0 ? consistency.toFixed(3) : '0.000'}
          </div>
          <div className="text-race-accent opacity-70">Consistency (σ)</div>
        </div>
      </motion.div>

      {/* Lap Comparison */}
      {laps.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Lap Comparison & Delta Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Primary Lap
              </label>
              <select
                value={selectedLap || ''}
                onChange={(e) => setSelectedLap(Number(e.target.value) || undefined)}
                className="racing-input w-full"
              >
                <option value="">Select lap...</option>
                {laps.map(lap => (
                  <option key={lap.lapNumber} value={lap.lapNumber}>
                    Lap {lap.lapNumber} - {formatTime(lap.lapTime)}
                    {lap.isSessionBest ? ' (SB)' : lap.isPersonalBest ? ' (PB)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-race-accent mb-2">
                Comparison Lap
              </label>
              <select
                value={comparisonLap || ''}
                onChange={(e) => setComparisonLap(Number(e.target.value) || undefined)}
                className="racing-input w-full"
              >
                <option value="">Select lap...</option>
                {laps.map(lap => (
                  <option key={lap.lapNumber} value={lap.lapNumber}>
                    Lap {lap.lapNumber} - {formatTime(lap.lapTime)}
                    {lap.isSessionBest ? ' (SB)' : lap.isPersonalBest ? ' (PB)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {delta && (
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <h4 className="font-orbitron font-semibold text-race-accent mb-3">
                Delta Analysis (Lap {selectedLap} vs Lap {comparisonLap})
              </h4>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-orbitron font-bold ${
                    delta.total > 0 ? 'text-race-primary' : 'text-race-green'
                  }`}>
                    {delta.total > 0 ? '+' : ''}{delta.total.toFixed(3)}s
                  </div>
                  <div className="text-sm text-race-accent opacity-70">Total</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-orbitron font-bold ${
                    delta.sector1 > 0 ? 'text-race-primary' : 'text-race-green'
                  }`}>
                    {delta.sector1 > 0 ? '+' : ''}{delta.sector1.toFixed(3)}s
                  </div>
                  <div className="text-sm text-race-accent opacity-70">Sector 1</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-orbitron font-bold ${
                    delta.sector2 > 0 ? 'text-race-primary' : 'text-race-green'
                  }`}>
                    {delta.sector2 > 0 ? '+' : ''}{delta.sector2.toFixed(3)}s
                  </div>
                  <div className="text-sm text-race-accent opacity-70">Sector 2</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-orbitron font-bold ${
                    delta.sector3 > 0 ? 'text-race-primary' : 'text-race-green'
                  }`}>
                    {delta.sector3 > 0 ? '+' : ''}{delta.sector3.toFixed(3)}s
                  </div>
                  <div className="text-sm text-race-accent opacity-70">Sector 3</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Lap Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4">
          Lap Time Progression
        </h3>
        {laps.length > 0 ? (
          <LapTimeChart laps={laps} selectedLap={selectedLap} />
        ) : (
          <div className="h-96 flex items-center justify-center text-race-accent opacity-50">
            No lap data available. Add your first lap below or use Quick Lap buttons.
          </div>
        )}
      </motion.div>

      {/* Add New Lap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Lap
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Lap Time (seconds) *
            </label>
            <input
              type="number"
              step="0.001"
              value={newLap.lapTime}
              onChange={(e) => setNewLap({ ...newLap, lapTime: e.target.value })}
              className="racing-input w-full"
              placeholder="90.123"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Sector 1 (s) *
            </label>
            <input
              type="number"
              step="0.001"
              value={newLap.sector1}
              onChange={(e) => setNewLap({ ...newLap, sector1: e.target.value })}
              className="racing-input w-full"
              placeholder="28.456"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Sector 2 (s) *
            </label>
            <input
              type="number"
              step="0.001"
              value={newLap.sector2}
              onChange={(e) => setNewLap({ ...newLap, sector2: e.target.value })}
              className="racing-input w-full"
              placeholder="30.789"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Sector 3 (s) *
            </label>
            <input
              type="number"
              step="0.001"
              value={newLap.sector3}
              onChange={(e) => setNewLap({ ...newLap, sector3: e.target.value })}
              className="racing-input w-full"
              placeholder="30.878"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Top Speed (km/h)
            </label>
            <input
              type="number"
              value={newLap.speed}
              onChange={(e) => setNewLap({ ...newLap, speed: e.target.value })}
              className="racing-input w-full"
              placeholder="315"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Tire Compound
            </label>
            <select
              value={newLap.compound}
              onChange={(e) => setNewLap({ ...newLap, compound: e.target.value as TireCompound })}
              className="racing-input w-full"
            >
              <option value="Soft">Soft (Red)</option>
              <option value="Medium">Medium (Yellow)</option>
              <option value="Hard">Hard (White)</option>
              <option value="Intermediate">Intermediate (Green)</option>
              <option value="Wet">Wet (Blue)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Fuel Load (L)
            </label>
            <input
              type="number"
              value={newLap.fuelLoad}
              onChange={(e) => setNewLap({ ...newLap, fuelLoad: e.target.value })}
              className="racing-input w-full"
              placeholder="75"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-race-accent mb-2">
            Notes
          </label>
          <textarea
            value={newLap.notes}
            onChange={(e) => setNewLap({ ...newLap, notes: e.target.value })}
            className="racing-input w-full h-20 resize-none"
            placeholder="Lap notes, setup changes, track conditions..."
          />
        </div>
        
        <button
          onClick={handleAddLap}
          className="racing-button w-full"
        >
          Add Lap Data
        </button>
      </motion.div>

      {/* Lap Details Table */}
      {laps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-4">
            Lap Details
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-race-gray">
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">Lap</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">Time</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">S1</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">S2</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">S3</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">Speed</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">Compound</th>
                  <th className="text-left py-3 px-2 font-orbitron text-race-accent">Delta</th>
                </tr>
              </thead>
              <tbody>
                {laps.map((lap) => {
                  const deltaFromBest = bestLap > 0 ? lap.lapTime - bestLap : 0;
                  return (
                    <tr
                      key={lap.lapNumber}
                      className={`border-b border-race-gray hover:bg-race-gray cursor-pointer transition-colors ${
                        selectedLap === lap.lapNumber ? 'bg-race-gray' : ''
                      }`}
                      onClick={() => setSelectedLap(lap.lapNumber)}
                    >
                      <td className="py-3 px-2 font-orbitron font-bold">
                        {lap.lapNumber}
                      </td>
                      <td className={`py-3 px-2 font-orbitron font-bold ${
                        lap.isSessionBest ? 'text-race-purple' : 
                        lap.isPersonalBest ? 'text-race-green' : 'text-race-accent'
                      }`}>
                        {formatTime(lap.lapTime)}
                        {lap.isSessionBest && ' 👑'}
                        {lap.isPersonalBest && !lap.isSessionBest && ' ⭐'}
                      </td>
                      <td className="py-3 px-2 text-race-accent">
                        {lap.sector1.toFixed(3)}
                      </td>
                      <td className="py-3 px-2 text-race-accent">
                        {lap.sector2.toFixed(3)}
                      </td>
                      <td className="py-3 px-2 text-race-accent">
                        {lap.sector3.toFixed(3)}
                      </td>
                      <td className="py-3 px-2 text-race-accent">
                        {lap.speed.toFixed(0)} km/h
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          lap.compound === 'Soft' ? 'bg-race-primary text-white' :
                          lap.compound === 'Medium' ? 'bg-yellow-600 text-white' :
                          lap.compound === 'Hard' ? 'bg-gray-600 text-white' :
                          lap.compound === 'Intermediate' ? 'bg-race-green text-black' :
                          'bg-blue-600 text-white'
                        }`}>
                          {lap.compound}
                        </span>
                      </td>
                      <td className={`py-3 px-2 font-orbitron ${
                        deltaFromBest === 0 ? 'text-race-green' :
                        deltaFromBest < 1 ? 'text-yellow-400' : 'text-race-primary'
                      }`}>
                        {deltaFromBest === 0 ? '---' : `+${deltaFromBest.toFixed(3)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};