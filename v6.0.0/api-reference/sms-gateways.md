---
layout: doc
---

# SMS Gateway API Documentation

Admin endpoints for managing SMS gateways: the provider connections (Infobip and any other connector installed under `includes/sms_connectors/`), their sender numbers, country restrictions, link-shortening domains, and which user accounts may send through them. These endpoints back the admin "SMS Gateways" screen and expose the same class (`SMSGatewayManager`) it uses.

All commands require the Admin API key (or an admin session) and the `DeliveryServers` sub-admin privilege.

::: warning Provider credentials are redacted
`GatewaySettings` holds provider API keys. Every read endpoint returns credential values as the literal string `***REDACTED***` (the same key-name rule `system.getsettings` applies, plus any connector field declared `"type": "password"`). `smsgateway.update` and `smsgateway.testconnection` accept that literal back as "keep the stored value", so a read-modify-write round trip never has to see, or re-send, the secret. `smsgateway.create` rejects it, since there is nothing stored to keep.
:::

::: tip Nested keys and the API key-lowercasing rule
`api.php` lowercases every request parameter name, including the keys inside a nested `GatewaySettings` object. These endpoints match the keys case-insensitively against the connector's declared `configuration_fields[].name` and store them under the declared name, so `{"API_KEY": "..."}`, `{"api_key": "..."}` and `{"Api_Key": "..."}` are equivalent. Keys the connector does not declare are dropped.
:::

## List SMS Connectors

<Badge type="info" text="POST" /> `/api/v1/smsgateway.connectors.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- The credential form is dynamic per connector. Render `GatewaySettings` from `configuration_fields[]` (`name`, `label`, `type`, `required`, `default`, `placeholder`, `description`) and post the values back keyed by `name`.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.connectors.get` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayType | String | No | Return only this connector type (e.g. `infobip`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.connectors.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.connectors.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Connectors": {
    "infobip": {
      "type": "infobip",
      "display_name": "Infobip",
      "version": "1.0.0",
      "description": "Enterprise SMS gateway with global reach and advanced messaging capabilities",
      "configuration_fields": [
        { "name": "api_key", "label": "API Key", "type": "password", "required": true, "description": "Your Infobip API key for authentication" },
        { "name": "base_url", "label": "Base URL", "type": "text", "required": true, "default": "abc.api.infobip.com", "description": "Infobip API base URL (may vary by region)" },
        { "name": "sender", "label": "Default Sender", "type": "text", "required": false, "description": "Default sender ID or phone number" }
      ],
      "supports": { "short_links": true, "sender_id": true, "delivery_reports": true, "two_way": true, "unicode": true, "long_messages": true, "webhooks": true },
      "rate_limits": { "requests_per_second": 50, "messages_per_request": 1000 },
      "status": "stable"
    }
  },
  "TotalConnectors": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Unknown GatewayType. Available: infobip, test"
}
```

```txt [Error Codes]
0: Success
1: Unknown GatewayType
```

:::

## List SMS Gateways

<Badge type="info" text="POST" /> `/api/v1/smsgateways.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Credentials inside `GatewaySettings` are returned as `***REDACTED***`
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateways.get` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayStatus | String | No | Filter by status: `Active` or `Inactive` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateways.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateways.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SMSGateways": [
    {
      "GatewayID": 3,
      "GatewayName": "Infobip EU",
      "GatewayType": "infobip",
      "GatewayTypeDisplay": "Infobip",
      "GatewayStatus": "Active",
      "GatewaySettings": { "api_key": "***REDACTED***", "base_url": "abc.api.infobip.com", "sender": "OCTETH", "default_sender": "+15551234567" },
      "DefaultSender": "+15551234567",
      "SenderNumbers": ["+15551234567", "+15557654321"],
      "ShortDomains": ["s.example.com"],
      "CountryRestrictions": ["US", "GB"],
      "MessageConcatenation": 5,
      "IsGlobal": 0,
      "AssignedUserCount": 2,
      "CreatedAt": "2026-09-04 10:00:00",
      "UpdatedAt": "2026-09-04 10:30:00"
    }
  ],
  "TotalSMSGateways": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Invalid GatewayStatus. Allowed: Active, Inactive"
}
```

```txt [Error Codes]
0: Success
1: Invalid GatewayStatus
```

:::

## Get an SMS Gateway

<Badge type="info" text="POST" /> `/api/v1/smsgateway.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Credentials inside `GatewaySettings` are returned as `***REDACTED***`; `smsgateway.update` accepts that value back to keep the stored secret
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.get` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayID | Integer | Yes | ID of the gateway |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.get",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayID": 3
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SMSGateway": {
    "GatewayID": 3,
    "GatewayName": "Infobip EU",
    "GatewayType": "infobip",
    "GatewayTypeDisplay": "Infobip",
    "GatewayStatus": "Active",
    "GatewaySettings": { "api_key": "***REDACTED***", "base_url": "abc.api.infobip.com", "sender": "OCTETH", "default_sender": "+15551234567" },
    "DefaultSender": "+15551234567",
    "SenderNumbers": ["+15551234567", "+15557654321"],
    "ShortDomains": ["s.example.com"],
    "CountryRestrictions": ["US", "GB"],
    "MessageConcatenation": 5,
    "IsGlobal": 0,
    "AssignedUserCount": 2,
    "CreatedAt": "2026-09-04 10:00:00",
    "UpdatedAt": "2026-09-04 10:30:00"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "SMS gateway not found"
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid GatewayID
2: SMS gateway not found
```

:::

## Create an SMS Gateway

<Badge type="info" text="POST" /> `/api/v1/smsgateway.create`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
- `GatewaySettings` keys are the connector's `configuration_fields[].name` from `smsgateway.connectors.get`; required ones must be present and non-empty
- `DefaultSender` is stored inside `GatewaySettings` as `default_sender` (the same place the admin screen stores it) and must be one of `SenderNumbers`
- List parameters (`SenderNumbers`, `ShortDomains`, `CountryRestrictions`, `UserIDs`) accept a JSON array or a newline/comma separated string
- A non-global gateway (`IsGlobal=0`) is only usable by the users assigned to it; pass `UserIDs` here or call `smsgateway.users.assign` afterwards
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.create` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayName | String | Yes | Display name, 3 to 255 characters |
| GatewayType | String | Yes | Connector type, one of the keys returned by `smsgateway.connectors.get` |
| GatewayStatus | String | No | `Active` (default) or `Inactive` |
| GatewaySettings | Object | Yes | Per-connector configuration keyed by field name |
| SenderNumbers | Array | No | Sender numbers; each must match `+?[1-9][0-9]{6,14}` |
| ShortDomains | Array | No | Link-shortening domains |
| CountryRestrictions | Array | No | Two-letter country codes the gateway may send to; stored upper-cased |
| MessageConcatenation | Integer | No | Maximum SMS parts per message, 1 to 10 (default 10) |
| IsGlobal | Boolean | No | `1` = available to every user; `0` (default) = only to assigned users |
| DefaultSender | String | No | Default sender number; must be one of `SenderNumbers` |
| UserIDs | Array | No | Users to assign (only when `IsGlobal=0`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.create \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.create",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayName": "Infobip EU",
    "GatewayType": "infobip",
    "GatewayStatus": "Active",
    "GatewaySettings": { "api_key": "your-infobip-key", "base_url": "abc.api.infobip.com", "sender": "OCTETH" },
    "SenderNumbers": ["+15551234567", "+15557654321"],
    "ShortDomains": ["s.example.com"],
    "CountryRestrictions": ["US", "GB"],
    "MessageConcatenation": 5,
    "DefaultSender": "+15551234567",
    "IsGlobal": 0,
    "UserIDs": [12, 15]
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "GatewayID": 3,
  "SMSGateway": {
    "GatewayID": 3,
    "GatewayName": "Infobip EU",
    "GatewayType": "infobip",
    "GatewayStatus": "Active",
    "GatewaySettings": { "api_key": "***REDACTED***", "base_url": "abc.api.infobip.com", "sender": "OCTETH", "default_sender": "+15551234567" },
    "DefaultSender": "+15551234567",
    "SenderNumbers": ["+15551234567", "+15557654321"],
    "ShortDomains": ["s.example.com"],
    "CountryRestrictions": ["US", "GB"],
    "MessageConcatenation": 5,
    "IsGlobal": 0,
    "AssignedUserCount": 2
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 8,
  "ErrorText": "Missing required GatewaySettings field(s): API Key"
}
```

```txt [Error Codes]
0: Success
1: Missing GatewayName
2: GatewayName must be between 3 and 255 characters
3: Missing GatewayType
4: Unknown GatewayType
5: Invalid GatewayStatus
6: GatewaySettings missing or not an object
7: GatewaySettings contains the redaction marker (nothing stored to keep on create)
8: Missing required connector field(s) (ErrorText lists them)
9: Invalid SenderNumbers (ErrorText lists them)
10: Invalid CountryRestrictions (ErrorText lists them)
11: Invalid MessageConcatenation (must be 1 to 10)
12: DefaultSender is not one of SenderNumbers
13: UserIDs given for a global gateway
14: Unknown UserIDs (ErrorText lists them)
15: UserIDs outside the user groups this admin account may access
16: Gateway could not be created
17: Users could not be assigned to the new gateway (the gateway is not created)
```

:::

## Update an SMS Gateway

<Badge type="info" text="POST" /> `/api/v1/smsgateway.update`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
- Partial update: only the parameters present in the request change
- `GatewaySettings` is itself partial: keys omitted keep their stored value, a key equal to `***REDACTED***` keeps its stored value, any other key is replaced (send `""` to clear one). Required connector fields are checked on the resulting object, so a partial update can never leave the gateway without a credential it needs
- Changing `GatewayType` requires a complete `GatewaySettings` for the new connector with no redaction markers
- Setting `IsGlobal=1` clears all user assignments
- A sub-admin restricted to specific user groups may only name users in those groups; existing assignments outside its scope are preserved
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.update` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayID | Integer | Yes | ID of the gateway |
| GatewayName | String | No | Display name, 3 to 255 characters |
| GatewayType | String | No | New connector type (see notes) |
| GatewayStatus | String | No | `Active` or `Inactive` |
| GatewaySettings | Object | No | Per-connector configuration, partial (see notes) |
| SenderNumbers | Array | No | Replaces the sender number list |
| ShortDomains | Array | No | Replaces the short domain list |
| CountryRestrictions | Array | No | Replaces the country restriction list |
| MessageConcatenation | Integer | No | 1 to 10 |
| IsGlobal | Boolean | No | `1` or `0` |
| DefaultSender | String | No | Must be one of the effective `SenderNumbers`; `""` clears it |
| UserIDs | Array | No | Replaces the assignment set (only when the gateway is non-global); `""` clears it |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.update",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayID": 3,
    "GatewayName": "Infobip EU (primary)",
    "GatewaySettings": { "api_key": "***REDACTED***", "base_url": "eu.api.infobip.com" },
    "MessageConcatenation": 3
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SMSGateway": {
    "GatewayID": 3,
    "GatewayName": "Infobip EU (primary)",
    "GatewayType": "infobip",
    "GatewayStatus": "Active",
    "GatewaySettings": { "api_key": "***REDACTED***", "base_url": "eu.api.infobip.com", "sender": "OCTETH", "default_sender": "+15551234567" },
    "DefaultSender": "+15551234567",
    "SenderNumbers": ["+15551234567", "+15557654321"],
    "ShortDomains": ["s.example.com"],
    "CountryRestrictions": ["US", "GB"],
    "MessageConcatenation": 3,
    "IsGlobal": 0,
    "AssignedUserCount": 2
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 11,
  "ErrorText": "DefaultSender must be one of SenderNumbers"
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid GatewayID
2: SMS gateway not found
3: GatewayName must be between 3 and 255 characters
4: Unknown GatewayType
5: Invalid GatewayStatus
6: GatewaySettings not an object, or missing while GatewayType changes
7: Missing required connector field(s) on the resulting settings (ErrorText lists them)
8: Invalid SenderNumbers (ErrorText lists them)
9: Invalid CountryRestrictions (ErrorText lists them)
10: Invalid MessageConcatenation (must be 1 to 10)
11: DefaultSender is not one of SenderNumbers
12: UserIDs given for a global gateway
13: Unknown UserIDs (ErrorText lists them)
14: UserIDs outside the user groups this admin account may access
15: Redaction marker not allowed when GatewayType changes
16: Gateway could not be updated
17: Gateway updated but its user assignments could not be saved
```

:::

## Delete SMS Gateways

<Badge type="info" text="POST" /> `/api/v1/smsgateways.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
- Deletes the gateways and their user assignments. Unknown ids in the list are ignored; the response lists what was actually deleted
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateways.delete` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayIDs | String or Array | Yes | Comma-separated list or JSON array of gateway ids |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateways.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateways.delete",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayIDs": "3,4"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeletedGatewayIDs": [3, 4],
  "TotalDeleted": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "None of the given GatewayIDs exist"
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid GatewayIDs
2: None of the given GatewayIDs exist
3: Gateways could not be deleted
```

:::

## Test an SMS Gateway Connection

<Badge type="info" text="POST" /> `/api/v1/smsgateway.testconnection`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Runs the provider's live credential check. Nothing is persisted
- Two modes: `GatewayID` tests the saved gateway (an optional `GatewaySettings` overrides stored values first, markers keep the stored value); `GatewayType` plus `GatewaySettings` tests unsaved credentials
- Rate limited to 5 provider calls per hour per admin, shared with the admin screen's Test Connection button. Requests rejected by validation (codes 1 to 5) do not count
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.testconnection` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayID | Integer | Conditional | Saved gateway to test |
| GatewayType | String | Conditional | Connector type for an unsaved test (ignored when `GatewayID` is given) |
| GatewaySettings | Object | Conditional | Credentials to test, or overrides for the saved gateway |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.testconnection \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.testconnection",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayType": "infobip",
    "GatewaySettings": { "api_key": "your-infobip-key", "base_url": "abc.api.infobip.com" }
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "GatewayType": "infobip",
  "Message": "Connection successful",
  "Details": {},
  "RemainingTests": 4
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorText": "Rate limit exceeded. Please wait 42 minute(s) before testing again.",
  "RetryAfter": 2520,
  "RemainingTests": 0
}
```

```txt [Error Codes]
0: Success
1: Neither GatewayID nor GatewayType given
2: SMS gateway not found
3: Unknown GatewayType
4: GatewaySettings not an object
5: Missing required connector field(s) (ErrorText lists them)
6: Rate limit exceeded (RetryAfter seconds and RemainingTests are returned)
7: Connection test failed (ErrorText carries the provider message, Details any extra data)
```

:::

## List Users Assigned to an SMS Gateway

<Badge type="info" text="POST" /> `/api/v1/smsgateway.users.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Only meaningful for non-global gateways (`IsGlobal=0`); a global gateway always returns an empty list
- A sub-admin restricted to specific user groups only sees users in those groups; `TotalAssignedUsers` is the unfiltered count
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.users.get` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayID | Integer | Yes | ID of the gateway |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.users.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.users.get",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayID": 3
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "GatewayID": 3,
  "IsGlobal": 0,
  "Users": [
    { "UserID": 12, "Username": "acme", "EmailAddress": "ops@acme.example", "RelUserGroupID": 2, "AssignedAt": "2026-09-04 10:00:00" }
  ],
  "TotalUsers": 1,
  "TotalAssignedUsers": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "SMS gateway not found"
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid GatewayID
2: SMS gateway not found
```

:::

## Assign Users to an SMS Gateway

<Badge type="info" text="POST" /> `/api/v1/smsgateway.users.assign`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `DeliveryServers`
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
- Replaces the whole assignment set. Pass an empty `UserIDs` to clear it
- Only for non-global gateways; set `IsGlobal=0` with `smsgateway.update` first
- A sub-admin restricted to specific user groups may only name users in those groups; existing assignments outside its scope are preserved rather than dropped
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smsgateway.users.assign` |
| AdminAPIKey | String | Yes | Admin API key |
| GatewayID | Integer | Yes | ID of the gateway |
| UserIDs | String or Array | Yes | Comma-separated list or JSON array of user ids; empty clears all assignments |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smsgateway.users.assign \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smsgateway.users.assign",
    "AdminAPIKey": "your-admin-api-key",
    "GatewayID": 3,
    "UserIDs": [12, 15]
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "GatewayID": 3,
  "AssignedUserIDs": [12, 15],
  "TotalAssignedUsers": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "This gateway is global (IsGlobal=1); per-user assignment does not apply. Set IsGlobal=0 via smsgateway.update first"
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid GatewayID
2: SMS gateway not found
3: UserIDs parameter missing (pass an empty value to clear)
4: Gateway is global; per-user assignment does not apply
5: Unknown UserIDs (ErrorText lists them)
6: UserIDs outside the user groups this admin account may access
7: Assignment could not be saved
```

:::
