---
layout: doc
---

# Suppression Lists

## Browse Suppression List

This API endpoint is used to retrieve a list of suppressed email addresses for a user.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter      | Description                                                                            |          |
|----------------|----------------------------------------------------------------------------------------|----------|
| Command        | `Suppression.Browse`                                                                   | Required |
| SearchPattern  | *(Optional)* A pattern to search for specific email addresses (supports wildcard `*`). | Optional |
| StartFrom      | *(Optional)* The starting index from which to retrieve records. Default is 0.          | Optional |
| RetrieveCount  | *(Optional)* The number of records to retrieve. Default is 100.                        | Optional |

**Success Response:**

A successful response will return a list of suppressed email addresses.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `TotalRecords`: The total number of suppressed email addresses in the user's list.
- `SuppressedEmails`: An array of suppressed email addresses.

**Error Response:**

- No specific error codes defined in the provided code.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 500,
  "SuppressedEmails": [
    // Array of suppressed email addresses
  ]
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    ErrorCode
  ],
  "ErrorText": "Error description"
}
```

## Delete from Suppression List

This API endpoint allows for the removal of a specific email address from a user's suppression list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter     | Description                                                |          |
|---------------|------------------------------------------------------------|----------|
| Command       | `Suppression.Delete`                                       | Required |
| EmailAddress  | The email address to be removed from the suppression list. | Required |

**Success Response:**

A successful response indicates that the specified email address has been removed from the suppression list.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing Email Address.
- `2`: Invalid Email Address or Email Address not in suppression list.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing email address"
}
```

## Import into Suppression List

This API endpoint allows for importing email addresses into a user's suppression list. It supports importing individual
email addresses or a bulk list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter          | Description                                                                 |          |
|--------------------|-----------------------------------------------------------------------------|----------|
| Command            | `Suppression.Import`                                                        | Required |
| EmailAddresses     | *(Optional)* A JSON-encoded array of email addresses to import.             | Optional |
| EmailAddressesBulk | *(Optional)* A newline-separated string of email addresses for bulk import. | Optional |

**Success Response:**

A successful response indicates that the email addresses have been imported into the suppression list.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `TotalImported`: The total number of email addresses successfully imported.
- `TotalFailed`: The total number of email addresses that failed to import.
- `FailedEmailAddresses`: An array of email addresses that failed to import.

**Error Response:**

- `1`: Missing Email Addresses.
- `2`: Invalid format or content in Email Addresses.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "TotalImported": 100,
  "TotalFailed": 10,
  "FailedEmailAddresses": [
    // Array of email addresses that failed to import
  ]
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1,
    2
  ],
  "ErrorText": "Email addresses are missing"
}
```

