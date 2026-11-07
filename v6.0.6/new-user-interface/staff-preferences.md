# Staff Preferences

**Preferences** holds the install-wide settings for the default language, password reset, notifications about account limits, the handling of failing customer webhooks, the List freshness thresholds, the forbidden From addresses and the default custom fields of a new list. It replaces the classic admin **Settings > Preferences** page except for the classic user area's footer.

| Screen | Path on a default install | Permission |
|---|---|---|
| Preferences, General section | `/user/staff/settings/preferences` | Settings |
| Preferences, Notifications section | `/user/staff/settings/preferences?section=notifications` | Settings |
| Preferences, Customer webhooks section | `/user/staff/settings/preferences?section=customer-webhooks` | Settings |
| Preferences, List freshness section | `/user/staff/settings/preferences?section=list-freshness` | Settings |
| Preferences, Lists and senders section | `/user/staff/settings/preferences?section=lists-and-senders` | Settings |

Open it from the staff sidebar: click **Settings**, then **Preferences**. The classic admin **Settings > Preferences** link and the **Preferences** item of the classic header's **Preferences** menu open the same screen.

Each section has its own **Save** button and saves only its own settings. When nothing in a section changed, saving says so and sends nothing.

::: info
Every save is recorded in the staff audit log, with the section and the names of the settings that changed. Values are never recorded.
:::

The classic user area's footer stays on the classic admin page, now named **User area preferences** (`/app/admin/preferences/`). That page links to the **Lists and senders** section for the two settings that moved from it.

## General

**Default language** is the language of the public pages of the classic areas, such as the sign-in, subscription and confirmation pages. Accounts whose own language is not installed use it too. Only installed language packs are offered.

**Let users reset a forgotten password** shows the **Forgot password** link on the classic user area's sign-in page. Turned off, the link is hidden and the reset page refuses everyone, so a user who forgets a password needs an administrator to set a new one.

Click **Save general preferences**. Changing the default language, or turning password reset off, asks you to confirm first.

## Notifications

### Send rate alerts

Octeth posts a Slack message when an account goes over its send rate limit. Limits are set per user group or per user.

- **Slack webhook URL**: an incoming webhook URL of the Slack channel to post to. Leave it empty to send no alerts. The field is masked, because anyone with this URL can post to the channel. Click the eye icon to show it.
- **Alert at most every (seconds)**: at most one alert per account in this many seconds. `3600` is one hour. `0` turns the alerts off.

### Limit utilization webhook

Octeth sends a POST to your URL when an account's limit usage changes status, for example from OK to Warning.

1. Turn on **Send limit utilization notifications**.
2. Enter the **Webhook URL**. It is masked like the Slack URL.
3. Under **Notify on**, tick the changes to report: OK to Warning, Warning to Exceeded, OK to Exceeded, Exceeded to Warning, Warning to OK and Exceeded to OK. At least one is required.
4. Click **Save notification settings**.

## Customer webhooks

The failed webhook handler suspends a customer's webhook that keeps failing, so a dead endpoint stops slowing delivery down for everyone.

1. Turn on **Suspend failing customer webhooks**.
2. **Failures before suspending**: how many failed calls in a row suspend the webhook. A successful call starts the count again.
3. **Suspend for (seconds)**: how long the webhook stays suspended. `3600` is one hour. `0` keeps it suspended with no time limit. While it is suspended, its events are marked failed and not sent.
4. **Tell this URL about a suspension** (optional): Octeth sends a POST to this URL each time it suspends a webhook, naming the account, the webhook URL and the suspension length.
5. Click **Save customer webhook settings**.

Turning the handler off stops new suspensions. A suspension already in force runs until it ends.

## List freshness

These thresholds decide how the [List freshness report](./staff-list-freshness) labels a list, by the days since its last subscription or import:

- **Active within (days)**, default `14`.
- **Slowing down within (days)**, default `45`. Must be more than Active.
- **Stale within (days)**, default `90`. Must be more than Slowing down. Anything older is Dead.

Click **Save thresholds**. The report uses the new thresholds the next time it is computed, within a minute.

## Lists and senders

### Forbidden From addresses

From addresses no account may send as. The list applies to campaigns, auto responders, journeys, opt-in confirmation emails, list sender addresses and the email gateway: a save that sets a listed address is refused, and a send that would use one is stopped.

Enter one address per line. Matching ignores case. A line without `*` must equal the whole address, and `*` matches any text, so `*@example.com` blocks every address at example.com. Leave the list empty to forbid nothing. Empty lines and the spaces around each line are removed when you save.

### Default custom fields of a new list

Custom fields every new list starts with. Enter one field name per line, with at most 250 characters per name. A name entered twice, in any case, is kept once.

Each name becomes a single-line text field, optional and not unique, on every list created after you save, whether the list is created in the new interface or in the classic user area. Lists that already exist do not change. If a field cannot be added to a new list, the list is still created and the account is told how many fields are missing.

Click **Save list and sender settings**.
