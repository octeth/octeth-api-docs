---
layout: doc
---

# Custom Fields

## Create Custom Field

This API endpoint is used to create a new custom field in a subscriber list. It supports the creation of fields with
various types and options, including preset fields.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                                                                                     |          |
|--------------------|-------------------------------------------------------------------------------------------------|----------|
| Command            | `CustomField.Create`                                                                            | Required |
| SubscriberListId   | The ID of the subscriber list to which the custom field will be added.                          | Required |
| FieldName          | *(Optional if `PresetName` is provided)* The name of the custom field.                          | Optional |
| FieldType          | *(Optional if `PresetName` is provided)* The type of the custom field (e.g., 'Date field').     | Optional |
| PresetName         | *(Optional)* The name of a preset custom field.                                                 | Optional |
| DefaultValue       | *(Optional)* The default value for the custom field.                                            | Optional |
| ValidationMethod   | *(Optional)* The method of validation for the custom field (e.g., 'Custom').                    | Optional |
| ValidationRule     | *(Optional)* The rule for validation, required if ValidationMethod is 'Custom'.                 | Optional |
| MergeTagAlias      | *(Optional)* An alias for the merge tag associated with the custom field.                       | Optional |
| OptionLabel        | *(Optional)* Labels for options in the custom field.                                            | Optional |
| OptionValue        | *(Optional)* Values for options in the custom field.                                            | Optional |
| OptionSelected     | *(Optional)* Indicates which options are selected by default.                                   | Optional |
| IsRequired         | *(Optional)* Indicates whether the field is required ('Yes' or 'No').                           | Optional |
| IsUnique           | *(Optional)* Indicates whether the field value must be unique ('Yes' or 'No').                  | Optional |
| Visibility         | *(Optional)* The visibility of the field ('Public' or 'User Only').                             | Optional |
| IsGlobal           | *(Optional)* Indicates whether the field is global ('Yes' or 'No').                             | Optional |
| Years              | *(Optional)* Required if the FieldType is 'Date field'. Specifies the range of years available. | Optional |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating no error
- `CustomFieldID`: The ID of the newly created custom field

**Error Response:**

- `1`: Missing subscriber list ID.
- `2`: Missing field name.
- `3`: Missing field type.
- `4`: Missing validation rule. This is required when the `validationmethod` is set to 'Custom'.
- `5`: Invalid or undefined `presetname`. This occurs when the `presetname` provided does not match any key in
  the `$ArrayCustomFieldPresets`.
- `1000`: Merge tag alias code has been set for another custom field. This error is returned if the
  provided `mergetagalias` is already in use by another custom field in the same subscriber list.
- `1001`: Merge tag alias code includes invalid characters. This is triggered if the provided `mergetagalias` contains
  characters outside the allowed set.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "CustomFieldID": 12345
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    2
  ],
  // Assuming 2 indicates a missing field name
  "ErrorText": "Missing field name"
}
```

## Update Custom Field

This API endpoint allows for updating an existing custom field in a subscriber list. It supports modifying various
properties of the custom field.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                                                                                         |          |
|--------------------|-----------------------------------------------------------------------------------------------------|----------|
| Command            | `CustomField.Update`                                                                                | Required |
| CustomFieldId      | The ID of the custom field to update.                                                               | Required |
| FieldName          | The new name of the custom field.                                                                   | Required |
| FieldType          | The new type of the custom field (e.g., 'Single line', 'Paragraph text').                           | Required |
| DefaultValue       | *(Optional)* The new default value for the custom field.                                            | Optional |
| ValidationMethod   | *(Optional)* The new method of validation for the custom field.                                     | Optional |
| ValidationRule     | *(Optional)* The new rule for validation, required if ValidationMethod is 'Custom'.                 | Optional |
| MergeTagAlias      | *(Optional)* An updated alias for the merge tag associated with the custom field.                   | Optional |
| OptionLabel        | *(Optional)* New labels for options in the custom field.                                            | Optional |
| OptionValue        | *(Optional)* New values for options in the custom field.                                            | Optional |
| OptionSelected     | *(Optional)* Indicates which options are selected by default.                                       | Optional |
| IsRequired         | *(Optional)* Indicates whether the field is now required ('Yes' or 'No').                           | Optional |
| IsUnique           | *(Optional)* Indicates whether the field value must now be unique ('Yes' or 'No').                  | Optional |
| Visibility         | *(Optional)* The new visibility of the field ('Public' or 'User Only').                             | Optional |
| IsGlobal           | *(Optional)* Indicates whether the field is now global ('Yes' or 'No').                             | Optional |
| Years              | *(Optional)* Required if the FieldType is 'Date field'. Specifies the new range of years available. | Optional |

**Success Response:**

A successful response indicates that the custom field has been updated.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating that no error occurred during the operation.

**Error Response:**

- `1`: Missing custom field ID.
- `2`: Missing field name.
- `3`: Missing field type.
- `4`: Missing validation rule.
- `6`: Invalid custom field ID.
- `7`: Invalid field type.
- `8`: Invalid validation method.
- `9`: Invalid visibility value.
- `10`: Invalid IsRequired value.
- `11`: Invalid IsUnique value.
- `12`: Invalid IsGlobal value.
- `1000`: Merge tag alias code has been set for another custom field.
- `1001`: Merge tag alias code includes invalid characters.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    2
  ],
  "ErrorText": "Missing field name"
}
```

## Copy Custom Fields

This API endpoint allows for copying all custom fields from one subscriber list (source list) to another (target list).

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter   | Description                                              |          |
|-------------|----------------------------------------------------------|----------|
| Command     | `CustomFields.Copy`                                      | Required |
| SourceListId | The ID of the subscriber list from which to copy fields. | Required |
| TargetListId | The ID of the subscriber list to which to copy fields.   | Required |

**Success Response:**

A successful response indicates that all custom fields from the source list have been copied to the target list.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating that no error occurred during the operation.

**Error Response:**

- `1`: Missing source subscriber list ID.
- `2`: Missing target subscriber list ID.
- `4`: Invalid source or target subscriber list ID.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing source subscriber list id"
}
```

## Delete Custom Fields

This API endpoint facilitates the deletion of one or more custom fields from a subscriber list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter     | Description                                             |          |
|---------------|---------------------------------------------------------|----------|
| Command       | `CustomFields.Delete`                                   | Required |
| CustomFields  | A comma-separated string of custom field IDs to delete. | Required |

**Success Response:**

A successful response indicates that the specified custom fields have been deleted.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating that no error occurred during the operation.

**Error Response:**

- If the `CustomFields` parameter is missing or invalid, the response will indicate failure.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [1], // Assuming 1 indicates missing or invalid custom field IDs
  "ErrorText": "Custom field ids are missing"
}
```

## Retrieve Custom Fields

This API endpoint allows for retrieving custom fields associated with a specified subscriber list. It can also return global custom fields if requested.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter                | Description                                                                     |          |
|--------------------------|---------------------------------------------------------------------------------|----------|
| Command                  | `CustomFields.Get`                                                              | Required |
| SubscriberListId         | The ID of the subscriber list for which to retrieve custom fields.              | Required |
| OrderField               | *(Optional)* Field to order the custom fields by.                               | Optional |
| OrderType                | *(Optional)* Type of order (e.g., 'ASC', 'DESC').                               | Optional |
| ReturnGlobalCustomFields | *(Optional)* Boolean indicating whether to return global custom fields as well. | Optional |

**Success Response:**

A successful response will return a JSON object containing the following keys:
- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating no error
- `TotalFieldCount`: The total number of custom fields
- `CustomFields`: An array of custom fields associated with the specified subscriber list

**Error Response:**

- `1`: Missing subscriber list ID.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalFieldCount": 10,
  "CustomFields": [
    // Array of custom fields
  ]
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": "Missing subscriber list id"
}
```
