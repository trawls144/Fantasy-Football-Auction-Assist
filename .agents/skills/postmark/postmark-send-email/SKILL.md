---
name: postmark-send-email
description: Use when sending transactional or broadcast emails through Postmark — single sends, batch (up to 500), bulk, or template-based emails with support for attachments, tracking, and message streams.
---

# Send Email with Postmark

## Overview

Postmark provides multiple endpoints for sending emails:

| Approach | Endpoint | Use Case | Limits |
|----------|----------|----------|--------|
| **Single** | `POST /email` | Individual transactional emails | 1 email, 10 MB payload including attachments |
| **Batch** | `POST /email/batch` | Up to 500 emails in one request | 500 emails, 50 MB payload including attachments |
| **Template** | `POST /email/withTemplate` | Dynamic content with server-side templates | 1 email, 10 MB payload including attachments |
| **Batch Template** | `POST /email/batchWithTemplates` | Bulk templated emails | 500 emails, 50 MB payload including attachments |
| **Bulk** | `POST /email/bulk` | Broadcast stream campaigns | No fixed recipient cap, 50 MB payload including attachments |

**Choose batch when:**
- Sending 2+ distinct emails at once
- Performance matters (fewer API calls)
- Attachments needed (Postmark supports batch attachments)

**Choose single when:**
- Sending one email
- Simplicity is preferred
- Real-time error handling needed per message

## Message Streams (CRITICAL)

Postmark separates emails by intent. **Always specify MessageStream**:

| Stream | Value | Purpose | SMTP Endpoint |
|--------|-------|---------|---------------|
| **Transactional** | `outbound` | 1:1 triggered emails (default) | smtp.postmarkapp.com |
| **Broadcast** | `broadcast` | Marketing, newsletters | smtp-broadcasts.postmarkapp.com |

```json
{
  "MessageStream": "outbound"
}
```

**Why this matters:**
- Different reputation tracking per stream
- Broadcast requires proper unsubscribe handling
- Mixing streams damages transactional deliverability
- Servers can have up to 10 message streams

## Quick Start

1. **Get API Token** from your [Postmark server settings](https://account.postmarkapp.com/servers)
2. **Verify sender** domain or email address
3. **Install SDK** (preferred) or use cURL — see [references/installation.md](references/installation.md)
4. **Choose endpoint** based on decision matrix above

## Authentication

All API requests require the Server API Token:

```
X-Postmark-Server-Token: your-server-token-here
```

Store the token in the `POSTMARK_SERVER_TOKEN` environment variable. For testing without sending, use `POSTMARK_API_TEST` as the token value.

## Single Email

**Endpoint:** `POST https://api.postmarkapp.com/email`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `From` | string | Sender address (must be a verified domain or sender signature) |
| `To` | string | Recipients (comma-separated, max 50 total with Cc/Bcc) |
| `Subject` | string | Email subject line |
| `TextBody` or `HtmlBody` | string | Message content (at least one required) |

### Optional Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `Cc` | string | CC recipients |
| `Bcc` | string | BCC recipients |
| `ReplyTo` | string | Reply-to address |
| `MessageStream` | string | `outbound` (default) or `broadcast` |
| `Tag` | string | Category for statistics (one per message, max 1000 chars) |
| `Metadata` | object | Key-value pairs for custom tracking data |
| `TrackOpens` | boolean | Enable open tracking |
| `TrackLinks` | string | `None`, `HtmlAndText`, `HtmlOnly`, `TextOnly` |
| `Headers` | array | Custom email headers `[{Name, Value}]` |
| `Attachments` | array | File attachments (max 10 MB total) |

### Node.js Example

```javascript
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

const result = await client.sendEmail({
  From: 'notifications@yourdomain.com',
  To: 'customer@example.com',
  Subject: 'Your order has shipped',
  TextBody: 'Your order #12345 is on its way!',
  HtmlBody: '<p>Your order <strong>#12345</strong> is on its way!</p>',
  MessageStream: 'outbound',
  Tag: 'order-shipped'
});

console.log('MessageID:', result.MessageID);
```

### Python Example

```python
from postmarker.core import PostmarkClient

postmark = PostmarkClient(server_token='your-server-token')

result = postmark.emails.send(
    From='notifications@yourdomain.com',
    To='customer@example.com',
    Subject='Your order has shipped',
    TextBody='Your order #12345 is on its way!',
    HtmlBody='<p>Your order <strong>#12345</strong> is on its way!</p>',
    MessageStream='outbound',
    Tag='order-shipped'
)

print('MessageID:', result['MessageID'])
```

### cURL Example

```bash
curl "https://api.postmarkapp.com/email" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_SERVER_TOKEN" \
  -d '{
    "From": "sender@yourdomain.com",
    "To": "receiver@example.com",
    "Subject": "Hello from Postmark",
    "TextBody": "Hello dear Postmark user.",
    "HtmlBody": "<html><body><strong>Hello</strong> dear Postmark user.</body></html>",
    "MessageStream": "outbound"
  }'
```

### Response Format

```json
{
  "ErrorCode": 0,
  "Message": "OK",
  "MessageID": "b7bc2f4a-e38e-4336-af7d-e6c392c2f817",
  "SubmittedAt": "2024-11-26T12:01:05.1794748-05:00",
  "To": "receiver@example.com"
}
```

Use `MessageID` for tracking via webhooks or the Messages API.

See [references/single-email-examples.md](references/single-email-examples.md) for all SDK examples.

## Batch Email

**Endpoint:** `POST https://api.postmarkapp.com/email/batch`

Send up to **500 emails** in a single API call. Each message is independently validated and can have its own attachments, tags, and metadata.

### Batch Format

Send an array of message objects (same parameters as single email):

```json
[
  {
    "From": "sender@yourdomain.com",
    "To": "user1@example.com",
    "Subject": "Order Shipped",
    "TextBody": "Your order has shipped!",
    "MessageStream": "outbound",
    "Tag": "order-shipped"
  },
  {
    "From": "sender@yourdomain.com",
    "To": "user2@example.com",
    "Subject": "Order Confirmed",
    "TextBody": "Your order is confirmed!",
    "MessageStream": "outbound",
    "Tag": "order-confirmed",
    "Attachments": [
      {
        "Name": "invoice.pdf",
        "Content": "base64-encoded-content",
        "ContentType": "application/pdf"
      }
    ]
  }
]
```

### Batch Response

Returns an array with individual results — mixed success/failure is possible:

```json
[
  {
    "ErrorCode": 0,
    "Message": "OK",
    "MessageID": "b7bc2f4a-e38e-4336-af7d-e6c392c2f817",
    "SubmittedAt": "2024-11-26T12:01:05.1794748-05:00",
    "To": "user1@example.com"
  },
  {
    "ErrorCode": 406,
    "Message": "Inactive recipient"
  }
]
```

### Node.js Example

```javascript
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

const results = await client.sendEmailBatch([
  {
    From: 'sender@yourdomain.com',
    To: 'user1@example.com',
    Subject: 'Welcome!',
    TextBody: 'Welcome to our service.',
    MessageStream: 'outbound'
  },
  {
    From: 'sender@yourdomain.com',
    To: 'user2@example.com',
    Subject: 'Welcome!',
    TextBody: 'Welcome to our service.',
    MessageStream: 'outbound'
  }
]);

// Check individual results — always handle partial failures
results.forEach((result, index) => {
  if (result.ErrorCode === 0) {
    console.log(`Email ${index + 1} sent: ${result.MessageID}`);
  } else {
    console.error(`Email ${index + 1} failed: ${result.Message}`);
  }
});
```

### Chunking Large Batches

For more than 500 emails, split into chunks:

```javascript
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const emails = [/* array of 2000+ email objects */];
const chunks = chunkArray(emails, 500);

for (const chunk of chunks) {
  const results = await client.sendEmailBatch(chunk);
  // Process results...
}
```

See [references/batch-email-examples.md](references/batch-email-examples.md) for more batch patterns.

## Send with Template

**Endpoint:** `POST https://api.postmarkapp.com/email/withTemplate`

Use server-side Handlebars templates for dynamic content — no client-side rendering needed.

### Using Template ID

```json
{
  "From": "sender@yourdomain.com",
  "To": "receiver@example.com",
  "TemplateId": 12345,
  "TemplateModel": {
    "name": "John Doe",
    "product_name": "Awesome Product",
    "order_id": "ORD-12345"
  },
  "MessageStream": "outbound"
}
```

### Using Template Alias

Use alias instead of ID for easier management across environments:

```json
{
  "From": "sender@yourdomain.com",
  "To": "receiver@example.com",
  "TemplateAlias": "welcome-email",
  "TemplateModel": {
    "name": "John Doe"
  },
  "MessageStream": "outbound"
}
```

### Node.js Example

```javascript
const result = await client.sendEmailWithTemplate({
  From: 'sender@yourdomain.com',
  To: 'customer@example.com',
  TemplateAlias: 'order-confirmation',
  TemplateModel: {
    customer_name: 'Jane Doe',
    order_number: 'ORD-67890',
    items: [
      { name: 'Widget', price: '$19.99' },
      { name: 'Gadget', price: '$29.99' }
    ]
  },
  MessageStream: 'outbound'
});
```

### Batch with Templates

**Endpoint:** `POST https://api.postmarkapp.com/email/batchWithTemplates`

```javascript
const results = await client.sendEmailBatchWithTemplates([
  {
    From: 'sender@yourdomain.com',
    To: 'user1@example.com',
    TemplateAlias: 'welcome-email',
    TemplateModel: { name: 'User 1' },
    MessageStream: 'outbound'
  },
  {
    From: 'sender@yourdomain.com',
    To: 'user2@example.com',
    TemplateAlias: 'welcome-email',
    TemplateModel: { name: 'User 2' },
    MessageStream: 'outbound'
  }
]);
```

See [references/template-examples.md](references/template-examples.md) for Handlebars syntax and more examples.

## Attachments

Include attachments by adding Base64-encoded content:

```json
{
  "Attachments": [
    {
      "Name": "invoice.pdf",
      "Content": "base64-encoded-content-here",
      "ContentType": "application/pdf"
    }
  ]
}
```

### Inline Images

Embed images in HTML using Content-ID:

```json
{
  "HtmlBody": "<img src=\"cid:logo123\">",
  "Attachments": [
    {
      "Name": "logo.png",
      "Content": "base64-encoded-image",
      "ContentType": "image/png",
      "ContentID": "cid:logo123"
    }
  ]
}
```

### Size Limits

- Individual TextBody/HtmlBody: **5 MB** each
- Total message with attachments: **10 MB**
- Batch payload total: **50 MB**
- Base64 encoding increases file size ~33%
- Certain file types are blocked for security (e.g., .exe, .bat)

## Tracking (Opens & Clicks)

Configure per-email or at server level:

```json
{
  "TrackOpens": true,
  "TrackLinks": "HtmlAndText"
}
```

**TrackLinks options:** `None` | `HtmlAndText` | `HtmlOnly` | `TextOnly`

**Best practice:** Disable tracking for sensitive transactional emails (password resets, security alerts) to maximize deliverability.

## Testing

### Safe Testing Options

| Method | Address/Token | Result |
|--------|---------------|--------|
| **API Test Token** | `POSTMARK_API_TEST` | Validates request without sending |
| **Black Hole** | `test@blackhole.postmarkapp.com` | Dropped but appears in activity |
| **Sandbox Server** | Create sandbox server in dashboard | Full processing, no delivery |
| **Bounce Testing** | `hardbounce@bounce-testing.postmarkapp.com` | Simulates hard bounce |

**NEVER** test with fake addresses at real providers (e.g., test@gmail.com) — this damages sender reputation.

### Bounce Test Addresses

| Type | Address |
|------|---------|
| Hard Bounce | `hardbounce@bounce-testing.postmarkapp.com` |
| Soft Bounce | `softbounce@bounce-testing.postmarkapp.com` |

## Error Handling

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 401 | Unauthorized | Check API token — do not retry |
| 406 | Inactive recipient | Check suppression list — do not retry |
| 409 | JSON required | Fix `Accept`/`Content-Type` headers |
| 410 | Too many batch messages | Reduce to 500 or fewer per batch |
| 413 | Payload too large | Reduce payload (10 MB single, 50 MB batch) |
| 422 | Validation error | Fix request parameters — do not retry |
| 429 | Rate limited | Retry with exponential backoff |
| 500 | Server error | Retry with exponential backoff |

### Retry Strategy

```javascript
async function sendWithRetry(client, email, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.sendEmail(email);
    } catch (error) {
      const isRetryable = error.statusCode === 429 || error.statusCode === 500;
      if (!isRetryable || attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
}
```

See [references/error-handling.md](references/error-handling.md) for complete error patterns.

## Tags and Metadata

### Tags

Postmark uses **one tag per message** (max 1000 characters):

```json
{
  "Tag": "password-reset"
}
```

Use tags for filtering in the dashboard and stats API. Use consistent naming conventions.

### Metadata

Add custom tracking data without affecting delivery:

```json
{
  "Metadata": {
    "customer_id": "12345",
    "order_id": "67890",
    "campaign": "welcome-series"
  }
}
```

Metadata is included in webhook payloads for correlation.

## Domain Warm-up

New domains must gradually increase sending volume:

| Day | Max/Day | Max/Hour |
|-----|---------|----------|
| 1 | 150 | — |
| 2 | 250 | — |
| 3 | 400 | — |
| 4 | 700 | 50 |
| 5 | 1,000 | 75 |
| 6 | 1,500 | 100 |
| 7 | 2,000 | 150 |

**Monitor:** Keep bounce rate < 4% and spam complaint rate < 0.08%.

## SMTP Migration

Migrating from SMTP? Postmark supports both API and SMTP:

- **Host:** `smtp.postmarkapp.com` (transactional) or `smtp-broadcasts.postmarkapp.com` (broadcast)
- **Ports:** 25, 2525, or 587 (all support TLS)
- **Username/Password:** Your Server API Token

**Custom headers via SMTP:**
```
X-PM-Message-Stream: outbound
X-PM-Tag: welcome-email
X-PM-Track-Opens: true
X-PM-Track-Links: HtmlAndText
X-PM-Metadata-customer-id: 12345
```

See [references/smtp-migration.md](references/smtp-migration.md) for a complete migration guide.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing MessageStream | Always specify `outbound` or `broadcast` |
| Using broadcast for transactional | Use separate streams for different email types |
| Testing with real addresses | Use `POSTMARK_API_TEST` or sandbox mode |
| Retrying 422 errors | These are validation errors — fix request, don't retry |
| Not handling partial batch failures | Check each result in batch response array |
| Tracking on sensitive transactional emails | Disable for password resets, security alerts, receipts |
| Exceeding 50 recipients per email | Split into multiple emails or use batch |
| Not verifying sender | Domain or address must be verified before sending |

## Notes

- `From` address must use a verified domain or sender signature
- Store API key in `POSTMARK_SERVER_TOKEN` environment variable
- Maximum 50 recipients total per email (To + Cc + Bcc)
- Base64 encoding increases attachment size ~33%
- `MessageID` returned in response is used for bounce/webhook/API correlation
- For broadcast campaigns to large lists, use the Bulk API endpoint (`POST /email/bulk`)
- The API test token `POSTMARK_API_TEST` validates requests without sending — use it in development and CI
