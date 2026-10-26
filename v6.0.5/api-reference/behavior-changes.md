---
layout: doc
title: API Behavior Changes in v6.0.5
description: Deliberate API behavior changes in Octeth v6.0.5 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.5

This page lists every deliberate change in v6.0.5 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.5.
:::

## Tier 1: changes that can break an integration

### Global custom fields (privilege check)

#### `CustomFields` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`global.customfields.get`, `global.customfield.get`, `global.customfield.create`, `global.customfield.update` and `global.customfields.delete` relied on the registry's `CustomFields` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session or API key could list, create, change and delete the system-global custom fields, and a delete removes every account's stored values. Each handler now checks `CustomFields` itself, before it reads or writes anything, and answers `99999` (`Not enough privileges`) without it, as `admin.customfield.references.get` and the other staff commands do (octeth/oempro#3570). The classic Global custom fields screen always required `CustomFields`, so the API now matches what the screen allowed.

The staff Global segments screen is unaffected: it reads the custom fields a rule may name from `global.segment.options.get`, not from `global.customfields.get`. A rule builder that lists them for a sub-admin holding `Settings.Segments` but not `CustomFields` should do the same.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`, or holding `CustomFields`. An install with `ADMIN_API_ENFORCE_PRIVILEGES` on already received this answer and sees no change.

**Who needs to act:** an integration that calls one of these commands with the key or session of a sub-admin who does not hold `CustomFields`, on an install with `ADMIN_API_ENFORCE_PRIVILEGES` off. Grant that account `CustomFields`, or use a key that has it.

### Admin area

#### The legacy admin Rebranding page is removed

The legacy admin **Rebranding** page (`/app/admin/rebranding/`), an item of the classic **Settings** sidebar, is removed. Its settings (the product name, the header and footer URLs of the forward to a friend, report abuse and sign-up pages, and the subscriber area logout URL) are in the **Subscriber pages** section of the [Branding](/v6.0.5/new-user-interface/staff-branding#subscriber-pages) screen of the staff **Settings** group (`/<UI_STAFF_PREFIX>/staff/settings/branding?section=subscriber-pages`) (octeth/oempro#3583). That screen is open to administrators with full access only. The old page also admitted a sub-admin holding `Settings`, who can still change the same keys with `settings.update`. The classic sidebar item now opens the new section, and only for administrators with full access.

**The old URL keeps working.** A GET to `/app/admin/rebranding/` answers with a 302 to the new section. A POST, including the old save form, is refused: nothing is written, and the answer is a short page that links to the new section. `settings.get` and `settings.update` are unchanged.

### Email Gateway SMTP relay

#### Login on port 587 requires `STARTTLS` first

On an installation whose inbound SMTP server has a TLS certificate, a client that sends `AUTH` on port 587 (or 2525) without first issuing `STARTTLS` is now answered with `530 5.7.0 Must issue a STARTTLS command first`, and the EHLO reply on those ports no longer lists `AUTH` until the connection is encrypted (octeth/oempro#3601). `MAIL`, `RCPT` and `DATA` get the same answer before `STARTTLS`. Before this change the server read the username and password over the unencrypted connection.

**Not affected:** port 25, installations with no certificate set in `config.json` (they print a startup warning instead), and every client that already uses `STARTTLS`, which is the default in common mail libraries and clients.

**Who needs to act:** an SMTP client configured for port 587 with encryption turned off. Turn on STARTTLS (often labelled "TLS" or "STARTTLS" in the client's settings). To keep the old behaviour, set `"TLSRequiredPorts": []` in `_dockerfiles/inbound-smtp-server/config.json` and restart `oempro_emailgateway_inbound_smtp`, which is not recommended. See [requiring STARTTLS on submission ports](/v6.0.5/getting-started/octeth-configuration#inbound-smtp-server-requiring-starttls-on-submission-ports).

## Tier 2: shape and value changes

None recorded yet.

## Upgrade checklist

- [ ] If `ADMIN_API_ENFORCE_PRIVILEGES` is off, check that every sub-admin key or session calling a `global.customfield*` command holds `CustomFields`, or it now receives `99999`.
- [ ] Check that every SMTP client sending through the Email Gateway on port 587 or 2525 uses `STARTTLS`, or it now receives `530 5.7.0` on installations with a certificate.

---

Previous releases: [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
