---
layout: doc
prev:
    text: 'Return Back'
    link: 'javascript:history.back()'
---

# Criteria Syntax

The criteria is being used on a few different API end-points including [journey action update](/api-reference/journeys#modifying-journey-actions) and [subscribers](/api-reference/subscribers).

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

## Filter Types

### Segments

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

### Tags

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

### Journeys

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

### Custom Fields

Filter people based on custom field values.

```json
{
    "type": "fields",
    "field_id": "...",
    "operator": "...",
    "value": "..."
}
```

* `field_id` - the custom field id (or `email` for email address)
* `operator` - one of `is`, `is not`, `contains`, `does not contain`, `ends with`, `begins with`, `is less than`, `is less than or equal to`, `is greater than`, `is greater than or equal to`, `is set`, `is not set`
* `value` - the value to compare against

### Suppressions

Filter people based on their suppression status.

```json
{
  "type": "suppressions",
  "operator": "..."
}
```

* `operator` - one of `exist`, `not exist`

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
