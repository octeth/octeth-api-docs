# Setting Up the Billing System

The new interface includes an optional subscription billing system. It lets you publish
plans, take card payments, invoice your customers, chase failed payments and suspend
accounts that do not pay, all without leaving Octeth.

This guide takes you from a fresh install to a working plan catalog. Connecting a card
processor is covered separately in [Payment gateways](./payment-gateways), and the day to
day running of it in [Running billing](./billing-operations).

::: info
Billing is off by default and most Octeth installs should leave it off. If you already
invoice your customers through your own system, or you run a single-company install where
there is nobody to bill, you do not need any of this.
:::

## What it does, and what it does not do

**It does:** publish a plan catalog, sign customers up on a plan, store a card, charge on a
schedule, produce invoices as PDFs, apply discount codes, sell credit packs and add-ons,
retry failed payments on a schedule, suspend and then cancel accounts that never pay, and
move accounts between Octeth user groups as their subscription changes.

**It does not:** create or change your Octeth user groups. You create those yourself in the
classic admin area, and then tell the billing system which group belongs to which plan. The
billing system only ever moves an account from one group you made to another group you made.

::: warning
This is the single most important thing to understand before you start. If you do not create
and link the user groups, the billing system has nowhere to put your customers and it will
report an error rather than guess.
:::

## Prerequisites

- The new interface is turned on and you can sign in. See
  [The New User Interface](./).
- You can sign in as an Octeth administrator, which is what gives you the staff area.
- You know which Octeth user groups you want each plan to correspond to, or you are ready to
  create them.

## Step 1: Turn billing on

Open `.oempro_env` and set:

```ini
BRAND_FEATURE_BILLING=true
```

::: warning
Note that this setting does not start with `UI_`, unlike every other setting for the new
interface. That is not a typo in this guide. Writing `UI_BRAND_FEATURE_BILLING` has no
effect at all.
:::

Then apply it:

```bash
./cli/octeth.sh docker:up
```

With billing off, the staff billing screens return "not found", the scheduled billing jobs
never run, and no customer ever sees a paywall. With it on, all of that becomes live.

## Step 2: Create the starter catalog

Run this once to create the starting set of plans, the cancellation reason list and the
discount code table:

```bash
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:seed-catalog'
```

This creates five plans:

| Plan | Price | Emails each month |
|---|---|---|
| Free | 0 | 100 |
| Launch | 297.00 USD per month | 1,000,000 |
| Scale | 997.00 USD per month | 5,000,000 |
| Volume | 2,997.00 USD per month | 20,000,000 |
| Managed | 0, a placeholder for a negotiated contract | Unlimited |

::: tip
These are starting points, not a recommendation. Treat them as a working example you edit
into your own pricing in the next step. Running the command again later is safe: it
reconciles the existing catalog rather than duplicating it.
:::

::: danger
The command accepts a `--fresh` option that archives everything and starts over. Do not use
it on an install that already has paying customers.
:::

## Step 3: Create your Octeth user groups

Sign in to the classic admin area at `/app/admin/` and create one user group per plan, plus
two more:

- One group per plan, holding the sending limits and permissions that plan should grant.
- One group for **suspended** customers, with sending limits low enough or permissions tight
  enough that a suspended account cannot send.
- One group for **cancelled** customers, if you want cancelled accounts treated differently
  from free ones. You can skip this and let cancelled accounts fall back to your free plan's
  group.

[[SCREENSHOT: The classic admin User Groups list showing a group for each plan plus a Suspended group]]

::: tip
Name them so the mapping is obvious later, for example "Plan: Launch", "Plan: Scale" and
"Billing: Suspended". You will be choosing them from a dropdown by name.
:::

## Step 4: Edit your plans

In the new interface, go to **Staff** and then **Catalog**.

[[SCREENSHOT: The staff Catalog screen showing the list of plans, their active price and their entitlements]]

For each plan you can:

- **Edit the plan** to change its name, description, whether it is publicly listed, and its
  position in the list.
- **Change the price**, which creates a new price version.
- **Set its entitlements**, which is what the plan actually grants.
- **Link it to user groups**, which is what decides where a customer on that plan lands.
- **Archive it**, which hides it from new sign-ups without touching anyone already on it.

You can also create a new plan, an add-on or a credit pack from this screen.

### Entitlements

An entitlement is one thing a plan grants. Pick each one from the list rather than typing
it, because a misspelled entitlement saves cleanly and then grants nothing at all.

| Entitlement | Kind | Meaning |
|---|---|---|
| Emails each month | Quota | How many emails the plan includes. `0` means unlimited. |
| Subscribers included | Quota | How many subscribers the plan includes. `0` means unlimited. |
| Dedicated IPs | Count | Adds up across add-ons. |
| Verification credits | Count | Adds up across add-ons. |
| Delivery credits | Count | Adds up across add-ons. |
| Transactional email | Feature | Sending domains, gateway keys and SMTP. |
| Journeys | Feature | Automated multi-step sending. |
| Bills overage | Feature | An internal policy switch, not a customer-visible feature. It marks a plan as one that charges for usage above its quota. |

::: info
Entitlements describe what a plan promises. The Octeth user group you link in the next
section is what actually enforces it. Keep the two consistent: a plan whose entitlement says
one million emails should be linked to a group whose Octeth limits allow one million emails.
:::

### Prices are versioned, never edited

Changing a plan's price does not overwrite the old one. The current price is marked inactive
and a new one is created alongside it.

This matters in two ways:

- **Your existing customers keep the price they signed up on.** Raising the list price does
  not raise anyone's bill.
- **Your invoice history stays honest.** A past invoice still shows what was actually
  charged at the time.

If you want an existing customer moved onto the new price, that is a plan change on their
account, done deliberately.

[[SCREENSHOT: The price editor showing the current price, the new amount field and the billing interval selector]]

### Linking a plan to user groups

Each plan is linked to one or more Octeth user groups, and each link has a role:

| Role | Meaning |
|---|---|
| **Default** | Where a customer on this plan normally sits. One per plan. |
| **Suspended** | Where a customer on this plan goes when their payment fails past the grace period. One per plan. |
| **After cancel** | Where a customer goes after cancelling. One per plan. |
| **Member** | A group that is valid for this plan but is never where an automatic move lands. Any number per plan. |

::: tip
The **Member** role is how you spread customers on the same plan across different sending
servers. Put a customer in a member group by hand and the system leaves them there, instead
of dragging them back to the default group on its next sweep.
:::

::: danger
Every plan needs at least a **Default** link. Without one, the billing system cannot work
out where an account belongs and it stops with an error rather than putting the customer
somewhere arbitrary. The **Billing health** screen tells you which plans are missing links.
:::

## Step 5: Set the account-wide user groups

Go to **Staff**, then **Billing settings**, then the **User groups** tab.

[[SCREENSHOT: The Billing settings User groups tab with the three dropdowns: new accounts, suspended and cancelled]]

| Setting | What it does |
|---|---|
| **New accounts** | The Octeth user group every new sign-up is created in, before any plan applies. |
| **Suspended** | Where a suspended customer goes when their plan has no suspended link of its own. |
| **Cancelled** | Where a cancelled customer goes when their plan has no after-cancel link of its own. Leave it empty to fall back to the free plan's group. |

::: warning
Leaving **Suspended** empty is a real configuration gap, not a default. If a plan also has no
suspended link, a customer whose payment fails cannot be suspended and keeps full access. The
**Billing health** screen reports this, so check it after you save.
:::

## Step 6: Fill in your invoice details

Go to **Staff**, then **Billing settings**, then **Invoice details**. This is the "from"
block printed at the top of every invoice PDF.

[[SCREENSHOT: The Invoice details tab showing the company, address, VAT number and registration number fields]]

Fill in your company name, address, country, VAT or tax number, registration number, phone
and billing email. Anything you leave blank falls back to your brand's legal name and support
email.

::: tip
The legal seller can differ from the product brand. If you trade as "Acme Mail" but invoice
as "Acme Communications Ltd.", put the trading name in your branding and the legal name here.
:::

## Step 7: Connect a payment gateway

This is the step that lets you actually take money. It has its own guide:
[Payment gateways](./payment-gateways).

## Step 8: Set your collections policy

Go to **Staff**, then **Billing settings**, then the **Policy** tab.

[[SCREENSHOT: The Billing settings Policy tab showing the retry schedule, grace period and safety ceiling fields]]

| Setting | Default | What it does |
|---|---|---|
| **Retry schedule** | `1,3,5` | Days after a failed payment on which the card is tried again. Must be whole days, increasing, and total no more than 90 days. |
| **Grace period** | `7` days | How long a past-due customer keeps working before being suspended. |
| **Safety ceiling** | `3` | See the note below. |

::: tip
The retry schedule is read as an escalating series of gaps. `1,3,5` means: try the next day,
then two days after that, then two days after that. A schedule such as `1,3,3` or `5,1,3` is
rejected, because it almost always means a typo.
:::

::: warning
The **safety ceiling** field is stored and audited, but on the current release it is not
applied to anything. It belonged to an earlier design where the system computed sending
limits itself. Since limits now come from the Octeth user groups you link to each plan, the
ceiling has no effect. Set the sending limits you want on the groups themselves.
:::

## Step 9: Check your work

Go to **Staff**, then **Billing**, then **Health**.

[[SCREENSHOT: The Billing health screen showing the gateway, tax, webhook, scheduled job and readiness sections]]

This screen is read-only and tells you, in one place:

- Whether a payment gateway is configured and which one is live.
- Which tax calculation is in use.
- Whether inbound payment notifications are arriving.
- Whether the scheduled billing jobs are running on time.
- Which readiness checks still fail.

::: danger
Do not take a real payment until this screen is clean. The most common thing left unfinished
is the suspended user group, which does not stop payments from working but does mean nobody
can ever be suspended for not paying.
:::

## What your customers see

Once billing is on, each customer gets a **Billing** section in their account with these
tabs:

| Tab | Contents |
|---|---|
| **Overview** | Their current plan, usage this period, credit balances and recent payments. |
| **Payment methods** | The card on file, and the form to add or replace one. |
| **Plans** | The plans they can move to, and the buttons to move. |
| **Add-ons** | Optional extras and credit packs. |
| **Invoices** | Their invoice history, each downloadable as a PDF. |
| **Invoice details** | Their own billing address and tax number, printed on their invoices. |
| **Danger** | Cancelling the subscription, with a short reason survey. |

[[SCREENSHOT: The customer Billing overview tab showing the current plan card, usage this period and recent payments]]

## Tax

::: danger
Out of the box, every invoice is calculated with zero tax. There is no tax vendor connected
and no tax rate to configure in the interface. If you are required to charge VAT, sales tax
or GST, do not use this billing system to invoice those customers until a tax calculation is
wired in. This is a genuine limitation of the current release, not a setting you have missed.
:::

The **Billing health** screen reports which tax calculation is in use, so you can confirm
this for yourself.

## Turning billing off again

Set `BRAND_FEATURE_BILLING=false` in `.oempro_env` and run `./cli/octeth.sh docker:up`. The
staff billing screens disappear, the scheduled jobs stop, no customer sees a paywall, and
nothing further is charged.

::: warning
Turning billing off does not cancel anything at the card processor. If you have live
subscriptions there, cancel them in the processor's own dashboard as well.
:::
