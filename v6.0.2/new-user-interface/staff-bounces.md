# The Staff Bounce Processing Screen

**Bounce processing** shows how this install receives bounces, complaints and unsubscribe requests, and lets you manage the bounce detection patterns, the bounce webhook and the messages kept for manual processing. It replaces the classic admin **Bounce Processing** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Bounce processing | `/user/staff/deliverability/bounces` | Bounce |

Open it from the staff sidebar: click **Delivery**, then **Bounce processing**. The **Bounce Processing** item of the classic admin **Preferences** menu, and the old `/app/admin/bounce/` address, open the same screen.

The screen has five tabs: **Overview**, **Patterns**, **Webhooks**, **Messages** and **Manual processing**. The open tab is part of the address (`?tab=patterns`), so you can bookmark or share it.

The bounce and complaint mailboxes Octeth reads over POP3 or IMAP are not on this screen. They stay on the classic admin **Settings > Email Delivery** page.

::: info
Every reveal of the webhook signature, every message download and delete, every **Process all**, every manual run and every pattern save is recorded in the staff audit log. The log keeps counts and message IDs, never an email address, a pasted line or the content of a message.
:::

## Overview

- **Bounce receiver**: what the bounce SMTP server received in the last 7 days: **Messages received**, **Connections made** and **Received size**, plus the **Open connections** right now.
- **Email gateway feedback**: when the newest **Delivered**, **Bounced** and **Spam complaint** event of email gateway sends arrived, and when the **Bounce webhook** last received a bounce. The exact time is shown under each age. An age that keeps growing while gateway sends continue means the feedback pipeline is broken. **None on record** means nothing has arrived yet. **Unavailable** means the source could not be read.
- **Receiver activity**: messages received and connections made per day for the last 30 days, as a chart and a table. Days run on the server's time.

The figures are read when you open the tab. Click the refresh button at the top right of **Bounce receiver** to read them again, together with the feedback times. The screen does not refresh by itself.

## Patterns

Octeth checks a bounce message against each pattern in order. The first pattern found in the message decides whether the bounce is hard or soft.

Write one pattern per line: the text to look for, then `==>`, then `Hard` or `Soft`:

```text
user unknown==>Hard
mailbox full==>Soft
```

Any type other than `Hard` counts as `Soft`, and blank lines are ignored. A pattern can be at most 255 characters. Click **Save patterns**. A line without `==>`, or with nothing before or after it, is reported with its line number and nothing is saved.

The label at the top right says which list is in use: **Saved patterns in use**, or **Shipped defaults in use** when no pattern was ever saved or the list was emptied.

To go back to the patterns shipped with Octeth, empty the list and click **Save patterns**. The screen asks you to confirm, because the saved patterns are deleted.

::: warning
Patterns decide which addresses Octeth treats as hard bounces, and a hard bounce stops mail to that address. Test a new pattern carefully.
:::

## Webhooks

Async bounces, the ones that come back to the bounce address as email, reach Octeth by themselves. Sync bounces, the ones your mail server receives while it delivers, must be posted to Octeth by the mail server. The bounce webhook is where it posts them.

- **Bounce webhook requests**: the bounces the webhook received per day for the last 30 days, split into hard bounces, soft bounces and unidentified ones.
- **Webhook configuration**: whether authentication is on, the **Webhook URL** with a copy button, and the **Signature** the sender must send in the `X-Octeth-Signature` header.

### Authentication and the signature

When `BOUNCE_WEBHOOK_AUTH_ENABLED=true` is set in `.oempro_env`, the webhook refuses a request without the right signature with HTTP 401. When it is off, the screen says so in a warning, and the webhook accepts any request.

The signature is masked. Click **Reveal** to show it and the **Copy** button. It is hidden again as soon as you do anything else on the screen. Each reveal is recorded in the staff audit log.

::: warning
The signature is derived from the install's `ADMIN_API_KEY`. To change it, rotate `ADMIN_API_KEY`, and then update every bounce sender, because their old signature stops working.
:::

When the screen says the signature cannot be derived, `OEMPRO_PASSWORD_SALT` or `ADMIN_API_KEY` is not set. Set both before you turn authentication on.

### Sender configuration for PowerMTA

The **Logstash pipeline** card holds a Logstash configuration that reads PowerMTA's bounce accounting files and posts every bounce to the webhook, with the signature header. Until you reveal the signature it shows `SIGNATURE_SECRET_PLACEHOLDER` in its place, so reveal it first and then copy the pipeline.

The **PowerMTA accounting** card holds the directives to add to `/etc/pmta/config`, so PowerMTA writes the files the pipeline reads.

For fluentd, use the same webhook URL ending in `?type=fluentd` and send the same header.

## Messages

Mail sent to the receiver's system addresses (`root@`, `postmaster@`, `abuse@` and similar) that was not processed on arrival waits here. The tab label shows how many messages are waiting once you have opened it.

Each row shows when the message arrived, its sender and recipient, and its size.

- **Download** (arrow icon) saves the message as an `.eml` file you can open in an email program.
- **Delete** (bin icon) removes the message without processing it. The screen asks you to confirm, and a deleted message cannot be recovered.
- **Process all** runs every message through bounce processing, which marks bounced addresses, records complaints and opts out unsubscribe requests. The screen asks you to confirm. A message that was processed is removed from the list. A message that could not be processed stays, so you can download it or delete it, and the screen says how many were processed.

Processing runs 25 messages at a time while the page is open, with a line such as "Processed 75 of 210 messages" and a **Stop** button above the tabs. **Stop** ends the run after the batch that is running, and the messages not yet processed stay in the list. A message that fails is not tried again in the same run. Keep the page open until it finishes.

## Manual processing

Paste bounce, complaint and opt-out data, one entry per line:

```text
bounce,bounce-120812-3822188-30440-3512@example.com,Hard
complaint,someone@example.com
optout,unsubscribe:198-gpt-aGFyZHdpY2twY0B5YWhvby5jb20=-vv-s7-rs
```

- `bounce,<bounce address>,<Hard or Soft>` records a bounce for the address Octeth sent to.
- `complaint,<email address>` records a spam complaint.
- `optout,<unsubscribe subject>` opts out the subscriber the subject names.

Click **Process lines**. The screen counts the bounces, complaints and opt-outs it found, names the lines it will skip, and asks you to confirm. Each line changes subscribers at once and cannot be undone. The lines are sent 500 at a time, with a progress line and a **Stop** button. When it finishes, the screen shows what was applied and empties the box. When you stop it, the lines not yet sent are left in the box, so you can process them later without applying any line twice.

Blank lines are ignored. A line in any other format is skipped. If you change the lines while the confirmation is open, nothing is processed and the screen asks you to start again. The box cannot be edited while the lines are being processed.
