---
name: postmark-webhooks
description: Use when setting up Postmark webhooks for tracking email delivery, bounces, opens, clicks, spam complaints, or subscription changes — includes webhook configuration, payload handling, and security.
---

# Postmark Webhooks

## Overview

Postmark webhooks deliver real-time event data to your endpoint via HTTP POST. Use webhooks to track what happens after you send an email.

| Event | Trigger | Common Use |
|-------|---------|------------|
| **Delivery** | Email accepted by recipient server | Confirm delivery, update status |
| **Bounce** | Email rejected by recipient server | Clean lists, alert support |
| **SpamComplaint** | Recipient marked as spam | Remove from lists, investigate |
| **Open** | Recipient opened email (tracking pixel) | Engagement analytics |
| **Click** | Recipient clicked a tracked link | Engagement analytics, conversion tracking |
| **SubscriptionChange** | Recipient unsubscribed | Update preferences, comply with regulations |

## Quick Start

1. **Create a webhook** via API or [Postmark dashboard](https://account.postmarkapp.com) (Server → Webhooks)
2. **Set your endpoint URL** — must accept HTTP POST and return 200
3. **Select event triggers** — choose which events to receive
4. **Handle payloads** — parse the JSON body for each event type
5. **Respond with 200** — acknowledge receipt immediately

## Webhook API

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhooks` | `GET` | List all webhooks for a message stream |
| `/webhooks/{webhookid}` | `GET` | Get a specific webhook |
| `/webhooks` | `POST` | Create a webhook |
| `/webhooks/{webhookid}` | `PUT` | Update a webhook |
| `/webhooks/{webhookid}` | `DELETE` | Delete a webhook |

### Create a Webhook

```javascript
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

const webhook = await client.createWebhook({
  Url: 'https://yourdomain.com/webhooks/postmark',
  MessageStream: 'outbound',
  HttpAuth: {
    Username: 'webhook-user',
    Password: 'webhook-secret'
  },
  HttpHeaders: [
    { Name: 'X-Custom-Header', Value: 'my-value' }
  ],
  Triggers: {
    Open: { Enabled: true, PostFirstOpenOnly: false },
    Click: { Enabled: true },
    Delivery: { Enabled: true },
    Bounce: { Enabled: true, IncludeContent: true },
    SpamComplaint: { Enabled: true, IncludeContent: true },
    SubscriptionChange: { Enabled: true }
  }
});

console.log('Webhook created:', webhook.ID);
```

### cURL

```bash
curl "https://api.postmarkapp.com/webhooks" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_SERVER_TOKEN" \
  -d '{
    "Url": "https://yourdomain.com/webhooks/postmark",
    "MessageStream": "outbound",
    "Triggers": {
      "Open": { "Enabled": true, "PostFirstOpenOnly": false },
      "Click": { "Enabled": true },
      "Delivery": { "Enabled": true },
      "Bounce": { "Enabled": true, "IncludeContent": true },
      "SpamComplaint": { "Enabled": true, "IncludeContent": true },
      "SubscriptionChange": { "Enabled": true }
    }
  }'
```

### Trigger Options

| Trigger | Options |
|---------|---------|
| **Open** | `Enabled`, `PostFirstOpenOnly` (true = only first open per recipient) |
| **Click** | `Enabled` |
| **Delivery** | `Enabled` |
| **Bounce** | `Enabled`, `IncludeContent` (include original email content) |
| **SpamComplaint** | `Enabled`, `IncludeContent` |
| **SubscriptionChange** | `Enabled` |

## Webhook Payloads

### Delivery

Fired when the recipient's mail server accepts the email.

```json
{
  "RecordType": "Delivery",
  "ServerID": 23,
  "MessageStream": "outbound",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "Recipient": "john@example.com",
  "Tag": "welcome-email",
  "DeliveredAt": "2025-04-05T16:33:54.9070259Z",
  "Details": "Test delivery webhook details",
  "Metadata": {
    "customer_id": "12345"
  }
}
```

### Bounce

Fired when an email is rejected.

```json
{
  "RecordType": "Bounce",
  "ID": 42,
  "Type": "HardBounce",
  "TypeCode": 1,
  "Name": "Hard bounce",
  "ServerID": 23,
  "MessageStream": "outbound",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "Tag": "welcome-email",
  "Description": "The server was unable to deliver your message (ex: unknown user, mailbox not found).",
  "Details": "smtp;550 5.1.1 The email account that you tried to reach does not exist.",
  "Email": "john@example.com",
  "From": "sender@yourdomain.com",
  "BouncedAt": "2025-04-05T16:33:54.9070259Z",
  "DumpAvailable": true,
  "Inactive": true,
  "CanActivate": true,
  "Subject": "Welcome to our service",
  "Metadata": {
    "customer_id": "12345"
  }
}
```

**Bounce Types:**

| Type | Code | Description |
|------|------|-------------|
| `HardBounce` | 1 | Permanent failure — address doesn't exist |
| `SoftBounce` | 4096 | Temporary failure — mailbox full, server down |
| `Transient` | 2 | Temporary issue — retry may succeed |
| `SpamNotification` | 512 | Marked as spam by recipient |
| `Blocked` | 16 | Blocked by recipient server |
| `DMARCPolicy` | 100000 | Rejected due to DMARC policy |

### Spam Complaint

Fired when a recipient marks your email as spam.

```json
{
  "RecordType": "SpamComplaint",
  "ID": 42,
  "Type": "SpamComplaint",
  "TypeCode": 512,
  "ServerID": 23,
  "MessageStream": "outbound",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "Tag": "welcome-email",
  "Email": "john@example.com",
  "From": "sender@yourdomain.com",
  "BouncedAt": "2025-04-05T16:33:54.9070259Z",
  "Subject": "Welcome to our service",
  "Metadata": {
    "customer_id": "12345"
  }
}
```

### Open

Fired when a recipient opens the email (requires open tracking enabled).

```json
{
  "RecordType": "Open",
  "FirstOpen": true,
  "ServerID": 23,
  "MessageStream": "outbound",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "Client": {
    "Name": "Gmail",
    "Company": "Google",
    "Family": "Gmail"
  },
  "OS": {
    "Name": "Windows 10",
    "Company": "Microsoft",
    "Family": "Windows"
  },
  "Platform": "WebMail",
  "UserAgent": "Mozilla/5.0 ...",
  "Geo": {
    "CountryISOCode": "US",
    "Country": "United States",
    "RegionISOCode": "CA",
    "Region": "California",
    "City": "San Francisco",
    "Zip": "94107",
    "Coords": "37.7749,-122.4194",
    "IP": "203.0.113.1"
  },
  "ReadSeconds": 5,
  "Recipient": "john@example.com",
  "Tag": "welcome-email",
  "ReceivedAt": "2025-04-05T16:33:54.9070259Z",
  "Metadata": {
    "customer_id": "12345"
  }
}
```

### Click

Fired when a recipient clicks a tracked link.

```json
{
  "RecordType": "Click",
  "ClickLocation": "HTML",
  "ServerID": 23,
  "MessageStream": "outbound",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "Client": {
    "Name": "Chrome",
    "Company": "Google",
    "Family": "Chrome"
  },
  "OS": {
    "Name": "macOS 14",
    "Company": "Apple",
    "Family": "macOS"
  },
  "Platform": "Desktop",
  "UserAgent": "Mozilla/5.0 ...",
  "Geo": {
    "CountryISOCode": "US",
    "Country": "United States",
    "RegionISOCode": "CA",
    "Region": "California",
    "City": "San Francisco",
    "Zip": "94107",
    "Coords": "37.7749,-122.4194",
    "IP": "203.0.113.1"
  },
  "OriginalLink": "https://yourdomain.com/pricing",
  "Recipient": "john@example.com",
  "Tag": "welcome-email",
  "ReceivedAt": "2025-04-05T16:33:54.9070259Z",
  "Metadata": {
    "customer_id": "12345"
  }
}
```

### Subscription Change

Fired when a recipient unsubscribes via the Postmark-managed unsubscribe mechanism.

```json
{
  "RecordType": "SubscriptionChange",
  "ServerID": 23,
  "MessageStream": "broadcast",
  "MessageID": "883953f4-6105-42a2-a16a-77a8eac79483",
  "ChangedAt": "2025-04-05T16:33:54.9070259Z",
  "Recipient": "john@example.com",
  "Origin": "Recipient",
  "SuppressSending": true,
  "SuppressionReason": "ManualSuppression",
  "Tag": "newsletter",
  "Metadata": {
    "customer_id": "12345"
  }
}
```

## Implementation

### Node.js / Express

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhooks/postmark', (req, res) => {
  const event = req.body;

  switch (event.RecordType) {
    case 'Delivery':
      handleDelivery(event);
      break;
    case 'Bounce':
      handleBounce(event);
      break;
    case 'SpamComplaint':
      handleSpamComplaint(event);
      break;
    case 'Open':
      handleOpen(event);
      break;
    case 'Click':
      handleClick(event);
      break;
    case 'SubscriptionChange':
      handleSubscriptionChange(event);
      break;
    default:
      console.log('Unknown event type:', event.RecordType);
  }

  // Always respond 200 immediately
  res.sendStatus(200);
});

function handleDelivery(event) {
  console.log(`Delivered to ${event.Recipient} (${event.MessageID})`);
  // Update delivery status in your database
}

function handleBounce(event) {
  console.log(`Bounce (${event.Type}) for ${event.Email}: ${event.Description}`);

  if (event.Type === 'HardBounce') {
    // Permanently remove from mailing lists
    markEmailInvalid(event.Email);
  }

  if (event.Inactive) {
    // Postmark has deactivated this recipient
    console.log(`Recipient ${event.Email} deactivated by Postmark`);
  }
}

function handleSpamComplaint(event) {
  console.log(`Spam complaint from ${event.Email}`);
  // Immediately suppress this recipient
  suppressRecipient(event.Email);
}

function handleOpen(event) {
  console.log(`Email opened by ${event.Recipient} (first: ${event.FirstOpen})`);
  // Track engagement metrics
}

function handleClick(event) {
  console.log(`Link clicked by ${event.Recipient}: ${event.OriginalLink}`);
  // Track click-through rates
}

function handleSubscriptionChange(event) {
  console.log(`Subscription change for ${event.Recipient}: suppress=${event.SuppressSending}`);
  // Update preferences in your system
}
```

### Python / Flask

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/postmark', methods=['POST'])
def handle_webhook():
    event = request.get_json()
    record_type = event.get('RecordType')

    if record_type == 'Delivery':
        handle_delivery(event)
    elif record_type == 'Bounce':
        handle_bounce(event)
    elif record_type == 'SpamComplaint':
        handle_spam_complaint(event)
    elif record_type == 'Open':
        handle_open(event)
    elif record_type == 'Click':
        handle_click(event)
    elif record_type == 'SubscriptionChange':
        handle_subscription_change(event)

    return '', 200

def handle_delivery(event):
    print(f"Delivered to {event['Recipient']} ({event['MessageID']})")

def handle_bounce(event):
    print(f"Bounce ({event['Type']}) for {event['Email']}: {event.get('Description', '')}")
    if event['Type'] == 'HardBounce':
        mark_email_invalid(event['Email'])

def handle_spam_complaint(event):
    print(f"Spam complaint from {event['Email']}")
    suppress_recipient(event['Email'])

def handle_open(event):
    print(f"Email opened by {event['Recipient']} (first: {event.get('FirstOpen', False)})")

def handle_click(event):
    print(f"Link clicked by {event['Recipient']}: {event.get('OriginalLink', '')}")

def handle_subscription_change(event):
    print(f"Subscription change for {event['Recipient']}: suppress={event.get('SuppressSending', False)}")
```

## Security

### HTTP Basic Authentication

Set credentials when creating the webhook — Postmark will include them in every request:

```javascript
const webhook = await client.createWebhook({
  Url: 'https://yourdomain.com/webhooks/postmark',
  HttpAuth: {
    Username: 'postmark-webhook',
    Password: 'your-secret-password'
  },
  // ... triggers
});
```

Validate in your endpoint:

```javascript
app.post('/webhooks/postmark', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic') return res.sendStatus(401);

  const [username, password] = Buffer.from(encoded, 'base64').toString().split(':');
  if (username !== 'postmark-webhook' || password !== 'your-secret-password') {
    return res.sendStatus(401);
  }

  // Process webhook...
  res.sendStatus(200);
});
```

### IP Whitelisting

Restrict your webhook endpoint to Postmark's IP addresses. Check [Postmark's documentation](https://postmarkapp.com/developer/webhooks/webhooks-overview) for the current IP list.

### Custom HTTP Headers

Add custom headers for additional verification:

```javascript
const webhook = await client.createWebhook({
  Url: 'https://yourdomain.com/webhooks/postmark',
  HttpHeaders: [
    { Name: 'X-Webhook-Secret', Value: 'your-shared-secret' }
  ],
  // ... triggers
});
```

## Manage Webhooks

### List Webhooks

```javascript
const webhooks = await client.getWebhooks({
  MessageStream: 'outbound'
});

webhooks.Webhooks.forEach(w => {
  console.log(`${w.ID}: ${w.Url} (stream: ${w.MessageStream})`);
});
```

### Update a Webhook

```javascript
await client.editWebhook(webhookId, {
  Url: 'https://yourdomain.com/webhooks/postmark-v2',
  Triggers: {
    Open: { Enabled: true, PostFirstOpenOnly: true },
    Click: { Enabled: true },
    Delivery: { Enabled: true },
    Bounce: { Enabled: true, IncludeContent: false },
    SpamComplaint: { Enabled: true },
    SubscriptionChange: { Enabled: true }
  }
});
```

### Delete a Webhook

```javascript
await client.deleteWebhook(webhookId);
```

## Bounce Management

Webhooks work alongside the Bounces API for comprehensive bounce handling:

### Check Delivery Statistics

```javascript
const stats = await client.getDeliveryStatistics();
console.log('Inactive mails:', stats.InactiveMails);
console.log('Bounces:', stats.Bounces);
```

### Reactivate a Bounced Recipient

If a bounce was temporary or resolved:

```javascript
const result = await client.activateBounce(bounceId);
console.log('Reactivated:', result.Message);
```

### Suppression Management

Manage suppressed recipients per message stream:

```javascript
// List suppressions
const suppressions = await client.getSuppressions('outbound');

// Manually suppress a recipient
await client.createSuppressions('outbound', {
  Suppressions: [
    { EmailAddress: 'user@example.com' }
  ]
});

// Remove a suppression
await client.deleteSuppressions('outbound', {
  Suppressions: [
    { EmailAddress: 'user@example.com' }
  ]
});
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Not responding 200 | Always return HTTP 200 — even if processing fails. Process asynchronously. |
| Slow webhook handling | Respond 200 immediately, then process in background (queue, worker) |
| No authentication | Use HTTP Basic Auth or custom headers to verify webhook source |
| Ignoring bounce types | Handle `HardBounce` differently from `SoftBounce` — hard bounces require permanent suppression |
| Not handling partial data | Some fields may be missing — always check for presence before accessing |
| Duplicate handling | Webhooks may be delivered more than once — use `MessageID` for deduplication |
| Missing MessageStream filter | Specify `MessageStream` when creating webhooks to avoid cross-stream events |
| Not tracking metadata | Include `Metadata` when sending to correlate webhook events with your records |

## Notes

- Webhooks are configured per message stream — create separate webhooks for `outbound` and `broadcast`
- Always respond HTTP 200 immediately — process webhook data asynchronously
- Postmark retries failed webhook deliveries up to **10 times** over ~10.5 hours with escalating intervals: 1 min, 5 min, 10 min, 10 min, 10 min, 15 min, 30 min, 1 hr, 2 hrs, 6 hrs. A **403 response** immediately stops all retries. This retry schedule cannot be customized
- Use `MessageID` to correlate webhook events with sent emails
- `Metadata` from the original send is included in all webhook payloads
- Open tracking requires a tracking pixel in HTML — it does not work with plain text emails
- Click tracking requires `TrackLinks` to be enabled on the sent email
- Bounce webhooks fire for bounces and blocks — check the `Type` field to distinguish
- Spam complaints, unsubscribes, and manual deactivations have their own event types (not Bounce)
- Individual open/click data is stored for 45 days; aggregated statistics are stored indefinitely
