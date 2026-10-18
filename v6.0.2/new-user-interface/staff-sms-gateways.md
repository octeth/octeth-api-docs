# Managing SMS Gateways in the Staff Area

An **SMS gateway** connects Octeth to one account at an SMS provider, such as Xeebi or Infobip. Campaigns and journeys send text messages through it, and the provider posts delivery reports and replies back to it. The **SMS gateways** screens of the staff **Settings** group replace the classic admin **Settings > SMS Gateways** section.

| Screen | Path on a default install | Permission |
|---|---|---|
| SMS gateways | `/user/staff/settings/sms-gateways` | DeliveryServers |
| Create SMS gateway | `/user/staff/settings/sms-gateways/new` | DeliveryServers |
| Edit SMS gateway | `/user/staff/settings/sms-gateways/<id>/edit` | DeliveryServers |

Open it from the staff sidebar: click **Settings**, then **SMS gateways**. The classic admin **Settings > SMS Gateways** link, and the old `/app/admin/smsgateways/` addresses, open the same screens.

## The list

The list shows every gateway by name:

- **Name**, with the gateway's ID under it.
- **Provider**: the connector the gateway uses.
- **Status**: **Active** gateways send, **Inactive** ones send nothing and accounts cannot choose them.
- **Available to**: **Every account** for a global gateway, otherwise the number of assigned accounts.
- **Sender**: the default sender, or the first sender number, and how many more there are.
- **Updated**: when the gateway was last changed.

Click a row to open the gateway.

## Delete a gateway

Tick the rows, click **Delete**, or click the bin on one row. Before anything is deleted, the dialog lists what still uses each gateway:

- the SMS campaigns that are scheduled, queueing, sending or paused on it, which will have nothing to send through;
- the journeys with a **Send SMS** step on it, which will skip every contact;
- who can send through it, and the account its inbound replies are credited to.

You can still go ahead. A deleted gateway cannot be restored. A sub-administrator limited to some user groups sees only the campaigns and journeys of accounts in those groups, and the dialog says how many more there are.

## Create a gateway

Click **Create SMS gateway** and fill in four cards:

1. **Gateway**: a name, the provider, the status, and **Available to every account (global)**. The provider cannot be changed later.
2. **Provider settings**: the fields the provider needs, such as its API key. They appear once a provider is chosen. Click **Test connection** to check the credentials with the provider before you save. Nothing is sent, and you can test 5 times an hour.
3. **SMS settings**:
   - **Sender numbers**: one per line, with the country code, for example `+12025550100`.
   - **Default sender**: one of the sender numbers, used when a message sets none.
   - **Message parts**: the most parts a long message is split into, from 1 to 10. The default is 3.
   - **Short link domains**: optional hostnames such as `go.example.com` for tracked links. Point each at your Octeth host with a CNAME record.
   - **Allowed countries**: optional 2-letter country codes. Leave it empty to allow every country.
4. **Accounts**: for a gateway that is not global, search for accounts by name, username or email and tick them. At least one is needed.

Click **Create SMS gateway**. The new gateway opens on its **Webhooks** tab, where the callback URLs to give the provider are.

## Edit a gateway

The edit page has five tabs. Each tab saves only its own fields.

| Tab | What you change |
|---|---|
| **Basic** | The name, the status and global. Setting an active gateway **Inactive** first lists what uses it, as a delete does |
| **Provider settings** | The provider's fields. A stored key shows **A key is stored**: leave the field empty to keep it, or type a new key to replace it. **Test connection** checks the values in the form, saved or not |
| **SMS settings** | Sender numbers, default sender, message parts, short link domains and allowed countries |
| **Accounts** | The accounts that can send through the gateway. Shown for a gateway that is not global |
| **Webhooks** | The callback URLs, the webhook secret and the delivery report rule |

::: tip Inbound replies follow the assignment
A reply that matches no contact is credited to an account only while the gateway has exactly one assigned account. Adding a second account, or making the gateway global, moves those replies to the staff [Inbound SMS](./staff-sms-inbound) screen only.
:::

## Webhooks

Give the provider two URLs: the **Delivery report URL** and the **Inbound message URL**. Both carry the gateway's webhook secret, so they are masked. Click **Reveal** to see and copy them; they are hidden again when you leave the page or change anything on it. Every reveal is recorded in the staff audit log.

- **Rotate secret** replaces the secret after a confirmation. Both URLs change at once, and the provider is refused until you give it the new ones, which are shown once after the rotation.
- **Require the secret on delivery reports**: when this is off, delivery reports are also accepted on the older URL without the secret, so providers set up before webhook secrets existed keep working. Turn it on once the provider uses the URLs above. Inbound messages always require the secret.
- When other gateways use the same provider account, the tab lists them. The provider sends every callback for the account to one set of URLs, so enter the URLs of any one of them.
