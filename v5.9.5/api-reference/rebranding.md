---
layout: doc
---

# Rebranding API Documentation

Theme and white-label rebranding endpoints for customizing the Octeth interface appearance, logos, and product branding.

## Create a Theme

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter     | Type   | Required | Description                                                           |
|---------------|--------|----------|-----------------------------------------------------------------------|
| Command       | String | Yes      | API command: `theme.create`                                           |
| SessionID     | String | No       | Session ID obtained from admin login                                  |
| APIKey        | String | No       | Admin API key for authentication                                      |
| Template      | String | Yes      | Template code (must match an installed template)                      |
| ThemeName     | String | Yes      | Name for the new theme                                                |
| ProductName   | String | No       | Custom product name for white-label branding                          |
| ThemeSettings | String | No       | Theme CSS settings in format: `tag````value\ntag````value` (newline-separated) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "theme.create",
    "SessionID": "admin-session-id",
    "Template": "weefive",
    "ThemeName": "My Custom Theme",
    "ProductName": "My Email Platform",
    "ThemeSettings": "primary-color||||#0066cc\nbackground-color||||#ffffff"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ThemeID": 123
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3]
}
```

```txt [Error Codes]
0: Success
1: Missing template parameter
2: Missing theme name parameter
3: Invalid template code (template not found or not installed)
```

:::

## Get a Theme

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                         |
|-----------|---------|----------|-------------------------------------|
| Command   | String  | Yes      | API command: `theme.get`            |
| SessionID | String  | No       | Session ID obtained from admin login|
| APIKey    | String  | No       | Admin API key for authentication    |
| ThemeID   | Integer | Yes      | ID of the theme to retrieve         |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "theme.get",
    "SessionID": "admin-session-id",
    "ThemeID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Theme": {
    "ThemeID": 123,
    "Template": "weefive",
    "ThemeName": "My Custom Theme",
    "ProductName": "My Email Platform",
    "LogoData": "",
    "LogoType": "",
    "LogoSize": 0,
    "LogoFileName": "",
    "ThemeSettings": "primary-color||||#0066cc\nbackground-color||||#ffffff"
  }
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
1: Missing theme ID parameter
2: Theme not found
```

:::

## Update a Theme

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                           |
|---------------|---------|----------|-----------------------------------------------------------------------|
| Command       | String  | Yes      | API command: `theme.update`                                           |
| SessionID     | String  | No       | Session ID obtained from admin login                                  |
| APIKey        | String  | No       | Admin API key for authentication                                      |
| ThemeID       | Integer | Yes      | ID of the theme to update                                             |
| Template      | String  | No       | New template code (must match an installed template)                  |
| ThemeName     | String  | No       | New theme name                                                        |
| ProductName   | String  | No       | New product name for white-label branding                             |
| LogoData      | String  | No       | Base64-encoded logo image data                                        |
| LogoType      | String  | No       | Logo MIME type (e.g., "image/png", "image/jpeg")                      |
| LogoSize      | Integer | No       | Logo file size in bytes                                               |
| LogoFileName  | String  | No       | Original logo filename                                                |
| ThemeSettings | String  | No       | Theme CSS settings in format: `tag````value\ntag````value` (newline-separated). **Omit (or send an empty string) to preserve the theme's existing settings unchanged** — see below. |

**Partial Update Semantics:**

`theme.update` is a partial update: every optional parameter you omit keeps its stored value. This includes `ThemeSettings`.

- **`ThemeSettings` omitted or empty** — the theme's currently stored settings are carried forward and re-persisted as-is. Nothing is recalculated, and no tag is reset. This is the correct way to change only a theme's name, product name, logo or template.
- **`ThemeSettings` supplied** — the settings are rebuilt from scratch against the CSS tag list of the effective template (the `Template` you supplied, or the theme's current template if you omitted it). Within that rebuild:
  - Blank lines and malformed lines (any line that does not contain both a tag and a value separated by `||||`) are skipped.
  - Any tag defined by the template but absent from your payload falls back to that tag's `Default` value.

::: warning There is no way to reset a theme to its defaults through this endpoint
Because omitting `ThemeSettings` preserves the stored settings, and supplying it only defaults the tags you leave out of an otherwise-supplied payload, `theme.update` offers no "reset everything to defaults" path. To restore defaults for the full tag set, send a `ThemeSettings` payload that omits the tags you want defaulted.
:::

::: info Behavior change
Previously, omitting `ThemeSettings` did **not** preserve the stored settings. In the common partial-update case — where `Template` was omitted too, e.g. simply renaming a theme — the stored settings were **wiped** to an empty value. (Only in the narrower case where `Template` *was* supplied while `ThemeSettings` was omitted did each tag fall back to its `Default`.)

This is strictly a fix, but it is still a behavior change for integrations that worked around the old wipe by always resending the complete settings payload on every update. That compensation is no longer necessary — you can now send just the fields you intend to change.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "theme.update",
    "SessionID": "admin-session-id",
    "ThemeID": 123,
    "ThemeName": "Updated Theme Name",
    "ProductName": "Updated Product Name",
    "ThemeSettings": "primary-color||||#ff6600\nbackground-color||||#f5f5f5"
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
  "ErrorCode": [3, 4, 5]
}
```

```txt [Error Codes]
0: Success
3: Invalid template code (template not found or not installed)
4: Missing theme ID parameter
5: Theme not found
```

:::

## Get All Themes

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| Command   | String | Yes      | API command: `themes.get`            |
| SessionID | String | No       | Session ID obtained from admin login |
| APIKey    | String | No       | Admin API key for authentication     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "themes.get",
    "SessionID": "admin-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Themes": [
    {
      "ThemeID": 1,
      "Template": "weefive",
      "ThemeName": "Default Theme",
      "ProductName": "Octeth",
      "ThemeSettings": "primary-color||||#0066cc\nbackground-color||||#ffffff"
    },
    {
      "ThemeID": 123,
      "Template": "weefive",
      "ThemeName": "My Custom Theme",
      "ProductName": "My Email Platform",
      "ThemeSettings": "primary-color||||#ff6600\nbackground-color||||#f5f5f5"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete Themes

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Deletes one or more themes. The system prevents deletion of the default theme and the last remaining theme to ensure at least one theme is always available.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                          |
|-----------|--------|----------|------------------------------------------------------|
| Command   | String | Yes      | API command: `theme.delete`                          |
| SessionID | String | No       | Session ID obtained from admin login                 |
| APIKey    | String | No       | Admin API key for authentication                     |
| Themes    | String | Yes      | Comma-separated list of theme IDs to delete          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "theme.delete",
    "SessionID": "admin-session-id",
    "Themes": "123,456"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing themes parameter (theme IDs required)
2: Cannot delete the last remaining theme (at least one theme must exist)
```

:::
