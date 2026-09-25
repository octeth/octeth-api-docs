# Running Billing Day to Day

Once billing is set up and a gateway is connected, most of it runs itself. This guide covers
what happens automatically, the screens you will use, and the handful of things you do by
hand.

If you have not set billing up yet, start with
[Setting up the billing system](./billing-setup).

## What happens automatically

The interface runs a small set of scheduled jobs. You do not start them: they run as soon as
billing is turned on, and they stop entirely when it is turned off.

| Job | When | What it does |
|---|---|---|
| Reconcile | Every hour | Checks that every customer is in the Octeth user group their subscription says they should be in, and moves any that have drifted. |
| Billing run | Every hour | Issues invoices for subscriptions whose period has ended, and charges them. |
| Dunning | Every hour | Chases failed payments, suspends customers past their grace period, and cancels those who never pay. |
| Reap stranded payments | Every hour | Cleans up payments that were interrupted midway, so none is left in limbo. |
| Drift report | Daily, 03:15 | Looks across every account for anything the hourly reconcile cannot see. Reports only, changes nothing. |
| Usage metering | Daily, 04:20 | Records yesterday's sending and subscriber usage for each account. |
| Revenue snapshot | Daily, 05:10 | Captures the day's revenue figures for the reporting screens. |

::: info
The billing run deliberately waits about an hour after a subscription's period closes before
invoicing it. That gives the usage metering time to write the final day of usage, so a bill
that includes usage charges is calculated against complete figures rather than a partial
day.
:::

::: tip
All of these are safe to run twice. If you ever need to run one by hand, for example after
fixing a configuration problem, nothing is double-charged.
:::

## When a payment fails

The sequence is the same every time:

1. **The charge fails.** The subscription is marked past due and the customer is emailed.
   They keep full access at this point, on purpose: someone who can still use the product is
   far more likely to go and fix their card than someone who has been cut off.
2. **The card is retried** on each day in your retry schedule, `1,3,5` by default.
3. **If every retry fails, the account is suspended.** The customer is moved to your
   suspended user group and emailed.
4. **If the grace period passes with no payment, the subscription is cancelled.** The
   customer is moved to your cancelled group and emailed.

[[SCREENSHOT: The staff Worklists screen showing the past due and dunning list with customer names, amounts and next attempt dates]]

::: tip
The customer can break this cycle themselves at any point. Their **Billing** overview has a
**Retry payment now** button that runs the same charge immediately, so they do not have to
wait for the next scheduled attempt.
:::

You can change the retry schedule and the grace period under **Staff**, **Billing settings**,
**Policy**. See [Step 8 of the setup guide](./billing-setup#step-8-set-your-collections-policy).

## The screens you will use

### Worklists

**Staff**, then **Billing**, then **Worklists**. This is the screen to open each morning. It
shows four lists:

- **Past due and dunning**, with the next retry date for each.
- **Suspended and in grace**, the accounts about to be cancelled.
- **Stuck payments**, anything that needs a human to look at it.
- **Upcoming renewals**, so a large charge is never a surprise.

### Revenue

**Staff**, then **Billing**, then **Revenue**. Monthly and annual recurring revenue, average
revenue per account, your plan mix, revenue over time, revenue at risk, outstanding credit
liability, why customers cancelled, and how your recurring revenue moved over the last 30
days.

[[SCREENSHOT: The staff Revenue dashboard showing the MRR and ARR cards, the revenue over time chart and the plan mix breakdown]]

::: info
The revenue figures are built from the daily snapshot, so a brand new install shows an empty
chart until the snapshot job has run a few times. That is expected, not a fault.
:::

### Health

**Staff**, then **Billing**, then **Health**. A read-only check of your gateway wiring, tax
setup, incoming payment notifications, scheduled job timing and outstanding readiness
problems.

::: tip
Check this screen after any change to plans, groups or gateway settings. It is the fastest
way to find a configuration gap, and it never changes anything itself.
:::

### One customer

**Staff**, then **Customers**, then pick a customer. This shows their subscription, their
invoices, their payments and their usage, and lets you download any of their invoices as a
PDF.

[[SCREENSHOT: The staff customer detail screen showing the subscription summary, invoice list and usage figures]]

## Discount codes

**Staff**, then **Billing**, then **Discounts**.

Create a code and set:

| Field | Meaning |
|---|---|
| **Code** | What the customer types. |
| **Type** | A percentage off, or a fixed amount off. |
| **Value** | The percentage or the amount. |
| **Duration** | How many billing periods it applies to. Leave it empty for forever. |
| **Maximum redemptions** | A cap on how many customers can use it. Leave it empty for no cap. |
| **Valid from and until** | An optional window, for a scheduled promotion. Leave both empty and the code always works. |

[[SCREENSHOT: The staff Discounts screen showing the code list with type, value, redemption count and status]]

You can expire a code, reactivate it, change its redemption cap, and see exactly who
redeemed it.

::: tip
Every one of these actions is recorded in the staff audit log with your name against it. That
is worth knowing before you change a live code.
:::

## Add-ons and credit packs

Alongside plans, your catalog can hold:

- **Add-ons**, which a customer keeps alongside their plan and which can have a quantity, for
  example dedicated IP addresses.
- **Credit packs**, a one-off purchase of a credit balance the customer draws down as they
  use it.

You create both on the **Catalog** screen, the same way you create a plan. Customers buy them
from the **Add-ons** tab of their own billing section.

::: warning
Add-ons and credit packs are not created by the starter catalog. If you want to sell them,
you create them yourself.
:::

## Moving an existing customer base onto billing

If you already have customers, each with their own Octeth user group, you probably want to
put them all on a single grandfathered plan without moving anyone or changing anyone's
sending limits.

There is a command for exactly this. It links every existing Octeth user group to a plan you
name, using the **Member** role, so the hourly reconcile sees each account as already in a
valid group and leaves it alone.

Preview what it would do:

```bash
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:link-groups --plan=plan.managed --dry-run'
```

Apply it:

```bash
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:link-groups --plan=plan.managed --force'
```

Use `--exclude=` with a comma-separated list of group ids to skip any group that should not
be linked, such as a shared group or your suspended group.

::: info
A dry run is the default, so the command never writes anything unless you pass `--force`.
It also never creates, changes or deletes an Octeth user group, and never moves an account.
:::

::: danger
This command does not set the plan's **Default** link, on purpose. Deciding where new
customers land is a choice you should make deliberately on the **Catalog** screen, not
something to infer from a sweep of your existing groups.
:::

## Running a job by hand

Occasionally you will want to run one of the scheduled jobs immediately, usually just after
fixing a configuration problem. Each of these is safe to run at any time:

```bash
# Put every account back in the group its subscription says it should be in
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:reconcile'

# Issue and charge any invoices that are due
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:run'

# Chase failed payments, suspend and cancel as the policy dictates
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:dunning'

# Record yesterday's usage for every account
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:meter'

# Report on accounts that have drifted, without changing anything
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:backfill --dry-run'
```

::: warning
Each of these commands does nothing at all when billing is turned off, and says so. If a
command appears to run and produce no output, check `BRAND_FEATURE_BILLING` first.
:::

## Troubleshooting

### A customer is in the wrong Octeth user group

Run the reconcile command above and check the output. If it reports an error for that
account, the usual cause is a plan with no **Default** group link. Fix it on the **Catalog**
screen and run reconcile again.

### Nobody is ever suspended for not paying

Check **Staff**, **Billing settings**, **User groups**, and confirm the **Suspended** group is
set. If it is empty and the customer's plan has no suspended link of its own, there is
nowhere to move them to. The **Billing health** screen reports this.

### The revenue charts are empty

The daily snapshot has not run enough times yet. Wait a day, or run the snapshot by hand:

```bash
docker exec oempro_ui bash -c 'cd /var/www/html/ui && php artisan billing:mrr-snapshot'
```

### Invoices show no tax

That is the current behaviour: no tax vendor is connected and every invoice is calculated
with zero tax. See the tax note in [Setting up the billing system](./billing-setup#tax).
