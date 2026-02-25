---
layout: doc
---

# Bounce Processing

When you send an email to a recipient, the email may not always reach the destination inbox. The recipient's email address might be invalid, their mailbox could be full, or the receiving mail server might reject the message for another reason. When this happens, the receiving server sends a notification back — this notification is called a **bounce**. Bounce processing is the system that detects these failed deliveries, classifies them, and takes action to protect your sending reputation.

This article covers what bounces are, why they matter, how Octeth processes them, how to configure bounce handling, and how to integrate with third-party mail transfer agents (MTAs) like PowerMTA.

## Why Bounce Processing Matters

Your **sender reputation** is the single most important factor in email deliverability. Internet service providers (ISPs) and receiving mail servers track how many of your emails bounce. Repeatedly sending to invalid email addresses signals poor list hygiene and damages your reputation over time.

The consequences of ignoring bounces include:

- Lower inbox placement rates — more of your emails land in spam folders
- Increased rejections by receiving mail servers
- Potential blacklisting of your sending IP addresses or domains
- Reduced open and click rates across all campaigns

Bounce processing automatically removes invalid email addresses from your subscriber lists so you stop sending to them. This keeps your lists clean and protects your long-term sending reputation.

::: danger
If your bounce rate consistently exceeds 2–3%, receiving mail servers may begin rejecting your email outright. Set up bounce processing before sending any campaigns and monitor your bounce rates regularly.
:::

## Types of Bounces

Bounced emails fall into two categories based on the severity and permanence of the delivery failure.

### Hard Bounces (Permanent Failures)

A hard bounce means the delivery failure is permanent and there is no reason to attempt delivery again. Hard bounces return a `5.x.x` DSN (Delivery Status Notification) code as defined in [RFC 3463](https://datatracker.ietf.org/doc/html/rfc3463).

Common causes of hard bounces:

| Cause | Example |
|---|---|
| **Invalid email address** | The recipient address does not exist on the mail server. |
| **Invalid domain** | The recipient domain has no MX (mail exchange) DNS records. |
| **Account closed** | The recipient's mailbox has been permanently removed. |
| **Blacklisting** | The receiving server rejected the message due to sender reputation. |

::: warning
Hard bounced email addresses should be removed from your lists immediately. Octeth automatically suppresses hard bounced addresses to prevent further delivery attempts.
:::

### Soft Bounces (Temporary Failures)

A soft bounce means the delivery failed temporarily. The problem may resolve on its own, and a future delivery attempt could succeed. Soft bounces return a `4.x.x` DSN code.

Common causes of soft bounces:

| Cause | Example |
|---|---|
| **Mailbox full** | The recipient's mailbox has exceeded its storage quota. |
| **Server temporarily unavailable** | The receiving mail server is experiencing a temporary outage. |
| **Message too large** | The email exceeds the recipient server's size limit. |
| **Temporary DNS failure** | The domain's DNS records could not be resolved at that moment. |
| **Content or policy rejection** | The email was rejected by a spam or content filter. |

Octeth does not immediately suppress soft-bounced addresses because the issue may resolve. However, if the same address soft bounces repeatedly, Octeth escalates it to a hard bounce to protect your reputation.

## How Bounce Processing Works

Bounces occur through two different mechanisms depending on when the receiving mail server reports the failure.

### Synchronous Bounces

A synchronous bounce happens during the SMTP conversation between your sending server and the receiving server. When your MTA connects to deliver an email, the receiving server immediately responds with a rejection code. Your MTA knows right away that the delivery failed.

**Example flow:**

1. Your MTA connects to the recipient's mail server.
2. Your MTA sends the recipient address.
3. The receiving server responds: `550 5.1.1 User unknown`.
4. Your MTA records this as a synchronous bounce.

Synchronous bounces are the most common type and provide immediate feedback. They are processed through the **webhook integration** between your MTA and Octeth.

### Asynchronous Bounces

An asynchronous bounce happens after the receiving server initially accepts the email. The server returns a `2.x.x` success code during the SMTP conversation, but later sends a separate DSN email back to the sender address reporting the failure.

**Example flow:**

1. Your MTA connects to the recipient's mail server.
2. The receiving server accepts the email with `250 OK`.
3. Minutes or hours later, the receiving server discovers a problem (e.g., the internal mailbox does not exist).
4. The receiving server sends a DSN email to the return-path address.
5. Your MTA receives the DSN email and logs it as an asynchronous bounce.

Most modern MTAs like PowerMTA capture both synchronous and asynchronous bounces in their accounting logs. When you integrate your MTA with Octeth's bounce webhook, both bounce types are forwarded to Octeth for processing.

[[SCREENSHOT: Diagram showing synchronous bounce (immediate rejection during SMTP handshake) and asynchronous bounce (acceptance followed by a later DSN email)]]

## Soft-to-Hard Bounce Threshold

To prevent ongoing delivery attempts to consistently failing addresses, Octeth converts soft bounces to hard bounces when a threshold is reached. The default threshold is **3** — meaning if the same email address soft bounces three or more times, Octeth treats it as a hard bounce and suppresses the address.

You can adjust this threshold in **Admin Area** > **Settings** > **Email Delivery**, in the **Soft Bounce Threshold** field.

::: tip
A threshold of 3 works well for most sending operations. Setting it lower (e.g., 1 or 2) is more aggressive and removes addresses faster. Setting it higher (e.g., 5 or more) gives addresses more chances but risks your reputation if addresses are genuinely invalid.
:::

## What Happens When a Bounce Is Processed

When Octeth detects a bounce — whether synchronous or asynchronous — it follows a multi-step process:

1. **Parse the bounce notification** — Extract the recipient email address, DSN code, and diagnostic message from the bounce report.
2. **Identify the subscriber** — Match the bounced address to a specific subscriber, subscriber list, campaign (or autoresponder), and user account.
3. **Classify the bounce** — Compare the diagnostic message against the bounce pattern database to determine whether it is a hard or soft bounce.
4. **Check the soft-to-hard threshold** — For soft bounces, check the subscriber's bounce history. If the count exceeds the threshold, escalate to hard bounce.
5. **Update the subscriber record** — Set the subscriber's bounce status to `Hard` or `Soft`.
6. **Add to suppression list** — For hard bounces, add the email address to the global suppression list to prevent future delivery.
7. **Update campaign statistics** — Increment the campaign's hard bounce or soft bounce counter.
8. **Log the activity** — Record the bounce in the subscriber's activity history and the system bounce statistics.

::: info
Hard bounced email addresses are automatically added to the global suppression list. Even if the same address is added to a new subscriber list in the future, Octeth checks the suppression list before sending and skips suppressed addresses. For more details, see the [Suppression Lists](./suppression-lists) article.
:::

## Bounce Pattern Matching

When Octeth receives a bounce notification, it needs to determine whether the bounce is hard or soft. It does this by scanning the DSN message text against a database of known patterns.

Octeth ships with over 600 built-in patterns that cover the most common bounce responses from major email providers. Each pattern is associated with a classification — either `Hard` or `Soft`.

**Examples of hard bounce patterns:**

| Pattern | Classification |
|---|---|
| `User unknown` | Hard |
| `No such user` | Hard |
| `mailbox unavailable` | Hard |
| `account closed` | Hard |
| `Recipient address rejected` | Hard |
| `550 5.1.1` | Hard |

**Examples of soft bounce patterns:**

| Pattern | Classification |
|---|---|
| `quota exceeded` | Soft |
| `mailbox is full` | Soft |
| `temporarily deferred` | Soft |
| `Connection timed out` | Soft |
| `Resources temporarily unavailable` | Soft |
| `Blocked by policy` | Soft |

### Managing Bounce Patterns

You can view and customize bounce patterns in **Admin Area** > **Bounce Processing** > **Patterns** tab.

Patterns use the format:

```
pattern text==>Hard
pattern text==>Soft
```

Each line contains a pattern on the left side, followed by `==>`, followed by the classification (`Hard` or `Soft`). One pattern per line.

**Example:**

```
User unknown==>Hard
No such user==>Hard
mailbox is full==>Soft
quota exceeded==>Soft
```

To add a custom pattern:

1. Navigate to **Admin Area** > **Bounce Processing**.
2. Click the **Patterns** tab.
3. Add your new pattern lines to the editor.
4. Click **Save**.

[[SCREENSHOT: Bounce Processing page showing the Patterns tab with the pattern editor containing multiple bounce patterns in the format pattern==>Hard or pattern==>Soft]]

::: tip
If you notice bounces being classified incorrectly or new bounce responses from specific email providers not being detected, add custom patterns to improve classification accuracy.
:::

## Setting Up Bounce Processing

Octeth processes bounces through a **webhook endpoint** that receives bounce data from your MTA (mail transfer agent). Your MTA captures both synchronous and asynchronous bounces during email delivery and forwards them to Octeth via HTTP POST requests.

The webhook endpoint URL is:

```
https://<your-octeth-domain>/system/bounce_webhook
```

The setup involves two parts:

1. **Configure your MTA** to log bounce events to accounting files or event hooks.
2. **Forward bounce data** from your MTA to Octeth's webhook endpoint using a log-forwarding tool like Logstash or Fluentd.

The integration method depends on which MTA you are using. See the [Integrating with Third-Party MTAs](#integrating-with-third-party-mtas) section below for detailed setup instructions.

## Monitoring Bounce Processing

The **Admin Area** > **Bounce Processing** page provides several tools for monitoring bounce activity.

### Statistics Tab

The **Statistics** tab shows a summary of bounce processing activity over the last 30 days. A chart displays daily bounce volume and connection counts, giving you a quick overview of bounce trends.

[[SCREENSHOT: Bounce Processing Statistics tab showing the 30-day activity chart with daily bounce volume]]

### Webhooks Tab

The **Webhooks** tab shows bounce statistics from the webhook integration with your MTA:

- **Hard Bounces** — Total hard bounces received via webhook.
- **Soft Bounces** — Total soft bounces received via webhook.
- **Unidentified** — Bounces that could not be classified.

A 30-day chart breaks down webhook bounce volume by type. This tab also provides configuration templates for setting up MTA integrations.

[[SCREENSHOT: Bounce Processing Webhooks tab showing the 30-day bounce webhook chart with hard bounces, soft bounces, and unidentified bounces]]

### Patterns Tab

The **Patterns** tab provides an editor for managing bounce pattern rules. See the [Bounce Pattern Matching](#bounce-pattern-matching) section for details on how patterns work and how to customize them.

### Process Tab

The **Process** tab provides a manual bounce processing interface. You can submit bounce, complaint, or opt-out records directly, one per line, in this format:

```
bounce,bounce-id@example.com,Hard
bounce,bounce-id@example.com,Soft
complaint,user@example.com
optout,unsubscribe-token
```

This is useful for manually processing bounces from external sources that are not connected through the webhook integration.

[[SCREENSHOT: Bounce Processing Process tab showing the manual processing text area with example input format]]

## Integrating with Third-Party MTAs

When using an external MTA (mail transfer agent) to deliver your emails, you need to configure the MTA to report bounce information back to Octeth. This section covers integration with popular MTAs.

### PowerMTA Integration

[PowerMTA](https://www.sparkpost.com/powermta/) is a high-performance MTA commonly used for large-scale email delivery. The integration uses PowerMTA's accounting files and [Logstash](https://www.elastic.co/logstash) to forward bounce data to Octeth's webhook endpoint.

#### Step 1: Configure PowerMTA Accounting Files

Edit your PowerMTA configuration file (typically `/etc/pmta/config`) and add the following accounting file directives:

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

This tells PowerMTA to log:

- **`b` records** — Synchronous bounces with full details including DSN status and bounce category.
- **`rb` records** — Asynchronous bounces reported back by receiving servers.
- **`f` records** — Feedback loop (complaint) reports from ISPs.

Reload your PowerMTA configuration to apply the changes:

```bash
pmta reload
```

#### Step 2: Install and Configure Logstash

Install [Logstash](https://www.elastic.co/logstash) on your PowerMTA server. Logstash monitors the PowerMTA accounting files and forwards bounce events to Octeth's webhook endpoint in real time.

Create a Logstash pipeline configuration file (e.g., `/etc/logstash/conf.d/pmta-bounces.conf`) with the following content:

```
####################################
## PowerMTA Logstash Configuration
##
## Octeth, Inc.
##
####################################

# ------------------
# Input
# ------------------
input {
    file {
        type => "pmta"
        tags => "pmta"
        mode => "tail"
        sincedb_path => "/var/log/logstash/sincedb_pmta_logs.db"
        sincedb_write_interval => 5
        ignore_older => 0
        path => [ "/var/log/pmta/bounces-*.csv" ]
    }
}

# ------------------
# Filter
# ------------------
filter {
    # High level filtering
    if [type] == "pmta" {
        if ([message] =~ "^(d),") {
            drop {}
        } else if ([message] =~ "^(b),") {
            csv {
                source => "message"
                columns => [
                    "logType", "timeQueued", "timeLogged", "orig",
                    "rcpt", "bounceCat", "dsnStatus", "dsnAction",
                    "dsnDiag", "dsnMta", "jobId", "vmta",
                    "header_X-FBLId"
                ]
                separator => ","
                add_tag => [ "pmta_sync_bounce" ]
                skip_empty_columns => true
            }
        } else if ([message] =~ "^(rb),") {
            csv {
                source => "message"
                columns => [
                    "logType", "timeLogged", "orig", "rcpt",
                    "bounceCat", "dsnStatus", "dsnAction",
                    "dsnDiag", "dsnMta", "header_X-FBLId"
                ]
                separator => ","
                add_tag => [ "pmta_async_bounce" ]
                skip_empty_columns => true
            }
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
        } else if ([message] =~ "^(t),") {
            drop {}
        } else if ([message] =~ "^(tq),") {
            drop {}
        }
    } else {
        drop {}
    }
}

# ------------------
# Output
# ------------------
output {
    http {
        url => "https://octeth.example.com/system/bounce_webhook?type=pmta"
        http_method => "post"
    }
}
```

::: warning
Replace `octeth.example.com` in the output URL with your actual Octeth server domain. The URL must be reachable from your PowerMTA server over HTTPS.
:::

#### Step 3: Start Logstash

Start the Logstash service:

```bash
systemctl start logstash
```

Logstash will begin monitoring the PowerMTA accounting files and forwarding bounce events to Octeth. Each time PowerMTA logs a bounce, Logstash parses the CSV entry, extracts the bounce details, and sends them to Octeth's bounce webhook.

#### How the PowerMTA Data Flow Works

The complete data flow for PowerMTA integration:

1. **Email is sent** — PowerMTA delivers the email to the recipient's mail server.
2. **Bounce occurs** — The recipient server rejects the email (sync bounce) or sends a DSN email later (async bounce).
3. **PowerMTA logs the event** — The bounce is written to `/var/log/pmta/bounces.csv` with the record type, recipient address, DSN status, and bounce category.
4. **Logstash detects the new log entry** — Logstash tails the accounting file in real time.
5. **Logstash sends to Octeth** — The parsed bounce data is POSTed to the Octeth bounce webhook endpoint.
6. **Octeth processes the bounce** — The webhook handler registers the bounce through the internal API, updates the subscriber status, and records statistics.

PowerMTA uses the following record types in its accounting files:

| Record Type | Description |
|---|---|
| `b` | Synchronous bounce — delivery rejected during the SMTP conversation. |
| `rb` | Asynchronous bounce — DSN email received after initial acceptance. |
| `d` | Delivered — email was successfully delivered (ignored by Logstash). |
| `f` | Feedback loop — ISP complaint report (handled separately). |
| `t` | Transient — temporary status (ignored by Logstash). |
| `tq` | Transient queue — temporary queue status (ignored by Logstash). |

### Integrating with Other MTAs

If you use an MTA other than PowerMTA, you can integrate with Octeth's bounce webhook using the same general approach:

1. **Configure your MTA to log bounce events** — Most MTAs support bounce logging to files, databases, or event hooks.
2. **Forward bounce data to Octeth's webhook** — Send an HTTP POST request to `https://<your-octeth-domain>/system/bounce_webhook?type=pmta` with the bounce details.

The webhook endpoint accepts the following parameters:

| Parameter | Description |
|---|---|
| `type` | Data source type. Use `pmta` for direct bounce submissions. |
| `orig` | The original sender (return-path/MFROM) email address. |
| `rcpt` | The recipient email address that bounced. |
| `bounceCat` | The bounce category from your MTA (e.g., `bad-mailbox`, `inactive-mailbox`, `bad-domain`). |
| `dsnStatus` | The DSN status code (e.g., `5.1.1`, `4.2.2`). |
| `dsnAction` | The DSN action (e.g., `failed`, `transient`). |
| `logType` | The log type (`b` for sync bounce, `rb` for async bounce). |
| `timeLogged` | Timestamp when the bounce was logged. |
| `timeQueued` | Timestamp when the original email was queued (sync bounces only). |

**Example HTTP request:**

```bash
curl -X POST "https://octeth.example.com/system/bounce_webhook?type=pmta" \
  -d "orig=bounce-123@bounces.example.com" \
  -d "rcpt=invalid-user@example.org" \
  -d "bounceCat=bad-mailbox" \
  -d "dsnStatus=5.1.1" \
  -d "dsnAction=failed" \
  -d "logType=b" \
  -d "timeLogged=2026-01-15 10:30:00"
```

::: tip
You can use any log-forwarding tool to send bounce data to Octeth — not just Logstash. Tools like [Fluentd](https://www.fluentd.org/), [Filebeat](https://www.elastic.co/beats/filebeat), or a custom script can monitor your MTA's bounce logs and POST the data to the webhook endpoint.
:::

::: info
Octeth also supports Fluentd as a native data source. To use Fluentd, set the `type` parameter to `fluentd` and send the full bounce payload as a JSON array. Fluentd payloads are queued via RabbitMQ for asynchronous processing.
:::

## Administrator Email Delivery Settings

Several bounce-related settings are available in the **Admin Area** > **Settings** > **Email Delivery** page:

| Setting | Description |
|---|---|
| **Bounce Catch-All Domain** | The domain used as the fallback bounce address in email headers. This should match your primary Mail From domain. |
| **Soft Bounce Threshold** | The number of soft bounces before an address is escalated to hard bounce. Default: `3`. |
| **Bounce Forward To** | An optional email address where all incoming bounce emails are forwarded for external monitoring or archival. |
| **Bounce Notification Emails** | When enabled, Octeth sends notification emails to the administrator when unrecognized bounce patterns are detected. This helps you identify new patterns to add. |

[[SCREENSHOT: Email Delivery settings page showing the bounce-related fields: Bounce Catch-All Domain and Soft Bounce Threshold]]

## Tips and Best Practices

::: tip Monitor Your Bounce Rate After Every Campaign
Check your campaign reports for the hard bounce and soft bounce counts. A hard bounce rate above 2% on a single campaign suggests list quality issues. Investigate where those addresses came from and consider implementing double opt-in for future subscriptions.
:::

::: tip Use Double Opt-In to Prevent Bounces
Double opt-in confirmation requires subscribers to verify their email address before being added to your list. This eliminates typos, fake addresses, and invalid domains from ever entering your list — dramatically reducing bounce rates.
:::

::: tip Review Bounce Webhook Statistics Regularly
Check the **Webhooks** tab in the Bounce Processing section periodically. If you see a high number of unidentified bounces, review the bounce responses and add new patterns to improve detection accuracy.
:::

::: tip Ensure Your MTA Reports Both Sync and Async Bounces
Most MTAs like PowerMTA capture both synchronous bounces (immediate rejections) and asynchronous bounces (delayed DSN emails) in their accounting logs. Ensure your MTA integration forwards both types for comprehensive bounce coverage.
:::

::: tip Keep Bounce Patterns Updated
Email providers occasionally change their bounce response messages. If you notice a new bounce format that is not being classified, add it as a custom pattern. This keeps your classification accuracy high.
:::

## Troubleshooting

### Bounces Are Not Being Processed

1. **Verify the webhook URL** — Confirm your MTA or Logstash is sending to the correct URL: `https://<your-octeth-domain>/system/bounce_webhook?type=pmta`.
2. **Check network connectivity** — Ensure your MTA server can reach the Octeth server over HTTPS.
3. **Check Logstash status** — If using Logstash, verify it is running: `systemctl status logstash`. Check the Logstash logs for errors.
4. **Review webhook statistics** — Check the **Webhooks** tab in the Bounce Processing section. If the chart shows zero activity, the webhook is not receiving data.

### Bounces Are Not Being Classified Correctly

1. **Check the bounce patterns** — Review the **Patterns** tab to ensure the relevant pattern exists. If a specific bounce response is being misclassified, add or update the pattern.
2. **Check the MTA bounce category** — Your MTA may provide its own bounce classification (e.g., PowerMTA's `bounceCat` field). Verify that the category mapping aligns with Octeth's hard/soft classification.
3. **Enable bounce notification emails** — Turn on bounce notifications in **Settings** > **Email Delivery** so you are alerted when unrecognized bounce formats are received.

### High Bounce Rate on Campaigns

1. **Check list quality** — A high bounce rate typically indicates poor list hygiene. Remove subscribers who have not engaged in over 12 months.
2. **Enable double opt-in** — Switch your subscriber lists to double opt-in to prevent invalid addresses from being added.
3. **Review the suppression list** — Verify that previously hard-bounced addresses are in the suppression list and not being re-added. See the [Suppression Lists](./suppression-lists) article.
4. **Check the soft-to-hard threshold** — If soft bounces are accumulating without being escalated, review the threshold setting in **Admin Area** > **Settings** > **Email Delivery**.

## Related Features

- **[Email Sending](./email-sending)** — Configure delivery servers, Mail From domains, and the email delivery pipeline that generates bounces.
- **[Suppression Lists](./suppression-lists)** — How hard bounced addresses are suppressed to prevent future delivery.
- **[Complaint Processing](./complaint-processing)** — How spam complaints (feedback loops) from ISPs are processed alongside bounces.
- **[Email Tracking](./email-tracking)** — How open and click tracking work with your delivery infrastructure.
- **[SPF/DKIM/DMARC](./spf-dkim-dmarc)** — Email authentication protocols that affect deliverability and bounce rates.
- **[Unsubscriptions](./unsubscriptions)** — How unsubscribe requests are handled separately from bounces.
