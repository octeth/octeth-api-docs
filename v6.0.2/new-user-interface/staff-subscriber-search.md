# Searching Subscribers in the Staff Area

The **Subscriber search** screen finds an email address on every list of every account you can reach, or every subscriber on a domain. It replaces the classic admin **Subscriber Email Search**.

| Screen | Path on a default install | Permission |
|---|---|---|
| Subscriber search | `/user/staff/subscriber-search` | Search |

::: info
The screen acts as the administrator who is signed in. A sub-administrator limited to some user groups sees only the lists of accounts in those groups. Every search is recorded in the staff audit log with the administrator, the time and the address or domain searched.
:::

## Search for an address

1. Choose **Subscriber search** in the left menu.
2. Type the full email address, for example `john@example.com`.
3. Click **Search** or press Enter.

Each row is one list the address is on:

- **List**: the list name and its ID. An **Archived** badge marks an archived list.
- **Owner**: the account that owns the list. Click it to open that account. **Owner deleted** means the account no longer exists, so there is nothing to open.
- **Status**: Subscribed, Unsubscribed, Opt-In Pending or Opt-Out Pending.
- **Bounce**: Not Bounced, Soft or Hard.

The rows are read-only. To change a subscriber, open the owner's account and switch to it.

## Search a domain

Type a domain with or without the `@`, for example `@example.com` or `example.com`. The table gets an **Email address** column and shows one row per subscriber on that domain, on every list in reach. A subdomain such as `mail.example.com` is a different domain.

A domain search shows at most 500 subscribers. When there are more, a **Results truncated** warning says so. Search for a full address to check one subscriber.

::: tip
A domain search reads every list in full, so it is slower than an address search on a large install.
:::

## When the results may be incomplete

Each list is searched with a time limit. When a list could not be searched in time, or the search failed on it, a **Results may be incomplete** warning appears above the table, and a subscriber can be missing from it. Try again later. The warning is never shown as an empty result.

## Link to a search

The address or domain you searched is kept in the page address, for example `/user/staff/subscriber-search?email=john%40example.com`. Opening that link runs the search again and records it in the audit log. Old links to `/app/admin/subscribersearch/` open this screen.
