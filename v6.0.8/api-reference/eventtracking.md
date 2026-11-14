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
| ID        | String | No       | External unique identifier for the subscriber. Resolved against the list's unique-identifier custom field. May be a SHA256 email hash — see [Identifying without sending the email address](../using-octeth/event-tracking.md#identifying-without-sending-the-email-address). |
| UUID      | String | No       | Event UUID (auto-generated if not provided) |
| Properties| Object | No       | Event properties (key-value pairs)    |
| IdentifyProperties | Object | No | Custom-field values to write onto the matched or newly created subscriber, mirroring the 3rd argument of the browser tracker's `oct.eventI()`. Only applied to identify events. See below. |

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

### Writing custom fields with `IdentifyProperties`

`IdentifyProperties` carries **subscriber** custom-field values, written onto the matched or newly created subscriber. This is distinct from `Properties`, which carries **event** properties recorded against the identify event itself and never written to the subscriber record.

Each entry addresses one custom field on the list, by either:

1. the field's **merge tag alias**, e.g. `{"First-Name": "Jane"}`; or
2. the field's column key **`CustomField<CustomFieldID>`**, e.g. `{"CustomField732": "Jane"}`.

Both formats work identically on subscriber create and update.

**Precedence.** If both formats are supplied for the same field in one call, the **merge tag alias wins** and the `CustomField<ID>` entry is ignored.

**Keys that match nothing** are not saved and are recorded at DEBUG level in `data/logs/identify.log`. They are never applied to a different field. Only custom fields belonging to the authenticated user's list are matched.

**Key casing is normalised server-side**, so `IdentifyProperties[customfield732]` and `IdentifyProperties[CustomField732]` are equivalent over the public API. This is deliberate: the API dispatcher lowercases all nested request keys, so callers cannot rely on their original casing surviving the request.

```bash
curl -X POST https://example.com/api.php \
  --data-urlencode 'Command=event.track' \
  --data-urlencode 'APIKey=your-api-key' \
  --data-urlencode 'ListID=516' \
  --data-urlencode 'Event=identify' \
  --data-urlencode 'Email=newlead@example.com' \
  --data-urlencode 'IdentifyProperties[First-Name]=Jane' \
  --data-urlencode 'IdentifyProperties[CustomField734]=ORD-1001'
```

::: tip New in v5.9.3
`IdentifyProperties` was previously accepted by the browser tracker only — the API command silently discarded it, so custom fields could not be set server-to-server at all. The parameter is **additive and backward compatible**: omitting it leaves behaviour and the response byte-identical to previous versions, and the response shape is unchanged.
:::

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
