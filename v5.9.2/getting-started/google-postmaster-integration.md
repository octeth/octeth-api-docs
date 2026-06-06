---
layout: doc
---

# Google Postmaster Tools Integration

Google Postmaster Tools shows you how Gmail sees your sending: domain and IP reputation, spam rates, authentication results, and delivery errors. When you connect it to Octeth, this data is pulled in automatically every day and displayed inside your admin dashboard, so you can monitor your Gmail deliverability without leaving Octeth.

This guide walks you through the full setup: creating Google OAuth credentials, enabling the API, adding three values to your `.oempro_env` file, and connecting your Google account from the Octeth admin area.

The connection is configured once, by an administrator, and applies to your whole Octeth installation.

## How the integration works

Octeth talks to Google Postmaster Tools using **OAuth 2.0**, the standard "Sign in with Google" authorization flow. Instead of storing your Google password, Octeth receives a secure token that grants read-only access to your Postmaster data.

Setting it up has three parts:

1. **In Google Cloud Console** — create OAuth credentials and turn on the Postmaster Tools API.
2. **In your `.oempro_env` file** — paste the credentials so Octeth knows who it is.
3. **In the Octeth admin area** — click **Connect** to authorize the link.

Once connected, Octeth collects your data automatically on a daily schedule.

## Prerequisites

Before you begin, make sure you have:

- **Administrator access** to your Octeth installation.
- **Command-line (SSH) access** to the server, so you can edit `.oempro_env`.
- A **Google account** that already has access to [Google Postmaster Tools](https://postmaster.google.com/) with at least one verified sending domain.
- Your Octeth installation reachable over **HTTPS** (recommended). Google requires a valid redirect URL, and a secure URL is strongly preferred.

::: info What "verified domain" means
Postmaster Tools only reports data for domains you have already added and verified at [postmaster.google.com](https://postmaster.google.com/). If you have not done this yet, add your sending domain there first. Octeth can only display data that Google has collected.
:::

## Step 1: Create OAuth credentials in Google Cloud Console

In this step you create the identity Octeth uses to ask Google for your Postmaster data.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and sign in.
2. Create a new project (or select an existing one) using the project picker at the top of the page.
3. In the search bar, search for **Gmail Postmaster Tools API** and open it.
4. Click **Enable** to turn the API on for your project.

[[SCREENSHOT: The Google Cloud Console with the Gmail Postmaster Tools API page and the Enable button highlighted]]

5. In the left menu, go to **APIs & Services** > **Credentials**.
6. Click **Create Credentials** and choose **OAuth client ID**.

::: tip Configure the consent screen first
If this is your first set of credentials, Google asks you to set up the **OAuth consent screen** before continuing. Choose **External** (or **Internal** if your domain uses Google Workspace), enter an app name and your support email, and save. You do not need to submit the app for verification to use it yourself.
:::

7. For **Application type**, select **Web application**.
8. Give the client a clear name, such as `Octeth Postmaster`.
9. Under **Authorized redirect URIs**, click **Add URI** and enter your Octeth callback URL:

   ```
   https://yourdomain.com/app/google-postmaster-oauth/callback
   ```

   Replace `yourdomain.com` with your actual Octeth domain.

10. Click **Create**.

Google now shows your **Client ID** and **Client Secret**. Keep this window open, or copy both values somewhere safe — you need them in the next step.

[[SCREENSHOT: The OAuth client created dialog showing the Client ID and Client Secret fields]]

::: danger The redirect URI must match exactly
The redirect URI you enter in Google must be **character-for-character identical** to the one you put in `.oempro_env` in the next step. If they differ — even by `http` vs `https`, a missing `/app`, or a trailing slash — Google will reject the connection with a "redirect_uri_mismatch" error.

The correct path is `/app/google-postmaster-oauth/callback`. If you changed the default application directory name (the `APP_DIRNAME` setting) from `app` to something else, use that name in the URL instead.
:::

## Step 2: Add your credentials to `.oempro_env`

Now tell Octeth about the credentials you just created.

1. Connect to your Octeth server over SSH.
2. Open the main configuration file for editing:

   ```bash
   nano /opt/octeth/.oempro_env
   ```

3. Find the **Google Postmaster Tools** section and set these three values:

   ```bash
   GOOGLE_POSTMASTER_CLIENT_ID="your-client-id-here"
   GOOGLE_POSTMASTER_CLIENT_SECRET="your-client-secret-here"
   GOOGLE_POSTMASTER_REDIRECT_URI="https://yourdomain.com/app/google-postmaster-oauth/callback"
   ```

   | Variable | What to enter |
   |---|---|
   | `GOOGLE_POSTMASTER_CLIENT_ID` | The Client ID from Step 1 |
   | `GOOGLE_POSTMASTER_CLIENT_SECRET` | The Client Secret from Step 1 |
   | `GOOGLE_POSTMASTER_REDIRECT_URI` | The exact redirect URL you registered in Google |

4. Save the file and exit the editor.

::: warning Keep these values private
`.oempro_env` holds sensitive credentials. Never commit it to version control or share it publicly, and keep any backups in secure, encrypted storage.
:::

## Step 3: Restart Octeth to load the new settings

Octeth reads `.oempro_env` when its services start, so your new values only take effect after a restart.

```bash
cd /opt/octeth
./cli/octeth.sh docker:restart
```

::: tip Verify the values loaded
After the restart, you can confirm the file was saved correctly by viewing it:

```bash
grep GOOGLE_POSTMASTER /opt/octeth/.oempro_env
```

All three lines should show your values, with no empty fields.
:::

## Step 4: Connect your Google account in Octeth

With the credentials in place, you can now authorize the connection from the admin dashboard.

1. Log in to your Octeth **Administrator** dashboard.
2. Go to **Admin** > **Google Postmaster**.
3. Click **Connect** (or **Connect Google Account**).

[[SCREENSHOT: The Google Postmaster admin page showing the Connect button before any account is linked]]

4. You are redirected to Google's sign-in and consent screen. Sign in with the Google account that has access to your Postmaster Tools data.
5. Review the requested permission — Octeth asks only for **read-only** access to your Postmaster data — and click **Allow**.

[[SCREENSHOT: The Google consent screen showing the read-only Postmaster permission and the Allow button]]

6. Google returns you to Octeth, and you see a success message confirming the connection.

That's it — your account is now linked.

::: info Data appears the next day, not instantly
After you connect, Octeth does not pull data immediately. It collects your Postmaster metrics automatically during the next scheduled run. The first reports usually appear **the following day**. See [What to expect after connecting](#what-to-expect-after-connecting) below.
:::

## What to expect after connecting

Octeth gathers and processes your Postmaster data using three automated background tasks (cron jobs) that run once a day:

| Time (server time) | Task | What it does |
|---|---|---|
| 03:15 | Data collector | Pulls the latest domain and IP reputation, spam rate, and authentication metrics from Google |
| 04:00 | Cleanup | Removes old, expired data to keep storage tidy |
| 05:00 | Aggregation | Summarizes the collected data for the dashboard charts |

Because collection runs in the early morning, allow up to a full day after connecting before your first metrics appear. From then on, your dashboard refreshes daily.

::: tip Tokens refresh automatically
You only connect once. Octeth securely stores a refresh token and renews its access to Google automatically in the background, so you do not need to reconnect periodically. You would only reconnect if you intentionally disconnect or if you revoke Octeth's access from your Google account.
:::

## Disconnecting your account

To remove the link between Octeth and Google Postmaster Tools:

1. Go to **Admin** > **Google Postmaster**.
2. Click **Disconnect**.

This deletes the stored tokens from Octeth. Your historical data already collected remains visible, but no new data is pulled until you connect again.

## Troubleshooting

### "redirect_uri_mismatch" error on the Google screen

This is the most common setup problem. It means the redirect URL in Google does not exactly match the one in `.oempro_env`.

1. Compare both values character by character.
2. Confirm both use the same protocol (`https`), the same domain, and the `/app/google-postmaster-oauth/callback` path.
3. Make sure there is no extra trailing slash on either one.
4. If you edited `.oempro_env`, restart Octeth again so the change loads.

### "Google Postmaster API credentials not configured"

Octeth could not find one or more of the three required values.

1. Run `grep GOOGLE_POSTMASTER /opt/octeth/.oempro_env` and confirm none of the three values are empty.
2. Restart Octeth so it reloads the file.
3. Try **Connect** again.

### The connection succeeded but no data appears

1. Confirm at least **one full day** has passed since you connected — collection runs in the early morning, not immediately.
2. Verify your sending domain is added and **verified** in [Google Postmaster Tools](https://postmaster.google.com/) directly. Octeth can only show data that Google itself has gathered.
3. Confirm your domain is actually sending mail to Gmail recipients. Postmaster Tools only reports on domains with meaningful Gmail traffic.

### "Invalid OAuth state" or "session expired" error

For security, the connection request must be completed within about 10 minutes.

1. Return to **Admin** > **Google Postmaster**.
2. Click **Connect** again and finish the Google sign-in promptly.

::: warning Make sure you finish the consent screen
If you close the Google tab, click back, or take too long, the request expires. Always start fresh from the **Connect** button rather than reusing an old browser tab.
:::

## Related articles

- [Octeth Configuration](octeth-configuration) — full reference for `.oempro_env` and other configuration files
- [Sender Domain DNS Settings](sender-domain-dns-settings) — set up SPF, DKIM, and DMARC for better deliverability
