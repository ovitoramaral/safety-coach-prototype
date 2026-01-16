import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import {
  Trophy,
  Target,
  Car,
  Lightbulb,
  Zap,
  Award,
  Play,
  Square,
  Activity,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';

// Helper function to calculate distance between GPS coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Generate coaching tip based on events
function generateCoachingTip(eventCounts) {
  if (eventCounts.hardStops >= 2) {
    return "Practice smooth braking by scanning traffic ahead for better flow";
  } else if (eventCounts.turns >= 2) {
    return "Gentle steering creates a more comfortable ride for passengers";
  } else if (eventCounts.weaves >= 1) {
    return "Stay centered in your lane for safety and fuel efficiency";
  } else if (eventCounts.hardStops === 1) {
    return "Almost perfect! One sudden stop - try anticipating traffic changes";
  } else {
    return "Excellent control throughout the trip - keep it up!";
  }
}

// Event Toast Component
function EventToast({ event, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const configs = {
    hard_brake: {
      bg: 'bg-amber-50 border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      title: 'Hard Stop Detected'
    },
    sharp_turn: {
      bg: 'bg-blue-50 border-blue-200',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      title: 'Sharp Turn Detected'
    },
    lane_weaving: {
      bg: 'bg-violet-50 border-violet-200',
      icon: Activity,
      iconColor: 'text-violet-600',
      title: 'Erratic Motion'
    },
    smooth_driving: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: Zap,
      iconColor: 'text-emerald-600',
      title: 'Trip Complete!'
    }
  };

  const config = configs[event.type] || configs.hard_brake;
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top duration-300">
      <div className={`${config.bg} border-2 rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          <IconComponent className={`${config.iconColor} flex-shrink-0 h-6 w-6`} />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{config.title}</h3>
            <p className="text-sm text-slate-700 mt-1">{event.coaching}</p>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SafetyCoachIntegrated() {
  // Load persisted data from localStorage
  const loadPersistedState = () => {
    try {
      const saved = localStorage.getItem('safetyCoachState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
    return {
      userXP: 2470,
      safeKm: 398,
      streak: 12,
      currentTripDistance: 0
    };
  };

  const initialState = loadPersistedState();

  // User state (persists across trips)
  const [userXP, setUserXP] = useState(initialState.userXP);
  const [safeKm, setSafeKm] = useState(initialState.safeKm);
  const [streak, setStreak] = useState(initialState.streak);

  // Trip tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [tripScore, setTripScore] = useState(100);
  const [tripDistance, setTripDistance] = useState(initialState.currentTripDistance);
  const [tripDuration, setTripDuration] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [tripEvents, setTripEvents] = useState([]);
  const [toast, setToast] = useState(null);

  // Sensor state
  const [sensorData, setSensorData] = useState({
    accel: { x: 0, y: 0, z: 0 },
    totalForce: 0,
    heading: 0,
    eventCounts: { hardStops: 0, turns: 0, weaves: 0 }
  });

  // Last trip data
  const [lastTripData, setLastTripData] = useState({
    route: 'Main St → Home',
    time: '2:34 PM',
    distance: 4.0,
    hardBrakes: 2,
    sharpTurns: 0,
    xpEarned: 50,
    tip: 'High traffic zone ahead. Try Route 9 instead for smoother flow!',
    score: 88
  });

  // Refs for sensor tracking
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const lastHeading = useRef(0);
  const lastPosition = useRef(null);
  const tripStartTime = useRef(null);
  const gpsWatcher = useRef(null);
  const durationInterval = useRef(null);
  const isCalibrated = useRef(false);
  const calibrationCount = useRef(0);

  // Constants for detection
  const MOVEMENT_THRESHOLD = 1.5;
  const TURN_THRESHOLD = 25;
  const ROUGH_THRESHOLD = 12;

  const todayMission = {
    title: 'Maintain 3-sec following distance',
    description: 'Keep safe spacing in traffic',
    total: 16,
    unit: 'km'
  };

  const achievements = [
    { id: 1, name: 'Week Warrior', icon: '🏅', unlocked: true },
    { id: 2, name: 'Smooth Operator', icon: '🏅', unlocked: true },
    { id: 3, name: 'Distance Master', icon: '🏅', unlocked: true },
    { id: 4, name: 'Night Owl', icon: '🏆', unlocked: false },
    { id: 5, name: 'Eco Driver', icon: '🏆', unlocked: false },
  ];

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      userXP,
      safeKm,
      streak,
      currentTripDistance: tripDistance
    };
    localStorage.setItem('safetyCoachState', JSON.stringify(state));
  }, [userXP, safeKm, streak, tripDistance]);

  // Poll localStorage for distance updates from sensor view
  useEffect(() => {
    if (!isTracking) return;

    const pollInterval = setInterval(() => {
      try {
        const state = JSON.parse(localStorage.getItem('safetyCoachState') || '{}');
        if (state.currentTripDistance && state.currentTripDistance !== tripDistance) {
          setTripDistance(state.currentTripDistance);
        }
      } catch (e) {
        console.error('Error polling state:', e);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isTracking, tripDistance]);

  // Handle DeviceMotion with delta-based detection
  const handleMotion = (event) => {
    if (!isTracking) return;

    const accel = event.accelerationIncludingGravity;
    if (!accel) return;

    const current = {
      x: accel.x || 0,
      y: accel.y || 0,
      z: accel.z || 0
    };

    // Calibration phase
    if (!isCalibrated.current) {
      calibrationCount.current++;
      if (calibrationCount.current === 1) {
        lastAcceleration.current = current;
      } else if (calibrationCount.current >= 10) {
        isCalibrated.current = true;
      }
      return;
    }

    // Calculate delta (actual movement)
    const deltaX = Math.abs(current.x - lastAcceleration.current.x);
    const deltaY = Math.abs(current.y - lastAcceleration.current.y);
    const deltaZ = Math.abs(current.z - lastAcceleration.current.z);
    const movementDelta = Math.sqrt(deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ);

    // Calculate total force for display
    const totalForce = Math.sqrt(current.x**2 + current.y**2 + current.z**2);

    // Update sensor data
    setSensorData(prev => ({
      ...prev,
      accel: current,
      totalForce: totalForce
    }));

    // Detect hard stop
    if (movementDelta > MOVEMENT_THRESHOLD) {
      const scoreDeduction = 5;
      setTripScore(prev => Math.max(0, prev - scoreDeduction));
      
      const eventData = {
        type: 'hard_brake',
        coaching: 'In traffic, scan ahead to brake smoothly',
        timestamp: new Date().toLocaleTimeString()
      };
      setToast(eventData);
      setTripEvents(prev => [...prev, eventData]);
      setSensorData(prev => ({
        ...prev,
        eventCounts: { ...prev.eventCounts, hardStops: prev.eventCounts.hardStops + 1 }
      }));
    }

    // Detect erratic motion
    if (totalForce > ROUGH_THRESHOLD) {
      const scoreDeduction = 3;
      setTripScore(prev => Math.max(0, prev - scoreDeduction));
      
      const eventData = {
        type: 'lane_weaving',
        coaching: 'Stay centered in your lane for safety',
        timestamp: new Date().toLocaleTimeString()
      };
      setToast(eventData);
      setTripEvents(prev => [...prev, eventData]);
      setSensorData(prev => ({
        ...prev,
        eventCounts: { ...prev.eventCounts, weaves: prev.eventCounts.weaves + 1 }
      }));
    }

    lastAcceleration.current = current;
  };

  // Handle DeviceOrientation
  const handleOrientation = (event) => {
    if (!isTracking) return;

    const alpha = event.alpha;
    if (alpha === null) return;

    setSensorData(prev => ({ ...prev, heading: alpha }));

    if (lastHeading.current === 0) {
      lastHeading.current = alpha;
      return;
    }

    const headingDelta = Math.abs(alpha - lastHeading.current);
    const normalizedDelta = Math.min(headingDelta, 360 - headingDelta);

    if (normalizedDelta > TURN_THRESHOLD) {
      const direction = (alpha - lastHeading.current > 0) ? 'right' : 'left';
      const scoreDeduction = 4;
      setTripScore(prev => Math.max(0, prev - scoreDeduction));
      
      const eventData = {
        type: 'sharp_turn',
        degrees: normalizedDelta.toFixed(0),
        direction: direction,
        coaching: 'Smooth steering keeps passengers comfortable',
        timestamp: new Date().toLocaleTimeString()
      };
      setToast(eventData);
      setTripEvents(prev => [...prev, eventData]);
      setSensorData(prev => ({
        ...prev,
        eventCounts: { ...prev.eventCounts, turns: prev.eventCounts.turns + 1 }
      }));
    }

    lastHeading.current = alpha;
  };

  // Handle GPS updates
  const handleGPS = (position) => {
    if (!isTracking) return;

    const { latitude, longitude, speed: gpsSpeed } = position.coords;

    // Update speed
    if (gpsSpeed !== null && gpsSpeed >= 0) {
      const speedKmh = gpsSpeed * 3.6; // m/s to km/h
      setCurrentSpeed(speedKmh);
    } else {
      // Calculate from position changes
      if (lastPosition.current && lastPosition.current.timestamp) {
        const timeDiff = (Date.now() - lastPosition.current.timestamp) / 1000;
        if (timeDiff > 0 && timeDiff < 2) {
          const dist = calculateDistance(
            lastPosition.current.latitude,
            lastPosition.current.longitude,
            latitude,
            longitude
          );
          const speedKmh = (dist / timeDiff) * 3600;
          if (speedKmh < 100) {
            setCurrentSpeed(speedKmh);
          }
        }
      }
    }

    // Calculate distance
    if (lastPosition.current) {
      const dist = calculateDistance(
        lastPosition.current.latitude,
        lastPosition.current.longitude,
        latitude,
        longitude
      );
      
      if (dist < 0.5) {
        setTripDistance(prev => prev + dist);
      }
    }

    lastPosition.current = { latitude, longitude, timestamp: Date.now() };
  };

  // Start tracking
  const startTrip = async () => {
    // Request motion permission on iOS
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== 'granted') {
          alert('Motion permission denied. Please allow motion access to track your trip.');
          return;
        }
      } catch (error) {
        console.error('Motion permission error:', error);
        return;
      }
    }

    // Initialize trip
    setIsTracking(true);
    setTripScore(100);
    setTripDuration(0);
    setCurrentSpeed(0);
    setTripEvents([]);
    tripStartTime.current = Date.now();
    lastPosition.current = null;
    isCalibrated.current = false;
    calibrationCount.current = 0;
    setSensorData(prev => ({ 
      ...prev, 
      eventCounts: { hardStops: 0, turns: 0, weaves: 0 }
    }));

    // Start sensors
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    // Start GPS tracking
    if (navigator.geolocation) {
      gpsWatcher.current = navigator.geolocation.watchPosition(
        handleGPS,
        (error) => console.error('GPS error:', error),
        { 
          enableHighAccuracy: true, 
          maximumAge: 500,
          timeout: 5000 
        }
      );
    }

    // Update duration
    durationInterval.current = setInterval(() => {
      const duration = (Date.now() - tripStartTime.current) / 1000;
      setTripDuration(duration);
      setCurrentSpeed(prev => prev); // Force re-render
    }, 500);
  };

  // Stop tracking and update stats
  const stopTrip = () => {
    setIsTracking(false);
    window.removeEventListener('devicemotion', handleMotion);
    window.removeEventListener('deviceorientation', handleOrientation);
    
    if (gpsWatcher.current) {
      navigator.geolocation.clearWatch(gpsWatcher.current);
    }
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    // Calculate final stats
    const xpEarned = Math.floor(tripScore);
    const finalDistance = tripDistance;
    
    // Update last trip data
    setLastTripData({
      route: 'Walking Route',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distance: finalDistance,
      hardBrakes: sensorData.eventCounts.hardStops,
      sharpTurns: sensorData.eventCounts.turns,
      xpEarned: xpEarned,
      tip: generateCoachingTip(sensorData.eventCounts),
      score: tripScore
    });

    // Update hero stats
    setTimeout(() => {
      setUserXP(prev => prev + xpEarned);
      setSafeKm(prev => prev + finalDistance);
    }, 500);

    // Clear trip distance for next trip
    setTripDistance(0);

    // Show completion toast
    setToast({
      type: 'smooth_driving',
      coaching: `Trip completed! Score: ${tripScore.toFixed(0)}/100. +${xpEarned} XP earned 🎉`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-32">
      {toast && <EventToast event={toast} onDismiss={() => setToast(null)} />}

      {/* Tracking Status Banner */}
      {isTracking && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-500 text-white py-3 px-4 shadow-lg z-40">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Tracking Active</span>
              </div>
              <span className="text-sm">{tripDuration.toFixed(0)}s</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>Score: {tripScore.toFixed(0)}/100</span>
              <span>Distance: {tripDistance.toFixed(2)} km</span>
              <span>Speed: {currentSpeed.toFixed(1)} km/h</span>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-md mx-auto p-4 space-y-4 ${isTracking ? 'pt-24' : ''}`}>
        
        {/* Hero Stats Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg transition-all duration-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-8 w-8" />
                <div>
                  <Badge variant="celebrate" className="mb-1">
                    Gold Streak
                  </Badge>
                  <div className="text-sm opacity-90">Day {streak}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{safeKm.toFixed(0)}</div>
                <div className="text-sm opacity-90">safe km</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Level Progress</span>
                <span className="font-semibold">{userXP} / 3000 XP</span>
              </div>
              <Progress 
                value={userXP} 
                max={3000}
                className="bg-emerald-400/30 h-4"
                indicatorClassName="bg-white"
              />
              <div className="text-sm font-medium text-center pt-2">
                "You're crushing it! 🎉"
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Mission Card */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Target className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Today's Mission</span>
            </div>
            <CardTitle className="text-xl">{todayMission.title}</CardTitle>
            <p className="text-sm text-slate-600">{todayMission.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTracking || tripDistance > 0 ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold">
                    {tripDistance.toFixed(2)} / {todayMission.total} {todayMission.unit}
                  </span>
                </div>
                <Progress 
                  value={tripDistance} 
                  max={todayMission.total}
                  className="h-4"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-semibold text-slate-400">
                    Start tracking to begin
                  </span>
                </div>
                <Progress 
                  value={0} 
                  max={todayMission.total}
                  className="h-4"
                />
              </div>
            )}
            
            <Button 
              variant={isTracking ? 'secondary' : 'default'}
              size="lg"
              className="w-full"
              onClick={isTracking ? stopTrip : startTrip}
            >
              {isTracking ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  End Trip
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Tracking
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Latest Trip Insight Card */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Car className="h-5 w-5" />
                <span className="text-sm font-semibold">Last Trip</span>
              </div>
              <span className="text-sm text-slate-500">{lastTripData.time}</span>
            </div>
            <CardTitle className="text-lg">{lastTripData.route}</CardTitle>
            <p className="text-sm text-slate-600">{lastTripData.distance.toFixed(2)} km</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(lastTripData.hardBrakes > 0 || lastTripData.sharpTurns > 0) && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-amber-900">
                    {lastTripData.hardBrakes > 0 && `${lastTripData.hardBrakes} hard brakes`}
                    {lastTripData.hardBrakes > 0 && lastTripData.sharpTurns > 0 && ', '}
                    {lastTripData.sharpTurns > 0 && `${lastTripData.sharpTurns} sharp turns`}
                    {' detected'}
                  </span>
                  <p className="text-amber-800 mt-1">
                    But hey, you're doing great overall!
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <Lightbulb className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-violet-900">Pro Tip</span>
                <p className="text-violet-800 mt-1">{lastTripData.tip}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <Zap className="h-6 w-6" />
              <span className="text-lg font-bold">+{lastTripData.xpEarned} XP earned!</span>
              <span className="text-2xl">🎉</span>
            </div>

            {lastTripData.score && (
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Trip Score</div>
                <div className="text-3xl font-bold text-emerald-600">{lastTripData.score.toFixed(0)}/100</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievement Gallery */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg">Recent Unlocks</CardTitle>
              </div>
              <button className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-violet-100 to-violet-50 border-violet-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-50'
                  }`}
                >
                  <span className="text-3xl mb-1">{achievement.icon}</span>
                  {achievement.unlocked && (
                    <span className="text-xs font-semibold text-violet-700">New!</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 text-sm text-slate-500">
          <p>Keep up the amazing work! 💪</p>
          <p className="mt-1">3 more trips to unlock Silver tier</p>
        </div>

        {/* Sensor View CTA */}
        {isTracking && (
          <Card className="shadow-md bg-gradient-to-br from-blue-50 to-violet-50 border-2 border-blue-200 animate-pulse">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Activity className="h-8 w-8 mx-auto text-blue-600" />
                <div className="text-blue-900 font-semibold text-lg">
                  View Detailed Sensor Data
                </div>
                <p className="text-sm text-blue-800">
                  See real-time GPS speed, distance, and motion sensors. Your trip will continue tracking!
                </p>
                <a 
                  href="/motion-test-with-gps.html?autostart=true&from=dashboard"
                  className="inline-block w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-violet-700 transition shadow-lg"
                >
                  🔬 Open Sensor View →
                </a>
                <p className="text-xs text-blue-700">
                  ✅ Trip continues • Use back button to return
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
