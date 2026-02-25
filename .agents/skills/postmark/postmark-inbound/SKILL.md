---
name: postmark-inbound
description: Use when processing incoming emails with Postmark inbound webhooks — building reply-by-email, email-to-ticket, document extraction, or any workflow that receives and parses email.
---

# Process Inbound Email with Postmark

## Overview

Postmark's inbound processing parses incoming emails and delivers them as structured JSON to your webhook endpoint. This enables workflows like:

- **Reply-by-email** — Threading replies back to conversations
- **Email-to-ticket** — Converting emails into support tickets
- **Document extraction** — Processing email attachments automatically
- **Command processing** — Parsing structured data from emails
- **Forwarding/routing** — Routing emails to different services based on content

## How It Works

1. **Configure** an inbound address or domain in your Postmark server
2. **Set webhook URL** where Postmark will POST parsed email data
3. **Receive JSON** — Postmark processes the raw email and delivers structured data
4. **Respond with 200** — Your endpoint must return HTTP 200 to acknowledge receipt

```
Sender → Email → Postmark → Parses email → POST JSON → Your webhook endpoint
```

## Quick Start

1. **Set up inbound domain** — Configure MX records or email forwarding for your domain
2. **Set webhook URL** — In your Postmark server settings, set the Inbound webhook URL
3. **Build your endpoint** — Create an HTTP POST handler that accepts the inbound JSON payload
4. **Return 200** — Always respond with HTTP 200 to confirm receipt

### Error Handling and Retries

If your endpoint returns a **non-200 status code**, Postmark will automatically retry delivery up to **10 times** over approximately **10.5 hours** with escalating intervals:

| Retry | Interval After Previous Attempt |
|-------|-------------------------------|
| 1 | 1 minute |
| 2 | 5 minutes |
| 3 | 10 minutes |
| 4 | 10 minutes |
| 5 | 10 minutes |
| 6 | 15 minutes |
| 7 | 30 minutes |
| 8 | 1 hour |
| 9 | 2 hours |
| 10 | 6 hours |

**Important:** A **403 response** immediately stops all retries — Postmark interprets this as intentional rejection. After all retries are exhausted, the message is marked as "Failed" and appears as an "Inbound Error" in your activity page. You can manually retry failed messages via the API (`PUT /messages/inbound/{messageid}/retry`).

## Inbound Configuration

### Option 1: MX Record (Recommended)

Point your domain's MX records to Postmark:

```
MX  inbound.postmarkapp.com  priority 10
```

This routes all email for the domain through Postmark.

### Option 2: Email Forwarding

Forward a specific address to your Postmark inbound address. Your server's inbound address is shown in the Postmark dashboard under **Server → Inbound**.

### Constraints

- **One Inbound Stream** per server
- **One domain** per Inbound Stream
- **One webhook URL** per Inbound Message Stream
- The same server can handle both Inbound and Outbound email

## Webhook Payload

When an email arrives, Postmark POSTs JSON to your webhook URL:

```json
{
  "FromName": "John Doe",
  "MessageStream": "inbound",
  "From": "john@example.com",
  "FromFull": {
    "Email": "john@example.com",
    "Name": "John Doe",
    "MailboxHash": ""
  },
  "To": "support+ticket-456@yourdomain.com",
  "ToFull": [
    {
      "Email": "support+ticket-456@yourdomain.com",
      "Name": "",
      "MailboxHash": "ticket-456"
    }
  ],
  "Cc": "",
  "CcFull": [],
  "Bcc": "",
  "BccFull": [],
  "OriginalRecipient": "support+ticket-456@yourdomain.com",
  "Subject": "Re: Issue with my order",
  "MessageID": "73e6d360-66eb-11e1-8e72-a8206ea7d3ea",
  "ReplyTo": "",
  "MailboxHash": "ticket-456",
  "Date": "Thu, 5 Apr 2025 16:59:01 +0200",
  "TextBody": "I still haven't received my order.",
  "HtmlBody": "<p>I still haven't received my order.</p>",
  "StrippedTextReply": "I still haven't received my order.",
  "Tag": "",
  "Headers": [
    {
      "Name": "Received",
      "Value": "by mx.postmarkapp.com ..."
    },
    {
      "Name": "Message-ID",
      "Value": "<CAExample123@mail.example.com>"
    }
  ],
  "Attachments": [
    {
      "Name": "screenshot.png",
      "Content": "base64-encoded-content",
      "ContentType": "image/png",
      "ContentLength": 45892,
      "ContentID": ""
    }
  ]
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `From` | string | Sender email address |
| `FromName` | string | Sender display name |
| `FromFull` | object | Full sender details including MailboxHash |
| `To` | string | Recipient address (your inbound address) |
| `ToFull` | array | Full recipient details with MailboxHash |
| `Subject` | string | Email subject line |
| `TextBody` | string | Plain text body |
| `HtmlBody` | string | HTML body |
| `StrippedTextReply` | string | Just the reply text, without quoted content |
| `MailboxHash` | string | The `+` hash portion of the address (e.g., `ticket-456` from `support+ticket-456@...`) |
| `MessageID` | string | Unique Postmark message identifier |
| `Date` | string | When the email was sent |
| `Headers` | array | All email headers `[{Name, Value}]` |
| `Attachments` | array | File attachments with Base64 content |

## MailboxHash for Routing

Use `+` addressing (plus addressing) to route emails to specific handlers:

```
support+ticket-456@yourdomain.com    → MailboxHash: "ticket-456"
notifications+order-789@yourdomain.com → MailboxHash: "order-789"
app+user-action@yourdomain.com       → MailboxHash: "user-action"
```

This is the primary mechanism for threading replies back to conversations or routing to specific records.

## Implementation Examples

### Node.js / Express

```javascript
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/webhooks/inbound', (req, res) => {
  const inbound = req.body;

  console.log('From:', inbound.From);
  console.log('Subject:', inbound.Subject);
  console.log('MailboxHash:', inbound.MailboxHash);
  console.log('Text:', inbound.StrippedTextReply || inbound.TextBody);
  console.log('Attachments:', inbound.Attachments?.length || 0);

  // Route based on MailboxHash
  if (inbound.MailboxHash) {
    handleThreadedReply(inbound.MailboxHash, inbound);
  } else {
    handleNewInbound(inbound);
  }

  // Always respond 200 to acknowledge receipt
  res.sendStatus(200);
});

function handleThreadedReply(hash, inbound) {
  // Parse the hash to find the related record
  // e.g., "ticket-456" → look up ticket #456
  const [type, id] = hash.split('-');
  console.log(`Threaded reply for ${type} #${id}`);
}

function handleNewInbound(inbound) {
  // Handle new inbound emails without a hash
  console.log('New inbound email from:', inbound.From);
}
```

### Python / Flask

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/inbound', methods=['POST'])
def handle_inbound():
    inbound = request.get_json()

    print(f"From: {inbound['From']}")
    print(f"Subject: {inbound['Subject']}")
    print(f"MailboxHash: {inbound.get('MailboxHash', '')}")
    print(f"Text: {inbound.get('StrippedTextReply') or inbound.get('TextBody')}")

    attachments = inbound.get('Attachments', [])
    print(f"Attachments: {len(attachments)}")

    # Route based on MailboxHash
    mailbox_hash = inbound.get('MailboxHash', '')
    if mailbox_hash:
        handle_threaded_reply(mailbox_hash, inbound)
    else:
        handle_new_inbound(inbound)

    return '', 200

def handle_threaded_reply(hash_value, inbound):
    parts = hash_value.split('-', 1)
    if len(parts) == 2:
        record_type, record_id = parts
        print(f"Threaded reply for {record_type} #{record_id}")

def handle_new_inbound(inbound):
    print(f"New inbound email from: {inbound['From']}")
```

### Processing Attachments

```javascript
const fs = require('fs');
const path = require('path');

function processAttachments(inbound) {
  if (!inbound.Attachments || inbound.Attachments.length === 0) return [];

  return inbound.Attachments.map(attachment => {
    // Decode Base64 content
    const buffer = Buffer.from(attachment.Content, 'base64');

    // Save to disk (or upload to cloud storage)
    const filePath = path.join('/tmp/attachments', attachment.Name);
    fs.writeFileSync(filePath, buffer);

    return {
      name: attachment.Name,
      contentType: attachment.ContentType,
      size: attachment.ContentLength,
      path: filePath,
      isInline: !!attachment.ContentID
    };
  });
}
```

## Reply-by-Email Pattern

A complete reply-by-email implementation:

### 1. Send the Original Email with a Reply Address

```javascript
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

// When sending the original email, set ReplyTo with a hash
await client.sendEmail({
  From: 'support@yourdomain.com',
  To: 'customer@example.com',
  ReplyTo: `support+ticket-${ticketId}@yourdomain.com`,
  Subject: `[Ticket #${ticketId}] We received your request`,
  TextBody: 'We are looking into your issue...',
  MessageStream: 'outbound'
});
```

### 2. Handle the Reply via Inbound Webhook

```javascript
app.post('/webhooks/inbound', (req, res) => {
  const { MailboxHash, StrippedTextReply, TextBody, From, Attachments } = req.body;

  if (MailboxHash && MailboxHash.startsWith('ticket-')) {
    const ticketId = MailboxHash.replace('ticket-', '');

    addReplyToTicket(ticketId, {
      from: From,
      body: StrippedTextReply || TextBody,
      attachments: Attachments || []
    });
  }

  res.sendStatus(200);
});
```

## Inbound Rules

Manage inbound rules to block unwanted messages by email address or domain.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/triggers/inboundrules` | `GET` | List inbound rules |
| `/triggers/inboundrules` | `POST` | Create an inbound rule |
| `/triggers/inboundrules/{ruleid}` | `DELETE` | Delete an inbound rule |

### Create a Block Rule

```bash
curl "https://api.postmarkapp.com/triggers/inboundrules" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_SERVER_TOKEN" \
  -d '{"Rule": "spammer@example.com"}'
```

Rules accept exact email addresses or entire domains (e.g., `spamdomain.com`).

## Messages API (Inbound)

Query and manage processed inbound messages:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /messages/inbound` | GET | Search inbound messages |
| `GET /messages/inbound/{messageid}/details` | GET | Get full inbound message details |
| `PUT /messages/inbound/{messageid}/bypass` | PUT | Bypass rules for a blocked message |
| `PUT /messages/inbound/{messageid}/retry` | PUT | Retry a failed inbound webhook delivery |

### Search Inbound Messages

```bash
curl "https://api.postmarkapp.com/messages/inbound?count=50&offset=0" \
  -H "Accept: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_SERVER_TOKEN"
```

## Webhook Retries

- Postmark retries if your endpoint does not return HTTP 200
- A **403 response** stops all retries immediately
- Up to **10 retries** with growing intervals
- Use the Messages API to manually retry failed deliveries

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Not returning HTTP 200 | Always respond 200 — even if you process asynchronously |
| Returning 403 accidentally | This permanently stops retries for that message |
| Not parsing MailboxHash | Use `+` addressing for routing — it's the primary threading mechanism |
| Using `TextBody` instead of `StrippedTextReply` | `StrippedTextReply` removes quoted content from replies |
| No size limit on body parser | Set body parser limit to `50mb` for messages with attachments |
| Slow webhook processing | Process async (queue the work) and respond 200 immediately |
| Ignoring `ContentID` on attachments | Attachments with `ContentID` are inline images, not standalone files |

## Notes

- One Inbound Stream per server — use separate servers for different inbound domains
- Inbound webhook payloads can be large due to attachments — set appropriate body size limits
- `StrippedTextReply` strips quoted content, giving you just the new reply text
- The `MailboxHash` field is the portion after `+` in the recipient address — use it for routing
- Headers array contains all original email headers for advanced processing
- Same server can handle both inbound and outbound email
- Inbound processing is separate from outbound — different streams, different configuration
