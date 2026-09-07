# Connecting a Payment Gateway

Before the billing system can take money, you need to connect a card processor. Two are
supported: **accept.blue** and **Stripe**.

Everything on this page is done in the interface, on one screen. You do not put card
processor credentials into `.oempro_env`.

## Prerequisites

- Billing is turned on. See [Setting up the billing system](./billing-setup).
- You are signed in as an Octeth administrator.
- You have an account with accept.blue or Stripe, and you can reach its dashboard to copy
  keys and add a webhook.

## Understanding the two switches

This screen has two separate choices, and confusing them is the one mistake worth guarding
against.

1. **Which gateway is live.** Only one gateway processes payments at a time. You choose it
   with the **Activate** button.
2. **Which environment that gateway uses.** Each gateway holds two independent sets of
   credentials, a **sandbox** set and a **production** set. You promote one to live with the
   **Switch** action.

::: info
Opening a tab to look at your sandbox keys does not reroute anything. Looking at a
credential set and using it are deliberately different actions, so that checking your test
keys can never quietly start sending real charges to them.
:::

Both actions ask you to confirm before they take effect, because both move real money.

## Step 1: Open the screen

Go to **Staff**, then **Billing settings**, then the **Payment gateways** tab.

[[SCREENSHOT: The Payment gateways tab showing the gateway selector, the sandbox and production tabs, and the credential fields]]

## Step 2: Enter your sandbox credentials

Pick your gateway and the **sandbox** set, then fill in the fields.

### accept.blue

| Field | What it is |
|---|---|
| **API address** | Filled in for you from the environment you picked. |
| **Card form address** | The script that collects card details in the customer's browser. |
| **Source key** | Your server-side key. It needs charge, authorise, capture, refund and void permissions, and a PIN. |
| **PIN** | Paired with the source key above. |
| **Card form key** | The one key here that is meant to be public. It runs in the customer's browser. |
| **Webhook signing key** | Proves that incoming payment updates really came from accept.blue. |

### Stripe

| Field | What it is |
|---|---|
| **API address** | Filled in for you. The same address in both environments. |
| **Secret key** | Starts with `sk_`. Server-side only. |
| **Publishable key** | Starts with `pk_`. Runs in the customer's browser. |
| **Webhook signing secret** | Starts with `whsec_`. |
| **Webhook age limit** | How old an incoming update may be, in seconds. Leave it at `300` unless you have a reason. |

::: warning
The **Secret key**, the **PIN**, the **Source key** and the webhook signing values are
secrets. Once saved, they are never shown again: the screen displays only a masked hint such
as `••1234` so you can tell which key is stored. To change one, type the new value in and
save. To remove one, use the clear action next to it. Leaving a secret field blank on save
keeps the stored value.
:::

## Step 3: Test the connection

Press **Test connection**. This makes one harmless read-only call to the processor and tells
you whether the credentials work.

[[SCREENSHOT: The Payment gateways tab after a successful connection test, showing the confirmation message]]

::: tip
Do this before activating anything. A test that fails here would otherwise fail on a real
customer's card at the worst possible moment.
:::

::: info
If you changed the **API address** or **Card form address** on screen without saving first,
the test refuses to run against a stored secret. Save, then test. This is a safety measure,
not a bug.
:::

## Step 4: Add the webhook in your processor's dashboard

Your card processor needs to notify Octeth when a payment succeeds, fails or is disputed.
Add a webhook endpoint in the processor's own dashboard pointing at:

| Gateway | Webhook address |
|---|---|
| accept.blue | `https://your-octeth-domain/ui/webhooks/acceptblue` |
| Stripe | `https://your-octeth-domain/ui/webhooks/stripe` |

Copy the signing secret the processor gives you back into the **Webhook signing key** or
**Webhook signing secret** field on the gateways screen, and save.

::: warning
The `/ui/` part of that address is required. It is the path the reverse proxy forwards to the
new interface. A webhook pointed at `/webhooks/stripe` reaches the classic application
instead and the notifications are silently discarded.
:::

::: tip
Each gateway has its own webhook address and its own signing key, checked independently. So
if you switch from one gateway to the other, a notification that was already on its way from
the old one still verifies correctly instead of being rejected as a forgery.
:::

## Step 5: Make it live

When the sandbox set works end to end:

1. Fill in the **production** credential set the same way, and test it.
2. Use **Switch** to promote that gateway from sandbox to production.
3. Use **Activate** to make that gateway the one that processes payments.

Both actions ask for confirmation first.

[[SCREENSHOT: The confirmation dialog shown before switching a gateway to production]]

::: danger
For accept.blue, the production **Card form address** is deliberately left blank and you must
supply the real one from accept.blue. It is not guessable, and it is loaded into your
customer's browser, so a wrong value breaks card capture without any visible error. Production
cannot be activated until you have filled it in.
:::

## Where the addresses may point

The two address fields will only accept known hosts. This is a security measure: those
fields decide where your stored secrets get sent, so a staff account with browser access to
this page must not be able to redirect them to a server of its own.

| Gateway | Field | Permitted hosts |
|---|---|---|
| accept.blue | API address | `api.accept.blue`, `api.sandbox.accept.blue` |
| accept.blue | Card form address | `tokenization.accept.blue`, `tokenization.sandbox.accept.blue` |
| Stripe | API address | `api.stripe.com` |

::: info
On an Octeth install this list is fixed and cannot be extended, so you cannot put your own
proxy in front of a payment processor.
:::

## Confirming it works

Go to **Staff**, then **Billing**, then **Health**. The gateway section should show your
chosen gateway, its environment, and that its credentials are complete. The webhook section
should show recent deliveries once your processor has sent any.

[[SCREENSHOT: The Billing health screen gateway and webhook sections showing a configured, live gateway]]

## Troubleshooting

### The connection test fails

1. Check you are looking at the credential set you actually filled in, sandbox or production.
2. Re-copy the keys from the processor's dashboard. A trailing space is a common cause.
3. For accept.blue, confirm the source key has charge, authorise, capture, refund and void
   permissions. A key missing one of these can pass a basic check and then fail on a real
   charge.

### Payments succeed but nothing updates in Octeth

This is almost always the webhook.

1. Check the address in your processor's dashboard includes `/ui/`.
2. Check the signing secret saved on the gateways screen matches the one the processor
   shows.
3. Check the **Billing health** screen's webhook section for recent deliveries.

### A customer cannot add a card

Check the **Card form address** and **Card form key** for the environment that is live. These
two are the pieces that run in the customer's browser, so an error here shows up as a card
form that never appears while everything on the server looks healthy.
