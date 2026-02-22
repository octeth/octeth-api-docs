---
layout: doc
---

# Settings API Documentation

System settings management endpoints for configuring Octeth application settings and testing email delivery configurations.

## Test Email Sending Configuration

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
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

## Update System Settings

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

All parameters are optional. Only provide the settings you want to update.

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
| PMEUsageType | String | No | PreviewMyEmail usage type: `Admin` or `User` |
| PMEDefaultAccount | String | No | Default PreviewMyEmail account |
| PMEDefaultAPIKey | String | No | PreviewMyEmail API key |
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
| AdminCaptcha | String | No | Enable admin captcha: `true` or `false` |
| UserCaptcha | String | No | Enable user captcha: `true` or `false` |
| EnabledPlugins | String | No | Comma-separated list of enabled plugins |
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
    "AdminCaptcha": "true"
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
2: Invalid enum value (MediaUploadMethod, S3Enabled, LoadBalanceStatus, PMEUsageType, UserSignupEnabled, UserSignupReputation, AdminCaptcha, UserCaptcha, SendMethod, SendMethodSMTPSecure, SendMethodSMTPAuth, MailEngine, or RunCronInUserArea)
3: PreviewMyEmail API connection error
6: POP3/IMAP connection failed (check EmailSettingsErrorMessage for details)
7: Default opt-in email body missing required %Link:Confirm% tag
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::
