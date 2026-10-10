# Webhooks for Sign-Ups and Subscriptions

The new interface can tell another system when something happens to your customers: a new
user signs up, a subscription starts, changes plan, is canceled, or falls behind on payment.
You give it one URL, for example an n8n workflow, and it sends a signed JSON request to that
URL for every event you pick.

Use it to add new users to your CRM, start an onboarding sequence, post a message in Slack,
or provision something in another system, without changing Octeth itself.

::: info
This is one webhook for you, the operator of the platform. It is separate from the webhooks
your customers set up for their own lists and subscribers in the classic interface.
:::

## Before you start

- The webhook is **off by default**. Nothing is recorded or sent until you turn it on.
- The sign-up event works whether or not the [billing system](./billing-setup) is on. The
  subscription events exist only when billing is on.
- Events are sent by the interface's scheduled task, which runs every minute in the new
  interface container. No extra service is needed.

## Setting it up

1. Sign in to the staff area and choose **Webhooks** in the left menu. The page is at
   `/user/staff/webhooks` on a default install.
2. Turn on **Send webhook events**.
3. Enter the **Endpoint URL** that should receive the events.
4. Tick the **events** you want.
5. Click **Save webhook settings**. The first save creates a **signing secret**.
6. Under **Signing secret**, click **Reveal**, copy the secret and give it to your receiver
   so it can check that each request came from your platform.
7. Click **Send test event** to check the connection. The result appears straight away, and
   the request shows in **Recent deliveries**.

You can send a test event while the webhook is still off, which is a good way to check your
endpoint before any real event is sent.

### Which URLs are allowed

- `https://` to any address.
- `http://` only to an endpoint on the same server or on a private network, for example an
  n8n container next to Octeth at `http://n8n:5678/webhook/...`. Anything on the public
  internet must use `https://`.
- Link-local and cloud metadata addresses (such as `169.254.169.254`) are always refused.

The address is checked again before every request, and redirects are not followed. Point the
URL at the final address, not at one that redirects.

## The events

| Event | Sent when |
|---|---|
| `user.signed_up` | A new user completes the sign-up form |
| `subscription.activated` | A new subscription starts, or a subscription that was past due or suspended becomes active again |
| `subscription.plan_changed` | A subscription moves to another plan |
| `subscription.cancel_scheduled` | A cancellation is scheduled for the end of the billing period |
| `subscription.cancel_unscheduled` | A scheduled cancellation is undone |
| `subscription.canceled` | A subscription ends |
| `subscription.past_due` | A renewal payment fails |
| `subscription.suspended` | An account is suspended after its payment retries run out |

An ordinary renewal of an active subscription sends nothing. Add-on changes, invoices and
successful payments are not sent.

## What a request looks like

Every event is an HTTP `POST` with a JSON body and these headers:

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-Octeth-Event` | The event type, for example `user.signed_up` |
| `X-Octeth-Delivery` | The event ID, the same as `id` in the body |
| `X-Octeth-Signature` | `t=<unix time>,v1=<signature>`, see [Checking the signature](#checking-the-signature) |

The body always has the same four fields:

```json
{
  "id": "01J9Z6K3W8B4N5Q2R7T1V0X9YA",
  "type": "user.signed_up",
  "occurred_at": "2026-10-01T12:00:00Z",
  "data": { }
}
```

- `id` is unique per event. Use it to ignore an event you have already handled.
- `occurred_at` is when the event happened, in UTC.
- `data` depends on the event type, as shown below. `user_id` is the customer's user ID in
  Octeth.

### `user.signed_up`

```json
"data": {
  "user_id": 1042,
  "email": "alice@acme.com",
  "name": "Alice Anderson",
  "company": "Acme Inc",
  "signed_up_at": "2026-10-01T12:00:00Z"
}
```

::: warning
This event sends the new user's email address, name and company to your URL. Make sure the
receiving system is one you are allowed to share that data with.
:::

### `subscription.activated`

```json
"data": {
  "user_id": 1042,
  "subscription_id": 311,
  "plan": { "key": "plan.free", "name": "Free" },
  "previous_status": null
}
```

`previous_status` is `null` for a new subscription, or `past_due` or `suspended` when a
subscription recovers after a successful payment.

### `subscription.plan_changed`

```json
"data": {
  "user_id": 1042,
  "subscription_id": 311,
  "direction": "upgrade",
  "from_plan": { "key": "plan.free", "name": "Free" },
  "to_plan": { "key": "plan.growth", "name": "Growth" }
}
```

`direction` is `upgrade` or `downgrade` when the price changes, and `switch` when the
customer moves to a plan with the same price.

### `subscription.cancel_scheduled` and `subscription.cancel_unscheduled`

```json
"data": {
  "user_id": 1042,
  "subscription_id": 311,
  "cancels_at": "2026-11-01T00:00:00Z",
  "actor": "customer"
}
```

`cancel_unscheduled` has the same fields without `cancels_at`. `actor` is `customer` when
the customer did it, `staff` when someone on your team did it from the staff area, and
`system` when a scheduled job did it.

### `subscription.canceled`

```json
"data": {
  "user_id": 1042,
  "subscription_id": 311,
  "reason": "period_end"
}
```

`reason` is `immediate` (canceled straight away), `period_end` (a scheduled cancellation
took effect) or `dunning` (the account stayed suspended past the grace period).

### `subscription.past_due`

```json
"data": {
  "user_id": 1042,
  "subscription_id": 311,
  "invoice_id": 5120,
  "amount": { "amount_cents": 4900, "currency": "usd" }
}
```

`amount` is what the customer owes on the unpaid renewal invoice, after any account balance.
`invoice_id` and `amount` are `null` if no open renewal invoice was found.

### `subscription.suspended`

```json
"data": {
  "user_id": 1042,
  "subscription_id": 311
}
```

### `webhook.test`

Sent only by the **Send test event** button.

```json
"data": {
  "message": "This is a test event sent from the Webhooks settings page."
}
```

## Checking the signature

The signature proves that a request came from your platform and was not changed on the way.
To check it:

1. Read the raw request body exactly as it arrived. Do not parse and re-encode the JSON
   first, because that changes the bytes.
2. Split `X-Octeth-Signature` into `t` and `v1`.
3. Calculate an HMAC-SHA256 of `<t>.<raw body>` with your signing secret, as lowercase hex.
4. Compare it with `v1` using a constant-time comparison.
5. Optionally reject requests whose `t` is more than a few minutes old, to stop replays.

Node.js:

```js
const crypto = require('crypto');

function verify(rawBody, header, secret) {
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')));
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parts.t}.${rawBody}`)
    .digest('hex');
  return parts.v1 && expected.length === parts.v1.length
    && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}
```

PHP:

```php
function verify(string $rawBody, string $header, string $secret): bool
{
    if (!preg_match('/^t=(\d+),v1=([0-9a-f]{64})$/', $header, $m)) {
        return false;
    }
    $expected = hash_hmac('sha256', $m[1] . '.' . $rawBody, $secret);
    return hash_equals($expected, $m[2]);
}
```

## Delivery, retries and duplicates

- Events are sent within about a minute, in the background. Signing up and billing actions
  never wait for your endpoint.
- Any `2xx` response counts as delivered. Respond quickly and do the slow work afterwards:
  a request that takes longer than 5 seconds counts as a failure.
- A failed delivery is retried after 1 minute, 5 minutes, 15 minutes, 1 hour, 3 hours,
  6 hours and 12 hours. After 8 attempts (about 22 hours) the event is marked **Failed**.
- An event can arrive more than once, for example when your endpoint handled it but the
  response was lost. Use `id` to ignore repeats.
- Events can arrive out of order when an earlier one is being retried. Use `occurred_at` if
  order matters.
- While the webhook is turned off, events that were already recorded wait and are sent once
  you turn it on again.

**Recent deliveries** on the Webhooks page lists the last 50 events with their status, number
of attempts, the last response code and, for a failure, the error. Delivered events are kept
for 30 days and failed ones for 90 days.

### Rotating the secret

Click **Rotate secret** if the secret may have leaked. The new secret is used from the next
request on, so update your receiver straight away: until you do, it will reject every event,
and those events will be retried as failures.

## Example: n8n

1. In n8n, create a workflow and add a **Webhook** node.
2. Set **HTTP Method** to `POST` and choose a **Path**, for example `octeth`.
3. Copy the node's **Production URL** and paste it into **Endpoint URL** on the Octeth
   Webhooks page. Save, then activate the workflow in n8n.
4. Click **Send test event** in Octeth. The workflow's executions list shows the request,
   with the event in the body.
5. Add a **Switch** node on `{{ $json.body.type }}` to branch per event, for example
   `user.signed_up` to your CRM node and `subscription.past_due` to a Slack node.

To check the signature in n8n, turn on the Webhook node's **Raw Body** option so the
original bytes are available, and verify them in a **Code** node with the Node.js example
above. On a self-hosted n8n the Code node can use the `crypto` module only when n8n runs
with `NODE_FUNCTION_ALLOW_BUILTIN=crypto`.

## Troubleshooting

**The page warns that events are waiting to be sent.** Events are sent by the scheduled task
in the new interface container. Check that the container is running and that its cron is
working:

```bash
docker exec oempro_ui php /var/www/html/ui/artisan schedule:list
docker logs --tail 50 oempro_ui
```

**Saving says the host could not be resolved.** The server running Octeth cannot look up that
host name. Check the spelling, or, for a container on the same Docker network, use the name
that network knows it by.

**Every delivery fails with HTTP 401 or 403.** Your receiver is rejecting the request. If it
checks the signature, make sure it has the current secret and verifies the raw body.

**Deliveries fail with HTTP 301 or 302.** Your URL redirects, and redirects are not followed.
Use the final URL, for example with `https://` instead of `http://`.
