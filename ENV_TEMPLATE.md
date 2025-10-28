# Environment Variables Template

Copy the content below to your `.env` file in the root directory.

```env
# ==============================================
# WEDLY BACKEND - ENVIRONMENT CONFIGURATION
# ==============================================

# ----------------------------------------------
# SERVER CONFIGURATION
# ----------------------------------------------
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000

# For production, update to:
# CLIENT_ORIGIN=https://yourdomain.com
# API_BASE_URL=https://api.yourdomain.com

# ----------------------------------------------
# JWT CONFIGURATION
# ----------------------------------------------
# IMPORTANT: Generate secure random strings for production!
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_ACCESS_SECRET=dev_access_secret_change_me_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_me_in_production

# Token Time-To-Live (in seconds)
JWT_ACCESS_TTL=900         # 15 minutes
JWT_REFRESH_TTL=1209600    # 14 days

# ----------------------------------------------
# GOOGLE OAUTH & ONE-TAP CONFIGURATION
# ----------------------------------------------
# Get credentials from: https://console.cloud.google.com/apis/credentials
# 1. Create OAuth 2.0 Client ID (Web application)
# 2. Add authorized origins: http://localhost:3000, http://localhost:4000
# 3. Add authorized redirect URIs if needed

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
GOOGLE_AUDIENCE=your_google_client_id.apps.googleusercontent.com

# Note: GOOGLE_AUDIENCE is typically the same as GOOGLE_CLIENT_ID
# It's used for ID token verification

# ----------------------------------------------
# DATABASE CONFIGURATION (MongoDB)
# ----------------------------------------------
# MongoDB Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/wedly?retryWrites=true&w=majority"

# Example for local MongoDB:
# DATABASE_URL="mongodb://localhost:27017/wedly"

# ----------------------------------------------
# OPTIONAL: ADDITIONAL SETTINGS
# ----------------------------------------------
# Uncomment and configure if needed

# NODE_ENV=development
# LOG_LEVEL=info
```

## 🔑 How to Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing)
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:4000`
   - Add Authorized redirect URIs (if needed):
     - `http://localhost:4000/auth/google/callback`
5. **Copy the Client ID and Client Secret** to your `.env` file

## 🗄️ How to Get MongoDB Connection String

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create account**: https://www.mongodb.com/cloud/atlas/register
2. **Create a cluster** (free tier available)
3. **Database Access**: Create a database user with password
4. **Network Access**: Add your IP address (or 0.0.0.0/0 for development)
5. **Connect**: Click "Connect" > "Connect your application"
6. **Copy connection string** and replace `<password>` with your user password

### Option 2: Local MongoDB (For Development)

1. **Install MongoDB**: https://www.mongodb.com/try/download/community
2. **Start MongoDB**: `mongod`
3. **Use connection string**: `mongodb://localhost:27017/wedly`

## 🔐 Generate Secure JWT Secrets

Run this in your terminal to generate secure random secrets:

```bash
# For JWT_ACCESS_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to your `.env` file.

## ✅ Production Checklist

Before deploying to production, ensure you:

- ✅ Change JWT secrets to strong random strings (use the command above)
- ✅ Update `CLIENT_ORIGIN` to your frontend domain (e.g., `https://wedly.com`)
- ✅ Update `API_BASE_URL` to your API domain (e.g., `https://api.wedly.com`)
- ✅ Use MongoDB Atlas with proper IP whitelist configured
- ✅ Add your production domain to Google OAuth allowed origins
- ✅ Set appropriate JWT token TTLs for your use case
- ✅ Never commit `.env` file to version control (it's in `.gitignore`)
- ✅ Use environment variables in your deployment platform (Vercel, Railway, etc.)

## 🧪 Quick Test

After setting up your `.env` file:

```bash
# 1. Generate Prisma client
npm run prisma:generate

# 2. Push schema to database
npm run prisma:push

# 3. Start the server
npm run dev

# 4. Test the health endpoint
curl http://localhost:4000/users/me
# Should return 401 Unauthorized (because no token - this is correct!)

# 5. Register a test user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

If you see a successful response with JWT tokens, your environment is configured correctly! 🎉

