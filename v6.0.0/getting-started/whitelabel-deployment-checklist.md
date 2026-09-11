---
layout: doc
title: Whitelabel Deployment Checklist
description: What recipients see that interface rebranding does not change, and how to configure each of it
---

# Whitelabel Deployment Checklist

Rebranding the interface changes what your users see when they log in. It does not change what their recipients see.

A recipient never opens your control panel. They receive a message, read its headers if they are curious or if they are a mail administrator, and click a tracked link that lands in their browser address bar. Each of those carries a piece of your deployment identity, and each is configured separately from the theme and the logo.

Work through this page after you finish the [Rebranding](/v6.0.0/getting-started/octeth-configuration#rebranding) settings. Every item below names what the recipient sees, where the value comes from, and what happens if you leave it alone.

## 1. X-Mailer

**What the recipient sees:** an `X-Mailer` header on every outgoing message, visible to anyone who views the message source and to every receiving mail server.

**Where it comes from:** the user group field `XMailer` if it is filled in, otherwise the global setting under **Settings, Email Delivery, X-Mailer Header**. A fresh install sets the global to the neutral value `Email Sending System` and every user group to empty.

**What to do:** decide what you want recipients to see and set the global value. It applies to every user on the installation unless a user group overrides it, so on a deployment where your tenants send under their own domains, every tenant carries whatever you type here. There is no per-user or per-sender-domain setting.

If you want no platform fingerprint at all, clear both the global setting and the user group field. When both are empty the send engine omits the header entirely rather than sending an empty one.

::: warning The trap
If you provision user groups programmatically, check what you set `XMailer` to. A provisioning flow that creates every group with an empty `XMailer` sends every tenant through the single global value, which is usually not what a reseller wants.
:::

## 2. X-Complaints-To

**What the recipient sees:** an `X-Complaints-To` header on every outgoing message. Mailbox providers and abuse desks read it to find out where to send complaints about your mail.

**Where it comes from:** the global setting under **Settings, Email Delivery, Complaints**. A fresh install seeds it with the administrator email address you entered during setup.

**What to do:** point it at a mailbox that is actually monitored. This is a real operational address, not a label. If a receiver cannot reach you through it, complaints go nowhere and your deployment reputation is the thing that suffers.

**The per-domain option:** the field accepts the placeholder `%sender_domain%`, which is replaced at send time with the domain of the message envelope sender. `complaints@%sender_domain%` therefore produces a different address per sending domain. The admin form knows about the placeholder and relaxes its email-address validation when the value ends in `@%sender_domain%`.

**Why the default is not the placeholder:** complaint handling is a platform responsibility. You run the feedback loops and hold the relationships with the mailbox providers. Pointing complaints at tenant domains usually points them at a domain with no mailbox behind it, which is worse than pointing them at a real address of yours. Use the placeholder only if every sending domain on your deployment genuinely has a monitored complaints mailbox.

One coupling to know about: the placeholder is substituted from the envelope sender, so anything that changes which domain the envelope sender resolves to also moves `X-Complaints-To` with it. That is deliberate, and in v5.9.6 it includes [campaign sender-domain auto branding](/v6.0.0/api-reference/behavior-changes).

## 3. X-Report-Abuse

**What the recipient sees:** an `X-Report-Abuse` header carrying a URL on your deployment, on campaign messages. The gateway, journey and transactional path does not emit this header.

**Where it comes from:** it is built from your application URL, with the host replaced by the campaign tracking domain when one is configured.

**What to do:** configure a tracking domain. When no tracking domain is set, the header falls back to the raw application URL, which exposes your control panel hostname to every recipient. That is the single most common way a deployment leaks its real hostname after a full interface rebrand.

## 4. utm_source and utm_medium on tracked links

**What the recipient sees:** the values in the query string of every tracked link, in their browser address bar after they click, and in any referrer or link preview. Unlike the headers above, this one needs no message-source inspection to be visible.

**Where it comes from:** **Settings, Integration, Google Analytics**, the Source Keyword and Medium Keyword fields. They apply only to campaigns that have Google Analytics tracking enabled.

**What to do:** set them before your first campaign. These values also land in the Google Analytics property of whoever owns the campaign, where they appear as a traffic source name. Every acquisition report, channel grouping and attribution model your customer builds inherits that string.

Fresh installs ship `newsletter` and `Email`, which are the conventional values. If you are upgrading rather than installing fresh, check what your Source Keyword currently says. Installs created before this default changed still carry the old value, and it is left alone deliberately: changing it splits the historical reporting in the customer's analytics property at the date you change it. Change it knowingly or not at all.

## 5. Envelope sender, Message-ID, List-Unsubscribe and the tracking domain

**What the recipient sees:** the envelope sender (the `Return-Path` their mail server records), the `Message-ID` domain, the unsubscribe URL in `List-Unsubscribe`, and the hostname behind every tracked link and open pixel.

**Where it comes from:** the sender domain configuration and the tracking domain, per user. See [Sender Domain DNS Settings](/v6.0.0/getting-started/sender-domain-dns-settings).

**What to do:** configure and verify a sender domain and a tracking domain for every account that sends. Without them these values fall back to deployment-level defaults and your hostname reaches recipients on the most visible parts of the message.

## Quick checklist

- [ ] `X-Mailer` global value set, or deliberately cleared to omit the header
- [ ] User group `XMailer` values reviewed, including whatever your provisioning flow sets
- [ ] `X-Complaints-To` points at a monitored mailbox
- [ ] Tracking domain configured, so `X-Report-Abuse` does not fall back to your application URL
- [ ] Source Keyword and Medium Keyword set before the first campaign with analytics tracking
- [ ] Sender domain verified for every sending account
- [ ] A test message sent to an external address and its full source read end to end

The last item is the only one that catches what the others miss. Send yourself a real campaign, open the raw message, and read every header. Anything in there that names something other than your brand is a leak you can still fix.
