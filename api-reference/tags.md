---
layout: doc
---

# Tags

## Create Subscriber Tags

This API endpoint is used for creating a new tag within a specified subscriber list. It facilitates the categorization
or grouping of subscribers in a list by assigning a unique tag name.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                              | Required |
|--------------------|------------------------------------------|----------|
| Command            | `Subscriber.Tags.Create`                 | Yes      |
| subscriberlistid   | The ID of the subscriber list            | Yes      |
| tag                | Name of the tag to be created            | Yes      |

**Success Response:**

A successful response indicates that the tag has been created and returns the ID of the new tag:

```json
{
  "Success": true,
  "TagID": 12345
}
```

**Error Response:**

Error responses vary based on the issue encountered. Examples include:

- `1`: Missing subscriber list ID
- `2`: Missing tag name
- `4`: Invalid subscriber list ID
- `5`: There is another tag with the same name

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing subscriber list id"
}
```

The API requires the ID of the subscriber list where the tag will be created and the name for the new tag. If the tag
name already exists within the same list, the request will fail, indicating a duplicate name issue. The API also
verifies the existence and ownership of the subscriber list.

## Delete Subscriber Tags

This API endpoint allows for deleting tags associated with a specific subscriber list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter        | Description                                                       |          |
|------------------|-------------------------------------------------------------------|----------|
| Command          | `Subscriber.Tags.Delete`                                          | Required |
| SubscriberListId | The ID of the subscriber list associated with the tags to delete. | Required |
| TagIds           | A comma-separated string of tag IDs to delete.                    | Optional |

**Success Response:**

A successful response indicates that the specified tags have been deleted.

- `Success`: true

**Error Response:**

- `1`: Missing subscriber list ID.
- `4`: Invalid subscriber list ID.

**Example Success Response:**

```json
{
  "Success": true
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    2
  ],
  "ErrorText": "Tag ids are missing"
}
```

## Retrieve Subscriber Tags

This API endpoint is designed to retrieve tags associated with a specific subscriber list, including the count of
subscribers for each tag.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter              | Description                                                                           |          |
|------------------------|---------------------------------------------------------------------------------------|----------|
| Command                | `Subscriber.Tags.Get`                                                                 | Required |
| SubscriberListId       | The ID of the subscriber list for which to retrieve tags.                             | Required |
| OrderField             | *(Optional)* Field to order the tags by.                                              | Optional |
| OrderType              | *(Optional)* Type of order (e.g., 'ASC', 'DESC').                                     | Optional |
| DisableSubscriberCount | *(Optional)* Boolean indicating whether to disable the subscriber count for each tag. | Optional |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true
- `TagCount`: The number of tags retrieved.
- `Tags`: An array of tags associated with the specified subscriber list.

**Error Response:**

- `1`: Missing subscriber list ID.
- `4`: Invalid subscriber list ID or the list does not belong to the user.

**Example Success Response:**

```json
{
  "Success": true,
  "TagCount": 5,
  "Tags": [
    // Array of tags
  ]
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing subscriber list id"
}
```

## Update Subscriber Tag

This API endpoint allows for updating an existing tag within a specific subscriber list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                                            |          |
|--------------------|--------------------------------------------------------|----------|
| Command            | `Subscriber.Tags.Update`                               | Required |
| TagId              | The ID of the tag to be updated.                       | Required |
| SubscriberListId   | The ID of the subscriber list associated with the tag. | Required |
| Tag                | The new name for the tag.                              | Required |

**Success Response:**

A successful response indicates that the tag has been updated.

- `Success`: true

**Error Response:**

- `1`: Missing tag ID.
- `2`: Missing subscriber list ID.
- `3`: Missing tag name.
- `4`: Invalid subscriber list ID or tag ID.

**Example Success Response:**

```json
{
  "Success": true
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing tag id"
}
```

## Tag Subscriber(s)

This API endpoint facilitates tagging individual subscribers or groups of subscribers within a specific subscriber list
based on certain criteria or rules.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                                                                          |          |
|--------------------|--------------------------------------------------------------------------------------|----------|
| Command            | `Subscriber.Tag`                                                                     | Required |
| TagId              | The ID of the tag to be assigned to subscribers.                                     | Required |
| SubscriberListId   | The ID of the subscriber list to which the tag belongs.                              | Required |
| SubscriberId       | *(Optional)* The ID(s) of the subscriber(s) to be tagged.                            | Optional |
| RulesJson          | *(Optional)* A JSON string defining the criteria for tagging subscribers.            | Optional |
| RulesOperator      | *(Optional)* The logical operator ('and' or 'or') used between rules in `RulesJson`. | Optional |
| TriggerEvents      | *(Optional)* Boolean indicating whether to trigger events.                           | Optional |

**Success Response:**

A successful response indicates that the tag has been assigned.

- `Success`: true

**Error Response:**

- `1`: Missing tag ID.
- `2`: Missing subscriber list ID.
- `3`: Missing tag name.
- `4`: Invalid list ID or list does not belong to the user.
- `5`: Invalid subscriber ID.
- `6`: Invalid tag ID.
- `7`: Missing RulesJSON parameter.
- `8`: Invalid query builder response or missing RulesOperator parameter.

**Example Success Response:**

```json
{
  "Success": true
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing tag id"
}
```

## Untag Subscriber(s)

This API endpoint is used for removing tags from individual subscribers or groups of subscribers within a specific
subscriber list based on certain criteria or rules.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                                                                          |          |
|--------------------|--------------------------------------------------------------------------------------|----------|
| Command            | `Subscriber.Untag`                                                                   | Required |
| TagId              | The ID of the tag to be removed from subscribers.                                    | Required |
| SubscriberListId   | The ID of the subscriber list associated with the tag.                               | Required |
| SubscriberId       | *(Optional)* The ID(s) of the subscriber(s) to be untagged.                          | Optional |
| RulesJson          | *(Optional)* A JSON string defining the criteria for untagging subscribers.          | Optional |
| RulesOperator      | *(Optional)* The logical operator ('and' or 'or') used between rules in `RulesJson`. | Optional |
| TriggerEvents      | *(Optional)* Boolean indicating whether to trigger events.                           | Optional |

**Success Response:**

A successful response indicates that the tag has been removed.

- `Success`: true

**Error Response:**

- `1`: Missing tag ID.
- `2`: Missing subscriber list ID.
- `3`: Missing subscriber ID.
- `4`: Invalid list ID or list does not belong to the user.
- `5`: Invalid subscriber ID.
- `6`: Invalid tag ID.
- `7`: Missing RulesJSON parameter.
- `8`: Invalid query builder response or missing RulesOperator parameter.

**Example Success Response:**

```json
{
  "Success": true
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing tag id"
}
```
