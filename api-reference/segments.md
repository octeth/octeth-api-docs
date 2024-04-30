---
layout: doc
---

# Segments

## Create a New Segment

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to create a new segment within a subscriber list. A segment allows you to categorize your
subscribers based on specific criteria.

**Request Body Parameters:**

| Parameter           | Description                                                                | Required? |
|---------------------|----------------------------------------------------------------------------|-----------|
| SessionID           | The ID of the user's current session                                       | Yes       |
| APIKey              | The user's API key. Either `SessionID` or `APIKey` must be provided.       | Yes       |
| Command             | Segment.Create                                                             | Yes       |
| SubscriberListID    | The unique identifier for the subscriber list to which the segment belongs | Yes       |
| SegmentName         | The name of the segment to be created                                      | Yes       |
| SegmentOperator     | The operator used to combine segment rules (e.g., AND, OR)                 | Yes       |
| SegmentRuleField    | An array of fields to be used in segment rules                             | No        |
| SegmentRuleOperator | An array of operators to be used in segment rules                          | No        |
| SegmentRuleFilter   | An array of values to filter the fields in segment rules                   | No        |
| RulesJson           | A JSON string representing the segment rules                               | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Segment.Create' \
  -d 'SubscriberListID=123' \
  -d 'SegmentName=My New Segment' \
  -d 'SegmentOperator=AND' \
  -d 'RulesJson={"field":"email","operator":"contains","value":"@example.com"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SegmentID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": [
    "Missing subscriber list id"
  ]
}
```

```txt [Error Codes]
1: Missing subscriber list id
2: Missing segment name
3: Missing segment operator
4: The target list does not exist or does not belong to the user
```

:::

::: warning NOTICE
Please note that the `SegmentRuleField`, `SegmentRuleOperator`, and `SegmentRuleFilter` parameters are arrays and should
be used to define complex segment rules. If you provide the `RulesJson` parameter, it should be a JSON string that
represents the segment rules in a structured format.
:::

## Update Segment Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to update the information of an existing segment. You can modify the segment's name, operator,
associated subscriber list, and rules.

**Request Body Parameters:**

| Parameter           | Description                                                          | Required? |
|---------------------|----------------------------------------------------------------------|-----------|
| SessionID           | The ID of the user's current session                                 | Yes       |
| APIKey              | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command             | Segment.Update                                                       | Yes       |
| SegmentID           | The unique identifier for the segment to be updated                  | Yes       |
| SegmentName         | The new name for the segment                                         | Yes       |
| SubscriberListID    | The ID of the subscriber list associated with the segment (optional) | No        |
| SegmentOperator     | The logical operator to be used for the segment rules (`and`/`or`)   | No        |
| SegmentRuleField    | An array of fields used in segment rules (optional)                  | No        |
| SegmentRuleOperator | An array of operators used in segment rules (optional)               | No        |
| SegmentRuleFilter   | An array of filter values used in segment rules (optional)           | No        |
| RulesJson           | JSON representation of the segment rules (optional)                  | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Segment.Update' \
  -d 'SegmentID=123' \
  -d 'SegmentName=Updated Segment Name' \
  -d 'SegmentOperator=and'
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
    1
  ],
  "ErrorText": [
    "Missing segment id"
  ]
}
```

```txt [Error Codes]
1: Missing segment id
2: Missing segment name
3: Missing segment operator
4: Invalid segment id
5: Invalid segment operator
```

:::

## Copy Segments from One List to Another

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to copy segments from a source subscriber list to a target subscriber list. It is useful for
replicating segmentation rules across different lists within the same user account.

**Request Body Parameters:**

| Parameter    | Description                                                             | Required? |
|--------------|-------------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                    | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided.    | Yes       |
| Command      | Segments.Copy                                                           | Yes       |
| SourceListID | The ID of the source subscriber list from which segments will be copied | Yes       |
| TargetListID | The ID of the target subscriber list to which segments will be copied   | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Segments.Copy' \
  -d 'SourceListID=123' \
  -d 'TargetListID=456'
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
    1
  ],
  "ErrorText": [
    "Required field missing: SourceListID"
  ]
}
```

```txt [Error Codes]
1: Required field missing: SourceListID
2: Required field missing: TargetListID
4: Invalid subscriber list ID
```

:::

## Delete Segments

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for the deletion of one or more segments associated with a user. The user must provide the segment
IDs to be deleted.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Segments.Delete                                                      | Yes       |
| Segments  | Comma-separated list of segment IDs to be deleted                    | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Segments.Delete' \
  -d 'Segments=1,2,3'
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
  "ErrorCode": {
    "segments": 1
  },
  "ErrorText": [
    "Segment ids are missing"
  ]
}
```

```txt [Error Codes]
1: Segment ids are missing
```

:::

::: warning NOTICe

- Please note that the `Segments` parameter is a comma-separated list of segment IDs that the user wishes to delete.
- If the `Segments` parameter is missing or invalid, an error response will be returned with the appropriate error code
  and message.
  :::

## Retrieve Subscriber List Segments

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves all segments associated with a specific subscriber list for the authenticated user.

**Request Body Parameters:**

| Parameter        | Description                                                          | Required? |
|------------------|----------------------------------------------------------------------|-----------|
| SessionID        | The ID of the user's current session                                 | Yes       |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command          | Segments.Get                                                         | Yes       |
| SubscriberListID | The unique identifier for the subscriber list                        | Yes       |
| OrderField       | The field by which to order the segments                             | No        |
| OrderType        | The type of ordering to apply (e.g., ASC, DESC)                      | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "your-session-id",
        "APIKey": "your-api-key",
        "Command": "Segments.Get",
        "SubscriberListID": "12345",
        "OrderField": "SegmentName",
        "OrderType": "ASC"
      }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSegmentCount": 5,
  "Segments": [
    {
      "SegmentID": "1",
      "SegmentName": "Segment A",
      "CreationDate": "2023-01-01",
      "LastUpdated": "2023-01-05"
    },
    {
      "SegmentID": "2",
      "SegmentName": "Segment B",
      "CreationDate": "2023-02-01",
      "LastUpdated": "2023-02-05"
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
```

:::

::: warning NOTICE

- Please note that the `OrderField` and `OrderType` parameters are optional and can be used to sort the returned
  segments list.
- If not provided, the default sorting will be applied.
- The `SubscriberListID` is a mandatory parameter, and failure to provide it will result in an error response.
  :::