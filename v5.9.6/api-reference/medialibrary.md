---
layout: doc
---

# Media Library API Documentation

Media library management endpoints for uploading, browsing, and managing media files and folders.

## Browse Media Library

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. There are no alternative or replacement API endpoints available.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Media.Browse`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Browse media library files and folders in a specified folder.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                    |
|-----------|---------|----------|------------------------------------------------|
| Command   | String  | Yes      | API command: `media.browse`                    |
| SessionID | String  | No       | Session ID obtained from login                 |
| APIKey    | String  | No       | API key for authentication                     |
| FolderID  | Integer | No       | Parent folder ID to browse (default: 0 = root) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "media.browse",
    "SessionID": "your-session-id",
    "FolderID": 0
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Folders": [
    {
      "ID": 123,
      "Name": "My Folder",
      "ParentFolderID": 0
    }
  ],
  "Files": [
    {
      "ID": 456,
      "Name": "image.jpg",
      "URL": "https://cdn.example.com/media/abc123"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete Media File

<Badge type="info" text="POST" /> `/api/v1/media.delete`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. There are no alternative or replacement API endpoints available.
:::

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Required permissions: `Media.Delete`
- v1 REST alias: `POST /api/v1/media.delete`. Legacy access via `/api.php` is also supported
:::

Delete a media file from the media library.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                         |
|-----------|---------|----------|-------------------------------------|
| Command   | String  | Yes      | API command: `media.delete`         |
| SessionID | String  | No       | Session ID obtained from login      |
| APIKey    | String  | No       | API key for authentication          |
| MediaID   | Integer | Yes      | ID of the media file to delete      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "media.delete",
    "SessionID": "your-session-id",
    "MediaID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter: MediaID
2: Media file not found or permission denied
```

:::

## Create Media Library Folder

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. There are no alternative or replacement API endpoints available.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Media.Upload`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Create a new folder in the media library.

**Request Body Parameters:**

| Parameter      | Type    | Required | Description                                      |
|----------------|---------|----------|--------------------------------------------------|
| Command        | String  | Yes      | API command: `media.foldercreate`                |
| SessionID      | String  | No       | Session ID obtained from login                   |
| APIKey         | String  | No       | API key for authentication                       |
| FolderName     | String  | Yes      | Name of the folder to create                     |
| ParentFolderID | Integer | Yes      | Parent folder ID (use 0 for root level)          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "media.foldercreate",
    "SessionID": "your-session-id",
    "FolderName": "My Images",
    "ParentFolderID": 0
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "FolderID": 789
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter: FolderName
2: Missing required parameter: ParentFolderID
3: Parent folder not found
```

:::

## Delete Media Library Folder

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. There are no alternative or replacement API endpoints available.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Media.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Delete a folder and all its contents (files and subfolders) from the media library.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                         |
|-----------|---------|----------|-------------------------------------|
| Command   | String  | Yes      | API command: `media.folderdelete`   |
| SessionID | String  | No       | Session ID obtained from login      |
| APIKey    | String  | No       | API key for authentication          |
| FolderID  | Integer | Yes      | ID of the folder to delete          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "media.folderdelete",
    "SessionID": "your-session-id",
    "FolderID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter: FolderID
2: Folder not found
3: Permission denied (folder does not belong to user)
```

:::

## Retrieve Media File Details

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. There are no alternative or replacement API endpoints available.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Media.Retrieve`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Retrieve details of a specific media file from the media library.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                         |
|-----------|---------|----------|-------------------------------------|
| Command   | String  | Yes      | API command: `media.retrieve`       |
| SessionID | String  | No       | Session ID obtained from login      |
| APIKey    | String  | No       | API key for authentication          |
| MediaID   | Integer | Yes      | ID of the media file to retrieve    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "media.retrieve",
    "SessionID": "your-session-id",
    "MediaID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Name": "image.jpg",
  "Type": "image/jpeg",
  "Size": 102400,
  "URL": "https://cdn.example.com/media/abc123"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter: MediaID
2: Media file not found
```

:::

## Upload Media File

<Badge type="info" text="POST" /> `/api/v1/media.upload`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. There are no alternative or replacement API endpoints available.
:::

::: tip API Usage Notes
- Authentication required: User API Key. Admin authentication is also accepted with `Access=admin` and `UserID` (see Admin usage below)
- Required permissions: `Media.Upload`
- v1 REST alias: `POST /api/v1/media.upload`. Legacy access via `/api.php` is also supported
:::

Upload a new media file to the media library.

::: tip Admin usage (v5.9.6, #2775)
This command also accepts admin authentication. Pass `AdminAPIKey` (or an admin `SessionID`), `Access=admin`, and `UserID` naming the account to act on; the response is exactly what that account's own API key would receive. The uploaded file is stored under that account (`RelOwnerUserID`). Without `Access=admin` the call is treated as a user call, so existing integrations are unaffected. `UserID` is ignored under user authentication. Admin-only error codes: `5001` UserID missing or invalid, `5002` user not found, `5003` user outside the user groups a restricted sub-admin may access. Requires the `User.Edit` privilege when `ADMIN_API_ENFORCE_PRIVILEGES` is on.
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                     |
|-----------|---------|----------|-------------------------------------------------|
| Command   | String  | Yes      | API command: `media.upload`                     |
| UserID | Integer | Admin only | Account to act on when calling with admin authentication and `Access=admin`. Ignored under user authentication (v5.9.6, #2775) |
| SessionID | String  | No       | Session ID obtained from login                  |
| APIKey    | String  | No       | API key for authentication                      |
| MediaData | String  | Yes      | Base64-encoded file data                        |
| MediaType | String  | Yes      | MIME type of the file (e.g., "image/jpeg")      |
| MediaSize | Integer | Yes      | File size in bytes                              |
| MediaName | String  | Yes      | File name                                       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "media.upload",
    "SessionID": "your-session-id",
    "MediaData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "MediaType": "image/png",
    "MediaSize": 68,
    "MediaName": "sample.png"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "MediaID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 5]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter: MediaData
2: Missing required parameter: MediaType
3: Missing required parameter: MediaSize
4: File size exceeds maximum allowed limit
5: Missing required parameter: MediaName
```

:::
