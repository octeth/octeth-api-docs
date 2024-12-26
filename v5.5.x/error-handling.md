---
layout: doc
---

# Error Handling


When interacting with the Octeth API, it's important to handle errors correctly to ensure your application runs smoothly. This section will guide you through how errors are returned and how to interpret them.

## Error Responses

Most API endpoints return a `200` HTTP status code, even when an error occurs. However, the response body will contain a JSON error message. Some newer API endpoints may return a `4xx` or `5xx` HTTP response code. These are explicitly defined in the API calls.

Here's an example of an error response:

```json
{
    "Success": false,
    "ErrorCode": [
        1
    ]
}
```

In this example, the `Success` field is `false`, indicating an error has occurred. The `ErrorCode` is `1`, which means the `SubscriberListName` parameter is missing or empty. Each API endpoint has its own list of error codes.

## Common Error Codes

Here are some common error codes you might encounter:

- Error Code `3`: Invalid login information. This error occurs when the login information provided in the User.Login API call is invalid:

  ```json
  {
    "Success": false,
    "ErrorCode": [
      3
    ],
    "ErrorText": [
      "Invalid login information"
    ]
  }
  ```

- Error Code `99998`: Authorization error. This error occurs when the provided APIKey or SessionID parameter is invalid.

  ```json
  {
      "Success": false,
      "ErrorCode": 99998
  }
  ```
  
## Handling Errors

While the Octeth API does not require any specific steps for handling errors or retrying failed requests, it's a good practice to check the `Success` field in every API response. If `Success` is `false`, check the `ErrorCode` and `ErrorText` fields to understand what went wrong.

Remember, each API endpoint has its own list of error codes. Always refer to the specific API endpoint documentation for a complete list of possible error codes and their meanings.

## Best Practices

While there are no specific best practices for error handling with the Octeth API, it's generally a good idea to:

- Always check the Success field in the API response.
- Understand the meaning of each ErrorCode you encounter.
- Handle errors gracefully in your application to ensure a smooth user experience.
