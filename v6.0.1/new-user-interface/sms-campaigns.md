---
layout: doc
---

# SMS Campaigns

An SMS campaign sends one text message to everyone on a list, or to the contacts on that list who match your conditions. You write the message, check what it will cost, and send it straight away or at a time you choose. The report then shows deliveries, clicks, replies, opt-outs and spend.

SMS campaigns live in the [new user interface](./). Journeys can also send SMS automatically: see [SMS Messages](../using-octeth/sms-messages).

## Before you start

You need:

1. **An SMS gateway** available to your account. An administrator sets these up, for example a [Xeebi gateway](../using-octeth/sms-gateways/xeebi).
2. **A list with a mobile number field.** Open the list, go to **Settings** > **SMS**, choose the **Mobile number field** and save. The list then shows **Ready for SMS**.
3. **SMS turned on for the installation.** Two switches control this:

| Switch | Where | Default | When it is off |
|---|---|---|---|
| `BRAND_FEATURE_SMS` | Environment of the new interface | On (off when `UI_MODE=gateway`) | The **SMS** menu, the **Bulk SMS campaign** item and **Suppressions** > **SMS** are hidden, and their pages return "not found". |
| `SMS_CAMPAIGN_ENABLED` | `.oempro_env` | `true` | Octeth refuses every SMS campaign request with "Bulk SMS is disabled on this installation", and campaigns that are sending stop releasing messages. They are not cancelled. Journey SMS keeps working. |

## Where to find SMS campaigns

- **New campaign** > **Bulk SMS campaign** in the top bar starts a new campaign.
- **SMS** > **Campaigns** in the left menu lists your campaigns.
- **SMS** > **Replies** shows the messages people text back.

[[SCREENSHOT: The New campaign menu in the top bar with the Bulk SMS campaign item]]

## Creating a campaign

1. Click **New campaign** > **Bulk SMS campaign**.
2. Enter a **Campaign name**. Only you see it.
3. In **Send to**, choose the list.
4. Choose the audience:
   - Keep **Everyone on this list**, or
   - Click **Add conditions** and build rules, then click **Done with conditions**. Use **Match** to choose **All rule groups** or **Any rule group**. To send to a saved segment, add a rule of the **Segment** type.
5. In **Send through**, choose the gateway. Gateways shared by your administrator show `(shared)` after their name.
6. Write the **Message**. Type two opening braces, `{{`, to insert a field from the list.
7. Click **Continue**.

The audience box shows a recipient count "before invalid, suppressed and duplicate numbers are removed". If the audience is larger than one campaign may send to, the box says so and the campaign cannot go out. The limit is set by your administrator (1,000,000 by default).

Clicking **Continue** saves the campaign as a **Draft** and opens the editor. Nothing is sent yet.

[[SCREENSHOT: New SMS campaign screen with Campaign name, Send to, the audience box, Send through and Message]]

## Writing the message

The editor has a **Recipients** card and a **Message** card. Click **Edit recipients** to change the audience while the campaign is a draft.

| Field | What it does |
|---|---|
| **Campaign name** | Your own label. Recipients never see it. |
| **Send through** | The gateway. Changing it means running the cost estimate again. |
| **Sender ID** | The number the message appears to come from. If the gateway lists sender numbers, pick one. Leave it on **Gateway default** to use the gateway's own default. |
| **Message** | The text that arrives on the phone. |
| **Links stop working after** | Appears only when the message contains a link. Enter a number and choose **hours** or **days**. Leave it blank for the default of 72 hours. The maximum is 8,760 hours (one year). |
| **Append an opt-out line** | On by default. Adds the **Opt-out line** to the end of the message. |
| **Opt-out line** | The text added when the toggle is on. The default is `Reply STOP to opt out.` |

Click **Save message** when you are done.

### Character count and parts

Under the message, Octeth shows the character count, the number of SMS parts and the encoding, for example `142 characters · 1 part · GSM7`. The count includes the opt-out line.

- A **GSM7** message fits 160 characters in one part, and 153 per part above that.
- One character outside the GSM alphabet, such as an emoji or many accented letters, switches the whole message to **UCS2**: 70 characters in one part, and 67 per part above that.

Each part is billed, so a shorter message costs less. See [SMS Message Encoding](../using-octeth/sms-messages#sms-message-encoding).

### Personalizing the message

Type `{{` in the message to open the list of fields, grouped as Standard, Global and Custom. Choosing one inserts a merge tag such as <code v-pre>{{ Subscriber:FirstName }}</code>.

Add a fallback for contacts with no value:

```text
Hi {{ Subscriber:FirstName | "there" }}, our spring sale starts Friday.
```

### The opt-out line

Recipients must be able to stop your messages, so keep **Append an opt-out line** on. The line counts towards the message length and the cost.

::: warning Do not leave the opt-out line empty
If the toggle is on but the **Opt-out line** field is empty, no opt-out line is added to the message. Keep the default wording or write your own.
:::

## Checking the cost

Nothing can be sent until the campaign has been costed and you have seen the figure.

1. Save the message.
2. In the **Cost** card, click **Estimate cost**. On a large list this can take a few minutes.
3. Read the result: the total cost, the number of recipients and message parts, and the **Not being sent to** breakdown.

| Not being sent to | Meaning |
|---|---|
| **Invalid numbers** | Not a valid phone number. |
| **Duplicates** | The same number as another recipient. Each number gets the message once. |
| **Suppressed** | On a suppression list. |
| **Over the frequency cap** | The contact has already received the most SMS messages allowed for the period. |
| **Forbidden word** | The message contains a word your administrator has blocked. |
| **Message too long** | The personalized message has more parts than the gateway allows. |

The price is held for 15 minutes. After that, or after you edit the message or change the gateway, click **Re-estimate** before sending.

[[SCREENSHOT: Cost card showing the estimated cost, recipients, message parts and the Not being sent to breakdown]]

## Sending or scheduling

Once a current estimate is shown, the send controls appear:

- Click **Send now** to start sending.
- Or choose a date and time, choose the timezone that time is in, and click **Schedule**. The timezone starts on your account's timezone. The time must be in the future.

Both open the campaign report.

### Quiet hours

Octeth does not send campaign messages during quiet hours. By default these run from **21:00 to 09:00** in the campaign's timezone. Messages due during quiet hours wait and go out when the quiet hours end. The campaign stays in **Sending**, and its report shows **Paused for quiet hours** with the time sending resumes.

Quiet hours are set for the whole installation by your administrator. See [Bulk SMS Settings for administrators](#bulk-sms-settings-for-administrators).

## Managing campaigns

**SMS** > **Campaigns** shows totals for the selected date range (sent, delivery rate, click rate, opt-out rate and spend) and a table of campaigns. Filter by status in the left rail and by date with the date picker.

| Status | Meaning |
|---|---|
| **Draft** | Being written. Only drafts can be edited. |
| **Scheduled** | Waiting for its send time. |
| **Queueing** | Building the list of recipients. |
| **Sending** | Messages are going out. |
| **Paused** | Stopped for now. It can be resumed. |
| **Cancelling** / **Cancelled** | Being stopped / stopped for good. |
| **Sent** | Finished. |
| **Failed** | Could not be sent, for example because the list has no phone number field or the audience is over the limit. |

A campaign can also be paused automatically, for example "Paused: the cost changed after it was approved", when the real cost moves too far from the estimate.

Row actions:

- **Edit campaign**: drafts only.
- **Pause sending** and **Resume sending**. Resumed recipients are charged at the rate the campaign was costed at.
- **Duplicate campaign**: creates a new draft with the same content.
- **Cancel campaign**: stops the send for good. Messages already delivered stay delivered and are still charged, and the campaign cannot be restarted.

::: tip
To send a changed message after a campaign is scheduled, cancel it, duplicate it, and edit the copy.
:::

## Reading the report

Click a campaign that is not a draft to open its report.

[[SCREENSHOT: SMS campaign report with the funnel, Delivery over time chart and recipient tabs]]

- **Funnel:** Audience, Queued, Sent, Delivered, Clicked, Replied, Opted out.
- **Undelivered**, **Send failures** and **Cost** cards.
- **Delivery over time:** a chart by minute, hour or day, per interval or cumulative.
- **Why undelivered**, **Carriers** and **Most-clicked links**.
- **Recipients:** tabs for **All**, **Delivered**, **Failed**, **Suppressed**, **Clicked**, **Replied** and **Opted out**, with each number's status, reason, parts and cost.

### Why a recipient was skipped

| Reason shown | Meaning |
|---|---|
| On the suppression list when the campaign was queued | The number was suppressed. |
| Not a valid phone number | The stored number could not be used. |
| Same number as another recipient | A duplicate. The other contact received the message. |
| Frequency cap reached | The contact reached the SMS frequency limit. |
| The message could not be personalized | A merge tag could not be filled in. |
| The message was too long | The personalized message had too many parts. |
| The message contained a blocked word | A forbidden word was found. |

### Report actions

- **Pause**, **Resume** and **Stop sending** work as in the campaign list.
- **Duplicate** creates a new draft. If the original gateway is no longer available, choose a new one before sending.
- **Delete** is available for draft, sent, cancelled and failed campaigns. Type the campaign name to confirm. This cannot be undone, and the report is removed too.
- **Export** builds a CSV of every send, delivery, click, reply and opt-out. Click **Start export**, then **Download CSV**. Each row carries the event time and type, recipient number, sender ID, parts, cost, gateway status and error, carrier, country, the clicked URL and whether the click came from a bot.

## Replies

**SMS** > **Replies** lists everything people text back, newest first, including opt-outs.

- Use the left rail to show **All replies**, **Opt-outs**, **Failed opt-outs** or **Unattributed** replies.
- Pick a date range. The default is the last 30 days.
- Search by phone number. Enter at least 3 digits.
- Untick **Include unattributed** to hide replies that Octeth could not match to a message you sent.

Each reply shows who sent it, the message with a **View campaign** link, when it arrived and its state, such as **Opted out**.

::: tip
A sudden run of unattributed replies usually means attribution is broken, for example a gateway's callback URLs are wrong, rather than that strangers are texting in.
:::

## SMS-only lists

A list of phone contacts with no email addresses can be marked as an SMS-only list.

1. Open the list and go to **Settings** > **SMS**.
2. Choose the **Mobile number field** and save.
3. In the **SMS-only list** card, click **Mark as SMS-only** and confirm.

Limits:

- The list can hold at most 100,000 contacts when you mark it, and none of them may have a real email address.
- On an SMS-only list the mobile number field cannot be changed. Turn SMS-only off first.

**Importing into an SMS-only list:** map the column that holds the phone number to **Mobile number (SMS)**. The list does not need an email column and does not accept one. Octeth maps the first phone-looking column for you.

**Finding a contact by number:** in the list's subscriber search, enter at least 6 digits. Spaces, `+`, brackets and dashes are ignored, so `+1 (555) 010-0100` finds the contact. Shorter searches are matched exactly as typed.

## Segmenting by SMS activity

Segments and campaign conditions can use the **SMS activity** rule to target contacts by what they did with your SMS campaigns.

| Part | Options |
|---|---|
| Activity | Was sent, Was not sent, Delivered, Not delivered, Failed, Not failed, Clicked, Not clicked, Replied, Not replied, Opted out, Not opted out |
| Campaign | **Any SMS** or one specific campaign |
| When | Any time, In the last X days, Not in the last X days, After date, Before date. Between dates and Not between dates need a specific campaign. |
| How often | With **Any SMS** and no time filter: Any number of times, At least, At most or Exactly N times. Not available for the opt-out activities. |

The rule is available in the new interface's segment builder and in the SMS campaign conditions. It is not available in the classic interface's segment builder or in journey decisions.

::: info
If a campaign's per-recipient detail has expired, or the campaign was deleted, a rule that names it matches nobody, and the builder shows a warning.
:::

## Bulk SMS Settings for administrators

Administrators set the defaults for every SMS campaign in the classic admin area under **Preferences** > **System Settings** > **Bulk SMS Settings**.

Each value is either stored on this page or taken from `.oempro_env`. Clear a field to hand the setting back to `.oempro_env`. Click **SAVE CHANGES**. A change reaches the sending workers within about a minute.

| Setting | Default | Notes |
|---|---|---|
| **Maximum recipients per campaign** | 1,000,000 | A larger audience is refused before it is queued. |
| **Cost per message part** | 0.0100 | Used for the cost estimate. |
| **Cost currency** | USD | |
| **Cost drift tolerance** | 0.05 | A campaign is held when its real cost exceeds the estimate by more than this fraction. |
| **Quiet hours start** | 21:00 | Applied in each campaign's timezone. |
| **Quiet hours end** | 09:00 | Set start and end to the same time for no quiet hours. |
| **Default send rate per minute** | 0 | 0 means no cap other than the gateway's own rate limit. |
| **Journey capacity reserve** | 10 | Percentage of gateway capacity kept for journey and transactional messages, so a bulk campaign cannot starve them (0 to 50). |
| **Append an opt-out footer by default** | On | |
| **Default opt-out footer** | `Reply STOP to opt out.` | |
| **Opt-out keywords** | STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT | Replies with these words opt the sender out. |
| **Reply attribution window** | 30 days | How long after a send a reply is still credited to that campaign. |
| **Event retention** | 365 days | 30 to 3,650 days. How long SMS events are kept for reports. |
| **Campaign queue retention** | 365 days | 30 to 3,650 days. How long per-recipient campaign detail is kept. |
| **Inbound message retention** | 365 days | 30 to 3,650 days. How long received messages and reply history are kept. |

::: warning
The help text on this page says quiet hours are in the recipient's timezone. They are applied in the campaign's timezone.
:::

### Cross-account views

Two read-mostly pages under **Reports** in the admin area cover every account:

- **SMS Campaigns** lists all campaigns. Filter by user ID or username, status and gateway. **Pause** stops a queueing or sending campaign, and **Cancel** stops one for good. Administrators cannot resume a campaign.
- **Inbound SMS** lists every received message. Filter by sender number, status, opt-outs (including opt-outs whose unsubscribe failed), gateway and date. It shows the gateway, sender, recipient, message, matched account and campaign, and the opt-out result.

## Troubleshooting

### The SMS menu is missing

`BRAND_FEATURE_SMS` is off in the new interface's environment, or the interface runs with `UI_MODE=gateway`. Ask your administrator.

### "Bulk SMS is disabled on this installation"

`SMS_CAMPAIGN_ENABLED` is `false` in `.oempro_env`. An administrator can set it to `true`.

### No gateway to choose

No SMS gateway is available to your account. An administrator must create one or assign one to you.

### The list cannot be used

Set the **Mobile number field** under the list's **Settings** > **SMS**. A campaign on a list without one fails with "The list has no phone number field".

### The Send now button does not appear

Save the message, then click **Estimate cost**. If the estimate is older than 15 minutes, or you changed the message or the gateway afterwards, click **Re-estimate**.

### The campaign is Sending but nothing goes out

Check the report for **Paused for quiet hours**. Sending resumes on its own when quiet hours end.

### The campaign was paused on its own

"Paused: the cost changed after it was approved" means the real cost drifted past the estimate by more than the **Cost drift tolerance**. Review the cost, then resume or cancel.

### Recipients were skipped

Open the **Recipients** tabs in the report and read the reason next to each number. See [Why a recipient was skipped](#why-a-recipient-was-skipped).

## Related articles

- **[SMS Messages](../using-octeth/sms-messages)**: gateways, list SMS settings, suppression and journey SMS.
- **[Xeebi SMS Gateway](../using-octeth/sms-gateways/xeebi)**: connect a Xeebi account and its callbacks.
- **[Segments](../using-octeth/segments)**: build segments to target your campaigns.
