# BuildBeacon

BuildBeacon is a VS Code extension that monitors running processes and sends HTTP POST notifications when a specified process exits. It's ideal for tracking builds, scripts, and long-running tasks inside VS Code workflows.

## Features

- **Process Monitoring**: Watch for a specific process by name and detect when it exits
- **HTTP Notifications**: Send structured POST requests to a server endpoint when the monitored process completes

## Getting Started

1. Open the BuildBeacon sidebar by clicking the beacon icon in the Activity Bar
2. Configure your settings:
   - **Endpoint URL**: The server URL to send POST requests to
   - **Content**: The message or data to send in the POST body
   - **Process Name**: The name of the process to monitor (e.g., `build.sh`, `npm`)
3. Run your build/script in the terminal
4. BuildBeacon will automatically detect when the process exits and send a POST request to your endpoint

## Extension Settings

BuildBeacon contributes the following settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `buildbeacon.endpoint` | The endpoint URL to send POST requests to | `sample_api.com` |
| `buildbeacon.content` | The content to send in the POST request | `task finishes` |
| `buildbeacon.monitoredProcess` | The process name to monitor | `build.sh` |

## Development

```bash
# Install dependencies
npm install

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

# Run tests
npm run test
```
