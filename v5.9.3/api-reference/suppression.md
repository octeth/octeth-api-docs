---
layout: doc
---

# Suppression List API Documentation

Suppression list management endpoints for browsing, importing, deleting, and aggregating email addresses from the suppression list.

The `SuppressionSource` column is a fixed enumeration. The valid values are:

- `Administrator`
- `User`
- `SPAM complaint`
- `Hard Bounced`
- `Unsubscribe`

## Browse Suppression List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.browse`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SearchPattern | String | No   | Search pattern for filtering email addresses (supports `*` wildcard). When supplied, `TotalRecords` reflects the filtered count. |
| SuppressionSource | String | No | Restrict results to one or more sources. Comma-separated list of `SuppressionSource` ENUM values (e.g. `Hard Bounced,SPAM complaint`). |
| ListID | Integer | No | Scope the browse to a single subscriber list. When omitted or `0`, returns the user-wide global suppression list (today's default behavior). When non-zero, the list must be owned by the authenticated user; otherwise the call fails with `ErrorCode: 4`. |
| StartFrom | Integer | No      | Starting record index for pagination (default: 0) |
| RetrieveCount | Integer | No  | Number of records to retrieve (default: 100) |

**Response Shape:**

`SuppressedEmails` is an associative map keyed by email address (not a JSON array). Use `Object.values()` (or the equivalent in your language) if you need a list. `TotalRecords` reflects whatever filters (`SearchPattern`, `SuppressionSource`) the request set, so paging math always lines up with the rendered page.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.browse",
    "SessionID": "your-session-id",
    "SearchPattern": "*@example.com",
    "SuppressionSource": "Hard Bounced,SPAM complaint",
    "StartFrom": 0,
    "RetrieveCount": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 12,
  "SuppressedEmails": {
    "user@example.com": {
      "SuppressionID": "1234",
      "RelListID": "0",
      "RelOwnerUserID": "42",
      "EmailAddress": "user@example.com",
      "SuppressionSource": "Hard Bounced",
      "Reason": "Bounce: 550 mailbox unavailable"
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
1: Invalid SuppressionSource value
4: Invalid ListID — list does not exist or is not owned by the authenticated user
```

:::

## Check Suppression Status

<Badge type="info" text="POST" /> `/api.php`

<Badge type="tip" text="New in v5.9.3" />

Answers, for up to **500** addresses in a single call, whether each address matches a suppression entry **and which scope tier matched** — so an interface can explain *why* an address is suppressed instead of showing a bare flag.

The suppression list is a two-dimensional scope matrix (`RelListID` × `RelOwnerUserID`, where `0` means "any"). This command applies the full matrix, which is the same semantics the send path uses, so it sees per-list, account-wide **and** system-wide entries.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.check`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddresses | String | No* | JSON-encoded array of email addresses, e.g. `["a@example.com","b@example.com"]`. A JSON request body may also send a real array. |
| EmailAddressesBulk | String | No* | Newline-separated email addresses. May be combined with `EmailAddresses`; the two sets are merged. |
| ListID | Integer | No | Scope the check to a single subscriber list. When omitted or `0`, only account-wide and system-wide entries are considered. When non-zero, the list must be owned by the authenticated user; otherwise the call fails with `ErrorCode: 4`. |

\* At least one of `EmailAddresses` or `EmailAddressesBulk` is required. Both can be provided simultaneously.

Parameter names are matched case-insensitively, as everywhere on `/api.php`.

**Input Handling:**

Addresses are trimmed and validated with `FILTER_VALIDATE_EMAIL`; rejects are echoed back in `FailedEmailAddresses` and counted in `TotalFailed`. Valid addresses are deduplicated **case-sensitively**, so `a@example.com` and `A@example.com` are both checked and both reported (see the case-sensitivity note below).

More than 500 valid addresses after deduplication fails with `ErrorCode: [5]` — the request is **never** silently truncated, because truncating would return a confidently wrong "not suppressed" for every address past the cap.

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| ListID | Integer | The scope the check was performed at (`0` = account and system scopes only) |
| TotalChecked | Integer | Number of valid, deduplicated addresses checked |
| TotalFailed | Integer | Number of addresses rejected as malformed |
| SuppressionCheckDisabled | Boolean | `true` when the account has the *Disable suppression check* option set. Suppression state is still reported **raw**; this flag tells the caller that the transactional send path will ignore it. |
| Results | Object | Map keyed by the email address exactly as submitted (not a JSON array) |
| FailedEmailAddresses | Array | Addresses that failed validation |

Each `Results` entry:

| Field | Type | Description |
|-------|------|-------------|
| IsSuppressed | Boolean | `true` when the address matched at least one suppression list entry under the scope matrix |
| MatchedScopes | Array | One entry per matched row, ordered narrowest first: `PerList` → `AccountWide` → `SystemWide`. Empty when `IsSuppressed` is `false`. |
| IsPatternSuppressed | Boolean | `true` when the address matches a global suppression **pattern**. Reported separately — see below. |

Each `MatchedScopes` entry:

| Field | Type | Description |
|-------|------|-------------|
| Scope | String | `PerList`, `AccountWide` or `SystemWide` |
| SuppressionSource | String | One of the `SuppressionSource` ENUM values listed at the top of this page |
| Reason | String | Free-text reason stored with the entry; `""` when not set |

**Scope meanings:**

| Scope | Stored as | Typically written by |
|-------|-----------|----------------------|
| `PerList` | `RelListID = <id>` | list-scoped opt-outs and bulk "remove and suppress" actions |
| `AccountWide` | `RelListID = 0`, `RelOwnerUserID = <uid>` | the in-product "Add to suppression list" action (the common case) |
| `SystemWide` | `RelListID = 0`, `RelOwnerUserID = 0` | hard bounces and spam complaints |

::: warning `IsPatternSuppressed` is deliberately separate
Suppression patterns are **not** folded into `IsSuppressed`, because the two send paths disagree: patterns are applied on transactional, email gateway and journey sends, but a list-scoped campaign send does **not** apply them. An address matching only a pattern is dropped on a transactional send and delivered on a campaign send. Collapsing that into a single boolean would be misleading, so both are reported and the caller decides which send path it cares about.
:::

::: warning Case sensitivity
`EmailAddress` is stored with a case-insensitive collation, so the suppression list match ignores case. Pattern matching is case-**sensitive** for some pattern types. Two addresses differing only in case can therefore get the same `IsSuppressed` but a different `IsPatternSuppressed`, which is why both are reported separately and why input is never normalised to lower case.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.check",
    "SessionID": "your-session-id",
    "ListID": 47,
    "EmailAddresses": "[\"a@example.com\",\"b@example.com\",\"c@example.com\"]"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ListID": 47,
  "TotalChecked": 3,
  "TotalFailed": 0,
  "SuppressionCheckDisabled": false,
  "Results": {
    "a@example.com": {
      "IsSuppressed": true,
      "MatchedScopes": [
        { "Scope": "AccountWide", "SuppressionSource": "User", "Reason": "" }
      ],
      "IsPatternSuppressed": false
    },
    "b@example.com": {
      "IsSuppressed": true,
      "MatchedScopes": [
        { "Scope": "PerList", "SuppressionSource": "Unsubscribe", "Reason": "" },
        { "Scope": "SystemWide", "SuppressionSource": "Hard Bounced", "Reason": "550 mailbox unavailable" }
      ],
      "IsPatternSuppressed": false
    },
    "c@example.com": {
      "IsSuppressed": false,
      "MatchedScopes": [],
      "IsPatternSuppressed": false
    }
  },
  "FailedEmailAddresses": []
}
```

```json [Error Response — over the cap]
{
  "Success": false,
  "ErrorCode": [5],
  "MaxEmailAddresses": 500,
  "TotalSubmitted": 640
}
```

```txt [Error Codes]
0: Success
1: Missing input — neither EmailAddresses nor EmailAddressesBulk was provided
2: EmailAddresses is present but is not an array (malformed JSON), or no address from
   either input passed validation. An empty EmailAddresses array is not itself an error
   when EmailAddressesBulk supplies addresses. This response also carries TotalFailed
   and FailedEmailAddresses.
4: Invalid ListID — list does not exist or is not owned by the authenticated user
5: More than 500 valid addresses after deduplication. The response also carries
   MaxEmailAddresses and TotalSubmitted.
6: The suppression lookup query failed. The call fails rather than reporting a
   misleading "nothing is suppressed".
```

:::

::: warning Known divergence from the other suppression endpoints
`suppression.check` applies the full scope matrix. `suppression.browse`, `suppression.stats`, `suppression.delete`, the per-subscriber `Suppressed` flag and the "suppression exists" segment rule still match on exact equality for both scope columns, so they do **not** see account-wide or system-wide entries. Until that is corrected, the same address can legitimately be reported as suppressed here and not appear in `suppression.browse`. This command is the one that agrees with the send path.
:::

## Suppression Stats

<Badge type="info" text="POST" /> `/api.php`

Returns the total suppression count and a per-source breakdown for the authenticated user. Useful for rendering "Total / Manual / Bounce / Complaint / Unsubscribe" stat strips without fanning out into multiple `suppression.browse` calls. All ENUM values are always present in `BySource` (zero when absent) so typed clients see a stable shape.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.stats`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SearchPattern | String | No   | Optional pattern for filtering by email (supports `*` wildcard). |
| SuppressionSource | String | No | Optional comma-separated list of `SuppressionSource` ENUM values. When supplied, `Total` and `BySource` only reflect those sources. |
| ListID | Integer | No | Scope the counts to a single subscriber list. When omitted or `0`, counts the user-wide global suppression list (today's default behavior). When non-zero, the list must be owned by the authenticated user; otherwise the call fails with `ErrorCode: 4`. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.stats",
    "APIKey": "your-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Total": 1240,
  "BySource": {
    "Administrator": 5,
    "User": 312,
    "SPAM complaint": 14,
    "Hard Bounced": 871,
    "Unsubscribe": 38
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
1: Invalid SuppressionSource value
4: Invalid ListID — list does not exist or is not owned by the authenticated user
```

:::

## Delete from Suppression List

<Badge type="info" text="POST" /> `/api.php`

Accepts either a single address (legacy) or a bulk payload. The bulk path returns counts and a list of skipped (invalid) addresses.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.delete`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddress | String | No*   | Single email address to remove (legacy single-delete path). |
| EmailAddresses | String | No* | JSON-encoded array of email addresses (bulk path). |
| EmailAddressesBulk | String | No* | Newline-separated email addresses (bulk path). |
| ListID | Integer | No | Scope the delete to a single subscriber list. When omitted or `0`, only rows on the user-wide global suppression list are removed (today's default behavior). When non-zero, only rows with matching `RelListID` are removed; the same address suppressed on other scopes is left untouched. The list must be owned by the authenticated user; otherwise the call fails with `ErrorCode: 4`. |

\* At least one of `EmailAddress`, `EmailAddresses`, or `EmailAddressesBulk` is required. When any of the bulk parameters is set, the legacy single-address validation is skipped and the response uses the bulk shape (with `TotalDeleted`, `TotalFailed`, `FailedEmailAddresses`).

::: code-group

```bash [Example Request — single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.delete",
    "SessionID": "your-session-id",
    "EmailAddress": "user@example.com"
  }'
```

```bash [Example Request — bulk]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.delete",
    "APIKey": "your-api-key",
    "EmailAddresses": "[\"a@example.com\",\"b@example.com\"]",
    "EmailAddressesBulk": "c@example.com\nd@example.com"
  }'
```

```json [Success Response — single]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Success Response — bulk]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalDeleted": 4,
  "TotalFailed": 0,
  "FailedEmailAddresses": []
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
1: Missing input — none of EmailAddress, EmailAddresses, or EmailAddressesBulk was provided
2: Invalid email address (single path), email not in suppression list (single path), or invalid JSON in EmailAddresses
4: Invalid ListID — list does not exist or is not owned by the authenticated user
```

:::

## Import to Suppression List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.import`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddresses | String | No* | JSON-encoded array of email addresses to import |
| EmailAddressesBulk | String | No* | Newline-separated list of email addresses to import |
| SuppressionSource | String | No | Override the source recorded for imported rows. Must be one of the `SuppressionSource` ENUM values. Defaults to `User`. |
| Reason | String | No | Override the reason recorded for imported rows. Capped at 250 characters. Defaults to `Suppression List Import`. |
| ListID | Integer | No | Write imported rows scoped to a single subscriber list. When omitted or `0`, imports go to the user-wide global suppression list (`RelListID = 0`, today's default behavior). When non-zero, the list must be owned by the authenticated user; otherwise the call fails with `ErrorCode: 4` and no rows are written. Applies to both `EmailAddresses` and `EmailAddressesBulk` paths. |

\* **Note:** Either `EmailAddresses` or `EmailAddressesBulk` must be provided. Both can be provided simultaneously.

**Response Counters:**

The response returns three fields: `TotalImported`, `TotalFailed` and `FailedEmailAddresses`.

- `TotalImported` counts **only rows actually persisted** to the suppression list.
- `TotalFailed` counts **only malformed email addresses** — inputs that fail `FILTER_VALIDATE_EMAIL`. It does not mean "everything that was not imported". Each such address is also echoed back in `FailedEmailAddresses`.

::: warning Counters may not add up to the number of addresses you submitted
`TotalImported + TotalFailed` can be **less than** the number of addresses in your request. Four kinds of input increment neither counter:

1. **Blank lines** in `EmailAddressesBulk` (a trailing newline, or blank lines between addresses) are skipped before any counting.
2. **Duplicates** — an address already present in the target suppression list is skipped without being inserted.
3. **Whitelisted** addresses — skipped without being inserted.
4. **A failed database insert** — a genuine write failure is silently not counted. This is a known caveat: such an address is neither reported in `TotalImported` nor in `TotalFailed` / `FailedEmailAddresses`.

If your integration reconciles the response against the number of addresses you sent (for example asserting `TotalImported + TotalFailed == count(addresses)`), that check needs updating — treat `TotalImported` as "newly suppressed", `TotalFailed` as "rejected as malformed", and the remainder as "already suppressed, whitelisted, blank, or not written".
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.import",
    "SessionID": "your-session-id",
    "EmailAddresses": "[\"user1@example.com\", \"user2@example.com\"]",
    "EmailAddressesBulk": "user3@example.com\nuser4@example.com\nuser5@example.com",
    "SuppressionSource": "Hard Bounced",
    "Reason": "Imported from bounce log 2026-04-30"
  }'
```

```json [Success Response — all 5 new and valid]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalImported": 5,
  "TotalFailed": 0,
  "FailedEmailAddresses": []
}
```

```json [Success Response — with skipped addresses]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalImported": 2,
  "TotalFailed": 1,
  "FailedEmailAddresses": ["not-an-email"]
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
1: Missing EmailAddresses parameter
2: Missing EmailAddressesBulk parameter or invalid EmailAddresses format (both parameters are missing or EmailAddresses JSON is invalid)
3: Invalid SuppressionSource value
4: Invalid ListID — list does not exist or is not owned by the authenticated user
```

:::
