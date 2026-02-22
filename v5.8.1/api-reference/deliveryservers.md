---
layout: doc
---

# Delivery Server API Documentation

Delivery server management endpoints for creating, updating, deleting, and retrieving SMTP delivery servers. These endpoints are admin-only and manage the SMTP servers used to send email campaigns.

## Create a Delivery Server

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryserver.create` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerName | String | Yes | Name of the delivery server |
| SendMethodSMTPHost | String | Yes | SMTP server hostname or IP address |
| SendMethodSMTPPort | Integer | Yes | SMTP server port (e.g., 25, 587, 465) |
| SendMethodSMTPSecure | String | Yes | Security protocol: "false", "ssl", or "tls" |
| SendMethodSMTPTimeout | Integer | Yes | Connection timeout in seconds (must be numeric) |
| SendMethodSMTPAuth | Boolean | Yes | Whether SMTP authentication is required: true or false |
| SendMethodSMTPUsername | String | Conditional | SMTP username (required if SendMethodSMTPAuth is true) |
| SendMethodSMTPPassword | String | No | SMTP password |
| DomainSettings_LinkTracking | String | Yes | Domain for link tracking (e.g., "track.example.com") |
| DomainSettings_OpenTracking | String | Yes | Domain for open tracking (e.g., "open.example.com") |
| DomainSettings_MFrom | String | Yes | Mail From domain (e.g., "bounce.example.com") |
| DomainSettings_EnforcedFrom | String | No | Enforced From email address (must be valid email format) |
| SenderInfoAsMFrom | String | No | Use sender info as MFrom: "Enabled" or "Disabled" (default: "Disabled") |
| SenderInfoAsFrom | String | No | Use sender info as From: "Enabled" or "Disabled" (default: "Disabled") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryserver.create",
    "SessionID": "admin-session-id",
    "DeliveryServerName": "Primary SMTP Server",
    "SendMethodSMTPHost": "smtp.example.com",
    "SendMethodSMTPPort": 587,
    "SendMethodSMTPSecure": "tls",
    "SendMethodSMTPTimeout": 30,
    "SendMethodSMTPAuth": true,
    "SendMethodSMTPUsername": "smtp_user",
    "SendMethodSMTPPassword": "smtp_password",
    "DomainSettings_LinkTracking": "track.example.com",
    "DomainSettings_OpenTracking": "open.example.com",
    "DomainSettings_MFrom": "bounce.example.com",
    "DomainSettings_EnforcedFrom": "noreply@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeliveryServerID": 123
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3],
  "ErrorText": ["Missing deliveryservername", "Missing sendmethodsmtphost", "Missing sendmethodsmtpport"]
}
```

```txt [Error Codes]
0: Success
1: Missing deliveryservername
2: Missing sendmethodsmtphost
3: Missing sendmethodsmtpport
4: Missing sendmethodsmtpsecure
5: Missing sendmethodsmtptimeout
6: Missing sendmethodsmtpauth
7: Missing sendmethodsmtpusername
8: Missing sendmethodsmtppassword
9: Missing domainsettings_linktracking
10: Missing domainsettings_opentracking
11: Missing domainsettings_mfrom
12: Missing domainsettings_enforcedfrom
13: Invalid sendmethodsmtpsecure value (must be: false, ssl, tls)
14: Invalid sendmethodsmtpauth value (must be: true, false)
15: Invalid sendmethodsmtptimeout value (must be numeric)
16: Invalid email address value for domainsettings_enforcedfrom
```

:::

## Save Delivery Server Test Results

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryserver.testresults` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | Integer | Yes | ID of the delivery server |
| TestResults | Object | Yes | Verification test results object |
| TestResults.SPF | Boolean | Yes | SPF record verification result |
| TestResults.DKIM | Boolean | Yes | DKIM record verification result |
| TestResults.DMARC | Boolean | Yes | DMARC record verification result |
| TestResults.SenderDomain | Boolean | Yes | Sender domain verification result |
| TestResults.LinkDomain | Boolean | Yes | Link tracking domain verification result |
| TestResults.OpenDomain | Boolean | Yes | Open tracking domain verification result |
| TestResults.EmailDelivery | Boolean | Yes | Email delivery test result |
| LastCheckedAt | String | Yes | Last verification timestamp (format: "YYYY-MM-DD HH:MM:SS") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryserver.testresults",
    "SessionID": "admin-session-id",
    "DeliveryServerID": 123,
    "TestResults": {
      "SPF": true,
      "DKIM": true,
      "DMARC": true,
      "SenderDomain": true,
      "LinkDomain": true,
      "OpenDomain": true,
      "EmailDelivery": true
    },
    "LastCheckedAt": "2025-12-28 10:30:00"
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
  "ErrorCode": [1, 3],
  "ErrorText": ["Missing deliveryserverid", "Invalid deliveryserverid"]
}
```

```txt [Error Codes]
0: Success
1: Missing deliveryserverid
2: Missing test_results
3: Invalid deliveryserverid
4: Missing last_checked_at
```

:::

## Update a Delivery Server

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryserver.update` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | Integer | Yes | ID of the delivery server to update |
| DeliveryServerName | String | Yes | Name of the delivery server |
| SendMethodSMTPHost | String | Yes | SMTP server hostname or IP address |
| SendMethodSMTPPort | Integer | Yes | SMTP server port (e.g., 25, 587, 465) |
| SendMethodSMTPSecure | String | Yes | Security protocol: "false", "ssl", or "tls" |
| SendMethodSMTPTimeout | Integer | Yes | Connection timeout in seconds (must be numeric) |
| SendMethodSMTPAuth | Boolean | Yes | Whether SMTP authentication is required: true or false |
| SendMethodSMTPUsername | String | Conditional | SMTP username (required if SendMethodSMTPAuth is true) |
| SendMethodSMTPPassword | String | No | SMTP password |
| DomainSettings_LinkTracking | String | Yes | Domain for link tracking (e.g., "track.example.com") |
| DomainSettings_OpenTracking | String | Yes | Domain for open tracking (e.g., "open.example.com") |
| DomainSettings_MFrom | String | Yes | Mail From domain (e.g., "bounce.example.com") |
| DomainSettings_EnforcedFrom | String | No | Enforced From email address (must be valid email format) |
| SenderRotationSettings | String | No | Sender rotation configuration |
| SenderInfoAsMFrom | String | No | Use sender info as MFrom: "Enabled" or "Disabled" |
| SenderInfoAsFrom | String | No | Use sender info as From: "Enabled" or "Disabled" |
| SenderRotation | String | No | Enable sender rotation: "Enabled" or "Disabled" |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryserver.update",
    "SessionID": "admin-session-id",
    "DeliveryServerID": 123,
    "DeliveryServerName": "Updated SMTP Server",
    "SendMethodSMTPHost": "smtp2.example.com",
    "SendMethodSMTPPort": 587,
    "SendMethodSMTPSecure": "tls",
    "SendMethodSMTPTimeout": 30,
    "SendMethodSMTPAuth": true,
    "SendMethodSMTPUsername": "new_user",
    "SendMethodSMTPPassword": "new_password",
    "DomainSettings_LinkTracking": "track.example.com",
    "DomainSettings_OpenTracking": "open.example.com",
    "DomainSettings_MFrom": "bounce.example.com",
    "SenderRotation": "Enabled"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeliveryServerID": 123
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [17],
  "ErrorText": ["Delivery server not found"]
}
```

```txt [Error Codes]
0: Success
1: Missing deliveryservername
2: Missing sendmethodsmtphost
3: Missing sendmethodsmtpport
4: Missing sendmethodsmtpsecure
5: Missing sendmethodsmtptimeout
6: Missing sendmethodsmtpauth
7: Missing sendmethodsmtpusername
8: Missing sendmethodsmtppassword
9: Missing domainsettings_linktracking
10: Missing domainsettings_opentracking
11: Missing domainsettings_mfrom
12: Missing domainsettings_enforcedfrom
13: Invalid sendmethodsmtpsecure value (must be: false, ssl, tls)
14: Invalid sendmethodsmtpauth value (must be: true, false)
15: Invalid sendmethodsmtptimeout value (must be numeric)
16: Invalid email address value for domainsettings_enforcedfrom
17: Delivery server not found
```

:::

## Delete Delivery Servers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryservers.delete` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | String | Yes | Comma-separated list of delivery server IDs to delete (e.g., "123,456,789") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryservers.delete",
    "SessionID": "admin-session-id",
    "DeliveryServerID": "123,456"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing deliveryserverid
```

:::

## Get Delivery Servers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryservers.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryservers.get",
    "SessionID": "admin-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "DeliveryServers": {
    "123": {
      "DeliveryServerID": "123",
      "Name": "Primary SMTP Server",
      "ConnectionParams": {
        "smtp_host": "smtp.example.com",
        "smtp_port": 587,
        "smtp_secure": "tls",
        "smtp_timeout": 30,
        "smtp_auth": true,
        "smtp_username": "smtp_user",
        "smtp_password": "smtp_password"
      },
      "Domains": {
        "link_tracking": "track.example.com",
        "open_tracking": "open.example.com",
        "mfrom_domain": "bounce.example.com",
        "enforced_from": "noreply@example.com",
        "senderinfo_as_mfrom": false,
        "senderinfo_as_from": false
      },
      "VerificationResults": {
        "email_delivery": true,
        "spf": true,
        "dkim": true,
        "dmarc": true,
        "sender_domain": true,
        "link_domain": true,
        "open_domain": true
      },
      "VerificationLastCheckedAt": "2025-12-28 10:30:00",
      "UserGroupAssignments": [
        {
          "UserGroupID": "1",
          "GroupName": "Default User Group",
          "Channels": ["Marketing", "Transactional"]
        },
        {
          "UserGroupID": "5",
          "GroupName": "Enterprise Users",
          "Channels": ["AutoResponder"]
        }
      ],
      "IsAllocated": true
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
2: No delivery servers found
```

:::

**Response Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| DeliveryServers | Object | Map of delivery servers keyed by DeliveryServerID |
| DeliveryServerID | String | Unique identifier for the delivery server |
| Name | String | Display name of the delivery server |
| ConnectionParams | Object | SMTP connection configuration (host, port, security, auth) |
| Domains | Object | Domain settings for tracking and sender identity |
| VerificationResults | Object | DNS and delivery verification test results |
| VerificationLastCheckedAt | String | Timestamp of last verification check |
| UserGroupAssignments | Array | List of user groups assigned to this delivery server. Each entry contains `UserGroupID`, `GroupName`, and `Channels` (array of channel names: `Marketing`, `Transactional`, `AutoResponder`) |
| IsAllocated | Boolean | Whether the delivery server is assigned to at least one user group channel |
