# Dooray Mail CLI

[![npm version](https://img.shields.io/npm/v/dooray-mail-cli.svg)](https://www.npmjs.com/package/dooray-mail-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dooray mail CLI for OpenClaw - IMAP/SMTP integration

## 🚀 Installation

```bash
npm install -g dooray-mail-cli
```

## 📖 Usage

### Setup
```bash
dooray-cli config  # Configure email account
```

### Check Emails
```bash
dooray-cli recent  # List 10 recent mails
dooray-cli list    # List unread mails only
dooray-cli read 123  # Read specific mail by UID
```

### Send & Reply
```bash
dooray-cli send --to "user@example.com" --subject "Hello" --body "Message"
dooray-cli send --to "user@example.com" --subject "Hello" --body "Message" --cc "cc@example.com" --attach "./file.pdf"
dooray-cli send --to "user@example.com" --subject "Hello" --html "<h1>Title</h1>"
dooray-cli reply 123 --body "Thank you!"  # Reply to mail UID 123
dooray-cli forward 123 --to "another@example.com" --body "FYI"
```

### Manage Emails
```bash
dooray-cli delete 123        # Move to trash
dooray-cli delete 123 --force  # Permanently delete
dooray-cli mark 123 --read   # Mark as read
dooray-cli mark 123 --unread # Mark as unread
```

### Attachments
```bash
dooray-cli attachments 123          # List attachments
dooray-cli download 123             # Download all
dooray-cli download 123 --file 1    # Download specific file
dooray-cli download 123 --output ./my-files  # Custom output path
```

### Search with Filters
```bash
dooray-cli search "keyword"  # Search by keyword
dooray-cli search "meeting" --from "boss@example.com"  # Filter by sender
dooray-cli search "report" --since "2026-01-01"        # Filter by date
dooray-cli search "invoice" --before "2026-02-01"      # Before date
```

### Other Commands
```bash
dooray-cli unread  # Show unread count
dooray-cli test    # Test IMAP/SMTP connection
dooray-cli help    # Show all commands
```

## 🔧 Features

- ✅ IMAP/SMTP mail operations
- ✅ Read/Send/Reply/Forward emails
- ✅ **Email threading support** (Reply with In-Reply-To headers)
- ✅ **CC/BCC support** (v0.2.0+)
- ✅ **HTML mail support** (v0.2.0+)
- ✅ **Attachments management** (List & Download) (v0.1.3+)
- ✅ **Send with attachments** (v0.2.0+)
- ✅ **Delete & Mark as read/unread** (v0.2.0+)
- ✅ **Advanced search filters** (Date, Sender) (v0.2.0+)
- ✅ AES-256 password encryption
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ OpenClaw Skill integration

## 📋 Requirements

- Node.js 14+
- Dooray email account with IMAP/SMTP access

**Default Dooray Settings:**
- IMAP: `imap.dooray.com:993` (SSL)
- SMTP: `smtp.dooray.com:465` (SSL)

## 🔒 Security

- Passwords are encrypted with AES-256
- Configuration stored locally: `~/.dooray-config.json`
- Mail cache for replies: `~/.dooray-mail-cache.json`

## 📚 Documentation

See [SKILL.md](./SKILL.md) for detailed command reference and OpenClaw integration guide.

## 📝 License

MIT

## 🤝 Contributing

Issues and pull requests are welcome!

## 📦 Package

- npm: https://www.npmjs.com/package/dooray-mail-cli
