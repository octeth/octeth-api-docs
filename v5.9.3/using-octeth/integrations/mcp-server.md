---
layout: doc
---

# MCP Server (AI Assistant)

Octeth ships an official **MCP server** — [`@octeth/mcp`](https://www.npmjs.com/package/@octeth/mcp) — that lets an AI assistant manage **your own** Octeth account in natural language: draft and send campaigns, create email content and templates, pull campaign reports, work with journeys, and build segments. It connects to Octeth through your personal API key and works with any client that supports the [Model Context Protocol](https://modelcontextprotocol.io), including Claude Desktop and Claude Code.

This article covers what the MCP server is, how to connect it, the available configuration, and its built-in safety model.

## What Is MCP?

The Model Context Protocol (MCP) is an open standard that lets AI assistants talk to external tools and data sources. The Octeth MCP server exposes a curated set of Octeth actions as MCP "tools", so you can simply ask your AI client — for example, *"show me last week's top campaigns"* or *"draft a re-engagement campaign to my inactive subscribers"* — and it performs the work through Octeth's API on your behalf.

The server runs **locally**, alongside your AI client. It is invoked automatically by the client; you do not normally run it by hand.

## Prerequisites

Before setting up the integration, make sure you have:

- **An AI client that supports MCP** — such as [Claude Desktop](https://claude.ai/download) or [Claude Code](https://claude.com/claude-code).
- **[Node.js](https://nodejs.org) 20 or newer** installed on the same machine as your AI client. The server is run with `npx`, which comes with Node.js.
- **An Octeth user account** with API access.
- **An Octeth API key** — generated from your dashboard (see below). The MCP server always uses a **personal user API key**; it never uses administrator credentials.
- **Your Octeth base URL** — the address you use to log in, ending with a slash, e.g. `https://console.example.com/`.

### Generating an API Key in Octeth

1. Log in to your Octeth account.
2. Navigate to **Settings** in the top menu.
3. Click the **API Keys** tab.
4. Click **Generate New Key** and copy the key.

The API Keys page also shows a ready-to-copy MCP configuration snippet pre-filled with your account's base URL.

## Connecting Claude Desktop

Open Claude Desktop's configuration file (`claude_desktop_config.json`) and add an `octeth` server under `mcpServers`, replacing `your-api-key` with the key you generated and the base URL with your own:

```json
{
  "mcpServers": {
    "octeth": {
      "command": "npx",
      "args": ["-y", "@octeth/mcp"],
      "env": {
        "OCTETH_BASE_URL": "https://console.example.com/",
        "OCTETH_API_KEY": "your-api-key",
        "OCTETH_READ_ONLY": "true"
      }
    }
  }
}
```

Restart Claude Desktop. The Octeth tools become available in the conversation.

## Connecting Claude Code

Run the following, substituting your base URL and API key:

```bash
claude mcp add octeth -s user \
  -e OCTETH_BASE_URL=https://console.example.com/ \
  -e OCTETH_API_KEY=your-api-key \
  -e OCTETH_READ_ONLY=true \
  -- npx -y @octeth/mcp
```

Starting with `OCTETH_READ_ONLY=true` lets you verify the connection safely before enabling writes.

## Configuration Reference

The server is configured entirely through environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OCTETH_BASE_URL` | Yes¹ | — | Your Octeth base URL, e.g. `https://console.example.com/`. |
| `OCTETH_API_KEY` | Yes¹ | — | Your personal Octeth API key (Settings → API Keys). |
| `OCTETH_READ_ONLY` | No | `false` | When `true`, blocks all writes — read and reporting only. |
| `OCTETH_ALLOW_SENDS` | No | `false` | Must be `true` to permit the gated irreversible actions (see Safety Model). |
| `OCTETH_TIMEOUT_MS` | No | `30000` | Per-request HTTP timeout in milliseconds. |
| `OCTETH_ACCOUNTS` | No | — | JSON object of named accounts for multi-account mode (see below). |

¹ Required in single-account mode. Ignored when `OCTETH_ACCOUNTS` is set.

## Safety Model

The server is designed so an AI assistant cannot take a damaging action by accident:

- **Reads and reversible writes** — reports, drafting campaigns, creating or editing content, templates, and segments — work whenever the server is not read-only.
- **Irreversible actions** — sending or scheduling a campaign, enabling a journey, triggering a subscriber into a journey, and deleting an email template — require **both** `OCTETH_ALLOW_SENDS=true` **and** a two-step confirmation: the first call returns a preview plus a one-time confirmation token, and the action only runs when the assistant calls again with that token.
- **Read-only mode** — set `OCTETH_READ_ONLY=true` to block every write regardless of other settings. This is the recommended way to try the server for the first time.

## Managing Multiple Accounts

To manage several Octeth accounts (for example an agency, or production plus test) from one server instance, set `OCTETH_ACCOUNTS` to a JSON object mapping a name to each account's connection and optional per-account safety flags:

```json
{
  "prod": { "baseUrl": "https://prod.example.com/", "apiKey": "key-prod", "readOnly": true },
  "test": { "baseUrl": "https://test.example.com/", "apiKey": "key-test", "allowSends": true }
}
```

When multi-account mode is active, no account is selected at startup — ask the assistant to switch to one (it can list the available account names; API keys are never revealed) before running any tool. If `OCTETH_ACCOUNTS` is not set, the single `OCTETH_API_KEY` / `OCTETH_BASE_URL` pair is used and is active immediately.

## Troubleshooting

- **Tools don't appear** — confirm Node.js 20+ is installed (`node --version`) and restart the AI client after editing its configuration.
- **Authentication errors** — re-check `OCTETH_BASE_URL` (it must end with a slash and point at the address that serves the Octeth application) and that the API key is valid and belongs to a user account with API access.
- **A send or other irreversible action is refused** — this is expected unless `OCTETH_ALLOW_SENDS=true` is set and you complete the two-step confirmation.
