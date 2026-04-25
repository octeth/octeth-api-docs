---
layout: doc
---

# User Webhook API Documentation

User-area webhook management endpoints for creating, listing, retrieving, updating, deleting, and inspecting the activity of inbound subscription/unsubscription webhooks owned by the authenticated user.

These webhooks are the user-owned, list-bound webhooks visible at `/app/user/webhooks/`. They are distinct from the email-gateway webhooks managed under the `emailgateway.*webhook*` endpoints. Each webhook is bound to a single subscriber list and is triggered (externally) via its auto-generated `HashedID` to add or remove a subscriber on either a `Subscription` or `Unsubscription` event.

## List User Webhooks

<Badge type="info" text="GET" /> `/api/v1/user.webhooks`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                                                                                                                                  |
|---------------|---------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Command       | String  | Yes      | API command: `user.webhook.list`                                                                                                                                             |
| SessionID     | String  | No       | Session ID obtained from login                                                                                                                                               |
| APIKey        | String  | No       | API key for authentication                                                                                                                                                   |
| IncludeStats  | Boolean | No       | When `true`, each webhook in the response includes a `ReceivedRequestsStats` array with the per-day received-request counts for the last 30 days. Default: `false`           |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.webhooks?APIKey=your-api-key&IncludeStats=true"
```

```json [Success Response]
{
  "Success": true,
  "Webhooks": [
    {
      "WebhookID": "6",
      "RelUserID": "1",
      "RelListID": "12",
      "RelListName": "Newsletter Subscribers",
      "Name": "New Subscriber Notifier",
      "Event": "Subscription",
      "HashedID": "f4ca-2c1a-9b7e-8d33-66d2-7cb8-1e09-aa45",
      "Options": {
        "UnsubscribeAll": false
      },
      "ReceivedRequestsStats": {
        "1714003200": 12,
        "1713916800": 8
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 0,
      "Message": "Authentication failed"
    }
  ]
}
```

```txt [Error Codes]
(none — this endpoint has no business-logic error codes; an empty result returns Webhooks: [])
```

:::

## Get a Webhook

<Badge type="info" text="GET" /> `/api/v1/user.webhook`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                          |
|-----------|---------|----------|----------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.webhook.get`                                      |
| SessionID | String  | No       | Session ID obtained from login                                       |
| APIKey    | String  | No       | API key for authentication                                           |
| WebhookID | Integer | Yes      | The ID of the webhook to retrieve. Must be owned by the calling user |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.webhook?APIKey=your-api-key&WebhookID=6"
```

```json [Success Response]
{
  "Success": true,
  "Webhook": {
    "WebhookID": "6",
    "RelUserID": "1",
    "RelListID": "12",
    "Name": "New Subscriber Notifier",
    "Event": "Subscription",
    "HashedID": "f4ca-2c1a-9b7e-8d33-66d2-7cb8-1e09-aa45",
    "Options": {
      "UnsubscribeAll": false
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Webhook not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing WebhookID parameter
2: Webhook not found (also returned when the webhook exists but is owned by another user — to avoid leaking ownership)
```

:::

## Create a Webhook

<Badge type="info" text="POST" /> `/api/v1/user.webhook`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The response includes the auto-generated `HashedID`, which is the value used to construct the externally callable webhook URL (e.g. `/system/webhook/<HashedID>/...`). Treat it like a secret.

**Request Body Parameters:**

| Parameter      | Type    | Required | Description                                                                                                  |
|----------------|---------|----------|--------------------------------------------------------------------------------------------------------------|
| Command        | String  | Yes      | API command: `user.webhook.create`                                                                           |
| SessionID      | String  | No       | Session ID obtained from login                                                                               |
| APIKey         | String  | No       | API key for authentication                                                                                   |
| Name           | String  | Yes      | Display name for the webhook                                                                                 |
| RelListID      | Integer | Yes      | ID of the subscriber list this webhook is bound to. The list must be owned by the calling user              |
| Event          | String  | Yes      | The event this webhook handles. Possible values: `Subscription`, `Unsubscription`                            |
| UnsubscribeAll | Boolean | No       | When `Event=Unsubscription` and this is `true`, the webhook will unsubscribe the contact from **every** list owned by the user, not just `RelListID`. Default: `false` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.webhook.create",
    "APIKey": "your-api-key",
    "Name": "New Subscriber Notifier",
    "RelListID": 12,
    "Event": "Subscription",
    "UnsubscribeAll": false
  }'
```

```json [Success Response]
{
  "Success": true,
  "WebhookID": 6,
  "Webhook": {
    "WebhookID": "6",
    "RelUserID": "1",
    "RelListID": "12",
    "Name": "New Subscriber Notifier",
    "Event": "Subscription",
    "HashedID": "f4ca-2c1a-9b7e-8d33-66d2-7cb8-1e09-aa45",
    "Options": {
      "UnsubscribeAll": false
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Event must be one of: Subscription, Unsubscription"
    }
  ]
}
```

```txt [Error Codes]
1: Missing Name parameter
2: Missing RelListID parameter
3: Missing Event parameter
4: Event must be one of: Subscription, Unsubscription
5: Target subscriber list not found (or not owned by the calling user)
6: Webhook create process failed
7: New webhook could not be retrieved after creation
```

:::

## Update a Webhook

<Badge type="info" text="PUT" /> `/api/v1/user.webhook`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The `HashedID` is preserved across updates, so any external system already calling the webhook URL continues to work after a name, list, or event change.

**Request Body Parameters:**

| Parameter      | Type    | Required | Description                                                                                                  |
|----------------|---------|----------|--------------------------------------------------------------------------------------------------------------|
| Command        | String  | Yes      | API command: `user.webhook.update`                                                                           |
| SessionID      | String  | No       | Session ID obtained from login                                                                               |
| APIKey         | String  | No       | API key for authentication                                                                                   |
| WebhookID      | Integer | Yes      | The ID of the webhook to update. Must be owned by the calling user                                           |
| Name           | String  | Yes      | New display name for the webhook                                                                             |
| RelListID      | Integer | Yes      | New target subscriber list ID. The list must be owned by the calling user                                    |
| Event          | String  | Yes      | New event for the webhook. Possible values: `Subscription`, `Unsubscription`                                 |
| UnsubscribeAll | Boolean | No       | When `Event=Unsubscription` and this is `true`, unsubscribes the contact from every list owned by the user. Default: `false` |

::: code-group

```bash [Example Request]
curl -X PUT https://example.com/api/v1/user.webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.webhook.update",
    "APIKey": "your-api-key",
    "WebhookID": 6,
    "Name": "Renamed Webhook",
    "RelListID": 12,
    "Event": "Unsubscription",
    "UnsubscribeAll": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "Webhook": {
    "WebhookID": "6",
    "RelUserID": "1",
    "RelListID": "12",
    "RelListName": "Newsletter Subscribers",
    "Name": "Renamed Webhook",
    "Event": "Unsubscription",
    "HashedID": "f4ca-2c1a-9b7e-8d33-66d2-7cb8-1e09-aa45",
    "Options": {
      "UnsubscribeAll": true
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 6,
      "Message": "Webhook not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing WebhookID parameter
2: Missing Name parameter
3: Missing RelListID parameter
4: Missing Event parameter
5: Event must be one of: Subscription, Unsubscription
6: Webhook not found (also returned when the webhook exists but is owned by another user)
7: Target subscriber list not found (or not owned by the calling user)
```

:::

## Delete a Webhook

<Badge type="info" text="DELETE" /> `/api/v1/user.webhook`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Deletes the webhook record and its associated daily statistics. This is irreversible — any external system still calling the webhook's `HashedID` URL will start receiving errors.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                        |
|-----------|---------|----------|--------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.webhook.delete`                                 |
| SessionID | String  | No       | Session ID obtained from login                                     |
| APIKey    | String  | No       | API key for authentication                                         |
| WebhookID | Integer | Yes      | The ID of the webhook to delete. Must be owned by the calling user |

::: code-group

```bash [Example Request]
curl -X DELETE "https://example.com/api/v1/user.webhook?APIKey=your-api-key&WebhookID=6"
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Webhook not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing WebhookID parameter
2: Webhook not found (also returned when the webhook exists but is owned by another user)
```

:::

## Get Webhook Statistics

<Badge type="info" text="GET" /> `/api/v1/user.webhook.stats`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the per-day activity counters (received, failed, successful) for the webhook, keyed by `Y-m-d` date. This backs the 30-day chart on the webhook edit page.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                              |
|-----------|---------|----------|------------------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.webhook.stats`                                                        |
| SessionID | String  | No       | Session ID obtained from login                                                           |
| APIKey    | String  | No       | API key for authentication                                                               |
| WebhookID | Integer | Yes      | The ID of the webhook. Must be owned by the calling user                                 |
| Days      | Integer | No       | Number of most-recent days of stats to return. Clamped to the range `1`–`365`. Default: `30` |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.webhook.stats?APIKey=your-api-key&WebhookID=6&Days=30"
```

```json [Success Response]
{
  "Success": true,
  "WebhookID": 6,
  "Days": 30,
  "Stats": {
    "2026-04-25": {
      "ID": "412",
      "RelWebhookID": "6",
      "RelUserID": "1",
      "Period": "2026-04-25",
      "ReceivedRequests": "12",
      "FailedRequests": "1",
      "SuccessfulRequests": "11"
    },
    "2026-04-24": {
      "ID": "401",
      "RelWebhookID": "6",
      "RelUserID": "1",
      "Period": "2026-04-24",
      "ReceivedRequests": "8",
      "FailedRequests": "0",
      "SuccessfulRequests": "8"
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Webhook not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing WebhookID parameter
2: Webhook not found (also returned when the webhook exists but is owned by another user)
```

:::
