---
layout: doc
---

# Suppression Lists

A suppression list is a collection of email addresses that are blocked from receiving any email delivery. When an email address is on a suppression list, Octeth skips it during campaign sending, transactional email delivery, journey email actions, and email gateway relay — regardless of whether the subscriber is still marked as "Subscribed" in a list. Suppression lists are a critical layer of protection for your sender reputation and regulatory compliance.

This article covers what suppression lists are, the different suppression scopes available, how email addresses get added to suppression lists (both automatically and manually), how to manage and remove suppressed addresses, how pattern-based (smart) suppression works, and how to use the API for suppression list management.

## Why Suppression Lists Matter

Your **sender reputation** depends on sending emails only to recipients who want them and whose addresses are valid. Even if a subscriber exists in your list with an active subscription status, there are situations where delivery should be permanently blocked — for example, if the address has hard bounced, the recipient has filed a spam complaint, or the address has been manually flagged.

Suppression lists act as a final safeguard that overrides subscription status. They ensure that problematic addresses are blocked at the delivery level, regardless of how they appear in your subscriber lists.

The consequences of not maintaining suppression lists include:

- Repeated delivery to invalid addresses, increasing your bounce rate
- Continued delivery to recipients who filed spam complaints, damaging your reputation
- Potential blacklisting by email providers
- Violations of email regulations such as CAN-SPAM, GDPR, and CASL

::: danger
Sending to suppressed addresses — particularly those that have filed spam complaints — is one of the fastest ways to damage your sender reputation. Email providers track complaint rates closely, and rates above 0.1% can trigger throttling or blocking. Suppression lists prevent this by ensuring these addresses never receive another email.
:::

## Suppression Scopes

Octeth implements a three-level suppression system. Each level controls how broadly the suppression applies. When an email is about to be delivered, Octeth checks all applicable suppression levels before sending.

### System-Level Suppression (Global)

System-level suppression blocks an email address across **all user accounts and all subscriber lists** on the entire Octeth installation. This is the broadest suppression scope.

- **Managed by:** Administrators
- **Applies to:** Every user account and every list on the system
- **Common sources:** Hard bounces, spam complaints, administrator manual entries

When an email address is suppressed at the system level, no user on the system can send to that address — even if the address exists as an active subscriber in their list.

::: warning
System-level suppressions override all other settings. Even if a user adds the address back to their subscriber list, delivery will still be blocked as long as the system-level suppression exists.
:::

### User-Level Suppression

User-level suppression blocks an email address across **all subscriber lists** belonging to a specific user account. Other user accounts on the system are not affected.

- **Managed by:** The user account owner
- **Applies to:** All lists owned by that user
- **Common sources:** User manual entries, API imports

This scope is useful when a user wants to ensure an address never receives email from any of their lists, without affecting other users on the system.

### List-Level Suppression

List-level suppression blocks an email address only within a **specific subscriber list**. The address can still receive emails from other lists owned by the same user.

- **Managed by:** The user account owner
- **Applies to:** A single subscriber list
- **Common sources:** User manual entries, list-specific opt-out actions

This scope is the most granular and is useful when a subscriber should be blocked from one list but may still be active on others.

### How Suppression Scopes Are Checked

When Octeth is about to deliver an email to a recipient, it checks all three suppression levels in a single query. If the email address matches **any** applicable scope, delivery is skipped.

For a delivery attempt by User X to a subscriber on List Y, Octeth checks:

1. **System-level:** Is this email address suppressed globally?
2. **User-level:** Is this email address suppressed for User X across all lists?
3. **List-level:** Is this email address suppressed specifically for List Y?

If any of these checks returns a match, the email is not sent.

| Scope | Applies To | Managed By | Blocks Delivery From |
|---|---|---|---|
| **System-level** | All users, all lists | Administrator | Every account on the system |
| **User-level** | All lists of a specific user | User | All of that user's lists |
| **List-level** | A specific list | User | Only that specific list |

## How Email Addresses Get Added to Suppression Lists

Email addresses can be added to suppression lists through automatic system actions or through manual actions by administrators and users.

### Automatic Addition: Hard Bounces

When an email delivery permanently fails (a hard bounce), Octeth automatically adds the email address to the suppression list. This prevents future delivery attempts to an address that is known to be invalid.

Hard bounces are detected in two ways:

- **Direct hard bounce** — The receiving mail server returns a permanent failure code (5.x.x DSN code) during or after the SMTP conversation.
- **Soft-to-hard escalation** — The same address soft bounces repeatedly, exceeding the configured threshold (default: 3 soft bounces). Octeth escalates this to a hard bounce and suppresses the address.

When a hard bounce is detected, the email address is added with the suppression source recorded as **Hard Bounced**.

::: info
For detailed information about bounce detection and classification, see the [Bounce Processing](./bounce-processing) article.
:::

### Automatic Addition: Spam Complaints

When a recipient marks your email as spam and the complaint is received through a feedback loop (FBL), Octeth automatically adds the email address to the **system-level** global suppression list. This is the strongest possible suppression — the address is blocked from receiving email from any user account on the system.

When a spam complaint is processed, the email address is added with the suppression source recorded as **SPAM complaint**.

::: danger
Spam complaint suppressions are added at the system level intentionally. A recipient who considers email from your system as spam should not receive further email from any account — continuing to send risks blacklisting your IP addresses and domains, which would affect all users on the system.
:::

::: info
For detailed information about complaint detection and processing, see the [Complaint Processing](./complaint-processing) article.
:::

### Automatic Addition: Suppression Link Opt-Out

Octeth provides a special personalization tag — `%Link:Suppression%` — that you can include in your email content. When a subscriber clicks a suppression link:

1. The subscriber is unsubscribed from the list.
2. The subscriber's email address is added to the **system-level** global suppression list.

This differs from the standard unsubscribe link (`%Link:Unsubscribe%`), which only unsubscribes the subscriber without necessarily adding them to a suppression list.

| Tag | Unsubscribes | Adds to Suppression |
|---|---|---|
| `%Link:Unsubscribe%` | Yes | Depends on list settings |
| `%Link:Suppression%` | Yes | Always (system-level) |

::: info
For more details about unsubscription behavior and list-specific opt-out settings, see the [Unsubscriptions](./unsubscriptions) article.
:::

### Manual Addition: Administrator Interface

Administrators can add email addresses to the system-level suppression list through the admin panel.

1. Log in to the **Admin Area**.
2. Navigate to **Suppression** in the main menu.
3. Select the **Add** tab.
4. Enter one or more email addresses in the text area, one address per line.
5. Click the **Add** button.

[[SCREENSHOT: The Admin Area Suppression page showing the Add tab with a text area for entering email addresses]]

All addresses added through the admin interface are created as system-level suppressions with the source recorded as **Administrator**.

### Manual Addition: User Interface

Users can add email addresses to their suppression list through the subscriber deletion process:

1. Navigate to a **Subscriber List**.
2. Select the subscribers you want to remove.
3. Choose **Delete** from the actions menu.
4. When prompted, select the option to add the deleted addresses to the suppression list.

You can choose whether to add them to the **global** (user-level) suppression list or to the **list-level** suppression list for the current list.

### Manual Addition: API Import

You can add email addresses to the suppression list programmatically using the `Suppression.Import` API endpoint. This is useful for bulk imports or integrating with external systems.

::: tip
The API import is the most efficient way to add large numbers of email addresses to the suppression list. You can import addresses as a JSON array or as a newline-separated bulk list.
:::

## Smart Suppression (Pattern-Based)

In addition to suppressing individual email addresses, administrators can create **suppression patterns** that block entire categories of addresses based on pattern matching. This is called Smart Suppression.

### Pattern Types

Smart Suppression supports three pattern matching methods:

| Pattern Type | Description | Example Pattern | Blocks |
|---|---|---|---|
| **REGEXP** (Match) | Blocks addresses that match the regular expression pattern. | `^sales@.*$` | All addresses starting with `sales@` |
| **NOT REGEXP** (Not Match) | Blocks addresses that do **not** match the pattern. | `^.*@yourdomain\.com$` | All addresses except those at yourdomain.com |
| **STRPOS** (Contains) | Blocks addresses containing the specified text. Simple substring match — no wildcards needed. | `@competitor.com` | All addresses at competitor.com |

### Common Pattern Examples

| Pattern | Type | What It Blocks |
|---|---|---|
| `sales@*` | REGEXP | All addresses starting with `sales@` |
| `*@competitor.com` | REGEXP | All addresses at competitor.com |
| `info@*` | REGEXP | All addresses starting with `info@` |
| `noreply@*` | REGEXP | All addresses starting with `noreply@` |
| `^(sales\|support\|info)@.*$` | REGEXP | All sales@, support@, and info@ addresses |
| `@competitor.com` | STRPOS | All addresses containing `@competitor.com` |

::: info
In the pattern field, you can use `*` as a wildcard character. Octeth automatically converts wildcard patterns to regular expressions. For advanced users, full regular expression syntax is supported.
:::

### Managing Smart Suppression Patterns

Smart Suppression patterns are managed by administrators through the admin panel.

**To add a pattern:**

1. Log in to the **Admin Area**.
2. Navigate to **Suppression** in the main menu.
3. Select the **Smart Suppression** tab.
4. Enter a **Description** — a clear label explaining what the pattern blocks (e.g., "Block all sales@ addresses").
5. Enter the **Pattern** — the pattern expression to match against email addresses.
6. Select the **Pattern Type** — choose REGEXP, NOT REGEXP, or STRPOS.
7. Click the **Add Pattern** button.

[[SCREENSHOT: The Admin Area Suppression page showing the Smart Suppression tab with the pattern form and active patterns table]]

**To remove a pattern:**

1. Navigate to the **Smart Suppression** tab.
2. Find the pattern in the **Active Suppression Patterns** table.
3. Click the **×** button next to the pattern you want to remove.
4. Confirm the deletion when prompted.

::: warning
Smart Suppression patterns apply globally to all users and all lists on the system. When you add a pattern, it immediately affects all future email deliveries. Removing a pattern takes effect immediately as well.
:::

## Searching and Viewing Suppressed Addresses

### Administrator View

Administrators can search the system-level suppression list through the admin panel.

1. Log in to the **Admin Area**.
2. Navigate to **Suppression** in the main menu.
3. Select the **Search** tab.
4. Enter an email address (or part of one) in the search field.
5. Click **Search**.

The results show each matching entry with the email address, the associated user and list IDs, the suppression source (Administrator, User, Hard Bounced, or SPAM complaint), and a delete button.

[[SCREENSHOT: The Admin Area Suppression page showing the Search tab with search results displaying email address, user-list ID, source, and delete button]]

The left sidebar on the admin suppression page also shows:

- **Total suppressed email addresses** — The total count across all scopes
- **Breakdown by source** — The percentage of suppressions from each source (Administrator, User, Hard Bounced, SPAM complaint)

### User View

Users can view and manage their suppression list through the user dashboard.

**To view the global (user-level) suppression list:**

1. Log in to the **User Dashboard**.
2. Navigate to **Suppression List** in the main menu.

**To view a list-specific suppression list:**

1. Navigate to the specific **Subscriber List**.
2. Click the **Suppression List** link in the list management area.

The suppression list view shows:

- The total number of suppressed email addresses
- A searchable list of suppressed addresses with their suppression source
- A search field that supports wildcard searching using the `%` character

[[SCREENSHOT: The User Dashboard Global Suppression List page showing the total count, search field, and list of suppressed email addresses with their sources]]

::: tip
Use the `%` character as a wildcard when searching. For example, searching for `%@example.com` finds all suppressed addresses at the example.com domain.
:::

## Removing Suppressed Addresses

### Administrator Removal

Administrators can remove individual entries from the suppression list:

1. Navigate to **Suppression** > **Search** tab in the **Admin Area**.
2. Search for the email address.
3. Click the **X** button next to the entry you want to remove.
4. Confirm the deletion when prompted.

### User Removal

Users can remove entries that they added (source: **User**) from their suppression list:

1. Navigate to the **Suppression List** in the **User Dashboard**.
2. Select the checkboxes next to the entries you want to remove.
3. Click **Delete Selected** from the grid operations bar.

::: warning
Users can only delete suppression entries with the source **User**. Entries added automatically by the system (Hard Bounced, SPAM complaint) or by an administrator cannot be deleted by users — only an administrator can remove those entries.
:::

### API Removal

You can remove email addresses from the suppression list programmatically using the `Suppression.Delete` API endpoint. See the [API Reference](#api-reference) section below.

## How Suppression Lists Affect Email Delivery

Suppression lists are checked at multiple points in the email delivery pipeline to ensure suppressed addresses never receive email.

### Campaign Delivery

When a campaign is queued for delivery, Octeth generates a recipient queue. During queue generation, all suppressed email addresses are removed from the queue before any delivery begins. This includes:

- System-level suppressions
- User-level suppressions for the campaign owner
- List-level suppressions for the target list
- Smart Suppression pattern matches

The number of recipients removed by suppression is tracked and reported in the campaign statistics.

### Transactional Email Delivery

Before a transactional email is sent, Octeth checks whether the recipient address is suppressed. If the address is found in any applicable suppression scope, the transactional email is not delivered.

### Journey Builder Email Actions

When a journey reaches a **Send Email** action node, Octeth checks whether the subscriber is active. This check includes verifying that the subscriber's email address is not suppressed in any scope. If the address is suppressed, the email action is skipped.

### Email Gateway (SMTP Relay)

When email is sent through the Octeth email gateway (SMTP relay), each recipient address (To, CC, and BCC) is checked against the suppression list. Any suppressed addresses are silently removed from the recipient list.

::: info
Suppression checking happens automatically during delivery. You do not need to manually check suppression status before sending — Octeth handles this at every delivery point.
:::

## Whitelisting: Overriding Suppression

In some cases, you may need to ensure that specific email addresses are **never** suppressed — even if they would normally be caught by a bounce or complaint. Octeth supports a whitelist mechanism at the user account level.

When an email address matches a user's whitelist, it will not be added to the suppression list even if a hard bounce or spam complaint is received for that address.

The whitelist supports:

- **Exact email matches** — e.g., `important@partner.com`
- **Pattern matches** — Regular expressions to match multiple addresses

::: tip
Whitelisting is useful for addresses that might trigger false bounces (such as some corporate mail systems) or for critical business contacts that should always receive email. Use it sparingly — whitelisting a frequently-bouncing address can still damage your sender reputation.
:::

## Using Segments to Filter by Suppression Status

Octeth's segment builder includes a **Suppression Status** filter rule that allows you to create segments based on whether subscribers are suppressed. This is useful for reporting and list hygiene.

The suppression status filter supports three options:

| Option | What It Matches |
|---|---|
| **Both** | Subscribers suppressed at either the global (system/user-level) or list-level scope |
| **Global** | Subscribers suppressed at the system-level or user-level scope only |
| **Local** | Subscribers suppressed at the list-level scope only |

This filter can be combined with other segment rules to create targeted reports — for example, finding all subscribers who are still marked as "Subscribed" but have been suppressed due to a hard bounce.

## API Reference

Octeth provides three API endpoints for managing suppression lists programmatically.

### Suppression.Import

Adds email addresses to the suppression list.

**Endpoint:** `POST /api.php`

| Parameter | Description | Required |
|---|---|---|
| `Command` | Must be `Suppression.Import` | Yes |
| `SessionID` or `APIKey` | Authentication credential | Yes |
| `EmailAddresses` | JSON-encoded array of email addresses | No* |
| `EmailAddressesBulk` | Newline-separated list of email addresses | No* |

*At least one of `EmailAddresses` or `EmailAddressesBulk` must be provided. Both can be provided in the same request.

::: code-group
```bash [Example Request]
curl -X POST "https://octeth.example.com/api.php" \
  -d "Command=Suppression.Import" \
  -d "APIKey=your-api-key-here" \
  -d 'EmailAddresses=["bounce@example.com","invalid@example.com"]' \
  -d "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalImported": 2,
  "TotalFailed": 0,
  "FailedEmailAddresses": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```text [Error Codes]
1: Missing EmailAddresses parameter
2: Missing EmailAddressesBulk parameter or invalid EmailAddresses JSON format
```
:::

### Suppression.Browse

Retrieves suppressed email addresses with pagination and search.

**Endpoint:** `POST /api.php`

| Parameter | Description | Required |
|---|---|---|
| `Command` | Must be `Suppression.Browse` | Yes |
| `SessionID` or `APIKey` | Authentication credential | Yes |
| `SearchPattern` | Search pattern (supports `*` wildcard) | No |
| `StartFrom` | Starting record index for pagination (default: 0) | No |
| `RetrieveCount` | Number of records to retrieve (default: 100) | No |

::: code-group
```bash [Example Request]
curl -X POST "https://octeth.example.com/api.php" \
  -d "Command=Suppression.Browse" \
  -d "APIKey=your-api-key-here" \
  -d "SearchPattern=*@example.com" \
  -d "StartFrom=0" \
  -d "RetrieveCount=50" \
  -d "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 150,
  "SuppressedEmails": [
    {
      "SuppressionID": "42",
      "RelListID": "0",
      "RelOwnerUserID": "1",
      "SuppressionSource": "User",
      "EmailAddress": "user@example.com",
      "Reason": "Suppression List Import"
    }
  ]
}
```
:::

### Suppression.Delete

Removes an email address from the user's suppression list.

**Endpoint:** `POST /api.php`

| Parameter | Description | Required |
|---|---|---|
| `Command` | Must be `Suppression.Delete` | Yes |
| `SessionID` or `APIKey` | Authentication credential | Yes |
| `EmailAddress` | The email address to remove from suppression | Yes |

::: code-group
```bash [Example Request]
curl -X POST "https://octeth.example.com/api.php" \
  -d "Command=Suppression.Delete" \
  -d "APIKey=your-api-key-here" \
  -d "EmailAddress=user@example.com" \
  -d "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```text [Error Codes]
1: Missing EmailAddress parameter
2: Invalid email address or email address not found in suppression list
```
:::

## Tips and Best Practices

::: tip
**Review your suppression list regularly.** Over time, suppression lists grow as bounces and complaints accumulate. Periodically review your list to understand the sources of suppression and identify patterns — for example, a sudden spike in hard bounces might indicate a list quality issue.
:::

::: tip
**Use Smart Suppression patterns for known bad categories.** If you consistently see bounces or complaints from certain types of addresses (e.g., `noreply@`, `sales@`, `info@`), create Smart Suppression patterns to block them proactively rather than waiting for individual bounces.
:::

::: tip
**Use the API for integration with external systems.** If you use an external email verification service or maintain a shared suppression list across multiple platforms, use the `Suppression.Import` API to keep your Octeth suppression list synchronized.
:::

::: tip
**Do not routinely remove system-added suppressions.** Addresses suppressed by hard bounces or spam complaints were suppressed for a reason. Removing them and sending again will likely result in the same bounce or complaint — and repeated attempts damage your reputation further. Only remove system suppressions if you have confirmed the issue has been resolved (e.g., the recipient has a new mail server and has explicitly requested re-subscription).
:::

## Troubleshooting

### Subscribers Are Not Receiving Emails Even Though They Are Subscribed

If a subscriber shows an active subscription status but is not receiving emails, the email address may be on a suppression list.

1. **Check the admin suppression list** — Log in to the **Admin Area**, navigate to **Suppression** > **Search** tab, and search for the email address.
2. **Check the user suppression list** — Log in to the **User Dashboard**, navigate to **Suppression List**, and search for the address.
3. **Check Smart Suppression patterns** — Review the **Smart Suppression** tab to see if any active patterns match the address.
4. **Check the segment filter** — If you are using segments, verify that the segment does not include a suppression status filter that excludes the subscriber.

### A Removed Address Keeps Getting Re-Suppressed

If you remove an address from the suppression list but it gets added back:

1. **Check for ongoing bounces** — The address may still be bouncing. If the underlying delivery problem is not resolved, the bounce processor will re-add the address after each failed attempt.
2. **Check for new complaints** — The recipient may continue to file spam complaints. Each new complaint triggers a new suppression entry.
3. **Check Smart Suppression patterns** — A pattern may be matching the address. Even if the exact address is removed from the suppression list, a matching pattern will still block delivery.

### Users Cannot Delete Certain Suppressed Addresses

Users can only delete suppression entries with the source **User**. Entries added by the system (Hard Bounced, SPAM complaint) or by an administrator are protected and can only be removed by an administrator. This is by design — it prevents users from accidentally re-enabling delivery to addresses that were suppressed for reputation protection reasons.

## Related Features

- **[Bounce Processing](./bounce-processing)** — How bounced emails are detected, classified, and how hard bounces trigger automatic suppression.
- **[Complaint Processing](./complaint-processing)** — How spam complaints from feedback loops are processed and how they trigger system-level suppression.
- **[Unsubscriptions](./unsubscriptions)** — How subscriber opt-outs work and how the suppression link differs from the standard unsubscribe link.
- **[Email Sending](./email-sending)** — The email delivery pipeline where suppression checks are enforced.
- **[Email Tracking](./email-tracking)** — How open and click tracking interact with the delivery pipeline.
- **[SPF/DKIM/DMARC](./spf-dkim-dmarc)** — Email authentication protocols that affect deliverability and can influence bounce and complaint rates.
