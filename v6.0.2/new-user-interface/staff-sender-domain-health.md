# The Staff Sender Domain Health Report

The **Sender domain health** report lists every sender domain across all user accounts with the result of its last DNS check. Use it to find domains whose DNS records stopped matching, domains that were demoted for it, and domains that wait for approval. You can open each domain's per-record results and run a new check on demand. It replaces the classic admin **Reports > Sender Domain Health** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Sender domain health | `/user/staff/reports/sender-domains` | User.Edit |

Open it from the staff sidebar: click **Reports**, then **Sender domain health**. The classic admin **Reports > Sender Domain Health** menu item, the old `/app/admin/senderdomainhealth/` addresses, and each class of the [staff dashboard](./staff-dashboard#sender-domains)'s **Sender domains** section open the same report, with their filter applied.

An administrator who is limited to some user groups sees, and re-checks, only the domains of accounts in those groups. Deleted domains are not listed.

## How domains are checked

Octeth checks each **Enabled** domain in the background once a day. A check looks up every DNS record the domain was given when it was created and compares the answer with the expected value.

Three failed checks in a row move the domain to **Approval Pending**, and it can no longer send. This is called DNS drift. A domain owner can also run a check from the domain's edit page.

## Summary tiles

Five tiles at the top count the domains in each health class. Click a tile to show only that class. The tile in force has a dark border. Click it again to show every class.

| Tile | What it counts |
|---|---|
| **Healthy** | **Enabled** domains whose last check passed every record, with no failed checks pending. |
| **Failing** | **Enabled** domains that failed one or two checks in a row, or whose last check had a failed record. They can still send. |
| **Demoted by DNS drift** | Domains that were **Enabled** and moved to **Approval Pending** because checks failed. |
| **Awaiting approval** | Other **Approval Pending** domains: new domains not verified yet, domains whose subdomain settings changed, and domains an administrator sent back for approval. |
| **Never checked** | Domains with no stored DNS check yet. |

Domains in **Disabled**, **Suspended** or **Blocked** status that have a stored check are not counted in any tile. Choose **Other** in the health filter to list them.

## Filtering the list

Use the toolbar above the list. Each filter applies as you type or choose:

- **Search domain** matches part of the domain name.
- **User ID** shows the domains of one account.
- **Any health** limits the list to one health class.
- **Any status** limits the list to **Enabled**, **Disabled**, **Suspended**, **Approval Pending** or **Blocked**.

**Clear filters** removes every filter. The list shows 50 domains per page. The filters and the page are part of the address, so you can bookmark or share a filtered view, for example `/user/staff/reports/sender-domains?health=failing`.

Click **Refresh** to read the list and the counts again, for example a minute after a re-check.

## Reading a row

| Column | What it shows |
|---|---|
| **Domain** | The domain name and its ID. |
| **Account** | The owner's username and email address. Click it to open the account on its **Sender domains & keys** tab, where you activate, suspend or block a domain. |
| **Status** | The domain's status. A demoted domain also shows **DNS drift** under **Approval Pending**. |
| **Health** | The health label, described below. When the domain's own tracking host is not set up, a warning **Mail uses** names the host that Email Gateway and journey mail from it uses for tracking and unsubscribe links instead. |
| **Last checked** | When the last check ran and what started it: **Scheduled check** (background), **Manual check** (the owner) or **Admin check** (**Re-check now**). **Never** when there is no stored check, with the last verification date when there is one. |
| **Records** | How many records failed the last check, for example **1 of 5 failing**, or **All 5 passing**. Click it to show the per-record results. **No records** when the last check stored no records, **Not checked** when there is no stored check. |

The **Health** column uses these labels:

| Label | Meaning |
|---|---|
| **Healthy** | Enabled, and the last check passed. |
| **Failing 1/3** or **Failing 2/3** | Enabled, and that many background checks failed in a row. The third failure demotes the domain. |
| **Last check failed** | The last check failed. For an enabled domain this is a failed **Re-check now**, which does not count toward the three. |
| **Demoted by DNS drift** | Demoted, and the records still do not match. |
| **Passing, awaiting approval** | Demoted, but the last check passed. It stays **Approval Pending** until the owner verifies it again. |
| **Awaiting approval** | Approval Pending for any other reason. |
| **Never checked** | No stored check. |
| **Last check passed** | Disabled, Suspended or Blocked, and the last check passed. |

## Per-record results

Click the **Records** button of a row to show the result of its last check under it, one line per DNS record. Click it again to hide them.

| Column | What it shows |
|---|---|
| **Type** | The record type, for example CNAME or TXT. |
| **Host** | The host name that was looked up. |
| **Expected** | The value the record should have. |
| **Resolved** | The value the DNS server returned, or **No answer** when nothing was found. |
| **Result** | **Pass** when the resolved value equals the expected one (letter case is ignored), **Fail** otherwise. |

The records are the ones the domain received from its DNS template when it was created, typically the return-path, DKIM, DMARC and tracking CNAMEs plus an ownership TXT record. Octeth does not evaluate SPF, DKIM or DMARC policies. It checks that each record matches. The lookups use the DNS servers set in `config/global/const_OEMPRO_DNS_LOOKUP_SERVERS.php`.

## Why a domain waits for approval

- **Awaiting approval** (status **Approval Pending**): the owner has not verified the DNS records yet, changed the subdomain settings, or an administrator unblocked a suspended domain. The owner adds or fixes the records and verifies the domain.
- **Demoted by DNS drift** (status **Approval Pending**, **DNS drift**): the records stopped matching. The owner fixes them and verifies the domain again. Background checks do not restore it.
- **Blocked**: the domain passed verification, but the owner's user group requires approval of new domains before they can send. An administrator blocking an enabled domain also gives this status. Choose **Blocked** in **Any status** to find these domains, click the owner, and activate the domain on the **Sender domains & keys** tab.

When the owner verifies a demoted domain and every record passes, it becomes **Enabled** again. If the owner's user group requires approval, it becomes **Blocked** and waits for you to activate it.

## Re-checking a domain

Click the re-check button at the end of a row (its tooltip reads **Re-check now**) to check the domain's DNS records right away. A message confirms: **A DNS check of mail.example.com is queued. Refresh in a minute to see the result.** Click **Refresh** a minute later to see the new result, labeled **Admin check**. The button is disabled while the request runs, and the same domain is not queued twice within a minute.

A re-check:

- Records the result and never changes the domain's status.
- Never counts as a failed check toward the three that demote a domain.
- Clears the failed-check count of an **Enabled** domain when every record passes.
- Runs even if the domain was already checked today, and counts as that day's background check.

The button is shown for **Enabled**, **Approval Pending**, **Blocked** and **Suspended** domains, not for **Disabled** ones. Every re-check is recorded in the staff audit log under your administrator account.

When a re-check cannot run, the message says why:

| Message | What it means |
|---|---|
| **Too many re-checks in the last minute. Wait a minute and try again.** | You used the 60 re-checks a minute that each administrator has. |
| **That sender domain was not found. It may have been deleted.** | The domain was deleted, or its account moved out of the user groups you may reach. |
| **Sender domains in status Disabled are not checked.** | The status changed since the list was loaded. Click **Refresh**. |
| **The DNS check could not be queued. See the error log.** | The check could not be handed to the background worker. Check that RabbitMQ is running. |

## Related

- [Sender Domains](/v6.0.2/using-octeth/sender-domains)
- [The Staff Dashboard](./staff-dashboard)
- [Managing Users in the Staff Area](./staff-users)
