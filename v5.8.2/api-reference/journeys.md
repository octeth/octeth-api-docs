---
layout: doc
---

# Journey API Documentation

Journey management endpoints for creating, updating, and managing customer journeys. Journeys allow you to automate subscriber interactions based on triggers and actions.

## Create a Journey

<Badge type="info" text="POST" /> `/api/v1/journey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `journey.create`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Name      | String | Yes      | Name of the journey                   |
| Trigger   | String | No       | Journey trigger type (default: `Manual`). Possible values: `Manual`, `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Tag`, `UnTag`, `CustomFieldValueChanged`, `RevenueHit`, `JourneyCompleted`, `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, `WebsiteEvent_conversion` |
| Trigger_ListID | Integer | No  | List ID for list-based triggers      |
| Trigger_EmailID | Integer | No | Email ID for email-based triggers    |
| Trigger_Value | String/Integer | No | Trigger value for specific triggers |
| Trigger_Criteria | Array | No  | Criteria for trigger conditions      |
| Run_Criteria | Array | No      | Run criteria for journey execution    |
| Run_Criteria_Operator | String | No | Operator for run criteria. Possible values: `and`, `or` (default: `and`) |
| Rate_Limit_Per_Hour | Integer | No | Hourly rate limit for journey triggers |
| Rate_Limit_Per_Day | Integer | No | Daily rate limit for journey triggers |
| Notes     | String | No       | Journey notes                         |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.create",
    "SessionID": "your-session-id",
    "Name": "Welcome Series",
    "Trigger": "ListSubscription",
    "Trigger_ListID": 123,
    "Notes": "Onboarding journey for new subscribers"
  }'
```

```json [Success Response]
{
  "JourneyID": 456,
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series",
    "Trigger": "ListSubscription",
    "Status": "Disabled",
    "Notes": "Onboarding journey for new subscribers",
    "CreatedAt": "2025-01-15 10:30:00",
    "UpdatedAt": "2025-01-15 10:30:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Name parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing Name parameter
3: Invalid trigger
4: Missing Trigger_ListID parameter
5: Invalid Trigger_ListID parameter
6: Trigger_ListID matching record not found
7: Missing Trigger_EmailID parameter
8: Invalid Trigger_EmailID parameter
9: Trigger_EmailID matching record not found
10: Invalid Trigger_Value parameter
11: Trigger_Value matching record not found
12: Invalid Trigger_Value parameter (CustomFieldValueChanged)
13: Trigger_Value matching record not found (CustomFieldValueChanged)
14: Invalid Trigger_Value parameter (RevenueHit)
15: Missing Trigger_Value parameter (RevenueHit)
16: Invalid Trigger_Value parameter (JourneyCompleted)
17: Trigger_Value matching record not found (JourneyCompleted)
18: Invalid rate_limit_per_hour parameter
19: Invalid rate_limit_per_day parameter
```

:::

## Clone a Journey

<Badge type="info" text="POST" /> `/api/v1/journey.clone`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.clone`          |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to clone            |
| NewJourneyName | String | Yes | Name for the cloned journey          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey.clone \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.clone",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "NewJourneyName": "Welcome Series Copy"
  }'
```

```json [Success Response]
{
  "JourneyID": "789",
  "JourneyName": "Welcome Series Copy",
  "Trigger": "ListSubscription",
  "TriggerParameters": {
    "ListID": 123
  },
  "Status": "Disabled",
  "Notes": "Copy of journey Welcome Series",
  "JourneyStats": {
    "ActiveSubscribers": "0",
    "TotalSubscribers": "0",
    "AggregatedEmailActions": "0",
    "AggregatedLast30DaysEmailActions": "0"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing NewJourneyName parameter
2: Missing JourneyID parameter
3: Journey not found
4: Journey not cloned successfully
```

:::

## Get a Journey

<Badge type="info" text="GET" /> `/api/v1/journey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.get`            |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to retrieve         |
| StartDate | String  | No       | Start date for stats (YYYY-MM-DD)     |
| EndDate   | String  | No       | End date for stats (YYYY-MM-DD)       |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.get",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "StartDate": "2025-01-01",
    "EndDate": "2025-01-31"
  }'
```

```json [Success Response]
{
  "JourneyID": "456",
  "JourneyName": "Welcome Series",
  "Trigger": "ListSubscription",
  "TriggerParameters": {
    "ListID": 123
  },
  "Status": "Enabled",
  "Notes": "Onboarding journey",
  "Actions": [],
  "JourneyStats": {
    "ActiveSubscribers": 150,
    "TotalSubscribers": 500
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
4: Invalid StartDate format
5: Invalid EndDate format
6: StartDate must be before EndDate
```

:::

## List Journeys

<Badge type="info" text="GET" /> `/api/v1/journeys`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `journey.list`           |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| StatsStartDate | String | No  | Start date for stats (YYYY-MM-DD)     |
| StatsEndDate | String | No    | End date for stats (YYYY-MM-DD)       |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journeys \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.list",
    "SessionID": "your-session-id",
    "StatsStartDate": "2025-01-01",
    "StatsEndDate": "2025-01-31"
  }'
```

```json [Success Response]
{
  "Journeys": [
    {
      "JourneyID": "456",
      "JourneyName": "Welcome Series",
      "Trigger": "ListSubscription",
      "TriggerParameters": {
        "ListID": 123
      },
      "Status": "Enabled",
      "JourneyStats": {
        "ActiveSubscribers": 150,
        "TotalSubscribers": 500,
        "AggregatedEmailActions": {},
        "AggregatedDaysEmailActions": [],
        "TotalRevenue": 0,
        "DaysRevenue": []
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Invalid StatsStartDate format"
    }
  ]
}
```

```txt [Error Codes]
0: Success
4: Invalid StatsStartDate format
5: Invalid StatsEndDate format
6: StatsStartDate must be before StatsEndDate
```

:::

## Update a Journey

<Badge type="info" text="PATCH" /> `/api/v1/journey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.update`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to update           |
| Name      | String  | No       | Updated journey name                  |
| Notes     | String  | No       | Updated journey notes                 |
| Trigger   | String  | No       | Updated trigger type. Possible values: `Manual`, `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Tag`, `UnTag`, `CustomFieldValueChanged`, `RevenueHit`, `JourneyCompleted`, `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, `WebsiteEvent_conversion` |
| Trigger_ListID | Integer | No  | Updated list ID for triggers         |
| Trigger_EmailID | Integer | No | Updated email ID for triggers        |
| Trigger_Value | String/Integer | No | Updated trigger value              |
| Trigger_Criteria | Array | No  | Updated trigger criteria             |
| Run_Criteria | Array | No      | Updated run criteria                  |
| Run_Criteria_Operator | String | No | Updated run criteria operator. Possible values: `and`, `or` (default: `and`) |
| Rate_Limit_Per_Hour | Integer | No | Updated hourly rate limit           |
| Rate_Limit_Per_Day | Integer | No | Updated daily rate limit             |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.update",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "Name": "Welcome Series V2",
    "Notes": "Updated onboarding journey"
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series V2",
    "Trigger": "ListSubscription",
    "TriggerParameters": {
      "ListID": 123
    },
    "Status": "Enabled",
    "Notes": "Updated onboarding journey",
    "UpdatedAt": "2025-01-15 11:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 10,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
4: Missing Trigger_ListID parameter
5: Invalid Trigger_ListID parameter
6: Trigger_ListID matching record not found
7: Missing Trigger_EmailID parameter
8: Invalid Trigger_EmailID parameter
9: Trigger_EmailID matching record not found
10: Journey not found
11: Trigger_Value matching record not found
12: Invalid Trigger_Value parameter (CustomFieldValueChanged)
13: Trigger_Value matching record not found (CustomFieldValueChanged)
14: Invalid Trigger_Value parameter (RevenueHit)
15: Missing Trigger_Value parameter (RevenueHit)
16: Invalid Trigger_Value parameter (JourneyCompleted)
17: Trigger_Value matching record not found (JourneyCompleted)
18: Invalid rate_limit_per_hour parameter
19: Invalid rate_limit_per_day parameter
```

:::

## Delete a Journey

<Badge type="info" text="POST" /> `/api/v1/journey.delete`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.delete`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to delete           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.delete",
    "SessionID": "your-session-id",
    "JourneyID": 456
  }'
```

```json [Success Response]
{
  "JourneyID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
```

:::

## Delete Multiple Journeys

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `journeys.delete`        |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Journeys  | String | Yes      | Comma-separated journey IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journeys.delete",
    "SessionID": "your-session-id",
    "Journeys": "456,789,101"
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
1: Missing Journeys parameter
```

:::

## Enable a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.enable`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.enable`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to enable           |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.enable \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.enable",
    "SessionID": "your-session-id",
    "JourneyID": 456
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series",
    "Trigger": "ListSubscription",
    "Status": "Enabled",
    "UpdatedAt": "2025-01-15 12:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already enabled"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
4: Journey is already enabled
```

:::

## Disable a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.disable`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.disable`        |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to disable          |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.disable \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.disable",
    "SessionID": "your-session-id",
    "JourneyID": 456
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series",
    "Trigger": "ListSubscription",
    "Status": "Disabled",
    "UpdatedAt": "2025-01-15 13:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already disabled"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
4: Journey is already disabled
```

:::

## Update Journey Actions

::: tip Journey Action Types
For detailed documentation of each action type and its parameters, see [Journey Actions](/v5.8.0/api-reference/journey-actions).
:::

<Badge type="info" text="PATCH" /> `/api/v1/journey.actions`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.actions.update` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey                     |
| Actions   | Array   | Yes      | Array of action objects to update     |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/journey.actions \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.actions.update",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "Actions": [
      {
        "action": "SendEmail",
        "emailid": 123,
        "from": {
          "name": "Support",
          "email": "support@example.com"
        }
      }
    ]
  }'
```

```json [Success Response]
{
  "JourneyID": "456",
  "JourneyName": "Welcome Series",
  "Actions": [
    {
      "ActionID": "789",
      "Action": "SendEmail",
      "ActionParameters": {
        "EmailID": 123,
        "From": {
          "Name": "Support",
          "Email": "support@example.com"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 5,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing Actions parameter
3: Invalid JourneyID parameter
4: Invalid JourneyID parameter (Actions must be array)
5: Journey not found
6: Invalid action type or Journey not found
```

:::

## Update Actions Published Status

<Badge type="info" text="PATCH" /> `/api/v1/journey.actions.published`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.actions.published` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey                     |
| Actions   | Array   | Yes      | Array of action objects with published status |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/journey.actions.published \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.actions.published",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "Actions": [
      {
        "actionid": 789,
        "published": "true"
      }
    ]
  }'
```

```json [Success Response]
{
  "JourneyID": "456",
  "JourneyName": "Welcome Series",
  "Actions": [
    {
      "ActionID": "789",
      "Published": "true"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 6,
      "Message": "Action not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing Actions parameter
3: Invalid JourneyID parameter
4: Invalid JourneyID parameter (Actions must be array)
5: Journey not found
6: Action not found
7: Journey not found after update
```

:::

## Get Action Subscribers

<Badge type="info" text="GET" /> `/api/v1/journey.action.subscribers`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.action.subscribers` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey                     |
| ActionID  | Integer | Yes      | ID of the action                      |
| FilterJSON | String | No       | JSON array of filter items. Each item should be one of: `opened`, `clicked`, `converted`, `browser_viewed`, `forwarded`, `unsubscribed`, `bounced`, `spam_complaint` |
| Operator  | String  | No       | Filter operator. Possible values: `AND`, `OR` |
| RecordsPerRequest | Integer | No | Number of records per page (default: 25) |
| RecordsFrom | Integer | No     | Starting record offset (default: 0)   |
| OrderField | String | No      | Field to order by (default: EmailAddress) |
| OrderType | String  | No       | Order direction. Possible values: `ASC`, `DESC` (default: `ASC`) |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.action.subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.action.subscribers",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "ActionID": 789,
    "RecordsPerRequest": 25,
    "RecordsFrom": 0,
    "OrderField": "EmailAddress",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": "101",
      "EmailAddress": "user@example.com",
      "Suppressed": false
    }
  ],
  "TotalSubscribers": 150
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    {
      "Code": 5,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing ActionID parameter
3: Invalid JourneyID parameter
4: Invalid ActionID parameter
5: Journey not found (invalid journey ID or FilterJSON)
6: Action not found
```

:::
