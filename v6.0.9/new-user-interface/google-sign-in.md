# Google Sign-in

Your customers can sign in to the new interface, and create an account, with their Google
account instead of a password. A **Continue with Google** button appears above the password
form on the sign-in page, and **Sign up with Google** on the sign-up page.

It is off until you turn it on. This guide shows how to create the Google OAuth client, turn
the feature on, and what your customers see.

## Prerequisites

- Shell access, so you can edit `.oempro_env`.
- `APP_URL` in `.oempro_env` set to the absolute address customers use, for example
  `https://console.example.com`. Google sign-in stays off without it.
- A Google Cloud project you can create credentials in.

## Create the Google OAuth client

1. Open the Google Cloud console and go to **APIs & Services > Credentials**.
2. If you are asked to, configure the **OAuth consent screen** first. Use your own product
   name and logo: customers see them on Google's consent screen.
3. Click **Create credentials > OAuth client ID** and choose **Web application**.
4. Under **Authorized redirect URIs**, add your `APP_URL` followed by
   `/user/auth/google/callback`. For example:

   ```text
   https://console.example.com/user/auth/google/callback
   ```

5. Click **Create** and copy the **Client ID** and **Client secret**.

## Turn it on

1. Add the three settings to `.oempro_env`:

   ```bash
   UI_GOOGLE_AUTH_ENABLED=true
   UI_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
   UI_GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. Run `./cli/octeth.sh docker:up`.
3. Open the sign-in page. The **Continue with Google** button is above the email field.

To turn it off again, set `UI_GOOGLE_AUTH_ENABLED=false` and run `./cli/octeth.sh docker:up`.
The button disappears, and existing accounts keep working with their passwords.

## What your customers see

**An existing customer** whose Google address matches their account's email address is signed
in without their password. If the account has two-factor authentication, they still enter
their code after Google, exactly as after a password.

**A new visitor** gets a new account when self-signup is on (staff **Settings > Sign-up**). The
account is active at once and no verification email is sent, because Google has already
verified the address. It gets the same user group, plan and sign-up reputation as a password
signup. When self-signup is off, the visitor is told no account uses that address and nothing
is created.

The visitor is refused, with a message on the sign-in page, when:

- Google has not verified the address of their Google account.
- Google does not manage the address: it is not a Gmail address, and the Google account is
  not part of a Google Workspace for the address's domain. A personal Google account
  registered with a company address was verified only once, when it was created, so it does
  not prove who owns that mailbox today. These customers sign in with their password.
- More than one account uses the address. They sign in with their username and password.
- The account is disabled, for example a password signup whose verification link was never
  opened.
- Their IP address is outside your user-area allow-list, or the account is locked after too
  many failed attempts.

Sign-ins through Google are marked **Google** on the customer's **Account > Active sessions**
and **Login activity** tabs. Staff sign-in is unchanged and stays password-only.

::: warning Who controls an address controls the account
Google sign-in accepts only Gmail addresses and Google Workspace accounts whose workspace
manages the address's domain. In a Google Workspace, the
workspace administrator can create any address in their own domain, so whoever runs a
domain's Google Workspace can sign in to the accounts on that domain. Two-factor
authentication still protects an account that has it turned on.
:::

## Troubleshooting

**The button does not appear.** Check that `UI_GOOGLE_AUTH_ENABLED` is `true`, that both client
values are set, and that `APP_URL` is an absolute address starting with `http://` or
`https://`. Run `./cli/octeth.sh docker:up` after any change.

**Google shows "redirect_uri_mismatch".** The redirect URI registered in the Google Cloud
console must match your `APP_URL` exactly, including `https` and any port, followed by
`/user/auth/google/callback`.

**"Google sign-in expired" after returning from Google.** The sign-in was started in another
browser or took too long. Start again from the sign-in page.
