# AdMan Security

## API Authentication

All admin endpoints (CREATE, UPDATE, DELETE) are protected by Bearer token authentication.

### Protected Endpoints

**Projects API:**
- `POST /api/projects` — Create project
- `PUT /api/projects/{projectId}` — Update project
- `DELETE /api/projects/{projectId}` — Delete project

**Ads API:**
- `POST /api/ads` — Create ad
- `PUT /api/ads/{adId}` — Update ad
- `DELETE /api/ads/{adId}` — Delete ad

### Public Endpoints (No Auth Required)

**Read-only endpoints:**
- `GET /api/projects` — List all projects
- `GET /api/projects/{projectId}` — Get project details
- `GET /api/ads` — List all ads (optionally filter by projectId)
- `GET /api/ads/{adId}` — Get ad details
- `GET /api/serve/{adId}` — Get ad script for embedding
- `GET /preview/{adId}` — Preview ad

### Authentication Setup

1. **Environment Variable**

   Set `ADMAN_ADMIN_TOKEN` in `.env`:
   ```bash
   ADMAN_ADMIN_TOKEN=your-secure-token-here
   ```

2. **Generate Secure Token**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. **Making Authenticated Requests**

   Include the Bearer token in the `Authorization` header:
   ```bash
   curl -X POST http://localhost:4003/api/ads \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{"projectId":"proj_xxx","name":"My Ad",...}'
   ```

### Gateway Integration

CloudPipe Gateway auto-injects auth from `data/manifests/auth.json`:

```json
{
  "adman": {
    "type": "bearer",
    "env": "ADMAN_ADMIN_TOKEN"
  }
}
```

When calling via MCP tools or Telegram bot (`/call adman_create_ad ...`), authentication is handled automatically.

### Security Notes

- Token is stored in `.env` (never committed to git)
- `.env` is in `.gitignore`
- If `ADMAN_ADMIN_TOKEN` is not set, all admin requests will be rejected (secure by default)
- Tokens should be rotated periodically
- Use strong random tokens (minimum 32 bytes, base64 encoded)

### Incident Response

If a security breach is detected:

1. **Immediately rotate the token:**
   ```bash
   # Generate new token
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

   # Update .env file
   echo "ADMAN_ADMIN_TOKEN=NEW_TOKEN_HERE" > .env

   # Restart AdMan
   pm2 restart adman
   ```

2. **Review audit logs** to identify unauthorized changes

3. **Restore from backup** if data was tampered with

### Implementation Details

- Middleware: `src/lib/auth.ts` (`withAuth` wrapper)
- Auth check: Compares `Authorization: Bearer {token}` header against `process.env.ADMAN_ADMIN_TOKEN`
- Returns `401 Unauthorized` if token is missing or invalid
- Protected routes use `export const POST = withAuth(async (request) => { ... })`
