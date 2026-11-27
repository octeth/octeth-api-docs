---
layout: doc
---

# Reports API Documentation

Automated reporting endpoints for creating, managing, and scheduling campaign performance reports.

## Create Automated Report

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Creates a new automated campaign performance report that will be sent via email on a scheduled basis. Reports can be configured to include all campaigns or filter by specific campaign tags. Supported frequencies are daily, weekly, and monthly.

**Request Body Parameters:**

| Parameter        | Type   | Required | Description                                                                                      |
|------------------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String | Yes      | API command: `automated_reports.create`                                                          |
| SessionID        | String | No       | Session ID obtained from login                                                                   |
| APIKey           | String | No       | API key for authentication                                                                       |
| ReportName       | String | Yes      | Name of the automated report                                                                     |
| Frequency        | String | Yes      | Report frequency: `daily`, `weekly`, or `monthly`                                                |
| FilterType       | String | Yes      | Campaign filter type: `all` (all campaigns) or `tags` (specific campaign tags)                  |
| FilterTags       | String | Conditional | Comma-separated tag IDs to filter campaigns (required when FilterType is `tags`)             |
| RecipientEmails  | String | Yes      | Comma-separated email addresses to receive the report                                            |
| Status           | String | No       | Report status: `enabled` or `disabled` (default: enabled)                                        |

::: code-group

```bash [Example Request - All Campaigns]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.create",
    "SessionID": "your-session-id",
    "ReportName": "Weekly Performance Summary",
    "Frequency": "weekly",
    "FilterType": "all",
    "RecipientEmails": "manager@example.com,team@example.com",
    "Status": "enabled"
  }'
```

```bash [Example Request - Filtered by Tags]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.create",
    "SessionID": "your-session-id",
    "ReportName": "Newsletter Campaign Report",
    "Frequency": "monthly",
    "FilterType": "tags",
    "FilterTags": "12,34,56",
    "RecipientEmails": "analytics@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ReportID": 123
}
```

```json [Error Response - Invalid Frequency]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid frequency. Must be daily, weekly, or monthly"
}
```

```json [Error Response - Invalid Email]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Invalid email address: invalid-email"
}
```

```txt [Error Codes]
0: Success
reportname: Missing required parameter reportname
frequency: Missing required parameter frequency
filtertype: Missing required parameter filtertype
recipientemails: Missing required parameter recipientemails
2: Invalid frequency. Must be daily, weekly, or monthly
3: Invalid filter type. Must be all or tags
4: Invalid email address
5: Tag IDs required when filter type is tags
6: Invalid tag ID (tag not found or does not belong to user)
7: Failed to create report
```

:::

## Update Automated Report

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Updates an existing automated campaign performance report. All fields are optional except ReportID. Only the provided fields will be updated, allowing partial updates. The report must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter        | Type   | Required | Description                                                                                      |
|------------------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String | Yes      | API command: `automated_reports.update`                                                          |
| SessionID        | String | No       | Session ID obtained from login                                                                   |
| APIKey           | String | No       | API key for authentication                                                                       |
| ReportID         | Integer| Yes      | ID of the report to update                                                                       |
| ReportName       | String | No       | Updated name of the automated report                                                             |
| Frequency        | String | No       | Updated frequency: `daily`, `weekly`, or `monthly`                                               |
| FilterType       | String | No       | Updated filter type: `all` or `tags`                                                             |
| FilterTags       | String | No       | Updated comma-separated tag IDs (required when FilterType is `tags`)                            |
| RecipientEmails  | String | No       | Updated comma-separated email addresses                                                          |
| Status           | String | No       | Updated status: `enabled` or `disabled`                                                          |

::: code-group

```bash [Example Request - Update Name and Frequency]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.update",
    "SessionID": "your-session-id",
    "ReportID": 123,
    "ReportName": "Updated Weekly Summary",
    "Frequency": "daily"
  }'
```

```bash [Example Request - Update Recipients]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.update",
    "SessionID": "your-session-id",
    "ReportID": 123,
    "RecipientEmails": "newmanager@example.com,analytics@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ReportID": 123
}
```

```json [Error Response - Access Denied]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Report not found or access denied"
}
```

```json [Error Response - Invalid Email]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorText": "Invalid email address: invalid-email"
}
```

```txt [Error Codes]
0: Success
reportid: Missing required parameter reportid
2: Report not found or access denied
3: Invalid frequency. Must be daily, weekly, or monthly
4: Invalid filter type. Must be all or tags
5: Invalid tag ID (tag not found or does not belong to user)
6: Invalid email address
7: Invalid status. Must be enabled or disabled
8: No data to update
9: Failed to update report
```

:::

## Delete Automated Report

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Permanently deletes an automated campaign performance report. The report must be owned by the authenticated user. This action cannot be undone.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| Command   | String  | Yes      | API command: `automated_reports.delete` |
| SessionID | String  | No       | Session ID obtained from login       |
| APIKey    | String  | No       | API key for authentication           |
| ReportID  | Integer | Yes      | ID of the report to delete           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.delete",
    "SessionID": "your-session-id",
    "ReportID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Message": "Report deleted successfully"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Report not found or access denied"
}
```

```txt [Error Codes]
0: Success
reportid: Missing required parameter reportid
2: Report not found or access denied
```

:::

## Get Automated Report

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves detailed information about a specific automated report including tag names (if filter type is tags) and formatted date fields. The report must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| Command   | String  | Yes      | API command: `automated_reports.get` |
| SessionID | String  | No       | Session ID obtained from login       |
| APIKey    | String  | No       | API key for authentication           |
| ReportID  | Integer | Yes      | ID of the report to retrieve         |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.get",
    "SessionID": "your-session-id",
    "ReportID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Report": {
    "ReportID": 123,
    "ReportName": "Weekly Performance Summary",
    "FilterType": "tags",
    "FilterTags": "12,34",
    "FilterTagNames": ["Newsletter", "Promotions"],
    "Frequency": "weekly",
    "RecipientEmails": "manager@example.com,team@example.com",
    "Status": "enabled",
    "LastRunDate": "2025-11-10 14:30:00",
    "LastRunDateFormatted": "Nov 10, 2025 2:30 PM",
    "NextRunDate": "2025-11-17 14:30:00",
    "NextRunDateFormatted": "Nov 17, 2025 2:30 PM",
    "CreatedDate": "2025-10-01 10:00:00"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Report not found or access denied"
}
```

```txt [Error Codes]
0: Success
reportid: Missing required parameter reportid
2: Report not found or access denied
```

:::

## List Automated Reports

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves all automated reports for the authenticated user with optional filtering by status and frequency. Each report includes tag names (if applicable) and formatted date fields for easy display.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                                      |
|-----------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command   | String | Yes      | API command: `automated_reports.list`                                                            |
| SessionID | String | No       | Session ID obtained from login                                                                   |
| APIKey    | String | No       | API key for authentication                                                                       |
| Status    | String | No       | Filter by status: `enabled` or `disabled`                                                        |
| Frequency | String | No       | Filter by frequency: `daily`, `weekly`, or `monthly`                                             |

::: code-group

```bash [Example Request - All Reports]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.list",
    "SessionID": "your-session-id"
  }'
```

```bash [Example Request - Filtered by Status]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.list",
    "SessionID": "your-session-id",
    "Status": "enabled",
    "Frequency": "weekly"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Reports": [
    {
      "ReportID": 123,
      "ReportName": "Weekly Performance Summary",
      "FilterType": "tags",
      "FilterTags": "12,34",
      "FilterTagNames": ["Newsletter", "Promotions"],
      "Frequency": "weekly",
      "RecipientEmails": "manager@example.com",
      "Status": "enabled",
      "LastRunDate": "2025-11-10 14:30:00",
      "LastRunDateFormatted": "Nov 10, 2025 2:30 PM",
      "NextRunDate": "2025-11-17 14:30:00",
      "NextRunDateFormatted": "Nov 17, 2025 2:30 PM",
      "CreatedDate": "2025-10-01",
      "CreatedDateFormatted": "Oct 1, 2025"
    },
    {
      "ReportID": 124,
      "ReportName": "Monthly Campaign Report",
      "FilterType": "all",
      "FilterTags": null,
      "Frequency": "monthly",
      "RecipientEmails": "ceo@example.com",
      "Status": "enabled",
      "LastRunDate": "2025-11-01 09:00:00",
      "LastRunDateFormatted": "Nov 1, 2025 9:00 AM",
      "NextRunDate": "2025-12-01 09:00:00",
      "NextRunDateFormatted": "Dec 1, 2025 9:00 AM",
      "CreatedDate": "2025-09-15",
      "CreatedDateFormatted": "Sep 15, 2025"
    }
  ],
  "TotalReports": 2
}
```

```json [Error Response - Invalid Status]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Invalid status filter. Must be enabled or disabled"
}
```

```txt [Error Codes]
0: Success
1: Invalid status filter. Must be enabled or disabled
2: Invalid frequency filter. Must be daily, weekly, or monthly
```

:::

## Toggle Automated Report Status

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

Toggles the status of an automated report between enabled and disabled. If the report is currently enabled, it will be disabled, and vice versa. Returns the new status in the response. The report must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| Command   | String  | Yes      | API command: `automated_reports.toggle` |
| SessionID | String  | No       | Session ID obtained from login       |
| APIKey    | String  | No       | API key for authentication           |
| ReportID  | Integer | Yes      | ID of the report to toggle           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "automated_reports.toggle",
    "SessionID": "your-session-id",
    "ReportID": 123
  }'
```

```json [Success Response - Enabled]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ReportID": 123,
  "NewStatus": "enabled",
  "Message": "Report status updated to enabled"
}
```

```json [Success Response - Disabled]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ReportID": 123,
  "NewStatus": "disabled",
  "Message": "Report status updated to disabled"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Report not found or access denied"
}
```

```txt [Error Codes]
0: Success
reportid: Missing required parameter reportid
2: Report not found or access denied
```

:::
