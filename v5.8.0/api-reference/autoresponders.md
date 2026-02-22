---
layout: doc
---

# Autoresponders API Documentation

Automated email sequence endpoints for creating, managing, and configuring autoresponder campaigns that trigger based on subscriber actions.

## Create Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Create`
- Legacy endpoint access via `/api.php` is also supported
:::

Creates a new autoresponder that sends an email based on subscriber triggers such as subscription, link clicks, campaign opens, conversions, forward-to-friend actions, or specific dates. Supports delayed sending with various time intervals and optional recurring sequences.

**Request Body Parameters:**

| Parameter                  | Type    | Required | Description                                                                                      |
|----------------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command                    | String  | Yes      | API command: `autoresponder.create`                                                              |
| SessionID                  | String  | No       | Session ID obtained from login                                                                   |
| APIKey                     | String  | No       | API key for authentication                                                                       |
| SubscriberListID           | Integer | Yes      | Subscriber list ID to attach the autoresponder to                                                |
| AutoResponderName          | String  | Yes      | Name of the autoresponder                                                                        |
| AutoResponderTriggerType   | String  | Yes      | Trigger type: `OnSubscription`, `OnSubscriberLinkClick`, `OnSubscriberCampaignOpen`, `OnSubscriberCampaignConversion`, `OnSubscriberForwardToFriend`, `OnSubscriberDate` |
| AutoResponderTriggerValue  | String  | Conditional | Trigger value (required for: `OnSubscriberLinkClick`, `OnSubscriberCampaignOpen`, `OnSubscriberCampaignConversion`, `OnSubscriberDate`) |
| AutoResponderTriggerValue2 | String  | No       | Additional trigger value for certain trigger types                                               |
| EmailID                    | Integer | Yes      | Email template ID to send                                                                        |
| TriggerTimeType            | String  | Yes      | Time delay type: `Immediately`, `Seconds later`, `Minutes later`, `Hours later`, `Days later`, `Weeks later`, `Months later` |
| TriggerTime                | Integer | Conditional | Time delay value (required when TriggerTimeType is not `Immediately`)                        |
| Repeat                     | String  | No       | Repeat pattern in ISO 8601 duration format: `R{count}/P{interval}{unit}` (e.g., `R5/P2D` = repeat 5 times every 2 days, unit: H=hours, D=days) |

::: code-group

```bash [Example Request - Welcome Email]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "Welcome Email",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 456,
    "TriggerTimeType": "Immediately"
  }'
```

```bash [Example Request - Delayed Follow-up]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "3-Day Follow-up",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 457,
    "TriggerTimeType": "Days later",
    "TriggerTime": 3
  }'
```

```bash [Example Request - Recurring Sequence]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "Weekly Newsletter Series",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 458,
    "TriggerTimeType": "Days later",
    "TriggerTime": 7,
    "Repeat": "R4/P7D"
  }'
```

```bash [Example Request - Link Click Trigger]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "Product Interest Follow-up",
    "AutoResponderTriggerType": "OnSubscriberLinkClick",
    "AutoResponderTriggerValue": "https://example.com/product-page",
    "EmailID": 459,
    "TriggerTimeType": "Hours later",
    "TriggerTime": 2
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AutoResponderID": 789
}
```

```json [Error Response - Invalid Trigger Type]
{
  "Success": false,
  "ErrorCode": [6]
}
```

```json [Error Response - Invalid Email]
{
  "Success": false,
  "ErrorCode": [9]
}
```

```txt [Error Codes]
0: Success
subscriberlistid: Missing required parameter subscriberlistid
autorespondername: Missing required parameter autorespondername
autorespondertriggertype: Missing required parameter autorespondertriggertype
autorespondertriggervalue: Missing required parameter autorespondertriggervalue (required for certain trigger types)
triggertime: Missing required parameter triggertime (required when TriggerTimeType is not Immediately)
emailid: Missing required parameter emailid
6: Invalid autoresponder trigger type
7: Invalid trigger time type
9: Invalid email ID (email not found or does not belong to user)
```

:::

## Get Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves detailed information about a specific autoresponder including configuration, trigger settings, and optionally performance statistics. The autoresponder must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter           | Type    | Required | Description                                                                                      |
|---------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command             | String  | Yes      | API command: `autoresponder.get`                                                                 |
| SessionID           | String  | No       | Session ID obtained from login                                                                   |
| APIKey              | String  | No       | API key for authentication                                                                       |
| AutoResponderID     | Integer | Yes      | Autoresponder ID to retrieve                                                                     |
| RetrieveStatistics  | Boolean | No       | Include performance statistics (default: false)                                                  |

::: code-group

```bash [Example Request - Basic]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789
  }'
```

```bash [Example Request - With Statistics]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "RetrieveStatistics": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AutoResponder": {
    "AutoResponderID": 789,
    "AutoResponderName": "Welcome Email",
    "RelListID": 123,
    "RelEmailID": 456,
    "AutoResponderTriggerType": "OnSubscription",
    "AutoResponderTriggerValue": "",
    "AutoResponderTriggerValue2": "",
    "TriggerTimeType": "Immediately",
    "TriggerTime": 0,
    "RepeatSettings": {
      "Status": "Disabled"
    },
    "TotalSent": 1250,
    "TotalOpens": 875,
    "TotalClicks": 320,
    "TotalRevenue": "1250.50",
    "UniqueOpens": 825,
    "UniqueClicks": 295
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": ["autoresponderid"],
  "ErrorText": "Missing auto responder id"
}
```

```txt [Error Codes]
0: Success
autoresponderid: Missing required parameter autoresponderid
```

:::

## List Autoresponders

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponders.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves all autoresponders for a specific subscriber list with optional sorting. Returns autoresponder details including performance metrics and total count.

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                                                                      |
|------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String  | Yes      | API command: `autoresponders.get`                                                                |
| SessionID        | String  | No       | Session ID obtained from login                                                                   |
| APIKey           | String  | No       | API key for authentication                                                                       |
| SubscriberListID | Integer | Yes      | Subscriber list ID to retrieve autoresponders for                                                |
| OrderField       | String  | No       | Field to sort by: `AutoResponderName`, `AutoResponderID`, `TotalSent`, `TotalOpens`, `TotalClicks`, `TotalDelivered`, `TotalFailed`, `UniqueOpens`, `UniqueClicks`, `TotalConversions`, `UniqueConversions`, `TotalForwards`, `UniqueForwards`, `TotalViewsOnBrowser`, `UniqueViewsOnBrowser`, `TotalUnsubscriptions`, `TotalHardBounces`, `TotalSoftBounces`, `TotalRevenue` (default: AutoResponderName) |
| OrderType        | String  | No       | Sort direction: `ASC` or `DESC` (default: ASC)                                                   |

::: code-group

```bash [Example Request - Default Sort]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123
  }'
```

```bash [Example Request - Sort by Performance]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "OrderField": "TotalSent",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalResponderCount": 5,
  "AutoResponders": [
    {
      "AutoResponderID": 789,
      "AutoResponderName": "Welcome Email",
      "RelListID": 123,
      "RelEmailID": 456,
      "AutoResponderTriggerType": "OnSubscription",
      "TriggerTimeType": "Immediately",
      "TriggerTime": 0,
      "TotalSent": 1250,
      "TotalOpens": 875,
      "TotalClicks": 320,
      "TotalRevenue": "1250.50",
      "UniqueOpens": 825,
      "UniqueClicks": 295
    },
    {
      "AutoResponderID": 790,
      "AutoResponderName": "3-Day Follow-up",
      "RelListID": 123,
      "RelEmailID": 457,
      "AutoResponderTriggerType": "OnSubscription",
      "TriggerTimeType": "Days later",
      "TriggerTime": 3,
      "TotalSent": 980,
      "TotalOpens": 650,
      "TotalClicks": 210,
      "TotalRevenue": "890.25",
      "UniqueOpens": 610,
      "UniqueClicks": 195
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": ["subscriberlistid"],
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
0: Success
subscriberlistid: Missing required parameter subscriberlistid
```

:::

## Update Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Update`
- Legacy endpoint access via `/api.php` is also supported
:::

Updates an existing autoresponder. All fields except AutoResponderID are optional, allowing partial updates. The autoresponder must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter                  | Type    | Required | Description                                                                                      |
|----------------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command                    | String  | Yes      | API command: `autoresponder.update`                                                              |
| SessionID                  | String  | No       | Session ID obtained from login                                                                   |
| APIKey                     | String  | No       | API key for authentication                                                                       |
| AutoResponderID            | Integer | Yes      | Autoresponder ID to update                                                                       |
| SubscriberListID           | Integer | No       | Updated subscriber list ID                                                                       |
| AutoResponderName          | String  | No       | Updated autoresponder name                                                                       |
| AutoResponderTriggerType   | String  | No       | Updated trigger type: `OnSubscription`, `OnSubscriberLinkClick`, `OnSubscriberCampaignOpen`, `OnSubscriberCampaignConversion`, `OnSubscriberForwardToFriend`, `OnSubscriberDate` |
| AutoResponderTriggerValue  | String  | Conditional | Updated trigger value (required when updating to certain trigger types)                      |
| AutoResponderTriggerValue2 | String  | No       | Updated additional trigger value                                                                 |
| EmailID                    | Integer | No       | Updated email template ID                                                                        |
| TriggerTimeType            | String  | No       | Updated time delay type: `Immediately`, `Seconds later`, `Minutes later`, `Hours later`, `Days later`, `Weeks later`, `Months later` |
| TriggerTime                | Integer | Conditional | Updated time delay value (required when TriggerTimeType is not `Immediately`)               |
| Repeat                     | String  | No       | Updated repeat pattern: `R{count}/P{interval}{unit}` or `null` to disable repeating            |

::: code-group

```bash [Example Request - Update Name]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "AutoResponderName": "Updated Welcome Email"
  }'
```

```bash [Example Request - Update Timing]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "TriggerTimeType": "Days later",
    "TriggerTime": 1
  }'
```

```bash [Example Request - Disable Repeat]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "Repeat": null
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response - Not Found]
{
  "Success": false,
  "ErrorCode": [5],
  "ErrorText": ["Invalid auto responder id"]
}
```

```json [Error Response - Invalid Trigger Type]
{
  "Success": false,
  "ErrorCode": [7],
  "ErrorText": ["Invalid auto responder trigger type"]
}
```

```txt [Error Codes]
0: Success
autoresponderid: Missing required parameter autoresponderid
autorespondertriggervalue: Missing auto responder trigger value (required for certain trigger types)
triggertime: Missing auto responder trigger time (required when TriggerTimeType is not Immediately)
5: Invalid auto responder id (not found or access denied)
7: Invalid auto responder trigger type
8: Invalid trigger time type
9: Invalid email ID (email not found or does not belong to user)
```

:::

## Copy Autoresponders

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Create`
- Legacy endpoint access via `/api.php` is also supported
:::

Copies all autoresponders (or a specific one) from a source list to a target list. Creates clones of the email templates and autoresponder configurations. Optionally adds a prefix to copied autoresponder names.

**Request Body Parameters:**

| Parameter             | Type    | Required | Description                                                                                      |
|-----------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command               | String  | Yes      | API command: `autoresponders.copy`                                                               |
| SessionID             | String  | No       | Session ID obtained from login                                                                   |
| APIKey                | String  | No       | API key for authentication                                                                       |
| SourceListID          | Integer | Yes      | Source subscriber list ID to copy autoresponders from                                            |
| TargetListID          | Integer | Yes      | Target subscriber list ID to copy autoresponders to                                              |
| TargetAutoResponderID | Integer | No       | Specific autoresponder ID to copy (if omitted, copies all autoresponders from source list)      |
| Prefix                | String  | No       | Prefix to add to copied autoresponder names (e.g., "Copy - ")                                   |

::: code-group

```bash [Example Request - Copy All]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 456,
    "Prefix": "Copy - "
  }'
```

```bash [Example Request - Copy Specific]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 456,
    "TargetAutoResponderID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response - Invalid List]
{
  "Success": false,
  "ErrorCode": [4],
  "ErrorText": ["Invalid source subscriber id"]
}
```

```txt [Error Codes]
0: Success
sourcelistid: Missing source subscriber list id
targetlistid: Missing target subscriber list id
4: Invalid source or target subscriber list id (not found or access denied)
```

:::

## Delete Autoresponders

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponders.Delete`
- Legacy endpoint access via `/api.php` is also supported
:::

Permanently deletes one or more autoresponders. Accepts comma-separated autoresponder IDs. All autoresponders must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter      | Type   | Required | Description                                                                                      |
|----------------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command        | String | Yes      | API command: `autoresponders.delete`                                                             |
| SessionID      | String | No       | Session ID obtained from login                                                                   |
| APIKey         | String | No       | API key for authentication                                                                       |
| AutoResponders | String | Yes      | Comma-separated autoresponder IDs to delete (e.g., "789,790,791")                               |

::: code-group

```bash [Example Request - Delete Single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.delete",
    "SessionID": "your-session-id",
    "AutoResponders": "789"
  }'
```

```bash [Example Request - Delete Multiple]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.delete",
    "SessionID": "your-session-id",
    "AutoResponders": "789,790,791"
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
  "ErrorCode": ["autoresponders"],
  "ErrorText": ["Auto responder ids are missing"]
}
```

```txt [Error Codes]
0: Success
autoresponders: Auto responder ids are missing
```

:::
