---
layout: doc
title: Octeth Changelog
description: Complete release history for all Octeth versions - features, improvements, and bug fixes
---

# Octeth Changelog

This document tracks the complete release history of Octeth, including new features, enhancements, bug fixes, security patches, and deprecations for each version. Use this changelog to understand what changed between releases and determine when to upgrade your installation.

## v6.0.0

### Release Summary

v6.0.0 is a security release. It remediates the findings of a full audit of the API surface, and most of its changes are refusals of requests that were previously accepted. It also delivers bulk SMS campaigns to phone-only contacts through the API. Read the Upgrade Notes below and the [behavior changes page](/v6.0.0/api-reference/behavior-changes) before upgrading: an integration can break even though no successful call changes shape.

### New Features

- **Bulk SMS campaigns** - Send SMS campaigns to lists and segments through the API, including to contacts that have a phone number but no email address. Includes SMS templates, per-list SMS settings, cost estimates before sending, delivery reports, inbound replies with automatic opt-out handling, frequency caps and forbidden-word checks. Accounts need the new SMS campaign permissions on their user group before they can use it.
- **SMS reporting and segmentation** - Campaign-level SMS reports and a full per-contact SMS event history, plus a new segment rule that targets contacts by their SMS activity.
- **SMS administration** - New admin screens for SMS campaigns, inbound messages and bulk SMS settings.

### Enhancements

- **API rate limits enforced** - The per-command request budgets that each API command already declared are now applied to every call made through the API. A call over its budget receives HTTP 429 with a `Retry-After` header. See the Upgrade Notes.
- **New user interface honours the signup setting** - Self-signup in the new user interface follows the admin user-signup setting.
- **Email relay mode for the new user interface** - Setting `UI_MODE=gateway` turns the new user interface into an email relay product. Campaign, journey, SMS and list screens are hidden, and a gateway menu organized by sender domain covers API keys, SMTP, webhooks and statistics.
- **Phone-only contacts in the new user interface** - A contact without an email address is shown by its phone number.
- **Demo mode** - Thirteen more screens and the subscriber profile have demo data for product walkthroughs.
- **Retired file cleanup** - A new `upgrade:remove-retired-files` command removes files that a release has retired from an upgraded installation.

### Bug Fixes

- **Visitor IP addresses** - Octeth now records the visitor's real IP address instead of the address of its own front-end container. See the Upgrade Notes.
- **Upgrades with campaigns in flight** - The upgrade's check for campaigns that are currently sending works again, and a stalled sending batch can no longer block the recovery process permanently.
- **Segment safety** - A segment rule of an unknown type now matches nothing instead of matching the whole list.
- **SMS suppression** - SMS sending stops rather than proceeding when the suppression list cannot be read.
- **SMS message length** - Messages that use non-Latin characters are counted correctly, so the segment count and cost estimate match what the carrier bills.
- **New user interface configuration** - A brand setting that contains spaces or special characters no longer stops the new user interface from starting.
- **User panel search** - The global search in the user panel returns results again. It had failed on every search since v5.9.1.
- **Admin subscriber search** - The admin subscriber search screen follows the same layout and behaviour as the rest of the admin area.
- **New user interface signup** - Signing up with a username or email address that already exists shows the reason instead of a "Temporarily unavailable" page.
- **Journey API error codes** - `journey.actions.update` reports an invalid webhook URL with its own error code, 18, so it can no longer be confused with a Decision node error.

### Security Patches

- Removed an `eval()` in the template engine that was reachable from the public internet with no credential.
- Restricted outbound HTTP to the `http` and `https` schemes, and added a destination check that refuses loopback, private, link-local and carrier-grade NAT addresses, on the subscriber import URL, the import status callback, both email gateway webhook endpoints and the journey webhook action.
- Required a shared-secret header on the `internal.*` API command namespace, which was previously reachable with no credential and could write suppression entries affecting every account on the install.
- Required a credential on `Subscriber.Unsubscribe`, which previously took the acting account from the request rather than from a credential, and scoped its install-wide suppression writes to admin callers.
- Validated ids that reach SQL on `customfields.get`, `customfields.copy` and `media.folderdelete`, and validated user segment rules when they are saved.
- Removed password hashes, auth tokens, two-factor secrets, API keys and the user group's shared relay credentials from the responses of `user.get`, `users.get`, `user.switch`, `user.login`, `user.current` and `admin.login`.
- Enforced object ownership on journey action references and on the `list.update` behaviour columns, at both ends: refused at ingress and owner-scoped on every read of a stored id.
- Removed the built-in PayPal Express Checkout gateway, whose callback endpoint authenticated nothing and would grant credits on an unverified request.
- Validated the local MTA path before it is saved and before it is used to send, on both mail engines.
- Scoped nine admin API commands to a restricted sub-admin's allowed user groups.
- Replaced the credential random number generator, closed session fixation, narrowed the two-factor window, made two-factor codes single use, and gave user password-reset tokens a one-hour expiry.
- Enforced the admin Authorized IP Addresses list on every admin request rather than only when the login page renders, and hardened the admin "remember me" cookie.
- Denied web access to the `data/` subdirectories, which included application logs.
- Restricted and redacted the new user interface's API debug console, rooted its generated URLs at `APP_URL`, and stopped it holding a plaintext password while a two-factor challenge is pending.
- Fixed client address resolution, which on a standard install recorded the address of Octeth's own front-end container instead of the visitor, for every request, on every install. The admin Authorized IP Addresses list, per-IP rate limits, geographic reporting and the subscription, opt-in and unsubscription IP columns were all affected.
- Authenticated the public bounce webhook on fresh installations. The endpoint could previously be posted to by anyone, and it reaches the suppression list that blocks delivery for every account on the installation. Existing installations keep the setting they already have.
- Validated the source of the forward-to-friend header and footer templates, which could be pointed at a file on the server.
- Enforced account ownership on `dns.set`, `subscribers.get`, autoresponder lists, the StartJourney journey action and `event.track`, and limited the admin-only fields of `user.update` to admin credentials.
- Allow-listed the comparison operator in the shared criteria builder used by list and subscriber queries.
- Escaped account-supplied text in the admin area templates and added a report-only Content Security Policy.
- Validated JSONP callback names and tightened the Referer check on public endpoints.
- Kept the master admin API key out of application logs, URLs and the user interface.
- Signed the conversion identifier used by the server-to-server postback endpoint, which carried no key at all, so a conversion and a monetary amount of any size could be recorded against any account's campaigns by anyone on the internet. Repeated postbacks no longer accumulate revenue, the amount is bounded and checked, the endpoint is rate limited, and the address that submitted each conversion is now recorded.

### Upgrade Notes

- **The admin IP allow-list no longer blocks the new user interface.** If you added `192.168.99.110` to Settings, Security, Authorized IP Addresses to keep the interface working on v5.9.6, you can remove it. Leaving it in place is harmless. `ADMIN_API_ENFORCE_ALLOWED_IP` now exempts admin-key calls arriving from the interface's own container while `UI_ENABLED` is true, and nothing else changes: a call from any other address, including one presenting `X-Forwarded-For: 192.168.99.110`, is measured against the list exactly as before, and so is a call from any other container on the Docker network. The match is on the address the connection was received from rather than on the resolved client address, so no request header can influence it. Exemptions are recorded at DEBUG as `Admin API call exempted from ADMIN_ALLOWED_IP`. Note that `UI_ENABLED` must be the literal lowercase `true`: `1`, `yes` and `on` are read as off here, as they already were by the container and the proxy (issue #2913)

- **If you nested quotes to work around a broken brand value, undo it.** The interface used to write most settings into its own environment file unquoted, so a value containing a space, such as a mail footer, made that file unreadable and the interface would not start. The workaround was to nest quotes in `.oempro_env`, writing `UI_BRAND_MAIL_FOOTER='"Sent from app.acmemail.com."'`. From v6.0.0 every value is quoted correctly on the way out, so a nested pair is no longer stripped and the inner double quotes appear in the text your customers see. Go back to a single pair. Nothing else needs changing: a value already written with one pair, and a value with no spaces, both behave exactly as before. Separately, any `UI_BRAND_*` value containing a `"`, a `\`, a `$` or a `${...}`, and a MySQL password containing a backslash, now reach the interface intact rather than breaking it or being silently altered, so if a brand value looks wrong after upgrading it is because it was being mangled before and is now used as written (issue #2904)

- **The new user interface now honours your admin user-signup setting, and this closes signup on installs that had already switched it off.** Self-signup in the new interface is now governed by the same setting the legacy signup page has always used, under Settings, ESP settings. When it is off, the interface hides the signup link on every signed-out page and `/user/register` redirects to sign-in. Installs that had switched signup off have been publishing a working signup form at `<APP_URL>/user/register` since the interface arrived, because it did not read the setting; that form is now closed, which is what the setting was set to mean. Installs on the installer default, where signup is on, see no change. **Where new accounts land also changes when the interface's own subscription billing is off** (`BRAND_FEATURE_BILLING=false`, the shipped default): they now land in the user group named on that same admin screen rather than always in the interface's own default group, so check that group is the one you want before your next signup. With billing on, nothing changes and `USER_SIGNUP_GROUPID` is not consulted. In either mode, when no usable group can be determined the account falls back to `OCTETH_DEFAULT_USER_GROUP_ID`. Verification links already in people's inboxes keep working with signup off. No new configuration key, and if the setting cannot be read, signup is treated as off (issue #2906)

- **`internal.*` API commands now require the `X-Octeth-Signature` header.** No action is needed for a standard install: every caller shipped with Octeth sends it. If you built an integration that posts `Internal.Bounce.Register` or `Internal.S2SPostback.Register` directly to `api.php`, add the header before upgrading, or those calls will answer HTTP 401 and the bounces or conversions they carry will not be recorded. The value is shown on the admin Bounce Processing screen.

- **`Subscriber.Unsubscribe` now requires a credential.** Customer opt-outs are unaffected: the unsubscribe links in your sent email, the RFC 8058 one-click endpoint Gmail and Yahoo use, and the embeddable unsubscribe form all go through `u.php` or `unsubscribe.php`, none of which changed. The only calls that stop working are API calls that passed no credential. Add a user `APIKey`. Two further narrowings apply to authenticated callers: a user may no longer pass another account's `ListID`, and `AddToGlobalSuppression=true` writes the install-wide suppression entry only for an admin credential, while still writing the account-scoped one for everybody.

- **Password-reset links issued before the upgrade stop working.** The user reset token now carries a one-hour expiry and a signature, so its format changes. There is nothing to migrate; the user requests a new link. Expect a small number of reports in the first hour after upgrading.

- **`USER_UPDATE_REQUIRE_CURRENT_PASSWORD` is the one setting whose shipped example value differs from the code default.** The code default is `false` so an upgrade keeps working, but an upgrade that does not already have the key picks up the example's `true` when environment files are merged. An integration that changes a user's own password through `user.update` without sending `CurrentPassword` will then receive `ErrorCode 9`. Either send the parameter or set the key to `false`.

- **Authorized IP Addresses is now enforced on every admin request.** If you have filled in Settings, Security, Authorized IP Addresses, check it before upgrading. From v6.0.0 the list is checked on every admin screen and before the "remember me" cookie signs anybody in, not only when the login page renders, so an admin whose address is not on the list loses access on their next request even if they are signed in right now.

  Two things to check first. **One:** read the client address note below before you do anything else, because until this release the list was being compared against a container address rather than against your visitors, which changes what you should expect to find in it. If you also run your own load balancer, reverse proxy or CDN in front of Octeth, make sure `TRUSTED_PROXIES` in `.oempro_env` lists it. **Two:** if you restrict the admin area at your proxy on the `/app/admin/` path prefix, note that this does not cover the admin area, because the front controller also answers at `/app/index.php?/admin/` and four more shapes. The in-app list is the authoritative control.

  If you do lock yourself out: loopback is exempt, so an admin session opened on the server itself still works, and otherwise clear the setting with `UPDATE oempro_config SET ADMIN_ALLOWED_IP = '' WHERE ConfigID = 1;` followed by `docker exec oempro_redis redis-cli DEL system_config_1`. The refusal is logged at ERROR level with the address that was refused.

- **Octeth now records your visitors' real IP addresses, and on most installs it never did before.** This is worth reading even if you have changed nothing, because it is the one item in this release that can change behaviour you were relying on.

  Octeth's bundled front end reaches the application over the internal container network rather than over loopback, which is not what the configuration notes claimed. The effect was that the visitor's address, which the front end was passing along correctly the whole time, was discarded, and Octeth recorded the container's own address instead. Every install did this, for every request, and it has been the case since the address handling was last changed. From v6.0.0 the bundled front end is trusted by default and the real address is recorded. Nothing to configure.

  **Check Settings, Security, Authorized IP Addresses before upgrading.** If it is empty, nothing changes for you, and that covers most installs. If you filled it in, look at what is actually in it:

  - A list containing an address starting `192.168.99.` was matching the container, not a person, which means it was admitting everyone who could reach your install. After the upgrade it matches nobody and you are locked out. Replace it with your real public address before upgrading.
  - A list containing your real public address was matching nobody, so you were locked out and may have worked around it. It starts working as intended.

  If you do get locked out, loopback is still exempt, so an admin session opened on the server itself works. Otherwise clear the setting with `UPDATE oempro_config SET ADMIN_ALLOWED_IP = '' WHERE ConfigID = 1;` followed by `docker exec oempro_redis redis-cli DEL system_config_1`.

  **Two further consequences.** Per-IP rate limits were treating all of your traffic as a single visitor and now count each visitor separately, so a limit that never triggered may begin to. Geographic reporting on opens and clicks was attributing everything to one location and will now spread out, so historical and future geography are not comparable.

  **And one thing that cannot be repaired.** The `SubscriptionIP`, `OptInIP` and `UnsubscriptionIP` columns exist to evidence that a named person subscribed from a named address, and every value recorded before this upgrade holds a container address. The visitor's real address was never written anywhere, so there is nothing to recover it from and no migration can fix it. Records created from this upgrade onward carry the real address. If you are asked to produce consent evidence for a subscriber acquired before then, the IP column will not provide it.

  If you changed the bundled network's subnet in `docker-compose.yml`, set `INTERNAL_PROXY_NETWORKS` in `.oempro_env` to match, otherwise this fix does not apply to your install and the behaviour above stays as it was.

- **Fresh installations now authenticate the bounce webhook. Your upgrade does not.** `BOUNCE_WEBHOOK_AUTH_ENABLED` ships `true` in the example environment file from v6.0.0, so a new installation requires the `X-Octeth-Signature` header on `/system/bounce_webhook` from day one. **No upgrade turns it on for you, whatever version you are coming from.** If your `.oempro_env` already has the setting, which is every installation from v5.9.3 onward, the upgrade leaves your value alone, because it only adds settings you do not already have. If it does not have the setting, which is anything older than v5.9.3, the upgrade adds it as `false` rather than copying the `true` above. Either way your bounce processing is unaffected and there is nothing to do.

  That second case is handled specially for this setting and not for the others that changed in this release. Enabling bounce authentication where a sender is already configured makes every bounce POST answer 401, and that failure appears only at the sender, so bounce processing would stop with Octeth reporting nothing. Every other setting of this kind fails somewhere a person can see it.

  Turning it on is worth doing, because the endpoint is reachable from the internet and reaches the suppression list that blocks delivery for every account on your installation, so anyone who finds it can forge hard bounces for addresses you are trying to mail. Do it in this order: configure your sender (PMTA, Logstash or fluentd) with the header first, copying the configuration from the admin Bounce Processing screen, which already includes it, then set the value to `true` and restart. Reversing that order means every bounce POST is refused in the interval, and that failure shows up only on the sender's side, so bounce processing stops without Octeth reporting anything.

- **Conversion postbacks are now signed, and existing conversion data cannot be assumed genuine.** This affects you only if you use server-to-server conversion tracking, which is off unless you have enabled it on a campaign.

  The `ocrid` identifier that the postback endpoint accepted carried no key, so the campaign, subscriber and list it named could be constructed from nothing. Anyone who found the endpoint could record conversions, with an amount of their choosing, against any account on your install. Identifiers are now signed and a signed identifier that has been altered is refused.

  **Nothing you need to do, and no conversion tracking breaks.** Identifiers are generated when a recipient clicks, not embedded in the email, so the signature covers every click from the moment you upgrade, including clicks on campaigns you sent months ago. Identifiers without a signature are still accepted with no cut-off date, because an advertiser may still be holding one captured from a click before the upgrade.

  Three further changes bound what an unsigned identifier can still do. An identical postback repeated no longer records a second conversion or increments the campaign's conversion count, though a genuinely different amount still records, since a subscriber buying twice is a real thing. An amount that is not a number, is negative, or is above `S2S_POSTBACK_MAX_VALUE` (one million by default) is refused rather than stored. And the endpoint is rate limited per identifier and per source address, 60 an hour by default; raise `S2S_POSTBACK_RATE_LIMIT` if you have a high-volume advertiser integration and see legitimate postbacks refused with HTTP 429.

  **What cannot be repaired.** Conversions recorded before this release carry no marker distinguishing a real one from a forged one, and none ever did. If your campaign revenue figures matter for commission or billing, treat the historical numbers as unverified rather than assuming they can be cleaned. From this release onward each conversion row records whether its identifier was signed and which address submitted it, so a forged run can at least be identified afterwards.

- **Admin "remember me" cookies issued before this release stop working**, so those admins sign in once more, and an admin with two-factor authentication enabled is no longer signed in by the cookie at all.

- **The built-in PayPal Express Checkout gateway has been removed.** Check Settings, ESP Settings, Payment Gateway before upgrading. If *PayPal Express Checkout* is ticked there, your customers will no longer be able to buy credits after the upgrade until you configure the *Third party payment gateway* option on the same screen, or install a plugin that provides a gateway. If it is not ticked, this change does not affect you. Remove any IPN or notification URL still pointing at `payment.php` or `payment_result.php` in your PayPal account. Your stored PayPal settings are left in the database untouched and no migration drops them. **On an upgraded installation those two files are still on disk and still answer until you remove them**, which is what the next note is about.

- **An upgrade does not remove files that a release retired, so run `upgrade:remove-retired-files` after upgrading to v6.0.0.** This one matters more than it sounds, because the removal it completes is a security fix.

  Upgrading syncs the new release over your installation without deleting anything, and that is deliberate: the same directory holds your data, your environment files, your custom templates and your plugins, none of which a release may remove. The cost is that a file an Octeth release deleted stays on your server and keeps being served. A fresh installation never has it; an upgraded one always does.

  For v6.0.0 that leaves the PayPal Express Checkout endpoint live. The three files the release removes are self-contained, so `payment.php` on an upgraded install still answers, still accepts an unverified callback, and can still grant credits. Removing the gateway from the product does not reach you until you remove the files:

  ```bash
  cd /path/to/octeth
  ./cli/octeth.sh upgrade:remove-retired-files            # preview, removes nothing
  ./cli/octeth.sh upgrade:remove-retired-files --apply    # remove them
  ```

  It previews by default and names every file before it touches anything, it keeps a copy of each file under `data/backups/upgrade_*/retired_removed/` before deleting it, and running it twice is a no-op. It only ever removes paths named in `cli/retired-files.txt`, which ships with the release, and it refuses `data/`, any `.oempro_*env`, custom templates, `plugins/` and `docker-compose.yml` even if something has listed them. The list is cumulative, so one run cleans up an installation upgraded from any earlier version.

  The upgrade now also reports, in normal output rather than only under `--debug`, how many paths in your installation the release does not ship. That warning has existed since the upgrade tool was written and had never once fired: it was built in a way that made it silent in every mode, which is why this gap went unnoticed for years. Read the list it points at as a prompt to look rather than a list to delete, because it also includes files you own, such as custom templates.

- **If you use "Local MTA" as a send method, check the stored path** at Settings, Email Delivery and on every user group that overrides the send method. The path must now be absolute, contain no whitespace or arguments, name a file that exists and is executable, and have a conventional mail submission binary name. A path stored before this release that does not qualify is refused rather than run, so mail queued through that method fails until it is corrected.

- **Check that `APP_URL` is the hostname your users actually reach the install on**, and that it is an absolute `scheme://host` URL. The new user interface now roots its links, redirects and asset URLs there instead of following the request, so a stale value renders the interface unstyled rather than merely mailing the wrong link. If the value has no scheme, the password-reset and registration flows refuse to send rather than mail a link a client can steer.

- **Everyone signed in to the new user interface is signed out once**, because its session payloads are now encrypted and an existing unencrypted session no longer decrypts. The legacy areas are unaffected. The interface's entrypoint is copied into its image, so this arrives with `docker compose build oempro_ui`, not with a recreate alone.

- **Any install that has run the new user interface should clear its session store once after upgrading.** Until this release, a customer who started a two-factor sign-in and did not finish it left their password in that store in clear text for as long as the session lived. Flushing the interface's Redis session database signs users out of the new interface only and touches nothing else. A purge does not rewrite copies already taken, so treat Redis snapshots and any backup made while the interface was running as containing credentials, and let them expire under your normal retention policy.

- **API rate limits are enforced from this release, with no action on your part.** Each API command has always declared a request budget, usually 100 requests a minute, but only six commands applied theirs. From v6.0.0 every call made through the API is counted against its command's budget per signed-in account, or per client address for commands that need no credential, and a call over the budget receives HTTP 429 with a `Retry-After` header. Calls made by Octeth's own screens are not counted. An integration that sends bursts to a single command should handle 429 by waiting for the `Retry-After` period. To restore the previous behaviour, set `API_ENFORCE_RATE_LIMITS=false` in `.oempro_env`.

### Deprecations

- The `PasswordEncrypted` parameter on `user.login` is removed. It was undocumented and had one caller inside the product. A request that still sends it is ignored rather than refused, so only an integration that sent a stored password hash in place of a password stops working.
- The `disable2fa` and `disable2fatoken` parameters on `user.login` and `admin.login` are stripped from any request arriving over HTTP. They were never documented and were only ever meant for Octeth's own in-process callers.

## v5.9.6

### Release Summary

Octeth v5.9.6 introduces a new user interface that runs alongside the one you have today, and completes the admin API so an administration console can be built entirely on top of Octeth rather than inside it.

The new interface is a separate application with its own screens for campaigns, journeys, lists, transactional sending and reporting. It is switched on by this upgrade and reachable at `/user/`. Your existing areas are untouched and stay exactly where they are. The two have separate logins for now, so this release is an addition rather than a replacement, and you can turn the new interface off with a single setting.

The admin API gained around sixty commands this cycle, covering the settings, reporting, suppression, sender domain, delivery server and sub-admin management screens that previously had no programmatic equivalent. It also gained an authorization model it never had: sub-admin privileges now apply to API calls, each sub-admin can hold their own API key, and your Authorized IP Addresses list is enforced on the API rather than only at the login page.

The rest of the release is correctness work in journeys, segments and sender domains, and a set of upgrade fixes found by installing the release package on clean servers before shipping it. Read the Upgrade Notes below before upgrading. Six settings arrive with values that change how your installation behaves, and one of them can interrupt an integration that calls the admin API from your own network.

### New Features

- **A new user interface.** A complete second interface for your customers, with its own screens for campaigns, journeys, subscriber lists, transactional sending, templates, suppressions and reporting. It runs in its own container, keeps its own database, and never touches your Octeth data. Reachable at `/user/`, with the existing areas unchanged at `/app/user/` and `/app/admin/`. See [The New User Interface](/v5.9.6/new-user-interface/)
- **Whitelabelling for the new interface.** Brand name, legal name, support address, terms and privacy links, logo, wordmark, favicon and a two colour palette, all set from your configuration file
- **Around sixty new admin API commands.** Settings read and write, sub-admin management, global segments and the rule vocabulary, global email and SMS suppression, bounce processing, sender domain moderation, SMS gateways, SSO sources, Google Postmaster Tools, plugin management, system and database checks, the admin dashboard and live sending view, delivery server performance and revenue reports, and campaign reporting completions. Together these cover the admin screens that previously had no programmatic equivalent
- **Per-sub-admin API keys.** Each sub-administrator can hold their own key rather than sharing the master one, so API activity is attributable and a key can be revoked individually
- **Per-day journey enrolment counts.** `journey.get` and `journey.list` can now return how many subscribers entered a journey on each day of a window, alongside the existing lifetime figure
- **A patient sync integration for Spry.** One way sync of patient records into per clinic subscriber lists, with per mapping control over which patient statuses sync and which fields are stored

### Enhancements

- **Campaigns brand with your customer's verified sender domain automatically.** When a campaign's From address matches a sender domain the account has verified, the campaign now carries that domain on its envelope sender, `Message-ID`, unsubscribe and abuse headers, and on its tracking links where the tracking record itself was verified. This previously required the user group's Sender Domain Management option, which meant the same account's gateway mail was branded while its campaigns were not
- **Auto responder messages use the same sender domain as campaigns**, so Google Postmaster Tools reports the two under one domain rather than splitting them
- **Journey email statistics agree between endpoints.** `journey.list` and `journey.get` previously disagreed about the period their engagement totals covered. Both are now all time, with a separate windowed figure available
- **A failed journey action no longer loses the subscriber.** When a journey action failed to send, the subscriber used to advance as though they had been mailed and permanently miss that email. The action is now retried with a widening delay and, if it keeps failing, the reason is recorded rather than discarded, giving you most of a working day to fix a misconfigured sender domain or an unavailable gateway without losing the send
- **Clearer failure reporting in the new interface.** A screen that cannot load a figure now says so, rather than showing an empty or placeholder value that reads as a real result
- **The release package is now tested before release.** Each version is built as a release candidate and installed on clean servers, as a fresh install and as an upgrade from the previous version, before the real release is cut

### Bug Fixes

- **Segment rules that negate now include subscribers with no value.** Rules using "is not", "does not contain", "not between" or "not in the last x days" previously excluded every subscriber whose field was never filled in, which is the opposite of how each reads in the rule builder. Please read the Upgrade Notes: your existing segments will grow
- **A journey Decision on a field that does not belong to the journey's list now fails visibly** instead of quietly routing every subscriber down the No branch
- **Journey Builder branches attach to the right Decision.** A journey with more than one Decision node could attach a branch to the wrong one when reopened
- **Journey suppression checks are scoped to the sending account and list**, so one account's suppression no longer affects another's send
- **The Email Gateway relay matches sender domains on a proper suffix test.** A substring test could accept a domain that merely contained the permitted one
- **Auto responder and campaign From headers are validated before sending**, so a malformed address cannot reach the envelope
- **User group creation enforces one default plan per subscription plan**, matching the rule already applied when editing
- **Campaign and API sort fields are validated against a known list**, so an unrecognised sort no longer produces a result set that silently disagrees with its own total
- **Installations with no plugins no longer log plugin cron errors**
- **Upgrade reliability.** Several faults in the upgrade process were found by installing the package on clean servers and are fixed here: the install directory could be left unreadable by the web server, so every page returned an error while the upgrade reported success; file permissions were not reapplied, so the built in health check failed afterwards; and the new interface's assets were omitted from the package. Two of these had been present since v5.9.4

### Security Patches

- **Your Authorized IP Addresses list now applies to the admin API.** It was previously checked only when the admin login page rendered, so an admin credential worked from any address. Please read the Upgrade Notes before upgrading
- **Sub-administrator privileges now apply to API calls**, so a restricted administrator is held to the same limits over the API that the screens have always enforced, including when reading or acting on individual customer accounts
- **Turning off two factor authentication now requires a deliberate, authenticated action** with the current password, for both administrator and customer accounts
- **Octeth's private internal services are no longer reachable from the internet** and require a signed request from Octeth itself
- **Credentials are no longer written to the log** during Google Postmaster Tools authorization
- **Delivery server test results record the outcome of a real verification** rather than a value supplied by the caller
- **Several administrative endpoints now confirm that the object being acted on belongs to the account making the request**

### Upgrade Notes

- **Two database migrations ship with this release.** Both run as part of the upgrade and both are fast schema changes with no data movement. One creates the daily journey enrolment cache table; the other adds the API key column that per-sub-administrator keys are stored in
- **Segment rules that negate now match subscribers with no value.** Rules using "is not", "does not contain", "not between" or "not in the last x days" previously excluded every subscriber whose field was never filled in, which is the opposite of how each one reads in the rule builder. They now include them. **Existing segments will grow and journey Decision branches will route differently**, so review any send limit, recurring campaign or journey Yes branch that depends on a segment's size before upgrading. Full detail and an upgrade checklist: [v5.9.6 API behavior changes](/v5.9.6/api-reference/behavior-changes)
- **Campaigns now brand with the account's verified sender domain by default.** A campaign whose From address domain matches one of the account's verified sender domains now carries that domain on its envelope sender, `Message-ID`, `List-Unsubscribe` and abuse headers, and on its tracking links where the tracking record itself verified. Previously this required the user group's Sender Domain Management option. Set `CAMPAIGN_SENDER_DOMAIN_AUTO_BRANDING=false` to keep the previous behavior, which is worth doing if you run a shared-IP warmup pool that depends on platform-branded campaign headers
- **Auto responder messages now use the sender domain root in their From header**, matching campaigns and gateway mail. The authenticated domain moves with it, so Google Postmaster Tools reports auto responder volume under the same domain as campaigns
- **Fifty new configuration settings, and six of them change how your installation behaves.** The upgrade adds every setting your `.oempro_env` does not already have, using the new version's default, and never changes a value you have already set. Most need no action: `JOURNEY_ACTION_FAILURE_MAX_ATTEMPTS`, `JOURNEY_ACTION_FAILURE_RETRY_BASE_SECONDS`, `JOURNEY_ACTION_FAILURE_RETRY_MAX_SECONDS`, `TEMPLATE_THUMBNAIL_MAX_FILESIZE`, `SYSTEM_HEALTH_CHECK_TOKEN` and thirty-nine settings for the new user interface all ship with working defaults. The six below do not, so read them before upgrading. See [Octeth Configuration](/v5.9.6/getting-started/octeth-configuration)
- **The admin API now enforces your "Authorized IP Addresses" list.** `ADMIN_API_ENFORCE_ALLOWED_IP` arrives set to `true`. The list under Settings, Security was previously checked only when the admin login page rendered, so `api.php` accepted an admin credential from any address. It is now enforced on every admin-authenticated API call, with **no exemption for loopback or private ranges**. If your allow-list is non-empty and any integration calls the admin API from an address outside it, including from inside your own Docker network or another of your servers, **those calls will start failing**. Add the addresses first, or set this to `false` before upgrading. An empty allow-list means no restriction, exactly as before
- **If you use the new user interface and your allow-list is not empty, the interface breaks on upgrade.** `UI_ENABLED` also arrives set to `true`. The new interface is a separate application that reaches `api.php` over HTTP from its own container, so its admin-key calls are measured against the list like any other caller. Staff sign-in, signup, the password reminder, the password reset, profile edits, the password change, the 2FA toggle and impersonation all fail, and because the interface reads the refusal as an expired session you see a sign-in loop rather than an error. Add `192.168.99.110`, the interface's container, to Settings, Security, Authorized IP Addresses, or set `ADMIN_API_ENFORCE_ALLOWED_IP=false`. The Octeth log names the cause: `Admin API call refused: address is outside ADMIN_ALLOWED_IP`. v6.0.0 removes the need for this workaround (issue #2913)
- **Sub-admin privileges now apply to the API.** `ADMIN_API_ENFORCE_PRIVILEGES` arrives set to `true`, so an admin who authenticates with their own credentials is held to the same privilege list the admin screens have always enforced. The master admin API key is unrestricted and is not affected, so master-key integrations see no change. Check any integration that authenticates as a sub-admin holds the privileges it needs
- **Changing an admin password through the API now requires the current one.** `ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD` arrives set to `true`, so `admin.update` refuses a password change that does not also send `CurrentPassword`, matching what the admin Account screen has always required
- **The system health check now accepts a dedicated token.** `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED` arrives set to `true`. Your existing admin API key keeps working. The point of the change is that you no longer have to give an uptime monitor the key that unlocks every admin command: set `SYSTEM_HEALTH_CHECK_TOKEN` and the monitor can use that instead
- **Octeth's private internal services now require a signed header.** `SYSTEM_INTERNAL_SIGNATURE_REQUIRED` arrives set to `true`. Every caller shipped with Octeth sends it. If you have a plugin or a script of your own that posts directly to `/system/segment_query_builder`, `/system/subscribers_query_builder`, `/system/queue_query_builder`, `/system/mime_email_parser` or `/system/email/spamtest`, it will start receiving HTTP 401. Set this to `false`, then check your Laravel log for the warning each unsigned call records, update the caller, and switch it back on
- **The new user interface is switched on by your upgrade.** `UI_ENABLED` arrives set to `true`, so `/user/` and `/ui/` begin serving the new interface. Your existing areas are untouched and stay where they are, at `/app/user/` and `/app/admin/`. The two use **separate logins**, so a user who needs both signs in twice. The interface keeps its own database, created for you during the upgrade, and it never touches your Octeth data. Set `UI_ENABLED=false` and recreate the containers to keep everything exactly as it was. See [The New User Interface](/v5.9.6/new-user-interface/)
- **Journey enrolment history starts at deployment.** The new per-day enrolment counts on `journey.get` and `journey.list` are recorded from the moment this version is deployed. There is no backfill, so a window reaching back before the upgrade shows zeros for those days. The existing lifetime enrolment figure is unaffected and remains complete
- **`journey.list` engagement totals increase.** `JourneyStats.AggregatedEmailActions` was windowed to the last 30 days on this endpoint while `journey.get` returned it all-time. The two now agree and both are all-time. Read the new `JourneyStats.WindowedEmailActions` for the previous windowed figure

### Deprecations

None

## v5.9.5

### Release Summary

Released August 28th, 2026, after a two-week development cycle. This is a correctness and hardening release with no new features. It closes the last of the injection vulnerabilities found during the v5.9.4 security audit, repairs a reporting endpoint that had been returning nothing for a large group of accounts since it shipped, and removes several failure modes that made real problems harder to diagnose.

**If you use the Email Gateway reporting endpoints, read the Upgrade Notes below and the [v5.9.5 API behavior changes](/v5.9.5/api-reference/behavior-changes) page before upgrading.** Two of those endpoints now return different, more accurate numbers.

Two database migrations ship with this release. One is expected to do nothing on a healthy installation. The other builds an index on the email gateway queue, so on installations with a large send history, run the upgrade outside peak sending hours.

### New Features

None. This release is deliberately scoped to correctness and security.

### Enhancements

- **Recipient Domain Reporting Now Reconciles** - The recipient domain leaderboard and the per-domain statistics it drills into are now measured from the same source, over the same sender domain, so the two views agree with each other for the first time
- **Clearer Errors From Segment and Subscriber Queries** - A query that fails now returns a proper error with the underlying cause recorded in the logs, instead of a generic server error page that discarded the real reason

### Bug Fixes

- **Recipient Domain Reporting Returned Nothing** - The recipient domain breakdown returned an empty result for every account sending through the Email Gateway API rather than the SMTP relay. It now reads from the send queue, which records the recipient domain on every message on both sending paths, so the report is populated immediately and covers your existing send history with no waiting period
- **Per-Domain Statistics Included Other Sender Domains** - Per-recipient-domain statistics aggregated across all of your sender domains instead of the one requested. Accounts with a single sender domain are unaffected. Accounts with several will see lower, correct numbers
- **Upgrade Reliability** - A check used during database upgrades could mistake an absent table for an existing one, which could stop an upgrade partway through. The check is now exact, and an upgrade that cannot verify the database state now stops cleanly and can be safely re-run rather than recording itself as finished
- **Noisy Logs on Installations Without Optional Add-Ons** - Scheduled tasks belonging to optional add-ons ran on every installation whether or not the add-on was present, writing roughly 1,750 failure lines a day into the log an administrator checks first when investigating a real problem. Those tasks are now silent when their add-on is not installed, and start working automatically if one is added later
- **Completed Export Files Were Not Always Cleaned Up** - Completed exports whose finish time was missing were skipped by the file retention cleanup, so their files were kept indefinitely. Any such records are now repaired during the upgrade

### Security Patches

- Closed a vulnerability in segment rules that could allow an authenticated account holder to read data belonging to other accounts. It was found during the internal audit that produced the v5.9.4 fixes, reproduced under controlled conditions, and verified as fixed. There is no indication it was exploited. Installations should upgrade promptly
- Segment rule fields and conditions are now validated when a segment is saved and again when it is used. Segments built in the Octeth interface are unaffected. Only rules submitted directly through the API with values outside the accepted set are rejected

### Upgrade Notes

- **Two database migrations ship with this release.** Run them as part of the upgrade. One repairs export records and is expected to be a no-op on a healthy installation. The other adds an index to the email gateway queue: on installations with a large send history this is the only step with meaningful build time, so schedule the upgrade outside peak sending hours
- **No configuration changes.** No settings were added, removed, or changed in meaning
- **Email Gateway reporting numbers change.** The recipient domain report now returns data where it previously returned an empty result, and its "sent", "failed" and delivery-time figures carry more precise meanings. Per-domain statistics are now scoped to the sender domain you request. Full detail and an upgrade checklist: [v5.9.5 API behavior changes](/v5.9.5/api-reference/behavior-changes)
- **Saving segments through the API.** A segment rule field or condition outside the accepted set is now rejected with an error instead of being stored. Segments created in the Octeth interface are unaffected

### Deprecations

None

## v5.9.4

### Release Summary

Released August 14th, 2026, after a two-week development cycle. This is a focused security and correctness release. It closes two injection vulnerabilities in the subscriber APIs and removes a set of silent failures — cases where Octeth reported success while quietly doing the wrong thing, or nothing at all. There are no new features and no database migrations, so it is a low-risk upgrade.

**Upgrading promptly is recommended.** If you maintain an API integration, review the Upgrade Notes below and the [v5.9.4 API behavior changes](/v5.9.4/api-reference/behavior-changes) page first — one call that previously returned a masked empty success now returns an explicit error.

### New Features

None. This release is deliberately scoped to security and correctness.

### Enhancements

- **Full-List Sending via the Email Gateway** - A list send through the Email Gateway has always stopped after the first 250 recipients while reporting success. A new administrator setting lets a list send reach every recipient on the list. The previous behavior remains the default, so existing integrations are unaffected until it is switched on
- **More Accurate Email Address Search** - Searching email addresses by "contains" no longer returns an empty result for certain common search terms

### Bug Fixes

- **Suppressed Contacts Could Enter an Audience** - A segment rule with an unrecognized condition was evaluated as its own opposite, which on a suppression rule meant suppressed contacts could be swept into an audience. Such a rule now safely matches nobody and is recorded in the logs
- **Journey Action Saves** - Saving a journey action could write to the wrong record when given a stale or invalid reference, silently moving child actions into branches that could never be reached. Saves are now verified against the account and journey before writing, and a failed save reports an error instead of appearing to succeed
- **Misleading Success on Large Email Gateway List Sends** - Sending to a list of more than 250 recipients returned a success response with no indication that the list had been truncated. See the enhancement above for how to send to the full list
- **SMS Delivery Report Processing** - Delivery report handling no longer queues work when delivery reports are switched off
- **First-Time Installation** - A fresh installation configured its inbound email relay with a placeholder credential instead of the real one
- **Upgrade Reliability** - The upgrade process now uses safer temporary file handling

### Security Patches

- Closed two vulnerabilities in the subscriber APIs that could allow an authenticated account to read data belonging to other accounts. Both were found during an internal audit, reproduced under controlled conditions, and verified as fixed. There is no indication either was exploited. Installations should upgrade promptly
- Hardened validation of search and sort parameters across the subscriber endpoints
- Tightened account and journey ownership checks when saving journey actions

### Upgrade Notes

- **No database migrations ship with this release.** Upgrading is a container pull and restart
- **One API response change.** `subscribers.get` called with an invalid search field now returns an explicit error instead of an empty result that looked like a successful search matching nothing. If your integration treats an empty result as "no matches", add a success check. Full detail and an upgrade checklist: [v5.9.4 API behavior changes](/v5.9.4/api-reference/behavior-changes)
- **Sorting subscriber searches.** A sort field that is not a real subscriber column now falls back to sorting by email address, without reporting an error. If results come back in an unexpected order after upgrading, check your sort parameter

### Deprecations

None

## v5.9.3

### Release Summary

Released July 30th, 2026, after three weeks of development. This release is focused on security, correctness, and reliability. It completes a systematic hardening review of the API surface, adds usage-metering endpoints for external billing integrations, introduces product-wide spreadsheet-safety for CSV exports, and makes background delivery workers substantially more resilient. Upgrading promptly is recommended.

If you maintain an API integration, review the Upgrade Notes below before upgrading — this release turns several calls that previously returned fabricated success into explicit errors.

### New Features

- **Account Usage APIs** - Two new administrator endpoints report account usage and feature adoption: one for a single account (read-only, safe to call on every billing-page render) and one for bulk, date-ranged metering across many accounts. Both are designed for external billing and reporting integrations
- **Bulk Suppression Lookup** - A new endpoint checks many addresses against your suppression lists in one call, with full account and list scoping
- **Partial User Group Updates** - User groups can now be updated field-by-field without resubmitting the whole group
- **Spreadsheet-Safe CSV Exports** - Exported CSV cells that begin with a formula character are now written so spreadsheets display them as text rather than evaluating them. Octeth's own import understands this automatically, so exporting and re-importing is lossless
- **Privacy-Friendly Visitor Identification** - Website tracking can now identify a visitor by a hashed email address instead of a plain one
- **Self-Updating Upgrade Runner** - The upgrade command now bootstraps itself from the target release before running, so upgrades always use the correct version's upgrade logic. New `--reinstall` and `--yes` flags support unattended runs
- **Non-Interactive Installation** - Installation and reset can now run fully unattended, suitable for automated provisioning

### Enhancements

- **Configurable Container Resources** - Per-container CPU and memory limits are now configurable, and are automatically clamped to the host's actual capacity on a fresh install
- **Account Capabilities Without an Admin Key** - The current-account endpoint now reports the account's own capability and quota flags, so a frontend integration no longer needs to hold an administrator API key purely to render a user's own interface
- **Improved Segment Rule Clarity** - The segment builder now makes the relationship between multiple rules explicit in the interface
- **Faster Bulk Journey Enrollment** - Bulk journey triggering now uses a more efficient pagination strategy on large lists
- **Reduced Database Load During Sending** - Campaign counters are buffered and delivery events are grouped, easing pressure on database replication during large sends

### Bug Fixes

- **Custom Field Updates** - Corrected two issues that could cause subscriber updates to fail on lists using validated custom fields, including updates that never touched those fields
- **More Reliable Campaign Sending** - The send engine now recovers leaked worker slots, stops retrying indefinitely when a campaign's workers cannot start, and reports a clear status when a message fails
- **No Lost Messages on Infrastructure Hiccups** - Messages and delivery reports are now safely requeued rather than dropped when a database or queue connection is briefly interrupted
- **Background Workers Recover Cleanly** - Workers now shut down gracefully on restart, back off and retry instead of failing permanently when the message queue is briefly unavailable, and release work that was interrupted mid-processing
- **Per-List SMS Suppression Browsing Restored** - The per-list view of SMS suppressions was failing for every account and reporting the failure as an empty list. It now reads from the correct source and returns results
- **Accurate Transactional Reporting** - Transactional audit exports now report the true delivery outcome
- **Stuck Message Recovery** - Messages left mid-send by an interrupted process are now detected and returned for processing
- **Corrected Rate Limit Reporting** - Email Gateway send rate limits are now stored consistently and reported using the same rules the send path enforces, so displayed limits match what is actually applied
- **Date Handling in Journeys and Reporting** - Corrected several date-range and calendar edge cases across journey and reporting endpoints
- **Campaign Approval for Untrusted Accounts** - The approval hold for untrusted accounts is working again after a defect that made it inoperative
- **Upgrade Path for Sender Domains** - Sender domain data now merges correctly during upgrade on installations that already had domains configured
- **Bounce Processing Continuity** - Bounce webhook authentication now defaults to off on upgrade, so existing bounce senders continue working without reconfiguration

### Security Patches

- **Strengthened Account Data Isolation** - Completed a systematic review of account scoping across campaign, subscriber, import, preview, and journey operations, ensuring every request is constrained to the requesting account
- **Strengthened Input Validation** - Hardened input handling across administrative listing, deletion, sorting, and reporting operations
- **Hardened Password Reset** - Administrator password reset now uses signed, expiring, single-use tokens
- **Protected Two-Factor Bypass Path** - The internal two-factor bypass path now requires a server-derived trusted token
- **Stronger Key Generation** - API key generation now uses a cryptographically secure random source
- **Outbound Request Validation** - Public webhook registration now validates the destination before accepting it
- **Optional Bounce Webhook Authentication** - The bounce webhook endpoint can now require a shared signature; the administration area shows the value and a ready-to-use sender configuration
- **Reduced Log Exposure** - Configuration values that may carry secrets are no longer written to logs in an error path

### Upgrade Notes

- **Run Database Migrations Off-Peak on Large Installations** - This release adds a full-text index to your subscriber tables. The first build of that index rebuilds and briefly locks each table, so schedule the upgrade outside your busiest sending window if you have large lists
- **CSV Export Shape Changes Slightly** - Exported cells beginning with a formula character (`=`, `+`, `-`, `@`, tab or carriage return) now gain a leading apostrophe so spreadsheets treat them as text instead of evaluating them. Octeth's own import strips it automatically, so export and re-import is lossless — but if you feed Octeth exports into an external pipeline, verify it tolerates the change. It can be disabled with `CSV_EXPORT_FORMULA_PROTECTION=false`
- **Reverse Proxies and Load Balancers** - If you run an external reverse proxy or load balancer in front of Octeth at a non-loopback address, set `TRUSTED_PROXIES` in `.oempro_env` **before upgrading**. Without it, Octeth records the proxy's own address as the visitor IP for every request, which makes the admin "Authorized IP Addresses" list stop matching (you can lock yourself out), collapses per-IP rate limits, and attributes all opens, clicks and geographic reporting to a single location. Installations using only the bundled proxy are unaffected, as it runs on loopback and is always trusted
- **New List Suppression Default** - Newly created subscriber lists no longer add opt-outs to your suppression lists by default. Existing lists are unchanged, and each list's setting remains editable in its own settings page. If you rely on new lists feeding your suppression lists automatically, set `NEW_LIST_DEFAULT_ADD_TO_SUPPRESSION_LIST=true` in `.oempro_env`
- **Synchronous Import Threshold** - CSV imports are now processed synchronously up to 50 subscribers, raised from 10. Imports in the 11-50 range now return `ImportType: sync` and the API request blocks until the import finishes, rather than returning immediately. Adjust with `RUN_IMPORT_IN_SYNC_FOR_SUBSCRIBERS_LESS_THAN`
- **API Behavior Changes** - This release turns several API calls that previously returned fabricated success into explicit errors, and changes the shape of a few responses. If you maintain an integration, review the [API Behavior Changes](/v5.9.3/api-reference/behavior-changes) page and work through its upgrade checklist

### Deprecations

None

## v5.9.2

### Release Summary

Released July 8th, 2026, after roughly one month of development. This release brings first-class AI assistant integration through a new Model Context Protocol (MCP) server, richer campaign and list reporting APIs, smarter bot and automated-activity detection, faster email-address search on large lists, and broad reliability, performance, and security hardening.

### New Features

- **Connect AI Assistants (MCP Server)** - A new Model Context Protocol server lets AI assistants such as Claude Desktop and Claude Code work with your Octeth account through a curated, permission-scoped set of tools, with support for switching between multiple accounts. Setup instructions are built right into your API Keys page
- **Campaign Reporting APIs** - New endpoints for link-click reporting, recipient activity (with email search and list names), and A/B test results, plus a configurable statistics time window - ideal for building external dashboards
- **Automated Activity Detection** - Link clicks and opens generated by bots and mailbox proxies (such as Apple and Gmail privacy proxies) are now identified and can be optionally excluded from your reports and segments for more accurate engagement figures
- **Lists Overview API** - A single endpoint that returns your lists together with their custom fields and segments, including per-list subscriber tags and richer custom-field metadata
- **Admin Subscriber Search** - Search for a subscriber by email address across every list from the admin area
- **Journey "When Another Journey Finishes" Trigger** - Start a journey automatically when a subscriber completes a different journey
- **Date Auto-Responders on Global Fields** - Global custom date fields can now trigger date-based auto-responders
- **On-Demand Account Report** - Generate an account activity report for a custom date range, delivered as a CSV by email, with a redesigned account report dashboard
- **New Personalization Helpers** - Added hashing, number formatting, word-wrap, and line-break helpers for use in your email content

### Enhancements

- **Faster Email Address Search** - "Contains" searches on email address now use a full-text index, dramatically speeding up lookups on large lists
- **More Reliable Long-Running Workers** - Background delivery, import/export, and journey workers now manage memory more gracefully for improved long-term stability under heavy load
- **Proactive Large-List Maintenance** - Subscriber tables on large lists are now maintained proactively in the background so custom-field changes stay fast and non-blocking
- **Faster Email Delivery** - Delivery-path settings are now cached, reducing database load during sending
- **Enhanced Operational Monitoring** - New monitoring for long-running database queries and delivery-queue health, plus expanded operator metrics
- **Retention Cleanup for Exports** - Old export files are now cleaned up automatically on a configurable retention schedule
- **Scheduled Sender Domain Re-Verification** - Approved sender domains are re-checked on a schedule so DNS drift is detected even on idle domains
- **Segment Improvements** - A staleness indicator for outdated subscriber counts, finer control over automated-activity in segment rules, and an editable name when copying a segment
- **Email Builder Save Button** - Added a dedicated Save button in the drag-and-drop email builder
- **General Performance** - Faster personalization processing and reduced database work across subscriber updates and reporting

### Bug Fixes

- **Recurring Campaign Scheduling** - Corrected an edge case where recurring campaigns scheduled at certain hours or minutes did not fire
- **Accurate Subscriber Counts** - Subscriber counts on large lists now stay consistent with the displayed results
- **Corrected List Open-Rate Reporting** - List open rates now display correctly
- **Campaign & Template Attachments** - Restored attachment support in the modern campaign flow, with clearer size-limit messaging
- **Preserved Activity When Untagging** - Subscriber activity and journey enrollment are retained when tags are removed
- **Journey Enrollment Reliability** - Prevented duplicate journey entries under concurrent processing
- **Restored RSS Content Embedding** - Recurring campaigns that embed RSS content now fetch reliably again
- **Auto-Responder Creation** - Fixed a blank-screen issue when creating certain auto-responders
- **TLS for CDN-Fronted Installations** - Improved certificate handling when the application domain is served behind a CDN
- **Clearer Delivery Labels** - The Email Gateway dashboard now labels sent messages consistently

### Security Patches

- **Strengthened Account Data Isolation** - Hardened account scoping across campaign deletion, revenue attribution, and account settings updates
- **Strengthened Input Validation** - Improved input validation across search and webhook operations
- **Email Preview Abuse Controls** - Added rate limiting and suppression checks to preview and test sends
- **Updated Dependencies** - Refreshed third-party dependencies to incorporate the latest security fixes

### Deprecations

- **Elasticsearch No Longer Required** - Email Gateway event storage has moved to ClickHouse. Elasticsearch is no longer used by the event pipeline and can be retired after upgrading

## v5.9.1

### Release Summary

Released June 6th, 2026, after roughly eight weeks of development. The most API- and reporting-focused release to date: a comprehensive new List Analytics suite, deep Email Gateway and Journey reporting, faster campaign and segment statistics, broader suppression and autoresponder management, and wide-ranging reliability and security hardening.

### New Features

- **List Analytics Suite** - A new family of list-health reports covering subscriber activity over time, status breakdowns, bounce trends, engagement tiers, best send-time heatmaps, list tenure distribution, mailbox-provider breakdowns, and click-through retention - giving you a far deeper view of how each list is performing
- **Email Gateway Reporting & Management** - Account-level delivery statistics, exportable event logs, recipient-domain listings with volume counts, signing-key regeneration, and safer webhook configuration
- **Journey Reporting & Bulk Management** - Performance stats broken down by mailbox provider and by action, per-action revenue tracking, account-wide journey benchmarking, asynchronous journey export, and bulk journey operations
- **Campaign Reporting & Export** - New campaign export, subject-line search, aggregate engagement metrics, and faster campaign counts
- **Suppression Management** - Expanded suppression controls, including per-list and SMS suppression management
- **Autoresponder Management** - Expanded autoresponder management capabilities
- **Subscription Source Attribution** - See where your new subscribers actually came from
- **Select All Matching Subscribers** - Act on every subscriber that matches a search or segment, not just the ones on the current page
- **New Integrations** - Added ClickBank instant notification and PromptEMR integrations

### Enhancements

- **More Accurate Error Logging** - Expected, routine conditions no longer flood the error log, making genuine issues easier to spot
- **Faster Reporting** - Heavy campaign and segment statistics now compute in the background, so pages load more quickly
- **Sender Domain Management** - Smoother sender-domain setup and management experience
- **Smarter Sending Rate Limits** - Improved rate-limit handling for more consistent throughput

### Bug Fixes

- **Journey Reliability** - More reliable enabling and saving of journeys, custom-field subscribes, list handling, and sender-address validation
- **Unsubscribe Handling** - More robust unsubscribe processing, including for subscribers on deleted lists
- **More Accurate Statistics** - Improved accuracy of list and campaign delivery statistics
- **Email Header Handling** - Better handling of sender names containing special characters
- **Import Accuracy** - More accurate import counters
- **Session Handling** - Improvements for accounts signed in from multiple sessions
- **Upgrade Reliability** - More robust upgrade and database migration handling

### Security Patches

- Strengthened input validation across the API
- Tightened network exposure of internal services
- Safer webhook URL handling

### Deprecations

- Removed several legacy third-party integrations and a legacy account-management module. If your workflow depended on these, please migrate before upgrading.

## v5.9.0

### Release Summary

Released April 13, 2026 after 8 days of focused development. Feature-rich release introducing built-in A/B campaign testing, a completely redesigned Email Gateway interface, a new List Freshness Report for proactive deliverability management, and automatic SSL certificate provisioning.

### New Features

- **A/B Campaign Testing** - Create multiple content variations within a single campaign, preview them side by side, and let Octeth automatically identify the winning version before sending to your full list
- **Email Gateway UI Redesign** - Completely rebuilt Email Gateway interface with an account-level dashboard, cross-domain event log, and dedicated user-area section for faster infrastructure management
- **List Freshness Report** - New report that monitors subscriber list health by tracking engagement freshness across a 90-day rolling window, helping identify stale segments before they impact deliverability
- **Automatic SSL Certificate Management** - Automatic SSL certificate provisioning with on-demand TLS, replacing the previous manual certificate renewal process
- **Error Log Analysis CLI** - New command-line tool for deduplicating and analyzing error logs, making production troubleshooting faster

### Enhancements

- **Queue Status Display** - Improved queue monitoring with formatted table output for better operational visibility
- **Cross-Domain Event Tracking** - Trace delivery events across all domains from a single unified view
- **Event Filtering Accuracy** - Event filters now match precisely what your system tracks

### Bug Fixes

- **A/B Winner Detection** - Improved accuracy of winner detection scoring to ensure the correct variation is selected every time
- **A/B Variation Management** - Fixed save and content type toggle issues when managing campaign variations
- **API Key Management** - Resolved a failure when creating API keys after a previous key was deleted
- **Email Gateway Event Mapping** - Corrected event field mapping and bounce categorization for accurate delivery reporting
- **Email Gateway Index Performance** - Expanded event index windows for more reliable event retrieval
- **Infrastructure Health Monitoring** - Fixed health check reliability for link proxy services
- **List Freshness Threshold Handling** - Hardened threshold calculations against incomplete or missing configuration data
- **Domain Comparison** - Normalized domain matching for more reliable SSL certificate provisioning

### Security Patches

- **Webhook Protection** - Strengthened webhook endpoint security with improved request validation

### Deprecations

- **Manual SSL Certificate Management** - The previous manual SSL certificate system has been replaced by automatic on-demand TLS. Existing manual certificate configurations should be migrated to the new automatic system.

## v5.8.3

### Release Summary

Released April 5, 2026 after 15 days of focused development. Reliability and observability release featuring automatic journey recovery, real-time system monitoring, scheduled journey triggers, email delivery retry mechanism, and comprehensive journey queue monitoring APIs.

### New Features

- **Journey Stuck Entry Auto-Recovery** - Automatically detects and restarts journey entries that become orphaned when worker processes terminate, eliminating the need for manual recovery
- **ScheduledPull Journey Trigger** - New trigger type that pulls subscribers into journeys on a configurable schedule for time-based automation like weekly re-engagement or daily onboarding
- **Log Observer and System Health Check** - New admin area tools for viewing and filtering system logs in real-time and monitoring overall installation health without server access
- **Journey Queue Monitoring APIs** - New admin API endpoints for monitoring journey queue status, depth, processing rates, and auditing action execution
- **Journey Pending API and CLI** - Monitor pending journey entries via API or the new `journey:pending` CLI command
- **Subscriber Browse in Journey Actions** - Browse and select subscribers directly within journey action node configuration
- **Restart Active Journey** - Restart an active journey for a specific subscriber for testing or re-running flows
- **Duplicate Conversion Prevention** - Conversion events are deduplicated to prevent inflated metrics, with revenue attribution tracking tied to originating campaigns or journeys
- **Multi-List Subscriber Export** - Export subscribers from multiple lists simultaneously from the list browse page
- **Email Gateway Retry Mechanism** - Automatic retry for transient delivery failures such as server timeouts and temporary rate limits
- **MySQL Connection Management CLI** - New `mysql:set-max-connections` and `mysql:connections` commands for managing database connection pools

### Enhancements

- **Timezone-Aware Date Display** - All dates in the user area now display in the user's configured timezone
- **Disabled Sender Domain Warning** - Journey email delivery warns and skips gracefully when the configured sender domain is not enabled
- **Email Search in Journey Queue** - Search for specific subscribers by email address within journey queue monitoring
- **Fee Calculator Category Grouping** - Category-based grouping in fee calculator report for better organization
- **Frequency Cap Index Optimization** - Improved database index ordering for better query performance on scheduled triggers

### Bug Fixes

- **Link tracking scope** - Tracking now only processes http/https URLs, leaving tel:, sms:, and other protocol links unchanged
- **Double opt-in enforcement** - Opt-in settings properly respected during CSV and ESP subscriber imports
- **Subscriber API validation** - API now rejects requests with unknown custom field IDs and validates field normalization
- **Email delivery status handling** - Improved handling for mailing-list and permanent failure response paths
- **SSL certificate renewal** - Improved routing for domain verification challenges in containerized environments
- **Redis spool cleanup** - Prevented orphaned spool files that could gradually consume disk space
- **Sentinel date handling** - Properly handles placeholder dates in subscriber browse view
- **Confirmation email logic** - Uses computed subscription status for opt-in confirmation flag
- Plus 47 additional bug fixes across journeys, APIs, infrastructure, and system stability

### Security Patches

- **Admin API error handling** - Removed error message leaks in admin journey API responses
- **Input validation** - Strengthened validation across subscriber update and journey queue endpoints

### Deprecations

- **Website subscription form generator** - Removed from list dashboard UI

## v5.8.2

### Release Summary

Released March 21, 2026 after 12 days of development. Stability and usability release featuring polished campaign management UX, a terminal-based monitoring dashboard for system admins, comprehensive recurring campaign fixes, and improved send engine reliability.

### New Features

- **Campaign Post-Save UX** - Success feedback toasts for all save actions, smart redirects to campaign overview for committed campaigns, and schedule countdown timer on the campaign dashboard
- **Terminal Monitoring Dashboard** - Real-time service status monitoring, queue health, and scrollable log viewer for system administrators
- **Per-User Revenue Tracking Toggle** - Admins can disable revenue tracking parameters in email links on a per-user basis
- **List Filter on Activity Chart** - Filter campaign overview activity chart by mailing list for granular analysis
- **Email Template Management API** - New API endpoints for creating, reading, updating, and deleting user email templates
- **Journey Copy-to-User API** - Copy journeys between user accounts via admin API endpoint
- **Health Check Timing** - Per-check timing output in health check API and CLI for performance diagnostics
- **Project Configuration Init** - New CLI command to create project-specific configuration directories
- **Admin Password Change CLI** - Secure password management via CLI command

### Enhancements

- **Modern Merge Tag Syntax** - Handlebar-style merge tags replace legacy syntax across the UI, with parser support for custom email headers
- **Custom Email Header Preservation** - Custom headers preserved across both API and SMTP delivery paths
- **Safer Upgrade Process** - Built-in backup protection replaces aggressive file synchronization during upgrades
- **Increased Local Development Capacity** - Higher message limits for local development email testing

### Bug Fixes

- **Campaign Counter Accuracy** - Improved counter recalculation to prevent drift after retry operations
- **Scheduled Campaign Timing** - Prevented campaigns with invalid schedule data from bypassing their intended send time
- **Recurring Campaign Reliability** - Eight targeted fixes addressing scheduling, cloning, delivery, and state management for recurring campaigns
- **Send Engine Worker Management** - Improved worker allocation, more resilient process spawning, and dynamic container discovery
- **Queue Processing Stability** - Resolved exchange configuration mismatches that could cause queue processing errors
- **Global Custom Fields in Journeys** - Fixed global custom fields missing from Journey Decision node and subscriber detail page
- **Advanced Targeting Estimates** - Recalculate estimated recipients when advanced targeting operators change
- **Tracking URL Reliability** - Improved tracking URL generation in opt-in confirmation emails
- **Log File Permissions** - Resolved log file permission errors in containerized environments
- **Database Migration Stability** - Fixed errors in migrations and cache operations
- **Legacy Segment Compatibility** - Allow saving segments that use the older rule format
- **Campaign Events Query Accuracy** - Properly grouped conditions in campaign events query builder
- **Email Attachment Handling** - Fixed empty attachment content in file parsing
- **UTF-8 Data Integrity** - Script improvements for repairing double-encoded characters, with emoji and special character support

### Security Patches

- **Password Handling** - Improved password passing to prevent process list exposure
- **Input Validation** - Strengthened input validation across database operations

### Deprecations

- **Legacy SMS Code** - Removed unused legacy SMS code paths

## v5.8.1

### Release Summary

Released March 8, 2026 after 21 days of development. Performance-focused release featuring email gateway batch processing with Redis spool storage, custom email headers and footers at list and user group levels, Prometheus API monitoring, and new RabbitMQ management CLI commands.

### New Features

- **Email Gateway Performance Improvements** - Batch processing, Redis spool storage, caching, and inline MIME parsing for dramatically improved email delivery throughput
- **List-Level Email Header/Footer** - Add custom email headers and footers at the mailing list level for per-list branding and compliance
- **User Group Custom SMTP Headers** - Add custom SMTP email headers at the user group level for organization-wide header management
- **API Response Time Histogram** - New Prometheus metric for monitoring API endpoint response times and performance trends
- **RabbitMQ Queue Health Monitoring** - Queue health checks integrated into the system.health.check API endpoint
- **Supervisor Process Scaling CLI** - New octeth.sh commands for scaling supervisor worker processes up and down
- **RabbitMQ Queue Management CLI** - New CLI commands for listing, purging, and deleting RabbitMQ queues
- **Elasticsearch Init CLI Command** - New elasticsearch:init CLI command replacing the admin UI initialization page
- **Config Migration CLI Command** - New config:migrate command for migrating old configuration files to the new format with Docker support

### Enhancements

- **Personalization in Email Headers/Footers** - Personalization tags now processed in email headers and footers
- **Email Header Insertion Order** - Corrected header insertion order so group-level headers wrap outermost
- **Email Gateway Stress Test Tool** - New benchmark test with help documentation and uniqueness checks
- **Increased File Descriptor Limits** - Raised nofile ulimits on reverse proxy containers to handle higher traffic volumes
- **Proxy Header Improvements** - Added identification headers to HAProxy configuration for improved request routing

### Bug Fixes

- **Email Delivery Performance** - Improved email delivery reliability for journey send email actions and email gateway
- **Scheduled Campaigns Sending Early** - Prevented future scheduled campaigns from sending immediately
- **Campaign Search 500 Error** - Fixed server error when searching campaigns with plain text queries
- **Journey Stats Not Updating** - Removed redundant dedup check that prevented journey statistics from updating in real time
- **Database Connection Stability** - Improved database connection handling in long-running worker processes
- **Webhook Chart Sorting** - Fixed webhook statistics chart x-axis to sort in ascending date order
- **Checkbox State on Validation Error** - Preserved checkbox state on validation error in user group forms
- **SSL Domain Verifier** - Fixed domain verification to check root domains and custom subdomains
- **Configuration Constant Loading** - Fixed configuration constant loading for consistent access across the application
- **Plugin Enable/Disable Toast** - Added toast notification when enabling or disabling plugins
- **Missing Users Object in CLI** - Added missing users object loading in cli/opens.php
- **Spam Check Resilience** - Improved error handling when spam checking services are unavailable
- **PHP 8.x Compatibility** - Resolved MIME parser compatibility issues with PHP 8.x

### Security Patches

- **Input Sanitization** - Strengthened input escaping and validation across database queries and URL parameters
- **HTTP Status Code Compliance** - Corrected rate limiting responses to use standard HTTP 429 status code
- **API Metric Hardening** - Improved sanitization of metric labels to prevent unexpected data patterns

### Deprecations

- **Legacy CAPTCHA** - Removed legacy CAPTCHA functionality in favor of modern alternatives
- **Web Cron Files** - Retired web-accessible cron files in favor of CLI-based scheduling
- **Legacy Admin Pages** - Removed outdated admin UI pages replaced by CLI commands
- **Database Optimization Queries** - Removed legacy table optimization queries from the codebase

## v5.8.0

### Release Summary

Released February 15, 2026 after 43 days of development. Major release featuring redesigned campaign creation, automatic TLS via Caddy proxy, natural language segment rules, and significant legacy code removal.

### New Features

- **Simplified Campaign Create UI** - Complete redesign with advanced audience targeting, estimated recipients widget, and read-only mode for sent campaigns
- **Caddy Link Proxy with On-Demand TLS** - Automatic HTTPS certificate provisioning via Caddy reverse proxy for sender domains
- **Retry Failed Recipients** - Ability to retry delivery to failed recipients for sent or failed campaigns
- **Multi-List Journey Triggers** - Journey subscription triggers now support selecting multiple lists
- **Delivery Window Constraints** - Journey wait action supports delivery window time constraints
- **Journey Email Preview** - Preview email functionality directly in SendEmail action node
- **Natural Language Segment Rules** - Segment rules displayed as human-readable natural language descriptions
- **Future Date Segment Operators** - Future range and exact date offset operators for date-based segmentation
- **Recipient Domain Stats API** - New API endpoint for recipient domain statistics
- **Database Stats CLI & API** - New db:stats CLI command and admin.database.stats API endpoint
- **Upgrade CLI Command** - New upgrade command added to octeth.sh CLI tool

### Enhancements

- **Estimated Recipients in Campaign API** - Real-time estimated recipient count in campaign API and scheduled views
- **Campaign ID in Admin Reports** - Campaign ID shown alongside campaign name in admin reports
- **Seed List Exclusion** - Seed list deliveries excluded from campaign metrics, billing, and limits
- **Delivery Server / User Group Cross-Reference** - Admin listings show cross-reference between servers and groups
- **Stuck Campaign High Failure Detection** - Stuck campaign monitor detects campaigns with high failure rates
- **Health Check Logging** - System health check API endpoint now logs error responses
- **Custom Subdomain & Tracking Prefix** - Support for custom subdomains and tracking prefixes on sender domains
- **Deterministic Random Sampling** - Segment random sampling uses deterministic RAND(seed) for consistent pagination
- **Default Features on Fresh Install** - SenderDomainManagement and SimplifiedCampaignCreateUI enabled by default
- **ClickHouse Upgrade** - Updated ClickHouse image from 21.3.20.1 to 22.8
- **Primary Keys for Cluster Support** - Added primary keys to tables missing them for database cluster compatibility

### Bug Fixes

- **N+1 Query in Campaigns API** - Fixed N+1 query problem in campaigns.get API for improved performance
- **Stuck Campaign Zero Recipients** - Detects stuck campaigns with 0 sent recipients in Sending status
- **Segment Pagination Consistency** - Deterministic RAND(seed) ensures consistent results across segment pages
- **"Any Campaign" Segment Rules** - Rules with "Any Campaign" now work correctly when no campaigns exist
- **Global Custom Fields** - Fixed global custom fields breaking subscriber subscription flow
- **MergeTagAlias Validation** - Reserved subscriber field names properly rejected as MergeTagAlias
- **Duplicate Journey Entry** - Prevented duplicate journey entry registration for active subscribers
- **Sender Domain Scoping** - Sender domain lookup in journey email sending scoped by UserID
- **Chart Line Colors** - Swapped chart line colors to correctly match legend icons
- **MySQL 8.0+ Compatibility** - Added SET sql_mode for MySQL 8.0+ installation compatibility
- **ClickHouse Retention** - Changed website events retention from infinite to 180 days
- **Env File Parsing** - Fixed support for parentheses in .oempro_*_env comment lines

### Security Patches

- Various security improvements and fixes

### Deprecations

- **ionCube Loader** - Removed all ionCube loader references
- **Legacy PHP Frameworks** - Removed includes/framework_1_7_1/ directory
- **Flash SWF References** - Removed all Flash/SWF file references
- **Obsolete Docker Configs** - Removed Docker configs for Elasticsearch, HAProxy, Kibana, SSH, and PHP 7.2/7.4/8.2/8.3
- **Legacy Files** - Removed cron.php, orphaned package-lock.json, and legacy directories

## v5.7.3

### Release Summary

Released January 3, 2026. Maintenance release focused on campaign monitoring, email validation fixes, and security hardening.

### New Features

- **Stuck Campaign Detector** - Automated detection and recovery system for campaigns stuck due to worker failures with webhook notifications and admin UI management
- **Enhanced Email Validation for Journeys** - Comprehensive validation and trimming for all email fields in journey actions to prevent delivery failures from whitespace issues
- **MySQL Slow Query Analysis Tool** - New CLI command for analyzing MySQL slow query log directly from command line

### Enhancements

- **Campaign Report UI** - Better scheduled campaign display with improved metrics visibility and increased column widths for Recipients/Delivered and Open/Click Rate
- **Log Management** - Enhanced logs:reset command now includes daily error logs and MySQL slow query log
- **Link Click Performance** - Added composite index on oempro_link_stats table for faster deduplication queries in large campaigns

### Bug Fixes

- **Journey Email Reply-To Validation** - Fixed validation errors caused by trailing whitespace in email addresses
- **Installation Theme and Permissions** - Resolved theme selection errors and file permission issues during fresh installations
- **Campaign Report Chart Overlap** - Adjusted chart positioning to prevent overlap with Scheduled link
- **Invalid Custom Fields During Subscription** - Added validation to skip invalid custom fields instead of failing entire subscription
- **Campaign Report Empty State** - Removed CREATE CAMPAIGN button from admin campaign report and improved Octeth Plug-Ins empty state messaging

### Security Patches

- **Current Password Requirement** - Added current password validation when users change passwords to prevent unauthorized changes if session is compromised
- **XSS Prevention** - Implemented whitelist validation for DatePreset parameter to prevent cross-site scripting attacks via URL parameters

### Deprecations

None

## v5.7.2

### Release Summary

Released December 29, 2025. Major release with multi-tag journey triggers, advanced campaign reporting, test database isolation, and critical SQL injection fixes.

### New Features

- **Multi-Tag Journey Triggers** - Trigger journeys when subscribers have multiple specific tags simultaneously for sophisticated automation workflows
- **Advanced Campaign Reporting Dashboard** - Admin campaign report page with advanced filtering, real-time velocity metrics, and batch statistics
- **API Documentation Generation System** - Automated documentation generation for all API endpoints integrated into development workflow
- **Journey Trigger Rate Limiting** - Prevents system overload from excessive journey triggers
- **Test Database Isolation** - Complete separation of test and production databases for safer development with automated setup
- **Granular MySQL Query Logging** - Per-request/process MySQL query logging for detailed debugging
- **Message-ID Header Storage** - Email threading support through Message-ID header storage
- **User-Level Sender Settings** - Per-user configuration for sender settings

### Enhancements

- **Redis Entity Caching** - Comprehensive caching for themes, delivery servers, user groups, custom fields, and lists with EntityCache pattern
- **Campaign Monitoring API** - Optimized endpoints with auto-interval for velocity calculations and batch status improvements
- **Database Performance** - Composite index on Journeys table, SQL precedence bug fixes, Redis KEYS replaced with SCAN for better performance
- **MySQL Connection Health** - Health checks in workers to prevent stale connections
- **Queue Table Caching** - Queue table existence caching for improved performance
- **Subscriber Tags API** - Bulk operations support for subscriber tags
- **Segment Retrieval Optimization** - SegmentID filtering for better performance
- **Journey API** - Bulk operations with improved error handling and proper error codes
- **Error Code Standardization** - Standardized ErrorCode field across API responses
- **CLI Modularization** - CLI refactored into modular structure for better maintainability
- **Plugin Hook Reference** - Complete documentation for plugin hook system
- **Config Parameter Standardization** - Unified configuration parameter naming
- **Order Parameter Validation** - Centralized validation for orderfield/ordertype parameters
- **Form Handler Refactoring** - Improved form handling architecture
- **Enhanced Campaign Pause** - Improved logic for pausing campaigns including Ready status
- **Docker Compose** - Support for docker-compose.override.yml with improved health checks and dynamic SendEngine container discovery

### Bug Fixes

- **Campaign Pause Logic** - Fixed ability to pause campaigns when status is Ready
- **Orphaned Workers** - Workers now properly terminated when campaign is deleted
- **Memory Exhaustion** - Fixed memory issues when storing campaign recipient domains
- **SMTP Error Handling** - Improved error message handling and logging
- **Delivery Worker Blocking** - Prevented workers from blocking on stdout
- **Website Event Triggers** - Support for both trigger format types
- **Case-Insensitive Triggers** - Fixed comparison for trigger types
- **Journey Validation** - Comprehensive validation for tags, lists, and parameters
- **Disabled Journey Filtering** - SQL-level filtering for better performance
- **Log File Permissions** - Resolved conflicts between Apache and root processes
- **XDebug Default** - XDebug now disabled by default for better performance
- **AuthToken Synchronization** - Multiple fixes for token regeneration and sync issues between sessions
- **Laravel Test Isolation** - Resolved phpdotenv configuration conflicts
- **Double JSON Encoding** - Fixed encoding issues in API responses
- **Array Key Preservation** - Fixed associative array key preservation issues
- **Tag Ownership Validation** - Added proper validation for tag ownership
- **404 Error Handling** - Improved handling of not found errors
- **PHP 5.6 Compatibility** - Various compatibility fixes for PHP 5.6
- **Docker Buildx** - Fixed manifest creation for multi-platform builds
- **SendEngine Discovery** - Fixed container discovery for SendEngine

### Security Patches

- **SQL Injection Prevention** - Fixed SQL injection vulnerabilities in order parameter validation across all API endpoints, tag trigger endpoints, and journey bulk operations
- **XSS Prevention** - Enhanced cross-site scripting prevention in admin views and controllers with proper input escaping
- **Authentication Token Management** - AuthToken now regenerates on password changes with improved token validation and sync

### Deprecations

- **HAProxy v2.2.32** - Upgraded to v3.3.1 with improved security features, better performance and updated configuration options

## v5.7.1

### Release Summary

Released December 4, 2025. Major release with journey builder enhancements, Google Postmaster Tools integration, and comprehensive system performance optimizations.

### New Features

- **Journey Decision Nodes** - Advanced conditional logic and branching with nested decision support
- **Send Email Actions** - Complete email action implementation with template selection and sender configuration
- **Multiple Journey Triggers** - EmailOpen, EmailLinkClick, CustomFieldValueChanged, JourneyCompleted, and Untag trigger support
- **Multiple Journey Enrollments** - Allow contacts to enroll in the same journey multiple times
- **Journey Statistics Screen** - Comprehensive journey analytics and performance tracking dashboard
- **Journey Activity Tracking** - Detailed execution tracking with 95% database load reduction
- **Journey Copy/Clone** - Clone entire journeys with proper action ID handling
- **Node Cloning** - Duplicate individual journey nodes within the builder
- **Google Postmaster Tools Integration** - Complete OAuth flow, data collection, automated monitoring with analytics dashboard
- **Automated Campaign Reports** - Schedule campaign reports to be generated and delivered automatically
- **Auto-Resend Campaigns** - Automated follow-up campaigns targeting non-openers
- **Email Template Preview** - Preview templates without associating them with lists or campaigns
- **Email Cloning** - Clone and resend functionality for existing emails
- **Custom Email Headers** - Journey/Action merge tag support in email headers
- **Campaign ISP/Domain Reports** - Normalized reporting table for optimized ISP and domain analytics

### Enhancements

- **MySQL Performance Optimization** - Comprehensive query optimization with strategic index hints for faster data retrieval
- **ClickHouse Optimization** - Increased concurrent queries to 200 with system log TTL optimization and disk usage monitoring
- **Session Management Extended** - Default session lifetime increased to 30 days to prevent premature logouts
- **UTF8MB4 Migration** - Complete database charset update from utf8 to utf8mb4 for better character support
- **Docker Hub Integration** - Consolidated Docker architecture for simplified deployment and management
- **Horizontally Scalable Send Engine** - Enhanced send engine with health monitoring and scalability support
- **Redis Caching System** - Implemented caching for subscriber counts, list counts, tags, and custom fields
- **Cache Invalidation** - Automatic cache clearing on subscriber and list mutations
- **Custom MySQL Profiles** - Support for custom MySQL configuration profiles
- **Phpdotenv Integration** - Enhanced .env file parsing with support for special characters
- **Enhanced Campaign Metrics** - Improved campaign performance display and tracking
- **Drag-and-Drop Improvements** - Enhanced drag-and-move functionality in journey builder

### Bug Fixes

91 bugs fixed including performance improvements, UI/UX fixes, and system stability enhancements.

### Security Patches

Security enhancements for Google Postmaster Tools OAuth handling and validation.

### Deprecations

None

## v5.7.0

### Release Summary

Released December 1, 2025. Infrastructure release focused on performance optimization, database improvements, and scalability enhancements.

### New Features

None

### Enhancements

- **MySQL Performance Optimization** - Comprehensive query optimization with strategic index hints for faster data retrieval
- **ClickHouse Optimization** - Increased concurrent queries to 200 with system log TTL optimization and disk usage monitoring
- **Session Management Extended** - Default session lifetime increased to 30 days to prevent premature logouts
- **UTF8MB4 Migration** - Complete database charset update from utf8 to utf8mb4 for better character support
- **Docker Hub Integration** - Consolidated Docker architecture for simplified deployment and management
- **Horizontally Scalable Send Engine** - Enhanced send engine with health monitoring and scalability support
- **Redis Caching System** - Implemented caching for subscriber counts, list counts, tags, and custom fields
- **Cache Invalidation** - Automatic cache clearing on subscriber and list mutations
- **Custom MySQL Profiles** - Support for custom MySQL configuration profiles
- **Phpdotenv Integration** - Enhanced .env file parsing with support for special characters

### Bug Fixes

62 features added, 91 bugs fixed, and 23 performance enhancements implemented.

### Security Patches

None

### Deprecations

None

## v5.6.0

### Release Summary

Major release featuring A/B testing, campaign auto-resend functionality, Event API, and MySQL 8.0 upgrade.

### New Features

- **A/B Testing** - Email campaign A/B testing with automatic winner selection
- **Campaign Auto-Resend** - Automated follow-up campaigns targeting non-openers with customizable settings
- **Event API** - Custom event tracking and subscriber behavior monitoring
- **Delete Subscriber Action** - Journey action for automated list management
- **Email-Level Controls** - Granular control over open tracking, link tracking, and UTM parameters
- **Custom Code Plugin** - Platform extensibility through custom code
- **User Overall Stats API** - Comprehensive reporting endpoint for user statistics
- **Website Event Personalization** - Personalize journey emails using website event data
- **Journey Webhook Improvements** - Enhanced security options for webhook actions
- **Custom Field Unique Identifier** - Flag for better subscriber tracking

### Enhancements

- **MySQL 8.0 Upgrade** - Upgraded from MySQL 5.7 to 8.0 for improved performance and security
- **UTF8MB4 Support** - Complete emoji and special character compatibility
- **Extended Session Lifetime** - PHP session lifetime extended to 30 days
- **Database Migrator Tool** - Improved schema management capabilities
- **Error Logging** - Enhanced error logging and monitoring
- **Revenue Tracking** - Improved revenue tracking and attribution
- **Website Event Tracker** - Updates with CDN support
- **Handlebar Improvements** - Advanced personalization capabilities
- **Database Indexes** - Additional indexes for better performance
- **Email Gateway Optimization** - Queue table optimization
- **Journey Event Trigger** - Advanced rules JSON criteria support
- **Webhook Customization** - Journey webhook payload customization
- **MySQL Query Optimization** - Optimized slow queries
- **Mailchimp Import** - Improved import functionality
- **ActiveCampaign Mapping** - Enhanced data mapping
- **Drip Import** - Upgraded import capabilities
- **Name Field Mapping** - Support for mapping full name to first and last name fields
- **Development Tools** - Added xdebug PHP module, improved MySQL configuration, SQL query debugging

### Bug Fixes

- **Default Sender Domain** - Fixed issue that could block campaign delivery
- **Admin Password Reset** - Resolved password reset functionality
- **Website Event Tracker** - Fixed subscriber association issues
- **Campaign Timezone** - Schedule now defaults to user's timezone instead of Hawaii
- **Tag Count** - Corrected tag count for deleted subscribers
- **Journey Trigger** - Fixed subscriber journey trigger for silenced custom events
- **Email Open Activity** - Resolved activity registration issue
- **Campaign Stats** - Fixed daily stats reporting
- **Tracking URL Validation** - Improved email tracking URL validation

### Security Patches

None

### Deprecations

MySQL 5.7 replaced with MySQL 8.0

## v5.5.5

### Release Summary

Simplified DNS setup and subscriber activity monitoring enhancements.

### New Features

- **One-Click Sender Domain DNS Record Setup:** Simplifies the process of setting up DNS records for sender domains. ([API documentation](https://dev.octeth.com/api-reference/sender-domains.html))
- **Subscriber Activity Monitor Enhancements:**
    - New ability to disable checks and logging for specific thresholds in the Subscriber Activity Monitor plugin.
    - Improved settings page UI for the Subscriber Activity Monitor.
    - New menu items 'Drop' and 'Subscriber Activity' added under 'Subscriber Activity Mon.' menu title.

### Enhancements

- **Admin Interface Improvements:**
    - Small improvements to the admin top header menu.
    - Subscriber Activity Monitor admin top menu placement changed.
- **Email System Enhancements:**
    - Updated the email subject format for preview emails.
- **Debugging and Error Reporting:**
    - Added debug mode settings and error reporting configuration.

### Bug Fixes

- **Typo Fix:** Corrected a typo in the codebase.
- **PHP Error:** Fixed an error during installation.
- **API Error Code Correction:** Corrected an API error code from 3 to 4.

### Security Patches

- **Database Migration Security** - Implemented db migration methods for transitioning from v5.5.4 to v5.5.5 securely

### Deprecations

None

## v5.5.4

### Release Summary

Website event tracking improvements, ClickHouse native access, and email bounce handling refactor.

### New Features

- **Cleanify Plug-In Update** - Enhanced functionality for the Cleanify Plug-In
- **ClickHouse Native Access** - Enabled direct access to ClickHouse native port 9000

### Enhancements

- **Website Event Tracking** - Improved supervisor process to prevent hanging and ensure no events are lost

### Bug Fixes

- **Email Bounce Handling** - Refactored logic for improved reliability and performance

### Security Patches

None

### Deprecations

None

## v5.5.3

### Release Summary

Campaign sharing improvements, MySQL error fixes, error logging enhancements, and security updates.

### New Features

- **Campaign Share Links** - Added copy link option for easier sharing

### Enhancements

- **Error Logging** - Enhanced system-wide error logging for better troubleshooting
- **Column Collation** - Unified column collation across all table columns
- **Segment Management UI** - Updated to use new RulesJSON for improved segment rule handling
- **Admin Dashboard** - Removed product news section for cleaner interface

### Bug Fixes

- **MySQL Campaign Sending** - Fixed MySQL errors during email campaign sending
- **RevenueHit Journey Trigger** - Resolved journey trigger issue
- **SSL Renewal** - Fixed SSL renewal issue with HAProxy and Certbot

### Security Patches

- **Ioncube Encryption** - Updated encryption settings for improved security and compatibility

### Deprecations

- **Upgrade Script** - Removed upgrade.sh script

## v5.5.2

### Release Summary

Journey triggers, automated SSL renewal, phone verification, and email security enhancements.

### New Features

- **Journey Triggers** - Added new journey triggers for workflow automation based on specific actions or criteria
- **HAProxy SSL Certificate Renewal** - Automated SSL certificate renewal process
- **Phone Verification on Signup** - Required phone verification for enhanced security when signing up to send emails

### Enhancements

- **Email Whitelist** - Improved whitelist functionality for better email sending control
- **Subscriber Filtering** - Filter and manage subscribers by failed delivery attempts
- **Email Gateway Personalization** - Enhanced personalization options in email gateway
- **Campaign API Sorting** - Sort campaigns by scheduled time in Campaign.Get API endpoint
- **Link Redirection Security** - Enhanced security measures to prevent hijacking and unauthorized redirects
- **Sender Domain Infrastructure** - Backend improvements for sender domain management
- **Documentation Templates** - Streamlined GitHub issue and pull request templates

### Bug Fixes

- **Campaign Copy Feature** - Fixed RulesJsonBundle parameter not being copied in Campaign.Copy API
- **Email Import** - Fixed bug preventing import of single email address without newline

### Security Patches

- **Email Address Suppression List** - Implemented whitelist feature for improved handling of sender domains and campaign rules

### Deprecations

None

## v5.5.1

### Release Summary

Email preview customization, revenue calculation, and improved admin user management.

### New Features

- **Email Previews Customization** - Pass FromName and FromEmailAddress for email previews for more personalized previewing
- **Revenue Calculation** - Track and analyze campaign performance with revenue calculation feature

### Enhancements

- **System Components Check** - Improved system stability with thorough component checking
- **Sub Admin User Management** - Sub admins can view all users in impersonated user list
- **Drip Importer** - Enhanced functionality for better data handling
- **Campaign Queue Maintenance** - Automatic deletion of old campaign queue tables via cron job
- **Upgrade Tool** - Preserves custom changes to config.inc.php

### Bug Fixes

- **Vendor Directories** - Removed unnecessary vendor directories
- **Clone Journey Endpoint** - Fixed journey cloning functionality
- **Subscriber.Import API** - Resolved Drip-related validation errors

### Security Patches

None

### Deprecations

None

## v5.5.0

### Release Summary

Major release with API enhancements, website event tracking, journey metrics, and import integrations.

### New Features

- **Campaigns.Get API** - Support for CampaignStatus=Scheduled parameter
- **Campaign Activity Subscribers** - Get list of subscribers for specific email campaign activities
- **Website Event Segmentation** - Filter and segment subscribers based on website interactions
- **Customizable Activity Tracker** - Customization support for web activity tracking script
- **Journey Email Metrics** - Performance metrics for email actions within journeys
- **Email Gateway Support** - Enhanced ListID and SubscriberID support
- **User API Key Management** - Endpoints for managing user API keys
- **Subscriber API Endpoints** - Create and Update endpoints for subscriber management
- **MessageBird SMS Connector** - SMS communication channel integration
- **Antivirus Plugin** - Email attachment virus scanning
- **Mailchimp Import** - Import integration for Mailchimp data
- **ActiveCampaign Import** - Import tool for ActiveCampaign migration

### Enhancements

- **SMTP Error Messages** - Improved error handling for clearer communication
- **Octeth Branding** - Updated UI texts and database values
- **Performance** - System-wide performance improvements including query and campaign delivery optimizations
- **API Notation** - Standardized request and response notation
- **Security** - Connection limiter for email gateway and ACL rules updates

### Bug Fixes

- **RSS Feeds** - Fixed conflict issue with multiple RSS feeds
- **SMTP Password** - Made SMTP password optional as intended
- **Segment Counts** - Updated expiration time to 30 seconds
- **Journey API** - Optimized Journey Action Subscribers API endpoint
- **Email Recipients** - Updated recipient handling and credit calculation

### Security Patches

Connection limiter for email gateway and ACL rules updates.

### Deprecations

None

## v5.1.1

### Release Summary

Custom email headers, link proxy add-on, and IMAP-powered bounce handling.

### New Features

- **Custom Email Headers** - Setup custom email headers with personalization support for each user account
- **Link Proxy Add-On** - Proxy service for email link tracking
- **IMAP Bounce Handler** - IMAP powered inbound bounce and list-unsubscribe MX server add-on

### Enhancements

- **Segment Engine** - Minor performance improvements

### Bug Fixes

Various bug fixes.

### Security Patches

None

### Deprecations

None

## v5.1.0

### Release Summary

Sender domain management, fallback personalization, and containerized backend processes.

### New Features

- **Suppression List Pagination** - Pagination and search features for user account suppression lists
- **Sender Domain Management** - Management section for sender domains in user area
- **Containerized Backend** - Backend daemon processes and cron jobs managed by separate containers for easier scaling
- **Fallback Personalization** - Fallback values when custom field is empty for recipient

### Enhancements

- **List Suppression** - List suppression settings enabled by default
- **Webhook Payload** - Improved list subscription webhook payload
- **Campaign Content** - HTML and plain text email content enabled by default for simplified campaign create flow
- **Timezone DST** - Improved DST calculation for scheduled campaigns
- **Custom Field Type** - Changed custom field data type from TEXT to LONGTEXT
- **Stripo Builder** - Session timeout prevention improvements

### Bug Fixes

None mentioned.

### Security Patches

None

### Deprecations

None

## v5.0.3

### Release Summary

Personalization enhancements, delivery metrics, and campaign KPI improvements.

### New Features

- **MFROMDomain Merge Tag** - Support for %MFROMDomain% in email from header
- **Delivery Metrics** - System-wide daily, weekly, monthly, and yearly delivery metrics
- **Campaign Personalization Tags** - Campaign ID, Hashed Campaign ID, and Campaign Name tags
- **Remote Content Fetch** - Pre-email delivery remote content fetch merge tag
- **JSON Custom Field Personalization** - Support for JSON data in custom fields
- **Merge Tag Functions** - Functional merge tags for advanced personalization
- **Subscriber Activity Logging** - Log latest subscriber email activities

### Enhancements

- **Delivery Server Ordering** - Improved list ordering in user groups
- **Personalization** - General personalization improvements
- **Campaign KPI Metrics** - Enhanced metrics on campaign browse page
- **Timezone Display** - Display timezone for scheduled campaigns
- **Schedule Intervals** - Campaign schedule minute intervals set to every 5 minutes
- **IMAP Bounce Processing** - IMAP-based hard bounce and FBL processing module
- **User Search** - Ability to search for user ID
- **List Dashboard** - Display opt-in pending subscribers count
- **Webhook Methods** - POST method support for inbound webhooks
- **User Names** - User first and last names are optional, company name can be used

### Bug Fixes

None mentioned.

### Security Patches

None

### Deprecations

None

## v5.0.2

### Release Summary

CLI installation tool, user management improvements, campaign cloning, and email delivery engine enhancements.

### New Features

- **CLI Installation Tool** - Command line installation tool for simplified setup
- **Coming Soon Feature Toggle** - Option to hide "Coming Soon" features from user area
- **Email Campaign Cloning** - Clone feature for duplicating draft email campaigns
- **Powerful Delivery Engine** - Enhanced send engine with capacity for 10 million+ daily deliveries
- **Daily Delivery Limit** - Set daily email delivery limits on top of monthly limits
- **Simplified Campaign Creation** - One-step campaign creation process
- **Multi-Role Sub Admins** - Sub-administrator accounts with different access permissions

### Enhancements

- **User Management** - Improved user group management with user counts, search filters, and sorting
- **RemoteContent Personalization** - Send recipient data to remote content sources
- **RSS Campaign Performance** - Performance improvements for RSS-to-email campaigns

### Bug Fixes

- **Reply-To Address** - Fixed enforced from email address feature reply-to issue

### Security Patches

- **Tracking Link Security** - Security update for tracking links to prevent third-party phishing attacks

### Deprecations

None

## v5.0.1

### Release Summary

Advanced personalization features, email builder integrations, and audience engagement metrics.

### New Features

- **Randomized Segment Audience** - Set segment audience size and randomize target recipients for varied campaign targeting
- **Email Content Spinning** - Generate content variations using spinning syntax for unique email content
- **CTR Retention Cohort** - Track audience CTR engagement over time for optimized campaigns
- **Randomizer Merge Tags** - Insert randomized strings and numbers for unique content
- **JSON Custom Field Personalization** - Inject and use JSON data in custom fields for advanced personalization
- **Conditional Content Personalization** - Flexible email layout customization based on subscriber data
- **Stripo Email Builder** - Drag-and-drop Stripo.email builder integration
- **Unlayer Email Builder** - Drag-and-drop Unlayer.com builder integration
- **SpamAssassin Restrictions** - Restrict campaigns based on SpamAssassin score threshold
- **SMS Marketing Module** - SMS communication channel support
- **Email Gateway Module** - Enhanced email gateway capabilities
- **SSL Reverse Proxy Module** - On-demand SSL and reverse proxy support

### Enhancements

- **Campaign Resend Flow** - User experience improvements
- **TLS Crypto** - Updated TLS cryptography
- **Segment Engine** - SQL query improvements
- **Docker Container** - Apache version upgrade in frontend container
- **Journey Triggers** - Subscribe/Unsubscribe from ALL lists event trigger
- **Export Processes** - Ability to rename audience export processes
- **Conditional Personalization** - General improvements

### Bug Fixes

Various bug fixes.

### Security Patches

Various security patches.

### Deprecations

None
