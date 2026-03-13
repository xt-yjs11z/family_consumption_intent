---
name: dooray
description: "Complete Dooray email management via IMAP/SMTP using dooray-cli. Features: List/Read/Send/Reply/Forward emails, CC/BCC support, HTML mail, attachments (download & send), delete, mark read/unread, advanced search (date, sender filters). Use for any Dooray mail operations."
homepage: https://dooray.com
metadata:
  {
    "openclaw":
      {
        "emoji": "📧",
        "requires": { "bins": ["dooray-cli"] },
        "install":
          [
            {
              "id": "npm-global",
              "kind": "npm",
              "package": "dooray-mail-cli",
              "bins": ["dooray-cli"],
              "label": "Install Dooray CLI (npm)",
            },
          ],
      },
  }
---

# Dooray Email CLI

Dooray CLI is a command-line tool for managing Dooray emails using IMAP/SMTP protocols.

## Prerequisites

1. Dooray CLI installed (`dooray-cli --help` to verify)
2. Dooray email account with IMAP/SMTP access enabled
3. Configuration file setup (created via `dooray-cli config`)

## Configuration Setup

Run the interactive configuration wizard:

```bash
dooray-cli config
```

This will:
- Prompt for your Dooray email address
- Securely encrypt and store your password
- Save configuration to `~/.dooray-config.json`

**Default Dooray IMAP/SMTP settings:**
- IMAP: `imap.dooray.com:993` (SSL)
- SMTP: `smtp.dooray.com:465` (SSL)

## Common Operations

### List Recent Emails (All)

List 10 most recent emails (read and unread):

```bash
dooray-cli recent
```

Output format:
```
📬 Recent Mails (10)

1. ✓ [UID: 279] sender@example.com <sender@example.com>
   Subject: Project Update
   Date: 2026-02-09T08:29:51.000Z

2. ✓ [UID: 278] John Doe <john.doe@example.com>
   Subject: Meeting Schedule - 02.12(Thu) 03:30 PM
   Date: 2026-02-09T07:00:47.000Z
```

**✓** = Read, **●** = Unread

### List Unread Emails Only

List up to 10 most recent unread emails:

```bash
dooray-cli list
```

Output format:
```
📬 Unread Mails (3)

1. [UID: 123] sender@example.com <sender@example.com>
   Subject: Project Update
   Date: 2026-02-09T10:30:00.000Z

2. [UID: 124] colleague@example.com <colleague@example.com>
   Subject: Meeting Notes
   Date: 2026-02-09T11:15:00.000Z
```

### Read a Specific Email

Read email by UID (from list output):

```bash
dooray-cli read 123
```

### Send a New Email

**Non-interactive (recommended for automation):**

```bash
dooray-cli send --to "recipient@example.com" --subject "Subject here" --body "Message body here"
```

**Interactive mode:**

```bash
dooray-cli send
```

You'll be prompted for:
- To: recipient email address
- Subject: email subject
- Body: email content (press Ctrl+D when done)

### Reply to an Email

**Non-interactive (recommended for automation):**

```bash
dooray-cli reply 123 --body "Thank you for your email."
```

**Interactive mode:**

```bash
dooray-cli reply 123
```

**How it works:**
1. First, read the email using `dooray-cli read <uid>`
2. The email information (Message-ID, sender, subject) is cached automatically
3. Use `reply <uid>` to send a reply
4. The reply will:
   - Automatically set recipient to original sender
   - Add "Re:" prefix to subject (if not already present)
   - Include proper email threading headers (In-Reply-To, References)
   - Appear in the same conversation thread in email clients

### Forward an Email

Forward an existing email to another recipient:

```bash
dooray-cli forward 123 --to "colleague@example.com" --body "Please see below"
```

Features:
- Automatically includes original email content
- Preserves original attachments
- Adds "Fwd:" prefix to subject (if not already present)

### Delete Emails

**Move to trash:**

```bash
dooray-cli delete 123
```

**Permanently delete:**

```bash
dooray-cli delete 123 --force
```

### Mark as Read/Unread

**Mark as read:**

```bash
dooray-cli mark 123 --read
```

**Mark as unread:**

```bash
dooray-cli mark 123 --unread
```

### Send with Advanced Options

**Send with CC/BCC:**

```bash
dooray-cli send --to "user@example.com" --subject "Hello" --body "Message" --cc "cc@example.com" --bcc "bcc@example.com"
```

**Send HTML email:**

```bash
dooray-cli send --to "user@example.com" --subject "Newsletter" --html "<h1>Title</h1><p>Content</p>"
```

**Send with attachments:**

```bash
dooray-cli send --to "user@example.com" --subject "Report" --body "Please find attached" --attach "./report.pdf" --attach "./data.xlsx"
```

**Combine all options:**

```bash
dooray-cli send --to "user@example.com" --subject "Q4 Report" --body "Please review" --cc "boss@example.com" --attach "./report.pdf"
```

### Manage Attachments

**List attachments in an email:**

```bash
dooray-cli attachments 123
```

Output:
```
📎 Attachments (3)

1. document.pdf
   Type: application/pdf
   Size: 245.50 KB

2. image.png
   Type: image/png
   Size: 128.34 KB
```

**Download all attachments:**

```bash
dooray-cli download 123
```

Files are saved to: `./downloads/mail-123/`

**Download specific attachment:**

```bash
dooray-cli download 123 --file 1
```

Downloads only the first attachment.

**Custom download path:**

```bash
dooray-cli download 123 --output ./my-files
```

Files are saved to: `./my-files/mail-123/`

### Search Emails with Filters

**Search by keywords:**

```bash
dooray-cli search "meeting"
dooray-cli search "project update"
```

**Filter by sender:**

```bash
dooray-cli search "report" --from "boss@example.com"
```

**Filter by date range:**

```bash
dooray-cli search "invoice" --since "2026-01-01"
dooray-cli search "receipt" --before "2026-02-01"
```

**Combine filters:**

```bash
dooray-cli search "meeting" --from "boss@example.com" --since "2026-02-01"
```

### Check Unread Count

Get total unread email count:

```bash
dooray-cli unread
```

Output: `📬 Unread mails: 5`

### Test Connection

Verify IMAP/SMTP connection:

```bash
dooray-cli test
```

## Output Formats

All commands output to stdout with emoji indicators:

- `✅` Success
- `❌` Error
- `📬` Unread mail info
- `📧` Mail details
- `🔍` Search results

## Error Handling

Common errors:

**Configuration not found:**
```
❌ Configuration not found. Run: dooray-cli config
```
Solution: Run `dooray-cli config` to set up credentials.

**Connection failed:**
```
❌ IMAP connection failed
```
Solution: Check network, verify credentials, or run `dooray-cli test`.

**Invalid UID:**
```
❌ Usage: dooray-cli read <uid>
```
Solution: Use `dooray-cli list` to get valid UIDs.

## Tips

- UIDs are relative to the inbox folder
- Password is encrypted using AES-256 and stored locally
- Configuration file: `~/.dooray-config.json` (Windows: `%USERPROFILE%\.dooray-config.json`)
- Run `dooray-cli help` for quick reference

## Security Notes

- Never share your `.dooray-config.json` file
- Password is encrypted but stored on local filesystem
- Use app-specific passwords if 2FA is enabled on Dooray account
