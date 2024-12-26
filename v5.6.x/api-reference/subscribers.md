---
layout: doc
---

# Subscribers

## Unsubscribe a Subscriber

<Badge type="info" text="POST" /> `/api.php`

This API call allows you to unsubscribe a subscriber from a mailing list.

**Request Body Parameters:**

| Parameter              | Description                                                                    | Required? |
|------------------------|--------------------------------------------------------------------------------|-----------|
| SessionID              | The ID of the user's current session                                           | Yes       |
| APIKey                 | The user's API key. Either `SessionID` or `APIKey` must be provided.           | Yes       |
| Command                | Subscriber.Unsubscribe                                                         | Yes       |
| ListID                 | The unique identifier for the mailing list                                     | Yes       |
| IPAddress              | The IP address of the user making the request                                  | Yes       |
| EmailAddress           | The email address of the subscriber to unsubscribe (if known)                  | No        |
| SubscriberID           | The unique identifier for the subscriber to unsubscribe (if known)             | No        |
| CampaignID             | The unique identifier for the campaign associated with the unsubscription      | No        |
| AutoResponderID        | The unique identifier for the autoresponder associated with the unsubscription | No        |
| EmailID                | The unique identifier for the email associated with the unsubscription         | No        |
| Channel                | The channel through which the unsubscription is made                           | No        |
| Preview                | A flag to indicate if the unsubscription should be simulated (1) or not (0)    | No        |
| AddToGlobalSuppression | A flag to indicate if the email should be added to the global suppression list | No        |
| RulesJSON              | A JSON string containing the rules for bulk unsubscription                     | No        |
| RulesOperator          | The operator to be used with the rules ('and' or 'or')                         | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Subscriber.Unsubscribe' \
  -d 'ListID=123' \
  -d 'IPAddress=192.168.1.1' \
  -d 'EmailAddress=john.doe@example.com'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/unsubscribed.html"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "List ID is required."
}
```

```txt [Error Codes]
1: List ID is required.
2: IP address is required.
3: Either email address or subscriber ID must be provided.
4: Invalid list ID or list does not exist.
5: User information could not be retrieved.
6: Invalid email address format.
7: Subscriber does not exist or does not belong to the list.
8: Invalid campaign ID or autoresponder ID.
9: Subscriber is already unsubscribed.
10: Invalid email ID.
11: Invalid query builder response.
```

:::

## Retrieve Subscriber Information

<Badge type="info" text="POST" /> `/api.php`

This API call retrieves detailed information about a specific subscriber, including tags, segments, and journeys
associated with them.

**Request Body Parameters:**

| Parameter    | Description                                                                                     | Required? |
|--------------|-------------------------------------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                                            | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided.                            | Yes       |
| Command      | Subscriber.Get                                                                                  | Yes       |
| EmailAddress | The email address of the subscriber to retrieve                                                 | Yes       |
| SubscriberID | The ID of the subscriber to retrieve. Either `EmailAddress` or `SubscriberID` must be provided. | No        |
| ListID       | The ID of the list the subscriber belongs to                                                    | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Subscriber.Get", "EmailAddress": "subscriber@example.com", "ListID": "123"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": "456",
    "EmailAddress": "subscriber@example.com",
    "Suppressed": false
  },
  "SubscriberTags": [
  ],
  "SubscriberSegments": [
  ],
  "SubscriberJourneys": {
    "Completed": [
      {
        "JourneyID": "5",
        "RelUserID": "1",
        "JourneyName": "Test remove",
        "Trigger": "Manual",
        "TriggerParameters": "[]",
        "Status": "Disabled",
        "Notes": null,
        "CreatedAt": "2023-12-18 14:10:12",
        "UpdatedAt": "2023-12-18 14:10:12"
      },
      {
        "JourneyID": "3",
        "RelUserID": "1",
        "JourneyName": "Test Journey Three",
        "Trigger": "Manual",
        "TriggerParameters": "[]",
        "Status": "Enabled",
        "Notes": "This is a note for a journey",
        "CreatedAt": "2023-12-18 09:54:38",
        "UpdatedAt": "2023-12-18 12:46:41"
      }
    ]
  },
  "SubscriberActivity": [
    {
      "ActivityDate": "2024-04-10 15:05:21",
      "UserID": "1",
      "ListID": "1",
      "SubscriberID": "16",
      "ActivityType": "journey start",
      "Parameters": {
        "journey_id": "3",
        "action_id": "55"
      }
    },
    {
      "ActivityDate": "2024-04-10 15:05:21",
      "UserID": "1",
      "ListID": "1",
      "SubscriberID": "16",
      "ActivityType": "tagged",
      "Parameters": {
        "TagID": "2"
      }
    },
    {
      "ActivityDate": "2024-04-10 15:05:21",
      "UserID": "1",
      "ListID": "1",
      "SubscriberID": "16",
      "ActivityType": "journey end",
      "Parameters": {
        "journey_id": "3",
        "action_id": "55"
      }
    }
  ],
  "SubscriberWebsiteEvents": [
    {
      "05fca7e4-3f07-4d62-9bfb-a6494897ad17": [
        {
          "website_tracker_uuid": "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
          "event": "conversion",
          "email": "",
          "parameters.keys": [
            "$browser",
            "$browser_language",
            "$browser_version",
            "$current_url",
            "$device",
            "$device_type",
            "$dsn",
            "$host",
            "$lib",
            "$lib_version",
            "$list_id",
            "$os",
            "$pageTitle",
            "$pathname",
            "$referrer",
            "$referring_domain",
            "$screen_height",
            "$screen_width",
            "$sent_at",
            "$server",
            "$uuid",
            "$viewport_height",
            "$viewport_width",
            "conversionId",
            "conversionName",
            "conversionValue"
          ],
          "parameters.values": [
            "Google Chrome",
            "en-US",
            "123.0.0.0",
            "http://localhost:8080/test2.html",
            "Desktop",
            "Desktop",
            "1oRkpQJ0dNOLeLOvE2Mw",
            "localhost",
            "web",
            "0.1.0",
            "RO37N1aM8AeWmpny",
            "MacIntel",
            "",
            "/test2.html",
            "$direct",
            "$direct",
            "2160",
            "3840",
            "2024-04-10T19:25:40.951000+00:00",
            "https://staging-console.lindrisapi.com",
            "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
            "954",
            "1920",
            "order1",
            "convName",
            "2000"
          ],
          "event_created_at": "2024-04-10 19:25:40"
        },
        {
          "website_tracker_uuid": "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
          "event": "customEvent",
          "email": "",
          "parameters.keys": [
            "$browser",
            "$browser_language",
            "$browser_version",
            "$current_url",
            "$device",
            "$device_type",
            "$dsn",
            "$host",
            "$lib",
            "$lib_version",
            "$list_id",
            "$os",
            "$pageTitle",
            "$pathname",
            "$referrer",
            "$referring_domain",
            "$screen_height",
            "$screen_width",
            "$sent_at",
            "$server",
            "$uuid",
            "$viewport_height",
            "$viewport_width",
            "eventName",
            "key1"
          ],
          "parameters.values": [
            "Google Chrome",
            "en-US",
            "123.0.0.0",
            "http://localhost:8080/test2.html",
            "Desktop",
            "Desktop",
            "1oRkpQJ0dNOLeLOvE2Mw",
            "localhost",
            "web",
            "0.1.0",
            "RO37N1aM8AeWmpny",
            "MacIntel",
            "",
            "/test2.html",
            "$direct",
            "$direct",
            "2160",
            "3840",
            "2024-04-10T19:25:40.951000+00:00",
            "https://staging-console.lindrisapi.com",
            "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
            "954",
            "1920",
            "event1",
            "val1"
          ],
          "event_created_at": "2024-04-10 19:25:40"
        },
        {
          "website_tracker_uuid": "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
          "event": "identify",
          "email": "test@test.com",
          "parameters.keys": [
            "$browser",
            "$browser_language",
            "$browser_version",
            "$current_url",
            "$device",
            "$device_type",
            "$dsn",
            "$host",
            "$lib",
            "$lib_version",
            "$list_id",
            "$os",
            "$pageTitle",
            "$pathname",
            "$referrer",
            "$referring_domain",
            "$screen_height",
            "$screen_width",
            "$sent_at",
            "$server",
            "$uuid",
            "$viewport_height",
            "$viewport_width",
            "emailAddress"
          ],
          "parameters.values": [
            "Google Chrome",
            "en-US",
            "123.0.0.0",
            "http://localhost:8080/test2.html",
            "Desktop",
            "Desktop",
            "1oRkpQJ0dNOLeLOvE2Mw",
            "localhost",
            "web",
            "0.1.0",
            "RO37N1aM8AeWmpny",
            "MacIntel",
            "",
            "/test2.html",
            "$direct",
            "$direct",
            "2160",
            "3840",
            "2024-04-10T19:25:40.951000+00:00",
            "https://staging-console.lindrisapi.com",
            "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
            "954",
            "1920",
            "cem.hurturk@gmail.com"
          ],
          "event_created_at": "2024-04-10 19:25:40"
        },
        {
          "website_tracker_uuid": "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
          "event": "pageView",
          "email": "",
          "parameters.keys": [
            "$browser",
            "$browser_language",
            "$browser_version",
            "$current_url",
            "$device",
            "$device_type",
            "$dsn",
            "$host",
            "$lib",
            "$lib_version",
            "$list_id",
            "$os",
            "$pageTitle",
            "$pathname",
            "$referrer",
            "$referring_domain",
            "$screen_height",
            "$screen_width",
            "$sent_at",
            "$server",
            "$uuid",
            "$viewport_height",
            "$viewport_width",
            "url"
          ],
          "parameters.values": [
            "Google Chrome",
            "en-US",
            "123.0.0.0",
            "http://localhost:8080/test2.html",
            "Desktop",
            "Desktop",
            "1oRkpQJ0dNOLeLOvE2Mw",
            "localhost",
            "web",
            "0.1.0",
            "RO37N1aM8AeWmpny",
            "MacIntel",
            "",
            "/test2.html",
            "$direct",
            "$direct",
            "2160",
            "3840",
            "2024-04-10T19:25:40.951000+00:00",
            "https://staging-console.lindrisapi.com",
            "05fca7e4-3f07-4d62-9bfb-a6494897ad17",
            "954",
            "1920",
            "http://localhost:8080/test2.html"
          ],
          "event_created_at": "2024-04-10 19:25:40"
        }
      ],
      "25432a5c-9c80-44a9-a026-6db95e57fa7a": [
        {
          "website_tracker_uuid": "25432a5c-9c80-44a9-a026-6db95e57fa7a",
          "event": "conversion",
          "email": "",
          "parameters.keys": [
            "$browser",
            "$browser_language",
            "$browser_version",
            "$current_url",
            "$device",
            "$device_type",
            "$dsn",
            "$host",
            "$lib",
            "$lib_version",
            "$list_id",
            "$os",
            "$pageTitle",
            "$pathname",
            "$referrer",
            "$referring_domain",
            "$screen_height",
            "$screen_width",
            "$sent_at",
            "$server",
            "$uuid",
            "$viewport_height",
            "$viewport_width",
            "conversionId",
            "conversionName",
            "conversionValue"
          ],
          "parameters.values": [
            "Google Chrome",
            "en-US",
            "123.0.0.0",
            "http://localhost:8080/test2.html",
            "Desktop",
            "Desktop",
            "1oRkpQJ0dNOLeLOvE2Mw",
            "localhost",
            "web",
            "0.1.0",
            "RO37N1aM8AeWmpny",
            "MacIntel",
            "",
            "/test2.html",
            "$direct",
            "$direct",
            "2160",
            "3840",
            "2024-04-10T19:27:34.535000+00:00",
            "https://staging-console.lindrisapi.com",
            "25432a5c-9c80-44a9-a026-6db95e57fa7a",
            "1480",
            "1920",
            "order1",
            "convName",
            "2000"
          ],
          "event_created_at": "2024-04-10 19:27:34"
        }
      ]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ]
}
```

```txt [Error Codes]
1: Email address is required.
2: List ID is required.
3: Subscriber not found.
4: List not found.
```

:::

::: warning NOTICE

- Available `SubscriptionStatus` values are `Opt-In Pending`, `Subscribed`, `Opt-Out Pending`, `Unsubscribed`
- `SubscriberActivity` parameter returns subscriber activities for the last 10 days only. For a detailed subscriber
  activity list, use [`Subscriber.Get.Activity`](#retrieve-subscriber-activities) API end-point.
  :::

## Retrieve Subscriber Activities

<Badge type="info" text="POST" /> `/api.php`

This endpoint returns the list of subscriber activities.

**Request Body Parameters:**

| Parameter         | Description                                                                                                                                                                                                                                                                                                                                           | Required? |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                                                                                                                                                                                                                                                                                                  | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                                                                                                                                                                                                                  | Yes       |
| Command           | `Subscriber.Get.Activity`                                                                                                                                                                                                                                                                                                                             | Yes       |
| SubscriberID      | The unique identifier of the subscriber                                                                                                                                                                                                                                                                                                               | Yes       |
| SubscriberListID  | The unique identifier of the subscriber list                                                                                                                                                                                                                                                                                                          | Yes       |
| FilterJson        | The filtering criteria in JSON syntax. Ex: `["tagged", "subscription"]`. Criteria can be combination of `subscription`, `unsubscription`, `email campaign delivery`, `transactional email delivery`, `auto responder delivery`, `email open`, `email link click`, `hard bounce`, `journey start`, `journey end`, `journey exit`, `tagged`, `untagged` | Yes       |
| Operator          | Currently only `OR` operator is available. This filters the subscriber activity history based on crtieria set in `FilterJson` with "any of" filtering.                                                                                                                                                                                                | Yes       |
| RecordsPerRequest | Number of records to return in each API request.                                                                                                                                                                                                                                                                                                      | Yes       |
| RecordsFrom       | Pagination start record number.                                                                                                                                                                                                                                                                                                                       | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "SessionID=exampleSessionId" \
  -d "Command=Subscriber.Get.Activity" \
  -d "SubscriberID=3" \
  -d "ListID=1" \
  -d "filterjson=[\"tagged\",\"subscription\"]" \
  -d "operator=OR" \
  -d "RecordsPerRequest=3" \
  -d "RecordsFrom=0"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberActivity": [
    {
      "ActivityDate": "2024-04-09 13:39:14",
      "UserID": "1",
      "ListID": "1",
      "SubscriberID": "3",
      "ActivityType": "subscription",
      "Parameters": []
    },
    {
      "ActivityDate": "2024-04-09 12:46:08",
      "UserID": "1",
      "ListID": "1",
      "SubscriberID": "3",
      "ActivityType": "subscription",
      "Parameters": []
    },
    {
      "ActivityDate": "2024-04-09 08:23:27",
      "UserID": "1",
      "ListID": "1",
      "SubscriberID": "3",
      "ActivityType": "tagged",
      "Parameters": {
        "TagID": "2"
      }
    }
  ],
  "TotalSubscriberActivity": "17"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    2
  ],
  "ErrorText": [
    "Missing subscriber id"
  ]
}
```

```txt [Error Codes]
1: Missing subscriber list id parameter
2: Missing subscriber id parameter
3: Invalid or missing FilterJson parameter
4: Invalid FilterJson criteria
5: Invalid criteria operator
6: Invalid subscriber list
7: Invalid subscriber
```

:::

### Event Response Examples

`tagged`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "tagged",
{
  "TagID": "2",
  "TagName": "TEST-TAG-TWO",
  "RulesJSON": "\"[[{\\\"type\\\":\\\"fields\\\",\\\"field_id\\\":\\\"SubscriptionStatus\\\",\\\"operator\\\":\\\"contains\\\",\\\"value\\\":\\\"Subscribed\\\"}],[{\\\"type\\\":\\\"suppressions\\\",\\\"operator\\\":\\\"not exist\\\"}]]\"",
  "RulesOperator": "or"
}
}
```

`untagged`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "untagged",
  "Parameters": {
    "TagID": "2",
    "TagName": "TEST-TAG-TWO",
    "RulesJSON": "\"[[{\\\"type\\\":\\\"fields\\\",\\\"field_id\\\":\\\"SubscriptionStatus\\\",\\\"operator\\\":\\\"contains\\\",\\\"value\\\":\\\"Subscribed\\\"}],[{\\\"type\\\":\\\"suppressions\\\",\\\"operator\\\":\\\"not exist\\\"}]]\"",
    "RulesOperator": "or"
  }
}
```

`hard bounce`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "hard bounce",
  "Parameters": {
    "CampaignID": "2",
    "CampaignName": "abc",
    "AutoResponderID": "3",
    "AutoResponderName": "abc",
    "SoftToHardThreshold": 2
  }
}
```

`email link click`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "email link click",
  "Parameters": {
    "campaign_id": "2",
    "campaign_name": "Abc",
    "autoresponder_id": "0",
    "autoresponder_name": "Abc",
    "email_id": "2",
    "email_subject": "Abc",
    "link_url": "index.html",
    "link_title": "index"
  }
}
```

`email open`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "email open",
  "Parameters": {
    "campaign_id": "2",
    "campaign_name": "Abc",
    "autoresponder_id": "0",
    "autoresponder_name": "Abc",
    "email_id": "2",
    "email_subject": "Abc",
    "ip_address": "192.168.0.8"
  }
}
```

`transactional email delivery`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "transactional email delivery",
  "Parameters": {
    "QueueID": "2",
    "UserID": "1",
    "DomainID": "2",
    "APIKeyID": "",
    "SMTPID": ""
  }
}
```

`journey exit`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "journey exit",
  "Parameters": {
    "journey_id": "3",
    "journey_name": "Abc",
    "action_id": "57",
    "action_name": "Abc"
  }
}
```

`journey start`:

```json
{
  "ActivityDate": "2024-04-10 15:05:21",
  "UserID": "1",
  "ListID": "1",
  "SubscriberID": "16",
  "ActivityType": "journey start",
  "Parameters": {
    "journey_id": "3",
    "journey_name": "Abc",
    "action_id": "57",
    "action_name": "Abc"
  }
}
```

## Delete Subscribers

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to delete subscribers from a list. You can either specify individual subscriber IDs or use a
JSON rule set to define a group of subscribers to be deleted.

**Request Body Parameters:**

| Parameter        | Description                                                                  | Required?   |
|------------------|------------------------------------------------------------------------------|-------------|
| SessionID        | The ID of the user's current session                                         | Yes         |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided.         | Yes         |
| Command          | `Subscribers.Delete`                                                         | Yes         |
| SubscriberListID | The unique identifier of the subscriber list                                 | Yes         |
| Subscribers      | A comma-separated list of subscriber IDs to delete                           | No          |
| RulesJSON        | A JSON string defining the rules to select subscribers to delete             | Conditional |
| RulesOperator    | Operator to be used with rules ('and'/'or'). Defaults to 'or' if not valid.  | No          |
| Suppressed       | A boolean to indicate if subscribers should be removed from suppression list | No          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscribers.Delete' \
  -d 'SubscriberListID=123' \
  -d 'Subscribers=456,789' \
  -d 'Suppressed=true'
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
  "ErrorCode": [
    2
  ],
  "ErrorText": [
    "Missing subscriber list id"
  ]
}
```

```txt [Error Codes]
1: Missing subscribers parameter
2: Missing subscriber list id
3: Missing RulesJSON parameter
4: Missing RulesOperator parameter
5: Invalid list id
6: Invalid query builder response
7: Missing rules operator when RulesJSON is provided
```

:::

::: warning NOTICE

- Please note that if you do not provide the `Subscribers` parameter, you must provide both `RulesJSON`
  and `RulesOperator`.
- If `RulesOperator` is not provided or is invalid, it will default to 'or'.
- If `Suppressed` is set to true, the specified subscribers will be removed from the suppression list instead of being
  deleted.
  :::

## Retrieve Subscribers of a List

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves subscriber information based on various segments and criteria from a specified subscriber list.

**Request Body Parameters:**

| Parameter         | Description                                                             | Required? |
|-------------------|-------------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                    | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.    | Yes       |
| Command           | Subscribers.Get                                                         | Yes       |
| SubscriberListID  | The unique identifier for the subscriber list                           | Yes       |
| SubscriberSegment | The segment of subscribers to retrieve (e.g., 'Active', 'Unsubscribed') | Yes       |
| RecordsPerRequest | The number of records to return per request                             | No        |
| RecordsFrom       | The starting point from which to return records                         | No        |
| SearchField       | The field to search within (e.g., 'Email', 'Name')                      | No        |
| SearchKeyword     | The keyword to search for within the specified field                    | No        |
| OrderField        | The field to order the results by (e.g., 'DateAdded', 'Email')          | No        |
| OrderType         | The type of ordering to apply (e.g., 'ASC', 'DESC')                     | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Subscribers.Get' \
  -d 'SubscriberListID=123' \
  -d 'SubscriberSegment=Active' \
  -d 'RecordsPerRequest=25' \
  -d 'RecordsFrom=0'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": "1",
      "EmailAddress": "subscriber@example.com"
    }
  ],
  "TotalSubscribers": 100
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "SubscriberListID is a required field."
}
```

```txt [Error Codes]
1: SubscriberListID is a required field.
2: SubscriberSegment is a required field.
3: The list does not belong to the authenticated user.
```

:::

## Retrieve Subscribers

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of subscribers based on various criteria such as list ID, segment, and search parameters.

**Request Body Parameters:**

| Parameter         | Description                                                          | Required? |
|-------------------|----------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                 | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command           | `Subscribers.Search`                                                 | Yes       |
| ListID            | The unique identifier for the subscriber list                        | Yes       |
| Operator          | The operator to apply on the search (e.g., AND, OR)                  | Yes       |
| RecordsPerRequest | The number of records to return per request                          | No        |
| RecordsFrom       | The starting record number from which to return results              | No        |
| OrderField        | The field by which to order the results                              | No        |
| OrderType         | The order type (e.g., ASC, DESC)                                     | No        |
| Rules             | The search rules in JSON format                                      | No        |
| RulesJson         | The search rules in a JSON string                                    | No        |
| DebugQueryBuilder | A flag to return the prepared SQL query for debugging purposes       | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscribers.Search' \
  -d 'ListID=123' \
  -d 'Operator=AND' \
  -d 'RecordsPerRequest=25' \
  -d 'RecordsFrom=0' \
  -d 'OrderField=EmailAddress' \
  -d 'OrderType=ASC'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": 1,
      "EmailAddress": "example@example.com",
      "Suppressed": false
    }
  ],
  "TotalSubscribers": 150
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "ListID is a required field."
}
```

```txt [Error Codes]
1: "ListID is a required field."
2: "Operator is a required field."
3: "The list does not belong to the authenticated user."
4: "PRoblem with the segment engine"
```

:::

## Request Subscriber Data Export

<Badge type="info" text="POST" /> `/api/v1/subscriber.export`

This API end-point allows for the export of subscriber data based on specified criteria. It supports filtering and
exporting in different formats.

**Request Body Parameters:**

| Parameter      | Description                                                               | Required? |
|----------------|---------------------------------------------------------------------------|-----------|
| SessionID      | The ID of the user's current session                                      | Yes       |
| APIKey         | The user's API key. Either `SessionID` or `APIKey` must be provided.      | Yes       |
| ListID         | The unique identifier for the list to export from                         | Yes       |
| RulesJSON      | JSON string containing the rules for filtering subscribers                | Yes       |
| RulesOperator  | Operator to apply between rules ("and" or "or")                           | Yes       |
| ExportFormat   | The format for the export file ("csv" or "json")                          | Yes       |
| FieldsToExport | Array of field names to include in the export                             | Yes       |
| Target         | The target subscribers to export ("", "Active", "Suppressed", etc. or ID) | No        |

::: code-group

```bash [Example Request]
curl -X POST 'https://example.com/api/v1/subscriber.export' \
-H 'Authorization: Bearer {User API Key}' \
-H 'Content-Type: application/json' \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "ListID": "123",
    "RulesJSON": "{\"field\":\"value\"}",
    "RulesOperator": "and",
    "ExportFormat": "csv",
    "FieldsToExport": ["EmailAddress", "Name"],
    "Target": "Active"
}'
```

```json [Success Response]
{
  "ExportID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    },
    {
      "Code": 2,
      "Message": "Missing RulesJSON parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
2: Missing RulesJSON parameter
3: Missing RulesOperator parameter
4: Missing ExportFormat parameter
5: Missing FieldsToExport parameter
6: Invalid ListID parameter
7: Invalid RulesJSON syntax. It must be a properly formatted JSON payload
8: RulesOperator must be either "and" or "or"
9: ExportFormat must be either "csv" or "json"
10: List not found
11: Target must be "", "Active", "Suppressed", "Unsubscribed", "Soft bounced", "Hard bounced" or segment ID
12: Segment not found
```

:::

## Export Subscriber Data

<Badge type="info" text="GET" /> `/api/v1/subscriber.export`

This API end-point allows you to export subscriber data from a specified list. You can also retrieve the status of an
export job or download the exported data if the job is completed.

**Request Body Parameters:**

| Parameter | Description                                                                            | Required? |
|-----------|----------------------------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                                   | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.                   | Yes       |
| ListID    | The unique identifier for the list to export from                                      | Yes       |
| ExportID  | The unique identifier for a specific export job                                        | No        |
| Download  | A flag to indicate if the exported data should be downloaded (set to true to download) | No        |

::: code-group

```bash [Example Request]
curl -X GET 'https://api.example.com/api/v1/subscriber.export' \
-H 'Authorization: Bearer {User API Key}' \
-H 'Content-Type: application/json' \
-d '{
    "SessionID": "example-session-id",
    "APIKey": "example-api-key",
    "ListID": "123",
    "ExportID": "456",
    "Download": true
}'
```

```json [Success Response]
{
  "ExportJob": {
    "ExportID": "456",
    "Status": "Completed",
    "SubmittedAt": "2023-01-01T00:00:00Z",
    "ExportOptions": {
      ...
    },
    "DownloadSize": 1024
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid ListID parameter"
    },
    {
      "Code": 3,
      "Message": "Invalid ExportID parameter"
    },
    {
      "Code": 4,
      "Message": "List not found"
    },
    {
      "Code": 5,
      "Message": "Invalid ExportID parameter"
    },
    {
      "Code": 6,
      "Message": "Export job not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
2: Invalid ListID parameter
3: Invalid ExportID parameter
4: List not found
5: Invalid ExportID parameter
6: Export job not found
```

:::

::: warning NOTICE

- Please note that the `ExportID` parameter is optional.
- If provided, the API will return the status of the specified export job or allow you to download the exported data if
  the job is completed and the `Download` parameter is set to true.
- If `ExportID` is not provided, the API will return a list of all export jobs for the user.
  :::

## Prepare for Subscriber Import

<Badge type="info" text="POST" /> `/api/v1/subscribers.import.prepare`

This API enpoint is responsible for listing all the ESP importables so the frontend can let the users pick what they
want to import and how they want to import them.

**Request Body Parameters:**

| Parameter                             | Description                                                          | Required? |
|---------------------------------------|----------------------------------------------------------------------|-----------|
| SessionID                             | The ID of the user's current session.                                | Yes       |
| APIKey                                | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| ImportFrom.Mailchimp.APIKey           | The Mailchimp API key for importing subscribers.                     | No        |
| ImportFrom.Mailchimp.Server           | The Mailchimp server prefix for importing subscribers.               | No        |
| ImportFrom.ActiveCampaign.APIKey      | The ActiveCampaign API key for importing subscribers.                | No        |
| ImportFrom.ActiveCampaign.AccountName | The ActiveCampaign account name for importing subscribers.           | No        |
| ImportFrom.Drip.APIKey                | The Drip API key to import subscribers.                              | No        |
| ImportFrom.Drip.AccountID             | The Drip account ID to import subscribers.                           | No        |

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/subscribers.import.prepare" \
     -H "Authorization: Bearer {User API Key}" \
     -H "Content-Type: application/json" \
     -d '{
           "SessionID": "example-session-id",
           "APIKey": "example-api-key",
           ...
         }'
```

```json [Success Response]
{
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "ImportFrom.Mailchimp.APIKey, ImportFrom.ActiveCampaign.APIKey or ImportFrom.Drip.APIKey must be provided"
    }
  ]
}
```

```txt [Error Codes]
1: ImportFrom.Mailchimp.APIKey, ImportFrom.ActiveCampaign.APIKey or ImportFrom.Drip.APIKey must be provided
2: Invalid ImportFrom source
3: ActiveCampaign API key is missing
4: ActiveCampaign account name is missing
5: ActiveCampaign Error: ...
6: 
7: Mailchimp API key is missing
7: Drip API key is missing
8: Mailchimp server is missing
8: Drip account is missing
9: Mailchimp Error: ...
9: Drip Error: ...
10: 
11: Mailchimp Error While Retrieving Lists: ...
12: Mailchimp Error While Retrieving Merge Fields: ...
13: Mailchimp Error While Retrieving Tags: ...
14: Mailchimp Error While Retrieving Interest Categories: ...
15: Mailchimp Error While Retrieving Interests: ...


```

:::

## Import Subscribers

<Badge type="info" text="POST" /> `/api/v1/subscribers.import`

This API end-point allows for importing subscribers into a specified list. It supports importing from CSV data,
Mailchimp, or ActiveCampaign. The import process can be customized with various options such as updating duplicates,
triggering actions, and adding to suppression lists.

**Request Body Parameters:**

| Parameter                                              | Description                                                                                                                                                             | Required? |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| SessionID                                              | The ID of the user's current session.                                                                                                                                   | Yes       |
| APIKey                                                 | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                                    | Yes       |
| ListID                                                 | The unique identifier of the list to import subscribers into.                                                                                                           | Yes       |
| AddToGlobalSuppressionList                             | Indicates if the imported subscribers should be added to the global suppression list.                                                                                   | Yes       |
| AddToSuppressionList                                   | Indicates if the imported subscribers should be added to the list's suppression list.                                                                                   | Yes       |
| UpdateDuplicates                                       | Indicates if existing subscribers should be updated when duplicates are found.                                                                                          | Yes       |
| TriggerActions                                         | Indicates if actions should be triggered for the imported subscribers.                                                                                                  | Yes       |
| Tags                                                   | An array of tags to assign to the imported subscribers.                                                                                                                 | Yes       |
| ImportFrom.CSV.URL                                     | The URL to fetch CSV data from (optional if CSV data is provided).                                                                                                      | No        |
| ImportFrom.CSV.Data                                    | The CSV data to import (optional if a URL is provided).                                                                                                                 | No        |
| ImportFrom.CSV.FieldTerminator                         | The character used to terminate fields in the CSV data.                                                                                                                 | No        |
| ImportFrom.CSV.FieldEncloser                           | The character used to enclose fields in the CSV data.                                                                                                                   | No        |
| ImportFrom.CSV.EscapedBy                               | The character used to escape special characters in the CSV data.                                                                                                        | No        |
| ImportFrom.CSV.MappedFields                            | An array mapping CSV fields to subscriber attributes.                                                                                                                   | Yes       |
| ImportFrom.CSV.MapToFirstAndLastName                   | An object specifying the field IDs for mapping full name columns into FirstName and LastName attributes. Required if a CSV column is mapped to `MapToFirstAndLastName`. | No        |
| ImportFrom.Mailchimp.APIKey                            | The Mailchimp API key for importing subscribers.                                                                                                                        | No        |
| ImportFrom.Mailchimp.Server                            | The Mailchimp server prefix for importing subscribers.                                                                                                                  | No        |
| ImportFrom.Mailchimp.MailchimpListID                   | The Mailchimp list ID to import subscribers from.                                                                                                                       | No        |
| ImportFrom.Mailchimp.MailchimpListIDs                  | The list of Mailchimp list IDs to import subscribers from.                                                                                                              | No        |
| ImportFrom.Mailchimp.MailchimpFieldIDs                 | The list of Mailchimp field IDs to import along with the email address.                                                                                                 | No        |
| ImportFrom.Mailchimp.MailchimpTagIDs                   | The list of Mailchimp tag IDs to import along with the subscriber.                                                                                                      | No        |
| ImportFrom.Mailchimp.MailchimpGroupIDs                 | The list of Mailchimp group IDs to import along with the subscriber.                                                                                                    | No        |
| ImportFrom.ActiveCampaign.APIKey                       | The ActiveCampaign API key for importing subscribers.                                                                                                                   | No        |
| ImportFrom.ActiveCampaign.AccountName                  | The ActiveCampaign account name for importing subscribers.                                                                                                              | No        |
| ImportFrom.ActiveCampaign.ActiveCampaignListID         | The ActiveCampaign list ID to import subscribers from.                                                                                                                  | No        |
| ImportFrom.ActiveCampaign.ActiveCampaignListIDs        | The list of ActiveCampaign list IDs to import subscribers from.                                                                                                         | No        |
| ImportFrom.ActiveCampaign.IncludeInactive              | Indicates if inactive subscribers should be imported.                                                                                                                   | No        |
| ImportFrom.ActiveCampaign.ActiveCampaignTagIDs         | The list of ActiveCampaign tag IDs to import along with the subscriber.                                                                                                 | No        |
| ImportFrom.ActiveCampaign.ActiveCampaignNativeFieldIDs | The list of ActiveCampaign native field IDs to import along with the subscriber.                                                                                        | No        |
| ImportFrom.ActiveCampaign.ActiveCampaignCustomFieldIDs | The list of ActiveCampaign custom field IDs to import along with the subscriber.                                                                                        | No        |
| ImportFrom.Drip.APIKey                                 | The Drip API key to import subscribers.                                                                                                                                 | No        |
| ImportFrom.Drip.AccountID                              | The Drip account ID to import subscribers.                                                                                                                              | No        |
| ImportFrom.Drip.AccountIDs                             | The list of Drip account IDs to import subscribers.                                                                                                                     | No        |
| ImportFrom.Drip.NativeFieldIDs                         | The list of Drip native field IDs to import along with the subscriber.                                                                                                  | No        |
| ImportFrom.Drip.CustomFieldIDs                         | The list of Drip custom field IDs to import along with the subscriber.                                                                                                  | No        |
| ImportStatusUpdateWebhookURL                           | A webhook URL to receive updates about the import status.                                                                                                               | No        |

`ImportFrom.CSV.MappedFields` can be an array of field names (ex: `EmailAddress`, `CustomFieldX` where X is the ID of
the custom field, `YYYY` where YYYY is the merge tag alias of the custom field) and also `TagAdd` and `TagSync` values.

If you pass `TagAdd` and/or `TagSync` values as `ImportFrom.CSV.MappedFields` array elements, import from CSV
functionality will perform any of these processes during the import:

- `TagAdd`: Adds comma-separated tags from the mapped field to the subscriber during import.
- `TagSync`: Synchronizes tags from the data, adding new tags and removing existing ones as necessary.

If you are importing from a CSV data, you can split a full name CSV column into separate first and last name fields.
This is done once `ImportFrom.CSV.MapToFirstAndLastName` array is provided in the API request. The array should contain
the CSV column name that contains the full name and the custom field IDs to map the first and last names to. Here's an
example:

```json
{
  "FirstNameFieldID": "Field ID for First Name",
  "LastNameFieldID": "Field ID for Last Name"
  "
}
```

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/subscriber.import" \
     -H "Authorization: Bearer {User API Key}" \
     -H "Content-Type: application/json" \
     -d '{
           "SessionID": "example-session-id",
           "APIKey": "example-api-key",
           "ListID": "123",
           "AddToGlobalSuppressionList": false,
           "AddToSuppressionList": false,
           "UpdateDuplicates": true,
           "TriggerActions": true,
           "Tags": ["NewSubscriber", "Imported"],
           "ImportFrom": {
             "CSV": {
               "Data": "email,name\nexample@example.com,John Doe",
               "FieldTerminator": ",",
               "FieldEncloser": "\"",
               "EscapedBy": "\\",
               "MappedFields": {
                 "email": "Email",
                 "name": "FullName"
               }
             }
           }
         }'
         
# An example request to show TagAdd and TagSync usage
curl -X POST "https://example.com/api/v1/subscriber.import" \
     -H "Authorization: Bearer {User API Key}" \
     -H "Content-Type: application/json" \
     -d '{
           "SessionID": "example-session-id",
           "APIKey": "example-api-key",
           "ListID": "123",
           "AddToGlobalSuppressionList": false,
           "AddToSuppressionList": false,
           "UpdateDuplicates": true,
           "TriggerActions": true,
           "Tags": ["NewSubscriber", "Imported"],
           "ImportFrom": {
             "CSV": {
               "Data": "email,name,tags_to_sync,tags_to_add\nexample@example.com,John Doe, \"tag1,tag2\",\"tag3,tag4\"",
               "FieldTerminator": ",",
               "FieldEncloser": "\"",
               "EscapedBy": "\\",
               "MappedFields": [
                 "EmailAddress", "Name", "TagSync", "TagAdd"
               ]
             }
           }
         }'

# An example request to show how to split a full name column into first and last names. (123 and 456 are custom field IDs)
curl -X POST "https://example.com/api/v1/subscriber.import" \
     -H "Authorization: Bearer {User API Key}" \
     -H "Content-Type: application/json" \
     -d '{
           "SessionID": "example-session-id",
           "APIKey": "example-api-key",
           "ListID": "123",
           "AddToGlobalSuppressionList": false,
           "AddToSuppressionList": false,
           "UpdateDuplicates": true,
           "TriggerActions": true,
           "Tags": ["NewSubscriber", "Imported"],
           "ImportFrom": {
             "CSV": {
               "Data": "email,name,tags_to_sync,tags_to_add\nexample@example.com,John Doe, \"tag1,tag2\",\"tag3,tag4\"",
               "FieldTerminator": ",",
               "FieldEncloser": "\"",
               "EscapedBy": "\\",
               "MappedFields": {
                   ...,
                   "name": "MapToFirstAndLastName"
               },
               "MapToFirstAndLastName": {
                   "FirstNameFieldID": 123,
                   "LastNameFieldID": 456
               }
             }
           }
         }'
```

```json [Success Response]
{
  "ImportID": 456,
  "ImportType": "sync"
  // or "async"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    },
    {
      "Code": 4,
      "Message": "Missing AddToGlobalSuppressionList parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
4: Missing AddToGlobalSuppressionList parameter
5: Missing AddToSuppressionList parameter
6: Missing UpdateDuplicates parameter
7: Missing TriggerActions parameter
8: Missing MappedFields parameter
9: Invalid AddToGlobalSuppressionList parameter
10: Invalid AddToSuppressionList parameter
11: Invalid UpdateDuplicates parameter
12: Invalid TriggerActions parameter
13: Invalid MappedFields parameter
14: ImportFrom.CSV.URL, ImportFrom.CSV.Data, ImportFrom.Mailchimp.APIKey or ImportFrom.ActiveCampaign.APIKey must be provided
15: Fields are not mapped in MappedFields parameter
16: Missing EscapedBy parameter
17: Field mapping is invalid
18: ImportFrom.CSV.URL remote data fetch failure
19: List not found
20: Failed to create import record
21: Missing Tags parameter
22: Mailchimp API key is missing
23: Mailchimp server is missing
24: Mailchimp Error: {error status} - {error title}: {error detail}
25: ActiveCampaign API key is missing
26: ActiveCampaign account name is missing
27: ActiveCampaign Error: {error status} - {error title}: {error detail}
28: ActiveCampaign Error: {error status} - {error title}: {error detail}
```

:::

## Retrieve Import Job Details

<Badge type="info" text="GET" /> `/api/v1/subscriber.import`

This API end-point is used to retrieve details of a specific import job for a subscriber list. It requires an
admin-level authorization and provides comprehensive information about the import process, including status and
statistics.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| ListID    | The unique identifier for the subscriber list                        | Yes       |
| ImportID  | The unique identifier for the import job                             | Yes       |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/subscriber.import" \
-H "Authorization: Bearer {Admin API Key}" \
-d "SessionID=exampleSessionId" \
-d "APIKey=exampleApiKey" \
-d "ListID=123" \
-d "ImportID=456"
```

```json [Success Response]
{
  "ImportJob": {
    "ImportID": "456",
    "ImportDate": "2023-01-01T00:00:00Z",
    "FinishedAt": "2023-01-01T01:00:00Z",
    "ImportStatus": "Completed",
    "FailedData": [],
    "TotalSubscribers": 1000,
    "TotalImported": 950,
    "TotalDuplicates": 30,
    "TotalFailed": 20
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 5,
      "Message": "List not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
2: Missing ImportID parameter
3: Invalid ListID parameter
4: Invalid ImportID parameter
5: List not found
6: Invalid ImportID parameter
7: Import job not found
```

:::

## Create a New Subscriber

<Badge type="info" text="POST" /> `api/v1/subscriber.create`

This endpoint is used to create a new subscriber in the system. It requires an admin API key for authorization and
accepts various subscriber details.

**Request Body Parameters:**

| Parameter             | Description                                                                                 | Required?   |
|-----------------------|---------------------------------------------------------------------------------------------|-------------|
| SessionID             | The ID of the user's current session                                                        | Yes         |
| APIKey                | The user's API key. Either `SessionID` or `APIKey` must be provided.                        | Yes         |
| ListID                | The unique identifier for the mailing list                                                  | Yes         |
| EmailAddress          | The email address of the new subscriber                                                     | Yes         |
| Status                | The subscription status ('Opt-In Pending', 'Subscribed', 'Opt-Out Pending', 'Unsubscribed') | No          |
| OptInDate             | The date the user opted in                                                                  | Conditional |
| SubscriptionDate      | The date the user subscribed                                                                | Conditional |
| SubscriptionIP        | The IP address from which the subscription was made                                         | Conditional |
| UnsubscriptionDate    | The date the user unsubscribed                                                              | Conditional |
| UnsubscriptionIP      | The IP address from which the unsubscription was made                                       | Conditional |
| BounceType            | The type of email bounce (e.g., 'Not Bounced', 'Hard', 'Soft')                              | No          |
| CustomFields          | An array of custom field IDs and their values                                               | No          |
| UpdateIfDuplicate     | Flag to update subscriber if email address is duplicate                                     | No          |
| UpdateIfUnsubscribed  | Flag to update subscriber if previously unsubscribed                                        | No          |
| ApplyBehaviors        | Flag to apply behaviors associated with the subscription                                    | No          |
| SendConfirmationEmail | Flag to send a confirmation email to the subscriber                                         | No          |
| UpdateStatistics      | Flag to update statistics upon subscription                                                 | No          |
| TriggerWebServices    | Flag to trigger web services upon subscription                                              | No          |
| TriggerAutoResponders | Flag to trigger autoresponders upon subscription                                            | No          |

::: code-group

```bash [Example Request]
curl -X POST 'https://example.com/api/v1/subscriber.create' \
-H 'Authorization: Bearer {AdminApiKey}' \
-H 'Content-Type: application/json' \
-d '{
  "SessionID": "session_id_here",
  "APIKey": "api_key_here",
  "ListID": "list_id_here",
  "EmailAddress": "email@example.com",
  "Status": "Subscribed",
  "OptInDate": "2023-01-01",
  "SubscriptionDate": "2023-01-01",
  "SubscriptionIP": "192.168.1.1",
  "CustomFields": {
    "100":"First Name Value",
    "103":"Last Name Value"
  }
}'
```

```json [Success Response]
{
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": "subscriber_id_here",
    "EmailAddress": "email@example.com",
    "Status": "Subscribed"
  },
  "SubscriberTags": [],
  "SubscriberSegments": [],
  "SubscriberJourneys": [],
  "SubscriberWebsiteEvents": []
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Missing EmailAddress parameter"
    }
  ]
}
```

```text [Error Codes]
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid EmailAddress. Make sure email address is valid.
4: Invalid ListID.
5: Invalid BounceType value.
6: Invalid Status value.
7: Invalid SubscriptionDate value.
8: Missing SubscriptionDate parameter
9: Missing SubscriptionIP parameter
10: Invalid SubscriptionIP value. It must be an IP address.
11: Missing UnsubscriptionDate parameter
12: Missing UnsubscriptionIP parameter
13: Invalid UnsubscriptionDate value.
14: Invalid UnsubscriptionIP value. It must be an IP address.
15: Missing OptInDate parameter
16: Invalid OptInDate value.
17: Invalid Custom Field value.
18: Subscriber create limit is exceeded
19: Invalid EmailAddress
20: Duplicate EmailAddress
21: Previously unsubscribed EmailAddress
22: Invalid user information
23: Invalid list information
```

:::

**HTTP Response and Error Codes:**

| HTTP Code | Error Code | Description                                |
|-----------|------------|--------------------------------------------|
| 200       | 0          | Success                                    |
| 422       | 1-23       | Various errors related to input validation |

## Update Subscriber Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to update the information of a subscriber in a mailing list. It allows for updating various
subscriber details, including email address, subscription status, bounce type, and custom fields.

**Request Body Parameters:**

| Parameter                                 | Description                                                                                               | Required? |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------|-----------|
| SessionID                                 | The ID of the user's current session                                                                      | Yes       |
| APIKey                                    | The user's API key. Either `SessionID` or `APIKey` must be provided.                                      | Yes       |
| Command                                   | The API command to execute: `Subscriber.Update`                                                           | Yes       |
| SubscriberID                              | The unique identifier of the subscriber                                                                   | Yes       |
| SubscriberListID                          | The unique identifier of the subscriber list                                                              | Yes       |
| EmailAddress                              | The new email address of the subscriber (if applicable)                                                   | No        |
| SubscriptionStatus                        | The new subscription status of the subscriber (Opt-In Pending, Subscribed, Opt-Out Pending, Unsubscribed) | No        |
| BounceType                                | The new bounce type of the subscriber (Not Bounced, Soft, Hard)                                           | No        |
| Fields                                    | An array of custom field values to update                                                                 | No        |
| AuthenticationType                        | The type of authentication used                                                                           | No        |
| IgnoreAllOtherCustomFieldsExceptGivenOnes | Flag to ignore unspecified custom fields                                                                  | No        |

::: code-group

```bash [Example Request]
curl --location 'https://example.com/api.php' \
--form 'ResponseFormat="JSON"' \
--form 'Command="Subscriber.Update"' \
--form 'SessionID="exampleSessionId"' \
--form 'SubscriberListID="26"' \
--form 'SubscriberID="1008"' \
--form 'EmailAddress="test@gmail.com"' \
--form 'AuthenticationType="user"' \
--form 'IgnoreAllOtherCustomFieldsExceptGivenOnes="true"' \
--form 'Fields[CustomField59]="100"' \
--form 'SubscriptionStatus="Subscribed"' \
--form 'BounceType="Not Bounced"' \
--form 'Fields[CustomField59]="102"'
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
  "ErrorCode": 1,
  "ErrorText": "Required field 'subscriberid' is missing."
}
```

```text [Error Codes]
1: Required field 'subscriberid' is missing.
2: Required field 'subscriberlistid' is missing.
3: Email address is empty.
4: Email address is invalid.
5: Subscriber list does not exist or does not belong to the user.
6: Subscriber does not exist.
7: Email address is a duplicate.
8: Required custom field is missing.
9: Custom field value is not unique.
10: Custom field value failed validation.
```

:::

**HTTP Response and Error Codes:**

| HTTP Code | Error Code | Description                                   |
|-----------|------------|-----------------------------------------------|
| 200       | 0          | Success                                       |
| 400       | 1          | Missing required 'subscriberid' parameter     |
| 400       | 2          | Missing required 'subscriberlistid' parameter |
| 400       | 3          | Email address is empty                        |
| 400       | 4          | Email address is invalid                      |
| 400       | 5          | Subscriber list does not exist or not owned   |
| 400       | 6          | Subscriber does not exist                     |
| 400       | 7          | Email address is a duplicate                  |
| 400       | 8          | Required custom field is missing              |
| 400       | 9          | Custom field value is not unique              |
| 400       | 10         | Custom field value failed validation          |

## Search Subscribers

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of subscribers based on the provided criteria, such as list ID and operator. It supports
pagination and ordering of the subscriber list.

**Request Body Parameters:**

| Parameter         | Description                                                          | Required? |
|-------------------|----------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                 | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command           | `Subscribers.Search`                                                 | Yes       |
| ListID            | Unique identifier for the list                                       | Yes       |
| Operator          | Operator to apply on the list retrieval (and, or)                    | Yes       |
| RecordsPerRequest | Number of records to retrieve per request                            | No        |
| RecordsFrom       | Starting point for record retrieval                                  | No        |
| OrderField        | Field to order the records by                                        | No        |
| OrderType         | Type of ordering to apply (ASC or DESC)                              | No        |
| Rules             | Filtering rules for the query                                        | No        |
| RulesJson         | JSON representation of the filtering rules                           | No        |
| DebugQueryBuilder | If set to true, returns the prepared SQL query                       | No        |

::: code-group

::: warning NOTICE
Please refer to [this help article](/v5.6.x/api-reference/criteria-syntax) for `RulesJSON` parameter syntax.
:::

```bash [Example Request]
curl --location 'https://example/api.php' \
--form 'ResponseFormat="JSON"' \
--form 'Command="Subscribers.Search"' \
--form 'SessionID="{SessionID}"' \
--form 'ListID="26"' \
--form 'Operator="and"' \
--form 'RulesJSON="[[{\"type\":\"fields\",\"field_id\":\"EmailAddress\",\"operator\":\"contains\",\"value\":\"cem\"}]]"' \
--form 'RecordsFrom="0"' \
--form 'RecordsPerRequest="3"' \
--form 'OrderField="EmailAddress"' \
--form 'OrderType="ASC"'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "EmailAddress": "example@example.com",
      "SubscriberID": "123",
      "SubscriberTags": [
        "Tag1",
        "Tag2"
      ]
    }
  ],
  "TotalSubscribers": 100
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "List ID is required."
}
```

```text [Error Codes]
1: List ID is required.
2: Operator is required.
3: Unauthorized access to the list.
```

:::

**HTTP Response and Error Codes:**

| HTTP Code | Error Code | Description                      |
|-----------|------------|----------------------------------|
| 200       | 0          | Success                          |
| 400       | 1          | List ID is required.             |
| 400       | 2          | Operator is required.            |
| 403       | 3          | Unauthorized access to the list. |