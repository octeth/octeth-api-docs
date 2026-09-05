---
layout: doc
---

# Settings API Documentation

System settings management endpoints for configuring Octeth application settings and testing email delivery configurations.

## Test Email Sending Configuration

<Badge type="info" text="POST" /> `/api/v1/settings.emailsendingtest`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/settings.emailsendingtest`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `settings.emailsendingtest` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| SendMethod | String | No      | Email sending method: `SMTP`, `LocalMTA`, `PHPMail`, `PowerMTA`, or `SaveToDisk` |
| SendMethodSMTPHost | String | No | SMTP server hostname (required for SMTP method) |
| SendMethodSMTPPort | Integer | No | SMTP server port (required for SMTP method) |
| SendMethodSMTPSecure | String | No | SMTP encryption: `ssl`, `tls`, or empty string |
| SendMethodSMTPAuth | String | No | SMTP authentication enabled: `true` or `false` |
| SendMethodSMTPUsername | String | No | SMTP username (required if auth is enabled) |
| SendMethodSMTPPassword | String | No | SMTP password (required if auth is enabled) |
| SendMethodSMTPTimeout | Integer | No | SMTP connection timeout in seconds |
| SendMethodLocalMTAPath | String | No | Local MTA path (required for LocalMTA method) |
| SendMethodPowerMTADir | String | No | PowerMTA directory path (required for PowerMTA method) |
| SendMethodSaveToDiskDir | String | No | Save to disk directory path (required for SaveToDisk method) |
| MailEngine | String | No | Mail engine: `phpmailer` or `swiftmailer` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "settings.emailsendingtest",
    "SessionID": "your-admin-session-id",
    "SendMethod": "SMTP",
    "SendMethodSMTPHost": "smtp.example.com",
    "SendMethodSMTPPort": 587,
    "SendMethodSMTPSecure": "tls",
    "SendMethodSMTPAuth": "true",
    "SendMethodSMTPUsername": "smtp-user@example.com",
    "SendMethodSMTPPassword": "smtp-password",
    "SendMethodSMTPTimeout": 30,
    "MailEngine": "phpmailer"
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
  "ErrorCode": 1,
  "EmailSettingsErrorMessage": "SMTP connect() failed"
}
```

```txt [Error Codes]
0: Success
1: Email sending test failed (check EmailSettingsErrorMessage for details)
2: Invalid enum value (SendMethod, SendMethodSMTPSecure, SendMethodSMTPAuth, or MailEngine)
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## Get System Settings

<Badge type="info" text="GET" /> `/api/v1/settings.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `GET /api/v1/settings.get`. Legacy access via `/api.php` is also supported
- Read counterpart of `settings.update`. Column names come from the `oempro_config` row itself, so a column added in a later version appears here without a client change.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `settings.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| Keys      | String | No       | Comma-separated list of `oempro_config` column names and/or runtime option names to return (case-insensitive). Unknown names are an error. Omit for everything. |

**Response:**

- `Settings`: the `oempro_config` row keyed by column name (all columns except `ConfigID`). Values are typed the way the application types them at bootstrap: the stored strings `true` and `false` come back as JSON booleans, everything else as stored. Secrets (`*_PASSWORD`, `S3_SECRET_KEY`, and every other key matching the `system.getsettings` sensitive-key rule) are returned as the literal `***REDACTED***` when set, and as `""` when empty. Sending that literal back to `settings.update` is refused (ErrorCode 13): omit the field to keep the stored secret.
- `RuntimeOptions`: the `oempro_options` keys `settings.update` can write, in their decoded shapes: `SeedList`, `AliasList`, `RelayDomains`, `PreHeaderTextTemplate`, `EmailDeliverySubscriberSnapshot`, `DefaultCustomFieldsForNewLists`, `FailedWebhookHandler`, `LimitUtilizationWebhook`, `Stripo_PluginId`, `Stripo_SecretKey`, `Stripo_APIKey`, `Unlayer_ProjectId`, `Unlayer_APIKey`, `MediaUploadStatus`, `MediaLibraryAllowedFileTypes` (strings, `null` when never saved); `ListFreshnessThresholds` (`{Active, SlowingDown, Stale}` integers, defaulted like the Preferences screen); `FailedWebhookHandlerSettings` (`{FailThreshold, DisableForXSeconds, CallWebhookURL}`); `LimitUtilizationWebhookSettings` (`{WebhookURL, NotifyTransitions{OKToWarning, WarningToExceeded, OKToExceeded, ExceededToWarning, WarningToOK, ExceededToOK}}`); `PreventUserLoginFromAlienIPs` and `DisableUserPasswordReset` (booleans). Secrets are redacted the same way.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "settings.get",
    "APIKey": "your-admin-api-key",
    "Keys": "PRODUCT_NAME,SEND_METHOD_SMTP_PASSWORD,ListFreshnessThresholds"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Settings": {
    "PRODUCT_NAME": "Octeth",
    "SEND_METHOD_SMTP_PASSWORD": "***REDACTED***"
  },
  "RuntimeOptions": {
    "ListFreshnessThresholds": {"Active": 14, "SlowingDown": 45, "Stale": 90}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Unknown setting key(s): PRODUCT_NAM",
  "UnknownKeys": ["PRODUCT_NAM"]
}
```

```txt [Error Codes]
0: Success
1: One or more Keys are not a config column or a runtime option (see UnknownKeys)
2: The configuration row could not be read
```

:::

## Update System Settings

<Badge type="info" text="POST" /> `/api/v1/settings.update`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `POST /api/v1/settings.update`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

All parameters are optional. Only provide the settings you want to update.

::: warning Behavior change (v5.9.3, #2345)
Omitted parameters are now left unchanged. In earlier versions, a partial `settings.update` unconditionally overwrote `DisableUserPasswordReset`, `MediaUploadStatus`, and `MediaLibraryAllowedFileTypes` even when they were not sent. Updating only, say, `SystemEmailFromName` therefore silently re-enabled user password reset and blanked the media-upload settings. These three fields are now written only when included in the request.
:::

::: warning Partial updates, null and the redaction marker
- Omitted parameters are left unchanged. A JSON `null` value is treated as omitted (a silent no-op); to clear a setting send the empty string `""`.
- `settings.get` returns secrets as the literal `***REDACTED***`. Sending that literal as a value is refused with ErrorCode 13. Omit the field to keep the stored secret.
- `DEFAULT_LANGUAGE` and `USER_SIGNUP_LANGUAGE` must name an installed language pack (`system.languages.get`), `USER_SIGNUP_GROUPID` / `USER_SIGNUP_GROUPIDS` must name existing user groups, and `DEFAULT_THEMEID` must name an existing theme. Empty values are still accepted.
:::

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `settings.update` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| SystemEmailFromName | String | No | Default sender name for system emails |
| SystemEmailFromEmail | String | No | Default sender email address (email validation) |
| SystemEmailReplyToName | String | No | Default reply-to name |
| SystemEmailReplyToEmail | String | No | Default reply-to email address (email validation) |
| AlertRecipientEmail | String | No | Email address for system alerts (email validation) |
| ReportAbuseEmail | String | No | Email address for abuse reports (email validation) |
| XComplaintsTo | String | No | X-Complaints-To header value (email or @%sender_domain%) |
| MediaUploadMethod | String | No | Media upload method: `file`, `database`, or `s3` |
| MediaUploadStatus | String | No | Media upload status |
| MediaLibraryAllowedFileTypes | String | No | Allowed file types for media library |
| S3Enabled | String | No | Enable S3 storage: `true` or `false` |
| S3AccessID | String | No | AWS S3 access key ID |
| S3SecretKey | String | No | AWS S3 secret access key |
| S3Bucket | String | No | AWS S3 bucket name |
| S3MediaLibraryPath | String | No | S3 path for media library |
| S3URL | String | No | S3 bucket URL |
| LoadBalanceStatus | String | No | Enable load balancing: `true` or `false` |
| LoadBalanceEmails | Integer | No | Number of emails for load balancing |
| LoadBalanceSleep | Integer | No | Sleep interval for load balancing |
| UserSignupEnabled | String | No | Enable user signup: `true` or `false` |
| UserSignupFields | String | No | User signup form fields |
| UserSignupReputation | String | No | User signup reputation: `Trusted` or `Untrusted` |
| UserSignupLanguage | String | No | Default language for new users |
| DefaultLanguage | String | No | System default language |
| UserSignupGroupID | Integer | No | Default user group ID for signups |
| UserSignupGroupIDs | String | No | Multiple user group IDs for signups |
| DefaultThemeID | Integer | No | Default theme ID |
| PaymentCurrency | String | No | Payment currency code |
| PaymentTaxPercent | Number | No | Tax percentage for payments |
| PaymentReceiptEmailSubject | String | No | Payment receipt email subject |
| PaymentReceiptEmailMessage | String | No | Payment receipt email message |
| EnabledPlugins | String | No | Comma-separated codes of the plugins to mark enabled. Every code must be installed (see `admin.plugins.get`) and no code may repeat. This only writes the column: it does NOT run the plugins' `enable_<code>()` / `disable_<code>()` lifecycle hooks (table creation, option seeding, teardown). Use `admin.plugin.enable` / `admin.plugin.disable` to enable or disable a plugin. |
| SendMethod | String | No | Email sending method: `SMTP`, `LocalMTA`, `PHPMail`, `PowerMTA`, or `SaveToDisk` |
| SendMethodLocalMTAPath | String | No | Local MTA path |
| SendMethodPowerMTAVMTA | String | No | PowerMTA VMTA name |
| SendMethodPowerMTADir | String | No | PowerMTA directory path |
| SendMethodSaveToDiskDir | String | No | Save to disk directory path |
| SendMethodSMTPHost | String | No | SMTP server hostname |
| SendMethodSMTPPort | Integer | No | SMTP server port |
| SendMethodSMTPSecure | String | No | SMTP encryption: `ssl`, `tls`, or empty string |
| SendMethodSMTPAuth | String | No | SMTP authentication: `true` or `false` |
| SendMethodSMTPUsername | String | No | SMTP username |
| SendMethodSMTPPassword | String | No | SMTP password |
| SendMethodSMTPTimeout | Integer | No | SMTP timeout in seconds |
| SendMethodSMTPDebug | String | No | SMTP debug mode |
| SendMethodSMTPKeepAlive | String | No | SMTP keep-alive setting |
| SendMethodSMTPMsgConn | Integer | No | SMTP messages per connection |
| ImportMaxFilesize | Integer | No | Maximum file size for imports (bytes) |
| AttachmentMaxFilesize | Integer | No | Maximum attachment file size (bytes) |
| MediaMaxFilesize | Integer | No | Maximum media file size (bytes) |
| XMailer | String | No | X-Mailer header value |
| MailEngine | String | No | Mail engine: `phpmailer` or `swiftmailer` |
| GoogleAnalyticsSource | String | No | Google Analytics source parameter |
| GoogleAnalyticsMedium | String | No | Google Analytics medium parameter |
| ForwardToFriendHeader | String | No | Forward-to-friend email header |
| ForwardToFriendFooter | String | No | Forward-to-friend email footer |
| ReportAbuseFriendHeader | String | No | Report abuse email header |
| ReportAbuseFriendFooter | String | No | Report abuse email footer |
| UserSignupHeader | String | No | User signup email header |
| UserSignupFooter | String | No | User signup email footer |
| ProductName | String | No | Product name for branding |
| DefaultSubscriberAreaLogoutURL | String | No | Subscriber area logout redirect URL |
| POP3BounceStatus | String | No | Enable POP3 bounce processing: `Enabled` or `Disabled` |
| POP3BounceHost | String | No | POP3 bounce server hostname |
| POP3BouncePort | Integer | No | POP3 bounce server port |
| POP3BounceUsername | String | No | POP3 bounce username |
| POP3BouncePassword | String | No | POP3 bounce password |
| POP3BounceSSL | String | No | POP3 bounce SSL: `Yes` or `No` |
| POP3FBLStatus | String | No | Enable POP3 FBL processing: `Enabled` or `Disabled` |
| POP3FBLHost | String | No | POP3 FBL server hostname |
| POP3FBLPort | Integer | No | POP3 FBL server port |
| POP3FBLUsername | String | No | POP3 FBL username |
| POP3FBLPassword | String | No | POP3 FBL password |
| POP3FBLSSL | String | No | POP3 FBL SSL: `Yes` or `No` |
| POP3RequestsStatus | String | No | Enable POP3 request processing: `Enabled` or `Disabled` |
| POP3RequestsHost | String | No | POP3 requests server hostname |
| POP3RequestsPort | Integer | No | POP3 requests server port |
| POP3RequestsUsername | String | No | POP3 requests username |
| POP3RequestsPassword | String | No | POP3 requests password |
| POP3RequestsSSL | String | No | POP3 requests SSL: `Yes` or `No` |
| SendBounceNotificationEmail | String | No | Email address for bounce notifications |
| RebrandedProductLogo | String | No | Custom product logo |
| RebrandedProductLogoType | String | No | Product logo type |
| PayPalExpressStatus | String | No | PayPal Express status: `Enabled` or `Disabled` |
| PayPalExpressBusinessName | String | No | PayPal business name |
| PayPalExpressPurchaseDescription | String | No | PayPal purchase description |
| PayPalExpressCurrency | String | No | PayPal currency code |
| DisplayTriggerSendEngineLink | String | No | Display send engine link: `Yes` or `No` |
| DefaultOptinEmailSubject | String | No | Default opt-in confirmation email subject |
| DefaultOptinEmailBody | String | No | Default opt-in confirmation email body (must include %Link:Confirm%) |
| UserareaFooter | String | No | User area footer content |
| ForbiddenFromAddresses | String | No | Forbidden sender email addresses |
| RunCronInUserArea | String | No | Run cron in user area: `true` or `false` |
| CentralizedSenderDomain | String | No | Centralized sender domain |
| PaymentCreditsGatewayURL | String | No | Payment credits gateway URL |
| AdminAllowedIP | String | No | Allowed IP addresses for admin access |
| RateLimitExceedSlackWebhookURL | String | No | Slack webhook for rate limit alerts |
| RateLimitExceedNotificationInterval | Integer | No | Rate limit notification interval |
| DisableUserPasswordReset | String | No | Disable user password reset: `true` or `false` |
| DisplayOriginalLogo | String | No | Display original logo: `Yes` or `No` |
| FBLIncomingEmailAddress | String | No | FBL incoming email address |
| UnsubscribeIncomingEmailAddress | String | No | Unsubscribe incoming email address |
| BounceForwardTo | String | No | Bounce forward-to email address |
| ThresholdSoftBounceDetection | Integer | No | Soft bounce detection threshold |
| BounceCatchAllDomain | String | No | Bounce catch-all domain |
| S2STrackerParam | String | No | S2S postback tracker parameter name (1 to 20 characters: letters, digits, `_`, `-`) |
| S2SChannelParam | String | No | S2S postback conversion channel parameter name (same rule) |
| S2SValueParam | String | No | S2S postback conversion value parameter name (same rule) |
| S2SUnitParam | String | No | S2S postback conversion unit parameter name (same rule) |
| SeedList | String | No | Newline-separated seed addresses; every non-blank line must be a valid email address |
| AliasList | String | No | Newline-separated alias list (bounce server) |
| RelayDomains | String | No | Newline-separated relay domains (bounce server) |
| PreHeaderTextTemplate | String | No | Pre-header text template |
| EmailDeliverySubscriberSnapshot | String | No | `Enabled` or `Disabled` |
| ListFreshnessThresholds | Object | No | `{Active, SlowingDown, Stale}` in days; normalised so that Active >= 1 and Active < SlowingDown < Stale (each later value is raised to previous + 1 if needed); missing keys take the defaults 14 / 45 / 90. Also accepted as a JSON string. |
| DefaultCustomFieldsForNewLists | String | No | Default custom fields for new lists |
| FailedWebhookHandler | String | No | `Enabled` or `Disabled` |
| FailedWebhookHandlerSettings | Object | No | `{FailThreshold (int >= 1, default 3), DisableForXSeconds (int >= 0, default 3600), CallWebhookURL (URL or empty)}`. Also accepted as a JSON string. |
| LimitUtilizationWebhook | String | No | `Enabled` or `Disabled`. When the effective value is `Enabled`, at least one `NotifyTransitions` flag must be true (the request value, else the stored one) |
| LimitUtilizationWebhookSettings | Object | No | `{WebhookURL (URL or empty), NotifyTransitions{OKToWarning, WarningToExceeded, OKToExceeded, ExceededToWarning, WarningToOK, ExceededToOK}}`; flags accept true/false, 1/0, "true"/"false"; missing flags are false. Also accepted as a JSON string. |
| PreventUserLoginFromAlienIPs | Boolean | No | `true` stores the flag, `false` removes it (the stored representation the Security screen uses) |
| Stripo_PluginId | String | No | Stripo plugin id. When the effective plugin id / secret key pair is non-empty (request value, else stored), the pair is verified live against Stripo before saving |
| Stripo_SecretKey | String | No | Stripo secret key (see above) |
| Stripo_APIKey | String | No | Stripo per-account API key list as a JSON-encoded STRING (a nested object is refused, because request keys are lowercased). Must be valid JSON and must fit the storage column (issue #1311). Empty clears. |
| Unlayer_ProjectId | String | No | Unlayer project id |
| Unlayer_APIKey | String | No | Unlayer API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "settings.update",
    "SessionID": "your-admin-session-id",
    "SystemEmailFromName": "My Company",
    "SystemEmailFromEmail": "noreply@mycompany.com",
    "SendMethod": "SMTP",
    "SendMethodSMTPHost": "smtp.example.com",
    "SendMethodSMTPPort": 587,
    "SendMethodSMTPSecure": "tls",
    "SendMethodSMTPAuth": "true",
    "SendMethodSMTPUsername": "smtp-user@example.com",
    "SendMethodSMTPPassword": "smtp-password",
    "UserSignupEnabled": "true",
    "UserSignupEnabled": "true"
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Invalid email address
2: Invalid enum value (MediaUploadMethod, S3Enabled, LoadBalanceStatus, UserSignupEnabled, UserSignupReputation, SendMethod, SendMethodSMTPSecure, SendMethodSMTPAuth, MailEngine, or RunCronInUserArea)
3: PreviewMyEmail API connection error
6: POP3/IMAP connection failed (check EmailSettingsErrorMessage for details)
7: Default opt-in email body missing required %Link:Confirm% tag
8: DEFAULT_LANGUAGE / USER_SIGNUP_LANGUAGE is not an installed language pack
9: USER_SIGNUP_GROUPID / USER_SIGNUP_GROUPIDS names a user group that does not exist (or is not an id list)
10: DEFAULT_THEMEID does not name an existing theme
11: An S2S parameter name is empty, longer than 20 characters, or contains characters other than letters, digits, underscore and dash
12: SeedList contains an invalid email address (see InvalidEntries)
13: A value is the redaction marker ***REDACTED*** (omit the field to keep the stored value)
14: ListFreshnessThresholds is not an object
15: FailedWebhookHandlerSettings is invalid (see ErrorText)
16: LimitUtilizationWebhookSettings is invalid, or the webhook is Enabled with no NotifyTransitions flag set
17: Stripo rejected the plugin id / secret key pair
18: Stripo_APIKey is not a JSON-encoded string
19: Stripo_APIKey exceeds the storage column capacity (see ErrorText)
20: EnabledPlugins names a plugin that is not installed
21: EnabledPlugins lists a plugin more than once
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## Get Delivery Routes

<Badge type="info" text="GET" /> `/api/v1/deliveryroutes.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `GET /api/v1/deliveryroutes.get`. Legacy access via `/api.php` is also supported
- The recipient MX to delivery-server routing map (admin Settings > Delivery Routes). Each entry's `Pattern` is either an exact MX host name or a PCRE pattern (the delivery workers try `preg_match` first, then an exact comparison). Entries are an ordered list: the first match wins.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `deliveryroutes.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "deliveryroutes.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Routes": [
    {"Pattern": "/\\.google\\.com$/i", "DeliveryServerID": 3},
    {"Pattern": "mx1.example.net", "DeliveryServerID": 5}
  ],
  "TotalRoutes": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
0: Success
```

:::

## Update Delivery Routes

<Badge type="info" text="POST" /> `/api/v1/deliveryroutes.update`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `POST /api/v1/deliveryroutes.update`. Legacy access via `/api.php` is also supported
- Replaces the WHOLE routing map. Send the complete list every time; an empty list clears it. Order is significant.
- `Pattern` values are stored verbatim. Do not send the map as a JSON object keyed by pattern: request object keys are lowercased, which would rewrite a PCRE pattern.
- Written through the cached options writer, so the delivery workers pick the change up immediately.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `deliveryroutes.update` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| Routes    | Array  | Yes      | Ordered list of `{Pattern, DeliveryServerID}` objects (or a JSON string encoding one). `Pattern`: non-empty, no whitespace. `DeliveryServerID`: an existing delivery server. Patterns must be unique. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "deliveryroutes.update",
    "APIKey": "your-admin-api-key",
    "Routes": [
      {"Pattern": "/\\.google\\.com$/i", "DeliveryServerID": 3},
      {"Pattern": "mx1.example.net", "DeliveryServerID": 5}
    ]
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Routes": [
    {"Pattern": "/\\.google\\.com$/i", "DeliveryServerID": 3},
    {"Pattern": "mx1.example.net", "DeliveryServerID": 5}
  ],
  "TotalRoutes": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5,
  "ErrorText": "Routes[2]: delivery server 99 does not exist."
}
```

```txt [Error Codes]
0: Success
1: Routes is missing
2: Routes is not a list of objects (also: an element that is not a {Pattern, DeliveryServerID} object; the {"pattern": id} map shape is only accepted when Routes is sent as a JSON string, since nested object keys are lowercased on the way in)
3: A Pattern is empty or contains whitespace
4: A DeliveryServerID is not a positive integer
5: A DeliveryServerID does not exist
6: A Pattern appears more than once
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## Get SMS Settings

<Badge type="info" text="GET" /> `/api/v1/sms.settings.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `SMS`)
- v1 REST alias: `GET /api/v1/sms.settings.get`. Legacy access via `/api.php` is also supported
- The three settings of admin Settings > SMS.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sms.settings.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "sms.settings.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SmsSettings": {
    "FrequencyLimits": {"Daily": 5, "Weekly": 10, "Monthly": 20, "Yearly": 100},
    "ForbiddenWords": "word1\nword2",
    "FrequencyWhitelistedNumbers": "+15551234567"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
0: Success
```

:::

## Update SMS Settings

<Badge type="info" text="POST" /> `/api/v1/sms.settings.update`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `SMS`)
- v1 REST alias: `POST /api/v1/sms.settings.update`. Legacy access via `/api.php` is also supported
- Partial update: omitted parameters are left unchanged. At least one must be sent.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sms.settings.update` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| FrequencyLimits | Object | No | `{Daily, Weekly, Monthly, Yearly}`, all four required, non-negative integers. Also accepted as a JSON string. |
| ForbiddenWords | String | No | Newline-separated forbidden words |
| FrequencyWhitelistedNumbers | String | No | Newline-separated numbers exempt from the frequency limits |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sms.settings.update",
    "APIKey": "your-admin-api-key",
    "FrequencyLimits": {"Daily": 5, "Weekly": 10, "Monthly": 20, "Yearly": 100},
    "ForbiddenWords": "word1\nword2"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UpdatedKeys": ["sms_frequency_limits", "sms_forbidden_words"]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "FrequencyLimits: Yearly must be a non-negative integer"
}
```

```txt [Error Codes]
0: Success
1: FrequencyLimits is invalid (see ErrorText)
2: ForbiddenWords / FrequencyWhitelistedNumbers is not a string
3: Nothing to update
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## List Email Headers

<Badge type="info" text="GET" /> `/api/v1/emailheaders.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `GET /api/v1/emailheaders.get`. Legacy access via `/api.php` is also supported
- System-wide custom email headers (admin Settings > Email Delivery > Headers). `DeliveryServerID` 0 means the header applies on every delivery server.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `emailheaders.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "emailheaders.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailHeaders": [
    {"HeaderID": 1, "Name": "X-Campaign-Source", "Value": "octeth", "EmailType": "campaign", "DeliveryServerID": 0}
  ],
  "TotalEmailHeaders": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
0: Success
```

:::

## Create Email Header

<Badge type="info" text="POST" /> `/api/v1/emailheader.create`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `POST /api/v1/emailheader.create`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `emailheader.create` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| Name      | String | Yes      | Header field name: letters, digits and the punctuation `!#$%&'*+.^_~-`, plus the backtick and the vertical bar (RFC 5322 field-name characters) |
| Value     | String | Yes      | Header value, one line |
| EmailType | String | No       | `all` (default), `campaign`, `autoresponder` or `transactional` |
| DeliveryServerID | Integer | No | Restrict the header to one delivery server; `0` (default) applies it everywhere |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailheader.create",
    "APIKey": "your-admin-api-key",
    "Name": "X-Campaign-Source",
    "Value": "octeth",
    "EmailType": "campaign"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailHeader": {"HeaderID": 7, "Name": "X-Campaign-Source", "Value": "octeth", "EmailType": "campaign", "DeliveryServerID": 0}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5,
  "ErrorText": "EmailType must be one of all, campaign, autoresponder, transactional."
}
```

```txt [Error Codes]
0: Success
1: Name is missing
2: Value is missing
3: Name is not a valid header field name
4: Value is empty or spans more than one line
5: EmailType is not one of the four values
6: DeliveryServerID is not a non-negative integer
7: DeliveryServerID does not exist
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## Delete Email Headers

<Badge type="info" text="POST" /> `/api/v1/emailheaders.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `POST /api/v1/emailheaders.delete`. Legacy access via `/api.php` is also supported
- Ids that do not exist are reported in `MissingHeaderIDs`; the others are still deleted.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `emailheaders.delete` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| HeaderIDs | String | Yes      | Comma-separated header ids (an array is also accepted) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "emailheaders.delete", "APIKey": "your-admin-api-key", "HeaderIDs": "7,8"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "DeletedHeaderIDs": [7],
  "MissingHeaderIDs": [8]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "HeaderIDs must be a comma-separated list of positive integers."
}
```

```txt [Error Codes]
0: Success
1: HeaderIDs is missing
2: HeaderIDs is not a list of positive integers
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::
