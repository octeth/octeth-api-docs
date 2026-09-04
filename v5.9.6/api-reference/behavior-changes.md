---
layout: doc
title: API Behavior Changes in v5.9.6
description: Deliberate API behavior changes in Octeth v5.9.6 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v5.9.6

This page lists every deliberate change in v5.9.6 that an existing integration can observe, so you can check your code against it before upgrading.

::: info This page is maintained through the release cycle
Entries are added as fixes merge and the list is finalized at release. If you are reading it mid-cycle, treat it as current-but-growing rather than frozen.
:::

Looking for the previous release? See [API Behavior Changes in v5.9.5](/v5.9.5/api-reference/behavior-changes), which repointed the Email Gateway recipient domain report at the send queue, scoped per-domain statistics to the sender domain requested, and allowlisted segment rule fields and operators.

::: warning The two entries most likely to surprise you
**Segment rules that negate now match subscribers with no value**, so existing segments and journey Decision branches select more people than they did. And **campaigns now brand with the account's verified sender domain by default**, which moves the envelope sender, `Message-ID` and tracking host off the shared platform domain. Both are described in Tier 2 below and both have an entry in the upgrade checklist.
:::

## Tier 1: Calls that used to succeed now return an error

- **A campaign will no longer send with an invalid `From` header.** No message leaves the send engine with a `From` that fails `FILTER_VALIDATE_EMAIL`. The affected queue row is marked `Failed` with the reason `Invalid From email address: "..."` instead of delivering a malformed message and counting the send as successful.

  This was reachable in normal operation. Under sender domain management the stored `fromemail` holds only the local part, and the domain is recombined at send time. When the sender-domain gate failed, that recombination was skipped and the bare local part went out verbatim as `From: Cem <cem>`, unsigned by DKIM, recorded as a success.

  Merge tags are unaffected. An address that still contains a `%...%` tag at that point is allowed through, because merge tags in the From address are a supported configuration and are expanded on the engine at the last moment (issue #2749).

- **`settings.update` now rejects values that would break the install.** `DEFAULT_LANGUAGE` and `USER_SIGNUP_LANGUAGE` must name an installed language pack, `USER_SIGNUP_GROUPID` and `USER_SIGNUP_GROUPIDS` must name existing user groups, and `DEFAULT_THEMEID` must name an existing theme (`ErrorCode` 8, 9 and 10). These values previously succeeded and left the install unusable: an unknown language code makes every page include a missing file. Empty values are unchanged. `EnabledPlugins` is validated against the plugins present on disk and rejects duplicates (`ErrorCode` 20 and 21), with whitespace around codes trimmed before the column is written. The literal `***REDACTED***`, which `settings.get` returns in place of secrets, is refused as a value for any field (`ErrorCode` 13) so a read-modify-write client cannot overwrite a secret with the marker (issue #2782).

- **`users.get` with `LimitUtilizationStatus` can answer an error where the same call without it cannot.** The parameter is new and additive. An unknown bucket answers `ErrorCode 1`; a bucket the `user_limit_utilization` cron has not written yet answers `ErrorCode 2` rather than an empty list. Calls without the parameter are unchanged (issue #2779).

## Tier 2: Same call, different results

No request change is needed, but the response values, the result set or the delivered message differ.

### Segment and journey rules

- **Negating rule operators now match subscribers with no value.** Four operators were rendered as bare SQL negations, and in SQL a comparison against `NULL` evaluates to `NULL` rather than true. A subscriber whose field was never populated therefore failed every one of those rules, which is the opposite of how each one reads in the rule builder.

  | Operator | Before | Now |
  |---|---|---|
  | `is not` (and the legacy `Is not`) | `field != 'x'` | `(field != 'x' OR field IS NULL)` |
  | `does not contain` (and the legacy `Does not contain`) | `field NOT LIKE '%x%'` | `(field NOT LIKE '%x%' OR field IS NULL)` |
  | `not between` | `field NOT BETWEEN a AND b` | `(field NOT BETWEEN a AND b OR field IS NULL)` |
  | `not in the last x days` | `field < date` | `(field < date OR field IS NULL)` |

  An unset field is the normal state, not an edge case. Custom-field columns are created nullable with a null default, so every subscriber that predates the field, or that was imported or created without it, holds `NULL`. For a global custom field it is stronger still: an unset field is always `NULL`.

  This affects list segments, campaign targeting, journey `Decision` actions, and every API or interface surface that evaluates segment rules. **Existing segments using these operators will grow.** In a segment the old behavior showed a visibly wrong count. In a journey `Decision` it was worse and silent: the Decision resolved false and routed the subscriber down the No branch, which in the reported production case led straight to `Exit this journey`, ending the journey with no email sent and no signal anywhere in the interface.

  Empty strings were never affected: `'' != 'energy'` was already true and still is. A subscriber whose field equals the compared value is still excluded. The `OR ... IS NULL` is always parenthesized inside its own rule, so it cannot widen a neighbouring rule under either the "Match All Rules" or the "Match Any Rule" connector. Anyone who worked around this by pairing the negating rule with an `is empty` rule now double-counts harmlessly.

  Not changed: `is not set` and `is not empty` were already null-correct. Positive operators (`is`, `contains`, `between`, `in the last x days` and the rest) are untouched, because an unset field does not equal, contain or fall inside anything. `not in the next x days` carries the same defect and was deliberately left out pending a separate decision, so note it if you rely on that operator (issue #2715).

### Journey statistics

- **`journey.list` `JourneyStats.AggregatedEmailActions` is now all-time.** It was windowed to `StatsStartDate`/`StatsEndDate`, which default to the last 30 days, while `journey.get` returned the same field all-time. The two endpoints disagreed under one key for the same journey, with nothing in either response naming a period. `journey.list` now matches `journey.get`.

  **Values increase** for any journey with cached data older than the requested window. Nothing is renamed and no field is removed. Callers that wanted the windowed figure should read the new `JourneyStats.WindowedEmailActions`, which carries exactly the old `journey.list` semantics and key set. `upsender-frontend` is a known consumer of this field (issue #2753).

- **The per-day series now includes the `StartDate` day.** `JourneyStats.AggregatedDaysEmailActions` on both endpoints, and each action's `DailyStats` on `journey.get`, zero-filled one day short, so the `StartDate` day was missing unless it happened to carry a real data row. A request where `StartDate == EndDate` returned an empty map.

  The series now always contains every calendar day in the inclusive range. On a quiet journey the leading day appears as a zero row where it previously vanished, so the series gains one key. On a busy journey where that day already had data the key count is unchanged and the day simply moves from the end of the map into its correct chronological slot. Key order is unchanged: newest first for `AggregatedDaysEmailActions`, oldest first for `DailyStats`. No schema change and no backfill (issue #2754).

### Sending identity and headers

- **Campaigns now brand with the account's verified sender domain by default.** A campaign whose From address domain exactly matches one of the account's `Status='Enabled'` sender domains is now branded with that domain, even when the user group's `SenderDomainManagement` option is off. The envelope MFROM (return path), `Message-ID`, `List-Unsubscribe`, `X-Report-Abuse`, `X-Complaints-To` and the click and open tracking host all move from the shared platform delivery-server domain to the customer domain.

  The Email Gateway already did this, gating only on the domain being `Enabled`. The campaign path additionally required the group flag and an explicit per-content selection, so for one and the same account the gateway mail was customer-branded and the campaigns were platform-branded. Mailbox providers then accumulate a single reputation record across every tenant on that delivery server, and per-customer domain verification bought the customer nothing on the channel that sends the most volume. DKIM signing is done by the MTA off the From and return-path domain, so correcting the campaign MFROM is a precondition for customer-domain DKIM on campaigns rather than a cosmetic change.

  **Who is affected:** any install with accounts that hold a verified sender domain matching their campaign From address but whose group does not have `SenderDomainManagement` enabled. An account with no matching verified domain sends exactly the headers it sent before.

  **Precedence:** an explicit per-content sender-domain selection still wins. The new From-domain match sits between that and the group `DefaultSenderDomain` fallback. Matching is exact, so a From on `mail.example.com` does not match a verified `example.com`.

  **The tracking host is gated separately.** It only moves when the domain's verification actually covered that tracking record. If a customer verified their MFROM records but never pointed the tracking CNAME, the MFROM and `Message-ID` are branded while tracking stays on the platform host, because pointing links at an unprovisioned host would break every URL in the message.

  To keep the previous behavior, set `CAMPAIGN_SENDER_DOMAIN_AUTO_BRANDING=false` in `.oempro_env`. Do that if you run a shared-IP warmup pool that depends on platform-branded campaign headers, since enabling this moves reputation onto a colder customer domain (issue #2750).

- **Campaigns no longer brand off a sender domain that is not `Enabled`.** The campaign send path accepted any sender-domain row that was not `Deleted`, including `Disabled`, `Suspended` and `Approval Pending`. It now requires `Status='Enabled'`, which is what the Email Gateway and the `email.render` / `email.smtp.render` endpoints already required. A campaign whose selected sender domain has been disabled or suspended now falls back to the group `DefaultSenderDomain` if one is configured, and otherwise to platform branding, and the failure is logged. Previously it routed mail through the suspended domain (issue #2750).

- **Auto responder `From:` headers now use the sender domain root.** Auto responder messages put the sending subdomain in the `From:` header, for example `newsletter@upm.example.com`, while campaigns, previews, test sends and the Email Gateway API all used the root, `newsletter@example.com`. Auto responders now use the root as well. The envelope sender is unchanged and stays on the sending subdomain, so bounce processing and SPF alignment behave exactly as before.

  This was a defect rather than a preference. The sending subdomain is a CNAME to shared infrastructure whose inherited MX has no mailbox store, so replies to auto responders were discarded while replies to campaigns arrived normally, and RFC 1034 section 3.6.2 forbids publishing an MX record beside a CNAME, so no customer-side DNS could fix it.

  **What operators will observe:** PowerMTA derives the DKIM `d=` from the `From:` header, so the auto responder stream's authenticated domain moves from the subdomain to the root. Google Postmaster Tools tracks reputation per authenticated domain, so auto responder volume now reports under the same domain as campaigns instead of a separate one. Accounts that already send campaigns consolidate onto an established reputation. Accounts that send auto responders and nothing else will see their history restart under the root domain. No action is required, and setting a per-domain `Options.CustomSubdomain` is not a way to opt out, because any subdomain is still a CNAME with no mailbox (issue #2745).

- **Journey and Email Gateway tracking links now fall back to the delivery-server domain.** Tracking, opt-out, web-version and forward links in journey and Email Gateway mail were built from a per-sender-domain hostname that Octeth composed at send time and never asked anyone to create in DNS. Where that hostname was not provisioned, every link in the email was dead, including the opt-out link.

  Those links now use the sender domain's own tracking host only when Sender Domain Management is enabled for the owner's group, **and** the domain is `Enabled`, **and** its stored DNS record set actually lists that exact tracking host. In every other case they fall back to the delivery-server tracking domain that campaigns, autoresponders and transactional mail already use, which cannot emit a hostname that does not resolve.

  Two consequences. The shipped `EMAILGATEWAY_DNS_TEMPLATES` `Default` template requests no tracking CNAME, so on a default configuration these links move from the sender domain to the delivery-server tracking domain: tracking that was already working keeps working, and tracking that was silently dead starts working. Where the tracking host *is* requested by a custom DNS template, it is now composed from the `EMAILGATEWAY_DNS_*` settings rather than the `EMAILCAMPAIGN_DNS_*` ones, so on an install where those differ the advertised host changes to match the gateway template the operator actually configured (issue #2747).

### Journeys

- **A failed journey action no longer advances the subscriber.** A journey action that fails now holds the entry in place, retries it on a backoff, and dead-ends it with a recorded reason once the attempts run out, instead of advancing the subscriber as though the action had succeeded.

  Failed runs also stop counting towards the action's `CompletedRuns`, so the Journey Builder node counters no longer overstate delivery: a node showing 33 completed used to be able to mean 33 emails or zero. An Email Gateway response that returns HTTP 2xx with no `MessageID` is treated as a failed send, because no queue row exists and no email is ever delivered.

  Failures are recorded on `oempro_journeys_action_executions` with `ExecutionStatus='Failed'`, plus `ErrorMessage`, `ErrorCode`, and for a pending retry `SnoozedUntil` and `SnoozeReason`, and in the journey log. The retry schedule is configurable through the `JOURNEY_ACTION_FAILURE_*` settings in [Octeth Configuration](/v5.9.6/getting-started/octeth-configuration) (issue #2748).

### Email content

- **`email.update` no longer wipes `Options.SenderDomain` on a partial update.** `Options` is now merged onto the stored value rather than replaced wholesale, so an update that omits `senderdomain` leaves the stored selection alone. `plaincontentautoconvert` and `subjectsettotitleelement` keep their previous behavior of clearing when omitted, so no existing caller sees a different result for those two.

  A read-modify-write round trip on a sender-domain-managed email is also idempotent now. Sending back the stored `fromemail`, which under sender domain management holds only the local part, previously derived a garbage domain and returned `ErrorCode 17`. Relatedly, the domain is no longer stripped off `fromemail` unless a sender domain actually resolved and is being stored alongside it (issue #2750).

### Admin and settings commands

- **`admin.campaigns.search` works again without `UserID`.** After the admin-reach change (#2775) this command answered `ErrorCode 5001` when called without `UserID`, and with `UserID` it was locked to that one account, because it delegates to the `campaigns.get` handler and inherited its new prologue. The cross-tenant browse it exists for was unavailable on develop between the two changes; no tagged release carried it. Restored in #2790: no `UserID` is required, `FilterByUserID` narrows to one account again, and restricted sub-admins are scoped to their user groups. Callers that had started passing `UserID` as a workaround should switch to `FilterByUserID`; `UserID` is ignored.

- **`users.get` reports the true total for the blocked-domain filter.** With `RelUserGroupID: "ActivationPendingSenderDomains"`, `TotalUsers` used to be the number of rows on the requested page, so pagination past page 1 was wrong. It is now the number of matching users (issue #2779).

- **`global.customfields.get` returns a real `TotalFieldCount`.** It was computed from the list id and user id of the calling session, neither of which exists under admin authentication, so the value was meaningless. It is now the number of global fields matching `SearchKeyword`; `TotalCustomFields` carries the same number and `RecordsFrom` and `RecordsPerRequest` echo the paging in effect (issue #2788).

- **`deliveryservers.delete` resets the user groups that pointed at the deleted server.** Every user group whose `TargetDeliveryServerID_Marketing`, `_Transactional` or `_AutoResponder` option referenced the server is reset to `0` (system default) after the Email Gateway per-user cache for those groups is invalidated. Before, the options kept pointing at a server that no longer existed. The response gains `UserGroupsReset`, the list of user group ids that were updated (issue #2788).

- **`deliveryserver.create` persists `SenderRotation` and `SenderRotation_Settings`.** Both were accepted on create and silently dropped; only `deliveryserver.update` stored them. Create now stores them the same way (issue #2788).

- **The admin Campaign Report screen and the new `admin.campaigns.*` commands share one implementation, and the screen changes as a result.** The report now applies the same sub-admin user-group scope as the API (it applied none before), the chart uses the same advanced-search translation as the table instead of a plain campaign-name `LIKE`, and the export supports all nine status buckets (it had six) (issue #2790).

- **The admin "Account Activity" chart draws real values.** The screen looked its series up by a `date('M j')` label against `Y-m-d` keys and always drew zeros. It now renders the same series `admin.user.activityseries.get` returns (issue #2779).

- **The delivery-server "Test" button can now pass its three CNAME checks.** The checks for the sender, link-tracking and open-tracking hosts read a `txt` key from a `DNS_CNAME` answer, whose key is `target`, so they could never pass on any install. `deliveryserver.verify` and the screen now read `target` (issue #2788).

- **`deliveryserver.testresults` now runs the verification instead of storing what you send.** The command used to write the `spf`, `dkim`, `dmarc`, `sender_domain`, `link_domain`, `open_domain` and `email_delivery` booleans from the request, and the request's `last_checked_at`, straight into the delivery server row with no check. It now sends a test message through the server's SMTP credentials to the authenticated admin's address, runs the SPF / DKIM / DMARC and CNAME checks, and stores that outcome stamped with the time of the check. The request parameters and the `Success: true` response are unchanged, and the values in `test_results` and `last_checked_at` are ignored. The command is now rate limited (10 calls per 300 seconds, the same as `deliveryserver.verify`). A caller that relied on this command to mark a server verified without the DNS records in place will now see `deliveryserver.get`, `deliveryservers.get` and the admin Delivery Servers screen report the real state. Use `deliveryserver.verify` to get the results and per-check messages in the response (issue #2769).

- **`usergroup.patch` writes `SubscriptionPlanIsDefault`.** Before v5.9.6 the key was silently ignored. A payload carrying it now writes the column, or answers `ErrorCode 33` (a value other than `Yes` or `No`) or `ErrorCode 34` (another group is already the default for that plan, with `ConflictingUserGroupID` in the response). Payloads without the key are unchanged. The admin user group screen and the API now share the same one-default-per-plan check (issue #2791).

- **`usergroup.create` validates `Options`.** It used to JSON-encode the parameter unconditionally, so a JSON string was double-encoded and the stored column held a JSON string rather than an object, which no consumer could read back, including the admin edit screen and the send engine. `Options` is now accepted as an object or as a JSON string of one, the two shapes `usergroup.update` and `usergroup.patch` already accept, and anything else answers `ErrorCode 28`. Because the old output was unreadable by every consumer, no working integration can have depended on it. Known keys sent as a nested object are additionally remapped onto their canonical spelling, since `/api.php` lowercases nested request keys and a lowercased key was likewise read by nothing. A create that sends no `Options` at all is unchanged (issue #2791).

- **`usergroup.options.patch` refuses an unreadable stored blob.** When a group's stored `Options` column is non-empty and does not decode to a JSON array or object, the command answers `ErrorCode 8` and writes nothing, naming the group in `GroupName`. The alternative, treating the column as empty, would have replaced the tenant's stored configuration with only the patched keys. An empty column and the literal `null` written by an older `usergroup.create` are both treated as no options yet and patch normally (issue #2791).

- **The About page's database health panel checks tables in batches.** It used to put every Octeth table into a single `CHECK TABLE` statement. On an install with thousands of per-list and per-campaign tables that statement sat in "Opening tables" for over a minute and then failed with "MySQL server has gone away", so the panel never rendered. The result rows and the rendered table are unchanged, except that a batch whose statement fails now shows one error row per table in it instead of nothing. The panel still covers every table, while the new `admin.database.check` command defaults to the core schema and takes `Scope=All` for the full run, because a full `CHECK TABLE` reads every page of every table through the InnoDB buffer pool and was measured exhausting memory on a host whose pool is sized close to its RAM (issue #2784).

- **The admin Dashboard, Live view and System Wide Delivery Metrics screens moved onto a shared class.** Restricted sub-admins now see only the accounts of their allowed user groups on all three, where before every tenant was shown regardless of the restriction. The Live view "at a glance" tiles render 0 instead of logging a division-by-zero warning when no campaign falls in the time frame. The Dashboard leaderboards no longer list a user id whose account has been deleted. The forecast chart is rebuilt inline on a cache miss instead of rendering empty until the next cron tick, and a forecast payload cached by a pre-v5.9.6 cron is ignored and rebuilt (issue #2792).

- **The admin Delivery Servers Reports, List Freshness and Payment Reports screens moved onto a shared class.** Rendered HTML is unchanged. Three visible differences: restricted sub-admins now see only the accounts of their allowed user groups on all three screens, as they already did on the Campaign Report since #2790; the Payment Reports screen renders 0% for both the paid and the not-paid ratio when the payment log is empty, where it used to render 0% and 100%, and a month with no revenue renders a 0% difference instead of a PHP warning; and on the Delivery Server Performance report, choosing delivery servers now populates the recipient-domain selector, which a `queue_c<ID>` typo had left empty since the feature shipped. The KPI dashboard's Redis payload now stores delivery server ids and names instead of full rows, and the list freshness cache keys moved from `_v2` to `_v3`. All of them expire on their own TTL, so nothing needs flushing (issue #2793).

- **Admin global search escapes wildcards and scopes restricted sub-admins.** The search box now treats `%` and `_` in the keyword literally, where they used to act as SQL wildcards, and applies the sub-admin user-group restriction in SQL rather than filtering the first twenty rows afterwards, so a restricted sub-admin gets up to twenty in-scope results instead of the in-scope subset of the first twenty (issue #2791).

## Tier 3: Security closures

These only affect callers doing something that was never intended to work. Listed for completeness and for anyone auditing.

- **`campaigns.get`, and transitively `admin.campaigns.search`, now allowlists `orderfield`.** The parameter was passed straight into the `ORDER BY` clause. An `orderfield` that is not a real, sortable campaign field is now ignored and the endpoint sorts by the documented default, `CampaignName` ascending, rather than reaching the query unvalidated.

  Legitimate sort fields are unchanged: any physical `oempro_campaigns` column, plus the named computed keys `Duration`, `SentRate`, `DeliveryRate`, `FailureRate`, `Velocity`, `Schedule`, `sort-by-status` and `sort-by-send-date`. `ordertype` is constrained to `ASC` or `DESC`, and any other value is treated as the default direction. This is a silent fallback rather than an error, so no working call changes and no client code that already sends a valid `orderfield` needs updating. This was the last named sink from the v5.9.5 injection audit (issue #2731).

- **Sub-admin privileges can now be enforced on the API (opt-in).** Every admin-capable command declares the sub-admin privilege it needs, matching the screen that owns it. With `ADMIN_API_ENFORCE_PRIVILEGES=true` in `.oempro_env`, a sub-admin calling a command outside its privilege list gets `99999` (`Not enough privileges`) instead of succeeding, whether it authenticates with its own API key, a `SessionID` from `Admin.Login`, or username and password. The setting is **off by default on upgraded installs** (absent from an existing `.oempro_env`), so nothing changes until you enable it; the shipped `.oempro_env.example` sets it on for fresh installs. The master `ADMIN_API_KEY` and admin accounts without restricted access are never affected in either mode. Before enabling it, check that any integration authenticating as a sub-admin holds the privileges it needs (issue #2774).

- **Nine user commands now also accept admin authentication with a `UserID` parameter.** `lists.get`, `campaigns.get`, `segments.get`, `emailgateway.getdomains`, `user.senderdomain.list`, `lists.stats`, `list.getactivityseries`, `subscribers.get` and `media.upload` are registered `user,admin` with user first, so a call without `Access=admin` is still a user call and existing responses are byte-identical. With `Access=admin` and `UserID` the handler runs for that account. New error codes `5001`, `5002`, `5003` exist only on the admin path (issue #2775).

- **Five SMS suppression commands also accept admin authentication.** `smssuppression.browse`, `smssuppression.stats`, `smssuppression.delete`, `smssuppression.patterns.browse` and `smssuppression.patterns.delete` are now registered `user,admin` with user first, so a call without `Access=admin` is still a user call and existing responses are byte-identical. With `Access=admin` they accept `Level=system` and a caller-supplied `UserID`/`ListID`, the same admin branch `smssuppression.add` already had, and the delete commands can remove system-level rows under admin auth (issue #2786).

- **`admin.update` takes a `CurrentPassword` parameter, and can require it.** A supplied value is always verified (`ErrorCode 10` when wrong). Whether omitting it alongside `Password` is refused (`ErrorCode 9`) is decided by the new `ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD` setting: off by default on upgraded installs, on for fresh installs. The admin Account screen has always demanded the current password; this carries the same check to the API (issue #2776).

- **Saving a sub-admin no longer clears its two-factor authentication.** The sub-admin edit screen used to reset `2FA_Enabled`, the secret and the recovery key on every save, so renaming a sub-admin silently disabled their 2FA. Both the screen and the new `admin.subadmin.update` command now leave 2FA alone; it is only cleared by an explicit disable (issue #2776).

- **Two admin screens are tightened as a side effect of sharing code with the new endpoints.** The Settings, Segments screen now rejects a rule whose field or operator is outside the allow-list introduced for issue #2720, and preserves unrelated `Options` keys on save instead of rewriting the whole blob (issue #2785). The Suppression screen now limits a restricted sub-admin's search and delete-by-id to the user groups it may access; previously it showed and deleted every tenant's rows (issue #2786).

- **`AdminAPIKey` also accepts per-sub-admin keys.** Issued on the sub-admin edit screen. A value that is neither the master key nor a sub-admin key still returns `99998`, so no existing caller sees a different result. `Admin.Login` never returns the key in `AdminInfo`.

- **Admin-key calls no longer lose `User.Update`'s admin-only fields when the master admin has 2FA enabled.** `AccountStatus`, `AvailableCredits`, `RelUserGroupID`, `ReputationLevel`, `APIKey`, `UserSince` and `SignUpIPAddress` were silently dropped under `Success: true` on installs where the master administrator had two-factor authentication on, because the key-based login demanded a TOTP it could never receive. The API key is the credential, so the internal login now bypasses the TOTP the same way user API keys already did. Calls that were affected now persist all fields (issue #2774).

- **`TemplateThumbnailPath` on `email.template.create` and `email.template.update` is confined to the temp directory.** The value was concatenated onto the temp path with no check and then unlinked, so a relative path could read an arbitrary file into the thumbnail column (readable back through `email.template.get`) and delete it, under user authentication. Both handlers now accept only a bare file name as returned by `email.template.thumbnail.upload`; any value containing a path separator or `..` is ignored. `email.template.update` also now deletes the consumed temp file, as create always did (issue #2787).

- **`settings.get` never returns secrets, and `settings.update` refuses the marker.** SMTP passwords, S2S keys, provider API keys and similar values come back as `***REDACTED***`. Writing that literal back is rejected with `ErrorCode 13`, so a client that reads settings, edits one field and writes the whole set back cannot overwrite a secret with the marker (issue #2782).

- **`system.health.check` gains a strict credential mode and a monitor token (opt-in).** The endpoint has always required the master `ADMIN_API_KEY`. With `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED=true` it instead accepts either a valid admin API key (master or per-sub-admin) or the new `SYSTEM_HEALTH_CHECK_TOKEN` (as the `HealthCheckToken` parameter or an `Authorization: Bearer` header), and refuses everything else with HTTP 401 and the standard `99998` envelope rather than HTTP 500 and `100005`. The switch is off by default on upgraded installs, so nothing changes until you enable it; the shipped `.oempro_env.example` sets it on for fresh installs. The `Bearer <AdminAPIKey>` form documented since the endpoint shipped keeps working in both modes. The About page's own health panel now runs the check in-process instead of calling the endpoint over HTTP (issue #2767).

- **`ADMIN_ALLOWED_IP` can now be enforced on the API (opt-in).** The admin-area IP allow-list was checked only when the admin login page rendered; `AdminAPIKey`, an admin `SessionID` and admin username/password all worked from any address. With `ADMIN_API_ENFORCE_ALLOWED_IP=true` and a non-empty list, every admin-authenticated API call from an address outside it answers `99998`. There is no exemption for loopback or private ranges, so an integration that calls `api.php` with an admin credential from inside the Docker network or from another host needs its address added to the list before you enable this. The product's own screens are unaffected (they call the API in-process). Off by default on upgraded installs, on for fresh installs (issue #2770).

- **The admin About page's `download` action is confined to the data directory.** It served any file under the application root, including `.oempro_env`, to an admin holding the `System` privilege. The path is now resolved with `realpath`, must be a regular file under `data/`, and anything else answers HTTP 403 and is logged. No screen links to this action; it remains for the export-then-download flow only (issue #2766).

- **`global.customfields.delete` and `customfields.delete` refuse ids outside the caller's scope.** Both commands handed their id list straight to the deletion routine, whose `ALTER TABLE ... DROP` keyed off the field record rather than the caller. An admin call naming a tenant's list-local field id dropped that tenant's subscriber column while the metadata row survived, and a user call naming another account's field did the same to the other account. Each id must now resolve to a system-global field (admin command) or to a field owned by the authenticated account (user command); one bad id refuses the whole call with `ErrorCode 2` and nothing is deleted. The one observable change for a legitimate caller: an id that does not exist, which used to answer `Success: true`, is now `ErrorCode 2`. The deletion routine itself also refuses any record outside the owner and list scope it was called with, and logs a warning, so no future caller can reach the schema change with a mismatched id (issue #2768).

- **The private `/system/search_translator` service now requires a shared-secret header.** The Laravel service that turns the admin advanced-search syntax into SQL for `admin.campaigns.search` (`SearchQuery`) and the campaign report screens used to be guarded only by a source-address allow-list. It now also requires an `X-Octeth-Signature` header derived from `OEMPRO_PASSWORD_SALT` and `ADMIN_API_KEY`, the same value the bounce webhook uses, and answers `401` with `{"error":"unauthorized access"}` to anything else. Octeth's own callers send the header, so `admin.campaigns.search`, the admin Campaign Report and the user Campaigns search behave exactly as before and nothing needs configuring. This only affects a client that was calling the internal service directly, which was never supported (issue #2771).

- **Disabling administrator two-factor authentication now needs a POST, the page's CSRF token and the current password.** The Security screen's "Disable Two Factor Authentication" action used to clear the admin's 2FA on any request, GET included, with no token and no password check, so a logged-in administrator who loaded an attacker-controlled page could have their second factor switched off by an image tag. The action now accepts POST only, requires the session-backed `csrf_token` the Security page embeds, and requires the administrator's current password; a request failing any of these redirects back to the Security page with an error and changes nothing. Successful disables are logged with the AdminID. This is a screen-only change: `admin.2fa.disable` is unaffected (issue #2772).

## Upgrade checklist

1. **Do you have segments or journey `Decision` actions using `is not`, `does not contain`, `not between` or `not in the last x days` on a field that may be unset?** Their audiences will grow, which is the fix, but segment size is sometimes load-bearing. Review sending throttles and per-send limits keyed to an expected audience size, scheduled and recurring campaigns that will now reach more people on their next run, any external reporting or billing that reconciles against a segment count, and every journey whose Yes branch sends mail or changes subscriber state. Where you deliberately want to exclude subscribers with no value, add a companion `is not empty` rule to the same group.

2. **Do your accounts hold verified sender domains that match their campaign From addresses?** Their campaigns now carry customer-domain MFROM, `Message-ID`, `List-Unsubscribe`, `X-Report-Abuse` and `X-Complaints-To`, and customer-domain tracking links where the tracking record verified. Confirm that is what you want before upgrading, particularly if you run a shared-IP warmup pool. Set `CAMPAIGN_SENDER_DOMAIN_AUTO_BRANDING=false` to keep platform branding.

3. **Do you read `JourneyStats.AggregatedEmailActions` from `journey.list`?** It is now all-time rather than windowed to the last 30 days, so the values increase. If you wanted the windowed figure, switch to `JourneyStats.WindowedEmailActions`, which carries the old semantics and key set unchanged.

4. **Do you chart `AggregatedDaysEmailActions` or a per-action `DailyStats` series?** Both now always contain every calendar day in the inclusive range, so a quiet series gains one key at the `StartDate` end. If you index by position rather than by date key, or if you assert a fixed key count, adjust for that.

5. **Do you monitor auto responder deliverability separately from campaigns?** The authenticated domain moves from the sending subdomain to the sender domain root, so Google Postmaster Tools reports auto responder volume under the same domain as campaigns. If auto responders are the account's only stream, expect its reputation history to restart under the root domain.

6. **Do you depend on journey or Email Gateway tracking links resolving on a sender-domain host?** They now fall back to the delivery-server tracking domain unless the domain's stored DNS record set lists that exact tracking host. On a default configuration those links move to the delivery-server domain. Links that were already resolving keep resolving.

7. **Do you treat a journey action's `CompletedRuns` as a delivery count?** It no longer counts failed runs, so the figure drops to reflect actual sends. A failing action now holds its entry and retries it on a backoff before dead-ending, so entries can sit in a journey longer than they used to. Tune that with `JOURNEY_ACTION_FAILURE_MAX_ATTEMPTS` and the two retry-interval settings.

8. **Do you call `email.update` with a partial `Options` object?** It now merges rather than replaces, so an update that omits `senderdomain` no longer clears the stored sender domain. If your integration relied on omission to clear that field, set it explicitly instead.

9. **Do you build `orderfield` for `campaigns.get` from user input or another system?** An unrecognised value is now ignored and the default sort applies, instead of reaching `ORDER BY`. Check that the fields you send are real campaign columns or one of the named computed keys.

10. **Do you call `deliveryserver.testresults` from an integration?** If any integration calls `deliveryserver.testresults`, note that it now sends a real test message to the admin's address and performs DNS lookups on every call, and that the stored `VerificationResults` are the check's outcome, not the request's. Check `VerificationResults` with `deliveryserver.get` after upgrading for any server that was previously marked verified through this command.

## One general note on error codes

`ErrorCode` and `ErrorText` are **arrays**, not scalars, on most endpoints. A rejection typically returns `"ErrorCode": [13]`, not `"ErrorCode": 13`. Code written as `if (response.ErrorCode === 13)` will not match, so use `response.ErrorCode.includes(13)` or your language's equivalent.

`subscribers.get` is the exception: it returns a **scalar** `ErrorCode` (for example `"ErrorCode": 4`), consistent with its existing codes `1`, `2` and `3`. Match it as a scalar.

<!--
MAINTAINER NOTES (remove before release)

Structure to follow, copied from the v5.9.4 page, which is the reference for tone and tiering:

  Tier 1 - Calls that used to succeed now return an error. Read this first; it is the tier that
           breaks integrations silently relying on a fabricated success.
  Tier 2 - Same call, different results. No request change, but the response values or result set
           differ.
  Tier 3 - Security closures. Only affects callers doing something never intended to work. Listed
           for completeness and for auditors.
  Upgrade checklist - one numbered, actionable question per change.

Add entries AS FIXES MERGE, not at release time. A deliberate contract change reads as an ordinary
`fix:` in git log, so a changelog derived from commit subjects will miss it. That is exactly how
v5.9.3 shipped with "Breaking Changes: None" while this page already documented 8 Tier-1 changes.

House style: NO em dashes anywhere in this repo's prose. Rewrite instead of substituting. A
parenthetical takes commas or brackets, an explanation takes a colon, a hard turn starts a new
sentence. Older pages predate the rule and were left alone; new text must not copy them.

Watch list for this cycle:

- #2730 - subscribers.search returns Success:true with a non-zero TotalSubscribers and an empty
  Subscribers array when the ORDER BY column does not exist. A Tier 1 candidate: it converts a
  fabricated success into an explicit error, exactly the shape that breaks integrations treating an
  empty result as "no matches". Note the reachable trigger is ordering by a GLOBAL custom field,
  which has no column on the subscriber table.
- #2720 residual - GetCriteriaString still emits Column/Operator/ValueWOQuote unescaped. #2731
  closed the campaigns sort-field sink in this cycle; the segment rule-field ingress was closed in
  v5.9.5. Anything left is a new sink, not a regression of those two.

Shipped this cycle and already documented above, do not re-add: #2715, #2731, #2745, #2747, #2748,
#2749, #2750, #2753, #2754. #2752 (journey enrolment counts) is deliberately NOT on this page: every
new field is gated behind the existing IncludeActivityCounters opt-in and responses without the
opt-in were verified byte-identical. It belongs in the changelog and on the journeys API page only.
-->
