# Branding the New User Interface

The new interface is designed to be whitelabelled. You can replace its name, its logos, its
browser tab icon, its colours and its legal links so that nothing on screen names Octeth.
This guide walks through each of those, in the order you will want to do them.

Every setting on this page lives in `.oempro_env`, the single configuration file you
already use for the rest of Octeth. You do not edit any file inside the interface itself.

::: danger
Never hand-edit `ui/.env`. That file is rewritten from `.oempro_env` every time the
container starts, so any change you make there is lost on the next restart, usually without
you noticing.
:::

## Prerequisites

- The new interface is turned on. See [The New User Interface](./).
- Shell access, so you can edit `.oempro_env`.
- Your logo files, ideally as SVG.

## Applying a change

Every change on this page follows the same three steps:

1. Edit `.oempro_env`.
2. Run `./cli/octeth.sh docker:up`.
3. Reload the page in your browser.

::: tip
Branding changes only affect the interface container, so restarting that one container is
enough and is faster:

```bash
docker compose -f docker-compose.yml --env-file .oempro_env restart oempro_ui
```

Use the full `docker:up` command whenever you are unsure, because it is always correct.
:::

## Step 1: Set your name

```ini
UI_BRAND_NAME="Acme Mail"
UI_BRAND_LEGAL_NAME="Acme Communications Ltd."
```

Quote any value that contains a space or a `#`. `.oempro_env` is read by more than one
parser, and an unquoted space stops Octeth reading the file **at all**: every setting then
falls back to its built-in default, so `MYSQL_HOST` becomes `localhost` and `ADMIN_API_KEY`
becomes empty. An unquoted `#` starts a comment, which silently cuts the value short.

Use one pair of quotes, not two. If you nested quotes on an earlier version to work around a
brand value that stopped the interface starting, undo that now: from v6.0.0 the inner double
quotes are kept as part of the text your customers see.

`UI_BRAND_NAME` is the name shown in the browser tab, on sign-in pages and as the sender
name on the interface's own emails. `UI_BRAND_LEGAL_NAME` is the company name used where a
legal entity is appropriate, such as on an invoice. Leave the legal name empty and your
brand name is used for both.

[[SCREENSHOT: The sign-in page with a custom brand name in the browser tab and on the page]]

## Step 2: Replace the logos and the tab icon

Four image files ship with the interface, under `ui/public/ui/images/brand/`: a square mark
and a horizontal wordmark, each in a white ink version and a black ink version.

- The **mark** appears in the sidebar, which has a near black background, so the white ink
  version is used by default.
- The **wordmark** appears on signed-out pages, which have a white background, so the black
  ink version is used by default.

To use your own, copy your files into `ui/public/ui/images/brand/` and point the settings at
them:

```ini
UI_BRAND_LOGO_MARK=/ui/images/brand/acme-mark.svg
UI_BRAND_LOGO_HORIZONTAL=/ui/images/brand/acme-wordmark.svg
UI_BRAND_FAVICON=/ui/acme-favicon.ico
```

::: danger
Every one of these paths must begin with `/ui/`. The reverse proxy only forwards a fixed set
of paths to the interface, and `/ui/` is the one that carries its files. A logo placed at
`/images/acme-mark.svg` is handed to the classic application instead and the browser shows a
broken image. This applies to the tab icon too: a file at `/favicon.ico` is answered by the
classic application, so the tab icon must also sit under `/ui/`.
:::

::: tip
Check your work by opening the image URL directly in a browser, for example
`https://your-domain/ui/images/brand/acme-mark.svg`. If it downloads or displays, the path
is right. If you get a "not found" page, the path is wrong.
:::

## Step 3: Set your colours

Two colours do most of the work:

- **Primary** is the sidebar background and the body text colour.
- **Accent** is buttons, links, active navigation items and focus rings.

```ini
UI_BRAND_PRIMARY="#0F172A"
UI_BRAND_ACCENT="#2563EB"
UI_BRAND_ACCENT_HOVER="#1D4ED8"
```

::: danger
Always put the colour values in quotes. The configuration file treats an unquoted `#` as the
start of a comment, so `UI_BRAND_PRIMARY=#0F172A` is read as an empty value on one side of
the system and as the colour on the other. The two then disagree, with nothing on screen to
tell you why. Quoted, both read it correctly.
:::

The remaining shades only need setting if you want them to differ from the defaults:

| Setting | Used for | Default |
|---|---|---|
| `UI_BRAND_PRIMARY` | Sidebar background, body text | `#0A0A0A` |
| `UI_BRAND_PRIMARY_900` | The darkest primary shade | `#000000` |
| `UI_BRAND_PRIMARY_700` | A lighter primary shade | `#262626` |
| `UI_BRAND_ACCENT` | Buttons, links, active navigation | `#0A0A0A` |
| `UI_BRAND_ACCENT_HOVER` | Those same elements on hover | `#262626` |
| `UI_BRAND_ACCENT_LIGHT` | Tinted backgrounds behind accent content | `#F4F4F5` |
| `UI_BRAND_ACCENT_600` | A darker accent shade | `#000000` |
| `UI_BRAND_ACCENT_700` | The darkest accent shade | `#000000` |
| `UI_BRAND_ACCENT_100` | Borders and dividers in accent areas | `#E4E4E7` |
| `UI_BRAND_ACCENT_050` | The faintest accent tint | `#FAFAFA` |

Each value must be a hex colour of 3, 6 or 8 digits, including the `#`. Anything else is
ignored and the built-in colour is used instead, so a typo shows up as a colour that did not
change rather than as a broken page.

[[SCREENSHOT: The dashboard rendered with a custom accent colour, showing the sidebar, a primary button and an active navigation item]]

::: warning
Two surfaces stay white whatever accent you choose. The sidebar and the signed-out brand
panel both have dark backgrounds, so they render their active states and highlights in white
rather than in your accent colour. If you set a bright accent, those two places will not
match it. This is deliberate: an accent colour that happens to be dark would be invisible
against a dark background.
:::

::: info
Three things deliberately keep their own colours and do not follow your palette:

- **Charts and graphs** use several colours to tell one line or bar from another. Forcing
  them all to your brand colour would make the series impossible to tell apart.
- **The interface's own emails and the invoice PDF** carry fixed colours, because email
  clients cannot read the mechanism that applies your palette to a web page.
- **The sample email bodies** shown in preview panes are stand-in content representing a
  customer's message, not your product's own styling.
:::

## Step 4: Set your support and legal links

```ini
UI_BRAND_SUPPORT_EMAIL=support@acmemail.com
UI_BRAND_TERMS_URL=https://acmemail.com/terms
UI_BRAND_PRIVACY_URL=https://acmemail.com/privacy
```

::: tip
Leaving one of these empty is a valid choice, not an oversight. The interface hides a link
whose address is empty rather than pointing it somewhere wrong. If you have no published
privacy policy yet, leave `UI_BRAND_PRIVACY_URL` empty and no privacy link is shown.
:::

## Step 5: Brand the interface's own emails

The interface sends its own transactional messages, such as password resets and account
notices. These are separate from your customers' campaigns, which continue to go through
Octeth's sending engine as always.

```ini
UI_MAIL_FROM_ADDRESS=no-reply@acmemail.com
UI_BRAND_MAIL_FOOTER="Sent from app.acmemail.com."
```

The sender name on these emails is your `UI_BRAND_NAME`, so there is no separate setting for
it.

::: warning
By default these emails are written to a log file rather than sent. See
[Outbound email](./configuration-reference#outbound-email-from-the-interface) in the
configuration reference for how to point them at a real mail server.
:::

## What your customers can brand themselves

Separate from the branding above, each of your customers can set a header and a footer that
wraps every email they send. They do this in the interface under **Email header & footer**.

[[SCREENSHOT: The Email header and footer screen showing the HTML tab, the header editor, and the live preview panel]]

The editor offers an HTML version and a plain text version, each with its own header and
footer, and a live preview with a desktop and a mobile view. These values are stored in the
customer's Octeth account, so they apply to campaigns sent from the classic interface too.

## Checking your work before you go live

Walk through this list on a fresh browser, ideally in a private window so nothing is cached:

1. The browser tab shows your name and your icon.
2. The sign-in page shows your wordmark, not a broken image.
3. After signing in, the sidebar shows your mark, not a broken image.
4. A primary button is your accent colour.
5. The footer links go to your terms and privacy pages, or are absent if you left them
   empty.
6. Nothing on any screen names Octeth.

::: tip
Point 6 is the one worth being thorough about. Check the sign-in page, the sign-up page,
the dashboard, one campaign report, and one of the interface's own emails.
:::

## What cannot be branded yet

Be aware of the current limits before you promise something to a customer.

- **The URL segments are fixed.** Paths such as `/user/campaigns` and `/user/journeys`
  cannot be renamed to your own vocabulary on an Octeth install.
- **The wording is fixed.** You cannot rename "Campaigns" to "Broadcasts" across the
  interface.
- **Individual product areas cannot be hidden.** You can turn the billing system on and off,
  but not journeys, transactional email or SMS individually. Octeth's own permission system
  has no matching setting for those, so what a customer sees is decided by their Octeth user
  group, not by the interface.
- **The tagline and the testimonial quotes on the sign-in page are empty and stay empty.**
  The block is hidden entirely rather than showing quotes your install cannot stand behind.

::: warning
The interface's own configuration files contain settings for some of the items above. Do not
edit them. Those files are replaced wholesale when you upgrade Octeth, so any change is
silently undone at the worst possible moment. Only settings in `.oempro_env` survive an
upgrade.
:::
