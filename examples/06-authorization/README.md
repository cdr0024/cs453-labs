# Example 06 — JWT Authentication + Role Authorization

This extends Example 05 with a username/password login, locally signed JWTs,
and role-based authorization. It still uses a browser client, Express API, and
Postgres database.

It demonstrates:

- hashing passwords with `bcryptjs` before storing them in Postgres
- exchanging a username and password for a short-lived JWT
- sending the token in `Authorization: Bearer <token>`
- authenticating protected API routes with `jsonwebtoken`
- authorizing actions by role: users can read items, admins can add items
- returning `401 Unauthorized` for an invalid/missing token and `403 Forbidden`
  for a valid token without the required role

## Install and run

```bash
npm install
docker compose up -d
npm run api
```

In another terminal, run the browser client:

```bash
npm run client
```

Open <http://localhost:5173>.

The API is at <http://localhost:3000>; CORS is configured to allow the client
origin at port 5173.

Postgres is exposed at `localhost:5433`, so this example can run alongside
Example 05 (which uses port 5432). Override the connection settings with the
usual `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` environment
variables when needed.

## Demo accounts

The API creates and seeds the `users` table on first start:

| Username | Password | Role | Permissions |
| --- | --- | --- | --- |
| `user` | `user-password` | `user` | Load items |
| `admin` | `admin-password` | `admin` | Load and add items |

Passwords are stored as bcrypt hashes, never as plaintext. These credentials
are deliberately public classroom examples; do not reuse them.

## API flow

1. The client posts credentials to `POST /api/auth/login`.
2. The server checks the bcrypt password hash and signs a JWT containing the
   user ID (`sub`), username, and role.
3. The client keeps the token in page memory and includes it in later requests.
4. `GET /api/items` requires a valid token.
5. `POST /api/items` additionally requires the `admin` role.

Try loading items while logged out, then log in as `user` and try adding an
item. The first returns 401; the second returns 403. Log in as `admin` to add
an item successfully.

## Local JWT signing

No cloud identity provider is needed for this example. The API signs and
verifies JWTs itself using the HMAC SHA-256 (HS256) secret in `JWT_SECRET`.
For convenience, it uses a clearly marked development-only fallback when that
variable is absent.

Set a unique secret before deploying anywhere beyond local development:

```bash
JWT_SECRET='replace-with-a-long-random-secret' npm run api
```

In production, keep that secret in a secret manager or deployment environment,
use HTTPS, validate issuer/audience as appropriate, rotate keys, and consider a
dedicated identity provider when you need password reset, multi-factor auth,
or shared sign-on. A JWT is signed, not encrypted: never put secrets in its
payload.

## Why the token is not stored in localStorage

This small client retains the access token only in JavaScript memory. A page
refresh therefore signs the user out, but it avoids presenting browser storage
as a default security recommendation. Production browser authentication needs
additional decisions about XSS, CSRF, refresh tokens, and session lifetime.
