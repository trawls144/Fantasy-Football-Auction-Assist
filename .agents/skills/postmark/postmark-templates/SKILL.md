---
name: postmark-templates
description: Use when creating, managing, or sending with Postmark server-side email templates — Handlebars syntax, layout inheritance, template validation, and cross-server pushing.
---

# Email Templates with Postmark

## Overview

Postmark templates are server-side email templates using Handlebars syntax. Templates are rendered on Postmark's servers — no client-side rendering library needed.

| Feature | Description |
|---------|-------------|
| **Syntax** | Handlebars (Mustache-compatible) |
| **Rendering** | Server-side — no React, no client library |
| **Types** | Standard templates and Layout templates |
| **Inheritance** | Standard templates can inherit from a Layout |
| **Validation** | API endpoint to test-render templates before sending |
| **Cross-server** | Push templates between servers (staging → production) |
| **Limit** | 100 templates per server (contact support for more) |

## Quick Start

1. **Create a template** via API or the [Postmark dashboard](https://account.postmarkapp.com)
2. **Define variables** using Handlebars syntax: `{{variable_name}}`
3. **Send with template** using `POST /email/withTemplate` or `POST /email/batchWithTemplates`
4. **Pass data** via `TemplateModel` — Postmark renders and sends

## Template Syntax (Handlebars)

### Variables

```handlebars
Hello {{name}},

Your order {{order_id}} has been confirmed.
```

### Unescaped HTML

Use triple braces for HTML content that should not be escaped:

```handlebars
{{{html_content}}}
```

### Conditionals

```handlebars
{{#if premium_member}}
  <p>Thank you for being a premium member!</p>
{{else}}
  <p>Upgrade to premium for exclusive benefits.</p>
{{/if}}
```

### Iteration

```handlebars
<table>
  {{#each items}}
  <tr>
    <td>{{this.name}}</td>
    <td>{{this.quantity}}</td>
    <td>{{this.price}}</td>
  </tr>
  {{/each}}
</table>
```

### Nested Objects

```handlebars
{{customer.name}}
{{customer.address.city}}
```

### Template Model Example

For the template above, the `TemplateModel` would be:

```json
{
  "name": "Jane Doe",
  "order_id": "ORD-12345",
  "premium_member": true,
  "html_content": "<strong>Important notice</strong>",
  "items": [
    { "name": "Widget", "quantity": 2, "price": "$19.99" },
    { "name": "Gadget", "quantity": 1, "price": "$29.99" }
  ],
  "customer": {
    "name": "Jane Doe",
    "address": { "city": "San Francisco" }
  }
}
```

## Template Types

### Standard Templates

Regular email templates that define subject, HTML body, and text body:

```json
{
  "Name": "Order Confirmation",
  "Alias": "order-confirmation",
  "Subject": "Order {{order_id}} confirmed",
  "HtmlBody": "<html><body><h1>Order Confirmed</h1><p>Hi {{name}},</p><p>Your order {{order_id}} is confirmed.</p></body></html>",
  "TextBody": "Order Confirmed\n\nHi {{name}},\nYour order {{order_id}} is confirmed.",
  "TemplateType": "Standard"
}
```

### Layout Templates

Reusable wrappers that provide consistent structure (CSS, headers, footers) for Standard templates:

```json
{
  "Name": "Base Layout",
  "Alias": "base-layout",
  "HtmlBody": "<html><head><style>body { font-family: sans-serif; }</style></head><body><header><img src='https://yourdomain.com/logo.png'></header><main>{{{@content}}}</main><footer><p>&copy; 2025 Your Company</p></footer></body></html>",
  "TextBody": "{{{@content}}}\n\n---\n(c) 2025 Your Company",
  "TemplateType": "Layout"
}
```

The `{{{@content}}}` placeholder is where the Standard template's content is injected.

### Assigning a Layout to a Template

```json
{
  "Name": "Order Confirmation",
  "Alias": "order-confirmation",
  "LayoutTemplate": "base-layout",
  "Subject": "Order {{order_id}} confirmed",
  "HtmlBody": "<h1>Order Confirmed</h1><p>Hi {{name}}, your order {{order_id}} is confirmed.</p>",
  "TextBody": "Order Confirmed\nHi {{name}}, your order {{order_id}} is confirmed."
}
```

The Standard template's body replaces `{{{@content}}}` in the Layout.

## API Endpoints

### Template CRUD

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/templates` | `POST` | Create a new template |
| `/templates` | `GET` | List all templates (`?count=100&offset=0&templateType=Standard`) |
| `/templates/{idOrAlias}` | `GET` | Get a single template |
| `/templates/{idOrAlias}` | `PUT` | Update a template |
| `/templates/{idOrAlias}` | `DELETE` | Delete a template |
| `/templates/validate` | `POST` | Validate template rendering |
| `/templates/push` | `PUT` | Push templates to another server |

### Sending with Templates

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/email/withTemplate` | `POST` | Send single email with template |
| `/email/batchWithTemplates` | `POST` | Send batch with templates (up to 500) |

## Create a Template

### Node.js

```javascript
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

const template = await client.createTemplate({
  Name: 'Welcome Email',
  Alias: 'welcome-email',
  Subject: 'Welcome to {{product_name}}, {{name}}!',
  HtmlBody: `
    <h1>Welcome, {{name}}!</h1>
    <p>Thanks for joining {{product_name}}.</p>
    {{#if trial}}
      <p>Your trial ends on {{trial_end_date}}.</p>
    {{/if}}
    <a href="{{action_url}}">Get Started</a>
  `,
  TextBody: 'Welcome, {{name}}!\n\nThanks for joining {{product_name}}.\n\nGet started: {{action_url}}',
  TemplateType: 'Standard'
});

console.log('Template created:', template.TemplateId);
```

### cURL

```bash
curl "https://api.postmarkapp.com/templates" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_SERVER_TOKEN" \
  -d '{
    "Name": "Welcome Email",
    "Alias": "welcome-email",
    "Subject": "Welcome to {{product_name}}, {{name}}!",
    "HtmlBody": "<h1>Welcome, {{name}}!</h1><p>Thanks for joining {{product_name}}.</p>",
    "TextBody": "Welcome, {{name}}!\n\nThanks for joining {{product_name}}.",
    "TemplateType": "Standard"
  }'
```

### Response

```json
{
  "TemplateId": 12345,
  "Name": "Welcome Email",
  "Alias": "welcome-email",
  "Active": true,
  "TemplateType": "Standard",
  "LayoutTemplate": null
}
```

## Create a Layout

```javascript
const layout = await client.createTemplate({
  Name: 'Company Layout',
  Alias: 'company-layout',
  HtmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffd700; padding: 20px; text-align: center; }
        .footer { color: #666; font-size: 12px; text-align: center; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://yourdomain.com/logo.png" alt="Logo" width="150">
      </div>
      <div class="container">
        {{{@content}}}
      </div>
      <div class="footer">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `,
  TextBody: '{{{@content}}}\n\n---\n(c) 2025 Your Company\nUnsubscribe: {{unsubscribe_url}}',
  TemplateType: 'Layout'
});
```

## Send with Template

### Using Template ID

```javascript
const result = await client.sendEmailWithTemplate({
  From: 'hello@yourdomain.com',
  To: 'customer@example.com',
  TemplateId: 12345,
  TemplateModel: {
    name: 'Jane Doe',
    product_name: 'Acme App',
    trial: true,
    trial_end_date: 'February 15, 2025',
    action_url: 'https://app.yourdomain.com/start'
  },
  MessageStream: 'outbound'
});
```

### Using Template Alias (Recommended)

Aliases are more readable and survive template re-creation:

```javascript
const result = await client.sendEmailWithTemplate({
  From: 'hello@yourdomain.com',
  To: 'customer@example.com',
  TemplateAlias: 'welcome-email',
  TemplateModel: {
    name: 'Jane Doe',
    product_name: 'Acme App'
  },
  MessageStream: 'outbound'
});
```

### Batch with Templates

```javascript
const results = await client.sendEmailBatchWithTemplates([
  {
    From: 'hello@yourdomain.com',
    To: 'user1@example.com',
    TemplateAlias: 'welcome-email',
    TemplateModel: { name: 'User 1', product_name: 'Acme App' },
    MessageStream: 'outbound'
  },
  {
    From: 'hello@yourdomain.com',
    To: 'user2@example.com',
    TemplateAlias: 'welcome-email',
    TemplateModel: { name: 'User 2', product_name: 'Acme App' },
    MessageStream: 'outbound'
  }
]);
```

## Validate a Template

Test-render a template without sending:

```javascript
const validation = await client.validateTemplate({
  Subject: 'Welcome {{name}}',
  HtmlBody: '<h1>Hello {{name}}</h1>{{#if premium}}<p>Premium member</p>{{/if}}',
  TextBody: 'Hello {{name}}',
  TestRenderModel: {
    name: 'Test User',
    premium: true
  }
});

if (validation.AllContentIsValid) {
  console.log('Template is valid');
  console.log('Rendered subject:', validation.Subject.RenderedContent);
  console.log('Rendered HTML:', validation.HtmlBody.RenderedContent);
} else {
  console.error('Validation errors:', validation.HtmlBody.ValidationErrors);
}
```

### cURL

```bash
curl "https://api.postmarkapp.com/templates/validate" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_SERVER_TOKEN" \
  -d '{
    "Subject": "Welcome {{name}}",
    "HtmlBody": "<h1>Hello {{name}}</h1>",
    "TextBody": "Hello {{name}}",
    "TestRenderModel": {
      "name": "Test User"
    }
  }'
```

## Push Templates Between Servers

Sync templates from one server to another (e.g., staging → production):

```bash
curl "https://api.postmarkapp.com/templates/push" \
  -X PUT \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Account-Token: $POSTMARK_ACCOUNT_TOKEN" \
  -d '{
    "SourceServerID": 12345,
    "DestinationServerID": 67890,
    "PerformChanges": true
  }'
```

Set `PerformChanges` to `false` first to preview what would change.

**Note:** Template push requires an **Account Token** (`X-Postmark-Account-Token`), not a Server Token.

## List Templates

```javascript
const templates = await client.getTemplates({
  count: 100,
  offset: 0,
  templateType: 'Standard' // or 'Layout' or 'All'
});

templates.Templates.forEach(t => {
  console.log(`${t.Name} (${t.Alias || t.TemplateId}) - ${t.Active ? 'Active' : 'Inactive'}`);
});
```

## Update a Template

```javascript
await client.editTemplate('welcome-email', {
  Subject: 'Welcome to {{product_name}}!',
  HtmlBody: '<h1>Welcome!</h1><p>Updated content for {{name}}</p>'
});
```

Or by ID:

```javascript
await client.editTemplate(12345, {
  Name: 'Updated Welcome Email',
  Subject: 'Welcome to {{product_name}}!'
});
```

## Delete a Template

```javascript
await client.deleteTemplate('welcome-email');
// or
await client.deleteTemplate(12345);
```

**Note:** You cannot delete a Layout template that has dependent Standard templates. Remove the layout association from all dependent templates first.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `{{html}}` for HTML content | Use triple braces `{{{html}}}` for unescaped HTML |
| Forgetting `{{{@content}}}` in Layout | Layout templates must include `{{{@content}}}` placeholder |
| Deleting a Layout with dependents | Remove layout association from Standard templates first |
| Using Template ID across environments | Use `TemplateAlias` — it survives re-creation and works across servers |
| Not validating before deploy | Use `/templates/validate` to test-render before sending |
| Sending a Layout directly | Layouts are wrappers — you can only send Standard templates |
| Missing TemplateModel fields | Handlebars renders missing variables as empty strings — validate your data |
| Exceeding 100 templates | Contact Postmark support to increase the per-server limit |

## Notes

- Templates use Handlebars (Mustache-compatible) syntax — no React or client-side rendering needed
- Template aliases are strings; template IDs are integers — prefer aliases for portability
- `TemplateType` is either `Standard` (sendable) or `Layout` (wrapper)
- Layout inheritance: Standard template body replaces `{{{@content}}}` in the Layout
- Push templates between servers using the Account Token (not Server Token)
- Maximum 100 templates per server by default
- Template validation (`/templates/validate`) lets you test-render without sending
- Both `TemplateId` and `TemplateAlias` work for sending — use one, not both
