---
layout: doc
---

# User Integration API Documentation

User-area endpoints for connecting third-party tracking integrations to an account. Keitaro is the first provider: once connected, Octeth reads the clicks of Keitaro links sent in SMS campaigns and receives Keitaro conversions through a postback URL.

The Keitaro API key and the postback token are never returned by these endpoints. The postback URL with its real token is returned only when a token is created: by the first successful `user.integrations.keitaro.update` call, by an update that changes `SubIDSlot` or `RevenueCurrency`, and by `user.integrations.keitaro.token.regenerate`. Store it in Keitaro right away.

The postback URL carries `subid={subid}` and `tid={tid}`. Octeth identifies a conversion by Keitaro's click ID (`subid`, always sent) together with `tid` (optional, it tells apart repeated conversions of one click). A postback without `subid` is rejected. A postback without `tid` is accepted as the click's conversion. Two clicks that report the same `tid` are two conversions.

## List Integrations <Badge type="tip" text="New in v6.0.4" />

<Badge type="info" text="GET" /> `/api/v1/user.integrations`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| Command   | String | Yes      | API command: `user.integrations.browse` |
| SessionID | String | No       | Session ID obtained from login       |
| APIKey    | String | No       | API key for authentication           |

Each integration has a `Status`. Possible values: `not_connected`, `connected`, `failing`. `failing` means the last click poll failed; the connection's `LastError` says why.

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.integrations?APIKey=your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "Integrations": [
    {
      "Provider": "keitaro",
      "Name": "Keitaro",
      "Description": "Track clicks and conversions from your Keitaro links in SMS campaigns.",
      "Status": "not_connected"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Integration settings could not be read"
    }
  ]
}
```

```txt [Error Codes]
1: Integration settings could not be read (HTTP 500)
```

:::

## Get the Keitaro Connection <Badge type="tip" text="New in v6.0.4" />

<Badge type="info" text="GET" /> `/api/v1/user.integrations.keitaro`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                               |
|-----------|--------|----------|-------------------------------------------|
| Command   | String | Yes      | API command: `user.integrations.keitaro.get` |
| SessionID | String | No       | Session ID obtained from login            |
| APIKey    | String | No       | API key for authentication                |

When Keitaro is not connected, the response is `Connected: false` and nothing else. When it is connected, the response carries:

- `ServerURL`: the Keitaro server URL, without a trailing slash.
- `APIKeyStored`: `true` when an API key is on file. The key itself is never returned.
- `SubIDSlot`: the Keitaro `sub_id` slot (1 to 30) that carries the Octeth tracking code.
- `RevenueCurrency`: the three-letter currency Keitaro reports revenue in.
- `Status`: `connected` or `failing`.
- `ConnectedAt`, `LastPolledAt`, `LastErrorAt`, `LastRejectionAt`: UTC `Y-m-d H:i:s`, or `null`.
- `LastError`: why the last click poll failed, empty when none. A successful poll clears it.
- `RejectedCount`: how many postbacks were rejected.
- `LastRejection`: why the last postback was rejected, for example a missing `subid` or a tracking code from another account, empty when none. A poll never clears it.
- `PlainHTTP`: `true` when `ServerURL` uses plain `http://`, so the API key travels unencrypted.
- `PostbackURLTemplate`: the postback URL with `token=<hidden>`. Use `user.integrations.keitaro.token.regenerate` to get a URL with a real token.

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.integrations.keitaro?APIKey=your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "Connected": true,
  "ServerURL": "https://tracker.example.com",
  "APIKeyStored": true,
  "SubIDSlot": 1,
  "RevenueCurrency": "USD",
  "Status": "connected",
  "ConnectedAt": "2026-10-24 09:12:44",
  "LastPolledAt": "2026-10-24 10:05:02",
  "LastError": "",
  "LastErrorAt": null,
  "RejectedCount": 0,
  "LastRejection": "",
  "LastRejectionAt": null,
  "PlainHTTP": false,
  "PostbackURLTemplate": "https://octeth.example.com/sms/keitaro/postback?token=<hidden>&code={sub_id_1}&subid={subid}&tid={tid}&status={status}&revenue={conversion_revenue:USD}&time={conversion_time:U}&offer={offer_id}&network={affiliate_network_name}&country={country}&bot={is_bot}"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Integration settings could not be read"
    }
  ]
}
```

```txt [Error Codes]
1: Integration settings could not be read (HTTP 500)
```

:::

## Connect or Update Keitaro <Badge type="tip" text="New in v6.0.4" />

<Badge type="info" text="POST" /> `/api/v1/user.integrations.keitaro`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter       | Type    | Required | Description |
|-----------------|---------|----------|-------------|
| Command         | String  | Yes      | API command: `user.integrations.keitaro.update` |
| SessionID       | String  | No       | Session ID obtained from login |
| APIKey          | String  | No       | API key for authentication |
| ServerURL       | String  | Yes      | Keitaro server URL. Must start with `http://` or `https://`, have a host, and have no query string, fragment or user name. Surrounding spaces and trailing slashes are removed |
| KeitaroAPIKey   | String  | Yes on the first connect, and when the server changes | The Keitaro Admin API key. Required when connecting for the first time, and whenever `ServerURL` has a different scheme, host or port than the stored one (the default ports 80 and 443 count as the same as no port). Leave it blank on a later update to the same server to keep the stored key. `APIKey` is the Octeth authentication parameter and is never read as the Keitaro key |
| SubIDSlot       | Integer | No       | The Keitaro `sub_id` slot (1 to 30) your links pass the Octeth tracking code in. Blank keeps the stored slot, or uses `1` on the first connect |
| RevenueCurrency | String  | No       | Three-letter currency code, for example `USD`. Lowercase is accepted. Blank keeps the stored currency, or uses `USD` on the first connect |

Every invalid field is reported in one response. Nothing is saved when any field is invalid.

The response has the same fields as `user.integrations.keitaro.get`. On the first connect it also carries `PostbackURL`, the postback URL with the real token. It is shown only this once, so paste it into Keitaro's postback settings. A later update keeps the connection status and the poll position. It keeps the token and returns no `PostbackURL`, unless it changes `SubIDSlot` or `RevenueCurrency`: both are part of the postback URL, so such an update creates a new token, returns the new `PostbackURL`, and the old URL stops working at once (the postback endpoint answers it with 403). Paste the new URL into Keitaro.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.integrations.keitaro \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.integrations.keitaro.update",
    "SessionID": "your-session-id",
    "ServerURL": "https://tracker.example.com",
    "KeitaroAPIKey": "your-keitaro-admin-api-key",
    "SubIDSlot": 1,
    "RevenueCurrency": "USD"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Connected": true,
  "ServerURL": "https://tracker.example.com",
  "APIKeyStored": true,
  "SubIDSlot": 1,
  "RevenueCurrency": "USD",
  "Status": "connected",
  "ConnectedAt": "2026-10-24 09:12:44",
  "LastPolledAt": null,
  "LastError": "",
  "LastErrorAt": null,
  "RejectedCount": 0,
  "LastRejection": "",
  "LastRejectionAt": null,
  "PlainHTTP": false,
  "PostbackURLTemplate": "https://octeth.example.com/sms/keitaro/postback?token=<hidden>&code={sub_id_1}&subid={subid}&tid={tid}&status={status}&revenue={conversion_revenue:USD}&time={conversion_time:U}&offer={offer_id}&network={affiliate_network_name}&country={country}&bot={is_bot}",
  "PostbackURL": "https://octeth.example.com/sms/keitaro/postback?token=3f9c0a6d1e7b42c58a90d4e6f1b2c3d4e5f60718&code={sub_id_1}&subid={subid}&tid={tid}&status={status}&revenue={conversion_revenue:USD}&time={conversion_time:U}&offer={offer_id}&network={affiliate_network_name}&country={country}&bot={is_bot}"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Enter a valid Keitaro server URL that starts with http:// or https:// and has no query string"
    },
    {
      "Code": 3,
      "Message": "The sub ID slot must be a number from 1 to 30"
    }
  ]
}
```

```txt [Error Codes]
1: Invalid server URL (HTTP 422)
2: Missing API key on the first connect, or when ServerURL moves to another scheme, host or port (HTTP 422)
3: Sub ID slot is not a number from 1 to 30 (HTTP 422)
4: Revenue currency is not a three-letter code (HTTP 422)
5: The connection could not be saved (HTTP 500)
```

:::

## Test the Keitaro Connection <Badge type="tip" text="New in v6.0.4" />

<Badge type="info" text="POST" /> `/api/v1/user.integrations.keitaro.test`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 10 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter       | Type    | Required | Description |
|-----------------|---------|----------|-------------|
| Command         | String  | Yes      | API command: `user.integrations.keitaro.test` |
| SessionID       | String  | No       | Session ID obtained from login |
| APIKey          | String  | No       | API key for authentication |
| ServerURL       | String  | No       | Keitaro server URL to test. Blank uses the stored URL |
| KeitaroAPIKey   | String  | No       | The Keitaro Admin API key to test. Blank uses the stored key, but only when `ServerURL` has the stored scheme, host and port. For any other server a blank key fails with "Enter your Keitaro API key" |
| SubIDSlot       | Integer | No       | Checked for range (1 to 30) only. The test does not depend on it |
| RevenueCurrency | String  | No       | Checked for format (three letters) only. The test does not depend on it |

Reads one row of the Keitaro click log with the given URL and key. Nothing is saved. A failed check is HTTP 200 with `Success: false` and a readable `Message`, for example an invalid URL, a missing key, a server that cannot be reached or is not an allowed destination, a rejected API key, or a response that is not JSON.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.integrations.keitaro.test \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.integrations.keitaro.test",
    "SessionID": "your-session-id",
    "ServerURL": "https://tracker.example.com",
    "KeitaroAPIKey": "your-keitaro-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Message": "Connected to Keitaro"
}
```

```json [Error Response]
{
  "Success": false,
  "Message": "Keitaro rejected the API key"
}
```

```txt [Error Codes]
(none: a failed check returns Success false with a Message)
```

:::

## Disconnect Keitaro <Badge type="tip" text="New in v6.0.4" />

<Badge type="info" text="DELETE" /> `/api/v1/user.integrations.keitaro`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| Command   | String | Yes      | API command: `user.integrations.keitaro.disconnect` |
| SessionID | String | No       | Session ID obtained from login                   |
| APIKey    | String | No       | API key for authentication                       |

Deletes the connection, including the stored API key. The postback token stops working at once, and clicks are no longer read. Clicks and conversions already recorded stay in the reports.

::: code-group

```bash [Example Request]
curl -X DELETE "https://example.com/api/v1/user.integrations.keitaro?APIKey=your-api-key"
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Keitaro is not connected"
    }
  ]
}
```

```txt [Error Codes]
1: Keitaro is not connected (HTTP 404)
2: Keitaro could not be disconnected (HTTP 500)
```

:::

## Regenerate the Keitaro Postback Token <Badge type="tip" text="New in v6.0.4" />

<Badge type="info" text="POST" /> `/api/v1/user.integrations.keitaro.token`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                            |
|-----------|--------|----------|--------------------------------------------------------|
| Command   | String | Yes      | API command: `user.integrations.keitaro.token.regenerate` |
| SessionID | String | No       | Session ID obtained from login                         |
| APIKey    | String | No       | API key for authentication                             |

Replaces the postback token and returns the new postback URL. The old token is refused from this moment (HTTP 403 from the postback endpoint), so update the postback URL in Keitaro right away. The new URL is shown only in this response.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.integrations.keitaro.token \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.integrations.keitaro.token.regenerate",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "PostbackURL": "https://octeth.example.com/sms/keitaro/postback?token=9b1e4f7a2c8d0e3f5a6b7c8d9e0f1a2b3c4d5e6f&code={sub_id_1}&subid={subid}&tid={tid}&status={status}&revenue={conversion_revenue:USD}&time={conversion_time:U}&offer={offer_id}&network={affiliate_network_name}&country={country}&bot={is_bot}"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Keitaro is not connected"
    }
  ]
}
```

```txt [Error Codes]
1: Keitaro is not connected (HTTP 404)
2: The postback token could not be regenerated (HTTP 500)
```

:::
