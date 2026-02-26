import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let scanInterval: NodeJS.Timeout | null = null;
let webviewPanel: vscode.WebviewPanel | null = null;

interface ProcessInfo {
	name: string;
	pid: number;
}

async function getRunningProcesses(): Promise<ProcessInfo[]> {
	try {
		const { default: psList } = await import('ps-list');
		const processes = await psList();
		return processes.map(p => ({ name: p.name, pid: p.pid }));
	} catch (error) {
		console.error('Error getting process list:', error);
		return [];
	}
}

function sendPostRequest(endpoint: string, data: object): void {
	const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `https://${endpoint}`);
	const isHttps = urlObj.protocol === 'https:';
	const lib = isHttps ? https : http;

	const postData = JSON.stringify(data);

	const options = {
		hostname: urlObj.hostname,
		port: urlObj.port || (isHttps ? 443 : 80),
		path: urlObj.pathname + urlObj.search,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(postData)
		}
	};

	const req = lib.request(options, (res) => {
		let body = '';
		res.on('data', (chunk) => body += chunk);
		res.on('end', () => {
			console.log('POST response:', res.statusCode, body);
			vscode.window.showInformationMessage(`Notification sent! Status: ${res.statusCode}`);
		});
	});

	req.on('error', (error) => {
		console.error('POST request error:', error);
		vscode.window.showErrorMessage(`Failed to send notification: ${error.message}`);
	});

	req.write(postData);
	req.end();
}

function getWebviewContent(): string {
	return `<!DOCTYPE html>
<html>
<head>
	<style>
		body {
			font-family: var(--vscode-font-family);
			padding: 10px;
			color: var(--vscode-foreground);
		}
		.field {
			margin-bottom: 15px;
		}
		label {
			display: block;
			margin-bottom: 5px;
			font-weight: bold;
		}
		input {
			width: 100%;
			padding: 5px;
			box-sizing: border-box;
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border: 1px solid var(--vscode-input-border);
		}
		button {
			width: 100%;
			padding: 8px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			cursor: pointer;
			font-weight: bold;
		}
		button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		.status {
			margin-top: 15px;
			padding: 10px;
			border-radius: 4px;
		}
		.status.scanning {
			background-color: #2d5a2d;
		}
		.status.idle {
			background-color: #333;
		}
	</style>
</head>
<body>
	<h3>BuildBeacon Configuration</h3>
	<div class="field">
		<label for="user_token">user_token:</label>
		<input type="text" id="user_token" placeholder="Enter your user token">
	</div>
	<div class="field">
		<label for="user_uid">user_uid:</label>
		<input type="text" id="user_uid" placeholder="Enter your user UID">
	</div>
	<button id="startBtn">Start</button>
	<div id="status" class="status idle">Status: Idle</div>

	<script>
		const vscode = acquireVsCodeApi();

		document.getElementById('startBtn').addEventListener('click', () => {
			const userToken = document.getElementById('user_token').value.trim();
			const userUid = document.getElementById('user_uid').value.trim();

			if (!userToken || !userUid) {
				vscode.postMessage({ type: 'error', message: 'Please fill in both user_token and user_uid' });
				return;
			}

			vscode.postMessage({
				type: 'start',
				userToken: userToken,
				userUid: userUid
			});
		});

		window.addEventListener('message', event => {
			const data = event.data;
			if (data.type === 'status') {
				const statusEl = document.getElementById('status');
				statusEl.textContent = 'Status: ' + data.message;
				statusEl.className = 'status ' + (data.scanning ? 'scanning' : 'idle');
			}
		});
	</script>
</body>
</html>`;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('BuildBeacon extension is now active!');

	const provider: vscode.WebviewViewProvider = {
		resolveWebviewView: (webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) => {
			webviewView.webview.options = {
				enableScripts: true
			};
			webviewView.webview.html = getWebviewContent();

			webviewView.webview.onDidReceiveMessage(async (message) => {
				if (message.type === 'error') {
					vscode.window.showErrorMessage(message.message);
					return;
				}

				if (message.type === 'start') {
					const { userToken, userUid } = message;

					// Get configuration values
					const config = vscode.workspace.getConfiguration('buildbeacon');
					const endpoint = config.get('endpoint', 'sample_api.com');
					const content = config.get('content', 'task finishes');
					const monitoredProcess = config.get('monitoredProcess', 'build.sh');

					webviewView.webview.postMessage({
						type: 'status',
						message: `Scanning for "${monitoredProcess}"...`,
						scanning: true
					});

					// Start scanning
					scanInterval = setInterval(async () => {
						const processes = await getRunningProcesses();
						const processNames = processes.map(p => p.name.toLowerCase());
						const targetProcess = monitoredProcess.toLowerCase();

						if (!processNames.includes(targetProcess)) {
							// Process not found, stop scanning and send POST request
							if (scanInterval) {
								clearInterval(scanInterval);
								scanInterval = null;
							}

							const postData = {
								user_token: userToken,
								user_uid: userUid,
								content: content,
								monitored_process: monitoredProcess
							};

							webviewView.webview.postMessage({
								type: 'status',
								message: `Process "${monitoredProcess}" not found. Sending notification...`,
								scanning: false
							});

							sendPostRequest(endpoint, postData);
						}
					}, 10000); // 10 seconds
				}
			});
		}
	};

	const viewRegistration = vscode.window.registerWebviewViewProvider(
		'buildbeacon-panel',
		provider
	);

	context.subscriptions.push(viewRegistration);

	// Cleanup on deactivate
	context.subscriptions.push({
		dispose: () => {
			if (scanInterval) {
				clearInterval(scanInterval);
				scanInterval = null;
			}
		}
	});
}

export function deactivate() {
	if (scanInterval) {
		clearInterval(scanInterval);
		scanInterval = null;
	}
}
