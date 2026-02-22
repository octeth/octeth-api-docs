---
layout: doc
---

# Email Gateway API Documentation

Email Gateway endpoints for managing transactional email sending through verified domains, including domain management, API keys, SMTP credentials, webhooks, and email delivery.

## Add a Sender Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.AddDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `emailgateway.adddomain` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| DomainName | String | Yes     | Domain name to add (e.g., example.com) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.adddomain",
    "SessionID": "your-session-id",
    "DomainName": "example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewSenderDomainID": 123,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Approval Pending",
    "Options": {}
  }
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
1: Missing required parameter (DomainName)
2: Invalid domain name format
3: Maximum sender domains limit reached for user
```

:::

## Get Sender Domain Details

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getdomain` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| DomainID  | Integer | Yes      | Sender domain ID                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getdomain",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Enabled",
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1,
      "UnsubscribeLink": 0
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Update Sender Domain Settings

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                    |
|-----------|---------|----------|------------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.updatedomain`       |
| SessionID | String  | No       | Session ID obtained from login                 |
| APIKey    | String  | No       | API key for authentication                     |
| DomainID  | Integer | Yes      | Sender domain ID                               |
| LinkTracking | Integer | No    | Enable link tracking (1 = enabled, 0 = disabled) |
| OpenTracking | Integer | No    | Enable open tracking (1 = enabled, 0 = disabled) |
| UnsubscribeLink | Integer | No | Enable unsubscribe link (1 = enabled, 0 = disabled) |
| HostingProvider | String | No   | Hosting provider name                          |
| Subdomain | String | No         | Custom subdomain for tracking                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.updatedomain",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "LinkTracking": 1,
    "OpenTracking": 1
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Enabled",
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
5: Domain not found or access denied
```

:::

## Verify Sender Domain DNS Records

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                            |
|-----------|---------|----------|----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.verifydomain` |
| SessionID | String  | No       | Session ID obtained from login         |
| APIKey    | String  | No       | API key for authentication             |
| DomainID  | Integer | Yes      | Sender domain ID                       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.verifydomain",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Enabled"
  },
  "DNSVerificationResults": {
    "mail.example.com": ["CNAME", "target.example.com", true],
    "example.com": ["TXT", "v=spf1 include:example.com ~all", true]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get All Sender Domains

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                            |
|-----------|--------|----------|----------------------------------------|
| Command   | String | Yes      | API command: `emailgateway.getdomains` |
| SessionID | String | No       | Session ID obtained from login         |
| APIKey    | String | No       | API key for authentication             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getdomains",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domains": [
    {
      "DomainID": 123,
      "SenderDomain": "example.com",
      "Status": "Enabled"
    },
    {
      "DomainID": 124,
      "SenderDomain": "another.com",
      "Status": "Approval Pending"
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

## Delete a Sender Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                              |
|-----------|---------|----------|------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.deletedomain` |
| SessionID | String  | No       | Session ID obtained from login           |
| APIKey    | String  | No       | API key for authentication               |
| DomainID  | Integer | Yes      | Sender domain ID to delete               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deletedomain",
    "SessionID": "your-session-id",
    "DomainID": 123
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
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Clear Domain Email Queue

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                  |
|-----------|---------|----------|----------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.cleardomainqueue` |
| SessionID | String  | No       | Session ID obtained from login               |
| APIKey    | String  | No       | API key for authentication                   |
| DomainID  | Integer | Yes      | Sender domain ID                             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.cleardomainqueue",
    "SessionID": "your-session-id",
    "DomainID": 123
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
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get Domain Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.domainstats` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| DomainID  | Integer | Yes      | Sender domain ID                      |
| StartDate | String  | No       | Start date (Y-m-d format, default: 28 days ago) |
| EndDate   | String  | No       | End date (Y-m-d format, default: today) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.domainstats",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "StartDate": "2024-01-01",
    "EndDate": "2024-01-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Stats": {
    "Sent": 1000,
    "Delivered": 950,
    "Bounced": 50,
    "Opened": 400,
    "Clicked": 150
  },
  "ComparisonStats": {
    "PreviousPeriod": {
      "Sent": 800,
      "Delivered": 760
    }
  },
  "TagStats": {
    "campaign1": {
      "Sent": 500,
      "Delivered": 475
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Create API Key for Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| Command     | String  | Yes      | API command: `emailgateway.addapi`   |
| SessionID   | String  | No       | Session ID obtained from login       |
| APIKey      | String  | No       | API key for authentication           |
| Description | String  | Yes      | Description for the API key          |
| DomainID    | Integer | Yes      | Sender domain ID                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.addapi",
    "SessionID": "your-session-id",
    "Description": "Production API Key",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewAPIKeyID": 456,
  "APIKey": {
    "APIKeyID": 456,
    "APIKey": "eg_live_xxxxxxxxxxxx",
    "Description": "Production API Key",
    "DomainID": 123
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
1: Missing required parameter (Description)
2: Missing required parameter (DomainID)
3: Domain not found or access denied
```

:::

## Get Domain API Keys

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                         |
|-----------|---------|----------|-------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getapis` |
| SessionID | String  | No       | Session ID obtained from login      |
| APIKey    | String  | No       | API key for authentication          |
| DomainID  | Integer | Yes      | Sender domain ID                    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getapis",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "APIKeys": [
    {
      "APIKeyID": 456,
      "APIKey": "eg_live_xxxxxxxxxxxx",
      "Description": "Production API Key",
      "DomainID": 123
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Delete Domain API Key

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                            |
|-----------|---------|----------|----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.deleteapi`  |
| SessionID | String  | No       | Session ID obtained from login         |
| APIKey    | String  | No       | API key for authentication             |
| APIKeyID  | Integer | Yes      | API Key ID to delete                   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deleteapi",
    "SessionID": "your-session-id",
    "APIKeyID": 456
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
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (APIKeyID)
2: API Key not found or access denied
```

:::

## Create SMTP Credentials for Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.addsmtp`  |
| SessionID | String  | No       | Session ID obtained from login       |
| APIKey    | String  | No       | API key for authentication           |
| DomainID  | Integer | Yes      | Sender domain ID                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.addsmtp",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewSMTPID": 789,
  "SMTP": {
    "SMTPID": 789,
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "generated_password",
    "SMTPHost": "smtp.example.com",
    "SMTPPorts": [25, 587, 2525]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get Domain SMTP Credentials

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getsmtps`  |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| DomainID  | Integer | Yes      | Sender domain ID                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getsmtps",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPs": [
    {
      "SMTPID": 789,
      "SMTPUsername": "smtp_user_xxx",
      "SMTPHost": "smtp.example.com",
      "SMTPPorts": [25, 587, 2525]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Delete SMTP Credentials

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                             |
|-----------|---------|----------|-----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.deletesmtp`  |
| SessionID | String  | No       | Session ID obtained from login          |
| APIKey    | String  | No       | API key for authentication              |
| SMTPID    | Integer | Yes      | SMTP credentials ID to delete           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deletesmtp",
    "SessionID": "your-session-id",
    "SMTPID": 789
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
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (SMTPID)
2: SMTP credentials not found or access denied
```

:::

## Reset SMTP Password

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                  |
|-----------|---------|----------|----------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.resetsmtppassword` |
| SessionID | String  | No       | Session ID obtained from login               |
| APIKey    | String  | No       | API key for authentication                   |
| SMTPID    | Integer | Yes      | SMTP credentials ID                          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.resetsmtppassword",
    "SessionID": "your-session-id",
    "SMTPID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTP": {
    "SMTPID": 789,
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "new_generated_password"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (SMTPID)
2: SMTP credentials not found or access denied
```

:::

## Create Webhook for Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                    |
|------------|---------|----------|----------------------------------------------------------------|
| Command    | String  | Yes      | API command: `emailgateway.addwebhook`                         |
| SessionID  | String  | No       | Session ID obtained from login                                 |
| APIKey     | String  | No       | API key for authentication                                     |
| DomainID   | Integer | Yes      | Sender domain ID                                               |
| Event      | String  | Yes      | Event type: delivery, bounce, open, click, unsubscribe, complaint |
| WebhookURL | String  | Yes      | Webhook URL to receive event notifications                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.addwebhook",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "Event": "delivery",
    "WebhookURL": "https://example.com/webhooks/email-events"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewWebhookID": 999
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Missing required parameter (Event)
3: Invalid event type
4: Domain not found or access denied
5: Missing required parameter (WebhookURL)
```

:::

## Get Domain Webhooks

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                             |
|-----------|---------|----------|-----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getwebhooks` |
| SessionID | String  | No       | Session ID obtained from login          |
| APIKey    | String  | No       | API key for authentication              |
| DomainID  | Integer | Yes      | Sender domain ID                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getwebhooks",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SigningKey": "whsec_xxxxxxxxxxxx",
  "Webhooks": [
    {
      "WebhookID": 999,
      "Event": "delivery",
      "WebhookURL": "https://example.com/webhooks/email-events"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Delete Domain Webhook

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                |
|------------|---------|----------|--------------------------------------------|
| Command    | String  | Yes      | API command: `emailgateway.deletewebhook`  |
| SessionID  | String  | No       | Session ID obtained from login             |
| APIKey     | String  | No       | API key for authentication                 |
| WebhookID  | Integer | Yes      | Webhook ID to delete                       |
| DomainID   | Integer | Yes      | Sender domain ID                           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deletewebhook",
    "SessionID": "your-session-id",
    "WebhookID": 999,
    "DomainID": 123
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
  "ErrorCode": 4
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (WebhookID)
2: Missing required parameter (DomainID)
3: Domain not found or access denied
4: Webhook not found or access denied
```

:::

## Create Webhook (Public API)

<Badge type="info" text="POST" /> `/api/v1/webhooks`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type   | Required | Description                                                    |
|---------------|--------|----------|----------------------------------------------------------------|
| SenderAPIKey  | String | Yes      | API key for the sender domain (Bearer token)                   |
| Event         | String | Yes      | Event type: delivered, bounced, opened, clicked, unsubscribed, complained |
| WebhookURL    | String | Yes      | Webhook URL to receive event notifications                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -d '{
    "Event": "delivered",
    "WebhookURL": "https://example.com/webhooks/email-events"
  }'
```

```json [Success Response]
{
  "NewWebhookID": 999
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 3, "Message": "Invalid Event value"}
  ]
}
```

```txt [Error Codes]
2: Event is missing
3: Invalid event type or invalid webhook URL
5: WebhookURL is missing
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Get Webhooks (Public API)

<Badge type="info" text="GET" /> `/api/v1/webhooks`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter    | Type   | Required | Description                                |
|--------------|--------|----------|--------------------------------------------|
| SenderAPIKey | String | Yes      | API key for the sender domain (Bearer token) |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/webhooks \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx"
```

```json [Success Response]
{
  "Webhooks": [
    {
      "WebhookID": 999,
      "Event": "delivered",
      "WebhookURL": "https://example.com/webhooks/email-events"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 13, "Message": "Invalid SenderAPIKey"}
  ]
}
```

```txt [Error Codes]
2: Invalid user account
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Delete Webhook (Public API)

<Badge type="info" text="DELETE" /> `/api/v1/webhooks`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                                |
|--------------|---------|----------|--------------------------------------------|
| SenderAPIKey | String  | Yes      | API key for the sender domain (Bearer token) |
| WebhookID    | Integer | Yes      | Webhook ID to delete                       |

::: code-group

```bash [Example Request]
curl -X DELETE https://example.com/api/v1/webhooks \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "WebhookID": 999
  }'
```

```json [Success Response]
{}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 4, "Message": "Invalid WebhookID"}
  ]
}
```

```txt [Error Codes]
1: WebhookID is missing
2: Invalid user account
4: Invalid WebhookID
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Get Email Events

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                              |
|---------------|---------|----------|----------------------------------------------------------|
| Command       | String  | Yes      | API command: `emailgateway.getevents`                    |
| SessionID     | String  | No       | Session ID obtained from login                           |
| APIKey        | String  | No       | API key for authentication                               |
| DomainID      | Integer | Yes      | Sender domain ID                                         |
| StartFrom     | Integer | Yes      | Starting record index for pagination                     |
| RetrieveCount | Integer | Yes      | Number of records to retrieve (max 100)                  |
| StartDate     | String  | No       | Start date filter (Y-m-d format)                         |
| EndDate       | String  | No       | End date filter (Y-m-d format)                           |
| Event         | String  | No       | Filter by event type (delivery, bounce, open, click, etc.) |
| Query         | String  | No       | Search query string                                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getevents",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "StartFrom": 0,
    "RetrieveCount": 50,
    "Event": "delivery"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 150,
  "Events": [
    {
      "event": "delivery",
      "timestamp": 1640000000,
      "message": {
        "headers": {
          "from": "sender@example.com",
          "to": "recipient@example.com",
          "subject": "Test Email"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
4: Missing required parameter (StartFrom)
5: Missing required parameter (RetrieveCount)
```

:::

## Get Email Events (Public API)

<Badge type="info" text="GET" /> `/api/v1/events`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                              |
|---------------|---------|----------|----------------------------------------------------------|
| SenderAPIKey  | String  | Yes      | API key for the sender domain (Bearer token)             |
| StartFrom     | Integer | No       | Starting record index for pagination (default: 0)        |
| RetrieveCount | Integer | No       | Number of records to retrieve (default: 5, max 100)      |
| StartDate     | Integer | No       | Start date filter (Unix timestamp)                       |
| EndDate       | Integer | No       | End date filter (Unix timestamp)                         |
| Event         | String  | No       | Filter by event type                                     |
| MessageID     | String  | No       | Filter by message ID                                     |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/events \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -d '{
    "StartFrom": 0,
    "RetrieveCount": 50,
    "Event": "delivery"
  }'
```

```json [Success Response]
{
  "TotalRecords": 150,
  "Events": [
    {
      "Event": "delivery",
      "LoggedAt": 1640000000,
      "Message": {
        "Headers": {
          "From": "sender@example.com",
          "To": "recipient@example.com",
          "Subject": "Test Email"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 13, "Message": "Invalid SenderAPIKey"}
  ]
}
```

```txt [Error Codes]
1: Missing SenderAPIKey
2: Invalid sender domain
4: Missing StartFrom
5: Missing RetrieveCount
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Get Aggregated Event Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                  |
|------------------|---------|----------|----------------------------------------------|
| Command          | String  | Yes      | API command: `emailgateway.aggrevents`       |
| SessionID        | String  | No       | Session ID obtained from login               |
| APIKey           | String  | No       | API key for authentication                   |
| DomainID         | Integer | Yes      | Sender domain ID                             |
| StartDate        | String  | No       | Start date filter (Y-m-d format)             |
| EndDate          | String  | No       | End date filter (Y-m-d format)               |
| AggregatedField  | String  | No       | Field to aggregate by                        |
| AggregateSize    | Integer | No       | Number of aggregation buckets                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.aggrevents",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "StartDate": "2024-01-01",
    "EndDate": "2024-01-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "AggBuckets": [
    {
      "key": "delivery",
      "doc_count": 1000
    },
    {
      "key": "bounce",
      "doc_count": 50
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Send Email via API

<Badge type="info" text="POST" /> `/api/v1/email`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                |
|---------------|---------|----------|------------------------------------------------------------|
| SenderAPIKey  | String  | Yes      | API key for the sender domain (Bearer token)               |
| Subject       | String  | Yes      | Email subject line                                         |
| ContentType   | String  | Yes      | Content type: html or plain                                |
| HTMLContent   | String  | Conditional | HTML email content (required if ContentType is html)    |
| PlainContent  | String  | Conditional | Plain text email content (required if ContentType is plain) |
| From          | Object  | Yes      | Sender information: {name, email}                          |
| To            | Array   | Conditional | Array of recipients: [{name, email}] (required unless TargetListID is set) |
| CC            | Array   | No       | Array of CC recipients: [{name, email}]                    |
| BCC           | Array   | No       | Array of BCC recipients: [{name, email}]                   |
| ReplyTo       | Array   | No       | Array of reply-to addresses: [{name, email}]               |
| Tags          | Array   | No       | Array of custom tags for tracking                          |
| Headers       | Object  | No       | Custom email headers as key-value pairs                    |
| TrackLinks    | String  | No       | Enable link tracking: true or false                        |
| TrackOpens    | String  | No       | Enable open tracking: true or false                        |
| SendAt        | Integer | No       | Schedule send time (Unix timestamp)                        |
| Attachments   | Array   | No       | Array of attachments: [{filename, content, type, disposition, contentid}] |
| TemplateID    | Integer | No       | Email template ID to use                                   |
| TargetListID  | Integer | No       | Send to all subscribers in a list                          |
| ListID        | Integer | No       | List ID for subscriber context                             |
| SubscriberID  | Integer | No       | Subscriber ID for personalization                          |
| JourneyID     | Integer | No       | Journey ID for tracking                                    |
| ActionID      | Integer | No       | Journey action ID for tracking                             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -d '{
    "Subject": "Welcome to Our Service",
    "ContentType": "html",
    "HTMLContent": "<h1>Welcome!</h1><p>Thank you for signing up.</p>",
    "From": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "To": [
      {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ]
  }'
```

```json [Success Response]
{
  "MessageID": "550e8400-e29b-41d4-a716-446655440000"
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 8, "Message": "Missing Subject"}
  ]
}
```

```txt [Error Codes]
1: Missing SenderAPIKey
2: Invalid DomainID or invalid user account
3: From parameter is missing or invalid
8: Missing Subject or To email address
9: Missing ContentType
10: Missing HTMLContent
11: Missing PlainContent
12: Invalid or deactivated user account
13: Invalid SenderAPIKey
14: Email address is in the suppression list
15: Invalid TemplateID
16: Invalid TargetListID
17: Email sending limit reached
18: Recipient name or email address is missing
19: Recipient email address is invalid
20: There is no recipient set or count exceeds limit
21-22: CC email validation errors
23: Invalid from email address format
24-26: BCC email validation errors
27: BCC count exceeds limit
28-30: Reply-To email validation errors
31: Reply-To count exceeds limit
32: Domain is not activated
34: User account is not verified
35: Invalid ListID
36: Invalid SubscriberID
37: Invalid JourneyID
38: Invalid ActionID
429: Email send rate limit exceeded
```

:::

## Send Email via SMTP Relay

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- This is an internal endpoint used by the SMTP relay server
:::

**Request Body Parameters:**

| Parameter     | Type   | Required | Description                                |
|---------------|--------|----------|--------------------------------------------|
| Command       | String | Yes      | API command: `emailgateway.smtprelay`      |
| AdminAPIKey   | String | Yes      | Admin API key for authentication           |
| SMTPUsername  | String | Yes      | SMTP username for authentication           |
| SMTPPassword  | String | Yes      | SMTP password for authentication           |
| UUID          | String | No       | Unique message identifier                  |
| MailFrom      | String | No       | MAIL FROM envelope address                 |
| RcptTo        | String | No       | RCPT TO envelope addresses (comma-separated) |
| Subject       | String | No       | Email subject line                         |
| RawEmail      | String | No       | Raw email content (RFC 822 format)         |

::: code-group

```bash [Example Request - Auth Only]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.smtprelay",
    "AdminAPIKey": "your-admin-key",
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "smtp_password"
  }'
```

```bash [Example Request - Send Email]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.smtprelay",
    "AdminAPIKey": "your-admin-key",
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "smtp_password",
    "UUID": "550e8400-e29b-41d4-a716-446655440000",
    "MailFrom": "sender@example.com",
    "RcptTo": "recipient@example.com",
    "Subject": "Test Email",
    "RawEmail": "From: sender@example.com..."
  }'
```

```json [Success Response - Auth]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPUsername": "smtp_user_xxx",
  "SMTPPassword": "smtp_password"
}
```

```json [Success Response - Send]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPResponse": "250 2.0.0 Ok: queued",
  "SMTPUsername": "smtp_user_xxx",
  "SMTPPassword": "smtp_password"
}
```

```json [Error Response]
{
  "Success": false,
  "SMTPResponse": "500 5.0.0 AUTH ERROR",
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing SMTPUsername
2: Missing SMTPPassword
3: Invalid SMTP credentials
4: Invalid sender domain
5: Sender domain is not active
6: Invalid user account
7: User is not trusted or not enabled
8: Recipient email address is suppressed
```

:::

## Get All Sender Domains for PowerMTA Configuration

<Badge type="info" text="POST" /> `/api/v1/sender.domains`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                 |
|-----------|--------|----------|-----------------------------------------------------------------------------|
| Command   | String | No       | API command: `sender.domains` (only required for legacy endpoint)           |
| AdminAPIKey | String | No     | Admin API key for authentication (only required for legacy endpoint)        |
| DomainsResponseFormat | String | No | Response format: json, powermta-bounce-domains, powermta-relay-domains (default: json) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/sender.domains \
  -H "Content-Type: application/json" \
  -d '{
    "DomainsResponseFormat": "json"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Domains": [
    "example.com",
    "another.com",
    "third.com"
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Invalid DomainsResponseFormat"
}
```

```txt [Error Codes]
0: Success
1: Invalid DomainsResponseFormat (must be json, powermta-bounce-domains, or powermta-relay-domains)
```

:::

## Check Inbound Relay Domain Authorization

<Badge type="info" text="GET" /> `/api/v1/inbound-relay-domain-check`

::: tip API Usage Notes
- Authentication required: Bearer token (Admin API Key)
- This endpoint is designed for MX server integration to validate relay domains
- Returns HTTP status codes to indicate relay authorization
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                    |
|-----------|--------|----------|----------------------------------------------------------------|
| Domain    | String | Yes      | Domain name to check for relay authorization (can be full email address) |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/inbound-relay-domain-check?domain=example.com" \
  -H "Authorization: Bearer your-admin-api-key"
```

```json [Success Response - Relay Allowed]
{
  "Success": true,
  "RelayDomain": "example.com"
}
```

```json [Error Response - Auth Failed]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Authentication failed. Invalid admin API key."
    }
  ]
}
```

```json [Error Response - Relay Denied]
{}
```

```txt [HTTP Status Codes]
200: Relay allowed - domain is authorized for relay
403: Temporary error - authentication failed
500: Relay access denied - domain is not authorized
```

```txt [Error Codes]
1: Authentication failed - Invalid admin API key
```

:::
