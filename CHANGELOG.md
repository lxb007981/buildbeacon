# Change Log

All notable changes to the "buildbeacon" extension will be documented in this file.


## [v0.0.1] - 2026-02-27

### Added
- Initial release of BuildBeacon VS Code extension
- Process monitoring: Detects when specified processes exit
- HTTP POST notifications: Sends structured POST requests to a configured endpoint
- WebView sidebar UI for configuration
- Configurable settings:
  - `buildbeacon.endpoint` - URL to send POST requests
  - `buildbeacon.content` - Content to send in POST body
  - `buildbeacon.monitoredProcess` - Process name to monitor