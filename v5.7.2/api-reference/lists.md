---
layout: doc
---

# List API Documentation

List management endpoints for creating, updating, and managing email subscriber lists and their integration settings.

## Create a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter             | Type   | Required | Description                                    |
|-----------------------|--------|----------|------------------------------------------------|
| Command               | String | Yes      | API command: `list.create`                     |
| SessionID             | String | No       | Session ID obtained from login                 |
| APIKey                | String | No       | API key for authentication                     |
| SubscriberListName    | String | Yes      | Name of the subscriber list to create          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.create",
    "SessionID": "your-session-id",
    "SubscriberListName": "My New List"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 3]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list name
3: User has exceeded maximum number of subscriber lists allowed by their user group
```

:::

## Get a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                   |
|------------|---------|----------|-----------------------------------------------|
| Command    | String  | Yes      | API command: `list.get`                       |
| SessionID  | String  | No       | Session ID obtained from login                |
| APIKey     | String  | No       | API key for authentication                    |
| ListID     | Integer | Yes      | ID of the list to retrieve                    |
| GetStats   | Boolean | No       | Whether to include statistics (default: false)|

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.get",
    "SessionID": "your-session-id",
    "ListID": 123,
    "GetStats": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": 123,
    "Name": "My List",
    "RelOwnerUserID": 1,
    "EventListTrackerID": "abc123",
    "EventUserTrackerID": "xyz789",
    "EventTrackerVariables": {},
    "EventTrackerJS": "...",
    "EventTrackerProperties": [],
    "LastEventTrackedAt": "2024-01-15 10:30:00"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing list ID
```

:::

## Update a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter                                       | Type    | Required | Description                                                  |
|-------------------------------------------------|---------|----------|--------------------------------------------------------------|
| Command                                         | String  | Yes      | API command: `list.update`                                   |
| SessionID                                       | String  | No       | Session ID obtained from login                               |
| APIKey                                          | String  | No       | API key for authentication                                   |
| SubscriberListID                                | Integer | Yes      | ID of the list to update                                     |
| Name                                            | String  | No       | New name for the list                                        |
| SenderName                                      | String  | No       | Default sender name for campaigns                            |
| SenderEmailAddress                              | String  | No       | Default sender email address                                 |
| SenderCompany                                   | String  | No       | Sender company name                                          |
| SenderAddress                                   | String  | No       | Sender physical address                                      |
| OptInMode                                       | String  | No       | Opt-in mode: "Single" or "Double"                            |
| OptInConfirmationEmailID                        | Integer | No       | Email ID for double opt-in confirmation                      |
| OptOutAddToSuppressionList                      | String  | No       | Add to list suppression list on unsubscribe: "Yes" or "No"   |
| OptOutAddToGlobalSuppressionList                | String  | No       | Add to global suppression list on unsubscribe: "Yes" or "No" |
| HideInSubscriberArea                            | String  | No       | Hide list in subscriber area: "true" or "false"              |
| SendServiceIntegrationFailedNotification        | String  | No       | Send integration failure notifications: "true" or "false"    |
| SendActivityNotification                        | String  | No       | Send activity notifications: "true" or "false"               |
| SubscriptionConfirmationPendingPageURL          | String  | No       | URL for confirmation pending page                            |
| SubscriptionConfirmedPageURL                    | String  | No       | URL for subscription confirmed page                          |
| SubscriptionErrorPageURL                        | String  | No       | URL for subscription error page                              |
| UnsubscriptionConfirmedPageURL                  | String  | No       | URL for unsubscription confirmed page                        |
| UnsubscriptionErrorPageURL                      | String  | No       | URL for unsubscription error page                            |
| ReqByEmailSearchToAddress                       | String  | No       | Email address for subscription by email requests             |
| ReqByEmailSubscriptionCommand                   | String  | No       | Command word for email subscription requests                 |
| ReqByEmailUnsubscriptionCommand                 | String  | No       | Command word for email unsubscription requests               |
| SyncStatus                                      | String  | No       | Data sync status: "Enabled" or "Disabled"                    |
| SyncPeriod                                      | String  | No       | Synchronization period                                       |
| SyncSendReportEmail                             | String  | No       | Send sync report emails: "Yes" or "No"                       |
| SyncMySQLHost                                   | String  | No       | MySQL host for data synchronization                          |
| SyncMySQLPort                                   | Integer | No       | MySQL port for data synchronization                          |
| SyncMySQLUsername                               | String  | No       | MySQL username for sync                                      |
| SyncMySQLPassword                               | String  | No       | MySQL password for sync                                      |
| SyncMySQLDBName                                 | String  | No       | MySQL database name for sync                                 |
| SyncMySQLQuery                                  | String  | No       | SQL query for data synchronization                           |
| SyncFieldMapping                                | String  | No       | Field mapping configuration for sync                         |
| OptOutScope                                     | String  | No       | Unsubscription scope: "This list" or "All lists"             |
| OptOutSubscribeTo                               | Integer | No       | List ID to subscribe to on unsubscription                    |
| OptOutUnsubscribeFrom                           | Integer | No       | List ID to unsubscribe from on unsubscription                |
| OptInSubscribeTo                                | Integer | No       | List ID to subscribe to on subscription                      |
| OptInUnsubscribeFrom                            | Integer | No       | List ID to unsubscribe from on subscription                  |
| Options                                         | Object  | No       | Additional list options (JSON object)                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.update",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Name": "Updated List Name",
    "OptInMode": "Double",
    "SenderName": "My Company",
    "SenderEmailAddress": "sender@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "List": {
    "ListID": 123,
    "Name": "Updated List Name",
    "OptInMode": "Double",
    "SenderName": "My Company",
    "SenderEmailAddress": "sender@example.com"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 4]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
2: Invalid subscriber list ID
3: Invalid opt-in mode
4: Invalid opt-out scope
5: Invalid send notification setting
6: Invalid hide in subscriber area setting
8: Missing sync configuration parameters
9: Invalid email address format for ReqByEmailSearchToAddress
10: Invalid suppression list option
11: Nothing to update
```

:::

## Get All Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Lists.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                          |
|--------------------|---------|----------|------------------------------------------------------|
| Command            | String  | Yes      | API command: `lists.get`                             |
| SessionID          | String  | No       | Session ID obtained from login                       |
| APIKey             | String  | No       | API key for authentication                           |
| RecordsPerRequest  | Integer | No       | Number of records per page (default: 0 = all)        |
| RecordsFrom        | Integer | No       | Starting record offset (default: 0)                  |
| OrderField         | String  | No       | Field to order by (default: "ListID")                |
| OrderType          | String  | No       | Sort direction: "ASC" or "DESC" (default: "ASC")     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "lists.get",
    "SessionID": "your-session-id",
    "RecordsPerRequest": 20,
    "RecordsFrom": 0,
    "OrderField": "Name",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalListCount": 5,
  "Lists": [
    {
      "ListID": 123,
      "Name": "My List",
      "RelOwnerUserID": 1,
      "EncryptedSaltedListID": "abc123...",
      "EventListTrackerID": "xyz789",
      "EventUserTrackerID": "def456",
      "EventTrackerVariables": {},
      "EventTrackerJS": "..."
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| Command   | String | Yes      | API command: `lists.delete`                     |
| SessionID | String | No       | Session ID obtained from login                  |
| APIKey    | String | No       | API key for authentication                      |
| Lists     | String | Yes      | Comma-separated list of list IDs to delete      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "lists.delete",
    "SessionID": "your-session-id",
    "Lists": "123,456,789"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: List IDs are missing
```

:::

## Get List Assets

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Retrieves comprehensive list information including all related assets: segments, custom fields, subscriber tags, and autoresponders.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                             |
|-----------|---------|----------|-----------------------------------------|
| Command   | String  | Yes      | API command: `list.assets`              |
| SessionID | String  | No       | Session ID obtained from login          |
| APIKey    | String  | No       | API key for authentication              |
| ListID    | Integer | Yes      | ID of the list to retrieve assets for   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.assets",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": 123,
    "Name": "My List"
  },
  "Segments": {
    "Success": true,
    "Segments": []
  },
  "CustomFields": {
    "Success": true,
    "CustomFields": []
  },
  "SubscriberTags": {
    "Success": true,
    "Tags": []
  },
  "AutoResponders": {
    "Success": true,
    "AutoResponders": []
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing list ID
```

:::

## Add Integration URL

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                          |
|------------------|---------|----------|------------------------------------------------------|
| Command          | String  | Yes      | API command: `listintegration.addurl`                |
| SessionID        | String  | No       | Session ID obtained from login                       |
| APIKey           | String  | No       | API key for authentication                           |
| SubscriberListID | Integer | Yes      | ID of the list for integration                       |
| URL              | String  | Yes      | Integration webhook URL                              |
| Event            | String  | Yes      | Event type to trigger webhook                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.addurl",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "URL": "https://example.com/webhook",
    "Event": "Subscribe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "WebServiceIntegrationID": 456,
  "EventType": "Subscribe",
  "ServiceURL": "https://example.com/webhook"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 4]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
2: Missing URL
3: Missing event type
4: Invalid subscriber list ID
```

:::

## Delete Integration URLs

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                              |
|-----------|--------|----------|----------------------------------------------------------|
| Command   | String | Yes      | API command: `listintegration.deleteurls`                |
| SessionID | String | No       | Session ID obtained from login                           |
| APIKey    | String | No       | API key for authentication                               |
| URLs      | String | Yes      | Comma-separated list of web service integration IDs      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.deleteurls",
    "SessionID": "your-session-id",
    "URLs": "456,789,012"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Web service integration URL IDs are missing
```

:::

## Get Integration URLs

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                |
|------------------|---------|----------|--------------------------------------------|
| Command          | String  | Yes      | API command: `listintegration.geturls`     |
| SessionID        | String  | No       | Session ID obtained from login             |
| APIKey           | String  | No       | API key for authentication                 |
| SubscriberListID | Integer | Yes      | ID of the list to get integration URLs for |
| Event            | String  | No       | Filter by specific event type              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.geturls",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Event": "Subscribe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "URLs": [
    {
      "WebServiceIntegrationID": 456,
      "RelListID": 123,
      "EventType": "Subscribe",
      "ServiceURL": "https://example.com/webhook"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
```

:::

## Test Integration URL

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| Command   | String | Yes      | API command: `listintegration.testurl`   |
| SessionID | String | No       | Session ID obtained from login           |
| APIKey    | String | No       | API key for authentication               |
| URL       | String | Yes      | Integration webhook URL to test          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.testurl",
    "SessionID": "your-session-id",
    "URL": "https://example.com/webhook"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: URL is missing
```

:::

## Generate Subscription Form HTML

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Modern integration methods should use direct API calls via the subscriber.create endpoint or use embedded JavaScript-based subscription forms.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter               | Type    | Required | Description                                              |
|-------------------------|---------|----------|----------------------------------------------------------|
| Command                 | String  | Yes      | API command: `listintegration.generatesubscriptionformhtmlcode` |
| SessionID               | String  | No       | Session ID obtained from login                           |
| APIKey                  | String  | No       | API key for authentication                               |
| SubscriberListID        | Integer | Yes      | ID of the list for the subscription form                 |
| CustomFields            | String  | No       | Comma-separated custom field IDs to include in form      |
| EmailAddressString      | String  | No       | Label text for email address field                       |
| SubscribeButtonString   | String  | No       | Text for subscribe button                                |
| HTMLSpecialChars        | String  | No       | Apply htmlspecialchars encoding (default: "true")        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.generatesubscriptionformhtmlcode",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "CustomFields": "1,2,3",
    "EmailAddressString": "Your Email",
    "SubscribeButtonString": "Join Now"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "HTMLCode": [
    "&lt;form action=&quot;https://example.com/subscribe.php&quot; method=&quot;post&quot;&gt;",
    "&lt;input type=&quot;text&quot; name=&quot;FormValue_Fields[EmailAddress]&quot;&gt;",
    "..."
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
```

:::

## Generate Unsubscription Form HTML

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Modern integration methods should use direct API calls via the subscriber.unsubscribe endpoint or use embedded JavaScript-based unsubscription forms.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter                 | Type    | Required | Description                                                 |
|---------------------------|---------|----------|-------------------------------------------------------------|
| Command                   | String  | Yes      | API command: `listintegration.generateunsubscriptionformhtmlcode` |
| SessionID                 | String  | No       | Session ID obtained from login                              |
| APIKey                    | String  | No       | API key for authentication                                  |
| SubscriberListID          | Integer | Yes      | ID of the list for the unsubscription form                  |
| UnsubscribeButtonString   | String  | No       | Text for unsubscribe button                                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.generateunsubscriptionformhtmlcode",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "UnsubscribeButtonString": "Opt Out"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "HTMLCode": [
    "&lt;form action=&quot;https://example.com/unsubscribe.php&quot; method=&quot;post&quot;&gt;",
    "&lt;input type=&quot;text&quot; name=&quot;FormValue_EmailAddress&quot;&gt;",
    "..."
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
```

:::
