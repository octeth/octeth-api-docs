---
layout: doc
---

# Connect Claude or ChatGPT to Octeth

You can connect an AI assistant such as Claude or ChatGPT to your Octeth account and ask it questions about your email marketing in plain language. For example: "Which of last month's campaigns had the best click rate?" or "How many subscribers are in my VIP segment?" The assistant looks up the answer in your account and replies in the chat.

The connection uses one web address, the **connector URL**, and your normal Octeth sign-in. You do not need to install anything on your computer or copy an API key by hand.

## What the assistant can do

What an assistant may do depends on the permissions you gave its connection: **read**, **change data** and **send**. A connection with only the read permission can read your data, but it cannot send email, and it cannot create, change or delete anything.

Its read tools include:

| Tool | What it reads |
|---|---|
| `get_account` | Your account: name, email address, company, time zone, plan and sending usage |
| `list_lists` | Your subscriber lists with their subscriber counts |
| `get_list` | One subscriber list |
| `list_segments` | The segments of one list |
| `get_segment_count` | How many subscribers match one segment |
| `list_campaigns` | Your email campaigns, filtered by status or searched by name or subject |
| `get_campaign` | One campaign: status, schedule, target lists and segments |
| `get_campaign_stats` | One campaign's report: sent, delivered, opens, clicks, unsubscribes, bounces and complaints |
| `list_journeys` | Your journeys with their trigger and status |
| `get_journey` | One journey with its actions and statistics |
| `list_email_templates` | Your saved email templates (name, subject and sender, without the HTML) |

### Lists and custom fields

These tools never send email or SMS.

| Tool | Permission | What it does |
|---|---|---|
| `get_lists_overview` | Read | Every list at once, optionally with each list's custom fields, segments, tags and engagement rates |
| `get_list_analytics` | Read | One report for one list: daily activity, bounce trend, click-through by cohort, engagement tiers, mailbox providers, best send times, subscriber sources, subscriber statuses or how long subscribers have been on the list |
| `get_list_sms_settings` | Read | A list's SMS settings: the phone number field, the carrier field and whether it holds phone-only contacts |
| `clone_list` | Change data | Creates an empty copy of a list with its settings and, by default, its custom fields |
| `archive_list`, `unarchive_list` | Change data | Hides a list from the default list views, or brings it back. Nothing is deleted |
| `create_custom_field` | Change data | Adds a field to one list: text, long text, number, date, date and time, time, timestamp, dropdown or checkboxes |
| `update_custom_field` | Change data | Renames a field or changes its default value, visibility, required and unique flags, validation or options |
| `copy_custom_fields` | Change data | Copies every field of one list to another list |
| `update_list_sms_settings` | Change data | Sets the phone number field (only on a list that has none yet), the carrier field or the SMS-only flag |
| `delete_list` | Change data, always confirmed | Deletes a list with all its subscribers |
| `delete_custom_fields` | Change data, always confirmed | Deletes up to 20 fields with every subscriber's value in them |

**Deleting always asks you first.** When the assistant deletes a list or custom fields, Octeth first answers with a preview of what would be deleted (the list's name and how many subscribers it holds, or the field names and their lists) and deletes nothing. The assistant shows you that preview, and the delete happens only if you approve it. Each approval works once and expires after ten minutes. Deleting does not count against the connection's daily send limit.

Some changes stay in the app, because they could import, send or break live content:

- Copying a list that imports subscribers from an external database on a schedule.
- Changing the phone number field of a list that already has one, because it changes which number a live SMS campaign texts.
- Renaming a custom field's merge tag, because every email that uses the old tag would stop personalizing.
- Creating an account-wide (global) custom field, or a field with a custom validation rule.

### Subscribers and tags

| Tool | Permission | What it does |
|---|---|---|
| `get_subscriber` | Read | One subscriber by email address or ID: field values, status, tags, segments, journeys, revenue, and the other lists that hold the same address |
| `search_subscribers` | Read | Finds an email address across all your lists, or the subscribers of one list that match segment-style rules |
| `browse_subscribers` | Read | One page of a list's subscribers (at most 100): active, unsubscribed, bounced, pending confirmation, suppressed, or a segment's members |
| `get_subscriber_activity` | Read | One subscriber's history: sends, opens, clicks, bounces, tags and journeys, their website events, or their SMS events |
| `list_tags` | Read | A list's tags and how many subscribers carry each |
| `create_tag`, `update_tag` | Change data | Creates tags on a list, or renames one |
| `delete_tag` | Change data, always confirmed | Deletes a tag and removes it from every subscriber |
| `delete_subscribers` | Change data, always confirmed | Deletes up to 100 subscribers of one list for good |
| `tag_subscribers`, `untag_subscribers` | Send | Adds tags to or removes tags from up to 100 subscribers. Can start the journeys that begin on that tag |
| `optin_subscriber` | Send | Confirms a subscription that is waiting for confirmation, which runs the list's welcome emails and other subscription actions |

Tagging counts as sending because a tag change can start a journey that emails the subscriber. Each tagged subscriber counts as one recipient against the connection's limits, and above your confirmation threshold the assistant shows you a preview first. Deleting subscribers or a tag always asks you first, as for lists, and does not count against the daily send limit.

Some subscriber work stays in the app: exporting subscribers, deleting every subscriber of a list or every subscriber that matches rules, and tagging every subscriber that matches rules.

### Segments

| Tool | Permission | What it does |
|---|---|---|
| `get_segment_rule_vocabulary` | Read | The fields and operators segment rules accept, and with a list ID that list's custom fields, so the assistant builds valid rules on the first try |
| `copy_segments` | Change data | Copies every segment of one list to another list, with the same names and rules |
| `delete_segments` | Change data, always confirmed | Deletes up to 20 segments. Subscribers are not deleted |

**Deleting always asks you first.** The preview names each segment, its list and whether something live uses it. The delete happens only if you approve it.

A segment that a scheduled, sending or paused campaign, an active SMS campaign, an autoresponder or a journey uses (directly, as an exclusion or nested in another segment) cannot be deleted or have its rules changed by an assistant, because that would change who receives a send nobody re-checked. Delete or change it in the app.

A copied rule that uses a custom field of the source list does not work on the target list. Check each copy's size with `get_segment_count` and rebuild such rules with `update_segment`.

### Email campaigns

These tools never send email. Sending a campaign still needs the send permission and `send_campaign_now` or `schedule_campaign`.

| Tool | Permission | What it does |
|---|---|---|
| `get_campaign_counts` | Read | How many campaigns the account has in each status, optionally for some tags or a send date range |
| `get_campaign_recipients` | Read | How many subscribed recipients a campaign that has not been sent yet would reach, when its audience is built from rules |
| `get_campaign_recipient_activity` | Read | Who opened, clicked, bounced, unsubscribed, forwarded or converted on a sent campaign, optionally for one A/B variation |
| `get_campaign_link_clicks` | Read | Clicks per link, or who clicked and how often |
| `get_campaign_abtest_results` | Read | Each A/B variation's figures and the winner, and the figures of an auto-resend to non-openers |
| `copy_campaign` | Change data | Copies a campaign with its content and recipients into a new unscheduled draft named "Copy of ..." |
| `delete_campaigns` | Change data, always confirmed | Deletes up to 20 campaigns with their reports |

**Deleting always asks you first.** The preview names each campaign, its status, how many recipients it was sent to and any auto-resend campaign that is deleted with it. A campaign that is sending cannot be deleted by an assistant: pause it first, or wait until it finishes.

Exporting a campaign report and the public archive link stay in the app, because both hand out a link that works without the connection.

### SMS campaigns

An assistant can plan, cost, test and send SMS campaigns, send a single text, and manage SMS templates, test numbers and SMS suppressions. Every SMS costs money per message part, so SMS sends count against their own limits, separate from the email ones (see [SMS limits](#sms-limits)).

| Tool | Permission | What it does |
|---|---|---|
| `list_sms_campaigns`, `get_sms_campaign` | Read | Your SMS campaigns with their status, audience, confirmed cost and counters, optionally with the count per status and the totals per currency |
| `get_sms_campaign_report` | Read | One campaign's report: the delivery funnel and cost, a breakdown by hour, day, carrier, country, error, link or sender, a time series, or clicks per link |
| `list_sms_campaign_events`, `list_sms_campaign_recipients`, `list_sms_campaign_replies` | Read | A campaign's event log, its recipients with their delivery status, and the replies it received |
| `preview_sms_test` | Read | The campaign's message as a test would send it, with its parts and cost |
| `list_sms_templates`, `get_sms_template` | Read | Your saved SMS templates |
| `get_sms_account_stats`, `list_sms_replies`, `list_sms_merge_tags` | Read | Account-wide SMS counters, every reply received, and the personalization tags a list offers |
| `list_sms_gateways`, `list_sms_test_numbers`, `list_sms_suppressions` | Read | The gateways you may send through, your test numbers, and the numbers you never text |
| `create_sms_campaign`, `update_sms_campaign`, `copy_sms_campaign` | Change data | Creates, edits or copies a draft SMS campaign. A draft texts nobody |
| `estimate_sms_campaign` | Change data | Counts an audience, and costs a draft campaign: the sendable recipients, the message parts and the projected cost, the same figures the app shows |
| `pause_sms_campaign`, `cancel_sms_campaign` | Change data | Stops a campaign that is sending, or cancels one that has not finished |
| `create_sms_template`, `update_sms_template` | Change data | Saves or edits reusable SMS text. Campaigns keep their own copy of the text |
| `verify_sms_test_number` | Change data | Verifies a test number with the code texted to it. The assistant asks you for the code |
| `add_sms_suppression` | Change data | Stops texting one or more numbers, account-wide or on one list |
| `delete_sms_campaign`, `delete_sms_template` | Change data, always confirmed | Deletes a draft or finished campaign, or a template |
| `send_sms_test` | Send | Texts one test of a campaign to a verified test number |
| `send_sms_campaign_now`, `schedule_sms_campaign` | Send | Sends a costed draft campaign now, or at a set time, at the cost of its estimate |
| `resume_sms_campaign` | Send | Resumes a paused campaign |
| `send_sms` | Send | Texts one message to one number, exactly as written |
| `add_sms_test_number` | Send | Adds a test number and texts it a verification code |
| `remove_sms_suppression` | Send, always confirmed | Lets texts reach a suppressed number again |

A typical SMS campaign: the assistant creates a draft, costs it with `estimate_sms_campaign`, sends a test to your verified number, and then sends or schedules it with the estimate it showed you. Editing the draft afterwards voids the estimate, so it costs the campaign again before sending.

**Removing an SMS suppression always asks you first,** like removing an email suppression: the number was suppressed because it opted out, complained, bounced or was added by hand, so the assistant shows you the number and the reason and removes it only after you approve. Deleting an SMS campaign or template asks you first too.

Some SMS actions stay in the app: SMS gateways and their settings, the account's SMS settings, suppression patterns, exports of campaign events, and resuming a campaign that Octeth paused because its cost changed from the confirmed cost.

### Journeys

| Tool | Permission | What it does |
|---|---|---|
| `get_journey_stats` | Read | How a journey performs, per email step or per mailbox provider, over up to 366 days: sends, deliveries, opens, clicks, bounces, unsubscriptions, complaints and revenue |
| `get_journey_action_subscribers` | Read | The subscribers an email step reached, optionally only those who opened, clicked, converted, unsubscribed, bounced or complained |
| `list_subscriber_journeys` | Read | The journeys one subscriber has been enrolled in |
| `clone_journey` | Change data | Copies a journey with its trigger and steps. The copy is always turned off |
| `delete_journeys` | Change data, always confirmed | Deletes up to 10 journeys with their steps and history. A journey that is turned on is refused until the assistant turns it off with `disable_journey` |
| `exit_subscriber_from_journey` | Send | Takes one subscriber out of a journey. Exit finishes the journey for them, which starts any journey that begins when this one is completed. Remove deletes their enrolment and starts nothing |
| `trigger_subscribers_into_journey` | Send | Puts every subscriber of a list, or of one segment, into a journey that is turned on. Counts against the connection's send limits by the number of subscribers |

**Deleting a journey always asks you first.** The preview names each journey, its status and trigger, and how many subscribers are still in it. Nothing is deleted until you approve.

**Putting many subscribers into a journey is a send.** Octeth counts the list or segment before it starts, so the connection's per-send recipient limit and confirmation threshold apply to the whole audience.

Building or changing a journey's steps, publishing steps, copying a journey to another account and exporting journey data stay in the app.

The assistant reaches your data through the same rules as the rest of Octeth, so it only ever sees your own account.

## Before you start

- **A customer account.** Staff accounts cannot connect an assistant. If you are signed in as staff, the connection screen asks you to sign out and sign in with the customer account you want to connect.
- **API access on your plan.** Connecting an assistant counts as API access. If your plan does not include the API, the connection screen says so and you need to upgrade your plan first.
- **Your connector URL.** It is `https://<your app domain>/mcp`, for example `https://octeth.example.com/mcp`. The easiest way to get it is to copy it from Octeth:
  1. Sign in to Octeth.
  2. Open **API & webhooks** in the left menu.
  3. Click **Connected AI assistants**.
  4. Click the copy button next to the URL under **Connector URL**.

## Connect Claude

You can add custom connectors on Claude.ai and in the Claude desktop app.

1. In Claude, open **Settings**, then **Connectors**.
2. Click **Add custom connector**.
3. Enter a name, for example `Octeth`, and paste your connector URL.
4. Click **Add**, then **Connect**. Claude opens your Octeth sign-in page.
5. Sign in to Octeth if you are not already signed in. Two-factor authentication works as usual.
6. Review the consent screen and click **Allow**. You return to Claude.

Claude now lists the Octeth tools under the connector. Start a new chat and ask a question about your account.

::: info
On Claude team and enterprise plans, an organization owner may need to add the connector first. Ask your Claude administrator if you do not see **Add custom connector**.
:::

## Connect ChatGPT

ChatGPT connects to custom connectors through developer mode.

1. In ChatGPT, open **Settings**, then **Apps and Connectors**, then **Advanced**.
2. Turn on **Developer mode**.
3. Go back to **Apps and Connectors** and click **Create**.
4. Enter a name, for example `Octeth`, and paste your connector URL.
5. Under **Authentication**, choose **OAuth**.
6. Confirm that you trust the connector and click **Create**. ChatGPT opens your Octeth sign-in page.
7. Sign in to Octeth and click **Allow** on the consent screen. You return to ChatGPT.

In a new chat, turn on the Octeth connector from the tools menu and ask your question.

::: tip
The names of menus in Claude and ChatGPT change from time to time. If a step does not match what you see, look for "connectors", "apps" or "custom connector" in the assistant's settings.
:::

## Connect Claude Code, Codex and other coding agents

Coding agents that run in a terminal connect to the same URL and sign in the same way. Run these commands on your own computer. `<your app domain>` is the domain of your Octeth, for example `mailer.example.com`.

### Claude Code

```bash
claude mcp add --transport http octeth https://<your app domain>/mcp
```

Start Claude Code, type `/mcp`, choose **octeth** and **Authenticate**. Your browser opens the Octeth sign-in page. Sign in and click **Allow**.

### Codex

```bash
codex mcp add octeth --url https://<your app domain>/mcp
codex mcp login octeth
```

The login opens your browser. Sign in to Octeth and click **Allow**.

### Gemini CLI

Add the server to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "octeth": {
      "httpUrl": "https://<your app domain>/mcp"
    }
  }
}
```

Start Gemini CLI and run `/mcp auth octeth` to sign in. If the sign-in does not complete, connect with an agent key as described below.

### Other agents

Any agent that supports remote MCP servers over HTTP with OAuth works the same way: give it the connector URL and sign in when it opens your browser.

### Agents that cannot sign in

A script, a scheduled job or a hosted agent with no browser uses an agent key instead of the sign-in:

1. In Octeth, open **API & webhooks** > **Connected AI assistants** and click **Create agent key**.
2. Choose what the agent may do and its daily limits, then copy the key. It is shown only once.
3. Store the key in an environment variable on the machine that runs the agent, for example `OCTETH_AGENT_KEY`, and send it as `Authorization: Bearer <key>`. Keep it out of files that are committed or shared.

With the key in `OCTETH_AGENT_KEY`:

- **Claude Code**: add the server to the project's `.mcp.json` with the header `"Authorization": "Bearer ${OCTETH_AGENT_KEY}"`.
- **Codex**: `codex mcp add octeth --url https://<your app domain>/mcp --bearer-token-env-var OCTETH_AGENT_KEY`
- **Gemini CLI**: add `"headers": { "Authorization": "Bearer $OCTETH_AGENT_KEY" }` next to `httpUrl`.

An agent key has the same permissions, limits and confirmation step as a connection made through the sign-in, and it appears on the same page, where you can revoke it.

### Installing and upgrading Octeth with an agent

Coding agents can also install and upgrade Octeth itself. See [Let an AI coding agent install Octeth](/v6.0.6/getting-started/octeth-installation) and [Let an AI coding agent upgrade Octeth](/v6.0.6/getting-started/upgrading-octeth#running-the-upgrade).

## The consent screen

Before anything is connected, Octeth shows a consent screen. It tells you:

- The name of the assistant asking to connect.
- What it will be able to do: read your lists, segments and subscriber counts, your campaigns and their reports, and your journeys and email templates.
- What it will not be able to do: send email, or create, change or delete anything.
- The account you are signed in as, and the site you return to after you approve.

Click **Allow** to connect, or **Cancel** to stop. If the assistant's name or the return site looks wrong, click **Cancel**.

## Manage connected assistants

Open **API & webhooks** > **Connected AI assistants** to see every assistant connected to your account.

The **Connected assistants** table shows each assistant's name, when it was connected, when it was last used, and its status (**Active** or **Revoked**).

The **Recent activity** table lists the last 25 tool calls made by your assistants: when, which assistant, which tool, the result (**OK**, **Denied** or **Error**) and how long it took. Use it to check what an assistant looked at.

### Disconnect an assistant

1. Open **API & webhooks** > **Connected AI assistants**.
2. Click the delete icon on the assistant's row.
3. Click **Disconnect** to confirm.

The assistant loses access immediately. To use it again, connect it again from the assistant.

### SMS limits

Each connection has separate limits for email and SMS. Open **API & webhooks** > **Connected AI assistants**, click the settings icon on the assistant's row, and fill in:

- **SMS per day**: how many text messages the assistant may send per day (UTC). A campaign to 500 numbers uses 500.
- **SMS recipients per send**: the most numbers one SMS send may reach. A confirmation cannot raise it.
- **Confirm SMS sends above**: an SMS send to more numbers than this first shows you a preview with the cost, and goes ahead only after you approve it.

Leave a field empty for no limit. Email sends never count against the SMS limits, and SMS sends never count against the email ones. Your service provider can set the same three limits for every connection on your account, and the stricter of the two applies.

### The API key behind each connection

Each connection gets its own API key, created when you click **Allow**. You can see it on your API keys page with the note `AI connector: <assistant name>`, for example `AI connector: Claude`.

Disconnecting an assistant deletes its key. If you delete the key yourself on the API keys page, the assistant is disconnected too, and its status changes to **Revoked** the next time it tries to use your account.

## Getting more from your AI assistant

You can ask your assistant anything in your own words. For common multi-step jobs, Octeth also gives the assistant ready-made **prompts**: guided workflows that tell it which steps to take and in which order. It also gives it read-only **resources** it can load as background before it starts.

### Guided prompts

In Claude, prompts appear in the **+** menu (or when you type `/`) under the Octeth connector. Other assistants list them in a similar menu. Pick one, fill in its fields, and send it.

| Prompt | What it does | You fill in |
|---|---|---|
| `plan_campaign` | Plans a campaign from a goal: picks or builds the audience, writes two content variants, checks them for spam signals, then creates, tests and sends the campaign in stages | The goal, and optionally who it is for and the most emails to send |
| `reengage_inactive` | Finds subscribers who have not opened or clicked for a number of days, writes a win-back email, sends it, and suggests what to do with those who still do not respond | The number of days (90 if you leave it empty) |
| `build_journey` | Turns a description of an automation into a journey plan (trigger, steps, waits and emails) and the steps to build it in the journey builder | A description, for example "welcome new subscribers with three emails over two weeks" |
| `list_hygiene` | Checks one list's health (inactive, bounced and unsubscribed counts), plans a re-confirmation campaign, and suggests who to stop sending to | The list ID |
| `explain_campaign_results` | Explains one campaign's results in plain words and compares them with your recent campaigns | The campaign ID |

Every prompt adapts to what you allowed the connection to do. On a read-only connection the assistant plans and explains, and tells you which steps to finish in Octeth yourself. With **Change data** allowed it can also create segments, templates and campaigns, which sends nothing. With **Send** allowed it can send too.

::: warning Sends always wait for you
A prompt never lets the assistant send on its own. Before any send, the assistant shows you what will go out (the campaign, the recipients and how many) and waits for your explicit approval. When Octeth asks for a confirmation, the assistant shows you the preview and continues only after you approve it.
:::

The assistant cannot create or edit journeys, so `build_journey` ends with steps for you to follow in the journey builder. Clicks per link and A/B tests are also not available to the assistant: it points you to the campaign report and the campaign editor for those.

### Background the assistant can read

These resources are read-only and show only your own account:

| Resource | What it holds |
|---|---|
| `account://policy` | Your account, your plan limits and sending usage, and what this connection may do: its permissions, daily sends, recipients per send and the confirmation threshold, and its SMS limits |
| `account://lists` | Your subscriber lists with their IDs and subscriber counts |
| `account://lists/<list ID>/segments` | The segments of one list |
| `account://campaigns/recent` | Your last 10 sent campaigns, which the assistant uses as a baseline for comparisons |

Reading a resource is recorded in **Recent activity** like a tool call, under the tool that served it (for example `list_lists`).

### For developers and autonomous agents

Agents that do not use MCP, such as scheduled scripts or bots that call HTTP APIs, can find their way from two public files at the root of your Octeth address:

- `https://<your app domain>/llms.txt` points to the connector URL, the OpenAPI document and this article.
- `https://<your app domain>/agents/openapi.json` is an OpenAPI 3.1 description of every API command an AI agent key may call, with the permission each one needs and the error codes an agent can receive (100010 to 100016). It is generated from Octeth's own list of agent commands, so it always matches what the API allows.

Neither file contains anything from any account. An agent that calls the API directly authenticates with an agent key you create under **API & webhooks** > **Connected AI assistants**, and is bound by the same permissions, limits and confirmation step as a connector.

Commands that delete data, such as `lists.delete` (at most 10 list IDs), `customfields.delete` (at most 20 field IDs), `subscribers.delete` (at most 100 subscriber IDs of one list), `subscriber.tags.delete` (at most 20 tag IDs), `segments.delete` (at most 20 segment IDs, none of them in live use), `campaigns.delete` (at most 20 campaign IDs, none of them sending) and `journeys.delete` (at most 10 journey IDs, none of them turned on), `smscampaign.delete` and `smstemplate.delete`, always answer an agent key with ErrorCode 100012, a `Preview` and a `ConfirmToken` first, and delete nothing. Repeat the identical call with `ConfirmToken` after the person approves. So does `smssuppression.delete` (one `SuppressionID` at a time). Other API keys are unaffected.

For SMS, the delivery commands (`smscampaign.send`, `smscampaign.schedule`, `smscampaign.resume`, `smscampaign.test`, `sms.send`, `sms.testnumber.add`) count against the key's SMS limits, not its email ones, and refuse with ErrorCode 100011 and `Budget` `SMSPerDay`, `SMSMaxRecipientsPerSend` or `SMSConfirmAbove`.

For subscribers, `subscriber.tag`, `subscriber.untag` and `subscriber.optin` need the send permission and count one recipient per subscriber.

For segments, `segments.delete` refuses a segment that a live send or automation uses with ErrorCode 100016, and an agent key's `segments.copy` keeps each segment's JSON rules and random-subset options.

For campaigns, `campaign.copy` accepts only `CampaignID`, `campaign.recipients.get` needs `OnlyTotal=true`, and `campaigns.delete` refuses a campaign that is sending with ErrorCode 100016.

For journeys, `subscribers.journey.bulk` accepts only `Mode=enroll` with `ListID`, `JourneyID` and an optional `SegmentID`, and `subscriber.journey.exit` needs the send permission because finishing a journey can start another. `journey.create`, `journey.update`, `journey.actions.update`, `journey.actions.published`, `journey.copytouser` and `journey.export.*` are refused to agent keys.

Your Octeth administrator can turn both files off with `MCP_DISCOVERY_ENABLED=false`, for example when the app domain serves its own `llms.txt`, and can point `llms.txt` at their own help page with `MCP_DISCOVERY_HELP_URL`. The administrator can also turn the connector itself off with `MCP_ENABLED=false`. The connector address then answers "not found", `llms.txt` no longer lists it, and agent keys keep working against the HTTP API.

## For Octeth operators: setup tools

Staff can connect an assistant to the admin side of Octeth too. An operator connection gets these read tools: `get_setup_status` ("what is left to set up"), `list_delivery_servers`, `get_delivery_server`, `list_user_groups`, `get_user_group`, `get_settings`, `list_alerts` and `get_alert`. With **Act** ticked on the consent screen it also gets `create_delivery_server`, `update_delivery_server`, `test_delivery_server`, `create_user_group`, `update_user_group`, `assign_delivery_server` and `update_settings` (the bounce and FBL mailboxes).

Staff sign in on the same page customers use, with their admin username and password. If two-factor authentication is on for the staff account, the next page asks for the 6-digit code from the authenticator app. Recovery keys are not entered there. If you lost your authenticator, follow the **Lost your authenticator?** link on the code page. It opens the admin area's reset page, where your recovery key turns two-factor authentication off. Then sign in again.

Every action shows a preview and waits for your yes. Passwords are write-only: the assistant can set one, but never sees it again. Secrets and webhook URLs in the settings it reads come back redacted.

Some changes stay with you in the admin area, whatever you approve in the chat:

- **Delivery servers you added, and mail that is already flowing.** The assistant changes where a delivery server sends, assigns it or tests it only when an assistant added that server and nothing sends through it yet: no user group, user override, delivery route, global segment or IP pool uses it. On any other server, including every server you added in the admin area, it can change only the name and the timeout: the host, port, encryption, login, password, tracking domains, MAIL FROM domain and enforced From address stay as they are. It assigns a delivery server only to a user group that has no users yet. When it changes the host, port, login or password of its own server, the server's test result is cleared, so it must pass a new test before it is assigned.
- **Internal hosts.** A delivery server or mailbox host must resolve only to public internet addresses, on a standard port: 25, 465, 587 or 2525 for SMTP, and 143 or 993 for the IMAP mailbox. A test send checks the host again when it runs and connects to the address it checked. A server on your private network or another container on the install is set up in the admin area.
- **Mailboxes that are already on.** The assistant turns on a bounce or FBL mailbox that is off. Changing the host, username or password of one that is on, or turning one off, is done in the admin area.
- **Server error text.** When a test send or a mailbox login fails, the assistant gets a short explanation. The mail server's own reply is shown only in the admin area.

The connector never reads or writes `.oempro_env` and never restarts a container. Server settings are changed on the server with `./cli/octeth.sh env:plan` and `env:apply`, by the operator or a local agent there.

Octeth checks your alert rules every five minutes with no assistant running and sends an email or a webhook (a Telegram bot URL works). The assistant investigates afterwards with `list_alerts` and `get_alert`.

## Troubleshooting

### "Couldn't discover OAuth settings" or a similar error when adding the connector

The assistant could not reach the sign-in details at your connector URL. This happens when:

- Your Octeth address is not reachable from the internet over `https://`. Claude and ChatGPT connect from their own servers, so an address that only works on your office network or without a valid certificate does not work.
- The new user interface is not turned on for your Octeth installation.

Check that the URL opens in a browser outside your network and starts with `https://`. If it does, ask your Octeth administrator to check that the new user interface is enabled and that their reverse proxy forwards the connector paths.

### "An AI assistant cannot be connected to a customer account by staff"

You are a staff member impersonating a customer. A customer approves an assistant for their own account. To connect an assistant to the operator tools, stop impersonating and open the connector link again. To connect a customer account, sign out, sign in as that customer and start the connection again from the assistant.

### "AI assistants are not available"

Your plan does not include API access, or API access is turned off on this installation. Upgrade your plan, or contact your provider.

### "The assistant could not be connected"

Octeth could not create the API key for the connection, so nothing was connected. The page shows the reason. Fix it if you can, then start the connection again from the assistant.

### The assistant stopped working

Check **API & webhooks** > **Connected AI assistants**. If the status is **Revoked**, the connection was disconnected or its API key was deleted. Remove the connector in the assistant and add it again.

An assistant that has not been used for 30 days must sign in again. Reconnect it from the assistant's connector settings.
