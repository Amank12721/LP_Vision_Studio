# 🚀 Quick Vercel Deployment Guide

## Step-by-Step Deployment

### 1️⃣ Push to GitHub (Already Done ✅)
Your code is already on GitHub: https://github.com/Amank12721/LP_Vision_Studio

### 2️⃣ Go to Vercel Dashboard
Visit: https://vercel.com/dashboard

### 3️⃣ Import Project
1. Click "Add New" → "Project"
2. Select "Import Git Repository"
3. Choose: `Amank12721/LP_Vision_Studio`
4. Click "Import"

### 4️⃣ Configure Project
Vercel will auto-detect settings. Verify:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5️⃣ Add Environment Variables
Click "Environment Variables" and add:

```
GROQ_API_KEY = your-groq-api-key-here
VITE_FLASK_API_URL = /api
```

**Important**: 
- Replace `your-groq-api-key-here` with your actual GROQ API key
- Select "Production", "Preview", and "Development" for all variables

### 6️⃣ Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Done! 🎉

### 7️⃣ Test Your Deployment
Your app will be live at: `https://your-project-name.vercel.app`

Test the API:
```bash
curl https://your-project-name.vercel.app/api/health
```

---

## What Happens During Deployment?

1. ✅ Vercel clones your GitHub repo
2. ✅ Installs Node.js dependencies (`npm install`)
3. ✅ Builds React frontend (`npm run build`)
4. ✅ Deploys frontend to CDN
5. ✅ Deploys Flask API as serverless function (`api/index.py`)
6. ✅ Sets up routes (`/api/*` → Python, `/*` → Frontend)
7. ✅ Generates SSL certificate (HTTPS)

---

## Files Created for Vercel

✅ `vercel.json` - Vercel configuration
✅ `api/index.py` - Serverless function (Vercel-compatible Flask)
✅ `.env.production` - Production environment variables
✅ `DEPLOYMENT_GUIDE.md` - Detailed deployment docs

---

## After Deployment

### Your URLs:
- **Frontend**: `https://your-project.vercel.app/`
- **API Health**: `https://your-project.vercel.app/api/health`
- **Generate Scenes**: `https://your-project.vercel.app/api/generate-scenes`

### Automatic Features:
- ✅ HTTPS (SSL certificate)
- ✅ CDN (fast global delivery)
- ✅ Auto-deploy on Git push
- ✅ Preview deployments for PRs
- ✅ Rollback to previous versions

---

## Troubleshooting

### Build Failed?
1. Check build logs in Vercel Dashboard
2. Verify `package.json` has correct scripts
3. Ensure all dependencies are in `package.json`

### API Not Working?
1. Check Function Logs in Vercel Dashboard
2. Verify `GROQ_API_KEY` is set correctly
3. Test with: `curl https://your-app.vercel.app/api/health`

### Frontend Can't Connect to API?
1. Check browser console for errors
2. Verify `VITE_FLASK_API_URL=/api` in Vercel env vars
3. Redeploy after changing env vars

---

## Re-deploy After Changes

### Automatic (Recommended):
Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel will auto-deploy! ✨

### Manual:
```bash
vercel --prod
```

---

## Cost: FREE! 🎉

Vercel Hobby plan includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Custom domains

---

## Need Help?

1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed docs
2. View Vercel logs in Dashboard
3. Check Vercel documentation: https://vercel.com/docs

---

## Summary

1. Go to https://vercel.com/dashboard
2. Import GitHub repo
3. Add `GROQ_API_KEY` environment variable
4. Click Deploy
5. Done! 🚀

**Deployment time**: ~3 minutes
**Cost**: FREE
**Difficulty**: Easy ⭐
