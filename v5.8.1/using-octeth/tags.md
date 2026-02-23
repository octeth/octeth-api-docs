---
layout: doc
---

# Tags

Tags are lightweight labels you can attach to campaigns and subscribers to organize, filter, and target your data. Octeth provides two separate tag systems: **campaign tags** for categorizing email campaigns, and **subscriber tags** for labeling subscribers within a list.

This article covers how to create, manage, and use both types of tags, including how to tag subscribers, filter campaigns by tag, and leverage tags in segments and journeys.

## What Are Tags?

A tag is a short text label you assign to a campaign or subscriber. Tags provide a flexible way to categorize and group items without changing their underlying data. Unlike custom fields (which store structured data per subscriber) or segments (which define dynamic filter rules), tags are simple labels you apply and remove as needed.

Octeth has two tag systems:

| Aspect | Campaign Tags | Subscriber Tags |
|---|---|---|
| **Purpose** | Organize and filter email campaigns. | Categorize and target subscribers within a list. |
| **Scope** | Shared across all campaigns for the user. | Scoped to a specific subscriber list. |
| **Managed from** | **Settings** > **Tags**. | A subscriber list's **Subscriber Tags** page. |
| **Used in** | Campaign listing sidebar, search filters. | Subscriber profiles, segments, journey triggers, journey actions. |

## Campaign Tags

Campaign tags help you organize your email campaigns into groups. You can assign tags to campaigns and then filter the campaign listing by tag.

### Browsing Campaign Tags

To view your campaign tags, navigate to **Settings** > **Tags** from the main menu.

[[SCREENSHOT: Campaign Tags page under Settings showing the tag list with checkboxes, tag names, and the Select All/None and Delete/Create links above the table]]

The page displays all your campaign tags in a table. Each row shows a checkbox and the tag name. If you have not created any tags yet, a message indicates that no tags are available.

Above the table, the following actions are available:

- **Select All** / **Select None** — Quickly select or deselect all tags.
- **Delete** — Delete the selected tags.
- **Create New Tag** — Create a new campaign tag.

### Creating a Campaign Tag

1. Navigate to **Settings** > **Tags**.
2. Click **Create New Tag**.
3. Enter a name for the tag in the prompt dialog.
4. Click **OK**.

The tag is created and appears in the tag list.

### Editing a Campaign Tag

1. Click the tag name in the tag list.
2. Enter the new name in the prompt dialog.
3. Click **OK**.

### Deleting Campaign Tags

1. Select the tags you want to delete using the checkboxes.
2. Click **Delete**.
3. Confirm the deletion when prompted.

::: danger
Deleting a campaign tag removes it from all campaigns it was assigned to. This action cannot be undone.
:::

### Assigning Tags to Campaigns

To assign a tag to one or more campaigns:

1. Navigate to **Campaigns** from the main menu.
2. Select the campaigns using the checkboxes.
3. Click **Assign Tag** in the toolbar.
4. Select a tag from the dropdown menu.

The tag is immediately applied to all selected campaigns. Tags appear as small labels next to campaign names in the listing.

### Filtering Campaigns by Tag

The campaign browse page displays a **Tags** section in the left sidebar. Click a tag name to filter the campaign listing and show only campaigns with that tag. You can also use the search bar with the `tag:` field to find campaigns by tag name.

## Subscriber Tags

Subscriber tags let you label individual subscribers within a list. Tags are defined per list, meaning each subscriber list has its own set of available tags.

### Browsing Subscriber Tags

To view the subscriber tags for a list:

1. Navigate to the subscriber list.
2. Click **Subscriber Tags** in the sidebar navigation.

[[SCREENSHOT: Subscriber Tags page showing the Browse Subscriber Tags tab with a list of tags displaying tag names and tag IDs, plus the Create a New Tag tab]]

The page provides a tab-based interface:

- **Browse Subscriber Tags** — Displays all tags for the list with their names and IDs. Select tags using checkboxes and click **Delete** to remove them.
- **Create a New Tag** — Enter a tag name and click **Create** to add a new tag.
- **Edit Tag** — Appears when you click a tag name to edit it. Update the name and click **Save**.

### Creating a Subscriber Tag

1. Navigate to the subscriber list and click **Subscriber Tags** in the sidebar.
2. Click the **Create a New Tag** tab.
3. Enter a tag name in the **Name** field.
4. Click **Create**.

The tag is created and appears in the browse list.

::: info
Subscriber tag names are stored in lowercase. Tags must be unique within the same list — you cannot create two tags with the same name on a single list.
:::

### Editing a Subscriber Tag

1. On the **Browse Subscriber Tags** tab, click the tag name you want to edit.
2. The **Edit Tag** tab opens with the current tag name.
3. Update the name.
4. Click **Save**.

### Deleting Subscriber Tags

1. On the **Browse Subscriber Tags** tab, select the tags you want to delete using the checkboxes.
2. Click **Delete**.
3. Confirm the deletion when prompted.

::: danger
Deleting a subscriber tag removes it from all subscribers in the list. This action cannot be undone.
:::

### Tag Naming Rules

Both campaign tags and subscriber tags follow these naming rules:

| Rule | Details |
|---|---|
| **Allowed characters** | Letters, numbers, hyphens (`-`), and underscores (`_`). |
| **Maximum length** | 250 characters. |
| **Uniqueness** | Campaign tags must be unique per user. Subscriber tags must be unique per list. |
| **Case** | Subscriber tags are stored as lowercase. |

## Tagging Subscribers

You can apply tags to subscribers in several ways.

### From the Subscriber Profile

When viewing a subscriber's profile, the **Tags** section displays all tags currently applied to the subscriber as badges.

[[SCREENSHOT: Subscriber profile page showing the Tags section with tag badges, the X button to remove a tag, and the Add a tag link]]

- **Add a tag** — Click the **Add a tag** link. A modal opens where you can select an existing tag from the dropdown or create a new tag by selecting the **Create a new tag** option and entering a name. Click **Apply Tag** to confirm.
- **Remove a tag** — Hover over a tag badge and click the **x** button. Confirm the removal when prompted.

### From the Subscriber Actions Menu

On the subscriber profile page, the **Actions** dropdown menu provides two tag-related options:

- **Tag subscriber** — Opens the same tag modal described above, allowing you to select or create a tag.
- **Untag subscriber** — Opens the modal in removal mode, showing only tags currently applied to the subscriber. Select the tag to remove and click **Remove Tag**.

### Automatically via Journeys

Journey automations can add and remove tags from subscribers as part of an automated workflow. Use the **Add Tag** and **Remove Tag** journey actions to apply or remove tags when subscribers reach a specific point in a journey. See [Journeys](./journeys) for details on configuring tag actions.

## Using Tags Across Octeth

Tags integrate with several features throughout Octeth, making them a versatile tool for subscriber management and campaign targeting.

### In Segments

Segment rules can filter subscribers based on their tags. When building a segment, select the **Tag** rule type to use the following operators:

| Operator | Description |
|---|---|
| **Has this tag** | The subscriber has the specified tag. |
| **Does not have this tag** | The subscriber does not have the specified tag. |
| **Has any of these tags** | The subscriber has at least one of the selected tags. |
| **Has all of these tags** | The subscriber has every one of the selected tags. |
| **Has no tags** | The subscriber has no tags assigned at all. |

Combining tag rules with other segment criteria lets you build precise audience groups. For example, create a segment for subscribers who have the tag `vip` and opened an email in the last 30 days. See [Segments](./segments) for details on the rule builder.

### In Journeys

Tags can serve as both **triggers** and **actions** in journey automations:

**As triggers:**

| Trigger | Description |
|---|---|
| **Tag** | Starts the journey when a specific tag is added to a subscriber. |
| **Untag** | Starts the journey when a specific tag is removed from a subscriber. |

**As actions:**

| Action | Description |
|---|---|
| **Add Tag** | Adds a specified tag to the subscriber at that point in the journey. |
| **Remove Tag** | Removes a specified tag from the subscriber at that point in the journey. |

This allows you to build workflows where tagging a subscriber triggers an automated sequence, or where journey steps apply tags for tracking progress. See [Journeys](./journeys) for details.

### In Email Campaigns

Campaign tags help you organize and locate campaigns:

- **Tag labels** appear next to campaign names in the campaign listing.
- **Sidebar filtering** lets you click a tag to show only campaigns with that tag.
- **Bulk assignment** lets you select multiple campaigns and assign a tag in one action.
- **Search query** supports the `tag:` field for finding campaigns by tag name.

See [Email Campaigns](./email-campaigns) for details on campaign management.

## Tips and Best Practices

::: tip Plan a Naming Convention
Establish a consistent naming convention for your tags before creating them. For example, use prefixes like `interest-`, `source-`, or `status-` to group related tags (e.g., `interest-webinars`, `source-tradeshow`, `status-vip`). This makes it easier to find and manage tags as your list grows.
:::

::: tip Combine Tags with Segments
Tags work best when combined with segments. Create tags to label subscribers based on behavior or attributes, then build segments using tag rules to target those groups in campaigns. This approach is more flexible than relying on custom fields alone.
:::

::: tip Use Journey Tag Triggers for Automation
Set up journeys that trigger when a tag is applied. For example, when a subscriber receives the `new-customer` tag, automatically start a welcome email sequence. This lets you trigger automations from any system or process that can apply tags.
:::

::: tip Keep Tags Clean
Periodically review your tags and remove any that are no longer in use. Unused tags can clutter the tag dropdown and make it harder to find the right tag when tagging subscribers.
:::

## Related Features

- **[Subscribers](./subscribers)** — Browse, add, import, and manage subscribers in your lists.
- **[Segments](./segments)** — Create dynamic subscriber groups using tag-based rules.
- **[Email Campaigns](./email-campaigns)** — Organize campaigns with tags and target segments.
- **[Journeys](./journeys)** — Use tags as triggers and actions in automated workflows.
- **[Custom Fields](./custom-fields)** — Store structured subscriber data beyond tags.
