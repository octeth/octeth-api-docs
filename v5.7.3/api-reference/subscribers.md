---
layout: doc
---

# Subscriber API Documentation

Subscriber management endpoints for managing email list subscribers, including creation, updates, imports, exports, tagging, and journey management.

## Create a Subscriber

<Badge type="info" text="POST" /> `/api/v1/subscriber.create`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.create`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Yes   | Email address of the subscriber       |
| Status    | String | No       | Subscription status: Opt-In Pending, Subscribed, Opt-Out Pending, Unsubscribed (default: Subscribed) |
| OptInDate | String | No       | Opt-in date in Y-m-d or Y-m-d H:i:s format |
| SubscriptionDate | String | Conditional | Required if Status is Subscribed or Opt-In Pending (Y-m-d or Y-m-d H:i:s format) |
| SubscriptionIP | String | Conditional | Required if Status is Subscribed or Opt-In Pending (IP address) |
| UnsubscriptionDate | String | Conditional | Required if Status is Unsubscribed or Opt-Out Pending (Y-m-d or Y-m-d H:i:s format) |
| UnsubscriptionIP | String | Conditional | Required if Status is Unsubscribed or Opt-Out Pending (IP address) |
| BounceType | String | No      | Bounce type: Not Bounced, Soft, Hard (default: Not Bounced) |
| CustomFields | Object | No     | Custom field values (key: CustomFieldID, value: field value) |
| OptInConfirmationEmailID | Integer | No | Email ID to send for opt-in confirmation |
| UpdateIfDuplicate | Boolean | No | Update subscriber if email already exists (default: false) |
| UpdateIfUnsubscribed | Boolean | No | Update subscriber if previously unsubscribed (default: false) |
| ApplyBehaviors | Boolean | No | Apply list subscription behaviors (default: false) |
| SendConfirmationEmail | Boolean | No | Send opt-in confirmation email (default: false) |
| UpdateStatistics | Boolean | No | Update list statistics (default: false) |
| TriggerWebServices | Boolean | No | Trigger web service integrations (default: false) |
| TriggerAutoResponders | Boolean | No | Trigger autoresponders (default: false) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.create \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.create",
    "SessionID": "your-session-id",
    "ListID": 123,
    "EmailAddress": "subscriber@example.com",
    "Status": "Subscribed",
    "SubscriptionDate": "2025-01-01 12:00:00",
    "SubscriptionIP": "192.168.1.1",
    "CustomFields": {
      "1": "John",
      "2": "Doe"
    }
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": 456,
    "EmailAddress": "subscriber@example.com",
    "SubscriptionStatus": "Subscribed",
    "SubscriptionDate": "2025-01-01 12:00:00"
  },
  "Suppressed": false,
  "SubscriberTags": [],
  "SubscriberSegments": [],
  "SubscriberJourneys": [],
  "SubscriberWebsiteEvents": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "Errors": [
    {
      "Code": 2,
      "Message": "Missing EmailAddress parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid EmailAddress
4: Invalid ListID
5: Invalid BounceType value
6: Invalid Status value
7: Invalid SubscriptionDate value
8: Missing SubscriptionDate parameter
9: Missing SubscriptionIP parameter
10: Invalid SubscriptionIP value
11: Missing UnsubscriptionDate parameter
12: Missing UnsubscriptionIP parameter
13: Invalid UnsubscriptionDate value
14: Invalid UnsubscriptionIP value
15: Missing OptInDate parameter
16: Invalid OptInDate value
17: Invalid Custom Field value
18: Subscriber create limit is exceeded
19: Invalid EmailAddress
20: Duplicate EmailAddress
21: Previously unsubscribed EmailAddress
22: Invalid user information
23: Invalid list information
24: Invalid OptInConfirmationEmailID value
25: Invalid OptInConfirmationEmailID (email does not exist or does not belong to user)
```

:::

## Subscribe to a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.subscribe`   |
| ListID    | String | Yes      | ID of the subscriber list (can be comma-separated for multiple lists) |
| EmailAddress | String | Yes   | Email address of the subscriber       |
| IPAddress | String | Yes      | IP address of the subscriber          |
| CustomFieldN | String | No    | Custom field values (N = CustomFieldID) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.subscribe",
    "ListID": "123",
    "EmailAddress": "subscriber@example.com",
    "IPAddress": "192.168.1.1",
    "CustomField1": "John",
    "CustomField2": "Doe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberID": 456,
  "RedirectURL": "https://example.com/confirmation",
  "Subscriber": {
    "SubscriberID": 456,
    "EmailAddress": "subscriber@example.com",
    "SubscriptionStatus": "Opt-In Pending"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Missing IPAddress parameter
4: Invalid ListID
5: Invalid EmailAddress
6: Required custom field missing
7: Custom field value is not unique
8: Invalid custom field value
9: Duplicate email address
10: Subscription failed
11: Invalid user information
101: Plugin validation failed
```

:::

## Unsubscribe from a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.unsubscribe` |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| IPAddress | String | Yes      | IP address of the subscriber          |
| EmailAddress | String | Conditional | Email address (required if SubscriberID and RulesJSON not provided) |
| SubscriberID | Integer | Conditional | Subscriber ID (required if EmailAddress and RulesJSON not provided) |
| RulesJSON | String | Conditional | JSON rules for bulk unsubscription (required if EmailAddress and SubscriberID not provided) |
| RulesOperator | String | Conditional | Rules operator: and, or (required if RulesJSON provided) |
| CampaignID | Integer | No      | ID of the campaign (for tracking)     |
| EmailID   | Integer | No       | ID of the email (for tracking)        |
| AutoResponderID | Integer | No | ID of the autoresponder (for tracking) |
| Channel   | String | No       | Unsubscription channel (for tracking) |
| AddToGlobalSuppression | Boolean | No | Add to global suppression list (default: false) |
| Preview   | Integer | No       | Preview mode (1 = don't actually unsubscribe) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.unsubscribe",
    "ListID": 123,
    "EmailAddress": "subscriber@example.com",
    "IPAddress": "192.168.1.1"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/unsubscribe-confirmed"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing IPAddress parameter
3: Missing EmailAddress/SubscriberID parameter
4: Invalid ListID
5: Invalid user information
6: Invalid EmailAddress
7: Subscriber not found
8: Invalid CampaignID
9: Subscriber already unsubscribed
10: Invalid EmailID
11: Invalid query builder response
```

:::

## Delete Subscribers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.delete`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |
| Subscribers | String | Conditional | Comma-separated subscriber IDs (required if RulesJSON not provided) |
| RulesJSON | String | Conditional | JSON rules for bulk deletion (required if Subscribers not provided) |
| RulesOperator | String | Conditional | Rules operator: and, or (required if RulesJSON provided) |
| Suppressed | Boolean | No      | Delete from suppression list instead (default: false) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.delete",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Subscribers": "456,789,101"
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
  "ErrorCode": 2,
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
0: Success
2: Missing subscriber list id
5: Invalid list id
6: Invalid query builder response
```

:::

## Delete All Subscribers from a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.delete.all` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| DeleteListTags | Boolean | No | Also delete tag entities (default: false; tag associations always deleted) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.delete.all",
    "SessionID": "your-session-id",
    "ListID": 123,
    "DeleteListTags": false
  }'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
3: Invalid list ID
4: Access denied to this list
5: Failed to delete subscribers
6: Failed to delete tag associations
7: Failed to delete tag entities
8: An error occurred during deletion
```

:::

## Search Subscribers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.search`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| Operator  | String | Yes      | Rules operator: and, or               |
| Rules     | String | No       | Legacy rules format                   |
| RulesJSON | String | No       | JSON rules format                     |
| RecordsPerRequest | Integer | No | Number of records to return (default: 25) |
| RecordsFrom | Integer | No   | Offset for pagination (default: 0)    |
| OrderField | String | No      | Field to order by (default: EmailAddress) |
| OrderType | String | No       | Order direction: ASC, DESC (default: ASC) |
| OnlyTotal | Boolean | No      | Return only total count (default: false) |
| AddMustHaveFilters | Boolean | No | Add mandatory filters for segment rules (default: false) |
| DebugQueryBuilder | Boolean | No | Return SQL query for debugging (default: false) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.search",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Operator": "and",
    "RulesJSON": "[{\"field\":\"EmailAddress\",\"operator\":\"contains\",\"value\":\"example.com\"}]",
    "RecordsPerRequest": 50,
    "RecordsFrom": 0
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSubscribers": 150,
  "Subscribers": [
    {
      "SubscriberID": 456,
      "EmailAddress": "user@example.com",
      "SubscriptionStatus": "Subscribed",
      "SubscriberTags": [],
      "Suppressed": false,
      "TotalRevenue": 0
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing Operator parameter
3: ListID not found
4: Problem with the segment engine
5: Segment recursion limit exceeded
```

:::

## Import Subscribers (Legacy Multi-Step)

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

::: warning DEPRECATED
This is a legacy multi-step import endpoint. **Use [`subscribers.import.post`](#import-subscribers-modern-single-step) (via `/api/v1/subscribers.import`) for new integrations.**

The modern endpoint provides:
- Single-step import (no multi-step workflow)
- Support for CSV, Mailchimp, ActiveCampaign, and Drip imports
- Better error handling and validation
- Webhook notifications on completion
- Tag assignment during import
:::

**Request Body Parameters (Step 1):**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ImportStep | Integer | Yes     | Import step: 1 or 2                   |
| ListID    | Integer| No       | ID of the subscriber list             |
| ImportType | String | Yes      | Import type: Copy, File, MySQL        |
| ImportData | String | Conditional | CSV data (required if ImportType = Copy) |
| ImportFileName | String | Conditional | File name (required if ImportType = File) |
| ImportMySQLHost | String | Conditional | MySQL host (required if ImportType = MySQL) |
| ImportMySQLPort | Integer | Conditional | MySQL port (required if ImportType = MySQL) |
| ImportMySQLDatabase | String | Conditional | MySQL database (required if ImportType = MySQL) |
| ImportMySQLQuery | String | Conditional | MySQL query (required if ImportType = MySQL) |
| FieldTerminator | String | No | Field delimiter (default: ,)          |
| FieldEncloser | String | No  | Field encloser (default: ")           |
| MappedFields | Object | No   | Field mapping (CustomFieldID: FieldName) |

::: code-group

```bash [Example Request - Step 1]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.import",
    "SessionID": "your-session-id",
    "ImportStep": 1,
    "ListID": 123,
    "ImportType": "Copy",
    "ImportData": "email,name\nuser@example.com,John Doe",
    "FieldTerminator": ",",
    "FieldEncloser": "\""
  }'
```

```json [Success Response - Step 1]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ImportID": 789,
  "ImportFields": [
    {
      "FIELD1": "email",
      "FIELD2": "name"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ImportType parameter
2: Missing ImportData parameter
3: Invalid ImportStep
4: Invalid ListID
5: Failed to parse CSV data
6: Import record already processed
7: EmailAddress field mapped more than once
8: EmailAddress field not mapped
9: Missing ImportFileName parameter
10: Missing ImportMySQLHost parameter
11: Missing ImportMySQLPort parameter
12: Missing ImportMySQLDatabase parameter
13: Import file does not exist
14: Missing ImportMySQLQuery parameter
15: MySQL connection failed
16: MySQL query failed
17: Import type not supported
18: File size exceeds maximum allowed size
```

:::

## Export Subscribers (Create Export Job)

<Badge type="info" text="POST" /> `/api/v1/subscribers.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.export.post` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| RulesJSON | Array  | Yes      | JSON rules for filtering subscribers  |
| RulesOperator | String | Yes   | Rules operator: and, or               |
| ExportFormat | String | Yes   | Export format: csv, json              |
| FieldsToExport | Array | Yes  | Array of field names to export        |
| Target    | String | No       | Target segment: Active, Suppressed, Unsubscribed, Soft bounced, Hard bounced, or segment ID |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscribers.export \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.export.post",
    "SessionID": "your-session-id",
    "ListID": 123,
    "RulesJSON": [],
    "RulesOperator": "and",
    "ExportFormat": "csv",
    "FieldsToExport": ["EmailAddress", "SubscriptionDate"],
    "Target": "Active"
  }'
```

```json [Success Response]
{
  "ExportID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing RulesJSON parameter
3: Missing RulesOperator parameter
4: Missing ExportFormat parameter
5: Missing FieldsToExport parameter
6: Invalid ListID parameter
7: Invalid RulesJSON syntax
8: RulesOperator must be either "and" or "or"
9: ExportFormat must be either "csv" or "json"
10: List not found
11: Target must be valid status or segment ID
12: Segment not found
```

:::

## Get Export Job Status

<Badge type="info" text="GET" /> `/api/v1/subscribers.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.export.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| ExportID  | Integer| No       | ID of the export job (omit to list all export jobs) |
| Download  | Boolean| No       | Download the export file (only when ExportID provided and status is Completed) |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/subscribers.export?Command=subscribers.export.get&SessionID=your-session-id&ListID=123&ExportID=456"
```

```json [Success Response]
{
  "ExportJob": {
    "ExportID": 456,
    "Module": "SubscriberExport",
    "Status": "Completed",
    "ExportOptions": {
      "Command": "ExportSubscribers",
      "ListID": 123,
      "FileFormat": "csv",
      "Fields": ["EmailAddress", "SubscriptionDate"]
    },
    "SubmittedAt": "2025-01-01 12:00:00",
    "FinishedAt": "2025-01-01 12:05:00",
    "DownloadSize": 1024000
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Invalid ListID parameter
3: Invalid ExportID parameter
4: List not found
5: Invalid ExportID parameter
6: Export job not found
```

:::

## Import Subscribers (Modern Single-Step)

<Badge type="info" text="POST" /> `/api/v1/subscribers.import`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import.post` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| AddToGlobalSuppressionList | Boolean | Yes | Add failed imports to global suppression |
| AddToSuppressionList | Boolean | Yes | Add failed imports to list suppression |
| UpdateDuplicates | Boolean | Yes | Update existing subscribers on duplicate |
| TriggerActions | Boolean | Yes | Trigger autoresponders and journeys   |
| Tags      | Array  | Yes      | Array of tag names to apply to imported subscribers |
| ImportFrom | Object | Yes     | Import source configuration           |
| ImportFrom.CSV.URL | String | Conditional | URL to fetch CSV data (required if ImportFrom.CSV.Data not provided) |
| ImportFrom.CSV.Data | String | Conditional | CSV data string (required if ImportFrom.CSV.URL not provided) |
| ImportFrom.CSV.FieldTerminator | String | Yes (for CSV) | Field delimiter |
| ImportFrom.CSV.FieldEncloser | String | No | Field encloser (default: empty) |
| ImportFrom.CSV.EscapedBy | String | Yes (for CSV) | Escape character |
| ImportFrom.CSV.MappedFields | Object | Yes (for CSV) | Field mapping (FieldName: CustomFieldID or EmailAddress) |
| ImportStatusUpdateWebhookURL | String | No | Webhook URL to notify on import completion |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscribers.import \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.import.post",
    "SessionID": "your-session-id",
    "ListID": 123,
    "AddToGlobalSuppressionList": false,
    "AddToSuppressionList": false,
    "UpdateDuplicates": true,
    "TriggerActions": true,
    "Tags": ["newsletter", "2025"],
    "ImportFrom": {
      "CSV": {
        "Data": "email,name\nuser@example.com,John Doe",
        "FieldTerminator": ",",
        "FieldEncloser": "\"",
        "EscapedBy": "\\",
        "MappedFields": {
          "FIELD1": "EmailAddress",
          "FIELD2": "1"
        }
      }
    }
  }'
```

```json [Success Response]
{
  "ImportID": 789,
  "ImportType": "async"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing FieldTerminator parameter
4: Missing AddToGlobalSuppressionList parameter
5: Missing AddToSuppressionList parameter
6: Missing UpdateDuplicates parameter
7: Missing TriggerActions parameter
8: Missing MappedFields parameter
9: Invalid AddToGlobalSuppressionList parameter
10: Invalid AddToSuppressionList parameter
11: Invalid UpdateDuplicates parameter
12: Invalid TriggerActions parameter
13: Invalid MappedFields parameter
14: ImportFrom source must be provided
15: Fields are not mapped
16: Missing EscapedBy parameter
17: Field mapping is invalid
18: ImportFrom.CSV.URL remote data fetch failure
19: List not found
20: Invalid ListID parameter / Failed to create import record
21: Missing Tags parameter
```

:::

## Get Import Job Status

<Badge type="info" text="GET" /> `/api/v1/subscribers.import`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| ImportID  | Integer| Yes      | ID of the import job                  |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/subscribers.import?Command=subscribers.import.get&SessionID=your-session-id&ListID=123&ImportID=789"
```

```json [Success Response]
{
  "ImportJob": {
    "ImportID": 789,
    "ImportDate": "2025-01-01 12:00:00",
    "FinishedAt": "2025-01-01 12:05:00",
    "ImportStatus": "Completed",
    "FailedData": "",
    "TotalSubscribers": 1000,
    "TotalImported": 950,
    "TotalDuplicates": 30,
    "TotalFailed": 20
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing ImportID parameter
3: Invalid ListID parameter
4: Invalid ImportID parameter
5: List not found
6: Invalid ImportID parameter
7: Import job not found
```

:::

## Prepare Import from Third-Party Service

<Badge type="info" text="POST" /> `/api/v1/subscribers.import`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

This endpoint prepares import by fetching metadata from third-party services (Mailchimp, ActiveCampaign, Drip).

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import.prepare` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ImportFrom | Object | Yes     | Import source configuration           |
| ImportFrom.Mailchimp.APIKey | String | Conditional | Mailchimp API key |
| ImportFrom.Mailchimp.Server | String | Conditional | Mailchimp server (e.g., us1) |
| ImportFrom.ActiveCampaign.APIKey | String | Conditional | ActiveCampaign API key |
| ImportFrom.ActiveCampaign.AccountName | String | Conditional | ActiveCampaign account name |
| ImportFrom.Drip.APIKey | String | Conditional | Drip API key |

::: code-group

```bash [Example Request - Mailchimp]
curl -X POST https://example.com/api/v1/subscribers.import \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.import.prepare",
    "SessionID": "your-session-id",
    "ImportFrom": {
      "Mailchimp": {
        "APIKey": "your-mailchimp-api-key",
        "Server": "us1"
      }
    }
  }'
```

```json [Success Response - Mailchimp]
{
  "Lists": [
    {
      "ID": "abc123",
      "Name": "Newsletter List",
      "ActiveSubscribersCount": 1500,
      "SubscribersCount": 2000,
      "MergeFields": [
        {
          "ID": "FNAME",
          "Name": "First Name",
          "Type": "text"
        }
      ],
      "Tags": [
        {
          "ID": 456,
          "Name": "VIP"
        }
      ],
      "Groups": []
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "ImportFrom.Mailchimp.APIKey, ImportFrom.ActiveCampaign.APIKey or ImportFrom.Drip.APIKey must be provided"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: ImportFrom source must be provided
2: Invalid ImportFrom source
3: ActiveCampaign API key is missing
4: ActiveCampaign account name is missing
5: ActiveCampaign Error
7: Mailchimp API key is missing
8: Mailchimp server is missing
9: Mailchimp Error / Drip Error
11: Mailchimp Error While Retrieving Lists
12: Mailchimp Error While Retrieving Merge Fields
13: Mailchimp Error While Retrieving Tags
14: Mailchimp Error While Retrieving Interest Categories
15: Mailchimp Error While Retrieving Interests
16-23: Various third-party API errors
```

:::

## Get Subscribers List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.get`        |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |
| SubscriberSegment | String | Yes | Segment: Active, Suppressed, Unsubscribed, Soft bounced, Hard bounced, Opt-in pending, or segment ID |
| RecordsPerRequest | Integer | No | Number of records to return (default: 25) |
| RecordsFrom | Integer | No   | Offset for pagination (default: 0)    |
| OrderField | String | No      | Field to order by (default: EmailAddress) |
| OrderType | String | No       | Order direction: ASC, DESC (default: ASC) |
| SearchField | String | No      | Field to search in                    |
| SearchKeyword | String | No    | Search keyword                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "SubscriberSegment": "Active",
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "OrderField": "SubscriptionDate",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": 456,
      "EmailAddress": "user@example.com",
      "SubscriptionStatus": "Subscribed",
      "SubscriptionDate": "2025-01-01 12:00:00"
    }
  ],
  "TotalSubscribers": 1500
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing SubscriberListID parameter
2: Missing SubscriberSegment parameter
3: Invalid ListID or list does not belong to user
```

:::

## Update a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Subscriber session
- Required permissions: `Subscriber.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.update`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |
| EmailAddress | String | No    | New email address                     |
| SubscriptionStatus | String | No | New status: Opt-In Pending, Subscribed, Opt-Out Pending, Unsubscribed |
| UnsubscriptionIP | String | No | IP address for unsubscription        |
| UnsubscriptionDate | String | No | Date for unsubscription (Y-m-d H:i:s) |
| BounceType | String | No      | Bounce type: Not Bounced, Soft, Hard  |
| Fields    | Object | No       | Custom field values (CustomFieldID: value) |
| IgnoreAllOtherCustomFieldsExceptGivenOnes | Boolean | No | Only update specified fields (default: false) |
| TriggerEvents | Boolean | No   | Trigger journey events (default: true) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.update",
    "SessionID": "your-session-id",
    "SubscriberID": 456,
    "SubscriberListID": 123,
    "EmailAddress": "newemail@example.com",
    "Fields": {
      "CustomField1": "Updated Value"
    }
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing SubscriberID parameter
2: Missing SubscriberListID parameter
3: Missing EmailAddress parameter
4: Invalid EmailAddress
5: Invalid ListID
6: Subscriber not found
7: Duplicate EmailAddress
8: Required custom field missing
9: Custom field value is not unique
10: Invalid custom field value
```

:::

## Get a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Subscriber session
- Required permissions: `Subscribers.Get`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.get`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Conditional | Email address (required if SubscriberID not provided) |
| SubscriberID | Integer | Conditional | Subscriber ID (required if EmailAddress not provided) |
| IncludeJourneys | Boolean | No | Include journey data (default: true) |
| IncludeEvents | Boolean | No | Include website events (default: true) |
| IncludeActivity | Boolean | No | Include activity log (default: true) |
| IncludeRevenue | Boolean | No | Include revenue data (default: true) |
| IncludeTags | Boolean | No | Include tags (default: true)          |
| IncludeSegments | Boolean | No | Include segments (default: true)      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.get",
    "SessionID": "your-session-id",
    "ListID": 123,
    "EmailAddress": "user@example.com",
    "IncludeJourneys": true,
    "IncludeEvents": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": 456,
    "EmailAddress": "user@example.com",
    "SubscriptionStatus": "Subscribed",
    "SubscriptionDate": "2025-01-01 12:00:00"
  },
  "Suppressed": false,
  "SubscriberTags": [
    {
      "TagID": 1,
      "TagName": "VIP"
    }
  ],
  "SubscriberSegments": [],
  "SubscriberJourneys": [],
  "SubscriberWebsiteEvents": [],
  "SubscriberActivity": [],
  "TotalRevenue": 0
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
1: Missing EmailAddress/SubscriberID parameter
2: Missing ListID parameter
3: Subscriber not found
4: Invalid ListID
429: Too many requests (rate limit exceeded)
```

:::

## Get Subscriber Activity

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Subscriber session
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.get.activity` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.get.activity",
    "SessionID": "your-session-id",
    "SubscriberID": 456,
    "SubscriberListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Activity": [
    {
      "ActivityType": "EmailOpen",
      "CampaignID": 789,
      "EmailID": 101,
      "ActivityDate": "2025-01-15 10:30:00"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing SubscriberID parameter
2: Missing SubscriberListID parameter
3: Subscriber not found
```

:::

## Check if Subscriber Exists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.exists`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Yes   | Email address to check                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.exists",
    "SessionID": "your-session-id",
    "ListID": 123,
    "EmailAddress": "user@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Exists": true,
  "SubscriberID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid ListID
```

:::

## Get Subscriber Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Subscriber session
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.getlists`    |
| SessionID | String | Yes      | Subscriber session ID                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.getlists",
    "SessionID": "subscriber-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Lists": [
    {
      "ListID": 123,
      "ListName": "Newsletter",
      "SubscriptionStatus": "Subscribed"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Authentication failure or session expired
```

:::

## Subscriber Login

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.login`       |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Yes   | Email address of the subscriber       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.login",
    "ListID": 123,
    "EmailAddress": "user@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SessionID": "subscriber-session-id",
  "SubscriberInformation": {
    "SubscriberID": 456,
    "EmailAddress": "user@example.com",
    "SubscriptionStatus": "Subscribed"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid EmailAddress
4: Subscriber not found
```

:::

## Confirm Opt-In

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.optin`       |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| ConfirmationCode | String | Yes | Opt-in confirmation code            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.optin",
    "ListID": 123,
    "SubscriberID": 456,
    "ConfirmationCode": "abc123def456"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/welcome"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing ConfirmationCode parameter
4: Invalid confirmation code
5: Subscriber not found
```

:::

## Tag a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscriber.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tag`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| TagID     | Integer| Yes      | ID of the tag to apply                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tag",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "TagID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing TagID parameter
4: Invalid ListID
5: Invalid TagID
6: Subscriber not found
```

:::

## Untag a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscriber.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.untag`       |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| TagID     | Integer| Yes      | ID of the tag to remove               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.untag",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "TagID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing TagID parameter
4: Invalid ListID
5: Invalid TagID
6: Subscriber not found
```

:::

## Create a Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.create` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| TagName   | String | Yes      | Name of the tag                       |
| TagDescription | String | No   | Description of the tag                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.create",
    "SessionID": "your-session-id",
    "ListID": 123,
    "TagName": "VIP Customer",
    "TagDescription": "High-value customers"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TagID": 789
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing TagName parameter
3: Invalid ListID
4: Tag name already exists
```

:::

## Update a Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.update` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| TagID     | Integer| Yes      | ID of the tag                         |
| TagName   | String | No       | New name of the tag                   |
| TagDescription | String | No   | New description of the tag            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.update",
    "SessionID": "your-session-id",
    "ListID": 123,
    "TagID": 789,
    "TagName": "Premium Customer"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing TagID parameter
3: Invalid ListID
4: Invalid TagID
5: Tag name already exists
```

:::

## Get Subscriber Tags

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.get`    |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.get",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Tags": [
    {
      "TagID": 789,
      "TagName": "VIP Customer",
      "TagDescription": "High-value customers",
      "SubscriberCount": 50
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Invalid ListID
```

:::

## Delete a Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.delete` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| TagID     | Integer| Yes      | ID of the tag to delete               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.delete",
    "SessionID": "your-session-id",
    "ListID": 123,
    "TagID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing TagID parameter
3: Invalid ListID
4: Invalid TagID
```

:::

## Trigger Journey for Subscriber

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.trigger`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.trigger` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| JourneyID | Integer| Yes      | ID of the journey to trigger          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.trigger \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.trigger",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "JourneyID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing JourneyID parameter
4: Invalid ListID
5: Invalid SubscriberID
6: Invalid JourneyID
```

:::

## Remove Subscriber from Journey

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.remove`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.remove` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| JourneyID | Integer| Yes      | ID of the journey                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.remove \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.remove",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "JourneyID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing JourneyID parameter
4: Invalid ListID
5: Invalid SubscriberID
6: Invalid JourneyID
```

:::

## Exit Subscriber from Journey

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.exit`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.exit` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| JourneyID | Integer| Yes      | ID of the journey                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.exit \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.exit",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "JourneyID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing JourneyID parameter
4: Invalid ListID
5: Invalid SubscriberID
6: Invalid JourneyID
```

:::

## List Subscriber Journeys

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.list`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.list` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.list \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.list",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Journeys": [
    {
      "JourneyID": 789,
      "JourneyName": "Welcome Series",
      "Status": "Active",
      "JoinedAt": "2025-01-01 12:00:00"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Invalid ListID
4: Invalid SubscriberID
```

:::
