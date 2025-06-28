import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, Palette, Globe, RotateCcw, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRacingData } from '../hooks/useRacingData';

interface AppSettings {
  theme: 'dark';
  fontSize: 'small' | 'medium' | 'large';
  units: {
    speed: 'kmh' | 'mph';
    fuel: 'liters' | 'gallons';
    temperature: 'celsius' | 'fahrenheit';
  };
  notifications: {
    pitWindow: boolean;
    personalBest: boolean;
    sessionBest: boolean;
    fuelWarning: boolean;
    tireWarning: boolean;
  };
  display: {
    showSectorTimes: boolean;
    showDeltaTimes: boolean;
    showTelemetry: boolean;
    animateCharts: boolean;
    showGForces: boolean;
  };
  performance: {
    chartUpdateRate: number; // Hz
    telemetryBufferSize: number;
    enableSmoothAnimations: boolean;
  };
}

export const Settings: React.FC = () => {
  const { clearSession } = useRacingData();
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('raceiq-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to defaults if parsing fails
      }
    }
    
    return {
      theme: 'dark',
      fontSize: 'medium',
      units: {
        speed: 'kmh',
        fuel: 'liters',
        temperature: 'celsius'
      },
      notifications: {
        pitWindow: true,
        personalBest: true,
        sessionBest: true,
        fuelWarning: true,
        tireWarning: true
      },
      display: {
        showSectorTimes: true,
        showDeltaTimes: true,
        showTelemetry: true,
        animateCharts: true,
        showGForces: true
      },
      performance: {
        chartUpdateRate: 10,
        telemetryBufferSize: 1000,
        enableSmoothAnimations: true
      }
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('raceiq-settings', JSON.stringify(settings));
    
    // Apply font size to document
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' :
      settings.fontSize === 'large' ? '18px' : '16px';
  }, [settings]);

  const handleSettingChange = (category: keyof AppSettings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      const defaultSettings: AppSettings = {
        theme: 'dark',
        fontSize: 'medium',
        units: {
          speed: 'kmh',
          fuel: 'liters',
          temperature: 'celsius'
        },
        notifications: {
          pitWindow: true,
          personalBest: true,
          sessionBest: true,
          fuelWarning: true,
          tireWarning: true
        },
        display: {
          showSectorTimes: true,
          showDeltaTimes: true,
          showTelemetry: true,
          animateCharts: true,
          showGForces: true
        },
        performance: {
          chartUpdateRate: 10,
          telemetryBufferSize: 1000,
          enableSmoothAnimations: true
        }
      };
      setSettings(defaultSettings);
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data including sessions and settings? This action cannot be undone.')) {
      localStorage.clear();
      clearSession();
      window.location.reload();
    }
  };

  const convertSpeed = (kmh: number) => {
    return settings.units.speed === 'mph' ? (kmh * 0.621371).toFixed(1) : kmh.toFixed(1);
  };

  const convertFuel = (liters: number) => {
    return settings.units.fuel === 'gallons' ? (liters * 0.264172).toFixed(1) : liters.toFixed(1);
  };

  const convertTemperature = (celsius: number) => {
    return settings.units.temperature === 'fahrenheit' ? 
      ((celsius * 9/5) + 32).toFixed(1) : celsius.toFixed(1);
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-race-primary' : 'bg-race-gray'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="section-title">
          <SettingsIcon className="w-8 h-8 text-race-primary" />
          Settings & Preferences
        </h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => localStorage.setItem('raceiq-settings', JSON.stringify(settings))}
            className="racing-button flex items-center gap-2 bg-race-green text-black"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          
          <button
            onClick={handleReset}
            className="racing-button bg-race-primary bg-opacity-20 border border-race-primary text-race-primary hover:bg-race-primary hover:text-white flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </motion.div>

      {/* Theme & Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme & Display
        </h3>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-race-accent mb-3">
              Theme (Professional Dark Mode Only)
            </label>
            <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-race-primary" />
                <div>
                  <div className="font-orbitron font-semibold text-race-accent">
                    Professional Dark Theme
                  </div>
                  <div className="text-sm text-race-accent opacity-70">
                    Optimized for motorsport engineering environments and reduced eye strain
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-race-accent mb-3">
              Font Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSettings({ ...settings, fontSize: size })}
                  className={`p-3 rounded-lg border transition-all ${
                    settings.fontSize === size
                      ? 'border-race-primary bg-race-primary bg-opacity-20'
                      : 'border-race-gray hover:border-race-primary'
                  }`}
                >
                  <div className={`font-orbitron font-bold ${
                    size === 'small' ? 'text-sm' :
                    size === 'medium' ? 'text-base' : 'text-lg'
                  }`}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </div>
                  <div className="text-xs text-race-accent opacity-70 mt-1">
                    {size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Display Options */}
          <div>
            <label className="block text-sm font-medium text-race-accent mb-3">
              Display Options
            </label>
            <div className="space-y-3">
              {Object.entries(settings.display).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-race-bg rounded-lg border border-race-gray">
                  <div>
                    <span className="text-race-accent font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <div className="text-sm text-race-accent opacity-70">
                      {key === 'showSectorTimes' && 'Display sector times in lap analysis'}
                      {key === 'showDeltaTimes' && 'Show delta times between laps'}
                      {key === 'showTelemetry' && 'Display telemetry data in performance dashboard'}
                      {key === 'animateCharts' && 'Enable smooth chart animations'}
                      {key === 'showGForces' && 'Display G-force visualization'}
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={value}
                    onChange={(newValue) => handleSettingChange('display', key, newValue)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Units & Measurements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Units & Measurements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Speed Units */}
          <div>
            <label className="block text-sm font-medium text-race-accent mb-3">
              Speed Units
            </label>
            <div className="space-y-2">
              {[
                { value: 'kmh', label: 'km/h (Kilometers per hour)', example: '300 km/h' },
                { value: 'mph', label: 'mph (Miles per hour)', example: '186 mph' }
              ].map(({ value, label, example }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('units', 'speed', value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    settings.units.speed === value
                      ? 'border-race-primary bg-race-primary bg-opacity-20'
                      : 'border-race-gray hover:border-race-primary'
                  }`}
                >
                  <div className="font-orbitron font-semibold text-race-accent">
                    {value.toUpperCase()}
                  </div>
                  <div className="text-sm text-race-accent opacity-70">
                    {label}
                  </div>
                  <div className="text-xs text-race-green mt-1">
                    Example: {example}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Fuel Units */}
          <div>
            <label className="block text-sm font-medium text-race-accent mb-3">
              Fuel Units
            </label>
            <div className="space-y-2">
              {[
                { value: 'liters', label: 'Liters (L)', example: '110 L' },
                { value: 'gallons', label: 'Gallons (gal)', example: '29 gal' }
              ].map(({ value, label, example }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('units', 'fuel', value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    settings.units.fuel === value
                      ? 'border-race-primary bg-race-primary bg-opacity-20'
                      : 'border-race-gray hover:border-race-primary'
                  }`}
                >
                  <div className="font-orbitron font-semibold text-race-accent">
                    {label}
                  </div>
                  <div className="text-xs text-race-green mt-1">
                    Example: {example}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Temperature Units */}
          <div>
            <label className="block text-sm font-medium text-race-accent mb-3">
              Temperature Units
            </label>
            <div className="space-y-2">
              {[
                { value: 'celsius', label: 'Celsius (°C)', example: '25°C' },
                { value: 'fahrenheit', label: 'Fahrenheit (°F)', example: '77°F' }
              ].map(({ value, label, example }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('units', 'temperature', value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    settings.units.temperature === value
                      ? 'border-race-primary bg-race-primary bg-opacity-20'
                      : 'border-race-gray hover:border-race-primary'
                  }`}
                >
                  <div className="font-orbitron font-semibold text-race-accent">
                    {label}
                  </div>
                  <div className="text-xs text-race-green mt-1">
                    Example: {example}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unit Conversion Preview */}
        <div className="mt-6 bg-race-bg p-4 rounded-lg border border-race-gray">
          <h4 className="font-orbitron font-semibold text-race-accent mb-3">
            Unit Conversion Preview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-race-accent opacity-70">Speed Example:</div>
              <div className="font-orbitron text-race-primary">
                300 km/h = {convertSpeed(300)} {settings.units.speed}
              </div>
            </div>
            <div>
              <div className="text-race-accent opacity-70">Fuel Example:</div>
              <div className="font-orbitron text-race-green">
                110 L = {convertFuel(110)} {settings.units.fuel}
              </div>
            </div>
            <div>
              <div className="text-race-accent opacity-70">Temperature Example:</div>
              <div className="font-orbitron text-race-purple">
                25°C = {convertTemperature(25)}°{settings.units.temperature === 'fahrenheit' ? 'F' : 'C'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Notifications & Alerts
        </h3>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-race-bg rounded-lg border border-race-gray">
              <div>
                <div className="font-orbitron font-semibold text-race-accent">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-race-accent opacity-70">
                  {key === 'pitWindow' && 'Alert when optimal pit window opens based on tire/fuel analysis'}
                  {key === 'personalBest' && 'Notify when you set a personal best lap time'}
                  {key === 'sessionBest' && 'Notify when you set a session best lap time'}
                  {key === 'fuelWarning' && 'Warning when fuel is running low (< 5 laps remaining)'}
                  {key === 'tireWarning' && 'Warning when tire grip drops below 70%'}
                </div>
              </div>
              <ToggleSwitch
                checked={value}
                onChange={(newValue) => handleSettingChange('notifications', key, newValue)}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Performance Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Chart Update Rate: {settings.performance.chartUpdateRate} Hz
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={settings.performance.chartUpdateRate}
              onChange={(e) => handleSettingChange('performance', 'chartUpdateRate', Number(e.target.value))}
              className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
              <span>5 Hz (Battery Saving)</span>
              <span>60 Hz (Smooth)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-race-accent mb-2">
              Telemetry Buffer Size: {settings.performance.telemetryBufferSize} samples
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={settings.performance.telemetryBufferSize}
              onChange={(e) => handleSettingChange('performance', 'telemetryBufferSize', Number(e.target.value))}
              className="w-full h-2 bg-race-gray rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-race-accent opacity-70 mt-1">
              <span>500 (Low Memory)</span>
              <span>5000 (High Detail)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-race-bg rounded-lg border border-race-gray">
            <div>
              <div className="font-orbitron font-semibold text-race-accent">
                Enable Smooth Animations
              </div>
              <div className="text-sm text-race-accent opacity-70">
                Disable for better performance on slower devices
              </div>
            </div>
            <ToggleSwitch
              checked={settings.performance.enableSmoothAnimations}
              onChange={(newValue) => handleSettingChange('performance', 'enableSmoothAnimations', newValue)}
            />
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          Data Management
        </h3>
        
        <div className="space-y-4">
          <div className="bg-race-bg p-4 rounded-lg border border-race-gray">
            <h4 className="font-orbitron font-semibold text-race-accent mb-2">
              Storage Information
            </h4>
            <div className="text-sm text-race-accent opacity-70">
              <p>• Settings are automatically saved to your browser's local storage</p>
              <p>• Session data is stored locally and can be exported as JSON files</p>
              <p>• No data is sent to external servers - everything stays on your device</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClearAllData}
              className="racing-button bg-race-primary text-white flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
            
            <div className="text-sm text-race-accent opacity-70 flex items-center">
              This will remove all sessions, settings, and cached data
            </div>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="racing-card"
      >
        <h3 className="text-xl font-orbitron font-semibold text-race-accent mb-6">
          About RaceIQ
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-race-accent">Version</span>
                <span className="font-orbitron font-bold text-race-primary">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-race-accent">Build Date</span>
                <span className="font-orbitron text-race-accent">January 2025</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-race-accent">Developer</span>
                <span className="font-orbitron font-bold text-race-green">Tanmay Kumar Singh</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-race-accent">Framework</span>
                <span className="font-orbitron text-race-purple">React + TypeScript</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-race-accent">Styling</span>
                <span className="font-orbitron text-race-green">Tailwind CSS</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-race-accent">Charts</span>
                <span className="font-orbitron text-race-primary">Recharts</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-race-gray pt-6 mt-6">
            <div className="text-center text-race-accent opacity-70">
              <p className="font-orbitron text-lg font-bold text-race-primary mb-2">
                RaceIQ Telemetry Dashboard
              </p>
              <p className="text-sm">
                Professional-grade racing telemetry and strategy analysis platform
              </p>
              <p className="text-sm mt-2">
                Engineered with passion for motorsport excellence
              </p>
              <p className="text-sm mt-2 font-orbitron font-bold">
                Tanmay Kumar Singh © 2025
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};