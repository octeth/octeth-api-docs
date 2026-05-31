---
layout: doc
---

# Saved Search Filters API Documentation

Manage per-user saved search filter presets (`oempro_search_filters`). Each filter
belongs to the authenticated user and is grouped by a `Scope` (currently
`CampaignSearch`; `SubscriberSearch` / `JourneySearch` are reserved). All endpoints
are owner-scoped — a user can only read, create, update, or delete their own
filters.

## Get Saved Filters

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php`
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                        |
|-----------|--------|----------|--------------------------------------------------------------------|
| Command   | String | Yes      | API command: `search.filters.get`                                  |
| SessionID | String | No       | Session ID obtained from login                                     |
| APIKey    | String | No       | API key for authentication                                         |
| Scope     | String | Yes      | Filter scope. Possible values: `CampaignSearch`                    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "search.filters.get",
    "APIKey": "your-api-key",
    "Scope": "CampaignSearch"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalFilters": 2,
  "Filters": [
    {
      "FilterID": 17,
      "Scope": "CampaignSearch",
      "Name": "Top performers (last 30d)",
      "Query": "{\"orderfield\":\"UniqueOpens\",\"ordertype\":\"DESC\",\"date_from\":\"2026-04-01\"}",
      "Options": { "Icon": "trending-up" }
    },
    {
      "FilterID": 18,
      "Scope": "CampaignSearch",
      "Name": "Plain-text only",
      "Query": "{\"emailformat\":\"Plain\"}",
      "Options": null
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 1, "Message": "Missing or unsupported scope" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing or unsupported scope
```

:::

## Create a Saved Filter

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php`
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                 |
|-----------|--------|----------|-----------------------------------------------------------------------------|
| Command   | String | Yes      | API command: `search.filters.create`                                        |
| SessionID | String | No       | Session ID obtained from login                                              |
| APIKey    | String | No       | API key for authentication                                                  |
| Scope     | String | Yes      | Filter scope. Possible values: `CampaignSearch`                             |
| Name      | String | Yes      | Display name for the saved filter                                           |
| Query     | String | Yes      | JSON-encoded filter payload (as understood by the corresponding browse API) |
| Options   | Object | No       | JSON object of presentation options (e.g. `{ "Icon": "trending-up" }`)      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "search.filters.create",
    "APIKey": "your-api-key",
    "Scope": "CampaignSearch",
    "Name": "Top performers (last 30d)",
    "Query": "{\"orderfield\":\"UniqueOpens\",\"ordertype\":\"DESC\"}",
    "Options": { "Icon": "trending-up" }
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "FilterID": 19
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 3, "Message": "Missing or invalid query (must be a JSON-encoded filter payload)" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing or unsupported scope
2: Missing required parameter: name
3: Missing or invalid query (must be JSON)
4: Invalid options (must be a JSON object)
```

:::

## Update a Saved Filter

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php`
:::

**Request Body Parameters:** (supply `FilterID` plus at least one updatable field)

| Parameter | Type    | Required | Description                                            |
|-----------|---------|----------|--------------------------------------------------------|
| Command   | String  | Yes      | API command: `search.filters.update`                   |
| SessionID | String  | No       | Session ID obtained from login                         |
| APIKey    | String  | No       | API key for authentication                             |
| FilterID  | Integer | Yes      | ID of the filter to update (must belong to the caller) |
| Name      | String  | No       | New display name                                       |
| Query     | String  | No       | New JSON-encoded filter payload                        |
| Options   | Object  | No       | New JSON options object                                |
| Scope     | String  | No       | New scope. Possible values: `CampaignSearch`           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "search.filters.update",
    "APIKey": "your-api-key",
    "FilterID": 19,
    "Name": "Top performers (renamed)"
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
  "Errors": [
    { "Code": 2, "Message": "Filter not found" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid filterid
2: Filter not found (or not owned by the calling user)
3: No updatable fields supplied
4: Invalid query (must be JSON)
5: Invalid options (must be a JSON object)
6: Unsupported scope
```

:::

## Delete a Saved Filter

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php`
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                            |
|-----------|---------|----------|--------------------------------------------------------|
| Command   | String  | Yes      | API command: `search.filters.delete`                   |
| SessionID | String  | No       | Session ID obtained from login                         |
| APIKey    | String  | No       | API key for authentication                             |
| FilterID  | Integer | Yes      | ID of the filter to delete (must belong to the caller) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "search.filters.delete",
    "APIKey": "your-api-key",
    "FilterID": 19
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
  "Errors": [
    { "Code": 2, "Message": "Filter not found" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid filterid
2: Filter not found (or not owned by the calling user)
```

:::
