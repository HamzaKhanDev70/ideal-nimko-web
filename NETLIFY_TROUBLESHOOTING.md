# 🛠️ Netlify Build Troubleshooting Guide

## ❌ Common Build Errors

### Error: "vite: not found"

This error occurs when Vite is not available in the build environment. Here are the solutions:

#### Solution 1: Use npx (Recommended)
Update your `netlify.toml` build command to:
```toml
[build]
  command = "npm install && npx vite build"
```

#### Solution 2: Check package.json
Ensure your `package.json` has Vite in devDependencies:
```json
{
  "devDependencies": {
    "vite": "^7.1.7",
    "@vitejs/plugin-react": "^5.0.4"
  }
}
```

#### Solution 3: Use npm ci
If you have a package-lock.json file:
```toml
[build]
  command = "npm ci && npx vite build"
```

### Error: "Build script returned non-zero exit code"

This usually means there's an error in the build process. Check:

1. **Dependencies**: All required packages are installed
2. **Node version**: Using Node.js 18
3. **Build output**: Check if dist/ directory is created

### Error: "Module not found"

This happens when dependencies are missing. Solutions:

1. **Install all dependencies**:
   ```bash
   npm install
   ```

2. **Check package.json**: Ensure all required packages are listed

3. **Clear cache**: In Netlify dashboard, go to Deploys → Trigger deploy → Clear cache and deploy site

## 🔧 Build Configuration

### Correct netlify.toml
```toml
[build]
  base = "app"
  command = "npm install && npx vite build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Redirects for SPA
[[redirects]]
  from = "/admin/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/shopkeeper/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/salesman/*"
  to = "/index.html"
  status = 200

# API redirects to Netlify Functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Correct package.json
```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^6.8.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## 🚀 Step-by-Step Fix

### 1. Update netlify.toml
```toml
[build]
  base = "app"
  command = "npm install && npx vite build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### 2. Test Locally
```bash
cd app
npm install
npx vite build
```

### 3. Check Build Output
```bash
ls -la dist/
```

### 4. Deploy to Netlify
1. Push changes to GitHub
2. Netlify will automatically redeploy
3. Check build logs in Netlify dashboard

## 🔍 Debug Commands

### Check Node Version
```bash
node --version
# Should be 18.x.x
```

### Check NPM Version
```bash
npm --version
```

### Check Vite Installation
```bash
npx vite --version
```

### List Installed Packages
```bash
npm list --depth=0
```

## 📊 Build Log Analysis

### Successful Build Log
```
✅ Installing dependencies...
✅ Running build command...
✅ Build completed successfully
✅ Site is live at https://your-app.netlify.app
```

### Failed Build Log
```
❌ Installing dependencies...
❌ Running build command...
❌ Build failed: vite: not found
```

## 🛠️ Alternative Build Commands

If the standard build doesn't work, try these alternatives:

### Option 1: Explicit Vite Path
```toml
[build]
  command = "npm install && ./node_modules/.bin/vite build"
```

### Option 2: Use Yarn
```toml
[build]
  command = "yarn install && yarn build"
```

### Option 3: Custom Build Script
```toml
[build]
  command = "chmod +x build.sh && ./build.sh"
```

## 📞 Getting Help

If you're still having issues:

1. **Check Netlify documentation**: [docs.netlify.com](https://docs.netlify.com)
2. **Review build logs**: Look for specific error messages
3. **Test locally first**: Ensure build works on your machine
4. **Check environment variables**: Verify all required variables are set

## 🎯 Quick Fix Checklist

- [ ] Updated netlify.toml with correct build command
- [ ] Verified package.json has all dependencies
- [ ] Tested build locally
- [ ] Pushed changes to GitHub
- [ ] Checked Netlify build logs
- [ ] Verified environment variables are set

---

**Most build issues are resolved by using `npx vite build` instead of `npm run build`!** 🚀
