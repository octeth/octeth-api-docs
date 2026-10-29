---
layout: doc
---

# User API Documentation

User management endpoints for creating, authenticating, and managing user accounts and user groups.

::: danger Credential fields removed in v6.0.0
`user.get`, `users.get`, `user.switch`, `user.login` and `user.current` no longer return the account's password hash, `AuthToken`, two-factor secret or recovery key, `APIKey` or `PreviewMyEmailAPIKey`. On `user.get` and `user.switch` the `GroupInformation` block also no longer carries the user group's `SendMethod*` relay credentials, its `Payment*` values, or the `DeliveryServerInformation` block including each server's `ConnectionParams`.

Nothing else about these responses changed: the same keys, the same names, the same nesting, minus those fields. The group relay values are **platform** credentials shared by every account in the group, which is why they are the most serious item.

Replacements: read a delivery server through `deliveryserver.get`, which returns a `HasSMTPPassword` boolean instead of the password, and read group configuration through the user group endpoints under an admin credential. For two-factor enrolment, `user.current` still returns `MFA_SecretKey` and `MFA_QRCode` while two-factor authentication is off. Since v6.0.1 it returns no two-factor value once two-factor authentication is on: the recovery code is returned once, by the `user.update` call that enables it.

See [Behavior changes in v6.0.0](/v6.0.0/api-reference/behavior-changes) for the full table and the remediation steps if you believe these responses were captured.
:::

## Create a User

<Badge type="info" text="POST" /> `/api/v1/user.create`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/user.create`. Legacy access via `/api.php` is also supported
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
| TimeZone | String | Yes | User's timezone. An HTML-encoded `&amp;` is stored as `&`, so `(GMT-05:00) Eastern Time (US &amp; Canada)` is stored as `(GMT-05:00) Eastern Time (US & Canada)`. Changed in v6.0.2 |
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
| ReputationLevel | String | No | Reputation level ('Trusted' or 'Untrusted'). When omitted, the New user reputation setting in **Settings > ESP Settings** applies (`Untrusted` on a default install). Before v6.0.1 the default was 'Trusted'. An `Untrusted` account's campaigns wait for approval and it cannot send through the email gateway |
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
16: Maximum number of user accounts exceeded (the license's user account limit)
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
| TFACode | String | Conditional | Two-factor authentication code (required if 2FA is enabled) |
| TFARecoveryCode | String | No | Two-factor authentication recovery code |
| Disable2FA | Boolean | No | Skip 2FA verification for this login. Honored **only** when `Disable2FAToken` is also supplied and valid (see note below). |
| Disable2FAToken | String | Conditional | Server-derived token that authorizes `Disable2FA`. Required for `Disable2FA` to take effect. |

::: warning Behavior change (v5.9.3, #2333)
`Disable2FA` alone no longer skips two-factor authentication. In earlier versions **any** client could send `Disable2FA=true` and bypass 2FA, a security hole. It is now honored only when accompanied by a matching `Disable2FAToken`:

```
Disable2FAToken = HMAC_SHA256("user.login.disable2fa", SCRTY_SALT)   // lowercase hex
```

`SCRTY_SALT` is a server-side secret from `.oempro_env`, so only a trusted integration that has access to it (for example a custom SSO bridge running on the same host) can compute the token; an ordinary API caller cannot forge it. If `SCRTY_SALT` is empty the token can never validate and `Disable2FA` is ignored. When the token is absent or invalid, the request falls through to normal 2FA handling: supply `TFACode` (or `TFARecoveryCode`). Callers authenticating with `APIKey` are unaffected.
:::

::: danger Behavior change (v6.0.0)
**`PasswordEncrypted` is removed.** While it was truthy, `user.login` compared the supplied `Password` verbatim against the stored password hash instead of salting and hashing it first, which made the hash a working credential in its own right. It had no flag, no privilege check and no restriction to internal callers, and it was undocumented in every earlier version of this reference.

Send the user's real password with the parameter omitted. A request that still sends it is **ignored, not rejected**, so an integration that sent it alongside a real password keeps working; only one that sent a hash stops working, and it answers the existing `ErrorCode 3` exactly as a wrong password always did.

If your integration only ever held the hash, use a per-user API key from the user's API Keys screen, `user.switch` under admin authentication, or SSO.

**`Disable2FA` and `Disable2FAToken` are stripped from any request arriving over HTTP.** They now work only for Octeth's own in-process callers, which is what they were always for. An external caller that sends them gets the ordinary two-factor challenge.
:::

::: warning Behavior change (v6.0.1, #3229)
With **Prevent user login from IP addresses not in the list** ticked in Settings > Security and Authorized IP Addresses filled in, a `Username` and `Password` login from an address outside the list is refused before the password is checked, and no session is created:

`{"Success":false,"ErrorCode":[3],"ErrorText":["Access from this IP address is not allowed"]}`

The error code is the ordinary invalid-login code, so an integration that reads only the code treats it as a failed login. A login with `APIKey` is not affected. With the setting off or the list empty, nothing changes.
:::

::: warning Behavior change (v6.0.2, #2986)
Repeated failed sign-ins are refused. After `LOGIN_THROTTLE_MAX_FAILURES_PER_IDENTITY` failures for one username (default 10) or `LOGIN_THROTTLE_MAX_FAILURES_PER_IP` failures from one client address (default 50) within `LOGIN_THROTTLE_WINDOW_SECONDS` (default 900), further attempts are refused for `LOGIN_THROTTLE_LOCKOUT_SECONDS` (default 900) with **HTTP 429**, a `Retry-After` header and:

`{"Success":false,"ErrorCode":429,"ErrorText":"Too many failed attempts. Try again later.","RetryAfterSeconds":840}`

The check runs before the credentials are looked up, so the answer is identical for an unknown username, and a correct password is refused too until the lock expires. A wrong `TFACode` or `TFARecoveryCode` counts as a failure. A successful login clears the count for that username. A login with `APIKey` is not counted or refused. The settings are under **Login Brute-Force Protection** in [Octeth Configuration](/v6.0.5/getting-started/octeth-configuration#main-configuration-file-oempro-env).
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
3: Access from this IP address is not allowed (user-area IP restriction, see above)
6: Invalid 2FA code or recovery code
429: Too many failed attempts, try again after RetryAfterSeconds (HTTP 429, see above)
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
| IncludeSendingState | Boolean | No | Since v6.0.2. `true` adds `SendingState`, the email gateway sending verdict described below. Without it the response is unchanged |

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

::: warning Two-factor values (v6.0.1)
`MFA_QRCode` and `MFA_SecretKey` are returned only while `2FA_Enabled` is `No`, for enrolment. A secret is generated on the first call if the account has none. Once two-factor authentication is enabled, `user.current` returns no two-factor value at all. Before v6.0.1 it returned `MFA_RecoveryCode` while two-factor authentication was enabled. The recovery code is now returned once, in the `user.update` response that enables two-factor authentication. See [Update User](#update-user).
:::

For a team member session the two-factor enrolment values `MFA_SecretKey` and `MFA_QRCode` are not returned, and no secret is created: they belong to the account owner. Every other field is the same as for the account's own session.

### `UserInfo.GroupInfo`

An explicit, user-safe projection of the authenticated user's **user group**. It intentionally exposes only capability flags and plan quotas the user is already subject to.

::: warning Not exposed here, by design
::: tip Email gateway sending state (IncludeSendingState)
With `IncludeSendingState=true` the response carries `SendingState`, built from the same checks the gateway send endpoint applies. `State` is the first entry of `Blockers`, or `ready`: `account_disabled` (code 12), `awaiting_account_approval` (40, the account is not `Trusted`), `phone_verification_required` (34), `no_sending_domain`, `domain_not_verified` (32, DNS has not passed), `awaiting_domain_approval` (32, held for the operator's approval), `domain_suspended` (32) or `quota_exhausted` (17). It also returns `CanSend`, `ErrorCode` (the code a send would get), `Message`, `NextStep`, `DomainID` (for a domain state), `ReadyDomains`, `Usage` (monthly, lifetime and daily sent and limits), `RateLimits` and `Domains`.
:::

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

- a **comma-separated string** of permission names, e.g. `"Campaign.Create,Campaign.Update,Campaigns.Get,List.Create"`, with no spaces after the commas; or
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

`SenderDomainManagement`, `EnableSenderInfo`, `ForcedSenderInfo` and `DefaultSenderDomainActivate` come from the group's options blob, and groups created before those options existed do not carry them. The endpoint always returns one of the two defined string values and never `null`. An absent option is reported as `"Disabled"`, which matches how the application itself evaluates it.

#### Duplicated quota values

`LimitEmailSendPerPeriod` and `LimitEmailSendLifetime` also appear in the response as `Usage.Limit_Monthly` and `Usage.Limit_Lifetime`. Both names carry the same value. The `Usage.*` names are retained unchanged for backwards compatibility; `GroupInfo` repeats them so the group's quota set is complete in one place.

::: tip New in v5.9.3
Everything below `DefaultSenderDomain` in the table above was added in v5.9.3. Previously these were readable only through the admin-authenticated `user.get`, which forced frontend integrations to hold an admin API key purely to render a user's own UI. The change is **purely additive**: the four pre-existing `GroupInfo` keys are unchanged in name and value.
:::

## User Logout

<Badge type="info" text="POST" /> `/api/v1/user.logout`

<Badge type="tip" text="New in v6.0.4" />

::: tip API Usage Notes
- Authentication is done by user SessionID (a user API key works too, see below)
- Required permissions: none
- v1 REST alias: `POST /api/v1/user.logout`. Legacy access via `/api.php` is also supported
:::

Ends sessions of the calling user. It has two forms.

**Without `TargetSessionHashes`** the calling session is ended. The `SessionID` stops working at once, and later calls with it answer error 99998. With a user `APIKey` call there is no persistent session to end, and the command succeeds as a no-op.

**With `TargetSessionHashes`** other sessions of the same user are ended, and the calling session stays signed in. Each value is the SHA-256 hex digest of a `SessionID`, so a client can end a session it no longer holds the id of, for example one listed on another device. From then on `api.php` refuses that session with error 99998 and the text `This session was signed out from another device`, whether it is sent as `SessionID` or as the session cookie, and the legacy user area signs it out.

A hash is always recorded against the calling user's own account, and a session is refused only when its hash was recorded by the account it is signed in as. Sending the hash of another user's session therefore has no effect: one user can never end another user's session.

A recorded hash is kept for the session lifetime (`SESSION_LIFETIME_DAYS`, at least 30 days) plus one day, then removed.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.logout` |
| SessionID | String | Yes | The calling user's session |
| TargetSessionHashes | String | No | Comma-separated SHA-256 hex digests (64 characters each) of other `SessionID`s of the same user, at most 100. An array of strings is accepted too |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.logout",
    "SessionID": "session-id-from-user-login",
    "TargetSessionHashes": "3f1c...e9a0,8b2d...41c7"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "RevokedSessions": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "TargetSessionHashes must be a comma-separated list of SHA-256 hex digests"
}
```

```txt [Error Codes]
0: Success
1: TargetSessionHashes is empty or holds a value that is not a SHA-256 hex digest
2: TargetSessionHashes holds more than 100 hashes
3: The sessions could not be signed out
99998: Authentication failure or session expired
```

:::

`RevokedSessions` is returned only with `TargetSessionHashes`, and counts the distinct hashes in the request. Recording a hash a second time is not an error.

To compute a hash, take the SHA-256 of the `SessionID` string exactly as `user.login` returned it, and send the lowercase hex digest.

## Get User Information

<Badge type="info" text="GET" /> `/api/v1/user.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/user.get`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Conditional | User ID (required if EmailAddress not provided) |
| EmailAddress | String | Conditional | Email address (required if UserID not provided) |
| LimitAvailability | Boolean | No | Set to `1` to add `LimitUtilizationAvailable` to the response: `false` when the limit utilization could not be calculated (the error is logged). `LimitUtilization` is `null` both then and when the user has no limits, so read this field to tell the two apart. Without the parameter the response is unchanged. Added in v6.0.2 |
| IncludeForcedFrom | Boolean | No | Set to `1` to add `GroupInformation.ForcedFromEnabled` to the response: one boolean per email type (`Campaign`, `AutoResponder`, `Transactional`) that is `true` when the user group's delivery server for that type forces the From address. Such an email is sent with the forced address even when the email and its list have none. The address itself is never returned. Without the parameter the response is unchanged. Added in v6.0.5 |

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

```json [Success Response with IncludeForcedFrom]
{
  "Success": true,
  "ErrorCode": 0,
  "UserInformation": {
    "UserID": 123,
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "GroupInformation": {
      "UserGroupID": 1,
      "ForcedFromEnabled": {
        "Campaign": false,
        "AutoResponder": true,
        "Transactional": false
      }
    }
  },
  "LimitUtilization": null
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

`ForcedFromEnabled.Campaign` reflects the group's marketing delivery server. A type with no delivery server assigned, or with no forced From address, reads `false`. The key is added only when the user has a user group.

## Update User

<Badge type="info" text="POST" /> `/api/v1/user.update`

::: tip API Usage Notes
- Authentication required: Admin API Key or User API Key
- Required permissions: `User.Update`
- v1 REST alias: `POST /api/v1/user.update`. Legacy access via `/api.php` is also supported
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
| CurrentPassword | String | Conditional | The account's current password. Always verified when supplied (`ErrorCode 10` when wrong). Required alongside `Password` when `USER_UPDATE_REQUIRE_CURRENT_PASSWORD` is on and the caller is authenticated as the user, otherwise `ErrorCode 9`. An admin-authenticated caller is never asked for it. Added in v6.0.0 |
| FirstName | String | No | First name |
| LastName | String | No | Last name |
| CompanyName | String | No | Company name |
| Website | String | No | Website URL |
| OtherEmailAddresses | String | No | Additional email addresses. Omit to keep the existing value; pass an empty string to clear it. Before v6.0.2 a call that left it out cleared the stored value. Changed in v6.0.2 |
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
| ClearEmptyFields | Boolean | No | Set to `true` to let an empty value clear a field. With it, `CompanyName`, `FirstName`, `LastName`, `Website`, `Street`, `Street2`, `City`, `State`, `Zip`, `Country`, `Phone`, `Fax` and `VAT` given as an empty string are stored empty. A parameter that is left out is never changed. Without `ClearEmptyFields` an empty value for these fields is ignored, as before. Added in v6.0.2 |
| TimeZone | String | No | Timezone. An HTML-encoded `&amp;` is stored as `&`, so `(GMT-05:00) Eastern Time (US &amp; Canada)` is stored as `(GMT-05:00) Eastern Time (US & Canada)`. Changed in v6.0.2 |
| Language | String | No | Language code |
| AccountStatus | String | No | Account status (admin only) |
| AvailableCredits | Integer | No | Available credits (admin only) |
| RelUserGroupID | Integer | No | User group ID (admin only) |
| ReputationLevel | String | No | Reputation level (admin only) |
| DisableLinkTrackingRedirects | String | No | Admin only. `true` stops link tracking for the account's email gateway messages: links are no longer rewritten into the tracking domain, including in messages already queued, and tracking links already delivered return HTTP 404 instead of redirecting. `false` turns it back on. Omit to keep the stored value. A user-authenticated call that supplies it succeeds and the value is ignored. It applies to email gateway messages, which include journey Send Email messages. Campaigns and autoresponders are not affected. <Badge type="tip" text="Added in v6.0.4" /> |
| RateLimits | String | No | JSON string of rate limits, normalised before storage to `{"EmailGateway":{Minute,Hour,Day,Week,Month,Year},"SMS":{…}}` with integer values (`-1` = unlimited; an omitted interval becomes `-1`). Omit to keep the existing row's value; pass an **empty string** to clear it, which means "no user-level override, inherit the user group's default rate limits" (an empty value is stored as-is, never normalised into an all-unlimited document). |
| CustomEmailHeaders | String | No | Custom email headers. Omit to keep the existing row's value; pass an empty string to clear it. |
| WhiteListedEmailAddresses | String | No | Whitelisted email addresses. Omit to keep the existing row's value; pass an empty string to clear it. |
| Enable2FA | String | No | Set to 'true' to enable 2FA. Takes effect only while 2FA is off and with a valid `2FACode`. **Changed in v6.0.1:** on success the response carries `MFA_RecoveryCode`, the only time the API returns it |
| 2FACode | String | Conditional | Current code from the authenticator app enrolled with the `MFA_SecretKey` that `user.current` returns (required when enabling 2FA) |
| Cancel2FA | String | No | Set to 'true' to disable 2FA. Clears the stored secret and recovery code, so enabling 2FA again issues a new pair |

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

```json [Success Response (Enable2FA)]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "MFA_RecoveryCode": "1a2b-3c4d-5e6f-7a8b-9c0d-1e2f-3a4b-5c6d"
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
9: CurrentPassword is required to change the password (v6.0.0)
10: CurrentPassword is incorrect (v6.0.0)
11: Password must be a string (v6.0.0)
12: The account could not be updated, no change was saved (v6.0.4)
```

:::

::: tip Two-factor recovery code returned once (v6.0.1)
The call that enables two-factor authentication (`Enable2FA=true` with a valid `2FACode`) returns the account's recovery code as a top-level `MFA_RecoveryCode` key. Every other `user.update` response is unchanged. Store the code when it is returned, because no API call returns it again: `user.current` stopped returning it in v6.0.1. To issue a new recovery code, disable two-factor authentication with `Cancel2FA=true` and enable it again.
:::

::: tip Clearing a field (v6.0.2)
`user.update` skips an empty value for the contact and address fields, so a field could not be blanked. Send `ClearEmptyFields: true` with the fields to clear set to an empty string, for example `{"Command": "user.update", "UserID": 123, "CompanyName": "", "ClearEmptyFields": true}`. Only fields present in the request are cleared. A call without the flag behaves exactly as before.
:::

::: tip Error code 12 (v6.0.4)
A call that changes the password, turns on two-factor authentication or disables the account also signs the user out of every browser where "Remember me" was ticked in the classic user area. When that sign-out cannot be recorded, nothing is saved and the call answers `ErrorCode 12` instead of reporting success. Retry the call. Every other `user.update` response is unchanged.
:::

## Get Monthly User Snapshot

<Badge type="info" text="GET" /> `/api/v1/user.snapshot`

::: tip API Usage Notes
- Authentication required: Admin API Key or User API Key
- v1 REST alias: `GET /api/v1/user.snapshot`. Legacy access via `/api.php` is also supported
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

The response is the merge of two payloads: a stat-strip header (the overall fields below) plus the time-series breakdown for each metric (keyed by metric title: `New Subscribers`, `Sent Emails`, `Opens`, etc).

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

**Migration note (v5.9.x):** `TotalActiveSubscribers` previously summed across **all** lists (including archived) using a slightly stricter criterion (`BounceType = 'Not Bounced'`, excluding soft bounces). Both changes were intentional: the new value (a) excludes archived lists, matching the lists.get browse display, and (b) uses `BounceType != 'Hard'` to align with `Subscribers::GetActiveTotal`. For a user with no archived lists and a clean deliverability footprint the difference is negligible. For users with many archived lists or noticeable soft-bounce volume the value will shift; treat the new figure as the canonical "subscribers I currently market to."

## Switch to User Account

<Badge type="info" text="POST" /> `/api/v1/user.switch`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/user.switch`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.switch`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Yes | User ID to switch to |
| PrivilegeType | String | No | `Default` (or empty) logs in with the user group's permissions. `Full` lets the admin act as the user with every user permission, whatever the user group allows. Full applies only to the session `user.switch` returns, while it is logged in as this user: another lookup of the same user (for example `user.get`) and any account the session later switches to keep the group's real permissions. Changed in v6.0.2 |
| ActingAdminID | Integer | No | The administrator acting through this call, for the customer's account audit log. Honoured only when the call is authenticated with the master admin API key and only for an existing administrator that may reach this account; otherwise the caller's own AdminID is recorded (AdminID 1 for the master key). It changes nothing else: the session and the response are the same. The new interface's staff area sends the signed-in staff member here. Added in v6.0.5 |

The target account must be enabled. `user.switch` refuses an account whose status is not `Enabled` with `ErrorCode 4` and creates no session, because a session for a disabled account cannot authenticate any user command. Enable the account first, or read it through admin commands such as `user.get`. (Changed in v6.0.1.)

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

```json [Disabled Account Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Target account is disabled"
}
```

```txt [Error Codes]
0: Success
1: Missing UserID parameter
2: User not found
3: Invalid privilege type (must be 'Default' or 'Full')
4: Target account is disabled (account status is not Enabled). No session is created (v6.0.1)
5003: User is outside the user groups this admin account may access
```

:::

## Send Password Reminder

<Badge type="info" text="POST" /> `/api/v1/user.passwordremind`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/user.passwordremind`. Legacy access via `/api.php` is also supported
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
| EnforceResetSetting | Boolean | No | Set to `true` to apply the admin preference "Let users reset a forgotten password". When that preference is off, the request is refused with `ErrorCode 4` and nothing is sent. Without this parameter the preference is not checked. |
| AdminAPIKey | String | No | Admin API key for custom email settings |
| ResetEmailSubject | String | No | Custom email subject (requires AdminAPIKey) |
| ResetEmailContent | String | No | Custom email content (requires AdminAPIKey) |

::: warning Behavior change (v6.0.2, #2986)
Every request counts, not only failed ones, because each one that matches a user sends an email. After `LOGIN_THROTTLE_MAX_FAILURES_PER_IDENTITY` requests for one `EmailAddress` (default 10) within `LOGIN_THROTTLE_WINDOW_SECONDS` (default 900), further requests for it are refused for `LOGIN_THROTTLE_LOCKOUT_SECONDS` (default 900) with **HTTP 429**, a `Retry-After` header and `{"Success":false,"ErrorCode":429,"ErrorText":"Too many failed attempts. Try again later.","RetryAfterSeconds":840}`. The refusal is identical for an email address that belongs to no user. Over the API the count is per email address only, so an integration that sends reminders for many customers from one server is not limited by its own address. The user forgot-password screen also counts per client address (default 50, `LOGIN_THROTTLE_MAX_FAILURES_PER_IP`).
:::

::: tip New in v6.0.2 (#3549)
`EnforceResetSetting` is opt-in so that an integration which handles password resets for an operator (an SSO or shop reset page using `CustomResetLink`) keeps working when the operator turns the user-area reset off. The new user interface always sends it. The refusal `{"Success": false, "ErrorCode": 4, "ErrorText": "Password reset is disabled for user accounts"}` is checked before the email address is looked up, so it is the same for every address, and it does not count toward the reminder limit. `Admin.PasswordRemind` is not affected.
:::

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
4: Password reset is disabled for user accounts (only with EnforceResetSetting=true)
429: Too many reminder requests for this email address, try again after RetryAfterSeconds (HTTP 429, see above)
```

:::

## Reset User Password

<Badge type="info" text="POST" /> `/api/v1/user.passwordreset`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/user.passwordreset`. Legacy access via `/api.php` is also supported
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
| EnforceResetSetting | Boolean | No | Set to `true` to apply the admin preference "Let users reset a forgotten password". When that preference is off, the request is refused with `ErrorCode 4` before the token is checked, and the password is not changed. Without this parameter the preference is not checked (v6.0.2, #3605). |

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
4: Password reset is disabled for user accounts (only with EnforceResetSetting=true)
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
| IsAgentKey | Boolean | No | `true` creates an AI agent key, bound to the scopes and budgets below and to the user group's AI agent policy. Omitted or `false` creates an ordinary key with full access and the response is unchanged. Added in v6.0.2 |
| AgentScopes | String \| Array | No | Agent keys only. Comma-separated list or array. Possible values: `read`, `write`, `send`. `read` is always on. Default `read` |
| AgentSendsPerDay | Integer | No | Agent keys only. Sends the key may start per UTC day. `0` (default) means no key-level limit |
| AgentMaxRecipientsPerSend | Integer | No | Agent keys only. Recipients one send may reach. `0` means no key-level limit |
| AgentMaxImportRows | Integer | No | Agent keys only. Rows one subscriber import may carry. `0` means no limit |
| AgentConfirmAbove | Integer | No | Agent keys only. A send to more recipients than this returns a confirmation request first. `0` means no key-level confirm step |
| AgentMaxSmsPerDay | Integer | No | Agent keys only. SMS recipients the key may reach per UTC day. `0` (default) means no key-level limit. Added in v6.0.5 |
| AgentMaxSmsRecipientsPerSend | Integer | No | Agent keys only. SMS recipients one send may reach. `0` means no key-level limit. Added in v6.0.5 |
| AgentSmsConfirmAbove | Integer | No | Agent keys only. An SMS send to more recipients than this returns a confirmation request first. `0` means no key-level confirm step. Added in v6.0.5 |

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
| IPAddress      | String           | **Deprecated**: kept for backward compatibility. Same value as `BoundIPAddress`. Prefer `BoundIPAddress` in new integrations. |
| BoundIPAddress | String           | IP address the key is bound to, or `""` if unbound. |
| CreatedAt      | String (DATETIME)| Creation timestamp (UTC, `YYYY-MM-DD HH:MM:SS`). |
| LastUsedAt     | String \| null   | Last time this key was used to authenticate (always `null` for a freshly created key). |
| LastUsedIP     | String \| null   | Client IP recorded at last use, `null` if never used. |
| RequestCount   | Integer          | Lifetime number of authentications with this key (always `0` for a freshly created key). |

**Agent keys:** when `IsAgentKey` is `true`, the `APIKey` object also carries `"IsAgentKey": true` and an `Agent` object: `Scopes` (array), `SendsPerDay`, `MaxRecipientsPerSend`, `MaxImportRows`, `ConfirmAbove`, and since v6.0.5 `SMSPerDay`, `SMSMaxRecipientsPerSend` and `SMSConfirmAbove`. See [AI agent keys](#ai-agent-keys) for how they are enforced.

::: info Counter semantics
`RequestCount` and `LastUsedAt` are bumped each time the key is used to start a session via `User.Login` (with the `APIKey` parameter). They do **not** count every individual REST request made within a session. Once a client has a `SessionID`, subsequent calls authenticate with session credentials and do not re-touch the API key. Treat `RequestCount` as "how many times has this integration checked in?", which is what an operator cares about when answering "is this key still in use anywhere?".
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
| CreatedAt      | String (DATETIME)| Creation timestamp. Keys that pre-date the usage-tracking migration return the sentinel `"1970-01-01 00:00:00"`. Clients should render this as "Unknown". |
| LastUsedAt     | String \| null   | Last time this key was used to authenticate, or `null` if the key has never been used. |
| LastUsedIP     | String \| null   | Client IP recorded at last use (IPv4 or IPv6), `null` if never used. |
| RequestCount   | Integer          | Lifetime number of authentications with this key. See counter semantics on the Create endpoint above. |
| IsAgentKey     | Boolean          | Present, and `true`, only on AI agent keys. Added in v6.0.2 |
| Agent          | Object           | Present only on AI agent keys: `Scopes`, `SendsPerDay`, `MaxRecipientsPerSend`, `MaxImportRows`, `ConfirmAbove`, and since v6.0.5 `SMSPerDay`, `SMSMaxRecipientsPerSend`, `SMSConfirmAbove`. Rows of ordinary keys are unchanged. Added in v6.0.2 |

:::

## Update an AI Agent Key

<Badge type="info" text="POST" /> `/api/v1/user.apikey.update`

Changes the scopes and budgets of an AI agent key. Only agent keys have settings to change. Values above the user group's AI agent policy are stored but have no effect beyond the group's limit. An agent key cannot call this command on itself.

::: tip API Usage Notes
- Authentication required: User API Key or SessionID (not an AI agent key)
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.2
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.update`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| APIKeyID | Integer | Yes | ID of the agent key to change |
| AgentScopes | String \| Array | No | Possible values: `read`, `write`, `send`. `read` is always on |
| AgentSendsPerDay | Integer | No | Sends per UTC day, `0` for no key-level limit |
| AgentMaxRecipientsPerSend | Integer | No | Recipients per send, `0` for no key-level limit |
| AgentMaxImportRows | Integer | No | Rows per import, `0` for no limit |
| AgentConfirmAbove | Integer | No | Confirm sends above this many recipients, `0` for no key-level confirm step |
| AgentMaxSmsPerDay | Integer | No | SMS recipients per UTC day, `0` for no key-level limit. Added in v6.0.5 |
| AgentMaxSmsRecipientsPerSend | Integer | No | SMS recipients per send, `0` for no key-level limit. Added in v6.0.5 |
| AgentSmsConfirmAbove | Integer | No | Confirm SMS sends above this many recipients, `0` for no key-level confirm step. Added in v6.0.5 |
| MarkAsAgentKey | Boolean | No | `true` first turns an ordinary key into a read-only agent key, then applies any settings sent with it. It can only narrow a key. The built-in MCP connector uses it to convert keys it created before v6.0.2 |

Omitted parameters keep their stored value.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.apikey.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.update",
    "SessionID": "your-session-id",
    "APIKeyID": 17,
    "AgentScopes": "read,write,send",
    "AgentSendsPerDay": 5,
    "AgentConfirmAbove": 1000
  }'
```

```json [Success Response]
{
  "Success": true,
  "APIKeyID": "17",
  "IsAgentKey": true,
  "Agent": {
    "Scopes": ["read", "write", "send"],
    "SendsPerDay": 5,
    "MaxRecipientsPerSend": 0,
    "MaxImportRows": 0,
    "ConfirmAbove": 1000
  }
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 3, "Message": "Only AI agent keys have scopes and budgets"}
  ]
}
```

```txt [Error Codes]
1: Missing APIKeyID parameter
2: API key not found
3: Only AI agent keys have scopes and budgets
4: API key update failed
```

:::

## Get the AI Agent Policy

<Badge type="info" text="GET" /> `/api/v1/user.agentpolicy`

Returns the AI agent policy the service provider set on the account's user group. Called with an AI agent key, it also returns that key's effective limits under `Effective`, so an agent can learn its limits before it reaches one. A limit of `0` means no limit.

Since v6.0.5 the response also carries the group's SMS limits (`MaxSmsPerDay`, `MaxSmsRecipientsPerSend`, `SmsConfirmAbove`), and for an agent key `Effective` adds `SMSPerDay`, `SMSMaxRecipientsPerSend` and `SMSConfirmAbove`. SMS sends count against these and never against the email limits.

::: tip API Usage Notes
- Authentication required: User API Key, SessionID or AI agent key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.2
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.agentpolicy.get`   |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/user.agentpolicy \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.agentpolicy.get",
    "APIKey": "your-agent-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "AgentAccess": "send",
  "AllowedScopes": ["read", "write", "send"],
  "MaxSendsPerDay": 20,
  "MaxRecipientsPerSend": 50000,
  "ConfirmAbove": 1000,
  "Effective": {
    "Scopes": ["read", "write"],
    "SendsPerDay": 5,
    "MaxRecipientsPerSend": 50000,
    "MaxImportRows": 0,
    "ConfirmAbove": 1000
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
99998: Authentication failed
```

:::

## AI Agent Keys

An API key created with `IsAgentKey` belongs to an AI agent: a connection approved through the built-in MCP connector, or a headless agent key created under Connected AI assistants. Every request made with it is checked before the command runs, through `/mcp` and through direct REST calls alike:

- **Allow-list.** An agent key can call only the commands in the table below. Every other command, including every admin command, plug-in command, sign-in, key management, account setting and any command that creates or reveals a credential (gateway sender keys, SMTP credentials, webhook signing keys), is refused with `ErrorCode 100010` (HTTP 403) and `RequiredScope: none`. Commands added in later versions stay refused to agent keys until they are added to the list. `User.Current` leaves out the two-factor enrolment fields for an agent key.
- **Scope.** Each allowed command needs `read`, `write` or `send`, as the table shows. A command outside the key's effective scopes is refused with `ErrorCode 100010` (HTTP 403), naming `RequiredScope` and `GrantedScopes`. `Campaign.Update` needs `send` when it leaves a campaign scheduled or sending and either schedules it or changes it beyond its name. A new campaign is unscheduled, so building one is a `write`. `Email.Update` and `UserEmailTemplate.Update` need `send` when the email is used by a scheduled or sent campaign, an autoresponder, a list's opt-in confirmation or a journey. `Segment.Update` is refused while a scheduled, sending or paused campaign, an active SMS campaign, an autoresponder or a journey uses the segment, directly, through a segment rule in its audience or journey criteria, or through another segment that nests it.
- **Adding subscribers needs `send`.** Adding, changing or unsubscribing a subscriber can send email on its own: an opt-in confirmation, autoresponders, or a journey triggered by the subscription, a field change or the unsubscription. So `Subscriber.Create`, `Subscriber.Update`, `Subscriber.Unsubscribe`, `Subscribers.Import` and `Subscribers.Import.Post` need the `send` scope, and each call counts against the daily send budget, with the subscribers it adds or changes counted as its recipients.
- **Refused parameters.** Some parameters of allowed commands have side effects outside the command's scope and are refused with `ErrorCode 100016` (HTTP 403), naming `Parameter`: on `List.Create` and `List.Update` anything other than the name, description, opt-in mode and sender details (`List.Update` also takes `HideInSubscriberArea`); `FetchURL` and `FetchPlainURL` on `Email.Update` and `UserEmailTemplate.Update`; `RulesJSON` and `RulesOperator` (bulk unsubscribe) on `Subscriber.Unsubscribe`; `BypassJourneyStatusCheck` on `Subscriber.Journey.Trigger`; the File and MySQL sources of `Subscribers.Import` (only `ImportType` `Copy` with inline `ImportData`); and on `Subscribers.Import.Post` anything but inline `ImportFrom.CSV.Data` (no CSV URL, no third-party source, no `ImportStatusUpdateWebhookURL`). `Subscribers.Import` and `Subscribers.Import.Post` are also refused, naming `ListID`, when the target list uses double opt-in, or when its opt-in mode cannot be read: an import stores every row as subscribed and sends no confirmation email, so it would add addresses nobody confirmed. Add each subscriber to such a list with `Subscriber.Create`, which sends the confirmation email. On `Campaign.Create` and `Campaign.Update`, every `AutoResend*` and `ScheduleRec*` parameter and `ScheduleType` `Recursive` are refused, and so is scheduling or resuming a campaign that already has a recurring schedule or auto-resend turned on, because those send again later on their own. On every command, a value containing a remote content tag (`%RemoteContent=...%` or `%RemoteContentBeforeSend=...%`, in any letter case) is refused, because it makes Octeth fetch a URL, and a list or segment that is not the account's own, named anywhere in the request (an ID parameter, `RecipientListsAndSegments`, a `RulesJsonBundle` criterion or a segment rule), is refused. An ID parameter (`ListID`, `SubscriberListID`, `SegmentID`, `CampaignID`, `EmailID`, `JourneyID`, `SubscriberID` and the like) must be a plain positive whole number such as `42`, and `RecipientListsAndSegments` must be `ListID:SegmentID` pairs of plain whole numbers, because MySQL reads values such as `5.0` or `5abc` as `5`.
- **Deleting an email.** An agent key can delete only an email it created itself with `Email.Create` in the last 15 minutes that no campaign (drafts included), A/B test, autoresponder, list opt-in confirmation or journey uses. Any other `Email.Delete` is refused with `ErrorCode 100010` and `RequiredScope: none`. It lets a tool that created an email and then failed remove what it left behind.
- **Dry run.** Send `AgentDryRun=1` with any command to run every agent check above (allow-list, scope, refused parameters, ownership, import row cap) without running the command. A request that passes answers `Success: true` and `AgentDryRun: true` and changes nothing. The daily send budget, the recipients cap and the confirm step are not checked. Keys created without `IsAgentKey` ignore the parameter, so the command runs.
- **One command per request.** When the `Command` parameter and the `/api/v1/<alias>` route name two different commands, an agent key is refused with `ErrorCode 100015` (HTTP 403).
- **Effective policy.** The key's own settings capped by the user group's AI agent policy (`AgentAccess`, `AgentMaxSendsPerDay`, `AgentMaxRecipientsPerSend`, `AgentConfirmAbove`, and the SMS limits `AgentMaxSmsPerDay`, `AgentMaxSmsRecipientsPerSend`, `AgentSmsConfirmAbove`), taking the stricter non-zero limit of the two.
- **Budgets.** A send above the recipients cap, the daily send budget, or an import above the row cap is refused with `ErrorCode 100011` (HTTP 429), naming `Budget`, `Limit` and `Usage`. These are hard limits that no confirmation can exceed. Recipients are counted before the command runs and the count is an upper bound: for a campaign, the current size of every included list and segment, with exclusions ignored. When a count cannot be made (enabling a journey, or a list or segment count that fails) and a recipients cap or a confirm threshold applies, the command is refused with `ErrorCode 100011` and `Usage: null`, because neither limit could be honoured. `Campaign.Update` checks the audience it is about to set before it changes anything.
- **SMS budget.** The SMS delivery commands (`SMSCampaign.Send`, `SMSCampaign.Schedule`, `SMSCampaign.Resume`, `SMSCampaign.Test`, `SMS.Send`, `SMS.TestNumber.Add`) count against separate SMS limits and never against the email ones: `SMSPerDay` (SMS recipients per UTC day, not sends), `SMSMaxRecipientsPerSend` and `SMSConfirmAbove`. A send is counted with its recipients: for `SMSCampaign.Send` and `.Schedule` the sendable recipients of the confirmed estimate, for `.Resume` the confirmed recipients not yet sent, and one for the others. Refusals answer `ErrorCode 100011` with `Budget` `SMSPerDay`, `SMSMaxRecipientsPerSend` or `SMSConfirmAbove`, and a send above `SMSConfirmAbove` answers `ErrorCode 100012` with a `Preview` that includes the projected cost. When the SMS recipients cannot be counted and any SMS limit applies, the send is refused with `Usage: null`. On the SMS commands that change data or deliver, only the parameters their tools use are accepted, and `AcknowledgeCost` on `SMSCampaign.Resume` is refused: a campaign paused because its cost drifted is resumed by a person in the app.
- **Always confirmed.** Every delete an agent key may call (`Lists.Delete`, `CustomFields.Delete`, `Subscribers.Delete`, `Subscriber.Tags.Delete`, `Segments.Delete`, `Campaigns.Delete`, `Journeys.Delete`, `SMSCampaign.Delete` and `SMSTemplate.Delete`, all write) and `SMSSuppression.Delete` (send, one `SuppressionID` at a time) always answer `ErrorCode 100012` with a `Preview` and a `ConfirmToken` first and change nothing. `SMSSuppression.Delete` spends no SMS budget.
- **Confirm step.** A send to more recipients than the confirm threshold returns `ErrorCode 100012` (HTTP 409) with `ConfirmationRequired`, a `Preview` and a single-use `ConfirmToken` valid for ten minutes. Repeating the identical request with `ConfirmToken` runs it. A reused, expired or mismatched token (any changed parameter) answers `ErrorCode 100013`.
- **One credential.** An agent key combined with a `SessionID` or an `AdminAPIKey` is refused with `ErrorCode 100014`.

Commands an AI agent key can call:

| Scope | Commands |
|---|---|
| `read` | `User.Current`, `User.AgentPolicy.Get`, `Lists.Get`, `List.Get`, `CustomFields.Get`, `Subscriber.Get`, `Segments.Get`, `UserEmailTemplates.Get`, `UserEmailTemplate.Get`, `UserEmailTemplate.Preview`, `Email.Get`, `Email.SpamTest`, `Campaigns.Get`, `Campaign.Get`, `Journey.List`, `Journey.Get`, `EmailGateway.GetDomains`, `EmailGateway.GetDomain`, `EmailGateway.GetEvents`, `EmailGateway.GetWebhooks` (without `SigningKey`, URLs masked), `Suppression.Browse`, `SMSCampaign.Browse`, `SMSCampaign.Get`, `SMSCampaign.Summary.Get`, `SMSCampaign.Audience.Count`, `SMSCampaign.Estimate.Get`, `SMSCampaign.Test.Preview`, `SMSCampaign.Stats`, `SMSCampaign.Stats.Breakdown`, `SMSCampaign.Stats.Timeseries`, `SMSCampaign.LinkClicks.Get`, `SMSCampaign.Events.Browse`, `SMSCampaign.Recipients.Browse`, `SMSCampaign.Replies.Browse`, `SMSTemplate.Browse`, `SMSTemplate.Get`, `SMS.Stats.Account`, `SMS.MergeTags.Get`, `SMS.Replies.Browse`, `SMS.Gateways.Get`, `SMS.TestNumbers.Get`, `SMSSuppression.Browse`, `SMSSuppression.Stats`, `Lists.Overview`, `Lists.Stats`, `List.GetActivitySeries`, `List.GetBounceTrend`, `List.GetCTRRetentionMatrix`, `List.GetEngagementTiers`, `List.GetESPBreakdown`, `List.GetSendTimeHeatmap`, `List.GetSourceBreakdown`, `List.GetSubscriberStatusBreakdown`, `List.GetTenureDistribution`, `List.SMS.Settings.Get`, `Subscriber.Exists`, `Subscribers.Search`, `Subscribers.Get`, `Subscriber.Activity.Timeline`, `Subscriber.Events`, `Subscriber.SMS.Events.Get`, `Subscriber.Tags.Get`, `Segments.RuleVocabulary.Get`, `Campaign.Recipients.Get`, `Campaign.Recipients.Activity.Get`, `Campaign.LinkClicks.Get`, `Campaign.ABTest.Get`, `Campaigns.Counts`, `Journey.Stats.ByAction`, `Journey.Stats.ByISP`, `Journey.Action.Subscribers`, `Subscriber.Journey.List` |
| `write` | `List.Create`, `List.Update`, `Segment.Create`, `Segment.Update`, `UserEmailTemplate.Create`, `UserEmailTemplate.Update`, `Email.Create`, `Email.Delete`, `Email.Update`, `Campaign.Create`, `Campaign.Update`, `Campaign.Pause`, `Campaign.Cancel`, `Journey.Disable`, `EmailGateway.AddDomain` (`DomainName` only), `EmailGateway.VerifyDomain`, `EmailGateway.AddWebhook`, `EmailGateway.DeleteWebhook`, `EmailGateway.TestWebhook`, `SMSCampaign.Create`, `SMSCampaign.Update`, `SMSCampaign.Rename`, `SMSCampaign.Copy`, `SMSCampaign.Delete` (always confirmed), `SMSCampaign.Estimate`, `SMSCampaign.Pause`, `SMSCampaign.Cancel`, `SMSTemplate.Create`, `SMSTemplate.Update`, `SMSTemplate.Delete` (always confirmed), `SMS.TestNumber.Verify`, `SMSSuppression.Add`, `Lists.Delete` (always confirmed), `List.Clone`, `List.Archive`, `List.Unarchive`, `CustomField.Create`, `CustomField.Update`, `CustomFields.Delete` (always confirmed), `CustomFields.Copy`, `List.SMS.Settings.Update`, `Subscriber.Tags.Create`, `Subscriber.Tags.Update`, `Subscriber.Tags.Delete` (always confirmed), `Subscribers.Delete` (always confirmed), `Segments.Delete` (always confirmed), `Segments.Copy`, `Campaigns.Delete` (always confirmed), `Campaign.Copy`, `Journey.Clone`, `Journeys.Delete` (always confirmed), `Subscriber.Journey.Remove` |
| `send` | `Subscriber.Create`, `Subscriber.Update`, `Subscriber.Unsubscribe`, `Subscribers.Import`, `Subscribers.Import.Post`, `Email.EmailPreview` (sends a real test email to one address), `Campaign.Resume`, `Journey.Enable`, `Subscriber.Journey.Trigger`, `EmailGateway.SendEmail` (explicit recipients only; To, CC and BCC count as recipients), `Suppression.Delete` (one `EmailAddress` at a time; always asks for confirmation and does not count against the daily send budget), `SMSCampaign.Send`, `SMSCampaign.Schedule`, `SMSCampaign.Resume`, `SMSCampaign.Test`, `SMS.Send`, `SMS.TestNumber.Add` (each counted against the SMS budget), `SMSSuppression.Delete` (one `SuppressionID`; always confirmed, spends no SMS budget), `Subscriber.Tag`, `Subscriber.Untag`, `Subscriber.OptIn`, `Subscriber.Journey.Exit`, `Subscribers.Journey.Bulk` |

`UserEmailTemplate.Preview` renders a template without sending anything, and `Email.SpamTest` scores an email without delivering it. `Email.EmailPreview` delivers a real email, so it needs `send` and counts as one recipient.

An autonomous agent can confirm its own sends. The confirm step guards against an accidental large send; the budgets and the provider's caps are the real limit.

Keys created without `IsAgentKey` are not affected and keep full access.

## Get Users List

<Badge type="info" text="GET" /> `/api/v1/users.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/users.get`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| RecordsPerRequest | Integer | No | Number of records per page (default: 25) |
| RecordsFrom | Integer | No | Starting record offset (default: 0) |
| OrderField | String | No | Column to order by (default: `UserID`). One of `UserID`, `Username`, `EmailAddress`, `FirstName`, `LastName`, `CompanyName`, `UserSince`, `LastActivityDateTime`, `AccountStatus`, `ReputationLevel`, `RelUserGroupID`, `RelUserCategoryID`, `SSOID`, matched without regard to case. Pipe-separate for multi-column sort (e.g. `AccountStatus\|UserID`). See the sorting note below. Changed in v6.0.2 |
| OrderType | String | No | Order direction: `ASC` or `DESC` (default: `ASC`). Pipe-separate to match a multi-column `OrderField`. |
| Filters | Object or String | No | Combinable filters, as a JSON object or a JSON-encoded string. Every key given is AND-ed with the others and with the admin's user-group scope. See "Combinable filters" below. When `Filters` or `Keyword` is supplied, `RelUserGroupID` and `RelUserCategoryID` are ignored. Added in v6.0.2 |
| Keyword | String | No | Free-text search: a substring match on `FirstName`, `LastName`, `CompanyName`, `EmailAddress` and `Username`, plus an exact `UserID` match when the keyword is all digits. `%` and `_` are matched literally. Combines with `Filters`, `SearchField`/`SearchKeyword` and `LimitUtilizationStatus`. Same matching as `admin.users.search`. Added in v6.0.2 |
| RelUserGroupID | Mixed | No | A user group id, an array of group ids, or one of six pseudo-values that select on something other than the group: `Online`, `Enabled`, `Disabled`, `Trusted`, `Untrusted`, `ActivationPendingSenderDomains`. Ignored when `Filters` or `Keyword` is supplied. See the note below |
| RelUserCategoryID | Integer | No | User category ID (-1 for uncategorized). Ignored when `Filters` or `Keyword` is supplied |
| SearchField | String | No | Column to search in: `UserID`, `EmailAddress`, `Username`, `FirstName`, `LastName`, `CompanyName` or `SSOID`, matched without regard to case. Any other value answers `ErrorCode 4`. Changed in v6.0.2 |
| SearchKeyword | String | No | Substring searched for in `SearchField` |
| ReturnStats | Boolean | No | Set to true to include statistics |
| IncludeLimitUtilization | Boolean | No | Set to true to include limit utilization data, computed live for every row |
| IncludeLimitUtilizationStatus | Boolean | No | Set to `true` to add `LimitUtilizationStatus` to every row: `ok`, `warning`, `exceeded`, or `unknown` when the `user_limit_utilization` cron has not classified the user yet. Read from the cron's cached result, never recomputed, so it is cheap on every page. Added in v6.0.2 |
| LimitUtilizationStatus | String | No | `OK`, `Warning` or `Exceeded`: only users whose cached limit-utilization status is that bucket. Combines with every other filter. The buckets are written by the `user_limit_utilization` cron; until it has run the call answers `ErrorCode 2` rather than an empty list. |

::: tip Combinable filters (v6.0.2)
`Filters` takes these keys. Key names are matched without regard to case, so `GroupIDs` and `groupids` are the same key.

| Key | Value | Selects |
|-----|-------|---------|
| `GroupIDs` | Non-empty array of positive group ids | Users in any of those groups |
| `AccountStatus` | `Enabled` or `Disabled` | Users with that account status |
| `ReputationLevel` | `Trusted` or `Untrusted` | Users with that reputation level |
| `CategoryID` | Positive category id, or `-1` | Users in that category, or uncategorized users |
| `Online` | `true` or `false` | `true`: users active in the last 600 seconds. `false` is the same as leaving the key out |
| `BlockedSenderDomains` | `true` or `false` | `true`: users owning at least one sender domain with status `Blocked`. Each user is listed once however many blocked domains it has. `false` is the same as leaving the key out |
| `LimitUtilizationStatus` | `OK`, `Warning` or `Exceeded` | Same as the top-level parameter of that name, and the same error codes |

All keys given are AND-ed, so `{"GroupIDs": [5], "AccountStatus": "Disabled", "CategoryID": 3}` lists disabled users of group 5 in category 3. `TotalUsers` is the true number of matching users. For an admin account limited to specific user groups the result is further limited to those groups, so a group outside its reach returns an empty list, not an error. Unlike `RelUserGroupID: "ActivationPendingSenderDomains"`, `BlockedSenderDomains` is available to such an admin.

An unknown key, an invalid value or malformed JSON answers `ErrorCode 3` with an `ErrorText` naming the problem. Without `Filters` and `Keyword`, every existing parameter combination returns the same response as before.
:::

::: warning Sorting parameters are allow-listed (changed in v6.0.2)
Each pipe-separated segment of `OrderField` must be one of the columns listed in the table, and each segment of `OrderType` must be `ASC` or `DESC`. Any other value, including a column that exists but is not listed and a value with backticks, quotes, spaces or other characters, is **silently discarded**: the pair is reset together and ordering falls back to `UserID ASC`. The response is still `Success: true` with no error code. Before v6.0.2 an identifier-shaped name that is not on the list reached the query: an existing column was used for sorting, and an unknown one answered a database error.
:::

::: warning RelUserGroupID pseudo-values are exact, case-sensitive strings
`users.get` recognises six string values in `RelUserGroupID` that are not group ids:

| Value | Selects |
|-------|---------|
| `Online` | Users whose `LastActivityDateTime` is within the last 600 seconds |
| `Enabled`, `Disabled` | Users whose `AccountStatus` is that value |
| `Trusted`, `Untrusted` | Users whose `ReputationLevel` is that value |
| `ActivationPendingSenderDomains` | Users owning at least one sender domain whose status is `Blocked` (awaiting admin activation) |

The comparison is a strict string match. `online`, `ENABLED` or any other spelling is not recognised: it is treated as a numeric group id, compares equal to no group and returns an empty `Users` list with `TotalUsers: 0` and `Success: true`. There is no error code for a misspelt pseudo-value. Numeric ids keep working as before, and an array of ids selects users in any of those groups.
:::

::: tip Limit-utilization filter and blocked-domain totals (v5.9.6)
- `LimitUtilizationStatus` intersects the request with the cron's status bucket in SQL, so a client no
  longer has to page through every user and filter on `LimitUtilization` itself. An unknown value
  answers `ErrorCode 1`; a bucket the cron has not written yet answers `ErrorCode 2`. Both are new codes
  and only reachable when the parameter is supplied; calls without it are unchanged.
- `RelUserGroupID: "ActivationPendingSenderDomains"` now reports the true number of matching users in
  `TotalUsers`. It used to report the number of rows on the requested page, so pagination past page 1
  was wrong.
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

```bash [Example Request (filters and keyword)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.get",
    "AdminAPIKey": "your-admin-api-key",
    "Filters": {"GroupIDs": [5], "AccountStatus": "Disabled"},
    "Keyword": "acme",
    "IncludeLimitUtilizationStatus": true,
    "OrderField": "LastActivityDateTime",
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
1: LimitUtilizationStatus (top-level or in Filters) is not OK, Warning or Exceeded
2: The limit-utilization status buckets are not available yet (the cron has not run)
3: Filters is not a JSON object, has an unknown key or an invalid value (v6.0.2)
4: SearchField is not one of the allowed columns (v6.0.2)
5003: The ActivationPendingSenderDomains pseudo-value is not available to an admin limited to specific user groups
```

:::

## Search Users (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.users.search`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Users` privilege)
- v1 REST alias: `POST /api/v1/admin.users.search`. Legacy access via `/api.php` is also supported
- Cross-tenant by design. A restricted sub-admin (`AccessLimited` with `AccessAllowedUserGroupIDs`) only sees users in its allowed user groups.
:::

The admin global search box as a command. `Keyword` is matched against `FirstName`, `LastName`, `CompanyName`, `EmailAddress` and `Username` (contains, case-insensitive per the column collation; `%` and `_` in the keyword are matched literally) and, when the keyword is a number, against the exact `UserID`. `users.get` searches one nominated field; this searches all of them at once. Each row carries the same user fields `users.get` returns, so `Password`, `AuthToken`, the 2FA secrets and API keys are never returned. **Changed in v6.0.1:** the fields are an allow-list rather than a list of removed credential columns, so a column added to the users table in a later release is not returned until it is added to the response deliberately. The fields returned today are unchanged.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.users.search` |
| AdminAPIKey | String | Yes | Admin API key |
| Keyword | String | Yes | Search text. Must not be empty after trimming |
| RecordsFrom | Integer | No | Offset, default `0` |
| RecordsPerRequest | Integer | No | Page size, default `25`, maximum `500`; anything below `1` falls back to `25` |
| OrderField | String | No | One of `UserID` (default), `Username`, `EmailAddress`, `FirstName`, `LastName`, `CompanyName`, `UserSince`, `LastActivityDateTime`, `AccountStatus`, `ReputationLevel`, `RelUserGroupID`, `RelUserCategoryID`. Anything else falls back to `UserID` |
| OrderType | String | No | `ASC` (default) or `DESC` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.users.search",
    "AdminAPIKey": "your-admin-api-key",
    "Keyword": "acme",
    "RecordsPerRequest": 25,
    "OrderField": "LastActivityDateTime",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Users": [
    {
      "UserID": "42",
      "RelUserGroupID": "3",
      "EmailAddress": "owner@acme.example",
      "Username": "acme",
      "FirstName": "Ada",
      "LastName": "Lovelace",
      "CompanyName": "Acme",
      "AccountStatus": "Enabled",
      "LastActivityDateTime": "2026-09-04 10:15:00"
    }
  ],
  "TotalUsers": 1,
  "RecordsFrom": 0,
  "RecordsPerRequest": 25
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Keyword is required"
}
```

```txt [Error Codes]
1: Keyword is missing or empty
```

:::

## Delete Users

<Badge type="info" text="POST" /> `/api/v1/users.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/users.delete`. Legacy access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api/v1/usergroup.create`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/usergroup.create`. Legacy access via `/api.php` is also supported
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin cannot create or duplicate a user group, because the new group would be outside its allowed list. The call answers `ErrorCode 5003` and no group is created. The master admin API key and admins without user group limits are unaffected.
- A successful call fires the `UserGroup.Create.Post` plugin action with the new group and the API request parameters (lowercased keys, credentials removed). Added in v6.0.2.
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
| Options | Object \| String | No | Object of user group option keys and values, or a JSON string of one when the request is form-encoded. The two shapes `usergroup.update` and `usergroup.patch` accept. Anything else is `ErrorCode 28`. Omitting the parameter is unchanged. `/api.php` lowercases nested keys, and `EmailGatewayApplyHeaderFooter` is stored under that canonical spelling; every other key is stored as sent. Changed in v5.9.6 |
| SubscriptionPlan | String | No | Subscription plan identifier for the group. |
| AgentAccess | String | No | Widest scope any AI agent key of the group's users may use. Possible values: `none`, `read`, `write`, `send`. Omit to keep the stored value (default `read` on create). See [AI agent keys](#ai-agent-keys). Added in v6.0.2 |
| AgentMaxSendsPerDay | Integer | No | Sends per UTC day for each AI agent key of the group, `0` for no limit. Added in v6.0.2 |
| AgentMaxRecipientsPerSend | Integer | No | Recipients one AI agent send may reach, `0` for no limit. Added in v6.0.2 |
| AgentConfirmAbove | Integer | No | An AI agent send to more recipients than this needs a confirm token, `0` for no group-level confirm step. Added in v6.0.2 |
| AgentMaxSmsPerDay | Integer | No | SMS recipients per UTC day for each AI agent key of the group, `0` for no limit. Added in v6.0.5 |
| AgentMaxSmsRecipientsPerSend | Integer | No | SMS recipients one send of an AI agent key may reach, `0` for no limit. Added in v6.0.5 |
| AgentSmsConfirmAbove | Integer | No | An agent key's SMS send to more recipients than this needs a confirm token, `0` for no group-level confirm step. Added in v6.0.5 |
| ScreeningSignupThreshold | Integer | No | Signup screening score (0 to 100) at or above which a new account is flagged or held, `0` turns signup screening off. Omit to keep the stored value (default `50`). Added in v6.0.2 |
| ScreeningSignupMode | String | No | Possible values: `off` (no signup is screened), `flag` (default, record only), `hold` (an account that took the default reputation stays `Untrusted`). Added in v6.0.2 |
| ScreeningImportThreshold | Integer | No | List import screening threshold (0 to 100), `0` turns it off. Default `50`. Added in v6.0.2 |
| ScreeningImportMode | String | No | Possible values: `off` (no import is screened), `flag` (default), `hold` (campaigns to the list need approval until the operator releases the import). Added in v6.0.2 |
| ScreeningContentThreshold | Integer | No | Campaign content screening threshold (0 to 100), `0` turns it off. Default `50`. Added in v6.0.2 |
| ScreeningContentMode | String | No | Possible values: `off` (default, no campaign is screened and SpamAssassin never runs), `flag` (record only), `hold` (the campaign goes to Pending Approval, and an email a sending campaign uses cannot be edited). Content screening stays off until you set `flag` or `hold`. An unknown value is stored as the default. See [Sender Screening](/v6.0.5/api-reference/admin#sender-screening). Added in v6.0.2 |
| LimitTeamMembers | Integer | No | Team member seats per account of the group: members of every status plus pending invitations, a whole number from `0` to `2147483647`. `0` (the default) turns team members off for the group: invitations are refused and every member session of its accounts ends on its next request. A limit lower than the seats in use removes no one, it only blocks new invitations until enough seats are free. When billing is enabled, a plan's team seats come from the user group the plan places the account in: set `LimitTeamMembers` on that group. Omit to keep the stored value. Added in v6.0.5 |
| RequireMemberTwoFactor | String | No | `Yes` requires two-factor authentication from every team member of the group's accounts: a member without it is signed out on its next request and must enrol before opening the account again. `No` (the default) leaves it to each person. The account owner's own sign-in is not affected. Omit to keep the stored value. Added in v6.0.5 |

::: warning Options (v5.9.6)
Before v5.9.6 this command JSON-encoded whatever it was handed, unconditionally. A JSON string was therefore **double-encoded**: the column ended up holding a JSON *string* instead of an object, so nothing could read the options back. It now accepts an object or a JSON string of one and refuses anything else with `ErrorCode 28`, matching `usergroup.patch`.

Keys sent as a nested object (`Options[UserAreaLogoutURL]=...` or a JSON request body) arrive lowercased, because `/api.php` lowercases every nested request key. Known option keys are now remapped onto their canonical spelling before storage, so they land under the names the product actually reads. Keys outside the known set, such as a plugin's own, are stored exactly as they arrive.
:::

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
28: Options is not an object and not a JSON string of one
34: Another user group is already the default for this subscription plan (see
    ConflictingUserGroupID). Also returned when a concurrent request made another
    group the plan's default first (changed in v6.0.2)
38: LimitTeamMembers is not a whole number from 0 to 2147483647 (ErrorField limitteammembers)
39: RequireMemberTwoFactor is not Yes or No (ErrorField requiremembertwofactor)
40: LimitTeamMembers or RequireMemberTwoFactor was sent before the database migrations of this version have run
5003: An admin limited to some user groups cannot create user groups
```

:::

## Update User Group

<Badge type="info" text="POST" /> `/api/v1/usergroup.update`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/usergroup.update`. Legacy access via `/api.php` is also supported
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin can only name a group in its allowed list. Any other `UserGroupID`, including one that does not exist, answers `ErrorCode 5003` and nothing is read or written. The master admin API key and admins without user group limits are unaffected.
- `LimitTeamMembers` and `RequireMemberTwoFactor` are written only when sent, so an existing caller that does not know them keeps the stored values. Added in v6.0.5.
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
| Options | Object \| String | No | Per-group options (e.g. `TargetDeliveryServerID_Marketing`, `EmailGatewayDNSTemplate`, `DefaultSenderDomain`, `EnableSenderInfo`, `EmailGatewayApplyHeaderFooter`), as an object, which the endpoint JSON-encodes, or as a JSON string that decodes to an object or array, which is stored as sent. Any other value, and a string that does not decode, keeps the existing row's value without an error. Omit to keep the existing row's value. `/api.php` lowercases the keys of an object. <Badge type="warning" text="Changed in v6.0.1" /> `EmailGatewayApplyHeaderFooter` is stored under that canonical spelling whatever its case in the request, in both shapes, so the admin interface reads it. Every other key is stored as received. |
| SubscriptionPlan | String | No | Subscription plan identifier for the group. Omit to keep the existing row's value. |
| SendMethod | String | No | Group send method. Possible values: `System`, `SMTP`, `LocalMTA`, `PHPMail`, `PowerMTA`, `SaveToDisk`. Any value other than `System` sends a test email with the given settings before saving |
| SendMethodSMTPUsername | String | No | SMTP username for the `SMTP` send method. **Changed in v6.0.1:** omit it to keep the stored username. A sent value, including an empty string, replaces it |
| SendMethodSMTPPassword | String | No | SMTP password for the `SMTP` send method. **Changed in v6.0.1:** omit it to keep the stored password. A sent value, including an empty string, replaces it |
| AgentAccess | String | No | Widest scope any AI agent key of the group's users may use. Possible values: `none`, `read`, `write`, `send`. Omit to keep the stored value (default `read` on create). See [AI agent keys](#ai-agent-keys). Added in v6.0.2 |
| AgentMaxSendsPerDay | Integer | No | Sends per UTC day for each AI agent key of the group, `0` for no limit. Added in v6.0.2 |
| AgentMaxRecipientsPerSend | Integer | No | Recipients one AI agent send may reach, `0` for no limit. Added in v6.0.2 |
| AgentConfirmAbove | Integer | No | An AI agent send to more recipients than this needs a confirm token, `0` for no group-level confirm step. Added in v6.0.2 |
| AgentMaxSmsPerDay | Integer | No | SMS recipients per UTC day for each AI agent key of the group, `0` for no limit. Added in v6.0.5 |
| AgentMaxSmsRecipientsPerSend | Integer | No | SMS recipients one send of an AI agent key may reach, `0` for no limit. Added in v6.0.5 |
| AgentSmsConfirmAbove | Integer | No | An agent key's SMS send to more recipients than this needs a confirm token, `0` for no group-level confirm step. Added in v6.0.5 |
| ScreeningSignupThreshold | Integer | No | Signup screening score (0 to 100) at or above which a new account is flagged or held, `0` turns signup screening off. Omit to keep the stored value (default `50`). Added in v6.0.2 |
| ScreeningSignupMode | String | No | Possible values: `off` (no signup is screened), `flag` (default, record only), `hold` (an account that took the default reputation stays `Untrusted`). Added in v6.0.2 |
| ScreeningImportThreshold | Integer | No | List import screening threshold (0 to 100), `0` turns it off. Default `50`. Added in v6.0.2 |
| ScreeningImportMode | String | No | Possible values: `off` (no import is screened), `flag` (default), `hold` (campaigns to the list need approval until the operator releases the import). Added in v6.0.2 |
| ScreeningContentThreshold | Integer | No | Campaign content screening threshold (0 to 100), `0` turns it off. Default `50`. Added in v6.0.2 |
| ScreeningContentMode | String | No | Possible values: `off` (default, no campaign is screened and SpamAssassin never runs), `flag` (record only), `hold` (the campaign goes to Pending Approval, and an email a sending campaign uses cannot be edited). Content screening stays off until you set `flag` or `hold`. An unknown value is stored as the default. See [Sender Screening](/v6.0.5/api-reference/admin#sender-screening). Added in v6.0.2 |
| LimitTeamMembers | Integer | No | Team member seats per account of the group: members of every status plus pending invitations, a whole number from `0` to `2147483647`. `0` (the default) turns team members off for the group: invitations are refused and every member session of its accounts ends on its next request. A limit lower than the seats in use removes no one, it only blocks new invitations until enough seats are free. When billing is enabled, a plan's team seats come from the user group the plan places the account in: set `LimitTeamMembers` on that group. Omit to keep the stored value. Added in v6.0.5 |
| RequireMemberTwoFactor | String | No | `Yes` requires two-factor authentication from every team member of the group's accounts: a member without it is signed out on its next request and must enrol before opening the account again. `No` (the default) leaves it to each person. The account owner's own sign-in is not affected. Omit to keep the stored value. Added in v6.0.5 |

::: warning One default group per plan (v6.0.2)
This command cannot set `SubscriptionPlanIsDefault`, but it can move a group that is a plan's default onto another plan. When that plan already has a default, the update is refused with `ErrorCode 34`, the same answer `usergroup.create` and `usergroup.patch` give, and nothing is written. Before v6.0.2 the update succeeded and left the plan with two default groups. A parameter sent as an array or object, where a single value is expected, is refused with `ErrorCode 36` and `ErrorField` naming it.
:::

::: tip Stored SMTP credentials are kept when omitted (v6.0.1)
`usergroup.get` and `usergroups.get` no longer return the group's SMTP username or password, so an integration cannot read them back and resend them. `usergroup.update` therefore keeps the stored `SendMethodSMTPUsername` and `SendMethodSMTPPassword` when the request omits them, and the send-method test email uses the stored values. Before v6.0.1 an omitted value was stored as empty, which broke the group's sending.
:::

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
34: The group is a plan default and SubscriptionPlan names a plan that already has a
    default (see ConflictingUserGroupID). Added in v6.0.2
36: A parameter was sent as an array or object where a single value is expected
    (ErrorField names it). Added in v6.0.2
38: LimitTeamMembers is not a whole number from 0 to 2147483647 (ErrorField limitteammembers)
39: RequireMemberTwoFactor is not Yes or No (ErrorField requiremembertwofactor)
40: LimitTeamMembers or RequireMemberTwoFactor was sent before the database migrations of this version have run
5003: User group is outside the user groups this admin account may access
```

:::

## Patch a User Group

<Badge type="info" text="POST" /> `/api/v1/usergroup.patch`

<Badge type="tip" text="New in v5.9.3" />

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/usergroup.patch`. Legacy access via `/api.php` is also supported
- **Partial update.** Only the fields present in the request body are written. Every other column of the user group is left untouched. It is not included in the `UPDATE` statement at all.
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin can only name a group in its allowed list. Any other `UserGroupID`, including one that does not exist, answers `ErrorCode 5003` and nothing is read or written. The master admin API key and admins without user group limits are unaffected.
:::

### Why this exists alongside `usergroup.update`

`usergroup.update` rebuilds the entire user group row from the request body. Around 30 optional columns are written unconditionally, so any field the caller omits is persisted as an empty string, and `PaymentSystem` / `CreditSystem` are written as `Disabled` whenever their key is absent, silently switching those systems off for every user in the group.

The only safe way to change a single value through `usergroup.update` is to read the whole group back with `usergroup.get` and echo every field, which forces the client to hold and re-transmit `SendMethodSMTPPassword`.

`usergroup.patch` removes that requirement: send `UserGroupID` plus only what you want to change. `usergroup.update` is unchanged and remains fully supported.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.patch`        |
| SessionID | String | No       | Session ID obtained from admin login  |
| APIKey    | String | No       | Admin API key for authentication      |
| UserGroupID | Integer | Yes | The user group to patch. This is the only required field. A request carrying just `UserGroupID` is a valid no-op |
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
| SMTPPasswordRetention | Boolean | No | `true` applies the password retention rule of the admin edit screen when the request carries `SendMethod`, `SendMethodSMTPHost` or `SendMethodSMTPPassword`: a non-blank `SendMethodSMTPPassword` replaces the stored password; a blank or missing one keeps it only while the group stays on `SMTP` with the stored host (compared case-insensitively), and otherwise clears it, so a stored password never follows a changed host or send method. Without it the password is written only when sent, as before. Added in v6.0.2 |
| TestSMTPConnection | Boolean | No | `true` sends a live test email to the calling admin's email address before anything is written, when the group's send method after this patch is `SMTP`. Host, port, security, authentication, username, password and timeout are taken from the request and fall back to the stored values, except the password: the test uses the password the patch will store (the sent `SendMethodSMTPPassword`, or the result of `SMTPPasswordRetention`), and when the patch leaves the stored password in place it is used only while the test goes to the stored SMTP host, whatever `SMTPPasswordRetention` says. A stored password is never sent to another host; with `SendMethodSMTPAuth` `true` and no usable password the test is refused (`ErrorCode 25`) before any connection. A failure answers `ErrorCode 25` with the mailer's reason in `EmailSettingsErrorMessage`, and nothing is written. Ignored for any other send method. Added in v6.0.2 |
| AddPermissions | Array \| String | No | Permissions to add to the stored list, as an array of strings or a comma-separated string. Added in v6.0.2 |
| RemovePermissions | Array \| String | No | Permissions to remove from the stored list. The result is the stored list minus these plus `AddPermissions`, order kept, duplicates dropped, so a permission the request does not name (for example a disabled plugin's `Plugin.<Code>`) is kept. A permission in both lists is kept. Cannot be combined with `Permissions` (`ErrorCode 37`). A delta that changes nothing writes nothing. Added in v6.0.2 |
| Options | Object \| String | No | Group options as an object, or a JSON string that decodes to an object. `/api.php` lowercases nested keys, and `EmailGatewayApplyHeaderFooter` is stored under that canonical spelling; every other key is stored as sent. |
| DefaultRateLimits | Object \| String | No | Rate-limit buckets. Merged over the canonical defaults, so a partial payload cannot drop a bucket |
| CustomEmailHeaders | String | No | Custom email headers |
| SubscriptionPlan | String | No | Subscription plan identifier for the group |
| SubscriptionPlanIsDefault | String | No | `Yes` or `No`. Marks this group as the default group for its `SubscriptionPlan`. Only one group may be the default for a plan, the same rule the admin edit screen enforces. Checked against the plan and flag the group will have after this patch, so moving a group that is already the default onto a plan that has one is refused as well. An empty plan never conflicts. New in v5.9.6 |
| AgentAccess | String | No | Widest scope any AI agent key of the group's users may use. Possible values: `none`, `read`, `write`, `send`. Omit to keep the stored value (default `read` on create). See [AI agent keys](#ai-agent-keys). Added in v6.0.2 |
| AgentMaxSendsPerDay | Integer | No | Sends per UTC day for each AI agent key of the group, `0` for no limit. Added in v6.0.2 |
| AgentMaxRecipientsPerSend | Integer | No | Recipients one AI agent send may reach, `0` for no limit. Added in v6.0.2 |
| AgentConfirmAbove | Integer | No | An AI agent send to more recipients than this needs a confirm token, `0` for no group-level confirm step. Added in v6.0.2 |
| AgentMaxSmsPerDay | Integer | No | SMS recipients per UTC day for each AI agent key of the group, `0` for no limit. Added in v6.0.5 |
| AgentMaxSmsRecipientsPerSend | Integer | No | SMS recipients one send of an AI agent key may reach, `0` for no limit. Added in v6.0.5 |
| AgentSmsConfirmAbove | Integer | No | An agent key's SMS send to more recipients than this needs a confirm token, `0` for no group-level confirm step. Added in v6.0.5 |
| ScreeningSignupThreshold | Integer | No | Signup screening score (0 to 100) at or above which a new account is flagged or held, `0` turns signup screening off. Omit to keep the stored value (default `50`). Added in v6.0.2 |
| ScreeningSignupMode | String | No | Possible values: `off` (no signup is screened), `flag` (default, record only), `hold` (an account that took the default reputation stays `Untrusted`). Added in v6.0.2 |
| ScreeningImportThreshold | Integer | No | List import screening threshold (0 to 100), `0` turns it off. Default `50`. Added in v6.0.2 |
| ScreeningImportMode | String | No | Possible values: `off` (no import is screened), `flag` (default), `hold` (campaigns to the list need approval until the operator releases the import). Added in v6.0.2 |
| ScreeningContentThreshold | Integer | No | Campaign content screening threshold (0 to 100), `0` turns it off. Default `50`. Added in v6.0.2 |
| ScreeningContentMode | String | No | Possible values: `off` (default, no campaign is screened and SpamAssassin never runs), `flag` (record only), `hold` (the campaign goes to Pending Approval, and an email a sending campaign uses cannot be edited). Content screening stays off until you set `flag` or `hold`. An unknown value is stored as the default. See [Sender Screening](/v6.0.5/api-reference/admin#sender-screening). Added in v6.0.2 |
| LimitTeamMembers | Integer | No | Team member seats per account of the group: members of every status plus pending invitations, a whole number from `0` to `2147483647`. `0` (the default) turns team members off for the group: invitations are refused and every member session of its accounts ends on its next request. A limit lower than the seats in use removes no one, it only blocks new invitations until enough seats are free. When billing is enabled, a plan's team seats come from the user group the plan places the account in: set `LimitTeamMembers` on that group. Omit to keep the stored value. Added in v6.0.5 |
| RequireMemberTwoFactor | String | No | `Yes` requires two-factor authentication from every team member of the group's accounts: a member without it is signed out on its next request and must enrol before opening the account again. `No` (the default) leaves it to each person. The account owner's own sign-in is not affected. Omit to keep the stored value. Added in v6.0.5 |

Parameter names are matched case-insensitively, as everywhere on `/api.php`.

**Not patchable:** `LimitCampaignSendPeriod`, `LimitEmailSendPeriod`, `PaymentAutoRespondersChargePeriod`, `PaymentDesignPrevChargePeriod` and `PaymentSystemChargePeriod` are fixed to `Monthly` by the product. `PaymentCreditSystem`, `PaymentCreditPricing`, `SendMethodSMTPDebug`, `SendMethodSMTPKeepAlive` and `SendMethodSMTPMsgConn` are not settable through any user group API command.

::: tip SubscriptionPlanIsDefault (v5.9.6)
`usergroup.patch` now accepts `SubscriptionPlanIsDefault`. Before v5.9.6 the key was silently ignored (`Success: true`, not listed in `UpdatedFields`). Sending it now either writes the column or answers `ErrorCode 33` (value other than `Yes`/`No`) or `ErrorCode 34` (another group is already the default for that plan; the response carries `ConflictingUserGroupID` and an `ErrorText` naming the group). Payloads that do not carry the key behave exactly as before. `usergroup.update` still cannot set this column.
:::

::: tip Clearing a value
An empty string is a supplied value: sending `"XMailer": ""` clears the field. A field sent as `null` is treated as absent and is never written, because these columns are `NOT NULL`. Integer fields reject an empty string rather than storing it (see error code 32).
:::

::: warning Send-method settings are connectivity-tested only on request
`usergroup.update` sends a live test email whenever `SendMethod` is not `System`. `usergroup.patch` validates the format of every send-method field it is given, and sends the test email only when `TestSMTPConnection` is `true` and the group sends through `SMTP` after the patch (new in v6.0.2). Other send methods are never tested by `usergroup.patch`; use `usergroup.update`, the admin interface, or `settings.emailsendingtest` for them.
:::

::: tip Plugin hook (v6.0.2)
A patch that writes at least one column fires the `UserGroup.Update.Post` plugin action with two arguments: the group as stored before the write, and the API request parameters with lowercased keys, without credentials (`AdminAPIKey`, `APIKey`, `SessionID`, `Username`, `Password`, `Disable2FA`, `Disable2FAToken`, `SendMethodSMTPPassword` are removed). A no-op patch fires nothing.
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

```bash [Example Request (SMTP change with test)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.patch",
    "AdminAPIKey": "your-admin-api-key",
    "UserGroupID": 3,
    "SendMethod": "SMTP",
    "SendMethodSMTPHost": "smtp.example.com",
    "SendMethodSMTPPort": 587,
    "SMTPPasswordRetention": true,
    "TestSMTPConnection": true,
    "AddPermissions": ["Media.Upload"],
    "RemovePermissions": ["Lists.Get"]
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

```json [Success Response (no-op)]
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
23: Invalid SendMethodSMTPSecure: must be 'ssl', 'tls' or ''
24: Invalid SendMethodSMTPAuth: must be 'true' or 'false'
25: TestSMTPConnection: the test email could not be sent; the reason is in
    EmailSettingsErrorMessage. Nothing is written (added in v6.0.2)
26: Invalid Enabled/Disabled value; the offending field is returned in ErrorField
27: Invalid TrialGroup value: must be 'Yes' or 'No' (or the 'Enabled'/'Disabled' aliases)
28: Invalid Options payload: must be an object, or a JSON string decoding to one
29: Invalid DefaultRateLimits payload: must be an object, or a JSON string decoding to one
30: Invalid Permissions, AddPermissions or RemovePermissions payload: must be a
    comma-separated string, or an array whose every element is a string. The offending
    field is returned in ErrorField
31: Non-scalar value supplied for a scalar field; the offending field is returned in
    ErrorField
32: Invalid integer value; the offending field is returned in ErrorField. The value must
    be a base-10 integer within the signed 32-bit column range (-2147483648..2147483647).
    Floats ('1.5'), scientific notation ('1e3') and hexadecimal ('0x1A') are rejected
    rather than silently coerced by MySQL: '0x1A' would otherwise store 0, which on a
    Limit* column means unlimited. Negative values are accepted: -1 is an established
    "unlimited" sentinel.
33: SubscriptionPlanIsDefault must be Yes or No
34: Another user group is already the default for this subscription plan (see
    ConflictingUserGroupID). Also returned when a concurrent request made another
    group the plan's default first (changed in v6.0.2)
37: AddPermissions or RemovePermissions sent together with Permissions (added in v6.0.2)
38: LimitTeamMembers is not a whole number from 0 to 2147483647 (ErrorField limitteammembers)
39: RequireMemberTwoFactor is not Yes or No (ErrorField requiremembertwofactor)
40: LimitTeamMembers or RequireMemberTwoFactor was sent before the database migrations of this version have run
5003: User group is outside the user groups this admin account may access
```

:::

::: warning Enabled/Disabled values are validated, not coerced
`usergroup.update` turns any value that is not exactly `Enabled` into `Disabled`, including a missing key. `usergroup.patch` rejects an unrecognised value with `ErrorCode: 26` and writes nothing for an absent key, so a system can be turned both on and off explicitly and can never be disabled by accident.
:::

## Patch User Group Options

<Badge type="info" text="POST" /> `/api/v1/usergroup.options.patch`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `UserGroups` privilege)
- v1 REST alias: `POST /api/v1/usergroup.options.patch`. Legacy access via `/api.php` is also supported
- **Merge semantics.** Only the keys present in `Options` are written into the group's stored Options JSON. Every other key, including keys written by plugins, is preserved verbatim. The whole-blob `Options` parameter of `usergroup.update` / `usergroup.patch` is unchanged and still replaces the entire JSON.
- **An unreadable stored blob is refused, not overwritten.** If the group's stored `Options` column is not empty and does not decode to a JSON array or object, the command answers `ErrorCode 8` and writes nothing, rather than merging into an empty set and thereby discarding whatever was stored. An empty column, and the literal `null` that `usergroup.create` writes when it is given no `Options` at all, both mean "no options yet" and patch normally.
- A call that writes at least one option fires the `UserGroup.Update.Post` plugin action with the group as stored before the write and the API request parameters (lowercased keys, credentials removed). Added in v6.0.2.
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin can only name a group in its allowed list. Any other `UserGroupID`, including one that does not exist, answers `ErrorCode 5003` and nothing is read or written. The master admin API key and admins without user group limits are unaffected.
:::

`usergroup.update` and `usergroup.patch` take `Options` as an opaque replace, so changing one key meant reading the group, decoding, mutating and re-encoding, with no validation. This command validates every key and value the way the admin user group screen does, and stores values in the same shape the screen stores them, so a group edited through either path reads identically to the sending engine.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `usergroup.options.patch` |
| AdminAPIKey | String | Yes | Admin API key |
| UserGroupID | Integer | Yes | The user group to patch |
| Options | Object \| String | Yes | Object of option keys and values, or a JSON string of one when the request is form-encoded. An empty object is a valid no-op. Keys are matched case-insensitively and stored under their canonical spelling |

**Option keys and accepted values:**

| Key | Accepted input | Stored as |
|---|---|---|
| TargetDeliveryServerID_Marketing, TargetDeliveryServerID_Transactional, TargetDeliveryServerID_AutoResponder | Delivery server ID, or `0` for the system default. The server must exist | Digit string, as the screen's `<select>` posts it |
| ShowEmailThroughput, PreventEmailCampaignCreateIfSpamAssassinScoreIsNotZero, SimplifiedCampaignCreateUI, SenderDomainManagement, EnableSenderInfo, ForcedSenderInfo, DefaultSenderDomainActivate, EmailGatewayApplyHeaderFooter | `Enabled` / `Disabled` (also `true` / `false`) | `"Enabled"` when on, boolean `false` when off. This is what the screen stores for a ticked or unticked checkbox, and `DefaultSenderDomainActivate` is read by truthiness, so `Disabled` is never stored |
| DisableSESPlugins, EmailGatewayNewDomainManualApproval | `Enabled` / `Disabled` | `"Enabled"` / `"Disabled"` |
| DisableListUnsubscribeHeader | `true` / `false` | Boolean |
| DefaultSenderDomain, UserAreaLogoutURL | String | String (trimmed) |
| DefaultSenderDomainMonthlyLimit | Non-negative integer | Integer |
| EmailGatewayDNSTemplate, EmailCampaignDNSTemplate | A template name from `EMAILGATEWAY_DNS_TEMPLATES` / `EMAILCAMPAIGN_DNS_TEMPLATES` (case-sensitive; `Default` always exists) | String |

Any key outside this list is refused with `ErrorCode 4`; the response lists the offending keys in `UnknownKeys` under the spelling the request used. Note that `/api.php` lowercases nested request keys, so a key sent inside a JSON request body is reported lowercase, while a key sent inside a form-encoded `Options` JSON string keeps its original case.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.options.patch",
    "AdminAPIKey": "your-admin-api-key",
    "UserGroupID": 5,
    "Options": {
      "SenderDomainManagement": "Enabled",
      "EmailGatewayDNSTemplate": "Default",
      "DefaultSenderDomainMonthlyLimit": 5000
    }
  }'
```

```json [Success Response]
{
  "Success": true,
  "UserGroupID": 5,
  "UpdatedOptions": ["SenderDomainManagement", "EmailGatewayDNSTemplate", "DefaultSenderDomainMonthlyLimit"],
  "Options": {
    "TargetDeliveryServerID_Marketing": "0",
    "SenderDomainManagement": "Enabled",
    "EmailGatewayDNSTemplate": "Default",
    "DefaultSenderDomainMonthlyLimit": 5000,
    "UserAreaLogoutURL": "https://example.com/logged-out"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Unknown option key(s): bogus. Known keys: TargetDeliveryServerID_Marketing, ...",
  "UnknownKeys": ["bogus"]
}
```

```txt [Error Codes]
1: UserGroupID is missing
2: User group not found
3: Options is missing, is not an object (or a JSON string of one), or is a non-empty JSON
   list (integer keys). An empty array or object is a valid no-op patch
4: Unknown option key(s); see UnknownKeys
5: Invalid value for a key; ErrorField names the key and ErrorText says what is accepted
6: Unknown DNS template name; ErrorText lists the valid names
7: TargetDeliveryServerID_* refers to a delivery server that does not exist
8: The group's stored Options column is unreadable (non-empty but not a JSON array or
   object); GroupName names the group and nothing is written
5003: User group is outside the user groups this admin account may access
```

:::

## Get User Group

<Badge type="info" text="GET" /> `/api/v1/usergroup.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/usergroup.get`. Legacy access via `/api.php` is also supported
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin can only name a group in its allowed list. Any other `UserGroupID`, including one that does not exist, answers `ErrorCode 5003` and nothing is read or written. The master admin API key and admins without user group limits are unaffected.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to retrieve |
| IncludeSMTPUsername | Boolean | No | `true` adds `SendMethodSMTPUsername` to the `UserGroup` object. Any other value, or leaving it out, returns the group without it, as before. The SMTP password is never returned; `HasSendMethodSMTPPassword` reports whether one is stored. An admin agent key (`oak_`) cannot pass this parameter. Added in v6.0.2 |

::: warning Credentials are not returned (changed in v6.0.1)
`usergroup.get` no longer returns `SendMethodSMTPUsername` or `SendMethodSMTPPassword`. The group carries `HasSendMethodSMTPPassword` instead, which is `true` when a password is stored. Credential keys nested inside `Options` and `ThemeInformation` (for example `Password`, `APIKey`, `SendMethodSMTPPassword` or `smtp_password`) are removed at any depth, matched case-insensitively. When `Options` holds such a key, it is returned re-encoded without it, so its bytes can differ from the stored value. An `Options` value with no such key is returned byte for byte as stored.

The group fields are an allow-list: every other existing field is returned as before, and a column added to the user groups table in a later release is not returned until it is added to the response deliberately. To change the stored credentials, use `usergroup.update`, which keeps them when they are omitted.
:::

::: tip New fields (v6.0.2)
The `UserGroup` object now also carries the AI agent policy (`AgentAccess`, `AgentMaxSendsPerDay`, `AgentMaxRecipientsPerSend`, `AgentConfirmAbove`, and since v6.0.5 `AgentMaxSmsPerDay`, `AgentMaxSmsRecipientsPerSend`, `AgentSmsConfirmAbove`) and the sender screening policy (`ScreeningSignupThreshold`, `ScreeningSignupMode`, `ScreeningImportThreshold`, `ScreeningImportMode`, `ScreeningContentThreshold`, `ScreeningContentMode`) that `usergroup.create` and `usergroup.patch` write. Every other field is unchanged. `usergroups.get` returns the same ten fields for each group, and never the SMTP username.
:::

::: tip New fields (v6.0.5)
The `UserGroup` object also carries `LimitTeamMembers` (integer as a string, `"0"` when team members are off) and `RequireMemberTwoFactor` (`Yes` or `No`), the team member settings `usergroup.create`, `usergroup.update` and `usergroup.patch` write. `usergroups.get` returns the same two fields for each group. They are present once the database migrations of v6.0.5 have run. Every other field is unchanged.
:::

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
    "LimitLists": 50,
    "SendMethod": "SMTP",
    "SendMethodSMTPHost": "smtp.example.com",
    "SendMethodSMTPPort": "587",
    "HasSendMethodSMTPPassword": true
  }
}
```

```json [Success Response (IncludeSMTPUsername)]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroup": {
    "UserGroupID": 5,
    "GroupName": "Premium Users",
    "SendMethod": "SMTP",
    "SendMethodSMTPHost": "smtp.example.com",
    "HasSendMethodSMTPPassword": true,
    "AgentAccess": "read",
    "ScreeningSignupMode": "flag",
    "SendMethodSMTPUsername": "relay-user"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```json [Sub-admin Refusal]
{
  "Success": false,
  "ErrorCode": 5003,
  "ErrorText": "User group is outside the user groups this admin account may access"
}
```

```txt [Error Codes]
0: Success
1: Missing UserGroupID parameter
2: User group not found
5003: User group is outside the user groups this admin account may access
```

:::

## Delete User Group

<Badge type="info" text="POST" /> `/api/v1/usergroup.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/usergroup.delete`. Legacy access via `/api.php` is also supported
- Note: Not available in demo mode
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin cannot delete user groups, even groups in its allowed list. The call answers `ErrorCode 5003` before any group is touched. The master admin API key and admins without user group limits are unaffected.
- Destination group (added in v6.0.2): send `TargetUserGroupID` to choose where the users of the deleted groups go. Without it the call behaves as before and moves them to the signup group (`USER_SIGNUP_GROUPID`).
- Users move before the group is deleted (changed in v6.0.2): the `Delete.UserGroup` and `UserGroup.Delete.Post` plugin hooks now fire after the group's users have moved, so a listener never sees an account in a group that no longer exists.
:::

::: tip The group's own theme is deleted too (v6.0.2)
Every group has its own theme copy (`usergroup.duplicate` and the admin group screen create one). Deleting a group now deletes that theme as well, unless another group still uses it or it is the system default theme. Before v6.0.2 the theme stayed behind. Run `./cli/octeth.sh users:orphans` to list themes that earlier deletes left behind, and add `--delete --yes` to remove them.
:::

::: tip Choosing where the users go (v6.0.2)
With `TargetUserGroupID`, every listed group is checked before anything changes. The call refuses, deletes nothing and answers `ErrorCode 7` with `RefusedUserGroups` when a listed group does not exist, is the signup group (`USER_SIGNUP_GROUPID`) or is one of the groups a signup can choose (`USER_SIGNUP_GROUPIDS`). Each entry names the group and the reason. Otherwise each group's users move to the target group, the group is deleted, and `MovedUsers` reports how many users each group had.

Without `TargetUserGroupID`, the signup group is still skipped silently and groups listed in `USER_SIGNUP_GROUPIDS` can still be deleted. When `USER_SIGNUP_GROUPID` does not name an existing group (for example `-1`, "let the user choose"), a group that still has users is now skipped as well, instead of moving its users to a group that does not exist.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | String | Yes | Comma-separated list of user group IDs to delete |
| TargetUserGroupID | Integer | No | User group that receives the users of the deleted groups. Must exist, must not be one of the groups being deleted, and must be within the admin's reach. When sent, refused groups are reported instead of skipped (see the tip above) |

**Response Fields (`TargetUserGroupID` only):**

| Field | Type | Description |
|---|---|---|
| TargetUserGroupID | Integer | The group that received the users |
| DeletedUserGroupIDs | Array of integers | Deleted groups, in request order |
| MovedUsers | Array of objects | `{UserGroupID, Users}` per deleted group, `Users` is the number of accounts moved |
| RefusedUserGroups | Array of objects | With `ErrorCode 7`: `{UserGroupID, Reason}` per refused group |
| FailedUserGroupID | Integer | With `ErrorCode 8`: the group whose users could not be moved |

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

```bash [Example Request with a target group]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.delete",
    "SessionID": "your-session-id",
    "UserGroupID": "5,6",
    "TargetUserGroupID": 3
  }'
```

```json [Success Response with a target group]
{
  "Success": true,
  "ErrorCode": 0,
  "TargetUserGroupID": 3,
  "DeletedUserGroupIDs": [5, 6],
  "MovedUsers": [
    { "UserGroupID": 5, "Users": 12 },
    { "UserGroupID": 6, "Users": 0 }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```json [Refused Groups Response]
{
  "Success": false,
  "ErrorCode": 7,
  "ErrorText": "One or more user groups cannot be deleted, nothing was deleted",
  "RefusedUserGroups": [
    { "UserGroupID": 2, "Reason": "New signups are created in this user group" },
    { "UserGroupID": 4, "Reason": "New signups can choose this user group" },
    { "UserGroupID": 99, "Reason": "This user group does not exist" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing UserGroupID parameter
4: Cannot delete the last user group
5: Target user group not found (TargetUserGroupID only)
6: Target user group is one of the user groups being deleted (TargetUserGroupID only)
7: One or more user groups cannot be deleted, nothing was deleted; see RefusedUserGroups (TargetUserGroupID only)
8: The users of a user group could not be moved; that group and the ones after it were not deleted, DeletedUserGroupIDs lists the ones that were (TargetUserGroupID only)
9: Another user group delete is in progress, try again (TargetUserGroupID only; deletes run one at a time and a call waits up to 30 seconds first)
5003: An admin limited to some user groups cannot delete user groups, or the target user group is outside the user groups this admin account may access
```

:::

## Duplicate User Group

<Badge type="info" text="POST" /> `/api/v1/usergroup.duplicate`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/usergroup.duplicate`. Legacy access via `/api.php` is also supported
- Sub-admins limited to some user groups (changed in v6.0.2): a restricted sub-admin cannot create or duplicate a user group, because the new group would be outside its allowed list. The call answers `ErrorCode 5003` and no group is created. The master admin API key and admins without user group limits are unaffected.
- A successful call fires the `UserGroup.Create.Post` plugin action with the new group and the API request parameters (lowercased keys, credentials removed). Added in v6.0.2.
:::

::: tip Copy name (v5.9.6)
The copy is named `Duplicate of <original name>` (the screen language string when loaded, the same English text otherwise), so an API-driven duplicate never gets an empty name.
:::

::: tip The copy is never a plan default (v6.0.2)
The copy keeps the original's `SubscriptionPlan` but is created with `SubscriptionPlanIsDefault` set to `No`, because a plan has one default group. Before v6.0.2 duplicating a plan's default group left that plan with two defaults.
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
5003: An admin limited to some user groups cannot create user groups
```

:::

## Get All User Groups

<Badge type="info" text="GET" /> `/api/v1/usergroups.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/usergroups.get`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroups.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: warning Credentials are not returned (changed in v6.0.1)
`usergroups.get` no longer returns `SendMethodSMTPUsername` or `SendMethodSMTPPassword`. Each group carries `HasSendMethodSMTPPassword` instead, which is `true` when a password is stored. Credential keys nested inside `Options` and `ThemeInformation` (for example `Password`, `APIKey`, `SendMethodSMTPPassword` or `smtp_password`) are removed at any depth, matched case-insensitively. When `Options` holds such a key, it is returned re-encoded without it, so its bytes can differ from the stored value. An `Options` value with no such key is returned byte for byte as stored.

The group fields are an allow-list: every other existing field is returned as before, and a column added to the user groups table in a later release is not returned until it is added to the response deliberately. To change the stored credentials, use `usergroup.update`, which keeps them when they are omitted.
:::

::: tip Group scope for limited admin accounts (changed in v6.0.2)
For an admin account limited to specific user groups, `usergroups.get` returns only those groups. Before v6.0.2 it returned every group on the install, so the group pickers offered groups the admin could not use. The master Admin API key and admin accounts without a group limit get the same response as before.
:::

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
      "HasSendMethodSMTPPassword": false,
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
      "HasSendMethodSMTPPassword": true,
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
| HasSendMethodSMTPPassword | Boolean | `true` when the group stores an SMTP password. The password itself and `SendMethodSMTPUsername` are not returned (v6.0.1) |
| DeliveryServerAssignments | Object | Delivery server assignments per channel type. Contains three keys: `Marketing`, `Transactional`, and `AutoResponder`. Each contains `DeliveryServerID` (0 if not assigned) and `DeliveryServerName` (empty string if not assigned) |

Each group carries the ten `Agent*` and `Screening*` fields described under [Get User Group](#get-user-group) (added in v6.0.2). The SMTP username is never returned here.

Each group also carries `LimitTeamMembers` and `RequireMemberTwoFactor`, described under [Get User Group](#get-user-group) (added in v6.0.5). They are present once the database migrations of v6.0.5 have run.

## Get User Group Editor Lists

<Badge type="info" text="GET" /> `/api/v1/admin.usergroup.editor.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session, privilege `UserGroups`
- Returns the choice lists a user group create or edit screen needs, so a staff member with only the `UserGroups` privilege can fill one without the `DeliveryServers` or `Settings` privileges
- Not available to admin agent keys
- Nothing returned belongs to a single user group, so an admin limited to some user groups gets the same lists. Delivery servers are listed by id and name only, never by host or credentials
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.usergroup.editor.get` |
| AdminAPIKey | String | No | Admin API key, or use an admin `SessionID` |

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| SubscriptionPlans | Object | Plan value to label, from plugins answering the `UI.User.Group.SubscriptionPlans` filter (the WooCommerce plugin is the bundled one). An empty object when no plugin answers. With `ResponseFormat=XML` the same pairs are returned as child elements |
| Permissions | Array | The core user group permissions, each `{Key, Section, Label}`, in screen order. `Section` and `Label` are in the install language |
| PluginPermissions | Array | One `{Key, Code, Name}` per enabled plugin, where `Key` is `Plugin.<Code>`, the permission that grants the group the plugin |
| DNSTemplates | Object | `{EmailGateway: [names], EmailCampaign: [names]}`, the DNS template names `usergroup.options.patch` accepts |
| DeliveryServers | Array | `{DeliveryServerID, Name}` for every delivery server, sorted by name |
| DefaultRateLimits | Object | The default `DefaultRateLimits` document, for a "load defaults" action |
| DefaultThemeID | Integer | The theme a new group should get (`RelThemeID` on `usergroup.create`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.usergroup.editor.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriptionPlans": {"gold": "Gold plan"},
  "Permissions": [
    {"Key": "User.Update", "Section": "User information", "Label": "Update account information"}
  ],
  "PluginPermissions": [
    {"Key": "Plugin.woocommerce", "Code": "woocommerce", "Name": "WooCommerce"}
  ],
  "DNSTemplates": {"EmailGateway": ["default"], "EmailCampaign": ["default"]},
  "DeliveryServers": [{"DeliveryServerID": 2, "Name": "Primary relay"}],
  "DefaultRateLimits": {
    "EmailGateway": {"Minute": -1, "Hour": -1, "Day": -1, "Week": -1, "Month": -1, "Year": -1},
    "SMS": {"Minute": -1, "Hour": -1, "Day": -1, "Week": -1, "Month": -1, "Year": -1}
  },
  "DefaultThemeID": 1
}
```

```txt [Error Codes]
0: Success
99999: The admin account does not hold the UserGroups privilege
```

:::

## Add Credits

<Badge type="info" text="POST" /> `/api/v1/user.addcredits`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Update`
- v1 REST alias: `POST /api/v1/user.addcredits`. Legacy access via `/api.php` is also supported
:::

Adds `Credits` to the user's `AvailableCredits` balance and returns the new total. The value is added as an integer with no floor and no check that the user group runs the credit system: a negative `Credits` reduces the balance and can take it below zero. To set an absolute balance use `user.update` with `AvailableCredits` instead.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.addcredits` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | User whose balance is changed |
| Credits | Integer | Yes | Amount to add. Negative values subtract. `0` is accepted and changes nothing |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.addcredits", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "Credits": 5000}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalCredits": 12500
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
1: UserID is missing
2: Credits is missing
3: User not found
```

:::

Missing-parameter codes are returned as an array (`[1]`, `[2]` or `[1, 2]`); code `3` is also returned as a one-element array.

## Order Payment

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This command is deprecated and will be removed in a future Octeth release. It exists only for the WooCommerce billing integration: it mints a single sign-on token for the SSO source whose code is `wp-woocommerce-frontend`. There is no replacement. Do not build new integrations on it.
:::

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.PaymentHistory`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns an SSO token that carries `{user_id, subscription_id, order_id, action: "pay_order", expires_at}` encrypted with the `wp-woocommerce-frontend` SSO source's key pair (AES-256-CBC plus HMAC-SHA256, URL-encoded base64). The token expires 3600 seconds after it is minted. Nothing is validated: the user, subscription and order ids are copied into the token as given.

**If no SSO source with code `wp-woocommerce-frontend` exists, the call still answers `Success: true`.** The token is then encrypted with empty keys and cannot be decrypted by anything. Create the SSO source first (Settings, Single Sign-On) and check `ssosources.get` before relying on the token.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.order.pay` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Copied into the token as `user_id`; not checked against the users table |
| SubscriptionID | Integer | Yes | Copied into the token as `subscription_id` |
| OrderID | Integer | Yes | Copied into the token as `order_id` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.order.pay", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "SubscriptionID": 7, "OrderID": 1201}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Token": "<url-encoded SSO token>"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 1, 1],
  "Token": ""
}
```

```txt [Error Codes]
1: A required parameter is missing. The array holds one 1 per missing parameter (UserID, SubscriptionID, OrderID)
```

:::

## Get Payment Periods

<Badge type="info" text="GET" /> `/api/v1/user.paymentperiods`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.PaymentHistory`
- v1 REST alias: `GET /api/v1/user.paymentperiods`. Legacy access via `/api.php` is also supported
:::

Every payment period (invoice row) of one user from `oempro_users_payment_log`, newest `PeriodEndDate` first, optionally filtered by `PaymentStatus`. Read-only: unlike the send path, this call never creates a period for the current month. Use [Get a Payment Period](#get-a-payment-period) (`user.paymentperiod.get`) for a single row by `LogID`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.paymentperiods` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Owner of the periods |
| PaymentStatus | String | No | Return only periods in this status: `NA`, `Unpaid`, `Waiting`, `Paid` or `Waived`. Any other value answers error `3` |
| ReturnFormatted | String | No | `Yes` to format the three date columns with the admin short date format and the seven amount columns as currency strings; anything else returns raw stored values |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.paymentperiods", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "PaymentStatus": "Unpaid"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "PaymentPeriods": [
    {
      "LogID": "1005",
      "RelUserID": "42",
      "PeriodStartDate": "2026-07-08",
      "PeriodEndDate": "2026-08-08",
      "CampaignsSent": "4",
      "CampaignsTotalRecipients": "18200",
      "CampaignsTotalDelivered": "18004",
      "AutoRespondersSent": "5",
      "AutoRespondersDelivered": "5",
      "EmailGatewayEmailsDelivered": "0",
      "DesignPreviewRequests": "0",
      "ChargePerCampaignSent": "40",
      "ChargeAutoResponderPeriod": "0",
      "ChargeDesignPreviewPeriod": "0",
      "ChargeSystemPeriod": "89.5",
      "ChargeTotalCampaignRecipients": "0",
      "ChargeTotalAutoRespondersSent": "0",
      "ChargeTotalDesignPrevRequests": "0",
      "Discount": "0",
      "Tax": "0",
      "TotalAmount": "129.5",
      "PaymentStatus": "Unpaid",
      "PaymentStatusDate": "2026-08-08",
      "PaidGateway": "",
      "GatewayTransactionID": ""
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3
}
```

```txt [Error Codes]
1: UserID is missing (returned as [1])
2: User not found
3: PaymentStatus is not one of NA, Unpaid, Waiting, Paid, Waived
```

:::

::: warning Empty result is a string, not an array
When the user has no matching periods the response carries `"PaymentPeriods": ""` (an empty string), not `[]`. Treat a non-array value as "no periods".
:::

## Update a Payment Period

<Badge type="info" text="POST" /> `/api/v1/user.paymentperiods.update`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.PaymentHistory`
- v1 REST alias: `POST /api/v1/user.paymentperiods.update`. Legacy access via `/api.php` is also supported
:::

Updates one payment period of a user and returns the stored row. This is the API behind the admin invoice edit screen, and it behaves like that screen: on every call the charge columns (`ChargePerCampaignSent`, `ChargeAutoResponderPeriod`, `ChargeSystemPeriod`, `ChargeTotalCampaignRecipients`, `ChargeTotalAutoRespondersSent`), `Tax` and `TotalAmount` are recomputed from the user group's current pricing and the row's usage counters, whether or not you passed `Discount`, `IncludeTax` or `PaymentStatus`. `PaymentStatusDate` is always set to today's date, even when `PaymentStatus` is unchanged. The period must belong to `UserID`; a `LogID` of another account answers error `4`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.paymentperiods.update` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Owner of the period |
| LogID | Integer | Yes | Payment period id (`LogID` from `user.paymentperiods`) |
| Discount | Number | No | Replaces the stored `Discount`; subtracted from the subtotal before tax |
| IncludeTax | String | No | `Include` applies the install's payment tax percentage to the subtotal, `Exclude` sets `Tax` to `0`. When omitted, tax is applied if the stored `Tax` is non-zero and not otherwise. Any other value answers error `5` |
| PaymentStatus | String | No | New status: `NA`, `Unpaid`, `Waiting`, `Paid` or `Waived`. Any other value answers error `6` |
| ReturnFormatted | String | No | `Yes` to format dates and amounts in the response as `user.paymentperiods` does |
| SendReceipt | String | No | `Yes` to email the invoice to the user after the update. Only sent when the payment receipt email subject and message are configured in Settings, Payments |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.paymentperiods.update", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "LogID": 1005, "PaymentStatus": "Paid", "SendReceipt": "Yes"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "PaymentPeriod": {
    "LogID": "1005",
    "RelUserID": "42",
    "PeriodStartDate": "2026-07-08",
    "PeriodEndDate": "2026-08-08",
    "CampaignsSent": "4",
    "CampaignsTotalRecipients": "18200",
    "CampaignsTotalDelivered": "18004",
    "AutoRespondersSent": "5",
    "AutoRespondersDelivered": "5",
    "ChargePerCampaignSent": "40",
    "ChargeAutoResponderPeriod": "0",
    "ChargeSystemPeriod": "89.5",
    "ChargeTotalCampaignRecipients": "0",
    "ChargeTotalAutoRespondersSent": "0",
    "Discount": "0",
    "Tax": "0",
    "TotalAmount": "129.5",
    "PaymentStatus": "Paid",
    "PaymentStatusDate": "2026-09-04",
    "PaidGateway": "",
    "GatewayTransactionID": ""
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4
}
```

```txt [Error Codes]
1: UserID is missing (returned inside an array, e.g. [1] or [1, 3])
3: LogID is missing (returned inside an array)
2: User not found
4: Payment period not found for this user
5: IncludeTax is not Include or Exclude
6: PaymentStatus is not one of NA, Unpaid, Waiting, Paid, Waived
```

:::

## Change Subscription Payment

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This command is deprecated and will be removed in a future Octeth release. It exists only for the WooCommerce billing integration: it mints a single sign-on token for the SSO source whose code is `wp-woocommerce-frontend`. There is no replacement. Do not build new integrations on it.
:::

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.PaymentHistory`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Identical to [Order Payment](#order-payment) except that the token carries `action: "cc_update"` and no `order_id`. The same caveat applies: when the `wp-woocommerce-frontend` SSO source does not exist the call still answers `Success: true` with an undecryptable token.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.subscription.changepayment` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Copied into the token as `user_id`; not checked against the users table |
| SubscriptionID | Integer | Yes | Copied into the token as `subscription_id` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.subscription.changepayment", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "SubscriptionID": 7}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Token": "<url-encoded SSO token>"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 1],
  "Token": ""
}
```

```txt [Error Codes]
1: A required parameter is missing. The array holds one 1 per missing parameter (UserID, SubscriptionID)
```

:::

## Upgrade Subscription

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This command is deprecated and will be removed in a future Octeth release. It exists only for the WooCommerce billing integration: it mints a single sign-on token for the SSO source whose code is `wp-woocommerce-frontend`. There is no replacement. Do not build new integrations on it.
:::

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.PaymentHistory`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Identical to [Change Subscription Payment](#change-subscription-payment) except that the token carries `action: "upgrade"`. The same caveat applies: when the `wp-woocommerce-frontend` SSO source does not exist the call still answers `Success: true` with an undecryptable token.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.subscription.upgrade` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Copied into the token as `user_id`; not checked against the users table |
| SubscriptionID | Integer | Yes | Copied into the token as `subscription_id` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.subscription.upgrade", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "SubscriptionID": 7}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Token": "<url-encoded SSO token>"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 1],
  "Token": ""
}
```

```txt [Error Codes]
1: A required parameter is missing. The array holds one 1 per missing parameter (UserID, SubscriptionID)
```

:::

## Get Per-User Usage and Feature Adoption

<Badge type="info" text="GET" /> `/api/v1/user.usage.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/user.usage.get`. Legacy access via `/api.php` is also supported
:::

Returns a single account's current usage figures and which features it actually uses, in one strictly **read-only** call, safe to poll on a billing-page render or to gate a plan downgrade. Unlike `user.get`, it performs **no writes**: it never materialises a `oempro_users_payment_log` period and never triggers the active-subscriber-count write-through.

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
4: A feature-usage count query failed (usage temporarily unavailable, do not treat missing counts as zero)
```

:::

**Notes:**
- `Periods.CampaignSend.Derived` is `true` when no payment-log row covers today yet; the window was computed read-only and the backend has **not** materialised it (treat as not-yet-authoritative). `CampaignsSentInPeriod.Value` is `0` in that case.
- `ActiveSubscribers.AsOf` is `null` because the denormalized count has no last-calculated timestamp; only the `MaxStalenessSeconds` ceiling is known.
- Feature counts exclude soft-deleted rows: `SendingDomains` and `EmailGatewayAPIKeys` exclude `Status = 'Deleted'`. `Journeys.ActiveCount` counts `Status = 'Enabled'`.
- `EmailsSentInPeriod` equals the value `LimitEmailSendPerPeriod` enforcement uses for the same calendar-month window.

## Get Bulk User Usage Metering

<Badge type="info" text="GET" /> `/api/v1/users.usage.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/users.usage.get`. Legacy access via `/api.php` is also supported
:::

Returns date-ranged usage for **many users** in a single call, a per-day "emails sent" series plus the current active-subscriber count per account, for a daily billing/metering job. The emails-sent figure uses the same enforcement-backed source as `user.usage.get` (campaign + Email Gateway + auto-responder sends), so display and metering agree. It is bulk (a fixed number of grouped queries regardless of user count) and issues no Redis `KEYS` scan.

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

## Get User Categories

<Badge type="info" text="GET" /> `/api/v1/admin.usercategories.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Users`
- v1 REST alias: `GET /api/v1/admin.usercategories.get`. Legacy access via `/api.php` is also supported
:::

All user categories with the number of users in each, plus the number of users with no category, as
the admin user browse sidebar shows them.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.usercategories.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.usercategories.get", "AdminAPIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Categories": [
    {"CategoryID": 3, "CategoryName": "Agencies", "CreatedDateTime": "2026-01-10 09:00:00", "UpdateTime": "2026-01-10 09:00:00", "UserCount": 12}
  ],
  "TotalCategories": 1,
  "UncategorizedUserCount": 40
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
0: Success
```

:::

## Create a User Category

<Badge type="info" text="POST" /> `/api/v1/admin.usercategory.create`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Users`
- v1 REST alias: `POST /api/v1/admin.usercategory.create`. Legacy access via `/api.php` is also supported
:::

Creates a category. Before this command a category could only be created as a side effect of
`user.update` with `Category=New Category`. Names are unique, compared case-insensitively, and at most
100 characters.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.usercategory.create` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| CategoryName | String | Yes | Category name (1 to 100 characters) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.usercategory.create", "AdminAPIKey": "your-admin-api-key", "CategoryName": "Agencies"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Category": {"CategoryID": 3, "CategoryName": "Agencies", "CreatedDateTime": "2026-09-04 12:00:00", "UpdateTime": "2026-09-04 12:00:00", "UserCount": 0}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "A category with this name already exists"
}
```

```txt [Error Codes]
1: CategoryName is missing
2: CategoryName is longer than 100 characters
3: A category with this name already exists
4: Category could not be created
```

:::

## Rename a User Category

<Badge type="info" text="POST" /> `/api/v1/admin.usercategory.update`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Users`
- v1 REST alias: `POST /api/v1/admin.usercategory.update`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.usercategory.update` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| CategoryID | Integer | Yes | Category to rename |
| CategoryName | String | Yes | New name (1 to 100 characters, unique) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.usercategory.update", "AdminAPIKey": "your-admin-api-key", "CategoryID": 3, "CategoryName": "Partner agencies"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Category": {"CategoryID": 3, "CategoryName": "Partner agencies", "CreatedDateTime": "2026-01-10 09:00:00", "UpdateTime": "2026-09-04 12:05:00"}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Category not found"
}
```

```txt [Error Codes]
1: CategoryID is missing or not a positive integer
2: CategoryName is missing
3: Category not found
4: CategoryName is longer than 100 characters
5: Another category already carries this name
6: Category could not be renamed
```

:::

## Delete a User Category

<Badge type="info" text="POST" /> `/api/v1/admin.usercategory.delete`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Users`
- Not available in demo mode
- v1 REST alias: `POST /api/v1/admin.usercategory.delete`. Legacy access via `/api.php` is also supported
:::

Deletes a category. Users in it become uncategorized; no user account is deleted.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.usercategory.delete` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| CategoryID | Integer | Yes | Category to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.usercategory.delete", "AdminAPIKey": "your-admin-api-key", "CategoryID": 3}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CategoryID": 3
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Category not found"
}
```

```txt [Error Codes]
1: CategoryID is missing or not a positive integer
2: Category not found
3: Category could not be deleted
NOT AVAILABLE IN DEMO MODE.: Demo mode is enabled
```

:::

## Get a User's Activity Series (Admin)

<Badge type="info" text="GET" /> `/api/v1/admin.user.activityseries.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- v1 REST alias: `GET /api/v1/admin.user.activityseries.get`. Legacy access via `/api.php` is also supported
:::

One per-day series of the admin "Account Activity" chart for a user, one point per calendar day ending
today, zero-filled. Point keys depend on `Metric`: `Unsubscriptions` gives `Unsubscriptions` (campaign
unsubscriptions), `Bounces` gives `HardBounces`, `Spam` gives `SpamComplaints`, `Subscriptions` gives
`Subscriptions` and `Unsubscriptions` (list activity). Values are summed across the user's lists.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.activityseries.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |
| Metric | String | Yes | `Unsubscriptions`, `Bounces`, `Spam` or `Subscriptions` (case-insensitive) |
| Days | Integer | No | Number of points, today inclusive; clamped to 1..365 (default 30) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.activityseries.get", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "Metric": "Bounces", "Days": 7}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "Metric": "Bounces",
  "Days": 7,
  "FromDate": "2026-08-29",
  "ToDate": "2026-09-04",
  "Series": [
    {"Date": "2026-08-29", "HardBounces": 0},
    {"Date": "2026-08-30", "HardBounces": 3}
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Metric must be one of: Unsubscriptions, Bounces, Spam, Subscriptions"
}
```

```txt [Error Codes]
1: Metric is missing
2: Metric is unknown
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

## Get a User's Send Activity (Admin)

<Badge type="info" text="GET" /> `/api/v1/admin.user.sendactivity.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- v1 REST alias: `GET /api/v1/admin.user.sendactivity.get`. Legacy access via `/api.php` is also supported
:::

Per-day campaign send totals for a user, the data behind the sparkline on the admin user list. `From`
and `To` are `Y-m-d` dates, both inclusive; the default window is the list's own, seven days back to
today (eight points). The window may span at most 366 days.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.sendactivity.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |
| From | String | No | Start date `Y-m-d` (default: today minus 7 days) |
| To | String | No | End date `Y-m-d` (default: today) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.sendactivity.get", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "From": "2026-09-01", "To": "2026-09-04"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "FromDate": "2026-09-01",
  "ToDate": "2026-09-04",
  "TotalSent": 1250,
  "Series": [
    {"Date": "2026-09-01", "TotalSent": 0},
    {"Date": "2026-09-02", "TotalSent": 1250},
    {"Date": "2026-09-03", "TotalSent": 0},
    {"Date": "2026-09-04", "TotalSent": 0}
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "From must be a valid date in Y-m-d format"
}
```

```txt [Error Codes]
1: From is not a valid Y-m-d date
2: To is not a valid Y-m-d date
3: From is after To
4: The window exceeds 366 days
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

## Get Send Activity for Several Users (Admin)

<Badge type="info" text="GET" /> `/api/v1/admin.users.sendactivity.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- Rate limit: 60 requests per 60 seconds
- v1 REST alias: `GET /api/v1/admin.users.sendactivity.get`. Legacy access via `/api.php` is also supported
- Added in v6.0.2
:::

Per-day campaign send totals for up to 100 users in one call, for send sparklines on a page of the user list. It answers what `admin.user.sendactivity.get` answers for one user, from a single query. `From` and `To` are `Y-m-d` dates, both inclusive, at most 31 days apart.

A user that does not exist, or that is outside the user groups of an admin account limited to specific groups, is left out of `Users` without an error. Users keep the order of `UserIDs`, and every series has one point per day, with `0` for days without sends.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.users.sendactivity.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserIDs | String or Array | Yes | 1 to 100 positive user ids, as an array or a comma-separated string. Duplicates are ignored |
| From | String | Yes | Start date `Y-m-d` |
| To | String | Yes | End date `Y-m-d`, not before `From`, at most 31 days after it |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.users.sendactivity.get", "AdminAPIKey": "your-admin-api-key", "UserIDs": [42, 43], "From": "2026-09-01", "To": "2026-09-03"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "FromDate": "2026-09-01",
  "ToDate": "2026-09-03",
  "Users": [
    {
      "UserID": 42,
      "TotalSent": 1250,
      "Series": [
        {"Date": "2026-09-01", "TotalSent": 0},
        {"Date": "2026-09-02", "TotalSent": 1250},
        {"Date": "2026-09-03", "TotalSent": 0}
      ]
    },
    {
      "UserID": 43,
      "TotalSent": 0,
      "Series": [
        {"Date": "2026-09-01", "TotalSent": 0},
        {"Date": "2026-09-02", "TotalSent": 0},
        {"Date": "2026-09-03", "TotalSent": 0}
      ]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5,
  "ErrorText": "From and To may be at most 31 days apart"
}
```

```txt [Error Codes]
1: UserIDs is missing, holds a value that is not a positive integer, or lists more than 100 ids
2: From is not a valid Y-m-d date
3: To is not a valid Y-m-d date
4: From is after To
5: From and To are more than 31 days apart
6: The send activity could not be read
```

:::

**Response Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| FromDate, ToDate | String | The window, as requested |
| Users | Array | One entry per reachable user, in the order of `UserIDs` |
| Users[].UserID | Integer | User id |
| Users[].TotalSent | Integer | Emails sent by the user's campaigns in the window, by the day each campaign started sending |
| Users[].Series | Array | One `{Date, TotalSent}` point per day from `FromDate` to `ToDate` |

## Send a Message to a User (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.user.message.send`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- Not available in demo mode
- v1 REST alias: `POST /api/v1/admin.user.message.send`. Legacy access via `/api.php` is also supported
:::

Emails a message to the user's account address through the system notification template, exactly as
the "Send message" action on the admin user screen does. The subject is prefixed with the product name;
line breaks in `Message` are preserved.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.message.send` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |
| Subject | String | Yes | Message subject |
| Message | String | Yes | Message body (plain text) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.message.send", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "Subject": "Sending limit raised", "Message": "Your monthly limit is now 500,000."}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "EmailAddress": "owner@example.com",
  "Subject": "Sending limit raised"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Message could not be sent: Connection refused"
}
```

```txt [Error Codes]
1: Subject is missing
2: Message is missing
3: Delivery failed (ErrorText carries the transport error)
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
NOT AVAILABLE IN DEMO MODE.: Demo mode is enabled
```

:::

## Get a User's Plug-in Fields (Admin)

<Badge type="info" text="GET" /> `/api/v1/admin.user.pluginfields.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- v1 REST alias: `GET /api/v1/admin.user.pluginfields.get`. Legacy access via `/api.php` is also supported
:::

The per-user settings that enabled plug-ins add to the admin user edit screen, with their current value for the user. Each enabled plug-in that listens to the `Admin.User.PluginFields` filter contributes its own fields; a disabled plug-in contributes none. Each field carries the admin privilege needed to see and change it (`PluginAccess` unless the plug-in names another). A field whose privilege the calling admin lacks is left out of the response; the call itself still succeeds.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.pluginfields.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |

**Field object:**

| Key | Type | Description |
|-----|------|-------------|
| name | String | The field's identifier, `plugin.key`. Use it as the key in `admin.user.pluginfields.update` |
| plugin | String | Code of the plug-in that owns the field |
| key | String | The field's key within the plug-in |
| label | String | Label to show next to the field |
| type | String | `checkbox`, `text`, `number`, `select`, `textarea` or `info`. An `info` field is read-only: show its value, never offer to change it |
| section | String | Where the field belongs on the edit screen: `account` or `settings` |
| privilege | String | Admin privilege required to see and change the field |
| help | String | Help text, empty when there is none |
| options | Array | For `select`, the allowed choices in display order as `{"value": "...", "label": "..."}` objects. Empty for other types |
| min, max | Number or null | For `number` only: the allowed range, `null` when unbounded |
| integer | Boolean | For `number` only: `true` when only whole numbers are accepted |
| value | Mixed | The current value: Boolean for `checkbox`, number or `null` (empty, the plug-in's default applies) for `number`, string or `null` for `select`, string for `text`, `textarea` and `info` (an `info` value may hold several lines) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.pluginfields.get", "AdminAPIKey": "your-admin-api-key", "UserID": 42}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "Fields": [
    {
      "name": "amazonses.WhitelistUserForSenderIdentityStatusChecks",
      "plugin": "amazonses",
      "key": "WhitelistUserForSenderIdentityStatusChecks",
      "label": "Exclude this user from SES domain verification",
      "type": "checkbox",
      "section": "account",
      "privilege": "PluginAccess",
      "help": "",
      "options": [],
      "value": false
    },
    {
      "name": "upsender.cpm_rate",
      "plugin": "upsender",
      "key": "cpm_rate",
      "label": "CPM Rate ($)",
      "type": "number",
      "section": "settings",
      "privilege": "PluginAccess",
      "help": "Cost per 1,000 emails. Leave empty to use the default rate ($0.20).",
      "options": [],
      "min": 0,
      "max": null,
      "integer": false,
      "value": null
    }
  ],
  "TotalFields": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5003,
  "ErrorText": "User is outside the user groups this admin account may access"
}
```

```txt [Error Codes]
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

The bundled plug-ins contribute these fields when enabled:

| Plug-in | Field name | Type | Section |
|---------|-----------|------|---------|
| Amazon SES | `amazonses.WhitelistUserForSenderIdentityStatusChecks` | checkbox | account |
| SpamAssassin Content Validator | `spamassassincontentvalidator.WhitelistUser` | checkbox | account |
| Upsender | `upsender.ip_count` | number (whole, 0 or more) | settings |
| Upsender | `upsender.cpm_rate` | number (0 or more, empty uses the default rate) | settings |
| Upsender | `upsender.ip_cost` | number (0 or more, empty uses the default cost) | settings |
| Peak Monitor | `peakmonitor.stats_last_reset` | info (the last stats reset, or `Never`) | account |
| PhishGuard | `phishguard.detection_counter` | info (detections in the last 24 hours) | account |
| PhishGuard | `phishguard.notifications` | info (whether alerts are muted) | account |
| PhishGuard | `phishguard.detection_history` | info (the 10 most recently detected keywords, one per line) | account |

## Update a User's Plug-in Fields (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.user.pluginfields.update`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Update`
- v1 REST alias: `POST /api/v1/admin.user.pluginfields.update`. Legacy access via `/api.php` is also supported
:::

Saves per-user plug-in field values. `Values` maps field names (`plugin.key`, as returned by `admin.user.pluginfields.get`) to new values. Field names match case-insensitively. Only the fields you send change; the others keep their stored values.

The update is all or nothing. Every value is checked first, and nothing is saved when any value is refused: an unknown field name, a field whose privilege you lack, a field sent twice, or a value that does not fit the field (for example `"maybe"` for a checkbox, `1.5` for a whole-number field, or a value outside `min` and `max`). The response lists each refused field in `FieldErrors`. After that check, each plug-in receives only its own values and saves them. If a plug-in then reports an error, the call answers `ErrorCode` 4 with that plug-in's `FieldErrors`; other plug-ins' values in the same request may already be saved, so the response includes the current `Fields`.

Value formats: a checkbox accepts `true`, `false`, `1`, `0`, `"true"`, `"false"`, `"yes"`, `"no"`, `"on"`, `"off"`, `"enabled"`, `"disabled"`, or `""` and `null` (unticked). A number accepts a number, a numeric string, or `""` or `null` to clear it, and refuses `true` and `false`. A select accepts one of its option values exactly as `options` lists them. Text and textarea accept a string of at most 65,535 bytes, and `null` saves an empty string.

An `info` field is read-only. Sending its name refuses the request with error code 3 and `"This field is read-only"` in `FieldErrors`, and nothing is saved.

On success, `SavedFields` lists the saved field names and `Fields` lists every field you can see with its stored value, in the same shape as `admin.user.pluginfields.get` returns them.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.pluginfields.update` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |
| Values | Object or String | Yes | Field name to new value, as an object or a JSON-encoded string |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.pluginfields.update", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "Values": {"amazonses.WhitelistUserForSenderIdentityStatusChecks": true, "upsender.cpm_rate": "0.35"}}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "SavedFields": [
    "amazonses.WhitelistUserForSenderIdentityStatusChecks",
    "upsender.cpm_rate"
  ],
  "Fields": [
    {
      "name": "amazonses.WhitelistUserForSenderIdentityStatusChecks",
      "plugin": "amazonses",
      "key": "WhitelistUserForSenderIdentityStatusChecks",
      "label": "Exclude this user from SES domain verification",
      "type": "checkbox",
      "section": "account",
      "privilege": "PluginAccess",
      "help": "",
      "options": [],
      "value": true
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "One or more values were refused, nothing was saved",
  "FieldErrors": {
    "amazonses.WhitelistUserForSenderIdentityStatusChecks": "You do not have the privilege to change this field",
    "upsender.ip_count": "The value must be a whole number"
  }
}
```

```txt [Error Codes]
1: Values is required (missing or empty)
2: Values must be a JSON object of plugin.key => value
3: One or more values were refused, nothing was saved (see FieldErrors)
4: A plug-in could not save one or more values (see FieldErrors)
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

## Get a User's Plug-in Actions (Admin)

<Badge type="info" text="GET" /> `/api/v1/admin.user.pluginactions.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- v1 REST alias: `GET /api/v1/admin.user.pluginactions.get`. Legacy access via `/api.php` is also supported
:::

The one-shot actions that enabled plug-ins offer for a user, such as resetting a counter or suspending an account. Each enabled plug-in that listens to the `Admin.User.PluginActions` filter contributes its own actions; a disabled plug-in contributes none. Each action carries the admin privilege needed to see and run it (`PluginAccess` unless the plug-in names another). An action whose privilege the calling admin lacks is left out of the response; the call itself still succeeds. Run an action with `admin.user.pluginactions.run`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.pluginactions.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |

**Action object:**

| Key | Type | Description |
|-----|------|-------------|
| name | String | The action's identifier, `plugin.key`. Pass it as `Action` to `admin.user.pluginactions.run` |
| plugin | String | Code of the plug-in that owns the action |
| key | String | The action's key within the plug-in |
| label | String | Label for the button |
| description | String | What the action does, empty when there is none |
| confirm | String | Text to show in a confirmation before running the action, empty when it runs without one |
| tone | String | `default`, or `danger` for an action that is hard to undo |
| privilege | String | Admin privilege required to see and run the action |
| available | Boolean | `false` when the action cannot run for this user right now (for example, activating an account that is not suspended) |
| reason | String | Why the action is not available, empty while it is |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.pluginactions.get", "AdminAPIKey": "your-admin-api-key", "UserID": 42}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "Actions": [
    {
      "name": "peakmonitor.reset_stats",
      "plugin": "peakmonitor",
      "key": "reset_stats",
      "label": "Reset spam/bounce rate stats",
      "description": "All stats that were collected before the reset will be ignored in the Peak Monitoring.",
      "confirm": "Are you sure that you want to reset spam/bounce rate stats?",
      "tone": "default",
      "privilege": "User.Update",
      "available": true,
      "reason": ""
    },
    {
      "name": "phishguard.unmute_notifications",
      "plugin": "phishguard",
      "key": "unmute_notifications",
      "label": "Unmute notifications",
      "description": "Sends the next PhishGuard alert for this user without waiting for the mute to expire.",
      "confirm": "",
      "tone": "default",
      "privilege": "User.Update",
      "available": false,
      "reason": "Notifications are not muted for this user."
    }
  ],
  "TotalActions": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5003,
  "ErrorText": "User is outside the user groups this admin account may access"
}
```

```txt [Error Codes]
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

The bundled plug-ins offer these actions when enabled. All of them need `User.Update`.

| Plug-in | Action name | What it does | Available when |
|---------|-------------|--------------|----------------|
| Peak Monitor | `peakmonitor.reset_stats` | Peak Monitoring ignores every spam and bounce rate stat collected before now | Always |
| PhishGuard | `phishguard.reset_detection_counter` | Clears the 24-hour detection counter and the detection history | The counter is above zero |
| PhishGuard | `phishguard.unmute_notifications` | Lets the next alert for the user through without waiting for the mute to expire | Alerts are muted |
| SendLayer | `sendlayer.suspend_account` | Sets the user's WooCommerce subscription to suspended | The account is not suspended |
| SendLayer | `sendlayer.activate_account` | Sets the user's WooCommerce subscription to active | The account is suspended |

## Run a User's Plug-in Action (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.user.pluginactions.run`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Update`
- v1 REST alias: `POST /api/v1/admin.user.pluginactions.run`. Legacy access via `/api.php` is also supported
:::

Runs one plug-in action on a user. `Action` is the action's `name` from `admin.user.pluginactions.get` and matches case-insensitively. Octeth reads the user's action list again first, so only an action the plug-in offers for this user right now can run, and the call is refused when the calling admin lacks the action's privilege. The action runs in its own plug-in only. When the plug-in reports a failure (for example, a remote API call failed), the call fails with error code 5 and the plug-in's message in `ErrorText`; it never reports a failure as a success. The plug-in's message, returned in `Message` or `ErrorText`, is cut to 1,000 bytes without splitting a UTF-8 character.

The command does not ask for confirmation. Show the action's `confirm` text to the user before calling it.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.pluginactions.run` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Target user account |
| Action | String | Yes | The action's name, `plugin.key` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.user.pluginactions.run", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "Action": "peakmonitor.reset_stats"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "Action": "peakmonitor.reset_stats",
  "Message": "The spam/bounce rate stats reset successfully."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5,
  "ErrorText": "WooCommerce settings are empty.",
  "Action": "sendlayer.suspend_account"
}
```

```txt [Error Codes]
1: Action is required
2: Unknown action (not offered for this user, or the plug-in is not enabled)
3: You do not have the privilege to run this action
4: The action is not available for this user now (ErrorText carries the plug-in's reason)
5: The plug-in reported a failure (ErrorText carries its message)
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

## Get a Payment Period

<Badge type="info" text="GET" /> `/api/v1/user.paymentperiod.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `User.Edit`
- v1 REST alias: `GET /api/v1/user.paymentperiod.get`. Legacy access via `/api.php` is also supported
:::

One payment period (invoice) of a user by `LogID`, the row the admin invoice screen renders. The period
must belong to the user; a `LogID` of another account answers error `2` rather than the row.
`user.paymentperiods` returns every period of the account.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.paymentperiod.get` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |
| UserID | Integer | Yes | Owner of the period |
| LogID | Integer | Yes | Payment period id |
| ReturnFormatted | String | No | `Yes` to format amounts and dates as `user.paymentperiods` does |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.paymentperiod.get", "AdminAPIKey": "your-admin-api-key", "UserID": 42, "LogID": 918}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 42,
  "PaymentPeriod": {
    "LogID": "918",
    "RelUserID": "42",
    "PeriodStartDate": "2026-08-01",
    "PeriodEndDate": "2026-08-31",
    "CampaignsSent": "4",
    "TotalAmount": "129.5",
    "PaymentStatus": "Unpaid",
    "PaymentStatusDate": "2026-08-31"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Payment period not found for this user"
}
```

```txt [Error Codes]
1: LogID is missing or not a positive integer
2: Payment period not found for this user
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
```

:::

## Get the Limit-Utilization Summary

<Badge type="info" text="GET" /> `/api/v1/admin.users.limitutilization.summary`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Users`
- v1 REST alias: `GET /api/v1/admin.users.limitutilization.summary`. Legacy access via `/api.php` is also supported
:::

The aggregate limit-utilization counts the admin user browse sidebar shows (`Total`, `OK`, `Warning`,
`Exceeded`, plus `Unknown` for users not yet classified). They come from the cache the
`user_limit_utilization` cron writes every 15 minutes; `Available` is `false` and every count `0` until
it has run, and `CalculatedAt` tells how old the figures are. A restricted sub-admin receives the counts
for the users in the groups they may access (`Scoped: true`), never the install-wide figures.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.users.limitutilization.summary` |
| AdminAPIKey | String | Yes | Admin API key (or admin `SessionID`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.users.limitutilization.summary", "AdminAPIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Available": true,
  "Scoped": false,
  "CalculatedAt": 1788000000,
  "CalculatedAtFormatted": "2026-09-04 12:00:00",
  "Counts": {"Total": 150, "OK": 120, "Warning": 20, "Exceeded": 7, "Unknown": 3}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
0: Success
```

:::
