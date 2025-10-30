# 🚀 Netlify Deployment Guide

This guide will help you deploy your Ideal Nimko e-commerce application entirely on Netlify.

## 📋 Prerequisites

- GitHub account
- Netlify account
- MongoDB Atlas account (or MongoDB hosting service)

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done)
2. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy from GitHub (Recommended)

1. **Go to [Netlify](https://netlify.com)**
2. **Click "New site from Git"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Base directory**: `app`
   - **Build command**: `npm run build`
   - **Publish directory**: `app/dist`

#### Option B: Manual Deploy

1. **Build your frontend locally**:
   ```bash
   cd app
   npm install
   npm run build
   ```
2. **Drag and drop** the `app/dist` folder to Netlify

### Step 3: Configure Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ideal-nimko

# Security
JWT_SECRET=your-super-secret-jwt-key-here

# API Configuration
NODE_ENV=production
```

### Step 4: Set Up Netlify Functions (Backend API)

#### Method 1: Using Netlify Functions (Recommended)

1. **Create a `netlify/functions` directory** in your project root
2. **Copy the function files** I've created:
   - `netlify/functions/api.js`
   - `netlify/functions/health.js`
   - `netlify/functions/package.json`

3. **Update your `netlify.toml`** to include:
   ```toml
   [functions]
     directory = "netlify/functions"
   ```

#### Method 2: External API (Alternative)

If you prefer to keep the backend separate, you can:

1. **Deploy backend to another service** (Railway, Render, etc.)
2. **Update frontend environment variables** to point to your backend URL
3. **Configure CORS** on your backend to allow your Netlify domain

### Step 5: Configure Build Settings

In Netlify dashboard, go to **Site settings** → **Build & deploy** → **Build settings**:

```yaml
# Build command
npm run build

# Publish directory
app/dist

# Base directory
app
```

### Step 6: Set Up Redirects

Your `netlify.toml` should include these redirects:

```toml
# SPA redirects
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

## 🔧 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ideal-nimko` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-here` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | JWT token expiration | `1h` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |

## 📁 Project Structure for Netlify

```
your-repo/
├── app/                          # Frontend (Netlify will build this)
│   ├── netlify.toml             # Netlify configuration
│   ├── package.json
│   ├── src/
│   └── dist/                    # Build output
├── netlify/                     # Netlify Functions (Backend API)
│   └── functions/
│       ├── api.js              # Main API handler
│       ├── health.js           # Health check
│       └── package.json        # Function dependencies
├── api/                         # Original backend (not used in Netlify)
├── netlify.toml                # Root Netlify configuration
└── NETLIFY_DEPLOYMENT.md       # This guide
```

## 🚀 Build Commands

### Frontend Build
```bash
cd app
npm install
npm run build
```

### Netlify Functions
```bash
cd netlify/functions
npm install
```

## 🔍 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app-name.netlify.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Ideal Nimko API"
}
```

### 2. Frontend Test
- Visit your Netlify URL
- Test all user flows
- Check admin panel access

### 3. API Test
```bash
# Test products endpoint
curl https://your-app-name.netlify.app/api/products

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-app-name.netlify.app/api/users/profile
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
- **Check Node.js version**: Ensure you're using Node 18
- **Verify dependencies**: Run `npm install` locally first
- **Check build logs**: Review Netlify build logs for errors

#### 2. Function Errors
- **Check function logs**: Go to Netlify dashboard → Functions → View logs
- **Verify environment variables**: Ensure all required variables are set
- **Check MongoDB connection**: Verify `MONGO_URI` is correct

#### 3. CORS Issues
- **Check redirects**: Ensure API redirects are configured correctly
- **Verify headers**: Check that CORS headers are set in functions

#### 4. Database Connection
- **Test MongoDB URI**: Use MongoDB Compass to test connection
- **Check IP whitelist**: Ensure Netlify's IP ranges are allowed
- **Verify credentials**: Check username/password are correct

### Debug Commands

#### Check Environment Variables
```javascript
// Add to any Netlify function temporarily
console.log('Environment Variables:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('NODE_ENV:', process.env.NODE_ENV);
```

#### Test MongoDB Connection
```javascript
// Add to health.js function
import mongoose from 'mongoose';

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

testDB();
```

## 📊 Monitoring

### Netlify Dashboard
- **Deployments**: Monitor build status and logs
- **Functions**: Check function logs and performance
- **Analytics**: View site traffic and performance

### Function Logs
1. Go to Netlify dashboard
2. Click on your site
3. Go to **Functions** tab
4. Click on any function to view logs

## 🔄 Updates and Redeployment

### Automatic Deployments
- **GitHub integration**: Push to main branch triggers automatic deployment
- **Build hooks**: Use Netlify build hooks for custom triggers

### Manual Deployments
1. **Trigger deploy**: Go to Netlify dashboard → Deploys → Trigger deploy
2. **Clear cache**: Use "Clear cache and deploy site" for clean builds

## 🎉 Post-Deployment

### 1. Test Everything
- [ ] Frontend loads correctly
- [ ] Admin login works
- [ ] API endpoints respond
- [ ] Database operations work
- [ ] File uploads work (if applicable)

### 2. Set Up Monitoring
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Monitor function performance

### 3. Configure Domain (Optional)
- [ ] Add custom domain in Netlify
- [ ] Update DNS settings
- [ ] Configure SSL certificate

## 📞 Support

If you encounter issues:

1. **Check Netlify documentation**: [docs.netlify.com](https://docs.netlify.com)
2. **Review build logs**: Check for specific error messages
3. **Test locally**: Ensure everything works in development
4. **Check environment variables**: Verify all required variables are set

## 🎯 Quick Start Checklist

- [ ] Code pushed to GitHub
- [ ] Netlify site created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] MongoDB connection working
- [ ] Functions deployed
- [ ] Frontend accessible
- [ ] API endpoints working
- [ ] Admin panel functional

---

**Your Ideal Nimko e-commerce platform is now ready on Netlify!** 🎉

**Both frontend and backend are deployed on a single platform with automatic scaling and global CDN!** 🚀
