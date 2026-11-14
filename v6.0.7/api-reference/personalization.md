---
layout: doc
---

# Personalization API Documentation

Endpoints for working with the personalization-tag catalog (subscriber fields, link tags, user tags, RSS feed tags) that the email and content builders insert into messages, and for previewing the RSS feeds an email embeds.

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
| Categories        | String  | No       | Comma-separated category filter. Defaults to `Subscriber`, `Link` and `User` when omitted or blank. Possible values: `Subscriber`, `Link`, `User`, `RSS`. <Badge type="tip" text="New in v6.0.7" /> `RSS` is returned only when requested, and only to a user whose group has the `Email.RSSFeeds` permission. Without the permission the `RSS` key is absent from `Tags`. |

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

## Preview an RSS Feed <Badge type="tip" text="New in v6.0.7" />

<Badge type="info" text="POST" /> `/api/v1/rss.feed.preview`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Email.RSSFeeds`
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Fetches an RSS or Atom feed and returns its items, so an editor can show what an RSS block in an email will contain before the email is sent. The feed is fetched live with a 10 second budget, and the URL and every redirect must resolve to a public address. The 300 second cache that sending uses is neither read nor written, so a fixed feed shows its fix at once.

An RSS block in email content has the form `%RSS:<feed url>:<item count>%`, followed by the template repeated once per item, followed by `%RSS:END%`. Inside the template, `%RSS:TITLE%` and `%RSS:CONTENT%` (each with an optional maximum length, as in `%RSS:TITLE:60%`), `%RSS:IMAGE%`, `%RSS:POST-LINK%`, `%RSS:COMMENTS-LINK%`, `%RSS:PUBLISH-DATE%` and `%RSS:AUTHOR%` are replaced with the item's values. For a user whose group lacks `Email.RSSFeeds`, every RSS block is removed from the email when it is sent.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                       |
|-----------|---------|----------|-------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `rss.feed.preview`                                   |
| SessionID | String  | No       | Session ID obtained from login                                    |
| APIKey    | String  | No       | API key for authentication                                        |
| FeedURL   | String  | Yes      | The feed address. Must be an `http` or `https` URL with a host, without spaces or `%`. |
| ItemCount | Integer | No       | Maximum number of items to return, from 1 to 50. Default 5.       |

**Response Shape:**

`Items` lists the feed's items in feed order, up to `ItemCount`. Each item has `Title`, `Link`, `CommentsLink`, `PublishDate`, `Author`, `Content` (the item's HTML) and `Image` (an image URL, or an empty string). `TotalItems` is the number of items returned.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/rss.feed.preview \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "rss.feed.preview",
    "APIKey": "your-api-key",
    "FeedURL": "https://blog.example.com/feed",
    "ItemCount": 3
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Items": [
    {
      "Title": "Our spring release",
      "Link": "https://blog.example.com/spring-release",
      "CommentsLink": "https://blog.example.com/spring-release#comments",
      "PublishDate": "Mon, 02 Nov 2026 10:00:00 +0000",
      "Author": "Jane Doe",
      "Content": "<p>What is new this spring.</p>",
      "Image": "https://blog.example.com/images/spring.png"
    }
  ],
  "TotalItems": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5,
  "ErrorText": "The feed server answered with HTTP status 404",
  "HTTPStatus": 404
}
```

```txt [Error Codes]
0: Success
1: FeedURL is missing
2: ItemCount is not a whole number from 1 to 50
3: FeedURL is not a valid http or https URL
4: The feed could not be fetched (unreachable host, refused private address, timeout)
5: The feed server answered with an HTTP error (HTTPStatus carries the status code)
6: The URL did not return a well-formed RSS or Atom feed
7: The feed has no items
```

:::

## Render the RSS Blocks in Email Content <Badge type="tip" text="New in v6.0.7" />

<Badge type="info" text="POST" /> `/api/v1/rss.content.render`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Renders every RSS block in the given content the way sending does, for a preview of an email before it is sent. For a user whose group has the `Email.RSSFeeds` permission each block is replaced with its feed items. For any other user each block is removed, as it is when the email is sent. Nothing else in the content is personalized or changed. Feeds go through the same 300 second cache that sending uses.

**Request Body Parameters:**

| Parameter    | Type   | Required | Description                                            |
|--------------|--------|----------|--------------------------------------------------------|
| Command      | String | Yes      | API command: `rss.content.render`                      |
| SessionID    | String | No       | Session ID obtained from login                         |
| APIKey       | String | No       | API key for authentication                             |
| HTMLContent  | String | No       | HTML email content. Pass this, PlainContent, or both.  |
| PlainContent | String | No       | Plain text email content.                              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/rss.content.render \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "rss.content.render",
    "APIKey": "your-api-key",
    "HTMLContent": "<p>Latest posts</p>%RSS:https://blog.example.com/feed:2%<h2>%RSS:TITLE%</h2>%RSS:END%"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "HTMLContent": "<p>Latest posts</p><h2>Our spring release</h2><h2>Winter recap</h2>",
  "PlainContent": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "HTMLContent or PlainContent is required"
}
```

```txt [Error Codes]
0: Success
1: Neither HTMLContent nor PlainContent was given
```

:::
