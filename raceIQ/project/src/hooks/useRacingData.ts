import { useState, useCallback, useEffect } from 'react';
import { LapData, SessionData, TelemetryData, PerformanceMetrics, TrackData } from '../types/racing';
import { getTrackByName } from '../data/tracks';

export const useRacingData = () => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem('raceiq-current-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt)
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [currentTrack, setCurrentTrack] = useState<TrackData | null>(null);

  // Save to localStorage whenever session changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('raceiq-current-session', JSON.stringify(currentSession));
      const track = getTrackByName(currentSession.trackName);
      setCurrentTrack(track || null);
    }
  }, [currentSession]);

  const addLapData = useCallback((lapData: Omit<LapData, 'isPersonalBest' | 'isSessionBest'>) => {
    if (!currentSession) return;

    const laps = currentSession.laps;
    const personalBest = laps.length > 0 ? Math.min(...laps.map(lap => lap.lapTime)) : Infinity;
    const sessionBest = laps.length > 0 ? Math.min(...laps.map(lap => lap.lapTime)) : Infinity;

    const newLap: LapData = {
      ...lapData,
      isPersonalBest: lapData.lapTime < personalBest,
      isSessionBest: lapData.lapTime < sessionBest,
    };

    // Update existing laps if this is a new personal/session best
    const updatedLaps = laps.map(lap => ({
      ...lap,
      isPersonalBest: lap.lapTime === personalBest && lap.lapTime < lapData.lapTime ? false : lap.isPersonalBest,
      isSessionBest: lap.lapTime === sessionBest && lap.lapTime < lapData.lapTime ? false : lap.isSessionBest,
    }));

    setCurrentSession(prev => ({
      ...prev!,
      laps: [...updatedLaps, newLap]
    }));
  }, [currentSession]);

  const calculatePerformanceMetrics = useCallback((): PerformanceMetrics => {
    if (!currentSession || currentSession.laps.length === 0) {
      return {
        bestLap: 0,
        averageLap: 0,
        consistency: 0,
        topSpeed: 0,
        averageSpeed: 0,
        totalDistance: 0,
      };
    }

    const laps = currentSession.laps;
    const lapTimes = laps.map(lap => lap.lapTime);
    const speeds = laps.map(lap => lap.speed);

    const bestLap = Math.min(...lapTimes);
    const averageLap = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
    const topSpeed = Math.max(...speeds);
    const averageSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;

    // Calculate consistency (standard deviation - lower is better)
    const variance = lapTimes.reduce((sum, time) => sum + Math.pow(time - averageLap, 2), 0) / lapTimes.length;
    const consistency = Math.sqrt(variance);

    const trackLength = currentTrack?.length || 5.0;
    const totalDistance = laps.length * trackLength;

    return {
      bestLap,
      averageLap,
      consistency,
      topSpeed,
      averageSpeed,
      totalDistance,
    };
  }, [currentSession, currentTrack]);

  const calculateTireGripDecay = useCallback((initialGrip: number, laps: number, compound: string): number => {
    const decayRates = {
      'Soft': 0.08,     // Faster degradation
      'Medium': 0.05,   // Moderate degradation  
      'Hard': 0.03,     // Slower degradation
      'Intermediate': 0.06,
      'Wet': 0.10       // Fastest degradation
    };

    const decayRate = decayRates[compound as keyof typeof decayRates] || 0.05;
    const grip = initialGrip * Math.exp(-decayRate * laps);
    return Math.max(0, Math.min(100, grip));
  }, []);

  const calculateFuelConsumption = useCallback((laps: number, throttlePercent: number = 75): number => {
    const baseFuelConsumption = 2.3; // liters per lap base
    const throttleMultiplier = 0.6 + (throttlePercent / 100) * 0.8; // 60% to 140% based on throttle
    const trackMultiplier = currentTrack ? (currentTrack.length / 5.0) : 1.0; // Adjust for track length
    
    return laps * baseFuelConsumption * throttleMultiplier * trackMultiplier;
  }, [currentTrack]);

  const calculateRPMFromSpeed = useCallback((speed: number, gear: number): number => {
    // Realistic F1 gear ratios and calculations
    const gearRatios = [0, 3.2, 2.4, 1.9, 1.5, 1.2, 1.0, 0.85, 0.72]; // gear 0 = neutral
    const finalDriveRatio = 3.5;
    const wheelDiameter = 0.66; // meters
    const wheelCircumference = Math.PI * wheelDiameter;
    
    if (gear === 0 || speed === 0) return 800; // Idle RPM
    
    const gearRatio = gearRatios[Math.min(gear, 8)] || 1.0;
    const wheelRPM = (speed * 1000 / 3600) / wheelCircumference * 60; // Convert km/h to wheel RPM
    const engineRPM = wheelRPM * gearRatio * finalDriveRatio;
    
    return Math.min(Math.max(engineRPM, 800), 15000); // Limit between idle and max RPM
  }, []);

  const calculateGForces = useCallback((speed: number, previousSpeed: number, deltaTime: number, cornerType?: string): { x: number, y: number, z: number } => {
    const acceleration = (speed - previousSpeed) / deltaTime; // m/s²
    const gForceZ = acceleration / 9.81; // Longitudinal G-force
    
    // Lateral G-force based on corner type and speed
    let gForceX = 0;
    if (cornerType && currentTrack) {
      const corner = currentTrack.corners.find(c => c.type === cornerType);
      if (corner) {
        const speedFactor = speed / corner.entrySpeed;
        gForceX = corner.gForceExpected * speedFactor * (Math.random() * 0.3 + 0.85); // Add some variation
      }
    } else {
      // Random lateral G-force for general driving
      gForceX = (Math.random() - 0.5) * 2.0;
    }
    
    const gForceY = -1.0 + Math.random() * 0.5; // Vertical G-force (gravity + downforce)
    
    return {
      x: Math.max(-4.0, Math.min(4.0, gForceX)),
      y: Math.max(-3.0, Math.min(3.0, gForceY)),
      z: Math.max(-5.0, Math.min(5.0, gForceZ))
    };
  }, [currentTrack]);

  const generateRealisticTelemetry = useCallback((duration: number, trackName?: string): TelemetryData[] => {
    const data: TelemetryData[] = [];
    const samples = duration * 10; // 10Hz sampling rate
    const track = trackName ? getTrackByName(trackName) : currentTrack;
    
    let currentSpeed = 80;
    let currentGear = 2;
    let lapProgress = 0;
    
    for (let i = 0; i < samples; i++) {
      const timestamp = i / 10;
      lapProgress = (timestamp % 90) / 90; // Assume 90s lap
      
      // Simulate realistic speed profile based on track corners
      let targetSpeed = 250;
      let throttle = 80;
      let brake = 0;
      
      if (track && track.corners.length > 0) {
        const cornerIndex = Math.floor(lapProgress * track.corners.length);
        const corner = track.corners[cornerIndex];
        
        if (corner) {
          const approachingCorner = (lapProgress * track.corners.length) % 1 > 0.7;
          const inCorner = (lapProgress * track.corners.length) % 1 > 0.8 && (lapProgress * track.corners.length) % 1 < 0.95;
          
          if (approachingCorner && corner.brakingZone) {
            targetSpeed = corner.entrySpeed;
            throttle = 20;
            brake = 60;
          } else if (inCorner) {
            targetSpeed = corner.exitSpeed;
            throttle = 40;
            brake = 0;
          } else {
            targetSpeed = Math.min(320, corner.exitSpeed + 50);
            throttle = 85;
            brake = 0;
          }
          
          currentGear = corner.gear;
        }
      }
      
      // Smooth speed transitions
      const speedDiff = targetSpeed - currentSpeed;
      currentSpeed += speedDiff * 0.1 + (Math.random() - 0.5) * 5;
      currentSpeed = Math.max(50, Math.min(350, currentSpeed));
      
      // Calculate RPM based on speed and gear
      const rpm = calculateRPMFromSpeed(currentSpeed, currentGear);
      
      // Calculate G-forces
      const previousSpeed = i > 0 ? data[i-1].speed : currentSpeed;
      const gForces = calculateGForces(currentSpeed, previousSpeed, 0.1);
      
      data.push({
        timestamp,
        speed: currentSpeed,
        rpm,
        throttle: Math.max(0, Math.min(100, throttle + (Math.random() - 0.5) * 10)),
        brake: Math.max(0, Math.min(100, brake + (Math.random() - 0.5) * 5)),
        gForceX: gForces.x,
        gForceY: gForces.y,
        gForceZ: gForces.z,
        gear: currentGear,
      });
    }

    return data;
  }, [currentTrack, calculateRPMFromSpeed, calculateGForces]);

  const saveSession = useCallback((session: SessionData) => {
    const savedSessions = JSON.parse(localStorage.getItem('raceiq-saved-sessions') || '[]');
    const updatedSessions = [session, ...savedSessions.slice(0, 9)]; // Keep last 10 sessions
    localStorage.setItem('raceiq-saved-sessions', JSON.stringify(updatedSessions));
  }, []);

  const loadSavedSessions = useCallback((): SessionData[] => {
    const saved = localStorage.getItem('raceiq-saved-sessions');
    if (saved) {
      try {
        return JSON.parse(saved).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt)
        }));
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  const exportSessionAsJSON = useCallback((session: SessionData) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `raceiq_${session.trackName.replace(/\s+/g, '_')}_${session.sessionType}_${session.createdAt.toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setTelemetryData([]);
    setCurrentTrack(null);
    localStorage.removeItem('raceiq-current-session');
  }, []);

  return {
    currentSession,
    setCurrentSession,
    telemetryData,
    setTelemetryData,
    currentTrack,
    addLapData,
    calculatePerformanceMetrics,
    calculateTireGripDecay,
    calculateFuelConsumption,
    calculateRPMFromSpeed,
    calculateGForces,
    generateRealisticTelemetry,
    saveSession,
    loadSavedSessions,
    exportSessionAsJSON,
    clearSession,
  };
};