# The List Freshness Report

**List freshness** shows how recently each user's lists gained subscribers, by a subscription or an import, so you can spot accounts that stopped growing their audience. It replaces the classic admin **Reports > List Freshness** report.

| Screen | Path on a default install | Permission |
|---|---|---|
| List freshness | `/user/staff/reports/list-freshness` | Reports |
| A user's lists | `/user/staff/reports/list-freshness/<user id>` | Reports |

Open it from the staff sidebar: click **Reports**, then **List freshness**. The classic admin **Reports > List Freshness** menu item, and the old `/app/admin/listfreshness/` addresses, open the same screens.

A sub-administrator limited to some user groups sees only the users of those groups.

## Statuses

Each list gets a status from the days since its last subscription or import. A user's status is the status of their freshest list.

| Status | Meaning, with the default thresholds |
|---|---|
| **Active** | A subscription or import within the last 14 days |
| **Slowing down** | The last one was 15 to 45 days ago |
| **Stale** | The last one was 46 to 90 days ago |
| **Dead** | Nothing for more than 90 days |
| **No data** | No subscription or import has ever been recorded |

The line under the status tiles states the thresholds in use. To change them, open the List freshness section of [Staff Preferences](./staff-preferences#list-freshness). The line links there when you have the Settings permission.

## The report

The tiles at the top count the users in each status. Click a tile to show only those users, and click it again to show everyone.

The table lists every user who owns at least one subscriber list:

- **User**: the company name, or the person's name when there is no company, with the user ID and username under it.
- **Lists**: how many lists the user owns.
- **Active subscribers**: the active subscribers across all of them.
- **Status**: the user's status.
- **Last activity**: the date of the most recent subscription or import, and how long ago it was.

Click a column header to sort by user, lists, status or last activity. Click it again to reverse the order. The default puts users with no data first, then the users whose lists went quiet longest ago. Type in **Search users** to narrow the table by name, company, username or user ID.

Click a row to open that user's lists. When you have the Users permission, the person icon at the end of the row opens the user's staff page, where you can switch to their account.

The report is computed at most once a minute. When the figures come from that saved copy, the line under the tiles says they can be up to a minute old.

## A user's lists

The **User** card shows the user's name, company, username, email address, user group and overall freshness. **Open user** opens their staff page, when you have the Users permission.

The tiles count the user's lists in each status. Click one to show only those lists. Type in **Search lists** to narrow the table by name or list ID.

For each list the table shows:

- The list's name and ID, and when it last gained a subscriber.
- **Status**.
- **90-day trend**: a small chart of the subscriptions plus imports on each of the last 90 days. A flat line means nothing came in.
- **Active subscribers**.
- **90-day activity**: the subscribers gained over the last 90 days, with how many subscribed, how many were imported and how many unsubscribed.

Opening a user's page is recorded in the staff audit log.
