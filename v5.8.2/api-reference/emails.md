---
layout: doc
---

# Email API Documentation

Email management endpoints for creating, updating, previewing, and managing email content, templates, and attachments.

## Create an Email

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `email.create`           |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.create",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": 12345
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3]
}
```

```txt [Error Codes]
0: Success
```

:::

## Get Email Details

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.get`              |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID to retrieve                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.get",
    "SessionID": "your-session-id",
    "EmailID": 12345
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailInformation": {
    "EmailID": 12345,
    "EmailName": "Newsletter",
    "Subject": "Monthly Update",
    "HTMLContent": "<html>...</html>",
    "PlainContent": "...",
    "FromName": "Company Name",
    "FromEmail": "info@company.com"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Email not found or access denied
```

:::

## Get Emails List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `emails.get`             |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emails.get",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalEmailCount": 10,
  "Emails": [
    {
      "EmailID": 12345,
      "EmailName": "Newsletter",
      "Subject": "Monthly Update"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Update an Email

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter              | Type    | Required | Description                                                   |
|------------------------|---------|----------|---------------------------------------------------------------|
| Command                | String  | Yes      | API command: `email.update`                                   |
| SessionID              | String  | No       | Session ID obtained from login                                |
| APIKey                 | String  | No       | API key for authentication                                    |
| EmailID                | Integer | Yes      | Email ID to update                                            |
| ValidateScope          | String  | Yes      | Validation scope: `OptIn`, `Campaign`, or `AutoResponder`     |
| EmailName              | String  | No       | Email name                                                    |
| Subject                | String  | No       | Email subject                                                 |
| PreHeaderText          | String  | No       | Email preheader text                                          |
| FromName               | String  | No       | Sender name                                                   |
| FromEmail              | String  | No       | Sender email address                                          |
| ReplyToName            | String  | No       | Reply-to name                                                 |
| ReplyToEmail           | String  | No       | Reply-to email address                                        |
| HTMLContent            | String  | No       | HTML email content                                            |
| PlainContent           | String  | No       | Plain text email content                                      |
| Mode                   | String  | No       | Editor mode: `Unlayer`, `Stripo`, `Editor`, `Empty`, `Template`, `Import` |
| FetchURL               | String  | No       | URL to fetch HTML content from (for Import mode)              |
| FetchPlainURL          | String  | No       | URL to fetch plain content from (for Import mode)             |
| ImageEmbedding         | String  | No       | Image embedding setting                                       |
| SenderDomain           | String  | No       | Sender domain                                                 |
| OpenTracking           | Boolean | No       | Enable open tracking (default: true)                          |
| LinkTracking           | Boolean | No       | Enable link tracking (default: true)                          |
| UTMTracking            | Boolean | No       | Enable UTM tracking                                           |
| UTMSource              | String  | Conditional | UTM source (required if UTMTracking is true)               |
| UTMMedium              | String  | Conditional | UTM medium (required if UTMTracking is true)               |
| UTMCampaign            | String  | Conditional | UTM campaign (required if UTMTracking is true)             |
| UTMTerm                | String  | No       | UTM term parameter                                            |
| UTMContent             | String  | No       | UTM content parameter                                         |
| UTMMergeTags           | Boolean | No       | Use merge tags in UTM parameters                              |
| RelTemplateID          | Integer | Conditional | Template ID (required if Mode is `Template`)               |
| IsEmailTemplate        | Integer | No       | Mark as email template (0 or 1)                               |
| ExtraContent1          | String  | No       | Extra content field 1 (for Stripo/Unlayer)                    |
| ExtraContent2          | String  | No       | Extra content field 2 (for Stripo/Unlayer)                    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.update",
    "SessionID": "your-session-id",
    "EmailID": 12345,
    "ValidateScope": "Campaign",
    "EmailName": "Updated Newsletter",
    "Subject": "New Monthly Update",
    "HTMLContent": "<html><body>Updated content</body></html>",
    "PlainContent": "Updated content",
    "FromName": "Company Name",
    "FromEmail": "info@company.com",
    "OpenTracking": true,
    "LinkTracking": true
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
  "ErrorCode": [1, 3, 4, 8, 9, 10, 11, 12, 17, 18, 19, 20]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
3: Email not found or access denied
4: Invalid Mode parameter
8: Email content cannot be empty
9: Missing required parameter ValidateScope
10: Invalid ValidateScope parameter (must be OptIn, Campaign, or AutoResponder)
11: Missing unsubscribe link in HTML content
12: Missing unsubscribe link in plain content
17: Invalid sender domain
18: Missing UTMSource parameter (required when UTMTracking is enabled)
19: Missing UTMMedium parameter (required when UTMTracking is enabled)
20: Missing UTMCampaign parameter (required when UTMTracking is enabled)
```

:::

## Delete an Email

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.delete`           |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID to delete                    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.delete",
    "SessionID": "your-session-id",
    "EmailID": 12345
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
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
```

:::

## Duplicate an Email

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.duplicate`        |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID to duplicate                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.duplicate",
    "SessionID": "your-session-id",
    "EmailID": 12345
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": 12346,
  "EmailName": "Copy of Newsletter"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Email not found or access denied
```

:::

## Send Email Preview

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter                  | Type    | Required     | Description                                                    |
|----------------------------|---------|--------------|----------------------------------------------------------------|
| Command                    | String  | Yes          | API command: `email.emailpreview`                              |
| SessionID                  | String  | No           | Session ID obtained from login                                 |
| APIKey                     | String  | No           | API key for authentication                                     |
| EmailID                    | Integer | Conditional  | Email ID to preview (or provide HTMLContent/PlainContent)      |
| EmailAddress               | String  | Conditional  | Recipient email address (required if SubscriberID not provided)|
| SubscriberID               | Integer | No           | Subscriber ID to use for personalization                       |
| ListID                     | Integer | No           | List ID for subscriber lookup                                  |
| CampaignID                 | Integer | No           | Campaign ID for context                                        |
| HTMLContent                | String  | Conditional  | HTML content (if EmailID not provided)                         |
| PlainTextContent           | String  | Conditional  | Plain text content (if EmailID not provided)                   |
| FromName                   | String  | No           | Override sender name                                           |
| FromEmailAddress           | String  | No           | Override sender email                                          |
| Subject                    | String  | No           | Override email subject                                         |
| PreHeaderText              | String  | No           | Override preheader text                                        |
| ReplyToName                | String  | No           | Override reply-to name                                         |
| ReplyToEmail               | String  | No           | Override reply-to email                                        |
| SenderDomain               | String  | No           | Override sender domain                                         |
| AddUserGroupHeaderFooter   | Boolean | No           | Add user group header/footer (default: true)                   |
| EmailType                  | String  | No           | Email type: `optinconfirmation` or regular (default)           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.emailpreview",
    "SessionID": "your-session-id",
    "EmailID": 12345,
    "EmailAddress": "test@example.com",
    "ListID": 100
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
  "ErrorCode": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Missing required parameter EmailAddress
3: Email not found
4: Invalid email address format
5: Subscriber not found
6: List not found
7: Campaign not found
8: Email delivery failed or sender domain not found
9: Missing required parameter HTMLContent or PlainTextContent
10: Missing required parameter PlainTextContent
```

:::

## Test Email Delivery Settings

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Not available in demo mode
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `email.delivery.test`    |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.delivery.test",
    "SessionID": "admin-session-id"
  }'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": "NOT AVAILABLE IN DEMO MODE."
}
```

```txt [Error Codes]
1: Email delivery test failed
```

:::

## Test Email Against Spam Filters

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Email.SpamTest`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.spamtest`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID to test                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.spamtest",
    "SessionID": "your-session-id",
    "EmailID": 12345
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TestResults": {
    "score": 2.5,
    "tests": [
      {
        "name": "BAYES_00",
        "score": -1.9,
        "description": "Bayes spam probability is 0 to 1%"
      }
    ]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Email not found
3: Spam test service error
```

:::

## Render Email in Browser

<Badge type="info" text="GET" /> `/api/v1/email.render`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 10000 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter             | Type    | Required | Description                                          |
|-----------------------|---------|----------|------------------------------------------------------|
| Command               | String  | Yes      | API command: `email.render`                          |
| SessionID             | String  | No       | Session ID obtained from login                       |
| APIKey                | String  | No       | API key for authentication                           |
| UserID                | Integer | Yes      | User ID                                              |
| ListID                | Integer | Yes      | List ID                                              |
| SubscriberID          | Integer | Yes      | Subscriber ID                                        |
| CampaignID            | Integer | Yes      | Campaign ID                                          |
| AutoResponderID       | Integer | Yes      | AutoResponder ID                                     |
| EmailID               | Integer | Yes      | Email ID                                             |
| QueueRowID            | Integer | Yes      | Email Gateway queue row ID                           |
| IsPreview             | Boolean | Yes      | Preview mode flag (1 or 0)                           |
| DisablePersonalization| Boolean | Yes      | Disable personalization (1 or 0)                     |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/email.render?UserID=100&ListID=50&SubscriberID=1000&CampaignID=200&EmailID=300&IsPreview=0&DisablePersonalization=0" \
  -H "Content-Type: application/json"
```

```json [Success Response]
{
  "Subject": "Monthly Newsletter",
  "EmailContent": "<html><body>Personalized content...</body></html>"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing UserID parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing UserID parameter
2: Missing ListID parameter
3: Missing SubscriberID parameter
4: Missing CampaignID parameter
5: Missing AutoResponderID parameter
6: Missing EmailID parameter
7: Missing QueueRowID parameter
8: Missing IsPreview parameter
9: Missing DisablePersonalization parameter
10: Invalid UserID parameter
11: Invalid ListID parameter
12: Invalid SubscriberID parameter
13: Invalid CampaignID parameter
14: Invalid AutoResponderID parameter
15: Invalid EmailID parameter
16: Invalid QueueRowID parameter
```

:::

## Render Email for SMTP Delivery

<Badge type="info" text="POST" /> `/api/v1/email.smtp.render`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Rate limit: 10000 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter       | Type    | Required | Description                                                        |
|-----------------|---------|----------|--------------------------------------------------------------------|
| Command         | String  | Yes      | API command: `email.smtp.render`                                   |
| SessionID       | String  | No       | Session ID obtained from login                                     |
| APIKey          | String  | No       | API key for authentication                                         |
| UserID          | Integer | No       | User ID (auto-inferred from session or AdminAPIKey required)       |
| CampaignID      | Integer | No       | Campaign ID (auto-infers EmailID and ListID)                       |
| AutoResponderID | Integer | No       | AutoResponder ID (auto-infers EmailID and ListID)                  |
| EmailID         | Integer | No       | Email ID (auto-inferred from Campaign/AutoResponder)               |
| ListID          | Integer | No       | List ID (auto-inferred from Campaign)                              |
| SubscriberID    | Integer | No       | Subscriber ID (random subscriber selected if not provided)         |
| IsPreview       | Boolean | No       | Preview mode flag (accepts: 1/true/on/yes or 0/false/off/no)      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/email.smtp.render \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.smtp.render",
    "SessionID": "your-session-id",
    "CampaignID": 200
  }'
```

```json [Success Response]
{
  "Subject": "Monthly Newsletter",
  "PreHeader": "Check out our latest updates",
  "HTMLBody": "<html><body>...</body></html>",
  "PlainBody": "Plain text version...",
  "SMTPHeaders": "From: sender@example.com\r\nTo: recipient@example.com\r\n...",
  "SMTPBody": "MIME encoded body with boundaries...",
  "EmailSizeBytes": 45678,
  "EmailSizeKB": 44.61,
  "EmailSizeMB": 0.04,
  "AttachmentCount": 2,
  "ContentType": "MultiPart",
  "HasHTMLContent": true,
  "HasPlainContent": true,
  "ImageEmbeddingEnabled": true,
  "FromEmail": "sender@example.com",
  "FromName": "Company Name",
  "ReplyToEmail": "reply@example.com",
  "ReplyToName": "Support Team",
  "MFROMDomain": "return.example.com",
  "TrackingDomain": "track.example.com"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing or invalid UserID parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing or invalid UserID parameter
2: Invalid CampaignID parameter
3: Invalid AutoResponderID parameter
4: Missing or invalid EmailID parameter
5: Missing or invalid ListID parameter
6: Missing or invalid SubscriberID parameter
```

:::

## Get Personalization Tags

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required     | Description                                                       |
|-----------|--------|--------------|-------------------------------------------------------------------|
| Command   | String | Yes          | API command: `email.personalizationtags`                          |
| SessionID | String | No           | Session ID obtained from login                                    |
| APIKey    | String | No           | API key for authentication                                        |
| Scope     | Array  | Yes          | Tag scopes: `Subscriber`, `CampaignLinks`, `OptLinks`, `ListLinks`, `AllLinks`, `User` |
| ListID    | Integer| Conditional  | List ID (required if Scope contains `Subscriber`)                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.personalizationtags",
    "SessionID": "your-session-id",
    "Scope": ["Subscriber", "CampaignLinks", "User"],
    "ListID": 100
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "PersonalizationTags": [
    {
      "Tag": "%EmailAddress%",
      "Description": "Subscriber email address",
      "Category": "Subscriber"
    },
    {
      "Tag": "%Link:Unsubscribe%",
      "Description": "Unsubscribe link",
      "Category": "Links"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter Scope
2: Missing required parameter ListID (when Subscriber scope is included)
```

:::

## Create Email Template

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required permissions: `EmailTemplates.Manage`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter              | Type    | Required | Description                                    |
|------------------------|---------|----------|------------------------------------------------|
| Command                | String  | Yes      | API command: `email.template.create`           |
| SessionID              | String  | No       | Session ID obtained from login                 |
| APIKey                 | String  | No       | API key for authentication                     |
| TemplateName           | String  | Yes      | Template name                                  |
| TemplateDescription    | String  | No       | Template description                           |
| TemplateSubject        | String  | No       | Default subject line                           |
| TemplateHTMLContent    | String  | Conditional | HTML template content (at least one required)|
| TemplatePlainContent   | String  | Conditional | Plain text template content (at least one required)|
| TemplateThumbnailPath  | String  | No       | Path to thumbnail image in tmp directory       |
| RelOwnerUserID         | Integer | No       | Owner user ID (admin only)                     |
| AccessType             | String  | No       | Access type setting                            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.template.create",
    "SessionID": "your-session-id",
    "TemplateName": "Newsletter Template",
    "TemplateDescription": "Monthly newsletter design",
    "TemplateSubject": "Newsletter",
    "TemplateHTMLContent": "<html><body>Template content</body></html>"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TemplateID": 500
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter TemplateName
2: At least one of TemplateHTMLContent or TemplatePlainContent must be provided
```

:::

## Get Email Template

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required permissions: `EmailTemplates.Manage`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                           |
|------------|---------|----------|---------------------------------------|
| Command    | String  | Yes      | API command: `email.template.get`     |
| SessionID  | String  | No       | Session ID obtained from login        |
| APIKey     | String  | No       | API key for authentication            |
| TemplateID | Integer | Yes      | Template ID to retrieve               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.template.get",
    "SessionID": "your-session-id",
    "TemplateID": 500
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Template": {
    "TemplateID": 500,
    "TemplateName": "Newsletter Template",
    "TemplateDescription": "Monthly newsletter design",
    "TemplateSubject": "Newsletter",
    "TemplateHTMLContent": "<html><body>Template content</body></html>",
    "TemplatePlainContent": "Template content",
    "RelOwnerUserID": 100
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter TemplateID
2: Template not found
3: Access denied to template
```

:::

## Get Email Templates List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required permissions: `EmailTemplates.Manage`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `email.templates.get`    |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.templates.get",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalTemplateCount": 5,
  "Templates": [
    {
      "TemplateID": 500,
      "TemplateName": "Newsletter Template",
      "TemplateSubject": "Newsletter",
      "TemplateHTMLContent": "<html>...</html>",
      "TemplatePlainContent": "..."
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Update Email Template

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required permissions: `EmailTemplates.Manage`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter              | Type    | Required | Description                           |
|------------------------|---------|----------|---------------------------------------|
| Command                | String  | Yes      | API command: `email.template.update`  |
| SessionID              | String  | No       | Session ID obtained from login        |
| APIKey                 | String  | No       | API key for authentication            |
| TemplateID             | Integer | Yes      | Template ID to update                 |
| TemplateName           | String  | No       | Template name                         |
| TemplateDescription    | String  | No       | Template description                  |
| TemplateSubject        | String  | No       | Default subject line                  |
| TemplateHTMLContent    | String  | No       | HTML template content                 |
| TemplatePlainContent   | String  | No       | Plain text template content           |
| TemplateThumbnailPath  | String  | No       | Path to thumbnail image in tmp directory |
| RelOwnerUserID         | Integer | No       | Owner user ID (admin only)            |
| AccessType             | String  | No       | Access type setting (admin only)      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.template.update",
    "SessionID": "your-session-id",
    "TemplateID": 500,
    "TemplateName": "Updated Newsletter Template",
    "TemplateHTMLContent": "<html><body>Updated content</body></html>"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter TemplateID
2: Template not found or access denied
```

:::

## Delete Email Template

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required permissions: `EmailTemplates.Manage`
- Not available in demo mode
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                        |
|-----------|--------|----------|----------------------------------------------------|
| Command   | String | Yes      | API command: `email.template.delete`               |
| SessionID | String | No       | Session ID obtained from login                     |
| APIKey    | String | No       | API key for authentication                         |
| Templates | String | Yes      | Comma-separated template IDs to delete (e.g., "500,501,502") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.template.delete",
    "SessionID": "your-session-id",
    "Templates": "500,501,502"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter Templates
2: No templates found or access denied for deletion
```

:::

## Create Design Preview (Deprecated)

<Badge type="warning" text="DEPRECATED" /> <Badge type="info" text="POST" /> `/api.php`

::: warning Deprecated Endpoint
This endpoint is deprecated with no replacement or alternative. It was used for PreviewMyEmail.com integration which is no longer supported.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Email.DesignPreview`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.designpreview.create` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID to preview                   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.designpreview.create",
    "SessionID": "your-session-id",
    "EmailID": 12345
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "JobID": 1000,
  "PreviewMyEmailJobID": "abc123"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 4, 5]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Email not found
3: Preview service connection error
4: Out of admin credits
5: Out of user credits
```

:::

## Delete Design Preview (Deprecated)

<Badge type="warning" text="DEPRECATED" /> <Badge type="info" text="POST" /> `/api.php`

::: warning Deprecated Endpoint
This endpoint is deprecated with no replacement or alternative. It was used for PreviewMyEmail.com integration which is no longer supported.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Email.DesignPreview`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.designpreview.delete` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID                              |
| JobID     | Integer | Yes      | Preview job ID                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.designpreview.delete",
    "SessionID": "your-session-id",
    "EmailID": 12345,
    "JobID": 1000
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
  "ErrorCode": [1, 2, 3, 4, 5]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Missing required parameter JobID
3: Email not found
4: Preview job not found
5: Preview service connection error
```

:::

## Get Design Preview Details (Deprecated)

<Badge type="warning" text="DEPRECATED" /> <Badge type="info" text="POST" /> `/api.php`

::: warning Deprecated Endpoint
This endpoint is deprecated with no replacement or alternative. It was used for PreviewMyEmail.com integration which is no longer supported.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Email.DesignPreview`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.designpreview.details` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID                              |
| JobID     | Integer | Yes      | Preview job ID                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.designpreview.details",
    "SessionID": "your-session-id",
    "EmailID": 12345,
    "JobID": 1000
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "PreviewRequest": {
    "JobID": 1000,
    "PreviewMyEmailJobID": "abc123",
    "Status": "Complete",
    "PreviewResults": [
      {
        "ClientCode": "outlook2019",
        "ImagesOnURL": "https://...",
        "ImagesOffURL": "https://...",
        "ThumbnailURL": "https://..."
      }
    ]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 4, 5]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Email not found
3: Missing required parameter JobID
4: Preview job not found
5: Preview service connection error
```

:::

## Get Design Preview List (Deprecated)

<Badge type="warning" text="DEPRECATED" /> <Badge type="info" text="POST" /> `/api.php`

::: warning Deprecated Endpoint
This endpoint is deprecated with no replacement or alternative. It was used for PreviewMyEmail.com integration which is no longer supported.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Email.DesignPreview`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `email.designpreview.getlist` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| EmailID   | Integer | Yes      | Email ID                              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "email.designpreview.getlist",
    "SessionID": "your-session-id",
    "EmailID": 12345
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "PreviewList": [
    {
      "JobID": 1000,
      "PreviewMyEmailJobID": "abc123",
      "Status": "Complete",
      "SubmitDate": "2024-01-15 10:30:00"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter EmailID
2: Email not found
```

:::

## Delete Attachment

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                           |
|--------------|---------|----------|---------------------------------------|
| Command      | String  | Yes      | API command: `attachment.delete`      |
| SessionID    | String  | No       | Session ID obtained from login        |
| APIKey       | String  | No       | API key for authentication            |
| AttachmentID | Integer | Yes      | Attachment ID to delete               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "attachment.delete",
    "SessionID": "your-session-id",
    "AttachmentID": 789
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
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter AttachmentID
```

:::
