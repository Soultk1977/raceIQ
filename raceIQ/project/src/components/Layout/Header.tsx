import React, { useState, useEffect } from 'react';
import { Menu, Activity, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [isOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStartTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update session time every second
    const sessionInterval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      setSessionTime(elapsed);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(sessionInterval);
    };
  }, [sessionStartTime]);

  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-race-card border-b border-race-gray px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-race-gray rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-race-accent" />
        </button>
        
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-race-primary animate-pulse" />
          <div>
            <h2 className="font-orbitron font-semibold text-race-accent">
              Live Session
            </h2>
            <p className="text-sm text-race-accent opacity-70">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-race-green" />
          ) : (
            <WifiOff className="w-5 h-5 text-race-primary" />
          )}
          <span className="text-sm text-race-accent hidden sm:block">
            {isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Session Timer */}
        <div className="bg-race-bg px-4 py-2 rounded-lg border border-race-gray">
          <div className="font-orbitron text-race-primary font-bold">
            {formatSessionTime(sessionTime)}
          </div>
          <div className="text-xs text-race-accent opacity-70">
            Session Time
          </div>
        </div>
      </div>
    </header>
  );
};