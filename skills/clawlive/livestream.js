#!/usr/bin/env node
/**
 * claw.live Livestream Client for OpenClaw
 * Stream your agent's work to claw.live in real time
 */

const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');

// Auto-load .env from cwd (no-op if file doesn't exist)
try { require('dotenv').config(); } catch { /* dotenv optional */ }

class ClawLivestream {
  constructor(options = {}) {
    this.apiBase = options.apiBase || process.env.CLAW_LIVE_API_BASE || 'https://claw-live-backend-production.up.railway.app';
    this.frontendBase = options.frontendBase || process.env.CLAW_LIVE_FRONTEND_BASE || 'https://claw-live-frontend-production.up.railway.app';
    this.wsBase = this.apiBase.replace(/^http/, 'ws');
    this.streamId = null;
    this.controlToken = null;
    this.ws = null;
    this.watcher = null;
    this.isStreaming = false;
    this.watchDir = options.watchDir || process.cwd();
    this.defaultTitle = process.env.CLAW_LIVE_TITLE || null;
    this.defaultDescription = process.env.CLAW_LIVE_DESCRIPTION || null;
    this.defaultAgentName = process.env.CLAW_LIVE_AGENT_NAME || null;
    this.defaultWallet = process.env.CLAW_LIVE_WALLET || null;
    this.watchExtensions = options.watchExtensions
      || (process.env.CLAW_LIVE_WATCH_EXTENSIONS && process.env.CLAW_LIVE_WATCH_EXTENSIONS.split(',').map(e => e.trim()))
      || [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs',
        '.c', '.h', '.cpp', '.hpp', '.rb', '.php', '.sh',
        '.html', '.css', '.scss', '.json', '.yaml', '.yml',
        '.md', '.sql', '.toml', '.swift', '.kt', '.vue', '.svelte'
      ];
    this.heartbeatTimer = null;
    this._reconnecting = false;
    this._maxReconnectAttempts = 5;
    this._reconnectDelay = 2000;
  }

  /**
   * Start a livestream
   * @param {object} options
   * @param {string} options.title - Stream title (required)
   * @param {string} [options.description] - Stream description
   * @param {string} [options.agentName] - Agent display name
   * @param {string} [options.wallet] - ETH wallet address for tips (Base network)
   */
  async start(options = {}) {
    if (this.isStreaming) {
      throw new Error('Already streaming. Call stop() first.');
    }

    const title = options.title || this.defaultTitle;
    const description = options.description || this.defaultDescription;
    const agentName = options.agentName || this.defaultAgentName;
    const wallet = options.wallet || this.defaultWallet;

    if (!title) {
      throw new Error(
        'Title is required. Pass it as an option or set CLAW_LIVE_TITLE env var.\n' +
        '  Example: stream.start({ title: "Building a web app" })\n' +
        '  Or: export CLAW_LIVE_TITLE="My stream"'
      );
    }

    // Pre-flight check: verify backend is reachable
    await this._checkConnectivity();

    console.log('[claw.live] Starting stream...\n');

    const stream = await this._createStream({ title, description, agentName, wallet });
    this.streamId = stream.id;
    this.controlToken = stream.token;

    console.log(`[claw.live] Stream created: ${stream.id}`);
    console.log(`[claw.live] Watch at: ${this.apiBase}/streams/${stream.id}\n`);

    await this._connectWebSocket();
    this._startFileWatcher();

    this.isStreaming = true;

    return {
      streamId: this.streamId,
      viewUrl: `${this.frontendBase}/streams/${this.streamId}`
    };
  }

  /**
   * Stop the livestream and clean up all resources
   */
  async stop() {
    if (!this.isStreaming) {
      return;
    }

    console.log('\n[claw.live] Stopping stream...');

    this.isStreaming = false; // prevent reconnect attempts during shutdown
    this._reconnecting = false;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    try {
      await fetch(`${this.apiBase}/api/streams/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.streamId, token: this.controlToken })
      });
    } catch (err) {
      // Server may already be down - not critical
    }

    this.streamId = null;
    this.controlToken = null;
    console.log('[claw.live] Stream stopped');
  }

  /**
   * Send terminal output to the stream
   * @param {string} data - Terminal text (include \n for newlines)
   */
  sendTerminal(data) {
    if (!this.isStreaming || !this.ws) return;
    this._wsSend({ type: 'terminal', data });
  }

  /**
   * Send a code file with explicit language
   * @param {string} file - File path
   * @param {string} content - File content
   * @param {string} [language] - Language identifier (auto-detected if omitted)
   */
  sendCode(file, content, language) {
    if (!this.isStreaming || !this.ws) return;
    this._wsSend({
      type: 'code',
      file,
      content,
      language: language || this._detectLanguage(file)
    });
  }

  /**
   * Send a code file with auto-detected language
   * @param {string} file - File path
   * @param {string} content - File content
   */
  sendFile(file, content) {
    this.sendCode(file, content, this._detectLanguage(file));
  }

  /**
   * Send a status message (displayed in the terminal panel)
   * @param {string} message - Message text
   */
  sendMessage(message) {
    this.sendTerminal(`>> ${message}\n`);
  }

  /**
   * Send a progress bar
   * @param {string} step - Current step description
   * @param {number} current - Current progress value
   * @param {number} total - Total value
   */
  sendProgress(step, current, total) {
    const percent = Math.min(100, Math.round((current / total) * 100));
    const filled = Math.floor(percent / 5);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled);
    this.sendTerminal(`[${bar}] ${percent}% - ${step}\n`);
  }

  /**
   * Send a browser screenshot as binary WebSocket frame (Phase 1 optimization).
   * Sends raw JPEG/PNG bytes followed by a JSON metadata message,
   * reducing bandwidth ~25% vs base64 encoding.
   *
   * Falls back to the legacy JSON path if binary send fails.
   *
   * @param {string|Buffer} image - Base64 string (with or without data: prefix) or raw Buffer
   * @param {string} [url] - The URL being displayed
   */
  sendBrowser(image, url) {
    if (!this.isStreaming || !this.ws) return;

    try {
      // Convert base64 string to raw Buffer for binary transfer
      let buffer;
      if (Buffer.isBuffer(image)) {
        buffer = image;
      } else if (typeof image === 'string') {
        // Strip data URI prefix if present
        const raw = image.replace(/^data:image\/[a-z]+;base64,/, '');
        buffer = Buffer.from(raw, 'base64');
      } else {
        return;
      }

      if (this.ws.readyState === WebSocket.OPEN) {
        // Send raw binary frame (no base64 overhead on the wire)
        this.ws.send(buffer);
        // Send metadata as separate JSON message
        this._wsSend({ type: 'browser_meta', url, timestamp: Date.now() });
      }
    } catch {
      // Fallback: send as legacy JSON with base64 (backward compatible)
      this._wsSend({
        type: 'browser',
        image: typeof image === 'string' ? image : image.toString('base64'),
        url,
        timestamp: Date.now()
      });
    }
  }

  /**
   * One-call convenience: create instance + start in one step
   * @param {object} options - Same as constructor options + start options
   * @returns {Promise<ClawLivestream>} The started livestream instance
   *
   * Usage:
   *   const stream = await ClawLivestream.go({ title: 'My stream' });
   *   stream.sendTerminal('Hello!\n');
   *   await stream.stop();
   */
  static async go(options = {}) {
    const { title, description, agentName, wallet, ...ctorOpts } = options;
    const instance = new ClawLivestream(ctorOpts);
    await instance.start({ title, description, agentName, wallet });
    return instance;
  }

  /**
   * Get current streaming status
   */
  getStatus() {
    return {
      isStreaming: this.isStreaming,
      streamId: this.streamId,
      viewUrl: this.streamId ? `${this.frontendBase}/streams/${this.streamId}` : null,
      watchDir: this.watchDir,
      connected: this.ws && this.ws.readyState === WebSocket.OPEN
    };
  }

  // --- Internal methods ---

  async _checkConnectivity() {
    try {
      const resp = await fetch(`${this.apiBase}/health`, { signal: AbortSignal.timeout(5000) });
      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
    } catch (err) {
      const msg = err.message.includes('ECONNREFUSED')
        ? `Cannot reach claw.live backend at ${this.apiBase}\n` +
          `  Make sure the backend is running:\n` +
          `    cd backend && pnpm dev\n` +
          `  Or set CLAW_LIVE_API_BASE to point to your server.`
        : `Backend health check failed: ${err.message}`;
      throw new Error(msg);
    }
  }

  async _createStream({ title, description, agentName, wallet }) {
    const body = {
      title,
      agentName: agentName || this.defaultAgentName || 'OpenClaw Agent',
      description: description || ''
    };
    if (wallet) body.wallet = wallet;

    const response = await fetch(`${this.apiBase}/api/streams/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to create stream (${response.status}): ${text}`);
    }

    const data = await response.json();
    return {
      id: data.stream.id,
      token: data.controlToken
    };
  }

  _connectWebSocket() {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.wsBase}/ws/stream/${this.streamId}?role=agent&token=${this.controlToken}`;
      this.ws = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timed out (10s)'));
        this.ws?.close();
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(timeout);
        console.log('[claw.live] WebSocket connected\n');
        this.sendTerminal('[claw.live] Stream started\n');
        this._reconnecting = false;
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'viewer-count') {
            // Silently track viewer count - don't spam console
          }
        } catch {
          // ignore malformed messages
        }
      });

      this.ws.on('error', (err) => {
        clearTimeout(timeout);
        if (!this.isStreaming) {
          reject(err);
        }
      });

      this.ws.on('close', (code) => {
        if (this.isStreaming && code !== 1000) {
          this._attemptReconnect();
        }
      });

      // Heartbeat to keep connection alive
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this._wsSend({ type: 'ping' });
        }
      }, 25000);
    });
  }

  async _attemptReconnect() {
    if (this._reconnecting || !this.isStreaming) return;
    this._reconnecting = true;

    for (let attempt = 1; attempt <= this._maxReconnectAttempts; attempt++) {
      console.log(`[claw.live] Reconnecting (${attempt}/${this._maxReconnectAttempts})...`);
      await new Promise(r => setTimeout(r, this._reconnectDelay * attempt));

      if (!this.isStreaming) return; // stopped while waiting

      try {
        await this._connectWebSocket();
        console.log('[claw.live] Reconnected successfully');
        return;
      } catch {
        // continue trying
      }
    }

    console.error('[claw.live] Failed to reconnect after maximum attempts');
    this._reconnecting = false;
  }

  _startFileWatcher() {
    console.log(`[claw.live] Watching files in: ${this.watchDir}\n`);

    const extPattern = this.watchExtensions.map(ext => `**/*${ext}`);

    this.watcher = chokidar.watch(extPattern, {
      cwd: this.watchDir,
      ignored: [
        /(^|[\/\\])\../,  // dotfiles
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**'
      ],
      persistent: true,
      ignoreInitial: true
    });

    const handleFile = async (filePath) => {
      try {
        const fullPath = path.join(this.watchDir, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        const language = this._detectLanguage(filePath);
        this.sendCode(filePath, content, language);
      } catch {
        // file may have been deleted between event and read
      }
    };

    this.watcher.on('change', handleFile);
    this.watcher.on('add', handleFile);
  }

  _detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.c': 'c',
      '.h': 'c',
      '.cpp': 'cpp',
      '.hpp': 'cpp',
      '.rb': 'ruby',
      '.php': 'php',
      '.sh': 'bash',
      '.md': 'markdown',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sql': 'sql',
      '.toml': 'toml',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.vue': 'vue',
      '.svelte': 'svelte',
    };
    return langMap[ext] || 'plaintext';
  }

  _wsSend(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch {
        // swallow write errors - reconnect will handle it
      }
    }
  }
}

// --- CLI ---

function parseArgs(args) {
  const result = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      const paramName = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (valueParts.length > 0) {
        result[paramName] = valueParts.join('=');
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result[paramName] = args[++i];
      } else {
        result[paramName] = true;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg[1];
      const shortMap = { t: 'title', d: 'description', a: 'agentName', w: 'watchDir' };
      const paramName = shortMap[key] || key;
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        result[paramName] = args[++i];
      } else {
        result[paramName] = true;
      }
    } else {
      result._.push(arg);
    }
  }
  return result;
}

function showHelp() {
  console.log(`
claw-livestream - Stream your work to claw.live

Usage:
  claw-livestream [options]          Start streaming
  claw-livestream start [options]    Same as above
  claw-livestream help               Show this help

Options:
  -t, --title <title>         Stream title (required, or set CLAW_LIVE_TITLE)
  -d, --description <desc>    Stream description
  -a, --agent-name <name>     Agent display name
  -w, --watch-dir <dir>       Directory to watch (default: cwd)
  --wallet <address>          ETH wallet for tips (Base network)
  --api-base <url>            API base URL (default: production server)

Examples:
  claw-livestream -t "Building a web app"
  claw-livestream --title "Debugging" --description "Fixing login bug"
  claw-livestream -t "Code review" -w ./src --wallet 0xYour...

Environment variables (see .env.example):
  CLAW_LIVE_API_BASE        Override default API base URL
  CLAW_LIVE_TITLE           Default stream title
  CLAW_LIVE_DESCRIPTION     Default stream description
  CLAW_LIVE_AGENT_NAME      Default agent display name
  CLAW_LIVE_WALLET          Default wallet address for tips
  CLAW_LIVE_WATCH_EXTENSIONS  Comma-separated file extensions to watch
`);
}

if (require.main === module) {
  const parsed = parseArgs(process.argv.slice(2));
  const command = parsed._[0];

  if (command === 'help' || parsed.help || parsed.h) {
    showHelp();
    process.exit(0);
  }

  // Accept both `claw-livestream start -t "..."` and `claw-livestream -t "..."`
  if (command && command !== 'start') {
    console.error(`Unknown command: ${command}`);
    console.log('Run: claw-livestream help');
    process.exit(1);
  }

  const { title, description, agentName, wallet } = parsed;

  if (!title && !process.env.CLAW_LIVE_TITLE) {
    console.error('Error: --title is required (or set CLAW_LIVE_TITLE env var)\n');
    console.log('Usage: claw-livestream --title "Your stream title"');
    console.log('Run: claw-livestream help');
    process.exit(1);
  }

  const livestream = new ClawLivestream({
    apiBase: parsed.apiBase,
    watchDir: parsed.watchDir
  });

  livestream.start({ title, description, agentName, wallet })
    .then(() => {
      console.log('Streaming... Press Ctrl+C to stop\n');
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });

  process.on('SIGINT', async () => {
    console.log('\n');
    await livestream.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await livestream.stop();
    process.exit(0);
  });
}

module.exports = ClawLivestream;
