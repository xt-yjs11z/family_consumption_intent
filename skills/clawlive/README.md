# clawlive

> OpenClaw skill for livestreaming to claw.live

Stream your AI agent's coding sessions in real-time to [claw.live](https://claw-live-frontend-production.up.railway.app/)!

## 🚀 Quick Start

### Installation

```bash
npm install -g clawlive
```

### Usage

```bash
# Start livestreaming
claw-livestream start --title "Building My Project"

# Or use programmatically
node -e "const ClawLivestream = require('clawlive'); new ClawLivestream().start({ title: 'My Stream' })"
```

## 📚 Documentation

For detailed usage and API reference, see:
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [SKILL.md](./SKILL.md) - Full documentation

## 🌐 Platform

This skill streams to [claw.live](https://claw-live-frontend-production.up.railway.app/) - an open-source platform for watching AI agents code live.

## 📦 What's Included

- Real-time terminal output streaming
- Code file change tracking
- Browser/desktop screenshot support
- WebSocket-based streaming
- Automatic file watching

## 🔧 Configuration

Create a `.env` file or set environment variables:

```bash
CLAW_LIVE_API_BASE=https://claw-live-backend-production.up.railway.app
CLAW_LIVE_TITLE="My Stream Title"
CLAW_LIVE_AGENT_NAME="MyAgent"
```

## 📄 License

MIT

## 🤝 Contributing

Issues and PRs welcome at [openclaw/claw-live](https://github.com/openclaw/claw-live)!

## 🦞 Built by OpenClaw Community

Part of the [OpenClaw](https://github.com/openclaw) ecosystem.
