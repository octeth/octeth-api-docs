---
layout: doc
---

# Keitaro for SMS Campaigns <Badge type="tip" text="New in v6.0.4" />

Keitaro is a tracker that records what happens after someone taps a link: the click, and any conversion that follows, such as a lead or a sale. When you connect Keitaro to Octeth, your SMS campaign reports show Keitaro clicks, conversions and revenue next to your deliveries, and you can build segments from them.

This article shows you how to connect Keitaro, prepare your SMS links, read the figures in the report and target contacts by what they did in Keitaro.

## Before you start

You need:

1. **SMS campaigns in the new interface.** See [SMS Campaigns](./sms-campaigns). The **Integrations** menu item appears only when SMS is turned on for your account.
2. **A Keitaro server** you can sign in to, and its address, for example `https://tracker.example.com`.
3. **A Keitaro API key.** You create it in your Keitaro user settings. Octeth uses it to read clicks from Keitaro.

## How it works

Octeth gives every recipient of a campaign their own tracking code. You put the code into your Keitaro link with the <code v-pre>{{ SMS:TrackingCode }}</code> tag, and Keitaro stores it with each click and conversion.

- **Clicks:** every few minutes Octeth reads the new clicks from your Keitaro server with your API key.
- **Conversions:** Keitaro sends each conversion to a postback URL that Octeth gives you. A postback is a message Keitaro sends to another system when a conversion happens.

Octeth then matches each click and conversion to the contact who received the message.

## Step 1: Connect Keitaro in Octeth

1. Click **Integrations** in the left menu.
2. On the **Keitaro** card, click **Set up**.
3. Fill in the **Connection** card:

| Field | What to enter |
|---|---|
| **Server URL** | The address you open Keitaro at, for example `https://tracker.example.com`. Leave out any path to a page. |
| **API key** | Your Keitaro API key. It is stored encrypted and never shown again. |
| **Sub ID for the tracking code** | The Keitaro parameter that receives each recipient's tracking code. `sub_id_1` is the default. Pick another one if your Keitaro campaign already uses `sub_id_1`. |
| **Revenue currency** | The three-letter currency your Keitaro payouts are in, for example `USD` or `EUR`. |

4. Click **Check connection** to test the server URL and the API key without saving anything.
5. Click **Connect Keitaro**.

[[SCREENSHOT: The Keitaro screen under Integrations with the Connection card filled in]]

The status in the top corner of the card changes to **Connected**, and a **Postback URL** card appears.

::: warning Copy the postback URL now
The postback URL is shown in full only once, right after you connect. Click **Copy postback URL** and keep it until you have pasted it into Keitaro in the next step. After you leave the page the token in the URL is hidden. If you lose it, click **Regenerate postback URL** and use the new one. The old URL stops working at once.
:::

::: warning Plain http
If your server URL starts with `http://`, a warning tells you that the API key is sent unencrypted. Use `https://` if your Keitaro server supports it.
:::

## Step 2: Set up Keitaro

The **Setup checklist** card on the Keitaro screen repeats these four steps with your own sub ID.

1. **Create a traffic source** in Keitaro and paste the postback URL into its **S2S postback** field.
2. In that traffic source, tick **Send postback to traffic source** for every conversion status you want to see in Octeth.
3. In your Keitaro campaign, **map your link's query parameter to `sub_id_1`** (or to the sub ID you chose in Step 1).
4. In your SMS message, **put <code v-pre>{{ SMS:TrackingCode }}</code> as that parameter's value**, for example <code v-pre>https://tracker.example.com/offer?click={{ SMS:TrackingCode }}</code>.

::: danger Keep the postback URL as it is
Paste the postback URL exactly as Octeth shows it. Do not remove any part of it. Keep `subid={subid}`: it is Keitaro's click ID, and Octeth rejects a conversion without it. Keep `time={conversion_time:U}`: Octeth uses that time to put a recipient's statuses in the right order. Without it, a late or repeated postback can replace a newer status with an older one, for example turn a **sale** back into a **lead**.
:::

## Step 3: Add the tracking tag to your SMS

In the SMS campaign editor, write your Keitaro link with the tag as the value of the parameter you mapped:

<code v-pre>Our autumn sale is on: https://tracker.example.com/offer?click={{ SMS:TrackingCode }}</code>

When the message is sent, Octeth replaces the tag with that recipient's code. Things to know:

- The tag only works **inside a link**. A message with the tag anywhere else cannot be saved, and the editor says "The <code v-pre>{{ SMS:TrackingCode }}</code> tag can only be used inside a link."
- A link with the tag is sent **as you wrote it**, with only the tag replaced. It does not go through Octeth's short link, so it does not count in the report's **Clicked** figures. Keitaro counts it instead.
- Your other links work as before. A message can mix a Keitaro link and normal links.
- If your account is not connected to Keitaro yet, the editor shows a note with a link to the Keitaro screen. You can still save and send the campaign, but no Keitaro figures are collected until you connect.

## Reading the report

Open the campaign's report. Campaigns whose message contains the tag get a **Keitaro** section.

[[SCREENSHOT: The Keitaro section of an SMS campaign report with the three tiles and the Statuses reached table]]

| Tile | What it shows |
|---|---|
| **Keitaro clicks** | The number of contacts who clicked a Keitaro link. Below it, the share of delivered messages that led to a click. |
| **Conversions** | The number of contacts who converted. |
| **Revenue** | The total revenue of the conversions, in your revenue currency. Rejected conversions are not included. |

The section also shows when Octeth last read your Keitaro server, for example **Updated 3 minutes ago**. Before the first read it says **Not checked yet**.

### Statuses reached

This table lists each conversion status Keitaro reported, how many times conversions reached it (**Times reached**), and the revenue reported with it.

A contact who first becomes a lead and then a sale is counted once under **lead** and once under **sale**. So the rows can add up to more than the **Conversions** tile, which counts each contact once.

### Keitaro by link

This table shows the unique clicks, conversions and revenue for each Keitaro link in the message.

### Contact activity

A contact's SMS activity also lists **Clicked a Keitaro link** and **Converted in Keitaro**, with the time of each.

::: info When figures appear
- **Clicks appear with a delay of a few minutes**, because Octeth reads them from Keitaro on a schedule (every 5 minutes by default).
- Conversions appear as soon as Keitaro sends the postback.
- **Octeth reads clicks from the moment you connect.** Clicks that happened in Keitaro before you connected are not imported.
- Clicks and conversions that Keitaro marks as bots are not counted.
:::

## Segmenting by Keitaro activity

The **SMS activity** rule in the segment builder and in the SMS campaign conditions has four Keitaro activities:

| Activity | Matches contacts who |
|---|---|
| **Clicked a Keitaro link** | clicked a Keitaro link in an SMS |
| **Did not click a Keitaro link** | did not click one |
| **Converted in Keitaro** | converted after an SMS |
| **Did not convert in Keitaro** | did not convert |

You choose **Any SMS** or one campaign, and a time filter, the same way as for the other SMS activities. With one campaign, the "did not" activities mean "received that campaign and did not click or convert".

The two conversion activities have an extra **Status** box:

- Leave it empty (**Any status**) to match every conversion except rejected ones.
- Type a status, for example `sale`, to match only contacts whose conversion has that status now. Upper and lower case do not matter.
- A conversion keeps only its latest status. A contact whose lead later became a sale matches `sale`, not `lead`.
- The status box is only available for the two conversion activities.

[[SCREENSHOT: The SMS activity rule set to Converted in Keitaro with the Status box filled in with sale]]

## Changing or removing the connection

- **Change a setting:** edit the field and click **Save changes**. Leave **Replace API key** blank to keep the stored key.
- **Change the sub ID or the revenue currency:** both are part of the postback URL, so saving a new value creates a new postback URL and the old one stops working at once. The **Postback URL** card shows the new URL with a **Replace the postback URL in Keitaro** message. Copy it and paste it into the S2S postback field of your Keitaro traffic source right away, or conversions are lost until you do.
- **Move to another Keitaro server:** when you change the **Server URL** to a different server (another host name, port, or a switch between `http` and `https`), enter the API key again. Octeth does not send your stored key to a new server. Changing only the path keeps the stored key.
- **Disconnect:** click **Disconnect Keitaro**. Octeth stops reading clicks and the postback URL stops working at once. Clicks and conversions already recorded stay in your reports.

## Troubleshooting

### The status says Failing

The **Keitaro cannot be read** message at the top of the screen explains why. The most common causes:

1. The API key was deleted or changed in Keitaro. Enter the new key in **Replace API key** and click **Save changes**.
2. The server URL is wrong or the server cannot be reached. Click **Check connection** to test it.

### Conversions do not appear

1. Check **Rejected postbacks** in the **Status** card. It counts postbacks that Octeth could not match to a recipient, and **Last rejected postback** says why and when. **Last poll error** is about reading clicks, not about postbacks.
2. If the last rejected postback mentions an unmapped sub ID, the link parameter is not mapped to the sub ID shown in the setup checklist. Fix the mapping in your Keitaro campaign.
3. Make sure the postback URL in the Keitaro traffic source is the current one. If you regenerated it, or changed the sub ID or the revenue currency, paste the new URL.
4. If the last rejected postback mentions a missing Keitaro click ID, the URL in Keitaro has lost `subid={subid}`. Copy the postback URL from Octeth again (regenerate it if the token is hidden) and paste it in full.
5. Make sure **Send postback to traffic source** is ticked for the statuses you expect.

### Clicks do not appear

1. Wait a few minutes. Clicks are read on a schedule.
2. Check that the status is **Connected** and that **Last poll** shows a recent time.
3. Only clicks made after you connected are read.

## Related articles

- **[SMS Campaigns](./sms-campaigns)**: create, send and report on SMS campaigns.
- **[Segments](../using-octeth/segments)**: build segments to target your campaigns.
