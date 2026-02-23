---
layout: doc
---

# Segments

Segments are dynamic filters that create sub-groups of subscribers based on rules you define. Instead of manually selecting subscribers, you define conditions — such as subscriber data, engagement activity, tags, or journey status — and the segment automatically includes every subscriber who matches. Segments update dynamically, so as subscribers change, the segment membership adjusts automatically.

This article covers how to browse, create, configure, and manage segments, including the rule builder, available rule types, and how segments are used across Octeth.

## What Are Segments?

A segment is a saved set of rules applied to a subscriber list. When Octeth evaluates a segment, it checks each subscriber against the rules and includes those who match. Segments are not static copies of subscribers — they are live filters that always reflect the current state of your list data.

Segments are useful for:

- **Targeted campaigns** — Send emails only to subscribers who meet specific criteria, such as active subscribers in a particular region or those who opened a recent campaign.
- **Engagement-based filtering** — Identify subscribers who have not opened any email in the last 90 days, or those who clicked a specific link.
- **Data-driven decisions** — Combine multiple criteria to build precise audience groups without manual work.

Each segment belongs to a specific subscriber list and uses that list's subscriber data and custom fields to evaluate its rules.

## Browsing Segments

To view the segments for a list, navigate to the list and click **Segments** in the sidebar navigation.

[[SCREENSHOT: Segments browse page showing the list of segments with subscriber counts, action links, and the Create New Segment button]]

### Segment Table

Each row in the table represents a segment and displays:

| Column | Description |
|---|---|
| **Checkbox** | Select individual segments for bulk actions. |
| **Segment Name** | The name of the segment. Click to open the segment for editing. |
| **Subscribers** | The number of subscribers currently matching the segment's rules. |
| **Actions** | Quick-access links to copy the segment or view matching subscribers. |

Use the **Select All** and **Select None** links above the table to quickly select or deselect all segments.

### Available Actions

From the segments browse page, you can:

- **Edit a segment** — Click the segment name to open the rule editor.
- **Copy a segment** — Click the copy link to duplicate the segment to the same or another list.
- **View subscribers** — Click the subscribers link to browse the subscribers matching the segment.
- **Delete segments** — Select one or more segments using the checkboxes and click **Delete Segments**.

::: danger
Deleting a segment is permanent and cannot be undone. Any campaign recipient assignments referencing the deleted segment are also removed.
:::

## Creating a Segment

To create a new segment:

1. Navigate to the subscriber list where you want to create the segment.
2. Click **Segments** in the sidebar navigation.
3. Click **Create New Segment**.

[[SCREENSHOT: Segment creation form showing the segment name field, segment operator dropdown, and the empty rule builder with the Add Group button]]

4. Enter a **Segment Name** — choose a descriptive name that reflects the purpose of the segment, such as "Active Gmail Users" or "Opened Last Campaign".

5. Select the **Segment Operator**:

| Operator | Description |
|---|---|
| **And** | A subscriber must match **all** rules to be included in the segment. |
| **Or** | A subscriber must match **at least one** rule to be included in the segment. |

6. Build your segment rules using the rule builder (see [Building Segment Rules](#building-segment-rules)).

7. Optionally, enable **Random Sampling** to select a random subset of matching subscribers (see [Random Sampling](#random-sampling)).

8. Click **Save** to create the segment.

## Building Segment Rules

The rule builder is the core of segment creation. It provides a visual interface for defining the conditions that determine which subscribers belong to the segment.

[[SCREENSHOT: Rule builder with two groups, each containing multiple rules, showing AND/OR separators between rules and the Add Group button at the bottom]]

### Groups and Sub-Groups

Rules are organized into **groups**. Each group contains one or more rules, and you can nest **sub-groups** within a group for more complex logic.

- **Between groups**, the segment operator (AND/OR) determines how groups relate to each other.
- **Within a group**, rules use the opposite logic — if the segment operator is AND, rules within a group use OR logic, and vice versa. This alternating pattern allows you to build complex conditions.

To get started:

1. Click **Add Group** to create your first rule group.
2. Within the group, click **Add Rule** to add a condition.
3. Select the rule type, configure the field, operator, and value.
4. Click **Confirm** to add the rule.
5. Repeat to add more rules or groups as needed.

### Adding a Rule

When you click **Add Rule**, a form appears with the following steps:

1. **Select the rule type** — Choose from Subscriber Field, Segment, Tag, Campaign Event, Journey, Website Event, or Suppression.
2. **Configure the rule** — Depending on the rule type, select a field, operator, and value. The available options change based on the rule type you select.
3. **Confirm the rule** — Click the confirm button to add the rule to the group.

Each rule is displayed as a compact summary card showing the field, operator, and value. You can remove a rule by clicking the remove button on its card.

### Removing Rules and Groups

- To remove a single rule, click the **remove** button on the rule card.
- To remove an entire group (including all its rules), click the **remove** button on the group header.
- To clear all rules and start over, remove all groups from the board.

## Segment Rule Types

The rule builder supports several rule types, each designed to filter subscribers based on different criteria.

### Subscriber Field Rules

Subscriber field rules filter based on subscriber data — both default system fields and custom fields you have defined for the list.

**Available default fields:**

| Field | Description |
|---|---|
| **Email Address** | The subscriber's email address. |
| **Subscription Status** | Current status: Subscribed, Unsubscribed, Opt-In Pending, or Opt-Out Pending. |
| **Bounce Type** | Bounce status: Not Bounced, Hard Bounced, or Soft Bounced. |
| **Subscription Date** | The date the subscriber was added to the list. |
| **Opt-In Date** | The date the subscriber confirmed their subscription. |
| **Subscription IP** | The IP address recorded when the subscriber joined. |
| **Subscriber ID** | The unique numeric identifier for the subscriber. |

In addition to default fields, all **custom fields** defined for the list are available as rule criteria.

The operators available for each field depend on the field type:

**Text fields** (email address, text-based custom fields):
Is, Is not, Contains, Does not contain, Begins with, Ends with, Is set, Is not set

**Numeric fields** (subscriber ID, numeric custom fields):
Equals to, Is greater than, Is smaller than

**Date fields** (subscription date, opt-in date, date custom fields):
Is, Is not, Is before, Is after, Is set, Is not set, In the last X days, Not in the last X days, In the next X days, Not in the next X days, Is exactly X days ago, Is exactly X days from now, Between, Not between

**Enum fields** (subscription status, bounce type, dropdown custom fields):
Is, Is not, Contains, Does not contain

::: tip
Date operators like "In the last X days" are evaluated dynamically. A segment with the rule "Subscription Date is in the last 30 days" always reflects the most recent 30-day window, not a fixed date range.
:::

### Segment Rules

Segment rules filter subscribers based on membership in another segment. This lets you build layered segments that reference each other.

| Operator | Description |
|---|---|
| **Belongs to** | The subscriber is a member of the selected segment. |
| **Does not belong to** | The subscriber is not a member of the selected segment. |

Select the target segment from the dropdown. Only other segments in the same list are available.

::: warning
Avoid creating circular references where Segment A references Segment B and Segment B references Segment A. Octeth has built-in recursion protection that limits nesting depth, but circular references can lead to unexpected results.
:::

### Tag Rules

Tag rules filter subscribers based on the tags assigned to them.

| Operator | Description |
|---|---|
| **Has this tag** | The subscriber has the specified tag. |
| **Does not have this tag** | The subscriber does not have the specified tag. |
| **Has any of these tags** | The subscriber has at least one of the selected tags. |
| **Has all of these tags** | The subscriber has every one of the selected tags. |
| **Has no tags** | The subscriber has no tags assigned at all. |

Select one or more tags from the list of tags defined for the subscriber list.

### Campaign Event Rules

Campaign event rules filter subscribers based on their interactions with email campaigns.

**Available operators:**

| Operator | Description |
|---|---|
| **Opened** / **Not opened** | Whether the subscriber opened the campaign email. |
| **Clicked** / **Not clicked** | Whether the subscriber clicked a link in the campaign. |
| **Bounced** / **Not bounced** | Whether the campaign email bounced for the subscriber. |
| **Unsubscribed** / **Not unsubscribed** | Whether the subscriber unsubscribed via the campaign. |
| **Complained** / **Not complained** | Whether the subscriber marked the email as spam. |
| **Delivered** / **Not delivered** | Whether the campaign was successfully delivered. |
| **Failed** / **Not failed** | Whether delivery failed for the subscriber. |

**Campaign selection:**

You can apply campaign event rules to a specific campaign, multiple campaigns, or any campaign.

**Time filters (optional):**

Campaign event rules support optional time-based filtering:
- In the last X days / Not in the last X days
- Between two dates
- Before / After a specific date

::: tip
Combine campaign event rules with time filters to create powerful engagement segments. For example, "Opened any campaign in the last 30 days" identifies your most engaged subscribers, while "Not opened any campaign in the last 90 days" identifies subscribers who may need a re-engagement campaign.
:::

### Journey Rules

Journey rules filter subscribers based on their status in journey automations.

**Journey status operators:**

| Operator | Description |
|---|---|
| **In journey** | The subscriber is currently enrolled in the selected journey. |
| **Completed journey** | The subscriber has completed the selected journey. |
| **Not in journey** | The subscriber has never been enrolled or is no longer in the journey. |

**Journey email action operators:**

| Operator | Description |
|---|---|
| **Opened** / **Not opened** | Whether the subscriber opened an email sent by the journey. |
| **Clicked** / **Not clicked** | Whether the subscriber clicked a link in a journey email. |
| **Bounced** / **Not bounced** | Whether a journey email bounced for the subscriber. |
| **Unsubscribed** | Whether the subscriber unsubscribed via a journey email. |
| **Complained** / **Not complained** | Whether the subscriber reported a journey email as spam. |

Select the journey and optionally a specific email action within the journey.

### Website Event Rules

Website event rules filter subscribers based on tracked website activity. These rules require [Event Tracking](./event-tracking) to be configured for the list.

**Simple operators:**

| Operator | Description |
|---|---|
| **Happened** / **Did not happen** | Whether the event has ever occurred. |
| **Happened in the last X days** / **Did not happen in the last X days** | Whether the event occurred within a time window. |

**Advanced operators** (for filtering on event parameters):

Equals, Does not equal, Contains, Does not contain, Matches regex, Does not match regex, Greater than, Less than, Is set, Is not set

Event parameters available for filtering include page title, current URL, email address, conversion value, and event name.

### Suppression Rules

Suppression rules filter subscribers based on whether their email address appears in a suppression list.

| Operator | Description |
|---|---|
| **Exists** | The subscriber's email address is in the suppression list. |
| **Does not exist** | The subscriber's email address is not in the suppression list. |

## Random Sampling

When creating or editing a segment, you can enable **Random Sampling** to randomly select a subset of the matching subscribers rather than including all of them.

1. Check the **Random Sampling** option on the segment form.
2. Enter the desired **Audience Size** — the number of subscribers to randomly select from the full segment.

This is useful for A/B testing scenarios where you want to send a campaign to a random sample of a segment rather than the entire group.

::: info
Random sampling uses a deterministic method, so the same random selection is maintained consistently when paginating through segment results.
:::

## Editing a Segment

To edit an existing segment:

1. Navigate to the subscriber list containing the segment.
2. Click **Segments** in the sidebar navigation.
3. Click the segment name in the table.
4. Modify the segment name, operator, or rules as needed.
5. Click **Save** to apply your changes.

The segment's subscriber count is recalculated after saving.

## Copying a Segment

You can copy a segment to duplicate its rules to the same list or a different list.

1. On the segments browse page, click the **Copy** link next to the segment you want to duplicate.
2. Select the target list (or lists) where you want to copy the segment.

[[SCREENSHOT: Copy segment page showing the source segment name, target list selection dropdown, and the custom field mapping section]]

### Copying to a Different List

When copying a segment to a different list, custom field references in the segment rules may need to be remapped. The copy page displays a field mapping section where you match custom fields from the source list to equivalent fields in the target list.

Map each custom field used in the segment's rules to a corresponding field in the target list, then click **Copy** to complete the operation.

::: info
If the target list does not have equivalent custom fields for all rules in the segment, those rules may not function correctly after copying. Ensure the target list has matching custom fields before copying.
:::

## Deleting Segments

To delete one or more segments:

1. Navigate to the subscriber list containing the segments.
2. Click **Segments** in the sidebar navigation.
3. Select the segments you want to delete using the checkboxes.
4. Click **Delete Segments**.
5. Confirm the deletion when prompted.

::: danger
Deleting segments is permanent and cannot be undone. Campaign recipient assignments that reference deleted segments are also removed.
:::

## Using Segments in Octeth

Segments are used across several features in Octeth:

### In Email Campaigns

When creating or editing an email campaign, you can target specific segments as recipients. Segments can be used to both **include** and **exclude** subscribers:

- **Include** — Only subscribers matching the segment receive the campaign.
- **Exclude** — Subscribers matching the segment are excluded from the campaign, even if they match other inclusion criteria.

This allows precise audience targeting by combining multiple segments. For more details, see [Email Campaigns](./email-campaigns).

### In the Subscriber Browse Page

The subscriber browse page displays a **Segments** section in the left sidebar when segments exist for the list. Click a segment name to filter the subscriber table to show only subscribers matching that segment's rules. See [Subscribers](./subscribers) for details.

### In Subscriber Exports

When exporting subscribers from a list, you can select a segment as a filter to export only the subscribers who match that segment. See [Subscribers](./subscribers#exporting-subscribers) for details.

### In Journeys

Segments can be used as enrollment criteria or decision points within journey automations. See [Journeys](./journeys) for details.

## Global Segments (Administrator)

Administrators have access to **Global Segments**, which are system-wide segments not tied to any specific subscriber list. Global segments are managed from the admin panel and can be assigned to specific user groups.

### Accessing Global Segments

Navigate to **Segments** in the administrator panel. The page provides three tabs: **Browse**, **Create**, and **Edit**.

[[SCREENSHOT: Admin global segments page showing the browse tab with the list of global segments and their subscriber counts]]

### How Global Segments Differ from List Segments

| Aspect | List Segments | Global Segments |
|---|---|---|
| **Scope** | Belong to a specific subscriber list. | Apply across the entire system. |
| **Created by** | Users with segment permissions. | Administrators only. |
| **User group control** | Not applicable — available to the list owner. | Can be assigned to specific user groups. |
| **Delivery server** | Uses the campaign's delivery server. | Can override the delivery server per user group. |

### Creating a Global Segment

1. Navigate to **Segments** in the admin panel.
2. Click the **Create** tab.
3. Enter a **Segment Name**.
4. Select the **Segment Operator** (And / Or).
5. Build the segment rules using the rule builder. Global segments use global custom fields rather than list-specific custom fields.
6. **Assign to User Groups** — Check the user groups that should have access to this segment. For each selected user group, you can optionally select a **Delivery Server** override:

| Option | Description |
|---|---|
| **Use Default** | The user group's default delivery server is used. |
| **Specific Server** | Select a delivery server from the list to override the default for this user group. |

7. Click **Create** to save the global segment.

[[SCREENSHOT: Admin global segment create form showing the segment name, operator, rule builder, user group checkboxes with delivery server dropdowns]]

### Editing a Global Segment

Click a segment name on the browse tab to load the **Edit** tab. Modify the segment name, operator, rules, user group assignments, or delivery server overrides as needed, then click **Update**.

### Deleting Global Segments

Select one or more global segments using the checkboxes on the browse tab and click **Delete**. Confirm the deletion when prompted.

::: warning
Deleting a global segment removes it from all user groups it was assigned to. Ensure no active campaigns depend on the segment before deleting.
:::

## Tips and Best Practices

::: tip Start Simple
Begin with one or two rules and verify the subscriber count matches your expectations before adding more complexity. You can always add rules later by editing the segment.
:::

::: tip Use Descriptive Names
Name segments clearly so that you and your team can quickly identify their purpose. Names like "Active Subscribers - Last 30 Days" or "Gmail Users - Hard Bounced" are more useful than "Segment 1".
:::

::: tip Combine Segments for Precision
Use segment rules to reference other segments. For example, create a "VIP Customers" segment and a "Recent Openers" segment, then create a third segment that requires membership in both.
:::

::: tip Monitor Segment Counts
After creating or editing a segment, check the subscriber count to ensure the rules are working as expected. An unexpectedly high or low count may indicate a rule configuration issue.
:::

::: tip Use Exclusion Segments in Campaigns
When sending campaigns, use segment exclusions to avoid emailing subscribers who recently received another campaign, or those who have already converted on a particular offer.
:::

## Related Features

- **[Subscribers](./subscribers)** — Browse, add, import, and manage subscribers in your lists.
- **[Custom Fields](./custom-fields)** — Create additional data fields used in segment rules.
- **[Tags](./tags)** — Assign labels to subscribers and use them in tag-based segment rules.
- **[Email Campaigns](./email-campaigns)** — Target segments as campaign recipients.
- **[Journeys](./journeys)** — Use segments for journey enrollment and decision points.
- **[Event Tracking](./event-tracking)** — Track website events used in website event segment rules.
- **[Suppression Lists](./email-deliverability/suppression-lists)** — Manage suppressed addresses used in suppression segment rules.
