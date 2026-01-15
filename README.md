# Safety Coach Telematics Prototype 🚗

A mobile-first React dashboard demonstrating positive reinforcement, contextual coaching, and gamification for safe driving.

**Two versions available**: Choose based on your demo needs! 👇

## 📦 Demo Versions

### 1️⃣ Static Demo (`standalone-demo.html`)
**Perfect for**: Quick UI reviews, desktop presentations, design iteration

- ✅ Works on any device (desktop/mobile/tablet)
- ✅ No permissions needed
- ✅ Instant start (0 setup)
- ✅ Consistent every time
- 📄 [Open Static Demo](standalone-demo.html)

### 2️⃣ Walking-Mode Demo (`walking-mode-demo.html`) ⭐ NEW!
**Perfect for**: Live stakeholder demos, technical validation, interactive experiences

- ✅ Real sensor integration (GPS + Motion)
- ✅ Live event detection (walk, stop, turn)
- ✅ Permission flow with graceful fallbacks
- ✅ Real-time toast notifications
- 📱 **Requires mobile device**
- 📄 [Open Walking-Mode Demo](walking-mode-demo.html)
- 📖 [Walking-Mode Documentation](WALKING_MODE_README.md)

### 🤔 Not sure which to use?
See our **[Demo Comparison Guide](DEMO_COMPARISON.md)** for detailed breakdown!

## 🎯 Core Features (Both Versions)

- **Hero Stats Card**: Level badges, XP progress, and safe miles tracker
- **Daily Missions**: Gamified driving challenges with real-time progress
- **Trip Insights**: Contextual feedback with coaching tips (not judgment!)
- **Achievement System**: Unlockable badges and rewards
- **Positive Psychology**: Encouraging tone throughout

## 🚀 Quick Start

### Option 1: Instant Demo (Recommended)
```bash
# Static version (works on desktop)
open standalone-demo.html

# Walking-Mode version (requires mobile)
open walking-mode-demo.html
```

### Option 2: Development Server
```bash
# Install dependencies
npm install

# Start dev server (opens at http://localhost:3001)
npm run dev
```

## 📱 Design Principles

### Tone & Voice
- ✅ **Encouraging**: "You're crushing it!" not "You failed"
- ✅ **Coaching**: Actionable tips, not just scores
- ✅ **Celebrating**: Highlight wins, contextualize issues

### Color System
- 🟢 **Emerald**: Achievement & safety
- 🟡 **Amber**: Gentle warnings
- 🟣 **Violet**: Rewards & celebrations
- ⚪ **Slate**: Context & metadata

### Mobile-First
- Touch targets: 44px minimum
- Single-thumb navigation
- Progressive disclosure
- Instant feedback

## 🎨 Tech Stack

- **React 18**: Component framework
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Vite**: Build tool (fast!)

## 📦 Project Structure

```
safety-coach-prototype/
├── src/
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Entry point
│   └── SafetyCoachDashboard.jsx  # Main dashboard
├── index.html
├── standalone-demo.html  # Single-file demo
└── package.json
```

## 🎯 Demo Data

The prototype uses realistic mock data:
- **User**: Gold level, 12-day streak, 247 safe miles
- **Mission**: "Maintain 3-sec following distance" (4/10 miles)
- **Last Trip**: Main St route with contextual feedback
- **Achievements**: 5 badges (3 unlocked, 2 locked)

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
# Drag/drop dist/ folder to Vercel
```

### Netlify
```bash
# Connect GitHub repo
# Build: npm run build
# Publish: dist/
```

### CodeSandbox
1. Fork this repo
2. Share public link
3. Live in seconds!

## 📝 Future Enhancements

- Real-time GPS tracking
- Historical trip gallery
- Social leaderboards
- Customizable missions
- Voice coaching during drives
- Integration with OBD-II devices

## 🎓 Built With Vibecoding

This prototype was built in 20 minutes following the Vibecoding methodology:
- Single-screen focus
- Mobile-first design
- Instant deployability
- Positive user psychology

---

**Questions?** Open an issue or reach out!  
**License:** MIT
