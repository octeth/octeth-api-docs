---
layout: doc
---

# User Email Content API Documentation

User-area email header/footer management endpoints for reading and updating the per-user content blocks injected into outgoing campaign emails.

This is a singleton resource — there is exactly one record per user. The four optional content blocks (`PlainEmailHeader`, `PlainEmailFooter`, `HTMLEmailHeader`, `HTMLEmailFooter`) are stored in the `oempro_users.Options` JSON column under the `EmailContent` key. The same data is editable in the UI at `/app/user/emailheaderfooter/`.

## Get User Email Content

<Badge type="info" text="GET" /> `/api/v1/user.emailcontent`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns all four header/footer fields. A user who has never set any of these values still gets a successful response — every field defaults to an empty string. There is no "not found" case for this endpoint.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| Command   | String | Yes      | API command: `user.emailcontent.get`     |
| SessionID | String | No       | Session ID obtained from login           |
| APIKey    | String | No       | API key for authentication               |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.emailcontent?APIKey=your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "EmailContent": {
    "PlainEmailHeader": "Greetings from Acme,\n\n",
    "PlainEmailFooter": "\n\n--\nAcme Corp\nhttps://acme.example",
    "HTMLEmailHeader": "<div style=\"font-family:sans-serif\">",
    "HTMLEmailFooter": "<hr><p style=\"font-size:12px;color:#888\">Acme Corp &middot; <a href=\"https://acme.example\">acme.example</a></p></div>"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 0,
      "Message": "Authentication failed"
    }
  ]
}
```

```txt [Error Codes]
(none — this endpoint has no business-logic error codes; an unset user simply receives empty strings for all four fields)
```

:::

## Update User Email Content

<Badge type="info" text="PATCH" /> `/api/v1/user.emailcontent`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- **PATCH requests must send all parameters in a JSON body** (`Content-Type: application/json`). The dispatcher does not parse query-string or form-encoded payloads for PATCH, so `?APIKey=...` etc. will be ignored — include authentication and all update fields in the JSON body.
:::

This is a **partial update**. Only fields explicitly present in the request body are modified; omitted fields keep their currently stored value. The model normally writes all four fields unconditionally, so the endpoint reads the stored content first, merges in only the fields you sent, and then writes back — giving callers true PATCH semantics.

To **clear** a field, send it explicitly as an empty string (`""`). To leave a field untouched, simply omit it from the request body.

The four content blocks are stored as raw strings and **not** sanitized by the API. This matches the UI's behavior — the user is configuring their own outgoing email content. Sibling keys on the user's `Options` JSON (e.g. `DefaultSenderDomain`) are preserved across writes.

**Request Body Parameters:**

| Parameter        | Type   | Required | Description                                                                                          |
|------------------|--------|----------|------------------------------------------------------------------------------------------------------|
| Command          | String | Yes      | API command: `user.emailcontent.update`                                                              |
| SessionID        | String | No       | Session ID obtained from login                                                                       |
| APIKey           | String | No       | API key for authentication                                                                           |
| PlainEmailHeader | String | No       | Header injected at the top of plain-text campaign emails. Omitted: stored value preserved. Empty string: clears the field |
| PlainEmailFooter | String | No       | Footer injected at the bottom of plain-text campaign emails. Same omit/clear semantics               |
| HTMLEmailHeader  | String | No       | Header injected at the top of HTML campaign emails. Same omit/clear semantics                        |
| HTMLEmailFooter  | String | No       | Footer injected at the bottom of HTML campaign emails. Same omit/clear semantics                     |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/user.emailcontent \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.emailcontent.update",
    "APIKey": "your-api-key",
    "HTMLEmailFooter": "<hr><p style=\"font-size:12px;color:#888\">Acme Corp &middot; <a href=\"https://acme.example\">acme.example</a></p>"
  }'
```

```json [Success Response]
{
  "Success": true,
  "EmailContent": {
    "PlainEmailHeader": "Greetings from Acme,\n\n",
    "PlainEmailFooter": "\n\n--\nAcme Corp\nhttps://acme.example",
    "HTMLEmailHeader": "<div style=\"font-family:sans-serif\">",
    "HTMLEmailFooter": "<hr><p style=\"font-size:12px;color:#888\">Acme Corp &middot; <a href=\"https://acme.example\">acme.example</a></p>"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Failed to save email content"
    }
  ]
}
```

```txt [Error Codes]
2: Failed to save email content (returned with HTTP 500 when the underlying model write fails)
```

:::
