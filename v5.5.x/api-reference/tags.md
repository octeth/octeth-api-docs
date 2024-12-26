---
layout: doc
---

# Tags

## Tag a Subscriber

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to tag subscribers within a list. You can either tag specific subscribers by providing their
IDs or tag all subscribers that match certain criteria defined by a JSON ruleset.

**Request Body Parameters:**

| Parameter        | Description                                                                   | Required?   |
|------------------|-------------------------------------------------------------------------------|-------------|
| SessionID        | The ID of the user's current session                                          | Yes         |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided.          | Yes         |
| Command          | Subscriber.Tag                                                                | Yes         |
| TagID            | The unique identifier for the tag                                             | Yes         |
| SubscriberListID | The unique identifier for the subscriber list                                 | Yes         |
| SubscriberID     | The unique identifier(s) for the subscriber(s) to be tagged (comma-separated) | No          |
| RulesJSON        | The JSON string defining the rules to match subscribers                       | Conditional |
| RulesOperator    | The operator to be used with the rules (`and`/`or`)                           | Conditional |
| TriggerEvents    | Whether to trigger events when tagging (1 for yes, 0 for no)                  | No          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscriber.Tag' \
  -d 'TagID=123' \
  -d 'SubscriberListID=456' \
  -d 'SubscriberID=789,1011' \
  -d 'TriggerEvents=1'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": [
    "Missing tag id"
  ]
}
```

```txt [Error Codes]
1: Missing tag id
2: Missing subscriber list id
3: Missing subscriber id
4: Invalid list id
5: Invalid subscriber id
6: Missing RulesJSON parameter or Invalid tag id
7: Missing RulesOperator parameter
8: Invalid query builder response
```

:::

::: warning NOTICE

- Please note that if `SubscriberID` is not provided, then `RulesJSON` and `RulesOperator` are required.
- The `RulesOperator` will default to 'or' if not provided as 'and'.
- When tagging by criteria, the system will process a batch tagging based on the rules defined in `RulesJSON`.
- If `TriggerEvents` is set to 1, any events associated with tagging will be triggered.
  :::

## Untag a Subscriber

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to remove a tag from a subscriber or a list of subscribers. You can specify a single subscriber
by their ID or use a JSON rule set to untag multiple subscribers that match certain criteria.

**Request Body Parameters:**

| Parameter        | Description                                                                 | Required? |
|------------------|-----------------------------------------------------------------------------|-----------|
| SessionID        | The ID of the user's current session                                        | Yes       |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command          | Subscriber.Untag                                                            | Yes       |
| TagID            | The unique identifier of the tag to be removed                              | Yes       |
| SubscriberListID | The unique identifier of the subscriber list                                | Yes       |
| SubscriberID     | The unique identifier of the subscriber (optional if RulesJSON is provided) | No        |
| RulesJSON        | JSON string representing the rules to match subscribers (optional)          | No        |
| RulesOperator    | Operator to be used with rules: 'and' or 'or' (default is 'or')             | No        |
| TriggerEvents    | Whether to trigger events after untagging: 1 for yes, 0 for no              | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Subscriber.Untag",
    "TagID": "123",
    "SubscriberListID": "456",
    "SubscriberID": "789",
    "TriggerEvents": "1"
}'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": [
    "Missing tag id"
  ]
}
```

```txt [Error Codes]
1: Missing tag id
2: Missing subscriber list id
3: Missing subscriber id
4: Invalid list id
5: Invalid subscriber id
6: Invalid tag id or Missing RulesJSON parameter
7: Missing RulesOperator parameter
8: Invalid query builder response
```

:::

## Create a New Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to create a new tag for a subscriber in a specific list. A tag is a label that can be used to
categorize subscribers based on certain criteria or actions.

**Request Body Parameters:**

| Parameter        | Description                                                          | Required? |
|------------------|----------------------------------------------------------------------|-----------|
| SessionID        | The ID of the user's current session                                 | Yes       |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command          | Subscriber.Tags.Create                                               | Yes       |
| SubscriberListID | The unique identifier for the subscriber list                        | Yes       |
| Tag              | The name of the tag to be created                                    | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Subscriber.Tags.Create",
    "SubscriberListID": "123",
    "Tag": "VIP"
}'
```

```json [Success Response]
{
  "Success": true,
  "TagID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1,
    2
  ],
  "ErrorText": [
    "Missing subscriber list id",
    "Missing tag name"
  ]
}
```

```txt [Error Codes]
1: Missing subscriber list id
2: Missing tag name
4: The specified list does not exist or does not belong to the user
5: There is another tag with the same name
```

:::

## Delete Subscriber Tags

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for the deletion of tags from a subscriber list. The user must provide the ID of the subscriber
list and can optionally specify tag IDs to delete.

**Request Body Parameters:**

| Parameter        | Description                                                          | Required? |
|------------------|----------------------------------------------------------------------|-----------|
| SessionID        | The ID of the user's current session                                 | Yes       |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command          | Subscriber.Tags.Delete                                               | Yes       |
| SubscriberListID | The unique identifier for the subscriber list                        | Yes       |
| TagIDs           | Comma-separated list of tag IDs to delete (optional)                 | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscriber.Tags.Delete' \
  -d 'SubscriberListID=123' \
  -d 'TagIDs=1,2,3'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    2
  ],
  "ErrorText": [
    "Tag ids are missing"
  ]
}
```

```txt [Error Codes]
2: Subscriber list ID is missing.
4: The specified list does not exist or does not belong to the user.
```

:::

## Retrieve Subscriber Tags

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of subscriber tags associated with a specific subscriber list. It allows for optional
sorting and can include a count of subscribers for each tag.

**Request Body Parameters:**

| Parameter              | Description                                                          | Required? |
|------------------------|----------------------------------------------------------------------|-----------|
| SessionID              | The ID of the user's current session                                 | Yes       |
| APIKey                 | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command                | Subscriber.Tags.Get                                                  | Yes       |
| SubscriberListID       | The unique identifier for the subscriber list                        | Yes       |
| OrderField             | The field by which to order the tags                                 | No        |
| OrderType              | The type of ordering to apply (e.g., ASC, DESC)                      | No        |
| DisableSubscriberCount | If set to 1, disables the count of subscribers for each tag          | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscriber.Tags.Get' \
  -d 'SubscriberListID=123' \
  -d 'OrderField=TagName' \
  -d 'OrderType=ASC' \
  -d 'DisableSubscriberCount=0'
```

```json [Success Response]
{
  "Success": true,
  "TagCount": 5,
  "Tags": [
    {
      "TagID": "1",
      "TagName": "Interested",
      "SubscriberCount": 150
    },
    {
      "TagID": "2",
      "TagName": "Purchased",
      "SubscriberCount": 75
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
1: Missing subscriber list id
4: The specified list does not exist or does not belong to the user
```

:::

## Update Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

This endpoint updates the tag information for a subscriber in a specified list. It requires the tag ID, subscriber list
ID, and the new tag name to be provided.

**Request Body Parameters:**

| Parameter        | Description                                                          | Required? |
|------------------|----------------------------------------------------------------------|-----------|
| SessionID        | The ID of the user's current session                                 | Yes       |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command          | Subscriber.Tags.Update                                               | Yes       |
| TagID            | The unique identifier for the tag to be updated                      | Yes       |
| SubscriberListID | The ID of the subscriber list                                        | Yes       |
| Tag              | The new name for the tag                                             | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Subscriber.Tags.Update' \
  -d 'TagID=123' \
  -d 'SubscriberListID=456' \
  -d 'Tag=UpdatedTagName'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": [
    "Missing tag id"
  ]
}
```

```txt [Error Codes]
1: Missing tag id
2: Missing subscriber list id
3: Missing tag name
4: Invalid tag id or subscriber list id
```

:::
