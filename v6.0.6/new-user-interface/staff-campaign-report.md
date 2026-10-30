# The Staff Campaign Report

The **Campaigns** report lists the campaigns of every account on the install by status. Use it to see what was sent and how it performed, what is waiting or scheduled, and to recover a campaign that stopped sending. It replaces the classic admin **Campaign Report**.

| Screen | Path on a default install | Permission |
|---|---|---|
| Reports: Campaigns | `/user/staff/reports/campaigns` | Reports |

Open it from the staff sidebar: click **Reports**, then **Campaigns**. The classic admin **Reports > Campaign Report** link, and the old `/app/admin/campaignreport/` address, open the same screen.

A sub-administrator limited to some user groups sees only the campaigns of accounts in those groups, and the counts cover only those campaigns.

## Status buckets

The list on the left groups campaigns by status, each with its count under the current filters:

| Bucket | What it holds | Date the range applies to |
|---|---|---|
| **Sent** | Sent campaigns, including those that ended as failed | When sending started |
| **Outbox** | Campaigns sending now, or ready to send immediately | When the campaign was created |
| **Drafts** | Drafts, and ready campaigns with no schedule | When the campaign was created |
| **Scheduled** | Campaigns scheduled for a later date | The scheduled date |
| **Paused** | Paused campaigns | When sending started |
| **Pending approval** | Campaigns waiting for an administrator to approve them | When the campaign was created |
| **Failed** | Campaigns that ended as failed | When sending started |
| **With failed recipients** | Sent or failed campaigns with at least one recipient that could not be delivered | When sending started |
| **Stuck** | Sending campaigns whose sending has stopped making progress | None: every stuck campaign is listed |

Click a bucket to list its campaigns. The bucket, the filters, the sort and the page are kept in the address, so you can bookmark a view or send it to a colleague, and a reload keeps it.

## Filter the report

The filters above the table apply to the counts, the chart and the table together.

- **Date range.** The default is the last 7 days, or the next 30 days on **Scheduled**. Choose a preset (for example **Yesterday**, **Last week** or **This month**, and on **Scheduled** **Tomorrow** or **Next month**) or enter a custom range on the right of the picker and click **Apply**. **All time** removes the date filter.
- **Account.** Click **All accounts**, type at least two characters of a name, company or email address, and choose an account. Choose **All accounts** to remove the filter.
- **Search.** Type in **Search campaigns** and press **Enter** or click **Search**. A word matches the campaign name. Click the question mark beside the box for the advanced syntax, for example `name:"Weekly digest"`, `subject:"Spring sale"`, `recipient_count>1000` or `open_rate<10`. When the search cannot be read, the screen says so under the search box and lists nothing until you fix it.

Click **Clear filters** to go back to the default date range with no account and no search.

## The chart

**Recipients and unique opens** shows, per day, the recipients and the unique opens of the bucket's campaigns under the filters. Choose **Recipients** or **Unique opens** above the chart to show one line on its own scale, or **Both**. Point at the chart to read a day's figures. The chart covers at most the last 365 days of the range, and the **Stuck** bucket has no chart.

## The table

Each bucket shows the columns that matter for it:

- **Sent**, **Outbox**, **Paused**, **Pending approval**, **Failed** and **With failed recipients**: status, health, started and finished times with the sending duration, recipients and sent with progress and sending speed, failed recipients, open and click rates with the click-to-open rate, the opt-out rate and the bounce rate.
- **Drafts**: created and last updated.
- **Scheduled**: when the campaign sends, in its own time zone.
- **Stuck**: why the campaign is stuck, when it started, recipients and sent, and failed recipients.

**Health** shows four marks, for the open rate, the click rate, the bounce rate and the unsubscribe rate (green good, amber average, red poor, grey not applicable), and the engagement score out of 10. Point at a mark to see which rate it stands for.

The account name links to the account's page in the staff area. Sort by **Started**, **Recipients** or **Failed** with the column headers; **Drafts** and **Scheduled** keep their own order (newest draft first, soonest send first). Choose 10, 25, 50 or 100 rows per page at the bottom of the table.

## Export the report

Click **Export CSV** to download the campaigns of the current bucket under the current filters and sort, as a CSV file a spreadsheet opens directly. The file holds at most 10,000 campaigns (the `CAMPAIGN_EXPORT_MAX_ROWS` setting); narrow the filters for a larger set. Every export is recorded in the staff audit log.

## Recover a campaign

The row actions on the right of a campaign recover it. Each one asks first, names the campaign, and is recorded in the staff audit log.

- **Unstuck** (on the **Stuck** bucket) resets the batches that stopped reporting so the workers pick them up again. Recipients already sent to are not sent to twice. If the campaign stays stuck, check that the background workers are running.
- **Mark failed** (on the **Stuck** bucket) stops sending: every pending and running batch is closed and the campaign moves to **Failed**. Use it when a campaign cannot be recovered.
- **Retry failed recipients** (on a sent or failed campaign with failed recipients) queues the failed recipients again and returns the campaign to sending. The confirmation shows how many recipients are retried. Recipients who already received the campaign are not sent to again.

When the delivery queue cannot be notified after a retry, the message says so: the recipients stay queued, and **Unstuck** resumes the delivery once the queue is reachable again.

There is no campaign detail page in this report. To see a campaign as its owner sees it, open the account and switch to it.
