# Staff Sign-up

**Sign-up** decides whether visitors can create their own account, the reputation a new account starts with, the user group and language it gets, and the checks a new account must pass. It replaces the sign-up part of the classic admin **ESP Settings** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Sign-up | `/user/staff/settings/signup` | Settings |

Open it from the staff sidebar: click **Settings**, then **Sign-up**. The classic admin no longer links to it, but the old `/app/admin/espsettings/` address opens this screen. A form posted to the old address is refused and changes nothing.

## Self-signup

Turn on **Let visitors create an account** to show the sign-up link on the sign-in page and open the sign-up page. Turned off, only an administrator can create accounts. The new sign-up page and the classic `signup.php` page both follow this switch. A change takes effect on the sign-up page within a minute.

**New account reputation** sets the reputation every new account starts with:

- **Untrusted**: each campaign of a new account waits for an administrator's approval before it sends.
- **Trusted**: a new account sends campaigns without approval.

It applies to accounts created by sign-up, by single sign-on, and through the API when the call names no reputation. Sign-up screening can still hold a suspicious account as Untrusted. Choosing **Trusted** asks you to confirm before it is saved. Accounts that already exist keep their reputation.

## New accounts

These settings show while self-signup is on.

- **User group**: the user group a new account joins while billing is off. **Let visitors choose a group** shows a list of groups on the classic sign-up page. The new sign-up page has no list and puts the account in the first group you pick under **Groups visitors can choose**.
- **Groups visitors can choose**: shows when the user group is **Let visitors choose a group**. Pick at least one.
- **Language**: the language of the classic sign-up page, and of an account created by single sign-on. Only installed languages are offered.

::: tip Billing decides the group when it is on
With billing turned on (`BRAND_FEATURE_BILLING=true`), the new sign-up page ignores **User group** and places a new account in the **Signup group** under **Billing > Settings > User groups**, or in the Free plan's group when no signup group is set.
:::

Listing the user groups needs the **User groups** permission as well. Without it, or when the list cannot be read, the screen offers only the groups already stored, shown as **User group #** and the group's ID, so a save never removes them. A sub-administrator limited to some user groups sees only those groups, and stored groups outside them are kept the same way.

While self-signup is off, the screen hides these settings and leaves them as they are.

Click **Save sign-up settings** to save.

## Sign-up protection

These checks apply to every new account created on the sign-up page, and all but the captcha also apply to sign-up with Google. They are stored by the new interface and take effect on the next sign-up. Click **Save sign-up protection** to save them. This button saves only this section.

While self-signup is on and no captcha is set up, a warning at the top of the screen says so.

### Captcha

A captcha stops scripts from filling in the sign-up form. Octeth supports **Cloudflare Turnstile** and **hCaptcha**. Both are free for this use and neither needs Google.

1. In the provider's dashboard, create a site for the domain your sign-up page runs on.
2. Under **Provider**, pick the provider.
3. Paste the **Site key** and the **Secret key** the provider shows you.
4. Click **Save sign-up protection**.

The sign-up page then shows the provider's challenge above **Create account**. On every sign-up the interface asks the provider whether the visitor passed, with your secret key, before it creates anything. When the provider cannot be reached, the sign-up is refused and the visitor is asked to try again.

The secret key is never shown again after you save. The field stays blank and says a key is saved. Leave it blank to keep the saved key, or enter a new one to replace it. Picking a different provider asks for that provider's secret key. Set **Provider** to **Off** to remove the captcha and both keys.

### Email addresses

- **Refuse disposable email addresses** (on by default): addresses at throwaway mail services cannot sign up. The list ships with the interface and holds about 10,000 domains, from the public-domain [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) project. A subdomain of a listed domain is refused too.
- **Require a domain that receives email** (on by default): refuses an address whose domain has no MX, A or AAAA record, or publishes only a null MX record (`MX 0 .`) saying it takes no mail, which catches most typos before a verification email is sent to nowhere.
- **Always refuse**: domains you never want to sign up, one per line. Their subdomains are refused too. This list wins over every other setting.
- **Never treat as disposable**: domains the disposable list wrongly names, one per line. It overrides only the disposable list, not **Always refuse** or the email check.

To refresh the disposable list without upgrading Octeth, run this on the server:

```bash
docker exec oempro_ui php artisan signup:update-disposable-domains
```

It downloads the current list and keeps it until the next run. A download that fails or looks wrong leaves the current list in place. Add `--reset` to go back to the list that shipped with Octeth.

### Sign-up limits

Limits count accounts actually created, not attempts. **0** turns a limit off.

| Setting | Default | What it limits |
|---|---|---|
| Per network, per hour | 3 | Accounts created from one IP address in an hour |
| Per network, per day | 10 | Accounts created from one IP address in a day |
| Per email domain, per day | 0 (off) | Accounts created with addresses at one domain in a day |

Leave the per-domain limit off if many of your customers share a mail service such as Gmail. Separately from these settings, one IP address can submit the sign-up form at most 30 times an hour, whatever the outcome.

A visitor over a limit sees "Too many accounts were created from your network recently" and can try again later. Every refused sign-up is written to the interface's log with the reason, the visitor's IP address and the email domain, never the full address. New accounts now also record the visitor's real IP address as their sign-up IP address, so you can see which accounts came from the same network.

### Upgraded installations

On an install with self-signup turned on, the upgrade turns on **Refuse disposable email addresses**, **Require a domain that receives email** and the per-network limits of 3 an hour and 10 a day, because nothing is saved yet and these are the defaults. No captcha is set up until you add one. To keep the old behaviour, turn the two email checks off and set both per-network limits to 0. An install with self-signup off is not affected.

## Settings that were removed

The classic **ESP Settings** page also held the currency, the tax, the payment receipt email, the third party credit purchase gateway and the list of fields on the classic sign-up page. These belong to the classic billing, which the new billing replaces, so the new interface does not offer them. Their stored values are kept and nothing changes for an install that still uses them. Set up prices, taxes, invoices and payment gateways under **Billing** instead.

## Who can use it

The screen needs the **Settings** permission. Every save is recorded in the staff audit log, which names the settings that changed, not their values.
