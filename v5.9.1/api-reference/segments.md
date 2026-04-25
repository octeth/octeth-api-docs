---
layout: doc
---

# Segment API Documentation

Segment management endpoints for creating, updating, and managing subscriber segments within email lists.

## Create a Segment

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segment.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segment.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list |
| SegmentName | String | Yes | Name of the segment |
| SegmentOperator | String | Yes | Logical operator for combining rules: `and` or `or` |
| SegmentRuleField | Array | No | Array of rule field names (old style) |
| SegmentRuleOperator | Array | No | Array of rule operators (old style) |
| SegmentRuleFilter | Array | No | Array of rule filter values (old style) |
| RulesJson | String | No | Segment rules in JSON format |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segment.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "SegmentName": "Active Subscribers",
    "SegmentOperator": "and",
    "RulesJson": "{\"rules\":[{\"field\":\"status\",\"operator\":\"equals\",\"value\":\"active\"}]}"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SegmentID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3],
  "ErrorText": ["Missing subscriber list id", "Missing segment name", "Missing segment operator"]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
2: Missing segment name
3: Missing segment operator
4: List not found or doesn't belong to user
```

:::

## Update a Segment

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segment.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segment.update`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SegmentID | Integer | Yes | ID of the segment to update |
| SegmentName | String | Yes | Name of the segment |
| SubscriberListID | Integer | No | ID of the subscriber list (to move segment) |
| SegmentOperator | String | No | Logical operator for combining rules: `and` or `or` |
| SegmentRuleField | Array | No | Array of rule field names (old style) |
| SegmentRuleOperator | Array | No | Array of rule operators (old style) |
| SegmentRuleFilter | Array | No | Array of rule filter values (old style) |
| RulesJson | String | No | Segment rules in JSON format |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segment.update",
    "SessionID": "your-session-id",
    "SegmentID": 456,
    "SegmentName": "Updated Active Subscribers",
    "SegmentOperator": "or"
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
  "ErrorCode": [1, 2, 4],
  "ErrorText": ["Missing segment id", "Missing segment name", "Invalid segment id"]
}
```

```txt [Error Codes]
0: Success
1: Missing segment id
2: Missing segment name
4: Invalid segment id
5: Invalid segment operator
```

:::

## Copy Segments

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segment.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segments.copy`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceListID | Integer | Yes | ID of the source subscriber list |
| TargetListID | Integer | Yes | ID of the target subscriber list |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segments.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 789
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
  "ErrorCode": [1, 2, 4],
  "ErrorText": ["Missing required field"]
}
```

```txt [Error Codes]
0: Success
1: Missing sourcelistid
2: Missing targetlistid
4: Invalid source subscriber id or Invalid target subscriber id
```

:::

## Delete Segments

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segments.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segments.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Segments  | String | Yes      | Comma-separated list of segment IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segments.delete",
    "SessionID": "your-session-id",
    "Segments": "456,457,458"
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
  "ErrorCode": [1],
  "ErrorText": ["Segment ids are missing"]
}
```

```txt [Error Codes]
0: Success
1: Segment ids are missing
```

:::

## Get Segments

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segments.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segments.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list |
| SegmentID | Integer | No | ID of specific segment to retrieve |
| IncludeTotals | Boolean | No | Include total counts (default: true) |
| OrderField | String | No | Field to order by: `SegmentName`, `SegmentID`, `SegmentOperator`, `SubscriberCount`, `SubscriberCountLastCalculatedOn` (default: `SegmentName`) |
| OrderType | String | No | Sort order: `ASC` or `DESC` (default: `DESC`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segments.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "OrderField": "SegmentName",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSegmentCount": 5,
  "Segments": [
    {
      "SegmentID": 456,
      "SegmentName": "Active Subscribers",
      "SegmentOperator": "and",
      "SubscriberCount": 1250,
      "SegmentRules": "...",
      "SegmentRulesJson": "{...}"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
```

:::
