# Routing Email by Recipient Mail Server

A **delivery route** sends campaign email through a chosen delivery server when the recipient's mail server matches it. Use routes to send to one mail provider, such as Gmail or Microsoft, through a server set up for it. The **Delivery routes** screen of the staff **Delivery** group replaces the classic admin **Settings > Delivery Routes** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Delivery routes | `/user/staff/settings/delivery-routes` | Settings and DeliveryServers |

Open it from the staff sidebar: click **Delivery**, then **Delivery routes**. The classic admin **Settings > Delivery Routes** link, and the old `/app/admin/deliveryroutes/` address, open the same screen.

## How routing works

When Octeth sends a campaign, it looks up the MX hosts of each recipient's domain, in priority order, and compares each host with the routes from the top of the list. The first route that matches decides the delivery server, in place of the marketing server of the sender's user group. When no route matches, the user group's server is used, as without routes.

A route matches the **MX host**, not the email domain. Email to `@gmail.com` is delivered to `gmail-smtp-in.l.google.com`, so a route for `gmail.com` never matches it. To find a domain's MX hosts, run `dig MX example.com` or use an online MX lookup.

Each route is one of:

- **An MX host name**, matched exactly, for example `gmail-smtp-in.l.google.com`.
- **A PCRE pattern with delimiters**, for example `/\.google\.com$/i` for every Google MX host or `/\.protection\.outlook\.com$/i` for Microsoft 365. The screen refuses a pattern that starts like an expression but does not compile, and a pattern with spaces.

Routes apply to campaign sending.

## Add a route

1. Click **Add route**.
2. Enter the **MX host or pattern**.
3. Choose the **Delivery server**. The list shows each server's name and SMTP host.
4. Click **Add route**.

The route is added at the end of the list, so a route above it that also matches still wins. Each pattern can appear once.

## Change the order, edit or remove

Open the row menu of a route:

- **Move up** and **Move down** change which route is tried first.
- **Edit** changes the pattern or the delivery server.
- **Remove** deletes the route after you confirm. Recipients it matched go back to the user group's server, unless a later route matches.

Every change is saved at once and applies to the next campaign batch. Each one is written to the staff audit log. If another administrator changed the routes since you opened the screen, your change is applied to the current list and theirs is kept.

## Routes on a deleted server

A route whose delivery server was deleted shows **Deleted** next to the server ID, and its email goes to the user group's server. Octeth refuses any change to the list while it holds a route to a server that does not exist, so the screen shows a warning with **Remove these routes**, which removes every such route in one save and keeps the order of the others. Add the routes again with another server afterwards.

The delete confirmation of the [Delivery servers](./staff-delivery-servers) screen lists the routes that still send through a server.

## Permissions and demo mode

The screen needs both the **Settings** permission (to read and save routes) and the **Delivery servers** permission (to name the servers). An administrator with only one of them does not see the menu item. In demo mode the routes are shown read-only.

## API

The screen uses [`deliveryroutes.get`](../api-reference/settings#get-delivery-routes) and [`deliveryroutes.update`](../api-reference/settings#update-delivery-routes), which need the `Settings` privilege.
