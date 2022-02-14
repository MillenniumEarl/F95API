The F95Zone forum uses the [Xenforo](https://xenforo.com/) platform as a basis. This platform uses cookies to monitor the session and the logged in user. In particular, these three standard cookies are used (from the [official page](https://xenforo.com/community/help/cookies/)):

+ **xf_csrf** [*Session*]: Stores a token, unique to you, which is used to verify that the actions you perform on this site were intended to be performed by you.
+ **xf_session** [*Session*]: Stores the current ID of your session.
+ **xf_user** [*Permanent*]: Stores a key, unique to you, which allows us to keep you logged in to the software as you navigate from page to page.

On the forum, the passage of cookies is as follows:
1. The unauthenticated user connects to the platform. It is provided with an `xf_csrf` cookie.
2. The user decides to log in from the form. To avoid CSRF vulnerabilities, the `xf_csrf` cookie is used to generate the `_xfToken` token, used in the user's POST requests to the forum
3. After authentication, the user receives the `xf_session` and `xf_user` cookies
4. The user closes the browser and the `xf_csrf` and `xf_session` cookies are deleted because of the session
5. The user reopens the browser and connects to the forum: since you are already an open session (`xf_user`) it is not necessary to log in again.
6. When the user connects to the platform, he receives a new `xf_csrf` cookie. If the user is also logged in (as in this case) he also gets the `xf_session` cookie.
7. After connecting to the platform and receiving the cookies, the `_xfToken` token is also regenerated. This process is automatically performed by the platform. If this last step does not have to be performed, even though the user is authenticated, **every POST request will be rejected for security reasons**.

To manage the correct procedure, F95API:
1. Authenticates and obtains all cookies, saving them on disk (in the temporary folder)
2. When a new session is instantiated, if these cookies are present they are recovered (with the exception of the session cookies which are ignored)
3. A request is made to the platform for new session cookies (`xf_csrf` and `xf_session`) and to update the `_xfToken` token
4. The API is ready to use