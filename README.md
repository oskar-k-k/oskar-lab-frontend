# Oskar Lab Frontend

## Local development

```powershell
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Do not overwrite an existing `.env.local`. Open http://localhost:10030.
`npm.cmd run start` also uses port 10030 after `npm.cmd run build`.

## Services

| Service | Local URL or port |
| --- | --- |
| Frontend | http://localhost:10030 |
| Backend | http://localhost:10081 |
| PostgreSQL | localhost:10054 |
| Try-on worker | http://localhost:10078 |

The API client defaults to port 10081. Set `TRYON_WORKER_URL=http://localhost:10078/try-on` in `.env.local` for ClothLab.
The platform can display its local project catalog without the backend.

Google login requires `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET`.
Register `http://localhost:10030/api/auth/callback/google` as an authorized redirect URI in the Google OAuth client.

## Checks

```powershell
npm.cmd run check
```
