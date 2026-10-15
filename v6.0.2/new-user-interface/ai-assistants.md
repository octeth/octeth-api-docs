---
layout: doc
---

# Connect Claude or ChatGPT to Octeth

You can connect an AI assistant such as Claude or ChatGPT to your Octeth account and ask it questions about your email marketing in plain language. For example: "Which of last month's campaigns had the best click rate?" or "How many subscribers are in my VIP segment?" The assistant looks up the answer in your account and replies in the chat.

The connection uses one web address, the **connector URL**, and your normal Octeth sign-in. You do not need to install anything on your computer or copy an API key by hand.

## What the assistant can do

In this release the connection is **read-only**. The assistant can read your data, but it cannot send email, and it cannot create, change or delete anything.

It has these tools:

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

### The API key behind each connection

Each connection gets its own API key, created when you click **Allow**. You can see it on your API keys page with the note `AI connector: <assistant name>`, for example `AI connector: Claude`.

Disconnecting an assistant deletes its key. If you delete the key yourself on the API keys page, the assistant is disconnected too, and its status changes to **Revoked** the next time it tries to use your account.

## Troubleshooting

### "Couldn't discover OAuth settings" or a similar error when adding the connector

The assistant could not reach the sign-in details at your connector URL. This happens when:

- Your Octeth address is not reachable from the internet over `https://`. Claude and ChatGPT connect from their own servers, so an address that only works on your office network or without a valid certificate does not work.
- The new user interface is not turned on for your Octeth installation.

Check that the URL opens in a browser outside your network and starts with `https://`. If it does, ask your Octeth administrator to check that the new user interface is enabled and that their reverse proxy forwards the connector paths.

### "Sign in as a customer to connect"

You are signed in with a staff account. Sign out of Octeth, sign in with the customer account you want to connect, then start the connection again from the assistant.

### "AI assistants are not available"

Your plan does not include API access, or API access is turned off on this installation. Upgrade your plan, or contact your provider.

### "The assistant could not be connected"

Octeth could not create the API key for the connection, so nothing was connected. The page shows the reason. Fix it if you can, then start the connection again from the assistant.

### The assistant stopped working

Check **API & webhooks** > **Connected AI assistants**. If the status is **Revoked**, the connection was disconnected or its API key was deleted. Remove the connector in the assistant and add it again.

An assistant that has not been used for 30 days must sign in again. Reconnect it from the assistant's connector settings.
