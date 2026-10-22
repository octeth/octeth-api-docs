# Branding the New User Interface from the Staff Area

The **Branding** screen of the staff **Settings** group changes how the new interface presents itself: its name, logos, browser tab icon, colours, support and legal links, the sender name and footer of the emails it sends, and which sections customers see. A value saved here applies on the next page load, with no file to edit and no restart.

| Screen | Path on a default install | Permission |
|---|---|---|
| Branding | `/user/staff/settings/branding` | Administrators with full access only |

Open it from the staff sidebar: click **Settings**, then **Branding**. Only an administrator with full access sees the menu item. A [sub-admin](./staff-sub-admins) never sees it, and one who opens the address gets a "forbidden" page, whatever permissions they hold.

## Where the values come from

Every value on the screen starts as the one in `.oempro_env` (the `UI_BRAND_*` settings, see [Branding the New User Interface](./branding)). A value you save here wins over `.oempro_env` until you reset it.

Each field shows where its value comes from:

- **Set here**: saved on this screen. It wins over `.oempro_env`, and the help line under the field shows the configured value a reset brings back.
- **.oempro_env**: the value in `.oempro_env`.
- **Default**: nothing is configured, so the built-in value applies. For the email sender name this means the brand name.

To go back to the configured value, click **Reset** beside the field. The reset applies at once. Editing a `UI_BRAND_*` setting in `.oempro_env` has no visible effect on a field that shows **Set here** until you reset it.

## Identity

- **Name**: shown in page titles, the sidebar, emails and the signed-out pages. Required.
- **Legal name**: the copyright line on signed-out pages and the seller on invoices. Empty uses the name.
- **Tagline**: one line on the brand panel of the sign-in and sign-up pages. Empty hides it.
- **Trust stats**: figures at the foot of the sign-in brand panel, written as `value|label;value|label`, for example `99.9%|Uptime;24/7|Support`. Empty hides them.

## Logos

- **Horizontal logo**: the wordmark on the white signed-out pages. Use dark ink.
- **Logo mark**: the square mark at the top of the dark sidebar. Use light ink. Its preview sits on your primary colour.
- **Favicon**: the browser tab icon.

Click **Upload** (or **Replace**) and choose a file. The preview shows the new file straight away, and it takes effect when you click **Save branding**. Until then the interface keeps the current file. Click **Discard new file** to drop a file you chose but do not want.

A chosen file that is never saved is kept for at least a day, then removed. If it is gone when you click **Save branding**, for example because the form stayed open longer than that, the field says the file is no longer stored and nothing is saved: upload it again, then save. Saving a logo on one open copy of the screen leaves a file chosen on another copy alone, unless that file is over a day old.

The rules for a file:

- Logos: PNG, JPG, WebP or SVG. Favicon: PNG, ICO or SVG.
- 1 MB at most.
- A PNG, JPG or WebP image must be between 16 and 4096 pixels on each side.
- A PNG or ICO favicon must be square.
- An SVG file is cleaned before it is stored: scripts, embedded HTML, event handlers and links to anything outside the file are removed. An SVG that cannot be read safely, for example one that declares entities, is refused. If a logo loses something it needs, export it again as plain SVG or upload a PNG.

Uploaded files are stored in `ui/storage/app/public/branding/`, which upgrades keep, and are served at `/ui/brand-assets/`. Each new file gets its own address, so browsers never show an old logo. A replaced file is deleted when the new one is saved, and **Reset** deletes the uploaded file and brings back the configured one.

## Colours

The **primary** colour paints the sidebar and the signed-out brand panel. The **accent** colour paints buttons, links and highlights. Each has shades and a "text on" colour for the text and icons drawn on top of it. Pick a colour with the swatch or type it as `#RRGGBB`.

The **Preview** beside the colours shows a sidebar item, a primary button and a link with the colours as you set them, before you save. When the text on the primary or the accent colour has a contrast below 4.5:1, the level WCAG asks for normal text, a warning appears under the preview. You can still save, but the text may be hard to read.

If a colour makes the interface hard to use, click **Reset** beside it. An administrator with server access can also remove the saved value from the `brand_overrides` table of the interface database, which brings back the `.oempro_env` value.

## Links

- **Support email**: where **Contact support** writes to when no support URL is set. Also shown after sign-up and on invoices unless the invoice details set another address.
- **Support URL**: a help desk or contact page. It wins over the support email.
- **Terms of service**, **Privacy policy**, **Acceptable use policy** and **Status page**: linked from the footer of the signed-out pages and, for the first three, from the sign-up consent sentence.

Enter a full address starting with `https://` or `http://`. An empty field hides its link.

## Email

The interface sends a few emails itself: welcome, password reset and billing notices. Campaign emails keep their own sender.

- **Sender name**: the From name of those emails. Empty uses the brand name, so changing the **Name** above also changes the sender name unless you set one here.
- **Footer note**: one line after the copyright at the bottom of those emails.

The sender address stays the `UI_MAIL_FROM_ADDRESS` setting in `.oempro_env`.

## Features

One switch per customer section: **Dashboard**, **Campaigns**, **Journeys**, **Transactional**, **SMS**, **Lists**, **Suppressions**, **Templates**, **Header & footer**, **Analytics**, **Deliverability**, **Senders & domains**, **API** and **Account webhooks**. A section switched off leaves the customer sidebar and its pages answer "not found". Staff pages are not affected.

Each switch starts as its `BRAND_FEATURE_*` setting in `.oempro_env`, or the default for the product mode (see [Product mode and sections](./configuration-reference#product-mode-and-sections)), and shows **Configured**. A switch you save shows **Set here** and the configured value under it, and **Reset** brings that value back. Setting a switch back to its configured value removes the saved value, so it follows `.oempro_env` again.

Click **Save features** to apply the changes. The save is refused, with a message on the switch, when:

- **Campaigns** or **Journeys** is on while **Lists** is off. Both need lists.
- Every section would be off, which leaves customers no page to land on.

Turning **Senders & domains** off stops customers setting up their own sending domains, so set them up from the staff area instead.

## Set in .oempro_env only

The last card lists the URL slugs (`UI_BRAND_SLUG_*`) and the billing switch (`BRAND_FEATURE_BILLING`) for reference. The slugs change the interface's routes, which are cached when the container starts, and the billing switch is read when the container starts, so they cannot be changed here: set them in `.oempro_env` and restart the interface container.

## Save

Click **Save branding** at the foot of the page. Only the fields you changed are saved, so a field you did not touch keeps its **.oempro_env** or **Default** label and keeps following `.oempro_env`. A value that differs only by surrounding spaces, or a colour that differs only by letter case (`#abcdef` and `#ABCDEF`), counts as no change. Reload any other open page to see the change there.

## What is recorded

Every save, reset and logo change writes a staff audit row naming the settings it changed, with the old and new value of each text field, colour and feature switch, and the old and new file name of each logo.

## Demo mode

With demo mode on, the screen is read-only.

## Related

- [Branding the New User Interface](./branding)
- [The new user interface](./index)
- [Octeth configuration](/v6.0.3/getting-started/octeth-configuration)
