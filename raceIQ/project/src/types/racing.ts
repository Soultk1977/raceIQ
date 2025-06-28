export interface LapData {
  lapNumber: number;
  lapTime: number;
  sector1: number;
  sector2: number;
  sector3: number;
  speed: number;
  compound: TireCompound;
  fuelLoad: number;
  isPersonalBest: boolean;
  isSessionBest: boolean;
  notes?: string;
}

export interface SessionData {
  driverName: string;
  carNumber: string;
  team: string;
  sessionType: 'Practice' | 'Qualifying' | 'Race';
  trackName: string;
  weather: WeatherCondition;
  laps: LapData[];
  createdAt: Date;
}

export interface TelemetryData {
  timestamp: number;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  gForceX: number;
  gForceY: number;
  gForceZ: number;
  gear: number;
}

export interface StrategyOptions {
  tyreSets: TyreSet[];
  fuelCapacity: number;
  pitLaneDelta: number;
  mandatoryStops: number;
}

export interface TyreSet {
  compound: TireCompound;
  age: number;
  gripLevel: number;
  expectedLife: number;
}

export type TireCompound = 'Soft' | 'Medium' | 'Hard' | 'Intermediate' | 'Wet';
export type WeatherCondition = 'Dry' | 'Light Rain' | 'Heavy Rain' | 'Cloudy' | 'Sunny';

export interface RaceStrategy {
  stints: Stint[];
  totalTime: number;
  fuelRequired: number;
  expectedPosition: number;
}

export interface Stint {
  compound: TireCompound;
  startLap: number;
  endLap: number;
  expectedPace: number;
  fuelLoad: number;
}

export interface PerformanceMetrics {
  bestLap: number;
  averageLap: number;
  consistency: number;
  topSpeed: number;
  averageSpeed: number;
  totalDistance: number;
}

export interface TrackData {
  name: string;
  length: number; // km
  turns: number;
  lapRecord: number; // seconds
  corners: CornerData[];
  sectors: SectorData[];
}

export interface CornerData {
  number: number;
  name: string;
  type: 'slow' | 'medium' | 'fast';
  entrySpeed: number; // km/h
  exitSpeed: number; // km/h
  gear: number;
  brakingZone: boolean;
  gForceExpected: number;
}

export interface SectorData {
  number: 1 | 2 | 3;
  length: number; // km
  corners: number[];
  expectedTime: number; // seconds
}

export interface LiveTelemetry {
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  gForceX: number;
  gForceY: number;
  gForceZ: number;
  lapTime: number;
  sector: number;
  position: number;
}