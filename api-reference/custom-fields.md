---
layout: doc
---

# Custom Fields

## Create a New Custom Field

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to create a new custom field for a subscriber list. It allows for various field types and configurations, including preset fields, validation rules, and merge tag aliases.

**Request Body Parameters:**

| Parameter        | Description                                                           | Required?   |
|------------------|-----------------------------------------------------------------------|-------------|
| SessionID        | The ID of the user's current session                                  | Yes         |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided.  | Yes         |
| Command          | CustomField.Create                                                    | Yes         |
| SubscriberListID | The ID of the subscriber list to which the custom field will be added | Yes         |
| FieldName        | The name of the custom field                                          | Conditional |
| FieldType        | The type of the custom field (e.g., 'Date field', 'Drop down', etc.)  | Conditional |
| DefaultValue     | The default value for the custom field                                | No          |
| ValidationMethod | The method used to validate the field (e.g., 'None', 'Custom')        | No          |
| ValidationRule   | The rule used for custom validation                                   | Conditional |
| MergeTagAlias    | An alias for the merge tag associated with the custom field           | No          |
| PresetName       | The name of the preset to use for the custom field                    | Conditional |
| Years            | The range of years for a 'Date field' type                            | Conditional |
| OptionLabel      | The labels for the options of the field                               | Conditional |
| OptionValue      | The values for the options of the field                               | Conditional |
| OptionSelected   | The selected options of the field                                     | Conditional |
| IsRequired       | Whether the field is required ('Yes' or 'No')                         | No          |
| IsUnique         | Whether the field must have a unique value ('Yes' or 'No')            | No          |
| Visibility       | The visibility of the field ('Public' or 'User Only')                 | No          |
| IsGlobal         | Whether the field is global ('Yes' or 'No')                           | No          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=CustomField.Create' \
  -d 'SubscriberListID=123' \
  -d 'FieldName=Birthdate' \
  -d 'FieldType=Date field' \
  -d 'DefaultValue=1990-01-01' \
  -d 'ValidationMethod=Custom' \
  -d 'ValidationRule=after:1980-01-01' \
  -d 'MergeTagAlias=birthday' \
  -d 'IsRequired=Yes' \
  -d 'IsUnique=No' \
  -d 'Visibility=Public' \
  -d 'IsGlobal=No'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "CustomFieldID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
1: Missing subscriber list id
2: Missing field name
3: Missing field type
4: Missing validation rule
5: Invalid preset name
1000: Merge tag alias code has been set for another custom field
1001: Merge tag alias code includes invalid characters
```

## Update Custom Field

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to update the details of an existing custom field in the system.

**Request Body Parameters:**

| Parameter        | Description                                                           | Required? |
|------------------|-----------------------------------------------------------------------|-----------|
| SessionID        | The ID of the user's current session                                  | Yes       |
| APIKey           | The user's API key. Either `SessionID` or `APIKey` must be provided.  | Yes       |
| Command          | CustomField.Update                                                    | Yes       |
| CustomFieldID    | The unique identifier for the custom field to be updated              | Yes       |
| FieldName        | The name of the custom field                                          | Yes       |
| FieldType        | The type of the custom field (e.g., 'Single line', 'Paragraph text')  | Yes       |
| SubscriberListID | The ID of the subscriber list associated with the custom field        | No        |
| DefaultValue     | The default value for the custom field                                | No        |
| MergeTagAlias    | The merge tag alias for the custom field                              | No        |
| ValidationMethod | The method used to validate the custom field's value                  | No        |
| ValidationRule   | The rule applied for validating the custom field's value              | No        |
| OptionLabel      | The label for the field option                                        | No        |
| OptionValue      | The value for the field option                                        | No        |
| OptionSelected   | The selected option for the field                                     | No        |
| Visibility       | The visibility setting for the custom field ('Public' or 'User Only') | No        |
| IsGlobal         | Whether the custom field is global ('Yes' or 'No')                    | No        |
| IsRequired       | Whether the custom field is required ('Yes' or 'No')                  | No        |
| IsUnique         | Whether the custom field is unique ('Yes' or 'No')                    | No        |
| Years            | The years option for a date field                                     | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "CustomField.Update",
    "CustomFieldID": "123",
    "FieldName": "New Field Name",
    "FieldType": "Single line"
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
    "ErrorCode": [1],
    "ErrorText": ["Missing custom field id"]
}
```

```txt [Error Codes]
1: Missing custom field id
2: Missing field name
3: Missing field type
4: Missing validation rule
6: Invalid custom field id
7: Invalid field type
8: Invalid validation method
9: Invalid visibility value
10: Invalid IsRequired value
11: Invalid IsUnique value
12: Invalid IsGlobal value
1000: Merge tag alias code has been set for another custom field
1001: Merge tag alias code includes invalid characters.
```

## Delete Custom Fields

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to delete one or more custom fields associated with a user. The custom fields to be deleted are specified by their IDs.

**Request Body Parameters:**

| Parameter    | Description                                                          | Required? |
|--------------|----------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                 | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command      | CustomFields.Delete                                                  | Yes       |
| CustomFields | A comma-separated list of custom field IDs to delete                 | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "CustomFields.Delete",
    "CustomFields": "1,2,3"
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
  "ErrorCode": {
    "customfields": 1
  },
  "ErrorText": ["Custom field ids are missing"]
}
```

```txt [Error Codes]
1: Custom field ids are missing
```
:::

## Retrieve Custom Fields

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves custom fields associated with a specific subscriber list. It allows for the optional return of global custom fields as well.

**Request Body Parameters:**

| Parameter                | Description                                                           | Required? |
|--------------------------|-----------------------------------------------------------------------|-----------|
| SessionID                | The ID of the user's current session                                  | Yes       |
| APIKey                   | The user's API key. Either `SessionID` or `APIKey` must be provided.  | Yes       |
| Command                  | CustomFields.Get                                                      | Yes       |
| SubscriberListID         | The unique identifier for the subscriber list                         | Yes       |
| ReturnGlobalCustomFields | A boolean value to specify if global custom fields should be returned | No        |
| OrderField               | The field by which to order the custom fields                         | No        |
| OrderType                | The order type, either 'ASC' for ascending or 'DESC' for descending   | No        |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "CustomFields.Get",
    "SubscriberListID": "123",
    "ReturnGlobalCustomFields": true,
    "OrderField": "FieldName",
    "OrderType": "ASC"
}'
```

```json [Success Response]
{
    "Success": true,
    "ErrorCode": 0,
    "ErrorText": "",
    "TotalFieldCount": 5,
    "CustomFields": [
        {
            "FieldID": "1",
            "FieldName": "CustomField1",
            "FieldType": "text",
            // Additional custom field details...
        },
        // Additional custom fields...
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
