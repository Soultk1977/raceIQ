import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { LapAnalysis } from './pages/LapAnalysis';
import { Performance } from './pages/Performance';
import { TireFuel } from './pages/TireFuel';
import { Strategy } from './pages/Strategy';
import { Session } from './pages/Session';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-race-bg">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LapAnalysis />} />
            <Route path="performance" element={<Performance />} />
            <Route path="tires" element={<TireFuel />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="session" element={<Session />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;