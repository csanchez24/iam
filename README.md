# Building Docker image

We must take into account the `--platform` we're running the image on or else
Docker will fail. For instance our dokku server is running on Linux hence we
must add `--platform=linux/amd64 ` while building the image. See below full
command. [Here's Discord thread on this issue](https://discord.com/channels/952684157123837952/1089394081559478284)

```bash
 docker buildx build --platform=linux/amd64 -t <image-name> .
```

## Pending

- [x] Change login password input to `password` type
- [x] Add page to forget password
- [x] Add option to change and confirm password
- [x] Add option to i18n
- [x] Set search params accordingly for the forgot password flow now that we also support i18n in those pages
- [x] Improve middleware to handle redirect of server side logic. Perhaps make the `withAuth` accept a callback where we can pass in the req object.
- [x] Nextjs middleware req.url points to localhost instead of the domain. Can't use for the post login redirect
- [x] Create hook to handle permissions. What do we show/hide to user
- [x] Don't allow adding empty permission under the application when clicking `add` button
- [ ] Redirect user back to the previous page when accessing /auth pages with a valid session. This can be accomplish in the server side.
- [ ] Automate database migrations inside of (github actions/docker). We need to include migrations dir in the final dist
- [ ] Handle request new access token as long as refresh token is valid
- [ ] Create functionality form M2M token generation
- [ ] Create user phasing page where user can see info and edit a few things
