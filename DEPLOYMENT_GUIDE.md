# Deployment Guide - Vercel

## Overview
This guide explains how to deploy the Storyboard Studio application to Vercel with Flask API backend.

---

## Architecture

- **Frontend**: React app (static build) → Vercel CDN
- **Backend**: Flask API → Vercel Serverless Functions (Python)

---

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Vercel CLI** (optional): `npm i -g vercel`
3. **GitHub Repository**: Code should be pushed to GitHub
4. **GROQ API Key**: From https://console.groq.com

---

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Connect GitHub Repository

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository: `LP_Vision_Studio`
4. Vercel will auto-detect the framework (Vite)

#### Step 2: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Step 3: Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `GROQ_API_KEY` | `your-groq-api-key-here` | Production, Preview, Development |
| `VITE_FLASK_API_URL` | `/api` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://cmzyukutpcghbuqsdnjc.supabase.co` | All |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `your-supabase-key` | All |
| `VITE_SUPABASE_PROJECT_ID` | `cmzyukutpcghbuqsdnjc` | All |

**Important**: For `VITE_FLASK_API_URL`, use `/api` (relative path) since backend will be on same domain.

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

#### Step 4: Add Environment Variables
```bash
vercel env add GROQ_API_KEY
# Enter your GROQ API key when prompted

vercel env add VITE_FLASK_API_URL
# Enter: /api
```

---

## File Structure for Vercel

```
storyboard-studio/
├── api/
│   ├── index.py              # Vercel serverless function
│   ├── flask_api.py          # Local development
│   └── requirements.txt      # Python dependencies
├── src/                      # React frontend
├── dist/                     # Build output (auto-generated)
├── vercel.json              # Vercel configuration
├── package.json
└── vite.config.ts
```

---

## Important Configuration Files

### vercel.json
Already created in root directory. This tells Vercel:
- How to build Python backend (`api/index.py`)
- How to build React frontend
- Route `/api/*` requests to Python backend
- Route all other requests to frontend

### api/index.py
Vercel-compatible version of Flask API with:
- Routes prefixed with `/api/`
- Serverless function handler
- Environment variable support

---

## API Endpoints (After Deployment)

Your deployed app will have these endpoints:

- **Frontend**: `https://your-project.vercel.app/`
- **API Health**: `https://your-project.vercel.app/api/health`
- **Generate Scenes**: `https://your-project.vercel.app/api/generate-scenes`

---

## Testing Deployment

### Test Health Endpoint
```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{"status": "ok"}
```

### Test Scene Generation
```bash
curl -X POST https://your-project.vercel.app/api/generate-scenes \
  -H "Content-Type: application/json" \
  -d '{"script": "Put some sugar in your mouth. How does it taste?", "sceneCount": 4}'
```

---

## Troubleshooting

### Issue: "GROQ_API_KEY not configured"
**Solution**: Add `GROQ_API_KEY` in Vercel Dashboard → Environment Variables

### Issue: "Module not found: flask"
**Solution**: Ensure `requirements.txt` is in `api/` folder with all dependencies

### Issue: Frontend can't connect to API
**Solution**: 
1. Check `VITE_FLASK_API_URL` is set to `/api` (not `http://localhost:5000`)
2. Rebuild and redeploy

### Issue: Build fails
**Solution**: Check Vercel build logs:
1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. Check "Build Logs" tab

### Issue: API timeout (10 seconds)
**Solution**: Vercel serverless functions have 10s timeout on Hobby plan
- Upgrade to Pro plan for 60s timeout
- Or optimize GROQ API calls

---

## Environment Variables Reference

### Required for Backend
- `GROQ_API_KEY` - Your GROQ API key

### Required for Frontend
- `VITE_FLASK_API_URL` - Set to `/api` for production
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID

---

## Local vs Production

### Local Development
```bash
# Backend
cd api
python flask_api.py  # Runs on http://localhost:5000

# Frontend
npm run dev  # Runs on http://localhost:8080
```

### Production (Vercel)
```
Frontend: https://your-project.vercel.app/
Backend: https://your-project.vercel.app/api/
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

---

## Monitoring & Logs

### View Logs
1. Vercel Dashboard → Project → Deployments
2. Click on deployment
3. View "Function Logs" for API errors

### Analytics
- Vercel provides built-in analytics
- View in Dashboard → Analytics

---

## Cost

### Vercel Hobby Plan (Free)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (10s timeout)
- ✅ Automatic HTTPS
- ❌ Limited to 12 serverless function invocations per hour

### Vercel Pro Plan ($20/month)
- ✅ Everything in Hobby
- ✅ 1TB bandwidth/month
- ✅ 60s function timeout
- ✅ Unlimited function invocations
- ✅ Team collaboration

---

## Alternative: Split Deployment

If Vercel Python functions don't work well, you can:

1. **Frontend on Vercel**: Deploy React app only
2. **Backend on Render/Railway**: Deploy Flask API separately
3. **Update VITE_FLASK_API_URL**: Point to your backend URL

### Backend on Render.com (Free)
```bash
# Create render.yaml
services:
  - type: web
    name: storyboard-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn api.flask_api:app
```

Then update frontend env:
```env
VITE_FLASK_API_URL=https://your-app.onrender.com
```

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] `vercel.json` in root directory
- [ ] `api/index.py` created
- [ ] `requirements.txt` in api folder
- [ ] Connected GitHub repo to Vercel
- [ ] Added `GROQ_API_KEY` environment variable
- [ ] Set `VITE_FLASK_API_URL=/api`
- [ ] Deployed successfully
- [ ] Tested `/api/health` endpoint
- [ ] Tested scene generation

---

## Support

For issues:
- Check Vercel build logs
- Check function logs in Vercel Dashboard
- Verify environment variables are set
- Test API endpoints with curl

---

## Summary

✅ Vercel supports Python serverless functions
✅ Frontend and backend on same domain
✅ No CORS issues
✅ Automatic HTTPS
✅ Free tier available
✅ Easy GitHub integration

Deploy command: `vercel --prod`
