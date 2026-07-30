---
layout: doc
---

# Auto Responders

Auto responders are automated emails that are sent to subscribers when a specific event occurs. For example, you can send a welcome email immediately after a subscriber joins your list, or a reminder email on a subscriber's birthday every year.

Each auto responder belongs to a subscriber list and is configured with a trigger event, a timing delay, and an email to send. When the trigger event occurs for a subscriber, Octeth automatically schedules and delivers the email based on your timing settings.

This article covers how to browse, create, edit, clone, copy, and manage auto responders, as well as how to configure triggers, timing, repeat settings, and view performance reports.

## What Are Auto Responders?

An auto responder is a single automated email linked to a specific subscriber list. It fires when a defined trigger event occurs — such as a new subscription, a link click, or a date milestone. You control when the email is sent relative to the trigger by configuring a timing delay (immediately, minutes later, days later, etc.).

Key characteristics of auto responders:

- **Per-list** — Each auto responder belongs to one subscriber list. The trigger events and email content are specific to that list.
- **Event-driven** — Auto responders activate in response to subscriber actions or date-based events, not manual sends.
- **Configurable timing** — You choose whether the email sends immediately or after a delay of seconds, minutes, hours, days, weeks, or months.
- **Optional repeat** — Auto responders can be configured to repeat at regular intervals, sending the same email multiple times on a schedule.
- **Independent emails** — Each auto responder has its own email content, separate from your regular email campaigns.

::: tip
If you need complex multi-step automations with branching logic, conditions, and multiple actions, consider using [Journeys](./journeys) instead. Auto responders are best suited for simple, single-email automations triggered by a specific event.
:::

## Accessing Auto Responders

Auto responders are managed within a subscriber list. To access them:

1. Navigate to the subscriber list you want to work with.
2. Click **Autoresponders** in the left sidebar navigation.

[[SCREENSHOT: Subscriber list sidebar navigation with the Autoresponders menu item highlighted]]

This opens the auto responders browse page for the selected list.

## Browsing Auto Responders

The browse page displays all auto responders configured for the current list.

[[SCREENSHOT: Auto responders browse page showing a list of auto responders with their names, trigger descriptions, statistics, and action links]]

### Auto Responder Table

Each row in the table represents an auto responder and displays:

| Column | Description |
|---|---|
| **Checkbox** | Select individual auto responders for bulk actions. |
| **Name** | The auto responder name. Click to open it for editing. |
| **Report** | Link to the performance report for this auto responder. |
| **Clone** | Link to duplicate this auto responder within the same list. |
| **Unique Opens** | The number of unique subscribers who opened the auto responder email. |
| **Unique Clicks** | The number of unique subscribers who clicked a link in the email. |
| **Unique Forwards** | The number of unique subscribers who forwarded the email. |
| **Unique Browser Views** | The number of unique subscribers who viewed the email in their browser. |
| **Total Unsubscriptions** | The number of subscribers who unsubscribed after receiving this email. |
| **Trigger Description** | A summary of the trigger event and timing, such as "Will be sent immediately on subscription." |

::: warning
If an auto responder does not have an email set up yet, a warning message is displayed: "This autoresponder does not have an email set yet." The auto responder will not send anything until you create its email content.
:::

### Available Actions

From the browse page toolbar, you can:

- **Select All / Select None** — Quickly select or deselect all auto responders.
- **Delete** — Delete the selected auto responders (see [Deleting Auto Responders](#deleting-auto-responders)).
- **Copy** — Copy auto responders from another list (see [Copying Auto Responders from Another List](#copying-auto-responders-from-another-list)).
- **Create** — Create a new auto responder (see [Creating an Auto Responder](#creating-an-auto-responder)).

## Creating an Auto Responder

To create a new auto responder:

1. Navigate to the subscriber list where you want to add the auto responder.
2. Click **Autoresponders** in the left sidebar navigation.
3. Click **Create** in the toolbar.

[[SCREENSHOT: Auto responder creation form showing the name field, trigger type dropdown, timing settings, and repeat options]]

4. Enter an **Autoresponder name** — choose a descriptive name that identifies the purpose of this auto responder, such as "Welcome Email", "Birthday Reminder", or "Post-Click Follow Up".

5. Select a **Triggers on** event from the dropdown. This determines what subscriber event will fire this auto responder. See [Trigger Types](#trigger-types) for a detailed explanation of each option.

6. Configure any additional fields that appear based on the selected trigger type:

   - **For Link click:** Enter the **URL** that the subscriber must click to trigger the auto responder. This must exactly match the tracked URL in your campaign email.
   - **For Campaign open or Campaign conversion:** Select the **Campaign** from the dropdown. The list shows all your campaigns.
   - **For Date information:** Select the **Date field** (either "Subscription Date" or a custom date field defined on this list) and choose the **Send frequency** ("Every month" or "Every year").

7. Configure the **Send** timing:

   - Select the time unit from the dropdown: **Immediately**, **Seconds later**, **Minutes later**, **Hours later**, **Days later**, **Weeks later**, or **Months later**.
   - If you selected anything other than **Immediately**, enter the number of time units in the input field that appears. For example, selecting `3` and `Days later` means the email will be sent 3 days after the trigger event occurs.

8. Configure the **Repeat For** setting:

   - Select **Disabled** if the auto responder should send only once per trigger event.
   - Select **Enabled** to send the email multiple times at regular intervals after the initial send. When enabled, additional fields appear (see [Repeat Settings](#repeat-settings)).

9. Click **Save**.

After saving, you are automatically redirected to the email editor where you can create the email content for this auto responder. The auto responder is created but will not send until the email content is set up.

::: tip
Give your auto responders clear, descriptive names. When you have multiple auto responders on the same list, good naming makes it easy to identify each one at a glance — for example, "Welcome - Immediate", "Welcome - 3 Day Follow Up", "Birthday Greeting".
:::

## Trigger Types

The trigger type determines which subscriber event activates the auto responder. Octeth supports six trigger types:

| Trigger Type | Description | Additional Configuration |
|---|---|---|
| **Subscription** | Fires when a subscriber completes their opt-in to the list. For double opt-in lists, this triggers after the subscriber clicks the confirmation link. | None. |
| **Link click** | Fires when a subscriber clicks a specific URL in any email sent from this list. | Enter the exact **URL** that must be clicked. |
| **Campaign open** | Fires when a subscriber opens a specific email campaign. | Select the **Campaign** from the dropdown. |
| **Campaign conversion** | Fires when a subscriber triggers a conversion event from a specific email campaign. | Select the **Campaign** from the dropdown. |
| **Forward to friend** | Fires when a subscriber uses the forward-to-friend feature on any email from this list. | None. |
| **Date information** | Fires on a recurring date based on a subscriber's date field value — for example, every year on a subscriber's birthday, or every month on their subscription anniversary. | Select the **Date field** and the **Send frequency** (Every month or Every year). |

### Subscription Trigger

The most common trigger type. Use this to send welcome emails, onboarding sequences, or introductory content to new subscribers. The trigger fires after the subscriber's opt-in is confirmed — for double opt-in lists, this means after the subscriber clicks the confirmation link in the opt-in email.

### Link Click Trigger

Use this to send a follow-up email when a subscriber clicks a specific link in one of your campaigns. The URL you enter must exactly match the tracked link URL in your email content. This is useful for sending targeted follow-ups based on subscriber interest — for example, if a subscriber clicks a link about a specific product, you can send them more information about that product.

### Campaign Open Trigger

Use this to follow up with subscribers who opened a specific campaign. Select the campaign from the dropdown list. This is useful for nurture sequences where you send additional content to engaged subscribers.

### Campaign Conversion Trigger

Similar to the campaign open trigger, but fires when a subscriber completes a conversion action (such as a purchase or signup) tracked through a specific campaign. Select the campaign from the dropdown list.

### Forward to Friend Trigger

Fires when a subscriber forwards an email to a friend using the built-in forward feature. Use this to thank subscribers who share your content or to reward referral behavior.

### Date Information Trigger

This trigger is unique because it is not based on a one-time event. Instead, it checks subscriber date fields on a recurring schedule and sends the email when the date matches.

**How it works:**

- You select a date field — either **Subscription Date** (built-in) or any custom field of type **Date field** that you have defined on the list.
- You choose a frequency: **Every month** (matches the day of the month) or **Every year** (matches the day and month).
- Octeth checks the date field values daily and sends the auto responder to any subscribers whose date matches.

**Example use cases:**

- **Birthday greetings:** Create a custom date field called "Birthday", set the trigger to that field with "Every year" frequency, and send a birthday greeting email.
- **Monthly anniversary:** Use the "Subscription Date" field with "Every month" frequency to send a monthly check-in to subscribers.
- **Renewal reminders:** Use a custom "Renewal Date" field with "Every year" frequency to remind subscribers about upcoming renewals.

::: tip
When using the date information trigger with a timing delay, the delay is applied relative to the matching date. For example, if you set the trigger to fire on a subscriber's birthday with a delay of "1 Days later", the email is sent one day after the birthday.
:::

## Setting Up the Auto Responder Email

After creating an auto responder, you need to set up its email content. The auto responder will not send until an email is configured.

### Creating the Email

When you save a new auto responder, you are automatically redirected to the email editor. If you navigate away before creating the email, you can return to it later:

1. Open the auto responder by clicking its name in the browse page.
2. Click the **Create email** button at the bottom of the edit form.

This opens the email editor where you can compose the email content, set the subject line, choose the sender address, and design the email body.

### Editing the Email

If the auto responder already has an email, you can edit it:

1. Open the auto responder by clicking its name in the browse page.
2. Click the **Edit email** button at the bottom of the edit form.

::: info
The auto responder email supports all the same personalization tags available in regular email campaigns. You can use merge tags like <code v-pre>{{ Subscriber:EmailAddress }}</code> or custom field tags to personalize the content for each recipient. See [Email Personalization](./email-personalization) for details.
:::

## Editing an Auto Responder

To edit an existing auto responder's settings:

1. Navigate to the subscriber list containing the auto responder.
2. Click **Autoresponders** in the left sidebar navigation.
3. Click the auto responder name in the browse table.

[[SCREENSHOT: Auto responder edit form showing pre-populated settings with the Save changes button and Edit email / Create email button at the bottom]]

The edit form opens with the same fields as the creation form, pre-populated with the current settings. Modify the desired fields and click **Save changes**.

At the bottom of the edit form, you will see either:

- **Edit email** — If the auto responder already has an email configured. Click to open the email editor.
- **Create email** — If no email has been set up yet. Click to create the email content.

## Repeat Settings

By default, an auto responder sends its email once per trigger event. The repeat feature allows you to send the same email multiple times at regular intervals after the initial send.

To configure repeat settings:

1. In the auto responder create or edit form, set **Repeat For** to **Enabled**.
2. Configure the repeat schedule that appears:

   - **Repeat every** — Enter a number and select the time unit (**Hours** or **Days**). This defines the interval between each repeat send.
   - **for** — Enter the maximum number of times the email should repeat.

**Example:** Setting "Repeat every `7` `Days` for `4` times" means:
- The first email sends based on your trigger timing settings (e.g., immediately on subscription).
- 7 days later, the same email sends again.
- 7 days after that, it sends again.
- 7 days after that, it sends one final time.
- Total emails sent: 5 (the initial send plus 4 repeats).

::: tip
Repeat settings are useful for recurring reminders or regular check-ins. For example, you could create a weekly tips email that repeats 12 times, delivering 3 months of weekly content to each new subscriber.
:::

::: warning
All repeat sends use the same email content. If you need different content for each follow-up, create separate auto responders with increasing timing delays instead of using the repeat feature.
:::

## Cloning an Auto Responder

Cloning creates a duplicate of an auto responder within the same list, including a copy of its email content.

To clone an auto responder:

1. Navigate to the auto responders browse page for the list.
2. Click the **Clone** link on the row of the auto responder you want to duplicate.

A new auto responder is created with the name prefixed by "Copy of" — for example, cloning "Welcome Email" creates "Copy of Welcome Email". The clone includes a copy of the email content and all settings.

::: tip
Cloning is useful when you want to create a variation of an existing auto responder — for example, testing different timing delays or modifying the email content while keeping the original intact.
:::

## Copying Auto Responders from Another List

If you have auto responders configured on one list and want to use the same setup on another list, you can copy all auto responders from the source list.

1. Navigate to the target list where you want to add the auto responders.
2. Click **Autoresponders** in the left sidebar navigation.
3. Click **Copy** in the toolbar.

[[SCREENSHOT: Copy auto responders page showing the target list name and the source list dropdown]]

4. Select the **Copy from** list — this is the source list you want to copy auto responders from. The current list is excluded from this dropdown.
5. Click **Copy**.

All auto responders from the source list are copied to the target list, including their email content and settings.

::: info
Copying duplicates the auto responder configurations and their email content. The copies are independent — editing a copied auto responder on the target list does not affect the original on the source list.
:::

## Deleting Auto Responders

To delete one or more auto responders:

1. Navigate to the subscriber list containing the auto responders.
2. Click **Autoresponders** in the left sidebar navigation.
3. Select the auto responders you want to delete using the checkboxes.
4. Click **Delete** in the toolbar.
5. Confirm the deletion when prompted.

::: danger
Deleting an auto responder is permanent and cannot be undone. The auto responder's email content is also deleted, along with any pending scheduled sends in the delivery queue.
:::

## Auto Responder Reports

Each auto responder has a dedicated report page that shows detailed performance statistics over time.

To view the report:

1. Navigate to the auto responders browse page for the list.
2. Click the **Report** link on the row of the auto responder you want to analyze.

[[SCREENSHOT: Auto responder report page showing the time frame filter, interval selector, email preview panel on the left, and statistics table on the right]]

### Report Layout

The report page is divided into two panels:

**Left panel:**

- **Time Frame** — Select the date range for the report.
- **Interval** — Choose how data is grouped within the selected time frame.
- **Email Preview** — Displays the sender address, reply-to address, subject line, and a preview of the email content.

**Right panel:**

- **Statistics table** — Detailed performance metrics broken down by the selected interval and email service provider domain.
- **Totals section** — Aggregate numbers with comparisons to the prior period.

### Time Frame Options

Select the date range to analyze:

| Time Frame | Period Covered |
|---|---|
| **Today** | Current day. |
| **Yesterday** | Previous day. |
| **Last 7 days** | Past 7 days from today. |
| **Last 14 days** | Past 14 days from today. |
| **Last 28 days** | Past 28 days from today. |
| **This month** | Current calendar month. |
| **Last month** | Previous calendar month. |
| **Last 3 months** | Past 3 calendar months. |
| **This year** | Current calendar year. |
| **Last year** | Previous calendar year. |

### Interval Options

Choose how data is grouped within the selected time frame:

| Interval | Availability |
|---|---|
| **Daily** | Available for all time frames. |
| **Weekly** | Available when the time frame spans 14 days or more. |
| **Monthly** | Available when the time frame spans 3 months or more. |

### Statistics Tracked

The report tracks the following metrics for each interval period:

| Metric | Description |
|---|---|
| **Sent** | The number of auto responder emails sent during the period. |
| **Opened / Open Rate** | The number of unique opens and the percentage of sent emails that were opened. |
| **Clicked / Click Rate** | The number of unique clicks and the percentage of sent emails that received a click. |
| **Converted / Conversion Rate** | The number of conversions and the percentage of sent emails that resulted in a conversion. |
| **Unsubscribed / Unsubscription Rate** | The number of unsubscriptions and the percentage of sent emails that led to an unsubscribe. |
| **Bounced / Bounce Rate** | The number of bounced emails and the percentage of sent emails that bounced. |
| **Browser Viewed / Browser View Rate** | The number of unique browser views and the percentage of sent emails viewed in a browser. |
| **Forwarded / Forward Rate** | The number of unique forwards and the percentage of sent emails that were forwarded. |

### Totals and Comparisons

The totals section at the top of the statistics panel shows aggregate numbers for the selected time frame:

- **Emails sent** — Total number of auto responder emails delivered.
- **Open rate** — Overall unique open rate.
- **Delivered-to-click rate** — Overall click rate relative to delivered emails.

Each metric includes a comparison with the prior equivalent period, shown as a percentage change with a colored indicator:

- **Green arrow up** — Improvement over the prior period.
- **Red arrow down** — Decline from the prior period.

## Tips and Best Practices

::: tip Start with a Welcome Auto Responder
The most effective auto responder for most lists is a welcome email triggered on subscription. It confirms the subscriber's sign-up, sets expectations for future emails, and engages them while your brand is fresh in their mind. Set the timing to **Immediately** for maximum impact.
:::

::: tip Always Set Up the Email Content
An auto responder without email content will not send anything. After creating the auto responder, always follow through to the email editor to compose and save the email. Check the browse page for any warnings about missing emails.
:::

::: tip Create Sequenced Follow-Ups
You can simulate an email sequence by creating multiple auto responders on the same list with the same trigger type but different timing delays. For example, create three auto responders triggered on subscription: one set to **Immediately**, another to **3 Days later**, and a third to **7 Days later**. Each subscriber receives all three emails in sequence after subscribing.
:::

::: tip Use Date Triggers for Milestones
Date-based auto responders are ideal for birthday greetings, anniversary acknowledgments, and renewal reminders. Create a custom date field on your list, collect the date during subscription, and set up an auto responder with the **Date information** trigger.
:::

::: tip Monitor Your Reports Regularly
Check your auto responder reports periodically to track open rates, click rates, and unsubscription rates. If an auto responder has a high unsubscription or bounce rate, review the email content and timing to improve performance.
:::

::: tip Use Clone for Variations
When experimenting with different email content or timing for the same trigger, clone an existing auto responder instead of creating one from scratch. This saves time and ensures you start with a working configuration.
:::

## Related Features

- **[Lists](./lists)** — Auto responders belong to subscriber lists. Create and manage your lists before setting up auto responders.
- **[Custom Fields](./custom-fields)** — Date custom fields can be used as triggers for date-based auto responders.
- **[Email Personalization](./email-personalization)** — Personalize auto responder emails with subscriber data using merge tags.
- **[Email Campaigns](./email-campaigns)** — Campaign open and campaign conversion triggers reference specific email campaigns.
- **[Journeys](./journeys)** — For complex multi-step automations with conditions and branching logic, use journeys instead of auto responders.
- **[Segments](./segments)** — Combine auto responders with segments to target specific subscriber groups.
