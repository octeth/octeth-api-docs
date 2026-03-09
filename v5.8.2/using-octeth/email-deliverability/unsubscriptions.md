---
layout: doc
---

# Unsubscriptions

When a subscriber no longer wants to receive your emails, they opt out — this is called an **unsubscription**. Unlike bounces (which are delivery failures) or spam complaints (which indicate the recipient considers your email unwanted), unsubscriptions are a deliberate, subscriber-initiated action. Processing unsubscriptions promptly and reliably is essential for maintaining your sender reputation, staying compliant with email regulations, and respecting your subscribers' preferences.

This article covers how unsubscriptions work in Octeth, the different channels through which subscribers can opt out, how to configure unsubscription behavior for your lists, how to integrate with third-party systems using the API and webhooks, and how to monitor unsubscription activity.

## Why Unsubscriptions Matter

Unsubscriptions are a healthy and expected part of email marketing. Every email you send should give recipients a clear, easy way to stop receiving future messages. Failing to honor unsubscription requests can lead to serious consequences.

::: danger
Sending emails to subscribers who have unsubscribed violates email regulations such as CAN-SPAM, GDPR, and CASL. It also increases the likelihood that recipients will file spam complaints — which directly damages your sender reputation and can lead to blacklisting. Always process unsubscription requests immediately and ensure unsubscribed addresses cannot receive future campaigns.
:::

The benefits of proper unsubscription handling include:

- **Lower complaint rates** — When unsubscribing is easy, recipients are less likely to click the spam button instead.
- **Better deliverability** — Clean lists with engaged subscribers produce higher inbox placement rates.
- **Regulatory compliance** — Honoring opt-out requests is a legal requirement in most jurisdictions.
- **Accurate metrics** — Removing uninterested subscribers gives you a clearer picture of your true engagement rates.

## Unsubscription Channels

Octeth processes unsubscriptions through multiple channels. Each channel represents a different way a subscriber can opt out, and all channels ultimately follow the same core processing flow.

### Email Unsubscribe Link

The most common unsubscription method is clicking an unsubscribe link in the email body. When you include the `%Link:Unsubscribe%` personalization tag in your email content, Octeth generates a unique, encrypted unsubscribe URL for each recipient.

When a subscriber clicks this link:

1. **Confirmation page is displayed** — The subscriber sees a confirmation page showing their masked email address and an **Unsubscribe** button. This page includes lightweight bot protection that requires human interaction (mouse movement or keyboard input) before the form can be submitted.
2. **Subscriber confirms** — The subscriber clicks the **Unsubscribe** button.
3. **Unsubscription is processed** — Octeth updates the subscriber's status to `Unsubscribed`, records the event, and triggers any configured post-unsubscription behaviors.
4. **Confirmation or redirect** — The subscriber sees a default confirmation page, or is redirected to your custom unsubscription confirmed page if one is configured.

[[SCREENSHOT: The default unsubscription confirmation page showing the masked email address and the Unsubscribe button]]

::: info
The unsubscribe link is unique to each subscriber and each campaign. It contains encrypted identifiers for the campaign, subscriber, list, and email — so Octeth knows exactly who is unsubscribing and from which campaign.
:::

### Suppression Link

The suppression link works the same way as the unsubscribe link, but with an additional step: the subscriber's email address is also added to the **system-level global suppression list**. This prevents the address from receiving any future emails from any user account on the Octeth installation — not just the list they unsubscribed from.

Use the `%Link:Suppression%` personalization tag to insert a suppression link in your email content.

| Tag | What It Does |
|---|---|
| `%Link:Unsubscribe%` | Unsubscribes the subscriber from the list (and optionally adds to per-user or global suppression based on list settings). |
| `%Link:Suppression%` | Unsubscribes the subscriber **and** adds their email address to the system-level global suppression list, blocking all future delivery across all accounts. |

::: warning
Use `%Link:Suppression%` carefully. Once an email address is added to the system-level global suppression list, it will be blocked from receiving emails from **all** user accounts on the system — not just the one that sent the campaign. This is typically used for compliance-critical opt-out scenarios.
:::

### One-Click Unsubscribe (List-Unsubscribe Header)

Octeth automatically adds two email headers to every campaign and autoresponder email:

```
List-Unsubscribe: <https://your-domain.com/u.php?p=<encrypted>>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

These headers comply with [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058) — the standard for one-click unsubscribe. Major email providers like Gmail, Yahoo, and Apple Mail use these headers to display an **Unsubscribe** button at the top of the email, next to the sender name.

When a subscriber clicks this button:

1. The email provider sends a POST request to Octeth with `List-Unsubscribe=One-Click` in the request body.
2. Octeth processes the unsubscription silently — no confirmation page is shown.
3. Octeth returns an HTTP 200 response to the email provider.
4. The subscriber is unsubscribed immediately.

[[SCREENSHOT: Gmail inbox showing the Unsubscribe button next to the sender name, powered by the List-Unsubscribe header]]

::: tip
One-click unsubscribe is now **required** by Gmail and Yahoo for bulk senders. Octeth includes this header automatically, so your emails are compliant out of the box. Do not disable this header unless you have a specific reason to do so.
:::

::: info
Bot filtering is automatically bypassed for one-click unsubscribe requests. This ensures that legitimate unsubscribe requests from email providers are always processed, even if bot protection is enabled on your installation.
:::

#### Disabling the List-Unsubscribe Header

In some cases, you may want to suppress the `List-Unsubscribe` header — for example, for transactional emails where an unsubscribe option is not appropriate. The header can be disabled at two levels:

| Level | Setting | Effect |
|---|---|---|
| **Per user** | User account option `DisableListUnsubscribeHeader` | Suppresses the header for all emails sent by that user. |
| **Per user group** | User group option `DisableListUnsubscribeHeader` | Suppresses the header for all users in the group. |

Contact your system administrator to configure these settings.

### API-Based Unsubscription

External applications can unsubscribe subscribers programmatically using Octeth's API. This is useful for integrating Octeth with CRM systems, customer support tools, preference centers, or any third-party application that needs to manage subscriber opt-outs.

See the [Integrating with Third-Party Systems](#integrating-with-third-party-systems) section for detailed API usage instructions.

### Journey Builder Action

The Journey Builder includes an **Unsubscribe** action that can automatically unsubscribe subscribers as part of an automated workflow. For example, you can create a journey that unsubscribes subscribers who have been inactive for a certain period, or who meet specific segment criteria.

When a journey reaches an unsubscribe action node, it calls the same internal unsubscription process as all other channels — the subscriber is unsubscribed, statistics are updated, and all configured post-unsubscription behaviors are triggered.

### Email-Based Unsubscription

When the email request feature is enabled, subscribers can unsubscribe by sending an email with a specific subject line to a designated email address. This method is configured per list.

To set this up:

1. Navigate to the subscriber list's **Settings** page.
2. In the **Request by email settings** section, configure:
   - **Email address** — The email address bound to this list (e.g., `unsubscribe@example.com`).
   - **Unsubscription command** — The subject line keyword that triggers the unsubscription (e.g., `unsubscribe`).

When Octeth's POP3 worker detects an incoming email to the configured address with a matching subject line, it processes the unsubscription automatically.

::: info
The email-based unsubscription feature must be enabled at the system level by your administrator. It is disabled by default.
:::

### Embeddable Unsubscription Form

Octeth can generate an HTML form that you can embed on your website, allowing subscribers to unsubscribe by entering their email address. This is useful for providing an alternative opt-out method outside of email.

To generate the form, use the `ListIntegration.GenerateUnsubscriptionFormHTMLCode` API command:

```bash
curl -X POST "https://your-octeth-domain/api.php" \
  -d "ResponseFormat=JSON" \
  -d "Command=ListIntegration.GenerateUnsubscriptionFormHTMLCode" \
  -d "SessionID=your-session-id" \
  -d "subscriberlistid=123"
```

The API returns an HTML form containing:

- A hidden field with the list ID
- An email address input field
- An **Unsubscribe** submit button

Embed this HTML on any web page. When a subscriber submits the form, the unsubscription is processed through Octeth's standard flow.

## How Unsubscription Processing Works

Regardless of which channel triggers the unsubscription, Octeth follows the same core process.

### The Unsubscription Lifecycle

1. **Request is received** — An unsubscription request arrives through one of the channels described above.
2. **Subscriber is identified** — Octeth identifies the subscriber by their email address or subscriber ID, along with the associated list and campaign.
3. **Bot check** — For web-based unsubscriptions (link clicks), the bot filter plugin checks for automated requests. One-click unsubscribe requests from email providers bypass this check.
4. **Validation** — Octeth verifies that the subscriber exists in the list, the list is valid, and the subscriber is not already unsubscribed.
5. **Status update** — The subscriber's status is changed to `Unsubscribed`. The unsubscription date and IP address are recorded.
6. **Autoresponder cleanup** — The subscriber is removed from any active autoresponder queues for the list.
7. **Statistics recording** — The unsubscription event is recorded in campaign statistics, list activity statistics, and the subscriber's activity history.
8. **Webhook notification** — If a web service URL is configured for unsubscription events on the list, Octeth sends an HTTP POST notification with the subscriber's details.
9. **Post-unsubscription behaviors** — Any configured behaviors (suppression list addition, cross-list actions, notification emails) are executed.
10. **Journey triggers** — Any journeys configured to trigger on list unsubscription events are activated for the subscriber.

### Unsubscription Scope

The **opt-out scope** setting on each list controls how broadly the unsubscription applies:

| Scope | Behavior |
|---|---|
| **This list** (default) | The subscriber is unsubscribed only from the specific list associated with the campaign they opted out of. They remain subscribed to any other lists they belong to. |
| **All lists** | The subscriber is unsubscribed from **every** list owned by the same user account. Use this when you want a single opt-out to remove the subscriber from all your mailing lists. |

::: tip
For most use cases, the default scope of "This list" is recommended. It respects subscriber preferences — someone may want to stop receiving promotional emails but still want to receive your newsletter. Use "All lists" only when you need a universal opt-out.
:::

## Configuring Unsubscription Behavior

Each subscriber list has its own unsubscription settings. These settings control what happens after a subscriber opts out.

### List Settings

Navigate to your subscriber list's **Settings** page and scroll to the **Behaviors** section. Under **"When a subscriber unsubscribes from this list:"**, you can configure the following options:

[[SCREENSHOT: List Settings page showing the Behaviors section with unsubscription options including scope, suppression list, cross-list actions, and redirect page settings]]

| Setting | Description |
|---|---|
| **Subscribe him/her to a specific list** | Automatically subscribes the unsubscribed subscriber to a different list. Useful for moving opt-outs to a low-frequency or "essential updates only" list. |
| **Unsubscribe him/her from a specific list** | Automatically unsubscribes the subscriber from an additional list when they opt out of this one. |
| **Unsubscribe him/her from all lists** | When enabled, the subscriber is unsubscribed from all lists owned by the same user account — not just this one. |
| **Add unsubscribed email addresses into suppression list** | Adds the email address to the per-user suppression list. Future emails from this user account to this address will be blocked, even if the address is added to a new list. |
| **Add unsubscribed email addresses into global suppression list** | Adds the email address to the global suppression list. Future emails from **any** user account on the system to this address will be blocked. |
| **Display my own unsubscription confirmed page** | Redirects the subscriber to your custom URL after a successful unsubscription instead of showing the default confirmation page. Enter the full URL starting with `http://` or `https://`. |
| **Display my own unsubscription error page** | Redirects the subscriber to your custom URL if an error occurs during unsubscription. The error code, list ID, subscriber ID, and email address are appended as query string parameters. |

::: tip
If you enable the suppression list option, unsubscribed addresses are permanently blocked from receiving future emails — even if someone re-imports the address into a new list. This provides an extra layer of protection against accidentally emailing people who have opted out.
:::

### Unsubscription Redirect Pages

When you configure custom redirect pages, Octeth sends the subscriber to your URL after the unsubscription is processed. This allows you to create a branded experience — for example, a page that confirms the opt-out, offers a re-subscribe option, or includes a brief survey about why they unsubscribed.

**Successful unsubscription redirect:**
The subscriber is redirected to the URL you specify in the **"Display my own unsubscription confirmed page"** field.

**Error redirect:**
If an error occurs, the subscriber is redirected to your error page URL. Octeth appends the following query string parameters so your page can display appropriate information:

| Parameter | Description |
|---|---|
| `errorcode` | A numeric code indicating the type of error. |
| `listid` | The ID of the subscriber list. |
| `subscriberid` | The ID of the subscriber. |
| `email` | The subscriber's email address. |

### Activity Notifications

When the **Send Activity Notification** option is enabled on a list, the list owner receives an email notification each time a subscriber unsubscribes. This helps you stay informed about opt-out activity without needing to check reports manually.

The notification email includes the subscriber's email address and the list they unsubscribed from.

### Forcing the Unsubscribe Link

System administrators can require that all campaign emails include an unsubscribe link. When the **Force unsubscribe link in campaign emails** option is enabled at the user group level, users in that group cannot send campaigns or autoresponders unless the email content contains the `%Link:Unsubscribe%` tag.

This setting is configured in **Admin Area** > **User Groups** > select a group > **Settings**.

::: warning
If this setting is enabled and a user tries to send a campaign without the `%Link:Unsubscribe%` tag in the email body, HTML header/footer, or plain text content, the send will be rejected.
:::

## Integrating with Third-Party Systems

Octeth provides two integration methods for connecting unsubscription events with external systems: the **API** for programmatically triggering unsubscriptions, and **webhooks** for receiving real-time notifications when unsubscriptions occur.

### Using the API to Unsubscribe Subscribers

The `Subscriber.Unsubscribe` API command allows external applications to unsubscribe subscribers programmatically.

#### Required Parameters

| Parameter | Type | Description |
|---|---|---|
| `SessionID` | string | A valid API session ID. |
| `listid` | integer | The ID of the subscriber list. |
| `ipaddress` | string | The IP address of the requestor (used for audit logging). |
| `emailaddress` | string | The subscriber's email address. **Required** if `subscriberid` is not provided. |
| `subscriberid` | integer | The subscriber's ID. **Required** if `emailaddress` is not provided. |

#### Optional Parameters

| Parameter | Type | Description |
|---|---|---|
| `campaignid` | integer | The campaign ID associated with the unsubscription (for tracking purposes). |
| `autoresponderid` | integer | The autoresponder ID associated with the unsubscription. |
| `emailid` | integer | The email content ID associated with the unsubscription. |
| `channel` | string | A freeform label describing the unsubscription source (e.g., `"preference center"`, `"CRM sync"`, `"support request"`). This value is recorded in the unsubscription statistics. |
| `addtoglobalsuppression` | boolean | If `true`, adds the email address to the system-level global suppression list. |
| `preview` | integer | If `1`, performs a dry run — validates the request without actually unsubscribing the subscriber. |

#### Example Request

```bash
curl -X POST "https://your-octeth-domain/api.php" \
  -d "ResponseFormat=JSON" \
  -d "Command=Subscriber.Unsubscribe" \
  -d "SessionID=your-session-id" \
  -d "listid=42" \
  -d "emailaddress=john@example.com" \
  -d "ipaddress=192.168.1.100" \
  -d "channel=preference center"
```

#### Example Response (Success)

```json
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/unsubscribed"
}
```

The `RedirectURL` field contains the custom unsubscription confirmed page URL configured on the list, if any. Your application can use this to redirect the user to the appropriate page.

#### Error Codes

| Code | Description |
|---|---|
| 1 | Missing or invalid required parameter. |
| 2 | Invalid subscriber list. |
| 3 | Invalid list or user account. |
| 4 | Invalid subscriber list. |
| 5 | Missing email address or subscriber ID. |
| 6 | Invalid email address format. |
| 7 | Subscriber not found in the list. |
| 8 | Invalid campaign ID or autoresponder ID. |
| 9 | Subscriber is already unsubscribed. |
| 10 | Invalid email ID. |

#### Bulk Unsubscription by Segment

The API also supports bulk unsubscription using segment rules. Instead of specifying a single subscriber, you can provide segment criteria to unsubscribe all matching subscribers at once:

| Parameter | Type | Description |
|---|---|---|
| `rulesjson` | string | A JSON-encoded array of segment rules defining which subscribers to unsubscribe. |
| `rulesoperator` | string | The logical operator for combining rules (`and` or `or`). |

::: warning
Bulk unsubscription is irreversible. Test your segment rules carefully before using this feature in production. Use the `preview=1` parameter to validate your rules without making changes.
:::

### Updating Subscriber Status via API

You can also change a subscriber's status to `Unsubscribed` using the `Subscriber.Update` API command. This provides an alternative method when you need to update the subscription status along with other subscriber fields.

```bash
curl -X POST "https://your-octeth-domain/api.php" \
  -d "ResponseFormat=JSON" \
  -d "Command=Subscriber.Update" \
  -d "SessionID=your-session-id" \
  -d "listid=42" \
  -d "subscriberid=1001" \
  -d "subscriptionstatus=Unsubscribed" \
  -d "unsubscriptionip=192.168.1.100"
```

### Receiving Unsubscription Webhooks

Octeth can send real-time HTTP POST notifications to your external systems whenever a subscriber unsubscribes. This is configured per list through the **Web service integration** section of the list settings.

#### Setting Up a Webhook

1. Navigate to your subscriber list's **Settings** page.
2. Scroll to the **Web service integration** section.
3. Enter your webhook URL in the **New service URL** field.
4. Select **Unsubscription event** from the **Event type** dropdown.
5. Click **Add**.

Octeth will verify that your URL is reachable and display a status indicator.

[[SCREENSHOT: List Settings page showing the Web service integration section with a configured unsubscription webhook URL and status indicator]]

#### Webhook Payload

When an unsubscription occurs, Octeth sends an HTTP POST request to your configured URL with two payload fields:

| Field | Format | Description |
|---|---|---|
| `WebServiceData` | XML | An XML document containing the action type (`Unsubscription`) and all subscriber field values. |
| `WebServiceDataJSON` | JSON | A JSON object containing all subscriber field values. |

**Example JSON payload:**

```json
{
  "EmailAddress": "john@example.com",
  "FirstName": "John",
  "LastName": "Doe",
  "SubscriptionStatus": "Unsubscribed",
  "UnsubscriptionDate": "2026-02-25 14:30:00",
  "UnsubscriptionIP": "203.0.113.45"
}
```

The payload includes all custom fields defined on the subscriber list, so you receive the complete subscriber record along with the unsubscription event.

#### Dynamic URL Parameters

Your webhook URL can include subscriber field placeholders that are replaced with actual values before the request is sent. For example:

```
https://your-app.com/webhook?email=%Subscriber:EmailAddress%&list=%Subscriber:ListID%
```

This allows you to pass subscriber information directly in the URL for systems that require query string parameters.

### Event Logger (RabbitMQ Integration)

Every unsubscription event is also published to the RabbitMQ `events` exchange as a JSON message with event type `Unsubscription`. If your infrastructure includes custom consumers on this exchange, they will receive real-time unsubscription events alongside other system events.

## Viewing Unsubscription Statistics

Octeth tracks unsubscription data at multiple levels, giving you visibility into opt-out trends across campaigns, lists, and individual subscribers.

### Campaign Reports

Each campaign report includes an **Unsubscriptions** section showing:

- **Total unsubscription count** — The number of subscribers who opted out after receiving that campaign.
- **Time-series chart** — A chart showing when unsubscriptions occurred relative to the campaign send time.
- **Subscriber list** — A paginated list of subscribers who unsubscribed, with their email addresses and unsubscription timestamps.

Navigate to **Campaigns** > select a campaign > **Reports** > **Unsubscriptions** to view this data.

[[SCREENSHOT: Campaign report showing the Unsubscriptions tab with total count, time-series chart, and subscriber list]]

### Unsubscription Channel Tracking

Each unsubscription record includes a **channel** field that indicates how the subscriber opted out. This helps you understand which unsubscription methods your subscribers use most frequently.

Common channel values include:

| Channel | Description |
|---|---|
| *(empty)* | Standard unsubscribe link click. |
| `List-Unsubscribe header` | One-click unsubscribe via the email header button. |
| `SPAM complaint` | Unsubscription triggered by a spam complaint. |
| Custom value | Any custom channel name provided through the API `channel` parameter. |

### Segment Builder

You can create subscriber segments based on unsubscription activity. The segment builder supports two unsubscription-related operators:

| Operator | Description |
|---|---|
| **Unsubscribed** | Matches subscribers who have an unsubscription record for a specific campaign. |
| **Not unsubscribed** | Matches subscribers who do not have an unsubscription record for a specific campaign. |

This is useful for analyzing unsubscription patterns — for example, identifying which subscriber segments have the highest opt-out rates for specific campaign types.

### Journey Builder Integration

Unsubscription events are fully integrated with the Journey Builder. You can use them in two ways:

- **As a trigger** — Start a journey when a subscriber unsubscribes from a specific list (or any list). This allows you to build automated post-unsubscription workflows, such as sending a feedback survey email from a different system or notifying your CRM.
- **As an action** — Use the **Unsubscribe** action node to unsubscribe subscribers as part of an automated journey flow, based on conditions like inactivity or engagement scores.

## Tips and Best Practices

::: tip Make Unsubscribing Easy and Visible
Place the unsubscribe link in a visible location in your email — not buried in tiny text at the bottom. A clear, easy-to-find unsubscribe link reduces spam complaints because subscribers opt out through the proper channel instead of clicking the spam button.
:::

::: tip Always Include the Unsubscribe Link
Consider enabling the **Force unsubscribe link** setting at the user group level. This ensures that no campaign can be sent without an unsubscribe link, protecting you from accidental compliance violations.
:::

::: tip Use the Suppression List for Extra Protection
Enable the **Add unsubscribed email addresses into suppression list** option on your lists. This prevents accidentally re-subscribing someone who has opted out — even if their address is included in a future import file.
:::

::: tip Monitor Unsubscription Rates After Campaigns
A sudden spike in unsubscriptions after a campaign may indicate a content or frequency issue. Check your campaign reports to identify trends — are opt-outs concentrated in a specific list segment, content type, or sending frequency?
:::

::: tip Use the Channel Field for Analytics
When integrating with the API, always provide a meaningful `channel` value. This allows you to distinguish between unsubscriptions from your preference center, CRM syncs, support requests, and other sources when reviewing statistics.
:::

::: tip Leverage the "Subscribe to Another List" Feature
Instead of losing contact with unsubscribers entirely, configure the **Subscribe him/her to a specific list** option to move opt-outs to a low-frequency list (e.g., "Monthly Digest" or "Important Announcements Only"). This gives subscribers a softer alternative to a complete opt-out.
:::

## Troubleshooting

### Subscribers Are Not Being Unsubscribed

1. **Check the list exists and is valid** — Verify that the subscriber list ID is correct and the list has not been deleted.
2. **Verify the subscriber exists in the list** — The subscriber must be present in the specified list. If they have already been removed or were never on the list, the unsubscription will fail with an error.
3. **Check if already unsubscribed** — If the subscriber's status is already `Unsubscribed`, the system returns error code 9. This is not a failure — it means the opt-out was already processed.
4. **Review bot filter logs** — If web-based unsubscriptions are being blocked, the bot filter plugin may be rejecting requests it considers automated. One-click unsubscribe requests from email providers bypass this filter automatically.

### One-Click Unsubscribe Is Not Working

1. **Verify the List-Unsubscribe header is present** — Check the raw email headers of a sent campaign to confirm both the `List-Unsubscribe` and `List-Unsubscribe-Post` headers are included.
2. **Check if the header is disabled** — The `DisableListUnsubscribeHeader` setting may be enabled at the user or user group level. Contact your administrator to verify.
3. **Verify your Octeth URL is publicly accessible** — Email providers send the one-click unsubscribe POST request to your Octeth server directly. The URL in the `List-Unsubscribe` header must be reachable from the internet over HTTPS.

### Webhooks Are Not Firing

1. **Verify the webhook URL** — Check the list's **Web service integration** section to confirm the URL is correct and the status indicator shows "URL works."
2. **Check network connectivity** — Ensure your webhook endpoint is reachable from the Octeth server. Test the URL manually with a tool like `curl`.
3. **Verify the event type** — Make sure the webhook is configured for the **Unsubscription event** type, not the Subscription event type.
4. **Check your endpoint's response** — Your webhook endpoint should return an HTTP 200 status code. If it returns an error, Octeth may not retry the notification.

### Custom Redirect Page Is Not Loading

1. **Verify the URL** — Check the **Display my own unsubscription confirmed page** or **Display my own unsubscription error page** field in the list settings. The URL must start with `http://` or `https://`.
2. **Check the redirect feature is enabled** — The custom redirect feature must be enabled at the system level. Contact your administrator if the redirect settings are not visible in your list settings.
3. **Test the URL directly** — Open the redirect URL in a browser to confirm it loads correctly. If the page returns an error, the subscriber will see a broken page after unsubscribing.

### High Unsubscription Rate

1. **Review sending frequency** — Sending too often is one of the most common reasons subscribers opt out. Consider reducing frequency or offering subscribers a choice of how often they receive emails.
2. **Check content relevance** — Ensure your email content matches what subscribers expected when they signed up. Irrelevant content drives opt-outs.
3. **Segment your audience** — Send more targeted content to specific segments rather than the same message to your entire list.
4. **Review your sign-up process** — If subscribers are opting out shortly after subscribing, your sign-up form or confirmation process may not be setting clear expectations about what they will receive.
5. **Implement double opt-in** — Double opt-in ensures that subscribers genuinely want to receive your emails, reducing the likelihood of early opt-outs.

## Unsubscriptions vs. Bounces vs. Complaints

Understanding the difference between these three types of events helps you take the right action for each:

| Event | Initiated By | What It Means | Octeth Response |
|---|---|---|---|
| **Unsubscription** | Subscriber | The subscriber no longer wants to receive emails and opted out voluntarily. | Status set to `Unsubscribed`. Optionally added to suppression list based on list settings. |
| **Bounce** | Receiving mail server | The email could not be delivered due to a technical issue (invalid address, full mailbox, etc.). | Status set to `Hard` or `Soft` bounce. Hard bounces are added to the global suppression list. |
| **Complaint** | Subscriber (via spam button) | The subscriber marked the email as spam in their email client. | Status set to `Unsubscribed`. Email address is **always** added to the global suppression list. |

::: info
Spam complaints are the most damaging to your sender reputation. An easy-to-find unsubscribe link is your best defense — it gives unhappy subscribers a way to opt out without filing a complaint.
:::

## Related Features

- **[Bounce Processing](./bounce-processing)** — How bounced emails are detected, classified, and processed to protect your sender reputation.
- **[Complaint Processing](./complaint-processing)** — How spam complaints from ISP feedback loops are processed alongside unsubscriptions.
- **[Suppression Lists](./suppression-lists)** — How unsubscribed, bounced, and complained email addresses are suppressed to prevent future delivery.
- **[Email Sending](./email-sending)** — Configure delivery servers, sender domains, and the email delivery pipeline.
- **[Email Tracking](./email-tracking)** — How open and click tracking work, including tracking of unsubscribe link clicks.
- **[SPF/DKIM/DMARC](./spf-dkim-dmarc)** — Email authentication protocols that support List-Unsubscribe header functionality and deliverability.
