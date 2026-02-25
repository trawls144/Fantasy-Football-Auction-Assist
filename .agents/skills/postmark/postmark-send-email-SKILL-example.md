---
name: postmark-send-email
description: Send emails through Postmark API - single, batch, bulk, and templates. Supports transactional and broadcast message streams, error handling, retry logic, and deliverability best practices.
license: MIT
metadata:
  author: postmark
  version: "1.0"
---

# Send Email with Postmark

## Overview

Postmark provides multiple endpoints for sending emails:

| Approach | Endpoint | Use Case | Max Recipients |
|----------|----------|----------|----------------|
| **Single** | `POST /email` | Individual transactional emails | 50 per email |
| **Batch** | `POST /email/batch` | Up to 500 emails in one request | 50 per email |
| **Template** | `POST /email/withTemplate` | Dynamic content with templates | 50 per email |
| **Batch Template** | `POST /email/batchWithTemplates` | Bulk templated emails | 50 per email |
| **Bulk** | `POST /email/bulk` | Broadcast stream campaigns | Varies |

**Choose batch when:**
- Sending 2+ distinct emails at once
- Performance matters (fewer API calls)
- Attachments needed (unlike Resend, Postmark supports batch attachments)

**Choose single when:**
- Sending one email
- Simplicity is preferred
- Real-time error handling needed

## Message Streams (CRITICAL)

Postmark separates emails by intent. **Always specify MessageStream**:

| Stream | Value | Purpose | SMTP Endpoint |
|--------|-------|---------|---------------|
| **Transactional** | `outbound` | 1:1 triggered emails (default) | smtp.postmarkapp.com |
| **Broadcast** | `broadcast` | Marketing, newsletters | smtp-broadcasts.postmarkapp.com |

```json
{
  "MessageStream": "outbound",  // Transactional (password reset, receipts)
  "MessageStream": "broadcast"  // Marketing (newsletters, announcements)
}
```

**Why this matters:**
- Different reputation tracking per stream
- Broadcast requires proper unsubscribe handling
- Mixing streams damages transactional deliverability

## Quick Start

1. **Get API Token** from your Postmark server settings
2. **Verify sender** domain or email address
3. **Install SDK** (preferred) or use cURL
4. **Choose endpoint** based on decision matrix above

## Authentication

All API requests require the Server API Token:

```bash
X-Postmark-Server-Token: your-server-token-here
```

For testing without sending: use `POSTMARK_API_TEST` as token.

## Best Practices (Critical for Production)

### Error Handling

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 401 | Unauthorized | Check API token, don't retry |
| 406 | Inactive recipient | Check suppression list, don't retry |
| 422 | Validation error | Fix request parameters, don't retry |
| 429 | Rate limited | Retry with exponential backoff |
| 500 | Server error | Retry with exponential backoff |

### Retry Strategy

- **Backoff:** Exponential (1s, 2s, 4s...)
- **Max retries:** 3-5 for most use cases
- **Only retry:** 429 (rate limit) and 500 (server error)
- **Note:** Postmark handles rate limiting automatically for optimal deliverability

### Tags

Postmark uses **one tag per message** (unlike Resend's multiple tags):

```json
{
  "Tag": "password-reset"
}
```

- Maximum 1000 characters
- Use for filtering in dashboard and stats
- Consistent naming helps analytics

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

## Single Email

**Endpoint:** `POST https://api.postmarkapp.com/email`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `From` | string | Sender address (must be verified) |
| `To` | string | Recipients (comma-separated, max 50 total with Cc/Bcc) |
| `Subject` | string | Email subject line |
| `TextBody` or `HtmlBody` | string | Message content |

### Optional Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `Cc` | string | CC recipients |
| `Bcc` | string | BCC recipients |
| `ReplyTo` | string | Reply-to address |
| `MessageStream` | string | `outbound` (default) or `broadcast` |
| `Tag` | string | Category for statistics (max 1000 chars) |
| `Metadata` | object | Key-value pairs for tracking |
| `TrackOpens` | boolean | Enable open tracking |
| `TrackLinks` | string | `None`, `HtmlAndText`, `HtmlOnly`, `TextOnly` |
| `Headers` | array | Custom email headers |
| `Attachments` | array | File attachments (max 10MB total) |

### Minimal Example (Node.js)

```javascript
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

const result = await client.sendEmail({
  From: 'notifications@example.com',
  To: 'customer@example.com',
  Subject: 'Your order has shipped',
  TextBody: 'Your order #12345 is on its way!',
  HtmlBody: '<p>Your order <strong>#12345</strong> is on its way!</p>',
  MessageStream: 'outbound',
  Tag: 'order-shipped'
});

console.log('MessageID:', result.MessageID);
```

### cURL Example

```bash
curl "https://api.postmarkapp.com/email" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: your-server-token" \
  -d '{
    "From": "sender@example.com",
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

Use `MessageID` for tracking via webhooks or API.

See [references/single-email-examples.md](./references/single-email-examples.md) for all SDK implementations.

## Batch Email

**Endpoint:** `POST https://api.postmarkapp.com/email/batch`

Send up to **500 emails** in a single API call. Each message is independently validated.

### Key Differences from Resend

| Feature | Postmark | Resend |
|---------|----------|--------|
| Max emails per batch | 500 | 100 |
| Attachments in batch | ✅ Supported | ❌ Not supported |
| Max payload size | 50 MB | Not specified |
| Scheduling in batch | ❌ Not supported | ❌ Not supported |

### Batch Format

```json
[
  {
    "From": "sender@example.com",
    "To": "receiver1@example.com",
    "Subject": "Order Shipped",
    "TextBody": "Your order has shipped!",
    "MessageStream": "outbound",
    "Tag": "order-shipped"
  },
  {
    "From": "sender@example.com",
    "To": "receiver2@example.com",
    "Subject": "Order Confirmed",
    "TextBody": "Your order is confirmed!",
    "MessageStream": "outbound",
    "Tag": "order-confirmed",
    "Attachments": [
      {
        "Name": "invoice.pdf",
        "Content": "base64-content",
        "ContentType": "application/pdf"
      }
    ]
  }
]
```

### Batch Response

Returns array with individual results (mixed success/failure possible):

```json
[
  {
    "ErrorCode": 0,
    "Message": "OK",
    "MessageID": "b7bc2f4a-e38e-4336-af7d-e6c392c2f817",
    "SubmittedAt": "2024-11-26T12:01:05.1794748-05:00",
    "To": "receiver1@example.com"
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
    From: 'sender@example.com',
    To: 'user1@example.com',
    Subject: 'Welcome!',
    TextBody: 'Welcome to our service.',
    MessageStream: 'outbound'
  },
  {
    From: 'sender@example.com',
    To: 'user2@example.com',
    Subject: 'Welcome!',
    TextBody: 'Welcome to our service.',
    MessageStream: 'outbound'
  }
]);

// Check individual results
results.forEach((result, index) => {
  if (result.ErrorCode === 0) {
    console.log(`Email ${index + 1} sent: ${result.MessageID}`);
  } else {
    console.error(`Email ${index + 1} failed: ${result.Message}`);
  }
});
```

See [references/batch-email-examples.md](./references/batch-email-examples.md) for chunking large batches.

## Send with Template

**Endpoint:** `POST https://api.postmarkapp.com/email/withTemplate`

Use server-side templates for dynamic content without React.

### Template Request

```json
{
  "From": "sender@example.com",
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

### Template Alias Alternative

Use alias instead of ID for easier management:

```json
{
  "TemplateAlias": "welcome-email",
  "TemplateModel": { "name": "John" }
}
```

### Node.js Example

```javascript
const result = await client.sendEmailWithTemplate({
  From: 'sender@example.com',
  To: 'customer@example.com',
  TemplateId: 12345,
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

See [references/template-examples.md](./references/template-examples.md) for template syntax.

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

### Limits

- Individual TextBody/HtmlBody: 5 MB each
- Total message with attachments: 10 MB
- Certain file types blocked for security

## Tracking (Opens & Clicks)

Configure per-email or at server level:

```json
{
  "TrackOpens": true,
  "TrackLinks": "HtmlAndText"
}
```

**TrackLinks Options:**
- `None`: No tracking
- `HtmlAndText`: Track in both
- `HtmlOnly`: Track HTML only
- `TextOnly`: Track text only

**Best Practice:** Disable tracking for transactional emails (password resets, receipts) to maximize deliverability.

## Testing

### Safe Testing Options

| Method | Address/Token | Result |
|--------|---------------|--------|
| **API Test Token** | `POSTMARK_API_TEST` | Validates without sending |
| **Black Hole** | `test@blackhole.postmarkapp.com` | Dropped, appears in activity |
| **Sandbox Server** | Create sandbox server | Full processing, no delivery |
| **Bounce Testing** | `hardbounce@bounce-testing.postmarkapp.com` | Simulates bounce |

**NEVER test with fake addresses at real providers** (test@gmail.com) - damages reputation.

### Bounce Test Addresses

| Type | Address |
|------|---------|
| Hard Bounce | `hardbounce@bounce-testing.postmarkapp.com` |
| Soft Bounce | `softbounce@bounce-testing.postmarkapp.com` |
| Spam Complaint | Use sandbox mode |

## Domain Warm-up

New domains must gradually increase volume:

### New Domain Schedule

| Day | Max/Day | Max/Hour |
|-----|---------|----------|
| 1 | 150 | - |
| 2 | 250 | - |
| 3 | 400 | - |
| 4 | 700 | 50 |
| 5 | 1,000 | 75 |
| 6 | 1,500 | 100 |
| 7 | 2,000 | 150 |

### Monitor

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Bounce rate | < 4% | Slow down, clean list |
| Spam complaint rate | < 0.08% | Slow down, review content |

## SMTP Migration

Migrating from SMTP? Postmark supports both:

**SMTP Settings:**
- Host: `smtp.postmarkapp.com` (transactional) or `smtp-broadcasts.postmarkapp.com`
- Ports: 25, 2525, or 587 (all support TLS)
- Username: Your Server API Token
- Password: Your Server API Token

**Custom Headers via SMTP:**
```
X-PM-Message-Stream: outbound
X-PM-Tag: welcome-email
X-PM-Track-Opens: true
X-PM-Track-Links: HtmlAndText
X-PM-Metadata-customer-id: 12345
```

See [references/smtp-migration.md](./references/smtp-migration.md) for complete migration guide.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing MessageStream | Always specify `outbound` or `broadcast` |
| Using broadcast for transactional | Use separate streams for different email types |
| Testing with real addresses | Use `POSTMARK_API_TEST` or sandbox mode |
| Retrying 422 errors | These are validation errors - fix request, don't retry |
| Not handling partial batch failures | Check each result in batch response array |
| Tracking on transactional emails | Disable for password resets, receipts |
| Exceeding 50 recipients | Split into multiple emails |
| Not verifying sender | Domain/address must be verified before sending |

## SDK Reference

### Node.js
```bash
npm install postmark
```

### Python
```bash
pip install postmarker
```

### Ruby
```bash
gem install postmark
```

### PHP
```bash
composer require wildbit/postmark-php
```

### .NET
```bash
dotnet add package Postmark
```

See [Postmark official libraries](https://github.com/wildbit) for all SDKs.

## Notes

- `From` address must use a verified domain or sender signature
- Store API key in `POSTMARK_SERVER_TOKEN` environment variable
- Maximum 50 recipients total (To + Cc + Bcc)
- Base64 encoding increases attachment size ~33%
- MessageID returned is used for bounce/webhook correlation
- For broadcast campaigns to large lists, consider the Bulk API endpoint
