---
layout: doc
---

# n8n Integration

Octeth integrates with [n8n](https://n8n.io) — an open-source workflow automation platform — through its REST API. By connecting n8n to Octeth's API endpoints, you can automate subscriber management, send transactional emails, trigger journeys, and build sophisticated marketing workflows that respond to events from any application in your stack.

This article covers how to connect n8n to Octeth, the key API endpoints available for automation, and practical workflow examples to get you started.

## What Is n8n?

n8n is a workflow automation platform that connects different applications and services together. It provides a visual editor where you create workflows by linking **nodes** — each node represents an action such as receiving a webhook, making an API call, filtering data, or sending a notification.

n8n connects to Octeth using **HTTP Request** nodes that call Octeth's API endpoints. This means any event that n8n can detect — a form submission, a CRM update, an e-commerce order, a scheduled timer — can trigger actions in Octeth such as subscribing a contact, sending an email, or starting a journey.

## Prerequisites

Before setting up the integration, make sure you have:

- **A running n8n instance** — either self-hosted or an [n8n Cloud](https://n8n.io/cloud/) account.
- **An Octeth user account** with API access enabled.
- **An Octeth API key** — generated from your Octeth dashboard.

### Generating an API Key in Octeth

1. Log in to your Octeth account.
2. Navigate to **Settings** in the top menu.
3. Click the **API Keys** tab.
4. Click **Generate New Key**.
5. Enter a descriptive name such as `n8n Integration`.
6. Click **Create** and copy the generated API key.

[[SCREENSHOT: The Octeth Settings page showing the API Keys tab with the Generate New Key button]]

::: warning
Store your API key securely. It provides full access to your Octeth account through the API. If you suspect a key has been compromised, delete it immediately and generate a new one.
:::

## Connecting n8n to Octeth

All Octeth API calls follow the same pattern: send a POST request to `https://your-octeth-domain/api.php` with a `Command` parameter specifying the action, an `APIKey` parameter for authentication, and `ResponseFormat` set to `JSON`.

### Setting Up an HTTP Request Node

1. Open your n8n workflow editor.
2. Add an **HTTP Request** node.
3. Configure the node with the following settings:

| Setting | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `https://your-octeth-domain/api.php` |
| **Body Content Type** | `Form Data` |

4. Add the following body parameters:

| Parameter | Value |
|---|---|
| `Command` | The API command (e.g., `User.Current`) |
| `APIKey` | Your Octeth API key |
| `ResponseFormat` | `JSON` |

[[SCREENSHOT: The n8n HTTP Request node configuration showing the URL, method, and body parameters for an Octeth API call]]

### Testing the Connection

To verify the connection works, create a simple workflow that calls the `User.Current` endpoint:

1. Add a **Manual Trigger** node.
2. Connect it to an **HTTP Request** node configured as described above.
3. Set the `Command` parameter to `User.Current`.
4. Click **Test Workflow**.

A successful response looks like this:

```json
{
  "Success": true,
  "ErrorCode": 0,
  "UserInfo": {
    "UserID": "1",
    "EmailAddress": "admin@example.com"
  }
}
```

If the response returns `"Success": false`, check that your API key is correct and your Octeth URL is accessible from the n8n instance.

::: tip
Store your API key in n8n's **Credentials** store rather than hardcoding it in each node. Create a custom **Header Auth** credential or use n8n's built-in credential management to keep your key secure and reusable across workflows.
:::

## Key API Endpoints for Automation

The following endpoints are the most useful when building n8n workflows with Octeth:

### Subscriber Management

| Command | Description | Key Parameters |
|---|---|---|
| `Subscriber.Subscribe` | Add a subscriber to a list | `ListID`, `EmailAddress`, `IPAddress` |
| `Subscriber.Unsubscribe` | Remove a subscriber from a list | `ListID`, `EmailAddress` |
| `Subscriber.Update` | Update subscriber fields | `SubscriberID`, `SubscriberListID`, `Fields` |
| `Subscribers.Get` | Retrieve subscribers from a list | `ListID` |

### Email Gateway

| Command | Description | Key Parameters |
|---|---|---|
| `EmailGateway.SendEmail` | Send a transactional email | `SenderAPIKey`, `From`, `To`, `Subject`, `HTMLContent` |
| `EmailGateway.AddWebhook` | Register a webhook for email events | `DomainID`, `Event`, `WebhookURL` |
| `EmailGateway.GetEvents` | Retrieve email event history | `DomainID` |

### Journeys and Tags

| Command | Description | Key Parameters |
|---|---|---|
| `Subscriber.Journey.Trigger` | Trigger a journey for a subscriber | `JourneyID`, `ListID`, `SubscriberID` |
| `Subscriber.Tag` | Add a tag to a subscriber | `TagID`, `SubscriberListID`, `SubscriberID` |
| `Subscriber.Untag` | Remove a tag from a subscriber | `TagID`, `SubscriberListID`, `SubscriberID` |
| `Event.Track` | Track a custom event | `Event`, `ListID`, `Email` |

::: info
For the complete API reference including all parameters and response formats, refer to the [API Reference](/v5.8.1/api-reference/subscribers) documentation.
:::

## Example Workflows

The following examples demonstrate common automation patterns. Each workflow uses n8n's visual node editor with HTTP Request nodes calling Octeth's API.

### User Onboarding Workflow

Automatically subscribe new users to a mailing list, tag them, and trigger a welcome journey when they sign up through your application.

**Trigger:** Webhook node receiving a POST request from your signup form or application.

**Workflow nodes:**

1. **Webhook** — Receives the signup event with the new user's email and name.
2. **HTTP Request (Subscribe)** — Calls `Subscriber.Subscribe` to add the user to your onboarding list.
3. **HTTP Request (Tag)** — Calls `Subscriber.Tag` to tag the subscriber as a new signup.
4. **HTTP Request (Trigger Journey)** — Calls `Subscriber.Journey.Trigger` to start the welcome journey.

[[SCREENSHOT: The n8n workflow editor showing the user onboarding workflow with Webhook, Subscribe, Tag, and Trigger Journey nodes connected in sequence]]

The Subscribe node sends these parameters:

| Parameter | Value |
|---|---|
| `Command` | `Subscriber.Subscribe` |
| `APIKey` | Your API key |
| `ResponseFormat` | `JSON` |
| `ListID` | Your onboarding list ID |
| `EmailAddress` | <code v-pre>{{ $json.email }}</code> |
| `IPAddress` | <code v-pre>{{ $json.ip }}</code> |

::: tip
Use n8n expressions like <code v-pre>{{ $json.email }}</code> to dynamically insert values from the trigger node's output into your API calls.
:::

### Transactional Email Sending

Send personalized transactional emails — such as order confirmations, password resets, or appointment reminders — through Octeth's Email Gateway.

**Trigger:** Webhook node or any application event in n8n.

**Workflow nodes:**

1. **Trigger** — Receives the event (e.g., a new order from your e-commerce platform).
2. **HTTP Request (Send Email)** — Calls `EmailGateway.SendEmail` with dynamic content.

The Email Gateway expects a JSON body. Configure the HTTP Request node with **Body Content Type** set to `JSON` and the following structure:

```json
{
  "SenderAPIKey": "your-email-gateway-api-key",
  "From": {
    "email": "orders@example.com",
    "name": "Example Store"
  },
  "To": [
    {
      "email": "customer@example.com",
      "name": "John Doe"
    }
  ],
  "Subject": "Your Order Confirmation",
  "ContentType": "html",
  "HTMLContent": "<h1>Thank you for your order!</h1><p>Order #12345 has been confirmed.</p>",
  "TrackOpens": true,
  "TrackLinks": true
}
```

Replace the static values with n8n expressions to insert dynamic data from the trigger node.

::: info
The `SenderAPIKey` for the Email Gateway is different from your user API key. Generate it in Octeth under **Email Gateway** > **Domains** > **API Credentials** for the sending domain.
:::

### CRM-to-Octeth Subscriber Sync

Keep your Octeth subscriber lists in sync with your CRM by subscribing new contacts automatically.

**Trigger:** Schedule node (e.g., runs daily) or a CRM webhook.

**Workflow nodes:**

1. **Schedule / Webhook** — Triggers the sync on a schedule or when a CRM event occurs.
2. **HTTP Request (CRM)** — Fetches new contacts from your CRM.
3. **Loop Over Items** — Iterates through each contact.
4. **HTTP Request (Subscribe)** — Calls `Subscriber.Subscribe` for each contact with custom field mapping.

Map CRM fields to Octeth custom fields using the `CustomField{ID}` parameters:

| Parameter | Value |
|---|---|
| `CustomField1` | <code v-pre>{{ $json.first_name }}</code> |
| `CustomField2` | <code v-pre>{{ $json.last_name }}</code> |
| `CustomField3` | <code v-pre>{{ $json.company }}</code> |

::: tip
Find your custom field IDs in Octeth by navigating to your subscriber list and clicking **Custom Fields**. Each field has a numeric ID that maps to the `CustomField{ID}` parameter.
:::

### Multi-Channel Lead Capture

Collect leads from multiple sources — Facebook Lead Ads, Typeform, landing pages — and funnel them all into Octeth with appropriate tagging.

**Trigger:** Multiple Webhook nodes, one for each lead source.

**Workflow nodes:**

1. **Webhook (Facebook)** / **Webhook (Typeform)** / **Webhook (Landing Page)** — Each receives leads from a different source.
2. **Merge** — Combines all incoming leads into a single flow.
3. **Set** — Normalizes the data fields (different sources use different field names).
4. **HTTP Request (Subscribe)** — Calls `Subscriber.Subscribe` to add the lead.
5. **HTTP Request (Tag)** — Calls `Subscriber.Tag` to tag the subscriber with the lead source (e.g., "Facebook", "Typeform").

[[SCREENSHOT: The n8n workflow editor showing multiple webhook triggers merging into a single subscribe and tag flow]]

This pattern ensures all leads end up in Octeth regardless of their source, with tags that let you segment and target them based on where they came from.

### Event-Driven Journey Triggers

Track custom events from your application and use them to trigger targeted journeys in Octeth.

**Trigger:** Webhook from your application (e.g., user completed a purchase, abandoned a cart, reached a milestone).

**Workflow nodes:**

1. **Webhook** — Receives the event from your application.
2. **HTTP Request (Track Event)** — Calls `Event.Track` to record the event against the subscriber.
3. **IF** — Checks conditions (e.g., order value above a threshold).
4. **HTTP Request (Trigger Journey)** — Calls `Subscriber.Journey.Trigger` to start the appropriate journey.

The Event.Track node sends these parameters:

| Parameter | Value |
|---|---|
| `Command` | `Event.Track` |
| `APIKey` | Your API key |
| `ResponseFormat` | `JSON` |
| `Event` | `purchase_completed` |
| `ListID` | Your list ID |
| `Email` | <code v-pre>{{ $json.email }}</code> |
| `Properties` | `{"order_value": "149.99", "product": "Pro Plan"}` |

## Receiving Octeth Email Gateway Events in n8n

Octeth's Email Gateway can send webhook notifications to n8n when email events occur — such as deliveries, opens, clicks, bounces, and complaints. This allows you to build reactive workflows that respond to subscriber email engagement in real time.

### Setting Up the Webhook

**Step 1: Create a Webhook node in n8n**

1. Add a **Webhook** node to a new n8n workflow.
2. Set the HTTP method to `POST`.
3. Copy the **Production URL** displayed in the node (e.g., `https://your-n8n-domain/webhook/abc123`).
4. Activate the workflow so the webhook URL is live.

**Step 2: Register the webhook in Octeth**

Call the `EmailGateway.AddWebhook` endpoint to register your n8n webhook URL for specific events:

| Parameter | Value |
|---|---|
| `Command` | `EmailGateway.AddWebhook` |
| `APIKey` | Your API key |
| `ResponseFormat` | `JSON` |
| `DomainID` | Your Email Gateway domain ID |
| `Event` | `bounce` |
| `WebhookURL` | Your n8n webhook production URL |

Supported event types:

| Event | Description |
|---|---|
| `delivery` | Email was successfully delivered |
| `bounce` | Email bounced (hard or soft) |
| `open` | Recipient opened the email |
| `click` | Recipient clicked a link |
| `unsubscribe` | Recipient unsubscribed |
| `complaint` | Recipient marked the email as spam |

Register a separate webhook for each event type you want to track.

### Example: Bounce Handling Workflow

Automatically handle bounced emails by unsubscribing hard bounces and notifying your team:

1. **Webhook** — Receives bounce events from Octeth Email Gateway.
2. **IF** — Checks if the bounce type is "hard".
3. **HTTP Request (Unsubscribe)** — Calls `Subscriber.Unsubscribe` to remove the hard-bounced address.
4. **Slack / Email** — Notifies your team about the bounce for review.

[[SCREENSHOT: The n8n workflow editor showing the bounce handling workflow with Webhook, IF condition, Unsubscribe, and Slack notification nodes]]

### Example: Engagement-Based Tagging

Tag subscribers based on their email engagement to enable targeted campaigns:

1. **Webhook** — Receives `click` events from Octeth Email Gateway.
2. **HTTP Request (Tag)** — Calls `Subscriber.Tag` to tag the clicker as "Engaged".
3. **HTTP Request (Trigger Journey)** — Optionally triggers a follow-up journey for engaged subscribers.

## Tips and Best Practices

::: tip Use n8n Credentials for API Keys
Store your Octeth API key and Email Gateway API key in n8n's credential store. This keeps keys secure, makes them reusable across workflows, and allows you to rotate keys without editing each node individually.
:::

::: tip Handle API Errors Gracefully
Add an **Error Trigger** node to your workflows. When an Octeth API call fails, the error trigger can send you a notification or log the failure for review. Check the `Success` and `ErrorCode` fields in every API response to detect issues early.
:::

::: tip Respect Rate Limits
Octeth's API allows 100 requests per 60 seconds for most endpoints. When processing large batches (such as importing many subscribers), add a **Wait** node between API calls or use n8n's batch processing settings to stay within the limit.
:::

::: tip Tag Subscribers by Automation Source
When adding subscribers through n8n, tag them with a label like "n8n-import" or "webinar-signup" to distinguish them from manually added subscribers. This makes segmentation and reporting easier later.
:::

::: tip Test with Small Batches First
Before running a workflow against your full subscriber list, test with a small batch of test email addresses. Verify that subscribers are created correctly, tags are applied, and journeys trigger as expected.
:::

## Troubleshooting

### API Returns "Success": false with ErrorCode

Every Octeth API response includes `Success`, `ErrorCode`, and `ErrorText` fields. When a request fails:

1. Check the `ErrorText` value — it describes the specific issue.
2. Verify that all required parameters are included in the request.
3. Confirm the `Command` value is spelled correctly (commands are case-insensitive but must match the exact name).

### Authentication Errors

1. Verify your API key is correct and has not been revoked.
2. Confirm the `APIKey` parameter name is included in the request body.
3. For Email Gateway endpoints, use the `SenderAPIKey` parameter with the domain-specific API key, not your user API key.

### Subscriber Not Being Added

1. Confirm the `ListID` exists and is accessible to your API key.
2. Verify the `EmailAddress` is a valid email format.
3. Check that the `IPAddress` parameter is included — it is required for `Subscriber.Subscribe`.
4. If the subscriber already exists on the list, the API returns an error. Use `Subscriber.Update` instead.

### Emails Not Sending via Email Gateway

1. Verify the sending domain is added and verified in Octeth under **Email Gateway** > **Domains**.
2. Confirm API credentials are generated for the domain.
3. Check that the `From` email address uses the verified domain.
4. Ensure the `SenderAPIKey` matches the credentials for the sending domain.

### Webhook Events Not Reaching n8n

1. Confirm the n8n workflow is **activated** (not just saved). Webhook URLs only work on active workflows.
2. Verify the webhook URL is accessible from your Octeth server. If n8n is running locally, use a tunnel service to expose the URL.
3. Check that the webhook is registered for the correct `Event` type and `DomainID` in Octeth.
4. Review n8n's execution log for incoming requests — even failed processing still shows the received webhook data.
