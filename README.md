# RankPilot SEO Audit SaaS

## Deploy to Render.com (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. It auto-detects settings from `render.yaml`
5. Click Create Web Service — done!

## Point Your Namecheap Domain
1. Render → Settings → Custom Domains → add your domain
2. Namecheap → Advanced DNS:
   - CNAME: `www` → `your-app.onrender.com`
   - URL Redirect: `@` → `https://www.yourdomain.com`
3. SSL is automatic!

## Local Dev
```bash
bash build.sh
node server/dist/index.js
```

Powered by Dabisoft IT Solutions
