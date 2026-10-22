# The Staff Email Suppression Screen

A **suppression** stops Octeth from sending to an email address. A **system-wide** suppression blocks the address for every account on the install, in campaigns, journeys, transactional email and the email gateway. The **Email** screen of the staff **Suppression** group lists and manages the system-wide suppressions and the suppression patterns, and finds an address in any account's suppressions. It replaces the classic admin **Email Suppression List** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Email suppression | `/user/staff/deliverability/suppression` | Suppression |

Open it from the staff sidebar: click **Suppression**, then **Email**. The classic admin **Preferences > Email Suppression List** link, and the old `/app/admin/suppression/` address, open the same screen.

::: tip
An account whose user group turns the suppression check off is not blocked by system-wide suppressions or patterns. Accounts also keep their own account-wide and list suppressions, which they manage on their own **Suppressions** pages. How the scopes work is explained in [Suppression Lists](/v6.0.3/using-octeth/email-deliverability/suppression-lists).
:::

## The counts

The tiles at the top count every suppression on the install, in every account and every scope, and split them by source:

- **Administrator**: added by an administrator, on this screen or through the API.
- **User**: added by an account, by hand or by import.
- **Hard Bounced**: added when a message bounced permanently.
- **SPAM complaint**: added when a recipient reported a message as spam.
- **Unsubscribe**: added when a recipient opted out through a suppression link.

Each tile shows its share of the total.

## Addresses

The **Addresses** tab lists the system-wide suppressions, 50 to a page:

- **Email address**, with the suppression's ID under it.
- **Source**.
- **Reason**: the note saved with the suppression, or **None given**.

Choose a source in the **Any source** filter to list only the suppressions of that source.

### Search every account

Type an address in the search box to find it in every scope: system-wide, account-wide and list suppressions. The search matches the exact address, whatever its case. Use `*` as a wildcard, for example `*@example.com` for a whole domain or `sales@*` for a mailbox on every domain. A search adds two columns:

- **Scope**: **System**, **Account** or **List**.
- **Account**: the account the suppression belongs to, linked to its staff page, with the list's ID under it for a list suppression. A system-wide suppression shows **Every account**.

A sub-administrator limited to some user groups finds only the suppressions of accounts in those groups, and every system-wide one. Patterns are not searched: check the **Patterns** tab when an address is blocked and no search finds it.

Clear the search to go back to the system-wide list.

### Add addresses

1. Click **Add addresses**.
2. Paste the addresses, one per line, or separated by commas or spaces. The box counts the valid ones as you type.
3. Optionally, enter a **Reason / notes**, for example the support ticket.
4. Click **Add to suppression list**.

The addresses are suppressed system-wide with the source **Administrator**. The message after it says how many were added, how many were already suppressed system-wide and how many were not valid addresses. If Octeth could not save some of them, the message turns into a warning that says how many: those addresses are not suppressed, so add them again. You can paste up to 5,000 addresses at a time.

### Remove suppressions

Click the trash icon of a row, or tick several rows and click **Remove**, then confirm.

::: warning
Removing a system-wide suppression unblocks the address for every account. Removing an account or list suppression unblocks it for that account or list only. If the address bounced or complained, sending to it again can harm the install's sender reputation.
:::

A pattern that matches the address still blocks it. A sub-administrator limited to some user groups cannot remove the suppressions of accounts outside those groups: the message after it says how many could not be removed.

## Patterns

A **pattern** blocks every address it matches, for every account. The **Patterns** tab lists them with their description, type and pattern.

| Type | Blocks | Example |
|---|---|---|
| **Matches** | Every address that matches. Use `*` and `?` as wildcards, or a regular expression | `sales@*` blocks every `sales@` mailbox |
| **Does not match** | Every address that does not match | `*@example.com` blocks every address outside example.com |
| **Contains** | Every address that contains the text | `@example.com` blocks every address at example.com |

To add one, click **Add pattern**, enter a **Description**, choose the **Type**, enter the **Pattern** and click **Add pattern**. A regular expression that does not compile is refused. To delete one, click its trash icon and confirm.

::: info
Sending workers read the patterns when they start. A running worker applies an added or deleted pattern only after it restarts.
:::

## Audit

Every add and every removal, of addresses or of patterns, writes a row to the staff audit log with the counts, or the pattern's type. The addresses and patterns themselves are not recorded there, and the new interface masks them in its API call log and debug console.
