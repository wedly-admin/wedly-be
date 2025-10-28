# 🚀 Wedly Backend - Quick Start

## ✅ Setup Complete!

Your backend is now ready to run! Here's what's been configured:

- ✅ All dependencies installed
- ✅ Prisma client generated
- ✅ `.env` file created with secure JWT secrets
- ✅ All modules implemented (Auth, Events, Budget, Checklist, Guests, Seating)
- ✅ Zod validation configured
- ✅ OpenAPI/Swagger documentation ready

## ⚠️ Before Starting

**Update your `.env` file with:**

### 1. MongoDB Connection String (Required)

Replace this line in `.env`:
```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/wedly?retryWrites=true&w=majority"
```

#### Option A: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster (M0)
3. Create database user: `wedly_user` with a strong password
4. Add IP: `0.0.0.0/0` (for development) or your IP
5. Get connection string and update `.env`

#### Option B: Local MongoDB
```env
DATABASE_URL="mongodb://localhost:27017/wedly"
```

### 2. Google OAuth (Optional - for Google Sign-In)

Only needed if you want to test Google One-Tap authentication:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add origins: `http://localhost:3000`, `http://localhost:4000`
4. Update in `.env`:
```env
GOOGLE_CLIENT_ID=your_actual_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret
GOOGLE_AUDIENCE=your_actual_id.apps.googleusercontent.com
```

## 🏃 Run the Backend

### Step 1: Push Database Schema

```bash
npm run prisma:push
```

This creates the collections in MongoDB.

### Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Wedly API running at http://localhost:4000
📜 Swagger docs at http://localhost:4000/docs
📄 OpenAPI spec at http://localhost:4000/openapi.json
```

## 🧪 Test the API

### Option 1: Use Swagger UI (Recommended)

Open in your browser:
```
http://localhost:4000/docs
```

You can test all endpoints interactively!

### Option 2: Use curl

#### 1. Register a User

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "image": null
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### 2. Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### 3. Get Profile

```bash
curl http://localhost:4000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Create Event

```bash
curl -X POST http://localhost:4000/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My Wedding\",\"locale\":\"sr\",\"date\":\"2025-06-15\"}"
```

#### 5. Add Budget Item

```bash
curl -X POST http://localhost:4000/events/EVENT_ID/budget-items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"Venue\",\"title\":\"Reception Hall\",\"planned\":500000,\"status\":\"TODO\"}"
```

## 📚 Available Endpoints

### Authentication (Public)
- `POST /auth/register` - Register with email/password
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/google` - Google One-Tap sign-in

### Users (Protected)
- `GET /users/me` - Get current user

### Events (Protected)
- `POST /events` - Create event
- `GET /events` - List all events
- `GET /events/:id` - Get event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Budget (Protected)
- `POST /events/:eventId/budget-items` - Create budget item
- `GET /events/:eventId/budget-items` - List budget items
- `GET /events/:eventId/budget-items/:id` - Get budget item
- `PATCH /events/:eventId/budget-items/:id` - Update budget item
- `DELETE /events/:eventId/budget-items/:id` - Delete budget item

### Checklist (Protected)
- `POST /events/:eventId/checklist` - Create task
- `GET /events/:eventId/checklist` - List tasks
- `GET /events/:eventId/checklist/:id` - Get task
- `PATCH /events/:eventId/checklist/:id` - Update task
- `DELETE /events/:eventId/checklist/:id` - Delete task

### Guests (Protected)
- `POST /events/:eventId/guests` - Create guest
- `GET /events/:eventId/guests` - List guests
- `GET /events/:eventId/guests/:id` - Get guest
- `PATCH /events/:eventId/guests/:id` - Update guest
- `DELETE /events/:eventId/guests/:id` - Delete guest

### Seating (Protected)
- `POST /events/:eventId/tables` - Create table
- `GET /events/:eventId/tables` - List tables
- `PATCH /tables/:id` - Update table
- `DELETE /tables/:id` - Delete table
- `POST /events/:eventId/seats` - Assign seat
- `GET /events/:eventId/seats` - List seat assignments
- `PATCH /seats/:id` - Update seat assignment
- `DELETE /seats/:id` - Remove seat assignment

## 🔧 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Check your `DATABASE_URL` in `.env`
- Verify MongoDB is running (if local)
- Check network access whitelist (if MongoDB Atlas)

### Error: "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Error: Port 4000 already in use
- Change `PORT=4001` in `.env`
- Or kill the process: `netstat -ano | findstr :4000` then `taskkill /F /PID <PID>`

### Prisma errors
```bash
# Reset and regenerate
npm run prisma:generate
npm run prisma:push
```

## 📖 Full Documentation

See `README.md` for complete API documentation and architecture details.

## 🎉 You're Ready!

Your Wedly backend is fully configured and ready to use. Start building your frontend or test the API via Swagger at http://localhost:4000/docs

Happy coding! 🚀

