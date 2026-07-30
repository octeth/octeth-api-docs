---
layout: doc
---

# Single Sign-On (SSO) Integration

Single Sign-On (SSO) allows your external systems — such as websites, e-commerce platforms, membership portals, or custom applications — to automatically log users into Octeth without requiring them to enter separate credentials. When a user logs into your external system, your application generates a secure encrypted token containing the user's information, then redirects the user to Octeth. Octeth decrypts the token, verifies the user, and either logs them in automatically or returns their account data as a JSON response.

This article covers how SSO works in Octeth, how to create and configure SSO sources, how to build encrypted tokens in your external application, and how to monitor SSO activity.

## How SSO Works

The SSO process involves three actors: your **external system** (the application your users log into), **Octeth** (the email marketing platform), and the **end user** (the person being authenticated).

Here is the step-by-step flow:

1. **Administrator setup** — An Octeth administrator creates an SSO source. Octeth generates two cryptographic keys: an **Encryption Key** (Key1) for encrypting the token data and a **Signing Key** (Key2) for verifying that the token has not been tampered with.

2. **Key sharing** — The administrator copies the two keys from Octeth and adds them to the external system's configuration. These keys are shared secrets between Octeth and the external system.

3. **User logs in** — A user logs into the external system (for example, a membership website or an e-commerce store).

4. **Token generation** — The external system builds a data payload containing the user's information (name, email, username, password, and a timestamp). It encrypts this payload using the Encryption Key, signs it using the Signing Key, and produces a single encoded token string.

5. **Redirect** — The external system redirects the user's browser to Octeth's SSO endpoint, passing the token and the SSO source code as URL parameters.

6. **Validation** — Octeth receives the request, looks up the SSO source by its code, verifies the token signature, decrypts the payload, and checks that the token has not expired.

7. **Authentication** — Octeth finds or creates the user account and either logs the user in automatically (redirecting them to the Octeth dashboard) or returns the user's account data as a JSON response, depending on the SSO source configuration.

::: info
SSO in Octeth is a one-way process. The external system sends users to Octeth — not the other way around. Your external system is responsible for authenticating the user first and then passing verified information to Octeth.
:::

## Common Use Cases

SSO integration is useful in several scenarios:

- **SaaS platforms** — If you offer email marketing as part of a larger SaaS product, SSO lets your customers access Octeth directly from your platform without managing a separate login. Your application authenticates users and passes them through to Octeth seamlessly.

- **E-commerce stores** — Online stores using platforms like WooCommerce or Magento can link customer accounts to Octeth user accounts. When a store owner logs into the admin panel, they are automatically signed into Octeth to manage their email campaigns.

- **Membership and community portals** — Membership sites can give their members direct access to Octeth for managing newsletters or email lists, without requiring members to remember a separate set of credentials.

- **Client management dashboards** — Agencies that manage email marketing for multiple clients can build a custom dashboard where each client logs in once and gets redirected into their own Octeth user account.

- **Enterprise intranets** — Organizations with internal portals can integrate Octeth so that employees access the email marketing tools using their existing intranet credentials.

- **Automated user provisioning** — When combined with the **Create new user if not exists** option, SSO can automatically create Octeth accounts for new users the first time they access the platform through your external system, eliminating manual account setup.

## Prerequisites

Before setting up SSO, make sure you have:

- **Administrator access** to your Octeth installation.
- **A development team or developer** who can modify your external system to generate encrypted tokens and redirect users to Octeth. The token generation requires programming knowledge (examples are provided in PHP).
- **HTTPS** on both your external system and your Octeth installation (strongly recommended for production environments to protect the token during transit).

## Creating an SSO Source

An SSO source represents a connection between Octeth and one external system. Each SSO source has its own unique identifier, its own pair of cryptographic keys, and its own configuration options. You can create multiple SSO sources if you need to connect Octeth to several external systems.

### Step 1: Open the SSO Settings

1. Log in to Octeth as an administrator.
2. Navigate to **Settings** in the top menu.
3. Click the **SSO** tab.

You will see a list of existing SSO sources (if any have been created). From here you can create new sources, edit existing ones, or delete sources you no longer need.

[[SCREENSHOT: The admin SSO settings page showing the list of SSO sources with the Create New SSO Source link highlighted]]

### Step 2: Create a New Source

1. Click **Create New SSO Source**.
2. Fill in the following fields:

| Field | Required | Description |
|---|---|---|
| **Source Name** | Yes | A display name to help you identify this SSO source. For example, `My Website` or `WooCommerce Store`. |
| **Source Code** | Yes | A unique identifier used in the SSO URL. Only letters (A-Z), numbers (0-9), dashes (`-`), and underscores (`_`) are allowed. No spaces. For example, `my-website` or `woocommerce_store`. |
| **Description** | No | An optional description for your own reference. |
| **Expires At** | No | An optional expiration date for the entire SSO source. After this date, the source stops accepting SSO requests. Use the format `YYYY-MM-DD HH:MM:SS` (for example, `2027-12-31 23:59:59`). Leave blank for no expiration. |
| **Valid For Seconds** | Yes | How long each token remains valid, in seconds. The default value is `5` seconds, which means a token must be used within 5 seconds of being generated. |

[[SCREENSHOT: The Create New SSO Source form showing the Source Name, Source Code, Description, Expires At, and Valid For Seconds fields]]

3. Configure the behavior options:

| Option | Default | Description |
|---|---|---|
| **Create new user if not exists** | Enabled | When enabled, Octeth automatically creates a new user account if the user from the token does not already exist. When disabled, SSO only works for users who already have an Octeth account. |
| **Perform login** | Enabled | When enabled, Octeth logs the user in and redirects them to the user dashboard. This is the typical SSO behavior. |
| **Return user data** | Disabled | When enabled, Octeth returns the user's account information as a JSON response instead of redirecting them. This is useful when your external system needs to retrieve account data programmatically. |

::: tip
For a typical SSO setup where users click a link and land inside Octeth, keep **Perform login** enabled and **Return user data** disabled. If you need to verify a user's identity from a backend service without redirecting them, enable **Return user data** instead.
:::

::: warning
If both **Perform login** and **Return user data** are enabled, Octeth performs the login and redirect. The **Perform login** option takes priority.
:::

4. Click **Create** to save the SSO source.

After creation, Octeth generates the two cryptographic keys for this source. You can view them on the **Access Credentials** tab of the SSO source.

## Retrieving the Access Credentials

After creating an SSO source, you need to retrieve the two cryptographic keys that your external system will use to encrypt and sign tokens.

1. Navigate to **Settings** > **SSO**.
2. Click on the SSO source name to open it.
3. Click the **Access Credentials** tab.

You will see two fields:

| Key | Purpose |
|---|---|
| **Key1 (Encryption Key)** | A Base64-encoded 32-byte key used to encrypt the token data with AES-256-CBC. |
| **Key2 (Signing Key)** | A Base64-encoded 64-byte key used to sign the token with HMAC-SHA256, preventing tampering. |

[[SCREENSHOT: The Access Credentials tab showing the Key1 and Key2 fields with copy-on-click functionality, and the example PHP code below]]

Click on either key field to select its value for copying. Provide both keys to the developer who will integrate SSO into your external system.

::: danger
Treat these keys as sensitive credentials. Anyone who has both keys can generate valid SSO tokens and authenticate as any user. Do not share them publicly, commit them to public code repositories, or transmit them over unencrypted channels.
:::

The Access Credentials tab also displays a ready-to-use PHP code example that your developer can use as a starting point for the integration. This code example is pre-filled with the actual keys and SSO endpoint URL for your installation.

## Building the SSO Token

This section explains how your external system generates the encrypted token that Octeth uses to authenticate users. The process involves building a data payload, encrypting it, signing it, and encoding the result.

### Token Data Fields

The token payload is a JSON object containing user information. Some fields are required and some are optional.

**Required fields:**

| Field | Type | Description |
|---|---|---|
| `id` | String | A unique identifier for this user in your external system. Octeth stores this value as the user's SSO ID and uses it to match returning users. |
| `firstname` | String | The user's first name. |
| `lastname` | String | The user's last name. |
| `email` | String | The user's email address. |
| `username` | String | The username for the Octeth account. |
| `password` | String | The password for the Octeth account (in plain text — Octeth handles the hashing). |
| `check_time` | Integer | The current Unix timestamp in UTC. Octeth uses this to verify that the token has not expired. |

**Optional fields:**

| Field | Type | Description |
|---|---|---|
| `target_usergroup_id` | Integer | The ID of the Octeth user group to assign the user to when creating a new account. If not provided, the default user group is used. |
| `reputation_level` | String | The reputation level for a new user account. Accepted values: `Untrusted` or `Trusted`. Defaults to `Untrusted`. |
| `language` | String | The interface language code for the user (for example, `en` for English). |
| `timezone` | String | The user's timezone (for example, `Europe/London` or `America/New_York`). |
| `ip` | String | The IP address of the user making the SSO request. |
| `availablecredits` | Integer | The number of email sending credits to assign to a newly created user account. |

::: info
The `id` field is the most important identifier for returning users. When a user comes through SSO, Octeth first tries to find an existing account with a matching SSO ID. If your external system always sends the same `id` for the same user, Octeth reliably matches them to the correct account on every visit.
:::

### Encryption Process

The token encryption follows these steps:

1. **Build the data** — Create an associative array (or dictionary/object in your language) with the required and optional fields.
2. **Encode as JSON** — Convert the data to a JSON string.
3. **Generate a random IV** — Create a random Initialization Vector (IV) for AES-256-CBC encryption. The IV length is determined by the cipher (16 bytes for AES-256-CBC).
4. **Encrypt** — Encrypt the JSON string using AES-256-CBC with Key1 (Base64-decoded) and the random IV.
5. **Sign** — Generate an HMAC-SHA256 signature of the IV concatenated with the encrypted data, using Key2 (Base64-decoded).
6. **Combine** — Concatenate the IV, the HMAC signature, and the encrypted data (in that order).
7. **Encode** — Base64-encode the combined binary data, then URL-encode the result.

The final encoded string is the token value that you pass in the SSO URL.

### PHP Example

The following PHP code demonstrates how to generate an SSO token. Replace `your-key1-here` and `your-key2-here` with the actual Base64-encoded keys from your SSO source's Access Credentials tab.

```php
<?php

// Step 1: Build the user data payload
$data = array(
    'id'                  => 'user-12345',           // Required: unique ID in your system
    'firstname'           => 'John',                 // Required
    'lastname'            => 'Doe',                  // Required
    'email'               => 'john.doe@example.com', // Required
    'username'            => 'johndoe',              // Required
    'password'            => 'YourSecurePassword123', // Required
    'check_time'          => time(),                 // Required: current UTC timestamp
    'target_usergroup_id' => 1,                      // Optional: user group ID
    'reputation_level'    => 'Untrusted',            // Optional: 'Untrusted' or 'Trusted'
    'language'            => 'en',                   // Optional: language code
    'timezone'            => 'Europe/London',        // Optional: timezone
    'ip'                  => '203.0.113.10',         // Optional: user's IP address
    'availablecredits'    => 100,                    // Optional: email credits
);

// Step 2: Decode the keys from your SSO source
$key1 = base64_decode('your-key1-here');  // Encryption Key (32 bytes)
$key2 = base64_decode('your-key2-here');  // Signing Key (64 bytes)

// Step 3: Encrypt and sign the token
$method = "AES-256-CBC";
$data_json = json_encode($data);

$iv_length = openssl_cipher_iv_length($method);
$iv = openssl_random_pseudo_bytes($iv_length);

$encrypted = openssl_encrypt($data_json, $method, $key1, OPENSSL_RAW_DATA, $iv);
$signature = hash_hmac('sha256', $iv . $encrypted, $key2, true);

// Step 4: Combine, encode, and build the URL
$token = rawurlencode(base64_encode($iv . $signature . $encrypted));

$sso_url = "https://octeth.example.com/sso?code=my-sso-source&token=" . $token;

// Step 5: Redirect the user
header("Location: " . $sso_url);
exit;
```

::: warning
The `check_time` field must be the current Unix timestamp in UTC at the moment the token is generated. If your server's clock is significantly out of sync, tokens may fail validation. Make sure your server's time is accurate.
:::

::: tip
The example code above is also available directly inside Octeth. Open the SSO source, go to the **Access Credentials** tab, and you will find a PHP example pre-filled with your actual keys and SSO endpoint URL.
:::

## Redirecting the User

Once your external system generates the token, redirect the user's browser to the Octeth SSO endpoint:

```
https://your-octeth-domain.com/sso?code=SOURCE_CODE&token=ENCODED_TOKEN
```

| Parameter | Description |
|---|---|
| `code` | The **Source Code** of the SSO source (the unique identifier you set when creating the source). |
| `token` | The encrypted, signed, and URL-encoded token string generated by your external system. |

### What Happens on Success

The outcome depends on the SSO source configuration:

- **If Perform login is enabled** — Octeth creates a session for the user and redirects them to the user dashboard at `/user/overview/`. The user is fully logged in and can start using Octeth immediately.

- **If Return user data is enabled** (and Perform login is disabled) — Octeth returns a JSON response containing the user's account information. This is useful for server-to-server integrations where you need to retrieve account details without redirecting a browser.

  The JSON response includes fields such as `UserID`, `Username`, `EmailAddress`, `FirstName`, `LastName`, `SSOID`, and a `_SessionID` that can be used for subsequent API calls on behalf of the user.

### What Happens on Failure

If the SSO request fails for any reason, Octeth returns a JSON response with an error description. For example:

```json
{
    "Success": false,
    "ErrorText": ["Token has expired"]
}
```

Common failure reasons include an invalid source code, an expired token, an expired SSO source, a tampered token, or missing required fields in the token data.

## How User Matching Works

When Octeth receives a valid SSO token, it determines which user account to authenticate using the following lookup order:

1. **Match by SSO ID** — Octeth searches for an existing user whose SSO ID matches the `id` field from the token. This is the primary matching method and works reliably as long as your external system sends the same `id` for the same user every time.

2. **Match by username and password** — If no user is found by SSO ID, Octeth searches for a user with a matching username and password combination.

3. **Create a new user** — If no match is found and the **Create new user if not exists** option is enabled on the SSO source, Octeth creates a new user account using the information from the token. The new user's SSO ID is set to the `id` value from the token, so future SSO requests will match by SSO ID.

If no match is found and automatic user creation is disabled, the SSO request fails with an "Invalid user credentials" error.

::: tip
For the most reliable user matching, always include a consistent `id` value in your tokens. Use a value that never changes for a given user in your external system, such as a database primary key or a UUID.
:::

## Monitoring SSO Activity

Each SSO source includes a statistics dashboard that tracks activity over the last 30 days.

1. Navigate to **Settings** > **SSO**.
2. Click on the SSO source name.
3. Click the **Statistics** tab.

The statistics tab displays a chart and a daily breakdown table with four metrics:

| Metric | Description |
|---|---|
| **Successful** | The number of SSO requests where the token was successfully decrypted and validated. |
| **Failed** | The number of SSO requests that failed due to invalid tokens, expired tokens, or other errors. |
| **Logins** | The number of successful user logins performed through SSO. |
| **Sign Ups** | The number of new user accounts created through SSO (when automatic user creation is enabled). |

[[SCREENSHOT: The Statistics tab showing the 30-day activity chart and the daily breakdown table with Successful, Failed, Logins, and Sign Ups columns]]

::: tip
Check the statistics regularly after deploying a new SSO integration. A high number of failed requests may indicate a problem with the token generation code, clock synchronization, or key configuration on the external system.
:::

## Editing an SSO Source

To modify an existing SSO source:

1. Navigate to **Settings** > **SSO**.
2. Click on the SSO source name.
3. Update the fields on the **Source Configuration** tab.
4. Click **Save** to apply your changes.

You can change the source name, description, expiration date, token validity period, and behavior options at any time. The **Source Code** can also be updated, but keep in mind that your external system's SSO URL must be updated to use the new code.

::: warning
Changing the **Source Code** will break any existing SSO integrations that use the old code. Update your external system's configuration immediately after changing the source code.
:::

The cryptographic keys (Key1 and Key2) are generated when the SSO source is first created and cannot be changed. If you need new keys, delete the SSO source and create a new one.

## Deleting an SSO Source

To delete one or more SSO sources:

1. Navigate to **Settings** > **SSO**.
2. Select the checkboxes next to the SSO sources you want to delete.
3. Click **Delete**.
4. Confirm the deletion when prompted.

::: danger
Deleting an SSO source is permanent and cannot be undone. Any external systems configured to use the deleted source will no longer be able to authenticate users through SSO. Make sure the source is no longer in use before deleting it.
:::

## Managing SSO Sources via API

In addition to the web interface, you can create, update, and delete SSO sources programmatically using the Octeth API. This is useful for automating SSO source management or integrating it into your provisioning workflows.

The following API commands are available:

| API Command | Description |
|---|---|
| `sso.create` | Create a new SSO source with specified configuration and options. |
| `sso.update` | Update an existing SSO source's name, code, options, or expiration. |
| `sso.delete` | Delete one or more SSO sources by their IDs. |

These commands require administrator-level API authentication. For full details on request parameters and response formats, see the [API Reference](/v5.8.1/api-reference/administrators).

## Security Considerations

SSO involves passing authentication data between systems. Follow these practices to keep your integration secure:

::: tip Store Keys Securely
Keep Key1 and Key2 in a secure location on your server, such as environment variables or a secrets manager. Never hard-code them directly in client-side code, commit them to version control, or expose them in publicly accessible files.
:::

::: tip Use HTTPS in Production
Always use HTTPS for both your external system and your Octeth installation. The SSO token is passed as a URL parameter, and without HTTPS, it could be intercepted in transit.
:::

::: tip Keep Token Lifetime Short
The **Valid For Seconds** setting controls how quickly a token expires after generation. A shorter lifetime (such as the default 5 seconds) reduces the window during which a stolen token could be reused. Only increase this value if network latency between your external system and Octeth requires it.
:::

::: tip Synchronize Server Clocks
Token expiration is calculated based on the `check_time` value in the token and the current time on the Octeth server. If the clocks on your external system and Octeth server are significantly different, tokens may expire prematurely or be accepted after they should have expired. Use NTP (Network Time Protocol) to keep both servers synchronized.
:::

::: tip Use Unique and Stable SSO IDs
The `id` field in the token should be a value that uniquely identifies the user in your external system and never changes (such as a database primary key). Avoid using values that might change over time, like email addresses or usernames, as the SSO ID.
:::

## Tips and Best Practices

::: tip Test with a Short-Lived Source First
When setting up SSO for the first time, create a test SSO source with a short expiration date. Use it to verify that your token generation and the SSO flow work correctly before creating a permanent source for production use.
:::

::: tip Use Automatic User Creation for Self-Service Platforms
If your platform allows users to sign up on their own, enable the **Create new user if not exists** option. This way, new users are automatically provisioned in Octeth the first time they access it through SSO, without any manual account creation.
:::

::: tip Disable Automatic User Creation for Controlled Access
If you want to restrict Octeth access to pre-approved users, disable **Create new user if not exists**. Only users who already have an Octeth account will be able to log in through SSO. You can create accounts manually or through the API before users need them.
:::

::: tip Use Return User Data for Backend Integrations
If your external system needs to verify whether a user exists in Octeth or retrieve account details without redirecting a browser, enable **Return user data** and disable **Perform login**. Your backend can make the SSO request server-side and process the JSON response programmatically.
:::

::: tip Assign User Groups for Multi-Tenant Setups
Use the `target_usergroup_id` field in the token to assign newly created users to specific user groups. This is especially useful if your platform serves different types of customers with different permission levels or sending limits in Octeth.
:::

## Troubleshooting

### "Invalid SSO Source Code (Broker)" Error

This error means Octeth could not find an SSO source matching the `code` parameter in the URL.

1. Verify that the `code` value in the SSO URL exactly matches the **Source Code** of the SSO source in Octeth (case-sensitive).
2. Check that the SSO source has not been deleted.
3. Confirm that there are no extra spaces or special characters in the `code` parameter.

### "SSO Source Code (Broker) access has expired" Error

This error means the SSO source has passed its expiration date.

1. Open the SSO source in **Settings** > **SSO** and check the **Expires At** field.
2. Either clear the expiration date to remove the time limit, or set it to a future date.

### "Invalid SSO token" Error

This error means Octeth could not decrypt or verify the token. The token data may be corrupted, the keys may be incorrect, or the token format may be invalid.

1. Verify that your external system is using the correct Key1 and Key2 values from the SSO source's **Access Credentials** tab.
2. Make sure the keys are Base64-decoded before use in the encryption and signing functions.
3. Confirm that the token is Base64-encoded and then URL-encoded (in that order).
4. Check that the IV, HMAC signature, and encrypted data are concatenated in the correct order: IV first, then HMAC, then encrypted data.
5. Ensure you are using AES-256-CBC for encryption and HMAC-SHA256 for signing.

### "Token has expired" Error

This error means the `check_time` value in the token is too far in the past relative to the Octeth server's current time.

1. Verify that your external system generates a fresh `check_time` value (using the current Unix timestamp in UTC) for each token, not a cached or hard-coded value.
2. Check whether the clocks on your external system and the Octeth server are synchronized. A time difference greater than the **Valid For Seconds** setting will cause tokens to expire immediately.
3. If needed, increase the **Valid For Seconds** value on the SSO source to allow more time for network latency.

### "Invalid user credentials" Error

This error means Octeth could not find an existing user matching the token data, and automatic user creation is disabled.

1. Check whether the user already has an Octeth account. The `id` field in the token must match an existing user's SSO ID, or the `username` and `password` must match an existing account.
2. If you want new users to be created automatically, enable the **Create new user if not exists** option on the SSO source.

### Users Are Not Being Created Automatically

If new users are not being created even though **Create new user if not exists** is enabled:

1. Verify that all required fields are present in the token: `id`, `firstname`, `lastname`, `email`, `username`, `password`, and `check_time`.
2. Check whether the `email` or `username` in the token conflicts with an existing Octeth account.
3. Review the SSO statistics for failed requests that might indicate the cause.

### Token Works in Testing but Fails in Production

1. Confirm that the production external system is using the correct keys for the production SSO source (not the test source keys).
2. Verify that the SSO endpoint URL uses the correct domain for your production Octeth installation.
3. Check that both the external system and Octeth are accessible over HTTPS in production.
4. Ensure server clocks are synchronized in the production environment.

## Related Articles

- [Users](../users) — Manage user accounts and user groups.
- [API Reference](/v5.8.1/api-reference/administrators) — Create and manage SSO sources programmatically.
