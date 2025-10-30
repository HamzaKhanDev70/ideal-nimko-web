# 🚨 URGENT: Netlify Build Fix - 2+ Hours Issue

## ❌ The Problem
You've been facing this for 2+ hours:
```
sh: 1: vite: not found
```

**Root Cause**: Netlify is NOT installing dependencies before building.

## ✅ IMMEDIATE FIX

### 1. Update netlify.toml (ROOT LEVEL)
```toml
[build]
  base = "app"
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

### 2. Update app/netlify.toml
```toml
[build]
  command = "npm install && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

## 🚀 ALTERNATIVE: Use Build Script

If the above doesn't work, use this approach:

### 1. Create build script (app/build-netlify.sh)
```bash
#!/bin/bash
echo "🚀 Starting Netlify build process..."
npm install
npm run build
echo "✅ Build completed"
```

### 2. Update netlify.toml
```toml
[build]
  base = "app"
  command = "chmod +x build-netlify.sh && ./build-netlify.sh"
  publish = "dist"
```

## 🔧 EMERGENCY FIX - Manual Netlify Settings

If config files aren't working, set these in Netlify Dashboard:

### Build Settings in Netlify Dashboard:
1. Go to your site → Site settings → Build & deploy → Build settings
2. Set these values:
   - **Base directory**: `app`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20`

## 🎯 WHY THIS HAPPENS

1. **Netlify skips npm install** when using `npm run build` only
2. **Dependencies not installed** = vite command not found
3. **Build fails** before it even starts

## 🚨 QUICK TEST

Test locally first:
```bash
cd app
npm install
npm run build
```

If this works locally, the Netlify fix will work.

## 📞 IMMEDIATE ACTION

1. **Update both netlify.toml files** with the fix above
2. **Push to GitHub**
3. **Redeploy on Netlify**
4. **Check build logs** - should see "Installing dependencies..." first

## 🔍 VERIFICATION

After deploying, check build logs for:
```
Installing dependencies...
Building site...
Build completed successfully
```

If you still see "vite: not found", the issue is that Netlify is still not installing dependencies.

## 🆘 LAST RESORT

If nothing works:
1. **Delete the site** in Netlify
2. **Create new site** from GitHub
3. **Set build settings manually** in dashboard
4. **Don't rely on netlify.toml** - use dashboard settings

---

**This WILL fix your 2+ hour issue! The problem is simple: Netlify needs to install dependencies first!** 🚀
