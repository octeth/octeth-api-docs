---
layout: doc
---

# Event Tracking API Documentation

Website event tracking endpoints for capturing and managing user interactions and conversions.

## Track Website Events

<Badge type="info" text="POST" /> `/api/v1/event`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 5000 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `event.track`            |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Event     | String | Yes      | Event name (e.g., "page_view", "conversion", "identify") |
| ListID    | Integer| No       | List ID to associate the event with   |
| Email     | String | No       | Subscriber email address (validated)  |
| ID        | String | No       | External unique identifier for the subscriber |
| UUID      | String | No       | Event UUID (auto-generated if not provided) |
| Properties| Object | No       | Event properties (key-value pairs)    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/event \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "event.track",
    "APIKey": "your-api-key",
    "Event": "page_view",
    "ListID": 123,
    "Email": "subscriber@example.com",
    "ID": "user-12345",
    "Properties": {
      "$page_title": "Product Page",
      "$current_url": "https://example.com/products/item-1",
      "product_id": "item-1",
      "product_name": "Example Product"
    }
  }'
```

```json [Success Response]
{
  "status": "success",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "external_id": "user-12345",
  "identify_event_sent": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 5,
      "Message": "Missing event parameter"
    }
  ]
}
```

```txt [Error Codes]
4: Invalid ListID parameter
5: Missing event parameter
7: Invalid email parameter
8: Missing conversion-id event property (for conversion events)
9: Missing conversion-name event property (for conversion events)
10: Missing conversion-value event property (for conversion events)
```

:::

**Notes:**
- If none of `Email`, `ID`, or `UUID` is provided, a UUID is auto-generated
- For "conversion" events, the `Properties` object must include `conversion-id`, `conversion-name`, and `conversion-value`
- For "identify" events or when sending a new email, an identify event is sent to update subscriber information
- Test events can be sent by including `"isTest": true` in the `Properties` object (returns success without actual tracking)

## Get Website Event Properties

<Badge type="info" text="GET" /> `/api/v1/website_events.properties`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `website_events.properties` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| ListID    | Integer | Yes      | List ID to retrieve properties for    |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/website_events.properties?ListID=123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key"
```

```json [Success Response]
{
  "ListID": 123,
  "Properties": {
    "page_view": [
      "$page_title",
      "$current_url",
      "product_id"
    ],
    "conversion": [
      "conversion-id",
      "conversion-name",
      "conversion-value",
      "product_category"
    ],
    "custom_event": [
      "event_property_1",
      "event_property_2"
    ]
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
1: Missing ListID parameter
2: Invalid ListID parameter
3: List not found
```

:::

**Notes:**
- Returns all tracked event properties grouped by event type
- Properties are ordered alphabetically by event name and property name
- Used to discover what properties are being tracked for a specific list
