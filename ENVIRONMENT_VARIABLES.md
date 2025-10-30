# 🔧 Environment Variables Guide

This document lists all environment variables needed for deploying the Ideal Nimko application.

## 📋 Backend Environment Variables (Railway)

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ideal-nimko` | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-here` | ✅ |
| `NODE_ENV` | Environment mode | `production` | ✅ |
| `PORT` | Server port | `5000` | ✅ |
| `CORS_ORIGIN` | Allowed frontend URL | `https://your-app.vercel.app` | ✅ |

### Optional Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_EXPIRES_IN` | JWT token expiration | `1h` | ❌ |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` | ❌ |
| `UPLOAD_MAX_SIZE` | Max file upload size | `5MB` | ❌ |

### Example Backend .env

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ideal-nimko

# Security
JWT_SECRET=ideal_nimko_super_secret_key_2024_production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Server
NODE_ENV=production
PORT=5000

# CORS
CORS_ORIGIN=https://your-app-name.vercel.app

# File Upload
UPLOAD_MAX_SIZE=10MB
```

## 🎨 Frontend Environment Variables (Vercel)

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `https://your-app.railway.app` | ✅ |

### Example Frontend .env

```env
# API Configuration
VITE_API_URL=https://your-app-name.railway.app
```

## 🗄️ Database Configuration

### MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Choose your preferred region

2. **Create Database User**:
   ```javascript
   Username: ideal-nimko-user
   Password: your-secure-password
   Database User Privileges: Read and write to any database
   ```

3. **Whitelist IP Addresses**:
   - Add `0.0.0.0/0` for Railway access
   - Or add Railway's specific IP ranges

4. **Get Connection String**:
   ```
   mongodb+srv://ideal-nimko-user:your-password@cluster0.xxxxx.mongodb.net/ideal-nimko?retryWrites=true&w=majority
   ```

### Railway MongoDB Addon (Alternative)

1. In Railway dashboard:
   - Click "New" → "Database" → "MongoDB"
   - Railway provides the connection string automatically
   - Copy the `MONGO_URI` from Railway's environment variables

## 🔐 Security Best Practices

### JWT Secret
- Use a strong, random string (at least 32 characters)
- Don't use common words or patterns
- Example: `ideal_nimko_jwt_secret_2024_xyz789abc123def456`

### Database Password
- Use a strong password with mixed case, numbers, and symbols
- Minimum 12 characters
- Example: `MyStr0ng!P@ssw0rd2024`

### CORS Configuration
- Only allow your production frontend URL
- Don't use wildcards (`*`) in production
- Example: `https://your-app-name.vercel.app`

## 🚀 Deployment Checklist

### Before Deployment

- [ ] All environment variables are set
- [ ] Database is accessible from Railway
- [ ] CORS origin matches your Vercel URL
- [ ] JWT secret is strong and unique
- [ ] MongoDB user has proper permissions

### After Deployment

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] API calls work from frontend
- [ ] Database connection is stable
- [ ] File uploads work (if applicable)

## 🔍 Testing Environment Variables

### Backend Health Check
```bash
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend API Test
```javascript
// In browser console
fetch('https://your-app.railway.app/api/products')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access to fetch at 'https://api.example.com' from origin 'https://app.example.com' has been blocked by CORS policy
```
**Solution**: Check `CORS_ORIGIN` matches your frontend URL exactly

#### 2. Database Connection Failed
```
MongooseServerSelectionError: connect ECONNREFUSED
```
**Solution**: 
- Check `MONGO_URI` is correct
- Verify IP whitelist includes Railway
- Check database user permissions

#### 3. JWT Token Invalid
```
JsonWebTokenError: invalid token
```
**Solution**: 
- Check `JWT_SECRET` is the same in all environments
- Verify token expiration settings

#### 4. Environment Variable Not Found
```
ReferenceError: process.env.VARIABLE is not defined
```
**Solution**: 
- Check variable name spelling
- Ensure variable is set in deployment platform
- Redeploy after adding variables

### Debug Commands

#### Check Environment Variables (Backend)
```javascript
// Add to server.js temporarily
console.log('Environment Variables:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

#### Check Environment Variables (Frontend)
```javascript
// Add to main.jsx temporarily
console.log('Frontend Environment:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
```

## 📞 Support

If you encounter issues with environment variables:

1. Check this guide first
2. Verify all variables are set correctly
3. Check deployment platform logs
4. Test with the debug commands above
5. Ensure variable names match exactly (case-sensitive)

---

**Remember**: Never commit `.env` files to version control! 🚫
