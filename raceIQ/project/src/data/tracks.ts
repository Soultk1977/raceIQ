import { TrackData } from '../types/racing';

export const TRACKS: Record<string, TrackData> = {
  'monaco': {
    name: 'Monaco Grand Prix',
    length: 3.337,
    turns: 19,
    lapRecord: 70.246,
    sectors: [
      { number: 1, length: 1.2, corners: [1, 2, 3, 4, 5, 6], expectedTime: 23.5 },
      { number: 2, length: 1.1, corners: [7, 8, 9, 10, 11, 12], expectedTime: 22.8 },
      { number: 3, length: 1.037, corners: [13, 14, 15, 16, 17, 18, 19], expectedTime: 23.9 }
    ],
    corners: [
      { number: 1, name: 'Sainte Devote', type: 'slow', entrySpeed: 180, exitSpeed: 120, gear: 3, brakingZone: true, gForceExpected: 2.1 },
      { number: 2, name: 'Massenet', type: 'medium', entrySpeed: 160, exitSpeed: 140, gear: 4, brakingZone: false, gForceExpected: 1.8 },
      { number: 3, name: 'Casino Square', type: 'fast', entrySpeed: 200, exitSpeed: 180, gear: 5, brakingZone: false, gForceExpected: 1.5 },
      { number: 4, name: 'Mirabeau', type: 'slow', entrySpeed: 140, exitSpeed: 80, gear: 2, brakingZone: true, gForceExpected: 2.8 },
      { number: 5, name: 'Grand Hotel', type: 'slow', entrySpeed: 100, exitSpeed: 90, gear: 3, brakingZone: false, gForceExpected: 2.2 },
      { number: 6, name: 'Fairmont', type: 'slow', entrySpeed: 120, exitSpeed: 100, gear: 3, brakingZone: true, gForceExpected: 2.5 },
      { number: 7, name: 'Tunnel', type: 'fast', entrySpeed: 280, exitSpeed: 260, gear: 7, brakingZone: false, gForceExpected: 1.2 },
      { number: 8, name: 'Chicane', type: 'slow', entrySpeed: 180, exitSpeed: 120, gear: 3, brakingZone: true, gForceExpected: 3.2 },
      { number: 9, name: 'Tabac', type: 'medium', entrySpeed: 160, exitSpeed: 140, gear: 4, brakingZone: false, gForceExpected: 1.9 },
      { number: 10, name: 'Swimming Pool', type: 'slow', entrySpeed: 120, exitSpeed: 100, gear: 3, brakingZone: true, gForceExpected: 2.7 }
    ]
  },
  'silverstone': {
    name: 'Silverstone',
    length: 5.891,
    turns: 18,
    lapRecord: 85.351,
    sectors: [
      { number: 1, length: 2.1, corners: [1, 2, 3, 4, 5, 6], expectedTime: 28.2 },
      { number: 2, length: 2.0, corners: [7, 8, 9, 10, 11, 12], expectedTime: 27.8 },
      { number: 3, length: 1.791, corners: [13, 14, 15, 16, 17, 18], expectedTime: 29.3 }
    ],
    corners: [
      { number: 1, name: 'Abbey', type: 'fast', entrySpeed: 300, exitSpeed: 280, gear: 7, brakingZone: true, gForceExpected: 2.5 },
      { number: 2, name: 'Farm Curve', type: 'fast', entrySpeed: 280, exitSpeed: 260, gear: 6, brakingZone: false, gForceExpected: 2.1 },
      { number: 3, name: 'Village', type: 'medium', entrySpeed: 220, exitSpeed: 180, gear: 5, brakingZone: true, gForceExpected: 2.8 },
      { number: 4, name: 'The Loop', type: 'slow', entrySpeed: 160, exitSpeed: 120, gear: 3, brakingZone: true, gForceExpected: 3.1 },
      { number: 5, name: 'Aintree', type: 'medium', entrySpeed: 200, exitSpeed: 170, gear: 4, brakingZone: false, gForceExpected: 2.3 },
      { number: 6, name: 'Wellington Straight', type: 'fast', entrySpeed: 320, exitSpeed: 310, gear: 8, brakingZone: false, gForceExpected: 1.1 },
      { number: 7, name: 'Brooklands', type: 'slow', entrySpeed: 180, exitSpeed: 140, gear: 4, brakingZone: true, gForceExpected: 2.9 },
      { number: 8, name: 'Luffield', type: 'slow', entrySpeed: 140, exitSpeed: 110, gear: 3, brakingZone: true, gForceExpected: 3.2 },
      { number: 9, name: 'Woodcote', type: 'fast', entrySpeed: 280, exitSpeed: 250, gear: 6, brakingZone: false, gForceExpected: 1.8 },
      { number: 10, name: 'Copse', type: 'fast', entrySpeed: 310, exitSpeed: 290, gear: 7, brakingZone: false, gForceExpected: 2.2 }
    ]
  },
  'monza': {
    name: 'Monza',
    length: 5.793,
    turns: 11,
    lapRecord: 79.119,
    sectors: [
      { number: 1, length: 2.2, corners: [1, 2, 3, 4], expectedTime: 25.8 },
      { number: 2, length: 1.8, corners: [5, 6, 7], expectedTime: 24.2 },
      { number: 3, length: 1.793, corners: [8, 9, 10, 11], expectedTime: 29.1 }
    ],
    corners: [
      { number: 1, name: 'Prima Variante', type: 'slow', entrySpeed: 340, exitSpeed: 120, gear: 2, brakingZone: true, gForceExpected: 4.2 },
      { number: 2, name: 'Seconda Variante', type: 'slow', entrySpeed: 280, exitSpeed: 140, gear: 3, brakingZone: true, gForceExpected: 3.8 },
      { number: 3, name: 'Lesmo 1', type: 'medium', entrySpeed: 220, exitSpeed: 180, gear: 4, brakingZone: true, gForceExpected: 2.5 },
      { number: 4, name: 'Lesmo 2', type: 'medium', entrySpeed: 200, exitSpeed: 160, gear: 4, brakingZone: false, gForceExpected: 2.3 },
      { number: 5, name: 'Ascari', type: 'medium', entrySpeed: 240, exitSpeed: 180, gear: 5, brakingZone: true, gForceExpected: 2.7 },
      { number: 6, name: 'Parabolica', type: 'fast', entrySpeed: 320, exitSpeed: 280, gear: 6, brakingZone: true, gForceExpected: 2.1 }
    ]
  },
  'spa': {
    name: 'Spa-Francorchamps',
    length: 7.004,
    turns: 19,
    lapRecord: 103.003,
    sectors: [
      { number: 1, length: 2.8, corners: [1, 2, 3, 4, 5, 6], expectedTime: 32.1 },
      { number: 2, length: 2.2, corners: [7, 8, 9, 10, 11, 12], expectedTime: 28.9 },
      { number: 3, length: 2.004, corners: [13, 14, 15, 16, 17, 18, 19], expectedTime: 42.0 }
    ],
    corners: [
      { number: 1, name: 'La Source', type: 'slow', entrySpeed: 280, exitSpeed: 120, gear: 2, brakingZone: true, gForceExpected: 3.5 },
      { number: 2, name: 'Eau Rouge', type: 'fast', entrySpeed: 300, exitSpeed: 320, gear: 7, brakingZone: false, gForceExpected: 3.8 },
      { number: 3, name: 'Raidillon', type: 'fast', entrySpeed: 320, exitSpeed: 310, gear: 8, brakingZone: false, gForceExpected: 2.9 },
      { number: 4, name: 'Les Combes', type: 'medium', entrySpeed: 280, exitSpeed: 200, gear: 5, brakingZone: true, gForceExpected: 2.4 },
      { number: 5, name: 'Malmedy', type: 'fast', entrySpeed: 250, exitSpeed: 230, gear: 6, brakingZone: false, gForceExpected: 1.8 },
      { number: 6, name: 'Rivage', type: 'medium', entrySpeed: 200, exitSpeed: 160, gear: 4, brakingZone: true, gForceExpected: 2.6 },
      { number: 7, name: 'Pouhon', type: 'fast', entrySpeed: 240, exitSpeed: 220, gear: 5, brakingZone: false, gForceExpected: 2.2 },
      { number: 8, name: 'Fagnes', type: 'fast', entrySpeed: 280, exitSpeed: 260, gear: 6, brakingZone: false, gForceExpected: 1.9 },
      { number: 9, name: 'Stavelot', type: 'fast', entrySpeed: 260, exitSpeed: 240, gear: 6, brakingZone: false, gForceExpected: 2.0 },
      { number: 10, name: 'Bus Stop', type: 'slow', entrySpeed: 200, exitSpeed: 120, gear: 3, brakingZone: true, gForceExpected: 3.1 }
    ]
  },
  'buddh': {
    name: 'Buddh International Circuit',
    length: 5.125,
    turns: 16,
    lapRecord: 85.249,
    sectors: [
      { number: 1, length: 1.8, corners: [1, 2, 3, 4, 5], expectedTime: 26.5 },
      { number: 2, length: 1.7, corners: [6, 7, 8, 9, 10], expectedTime: 25.8 },
      { number: 3, length: 1.625, corners: [11, 12, 13, 14, 15, 16], expectedTime: 32.9 }
    ],
    corners: [
      { number: 1, name: 'Turn 1', type: 'slow', entrySpeed: 320, exitSpeed: 140, gear: 3, brakingZone: true, gForceExpected: 3.8 },
      { number: 2, name: 'Turn 2', type: 'medium', entrySpeed: 180, exitSpeed: 160, gear: 4, brakingZone: false, gForceExpected: 2.1 },
      { number: 3, name: 'Turn 3', type: 'fast', entrySpeed: 280, exitSpeed: 260, gear: 6, brakingZone: false, gForceExpected: 1.9 },
      { number: 4, name: 'Turn 4', type: 'medium', entrySpeed: 220, exitSpeed: 180, gear: 5, brakingZone: true, gForceExpected: 2.4 },
      { number: 5, name: 'Turn 5', type: 'slow', entrySpeed: 160, exitSpeed: 120, gear: 3, brakingZone: true, gForceExpected: 2.8 },
      { number: 6, name: 'Turn 6', type: 'fast', entrySpeed: 300, exitSpeed: 280, gear: 7, brakingZone: false, gForceExpected: 1.7 },
      { number: 7, name: 'Turn 7', type: 'medium', entrySpeed: 240, exitSpeed: 200, gear: 5, brakingZone: true, gForceExpected: 2.3 },
      { number: 8, name: 'Turn 8', type: 'slow', entrySpeed: 180, exitSpeed: 140, gear: 4, brakingZone: true, gForceExpected: 2.9 },
      { number: 9, name: 'Turn 9', type: 'fast', entrySpeed: 260, exitSpeed: 240, gear: 6, brakingZone: false, gForceExpected: 1.8 },
      { number: 10, name: 'Turn 10-11', type: 'medium', entrySpeed: 200, exitSpeed: 170, gear: 4, brakingZone: true, gForceExpected: 2.5 },
      { number: 11, name: 'Turn 12', type: 'slow', entrySpeed: 160, exitSpeed: 120, gear: 3, brakingZone: true, gForceExpected: 3.0 },
      { number: 12, name: 'Turn 13', type: 'medium', entrySpeed: 180, exitSpeed: 150, gear: 4, brakingZone: false, gForceExpected: 2.2 },
      { number: 13, name: 'Turn 14', type: 'fast', entrySpeed: 280, exitSpeed: 260, gear: 6, brakingZone: false, gForceExpected: 1.9 },
      { number: 14, name: 'Turn 15', type: 'medium', entrySpeed: 220, exitSpeed: 180, gear: 5, brakingZone: true, gForceExpected: 2.4 },
      { number: 15, name: 'Turn 16', type: 'fast', entrySpeed: 300, exitSpeed: 280, gear: 7, brakingZone: false, gForceExpected: 1.6 }
    ]
  }
};

export const getTrackByName = (name: string): TrackData | undefined => {
  return Object.values(TRACKS).find(track => track.name === name);
};

export const getAllTrackNames = (): string[] => {
  return Object.values(TRACKS).map(track => track.name);
};