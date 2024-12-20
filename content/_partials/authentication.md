While the Public role can be configured to make data available without authentication, anything that is not public requires a user to authenticate their requests.

Each user can have a single Static Tokens that does not expire (though can be regenerated). Standard and Session Tokens are returned after a user logs in, are short lived, and need refreshing.

Requests can be authenticated in the following ways:

::tabs
  ::div
  ---
  label: Authorization Header
  ---
  Add the following header: `Authorization: Bearer <token>`.
  ::

  ::div
  ---
  label: Session Cookies
  ---
  You do not need to set anything. The `directus_session_token` is used automatically.
  ::

  ::div
  ---
  label: Query Parameter
  ---
  Append the following query parameter: `?access_token=<token>`.

    ::callout{icon="material-symbols:info-outline"}
      **Exercise caution when using query parameters for authentication**  
      Using a query parameter for authentication can lead to it being revealed or logged. If possible, use another method.
    ::
	::
::
