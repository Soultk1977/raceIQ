import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Timer, 
  Gauge, 
  Settings, 
  TrendingUp, 
  Database,
  Zap,
  Navigation
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { to: '/', icon: Timer, label: 'Lap Analysis' },
  { to: '/performance', icon: Gauge, label: 'Performance' },
  { to: '/tires', icon: Zap, label: 'Tire & Fuel' },
  { to: '/strategy', icon: TrendingUp, label: 'Race Strategy' },
  { to: '/session', icon: Database, label: 'Session Mgmt' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-race-card border-r border-race-gray z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Navigation className="w-8 h-8 text-race-primary" />
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-race-primary">
                RaceIQ
              </h1>
              <p className="text-sm text-race-accent opacity-70">
                Telemetry Dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Author Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center text-sm text-race-accent opacity-50 border-t border-race-gray pt-4">
              <p className="font-orbitron">Engineered by</p>
              <p className="font-bold">Tanmay Kumar Singh</p>
              <p className="text-xs mt-1">RaceIQ © 2025</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};