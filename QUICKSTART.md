# Monolithic Build - Quick Start

## 🎯 Single Command Build & Serve

This project is now set up as a monolithic build - everything builds and serves from a single command!

### Development

**Start everything:**

```bash
pnpm install    # Install all dependencies (root + all workspaces)
pnpm dev        # Starts Shell + all 3 games concurrently
```

Access at: **http://localhost:4200**

All games are served from the Angular Shell - no need to start them separately!

### Production Build

**Build everything:**

```bash
pnpm build
```

This will:

1. Build all 3 React games
2. Copy game builds into `angular-shell/src/assets/games/`
3. Update the federation manifest to use local paths
4. Build the Angular Shell with all games included

Output: `angular-shell/dist/angular-shell/browser/`

### How It Works

```
┌─────────────────────────────────────────┐
│  Root (pnpm workspace)                  │
│  ├── pnpm build                         │
│  │   ├── Build Scramble Words →        │
│  │   ├── Build Life Goals →            │
│  │   ├── Build Quiz Game →             │
│  │   ├── Copy all to Shell assets/     │
│  │   └── Build Angular Shell           │
│  └── Output: Single deployable bundle  │
└─────────────────────────────────────────┘
```

**Before**: 4 separate servers (Shell + 3 games)  
**Now**: 1 server serving everything

### Available Commands

| Command            | Description                               |
| ------------------ | ----------------------------------------- |
| `pnpm install`     | Install all dependencies across workspace |
| `pnpm dev`         | Start Shell + all games in dev mode       |
| `pnpm build`       | Build everything into single bundle       |
| `pnpm build:games` | Build only games                          |
| `pnpm build:shell` | Build only Shell                          |
| `pnpm serve`       | Serve Shell on port 4200                  |
| `pnpm clean`       | Remove all dist and node_modules          |

### Workspace Structure

```
app-store/                        # Root workspace
├── package.json                  # Workspace scripts
├── pnpm-workspace.yaml          # Workspace config
├── scripts/
│   └── copy-games.js            # Copies games to Shell assets
├── angular-shell/               # Shell (host)
├── Scramble-Words/              # Game 1
├── life-goals/                      # Game 2 (life-goals)
└── quiz-game/                   # Game 3
```

### Federation Manifest

After `pnpm build`, the manifest points to local assets:

```json
{
  "scramble-words": {
    "remoteEntry": "/assets/games/scramble-words/index.js"
  }
}
```

All games load from the same origin - no CORS issues!

### Deployment

```bash
pnpm build
cd angular-shell/dist/angular-shell/
# Upload this folder to your server
```

Everything is self-contained - just deploy the `/` folder.

### Benefits

✅ **Single command** - `pnpm build` does everything  
✅ **No CORS issues** - all assets from same origin  
✅ **Faster development** - games hot-reload automatically  
✅ **Simple deployment** - one folder to upload  
✅ **Type safety** - shared dependencies across workspace
