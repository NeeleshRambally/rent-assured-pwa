# Deploy to Railway

## Quick Deploy (Web Dashboard)

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. **Deploy on Railway**
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `rent-assured-pwa` repository
5. Railway will auto-detect Next.js and deploy

### 3. **Set Environment Variables**
In Railway dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.railway.app/api
   ```

### 4. **Deploy**
Railway will automatically deploy on every push to `main` branch.

---

## Alternative: Railway CLI

### 1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

### 2. **Login**
```bash
railway login
```

### 3. **Initialize Project**
```bash
railway init
```

### 4. **Link to Project** (if already created)
```bash
railway link
```

### 5. **Add Environment Variables**
```bash
railway variables set NEXT_PUBLIC_API_URL=https://your-api-url.railway.app/api
```

### 6. **Deploy**
```bash
railway up
```

---

## Configuration Files

- **railway.json**: Railway configuration (already created)
- **.env.local.example**: Example environment variables

---

## Post-Deployment

1. **Get your URL**: Railway will provide a URL like `https://rent-assured-pwa.up.railway.app`
2. **Test the journey**: Visit `https://your-url.railway.app/tenant-journey?requesterName=TestRequester`
3. **Update API URL**: Make sure your API is also deployed and update `NEXT_PUBLIC_API_URL`

---

## Automatic Deployments

Railway automatically deploys when you push to your connected branch:
```bash
git add .
git commit -m "Update tenant journey"
git push origin main
```

---

## Troubleshooting

### Build fails
- Check Railway logs in dashboard
- Ensure `package.json` has correct `build` script
- Verify all dependencies are in `package.json`

### Environment variables not working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Restart deployment after adding variables

### 404 on routes
- Next.js should handle routing automatically
- Check if build completed successfully
