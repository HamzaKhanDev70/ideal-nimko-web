# 🚀 Deployment Guide - Vercel + Railway

This guide will help you deploy your Ideal Nimko e-commerce application to Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

- GitHub account
- Vercel account
- Railway account
- MongoDB Atlas account (or use Railway's MongoDB addon)

## 🎯 Deployment Steps

### 1. Backend Deployment (Railway)

#### Step 1.1: Prepare Backend
1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `api` folder as the root directory

#### Step 1.2: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ideal-nimko
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-app-name.vercel.app
```

#### Step 1.3: Deploy
- Railway will automatically build and deploy your backend
- Note down your Railway URL (e.g., `https://your-app-name.railway.app`)

### 2. Frontend Deployment (Vercel)

#### Step 2.1: Prepare Frontend
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. Choose the `app` folder as the root directory

#### Step 2.2: Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```env
VITE_API_URL=https://your-app-name.railway.app
```

#### Step 2.3: Deploy
- Vercel will automatically build and deploy your frontend
- Note down your Vercel URL (e.g., `https://your-app-name.vercel.app`)

### 3. Update CORS Configuration

After getting both URLs, update the backend CORS configuration:

1. Go to Railway dashboard → Variables
2. Update `CORS_ORIGIN` with your actual Vercel URL
3. Redeploy the backend

## 🔧 Environment Variables Reference

### Backend (Railway)
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ideal-nimko

# Security
JWT_SECRET=your-super-secret-jwt-key-here

# Server
NODE_ENV=production
PORT=5000

# CORS
CORS_ORIGIN=https://your-app-name.vercel.app
```

### Frontend (Vercel)
```env
# API URL
VITE_API_URL=https://your-app-name.railway.app
```

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create a database user
4. Whitelist Railway's IP addresses (0.0.0.0/0 for all)
5. Get your connection string

### Option 2: Railway MongoDB Addon
1. In Railway dashboard, click "New" → "Database" → "MongoDB"
2. Railway will provide the connection string automatically

## 📁 Project Structure for Deployment

```
your-repo/
├── api/                    # Backend (Railway)
│   ├── Dockerfile
│   ├── railway.json
│   ├── package.json
│   └── ...
├── app/                    # Frontend (Vercel)
│   ├── vercel.json
│   ├── package.json
│   └── ...
└── DEPLOYMENT.md
```

## 🚀 Deployment Commands

### Local Development
```bash
# Backend
cd api
npm install
npm run dev

# Frontend
cd app
npm install
npm run dev
```

### Production Build
```bash
# Backend
cd api
npm install --production
npm start

# Frontend
cd app
npm install
npm run build
```

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Check that both URLs use HTTPS in production

#### 2. Database Connection Issues
- Verify MongoDB connection string
- Check if IP addresses are whitelisted
- Ensure database user has proper permissions

#### 3. Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Check build logs in Railway/Vercel dashboard

#### 4. Environment Variables
- Verify all required environment variables are set
- Check variable names match exactly (case-sensitive)
- Redeploy after changing environment variables

### Health Checks

#### Backend Health Check
```bash
curl https://your-app-name.railway.app/api/health
```

#### Frontend Health Check
Visit your Vercel URL and check if the app loads

## 📊 Monitoring

### Railway
- Monitor logs in Railway dashboard
- Check resource usage
- Set up alerts for errors

### Vercel
- Monitor deployments in Vercel dashboard
- Check function logs
- Monitor performance metrics

## 🔄 Updates and Redeployment

### Backend Updates
1. Push changes to GitHub
2. Railway will automatically redeploy
3. Check logs for any issues

### Frontend Updates
1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Check deployment status

## 🎉 Post-Deployment

After successful deployment:

1. **Test the application**:
   - Visit your Vercel URL
   - Test all user flows
   - Verify API connectivity

2. **Set up monitoring**:
   - Configure error tracking
   - Set up uptime monitoring
   - Monitor performance

3. **Configure domain** (optional):
   - Add custom domain in Vercel
   - Update CORS settings accordingly

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway and Vercel documentation
3. Check application logs in both platforms
4. Verify environment variables are set correctly

---

**Happy Deploying! 🚀**
