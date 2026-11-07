---
layout: doc
---

# Email Verification API Documentation

Email verification checks addresses through the Octeth client area (my.octeth.com) and bills each check to the user's own verification credits. These endpoints hold the installation settings, the upstream status and the per-user credit ledger, check a single address, set up the check of new subscribers on each list, and run, read and apply bulk verification of a whole list or segment.

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

## Verify an Email Address

<Badge type="info" text="POST" /> `/api/v1/email.verify`

::: tip API Usage Notes
- Authentication required: User API Key
- Team member role permission: `Audience.Manage`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Checks one email address and spends one of the user's verification credits. The address is trimmed and lowercased before it is checked. When the same address was checked recently, Octeth answers from its own result cache (`Cached` is `true`) and still charges one credit. When the check gives no result (it did not finish in time, or verification is temporarily unavailable), the credit is returned at once and the call answers an error. Nothing is charged for an address that is not a valid email address.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `email.verify` |
| APIKey | String | Yes | User API key |
| EmailAddress | String | Yes | The address to check |

**Result fields (`Verification`):**

| Field | Description |
|-------|-------------|
| Group | `safe`, `risky`, `invalid` or `unknown` |
| Reasons | Why a risky address is risky: `accept_all`, `role`, `disposable`, `low_quality`. Empty for other groups |
| Flags | `accept_all`, `role`, `disposable`, `free`, `mailbox_full`, `no_reply`, each `true`, `false` or `null` when not reported |
| DidYouMean | A suggested correction of the address, or `null` |
| Reason | The mail server outcome: `accepted`, `mailbox_not_found`, `invalid_syntax`, `invalid_domain`, `smtp_error`, `smtp_unavailable`, `no_connection`, `timeout`, `low_deliverability`, `low_quality`, `unknown_error`, or `null` |
| Domain | The address's domain |
| MailServer | The mail server that answered, or `null` |
| Duration | How long the check took, in seconds, or `null` for a cached result |
| Cached | `true` when the result came from Octeth's result cache |
| CheckedAt | When the result was obtained (UTC, `YYYY-MM-DD HH:MM:SS`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/email.verify \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "email.verify",
      "APIKey": "your-api-key",
      "EmailAddress": "ayse@acme.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailAddress": "ayse@acme.com",
  "Verification": {
    "Group": "safe",
    "Reasons": [],
    "Flags": {"accept_all": false, "role": false, "disposable": false, "free": false, "mailbox_full": false, "no_reply": false},
    "DidYouMean": null,
    "Reason": "accepted",
    "Domain": "acme.com",
    "MailServer": "mx1.acme.com",
    "Duration": 1.2,
    "Cached": false,
    "CheckedAt": "2026-11-07 15:00:00"
  },
  "CreditsCharged": 1,
  "Balance": 499
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Not enough verification credits",
  "Balance": 0
}
```

```txt [Error Codes]
0: Success
1: EmailAddress is missing
2: EmailAddress is not a valid email address (nothing charged)
3: Email verification is not available for this account
4: Not enough verification credits (Balance is returned)
5: The check did not finish in time and the credit was returned. Try again later
6: Email verification is temporarily unavailable and the credit was returned. Try again later
7: The verification credit could not be charged
99998: Authentication failure
```

:::

## Get a List's Verification Settings

<Badge type="info" text="GET" /> `/api/v1/list.verification.settings`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `List.Get`
- Team member role permission: `Account.Read`
- Rate limit: 120 requests per 60 seconds
- Legacy endpoint access via `/api.php` (command `list.verification.settings.get`) is also supported
:::

Returns whether a list checks new subscribers with email verification, which results it refuses, and its daily counters. A list that never saved its settings returns the defaults (checking off, refuse `invalid`, 8 second timeout, no daily cap). `VerificationAvailable` is `true` when email verification is enabled, the user's group is allowed and the client area accepts the installation. This call never contacts my.octeth.com.

The counters cover UTC days, newest first. `Checked` counts the signups that got a result (each cost one credit), `Rejected` the checked signups that were refused, and `FailedOpen` the signups that were let in unchecked because the check could not run (it timed out, verification was unavailable, the account had no credits, or the daily cap was reached).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.settings.get` |
| APIKey | String | Yes | User API key |
| ListID | Integer | Yes | One of the user's lists |
| CounterDays | Integer | No | Days of counters, 1 to 90, today included. Default 7 |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/list.verification.settings \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "list.verification.settings.get",
      "APIKey": "your-api-key",
      "ListID": 12
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ListID": 12,
  "VerificationAvailable": true,
  "Settings": {
    "VerifyOnSubscribe": true,
    "VerifyRejectGroups": ["invalid"],
    "VerifyRejectRiskyReasons": ["disposable"],
    "VerifyTimeoutSeconds": 8,
    "VerifyDailyCap": 0
  },
  "Counters": {
    "Days": [
      {"Date": "2026-11-07", "Checked": 42, "Rejected": 3, "FailedOpen": 1},
      {"Date": "2026-11-06", "Checked": 0, "Rejected": 0, "FailedOpen": 0}
    ],
    "Totals": {"Checked": 42, "Rejected": 3, "FailedOpen": 1}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid ListID"
}
```

```txt [Error Codes]
0: Success
1: ListID is missing
2: Invalid ListID (not found or not the user's)
3: CounterDays must be a whole number from 1 to 90
9: The list verification settings could not be read
99998: Authentication failure
```

:::

## Update a List's Verification Settings

<Badge type="info" text="POST" /> `/api/v1/list.verification.settings`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `List.Update`
- Team member role permission: `Audience.Manage`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` (command `list.verification.settings.update`) is also supported
:::

Changes one or more of a list's email verification settings. A setting you leave out keeps its value. With `VerifyOnSubscribe` on, `subscriber.subscribe` (subscription forms and API callers) checks each new address before adding it and refuses the ones whose result is in the list's reject set. Journey subscribe actions are never checked. The check never blocks a signup when it cannot run: the subscriber is let in and counted as failed open. You can save the settings before email verification is available to the account; the check runs only while it is.

A safe address is never refused. A risky address is refused when `risky` is in `VerifyRejectGroups`, or when one of its reasons is in `VerifyRejectRiskyReasons`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.settings.update` |
| APIKey | String | Yes | User API key |
| ListID | Integer | Yes | One of the user's lists |
| VerifyOnSubscribe | Boolean | No | Check new subscribers. `true`/`false` (also `1`/`0`, `yes`/`no`, `on`/`off`) |
| VerifyRejectGroups | Array or String | No | Groups to refuse: `invalid`, `risky`, `unknown`, as an array or a comma-separated list. Empty refuses no group. Default `invalid` |
| VerifyRejectRiskyReasons | Array or String | No | Risky reasons to refuse: `accept_all`, `role`, `disposable`, `low_quality`. Default none |
| VerifyTimeoutSeconds | Integer | No | 1 to 20. How long a signup waits for the check before the subscriber is let in unchecked. Default 8 |
| VerifyDailyCap | Integer | No | 0 to 1000000. The most checks the list runs per UTC day; past it new subscribers are let in unchecked. 0 means no cap (default) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/list.verification.settings \
  -H "Content-Type: application/json" \
  -d '{
      "Command": "list.verification.settings.update",
      "APIKey": "your-api-key",
      "ListID": 12,
      "VerifyOnSubscribe": true,
      "VerifyRejectGroups": ["invalid"],
      "VerifyRejectRiskyReasons": ["disposable"],
      "VerifyDailyCap": 500
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ListID": 12,
  "VerificationAvailable": true,
  "Settings": {
    "VerifyOnSubscribe": true,
    "VerifyRejectGroups": ["invalid"],
    "VerifyRejectRiskyReasons": ["disposable"],
    "VerifyTimeoutSeconds": 8,
    "VerifyDailyCap": 500
  },
  "Counters": {
    "Days": [{"Date": "2026-11-07", "Checked": 0, "Rejected": 0, "FailedOpen": 0}],
    "Totals": {"Checked": 0, "Rejected": 0, "FailedOpen": 0}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "VerifyRejectGroups accepts invalid, risky and unknown"
}
```

```txt [Error Codes]
0: Success
1: ListID is missing
2: Invalid ListID (not found or not the user's)
3: VerifyOnSubscribe must be true or false
4: VerifyRejectGroups accepts invalid, risky and unknown
5: VerifyRejectRiskyReasons accepts accept_all, role, disposable and low_quality
6: VerifyTimeoutSeconds must be a whole number from 1 to 20
7: VerifyDailyCap must be a whole number from 0 to 1000000
8: No setting given
9: The list verification settings could not be read or saved
99998: Authentication failure
```

:::

The `Counters` in the response cover the last 7 days.

## Start a List Verification Run

<Badge type="info" text="POST" /> `/api/v1/list.verification.start`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `List.Update`
- Team member role permission: `Audience.Manage`
- Rate limit: 20 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Starts a bulk email verification run on one of your lists, or on one segment of it. The run covers subscribers that are subscribed and not bounced when it starts. Each unique address costs one verification credit, charged at once, all or nothing: when your balance is too small nothing is charged and the error states `Needed` and `Available`. Credits for addresses that end up not checked (removed from the list during the run, or not checkable) come back when the run ends. A list has one active run at a time. Follow the run with `list.verification.get`.

**The run object** (returned by every `list.verification.*` command):

| Field | Description |
|-------|-------------|
| RunID, ListID, SegmentID | The run, its list and its segment (`0` for the whole list) |
| Status | `pending` (counting the audience), `submitting` (sending addresses), `processing` (waiting for results), `completed`, `failed`, `cancelled` |
| CancelRequested | `true` once `list.verification.cancel` was called |
| Progress | 0 to 100 |
| TotalAddresses | Unique addresses the run was charged for |
| TotalSubscribers | Subscribers covered. Subscribers that share an address share its result |
| SubmittedAddresses | Addresses sent for checking so far |
| Batches | Groups of up to 50,000 addresses sent so far |
| CreditsCharged, CreditsReturned | Credits charged at start, and credits given back when the run ended |
| Counts | Subscribers per result group (`safe`, `risky`, `invalid`, `unknown`, `skipped`) and per risky reason |
| ErrorCode, ErrorMessage | Why a run failed, for example `upstream_credits` when the installation's my.octeth.com balance ran out |
| CreatedAt, FinishedAt, ResultsPurgeAt | UTC. Results are deleted at `ResultsPurgeAt` (30 days after the run by default) |
| ResultsAvailable | `false` once the results were deleted |
| Apply | The last action queued with `list.verification.apply`: `Status` (`none`, `pending`, `processing`, `completed`, `failed`), `Action`, `Groups`, `Reasons`, `Matched`, `Applied`, `RequestedAt`, `FinishedAt` |


**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.start` |
| APIKey | String | Yes | User API key |
| ListID | Integer | Yes | The list to verify |
| SegmentID | Integer | No | A segment of that list. Leave it out for the whole list |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/list.verification.start \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.start", "APIKey": "your-api-key", "ListID": 12}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Run": {
    "RunID": 7,
    "ListID": 12,
    "SegmentID": 0,
    "Status": "pending",
    "CancelRequested": false,
    "Progress": 0,
    "TotalAddresses": 120000,
    "TotalSubscribers": 0,
    "SubmittedAddresses": 0,
    "Batches": 0,
    "CreditsCharged": 120000,
    "CreditsReturned": 0,
    "Counts": {
      "safe": 0,
      "risky": 0,
      "invalid": 0,
      "unknown": 0,
      "skipped": 0,
      "reasons": {
        "accept_all": 0,
        "role": 0,
        "disposable": 0,
        "low_quality": 0
      }
    },
    "ErrorCode": "",
    "ErrorMessage": "",
    "CreatedAt": "2026-11-07 16:00:00",
    "FinishedAt": "",
    "ResultsPurgeAt": "",
    "ResultsAvailable": true,
    "Apply": {
      "Status": "none",
      "Action": "",
      "Groups": [],
      "Reasons": [],
      "Matched": 0,
      "Applied": 0,
      "RequestedAt": "",
      "FinishedAt": ""
    },
    "Finished": false
  },
  "Balance": 880
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 8,
  "ErrorText": "Not enough verification credits",
  "Needed": 120000,
  "Available": 500
}
```

```txt [Error Codes]
0: Success
1: ListID is missing or invalid
2: SegmentID is invalid
3: List not found
4: Segment not found on this list
5: Email verification is not available for this account
6: The list already has an active run (ActiveRunID names it)
7: No subscribed, not bounced subscribers to verify
8: Not enough verification credits (Needed, Available)
9: The segment could not be read
10: The run could not be created
99998: Authentication failure
99999: Not enough privileges
```

:::

## Get a List Verification Run

<Badge type="info" text="GET" /> `/api/v1/list.verification.get`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `List.Get`
- Team member role permission: `Account.Read`
- Rate limit: 240 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns one of your verification runs with its status, progress and result counts. Poll it every few seconds while `Finished` is `false`.

**The run object** (returned by every `list.verification.*` command):

| Field | Description |
|-------|-------------|
| RunID, ListID, SegmentID | The run, its list and its segment (`0` for the whole list) |
| Status | `pending` (counting the audience), `submitting` (sending addresses), `processing` (waiting for results), `completed`, `failed`, `cancelled` |
| CancelRequested | `true` once `list.verification.cancel` was called |
| Progress | 0 to 100 |
| TotalAddresses | Unique addresses the run was charged for |
| TotalSubscribers | Subscribers covered. Subscribers that share an address share its result |
| SubmittedAddresses | Addresses sent for checking so far |
| Batches | Groups of up to 50,000 addresses sent so far |
| CreditsCharged, CreditsReturned | Credits charged at start, and credits given back when the run ended |
| Counts | Subscribers per result group (`safe`, `risky`, `invalid`, `unknown`, `skipped`) and per risky reason |
| ErrorCode, ErrorMessage | Why a run failed, for example `upstream_credits` when the installation's my.octeth.com balance ran out |
| CreatedAt, FinishedAt, ResultsPurgeAt | UTC. Results are deleted at `ResultsPurgeAt` (30 days after the run by default) |
| ResultsAvailable | `false` once the results were deleted |
| Apply | The last action queued with `list.verification.apply`: `Status` (`none`, `pending`, `processing`, `completed`, `failed`), `Action`, `Groups`, `Reasons`, `Matched`, `Applied`, `RequestedAt`, `FinishedAt` |


**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.get` |
| APIKey | String | Yes | User API key |
| RunID | Integer | Yes | The run |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/list.verification.get \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.get", "APIKey": "your-api-key", "RunID": 7}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Run": {
    "RunID": 7,
    "ListID": 12,
    "SegmentID": 0,
    "Status": "completed",
    "CancelRequested": false,
    "Progress": 100,
    "TotalAddresses": 120000,
    "TotalSubscribers": 120050,
    "SubmittedAddresses": 120000,
    "Batches": 3,
    "CreditsCharged": 120000,
    "CreditsReturned": 75,
    "Counts": {
      "safe": 96010,
      "risky": 12010,
      "invalid": 12005,
      "unknown": 0,
      "skipped": 75,
      "reasons": {
        "accept_all": 0,
        "role": 12010,
        "disposable": 6005,
        "low_quality": 0
      }
    },
    "ErrorCode": "",
    "ErrorMessage": "",
    "CreatedAt": "2026-11-07 16:00:00",
    "FinishedAt": "2026-11-07 16:24:10",
    "ResultsPurgeAt": "2026-12-07 16:24:10",
    "ResultsAvailable": true,
    "Apply": {
      "Status": "none",
      "Action": "",
      "Groups": [],
      "Reasons": [],
      "Matched": 0,
      "Applied": 0,
      "RequestedAt": "",
      "FinishedAt": ""
    },
    "Finished": true
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Verification run not found"
}
```

```txt [Error Codes]
0: Success
1: RunID is missing or invalid
2: Run not found
99998: Authentication failure
99999: Not enough privileges
```

:::

## List Verification Runs

<Badge type="info" text="GET" /> `/api/v1/list.verification.list`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `List.Get`
- Team member role permission: `Account.Read`
- Rate limit: 120 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Lists your verification runs, newest first, for every list or for one. Page with `Cursor`: pass the `NextCursor` of the previous page until it is `0`. Each run has the shape described under `list.verification.get`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.list` |
| APIKey | String | Yes | User API key |
| ListID | Integer | No | Only this list's runs |
| Limit | Integer | No | Runs per page, 1 to 100 (default 25) |
| Cursor | Integer | No | `NextCursor` of the previous page |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/list.verification.list \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.list", "APIKey": "your-api-key", "ListID": 12}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Runs": [
    {
      "RunID": 7,
      "ListID": 12,
      "SegmentID": 0,
      "Status": "completed",
      "CancelRequested": false,
      "Progress": 100,
      "TotalAddresses": 120000,
      "TotalSubscribers": 120050,
      "SubmittedAddresses": 120000,
      "Batches": 3,
      "CreditsCharged": 120000,
      "CreditsReturned": 75,
      "Counts": {
        "safe": 96010,
        "risky": 12010,
        "invalid": 12005,
        "unknown": 0,
        "skipped": 75,
        "reasons": {
          "accept_all": 0,
          "role": 12010,
          "disposable": 6005,
          "low_quality": 0
        }
      },
      "ErrorCode": "",
      "ErrorMessage": "",
      "CreatedAt": "2026-11-07 16:00:00",
      "FinishedAt": "2026-11-07 16:24:10",
      "ResultsPurgeAt": "2026-12-07 16:24:10",
      "ResultsAvailable": true,
      "Apply": {
        "Status": "none",
        "Action": "",
        "Groups": [],
        "Reasons": [],
        "Matched": 0,
        "Applied": 0,
        "RequestedAt": "",
        "FinishedAt": ""
      },
      "Finished": true
    }
  ],
  "NextCursor": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Limit must be 1 to 100"
}
```

```txt [Error Codes]
0: Success
1: ListID is invalid
2: Limit is not 1 to 100
3: Cursor is not a NextCursor value
4: The runs could not be read
99998: Authentication failure
99999: Not enough privileges
```

:::

## Get List Verification Results

<Badge type="info" text="GET" /> `/api/v1/list.verification.results`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `Subscribers.Get`
- Team member role permission: `Account.Read`
- Rate limit: 120 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns one page of a run's results, one row per subscriber in subscriber ID order. `EmailAddress` is the subscriber's current address, empty when the subscriber was deleted since. `Group` is `safe`, `risky`, `invalid`, `unknown` or `skipped` (not checked, see `Reason`: `not_sent`, `not_checked`, `changed` when the subscriber left the list or changed address during the run, `not_charged`, `list_deleted`). For a checked address `Reason` is the mail server outcome, for example `accepted` or `mailbox_not_found`. `Reasons` narrows the risky group only. Results are kept 30 days after the run ends by default (`EMAIL_VERIFICATION_RESULTS_RETENTION_DAYS`).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.results` |
| APIKey | String | Yes | User API key |
| RunID | Integer | Yes | The run |
| Groups | Array or String | No | `safe`, `risky`, `invalid`, `unknown`, `skipped`, as an array or a comma list. Default: the first four |
| Reasons | Array or String | No | `accept_all`, `role`, `disposable`, `low_quality`. Narrows the risky group |
| Limit | Integer | No | Rows per page, 1 to 500 (default 100) |
| Cursor | Integer | No | `NextCursor` of the previous page |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/list.verification.results \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.results", "APIKey": "your-api-key", "RunID": 7, "Groups": ["invalid", "risky"], "Reasons": ["role"], "Limit": 100}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RunID": 7,
  "Results": [
    {
      "SubscriberID": 41,
      "EmailAddress": "info@example.com",
      "Group": "risky",
      "Reasons": [
        "role"
      ],
      "Flags": {
        "accept_all": false,
        "role": true,
        "disposable": false,
        "free": false,
        "mailbox_full": false,
        "no_reply": false
      },
      "Reason": "accepted",
      "Applied": false
    }
  ],
  "NextCursor": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 7,
  "ErrorText": "The results of this run were deleted after the retention period"
}
```

```txt [Error Codes]
0: Success
1: RunID is missing or invalid
2: Run not found
3: Groups are invalid
4: Reasons are invalid
5: Limit is not 1 to 500
6: Cursor is not a NextCursor value
7: The results were deleted after the retention period
8: The results could not be read
99998: Authentication failure
99999: Not enough privileges
```

:::

## Apply an Action to Verification Results

<Badge type="info" text="POST" /> `/api/v1/list.verification.apply`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `Subscriber.Update`
- Team member role permission: `Audience.Manage`
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Applies an action to the subscribers of a finished run whose result is in the chosen groups (and, for `risky`, reasons). The action runs in the background; follow it with `list.verification.get` (`Run.Apply`). `unsubscribe` (the default) unsubscribes the matching subscribers that are still subscribed, from this list only. `suppress` adds their addresses to this list's suppression list with a reason naming the result. `none` records the choice and changes nothing. One action runs at a time per run, and a later action can target other groups.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.apply` |
| APIKey | String | Yes | User API key |
| RunID | Integer | Yes | A finished run |
| Groups | Array or String | Yes | `safe`, `risky`, `invalid`, `unknown` |
| Reasons | Array or String | No | `accept_all`, `role`, `disposable`, `low_quality`. Narrows the risky group |
| Action | String | No | `unsubscribe` (default), `suppress` or `none` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/list.verification.apply \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.apply", "APIKey": "your-api-key", "RunID": 7, "Groups": ["invalid"], "Action": "unsubscribe"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Matched": 12005,
  "Run": {
    "RunID": 7,
    "ListID": 12,
    "SegmentID": 0,
    "Status": "completed",
    "CancelRequested": false,
    "Progress": 100,
    "TotalAddresses": 120000,
    "TotalSubscribers": 120050,
    "SubmittedAddresses": 120000,
    "Batches": 3,
    "CreditsCharged": 120000,
    "CreditsReturned": 75,
    "Counts": {
      "safe": 96010,
      "risky": 12010,
      "invalid": 12005,
      "unknown": 0,
      "skipped": 75,
      "reasons": {
        "accept_all": 0,
        "role": 12010,
        "disposable": 6005,
        "low_quality": 0
      }
    },
    "ErrorCode": "",
    "ErrorMessage": "",
    "CreatedAt": "2026-11-07 16:00:00",
    "FinishedAt": "2026-11-07 16:24:10",
    "ResultsPurgeAt": "2026-12-07 16:24:10",
    "ResultsAvailable": true,
    "Apply": {
      "Status": "pending",
      "Action": "unsubscribe",
      "Groups": [
        "invalid"
      ],
      "Reasons": [],
      "Matched": 12005,
      "Applied": 0,
      "RequestedAt": "2026-11-07 16:30:00",
      "FinishedAt": ""
    },
    "Finished": true
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 8,
  "ErrorText": "An action is already running on this verification run"
}
```

```txt [Error Codes]
0: Success
1: RunID is missing or invalid
2: Run not found
3: Groups are missing or invalid
4: Reasons are invalid
5: Action is not unsubscribe, suppress or none
6: The run has not finished
7: The results were deleted after the retention period
8: An action is already running on this run
9: The action could not be queued
99998: Authentication failure
99999: Not enough privileges
```

:::

## Cancel a List Verification Run

<Badge type="info" text="POST" /> `/api/v1/list.verification.cancel`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permission: `List.Update`
- Team member role permission: `Audience.Manage`
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Cancels an active run. No more addresses are sent. Addresses already sent finish checking and keep their results. When the run ends (`Status` `cancelled`) the credits for every address that was not checked come back.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `list.verification.cancel` |
| APIKey | String | Yes | User API key |
| RunID | Integer | Yes | An active run |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/list.verification.cancel \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.cancel", "APIKey": "your-api-key", "RunID": 7}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Run": {
    "RunID": 7,
    "ListID": 12,
    "SegmentID": 0,
    "Status": "submitting",
    "CancelRequested": true,
    "Progress": 30,
    "TotalAddresses": 120000,
    "TotalSubscribers": 120050,
    "SubmittedAddresses": 120000,
    "Batches": 3,
    "CreditsCharged": 120000,
    "CreditsReturned": 75,
    "Counts": {
      "safe": 96010,
      "risky": 12010,
      "invalid": 12005,
      "unknown": 0,
      "skipped": 75,
      "reasons": {
        "accept_all": 0,
        "role": 12010,
        "disposable": 6005,
        "low_quality": 0
      }
    },
    "ErrorCode": "",
    "ErrorMessage": "",
    "CreatedAt": "2026-11-07 16:00:00",
    "FinishedAt": "",
    "ResultsPurgeAt": "",
    "ResultsAvailable": true,
    "Apply": {
      "Status": "none",
      "Action": "",
      "Groups": [],
      "Reasons": [],
      "Matched": 0,
      "Applied": 0,
      "RequestedAt": "",
      "FinishedAt": ""
    },
    "Finished": false
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "The verification run is not active"
}
```

```txt [Error Codes]
0: Success
1: RunID is missing or invalid
2: Run not found
3: The run is not active
4: The run could not be cancelled
99998: Authentication failure
99999: Not enough privileges
```

:::
