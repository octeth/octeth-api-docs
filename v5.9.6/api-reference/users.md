---
layout: doc
---

# User API Documentation

User management endpoints for creating, authenticating, and managing user accounts and user groups.

## Create a User

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| RelUserGroupID | Integer | Yes | User group ID to assign the user to |
| EmailAddress | String | Yes | User's email address |
| Username | String | Yes | Username for login (must be unique) |
| Password | String | Yes | User's password (will be hashed) |
| TimeZone | String | Yes | User's timezone |
| Language | String | Yes | User's language code (e.g., 'en') |
| CompanyName | String | Conditional | Company name (required if FirstName not provided) |
| FirstName | String | Conditional | First name (required if CompanyName not provided) |
| LastName | String | No | Last name |
| Website | String | No | Website URL |
| OtherEmailAddresses | String | No | Additional email addresses |
| Street | String | No | Street address |
| City | String | No | City |
| State | String | No | State/Province |
| Zip | String | No | ZIP/Postal code |
| Country | String | No | Country |
| Phone | String | No | Phone number |
| PhoneVerified | Boolean | No | Phone verification status |
| Fax | String | No | Fax number |
| PreviewMyEmailAccount | String | No | Preview email account |
| PreviewMyEmailAPIKey | String | No | Preview email API key |
| ForwardToFriendHeader | String | No | Forward to friend header text |
| ForwardToFriendFooter | String | No | Forward to friend footer text |
| AccountStatus | String | No | Account status ('Enabled' or 'Disabled', default: 'Enabled') |
| AvailableCredits | Integer | No | Initial credits (default: 0) |
| ReputationLevel | String | No | Reputation level ('Trusted' or 'Untrusted', default: 'Trusted') |
| SignUpIPAddress | String | No | User signup IP address |
| SSOID | String | No | Single sign-on ID |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.create",
    "SessionID": "your-session-id",
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "Username": "newuser",
    "Password": "securepassword",
    "TimeZone": "America/New_York",
    "Language": "en",
    "FirstName": "John",
    "LastName": "Doe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 123
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
1: Missing RelUserGroupID parameter
2: Missing EmailAddress parameter
3: Missing Username parameter
4: Missing Password parameter
6: Missing CompanyName or FirstName parameter
8: Missing TimeZone parameter
9: Missing Language parameter
10: Invalid email address format
11: Invalid user group ID
12: Username already exists
13: Email address already exists
14: Invalid language code
15: Invalid reputation level (must be 'Trusted' or 'Untrusted')
16: Maximum number of user accounts exceeded
```

:::

## User Login

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.login`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | Conditional | API key for authentication (alternative to username/password) |
| Username | String | Conditional | Username or email address (required if not using APIKey) |
| Password | String | Conditional | User's password (required if not using APIKey) |
| PasswordEncrypted | Boolean | No | Set to true if password is already MD5 hashed |
| TFACode | String | Conditional | Two-factor authentication code (required if 2FA is enabled) |
| TFARecoveryCode | String | No | Two-factor authentication recovery code |
| Disable2FA | Boolean | No | Skip 2FA verification for this login. Honored **only** when `Disable2FAToken` is also supplied and valid (see note below). |
| Disable2FAToken | String | Conditional | Server-derived token that authorizes `Disable2FA`. Required for `Disable2FA` to take effect. |

::: warning Behavior change (v5.9.3, #2333)
`Disable2FA` alone no longer skips two-factor authentication. In earlier versions **any** client could send `Disable2FA=true` and bypass 2FA — a security hole. It is now honored only when accompanied by a matching `Disable2FAToken`:

```
Disable2FAToken = HMAC_SHA256("user.login.disable2fa", SCRTY_SALT)   // lowercase hex
```

`SCRTY_SALT` is a server-side secret from `.oempro_env`, so only a trusted integration that has access to it (for example a custom SSO bridge running on the same host) can compute the token; an ordinary API caller cannot forge it. If `SCRTY_SALT` is empty the token can never validate and `Disable2FA` is ignored. When the token is absent or invalid, the request falls through to normal 2FA handling — supply `TFACode` (or `TFARecoveryCode`). Callers authenticating with `APIKey` are unaffected.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.login",
    "Username": "john.doe",
    "Password": "securepassword"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "abc123def456",
  "UserInfo": {
    "UserID": 123,
    "Username": "john.doe",
    "EmailAddress": "john@example.com",
    "FirstName": "John",
    "LastName": "Doe",
    "AccountStatus": "Enabled"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3],
  "ErrorText": ["Invalid login information"]
}
```

```txt [Error Codes]
0: Success
1: Missing Username parameter
2: Missing Password parameter
3: Invalid login information
6: Invalid 2FA code or recovery code
```

:::

## Get Current User Information

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.current`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.current",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserInfo": {
    "UserID": 123,
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "Username": "john.doe",
    "ReputationLevel": "Trusted",
    "UserSince": "2024-01-15 10:30:00",
    "FirstName": "John",
    "LastName": "Doe",
    "CompanyName": "",
    "Website": "",
    "Street": "",
    "Street2": "",
    "City": "",
    "State": "",
    "Zip": "",
    "Country": "",
    "VAT": "",
    "Phone": "",
    "PhoneVerified": 0,
    "Fax": "",
    "TimeZone": "America/New_York",
    "LastActivityDateTime": "2024-12-28 10:00:00",
    "AccountStatus": "Enabled",
    "AvailableCredits": 1000,
    "2FA_Enabled": "No",
    "2FA_RecoveryKey": "",
    "SSOID": "",
    "GroupInfo": {
      "UserGroupID": 1,
      "GroupName": "Standard Users",
      "GroupPlanName": "Standard Plan",
      "DefaultSenderDomain": "example.com",
      "Permissions": "User.Update,Campaign.Create,Campaign.Update,Campaigns.Get,List.Create",
      "ForceUnsubscriptionLink": "Disabled",
      "ForceRejectOptLink": "Disabled",
      "ForceOptInList": "Disabled",
      "LimitSubscribers": "0",
      "LimitLists": "0",
      "LimitCampaignSendPerPeriod": "0",
      "LimitCampaignSendPeriod": "Monthly",
      "LimitEmailSendPerPeriod": "0",
      "LimitEmailSendPerDay": "0",
      "LimitEmailSendPeriod": "Monthly",
      "LimitEmailSendLifetime": "0",
      "LimitEmailGatewaySenderDomains": "0",
      "SenderDomainManagement": "Enabled",
      "EnableSenderInfo": "Enabled",
      "ForcedSenderInfo": "Disabled",
      "DefaultSenderDomainActivate": "Disabled"
    },
    "MFA_QRCode": "otpauth://totp/...",
    "MFA_SecretKey": "ABCDEF123456",
    "SubscriptionID": false
  },
  "Usage": {
    "EmailGateway_TotalSentThisMonth": 500,
    "EmailGateway_TotalSentAllTime": 5000,
    "Limit_Monthly": 10000,
    "Limit_Lifetime": 100000
  },
  "SendRateLimits": {
    "EmailGateway": {
      "RateLimits": {},
      "SendRates": {}
    },
    "DefaultSenderDomain": {
      "MonthlyLimit": 5000,
      "SendRates": 500,
      "RemainingMonthlyQuota": 4500
    }
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
1: Authentication required
```

:::

### `UserInfo.GroupInfo`

An explicit, user-safe projection of the authenticated user's **user group**. It intentionally exposes only capability flags and plan quotas the user is already subject to.

::: warning Not exposed here — by design
Delivery-server records and their `ConnectionParams`, the group's `SendMethod*` SMTP settings (including `SendMethodSMTPPassword`), all `Payment*` values, and the `ThresholdImport` / `ThresholdEmailSend` abuse-moderation thresholds are **not** returned by `user.current`. They remain reachable only through the admin-authenticated `user.get`.
:::

| Key | Type | Description |
|---|---|---|
| `UserGroupID` | string (numeric) | The group's ID. |
| `GroupName` | string | Administrative name of the group. |
| `GroupPlanName` | string | Human-readable label for the group's subscription plan. Empty string when the group has no plan. |
| `DefaultSenderDomain` | string \| null | The default sender domain applied to this account, or `null` when none is configured. A user-level override takes precedence over the group value. |
| `Permissions` | string | The user's granted permissions. See **Permissions format** below. |
| `ForceUnsubscriptionLink` | `"Enabled"` \| `"Disabled"` | When `Enabled`, campaign content must contain an unsubscribe link; content that does not is rejected at save time. |
| `ForceRejectOptLink` | `"Enabled"` \| `"Disabled"` | When `Enabled`, an opt-out/reject link is required in campaign content. |
| `ForceOptInList` | `"Enabled"` \| `"Disabled"` | When `Enabled`, newly created lists are forced to double opt-in. |
| `LimitSubscribers` | string (numeric) | Maximum subscribers on the account. `0` means unlimited. |
| `LimitLists` | string (numeric) | Maximum subscriber lists. `0` means unlimited. |
| `LimitCampaignSendPerPeriod` | string (numeric) | Maximum campaign sends per reset period. `0` means unlimited. |
| `LimitCampaignSendPeriod` | `"Monthly"` | Reset period for `LimitCampaignSendPerPeriod`. |
| `LimitEmailSendPerPeriod` | string (numeric) | Maximum emails per reset period. `0` means unlimited. Same value as `Usage.Limit_Monthly`. |
| `LimitEmailSendPerDay` | string (numeric) | Maximum emails per day. `0` means unlimited. |
| `LimitEmailSendPeriod` | `"Monthly"` | Reset period for `LimitEmailSendPerPeriod`. |
| `LimitEmailSendLifetime` | string (numeric) | Lifetime email cap. `0` means unlimited. Same value as `Usage.Limit_Lifetime`. |
| `LimitEmailGatewaySenderDomains` | string (numeric) | Maximum Email Gateway sender domains. `0` means unlimited. |
| `SenderDomainManagement` | `"Enabled"` \| `"Disabled"` | Whether the account may manage its own sender domains. Gates the sender-domain UI and sender-domain-scoped sends. |
| `EnableSenderInfo` | `"Enabled"` \| `"Disabled"` | Whether sender-info (physical address block) fields are shown. |
| `ForcedSenderInfo` | `"Enabled"` \| `"Disabled"` | Whether sender-info is mandatory. Only meaningful when `EnableSenderInfo` is `Enabled`. |
| `DefaultSenderDomainActivate` | `"Enabled"` \| `"Disabled"` | Whether the default sender domain is actively applied to this account's sends. |

#### Permissions format

`Permissions` is **not** an array. It is either:

- a **comma-separated string** of permission names, e.g. `"Campaign.Create,Campaign.Update,Campaigns.Get,List.Create"` — no spaces after the commas; or
- the single-character **sentinel `"*"`**, meaning *all permissions are granted*.

A client-side permission check must handle the sentinel explicitly:

```js
function hasPermission(groupInfo, permission) {
  if (groupInfo.Permissions === '*') return true;             // full privileges
  return groupInfo.Permissions.split(',').indexOf(permission) !== -1;
}
```

The `"*"` sentinel is emitted when an administrator is impersonating the user with **Full** privileges. Treating it as a literal permission name rather than a wildcard will incorrectly deny every feature for that session.

#### Defaults for older groups

`SenderDomainManagement`, `EnableSenderInfo`, `ForcedSenderInfo` and `DefaultSenderDomainActivate` come from the group's options blob, and groups created before those options existed do not carry them. The endpoint always returns one of the two defined string values and never `null` — an absent option is reported as `"Disabled"`, which matches how the application itself evaluates it.

#### Duplicated quota values

`LimitEmailSendPerPeriod` and `LimitEmailSendLifetime` also appear in the response as `Usage.Limit_Monthly` and `Usage.Limit_Lifetime`. Both names carry the same value. The `Usage.*` names are retained unchanged for backwards compatibility; `GroupInfo` repeats them so the group's quota set is complete in one place.

::: tip New in v5.9.3
Everything below `DefaultSenderDomain` in the table above was added in v5.9.3. Previously these were readable only through the admin-authenticated `user.get`, which forced frontend integrations to hold an admin API key purely to render a user's own UI. The change is **purely additive** — the four pre-existing `GroupInfo` keys are unchanged in name and value.
:::

## Get User Information

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Conditional | User ID (required if EmailAddress not provided) |
| EmailAddress | String | Conditional | Email address (required if UserID not provided) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.get",
    "SessionID": "your-session-id",
    "UserID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserInformation": {
    "UserID": 123,
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "Username": "john.doe",
    "FirstName": "John",
    "LastName": "Doe",
    "GroupInformation": {}
  },
  "LimitUtilization": {
    "Subscribers": {"Used": 100, "Limit": 1000},
    "Lists": {"Used": 5, "Limit": 10}
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
1: Missing UserID or EmailAddress parameter
3: User not found
```

:::

## Update User

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key or User API Key
- Required permissions: `User.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.update`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Yes | User ID to update |
| EmailAddress | String | No | New email address |
| Username | String | No | New username |
| Password | String | No | New password (will be hashed) |
| FirstName | String | No | First name |
| LastName | String | No | Last name |
| CompanyName | String | No | Company name |
| Website | String | No | Website URL |
| OtherEmailAddresses | String | No | Additional email addresses |
| Street | String | No | Street address |
| Street2 | String | No | Street address line 2 |
| City | String | No | City |
| State | String | No | State/Province |
| Zip | String | No | ZIP/Postal code |
| Country | String | No | Country |
| VAT | String | No | VAT number |
| Phone | String | No | Phone number |
| PhoneVerified | Boolean | No | Phone verification status |
| Fax | String | No | Fax number |
| TimeZone | String | No | Timezone |
| Language | String | No | Language code |
| AccountStatus | String | No | Account status (admin only) |
| AvailableCredits | Integer | No | Available credits (admin only) |
| RelUserGroupID | Integer | No | User group ID (admin only) |
| ReputationLevel | String | No | Reputation level (admin only) |
| RateLimits | String | No | JSON string of rate limits, normalised before storage to `{"EmailGateway":{Minute,Hour,Day,Week,Month,Year},"SMS":{…}}` with integer values (`-1` = unlimited; an omitted interval becomes `-1`). Omit to keep the existing row's value; pass an **empty string** to clear it, which means "no user-level override — inherit the user group's default rate limits" (an empty value is stored as-is, never normalised into an all-unlimited document). |
| CustomEmailHeaders | String | No | Custom email headers. Omit to keep the existing row's value; pass an empty string to clear it. |
| WhiteListedEmailAddresses | String | No | Whitelisted email addresses. Omit to keep the existing row's value; pass an empty string to clear it. |
| Enable2FA | String | No | Set to 'true' to enable 2FA |
| 2FACode | String | Conditional | 2FA code (required when enabling 2FA) |
| Cancel2FA | String | No | Set to 'true' to disable 2FA |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.update",
    "SessionID": "your-session-id",
    "UserID": 123,
    "FirstName": "Jane",
    "LastName": "Smith"
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
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing UserID parameter
2: User can only update their own account
3: PreviewMyEmail connection error
4: Invalid 2FA code
5: User not found
6: Email address or username already exists
```

:::

## Get Monthly User Snapshot

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key or User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.snapshot`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Conditional | User ID (required if not logged in and EmailAddress not provided) |
| EmailAddress | String | Conditional | Email address (alternative to UserID) |
| Month | String | Yes | Month in YYYY-MM format (e.g., '2024-12') |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.snapshot",
    "SessionID": "your-session-id",
    "Month": "2024-12"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignsSent": 15,
  "EmailsSent": 5000,
  "Subscribers": 1500,
  "Lists": 8
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
1: Missing EmailAddress parameter
2: Missing UserID parameter
3: Missing Month parameter
4: Invalid month format
5: User not found
```

:::

## Get User Statistics

<Badge type="info" text="POST" /> `/api/v1/user.stats`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.stats`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| StartDate | String | Yes | Start date in YYYY-MM-DD format |
| EndDate | String | Yes | End date in YYYY-MM-DD format |
| Aggregation | String | Yes | Aggregation type: 'daily', 'weekly', or 'monthly' |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.stats \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.stats",
    "SessionID": "your-session-id",
    "StartDate": "2024-01-01",
    "EndDate": "2024-12-31",
    "Aggregation": "monthly"
  }'
```

```json [Success Response]
{
  "NumberOfLists": 12,
  "TotalActiveLists": 9,
  "TotalActiveSubscribers": 15234,
  "TotalSegments": 28,
  "AvgOpenRate30dWeighted": 0.2418,
  "AvgClickRate30dWeighted": 0.0327,
  "AvgCTOR30dWeighted": 0.1352,
  "AvgForwardRate30dWeighted": 0.0014,
  "AvgBrowserViewRate30dWeighted": 0.0119,
  "New Subscribers": {
    "2024-01-01": 12,
    "2024-01-02": 18
  },
  "Sent Emails": {
    "2024-01-01": 250,
    "2024-01-02": 300
  },
  "Opens": {
    "2024-01-01": 80,
    "2024-01-02": 95
  }
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 1, "Message": "Missing StartDate parameter"}
  ]
}
```

```txt [Error Codes]
1: Missing StartDate parameter
2: Missing EndDate parameter
3: Missing Aggregation parameter
4: Invalid Aggregation value (must be 'daily', 'weekly', or 'monthly')
6: Statistics retrieval error
```

:::

**Top-level overall fields**

The response is the merge of two payloads: a stat-strip header (the overall fields below) plus the time-series breakdown for each metric (keyed by metric title — `New Subscribers`, `Sent Emails`, `Opens`, etc).

| Field | Type | Description |
|-------|------|-------------|
| `NumberOfLists` | Integer | Total lists owned by the user, **including archived**. Back-compat with pre-v5.9.x consumers. |
| `TotalActiveLists` | Integer | Lists with `ArchivedAt IS NULL`. |
| `TotalActiveSubscribers` | Integer | Sum of `ActiveSubscriberCount` (denormalized) across non-archived lists. Defines "active" as `Subscribed` AND `BounceType != 'Hard'`, matching the count `lists.get` displays. |
| `TotalSegments` | Integer | Sum of `SegmentCount` (denormalized) across non-archived lists. |
| `AvgOpenRate30dWeighted` | Float \| null | Subscriber-weighted average 30-day open rate across non-archived lists, computed as `Σ(ActiveSubscriberCount × UniqueOpens) / Σ(ActiveSubscriberCount × TotalSent)`. `null` when no list in the user's active set had any sends in the 30-day window. |
| `AvgClickRate30dWeighted` | Float \| null | Subscriber-weighted average 30-day click rate. Same shape and weighting basis as `AvgOpenRate30dWeighted` but with `UniqueClicks` in the numerator. `null` when no sends. (Added in v5.9.1, issue #1960.) |
| `AvgCTOR30dWeighted` | Float \| null | Subscriber-weighted average 30-day Click-To-Open Rate, computed as `Σ(ActiveSubscriberCount × UniqueClicks) / Σ(ActiveSubscriberCount × UniqueOpens)`. **Different denominator basis** from the other rates: lists with zero opens are skipped (not zero-weighted) so they don't drag the average to zero. `null` when no opens. (Added in v5.9.1, issue #1960.) |
| `AvgForwardRate30dWeighted` | Float \| null | Subscriber-weighted average 30-day forward rate. Same shape as `AvgOpenRate30dWeighted` with `UniqueForwards` in the numerator. (Added in v5.9.1, issue #1960.) |
| `AvgBrowserViewRate30dWeighted` | Float \| null | Subscriber-weighted average 30-day "view in browser" rate. Same shape as `AvgOpenRate30dWeighted` with `UniqueBrowserViews` in the numerator. (Added in v5.9.1, issue #1960.) |

**Migration note (v5.9.x):** `TotalActiveSubscribers` previously summed across **all** lists (including archived) using a slightly stricter criterion (`BounceType = 'Not Bounced'`, excluding soft bounces). Both changes were intentional: the new value (a) excludes archived lists — matching the lists.get browse display — and (b) uses `BounceType != 'Hard'` to align with `Subscribers::GetActiveTotal`. For a user with no archived lists and a clean deliverability footprint the difference is negligible. For users with many archived lists or noticeable soft-bounce volume the value will shift; treat the new figure as the canonical "subscribers I currently market to."

## Switch to User Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.switch`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Yes | User ID to switch to |
| PrivilegeType | String | No | Privilege type: 'Default' or 'Full' (default: 'Default') |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.switch",
    "SessionID": "your-admin-session-id",
    "UserID": 123,
    "PrivilegeType": "Full"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "new-session-id",
  "UserInfo": {
    "UserID": 123,
    "Username": "john.doe"
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
1: Missing UserID parameter
2: User not found
3: Invalid privilege type (must be 'Default' or 'Full')
```

:::

## Send Password Reminder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.passwordremind`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddress | String | Yes | User's email address |
| CustomResetLink | String | No | Base64 encoded custom reset link template |
| ReturnParams | Boolean | No | Set to true to return reset token and link |
| AdminAPIKey | String | No | Admin API key for custom email settings |
| ResetEmailSubject | String | No | Custom email subject (requires AdminAPIKey) |
| ResetEmailContent | String | No | Custom email content (requires AdminAPIKey) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.passwordremind",
    "SessionID": "your-session-id",
    "EmailAddress": "user@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "PasswordResetToken": "",
  "PasswordResetLink": ""
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
1: Missing EmailAddress parameter
2: Invalid email address format
3: Email address not found (Note: For security, this returns success even if not found)
```

:::

## Reset User Password

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.passwordreset`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | String | Yes | Password reset token (from passwordremind) |
| AdminAPIKey | String | No | Admin API key for custom password |
| NewPassword | String | No | Custom new password (requires AdminAPIKey) |
| DontSendNewPasswordEmail | String | No | Set to 'true' to skip email (requires AdminAPIKey) |
| ShowPassword | Boolean | No | Set to true to include password in email |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.passwordreset",
    "UserID": "reset-token-here"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "WoocommerceUserId": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
0: Success
1: Missing UserID parameter
2: Invalid reset token or user not found
```

:::

## Create API Key

<Badge type="info" text="POST" /> `/api/v1/user.apikey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Note | String | Yes | Administrative note for the API key |
| BoundIPAddress | String | No | IP address to bind the key to |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.apikey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.create",
    "SessionID": "your-session-id",
    "Note": "Production API key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "APIKeyID": "5",
  "APIKey": {
    "APIKey": "1234-5678-9abc-def0",
    "Note": "Production API key",
    "IPAddress": "",
    "BoundIPAddress": "",
    "CreatedAt": "2026-05-22 20:45:48",
    "LastUsedAt": null,
    "LastUsedIP": null,
    "RequestCount": 0
  }
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 1, "Message": "Missing administrative note parameter"}
  ]
}
```

```txt [Error Codes]
1: Missing administrative note parameter
3: API key create process failed
4: New API key create process has failed
```

**Response Fields (APIKey object):**

| Field          | Type             | Description |
|----------------|------------------|-------------|
| APIKey         | String           | The generated API key token. |
| Note           | String           | Administrative note supplied at creation. |
| IPAddress      | String           | **Deprecated** — kept for backward compatibility. Same value as `BoundIPAddress`. Prefer `BoundIPAddress` in new integrations. |
| BoundIPAddress | String           | IP address the key is bound to, or `""` if unbound. |
| CreatedAt      | String (DATETIME)| Creation timestamp (UTC, `YYYY-MM-DD HH:MM:SS`). |
| LastUsedAt     | String \| null   | Last time this key was used to authenticate (always `null` for a freshly created key). |
| LastUsedIP     | String \| null   | Client IP recorded at last use, `null` if never used. |
| RequestCount   | Integer          | Lifetime number of authentications with this key (always `0` for a freshly created key). |

::: info Counter semantics
`RequestCount` and `LastUsedAt` are bumped each time the key is used to start a session via `User.Login` (with the `APIKey` parameter). They do **not** count every individual REST request made within a session — once a client has a `SessionID`, subsequent calls authenticate with session credentials and do not re-touch the API key. Treat `RequestCount` as "how many times has this integration checked in?", which is what an operator cares about when answering "is this key still in use anywhere?".
:::

:::

## Delete API Key

<Badge type="info" text="POST" /> `/api/v1/user.apikey.delete`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| APIKeyID | Integer | Yes | API key ID to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.apikey.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.delete",
    "SessionID": "your-session-id",
    "APIKeyID": 5
  }'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 1, "Message": "Missing APIKeyID parameter"}
  ]
}
```

```txt [Error Codes]
1: Missing APIKeyID parameter
2: API key not found
```

:::

## List API Keys

<Badge type="info" text="GET" /> `/api/v1/user.apikeys`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.list`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/user.apikeys \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.list",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "APIKeys": [
    {
      "APIKeyID": 17,
      "APIKey": "7c7c-0a2b-66e2-3738-d373-5362-7ab9-9a68",
      "Note": "Shopify sync",
      "BoundIPAddress": "",
      "CreatedAt": "2026-02-04 09:12:33",
      "LastUsedAt": "2026-04-25 14:07:11",
      "LastUsedIP": "52.14.72.10",
      "RequestCount": 12840
    }
  ]
}
```

```json [Error Response]
{
  "Errors": []
}
```

```txt [Error Codes]
No specific error codes for this endpoint
```

**Response Fields (each entry in `APIKeys[]`):**

| Field          | Type             | Description |
|----------------|------------------|-------------|
| APIKeyID       | Integer          | Internal numeric ID of the key. |
| APIKey         | String           | The API key token. |
| Note           | String           | Administrative note supplied at creation. |
| BoundIPAddress | String           | IP address the key is bound to, or `""` if unbound. |
| CreatedAt      | String (DATETIME)| Creation timestamp. Keys that pre-date the usage-tracking migration return the sentinel `"1970-01-01 00:00:00"` — clients should render this as "Unknown". |
| LastUsedAt     | String \| null   | Last time this key was used to authenticate, or `null` if the key has never been used. |
| LastUsedIP     | String \| null   | Client IP recorded at last use (IPv4 or IPv6), `null` if never used. |
| RequestCount   | Integer          | Lifetime number of authentications with this key. See counter semantics on the Create endpoint above. |

:::

## Get Users List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| RecordsPerRequest | Integer | No | Number of records per page (default: 25) |
| RecordsFrom | Integer | No | Starting record offset (default: 0) |
| OrderField | String | No | Field to order by (default: `UserID`). Must be a plain column identifier — letters, digits and underscores only, starting with a letter or underscore. Pipe-separate for multi-column sort (e.g. `AccountStatus\|UserID`). See the sorting note below. |
| OrderType | String | No | Order direction: 'ASC' or 'DESC' (default: `ASC`). Pipe-separate to match a multi-column `OrderField`. See the sorting note below. |
| RelUserGroupID | Mixed | No | User group ID, array of IDs, or special value ('Online', 'Enabled', 'Disabled', 'Trusted', 'Untrusted') |
| RelUserCategoryID | Integer | No | User category ID (-1 for uncategorized) |
| SearchField | String | No | Field to search in |
| SearchKeyword | String | No | Search keyword |
| ReturnStats | Boolean | No | Set to true to include statistics |
| IncludeLimitUtilization | Boolean | No | Set to true to include limit utilization data |

::: warning Sorting parameters are format-filtered (v5.9.3)
`OrderField` and `OrderType` are validated for **shape**, not against a list of sortable columns. Each pipe-separated segment of `OrderField` must be a plain identifier, and each segment of `OrderType` must be `ASC` or `DESC`.

- A value containing anything else (backticks, quotes, spaces, parentheses or any other metacharacter) is **silently discarded**. When that happens the pair is reset together — ordering falls back to `UserID ASC` even if only one of the two parameters was malformed. The response is still HTTP `200` with `Success: true` and no error code.
- Because there is no column allow-list, a value that *is* identifier-shaped but names a column that does not exist (for example `OrderField: "Bogus"`) is passed through to the query and surfaces as a **database error** — it does not fall back to the default.

Neither case returns a validation error. If results come back in an unexpected order after upgrading, your sort parameter is being rejected silently — check it against the shape rules above.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.get",
    "SessionID": "your-session-id",
    "RecordsPerRequest": 25,
    "RecordsFrom": 0,
    "OrderField": "UserID",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Users": [
    {
      "UserID": 123,
      "Username": "john.doe",
      "EmailAddress": "john@example.com",
      "GroupInformation": {}
    }
  ],
  "TotalUsers": 150
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete Users

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Note: Not available in demo mode
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Users | String | Yes | Comma-separated list of user IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.delete",
    "SessionID": "your-session-id",
    "Users": "123,124,125"
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
1: Missing Users parameter
```

:::

## Get Users Status

<Badge type="info" text="GET" /> `/api/v1/users.status`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.status`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Duration | Integer | No | Number of days to look back (1-90, default: 30) |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/users.status \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.status",
    "SessionID": "your-session-id",
    "Duration": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "Users": [
    {
      "UserID": 123,
      "Status": "active",
      "LastActivity": "2024-12-28 10:00:00"
    }
  ],
  "Summary": {
    "ActiveUsers": 50,
    "IdleUsers": 10
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Failed to retrieve users status"
}
```

```txt [Error Codes]
0: Success
1: Failed to retrieve users status
```

:::

## Create User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| GroupName | String | Yes | Name of the user group |
| SubscriberAreaLogoutURL | String | Yes | Subscriber area logout URL |
| LimitSubscribers | Integer | Yes | Maximum number of subscribers |
| LimitLists | Integer | Yes | Maximum number of lists |
| LimitCampaignSendPerPeriod | Integer | Yes | Campaign send limit per period |
| LimitEmailSendPerPeriod | Integer | Yes | Email send limit per period |
| LimitEmailSendPerDay | Integer | Yes | Email send limit per day |
| RelThemeID | Integer | Yes | Theme ID |
| ForceUnsubscriptionLink | String | Yes | 'Enabled' or 'Disabled' |
| ForceRejectOptLink | String | Yes | 'Enabled' or 'Disabled' |
| DefaultRateLimits | String | No | JSON-encoded rate limits with `SMS` and `EmailGateway` buckets, each containing `Minute`/`Hour`/`Day`/`Week`/`Month`/`Year` integer counts (`-1` = unlimited). Posted values are deep-merged over the canonical defaults, so a partial payload (only one bucket, or only some intervals) preserves the missing keys at `-1`. Omit to store the full all-`-1` defaults. |
| CustomEmailHeaders | String | No | JSON-encoded SMTP header overrides for users in this group (e.g. `{"Add":{"X-Header":"value"},"Remove":["X-Other"]}`). |
| Options | Object | No | JSON object of per-group options (e.g. `TargetDeliveryServerID_Marketing`, `EmailGatewayDNSTemplate`, `DefaultSenderDomain`, `EnableSenderInfo`). Pass as an object — the endpoint JSON-encodes it. |
| SubscriptionPlan | String | No | Subscription plan identifier for the group. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.create",
    "SessionID": "your-session-id",
    "GroupName": "Premium Users",
    "SubscriberAreaLogoutURL": "https://example.com/logout",
    "LimitSubscribers": 10000,
    "LimitLists": 50,
    "LimitCampaignSendPerPeriod": 100,
    "LimitEmailSendPerPeriod": 50000,
    "LimitEmailSendPerDay": 5000,
    "RelThemeID": 1,
    "ForceUnsubscriptionLink": "Enabled",
    "ForceRejectOptLink": "Enabled"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroupID": 5
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
1: Missing GroupName parameter
2: Missing SubscriberAreaLogoutURL parameter
5: Missing LimitSubscribers parameter
6: Missing LimitLists parameter
7: Missing LimitCampaignSendPerPeriod parameter
8: Missing RelThemeID parameter
17: Missing ForceUnsubscriptionLink parameter
18: Missing ForceRejectOptLink parameter
19: Invalid theme ID
20: Missing LimitEmailSendPerPeriod parameter
22: Invalid send method
23: Invalid SMTP secure setting
24: Invalid SMTP auth setting
25: Email settings test failed
```

:::

## Update User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.update`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to update |
| GroupName | String | Yes | Name of the user group |
| SubscriberAreaLogoutURL | String | Yes | Subscriber area logout URL |
| LimitSubscribers | Integer | Yes | Maximum number of subscribers |
| LimitLists | Integer | Yes | Maximum number of lists |
| LimitCampaignSendPerPeriod | Integer | Yes | Campaign send limit per period |
| LimitEmailSendPerPeriod | Integer | Yes | Email send limit per period |
| LimitEmailSendPerDay | Integer | Yes | Email send limit per day |
| RelThemeID | Integer | Yes | Theme ID |
| ForceUnsubscriptionLink | String | Yes | 'Enabled' or 'Disabled' |
| ForceRejectOptLink | String | Yes | 'Enabled' or 'Disabled' |
| DefaultRateLimits | String | No | JSON-encoded rate limits with `SMS` and `EmailGateway` buckets, each containing `Minute`/`Hour`/`Day`/`Week`/`Month`/`Year` integer counts (`-1` = unlimited). Posted values are deep-merged over the canonical defaults, so a partial payload (only one bucket, or only some intervals) preserves the missing keys at `-1`. Omit the field entirely to keep the existing row's value. |
| CustomEmailHeaders | String | No | JSON-encoded SMTP header overrides for users in this group (e.g. `{"Add":{"X-Header":"value"},"Remove":["X-Other"]}`). Omit to keep the existing row's value. |
| Options | Object | No | JSON object of per-group options (e.g. `TargetDeliveryServerID_Marketing`, `EmailGatewayDNSTemplate`, `DefaultSenderDomain`, `EnableSenderInfo`). Pass as an object — the endpoint JSON-encodes it. Omit to keep the existing row's value. |
| SubscriptionPlan | String | No | Subscription plan identifier for the group. Omit to keep the existing row's value. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.update",
    "SessionID": "your-session-id",
    "UserGroupID": 5,
    "GroupName": "Premium Plus Users",
    "SubscriberAreaLogoutURL": "https://example.com/logout",
    "LimitSubscribers": 20000,
    "LimitLists": 100,
    "LimitCampaignSendPerPeriod": 200,
    "LimitEmailSendPerPeriod": 100000,
    "LimitEmailSendPerDay": 10000,
    "RelThemeID": 1,
    "ForceUnsubscriptionLink": "Enabled",
    "ForceRejectOptLink": "Enabled",
    "DefaultRateLimits": "{\"SMS\":{\"Minute\":-1,\"Hour\":-1,\"Day\":-1,\"Week\":-1,\"Month\":-1,\"Year\":-1},\"EmailGateway\":{\"Minute\":100,\"Hour\":5000,\"Day\":-1,\"Week\":-1,\"Month\":-1,\"Year\":-1}}"
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
  "ErrorCode": [20]
}
```

```txt [Error Codes]
0: Success
1: Missing GroupName parameter
2: Missing SubscriberAreaLogoutURL parameter
5: Missing LimitSubscribers parameter
6: Missing LimitLists parameter
7: Missing LimitCampaignSendPerPeriod parameter
8: Missing RelThemeID parameter
17: Missing ForceUnsubscriptionLink parameter
18: Missing ForceRejectOptLink parameter
19: Invalid theme ID
20: Missing UserGroupID parameter
21: User group not found
22: Invalid send method
23: Invalid SMTP secure setting
24: Invalid SMTP auth setting
25: Email settings test failed
```

:::

## Patch a User Group

<Badge type="info" text="POST" /> `/api.php`

<Badge type="tip" text="New in v5.9.3" />

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Partial update.** Only the fields present in the request body are written. Every other column of the user group is left untouched — it is not included in the `UPDATE` statement at all.
:::

### Why this exists alongside `usergroup.update`

`usergroup.update` rebuilds the entire user group row from the request body. Around 30 optional columns are written unconditionally, so any field the caller omits is persisted as an empty string, and `PaymentSystem` / `CreditSystem` are written as `Disabled` whenever their key is absent — silently switching those systems off for every user in the group.

The only safe way to change a single value through `usergroup.update` is to read the whole group back with `usergroup.get` and echo every field, which forces the client to hold and re-transmit `SendMethodSMTPPassword`.

`usergroup.patch` removes that requirement: send `UserGroupID` plus only what you want to change. `usergroup.update` is unchanged and remains fully supported.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.patch`        |
| SessionID | String | No       | Session ID obtained from admin login  |
| APIKey    | String | No       | Admin API key for authentication      |
| UserGroupID | Integer | Yes | The user group to patch. This is the only required field — a request carrying just `UserGroupID` is a valid no-op |
| GroupName | String | No | Name of the user group |
| RelThemeID | Integer | No | Theme ID. Must reference an existing theme |
| SubscriberAreaLogoutURL | String | No | Subscriber area logout URL |
| ForceUnsubscriptionLink | String | No | `Enabled` or `Disabled` |
| ForceRejectOptLink | String | No | `Enabled` or `Disabled` |
| ForceOptInList | String | No | `Enabled` or `Disabled` |
| Permissions | Array \| String | No | Array of permission keys (stored comma-separated), or a pre-joined comma-separated string |
| PaymentSystem | String | No | `Enabled` or `Disabled` |
| CreditSystem | String | No | `Enabled` or `Disabled` |
| PaymentPricingRange | String | No | Pricing range payload |
| PaymentCampaignsPerRecipient | String | No | `Enabled` or `Disabled` |
| PaymentCampaignsPerCampaignCost | Number | No | Per-campaign cost |
| PaymentAutoRespondersChargeAmount | Number | No | Auto-responder charge amount |
| PaymentAutoRespondersPerRecipient | String | No | `Enabled` or `Disabled` |
| PaymentDesignPrevChargeAmount | Number | No | Design-preview charge amount |
| PaymentDesignPrevChargePerReq | Number | No | Design-preview charge per request |
| PaymentSystemChargeAmount | Number | No | System charge amount |
| LimitSubscribers | Integer | No | Maximum number of subscribers |
| LimitLists | Integer | No | Maximum number of lists |
| LimitCampaignSendPerPeriod | Integer | No | Campaign send limit per period |
| LimitEmailSendPerPeriod | Integer | No | Email send limit per period |
| LimitEmailSendPerDay | Integer | No | Email send limit per day |
| LimitEmailSendLifetime | Integer | No | Lifetime email limit |
| LimitEmailGatewaySenderDomains | Integer | No | Email Gateway sender domain limit |
| ThresholdImport | Integer | No | Import approval threshold |
| ThresholdEmailSend | Integer | No | Email-send approval threshold |
| PlainEmailHeader | String | No | Plain-text email header |
| PlainEmailFooter | String | No | Plain-text email footer |
| HTMLEmailHeader | String | No | HTML email header |
| HTMLEmailFooter | String | No | HTML email footer |
| TrialGroup | String | No | `Yes` or `No`. `Enabled` / `Disabled` are accepted as aliases and normalised to `Yes` / `No` |
| TrialExpireSeconds | Integer | No | Trial duration in seconds |
| XMailer | String | No | `X-Mailer` header value |
| SendMethod | String | No | `System`, `SMTP`, `LocalMTA`, `PHPMail`, `PowerMTA` or `SaveToDisk` |
| SendMethodSaveToDiskDir | String | No | Save-to-disk directory |
| SendMethodPowerMTAVMTA | String | No | PowerMTA VirtualMTA |
| SendMethodPowerMTADir | String | No | PowerMTA pickup directory |
| SendMethodLocalMTAPath | String | No | Local MTA binary path |
| SendMethodSMTPHost | String | No | SMTP host |
| SendMethodSMTPPort | Integer | No | SMTP port |
| SendMethodSMTPSecure | String | No | `ssl`, `tls`, or an empty string for none |
| SendMethodSMTPTimeOut | Integer | No | SMTP timeout in seconds |
| SendMethodSMTPAuth | String | No | `true` or `false` |
| SendMethodSMTPUsername | String | No | SMTP username |
| SendMethodSMTPPassword | String | No | SMTP password. **Omit it and the stored password is left completely untouched** |
| Options | Object \| String | No | Group options as an object, or a JSON string that decodes to an object |
| DefaultRateLimits | Object \| String | No | Rate-limit buckets. Merged over the canonical defaults, so a partial payload cannot drop a bucket |
| CustomEmailHeaders | String | No | Custom email headers |
| SubscriptionPlan | String | No | Subscription plan identifier for the group |

Parameter names are matched case-insensitively, as everywhere on `/api.php`.

**Not patchable:** `LimitCampaignSendPeriod`, `LimitEmailSendPeriod`, `PaymentAutoRespondersChargePeriod`, `PaymentDesignPrevChargePeriod` and `PaymentSystemChargePeriod` are fixed to `Monthly` by the product. `PaymentCreditSystem`, `PaymentCreditPricing`, `SendMethodSMTPDebug`, `SendMethodSMTPKeepAlive` and `SendMethodSMTPMsgConn` are not settable through any user group API command. `SubscriptionPlanIsDefault` is deliberately excluded — `usergroup.update` cannot set it either, and the "one default per subscription plan" rule is enforced by the admin interface.

::: tip Clearing a value
An empty string is a supplied value: sending `"XMailer": ""` clears the field. A field sent as `null` is treated as absent and is never written, because these columns are `NOT NULL`. Integer fields reject an empty string rather than storing it — see error code 32.
:::

::: warning Send-method settings are not connectivity-tested
`usergroup.update` sends a live test email whenever `SendMethod` is not `System`. `usergroup.patch` validates the **format** of every send-method field it is given — so no value MySQL would silently coerce to an empty string or a zero can be stored — but does not perform that live test, because a partial payload does not describe a complete send configuration. Use `usergroup.update`, the admin interface, or `settings.emailsendingtest` when you want the connection verified.
:::

**Response Fields:**

`UpdatedFields` lists the database columns actually written, so a caller can assert the write set rather than infer it. It is an empty array for a no-op patch, and in that case no `UPDATE` statement is issued at all.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.patch",
    "AdminAPIKey": "your-admin-api-key",
    "UserGroupID": 3,
    "LimitEmailSendPerPeriod": 250000,
    "LimitSubscribers": 50000
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroupID": "3",
  "UpdatedFields": ["LimitSubscribers", "LimitEmailSendPerPeriod"]
}
```

```json [Success Response — no-op]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroupID": "3",
  "UpdatedFields": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 26,
  "ErrorField": "creditsystem"
}
```

```txt [Error Codes]
0:  Success
19: Invalid theme ID (RelThemeID)
20: Missing UserGroupID parameter (returned as an array, [20])
21: User group not found
22: Invalid send method
23: Invalid SendMethodSMTPSecure — must be 'ssl', 'tls' or ''
24: Invalid SendMethodSMTPAuth — must be 'true' or 'false'
26: Invalid Enabled/Disabled value; the offending field is returned in ErrorField
27: Invalid TrialGroup value — must be 'Yes' or 'No' (or the 'Enabled'/'Disabled' aliases)
28: Invalid Options payload — must be an object, or a JSON string decoding to one
29: Invalid DefaultRateLimits payload — must be an object, or a JSON string decoding to one
30: Invalid Permissions payload — must be a comma-separated string, or an array whose
    every element is a string
31: Non-scalar value supplied for a scalar field; the offending field is returned in
    ErrorField
32: Invalid integer value; the offending field is returned in ErrorField. The value must
    be a base-10 integer within the signed 32-bit column range (-2147483648..2147483647).
    Floats ('1.5'), scientific notation ('1e3') and hexadecimal ('0x1A') are rejected
    rather than silently coerced by MySQL — '0x1A' would otherwise store 0, which on a
    Limit* column means unlimited. Negative values are accepted: -1 is an established
    "unlimited" sentinel.
```

:::

::: warning Enabled/Disabled values are validated, not coerced
`usergroup.update` turns any value that is not exactly `Enabled` into `Disabled`, including a missing key. `usergroup.patch` rejects an unrecognised value with `ErrorCode: 26` and writes nothing for an absent key, so a system can be turned both on and off explicitly and can never be disabled by accident.
:::

## Get User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to retrieve |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.get",
    "SessionID": "your-session-id",
    "UserGroupID": 5
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroup": {
    "UserGroupID": 5,
    "GroupName": "Premium Users",
    "LimitSubscribers": 10000,
    "LimitLists": 50
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
1: Missing UserGroupID parameter
2: User group not found
```

:::

## Delete User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Note: Not available in demo mode
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | String | Yes | Comma-separated list of user group IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.delete",
    "SessionID": "your-session-id",
    "UserGroupID": "5,6,7"
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
1: Missing UserGroupID parameter
4: Cannot delete the last user group
```

:::

## Duplicate User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.duplicate`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to duplicate |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.duplicate",
    "SessionID": "your-session-id",
    "UserGroupID": 5
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroupID": 8
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
0: Success
1: Missing UserGroupID parameter
2: User group not found
```

:::

## Get All User Groups

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroups.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroups.get",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroups": [
    {
      "UserGroupID": 1,
      "GroupName": "Standard Users",
      "LimitSubscribers": 1000,
      "DeliveryServerAssignments": {
        "Marketing": {
          "DeliveryServerID": 5,
          "DeliveryServerName": "Primary SMTP Server"
        },
        "Transactional": {
          "DeliveryServerID": 5,
          "DeliveryServerName": "Primary SMTP Server"
        },
        "AutoResponder": {
          "DeliveryServerID": 0,
          "DeliveryServerName": ""
        }
      }
    },
    {
      "UserGroupID": 2,
      "GroupName": "Premium Users",
      "LimitSubscribers": 10000,
      "DeliveryServerAssignments": {
        "Marketing": {
          "DeliveryServerID": 8,
          "DeliveryServerName": "High Volume SMTP"
        },
        "Transactional": {
          "DeliveryServerID": 8,
          "DeliveryServerName": "High Volume SMTP"
        },
        "AutoResponder": {
          "DeliveryServerID": 8,
          "DeliveryServerName": "High Volume SMTP"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::

**Response Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| UserGroups | Array | List of all user groups |
| UserGroupID | Integer | Unique identifier for the user group |
| GroupName | String | Display name of the user group |
| DeliveryServerAssignments | Object | Delivery server assignments per channel type. Contains three keys: `Marketing`, `Transactional`, and `AutoResponder`. Each contains `DeliveryServerID` (0 if not assigned) and `DeliveryServerName` (empty string if not assigned) |

## Add Credits (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Order Payment (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Get Payment Periods (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Update Payment Periods (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Change Subscription Payment (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Upgrade Subscription (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::


## Get Per-User Usage and Feature Adoption

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns a single account's current usage figures and which features it actually uses, in one strictly **read-only** call — safe to poll on a billing-page render or to gate a plan downgrade. Unlike `user.get`, it performs **no writes**: it never materialises a `oempro_users_payment_log` period and never triggers the active-subscriber-count write-through.

The response reports the two limit-reset periods **separately** because they run on different clocks: `LimitEmailSendPerPeriod` resets on the calendar month, `LimitCampaignSendPerPeriod` on the payment-log window. Each usage figure carries its own freshness ceiling (`MaxStalenessSeconds`). The active-subscriber count **excludes archived lists** (`Definition: "SubscribedNotHardBounced,ArchivedExcluded"`).

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                  |
|-----------|---------|----------|----------------------------------------------|
| Command   | String  | Yes      | API command: `user.usage.get`                |
| AdminApiKey | String | Yes    | Admin API key for authentication             |
| UserID    | Integer | Yes      | Target user account ID                       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.usage.get",
    "AdminApiKey": "your-admin-api-key",
    "UserID": 42
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "Periods": {
    "EmailSend":    { "Type": "CalendarMonth", "Start": "2026-07-01 00:00:00", "End": "2026-07-31 23:59:59" },
    "CampaignSend": { "Type": "PaymentLog", "Start": "2026-07-08", "End": "2026-08-08", "Derived": true }
  },
  "Usage": {
    "ActiveSubscribers":     { "Value": 33, "Source": "oempro_subscriber_lists.ActiveSubscriberCount", "AsOf": null, "MaxStalenessSeconds": 300, "Definition": "SubscribedNotHardBounced,ArchivedExcluded" },
    "EmailsSentInPeriod":    { "Value": 0, "Source": "CampaignsEgTransactionalSum", "MaxStalenessSeconds": 120, "Period": "EmailSend" },
    "CampaignsSentInPeriod": { "Value": 0, "Source": "oempro_users_payment_log.CampaignsSent", "MaxStalenessSeconds": 0, "Period": "CampaignSend", "Derived": true }
  },
  "Features": {
    "Campaigns":           { "InUse": true, "Count": 23 },
    "Journeys":            { "InUse": true, "Count": 23, "ActiveCount": 0 },
    "SendingDomains":      { "InUse": true, "Count": 2 },
    "EmailGatewayAPIKeys": { "InUse": true, "Count": 1 },
    "UserAPIKeys":         { "InUse": true, "Count": 1 },
    "AutoResponders":      { "InUse": true, "Count": 4 },
    "Lists":               { "InUse": true, "Count": 7 },
    "Segments":            { "InUse": true, "Count": 4 }
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
1: Missing UserID parameter
2: Invalid UserID (must be a positive integer)
3: User not found
4: A feature-usage count query failed (usage temporarily unavailable — do not treat missing counts as zero)
```

:::

**Notes:**
- `Periods.CampaignSend.Derived` is `true` when no payment-log row covers today yet; the window was computed read-only and the backend has **not** materialised it (treat as not-yet-authoritative). `CampaignsSentInPeriod.Value` is `0` in that case.
- `ActiveSubscribers.AsOf` is `null` because the denormalized count has no last-calculated timestamp; only the `MaxStalenessSeconds` ceiling is known.
- Feature counts exclude soft-deleted rows: `SendingDomains` and `EmailGatewayAPIKeys` exclude `Status = 'Deleted'`. `Journeys.ActiveCount` counts `Status = 'Enabled'`.
- `EmailsSentInPeriod` equals the value `LimitEmailSendPerPeriod` enforcement uses for the same calendar-month window.

## Get Bulk User Usage Metering

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns date-ranged usage for **many users** in a single call — a per-day "emails sent" series plus the current active-subscriber count per account — for a daily billing/metering job. The emails-sent figure uses the same enforcement-backed source as `user.usage.get` (campaign + Email Gateway + auto-responder sends), so display and metering agree. It is bulk (a fixed number of grouped queries regardless of user count) and issues no Redis `KEYS` scan.

Absent periods are **omitted** (never padded with synthesized zeros) so a consumer can distinguish "no activity recorded" from "genuinely zero." The active-subscriber count **excludes archived lists**.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| Command     | String | Yes      | API command: `users.usage.get`                                              |
| AdminApiKey | String | Yes      | Admin API key for authentication                                            |
| StartDate   | String | Yes      | Range start. Accepts the same formats as `user.stats` (e.g. `YYYY-MM-DD`)   |
| EndDate     | String | Yes      | Range end. Same formats as `StartDate`                                      |
| UserIDs     | String | No       | CSV or array of user IDs to scope to. Omit for **all** users                |
| Aggregation | String | No       | Period bucketing. Possible values: `daily` (default), `weekly`, `monthly`, `yearly` |
| Metrics     | String | No       | CSV of metrics. Only `sent_emails` is supported (default)                   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.usage.get",
    "AdminApiKey": "your-admin-api-key",
    "UserIDs": "1,2,3",
    "StartDate": "2026-06-01",
    "EndDate": "2026-06-30",
    "Aggregation": "daily"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Aggregation": "daily",
  "StartDate": "2026-06-01 00:00:00",
  "EndDate": "2026-06-30 23:59:59",
  "Metrics": ["sent_emails"],
  "UserCount": 3,
  "Users": {
    "1": {
      "UserID": 1,
      "Metrics": { "sent_emails": { "2026-06-14": 5 } },
      "TotalSentEmails": 5,
      "TotalActiveSubscribers": { "Value": 33, "Source": "oempro_subscriber_lists.ActiveSubscriberCount", "Definition": "SubscribedNotHardBounced,ArchivedExcluded", "MaxStalenessSeconds": 300 }
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorMessage": "Unsupported aggregation; supported: daily, weekly, monthly, yearly"
}
```

```txt [Error Codes]
0: Success
1: Missing StartDate parameter
2: Missing EndDate parameter
3: Unsupported aggregation value
4: Unsupported metric value
5: Invalid StartDate/EndDate format
```

:::

**Notes:**
- When `UserIDs` is supplied, every requested user appears in `Users` (with an empty `Metrics` map and `0` subscribers when they have no data), giving deterministic per-account rows. When omitted, only users with sends or active subscribers in scope are returned.
- Days with no activity are omitted from each `Metrics` series; `weekly`/`monthly`/`yearly` fold those daily buckets in the response.
- `TotalActiveSubscribers` is always the current live value; it does not honor the date range.
