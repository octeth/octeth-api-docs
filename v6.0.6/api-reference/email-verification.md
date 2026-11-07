---
layout: doc
---

# Email Verification API Documentation

Email verification checks addresses through the Octeth client area (my.octeth.com) and bills each check to the user's own verification credits. These endpoints hold the installation settings, the upstream status and the per-user credit ledger.

## Get Email Verification Settings

<Badge type="info" text="GET" /> `/api/v1/verification.settings.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required admin privilege: `Settings`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the installation's email verification settings and the last known state of the Octeth client area connection. This call never contacts my.octeth.com. `Upstream` is the outcome of the last check (a ping when the feature was turned on or the status was read, or a verification call that was refused because the license key or the installation is not accepted). `LicenseKeyPresent` is `true` when a signed license key is installed, which email verification needs.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `verification.settings.get` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/verification.settings.get \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "verification.settings.get",
      "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Settings": {
    "Enabled": true,
    "AllUserGroups": false,
    "UserGroupIDs": [
      2,
      5
    ],
    "CacheDays": 30,
    "LowBalanceThreshold": 1000
  },
  "LicenseKeyPresent": true,
  "Upstream": {
    "Ready": true,
    "Error": "",
    "Message": "",
    "EnableURL": "",
    "CheckedAt": "2026-11-07 10:00:00"
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
0: Success
99998: Authentication failure
99999: Not enough privileges
```

:::

## Update Email Verification Settings

<Badge type="info" text="POST" /> `/api/v1/verification.settings.update`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required admin privilege: `Settings`
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Changes one or more email verification settings. A setting you leave out keeps its value. Email verification is off until you set `Enabled` to `true`. When you turn it on and a signed license key is installed, Octeth sends one free connection check (a ping) to my.octeth.com after saving and returns its outcome in `Upstream`. An `installation_disabled` error means the installation still has to be switched on in the client area: open `EnableURL`.

A cached result (`CacheDays`) answers a repeat check of the same address without contacting my.octeth.com. The user is still charged one credit for it. Addresses are stored only as a keyed hash, and results of type `unknown` or with a suggested correction are never cached.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `verification.settings.update` |
| AdminAPIKey | String | Yes | Admin API key |
| Enabled | Boolean | No | `true` turns email verification on for the installation, `false` turns it off |
| AllUserGroups | Boolean | No | `true` (default) allows every user group. `false` allows only the groups in `UserGroupIDs` |
| UserGroupIDs | Array | No | User group IDs allowed when `AllUserGroups` is `false`. An array or a comma-separated string. An empty value clears the list |
| CacheDays | Integer | No | How many days a local result answers a repeat check, `0` to `365` (default `30`). `0` turns the cache off |
| LowBalanceThreshold | Integer | No | Warn in `verification.status.get` when the client area balance drops below this number, `0` (default) for no threshold |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/verification.settings.update \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "verification.settings.update",
      "AdminAPIKey": "your-admin-api-key",
      "Enabled": true,
      "AllUserGroups": false,
      "UserGroupIDs": [
          2,
          5
      ],
      "CacheDays": 30,
      "LowBalanceThreshold": 1000
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Settings": {
    "Enabled": true,
    "AllUserGroups": false,
    "UserGroupIDs": [
      2,
      5
    ],
    "CacheDays": 30,
    "LowBalanceThreshold": 1000
  },
  "LicenseKeyPresent": true,
  "Upstream": {
    "Ready": false,
    "Error": "installation_disabled",
    "Message": "Email verification is not enabled for this installation.",
    "EnableURL": "https://my.octeth.com/email-verification?tab=installations",
    "CheckedAt": "2026-11-07 10:00:00"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "UserGroupIDs holds an unknown user group"
}
```

```txt [Error Codes]
0: Success
1: No setting given
2: UserGroupIDs holds an unknown user group
3: CacheDays is not 0 to 365
4: LowBalanceThreshold is not 0 to 1000000000
5: Enabled or AllUserGroups is not true or false
6: The settings could not be saved
99998: Authentication failure
99999: Not enough privileges
```

:::

## Get Email Verification Status

<Badge type="info" text="GET" /> `/api/v1/verification.status.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required admin privilege: `Settings`
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Checks the connection to the Octeth client area and returns its credit balance, the total of every user's verification credits and a low-balance warning. my.octeth.com is contacted only when email verification is enabled and a signed license key is installed. Otherwise `Upstream.Checked` is `false` and no request is made.

One client area balance funds the checks of every user. `LowBalance` is `true` when that balance is below the credits your users hold (`below_user_balances`) or below `LowBalanceThreshold` (`below_threshold`). Top up the balance in the client area before users run out of checks they have paid for.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `verification.status.get` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/verification.status.get \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "verification.status.get",
      "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Enabled": true,
  "LicenseKeyPresent": true,
  "Upstream": {
    "Checked": true,
    "Ready": true,
    "Error": "",
    "Message": "",
    "EnableURL": "",
    "Credits": 4210,
    "CheckedAt": "2026-11-07 10:00:00"
  },
  "UserBalancesTotal": 5000,
  "LowBalanceThreshold": 1000,
  "LowBalance": true,
  "LowBalanceReasons": [
    "below_user_balances"
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorText": "The verification credit balances could not be read"
}
```

```txt [Error Codes]
0: Success
6: The verification credit balances could not be read
99998: Authentication failure
99999: Not enough privileges

Upstream.Error values: no_license_key, insecure_url, key_missing, key_invalid,
installation_disabled, daily_cap_reached, not_enough_credits, rate_limited,
provider_unavailable, server_error, timeout, transport_error, invalid_response, http_error
```

:::

## Grant Verification Credits to a User

<Badge type="info" text="POST" /> `/api/v1/user.verificationcredits.add`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required admin privilege: `User.Update`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Adds email verification credits to a user's balance, as a free staff grant (`Type` `grant`, the default) or for a paid credit pack (`Type` `purchase`). Each verification check spends one credit. These credits are separate from delivery credits, which `user.addcredits` grants.

Pass a `Reference` (for example the purchase or payment ID) to make the call safe to retry: a second call with the same `Type` and `Reference` adds nothing and answers `Replayed: true` with the original `EntryID`. The same reference used for another user or another amount is refused with error 5. A restricted admin can grant only to users in its user groups.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.verificationcredits.add` |
| AdminAPIKey | String | Yes | Admin API key |
| UserID | Integer | Yes | The user to credit |
| Credits | Integer | Yes | Credits to add, 1 to 100000000 |
| Type | String | No | `grant` (default) for a free staff grant, `purchase` for a paid credit pack |
| Reference | String | No | Idempotency key, 1 to 191 characters of letters, digits, `.`, `_`, `:` and `-` |
| Note | String | No | A note stored with the entry, up to 255 characters |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.verificationcredits.add \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "user.verificationcredits.add",
      "AdminAPIKey": "your-admin-api-key",
      "UserID": 12,
      "Credits": 1000,
      "Type": "purchase",
      "Reference": "pi_3Q2x9aBc",
      "Note": "1,000 verification credits pack"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 12,
  "Balance": 1500,
  "EntryID": 88,
  "Replayed": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5,
  "ErrorText": "This Reference was already used for another user or another amount"
}
```

```txt [Error Codes]
0: Success
2: Credits is not a whole number from 1 to 100000000
3: Reference is malformed
4: Type is not grant or purchase
5: Reference already used for another user or another amount
6: The credits could not be granted
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
99998: Authentication failure
99999: Not enough privileges
```

:::

## Get a User's Verification Credits

<Badge type="info" text="GET" /> `/api/v1/user.verificationcredits.get`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required admin privilege: `Users` (admin authentication)
- Team member role permission: `Account.Read`
- Rate limit: 120 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns a user's email verification credit balance. Verification credits are separate from delivery credits. With user authentication it returns the caller's own balance. With admin authentication pass `UserID`, and a restricted admin can read only users in its user groups. `VerificationAvailable` is `true` when email verification is enabled, the user's group is allowed and the client area accepts the installation. This call never contacts my.octeth.com.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.verificationcredits.get` |
| APIKey | String | No | User API key (user authentication) |
| AdminAPIKey | String | No | Admin API key (admin authentication) |
| UserID | Integer | Admin only | The user to read. Required with admin authentication, ignored with user authentication |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/user.verificationcredits.get \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "user.verificationcredits.get",
      "APIKey": "your-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 12,
  "Balance": 500,
  "VerificationAvailable": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5002,
  "ErrorText": "User not found"
}
```

```txt [Error Codes]
0: Success
5001: UserID is required with admin authentication
5002: User not found
5003: User is outside the user groups this admin account may access
6: The balance could not be read
99998: Authentication failure
99999: Not enough privileges
```

:::

## Get a User's Verification Credit History

<Badge type="info" text="GET" /> `/api/v1/user.verificationcredits.history`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required admin privilege: `Users` (admin authentication)
- Team member role permission: `Account.Read`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Lists a user's verification credit entries, newest first: grants, purchases, charges, credit backs and adjustments. Every entry carries the change (`Delta`) and the balance it left (`BalanceAfter`). With user authentication it returns the caller's own history. With admin authentication pass `UserID`. Page with `Cursor`: pass the `NextCursor` of the previous page until it is `0`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `user.verificationcredits.history` |
| APIKey | String | No | User API key (user authentication) |
| AdminAPIKey | String | No | Admin API key (admin authentication) |
| UserID | Integer | Admin only | The user to read. Required with admin authentication |
| Limit | Integer | No | Entries per page, 1 to 100 (default 25) |
| Cursor | Integer | No | `NextCursor` of the previous page |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/user.verificationcredits.history \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "user.verificationcredits.history",
      "APIKey": "your-api-key",
      "Limit": 25
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 12,
  "Balance": 499,
  "Entries": [
    {
      "EntryID": 90,
      "Delta": -1,
      "BalanceAfter": 499,
      "Type": "charge",
      "SourceType": "email.verify",
      "SourceRef": "",
      "Note": "",
      "CreatedAt": "2026-11-07 10:00:00"
    },
    {
      "EntryID": 88,
      "Delta": 500,
      "BalanceAfter": 500,
      "Type": "purchase",
      "SourceType": "purchase",
      "SourceRef": "pi_3Q2x9aBc",
      "Note": "",
      "CreatedAt": "2026-11-06 09:12:00"
    }
  ],
  "NextCursor": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Limit must be 1 to 100"
}
```

```txt [Error Codes]
0: Success
1: Limit is not 1 to 100
2: Cursor is not a NextCursor value
6: The history could not be read
5001: UserID is required with admin authentication
5002: User not found
5003: User is outside the user groups this admin account may access
99998: Authentication failure
99999: Not enough privileges
```

:::
