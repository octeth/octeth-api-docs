---
layout: doc
---

# SMS Messages

SMS messaging in Octeth allows you to reach your subscribers directly on their mobile phones with text messages. Combined with email campaigns, SMS provides a powerful multi-channel marketing approach that improves engagement and drives higher conversion rates.

Currently, SMS messages are sent through the **Journey Builder**, where you add a Send SMS action to automate text message delivery as part of your customer journeys. This article covers how to set up SMS gateways, configure your subscriber lists for SMS, send messages through journeys, and manage SMS suppression lists.

::: info
SMS Marketing is a licensed feature. If it is not enabled in your Octeth license, contact [Octeth Sales](mailto:sales@octeth.com) for more information.
:::

## Prerequisites

Before you can send SMS messages, the following must be in place:

1. **SMS Marketing license** — Your Octeth license must include the SMS Marketing feature.
2. **SMS gateway** — An administrator must configure at least one SMS gateway (such as Infobip) to connect Octeth to an SMS delivery provider.
3. **Phone number field** — Each subscriber list that will receive SMS messages must have a custom field mapped to store mobile phone numbers.
4. **Subscriber phone data** — Subscribers must have valid phone numbers stored in the mapped custom field.

## Administrator Setup

This section covers the configuration steps that administrators need to complete before users can send SMS messages.

### Managing SMS Gateways

SMS gateways connect Octeth to external SMS delivery providers such as Infobip. To manage gateways, navigate to **Settings** > **SMS Gateways** in the admin panel.

[[SCREENSHOT: SMS Gateways list page showing the table with gateway name, type, status, scope, and user count columns]]

The gateway list displays the following information:

| Column | Description |
|---|---|
| **Gateway Name** | The name assigned to the gateway, along with sender numbers and an edit link. |
| **Type** | The SMS provider type (e.g., Infobip). |
| **Status** | Whether the gateway is **Active** (ready to send) or **Inactive** (disabled). |
| **Scope** | **Global** means all users can access the gateway. **User-specific** means only assigned users can use it. |
| **Users** | The number of users assigned to a user-specific gateway. Displays "N/A" for global gateways. |

#### Creating a New SMS Gateway

To create a new SMS gateway:

1. Navigate to **Settings** > **SMS Gateways**.
2. Click **Create a new SMS gateway**.
3. Complete the configuration across four tabs.

[[SCREENSHOT: Create SMS Gateway page showing the Basic Settings tab with gateway name, type, status, and global checkbox fields]]

**Basic Settings Tab**

| Field | Description |
|---|---|
| **Gateway Name** | A descriptive name for the gateway (e.g., "Production Infobip Gateway"). |
| **Gateway Type** | The SMS provider to use. Select from available connectors such as Infobip. This cannot be changed after creation. |
| **Gateway Status** | Set to **Active** to enable the gateway or **Inactive** to disable it. |
| **Make this gateway available to all users (Global)** | When checked, all users in the system can use this gateway. When unchecked, you must assign specific users in the User Assignment tab. |

**Gateway Configuration Tab**

This tab displays provider-specific fields based on the selected gateway type. For example, an Infobip gateway requires an API key and base URL. Fill in the credentials provided by your SMS provider.

[[SCREENSHOT: Gateway Configuration tab showing provider-specific fields like API Key and Base URL]]

**SMS Settings Tab**

| Field | Description |
|---|---|
| **Sender Numbers** | Phone numbers used as sender IDs when sending SMS messages. Enter one number per line, including the country code (e.g., `+1234567890`). |
| **Message Concatenation Limit** | The maximum number of SMS parts that can be concatenated for long messages (1-10). Default is 3. |
| **Default Sender Number** | The default phone number to use when sending SMS messages. Select from the sender numbers you entered. |
| **URL Shortening Domains** | Optional domains for shortening links in SMS messages. Enter one domain per line. These domains must point to your Octeth server via a CNAME record. |
| **Country Restrictions** | Optional 2-letter country codes to restrict SMS sending to specific countries. Leave empty to allow all countries. |

[[SCREENSHOT: SMS Settings tab showing sender numbers textarea, concatenation limit, default sender dropdown, URL shortening domains, and country restrictions]]

**User Assignment Tab**

This tab only appears for non-global gateways. Select the users who should have access to this gateway by checking the boxes next to their names.

[[SCREENSHOT: User Assignment tab showing a list of users with checkboxes for assignment]]

::: tip
Use global gateways when all users should share the same SMS provider. Use user-specific gateways when different users need different providers or when you want to control SMS access on a per-user basis.
:::

#### Editing a Gateway

To edit an existing gateway, click the gateway name or the **Edit** link in the gateway list. All settings except **Gateway Type** can be modified.

#### Deleting Gateways

To delete one or more gateways:

1. Select the checkboxes next to the gateways you want to delete.
2. Click **Delete** in the grid operations bar.

::: danger
Deleting a gateway is permanent. Any journeys using the deleted gateway will no longer be able to send SMS messages. Make sure no active journeys depend on a gateway before deleting it.
:::

#### Testing Gateway Connection

When creating or editing a gateway, use the **Test Connection** button to verify that Octeth can communicate with the SMS provider. This sends a test request to confirm that your API credentials and configuration are correct.

### SMS Settings

Administrators can configure system-wide SMS settings by navigating to **Settings** > **SMS** in the admin panel. The settings page has three tabs.

[[SCREENSHOT: Admin SMS Settings page showing the Frequency, Forbidden Words, and Other tabs]]

#### Frequency Settings

Frequency settings control how many SMS messages a single subscriber can receive within a given time period. This prevents over-messaging and helps maintain a positive subscriber experience.

| Field | Description |
|---|---|
| **Daily Limit** | Maximum number of SMS messages a subscriber can receive per day. |
| **Weekly Limit** | Maximum number of SMS messages a subscriber can receive per week. |
| **Monthly Limit** | Maximum number of SMS messages a subscriber can receive per month. |
| **Yearly Limit** | Maximum number of SMS messages a subscriber can receive per year. |

::: warning
Setting frequency limits to very high values may lead to subscriber complaints and opt-outs. Choose values that balance your marketing goals with subscriber preferences.
:::

#### Forbidden Words

The forbidden words list contains words and phrases that are not allowed in SMS messages. When a user creates an SMS message containing any of these words, the system flags it.

Enter one word or phrase per line in the text area.

#### Other Settings

| Field | Description |
|---|---|
| **Frequency Whitelisted Numbers** | Phone numbers that are exempt from frequency limits. Enter one number per line. Useful for internal testing numbers. |

### SMS Suppression (Admin)

The SMS suppression system prevents messages from being sent to specific phone numbers. Administrators can manage suppression entries at three levels: **System** (affects all users), **User** (affects a specific user), and **List** (affects a specific subscriber list).

Navigate to **Settings** > **SMS Suppression** in the admin panel.

[[SCREENSHOT: Admin SMS Suppression page showing the statistics panel on the left and the Search/Add Numbers/Patterns tabs on the right]]

#### Statistics Panel

The left panel displays suppression statistics:

- **Total Suppressed Numbers** — The total count across all levels.
- **By Level** — Breakdown by System, User, List, and Pattern counts.
- **By Reason** — Breakdown by suppression reason (manual, complaint, bounce, opt-out, invalid).

A **Clear cache** link at the bottom resets the suppression cache. Use this after making bulk changes to ensure the latest data is used.

#### Searching for Suppressed Numbers

Use the **Search** tab to check if a phone number is in the suppression list.

1. Enter the phone number in the **Phone Number** field (e.g., `+1234567890`).
2. Optionally select a **User** to narrow the search.
3. Optionally select a **List** (appears after selecting a user).
4. Click **Search**.

If the number is found, the results table shows the phone number, suppression level, reason, and date added. You can remove a suppression by clicking the **X** link next to it.

#### Adding Numbers to the Suppression List

Use the **Add Numbers** tab to suppress specific phone numbers.

1. Enter one or more phone numbers in the **Phone Numbers** field, one per line. Include the country code (e.g., `+1234567890`).
2. Select the **Suppression Level**:
   - **System (All Users)** — Blocks the number for every user in the system.
   - **User** — Blocks the number for a specific user. Select the user from the dropdown.
   - **List** — Blocks the number for a specific subscriber list. Select the user and then the list.
3. Select a **Reason** (Manual, Complaint, Hard Bounce, Opt-out, or Invalid Number).
4. Optionally add **Notes** for reference.
5. Click **Add to Suppression List**.

#### Managing Suppression Patterns

Patterns allow you to block multiple phone numbers using wildcard matching. Use the **Patterns** tab to create and manage patterns.

To add a pattern:

1. Enter the pattern in the **Pattern** field. Use `*` as a wildcard (e.g., `+1234*` blocks all numbers starting with +1234).
2. Select the **Suppression Level** (System, User, or List).
3. Optionally add **Notes**.
4. Click **Add Pattern**.

Existing patterns are listed in a table below the form. Click the **X** link to remove a pattern.

::: tip
Patterns are useful for blocking entire area codes or country prefixes. For example, `+44*` would suppress all UK phone numbers.
:::

## Configuring List SMS Settings

Before you can send SMS messages to subscribers in a list, you must tell Octeth which custom field contains each subscriber's mobile phone number.

To configure SMS settings for a list:

1. Navigate to **Lists** from the main menu.
2. Click the list name to open its settings.
3. In the list navigation sidebar, click **SMS Settings**.

[[SCREENSHOT: List SMS Settings page showing the Mobile Phone Number and Mobile Phone Number Carrier dropdown fields mapped to custom fields]]

| Field | Description |
|---|---|
| **Mobile Phone Number** | **(Required)** Select the custom field that stores subscriber phone numbers. This can be a list-specific custom field or a global custom field. |
| **Mobile Phone Number Carrier** | **(Optional)** Select the custom field that stores the subscriber's mobile carrier information, if available. |

After selecting the appropriate fields, click **Save**.

::: warning
If you do not configure the phone number field mapping for a list, the Journey Builder's Send SMS action will not be able to find phone numbers for subscribers in that list. SMS messages will be skipped for those subscribers.
:::

::: tip
Store phone numbers in E.164 international format (e.g., `+14155551234`) for best compatibility across SMS providers and countries.
:::

## Sending SMS via Journey Builder

The primary method for sending SMS messages in Octeth is through the **Journey Builder**. By adding a **Send SMS** action to a journey, you can automate text message delivery based on subscriber behavior, timing, or other conditions.

### Adding a Send SMS Action

1. Open the Journey Builder by navigating to **Journeys** and selecting a journey (or creating a new one).
2. In the action palette, find **Send SMS** under the **Messaging** category.
3. Drag it onto the canvas and connect it to the appropriate trigger or preceding action.
4. Click the Send SMS node to open its configuration modal.

[[SCREENSHOT: Journey Builder canvas showing a Send SMS action node connected to a trigger, with the configuration modal open]]

### Configuring the SMS Action

The Send SMS configuration modal has several sections.

#### Message

The message section is where you compose the text of your SMS.

| Field | Description |
|---|---|
| **Message** | The SMS message text. Supports personalization tags and link placeholders. |
| **Character Counter** | Displays the current character count and estimated number of SMS parts. |
| **Encoding Indicator** | Shows whether the message uses GSM7 or Unicode encoding (see [SMS Message Encoding](#sms-message-encoding) below). |

You can personalize your message using merge tags. These are replaced with actual subscriber data when the message is sent:

- <code v-pre>{{Subscriber:FirstName}}</code> — Subscriber's first name
- <code v-pre>{{Subscriber:LastName}}</code> — Subscriber's last name
- <code v-pre>{{Subscriber:EmailAddress}}</code> — Subscriber's email address
- <code v-pre>{{Subscriber:CustomFieldName}}</code> — Any custom field value

If you are including a tracking link, use the <code v-pre>{{link}}</code> placeholder in your message. This will be replaced with a shortened URL when the message is sent.

**Example message:**

```text
Hi {{Subscriber:FirstName}}, check out our special offer: {{link}} Reply STOP to unsubscribe.
```

#### Gateway and Sender

| Field | Description |
|---|---|
| **Gateway** | Select the SMS gateway to use for delivery. Only gateways assigned to you (or global gateways) are shown. |
| **Sender ID** | Select the sender number or alphanumeric ID that recipients will see. Options are populated from the selected gateway's configured sender numbers. Leave empty to use the gateway default. |

#### Link Tracking

| Field | Description |
|---|---|
| **Include Tracking Link** | Toggle to enable link tracking in the SMS message. |
| **Link URL** | The destination URL that the <code v-pre>{{link}}</code> placeholder will point to. |
| **Link Expiry (Hours)** | How long the shortened link remains active (default: 72 hours, maximum: 8,760 hours / 1 year). |

When link tracking is enabled and a <code v-pre>{{link}}</code> placeholder is in the message, Octeth automatically creates a shortened URL. Each click on the shortened link is tracked with device information, timing, and geographic data.

::: info
You can also add UTM parameters (source, medium, campaign) to your tracking links for integration with analytics platforms like Google Analytics.
:::

#### Delivery Window

The delivery window controls when SMS messages are allowed to be sent. Messages triggered outside the delivery window are automatically queued and sent at the next valid time.

| Field | Description |
|---|---|
| **Enable Delivery Window** | Toggle to activate delivery window restrictions. |
| **Timezone** | The timezone used to evaluate the delivery window. |
| **Start Time** | The earliest time of day when SMS messages can be sent (e.g., `09:00`). |
| **End Time** | The latest time of day when SMS messages can be sent (e.g., `18:00`). |
| **Days of Week** | Select which days SMS delivery is allowed (e.g., Monday through Friday). |

::: tip
Use delivery windows to avoid sending SMS messages during late-night or early-morning hours in your recipients' timezone. This improves the subscriber experience and can lead to better engagement rates.
:::

#### Processing Options

| Field | Description |
|---|---|
| **Skip if No Phone** | When enabled, subscribers without a phone number are silently skipped instead of generating an error. |
| **Priority** | Set to **Normal** or **High** to control queue priority. |
| **Max Retry Attempts** | The number of times Octeth will retry sending a failed SMS (0-10). |

::: tip
Enable **Skip if No Phone** when your list contains a mix of subscribers with and without phone numbers. This prevents error logs from filling up with expected "no phone number" messages.
:::

## SMS Message Encoding

SMS messages use one of two encoding types, which affects the maximum character count per message part and the overall cost of sending.

### GSM7 Encoding

GSM7 is the standard encoding for SMS messages. It supports the basic Latin alphabet, numbers, and common symbols. A single SMS part can contain up to **160 characters** using GSM7 encoding.

GSM7 supports these characters:

- Letters: A-Z, a-z
- Numbers: 0-9
- Common symbols: @ ! " # $ % & ' ( ) * + , - . / : ; < = > ? _
- Space and newline

### Unicode Encoding

If your message contains characters outside the GSM7 character set — such as accented characters, non-Latin scripts (e.g., Chinese, Arabic, Cyrillic), or emojis — the message automatically switches to Unicode encoding. A single SMS part can contain up to **70 characters** using Unicode encoding.

### Multi-Part Messages

When a message exceeds the character limit for a single part, it is split into multiple parts:

| Encoding | Single Part | Multi-Part (per part) |
|---|---|---|
| **GSM7** | 160 characters | 153 characters |
| **Unicode** | 70 characters | 67 characters |

The per-part limit is lower in multi-part messages because each part includes a header that allows the recipient's phone to reassemble them in the correct order.

::: warning
Each SMS part is typically billed separately by SMS providers. A 320-character GSM7 message requires 3 parts (153 + 153 + 14), not 2. Keep messages concise to minimize costs.
:::

The Journey Builder's message composer shows a real-time character counter and SMS parts estimate as you type, along with an indicator showing whether your message uses GSM7 or Unicode encoding.

## Link Shortening and Tracking

Octeth includes a built-in link shortening system designed specifically for SMS messages, where every character counts.

### How It Works

When you enable link tracking in a Send SMS action and include the <code v-pre>{{link}}</code> placeholder in your message:

1. Octeth creates a unique short URL for each recipient.
2. The <code v-pre>{{link}}</code> placeholder is replaced with the short URL (e.g., `https://short.example.com/Ab3xYz`).
3. When the recipient clicks the link, Octeth records the click and redirects them to the original destination URL.

### Short URL Domains

Administrators can configure custom short URL domains in the SMS gateway settings under the **URL Shortening Domains** field. These domains must be pointed to your Octeth server via a DNS CNAME record. If multiple domains are configured, Octeth randomly selects one for each message.

If no custom domain is configured, the application's main domain is used.

### Click Tracking

Each click on a shortened SMS link is tracked with the following data:

- **Timestamp** — When the click occurred.
- **Device type** — Mobile, desktop, or tablet.
- **Browser and operating system** — Parsed from the user agent.
- **Geographic location** — Country and city based on IP address (when available).
- **Bot detection** — Automated clicks from bots and crawlers are identified and filtered from analytics.

### Link Expiry

Shortened links expire after a configurable period (default: 72 hours). After expiry, clicking the link returns an HTTP 410 (Gone) response. The maximum allowed expiry is 1 year (8,760 hours).

Expired link data is retained for analytics purposes and automatically cleaned up after 180 days.

## SMS Suppression (User Level)

Users can manage their own SMS suppression lists to prevent messages from being sent to specific phone numbers. User-level suppression management is separate from the system-wide suppression managed by administrators.

Navigate to **SMS** > **Suppression List** from the main menu.

[[SCREENSHOT: User SMS Suppression List page showing the suppression management interface with Add, Search, and Pattern tabs]]

### Adding Phone Numbers

1. Enter one or more phone numbers in the **Phone Numbers** field, one per line.
2. Select the **Suppression Type**:
   - **User** — Blocks the number for all your SMS messages.
   - **List** — Blocks the number for a specific subscriber list only.
3. Select a **Reason** and optionally add **Notes**.
4. Click **Add to Suppression List**.

::: info
Users can only create User-level and List-level suppressions. System-level suppressions can only be managed by administrators.
:::

### Adding Patterns

Patterns use wildcard matching to suppress multiple phone numbers at once.

1. Enter the pattern using `*` as a wildcard (e.g., `+1555*`).
2. Select the suppression type (**User** or **List**).
3. Click **Add Pattern**.

### Searching for Suppressed Numbers

Enter a phone number in the search field to check if it appears in the suppression list. The search checks both User-level and List-level suppressions across all your lists.

### How Suppression Works During Sending

When an SMS message is about to be sent, Octeth checks the recipient's phone number against the suppression list in the following order:

1. **System-level** — Checked first. If suppressed here, the message is blocked for all users.
2. **User-level** — Checked second. If suppressed here, the message is blocked for the specific user.
3. **List-level** — Checked last. If suppressed here, the message is blocked for the specific list.

Both exact phone number matches and wildcard pattern matches are evaluated. If a phone number is suppressed at any level, the SMS message is not sent and the suppression is logged.

## Tips and Best Practices

::: tip Keep Messages Concise
Every SMS part costs money. Aim to keep messages under 160 characters (GSM7) to fit in a single part. If you need to include a link, use the built-in link shortening to minimize URL length.
:::

::: tip Use GSM7 Characters When Possible
Avoid special characters, accented letters, and emojis unless necessary. Switching from GSM7 to Unicode encoding cuts your per-part character limit from 160 to 70, potentially doubling the cost of a message.
:::

::: tip Set Up Delivery Windows
Respect your subscribers' time by configuring delivery windows on your Send SMS actions. Sending messages during business hours in the recipient's timezone leads to better engagement and fewer opt-outs.
:::

::: tip Personalize Your Messages
Use merge tags like <code v-pre>{{Subscriber:FirstName}}</code> to personalize SMS messages. Personalized messages feel more relevant and typically see higher engagement rates.
:::

::: tip Maintain Suppression Lists
Regularly review and update your SMS suppression lists. Add numbers that have opted out, complained, or bounced to prevent sending to them again. This protects your sender reputation with SMS providers.
:::

::: tip Store Phone Numbers in E.164 Format
Use the international E.164 format for phone numbers (e.g., `+14155551234`). This ensures consistent handling across different SMS providers and countries, and avoids issues with missing country codes.
:::

## Related Features

- **[Lists](./lists)** — Manage subscriber lists and configure SMS settings for each list.
- **[Custom Fields](./custom-fields)** — Create custom fields to store subscriber phone numbers and carrier information.
- **[Journeys](./journeys)** — Build automated workflows that include SMS actions alongside email and other actions.
- **[Subscribers](./subscribers)** — Manage subscriber data including phone numbers.
- **[Segments](./segments)** — Create targeted segments for your SMS campaigns.
- **[Email Personalization](./email-personalization)** — Learn about merge tags and personalization syntax used in both email and SMS.
