# Build Instructions

This Chrome extension has been modernized from Manifest V2 to V3 and now uses Vite as the build tool.

## Prerequisites
- Node.js 18+ and npm

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```
This will watch for changes and rebuild automatically.

## Production Build
```bash
npm run build
```
The extension will be built to the `dist/` directory.

## Loading in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` directory

## Key Changes from V2 to V3
- Migrated from Manifest V2 to V3
- Background scripts now use service workers
- Changed from localStorage to chrome.storage API
- Replaced Grunt with Vite for modern build tooling
- Updated deprecated Chrome APIs (chrome.tabs.getSelected → chrome.tabs.query)