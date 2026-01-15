import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { 
  Trophy, 
  Target, 
  Car, 
  Lightbulb, 
  Zap, 
  TrendingUp, 
  Award,
  Play,
  Pause
} from 'lucide-react';

const demoData = {
  user: {
    level: 'Gold',
    streak: 12,
    xp: 2470,
    nextLevel: 3000,
    safeMiles: 247
  },
  todayMission: {
    title: 'Maintain 3-sec following distance',
    description: 'Keep safe spacing in traffic',
    progress: 4,
    total: 10,
    unit: 'miles'
  },
  lastTrip: {
    route: 'Main St → Home',
    time: '2:34 PM',
    distance: 8.2,
    hardBrakes: 2,
    xpEarned: 50,
    tip: 'High traffic zone ahead. Try Route 9 instead for smoother flow!'
  },
  recentAchievements: [
    { id: 1, name: 'Week Warrior', icon: '🏅', unlocked: true },
    { id: 2, name: 'Smooth Operator', icon: '🏅', unlocked: true },
    { id: 3, name: 'Distance Master', icon: '🏅', unlocked: true },
    { id: 4, name: 'Night Owl', icon: '🏆', unlocked: false },
    { id: 5, name: 'Eco Driver', icon: '🏆', unlocked: false },
  ]
};

export default function SafetyCoachDashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const xpPercentage = (demoData.user.xp / demoData.user.nextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Hero Stats Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                <div>
                  <Badge variant="celebrate" className="mb-1">
                    {demoData.user.level} Streak
                  </Badge>
                  <div className="text-sm opacity-90">Day {demoData.user.streak}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{demoData.user.safeMiles}</div>
                <div className="text-sm opacity-90">safe miles</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Level Progress</span>
                <span className="font-semibold">{demoData.user.xp} / {demoData.user.nextLevel} XP</span>
              </div>
              <Progress 
                value={demoData.user.xp} 
                max={demoData.user.nextLevel}
                className="bg-emerald-400/30"
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
              <Target className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Today's Mission</span>
            </div>
            <CardTitle className="text-xl">{demoData.todayMission.title}</CardTitle>
            <p className="text-sm text-slate-600">{demoData.todayMission.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Progress</span>
                <span className="font-semibold">
                  {demoData.todayMission.progress} / {demoData.todayMission.total} {demoData.todayMission.unit}
                </span>
              </div>
              <Progress 
                value={demoData.todayMission.progress} 
                max={demoData.todayMission.total}
              />
            </div>
            
            <Button 
              variant={isTracking ? 'secondary' : 'primary'}
              size="lg"
              className="w-full"
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Tracking... (Tap to Stop)
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
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
                <Car className="w-5 h-5" />
                <span className="text-sm font-semibold">Last Trip</span>
              </div>
              <span className="text-sm text-slate-500">{demoData.lastTrip.time}</span>
            </div>
            <CardTitle className="text-lg">{demoData.lastTrip.route}</CardTitle>
            <p className="text-sm text-slate-600">{demoData.lastTrip.distance} miles</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gentle Feedback */}
            {demoData.lastTrip.hardBrakes > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-amber-900">
                    {demoData.lastTrip.hardBrakes} hard brakes detected
                  </span>
                  <p className="text-amber-800 mt-1">
                    But hey, you're doing great overall!
                  </p>
                </div>
              </div>
            )}
            
            {/* Coaching Tip */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <Lightbulb className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-violet-900">Pro Tip</span>
                <p className="text-violet-800 mt-1">{demoData.lastTrip.tip}</p>
              </div>
            </div>
            
            {/* Positive Reinforcement */}
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <Zap className="w-6 h-6" />
              <span className="text-lg font-bold">+{demoData.lastTrip.xpEarned} XP earned!</span>
              <span className="text-2xl">🎉</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Achievement Peek */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-600" />
                <CardTitle className="text-lg">Recent Unlocks</CardTitle>
              </div>
              <button className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {demoData.recentAchievements.map((achievement) => (
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

        {/* Footer Encouragement */}
        <div className="text-center py-6 text-sm text-slate-500">
          <p>Keep up the amazing work! 💪</p>
          <p className="mt-1">3 more trips to unlock Silver tier</p>
        </div>
      </div>
    </div>
  );
}
