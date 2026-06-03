# Angular Shell - Master Micro-Frontend Dispatcher

A dynamic Angular Shell that loads and manages React micro-frontend games at runtime using Module Federation.

## 🎯 Features

- **Dynamic Module Federation**: Load games at runtime without rebuilding the Shell
- **JWT Authentication**: Secure game access with token-based authentication
- **Asset Prefetching**: Intelligent preloading of popular game assets
- **React Integration**: Seamlessly mount React 18+ games in Angular
- **Error Resilience**: Retry logic with exponential backoff for failed remote modules
- **Memory Management**: Proper React lifecycle management to prevent leaks
- **Service Worker**: Offline-first caching strategy

## 🚀 Quick Start

### Development

1. **Install dependencies:**

```bash
npm install
```

2. **Start the Shell:**

```bash
ng serve
```

3. **Start games** (in separate terminals):

```bash
# Game 1 - Scramble Words (port 5001)
cd ../Scramble-Words && pnpm dev

# Game 2 - Life Goals (port 5002)
cd ../life-goals && pnpm dev

# Game 3 - Quiz Game (port 5003)
cd ../quiz-game && pnpm dev
```

4. **Access:**

- Lobby: http://localhost:4200
- Direct game: http://localhost:4200/play/life-goals

### Production Build

```bash
ng build --configuration production

# Copy production manifest
cp src/assets/federation.manifest.prod.json dist/angular-shell/browser/assets/federation.manifest.json
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── security.service.ts        # JWT handling
│   │   │   ├── federation.service.ts      # Module loader
│   │   │   └── asset-prefetch.service.ts  # SW integration
│   │   └── guards/
│   │       └── auth.guard.ts
│   ├── shared/
│   │   └── components/
│   │       ├── game-wrapper/              # React bridge
│   │       └── error-fallback/
│   ├── features/
│   │   └── game-dispatcher/
│   │       ├── auth.component.ts          # JWT extractor
│   │       └── lobby.component.ts
│   └── app.routes.ts
├── assets/
│   └── federation.manifest.json           # Game registry
└── environments/
    ├── environment.ts                     # Production config
    └── environment.development.ts         # Dev config
```

## 🎮 Available Games

| Game ID          | Display Name       | Entry Point | Assets       |
| ---------------- | ------------------ | ----------- | ------------ |
| `scramble-words` | Scramble Words     | Port 5001   | Minimal      |
| `life-goals`     | Life Goals Preparedness | Port 5002   | 9 MP4 videos |
| `quiz-game`      | Quiz Challenge     | Port 5003   | 3 images     |

## 🔐 JWT Authentication

### Token Structure

```json
{
  "gameId": "life-goals",
  "exp": 1739456123
}
```

### Usage

```
https://balicuat.bajajlifeinsurance.com/gamification/shell/auth?token=<JWT>
```

The Shell will:

1. Extract and validate the JWT
2. Navigate to `/play/:gameId`
3. Remove the token from URL (security)

## 📦 Module Federation

Games are loaded dynamically from the manifest:

```json
{
  "life-goals": {
    "remoteEntry": "https://cdn.example.com/life-goals/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "popular": true,
    "assets": ["..."]
  }
}
```

## 🛠 Configuration

### Development (localhost)

Uses `environment.development.ts`:

- Games run on ports 5001-5003
- Manifest: `/assets/federation.manifest.json`

### Production (Bajaj CDN)

Uses `environment.ts`:

- Base URL: `balicuat.bajajlifeinsurance.com/gamification`
- Games deployed to subfolders: `/scramble-words/`, `/life-goals/`, `/quiz-game/`

## 📊 Asset Management

### Prefetching Strategy

- Popular games (flagged in manifest) are prefetched on app initialization
- Service Worker caches game bundles for 24 hours
- Heavy assets (MP4s) are cached separately

### Cache Configuration

See `ngsw-config.json` for Service Worker settings.

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Build and serve production
ng build --configuration production
ng serve --configuration production
```

## 📝 Adding New Games

1. Build your React game
2. Deploy to CDN: `/gamification/your-game/`
3. Update `federation.manifest.json`:

```json
{
  "your-game": {
    "remoteEntry": "https://cdn.example.com/your-game/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "displayName": "Your Game",
    "popular": false,
    "assets": []
  }
}
```

4. **No Shell rebuild needed!**

## 🚨 Troubleshooting

### Game won't load

- Check browser console for errors
- Verify game URL in manifest is accessible
- Ensure CORS is enabled on game server

### Memory leaks

- React components are unmounted in `ngOnDestroy`
- Check Chrome DevTools → Memory for detached nodes

### Assets not caching

- Verify Service Worker is registered (DevTools → Application)
- Check `ngsw-config.json` matches your asset URLs

## 📚 Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Full deployment instructions
- [Implementation Plan](../.gemini/antigravity/brain/*/implementation_plan.md) - Architecture details

## 🏗 Tech Stack

- **Angular 18** (Standalone Components)
- **TypeScript 5**
- **Module Federation** (Dynamic loading)
- **React 19** (Games)
- **Service Worker** (Caching)
- **jwt-decode** (Authentication)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

Proprietary - Bajaj Life Insurance
