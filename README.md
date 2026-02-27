# BuildBeacon

BuildBeacon is a VS Code extension that detects when specified processes exit and sends notifications.

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
| `buildbeacon.content` | The content to send in the POST request | `build finishes` |
| `buildbeacon.monitoredProcess` | The process name to monitor | `build.sh` |

## Development

```bash
# Compile the extension (type check + lint + build)
npm run compile

# Production build (for publishing)
npm run package
npx @vscode/vsce package
```
