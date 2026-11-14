---
layout: doc
---

# Search API Documentation

Search the authenticated user's account with [`search.global`](#global-search) and [`user.subscriber.search`](#search-subscribers-across-your-lists), and manage saved search filter presets with the `search.filters.*` commands.

## Saved Search Filters

Manage per-user saved search filter presets (`oempro_search_filters`). Each filter
belongs to the authenticated user and is grouped by a `Scope` (currently
`CampaignSearch`; `SubscriberSearch` / `JourneySearch` are reserved). All endpoints
are owner-scoped — a user can only read, create, update, or delete their own
filters.

::: tip Looking for a subscriber across every account?
These commands store a user's saved filters. To find a subscriber across your own lists, use [`user.subscriber.search`](#search-subscribers-across-your-lists). To find an email address, or every subscriber on a domain, across the lists of all users, administrators use [`admin.subscriber.search`](/v6.0.7/api-reference/admin#search-subscribers-across-all-lists).
:::

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

## Global Search

<Badge type="info" text="POST" /> `/api/v1/search.global`

::: tip API Usage Notes
- Authentication required: User API Key, or a user session
- Required permissions: none for the command itself. Each result group needs the permission of the command that lists the same records, see below
- Rate limit: 300 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.7
:::

Searches the authenticated user's own account and returns grouped results in one call. The command palette of the new interface (⌘K) calls it as the user types. Campaigns (by name or subject), lists, journeys, email templates, segments and SMS campaigns are matched by name, case-insensitively, anywhere in the name. When `Query` is a valid email address, the `Subscribers` group also looks it up exactly on every one of the user's lists.

Every group is scoped to the authenticated user: another user's records are never returned. A group is left out of `Groups` when the user group lacks its permission, and `SMSCampaigns` is left out when bulk SMS is switched off:

| Group | Required permission |
|---|---|
| `Subscribers` | `Subscribers.Get` |
| `Campaigns` | `Campaigns.Get` |
| `Lists` | `Lists.Get` |
| `Journeys` | `Campaign.Create` |
| `Templates` | `EmailTemplates.Manage` |
| `Segments` | `Segments.Get` |
| `SMSCampaigns` | `SMSCampaigns.Get` |

The subscriber lookup runs with a 3 second budget. When a list probe fails or times out, or the budget runs out, the group carries `Incomplete: true` and may be missing lists. A name group whose query fails carries `Incomplete: true` too. To search a whole domain, or to wait longer for a large account, use [`user.subscriber.search`](#search-subscribers-across-your-lists).

**Request Body Parameters:**

| Parameter    | Type    | Required | Description |
|--------------|---------|----------|-------------|
| Command      | String  | Yes      | API command: `search.global` |
| SessionID    | String  | No       | Session ID obtained from login |
| APIKey       | String  | No       | API key for authentication |
| Query        | String  | Yes      | The search term, 2 to 254 characters |
| LimitPerType | Integer | No       | Results per group. Default 5, at most 20 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/search.global \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "search.global",
    "APIKey": "your-api-key",
    "Query": "spring"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Query": "spring",
  "Groups": {
    "Campaigns": {
      "Total": 2,
      "Items": [
        {"CampaignID": 311, "CampaignName": "Spring sale", "CampaignStatus": "Sent", "Subject": "Spring is here"}
      ]
    },
    "Lists": {
      "Total": 1,
      "Items": [
        {"ListID": 42, "Name": "Spring leads", "ActiveSubscriberCount": 1200, "Archived": false}
      ]
    },
    "Journeys": {"Total": 1, "Items": [{"JourneyID": 8, "JourneyName": "Spring welcome", "Status": "Enabled"}]},
    "Templates": {"Total": 0, "Items": []},
    "Segments": {"Total": 1, "Items": [{"SegmentID": 3, "SegmentName": "Spring buyers", "ListID": 42, "ListName": "Spring leads"}]},
    "SMSCampaigns": {"Total": 0, "Items": []}
  }
}
```

```json [Email Query Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Query": "john@example.com",
  "Groups": {
    "Subscribers": {
      "Total": 1,
      "Items": [
        {"ListID": 42, "ListName": "Newsletter", "SubscriberID": 1234, "EmailAddress": "john@example.com", "SubscriptionStatus": "Subscribed", "BounceType": "Not Bounced", "Archived": false}
      ],
      "Incomplete": false
    },
    "Campaigns": {"Total": 0, "Items": []},
    "Lists": {"Total": 0, "Items": []},
    "Journeys": {"Total": 0, "Items": []},
    "Templates": {"Total": 0, "Items": []},
    "Segments": {"Total": 0, "Items": []},
    "SMSCampaigns": {"Total": 0, "Items": []}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Query must be at least 2 characters"
}
```

```txt [Error Codes]
0: Success
1: Missing Query parameter
2: Query must be at least 2 characters
3: Query must be at most 254 characters
```

:::

**Response fields:**

| Field | Description |
|---|---|
| `Query` | The search term, trimmed |
| `Groups.<Group>.Total` | Number of matches in the group. Can be larger than the number of `Items` |
| `Groups.<Group>.Items` | At most `LimitPerType` matches. Campaigns and SMS campaigns are newest first, the other groups are in name order |
| `Groups.<Group>.Incomplete` | Present and `true` when the group's search failed or ran out of time. Always present on `Subscribers` |
| `Subscribers.Items[]` | `ListID`, `ListName`, `SubscriberID`, `EmailAddress`, `SubscriptionStatus`, `BounceType`, `Archived` (the list is archived) |
| `Campaigns.Items[]` | `CampaignID`, `CampaignName`, `CampaignStatus`, `Subject`. Auto-resend copies are not returned |
| `Lists.Items[]` | `ListID`, `Name`, `ActiveSubscriberCount`, `Archived` |
| `Journeys.Items[]` | `JourneyID`, `JourneyName`, `Status` |
| `Templates.Items[]` | `TemplateID` (the template's `EmailID`), `TemplateName`, `Subject`. Deleted templates are not returned |
| `Segments.Items[]` | `SegmentID`, `SegmentName`, `ListID`, `ListName` |
| `SMSCampaigns.Items[]` | `SMSCampaignID`, `CampaignName`, `Status` |

## Search Subscribers Across Your Lists

<Badge type="info" text="POST" /> `/api/v1/user.subscriber.search`

::: tip API Usage Notes
- Authentication required: User API Key, or a user session
- Required permissions: `Subscribers.Get`
- Rate limit: 20 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.7
:::

Searches every one of the authenticated user's lists for one email address, or for every subscriber on one domain. Send either `EmailAddress` or `SearchDomain`, not both. The **Subscriber search** screen of the new interface calls this command. It takes the same parameters and returns the same shape as the administrators' [`admin.subscriber.search`](/v6.0.7/api-reference/admin#search-subscribers-across-all-lists), without the owner fields, because every list returned belongs to the caller.

Every list probe runs with a time limit, and the whole search has a time budget. When a probe fails or times out, or the budget runs out before every list was searched, the response is still a success but carries `Incomplete: true`, so the results may be missing lists. A domain search returns at most 500 subscribers and sets `Truncated: true` when that cap stopped it.

**Request Body Parameters:**

| Parameter    | Type   | Required | Description |
|--------------|--------|----------|-------------|
| Command      | String | Yes      | API command: `user.subscriber.search` |
| SessionID    | String | No       | Session ID obtained from login |
| APIKey       | String | No       | API key for authentication |
| EmailAddress | String | One of the two | Exact email address to search for |
| SearchDomain | String | One of the two | A domain such as `example.com` (a leading `@` is accepted, case does not matter). Finds every address that ends in `@` followed by that domain. A subdomain is a different domain. Letters, digits, hyphens and dots only, with at least two labels |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.subscriber.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.subscriber.search",
    "APIKey": "your-api-key",
    "EmailAddress": "john@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "EmailAddress": "john@example.com",
  "TotalLists": 2,
  "Lists": [
    {"ListID": 42, "ListName": "Newsletter", "SubscriberID": 1234, "SubscriptionStatus": "Subscribed", "BounceType": "Not Bounced", "Archived": false},
    {"ListID": 57, "ListName": "Spring promo", "SubscriberID": 88, "SubscriptionStatus": "Unsubscribed", "BounceType": "Hard", "Archived": true}
  ],
  "Incomplete": false
}
```

```bash [Domain Request]
curl -X POST https://example.com/api/v1/user.subscriber.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.subscriber.search",
    "APIKey": "your-api-key",
    "SearchDomain": "example.com"
  }'
```

```json [Domain Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SearchDomain": "example.com",
  "TotalLists": 1,
  "TotalMatches": 2,
  "Lists": [
    {
      "ListID": 42,
      "ListName": "Newsletter",
      "Archived": false,
      "Matches": [
        {"ListID": 42, "SubscriberID": 1234, "EmailAddress": "john@example.com", "SubscriptionStatus": "Subscribed", "BounceType": "Not Bounced"},
        {"ListID": 42, "SubscriberID": 1301, "EmailAddress": "mary@example.com", "SubscriptionStatus": "Opt-In Pending", "BounceType": "Not Bounced"}
      ]
    }
  ],
  "Incomplete": false,
  "Truncated": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid EmailAddress parameter"
}
```

```txt [Error Codes]
0: Success
1: Missing EmailAddress parameter (neither EmailAddress nor SearchDomain was sent)
2: Invalid EmailAddress parameter
3: Invalid SearchDomain parameter
4: Pass either EmailAddress or SearchDomain, not both
```

:::

**Response fields:**

| Field | Mode | Description |
|---|---|---|
| `EmailAddress` | Address | The address searched |
| `SearchDomain` | Domain | The domain searched, lowercased and without `@` |
| `TotalLists` | Both | Number of entries in `Lists` |
| `TotalMatches` | Domain | Number of subscribers in all `Matches` arrays |
| `Lists[].ListID`, `ListName`, `Archived` | Both | The list, and whether it is archived |
| `Lists[].SubscriberID`, `SubscriptionStatus`, `BounceType` | Address | The subscriber on that list |
| `Lists[].Matches[]` | Domain | Each subscriber on that list with an address on the domain: `ListID`, `SubscriberID`, `EmailAddress`, `SubscriptionStatus`, `BounceType` |
| `Incomplete` | Both | `true` when a list probe failed or timed out, or the time budget ran out, so lists may be missing |
| `Truncated` | Domain | `true` when the 500-subscriber cap stopped the search, so there may be more matches |

::: warning
A domain search reads each of your list tables in full, because it cannot use the email address index. On an account with many large lists it is far heavier than an address search. The cap and the time limits bound one request.
:::
