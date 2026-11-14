# Staff Sign-up

**Sign-up** decides whether visitors can create their own account, the reputation a new account starts with, and the user group and language it gets. It replaces the sign-up part of the classic admin **ESP Settings** page.

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

## Settings that were removed

The classic **ESP Settings** page also held the currency, the tax, the payment receipt email, the third party credit purchase gateway and the list of fields on the classic sign-up page. These belong to the classic billing, which the new billing replaces, so the new interface does not offer them. Their stored values are kept and nothing changes for an install that still uses them. Set up prices, taxes, invoices and payment gateways under **Billing** instead.

## Who can use it

The screen needs the **Settings** permission. Every save is recorded in the staff audit log, which names the settings that changed, not their values.
