---
layout: doc
title: Abuse Protection
description: How Peak Monitor, SpamAssassin Content Validator and PhishGuard detect abusive accounts and suspend them natively
---
# Abuse Protection

Octeth ships three plug-ins that watch what accounts send through the email gateway and act when an account looks abusive. On a new installation all three are enabled with the settings below. An upgraded installation keeps its plug-ins and settings until an administrator applies the new defaults (see [Upgraded installations](#upgraded-installations)).

| Plug-in | What it watches | Default action |
|---|---|---|
| Peak Monitor | Send volume per account, bounce, opt-out and complaint rates, missing delivery events | Alert only |
| SpamAssassin Content Validator | The SpamAssassin score of sampled gateway emails | Suspend at a score of 5.0 |
| PhishGuard | Phishing phrases in delivered gateway emails | Suspend after 20 detections in 24 hours |

All three check emails after they are delivered. They limit the damage an abusive account can do, but they cannot stop its first emails.

## What a suspension does

A suspension sets the account's status to **Disabled**. A disabled account:

- cannot sign in,
- cannot send through the email gateway HTTP API or SMTP relay,
- has its already queued gateway emails held back by the delivery worker.

Octeth records which plug-in suspended the account, why and when, writes a line to the application log and emails the **Alert Recipient Email Address** of the system settings. Slack notifications are optional.

A suspension never runs for a user on the plug-in's own whitelist, and an account that is already disabled is left alone.

To lift a suspension, enable the account again in the staff area. Enabling it clears the recorded reason. If it was a false positive, add the user ID to that plug-in's whitelist so it does not happen again.

The WooCommerce plug-in is no longer needed. When it is enabled and configured, the plug-ins also call its suspend endpoint, and PhishGuard moves the account to the WooCommerce "suspended" plan group, after the account is suspended.

## Peak Monitor

Admin area: **Peak Monitor** in the top drop-down menu.

**Absolute send volume.** Alerts when an account sends more emails than a fixed limit, whether or not it has any sending history:

| Account | Last hour | Last 24 hours |
|---|---|---|
| New (younger than 7 days, from its sign-up date) | 500 | 2,000 |
| Other | 20,000 | 200,000 |

Every number is a setting, and a limit of 0 turns that limit off. The check has its own **Enable user suspension for this check** box, off by default. Suspension also needs the **When an alert is triggered, suspend the user account** option.

**No delivery events.** Alerts when an account sent at least 500 emails between 24 hours and 1 hour ago and not one of them has a delivery, bounce, complaint, open or click event. Bounce and complaint checks cannot see an account whose events do not arrive, so when this fires, check the delivery event webhooks of your MTA or relay. Alert only.

**Change rates.** The hourly, daily, weekly and monthly change rate checks compare a period with the one before it. An account with no previous period is judged by the absolute limits instead. These checks are off by default.

**Notifications.** Alerts are emailed to the alert recipient email address (**Email every new alert**) and, when a Slack webhook URL is set, posted on Slack. An alert that stays active is sent again only after **Repeat Alerts After** seconds (default 3,600).

**Scan Frequency.** The scanner runs every 300 seconds by default.

## SpamAssassin Content Validator

Admin area: **SpamAssassin** in the top drop-down menu.

It checks the first 10 emails of each account and sender domain, then one email per account every 1,800 seconds. An email scoring at or above the **Score Threshold** (default 5.0, the SpamAssassin spam score), or hitting one of the **Red Alert Rules**, raises an alert and, with **When an alert is triggered, suspend the user account** on (the default), suspends the account. An email whose recipients are all the account's own addresses or sender domain only raises a warning.

The AWS settings, which store a copy of the flagged email for the Slack alert link, and both Slack webhooks are optional.

## PhishGuard

Admin area: **PhishGuard** in the top drop-down menu.

It counts delivered emails that contain one of the **Keywords** (one per line, case-insensitive). When an account reaches the **Threshold** (default 20 detections in 24 hours) and **Suspend the user** is on (the default), the account is suspended. New installations start with a list of phrases phishing emails use and legitimate transactional email rarely does, such as "verify your account information" or "unusual sign-in activity". Review it for your senders.

## Upgraded installations

An upgrade never changes a plug-in's saved settings or which plug-ins are enabled. The Overview of the [staff dashboard](../../new-user-interface/staff-dashboard.md) shows an **Abuse Protection** notice until an administrator with the Settings privilege and no user group limit chooses one of:

- **Apply the defaults**: enables the three plug-ins that are off and installed, and saves their recommended settings. Saved whitelists, Slack webhooks, thresholds and keywords are kept. Peak Monitor's suspension switches are not changed. SpamAssassin Content Validator and PhishGuard suspension are turned on.
- **Dismiss**: hides the notice and changes nothing.

After **Apply the defaults** enables a plug-in, restart the background workers (`./cli/octeth.sh backend:restart`). The email gateway delivery workers load the enabled plug-ins when they start, so PhishGuard and SpamAssassin Content Validator do not check new emails until the restart.

An installation upgraded from a release package older than this one may not have the plug-in files, or may have older copies, because an upgrade does not copy the `plugins/` directory. The notice lists missing plug-ins as not installed. Apply leaves an older copy unchanged (not enabled, settings untouched), names it in its message, and keeps the notice on screen. Copy the three plug-in directories from the release package, then apply again.
