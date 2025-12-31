---
description: Universal release workflow - auto-detects project type and runs complete release process
---

# Release Workflow

Universal release workflow that automatically detects project type and builds appropriate artifacts.

## Quick Start

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# Or trigger manually via GitHub Actions UI
```

## Project Type Auto-Detection

The workflow automatically detects:

| Project Type | Detection Method | Build Output |
|-------------|------------------|--------------|
| **Electron** | `electron` in package.json | .exe, .msi, .zip (Win), .dmg (Mac), .AppImage (Linux) |
| **Web App** | `vite`, `next`, `webpack` in package.json | dist/, build/, .next/ |
| **Docker** | Dockerfile exists | docker-image.tar |
| **Library** | `main`/`module` in package.json, no build | npm publish |
| **Generic** | Fallback | Source code only |

## Supported Package Managers

Auto-detected from lockfiles:
- `npm` (package-lock.json)
- `yarn` (yarn.lock)
- `pnpm` (pnpm-lock.yaml)

## Electron Build Targets

### Windows
- **NSIS** (.exe) - Standard installer
- **Portable** (.zip) - No installation required
- **MSI** (.msi) - Enterprise deployment

### macOS
- **DMG** (.dmg) - Disk image

### Linux
- **AppImage** - Portable
- **DEB** - Debian/Ubuntu
- **RPM** - Fedora/RHEL

## Local Build Verification

Before releasing, verify locally:

```bash
# For Electron projects
npm run build:main      # Compile TypeScript main process
npm run build:renderer  # Build Vite renderer
npm run build:electron  # Package with electron-builder
npm run build           # All steps combined

# Verify outputs
ls dist/main/           # Should have index.js
ls dist/renderer/       # Should have index.html
ls release/             # Should have .exe, .msi, etc.
```

## Docker Support

If Dockerfile exists, workflow will:

```bash
# Build image
docker build -t app:v1.0.0 .

# Export as tarball for release
docker save app:v1.0.0 > docker-image.tar
```

## package.json Configuration

### Electron Build Config
```json
{
  "build": {
    "appId": "com.example.app",
    "productName": "My App",
    "files": ["dist/**/*", "package.json"],
    "directories": { "output": "release/${version}" },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] },
        { "target": "msi", "arch": ["x64"] }
      ]
    },
    "mac": { "target": "dmg" },
    "linux": { "target": "AppImage" }
  }
}
```

### Required Scripts
```json
{
  "scripts": {
    "build": "npx tsc -p tsconfig.node.json && vite build && electron-builder",
    "build:main": "npx tsc -p tsconfig.node.json",
    "build:renderer": "vite build",
    "build:electron": "electron-builder --win --mac --linux"
  }
}
```

## Workflow Triggers

```yaml
on:
  push:
    tags: ['v*']           # Any version tag
    branches: ['release/v*']  # Release branches
  workflow_dispatch:        # Manual trigger
```

## Versioning Convention

- `v1.0.0` - Stable release
- `v1.0.0-beta.1` - Pre-release (marked automatically)
- `v1.0.0-rc.1` - Release candidate

## Troubleshooting

### Build fails with TypeScript errors
```bash
# Check locally
npx tsc -p tsconfig.node.json
```

### Electron-builder fails
```bash
# Ensure author field exists
# package.json: "author": "Your Name"

# Reinstall if needed
npm uninstall electron-builder && npm install electron-builder
```

### Missing artifacts in release
```bash
# Check output directory matches config
ls release/        # Should match "directories.output"
```
