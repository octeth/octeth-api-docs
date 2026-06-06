---
layout: doc
---

# Custom Field API Documentation

Custom field management endpoints for creating, updating, copying, deleting, and retrieving custom fields for subscriber lists.

## Create a Custom Field

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `CustomField.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `customfield.create` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SubscriberListID | Integer | Yes | ID of the subscriber list |
| FieldName | String | Conditional | Name of the custom field (required if PresetName not provided) |
| FieldType | String | Conditional | Type of field: "Single line", "Paragraph text", "Multiple choice", "Drop down", "Checkboxes", "Hidden field", "Date field", "Time field" (required if PresetName not provided) |
| PresetName | String | No | Preset name (e.g., "Country"). If set, only SubscriberListID is required |
| DataType | String | No | Simplified data type: "text", "longtext", "number", "datetime", "date", "time", "timestamp", "single-select", "multi-select". Overrides FieldType and other fields |
| DefaultValue | String | No | Default value for the custom field |
| ValidationMethod | String | No | Validation method: "Disabled", "Numbers", "Letters", "Numbers and letters", "Email address", "URL", "Date", "Time", "Custom" |
| ValidationRule | String | Conditional | Validation rule (required if ValidationMethod is "Custom") |
| MergeTagAlias | String | No | Custom merge tag alias (alphanumeric, spaces, dots, hyphens, underscores only). Cannot use reserved subscriber field names: `SubscriberID`, `EmailAddress`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `SubscriptionStatus`, `BounceType` |
| OptionLabel | Array | No | Array of option labels (for dropdown/multiple choice fields) |
| OptionValue | Array | No | Array of option values (for dropdown/multiple choice fields) |
| OptionSelected | Array | No | Array of selected option keys (for dropdown/multiple choice fields) |
| IsRequired | String | No | Whether field is required: "Yes" or "No" (default: "No") |
| IsUnique | String | No | Whether field must be unique: "Yes" or "No" (default: "No") |
| Visibility | String | No | Field visibility: "Public", "User Only", or "Hidden" (default: "User Only") |
| IsGlobal | String | No | Whether field is global: "Yes" or "No" (default: "No") |
| Years | String | Conditional | Year range for date fields (required if FieldType is "Date field"). Format: "YYYY-YYYY" (e.g., "2010-2030") |
| Meta | Object | No | Additional metadata for the field |
| UniqueIdentifier | Boolean | No | Whether field should be marked as unique identifier |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "customfield.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "FieldName": "Company Name",
    "FieldType": "Single line",
    "DefaultValue": "",
    "ValidationMethod": "Disabled",
    "IsRequired": "No",
    "IsUnique": "No",
    "Visibility": "Public"
  }'
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
  "ErrorCode": [1, 2],
  "ErrorText": ["Missing subscriber list id", "Missing field name"]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
2: Missing field name
3: Missing field type
4: Missing validation rule
5: Invalid preset name
7: Invalid data type
8: Invalid subscriber list id
1000: Merge tag alias code has been set for another custom field
1001: Merge tag alias code includes invalid characters
1002: Merge tag alias cannot use a reserved subscriber field name
```

:::

## Update a Custom Field

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `CustomField.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `customfield.update` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| CustomFieldID | Integer | Yes | ID of the custom field to update |
| FieldName | String | Yes | Name of the custom field |
| FieldType | String | Yes | Type of field: "Single line", "Paragraph text", "Multiple choice", "Drop down", "Checkboxes", "Hidden field", "Date field", "Time field" |
| SubscriberListID | Integer | No | ID of the subscriber list |
| DefaultValue | String | No | Default value for the custom field |
| ValidationMethod | String | No | Validation method: "Disabled", "Numbers", "Letters", "Numbers and letters", "Email address", "URL", "Date", "Time", "Custom" |
| ValidationRule | String | Conditional | Validation rule (required if ValidationMethod is "Date", "Time", or "Custom") |
| MergeTagAlias | String | No | Custom merge tag alias (alphanumeric, spaces, dots, hyphens, underscores only). Cannot use reserved subscriber field names: `SubscriberID`, `EmailAddress`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `SubscriptionStatus`, `BounceType` |
| OptionLabel | Array | No | Array of option labels (for dropdown/multiple choice fields) |
| OptionValue | Array | No | Array of option values (for dropdown/multiple choice fields) |
| OptionSelected | Array | No | Array of selected option keys (for dropdown/multiple choice fields) |
| IsRequired | String | No | Whether field is required: "Yes" or "No" |
| IsUnique | String | No | Whether field must be unique: "Yes" or "No" |
| Visibility | String | No | Field visibility: "Public", "User Only", or "Hidden" |
| IsGlobal | String | No | Whether field is global: "Yes" or "No" |
| Years | String | No | Year range for date fields. Format: "YYYY-YYYY" |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "customfield.update",
    "SessionID": "your-session-id",
    "CustomFieldID": 456,
    "FieldName": "Company Name (Updated)",
    "FieldType": "Single line",
    "Visibility": "User Only",
    "IsRequired": "Yes"
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
  "ErrorCode": [1, 6],
  "ErrorText": ["Missing custom field id", "Invalid custom field id"]
}
```

```txt [Error Codes]
0: Success
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
1001: Merge tag alias code includes invalid characters
1002: Merge tag alias cannot use a reserved subscriber field name
```

:::

## Copy Custom Fields Between Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `CustomField.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `customfields.copy` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SourceListID | Integer | Yes | ID of the source subscriber list |
| TargetListID | Integer | Yes | ID of the target subscriber list |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "customfields.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 456
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
  "ErrorCode": [1, 2],
  "ErrorText": ["Missing source subscriber list id", "Missing target subscriber list id"]
}
```

```txt [Error Codes]
0: Success
1: Missing source subscriber list id
2: Missing target subscriber list id
3: Invalid source subscriber list id
4: Invalid target subscriber list id
```

:::

## Delete Custom Fields

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `CustomFields.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `customfields.delete` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| CustomFields | String | Yes | Comma-separated list of custom field IDs to delete (e.g., "123,456,789") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "customfields.delete",
    "SessionID": "your-session-id",
    "CustomFields": "456,789,1011"
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
  "ErrorText": ["Custom field ids are missing"]
}
```

```txt [Error Codes]
0: Success
1: Custom field ids are missing
```

:::

## Get Custom Fields

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `CustomFields.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `customfields.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SubscriberListID | Integer | Yes | ID of the subscriber list |
| OrderField | String | No | Field to order by: "FieldName", "CustomFieldID", "FieldType", "IsRequired", "IsUnique", "Visibility", "IsGlobal" (default: "FieldName") |
| OrderType | String | No | Order direction: "ASC" or "DESC" (default: "ASC") |
| ReturnGlobalCustomFields | Boolean | No | Whether to include global custom fields in the response (default: false) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "customfields.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "OrderField": "FieldName",
    "OrderType": "ASC",
    "ReturnGlobalCustomFields": false
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
      "CustomFieldID": "456",
      "RelListID": "123",
      "FieldName": "Company Name",
      "FieldType": "Single line",
      "FieldDefaultValue": "",
      "ValidationMethod": "Disabled",
      "IsRequired": "No",
      "IsUnique": "No",
      "Visibility": "Public",
      "IsGlobal": "No"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": ["Missing subscriber list id"]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
2: Invalid subscriber list id
```

:::

## Create a Global Custom Field

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.customfield.create` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| FieldName | String | Yes | Name of the global custom field |
| FieldType | String | Yes | Type of field: "Single line", "Paragraph text", "Multiple choice", "Drop down", "Checkboxes", "Hidden field", "Date field", "Time field" |
| DefaultValue | String | No | Default value for the custom field |
| ValidationMethod | String | No | Validation method: "Disabled", "Numbers", "Letters", "Numbers and letters", "Email address", "URL", "Date", "Time", "Custom" |
| ValidationRule | String | Conditional | Validation rule (required if ValidationMethod is "Custom") |
| MergeTagAlias | String | No | Custom merge tag alias (alphanumeric, spaces, dots, hyphens, underscores only). Cannot use reserved subscriber field names: `SubscriberID`, `EmailAddress`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `SubscriptionStatus`, `BounceType` |
| OptionLabel | Array | No | Array of option labels (for dropdown/multiple choice fields) |
| OptionValue | Array | No | Array of option values (for dropdown/multiple choice fields) |
| OptionSelected | Array | No | Array of selected option keys (for dropdown/multiple choice fields) |
| IsRequired | String | No | Whether field is required: "Yes" or "No" (default: "No") |
| IsUnique | String | No | Whether field must be unique: "Yes" or "No" (default: "No") |
| Visibility | String | No | Field visibility: "Public" or "User Only" (default: "User Only") |
| Years | String | Conditional | Year range for date fields (required if FieldType is "Date field"). Format: "YYYY-YYYY" (e.g., "2010-2030") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "global.customfield.create",
    "SessionID": "admin-session-id",
    "FieldName": "Industry",
    "FieldType": "Drop down",
    "DefaultValue": "",
    "ValidationMethod": "Disabled",
    "IsRequired": "No",
    "IsUnique": "No",
    "Visibility": "Public",
    "OptionLabel": ["Technology", "Healthcare", "Finance", "Retail"],
    "OptionValue": ["tech", "health", "finance", "retail"],
    "OptionSelected": []
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "CustomFieldID": 789
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2, 3],
  "ErrorText": ["Missing field name", "Missing field type"]
}
```

```txt [Error Codes]
0: Success
2: Missing field name
3: Missing field type
4: Missing validation rule
5: Missing years (for date fields)
1000: Merge tag alias code has been set for another custom field
1001: Merge tag alias code includes invalid characters
1002: Merge tag alias cannot use a reserved subscriber field name
```

:::

## Update a Global Custom Field

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.customfield.update` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| CustomFieldID | Integer | Yes | ID of the global custom field to update |
| FieldName | String | Yes | Name of the global custom field |
| FieldType | String | Yes | Type of field: "Single line", "Paragraph text", "Multiple choice", "Drop down", "Checkboxes", "Hidden field", "Date field", "Time field" |
| DefaultValue | String | No | Default value for the custom field |
| ValidationMethod | String | No | Validation method: "Disabled", "Numbers", "Letters", "Numbers and letters", "Email address", "URL", "Date", "Time", "Custom" |
| ValidationRule | String | Conditional | Validation rule (required if ValidationMethod is "Date", "Time", or "Custom") |
| MergeTagAlias | String | No | Custom merge tag alias (alphanumeric, spaces, dots, hyphens, underscores only). Cannot use reserved subscriber field names: `SubscriberID`, `EmailAddress`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `SubscriptionStatus`, `BounceType` |
| OptionLabel | Array | No | Array of option labels (for dropdown/multiple choice fields) |
| OptionValue | Array | No | Array of option values (for dropdown/multiple choice fields) |
| OptionSelected | Array | No | Array of selected option keys (for dropdown/multiple choice fields) |
| IsRequired | String | No | Whether field is required: "Yes" or "No" |
| IsUnique | String | No | Whether field must be unique: "Yes" or "No" |
| Visibility | String | No | Field visibility: "Public" or "User Only" |
| Years | String | No | Year range for date fields. Format: "YYYY-YYYY" |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "global.customfield.update",
    "SessionID": "admin-session-id",
    "CustomFieldID": 789,
    "FieldName": "Industry Sector",
    "FieldType": "Drop down",
    "Visibility": "Public",
    "IsRequired": "Yes"
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
  "ErrorCode": [1, 6],
  "ErrorText": ["Missing custom field id", "Invalid custom field id"]
}
```

```txt [Error Codes]
0: Success
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
1000: Merge tag alias code has been set for another custom field
1001: Merge tag alias code includes invalid characters
1002: Merge tag alias cannot use a reserved subscriber field name
```

:::

## Delete Global Custom Fields

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.customfields.delete` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| CustomFields | String | Yes | Comma-separated list of global custom field IDs to delete (e.g., "123,456,789") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "global.customfields.delete",
    "SessionID": "admin-session-id",
    "CustomFields": "789,790,791"
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
  "ErrorText": ["Custom field ids are missing"]
}
```

```txt [Error Codes]
0: Success
1: Custom field ids are missing
```

:::

## Get Global Custom Fields

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.customfields.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| OrderField | String | No | Field to order by: "FieldName", "CustomFieldID", "FieldType", "IsRequired", "IsUnique", "Visibility", "IsGlobal" (default: "FieldName") |
| OrderType | String | No | Order direction: "ASC" or "DESC" (default: "ASC") |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "global.customfields.get",
    "SessionID": "admin-session-id",
    "OrderField": "FieldName",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalFieldCount": 3,
  "CustomFields": [
    {
      "CustomFieldID": "789",
      "RelListID": "0",
      "RelOwnerUserID": "0",
      "FieldName": "Industry Sector",
      "FieldType": "Drop down",
      "FieldDefaultValue": "",
      "ValidationMethod": "Disabled",
      "IsRequired": "No",
      "IsUnique": "No",
      "Visibility": "Public",
      "IsGlobal": "Yes"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::
