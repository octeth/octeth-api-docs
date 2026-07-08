---
layout: doc
---

# User Email Template API Documentation

User email template management endpoints for creating, listing, retrieving, updating, deleting, and copying user-owned email templates. These endpoints operate on `IsEmailTemplate=1` records in the emails table, which are distinct from the legacy gallery templates managed via `email.template.*` endpoints.

## Create a User Email Template

<Badge type="info" text="POST" /> `/api/v1/useremailtemplate`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.create` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| EmailName | String | Yes | Template name |
| Subject | String | Yes | Email subject line |
| PreHeaderText | String | No | Pre-header text displayed in email clients |
| ContentType | String | No | Email content type. Possible values: `HTML`, `Plain`, `Both`. Default: `HTML` |
| HTMLContent | String | No | HTML email content |
| PlainContent | String | No | Plain text email content |
| ExtraContent1 | String | No | Stripo HTML template data |
| ExtraContent2 | String | No | Stripo CSS template data |
| Mode | String | No | Email editor mode. Possible values: `Stripo`, `Editor`. Default: `Editor` |
| ImageEmbedding | String | No | Image embedding setting. Possible values: `Enabled`, `Disabled`. Default: `Disabled` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/useremailtemplate \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "useremailtemplate.create",
    "SessionID": "your-session-id",
    "EmailName": "Welcome Email Template",
    "Subject": "Welcome to our newsletter!",
    "PreHeaderText": "Thanks for subscribing",
    "ContentType": "HTML",
    "HTMLContent": "<html><body><h1>Welcome!</h1></body></html>",
    "Mode": "Editor",
    "ImageEmbedding": "Disabled"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": 42
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing EmailName parameter"
    },
    {
      "Code": 2,
      "Message": "Missing Subject parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailName parameter
2: Missing Subject parameter
3: Invalid ContentType. Must be one of: HTML, Plain, Both
4: Invalid Mode. Must be one of: Stripo, Editor
5: Invalid ImageEmbedding. Must be one of: Enabled, Disabled
```

:::

## List User Email Templates

<Badge type="info" text="GET" /> `/api/v1/useremailtemplates`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplates.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| OrderField | String | No | Field to sort results by. Possible values: `CreatedAt`, `EmailName`. Default: `CreatedAt` |
| OrderType | String | No | Sort direction. Possible values: `ASC`, `DESC`. Default: `DESC` |
| Limit | Integer | No | Number of records to return (1-100). Default: `25` |
| Offset | Integer | No | Number of records to skip. Default: `0` |
| fields | String | No | Opt-in, comma-separated allow-list of columns to return per template. When omitted, every column (including the heavy `HTMLContent` / `PlainContent` / `ExtraContent1` / `ExtraContent2` blobs) is returned for backward compatibility. Use this for list/browse views that only need metadata to avoid transferring the content blobs. `EmailID` is always included even if not listed. Unknown field names are silently dropped. Allowed columns: `EmailID`, `RelUserID`, `EmailName`, `FromName`, `FromEmail`, `ReplyToName`, `ReplyToEmail`, `ContentType`, `Mode`, `FetchURL`, `FetchPlainURL`, `Subject`, `PlainContent`, `HTMLContent`, `ExtraContent1`, `ExtraContent2`, `ImageEmbedding`, `RelTemplateID`, `PreHeaderText`, `Options`, `IsEmailTemplate`, `CreatedAt`, `UpdatedAt`, `DeletedAt`. |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/useremailtemplates?SessionID=your-session-id&OrderField=CreatedAt&OrderType=DESC&Limit=10&Offset=0"
```

```bash [Metadata-only Request]
# Skip the content blobs — ideal for a template list/browse view.
curl -X GET "https://example.com/api/v1/useremailtemplates?SessionID=your-session-id&Limit=100&fields=EmailID,EmailName,Subject,ContentType,Mode,CreatedAt,UpdatedAt"
```

```json [Metadata-only Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalEmailTemplateCount": 25,
  "EmailTemplates": [
    {
      "EmailID": "42",
      "EmailName": "Welcome Email Template",
      "Subject": "Welcome to our newsletter!",
      "ContentType": "HTML",
      "Mode": "Editor",
      "CreatedAt": "2025-03-14 10:00:00",
      "UpdatedAt": "2025-03-14 10:00:00"
    }
  ]
}
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalEmailTemplateCount": 25,
  "EmailTemplates": [
    {
      "EmailID": "42",
      "RelUserID": "1",
      "EmailName": "Welcome Email Template",
      "Subject": "Welcome to our newsletter!",
      "ContentType": "HTML",
      "Mode": "Editor",
      "IsEmailTemplate": "1",
      "CreatedAt": "2025-03-14 10:00:00",
      "UpdatedAt": "2025-03-14 10:00:00",
      "DeletedAt": null
    }
  ]
}
```

```json [Error Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalEmailTemplateCount": 0,
  "EmailTemplates": []
}
```

```txt [Error Codes]
No specific error codes. Returns empty array when no templates found.
```

:::

## Get a User Email Template

<Badge type="info" text="GET" /> `/api/v1/useremailtemplate`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| EmailID | Integer | Yes | ID of the email template to retrieve |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/useremailtemplate?SessionID=your-session-id&EmailID=42"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailTemplate": {
    "EmailID": "42",
    "RelUserID": "1",
    "EmailName": "Welcome Email Template",
    "Subject": "Welcome to our newsletter!",
    "PreHeaderText": "Thanks for subscribing",
    "ContentType": "HTML",
    "HTMLContent": "<html><body><h1>Welcome!</h1></body></html>",
    "PlainContent": "",
    "ExtraContent1": "",
    "ExtraContent2": "",
    "Mode": "Editor",
    "ImageEmbedding": "Disabled",
    "IsEmailTemplate": "1",
    "CreatedAt": "2025-03-14 10:00:00",
    "UpdatedAt": "2025-03-14 10:00:00",
    "DeletedAt": null,
    "Attachments": []
  }
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 3,
      "Message": "Email template not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailID parameter
2: Invalid EmailID. Must be a numeric value.
3: Email template not found
```

:::

## Update a User Email Template

<Badge type="info" text="PATCH" /> `/api/v1/useremailtemplate`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.update` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| EmailID | Integer | Yes | ID of the email template to update |
| EmailName | String | No | Updated template name |
| Subject | String | No | Updated email subject line |
| PreHeaderText | String | No | Updated pre-header text |
| ContentType | String | No | Updated content type. Possible values: `HTML`, `Plain`, `Both` |
| HTMLContent | String | No | Updated HTML email content |
| PlainContent | String | No | Updated plain text content |
| ExtraContent1 | String | No | Updated Stripo HTML template data |
| ExtraContent2 | String | No | Updated Stripo CSS template data |
| Mode | String | No | Updated editor mode. Possible values: `Stripo`, `Editor` |
| ImageEmbedding | String | No | Updated image embedding. Possible values: `Enabled`, `Disabled` |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/useremailtemplate \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "useremailtemplate.update",
    "SessionID": "your-session-id",
    "EmailID": 42,
    "EmailName": "Updated Welcome Template",
    "Subject": "Welcome aboard!"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 6,
      "Message": "Email template not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailID parameter
2: Invalid EmailID. Must be a numeric value.
3: Invalid ContentType. Must be one of: HTML, Plain, Both
4: Invalid Mode. Must be one of: Stripo, Editor
5: Invalid ImageEmbedding. Must be one of: Enabled, Disabled
6: Email template not found
```

:::

## Delete User Email Templates

<Badge type="info" text="DELETE" /> `/api/v1/useremailtemplate`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.delete` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| EmailID | String | Yes | ID(s) of the email template(s) to delete. Supports comma-separated values for batch deletion (e.g., `42,43,44`) |

::: code-group

```bash [Example Request]
curl -X DELETE https://example.com/api/v1/useremailtemplate \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "useremailtemplate.delete",
    "SessionID": "your-session-id",
    "EmailID": "42,43,44"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "DeletedCount": 3
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing EmailID parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailID parameter
```

:::

## Copy a User Email Template

<Badge type="info" text="POST" /> `/api/v1/useremailtemplate.copy`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.copy` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| EmailID | Integer | Yes | ID of the email template to copy |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/useremailtemplate.copy \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "useremailtemplate.copy",
    "SessionID": "your-session-id",
    "EmailID": 42
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": 45,
  "EmailName": "Copy of Welcome Email Template"
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 3,
      "Message": "Email template not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailID parameter
2: Invalid EmailID. Must be a numeric value.
3: Email template not found
```

:::

## Copy a User Email Template to Another User

<Badge type="info" text="POST" /> `/api/v1/useremailtemplate.copytouser`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.copytouser` |
| SessionID | String | No | Session ID obtained from admin login |
| AdminAPIKey | String | No | Admin API key for authentication |
| EmailID | Integer | Yes | ID of the email template to copy |
| SourceUserID | Integer | Yes | ID of the user who owns the source template |
| TargetUserID | Integer | Yes | ID of the user to receive the copied template |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/useremailtemplate.copytouser \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "useremailtemplate.copytouser",
    "AdminAPIKey": "your-admin-api-key",
    "EmailID": 42,
    "SourceUserID": 1,
    "TargetUserID": 5
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": 46
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 9,
      "Message": "Email template not found for source user"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailID parameter
2: Missing SourceUserID parameter
3: Missing TargetUserID parameter
4: Invalid EmailID. Must be a numeric value.
5: Invalid SourceUserID. Must be a numeric value.
6: Invalid TargetUserID. Must be a numeric value.
7: Source user not found
8: Target user not found
9: Email template not found for source user
```

:::

## Preview a User Email Template

<Badge type="info" text="POST" /> `/api/v1/useremailtemplate.preview`

Renders a user email template the way a subscriber would actually receive it: branding header/footer applied, merge tags resolved. Composes the existing personalization primitives behind a preview-safe entry point — no Campaign / Subscriber / EmailQueue context is required, so this is suitable for headless frontends and external preview UIs.

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailTemplates.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `useremailtemplate.preview` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| EmailTemplateID | Integer | Yes | ID of the user-owned email template to preview. Must belong to the authenticated user. |
| SampleData | Object | No | Map of merge-tag values to use during personalization (e.g. `{"FirstName": "Jane", "Email": "jane@example.com"}`). When omitted, sensible defaults are used so unfilled tags don't render as raw `%Subscriber:Foo%` strings. Caller-supplied values override the defaults. |
| IncludeBranding | Boolean | No | When `true` (default), wraps the template via the user's configured email header/footer (set via `useremail.header.set` / `useremail.footer.set` and the user-group's branding). When `false`, returns the personalized body only. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/useremailtemplate.preview \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "useremailtemplate.preview",
    "APIKey": "your-api-key",
    "EmailTemplateID": 42,
    "SampleData": {
      "FirstName": "Jane",
      "Email": "jane@example.com"
    },
    "IncludeBranding": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "HTMLContent": "<html><body>...header...<p>Hello Jane, welcome.</p>...footer...</body></html>",
  "PlainContent": "...header...\nHello Jane, welcome.\n...footer..."
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 3,
      "Message": "Email template not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing EmailTemplateID parameter
2: Invalid EmailTemplateID. Must be a numeric value.
3: Email template not found
4: Invalid SampleData. Must be an object.
5: Invalid SampleData values. All values must be scalar (string, number, boolean) or null.
6: Invalid IncludeBranding. Must be a boolean value.
```

:::
