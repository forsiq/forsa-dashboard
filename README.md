# Auction2 (Forsa dashboard)

Next.js app for auction management: dashboard, listings, auth against ZoneVast APIs.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run lint
```

## Environment variables

Values prefixed with `NEXT_PUBLIC_` are **inlined at build time** (`next build`). If they are missing in CI or Amplify, the running app cannot read them from the server later.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the auction REST API (and origin used for project-service attachment URLs). Example (test): `https://test.zonevast.com/forsa/api/v1`. The auth client derives the API **origin** from this value so login/token requests hit the real API host, not the static app host. |

Create `.env.local` for local overrides (see repo `.gitignore`; do not commit secrets).

### AWS Amplify

1. In **Amplify Console** → your app → **Environment variables**, set `NEXT_PUBLIC_API_BASE_URL` for the branch you deploy (e.g. `main`) to the correct API base for that environment.
2. **Redeploy** (or trigger a new build) after changing env vars so the bundle is rebuilt with the new values.
3. **Verify after deploy:** open DevTools → **Network**, submit login, and confirm the `POST` for the token goes to your API **origin** (e.g. `test.zonevast.com`), **not** to the Amplify app URL (e.g. `https://<app>.apps.zonevast.com/api/...`). The latter usually means the variable was not available at build time, so requests become relative to the app origin and return **404**.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
