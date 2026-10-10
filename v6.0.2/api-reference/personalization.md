---
layout: doc
---

# Personalization API Documentation

Endpoints for working with the personalization-tag catalog (subscriber fields, link tags, user tags) that the email and content builders insert into messages.

## Get Personalization Tag Catalog

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns the personalization tag catalog for a given list, grouped by category. The Subscriber category includes the list's custom fields. This is the API equivalent of the dropdown rendered on the legacy List Settings screen and is intended for modern frontend clients that need the catalog dynamically rather than hard-coding a snapshot.

The handler is a thin wrapper over the `Personalization::*` static methods. The `Tag` value is returned exactly as the underlying method emits it — Handlebars syntax (<code v-pre>{{ Subscriber:Field }}</code>) for subscriber fields and the legacy `%Tag%` syntax for everything else. No syntax normalization is performed.

**Request Body Parameters:**

| Parameter         | Type    | Required | Description                                                                                                  |
|-------------------|---------|----------|--------------------------------------------------------------------------------------------------------------|
| Command           | String  | Yes      | API command: `personalization.gettags`                                                                       |
| SessionID         | String  | No       | Session ID obtained from login                                                                               |
| APIKey            | String  | No       | API key for authentication                                                                                   |
| SubscriberListID  | Integer | Yes      | Subscriber list ID. Must be owned by the authenticated user. Custom fields from this list are merged into the Subscriber catalog. |
| Categories        | String  | No       | Comma-separated category filter. Defaults to all three when omitted or blank. Possible values: `Subscriber`, `Link`, `User` |

**Response Shape:**

The `Tags` object is keyed by category. Categories absent from the request are absent from the response (they are not returned as empty arrays). Each entry is an object with three fields:

- `Tag` — the literal tag, including delimiters, returned as-is from the underlying static method.
- `Label` — human-readable label for the tag.
- `Description` — one-line description. Empty string for tags that do not have a description today; this field is reserved for incremental enrichment without breaking the response shape.

::: warning ErrorCode shape
On success, `ErrorCode` is the integer `0`. On error, `ErrorCode` is an array of one or more integer codes (e.g., `[2]`). This asymmetry follows the legacy `/api.php` convention used across all Octeth API handlers — typed clients should treat `ErrorCode` as a union of `int | int[]` rather than a single fixed type.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "personalization.gettags",
    "APIKey": "your-api-key",
    "SubscriberListID": 100,
    "Categories": "Subscriber,Link,User"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Tags": {
    "Subscriber": [
      { "Tag": "{{ Subscriber:FirstName }}",      "Label": "First Name",          "Description": "" },
      { "Tag": "{{ Subscriber:EmailAddress }}",   "Label": "Email Address",       "Description": "" },
      { "Tag": "%Subscriber:HashedSubscriberID%", "Label": "Hashed Subscriber ID", "Description": "" }
    ],
    "Link": [
      { "Tag": "%Link:Confirm%",     "Label": "Opt-In Confirmation Link", "Description": "" },
      { "Tag": "%Link:Reject%",      "Label": "Opt-In Reject Link",       "Description": "" },
      { "Tag": "%Link:Unsubscribe%", "Label": "Unsubscription Link",      "Description": "" }
    ],
    "User": [
      { "Tag": "%User:FirstName%",    "Label": "First Name",   "Description": "" },
      { "Tag": "%User:EmailAddress%", "Label": "Email Address", "Description": "" }
    ]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Invalid subscriber list id"]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter SubscriberListID
2: Invalid subscriber list id (list not found or not owned by the authenticated user)
3: Invalid Categories value (one or more values are not in: Subscriber, Link, User)
```

:::
