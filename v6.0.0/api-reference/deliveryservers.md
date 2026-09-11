---
layout: doc
---

# Delivery Server API Documentation

Delivery server management endpoints for creating, updating, deleting, retrieving and verifying SMTP delivery servers. These endpoints are admin-only and manage the SMTP servers used to send email campaigns.

## Create a Delivery Server

<Badge type="info" text="POST" /> `/api/v1/deliveryserver.create`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/deliveryserver.create`. Legacy access via `/api.php` is also supported
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
| SenderRotation | String | No | `Enabled` to store `Domains.sender_rotation = true` (default false). Before v5.9.6 this parameter was accepted by `deliveryserver.update` only and silently dropped on create |
| SenderRotation_Settings | String | No | Stored as `Domains.sender_rotation_settings`. Before v5.9.6 this parameter was accepted by `deliveryserver.update` only and silently dropped on create |

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

<Badge type="info" text="GET" /> `/api/v1/deliveryserver.testresults`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/deliveryserver.testresults`. Legacy access via `/api.php` is also supported
- Since v5.9.6 this command runs the real verification (a test message through the server's own SMTP
  credentials, then the SPF, DKIM and DMARC TXT checks and the CNAME checks on the MFROM, link-tracking and
  open-tracking hosts) and stores what the check found. The `test_results` and `last_checked_at` values you
  send are accepted for backward compatibility and ignored. Before v5.9.6 the command stored those values as
  sent, with no check, so any admin caller could mark a server verified (issue #2769).
- The test message is sent to the authenticated admin's email address, with the admin's name as sender name.
  To pick another recipient, and to receive the results in the response instead of reading them back with
  `deliveryserver.get`, call `deliveryserver.verify`.
- Every call sends real mail and performs six DNS lookups, so since v5.9.6 this command is rate limited the
  same way as `deliveryserver.verify`: 10 calls per 300 seconds per caller.
- In demo mode the command answers `Success: true` without running or storing anything.
- The recipient is always the authenticated admin's stored email address. If that address is empty or
  invalid the test send fails and `email_delivery` is stored as false; the response does not say why, so
  check the admin record if `deliveryserver.verify` reports a send failure that names the recipient.
- Parameter names are matched after lowercasing, so send them exactly as `test_results` and `last_checked_at`
  (with the underscores). Earlier versions of this page showed `TestResults` and `LastCheckedAt`; those
  lowercase to `testresults` / `lastcheckedat`, never matched the handler, and always answered
  `ErrorCode [2, 4]`.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryserver.testresults` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | Integer | Yes | ID of the delivery server to verify |
| test_results | Object | Yes | Accepted for backward compatibility, ignored. Any non-empty value satisfies the check (for example `{"spf": false}`) |
| last_checked_at | String | Yes | Accepted for backward compatibility, ignored. The stored `VerificationLastCheckedAt` is the time the check ran |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryserver.testresults",
    "SessionID": "admin-session-id",
    "DeliveryServerID": 123,
    "test_results": {"spf": false},
    "last_checked_at": "2025-12-28 10:30:00"
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
  "ErrorCode": [3],
  "ErrorText": ["Invalid deliveryserverid"]
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

Read the stored outcome back with `deliveryserver.get`: `VerificationResults` holds the seven booleans
(`email_delivery`, `spf`, `dkim`, `dmarc`, `sender_domain`, `link_domain`, `open_domain`) and
`VerificationLastCheckedAt` the time of the check.

## Update a Delivery Server

<Badge type="info" text="POST" /> `/api/v1/deliveryserver.update`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/deliveryserver.update`. Legacy access via `/api.php` is also supported
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
| SenderRotation_Settings | String | No | Sender rotation configuration (JSON, stored as `Domains.sender_rotation_settings`) |
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

<Badge type="info" text="POST" /> `/api/v1/deliveryservers.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/deliveryservers.delete`. Legacy access via `/api.php` is also supported
- Deleting a server resets every user group whose `TargetDeliveryServerID_Marketing`, `TargetDeliveryServerID_Transactional` or `TargetDeliveryServerID_AutoResponder` option pointed at it back to `0` (system default), after invalidating the Email Gateway per-user cache for those groups. `UserGroupsReset` in the response lists the user group ids that were updated.
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
  "ErrorCode": 0,
  "UserGroupsReset": [2, 5]
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

<Badge type="info" text="GET" /> `/api/v1/deliveryservers.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/deliveryservers.get`. Legacy access via `/api.php` is also supported
- The filter, ordering and paging parameters are all optional. The defaults reproduce the previous response: every server, `Name ASC`, unpaged.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryservers.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | Integer | No | Return only this server (still keyed by id) |
| OrderField | String | No | `Name` (default), `DeliveryServerID`, `VerificationLastCheckedAt` |
| OrderType | String | No | `ASC` (default) or `DESC` |
| RecordsFrom | Integer | No | Offset (default 0) |
| RecordsPerRequest | Integer | No | Page size (default 0 = all, max 1000) |

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
  "TotalDeliveryServerCount": 1,
  "RecordsFrom": 0,
  "RecordsPerRequest": 0,
  "OrderField": "Name",
  "OrderType": "ASC",
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
| TotalDeliveryServerCount | Integer | Real total number of servers matching the filter, independent of paging |
| RecordsFrom | Integer | Offset in effect |
| RecordsPerRequest | Integer | Page size in effect (0 = all) |
| OrderField | String | Ordering field in effect |
| OrderType | String | Ordering direction in effect |
| DeliveryServers | Object | Map of delivery servers keyed by DeliveryServerID |
| DeliveryServerID | String | Unique identifier for the delivery server |
| Name | String | Display name of the delivery server |
| ConnectionParams | Object | SMTP connection configuration (host, port, security, auth) |
| Domains | Object | Domain settings for tracking and sender identity |
| VerificationResults | Object | DNS and delivery verification test results |
| VerificationLastCheckedAt | String | Timestamp of last verification check |
| UserGroupAssignments | Array | List of user groups assigned to this delivery server. Each entry contains `UserGroupID`, `GroupName`, and `Channels` (array of channel names: `Marketing`, `Transactional`, `AutoResponder`) |
| IsAllocated | Boolean | Whether the delivery server is assigned to at least one user group channel |

## Get a Delivery Server

<Badge type="info" text="GET" /> `/api/v1/deliveryserver.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required admin privilege: `DeliveryServers`
- v1 REST alias: `GET /api/v1/deliveryserver.get`. Legacy access via `/api.php` is also supported
- `ConnectionParams.smtp_password` is never returned; `HasSMTPPassword` says whether one is stored. `deliveryserver.update` replaces `ConnectionParams` as a whole, so a client editing a server must resend the password it holds.
- `UserGroupAssignments` / `IsAllocated` are the same reverse map `deliveryservers.get` computes from every user group's `TargetDeliveryServerID_*` options.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryserver.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | Integer | Yes | ID of the delivery server |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryserver.get",
    "AdminAPIKey": "your-admin-api-key",
    "DeliveryServerID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeliveryServer": {
    "DeliveryServerID": 123,
    "Name": "Primary SMTP Server",
    "ConnectionParams": {
      "smtp_host": "smtp.example.com",
      "smtp_port": "587",
      "smtp_secure": "tls",
      "smtp_timeout": "30",
      "smtp_auth": true,
      "smtp_username": "smtp_user"
    },
    "HasSMTPPassword": true,
    "Domains": {
      "link_tracking": "track.example.com",
      "open_tracking": "open.example.com",
      "mfrom_domain": "bounce.example.com",
      "enforced_from": "",
      "sender_rotation_settings": "",
      "senderinfo_as_mfrom": false,
      "senderinfo_as_from": false,
      "sender_rotation": false
    },
    "VerificationResults": {
      "email_delivery": true,
      "spf": true,
      "dkim": true,
      "dmarc": false,
      "sender_domain": true,
      "link_domain": true,
      "open_domain": true
    },
    "VerificationLastCheckedAt": "2026-09-04 10:12:33",
    "UserGroupAssignments": [
      {"UserGroupID": "2", "GroupName": "Agencies", "Channels": ["Marketing", "Transactional"]}
    ],
    "IsAllocated": true
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Delivery server not found"]
}
```

```txt [Error Codes]
0: Success
1: Missing DeliveryServerID
2: Delivery server not found
```

:::

## Verify a Delivery Server

<Badge type="info" text="POST" /> `/api/v1/deliveryserver.verify`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required admin privilege: `DeliveryServers`
- Rate limited: 10 calls per 300 seconds. Every call sends a real test message through the server's SMTP credentials and performs six DNS lookups.
- v1 REST alias: `POST /api/v1/deliveryserver.verify`. Legacy access via `/api.php` is also supported
- Not available when `DEMO_MODE_ENABLED` is on (error 4).
- Runs the same verification as the admin screen's "Test" button (`DeliveryServers::Verify`): a test send, then SPF, DKIM (`DNS_DKIM_KEY._domainkey.<mfrom>`) and DMARC TXT checks on the MFROM domain, and CNAME checks on the MFROM, link-tracking and open-tracking hosts against `DNS_SENDER_DOMAIN`, `DNS_LINK_TRACKER` and `DNS_OPEN_TRACKER`. The seven booleans are persisted to `VerificationResults` together with `VerificationLastCheckedAt`, exactly as the screen does.
- The test message goes to the authenticated admin's email address unless `To` is given.
- `deliveryserver.testresults` runs the same verification since v5.9.6 but answers only the `Success` envelope; prefer this command for a UI, it returns the results and the per-check messages.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `deliveryserver.verify` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| DeliveryServerID | Integer | Yes | ID of the delivery server |
| To | String | No | Recipient of the test message (defaults to the admin's email address) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryserver.verify",
    "AdminAPIKey": "your-admin-api-key",
    "DeliveryServerID": 123,
    "To": "postmaster@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeliveryServerID": 123,
  "AllPassed": false,
  "VerificationResults": {
    "email_delivery": true,
    "spf": true,
    "dkim": true,
    "dmarc": false,
    "sender_domain": true,
    "link_domain": true,
    "open_domain": true
  },
  "Messages": {
    "email_delivery": "",
    "spf": "",
    "dkim": "",
    "dmarc": "DMARC record not found",
    "sender_domain": "",
    "link_domain": "",
    "open_domain": ""
  },
  "VerificationLastCheckedAt": "2026-09-04 10:12:33",
  "TestEmailSentTo": "postmaster@example.com"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Delivery server not found"]
}
```

```txt [Error Codes]
0: Success
1: Missing DeliveryServerID
2: Delivery server not found
3: Invalid To email address
4: Not available in demo mode
```

:::
