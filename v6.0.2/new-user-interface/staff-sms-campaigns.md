# The Staff SMS Campaigns Screen

**SMS > Campaigns** lists the bulk SMS campaigns of every account, newest first, and lets you pause or cancel one. Use it to stop a campaign that is going wrong without signing in as the account. A runaway send costs you money and sender reputation, and on a shared gateway it slows every account's delivery. It replaces the classic admin **Reports > SMS Campaigns** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| SMS campaigns | `/user/staff/sms/campaigns` | SMS and Settings |

Open it from the staff sidebar: click **SMS**, then **Campaigns**. The classic admin **Reports > SMS Campaigns** menu item and the old `/app/admin/smscampaigns/` addresses open the same screen, with their filters applied.

An administrator who is limited to some user groups sees, pauses and cancels only the campaigns of accounts in those groups.

## The list

Each row shows one campaign:

- **Campaign**: its name, with its ID under it.
- **Account**: the username, with the user ID under it. Click it to open the account's staff page. **Account deleted** means the account no longer exists.
- **Gateway**: the SMS gateway the campaign sends through.
- **Status**: where the campaign is. A line under it explains a paused, cancelled or failed campaign, for example **Paused while sending**.
- **Audience**, **Sent**, **Delivered** and **Failed**: the message counts so far.
- **Cost**: what the campaign has cost, in the gateway's currency. **Not costed** means it has no cost yet.
- **Started (UTC)**: when sending started, in server time.

A sending campaign that is held back by the account's SMS rate limit shows a line such as **Waiting: SMS rate limit for this account reached (hour = 5000)** under its status. It sends again when the rate window opens.

Click **Refresh** to read the list again and see where a send has got to.

## Filtering the list

Use the toolbar above the list. Each filter applies as you type or choose:

- **User ID or username** shows the campaigns of one account. Type a user ID, or the start of a username.
- **Any status** limits the list to one status.
- **Any gateway** limits the list to one gateway.

Click **Clear filters** to show every campaign. The filters stay in the address, so you can bookmark a filtered view.

## Pause a campaign

Pause stops a **Queueing** or **Sending** campaign where it is and keeps its progress.

1. Click the pause icon in the campaign's row.
2. Check the campaign and account named in the dialog, then click **Pause campaign**.

Messages already handed to the gateway cannot be recalled. Only the account owner can resume the campaign, from their own SMS screen.

## Cancel a campaign

Cancel stops a campaign for good. It is offered for every campaign that has not finished.

1. Click the cancel icon in the campaign's row.
2. Check the campaign and account named in the dialog, then click **Cancel campaign**.

A draft is cancelled at once. A campaign that has started moves to **Cancelling** while the workers drop the messages not yet sent, and then to **Cancelled**. This is not instant. A cancelled campaign cannot be resumed.

If the campaign changed status after the list was loaded, for example it finished, nothing changes and a message says so. Every pause and cancel is recorded in the staff audit log. Pause and Cancel are not available in demo mode.

## Bulk SMS settings

Click **SMS settings** to open the bulk SMS settings, which are still in the classic admin area. They open in a new tab.
