---
layout: doc
---

# Event Tracking API Documentation

::: warning NOTICE
The API calls detailed in this document are compatible with Octeth's latest authorization method. You have the option to
include either the `SessionID` or `APIKey` parameter within the JSON request body.
:::

## Track an Event

<Badge type="info" text="POST" /> `/api/v1/event`

This API command is used to track an event. The event can be a page view, a custom event, or an identify event.

**Request Body:**

::: warning NOTICE
This API endpoint accepts raw body in JSON format.
:::

| Parameter    | Description                                                                                                                               | Required |
|--------------|-------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID    | The user's session ID.                                                                                                                    | Yes      | 
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                      | Yes      |
| ListID       | The ID of the list to which the event is associated.                                                                                      | Yes      |
| ID           | The custom ID associated with the event owner. If this parameter is empty or not provided, the system will generate a unique ID randomly. | No       |
| Event        | The type of event. Options include: ``.                                                                                                   | Yes      |
| Email        | The email address of the subscriber.                                                                                                      | Yes      |
| Properties.* | The properties array of the event.                                                                                                        | No       |

If the event is set to `conversion`, following event properties must be set:

- `conversion-id`: Ex: "my-order-234"
- `conversion-name`: Ex: "purchase"
- `conversion-value`: Ex: 290.50

If the event is set to `identify`, the `email` parameter is required and the `properties` array is optional.

::: code-group

```json [Example Request]
// Track "test" event
{
  // "SessionID": "{{sessionid}}"
  "APIKey": "{{user_apikey}}",
  "ListID": 94,
  "id": "user-id-2006",
  "event": "test",
  "email": "2006@test.com",
  "properties": {
    "number-of-subscribers-imported": 100
  }
}
```

```json [Success Response]
{
  "status": "success",
  "uuid": "13f8e79a-f063-4b80-10e4-b65a699a2f56",
  "external_id": "user-id-2006",
  "identify_event_sent": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Invalid ListID parameter"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                              |
|--------------------|------------|------------------------------------------|
| 422                | 1          | reserved                                 |
| 422                | 2          | reserved                                 |
| 422                | 3          | reserved                                 |
| 422                | 4          | Invalid ListID parameter                 |
| 422                | 5          | Missing event parameter.                 |
| 422                | 6          | Missing email parameter.                 |
| 422                | 7          | Invalid email parameter.                 |
| 422                | 8          | Missing conversion-id event property.    |
| 422                | 9          | Missing conversion-name event property.  |
| 422                | 10         | Missing conversion-value event property. |

## Retrieve Event Properties Of A List

<Badge type="info" text="POST" /> `/api/v1/website_events.properties`

This API command is used to retrieve the event properties of a list.

**Request Body:**

::: warning NOTICE
This API endpoint accepts raw body in JSON format.
:::

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      |
| ListID    | The ID of the list to which the event is associated.                 | Yes      |

::: code-group

```json [Example Request]
{
  // "SessionID":"{{sessionid}}",
  "APIKey": "{{user_apikey}}",
  "ListID": 3
}
```

```json [Success Response]
{
  "ListID": "3",
  "Properties": {
    "identify": [
      "$browser",
      "$browser_language",
      "$browser_version",
      "$current_url",
      "$device",
      "$device_type",
      "$dsn",
      "$host",
      "$id",
      "$lib",
      "$lib_version",
      "$list_id",
      "$os",
      "$pageTitle",
      "$page_title",
      "$pathname",
      "$referrer",
      "$referring_domain",
      "$screen_height",
      "$screen_width",
      "$sent_at",
      "$server",
      "$uuid",
      "$viewport_height",
      "$viewport_width",
      "emailAddress",
      "firstName",
      "lastName",
      "number-of-subscribers-imported"
    ],
    "pageView": [
      "$browser",
      "$browser_language",
      "$browser_version",
      "$current_url",
      "$device",
      "$device_type",
      "$dsn",
      "$host",
      "$lib",
      "$lib_version",
      "$list_id",
      "$os",
      "$pageTitle",
      "$pathname",
      "$referrer",
      "$referring_domain",
      "$screen_height",
      "$screen_width",
      "$sent_at",
      "$server",
      "$uuid",
      "$viewport_height",
      "$viewport_width",
      "url"
    ],
    "test": [
      "$browser",
      "$browser_language",
      "$browser_version",
      "$current_url",
      "$device",
      "$device_type",
      "$dsn",
      "$host",
      "$id",
      "$lib",
      "$lib_version",
      "$list_id",
      "$os",
      "$page_title",
      "$pathname",
      "$referrer",
      "$referring_domain",
      "$screen_height",
      "$screen_width",
      "$sent_at",
      "$server",
      "$uuid",
      "$viewport_height",
      "$viewport_width",
      "number-of-subscribers-imported"
    ]
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "List not found"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                              |
|--------------------|------------|------------------------------------------|
| 422                | 1          | Missing ListID parameter                 |
| 422                | 2          | Invalid ListID parameter                 |
| 422                | 3          | List not found                           |

