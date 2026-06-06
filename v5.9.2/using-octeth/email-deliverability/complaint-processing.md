---
layout: doc
---

# Complaint Processing

When a recipient marks your email as spam in their email client, the recipient's email provider generates a **spam complaint** and sends it back to the original sender through a system called a **feedback loop** (FBL). Complaint processing is the system that receives these reports, identifies the subscriber who complained, and takes automatic action to protect your sending reputation.

This article covers what spam complaints are, why they matter, how Octeth processes them, how to configure complaint handling, and how to integrate with third-party mail transfer agents (MTAs) like PowerMTA.

## What Is a Spam Complaint?

A spam complaint occurs when a recipient clicks the **Mark as Spam** (or **Report Spam**) button in their email client. When this happens, the recipient's email provider — such as Gmail, Yahoo, or Outlook — notifies the original sender that the recipient considered the email unwanted.

This notification is sent through a standardized system called a **feedback loop** (FBL). FBL reports follow the **Abuse Reporting Format** (ARF), defined in [RFC 5965](https://datatracker.ietf.org/doc/html/rfc5965). An ARF report is a structured email message that contains the original email headers, the recipient's email address, and the type of complaint.

::: info
Not all email providers operate feedback loops. Major providers like Yahoo, Outlook, and AOL have well-established FBL programs. Gmail uses a different mechanism — it reports complaints through [Google Postmaster Tools](https://postmaster.google.com/) and the **Feedback-ID** header rather than traditional ARF-based feedback loops.
:::

### Why Spam Complaints Matter

Spam complaints are one of the most damaging signals for your sender reputation — even more so than bounces. Email providers use complaint rates to decide whether to deliver your emails to the inbox, route them to spam, or block them entirely.

The consequences of ignoring spam complaints include:

- Immediate throttling or blocking of your sending IP addresses
- Lower inbox placement rates across all campaigns
- Potential blacklisting by major email providers
- Damage to your domain reputation that can take weeks or months to recover

::: danger
Most email providers expect a complaint rate below **0.1%** (1 complaint per 1,000 emails). Google specifically flags domains with complaint rates above 0.1% and may block delivery entirely above 0.3%. Monitor your complaint rates closely and take action immediately if they rise.
:::

### Common Reasons Recipients File Complaints

Understanding why recipients mark emails as spam helps you reduce complaint rates:

| Reason | Description |
|---|---|
| **Unwanted emails** | The recipient does not remember subscribing or no longer wants the emails. |
| **No visible unsubscribe link** | The recipient cannot find an easy way to unsubscribe and uses the spam button instead. |
| **Too frequent emails** | The recipient feels they are receiving emails too often. |
| **Irrelevant content** | The email content does not match what the recipient expected when subscribing. |
| **Misleading subject lines** | The subject line does not accurately reflect the email content. |
| **Purchased or scraped lists** | The recipient never opted in to receive emails from the sender. |

## How Complaint Processing Works

When a spam complaint is received, Octeth follows a multi-step process to identify the subscriber and take protective action.

### The Complaint Lifecycle

1. **Complaint is generated** — The recipient clicks "Mark as Spam" in their email client.
2. **Email provider sends FBL report** — The provider sends an ARF-formatted email or webhook notification back to the sender.
3. **Octeth receives the complaint** — The complaint arrives through one of several channels: email pipe, POP3 mailbox polling, MTA webhook, or third-party email service webhook.
4. **Subscriber is identified** — Octeth extracts the `X-MessageID` header from the original email embedded in the FBL report. This header contains encoded identifiers for the campaign, subscriber, list, and user account.
5. **Subscriber is unsubscribed** — The subscriber is automatically unsubscribed from the list with the channel recorded as "SPAM complaint."
6. **Email is added to suppression list** — The subscriber's email address is added to the global suppression list to prevent any future delivery, even if the address is added to a new list later.
7. **FBL report is recorded** — The complaint details are saved in the FBL reports database for statistics and auditing.
8. **Campaign statistics are updated** — The campaign's complaint counter is incremented.

[[SCREENSHOT: Diagram showing the complaint lifecycle: recipient clicks spam button, email provider sends FBL report, Octeth receives and processes the complaint, subscriber is unsubscribed and suppressed]]

::: warning
Once a subscriber files a spam complaint, Octeth permanently suppresses their email address. Continuing to send emails to a recipient who has complained is one of the fastest ways to damage your sender reputation and risk blacklisting.
:::

### The X-MessageID Header

Every email sent by Octeth includes a custom `X-MessageID` header. This header contains encoded information that allows Octeth to trace any complaint or bounce back to the exact campaign, subscriber, list, and user account that generated the email.

When a complaint is received, Octeth decodes this header to extract:

- **Campaign ID** — Which campaign sent the email.
- **Subscriber ID** — Which subscriber received the email.
- **Email Address** — The recipient's email address.
- **List ID** — Which subscriber list the recipient belongs to.
- **User ID** — Which Octeth user account sent the campaign.

This identification step is critical. Without the `X-MessageID` header, Octeth cannot determine which subscriber complained and cannot take automatic action.

::: info
Octeth also supports identification through the `List-Unsubscribe` header subject line. When a recipient uses the list-unsubscribe mechanism (rather than the spam button), Octeth processes it as an unsubscription rather than a complaint — the subscriber is unsubscribed but not added to the suppression list.
:::

## Complaint Processing Channels

Octeth receives spam complaints through multiple channels depending on your email delivery infrastructure.

### Email Pipe (Direct FBL)

The email pipe is the most direct method. When your mail server receives an FBL report email, it pipes the raw email content directly to Octeth's FBL processing script (`cli/fbl.php`) via STDIN. The script parses the ARF email, extracts the `X-MessageID` header, and processes the complaint.

This method is used when your MTA is configured to forward FBL emails to a local processing script.

### POP3 Mailbox Polling

Octeth can poll a dedicated POP3 mailbox for FBL report emails. This is useful when your FBL reports are delivered to a specific email address (e.g., `fbl@bounces.example.com`) and you want Octeth to periodically check that mailbox and process any new reports.

The POP3 processor (`cli/pop3_fbl.php`) connects to the configured mailbox, downloads FBL emails, processes each one, and optionally deletes the processed emails. It processes up to 500 emails per run.

Configure POP3 FBL polling in **Admin Area** > **Settings** > **Email Delivery** under the **Spam Complaints** tab. See the [Administrator Settings](#administrator-settings) section for details.

### MTA Webhook (PowerMTA, Logstash)

When using an external MTA like PowerMTA, complaint events are captured in the MTA's accounting logs and forwarded to Octeth's webhook endpoint via a log-forwarding tool like Logstash. PowerMTA logs FBL events as `f` (feedback loop) records.

This is the recommended method for high-volume sending operations. See the [Integrating with Third-Party MTAs](#integrating-with-third-party-mtas) section for detailed setup instructions.

### Third-Party Email Service Webhooks

If you use a third-party email delivery service, complaints are reported through service-specific webhooks:

| Service | Webhook Event | How It Works |
|---|---|---|
| **Mailgun** | `complained` | Mailgun sends a webhook POST request when a recipient files a complaint. |
| **SendGrid** | `spamreport` | SendGrid forwards spam report events through its Event Webhook. |
| **Amazon SES** | SNS Complaint Notification | Amazon SES publishes complaint events to an SNS topic that Octeth subscribes to. |

Each integration automatically adds the complainant's email address to the suppression list and records the complaint in the FBL reports database.

### Report Abuse Form

Octeth includes a public **Report Abuse** form that recipients can use to file a complaint directly. This form is accessible via a link that can be included in your email templates. When a recipient submits the form:

1. The subscriber is unsubscribed with the channel "SPAM complaint."
2. The email address is added to the suppression list.
3. An abuse report notification is sent to the administrator's configured alert email address.

The Report Abuse form provides a direct channel for recipients to complain without going through their email provider, which can help you address complaints before they impact your FBL rates.

## Integrating with Third-Party MTAs

When using an external MTA to deliver your emails, you need to configure the MTA to report complaint (FBL) events back to Octeth. This section covers integration with PowerMTA, which is the most commonly used MTA for high-volume sending.

### PowerMTA Integration

[PowerMTA](https://www.sparkpost.com/powermta/) captures FBL events in its accounting files alongside bounce and delivery records. The integration uses [Logstash](https://www.elastic.co/logstash) to forward these events to Octeth's webhook endpoint.

::: info
If you have already configured the PowerMTA integration for bounce processing (see [Bounce Processing](./bounce-processing)), the same Logstash pipeline handles FBL events. The `f` record type in the Logstash filter configuration captures FBL events and forwards them to Octeth alongside bounce events. No additional configuration is needed.
:::

#### Step 1: Configure PowerMTA FBL Accounting

Edit your PowerMTA configuration file (typically `/etc/pmta/config`) and add the FBL accounting file directive:

```
<acct-file /var/log/pmta/fbl.csv>
    move-interval 24h
    move-to /var/log/pmta/accounting/fbl/
    records feedback-loop
    record-fields f timeLogged,format,header_To,header_Return-Path,reportedDomain,header_X-FBLId
    world-readable yes
</acct-file>
```

This tells PowerMTA to log FBL events with the following fields:

| Field | Description |
|---|---|
| `timeLogged` | Timestamp when the FBL report was received. |
| `format` | The format of the FBL report (typically ARF). |
| `header_To` | The original recipient address from the complaint. |
| `header_Return-Path` | The return-path address used in the original email. |
| `reportedDomain` | The domain reported in the complaint. |
| `header_X-FBLId` | The `X-FBLId` header from the original email, used for identification. |

If you are also processing bounces through PowerMTA (recommended), your complete accounting configuration should include both bounce and FBL directives:

```
<acct-file /var/log/pmta/bounces.csv>
    move-interval 1h
    move-to /var/log/pmta/accounting/bounces/
    records b, rb
    record-fields b timeQueued,timeLogged,orig,rcpt,bounceCat,dsnStatus,dsnAction,dsnDiag,dsnMta,jobId,vmta,header_X-FBLId
    record-fields rb timeLogged,orig,rcpt,bounceCat,dsnStatus,dsnAction,dsnDiag,dsnMta,header_X-FBLId
    world-readable yes
</acct-file>

<acct-file /var/log/pmta/fbl.csv>
    move-interval 24h
    move-to /var/log/pmta/accounting/fbl/
    records feedback-loop
    record-fields f timeLogged,format,header_To,header_Return-Path,reportedDomain,header_X-FBLId
    world-readable yes
</acct-file>
```

Reload your PowerMTA configuration to apply the changes:

```bash
pmta reload
```

#### Step 2: Configure Logstash for FBL Events

If you have already set up Logstash for bounce processing, your existing pipeline configuration already includes the FBL filter. The `f` record type is parsed in the filter section:

```
} else if ([message] =~ "^(f),") {
    csv {
        source => "message"
        columns => [
            "logType", "timeLogged", "format",
            "header_To", "header_Return-Path",
            "reportedDomain", "header_X-FBLId"
        ]
        separator => ","
        add_tag => [ "pmta_fbl" ]
        skip_empty_columns => true
    }
}
```

If you are setting up Logstash from scratch, refer to the [Bounce Processing — PowerMTA Integration](./bounce-processing#powermta-integration) article for the complete Logstash pipeline configuration. The same pipeline handles bounces (`b`, `rb` records) and FBL events (`f` records).

::: warning
Replace `octeth.example.com` in the Logstash output URL with your actual Octeth server domain. The URL must be reachable from your PowerMTA server over HTTPS.
:::

#### Step 3: Verify the Integration

After configuring PowerMTA and Logstash:

1. Send a test campaign to a mailbox where you can trigger a complaint.
2. Mark the email as spam in the test mailbox.
3. Wait for the FBL report to be logged by PowerMTA and forwarded by Logstash.
4. Check the **Admin Area** > **Bounce Processing** > **Webhooks** tab for incoming FBL events.
5. Verify the subscriber was unsubscribed and added to the suppression list.

#### How the PowerMTA Complaint Data Flow Works

The complete data flow for complaint processing through PowerMTA:

1. **Email is sent** — PowerMTA delivers the email to the recipient's mail server.
2. **Recipient marks as spam** — The recipient clicks the spam button in their email client.
3. **Email provider sends FBL report** — The provider sends an ARF report back to the sender's domain.
4. **PowerMTA logs the FBL event** — The event is written to `/var/log/pmta/fbl.csv` with record type `f`.
5. **Logstash detects the new log entry** — Logstash tails the accounting file in real time.
6. **Logstash sends to Octeth** — The parsed FBL data is POSTed to the Octeth webhook endpoint.
7. **Octeth processes the complaint** — The webhook handler identifies the subscriber, unsubscribes them, adds the address to the suppression list, and records the FBL report.

PowerMTA uses the following record types in its accounting files:

| Record Type | Description |
|---|---|
| `d` | Delivered — email was successfully delivered. |
| `b` | Synchronous bounce — delivery rejected during the SMTP conversation. |
| `rb` | Asynchronous bounce — DSN email received after initial acceptance. |
| `f` | Feedback loop — ISP complaint report (spam complaint). |
| `t` | Transient — temporary status. |
| `tq` | Transient queue — temporary queue status. |

### Integrating with Other MTAs

If you use an MTA other than PowerMTA, you can integrate with Octeth's webhook using the same general approach:

1. **Configure your MTA to log FBL events** — Most MTAs support FBL logging to files, databases, or event hooks.
2. **Forward FBL data to Octeth's webhook** — Send an HTTP POST request to `https://<your-octeth-domain>/system/bounce_webhook?type=pmta` with the complaint details.

The webhook endpoint accepts FBL events when the `logType` field is set to `f`. The key fields for FBL events are:

| Parameter | Description |
|---|---|
| `type` | Data source type. Use `pmta` for direct submissions. |
| `logType` | Set to `f` to indicate a feedback loop (complaint) event. |
| `orig` | The original sender (return-path/MFROM) email address. |
| `rcpt` | The recipient email address that filed the complaint. |
| `header_X-FBLId` | The FBL identification header from the original email. |
| `timeLogged` | Timestamp when the FBL report was received. |

::: tip
You can use any log-forwarding tool to send FBL data to Octeth — not just Logstash. Tools like [Fluentd](https://www.fluentd.org/), [Filebeat](https://www.elastic.co/beats/filebeat), or a custom script can monitor your MTA's FBL logs and POST the data to the webhook endpoint.
:::

## Administrator Settings

Several complaint-related settings are available in **Admin Area** > **Settings** > **Email Delivery** under the **Spam Complaints** tab.

| Setting | Description |
|---|---|
| **Report Abuse Email** | The email address that receives abuse report notifications when a recipient submits the Report Abuse form. |
| **X-Complaints-To Header** | The email address inserted into the `X-Complaints-To` header of outgoing emails. Some email providers use this header to send complaint notifications. |
| **FBL Incoming Email Address** | The email address where FBL reports are delivered. This address is used in the `X-MessageID` header and should match the address configured in your FBL registrations with email providers. |
| **Unsubscribe Incoming Email Address** | The email address that handles `List-Unsubscribe` header requests. When a recipient uses the list-unsubscribe mechanism, the unsubscribe request is sent to this address. |
| **POP3 FBL Status** | Enable or disable POP3 mailbox polling for FBL reports. When enabled, Octeth periodically connects to the configured POP3 mailbox to retrieve and process FBL emails. |
| **POP3 FBL Host** | The hostname of the POP3 mail server where FBL reports are delivered (e.g., `mail.example.com`). |
| **POP3 FBL Port** | The port number for the POP3 connection (typically `110` for plain text or `995` for SSL). |
| **POP3 FBL Username** | The username for authenticating with the POP3 mail server. |
| **POP3 FBL Password** | The password for authenticating with the POP3 mail server. |
| **POP3 FBL SSL** | Enable SSL encryption for the POP3 connection. Enable this if your mail server requires SSL (port 995). |

[[SCREENSHOT: Admin Area Settings Email Delivery page showing the Spam Complaints tab with the Report Abuse Email, X-Complaints-To, FBL Incoming Email Address, and POP3 FBL configuration fields]]

### Configuring POP3 FBL Polling

To set up POP3-based complaint processing:

1. Create a dedicated email address for receiving FBL reports (e.g., `fbl@bounces.example.com`).
2. Register this email address with the ISP feedback loop programs you want to receive complaints from.
3. Navigate to **Admin Area** > **Settings** > **Email Delivery**.
4. Click the **Spam Complaints** tab.
5. Set **POP3 FBL Status** to **Enabled**.
6. Enter the POP3 server hostname, port, username, and password for the FBL mailbox.
7. Enable **SSL** if your mail server requires it.
8. Click **Save**.

Once enabled, Octeth's scheduled task processor will periodically connect to the POP3 mailbox, download any FBL emails, process them, and delete the processed emails from the server.

## Registering for Feedback Loops

To receive spam complaints from email providers, you need to register your sending IP addresses and domains with each provider's feedback loop program. Each provider has its own registration process.

### Major FBL Programs

| Provider | FBL Program | Registration |
|---|---|---|
| **Yahoo / AOL** | Yahoo CFL (Complaint Feedback Loop) | Register through the [Yahoo Postmaster](https://postmaster.yahooinc.com/) portal. Requires DKIM authentication. |
| **Microsoft (Outlook, Hotmail)** | JMRP (Junk Mail Reporting Program) and SNDS | Register through the [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/) portal. |
| **Comcast** | Comcast FBL | Register through the [Comcast Postmaster](https://postmaster.comcast.net/) page. |
| **Google (Gmail)** | Google Postmaster Tools | Gmail does not use traditional FBL. Use [Google Postmaster Tools](https://postmaster.google.com/) to monitor complaint rates and add the `Feedback-ID` header to your emails. |

::: tip
Always authenticate your emails with **DKIM** before registering for feedback loops. Most FBL programs require valid DKIM signatures to match complaints to the correct sender. See the [SPF/DKIM/DMARC](./spf-dkim-dmarc) article for email authentication setup.
:::

::: info
Some FBL programs send reports to a specific email address you designate during registration. Configure this address as the **FBL Incoming Email Address** in Octeth's settings and set up either the email pipe or POP3 polling to process incoming reports.
:::

## Viewing Complaint Statistics

Octeth tracks complaint data at multiple levels — per campaign, per user, and system-wide.

### Campaign Reports

Each campaign report includes a complaint count showing how many recipients filed spam complaints for that specific campaign. Navigate to **Campaigns** > select a campaign > **Reports** to view complaint statistics alongside delivery, open, click, and bounce metrics.

### Admin Overview

The **Admin Area** > **Overview** page displays a ranking of users by total complaint count. This helps administrators identify which user accounts may have list quality issues or are generating an unusually high number of complaints.

### Journey Builder

Complaint events are fully integrated into the Journey Builder. You can use complaint events as conditions in journey workflows:

- **Complained** — Triggers when a subscriber files a spam complaint for a journey email.
- **Not complained** — Triggers when a subscriber has not filed a complaint within a specified period.

This allows you to build automated workflows that respond to complaint events, such as removing complainants from future sequences or flagging accounts for review.

## Manual Complaint Processing

You can manually process complaint records through the **Admin Area** > **Bounce Processing** > **Process** tab. Enter complaint records in the following format, one per line:

```
complaint,user@example.com
```

This is useful for manually processing complaints from external sources that are not connected through the webhook or POP3 integration.

[[SCREENSHOT: Bounce Processing Process tab showing the manual processing text area with complaint record format example]]

## Tips and Best Practices

::: tip Make Unsubscribing Easy
The most effective way to reduce spam complaints is to make unsubscribing effortless. Include a clearly visible unsubscribe link in every email and implement the `List-Unsubscribe` header with one-click unsubscribe support. Many recipients mark emails as spam simply because they cannot find the unsubscribe link.
:::

::: tip Monitor Complaint Rates After Every Campaign
Check your campaign reports for complaint counts. Calculate your complaint rate as complaints divided by total delivered emails. If it exceeds 0.1%, investigate the source of the complaints — are they from a specific list segment, a particular type of content, or a recently imported list?
:::

::: tip Use Double Opt-In to Prevent Complaints
Double opt-in confirmation ensures that every subscriber actively verified their email address and confirmed their subscription. This dramatically reduces complaints because every recipient has explicitly consented to receive emails.
:::

::: tip Set Proper Sending Expectations
When subscribers sign up, clearly communicate what they will receive and how often. If you promise a weekly newsletter, do not send daily promotional emails. Mismatched expectations are a leading cause of spam complaints.
:::

::: tip Register for All Available Feedback Loops
Register your sending domains and IP addresses with every major ISP feedback loop program. The more FBL programs you participate in, the faster you can identify and suppress complainants before they damage your reputation further.
:::

::: tip Segment Inactive Subscribers
Subscribers who have not opened or clicked your emails in several months are more likely to file complaints when they receive unexpected emails. Create segments for inactive subscribers and either re-engage them with a targeted campaign or remove them from regular sends.
:::

## Troubleshooting

### Complaints Are Not Being Processed

1. **Verify the FBL email address** — Confirm that the **FBL Incoming Email Address** in **Admin Area** > **Settings** > **Email Delivery** > **Spam Complaints** matches the address registered with ISP feedback loop programs.
2. **Check POP3 FBL status** — If using POP3 polling, ensure **POP3 FBL Status** is set to **Enabled** and the POP3 server credentials are correct.
3. **Test POP3 connectivity** — Verify that the Octeth server can reach the POP3 mail server on the configured port. Check for firewall rules that may be blocking the connection.
4. **Check the webhook integration** — If using PowerMTA with Logstash, verify that Logstash is running and the FBL filter is active. Check the **Webhooks** tab in the Bounce Processing section for incoming events.
5. **Review system logs** — Check the Octeth system logs for FBL processing errors. Errors during processing are logged with details about what went wrong.

### Complaints Are Received But Subscribers Are Not Being Unsubscribed

1. **Check the X-MessageID header** — FBL reports must contain the original email's `X-MessageID` header for Octeth to identify the subscriber. If the email provider strips this header from the FBL report, Octeth cannot process the complaint automatically.
2. **Verify the email encoding** — Some email providers modify the original email content in FBL reports. If the `X-MessageID` header is altered or corrupted, the decoding step will fail.
3. **Enable FBL notification emails** — Turn on the **SEND_FBL_NOTIFICATIONEMAIL** setting to receive admin notifications when FBL emails cannot be processed. This helps you identify problematic FBL formats.

### High Complaint Rate on Campaigns

1. **Review list acquisition methods** — A high complaint rate typically indicates that recipients did not expect to receive emails. Ensure all subscribers have actively opted in.
2. **Check sending frequency** — Reduce sending frequency if subscribers are complaining about too many emails.
3. **Review email content** — Ensure subject lines accurately reflect the email content and that the content is relevant to the audience.
4. **Implement double opt-in** — Switch subscriber lists to double opt-in to eliminate recipients who did not genuinely subscribe.
5. **Check the suppression list** — Verify that previously complained addresses are in the suppression list and not being re-added through imports. See the [Suppression Lists](./suppression-lists) article.
6. **Segment your audience** — Send more targeted content to specific segments rather than blasting the entire list with the same message.

## Related Features

- **[Bounce Processing](./bounce-processing)** — How bounced emails are processed alongside complaints to protect your sender reputation.
- **[Suppression Lists](./suppression-lists)** — How complained and bounced email addresses are suppressed to prevent future delivery.
- **[Email Sending](./email-sending)** — Configure delivery servers, Mail From domains, and the email delivery pipeline.
- **[Email Tracking](./email-tracking)** — How open and click tracking work with your delivery infrastructure.
- **[SPF/DKIM/DMARC](./spf-dkim-dmarc)** — Email authentication protocols required for FBL registration and deliverability.
- **[Unsubscriptions](./unsubscriptions)** — How unsubscribe requests are handled separately from spam complaints.
