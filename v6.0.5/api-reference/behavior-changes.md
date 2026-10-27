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

### Email Gateway SMTP credentials

#### New SMTP usernames and passwords are generated from a secure random source

`emailgateway.addsmtp` and `emailgateway.resetsmtppassword` now generate the SMTP username and password from a cryptographically secure random source (octeth/oempro#3772). Before this change both values were an MD5 hash of the account and domain IDs and the creation time, so someone who knew the IDs and roughly when a credential was created could narrow it down to a searchable set of candidates. Gateway API keys received the same fix in an earlier release.

The format is unchanged: both values are still 32 uppercase hexadecimal characters, and the SMTP relay accepts them exactly as before.

**Not affected:** every existing SMTP credential keeps working unchanged. Nothing is rotated at upgrade.

**Who needs to act:** nobody has to. We recommend resetting the password of SMTP credentials created before this release (`emailgateway.resetsmtppassword`, or Reset password on the SMTP credentials screen) and updating the client that uses them, starting with credentials on accounts whose IDs are visible to other people. A reset keeps the username. A credential whose username you also want replaced is deleted and created again.

### Email Gateway credentials of team members

#### Team members see only the gateway credentials they created, and those stop sending when the member loses access

A team member whose role holds `ApiKeys.Manage` (Admin) now sees the value of an email gateway sender API key in `emailgateway.getapis`, and of an SMTP password in `emailgateway.getsmtps`, only for the credentials that member created, replaced or reset (octeth/oempro#3768). Every other value comes back masked as `********` followed by its last four characters, like `user.apikey.list`. Sender API keys and SMTP credentials now record the team member who created them, and the gateway refuses them while that member is suspended or removed: `emailgateway.sendemail` and the public gateway commands answer HTTP 401 `Invalid SenderAPIKey`, and the SMTP relay answers `535 5.7.8 Authentication credentials invalid`. Removing a member lists these credentials so you can revoke or keep them.

**Not affected:** the account owner's responses, and those of API keys the owner created, are byte-identical. Every credential that exists at upgrade was created by the owner, an administrator or an integration, keeps working, and costs no extra check per send.

**Who needs to act:** nobody has to. If a team member was removed before this release, rotate the account's sender API keys (`emailgateway.replaceapi`) and reset its SMTP passwords, because a member could read them in full until now.

## AI agent keys get SMS commands and a separate SMS budget

**What changed:** AI agent keys can call the SMS campaign, template, suppression and single-send commands, and SMS sends count against separate SMS limits (`AgentMaxSmsPerDay`, `AgentMaxSmsRecipientsPerSend`, `AgentSmsConfirmAbove`) on the key and the user group, never against the email limits. `user.apikey.*`, `user.agentpolicy.get` and `usergroup.*` accept or return the three new fields.

**Not affected:** API keys created without `IsAgentKey`. Every change to existing responses only adds fields, and the new request parameters are optional.

**Who needs to act:** an existing agent key with the `send` permission can send SMS after the upgrade, and the new SMS limits default to `0` (no limit). To cap SMS spend by AI assistants, set the SMS limits on the user groups (or on each connection) right after upgrading.

## Upgrade checklist

- [ ] If `ADMIN_API_ENFORCE_PRIVILEGES` is off, check that every sub-admin key or session calling a `global.customfield*` command holds `CustomFields`, or it now receives `99999`.
- [ ] Check that every SMTP client sending through the Email Gateway on port 587 or 2525 uses `STARTTLS`, or it now receives `530 5.7.0` on installations with a certificate.
- [ ] Optional: reset the password of Email Gateway SMTP credentials created before v6.0.5 and update the clients that use them, since older passwords were derived from IDs and a timestamp.
- [ ] If a team member with the Admin role was removed before v6.0.5, rotate the account's email gateway sender API keys and reset its SMTP passwords.
- [ ] If AI assistants may not text without a cap, set the SMS limits (`AgentMaxSmsPerDay`, `AgentMaxSmsRecipientsPerSend`, `AgentSmsConfirmAbove`) on each user group.

---

Previous releases: [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
