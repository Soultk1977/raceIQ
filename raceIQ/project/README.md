# RaceIQ - Professional Racing Telemetry Dashboard

A comprehensive, professional-grade racing telemetry and strategy analysis platform built for motorsport engineers and racing enthusiasts. RaceIQ provides real-time data visualization, advanced race strategy simulation, and detailed performance analysis tools.

## 🏁 Features

### Core Modules

1. **Lap Analysis**
   - Real-time lap time tracking and visualization
   - Sector time analysis with color-coded performance indicators
   - Personal best and session best tracking
   - Delta comparison between laps
   - CSV import/export functionality

2. **Performance Dashboard**
   - Live telemetry simulation with animated gauges
   - Speed, RPM, and gear monitoring
   - G-force visualization and analysis
   - Throttle and brake input tracking
   - Interactive performance charts

3. **Tire & Fuel Management**
   - Advanced tire degradation modeling
   - Real-time grip calculation based on compound and usage
   - Fuel consumption tracking and prediction
   - Pit window optimization
   - Strategy recommendations (Conservative, Optimal, Aggressive)

4. **Race Strategy Tools**
   - Undercut/Overcut simulation and success probability
   - Multi-stint race strategy comparison
   - Pit stop timing optimization
   - Race timeline visualization
   - Strategy outcome prediction

5. **Session Management**
   - Complete session data management
   - Driver, team, and track configuration
   - Session save/load with JSON export
   - Historical session comparison
   - Performance metrics tracking

6. **Settings & Preferences**
   - Professional dark theme (motorsport optimized)
   - Customizable units (metric/imperial)
   - Notification preferences
   - Display options and font scaling

## 🎨 Design Philosophy

RaceIQ follows a professional motorsport engineering aesthetic:

- **Ultra-dark theme** (#0A0A0A) for reduced eye strain during long sessions
- **Racing red accents** (#FF1E1E) for critical alerts and fastest times
- **Neon green highlights** (#39FF14) for personal bests and optimal zones
- **Purple indicators** (#AE00FF) for session bests and premium features
- **Orbitron font family** for that authentic motorsport telemetry feel
- **Smooth animations** and micro-interactions for professional polish

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd raceiq-telemetry-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Charts/         # Chart components (gauges, graphs, etc.)
│   └── Layout/         # Layout components (sidebar, header)
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── types/              # TypeScript type definitions
└── index.css          # Global styles and Tailwind imports
```

## 🔧 Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom racing theme
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and building

## 📊 Data Models

### Lap Data
```typescript
interface LapData {
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
```

### Session Data
```typescript
interface SessionData {
  driverName: string;
  carNumber: string;
  team: string;
  sessionType: 'Practice' | 'Qualifying' | 'Race';
  trackName: string;
  weather: WeatherCondition;
  laps: LapData[];
  createdAt: Date;
}
```

## 🏎️ Racing Calculations

RaceIQ implements authentic motorsport calculations:

### Tire Degradation
```
Grip = InitialGrip × e^(-DecayRate × Laps)
```

### Fuel Consumption
```
FuelUsed = Laps × BaseFuelRate × ThrottleMultiplier
```

### Undercut Advantage
```
UndercutGain = (OpponentPace - YourFreshTirePace) × LapsBeforeOpponentPits
```

## 🎯 Usage Examples

### Adding Lap Data
1. Navigate to the Lap Analysis page
2. Fill in lap time and sector times
3. Select tire compound and fuel load
4. Add optional notes
5. Click "Add Lap Data"

### Strategy Analysis
1. Go to Race Strategy Tools
2. Set race parameters (length, pit delta, etc.)
3. Compare different pit strategies
4. Use undercut/overcut simulator for tactical decisions

### Session Management
1. Create a new session with driver and track details
2. Add lap data throughout your session
3. Save session for future reference
4. Export data as JSON for external analysis

## 🔮 Future Enhancements

- Live telemetry integration with sim racing games
- AI-powered race engineer recommendations
- Multi-driver session comparison
- Weather impact modeling
- Setup optimization suggestions
- Real-time multiplayer strategy sessions

## 👨‍💻 Author

**Tanmay Kumar Singh**
- Professional Racing Telemetry Dashboard
- Engineered with passion for motorsport excellence
- RaceIQ © 2025

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🏁 Acknowledgments

- Inspired by Formula 1 and endurance racing telemetry systems
- Built for the motorsport engineering community
- Designed to bridge the gap between professional and amateur racing analysis

---

*"In racing, data is everything. RaceIQ puts professional-grade telemetry analysis in your hands."*