---
layout: doc
---

# Xeebi SMS Gateway

Xeebi is an SMS provider that Octeth can send through. A Xeebi gateway sends your SMS campaigns and journey messages, receives delivery reports, and collects replies and STOP requests from your recipients.

This article explains how to connect a Xeebi account to Octeth, where to enter the callback URLs in the Xeebi portal, how Octeth handles what Xeebi sends back, and how to run several gateways on one Xeebi account. For SMS in general (lists, suppression, journeys, encoding), see [SMS Messages](../sms-messages).

## How Xeebi differs from other gateways

Xeebi has no "from" field. Every message goes out through a **campaign** in your Xeebi account, and on a number-based account each Xeebi campaign is identified by its phone number. Xeebi calls this number the campaign's **product type**. When Octeth sends with a sender number, Xeebi uses the Xeebi campaign that owns that number.

Two more differences shape the setup:

- Xeebi sets its callback URLs **once per account** in its portal, not per message.
- Xeebi does **not sign** its callbacks. The secret inside the callback URL is the only thing that proves a callback came from Xeebi.

## Before you start

You need:

1. A Xeebi account with at least one campaign and its phone number.
2. Your Xeebi **API key**. Sign in to the Xeebi portal and open **ADMIN** > **Account** to find it.
3. An Octeth administrator account with access to **Settings** > **SMS Gateways**.

## Creating a Xeebi gateway

1. In the admin area, navigate to **Settings** > **SMS Gateways**.
2. Click **Create a new SMS gateway**.
3. On the **Basic Settings** tab, enter a **Gateway Name**, choose **Xeebi** as the **Gateway Type**, and set **Gateway Status** to **Active**. Tick **Make this gateway available to all users (Global)** or leave it unticked and pick users on the **User Assignment** tab.
4. Fill in the **Gateway Configuration** tab (see below).
5. Fill in the **SMS Settings** tab (see below).
6. Click **TEST CONNECTION** to check the API key.
7. Save the gateway.

[[SCREENSHOT: Create SMS Gateway page, Gateway Configuration tab for a Xeebi gateway showing API Key, Default Sender Number, API Base URL and the Respect Xeebi campaign schedule checkbox]]

### Gateway Configuration tab

| Field | Required | Description |
|---|---|---|
| **API Key** | Yes | Your Xeebi API key from **ADMIN** > **Account** in the Xeebi portal. It must be 8 to 512 characters long and may contain only letters, digits and the characters `. _ ~ + / = -`. |
| **Default Sender Number** | No | The number Octeth sends with when a campaign or journey sets no sender. It must be one of your Xeebi numbers (a Xeebi campaign's product type), for example `18005550100`. |
| **API Base URL** | No | Defaults to `https://portal.xeebi.com/api/v1`. Change it only if Xeebi gives you a different API address. It must start with `https://`. |
| **Respect Xeebi campaign schedule** | No | Off by default. See [Sending schedule](#sending-schedule) below. |

::: warning Default Sender Number left empty
Leave **Default Sender Number** empty only if your Xeebi account has a campaign tagged `#API`. Without one, Xeebi refuses every message that carries no sender.
:::

::: warning Use the Default Sender Number on this tab
The **SMS Settings** tab also has a **Default Sender Number** drop-down. A Xeebi gateway ignores it. Xeebi reads only the **Default Sender Number** on the **Gateway Configuration** tab, so set the fallback number there.
:::

Octeth never follows a redirect from the Xeebi API, because a redirect would carry your API key to another address. If the base URL is wrong, sending fails with a message that Xeebi answered with a redirect or that the endpoint was not found, both asking you to check the base URL.

### SMS Settings tab

Enter your Xeebi numbers in **Sender Numbers**, one per line. Octeth does not read them from Xeebi, so type each number by hand exactly as it appears on your Xeebi campaign. These are the numbers your users can pick as the sender in an SMS campaign or a journey.

The other fields on this tab (**Message Concatenation Limit**, **URL Shortening Domains**, **Country Restrictions**) work the same as for any gateway. See [SMS Messages](../sms-messages#creating-a-new-sms-gateway).

### Testing the connection

**TEST CONNECTION** reads your Xeebi account balance. This proves the API key and the base URL in one call. On success it shows **Connection successful** with your balance, for example `(Balance: 125.4 USD)`.

### Sending speed

A Xeebi gateway sends one message per API request, at up to 10 requests per second by default. A large campaign therefore sends at about 600 messages per minute through one gateway.

### Sending schedule

Xeebi campaigns can have their own sending schedule in the Xeebi portal. **Respect Xeebi campaign schedule** decides which schedule wins:

- **Off (default):** Octeth tells Xeebi to ignore the Xeebi campaign schedule. Messages go out as soon as Octeth sends them, and Octeth's own quiet hours are the only timing rule.
- **On:** Xeebi holds messages that arrive outside the sending schedule of the Xeebi campaign and sends them when the schedule opens.

::: tip
Keep it off unless you manage sending hours in Xeebi on purpose. Two schedules in two places make it hard to tell why a message went out late.
:::

## Connecting delivery reports and replies

Xeebi tells Octeth what happened to each message (delivered, failed, rejected) and forwards replies and STOP requests. For that, Xeebi needs two callback URLs from Octeth.

### Finding the callback URLs in Octeth

The **Webhooks** tab appears only when you edit a gateway, so save the new gateway first.

1. Navigate to **Settings** > **SMS Gateways** and open your Xeebi gateway.
2. Open the **Webhooks** tab.
3. Copy the **Delivery report URL** and the **Inbound message URL**. Click a field to select its whole URL.

[[SCREENSHOT: Webhooks tab of a Xeebi gateway showing the Delivery report URL and Inbound message URL fields]]

Each URL already contains this gateway's identifier and its webhook secret.

::: warning Always copy the URLs shown on the Webhooks tab
Do not build the URLs by hand. Their exact form depends on your installation. For example, when URL rewriting is turned off, the URLs contain `index.php?/public/`. If you ever add your own parameter to one of these URLs, join it with `&`, not `?`, because the URL already contains a `?`.
:::

### Entering the URLs in the Xeebi portal

1. Sign in to the Xeebi portal.
2. Open **ADMIN** > **Account** > **Callbacks**.
3. Paste the URLs as follows:

| Xeebi callback | Octeth URL to paste |
|---|---|
| **Delivery** | **Delivery report URL** |
| **Reply** | **Inbound message URL** |
| **Incoming** | **Inbound message URL** |
| **Opt-out** | **Inbound message URL** |
| **Impression** | Leave empty. Octeth does not use it. |

4. Save the callbacks in the Xeebi portal.

### Callback security

Because Xeebi does not sign its callbacks, the secret in the URL is the only authentication. Treat both URLs like passwords: do not post them in tickets, chat or screenshots.

- Octeth always requires the secret on both URLs for a Xeebi gateway.
- The **Require the secret on delivery reports** checkbox on the **Webhooks** tab has no effect on a Xeebi gateway. It exists for older gateway types.
- To replace a leaked secret, tick **Rotate the secret on save** and save the gateway. **Both URLs change.** Copy the new URLs and paste them into the Xeebi portal straight away. Until you do, Octeth refuses Xeebi's callbacks.

## What Octeth does with Xeebi's responses

| What happens | Result in Octeth |
|---|---|
| The recipient is on Xeebi's stop list | The message is marked **rejected** with the reason `STOP_LIST` ("The recipient is on the Xeebi stop list"). Octeth never asks Xeebi to send past its stop list. |
| A recipient sends **STOP** (Xeebi opt-out callback) | The number is suppressed at gateway scope, so no gateway user can message it through this gateway again. When the gateway is assigned to exactly one account, the number is suppressed for that account instead and the subscriber is unsubscribed from SMS. |
| A recipient sends **START** or **HELP** | Stored as an ordinary reply. It changes nothing. |
| A recipient replies to a message | Stored as a reply and matched to the message it answers. |
| Xeebi answers HTTP 402 | Sending fails with `LOW_BALANCE` ("Xeebi account balance is too low"). Top up your Xeebi account. |
| Xeebi answers HTTP 401 or 403 | Sending fails with `UNAUTHORIZED` ("Xeebi rejected the API key"). Check the **API Key**. |
| Xeebi answers HTTP 429 | Sending fails with `RATE_LIMITED`. |
| Xeebi refuses the content or the number | The message is marked **rejected**, for example with `RESTRICTED_CONTENT`, `INVALID_NUMBER` or `UNROUTABLE`. |

Rejected messages are kept apart from undelivered ones in reports, so a stop-listed audience does not look like poor deliverability.

## Several gateways on one Xeebi account

You can create more than one Octeth gateway on the same Xeebi account, for example one gateway per customer, each with its own sender numbers. Because Xeebi sends every callback for an account to one set of URLs, Octeth treats such gateways as a **group**.

Gateways form a group when all of these are true:

- They are Xeebi gateways.
- They use the same **API Key** and the same **API Base URL**.
- None of them has **Gateway Status** set to **Inactive**.

When a gateway belongs to a group, its **Webhooks** tab shows a **Shared provider account** section listing the other gateways in the group.

[[SCREENSHOT: Webhooks tab showing the Shared provider account section that lists the other gateways on the same Xeebi account]]

How a group behaves:

1. **Enter one gateway's URLs in the Xeebi portal.** Any one gateway of the group will do. Do not try to enter several sets, because Xeebi keeps only one.
2. **Delivery reports and replies are matched across the group.** Each one is recorded under the gateway that sent the original message, whichever gateway's URL received it.
3. **A STOP suppresses the number on every gateway in the group.** Xeebi's stop list covers the whole Xeebi account, so Octeth does the same.
4. **Replies that cannot be matched to a message** are credited to an Octeth account only when every gateway in the group is assigned to the same single account. Otherwise they stay unattributed, so one customer's reply never lands in another customer's account.

::: warning
Rotating the secret of the gateway whose URLs are in the Xeebi portal changes those URLs. Update the Xeebi portal after rotating, or the whole group stops receiving delivery reports and replies.
:::

## Troubleshooting

### Every message fails with "Xeebi rejected the API key"

The API key is wrong or was revoked. Copy it again from **ADMIN** > **Account** in the Xeebi portal, paste it into **API Key**, save, and click **TEST CONNECTION**.

### Messages without a sender are refused

The campaign or journey set no sender, and the gateway has no **Default Sender Number** on the **Gateway Configuration** tab. Enter one of your Xeebi numbers there, or create a Xeebi campaign tagged `#API`. Setting the default sender on the **SMS Settings** tab does not help, because Xeebi ignores it.

### Sending fails with "Xeebi account balance is too low"

Your Xeebi balance has run out. Add funds in the Xeebi portal. **TEST CONNECTION** shows the current balance.

### Sending fails with a redirect or "endpoint not found" error

The **API Base URL** is wrong. Clear the field to use the default `https://portal.xeebi.com/api/v1`, or enter the exact address Xeebi gave you.

### Messages stay at "Sent" and never show as delivered

Xeebi is not reaching Octeth's **Delivery report URL**:

1. Check that the **Delivery** callback in **ADMIN** > **Account** > **Callbacks** holds the **Delivery report URL** from the **Webhooks** tab, character for character.
2. If the secret was rotated, paste the new URL.
3. Make sure your Octeth installation is reachable from the internet at the address in the URL.

### Replies and STOP requests do not arrive

Check that the **Reply**, **Incoming** and **Opt-out** callbacks all hold the **Inbound message URL**, not the delivery report URL.

### One gateway of a shared account receives nothing

Check that the gateway uses exactly the same **API Key** and **API Base URL** as the others and is not **Inactive**. Open its **Webhooks** tab: if the **Shared provider account** section is missing, the gateway is not part of the group, and Xeebi's callbacks for its messages will not be matched to it.

### Messages go out at unexpected times

If **Respect Xeebi campaign schedule** is on, Xeebi holds messages outside the schedule set on the Xeebi campaign. Turn it off to let Octeth's quiet hours decide.

## Related articles

- **[SMS Messages](../sms-messages)**: gateways, list SMS settings, suppression and journeys.
- **[SMS Campaigns](../../new-user-interface/sms-campaigns)**: send bulk SMS campaigns from the new interface.
