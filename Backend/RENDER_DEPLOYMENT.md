# Deploying BQI Tech Python Backend to Render

This guide will walk you through deploying the Python FastAPI backend to Render.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

1. **Push to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### 2. Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub/GitLab
3. Connect your repository

### 3. Deploy Web Service

1. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository
   - Select the `python-backend` directory (if it's in a subdirectory)

2. **Configure Build Settings**:
   ```
   Name: bqitech-api
   Environment: Python 3
   Build Command: ./build.sh
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Set Environment Variables**:
   Go to Environment tab and add these variables:

   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # JWT Configuration
   SECRET_KEY=your_jwt_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password
   FROM_EMAIL=your_email@gmail.com

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Application Configuration
   FRONTEND_URL=https://bqitech.com
   DEBUG=False

   # HR Email
   HR_EMAIL=hr@bqitech.com

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   ALLOWED_EXTENSIONS=pdf,doc,docx

   # Rate Limiting
   RATE_LIMIT_REQUESTS=100
   RATE_LIMIT_WINDOW=3600

   # Dropbox Configuration
   DROPBOX_APP_KEY=your_dropbox_app_key
   DROPBOX_APP_SECRET=your_dropbox_app_secret
   DROPBOX_ACCESS_TOKEN=your_dropbox_access_token
   DROPBOX_REFRESH_TOKEN=your_dropbox_refresh_token

   # Pusher Configuration
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster

   # reCAPTCHA Configuration
   RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

   # Upstash Redis
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

4. **Advanced Settings**:
   ```
   Health Check Path: /api/health
   Auto-Deploy: Yes
   ```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Monitor the build logs for any issues

## 🔧 Post-Deployment Configuration

### 1. Update URLs

Once deployed, update these environment variables with your actual Render URL:

```env
APP_URL=https://your-app-name.onrender.com
DROPBOX_REDIRECT_URI=https://your-app-name.onrender.com/api/exchange-token
```

### 2. Test Your Deployment

1. **Health Check**: `https://your-app-name.onrender.com/api/health`
2. **API Documentation**: `https://your-app-name.onrender.com/docs`
3. **Test Login**: `POST https://your-app-name.onrender.com/api/auth/login`

### 3. Update Frontend Configuration

Update your Next.js frontend to point to the new backend URL:

```env
# In your Next.js .env
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com
```

## 📊 Monitoring & Maintenance

### 1. Render Dashboard

- Monitor logs in real-time
- View metrics and performance
- Set up alerts for downtime

### 2. Health Monitoring

The API includes a health check endpoint at `/api/health` that Render uses to monitor your service.

### 3. Scaling

Render automatically handles scaling, but you can:
- Upgrade to higher plans for better performance
- Enable horizontal scaling for high traffic

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use Render's environment variable management
- Rotate secrets regularly

### 2. Database Security

- MongoDB connection uses SSL by default
- Consider IP whitelisting if needed
- Monitor database access logs

### 3. API Security

- CORS is configured for your frontend domain
- JWT tokens have expiration times
- Rate limiting is enabled

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build.sh permissions
   chmod +x build.sh
   ```

2. **Database Connection Issues**:
   - Verify MongoDB URI format
   - Check network access from Render IPs

3. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check for typos in variable names

4. **Port Issues**:
   - Render automatically sets PORT environment variable
   - Don't hardcode port 8000 in production

### Logs and Debugging

1. **View Logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Monitor real-time logs during deployment

2. **Debug Mode**:
   ```env
   DEBUG=True  # Only for debugging, set to False in production
   ```

## 📈 Performance Optimization

### 1. Render Plan Selection

- **Starter Plan**: Good for development/testing
- **Standard Plan**: Better for production with more CPU/RAM
- **Pro Plan**: High-performance applications

### 2. Database Optimization

- Use MongoDB indexes for frequently queried fields
- Implement connection pooling
- Consider read replicas for high-read workloads

### 3. Caching

- Use Upstash Redis for caching
- Implement response caching for static data
- Cache database query results

## 🔄 CI/CD Pipeline

### Automatic Deployments

Render automatically deploys when you push to your main branch:

1. **GitHub Integration**:
   - Connects to your repository
   - Triggers builds on push
   - Shows deployment status

2. **Branch Deployments**:
   - Deploy different branches to separate services
   - Test features before merging

### Manual Deployments

You can also trigger manual deployments from the Render dashboard.

## 📞 Support

### Render Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Support tickets through dashboard

### Application Support

- Check API documentation at `/docs`
- Monitor application logs
- Use health check endpoint for status

---

## 🎉 Success!

Your Python FastAPI backend should now be running on Render! 

**Next Steps**:
1. Test all API endpoints
2. Update your frontend to use the new backend URL
3. Monitor performance and logs
4. Set up backup and monitoring strategies

**Your API will be available at**: `https://your-app-name.onrender.com`

**API Documentation**: `https://your-app-name.onrender.com/docs` 