import React, { useState, useEffect } from 'react';
import { Database, Save, Upload, Download, Trash2, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRacingData } from '../hooks/useRacingData';
import { SessionData, WeatherCondition } from '../types/racing';
import { getAllTrackNames } from '../data/tracks';

export const Session: React.FC = () => {
  const { 
    currentSession, 
    setCurrentSession, 
    saveSession, 
    loadSavedSessions, 
    exportSessionAsJSON,
    clearSession 
  } = useRacingData();
  
  const [sessionForm, setSessionForm] = useState({
    driverName: currentSession?.driverName || 'Tanmay Kumar Singh',
    carNumber: currentSession?.carNumber || '44',
    team: currentSession?.team || 'RaceIQ Racing',
    sessionType: currentSession?.sessionType || 'Practice' as SessionData['sessionType'],
    trackName: currentSession?.trackName || 'Monaco Grand Prix',
    weather: currentSession?.weather || 'Sunny' as WeatherCondition,
  });

  const [savedSessions, setSavedSessions] = useState<SessionData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load saved sessions on component mount
  useEffect(() => {
    setSavedSessions(loadSavedSessions());
  }, [loadSavedSessions]);

  const handleCreateSession = () => {
    const newSession: SessionData = {
      ...sessionForm,
      laps: [],
      createdAt: new Date(),
    };
    
    setCurrentSession(newSession);
    setShowCreateForm(false);
  };

  const handleSaveSession = () => {
    if (currentSession) {
      saveSession(currentSession);
      setSavedSessions(loadSavedSessions()); // Refresh the list
      alert('Session saved successfully!');
    }
  };

  const handleLoadSession = (session: SessionData) => {
    setCurrentSession(session);
    setSessionForm({
      driverName: session.driverName,
      carNumber: session.carNumber,
      team: session.team,
      sessionType: session.sessionType,
      trackName: session.trackName,
      weather: session.weather,
    });
  };

  const handleDeleteSession = (sessionToDelete: SessionData) => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      const updatedSessions = savedSessions.filter(session => 
        session.createdAt.getTime() !== sessionToDelete.createdAt.getTime()
      );
      localStorage.setItem('raceiq-saved-sessions', JSON.stringify(updatedSessions));
      setSavedSessions(updatedSessions);
    }
  };

  const handleImportSession = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const sessionData = JSON.parse(e.target?.result as string);
            const importedSession: SessionData = {
              ...sessionData,
              createdAt: new Date(sessionData.createdAt)
            };
            setCurrentSession(importedSession);
            alert('Session imported successfully!');
          } catch (error) {
            alert('Error importing session. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
  };

  const calculateSessionStats = (session: SessionData) => {
    if (session.laps.length === 0) {
      return { bestLap: 0, averageLap: 0, topSpeed: 0, totalLaps: 0 };
    }

    const lapTimes = session.laps.map(lap => lap.lapTime);
    const speeds = session.laps.map(lap => lap.speed);

    return {
      bestLap: Math.min(...lapTimes),
      averageLap: lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length,
      topSpeed: Math.max(...speeds),
      totalLaps: session.laps.length
    };
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
          <Database className="w-8 h-8 text-race-primary" />
          Session Management
        </h1>
        
        <div className="flex gap-3">
          <button 
            onClick={handleImportSession}
            className="racing-button flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Session
          </button>
          
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="racing-button flex items-center gap-2 bg-race-green text-black"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
          
          {currentSession && (
            <button 
              onClick={handleSaveSession}
              className="racing-button flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Session
            </button>
          )}
        </div>
      </motion.div>

      {/* Current Session Info */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="racing-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-orbitron font-semibold text-race-accent">
              Current Session
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={() => exportSessionAsJSON(currentSession)}
                className="px-4 py-2 bg-race-purple text-white rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold text-sm flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear the current session? All unsaved data will be lost.')) {
                    clearSession();
                  }
                }}
                className="px-4 py-2 bg-race-primary text-white rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-race-accent opacity-70 mb-1">Driver</div>
              <div className="font-orbitron font-bold text-race-primary">
                #{currentSession.carNumber} {currentSession.driverName}
              </div>
              <div className="text-sm text-race-accent opacity-70">
                {currentSession.team}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-race-accent opacity-70 mb-1">Session</div>
              <div className="font-orbitron font-bold text-race-accent">
                {currentSession.sessionType}
              </div>
              <div className="text-sm text-race-accent opacity-70">
                {currentSession.trackName}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-race-accent opacity-70 mb-1">Status</div>
              <div className="font-orbitron font-bold text-race-green">
                {currentSession.laps.length} Laps Completed
              </div>
              <div className="text-sm text-race-accent opacity-70">
                {currentSession.weather} conditions
              </div>
            </div>
          </div>
          
          {currentSession.laps.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Best Lap</div>
                <div className="text-2xl font-orbitron font-bold text-race-green">
                  {formatTime(Math.min(...currentSession.laps.map(lap => lap.lapTime)))}
                </div>
              </div>
              
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Average Lap</div>
                <div className="text-2xl font-orbitron font-bold text-race-accent">
                  {formatTime(currentSession.laps.reduce((sum, lap) => sum + lap.lapTime, 0) / currentSession.laps.length)}
                </div>
              </div>
              
              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Top Speed</div>
                <div className="text-2xl font-orbitron font-bold text-race-primary">
                  {Math.max(...currentSession.laps.map(lap => lap.speed))} km/h
                </div>
              </div>

              <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
                <div className="text-sm text-race-accent opacity-70 mb-1">Consistency</div>
                <div className="text-2xl font-orbitron font-bold text-race-purple">
                  {(() => {
                    const times = currentSession.laps.map(lap => lap.lapTime);
                    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
                    const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
                    return Math.sqrt(variance).toFixed(3);
                  })()}s
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Create New Session */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
            Create New Session
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={sessionForm.driverName}
                  onChange={(e) => setSessionForm({ ...sessionForm, driverName: e.target.value })}
                  className="racing-input w-full"
                  placeholder="Enter driver name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Car Number *
                </label>
                <input
                  type="text"
                  value={sessionForm.carNumber}
                  onChange={(e) => setSessionForm({ ...sessionForm, carNumber: e.target.value })}
                  className="racing-input w-full"
                  placeholder="44"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Team *
                </label>
                <input
                  type="text"
                  value={sessionForm.team}
                  onChange={(e) => setSessionForm({ ...sessionForm, team: e.target.value })}
                  className="racing-input w-full"
                  placeholder="Enter team name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Session Type *
                </label>
                <select
                  value={sessionForm.sessionType}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionType: e.target.value as SessionData['sessionType'] })}
                  className="racing-input w-full"
                  required
                >
                  <option value="Practice">Practice</option>
                  <option value="Qualifying">Qualifying</option>
                  <option value="Race">Race</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Track Name *
                </label>
                <select
                  value={sessionForm.trackName}
                  onChange={(e) => setSessionForm({ ...sessionForm, trackName: e.target.value })}
                  className="racing-input w-full"
                  required
                >
                  {getAllTrackNames().map(trackName => (
                    <option key={trackName} value={trackName}>{trackName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-race-accent mb-2">
                  Weather *
                </label>
                <select
                  value={sessionForm.weather}
                  onChange={(e) => setSessionForm({ ...sessionForm, weather: e.target.value as WeatherCondition })}
                  className="racing-input w-full"
                  required
                >
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Light Rain">Light Rain</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Dry">Dry</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCreateSession}
                className="racing-button flex-1"
              >
                Create Session
              </button>
              
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-race-gray text-race-accent rounded-lg hover:border-race-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Saved Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Saved Sessions ({savedSessions.length})
        </h3>
        
        {savedSessions.length === 0 ? (
          <div className="text-center py-8 text-race-accent opacity-50">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No saved sessions yet.</p>
            <p className="text-sm mt-2">Create and save your first session to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSessions.map((session, index) => {
              const stats = calculateSessionStats(session);
              return (
                <div
                  key={index}
                  className="bg-race-bg border border-race-gray rounded-lg p-4 hover:border-race-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="font-orbitron font-bold text-race-primary">
                          #{session.carNumber} {session.driverName}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          session.sessionType === 'Race' ? 'bg-race-primary text-white' :
                          session.sessionType === 'Qualifying' ? 'bg-race-green text-black' :
                          'bg-race-purple text-white'
                        }`}>
                          {session.sessionType}
                        </div>
                        <div className="text-sm text-race-accent opacity-70">
                          {session.team}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-race-accent opacity-70 mb-2">
                        <span>{session.trackName}</span>
                        <span>{session.weather}</span>
                        <span>{stats.totalLaps} laps</span>
                        <span>{session.createdAt.toLocaleDateString()} {session.createdAt.toLocaleTimeString()}</span>
                      </div>
                      
                      {stats.totalLaps > 0 && (
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-race-green">
                            Best: {formatTime(stats.bestLap)}
                          </span>
                          <span className="text-race-accent">
                            Avg: {formatTime(stats.averageLap)}
                          </span>
                          <span className="text-race-primary">
                            Top: {stats.topSpeed.toFixed(0)} km/h
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleLoadSession(session)}
                        className="px-4 py-2 bg-race-green text-black rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold text-sm"
                      >
                        Load
                      </button>
                      
                      <button
                        onClick={() => exportSessionAsJSON(session)}
                        className="px-4 py-2 bg-race-purple text-white rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold text-sm flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="px-4 py-2 bg-race-primary text-white rounded-lg hover:bg-opacity-80 transition-colors font-orbitron font-semibold text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Session Statistics */}
      {savedSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="racing-card"
        >
          <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Session Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-orbitron font-bold text-race-primary mb-2">
                {savedSessions.length}
              </div>
              <div className="text-race-accent opacity-70">Total Sessions</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-orbitron font-bold text-race-green mb-2">
                {savedSessions.reduce((sum, session) => sum + session.laps.length, 0)}
              </div>
              <div className="text-race-accent opacity-70">Total Laps</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-orbitron font-bold text-race-purple mb-2">
                {savedSessions.filter(s => s.laps.length > 0).length > 0 ? 
                  formatTime(Math.min(...savedSessions
                    .filter(s => s.laps.length > 0)
                    .map(s => Math.min(...s.laps.map(l => l.lapTime)))
                  )) : '--:--.---'
                }
              </div>
              <div className="text-race-accent opacity-70">Overall Best</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-orbitron font-bold text-race-accent mb-2">
                {[...new Set(savedSessions.map(s => s.trackName))].length}
              </div>
              <div className="text-race-accent opacity-70">Tracks Visited</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};