---
layout: doc
---

# Journey API Documentation

Journey management endpoints for creating, updating, and managing customer journeys. Journeys allow you to automate subscriber interactions based on triggers and actions.

## Create a Journey

<Badge type="info" text="POST" /> `/api/v1/journey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `journey.create`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Name      | String | Yes      | Name of the journey                   |
| Trigger   | String | No       | Journey trigger type (default: `Manual`). Possible values: `Manual`, `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Tag`, `UnTag`, `CustomFieldValueChanged`, `RevenueHit`, `JourneyCompleted`, `ScheduledPull`, `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, `WebsiteEvent_conversion`. See [Scheduled Pull Trigger](#scheduled-pull-trigger) for its additional parameters. |
| TriggerParameters | Object | No | Trigger-specific settings. Required for the `ScheduledPull` trigger (interval, subscriber count, time window, frequency cap). See [Scheduled Pull Trigger](#scheduled-pull-trigger). |
| Trigger_ListID | Integer | No  | List ID for list-based triggers      |
| Trigger_EmailID | Integer | No | Email ID for email-based triggers    |
| Trigger_Value | String/Integer | No | Trigger value for specific triggers |
| Trigger_Criteria | Array | No  | Criteria for trigger conditions      |
| Run_Criteria | Array | No      | Run criteria for journey execution    |
| Run_Criteria_Operator | String | No | Operator for run criteria. Possible values: `and`, `or` (default: `and`) |
| Rate_Limit_Per_Hour | Integer | No | Hourly rate limit for journey triggers |
| Rate_Limit_Per_Day | Integer | No | Daily rate limit for journey triggers |
| Notes     | String | No       | Journey notes                         |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.create",
    "SessionID": "your-session-id",
    "Name": "Welcome Series",
    "Trigger": "ListSubscription",
    "Trigger_ListID": 123,
    "Notes": "Onboarding journey for new subscribers"
  }'
```

```json [Success Response]
{
  "JourneyID": 456,
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series",
    "Trigger": "ListSubscription",
    "Status": "Disabled",
    "Notes": "Onboarding journey for new subscribers",
    "CreatedAt": "2025-01-15 10:30:00",
    "UpdatedAt": "2025-01-15 10:30:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Name parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing Name parameter
3: Invalid trigger
4: Missing Trigger_ListID parameter
5: Invalid Trigger_ListID parameter
6: Trigger_ListID matching record not found
7: Missing Trigger_EmailID parameter
8: Invalid Trigger_EmailID parameter
9: Trigger_EmailID matching record not found
10: Invalid Trigger_Value parameter
11: Trigger_Value matching record not found
12: Invalid Trigger_Value parameter (CustomFieldValueChanged)
13: Trigger_Value matching record not found (CustomFieldValueChanged)
14: Invalid Trigger_Value parameter (RevenueHit)
15: Missing Trigger_Value parameter (RevenueHit)
16: Invalid Trigger_Value parameter (JourneyCompleted)
17: Trigger_Value matching record not found (JourneyCompleted)
18: Invalid rate_limit_per_hour parameter
19: Invalid rate_limit_per_day parameter
20: Missing or invalid Trigger_ListID parameter for ScheduledPull trigger
21: Trigger_ListID matching record not found (ScheduledPull)
```

:::

### Scheduled Pull Trigger

Unlike event-based triggers (which fire when a subscriber does something), the `ScheduledPull` trigger periodically pulls a batch of random subscribers from a list and enrolls them into the journey on a recurring schedule. It is useful for list warm-up, drip re-engagement, and steady-rate enrollment.

When `Trigger` is set to `ScheduledPull`:

- `Trigger_ListID` is **required** — it is the list subscribers are pulled from (must be a positive list ID owned by the user).
- All scheduling behavior is supplied via the `TriggerParameters` object. Any keys you omit fall back to the defaults below.

**`TriggerParameters` keys:**

| Key                   | Type    | Default     | Description                                                                                              |
|-----------------------|---------|-------------|----------------------------------------------------------------------------------------------------------|
| IntervalValue         | Integer | `60`        | How often the pull runs, combined with `IntervalUnit`.                                                    |
| IntervalUnit          | String  | `minutes`   | Unit for `IntervalValue`. Values: `minutes`, `hours`, `days`. The effective interval is floored at 60 seconds. |
| SubscriberCountMode   | String  | `fixed`     | How many subscribers to pull per run. Values: `fixed`, `random`.                                          |
| SubscriberCountFixed  | Integer | `10`        | Number of subscribers pulled per run when `SubscriberCountMode` is `fixed`.                               |
| SubscriberCountMin    | Integer | `1`         | Lower bound when `SubscriberCountMode` is `random`.                                                       |
| SubscriberCountMax    | Integer | `SubscriberCountMin` | Upper bound when `SubscriberCountMode` is `random`.                                              |
| TimeConstraintEnabled | Boolean | `false`     | When `true`, pulls only run inside the time window defined below. When `false`, pulls run on every due interval. |
| AllowedDays           | Array   | (none)      | Day-of-week abbreviations when pulls may run. Values: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`. Only applies when `TimeConstraintEnabled` is `true`; an empty list blocks all pulls. |
| DontSendBefore        | String  | `00:00`     | Earliest time of day a pull may run, `HH:MM`. Only applies when `TimeConstraintEnabled` is `true`.        |
| DontSendAfter         | String  | `23:59`     | Latest time of day a pull may run, `HH:MM`. Only applies when `TimeConstraintEnabled` is `true`.          |
| FrequencyCapEnabled   | Boolean | `false`     | When `true`, limits how often the same subscriber can be re-enrolled by this trigger.                     |
| FrequencyCapCount     | Integer | `0`         | Maximum number of enrollments per subscriber within the frequency-cap period.                             |
| FrequencyCapPeriod    | Integer | `0`         | Length of the frequency-cap window, combined with `FrequencyCapUnit`.                                     |
| FrequencyCapUnit      | String  | `days`      | Unit for `FrequencyCapPeriod`. Values: `minutes`, `hours`, `days`.                                        |

The time window is evaluated in the journey owner's timezone. The top-level `Run_Criteria` / `Run_Criteria_Operator` (subscriber filtering) and `Rate_Limit_Per_Hour` / `Rate_Limit_Per_Day` parameters also apply to `ScheduledPull` journeys.

::: tip Key casing
The `TriggerParameters` keys above are **case-insensitive on input** — you may send them in any case (e.g. `intervalValue`, `intervalvalue`, or `IntervalValue`). They are normalized to the canonical PascalCase shown in the table before being stored, and `journey.get` always returns them in PascalCase. Sending the canonical PascalCase keys is recommended.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.create",
    "SessionID": "your-session-id",
    "Name": "List Warm-up",
    "Trigger": "ScheduledPull",
    "Trigger_ListID": 123,
    "TriggerParameters": {
      "IntervalValue": 1,
      "IntervalUnit": "hours",
      "SubscriberCountMode": "random",
      "SubscriberCountMin": 5,
      "SubscriberCountMax": 25,
      "TimeConstraintEnabled": true,
      "AllowedDays": ["mon", "tue", "wed", "thu", "fri"],
      "DontSendBefore": "09:00",
      "DontSendAfter": "17:00",
      "FrequencyCapEnabled": true,
      "FrequencyCapCount": 1,
      "FrequencyCapPeriod": 7,
      "FrequencyCapUnit": "days"
    },
    "Notes": "Pull up to 25 subscribers hourly during business hours"
  }'
```

:::

## Clone a Journey

<Badge type="info" text="POST" /> `/api/v1/journey.clone`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.clone`          |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to clone            |
| NewJourneyName | String | Yes | Name for the cloned journey          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey.clone \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.clone",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "NewJourneyName": "Welcome Series Copy"
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "789",
    "JourneyName": "Welcome Series Copy",
    "Trigger": "ListSubscription",
    "TriggerParameters": {
      "ListID": 123
    },
    "Status": "Disabled",
    "Notes": "Copy of journey Welcome Series"
  },
  "Actions": []
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing NewJourneyName parameter
2: Missing JourneyID parameter
3: Journey not found
4: Journey not cloned successfully
```

:::

## Copy Journey to Another User

<Badge type="info" text="POST" /> `/api/v1/journey.copytouser`

::: tip API Usage Notes
- Authentication required: Admin API Key
- This is an admin-only endpoint
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

::: info Resource Handling
When copying a journey to another user:
- **Email templates** referenced in `SendEmail` actions are automatically copied to the target user. Duplicate emails are only copied once.
- **Other user-specific resources** (lists, tags, custom fields, sender domains, SMS gateways, journey references) are reset to `0`. The target user must configure these in the Journey Builder.
- **Journey trigger** is always reset to `Manual`. The target user must configure the trigger.
- **Journey status** is always set to `Disabled`.
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.copytouser`     |
| AdminAPIKey | String | Yes     | Admin API key for authentication      |
| JourneyID | Integer | Yes      | ID of the source journey to copy      |
| SourceUserID | Integer | Yes   | ID of the user who owns the source journey |
| TargetUserID | Integer | Yes   | ID of the user to copy the journey to |
| NewJourneyName | String | No   | Name for the copied journey. Defaults to "Copy of {original name}" |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey.copytouser \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.copytouser",
    "AdminAPIKey": "your-admin-api-key",
    "JourneyID": 456,
    "SourceUserID": 1,
    "TargetUserID": 2,
    "NewJourneyName": "Welcome Series for User 2"
  }'
```

```json [Success Response]
{
  "Success": true,
  "JourneyID": 789,
  "EmailsCopied": [
    {
      "SourceEmailID": 123,
      "NewEmailID": 456
    }
  ],
  "ResourcesReset": [
    "SenderDomainID",
    "TargetListID"
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 9,
      "Message": "Journey not found for source user"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing SourceUserID parameter
3: Missing TargetUserID parameter
4: Invalid JourneyID (non-numeric)
5: Invalid SourceUserID (non-numeric)
6: Invalid TargetUserID (non-numeric)
7: Source user not found
8: Target user not found
9: Journey not found for source user
10: Failed to create journey
```

:::

## Get a Journey

<Badge type="info" text="GET" /> `/api/v1/journey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.get`            |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to retrieve         |
| StartDate | String  | No       | Start date for stats (YYYY-MM-DD)     |
| EndDate   | String  | No       | End date for stats (YYYY-MM-DD)       |
| IncludeActivityCounters | Boolean | No | When truthy (`1`, `true`, `yes`, `on`), the `JourneyStats` block also includes `LastTriggeredAt`, `LastActivityAt`, and `TotalEnrolledLifetime`. Defaults to `false` so existing consumers see the same shape they do today. |
| EmailID | Integer | No | Scope `JourneyStats.AggregatedEmailActions` to a single `SendEmail` action on this journey (issue #2019). Must reference an action whose `Action='SendEmail'` and that belongs to this journey + caller. Reads the per-action ISP cache. Defaults to unset (journey-wide aggregate, unchanged). |
| ISP | String | No | Scope `JourneyStats.AggregatedEmailActions` to a single ISP domain (issue #2019). Must match `/^[a-zA-Z0-9.-]+$/`. Defaults to unset. Combine with `EmailID` to intersect (one action × one ISP). |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.get",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "StartDate": "2025-01-01",
    "EndDate": "2025-01-31"
  }'
```

```json [Success Response]
{
  "JourneyID": "456",
  "JourneyName": "Welcome Series",
  "Trigger": "ListSubscription",
  "TriggerParameters": {
    "ListID": 123
  },
  "Status": "Enabled",
  "Notes": "Onboarding journey",
  "Actions": [],
  "JourneyStats": {
    "ActiveSubscribers": 150,
    "TotalSubscribers": 500
  }
}
```

::: info Optional activity counters
When `IncludeActivityCounters=1` is passed, the `JourneyStats` block also includes:

| Field | Type | Description |
|-------|------|-------------|
| `LastTriggeredAt` | string or null | Most recent enrollment (`MAX(oempro_journeys_entries.CreatedAt)`), `Y-m-d H:i:s` format. `null` when the journey has never been triggered. |
| `LastActivityAt` | string or null | Most recent log row of any kind (`MAX(oempro_journeys_logs.CreatedAt)`), same format. `null` when no activity has been recorded. |
| `TotalEnrolledLifetime` | int | `COUNT(DISTINCT RelSubscriberID)` of subscribers who have ever been enrolled. Distinct from `TotalSubscribers` (which counts every enrollment row — a subscriber re-enrolled twice contributes 2 to `TotalSubscribers` but 1 to `TotalEnrolledLifetime`). |

These counters require two extra index-driven queries (one on `journeys_entries`, one on `journeys_logs`) and are off by default to keep the existing latency profile.
:::

::: info Per-action revenue fields (issue #2010)
Each `SendEmail` entry in the `Actions` array also exposes two top-level revenue fields, sourced from the same daily cache that powers the existing `Stats.TotalRevenue` and `DailyStats[].TotalRevenue`:

| Field | Type | Description |
|-------|------|-------------|
| `Revenue` | float | Total revenue attributed to this action over the response window, in currency units (dollars). Same scale as `JourneyStats.TotalRevenue`. |
| `DaysRevenue` | array | Daily revenue series: `[{ "Date": "YYYY-MM-DD", "Amount": 0.0 }, ...]` sorted ascending by `Date`. Zero-amount days are included so consumers can chart a continuous x-axis without gap-fill logic. |

Non-`SendEmail` actions (`Wait`, `Decision`, `AddTag`, etc.) do not have these fields — consistent with how `Stats` and `DailyStats` already behave for non-revenue-generating actions. No extra queries are required to produce the fields; they reuse data the response already computes.
:::

::: info Filtered `AggregatedEmailActions` (issue #2019)
When `EmailID` or `ISP` is passed, `JourneyStats.AggregatedEmailActions` is computed from the per-ISP cache instead of the journey-wide cache. The same 11 keys are returned in both modes for shape stability:

| Field | Behavior under filter |
|-------|-----------------------|
| `SendCount`, `DeliveryCount`, `OpenCount`, `ClickCount`, `BounceCount`, `UnsubscribeCount`, `SpamComplaintCount` | Summed across rows matching the filter slice. |
| `TotalRevenue` | Summed and converted from cents to currency units (matches the unfiltered shape). |
| `ConversionCount`, `BrowserViewCount`, `ForwardCount` | Always returned as `0` under filter (the per-ISP cache does not track these three counters today). |

**Time window:** the filtered `AggregatedEmailActions` is always an **all-time** aggregate — same semantics as the unfiltered path. `StartDate` and `EndDate` only drive the date-windowed `AggregatedDaysEmailActions` sub-block, never the lifetime summary. When neither `EmailID` nor `ISP` is set, the response is byte-identical to today's contract.
:::

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
4: Invalid StartDate format
5: Invalid EndDate format
6: StartDate must be before EndDate
7: Invalid EmailID parameter (not a positive integer, or not a SendEmail action on this journey)
8: Invalid ISP parameter (must match /^[a-zA-Z0-9.-]+$/)
```

:::

## List Journeys

<Badge type="info" text="GET" /> `/api/v1/journeys`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `journey.list`           |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| StatsStartDate | String | No  | Start date for stats (YYYY-MM-DD)     |
| StatsEndDate | String | No    | End date for stats (YYYY-MM-DD)       |
| SkipStats | Boolean | No      | When truthy (`1`, `true`, `yes`), the per-row `JourneyStats` block is omitted entirely. Default: `false` (full stats are returned). Empty string is treated as absent. |
| IncludeActivityCounters | Boolean | No | When truthy, each row's `JourneyStats` block gains `LastTriggeredAt`, `LastActivityAt`, and `TotalEnrolledLifetime` (see the `journey.get` reference for definitions). Batched in two queries total regardless of journey count. When combined with `SkipStats=1`, the entire `JourneyStats` block stays suppressed — counters are not produced standalone. Default: `false`. |

::: tip About `SkipStats`
This flag is intended for callers that only need the flat list of journeys (e.g. dropdown pickers in segment rule-builders) and don't display stats. When set, the endpoint skips four `JourneyStats` queries per journey plus the per-row stats join, so it's substantially cheaper for users with many journeys.

When `SkipStats=1`, consumers must check `array_key_exists('JourneyStats', $row)` rather than reading `$row['JourneyStats']` — the key is **omitted**, not set to `null` or `[]`.

Date validation (`StatsStartDate`, `StatsEndDate`) still runs even with `SkipStats=1`, so malformed dates are rejected the same way they would be without the flag.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journeys \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.list",
    "SessionID": "your-session-id",
    "StatsStartDate": "2025-01-01",
    "StatsEndDate": "2025-01-31"
  }'
```

```bash [Example (SkipStats)]
curl -X GET https://example.com/api/v1/journeys \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.list",
    "SessionID": "your-session-id",
    "SkipStats": 1
  }'
```

```json [Success Response]
{
  "Journeys": [
    {
      "JourneyID": "456",
      "JourneyName": "Welcome Series",
      "Trigger": "ListSubscription",
      "TriggerParameters": {
        "ListID": 123
      },
      "Status": "Enabled",
      "JourneyStats": {
        "ActiveSubscribers": 150,
        "TotalSubscribers": 500,
        "AggregatedEmailActions": {},
        "AggregatedDaysEmailActions": [],
        "TotalRevenue": 0,
        "DaysRevenue": []
      }
    }
  ]
}
```

```json [SkipStats=1 Response]
{
  "Journeys": [
    {
      "JourneyID": "456",
      "JourneyName": "Welcome Series",
      "Trigger": "ListSubscription",
      "TriggerParameters": {
        "ListID": 123
      },
      "Status": "Enabled"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Invalid StatsStartDate format"
    }
  ]
}
```

```txt [Error Codes]
0: Success
4: Invalid StatsStartDate format
5: Invalid StatsEndDate format
6: StatsStartDate must be before StatsEndDate
```

:::

## List SendEmail Actions Across Journeys

<Badge type="info" text="GET" /> `/api/v1/journey.sendemailactions`

Returns a flat list of every `SendEmail` journey action belonging to the authenticated user, optionally narrowed to a single journey. Designed for segment rule-builder pickers (rule type `journey-email-action`) that need every choosable email-send action in a single round trip — replacing the legacy N+1 of `Journey.List` plus per-journey `Journey.Get`.

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command   | String  | Yes | API command: `journey.sendemailactions` |
| SessionID | String  | No  | Session ID obtained from login |
| APIKey    | String  | No  | API key for authentication |
| JourneyID | Integer | No  | Narrow the result to a single journey. When omitted (or empty string), all of the user's journeys are scanned. A `JourneyID` belonging to a different user silently returns `Actions: []` (not an error). |
| IncludeDisabled    | Boolean | No | When truthy (`1`, `true`, `yes`), actions belonging to journeys with `Status='Disabled'` are included. Default: `false`. Empty string is treated as absent. |
| IncludeUnpublished | Boolean | No | When truthy, actions whose own `Published` flag is `false` are included. Default: `false`. Empty string is treated as absent. |

::: tip Filter Defaults
By default the endpoint returns only actions that are **(a)** of type `SendEmail`, **(b)** belonging to a journey whose `Status` is `Enabled`, and **(c)** themselves `Published='true'` — matching what the legacy segment rule-builder picker shows today. The two `Include*` flags are escape hatches for admin or debugging tooling.

Boolean coercion uses `filter_var(FILTER_VALIDATE_BOOLEAN)`, so `1` / `true` / `yes` / `on` opt in. Anything outside that allow-list (including `2`, `foo`, empty string) falls back to the conservative default.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.sendemailactions \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.sendemailactions",
    "SessionID": "your-session-id"
  }'
```

```bash [Single Journey]
curl -X GET https://example.com/api/v1/journey.sendemailactions \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.sendemailactions",
    "SessionID": "your-session-id",
    "JourneyID": 18
  }'
```

```bash [Include Disabled & Unpublished]
curl -X GET https://example.com/api/v1/journey.sendemailactions \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.sendemailactions",
    "SessionID": "your-session-id",
    "IncludeDisabled": 1,
    "IncludeUnpublished": 1
  }'
```

```json [Success Response]
{
  "Success": true,
  "Actions": [
    {
      "ActionID": 412,
      "JourneyID": 18,
      "JourneyName": "Welcome Series",
      "EmailName": "Day 1 — Welcome",
      "Subject": "Welcome to Acme",
      "OrderNo": 1,
      "Published": true
    },
    {
      "ActionID": 415,
      "JourneyID": 18,
      "JourneyName": "Welcome Series",
      "EmailName": "Day 3 — Tips",
      "Subject": "Three quick tips to get started",
      "OrderNo": 2,
      "Published": true
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Invalid JourneyID parameter
```

:::

**Per-row fields:**

| Field | Type | Description |
|-------|------|-------------|
| ActionID    | Integer | Primary key from `oempro_journeys_actions`. This is the value the segment rule-builder writes into `rule.value` for the `journey-email-action` rule type. |
| JourneyID   | Integer | Owning journey. |
| JourneyName | String  | Owning journey's name (HTML-decoded). |
| EmailName   | String  | The referenced email's name. Empty string when the email row is missing (orphan action). |
| Subject     | String  | The referenced email's subject line. Empty string when the email row is missing. |
| OrderNo     | Integer | Action ordering within its parent branch. Useful for ordering choices within a journey, but not globally unique across journeys. |
| Published   | Boolean | Whether the action itself is published on the journey canvas. |

::: warning EmailName / Subject orphans
The endpoint joins to `oempro_emails` via the `EmailID` stored in the action's `ActionParameters`. If the referenced email row no longer exists (manually deleted, mid-rebuild, etc.) the action is still returned with `EmailName: ""` and `Subject: ""` — the picker should display a fallback label rather than dropping the row.
:::

## Update a Journey

<Badge type="info" text="PATCH" /> `/api/v1/journey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.update`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to update           |
| Name      | String  | No       | Updated journey name                  |
| Notes     | String  | No       | Updated journey notes                 |
| Trigger   | String  | No       | Updated trigger type. Possible values: `Manual`, `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Tag`, `UnTag`, `CustomFieldValueChanged`, `RevenueHit`, `JourneyCompleted`, `ScheduledPull`, `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, `WebsiteEvent_conversion`. See [Scheduled Pull Trigger](#scheduled-pull-trigger) for its additional parameters. |
| Trigger_ListID | Integer | No  | Updated list ID for triggers         |
| TriggerParameters | Object | No | Updated trigger-specific settings. For the `ScheduledPull` trigger see [Scheduled Pull Trigger](#scheduled-pull-trigger). |
| Trigger_EmailID | Integer | No | Updated email ID for triggers        |
| Trigger_Value | String/Integer | No | Updated trigger value              |
| Trigger_Criteria | Array | No  | Updated trigger criteria             |
| Run_Criteria | Array | No      | Updated run criteria                  |
| Run_Criteria_Operator | String | No | Updated run criteria operator. Possible values: `and`, `or` (default: `and`) |
| Rate_Limit_Per_Hour | Integer | No | Updated hourly rate limit           |
| Rate_Limit_Per_Day | Integer | No | Updated daily rate limit             |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/journey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.update",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "Name": "Welcome Series V2",
    "Notes": "Updated onboarding journey"
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series V2",
    "Trigger": "ListSubscription",
    "TriggerParameters": {
      "ListID": 123
    },
    "Status": "Enabled",
    "Notes": "Updated onboarding journey",
    "UpdatedAt": "2025-01-15 11:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 10,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
4: Missing Trigger_ListID parameter
5: Invalid Trigger_ListID parameter
6: Trigger_ListID matching record not found
7: Missing Trigger_EmailID parameter
8: Invalid Trigger_EmailID parameter
9: Trigger_EmailID matching record not found
10: Journey not found
11: Trigger_Value matching record not found
12: Invalid Trigger_Value parameter (CustomFieldValueChanged)
13: Trigger_Value matching record not found (CustomFieldValueChanged)
14: Invalid Trigger_Value parameter (RevenueHit)
15: Missing Trigger_Value parameter (RevenueHit)
16: Invalid Trigger_Value parameter (JourneyCompleted)
17: Trigger_Value matching record not found (JourneyCompleted)
18: Invalid rate_limit_per_hour parameter
19: Invalid rate_limit_per_day parameter
20: Missing or invalid Trigger_ListID parameter for ScheduledPull trigger
21: Trigger_ListID matching record not found (ScheduledPull)
22: A journey cannot be triggered by its own completion (JourneyCompleted)
```

:::

## Delete a Journey

<Badge type="info" text="POST" /> `/api/v1/journey.delete`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.delete`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to delete           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/journey.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.delete",
    "SessionID": "your-session-id",
    "JourneyID": 456
  }'
```

```json [Success Response]
{
  "JourneyID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
```

:::

## Delete Multiple Journeys

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `journeys.delete`        |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Journeys  | String | Yes      | Comma-separated journey IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journeys.delete",
    "SessionID": "your-session-id",
    "Journeys": "456,789,101"
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
1: Missing Journeys parameter
```

:::

## Enable a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.enable`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.enable`         |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to enable           |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.enable \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.enable",
    "SessionID": "your-session-id",
    "JourneyID": 456
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series",
    "Trigger": "ListSubscription",
    "Status": "Enabled",
    "UpdatedAt": "2025-01-15 12:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already enabled"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
4: Journey is already enabled
```

:::

## Disable a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.disable`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.disable`        |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey to disable          |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.disable \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.disable",
    "SessionID": "your-session-id",
    "JourneyID": 456
  }'
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "456",
    "JourneyName": "Welcome Series",
    "Trigger": "ListSubscription",
    "Status": "Disabled",
    "UpdatedAt": "2025-01-15 13:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already disabled"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter
3: Journey not found
4: Journey is already disabled
```

:::

## Update Journey Actions

::: tip Journey Action Types
For detailed documentation of each action type and its parameters, see [Journey Actions](/v5.8.3/api-reference/journey-actions).
:::

<Badge type="info" text="PATCH" /> `/api/v1/journey.actions`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.actions.update` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey                     |
| Actions   | Array   | Yes      | Array of action objects to update     |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/journey.actions \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.actions.update",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "Actions": [
      {
        "action": "SendEmail",
        "emailid": 123,
        "from": {
          "name": "Support",
          "email": "support@example.com"
        }
      }
    ]
  }'
```

```json [Success Response]
{
  "JourneyID": "456",
  "JourneyName": "Welcome Series",
  "Actions": [
    {
      "ActionID": "789",
      "Action": "SendEmail",
      "ActionParameters": {
        "EmailID": 123,
        "From": {
          "Name": "Support",
          "Email": "support@example.com"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 5,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing Actions parameter
3: Invalid JourneyID parameter
4: Invalid JourneyID parameter (Actions must be array)
5: Journey not found
6: Invalid action type or Journey not found
```

:::

## Update Actions Published Status

<Badge type="info" text="PATCH" /> `/api/v1/journey.actions.published`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.actions.published` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey                     |
| Actions   | Array   | Yes      | Array of action objects with published status |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/journey.actions.published \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.actions.published",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "Actions": [
      {
        "actionid": 789,
        "published": "true"
      }
    ]
  }'
```

```json [Success Response]
{
  "JourneyID": "456",
  "JourneyName": "Welcome Series",
  "Actions": [
    {
      "ActionID": "789",
      "Published": "true"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 6,
      "Message": "Action not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing Actions parameter
3: Invalid JourneyID parameter
4: Invalid JourneyID parameter (Actions must be array)
5: Journey not found
6: Action not found
7: Journey not found after update
```

:::

## Get Action Subscribers

<Badge type="info" text="GET" /> `/api/v1/journey.action.subscribers`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `journey.action.subscribers` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| JourneyID | Integer | Yes      | ID of the journey                     |
| ActionID  | Integer | Yes      | ID of the action                      |
| FilterJSON | String | No       | JSON array of filter items. Each item should be one of: `opened`, `clicked`, `converted`, `browser_viewed`, `forwarded`, `unsubscribed`, `bounced`, `spam_complaint` |
| Operator  | String  | No       | Filter operator. Possible values: `AND`, `OR`. Only used when `FilterJSON` is provided |
| RecordsPerRequest | Integer | No | Number of records per page (default: 25) |
| RecordsFrom | Integer | No     | Starting record offset (default: 0)   |
| OrderField | String | No      | Field to order by (default: EmailAddress) |
| OrderType | String  | No       | Order direction. Possible values: `ASC`, `DESC` (default: `ASC`) |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/journey.action.subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "journey.action.subscribers",
    "SessionID": "your-session-id",
    "JourneyID": 456,
    "ActionID": 789,
    "RecordsPerRequest": 25,
    "RecordsFrom": 0,
    "OrderField": "EmailAddress",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": "101",
      "EmailAddress": "user@example.com",
      "Suppressed": false
    }
  ],
  "TotalSubscribers": 150
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    {
      "Code": 5,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing ActionID parameter
3: Invalid JourneyID parameter
4: Invalid ActionID parameter
5: Invalid FilterJSON parameter (invalid JSON)
6: Invalid FilterJSON value (unrecognized filter item)
7: Invalid Operator value
```

::: info
After validation, the following business logic errors may also be returned:
- `5`: Journey not found (HTTP 404)
- `6`: Action not found (HTTP 404)
:::

:::

## Get Per-ISP Engagement Stats for a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.stats.byisp`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the per-ISP engagement rollup for a single journey within an optional date range. Mirrors the data the web UI's "By ISP" tab renders on the journey overview page. Reads the daily-cached ISP-level stats populated by the journey delivery pipeline.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                                  |
|-----------|---------|----------|----------------------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `journey.stats.byisp`                                                           |
| SessionID | String  | No       | Session ID obtained from login                                                               |
| APIKey    | String  | No       | API key for authentication                                                                   |
| JourneyID | Integer | Yes      | Journey ID to fetch ISP-level stats for. Must be a positive integer and owned by the caller. |
| StartDate | String  | No       | Range start in `YYYY-MM-DD` format. Defaults to 30 days ago.                                 |
| EndDate   | String  | No       | Range end in `YYYY-MM-DD` format. Defaults to today.                                         |
| EmailID   | Integer | No       | Scope the rollup to a single `SendEmail` action on this journey (issue #2019). Must reference an action whose `Action='SendEmail'` and that belongs to this journey + caller. When set, reads `oempro_journeys_actions_daily_cached_data_by_isp` instead of the journey-level cache. Defaults to unset. |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/journey.stats.byisp?JourneyID=123&StartDate=2026-04-17&EndDate=2026-05-17" \
  -H "APIKey: your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "ByISP": [
    {
      "Domain": "gmail.com",
      "Sent": 1000,
      "Delivered": 950,
      "Opened": 400,
      "Clicked": 80,
      "Bounced": 25,
      "Unsubscribed": 5,
      "Complained": 1
    },
    {
      "Domain": "yahoo.com",
      "Sent": 500,
      "Delivered": 480,
      "Opened": 180,
      "Clicked": 30,
      "Bounced": 12,
      "Unsubscribed": 2,
      "Complained": 0
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 3, "Message": "Journey not found" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter (must be a positive integer)
3: Journey not found (HTTP 404)
4: Invalid StartDate format
5: Invalid EndDate format
6: StartDate must be before EndDate
7: Invalid EmailID parameter (not a positive integer, or not a SendEmail action on this journey)
```

:::

## Get Per-Action Engagement Stats for a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.stats.byaction`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns per-`SendEmail`-action engagement stats for a journey, optionally scoped by date range, single email (`EmailID`), and/or ISP domain. Closes the scoping triangle alongside `journey.stats.byisp` (issue #2007) and the `journey.get` filters (issue #2019) — the web UI's per-step overview cards render the same data filtered, this endpoint exposes it to API consumers.

Each row contains a lifetime-style `Stats` block for the requested window plus a `DailyStats` time series zero-filled across every date in the window (consumers can chart a continuous x-axis without gap-fill logic).

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                                                                                |
|-----------|---------|----------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `journey.stats.byaction`                                                                                                      |
| SessionID | String  | No       | Session ID obtained from login                                                                                                             |
| APIKey    | String  | No       | API key for authentication                                                                                                                 |
| JourneyID | Integer | Yes      | Journey ID. Must be a positive integer and owned by the caller.                                                                            |
| StartDate | String  | No       | Range start in `YYYY-MM-DD` format. Defaults to 30 days ago.                                                                               |
| EndDate   | String  | No       | Range end in `YYYY-MM-DD` format. Defaults to today.                                                                                       |
| EmailID   | Integer | No       | Restrict the response to a single `SendEmail` action's `ActionID`. Must reference an action with `Action='SendEmail'` on this journey.    |
| ISP       | String  | No       | Scope all returned rows to one ISP domain. Must match `/^[a-zA-Z0-9.-]+$/`. When set, reads the per-action × per-ISP cache.                |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/journey.stats.byaction?JourneyID=123&StartDate=2026-04-17&EndDate=2026-05-17&ISP=gmail.com" \
  -H "APIKey: your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "Actions": [
    {
      "ActionID": 501,
      "Action": "SendEmail",
      "EmailID": 95,
      "EmailName": "Welcome Email",
      "OrderNo": 1,
      "Stats": {
        "SendCount": 1000,
        "DeliveryCount": 950,
        "OpenCount": 400,
        "ClickCount": 80,
        "BounceCount": 25,
        "UnsubscribeCount": 5,
        "SpamComplaintCount": 1,
        "TotalRevenue": 123.45
      },
      "DailyStats": [
        { "Date": "2026-04-17", "SendCount": 0, "OpenCount": 0, "ClickCount": 0, "TotalRevenue": 0.0 },
        { "Date": "2026-04-18", "SendCount": 100, "OpenCount": 40, "ClickCount": 8, "TotalRevenue": 12.34 }
      ]
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 3, "Message": "Journey not found" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Invalid JourneyID parameter (must be a positive integer)
3: Journey not found (HTTP 404)
4: Invalid StartDate format
5: Invalid EndDate format
6: StartDate must be before EndDate
7: Invalid EmailID parameter (not a positive integer, or not a SendEmail action on this journey)
8: Invalid ISP parameter (must match /^[a-zA-Z0-9.-]+$/)
```

:::

::: info Field semantics
- **`Stats`** is a lifetime aggregate for the requested window (same window applied across all returned actions).
- **`DailyStats`** is a per-day series. Days with no activity are zero-filled so consumers can chart a continuous x-axis. `TotalRevenue` on both `Stats` and `DailyStats` is in currency units (cents/100), matching `journey.get`'s `AggregatedEmailActions.TotalRevenue` shape.
- **`EmailID`** in each row is the underlying `oempro_emails.EmailID` extracted from the action's `ActionParameters.EmailID`. Note that the input parameter also called `EmailID` refers to the journey **action's** `ActionID` (consistent with `journey.get` from issue #2019), not the underlying email's ID.
- **`Action`** is always `"SendEmail"` — non-SendEmail actions (Wait, Decision, AddTag, etc.) are excluded since they don't produce engagement data.
- When `EmailID` is omitted, every `SendEmail` action on the journey is returned, ordered by `OrderNo` ascending.
- An empty journey (no `SendEmail` actions) returns `Actions: []` with `Success: true`.
:::

## Get Account-Level Journey Benchmark

<Badge type="info" text="GET" /> `/api/v1/account.journey.benchmark`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns Sent-weighted engagement averages aggregated across every journey owned by the calling user within an optional date range. Parallels `emailgateway.accountstats` but for the journey module. Useful for showing a "your average vs this journey" benchmark in dashboards.

All rates are **weighted by `SendCount`** (a 9 000-send journey contributes proportionally more than a 100-send journey) — a naive arithmetic mean would over-weight low-volume journeys.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                |
|-----------|---------|----------|----------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `account.journey.benchmark`                                   |
| SessionID | String  | No       | Session ID obtained from login                                             |
| APIKey    | String  | No       | API key for authentication                                                 |
| StartDate | String  | No       | Range start in `YYYY-MM-DD` format. Defaults to 30 days ago.               |
| EndDate   | String  | No       | Range end in `YYYY-MM-DD` format. Defaults to today.                       |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/account.journey.benchmark?StartDate=2026-04-17&EndDate=2026-05-17" \
  -H "APIKey: your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "StartDate": "2026-04-17",
  "EndDate": "2026-05-17",
  "Benchmark": {
    "OpenRate": 0.5055,
    "ClickRate": 0.0825,
    "ClickToOpenRate": 0.1632,
    "BounceRate": 0.0125,
    "UnsubscribeRate": 0.0021,
    "ComplaintRate": 0.0001,
    "RevenuePerSubscriber": 0.42,
    "JourneyCount": 7,
    "TotalSent": 18420
  }
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 3, "Message": "StartDate must not be after EndDate" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Invalid StartDate format
2: Invalid EndDate format
3: StartDate must not be after EndDate
```

:::

::: info
Rates are returned as decimal proportions, not percentages. For example, `OpenRate: 0.5055` means 50.55%. Multiply by 100 for display. `JourneyCount` reflects journeys that had at least one send in the window — journeys with zero sends do not contribute. `RevenuePerSubscriber` is denominated in the same currency the journey was stored in (cents on the wire are converted to currency units server-side).
:::

::: warning Strict date validation (differs from `emailgateway.accountstats`)
This endpoint **rejects** invalid date inputs (`StartDate=2026-02-30`, wrong separator, etc.) with error codes 1/2. The sibling `emailgateway.accountstats` endpoint silently coerces invalid dates back to its defaults instead of erroring. If you target both endpoints, validate input client-side before calling to keep behavior consistent.
:::

## Bulk Enable Journeys

<Badge type="info" text="POST" /> `/api/v1/journeys.enable`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Flips status to `Enabled` for each owned journey currently in `Disabled` state. Per-ID processing — skipped IDs (cross-tenant, not found, already-Enabled status conflict) land in `FailedJourneyIDs` rather than failing the whole call.

**Request Body Parameters:**

| Parameter  | Type   | Required | Description                                                                |
|------------|--------|----------|----------------------------------------------------------------------------|
| Command    | String | Yes      | API command: `journeys.enable`                                             |
| SessionID  | String | No       | Session ID obtained from login                                             |
| APIKey     | String | No       | API key for authentication                                                 |
| JourneyIDs | String | Yes      | Comma-separated list of positive integer JourneyIDs (e.g. `12,34,56`)      |

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/journeys.enable" \
  -H "APIKey: your-api-key" \
  -d "JourneyIDs=12,34,56"
```

```json [Success Response]
{
  "Success": true,
  "ProcessedJourneyIDs": [12, 34],
  "FailedJourneyIDs": [56]
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 1, "Message": "Missing JourneyIDs parameter" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyIDs parameter
2: Invalid JourneyIDs parameter (no positive integers after parsing)
```

:::

## Bulk Disable Journeys

<Badge type="info" text="POST" /> `/api/v1/journeys.disable`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Mirror of `journeys.enable` but flips status from `Enabled` to `Disabled`. Skipped IDs (cross-tenant, not found, already-Disabled status conflict) land in `FailedJourneyIDs`.

**Request Body Parameters:**

| Parameter  | Type   | Required | Description                                                                |
|------------|--------|----------|----------------------------------------------------------------------------|
| Command    | String | Yes      | API command: `journeys.disable`                                            |
| SessionID  | String | No       | Session ID obtained from login                                             |
| APIKey     | String | No       | API key for authentication                                                 |
| JourneyIDs | String | Yes      | Comma-separated list of positive integer JourneyIDs                        |

Response shape and error codes are identical to `journeys.enable`.

## Bulk Clone Journeys

<Badge type="info" text="POST" /> `/api/v1/journeys.clone`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Creates a `Disabled` copy of each owned source journey, including all actions (parent-child relationships preserved). Email templates and resource IDs are **not** copied — the clones reference the same underlying resources as the originals. (Use `journey.copytouser` for cross-tenant cloning with full resource duplication.)

**Request Body Parameters:**

| Parameter  | Type   | Required | Description                                                                |
|------------|--------|----------|----------------------------------------------------------------------------|
| Command    | String | Yes      | API command: `journeys.clone`                                              |
| SessionID  | String | No       | Session ID obtained from login                                             |
| APIKey     | String | No       | API key for authentication                                                 |
| JourneyIDs | String | Yes      | Comma-separated list of positive integer JourneyIDs to clone               |
| NameSuffix | String | No       | Suffix appended to source name with a leading space. Defaults to `(copy)` — output name: `"Original Name (copy)"`. |

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/journeys.clone" \
  -H "APIKey: your-api-key" \
  -d "JourneyIDs=12,34&NameSuffix=- backup"
```

```json [Success Response]
{
  "Success": true,
  "ProcessedJourneyIDs": [12, 34],
  "FailedJourneyIDs": [],
  "ClonedJourneys": [
    { "SourceJourneyID": 12, "NewJourneyID": 1234 },
    { "SourceJourneyID": 34, "NewJourneyID": 1235 }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 1, "Message": "Missing JourneyIDs parameter" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyIDs parameter
2: Invalid JourneyIDs parameter (no positive integers after parsing)
```

:::

::: info Partial-success contract
All three endpoints (`journeys.enable`, `journeys.disable`, `journeys.clone`) return `Success: true` whenever the call itself completed — per-ID outcomes are split into `ProcessedJourneyIDs` and `FailedJourneyIDs`. Validation errors (missing or unusable `JourneyIDs`) are the only conditions that fail the whole call with HTTP 422.
:::

## Submit a Journey CSV Export

<Badge type="info" text="POST" /> `/api/v1/journey.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Enqueues an async CSV export of the caller's journeys with rolled-up stats for a given date range and status filter. Mirrors the pattern used by `subscribers.export` — the worker processes the job in the background; callers should poll `journey.export.get` (or use the `download=1` flag once the job has completed).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `journey.export.submit` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| StatsStartDate | String | No | `YYYY-MM-DD` start of the stats window. Defaults to 30 days ago. |
| StatsEndDate | String | No | `YYYY-MM-DD` end of the stats window. Defaults to today. |
| Status | String | No | Filter by journey status. Possible values: `Enabled`, `Disabled`, `all`. Defaults to `all`. |
| IncludeActions | Boolean | No | When truthy, the CSV includes one row per `SendEmail` action under each journey (mirrors the web UI's expanded view). Defaults to `false`. |

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/journey.export" \
  -H "APIKey: your-api-key" \
  -d "StatsStartDate=2026-04-17&StatsEndDate=2026-05-17&Status=Enabled&IncludeActions=1"
```

```json [Success Response]
{
  "Success": true,
  "ExportID": 1234
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 3, "Message": "StatsStartDate must not be after StatsEndDate" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Invalid StatsStartDate format
2: Invalid StatsEndDate format
3: StatsStartDate must not be after StatsEndDate
4: Invalid Status value (expected: Enabled, Disabled, or all)
```

:::

## Poll / Download a Journey CSV Export

<Badge type="info" text="GET" /> `/api/v1/journey.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the JSON status of an export job, or streams the CSV file when `download=1` and the job is `Completed`. Cross-tenant or cross-module `ExportID`s are rejected — this endpoint only serves jobs with `Module='JourneyExport'`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `journey.export.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| ExportID | Integer | Yes | The export job ID returned by `journey.export.submit` (positive integer) |
| download | Boolean | No | When truthy and `Status=Completed`, streams the file with `Content-Type: text/csv` and a `Content-Disposition: attachment` header. Otherwise returns the JSON envelope. |

::: code-group

```bash [Example Request — JSON status]
curl -X GET "https://example.com/api/v1/journey.export?ExportID=1234" \
  -H "APIKey: your-api-key"
```

```bash [Example Request — Download]
curl -X GET "https://example.com/api/v1/journey.export?ExportID=1234&download=1" \
  -H "APIKey: your-api-key" \
  -o journey-export.csv
```

```json [Success Response (JSON mode)]
{
  "Success": true,
  "ExportJob": {
    "ExportID": 1234,
    "Module": "JourneyExport",
    "Status": "Completed",
    "ExportOptions": {
      "Command": "ExportJourneys",
      "StatsStartDate": "2026-04-17",
      "StatsEndDate": "2026-05-17",
      "Status": "Enabled",
      "IncludeActions": true
    },
    "SubmittedAt": "2026-05-18 12:00:00",
    "StartedAt": "2026-05-18 12:00:05",
    "UpdatedAt": "2026-05-18 12:00:30",
    "FinishedAt": "2026-05-18 12:00:30",
    "ExpiresAt": "2026-05-25 12:00:00",
    "DownloadSize": 4096
  }
}
```

```json [Error Response]
{
  "Errors": [
    { "Code": 5, "Message": "Export job is not completed yet" }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ExportID parameter
2: Invalid ExportID parameter
3: Export job not found (HTTP 404)
4: Wrong module (job exists but is not a JourneyExport, HTTP 404)
5: Download requested but Status is not Completed (HTTP 409)
```

:::

::: info Async lifecycle
`Status` flows through `Pending` → `Processing` → `Completed` (or `Failed`). The background export worker picks up `Pending` jobs in submission order. `ExpiresAt` is currently advisory — the export file isn't auto-cleaned up today, so the field is provided for forward-compat with future retention policy.
:::
