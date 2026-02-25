# Postmark Agent Skills Proposal

## Executive Summary

Agent Skills are emerging as a critical standard for extending AI agent capabilities with specialized, domain-specific knowledge. Resend launched their skills suite on January 28th, 2026, gaining significant traction (1.4K+ weekly installs for email-best-practices). Postmark should release a competitive skills offering to:

1. **Improve developer experience** by giving AI agents the context needed to correctly implement Postmark integrations
2. **Differentiate on transactional email expertise** - Postmark's focus on deliverability and reliability is a strength to leverage
3. **Capture mindshare** with developers increasingly using AI coding assistants (Claude Code, Cursor, Copilot, Codex)

---

## What Are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that AI agents can discover and use to perform tasks more accurately. Key characteristics:

- **Progressive disclosure**: Only skill name/description loaded initially; full instructions loaded when relevant
- **Human-readable**: Markdown files with YAML frontmatter, not code syntax
- **Portable**: Work across Claude Code, Cursor, VS Code Copilot, OpenAI Codex, Gemini CLI, and more
- **Modular**: Each skill is independent and can be combined with others

### Directory Structure
```
skill-name/
├── SKILL.md          # Required: instructions + metadata
├── scripts/          # Optional: executable code
├── references/       # Optional: detailed documentation
└── assets/           # Optional: templates, resources
```

### SKILL.md Format
```yaml
---
name: skill-name
description: A clear description of what this skill does and when to use it.
license: MIT
metadata:
  author: postmark
  version: "1.0"
---

# Skill Instructions

[Markdown content with instructions, examples, guidelines]
```

---

## Competitive Analysis: Resend's Skills

Resend released three skills:

| Skill | Purpose | Installs |
|-------|---------|----------|
| **email-best-practices** | Generic email knowledge (deliverability, compliance, design) | 1.4K/week |
| **send-email** (resend-skills) | API implementation with Resend | 402/week |
| **react-email** | Building email templates with React components | (in react-email repo) |

### What Works Well in Resend's Approach

1. **Separation of concerns**: Generic email knowledge vs. API-specific implementation
2. **Quick reference tables**: Decision matrices for single vs. batch, error handling
3. **Production-ready patterns**: Idempotency, retry logic, error handling built-in
4. **Progressive documentation**: Main SKILL.md routes to detailed reference files
5. **Testing guidance**: Safe testing addresses, domain warm-up schedules

### Gaps/Opportunities for Postmark

1. **No transactional vs. broadcast stream guidance** - Postmark's core differentiator
2. **Limited template coverage** - Postmark has strong template features
3. **No inbound email processing** - Postmark has robust inbound capabilities
4. **No SMTP migration path** - Many developers migrate from SMTP
5. **No webhook implementation patterns** - Postmark has comprehensive webhooks
6. **No message stream organization** - Postmark's server/stream model is unique

---

## Proposed Postmark Skills Suite

### Overview

| Skill | Repository | Purpose |
|-------|------------|---------|
| **postmark-send-email** | postmark/postmark-skills | Send emails via Postmark API (single, batch, template) |
| **postmark-email-best-practices** | postmark/email-best-practices | Generic deliverability, compliance, design knowledge |
| **postmark-templates** | postmark/postmark-skills | Create and manage Postmark email templates |
| **postmark-inbound** | postmark/postmark-skills | Process incoming emails with webhooks |
| **postmark-webhooks** | postmark/postmark-skills | Implement event notifications for all webhook types |

---

## Skill 1: postmark-send-email

**Repository**: `postmark/postmark-skills`

### Purpose
Send emails through the Postmark API with best practices for single, batch, and bulk sending.

### Key Differentiators from Resend
- **Message Streams**: Transactional vs. Broadcast separation (Postmark's unique model)
- **Higher batch limits**: 500 messages per call (vs. Resend's 100)
- **Attachments in batch**: Supported (Resend doesn't support)
- **Template integration**: Native template support with `/email/withTemplate`
- **SMTP option**: Migration path from legacy SMTP

### SKILL.md Structure

```yaml
---
name: postmark-send-email
description: Send emails through Postmark API - single, batch, bulk, and templates. Covers transactional and broadcast streams, error handling, and deliverability best practices.
license: MIT
metadata:
  author: postmark
  version: "1.0"
---

# Send Email with Postmark

## Overview

Postmark provides multiple endpoints for sending emails:

| Approach | Endpoint | Use Case |
|----------|----------|----------|
| **Single** | `POST /email` | Individual transactional emails |
| **Batch** | `POST /email/batch` | Up to 500 emails in one request |
| **Template** | `POST /email/withTemplate` | Dynamic content with templates |
| **Batch Template** | `POST /email/batchWithTemplates` | Bulk templated emails |
| **Bulk** | `POST /email/bulk` | Broadcast stream campaigns |

## Message Streams (CRITICAL)

Postmark separates emails by intent:

| Stream | Purpose | Endpoint | Default |
|--------|---------|----------|---------|
| **Transactional** | 1:1 triggered emails | `smtp.postmarkapp.com` | Yes |
| **Broadcast** | Bulk marketing/newsletters | `smtp-broadcasts.postmarkapp.com` | No |

**Always specify MessageStream in API calls:**
```json
{
  "MessageStream": "outbound",  // transactional (default)
  "MessageStream": "broadcast"  // marketing/newsletters
}
```

## Quick Start

1. **Get API Token** from Server settings in Postmark
2. **Verify sender** (domain or email address)
3. **Choose endpoint** based on use case
4. **Implement** with SDK or cURL

## Best Practices

### Authentication
```bash
X-Postmark-Server-Token: your-server-token-here
```

### Error Handling

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 401 | Unauthorized | Check API token |
| 422 | Validation error | Fix request, don't retry |
| 429 | Rate limited | Retry with backoff |
| 500 | Server error | Retry with backoff |

### Tags (Important Difference)
Unlike Resend (multiple tags), Postmark uses **one tag per message** (max 1000 chars):
```json
{
  "Tag": "password-reset"
}
```

[Reference detailed examples](./references/single-email-examples.md)
[Reference batch sending](./references/batch-email-examples.md)
[Reference template usage](./references/template-examples.md)
```

### Reference Files
- `references/single-email-examples.md` - All SDK examples
- `references/batch-email-examples.md` - Batch patterns
- `references/template-examples.md` - Template usage
- `references/smtp-migration.md` - SMTP to API migration
- `references/error-handling.md` - Complete error patterns

---

## Skill 2: postmark-email-best-practices

**Repository**: `postmark/email-best-practices`

### Purpose
Generic email expertise for deliverability, compliance, and design. Provider-agnostic knowledge that works regardless of ESP.

### Structure (Similar to Resend's)

```
postmark-email-best-practices/
├── SKILL.md
└── resources/
    ├── deliverability.md          # SPF/DKIM/DMARC, reputation
    ├── transactional-emails.md    # Design patterns for transactional
    ├── transactional-catalog.md   # Email types by app category
    ├── marketing-emails.md        # Newsletters, campaigns
    ├── email-capture.md           # List building, validation
    ├── compliance.md              # CAN-SPAM, GDPR, CASL
    ├── email-types.md             # Transactional vs marketing
    ├── sending-reliability.md     # Retry, idempotency
    ├── webhooks-events.md         # Event processing
    └── list-management.md         # Suppression, hygiene
```

### Key Additions for Postmark's Version
- **Sender reputation section** with Postmark's specific guidance
- **Message stream strategy** - how to organize streams
- **Testing safely** - Postmark's sandbox mode and test addresses
- **Warm-up schedules** - Postmark's recommended volumes

---

## Skill 3: postmark-templates

**Repository**: `postmark/postmark-skills/templates`

### Purpose
Create, manage, and send with Postmark email templates.

### Why a Separate Skill?
Postmark's template system is robust and different from competitors:
- Server-side rendering (no React required)
- Handlebars-style variables
- Template API for CRUD operations
- Layout inheritance
- Pre-built template gallery

### SKILL.md Outline

```yaml
---
name: postmark-templates
description: Create and manage Postmark email templates with server-side rendering, layouts, and the Templates API.
---

# Postmark Templates

## Template Syntax
```handlebars
{{name}}                    <!-- Simple variable -->
{{#if condition}}...{{/if}} <!-- Conditional -->
{{#each items}}...{{/each}} <!-- Iteration -->
{{{html_content}}}          <!-- Unescaped HTML -->
```

## API Operations
- Create template: `POST /templates`
- Send with template: `POST /email/withTemplate`
- Batch with templates: `POST /email/batchWithTemplates`

## Layouts
Templates can inherit from layouts for consistent branding...

[See references/template-syntax.md for full syntax]
[See references/template-api.md for API examples]
```

---

## Skill 4: postmark-inbound

**Repository**: `postmark/postmark-skills/inbound`

### Purpose
Process incoming emails with Postmark's inbound email parsing.

### Why This Matters
This is a capability Resend doesn't prominently feature. Postmark's inbound processing enables:
- Reply-by-email features
- Email-to-ticket systems
- Email command processing
- Document extraction

### SKILL.md Outline

```yaml
---
name: postmark-inbound
description: Process incoming emails with Postmark inbound webhooks. Build reply-by-email, email-to-ticket, and automated email processing.
---

# Postmark Inbound Email Processing

## How It Works
1. Configure inbound address or domain forwarding
2. Set webhook URL for parsed email delivery
3. Process JSON payload in your application

## Setup Options
| Method | Use Case |
|--------|----------|
| MX Records | Full domain control |
| Email Forwarding | Quick setup, existing email |

## Payload Structure
```json
{
  "From": "sender@example.com",
  "Subject": "Re: Your order #12345",
  "MailboxHash": "order-12345",
  "TextBody": "...",
  "StrippedTextReply": "Just the reply without quotes",
  "Attachments": [...]
}
```

## MailboxHash Threading
Use `+` addressing for routing:
```
notifications+order-12345@yourdomain.com
```

[See references/inbound-setup.md]
[See references/webhook-handler.md]
```

---

## Skill 5: postmark-webhooks

**Repository**: `postmark/postmark-skills/webhooks`

### Purpose
Implement all Postmark webhook types for comprehensive email tracking.

### Coverage
- Delivery notifications
- Bounce handling
- Spam complaint processing
- Open/click tracking
- Subscription changes
- Inbound email

### SKILL.md Outline

```yaml
---
name: postmark-webhooks
description: Implement Postmark webhooks for delivery tracking, bounce handling, engagement metrics, and email processing.
---

# Postmark Webhooks

## Event Types

| Event | Trigger | Key Action |
|-------|---------|------------|
| Delivery | Email accepted by recipient server | Confirm sent |
| Bounce | Email rejected | Remove from list |
| SpamComplaint | Marked as spam | Unsubscribe immediately |
| Open | Email opened | Track engagement |
| Click | Link clicked | Track engagement |
| SubscriptionChange | Unsubscribe action | Honor preference |
| Inbound | Email received | Process content |

## Webhook Security
- Use HTTPS endpoints
- Implement basic auth or IP whitelisting
- Validate payload structure

## Bounce Handling (Critical)
```javascript
switch (event.Type) {
  case 'HardBounce':
    // Remove permanently - address doesn't exist
    break;
  case 'SoftBounce':
    // Temporary issue - Postmark retries automatically
    break;
  case 'SpamComplaint':
    // Unsubscribe immediately - reputation impact
    break;
}
```

[See references/webhook-setup.md]
[See references/bounce-types.md]
[See references/handler-examples.md]
```

---

## Implementation Recommendations

### Phase 1: Core Skills (Week 1-2)
1. **postmark-send-email** - Highest value, direct competitor to Resend
2. **postmark-email-best-practices** - Foundation knowledge

### Phase 2: Differentiation (Week 3-4)
3. **postmark-templates** - Unique strength
4. **postmark-webhooks** - Essential for production

### Phase 3: Advanced (Week 5-6)
5. **postmark-inbound** - Differentiating capability

### Repository Structure

```
# Option A: Monorepo (Recommended)
postmark/postmark-skills/
├── send-email/
│   ├── SKILL.md
│   └── references/
├── templates/
│   ├── SKILL.md
│   └── references/
├── webhooks/
│   ├── SKILL.md
│   └── references/
├── inbound/
│   ├── SKILL.md
│   └── references/
└── README.md

# Option B: Separate repo for best practices
postmark/email-best-practices/
├── SKILL.md
└── resources/
```

### Installation Commands

```bash
# All skills
npx skills add postmark/postmark-skills

# Individual skills
npx skills add postmark/postmark-skills --skill send-email
npx skills add postmark/postmark-skills --skill templates
npx skills add postmark/email-best-practices
```

---

## Marketing & Launch Considerations

### Blog Post Angle
"Introducing Postmark Skills: Teaching AI Agents Transactional Email Excellence"

Key messages:
1. **Transactional email expertise** - Postmark's 15+ years of deliverability knowledge
2. **Message stream architecture** - Proper separation of transactional/broadcast
3. **Production-ready patterns** - Webhook handling, bounce management, suppression lists
4. **Full email lifecycle** - Not just sending, but inbound processing too

### Differentiation Points
| Postmark | Resend |
|----------|--------|
| Message streams (trans/broadcast) | Single stream |
| 500 emails/batch | 100 emails/batch |
| Attachments in batch | No batch attachments |
| Robust template system | React Email focus |
| Inbound processing | Limited coverage |
| SMTP migration path | API-only |
| Sandbox mode | Test tokens |

### Target Audience
- Developers using AI coding assistants (Claude Code, Cursor, Copilot)
- Teams building transactional email systems
- Companies migrating from SMTP to API
- Developers implementing email reply systems

---

## Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Weekly installs (all skills) | 2,000+ |
| GitHub stars (postmark-skills) | 50+ |
| Developer docs traffic from skill refs | +20% |
| Support tickets referencing skills | Track mentions |

---

## Next Steps

1. **Approve skill structure** and naming
2. **Assign ownership** for each skill
3. **Create postmark/postmark-skills** repository
4. **Write SKILL.md** for send-email (highest priority)
5. **Develop reference files** with SDK examples
6. **Internal testing** with Claude Code and Cursor
7. **Launch blog post** and developer announcement
8. **Submit to skills.sh** directory

---

## Appendix: Full SKILL.md Example (send-email)

See the attached `postmark-send-email-SKILL.md` file for a complete, production-ready skill that can be used as a starting template.
