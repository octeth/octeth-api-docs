---
layout: doc
---

# Sender Domain Health

<Badge type="tip" text="New in v6.0.1" />

The **Sender Domain Health** report in the admin area lists every sender domain across all user accounts, with the result of its last DNS check. Use it to find domains whose DNS records stopped matching, domains that were demoted for it, and domains that wait for approval. You can open each domain's per-record results and run a new check on demand.

## Opening the Report

Navigate to **Reports** > **Sender Domain Health** in the admin area.

The menu entry appears only for administrators with permission to edit users. An administrator who is limited to some user groups sees only the domains of accounts in those groups. Deleted domains are not listed.

The admin **Overview** page also shows a **Sender Domain Health** tab with four counts: **Healthy**, **Failing**, **Demoted by DNS drift** and **Never checked**. Click a count to open the report filtered to it. The tab appears when there is at least one sender domain.

## How Domains Are Checked

Octeth checks each **Enabled** domain in the background once a day. A check looks up every DNS record the domain was given when it was created and compares the answer with the expected value.

Three failed checks in a row move the domain to **Approval Pending**, and it can no longer send. This is called DNS drift. A domain owner can also run a check from the domain's edit page.

## Summary Tiles

Five tiles at the top count the domains in each health class. Click a tile to filter the list to that class.

| Tile | What it counts |
|---|---|
| **Healthy** | **Enabled** domains whose last check passed every record, with no failed checks pending. |
| **Failing** | **Enabled** domains that failed one or two checks in a row, or whose last check had a failed record. They can still send. |
| **Demoted by DNS drift** | Domains that were **Enabled** and moved to **Approval Pending** because a check failed. |
| **Awaiting approval** | Other **Approval Pending** domains: new domains not verified yet, domains whose subdomain settings changed, and domains an administrator sent back for approval. |
| **Never checked** | Domains with no stored DNS check yet. |

Domains in **Disabled**, **Suspended** or **Blocked** status that have a stored check are not counted in any tile. Choose **Other** in the health filter to list them.

## Filtering the List

Use the toolbar above the list:

- **Domain...** matches part of the domain name.
- **User ID** shows the domains of one account.
- The health filter (**All Health**) limits the list to one health class.
- The status filter (**All Statuses**) limits the list to **Enabled**, **Disabled**, **Suspended**, **Approval Pending** or **Blocked**.

Click **Filter** to apply, or **Clear** to remove every filter. The list shows 50 domains per page.

## Reading a Row

| Column | What it shows |
|---|---|
| **Domain** | The domain name and its actions. |
| **Account** | The owner's username and email address. Click it to open the account's **Sender Domains** tab. |
| **Status** | The domain's status. A demoted domain also shows **DNS drift** under **APPROVAL PENDING**. |
| **Health** | The health label, described below. |
| **Last checked** | When the last check ran and what started it: **Scheduled check** (background), **Manual check** (the owner) or **Admin check** (**Re-check now**). |
| **Failing** | How many records failed the last check. |

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

## Per-Record Results

Click **Records** under a domain name to show the result of its last check, one row per DNS record:

| Column | What it shows |
|---|---|
| **Type** | The record type, for example CNAME or TXT. |
| **Host** | The host name that was looked up. |
| **Expected** | The value the record should have. |
| **Resolved** | The value the DNS server returned, or **No answer** when nothing was found. |
| **Result** | **Pass** when the resolved value equals the expected one (letter case is ignored), **Fail** otherwise. |

The records are the ones the domain received from its DNS template when it was created, typically the return-path, DKIM, DMARC and tracking CNAMEs plus an ownership TXT record. Octeth does not evaluate SPF, DKIM or DMARC policies. It checks that each record matches. The lookups use the DNS servers set in `config/global/const_OEMPRO_DNS_LOOKUP_SERVERS.php`.

## Why a Domain Waits for Approval

A domain that cannot send while waiting for someone falls into one of these cases:

- **Awaiting approval** (status **Approval Pending**): the owner has not verified the DNS records yet, changed the subdomain settings, or an administrator clicked **Unblock** on a suspended domain. The owner adds or fixes the records and verifies the domain.
- **Demoted by DNS drift** (status **Approval Pending**, **DNS drift**): the records stopped matching. The owner fixes them and verifies the domain again. Background checks do not restore it.
- **Blocked**: the domain passed verification, but the owner's user group has **Require new domain approval before email sending is allowed** turned on. An administrator blocking an enabled domain also gives this status. Filter by the **Blocked** status to find these domains, then click **Manage domains** and click **Activate** on the account's **Sender Domains** tab.

When the owner verifies a demoted domain and every record passes, it becomes **Enabled** again. If the owner's user group requires approval, it becomes **Blocked** and waits for you to activate it.

## Re-checking a Domain

Click **Re-check now** under a domain to check its DNS records right away. The report shows **A DNS check of mail.example.com is queued. Reload this page in a minute to see the result.** Reload the page to see the new result, labeled **Admin check**.

A re-check:

- Records the result and never changes the domain's status.
- Never counts as a failed check toward the three that demote a domain.
- Clears the failed-check count of an **Enabled** domain when every record passes.
- Runs even if the domain was already checked today, and counts as that day's background check.

**Re-check now** is available for **Enabled**, **Approval Pending**, **Blocked** and **Suspended** domains, not for **Disabled** ones. There is no limit on how often you can use it.

To activate, suspend or block a domain, click **Manage domains** under its name. This opens the owner's **Sender Domains** tab. The actions there depend on the status: an **Approval Pending** domain can only be suspended, because it leaves that status only when its owner verifies it again: it becomes **Enabled**, or **Blocked** for you to activate when the owner's user group requires approval.

## Related

- [Sender Domains](/v6.0.2/using-octeth/sender-domains)
- [Suspended and Blocked Domains](/v6.0.2/using-octeth/sender-domains#suspended-and-blocked-domains)
- [Requiring Approval for New Domains](/v6.0.2/using-octeth/sender-domains#requiring-approval-for-new-domains)
