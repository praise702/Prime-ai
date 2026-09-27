# Production security configuration

Before deployment, configure the Firebase Admin SDK on the server with an
Application Default Credentials service account. Store the JSON key outside
this repository and frontend assets, then set `GOOGLE_APPLICATION_CREDENTIALS`
to that protected file and `FIREBASE_PROJECT_ID` to the Firebase project ID.
The server will fail closed when Firebase Admin cannot verify a token.

Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of exact HTTPS origins
that host the frontend. Do not use wildcards. If the UI is served by this
Express process, leave it empty in production and use the same HTTPS origin.

Deploy `firebase-realtime-database.rules.json` in the Firebase Realtime
Database Rules editor (or through the Firebase CLI). It covers the currently
observed browser path: `/users/$uid/chats/$chatId`. Rules are not live until
they are deployed to the Firebase project.

Set `ENABLE_HSTS=true` only after the complete production hostname is served
exclusively through HTTPS. If TLS terminates at a proxy, set `TRUST_PROXY=true`
only when that proxy strips client-supplied forwarding headers and supplies the
real client IP itself.

The bundled rate limiter is in-memory. A multi-instance production deployment
must replace it with a shared, atomic rate-limit store (for example an
existing Redis deployment) before relying on rate limits across instances.

## Long-term memory deployment boundary

Long-term memory is stored synchronously in `data/memory.json`. It survives a
single process restart when the deployment has durable local storage, but it
does not provide atomic concurrent writes, file locking, multi-instance
consistency, backups, or encryption at rest. It is therefore suitable only
for a single application instance with a protected, durable volume and a
backup/recovery procedure. Do not commit this file; it is ignored by Git.

For a multi-instance deployment, migrate the `src/memory/longMemory.js`
storage adapter to a shared datastore with per-UID access controls and atomic
updates. Firebase Realtime Database is already used by the browser for chat
history and is a compatible target if server-side writes use Firebase Admin
and preserve the existing `/users/$uid/...` ownership model.

## Required production verification

1. Set `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and exact
   `CORS_ALLOWED_ORIGINS` in the deployment secret manager; never put the
   service-account JSON in frontend assets or Git.
2. Deploy `firebase-realtime-database.rules.json`, then confirm in the Firebase
   console/CLI that the deployed rules match that file.
3. Use two real Firebase accounts: verify login, authenticated chat, persisted
   history after reload, new-chat context isolation, and cross-user denial.
4. On a browser/device with a microphone, verify permission handling, one final
   transcription producing one chat request, and stop-recording behavior.
5. Run the Kokoro service and verify an authenticated response includes playable
   audio plus stop-playback behavior.
6. Start the production process behind HTTPS, verify HSTS and CORS headers, and
   rerun `npm test` plus `npm audit --omit=dev` in the deployment build.
