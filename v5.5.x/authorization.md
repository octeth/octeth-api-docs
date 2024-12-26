---
layout: doc
---

# Authorization

Before accessing API endpoints, you must be authorized as an administrator or user, depending on the requirements of each endpoint. Authorization can be done in two ways:

1. Generating a session ID
2. Using the admin or user API key

To generate a session ID, execute the `Admin.Login` or `User.Login` API endpoints. Here are examples of how to do this:

## Generate an administrator session ID:

```bash
curl --location 'http://<octeth-installation-domain>/api.php' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'ResponseFormat=JSON' \
--data-urlencode 'Command=Admin.Login' \
--data-urlencode 'Username=<admin-username>' \
--data-urlencode 'Password=<admin-password>' \
--data-urlencode 'TFACode=' \
--data-urlencode 'DisableCaptcha=true'
```

## Generate a user session ID:

```bash
curl --location 'http://<octeth-installation-domain>/api.php' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'ResponseFormat=JSON' \
--data-urlencode 'Command=User.Login' \
--data-urlencode 'Username=<user-username>' \
--data-urlencode 'Password=<user-password>' \
--data-urlencode 'TFACode=' \
--data-urlencode 'DisableCaptcha=true'
```

After providing the correct username and password, you will receive a success response with a session ID. The `SessionID` parameter will be used in further API calls.

If you prefer to authenticate using the admin API key or user API key, generate an API key in the `User Area > Settings > API Keys` section. If you need to use the admin API key, gather your admin API key from `Admin Area > Settings > Admin Account > API` tab.

When making API requests, pass the SessionID or APIKey parameter depending on the authorization method you have chosen.

## Test Your Setup

To ensure your setup is correct, you can make a simple API call to create a new subscriber list. Here's an example (assuming that the SessionID gathered from User.Login API endpoint is ****):

```bash
curl --location 'http://<octeth-installation-domain>/api.php' \
--form 'ResponseFormat="JSON"' \
--form 'Command="List.Create"' \
--form 'SessionID="****"' \
--form 'SubscriberListName="My Test List"'
```

The response should look like this:

```json
{
"Success": true,
"ErrorCode": 0,
"ErrorText": "",
"ListID": 1
}
```

If you receive a success response, congratulations! You're now ready to start using the Octeth API.