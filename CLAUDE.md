# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BuildBeacon is a VS Code extension that monitors running processes and sends HTTP POST notifications when a specified process exits. It's useful for tracking builds, scripts, and long-running tasks in VS Code workflows.

## Commands

```bash
# Compile the extension (type check + lint + build)
npm run compile

# Watch mode for development
npm run watch

# Production build (for publishing)
npm run package

# Run linter
npm run lint

# TypeScript type checking
npm run check-types
```

## Architecture

The extension is a single-file TypeScript project with the following structure:

- **`src/extension.ts`** - Main extension entry point containing:
  - WebView-based sidebar UI (configuration form with user_token, user_uid inputs)
  - Process monitoring using `ps-list` library
  - HTTP/HTTPS POST request handling
  - VS Code settings integration

- **VS Code Settings** (defined in `package.json`):
  - `buildbeacon.endpoint` - URL to send POST requests
  - `buildbeacon.content` - Content to send in POST body
  - `buildbeacon.monitoredProcess` - Process name to monitor

- **Sidebar**: Registered as `buildbeacon-panel` in the activity bar

The extension uses esbuild for bundling TypeScript to JavaScript in the `dist/` folder.
