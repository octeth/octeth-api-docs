---
layout: doc
---

# Webhooks

The Webhooks API enables real-time event notifications and integrations by allowing you to configure HTTP callbacks that are triggered when specific events occur within the Octeth platform.

::: warning Note
This section is under development. Documentation will be available soon.
:::

## API Endpoints Covered

This section will document the following webhook management endpoints:

- **Webhook Management**
  - `EmailGateway.AddWebhook` - Add a new webhook endpoint
  - `EmailGateway.UpdateWebhook` - Update existing webhook configuration
  - `EmailGateway.DeleteWebhook` - Remove a webhook endpoint
  - `EmailGateway.GetWebhook` - Retrieve specific webhook details

- **Webhook Listing**
  - `EmailGateway.GetWebhooks` - List all configured webhooks
  - `EmailGateway.GetWebhooksByEvent` - Filter webhooks by event type
  - `EmailGateway.GetWebhookLogs` - Retrieve webhook delivery logs
  - `EmailGateway.GetWebhookStats` - Get webhook performance statistics

- **Event Configuration**
  - `Webhook.SetEvents` - Configure which events trigger webhooks
  - `Webhook.TestEvent` - Send test webhook event
  - `Webhook.RetryDelivery` - Retry failed webhook deliveries
  - `Webhook.ValidateEndpoint` - Validate webhook endpoint

- **Supported Events**
  - Email delivery and bounce events
  - Subscription and unsubscription events
  - Campaign and autoresponder events
  - List and subscriber management events
  - User activity and engagement events
  - System and administrative events
  - Custom event triggers
  - Real-time vs batch event delivery

## Coming Soon

Full documentation for these endpoints including request parameters, response formats, error codes, and usage examples will be added in future updates.