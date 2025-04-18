---
layout: doc
prev:
    text: 'Return Back'
    link: 'javascript:history.back()'
---

# RulesJson Criteria Syntax

The criteria is being used on a few different API end-points including [journey action update](/v5.6.x/api-reference/journeys#modifying-journey-actions) and [subscribers](/v5.6.x/api-reference/subscribers).

## Schema

```json
[
  [{A}, {B}],
  [{C}, {D}],
  [{E}]
]
```

(A and B) or (C and D) or (E)

```json
[
  [
    {
      "type": "segments",
      "operator": "belongs to",
      "value": "S1"
    },
    {
      "type": "tags",
      "operator": "has this tag",
      "value": "T1"
    }
  ],
  [
    {
      "type": "fields",
      "field_id": "email",
      "operator": "ends with",
      "value": "@hotmail.com"
    }
  ]
]
```

("Belongs to S1 segment" AND "Has T1 tag") OR ("Email ends with @hotmail.com")

## Filtering By Segments

Filter people based on segment membership.

```json
{
    "type": "segments",
    "operator": "...",
    "value": "..."
}
```

* `operator` - one of `belongs to`, `does not belong to`
* `value` - the segment id

## Filtering By Tags

Filter people based on tag membership.

```json
{
    "type": "tags",
    "operator": "...",
    "value": "..."
}
```

* `operator` - one of `has this tag`, `does not have this tag`, `has any of these tags`, `has all of these tags`, `has no tags`
* `value` - comma separated list of tag ids

## Filtering By Journeys

Filter people based on their journey enrollments.

```json
{
  "type": "journeys",
  "operator": "in journey",
  "value": "..."
}
```

* `operator` - one of `in journey`, `completed journey`, `not in journey`
* `value` - the ID number of the target journey

## Filtering By Custom Fields

Filter people based on custom field values.

```json
{
    "type": "fields",
    "field_id": "...",
    "operator": "...",
    "value": "..."
}
```

* `field_id` - the custom field id (or `EmailAddress` for email address)
* `operator` - one of `is`, `is not`, `contains`, `does not contain`, `ends with`, `begins with`, `is less than`, `is less than or equal to`, `is greater than`, `is greater than or equal to`, `is set`, `is not set`
* `value` - the value to compare against

## Filtering By Suppressions

Filter people based on their suppression status.

```json
{
  "type": "suppressions",
  "operator": "..."
}
```

* `operator` - one of `exist`, `not exist`

## Filtering By Website Events

Filter people based on their website events.

```json
{
  "type": "website-events",
  "event": "...",
  "operator": "...",
  "event_parameter": "...",
  "value": "..."
}
```

* `event` - `pageView`, `identify`, `conversion`, or any custom event.
* `operator` - one of `happened`, `did not happen`, `happened in the last X days`, `did not happen in the last X days`, `equals`, `does not equal`, `contains`, `does not contain`, `matches regex`, `does not match regex`, `greater than`, `less than`, `is set`, `is not set`
* `event_parameter` - Website event parameter
* `value` - any value based on the `event_parameter`

**Common Event Parameters**

All events include common parameters that capture details about the user's environment and the context of the event:

- `$browser`, `$browser_language`, `$browser_version` - Information about the browser used.
- `$current_url` - The URL where the event occurred.
- `$device`, `$device_type` - Details about the device used.
- `$os` - Operating system information.
- `$pageTitle`, `$pathname` - Document title and path.
- `$referrer`, `$referring_domain` - Referral data.
- `$screen_height`, `$screen_width`, `$viewport_height`, `$viewport_width` - Screen and viewport dimensions.
- `$sent_at` - Timestamp when the event was sent.
- `$uuid` - Unique identifier for the session.
- Additional identifiers like `$dsn`, `$host`, `$lib`, and `$lib_version`.

**Event Specific Parameters**

Each event type may have additional parameters:

- `identify` includes emailAddress and `name` for user identification
- `conversion` tracks conversions with `conversionId`, `conversionName`, `conversionValue`
- `customEvent` may include arbitrary parameters like `eventName`, `key1`, `key2`, `key3` for custom tracking.

**Event Query Operators**

Operations are used to query events based on certain conditions. Here are the available operations:

- `did happen` and `happened` - Check if an event occurred, without parameters.
- Temporal operations like `happened in the last X days` or `did not happen in the last X days` require a day count as `value`.
- Comparison and match operations such as `equals`, `does not equal`, `contains`, `does not contain`, `matches regex`, `does not match regex`, `greater than`, `less than`, `is set`, `is not set` utilize event_parameter and a `value`.

**Example: Subscribers who haven't visited the homepage**

```json
{
  "type": "website-events",
  "event": "pageView",
  "operator": "does not equal",
  "event_parameter": "$pageTitle",
  "value": "Homepage"
}
```

**Example: Page views in the last 30 days**

```json
{
  "type": "website-events",
  "event": "pageView",
  "operator": "did not happen in the last X days",
  "event_parameter": "",
  "value": "30"
}
```

**Example: Identifications with a specific email address**

```json
{
  "type": "website-events",
  "event": "identify",
  "operator": "contains",
  "event_parameter": "emailAddress",
  "value": "@gmail.com"
}
```

**Example: Specific conversion events made by visitors**

```json
{
  "type": "website-events",
  "event": "conversion",
  "operator": "greater than",
  "event_parameter": "conversionValue",
  "value": "50"
}
```

**Example: Custom event based filtering**

```json
{
  "type": "website-events",
  "event": "customEvent",
  "operator": "matches regex",
  "event_parameter": "key1",
  "value": "^abc.*"
}
```

**Example: Filtering PageViews with a property**

```json
{
  "type": "website-events",
  "event": "pageView",
  "operator": "equals",
  "event_parameter": "name",
  "value": "test name"
}
```

**Example: Filtering PageViews**

```json
{
  "type": "website-events",
  "event": "pageView",
  "operator": "happened",
  "event_parameter": "",
  "value": ""
}
```

## Filtering By Campaign Events

Filter people based on campaign events.

```json
{
  "type": "campaign-events",
  "operator": "...",
  "value": "...",
  "time_filter": {
    "type": "...",
    "value": "..."
  },
  "aggregation": {
    "operator": "...",
    "count": ...
  }
}
```

* `operator` - one of `opened`, `not opened`, `clicked`, `not clicked`, `unsubscribed`, `complained`, `not complained`, `bounced`, `not bounced`, `delivered`, `not delivered`, `queued-recipients`, `failed`
* `value` - target campaign ID. This value can be:
  * `integer` - a single campaign ID
  * `array` - multiple campaign IDs (e.g., `[123, 124, 125]`)
  * `empty string "" or array []` - any campaign
* `email-id` - target email ID to apply an additional filter if the campaign is A/B test campaign (optional)
* `time_filter` - optional time-based filtering configuration
  * `type` - one of:
    * `in_last_x_days` - events that occurred within the last X days
    * `not_in_last_x_days` - events that occurred before the last X days
    * `between` - events that occurred between two dates
    * `not_between` - events that occurred outside of two dates
    * `after` - events that occurred after a specific date
    * `before` - events that occurred before a specific date
  * `value` - depends on the type:
    * For `in_last_x_days` and `not_in_last_x_days`: number of days (integer)
    * For `between` and `not_between`: object with `start` and `end` dates
    * For `after` and `before`: date string in YYYY-MM-DD format
* `aggregation` - optional configuration for counting events (not available for `delivered`, `not delivered`, `queued-recipients`, `failed`)
  * `operator` - one of:
    * `at_least` - count is greater than or equal to
    * `at_most` - count is less than or equal to
    * `exactly` - count equals exactly
  * `count` - the number to compare against (integer)

### Examples

1. Find subscribers who opened emails in the last 7 days:
```json
{
  "type": "campaign-events",
  "operator": "opened",
  "value": "",
  "time_filter": {
    "type": "in_last_x_days",
    "value": 7
  }
}
```

2. Find subscribers who clicked links between specific dates:
```json
{
  "type": "campaign-events",
  "operator": "clicked",
  "value": 123,
  "time_filter": {
    "type": "between",
    "value": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}
```

3. Find subscribers who unsubscribed before a specific date:
```json
{
  "type": "campaign-events",
  "operator": "unsubscribed",
  "value": "",
  "time_filter": {
    "type": "before",
    "value": "2024-01-01"
  }
}
```

4. Find subscribers who opened at least 3 campaigns:
```json
{
  "type": "campaign-events",
  "operator": "opened",
  "value": [],
  "aggregation": {
    "operator": "at_least",
    "count": 3
  }
}
```

5. Find subscribers who clicked exactly 2 times in specific campaigns:
```json
{
  "type": "campaign-events",
  "operator": "clicked",
  "value": [123, 124, 125],
  "aggregation": {
    "operator": "exactly",
    "count": 2
  }
}
```

### Important Notes:

1. Time filtering is not supported for the following operators:
   - `delivered`
   - `queued-recipients`
   - `failed`

2. Aggregation is not available for:
   - `delivered`
   - `not delivered`
   - `queued-recipients`
   - `failed`

3. When using both `time_filter` and `aggregation`, the time filter is applied first, then the aggregation is calculated on the filtered results.

4. For optimal performance, it's recommended to:
   - Use time filters when possible to limit the data range
   - Be specific with campaign IDs when you don't need to search across all campaigns
   - Use aggregation carefully as it may impact query performance on large datasets


## Filtering By Journey Email Action Events

Filter people based on journey email action activities.

```json
{
  "type": "journey-email-action",
  "operator": "opened",
  "journey-id": "...",
  "value": "..."
}
```

* `operator` - one of `opened`, `not opened`, `clicked`, `not clicked`, `unsubscribed`, `complained`, `not complained`, `bounced`, `not bounced`
* `journey-id` - Target journey ID.
* `value` - must be `ActionID` of the journey.

## Example Rules and Rendered Queries

**A**

```json
[
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"A"}
	]
]
```

```sql
`EmailAddress` LIKE '%A%'
```

**A AND B**

```json
[
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"A"},
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"B"}
	]
]
```

```sql
`EmailAddress` LIKE '%A%' and `EmailAddress` LIKE '%B%'
```


**A OR B**

```json
[
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"A"}
	],
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"B"}
	]
]
```

```sql
((`EmailAddress` LIKE '%A%') or (`EmailAddress` LIKE '%B%'))
```

**(A AND B) OR (B AND C)**

```json
[
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"A"},
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"B"}
	],
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"C"},
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"D"}
	]
]
```

```sql
((`EmailAddress` LIKE '%A%' and `EmailAddress` LIKE '%B%') or (`EmailAddress` LIKE '%C%' and `EmailAddress` LIKE '%D%'))
```

**(A AND B) OR (B AND C) OR E**

```json
[
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"A"},
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"B"}
	],
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"C"},
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"D"}
	],
	[
		{"type":"fields","field_id":"EmailAddress","operator":"contains","value":"E"}
	]
]
```

```sql
((`EmailAddress` LIKE '%A%' and `EmailAddress` LIKE '%B%') or (`EmailAddress` LIKE '%C%' and `EmailAddress` LIKE '%D%') or (`EmailAddress` LIKE '%E%'))
```
