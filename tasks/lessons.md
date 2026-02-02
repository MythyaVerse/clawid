# Lessons Learned

## 2026-02-02: Vercel Monorepo Deployment

### Issue
Vercel deployment kept failing with 404 or "No Next.js detected" errors despite successful builds.

### Symptom
- Build logs showed successful compilation and static page generation
- But production URL returned 404 NOT_FOUND
- Or error "No Next.js version detected"

### Root Cause
For pnpm monorepos with Next.js in a subdirectory (apps/web):
1. Vercel's auto-detection couldn't find Next.js in root package.json
2. When Root Directory was set, dependencies weren't installed correctly because pnpm hoists them to workspace root

### Fix
Configure Vercel project settings:
1. **Root Directory:** `apps/web`
2. **Framework Preset:** `Next.js`
3. **Install Command:** `cd ../.. && pnpm install`

Also add `apps/web/vercel.json`:
```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install"
}
```

### Prevention
For future pnpm monorepo projects:
- Always set Root Directory to the Next.js app folder in Vercel dashboard
- Always override Install Command to run from monorepo root
- Create vercel.json in the app directory specifying framework and install command
- Don't rely on vercel.json in repo root with `builds` array - it's deprecated

---

## 2026-02-02: Environment Variables in Monorepo

### Issue
Test pages showed env vars as "not set" even though .env.local existed.

### Root Cause
Next.js only loads .env.local from its own directory (apps/web), not from monorepo root.

### Fix
Copy or create .env.local in `apps/web/` directory, not just repo root.

### Prevention
For monorepos, always place .env.local in the Next.js app directory (apps/web/.env.local).

---
