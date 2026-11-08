---
layout: doc
---

# Try Octeth

Install Octeth on your own server with the free Community License and an AI coding agent such as Claude Code or Codex. This page lists what to prepare, the prompt to give the agent, and what the Community License includes. The installation itself takes 10 to 20 minutes once the server and domain are ready.

## Before You Start

Prepare each item on this list. The agent checks them and stops to ask you when one is missing.

1. **A server** with at least 2 vCPUs, 4 GB RAM and 50 GB SSD for testing, or 4 vCPUs, 8 GB RAM and 80 GB SSD for production. See [Server Requirements](/v6.0.5/getting-started/server-requirements).
2. **Ubuntu 24.04 LTS**, freshly installed on x86_64, with root access. Do not install a control panel, web server, database or mail server on it.
3. **Free ports.** No other program on the server listens on ports 80, 443, 25 or 587, and ports 80 and 443 are open to the internet.
4. **Outbound port 25 open.** Many cloud providers block it on new servers. Ask your provider to open it, or plan to send through another relay host.
5. **An A record** for the app domain, for example `mailer.example.com`, pointing at the server's public IPv4 address. The domain must not be behind Cloudflare or another CDN, because the certificate is issued automatically only when the domain points directly at the server.
6. **Reverse DNS** for the server's IP set to a host name in your domain, at your hosting provider. Mail from an IP without matching reverse DNS lands in spam.
7. **An account at [my.octeth.com](https://my.octeth.com/)** with the free Community License. Register, open **Licenses** and click **Get the Community License**.
8. **The app domain added to the license.** On the license page, enter the domain under **Add a domain** and click **Add domain**.
9. **The license key saved to a file.** Click **Show license key**, copy the one-line key and save it as `license.txt`. Do not paste the key into the agent conversation.

## Install with an AI Agent

Run the agent on the server, or give it SSH access to the server, and paste this prompt with your own domain:

```text
Follow https://dev.octeth.com/agent/install.md to install Octeth on this server for the domain mailer.example.com. My license key is in the file license.txt.
```

The agent installs Docker, downloads the latest release your license may download, runs the installer and checks the result. It never prints the license key or the administrator password, and it stops to ask you when DNS, port 25 or the server size need your decision. When it finishes, it tells you the admin area address and where the administrator password is stored on the server.

::: tip Prefer to install by hand
Follow the [Installation Guide](/v6.0.5/getting-started/server-requirements) from Server Requirements to Octeth Installation. It covers the same steps and the options the agent does not use.
:::

## Community License Limits

The Community License is free and has these limits:

- **1 user account.** Administrator accounts do not count.
- **10,000 active subscribers**, counted across every list. Unsubscribed, unconfirmed and hard-bounced subscribers do not count.
- **No updates.** The license includes only the Community build available when it was issued.
- **No support.** Use this documentation for help.
- **1 domain** and no white-label. Only a team that holds no other license can get it.

At a limit, Octeth refuses new user accounts and new subscribers. Existing users and subscribers stay, and campaigns and journeys keep sending to them. See [License](/v6.0.5/using-octeth/administration/license) for how the limits apply.

::: info Raise the limits
Buy a plan at [my.octeth.com](https://my.octeth.com/) and paste its license key on **Settings > License** in the administrator area. The installation keeps its data.
:::

## Next Steps

1. Sign in to the administrator area and change the administrator password.
2. Add a delivery server and a sending domain, then publish the SPF, DKIM and DMARC records Octeth shows. See [Sender Domain DNS Settings](/v6.0.5/getting-started/sender-domain-dns-settings).
3. Connect Claude or ChatGPT to your installation. See [AI Assistants](/v6.0.5/new-user-interface/ai-assistants).
