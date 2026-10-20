# The Staff S2S Postback Screen

**S2S postback** shows the addresses an advertiser's server calls to report a conversion back to Octeth, and the names of the query parameters it sends. It replaces the classic admin **S2S Postback** page. Nothing on this screen sends a request.

| Screen | Path on a default install | Permission |
|---|---|---|
| S2S postback | `/user/staff/settings/s2s-postback` | Settings |

Open it from the staff sidebar: click **Settings**, then **S2S postback**. The classic admin **Settings > S2S Postback** link, and the old `/app/admin/s2spostback/` address, open the same screen.

## Conversion addresses

The **Conversion addresses** card shows two addresses. They are fixed for the install and built from its public address.

- **Conversion address** (`<your install>/system/s2s-postback/`): give this to the advertiser or affiliate network. Their server calls it with the parameters below when a subscriber converts.
- **ClickBank address** (`<your install>/app/public/cbs2spostback/`): for ClickBank, use this one as the instant notification URL instead.

Click the copy icon at the end of an address to copy it.

## Parameter names

The **Parameter names** card sets the names of the four query parameters the conversion address reads:

| Field | Default | What the parameter carries |
|---|---|---|
| **Track parameter** | `ocrid` | The identifier Octeth adds to every click link of an S2S campaign. It ties the conversion to the email click |
| **Conversion channel** | `channel` | Where the conversion happened, for example `web` or `app` |
| **Conversion value** | `value` | The amount of the conversion |
| **Conversion unit** | `unit` | The unit of the amount, for example `USD` |

Each name is required and is 1 to 20 letters, digits, underscores (`_`) or dashes (`-`).

To change them:

1. Edit one or more names.
2. Click **Save parameter names**.

Only the names you changed are saved, and each save is recorded in the staff audit log.

## Renaming the Track parameter

::: warning
After a rename, click links carry the identifier under the new name, and the conversion address reads it under the new name. The conversion address also keeps accepting `ocrid`, so identifiers an advertiser captured under `ocrid` keep matching. An identifier captured under any other previous name matches only if the advertiser sends it under the new name.
:::

When a save renames the Track parameter, the screen asks first. Click **Rename** to save, or **Cancel** to keep the current name.

## Demo mode

In demo mode the screen shows the default names, and saving is not available.
