# Wedly Backend

A comprehensive wedding planning platform backend API built with NestJS, Prisma, MongoDB, and Zod validation. Wedly helps couples manage their wedding events with features including budget tracking, guest management, checklist tasks, and seating arrangements. The platform supports bilingual content (Serbian/English) and includes JWT authentication with Google One-Tap Sign-In integration.

## 🚀 Features

- **Authentication**: JWT tokens + Google One-Tap Sign-In
- **Event Management**: Create and manage wedding events
- **Budget Tracking**: Track expenses and payments
- **Checklist**: Task management for wedding planning
- **Guest Management**: Manage guest lists with RSVP status
- **Seating Arrangements**: Table and seat assignments

## 🛠️ Tech Stack

- **NestJS**: Backend framework
- **Prisma**: ORM for MongoDB
- **MongoDB**: Database
- **Zod**: Schema validation (no class-validator)
- **zod-to-openapi**: Auto-generate OpenAPI/Swagger docs
- **JWT**: Authentication
- **Google Auth Library**: Google Sign-In verification
- **Argon2**: Password hashing

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600

# Google (OAuth & One-Tap)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_AUDIENCE=your_google_client_id.apps.googleusercontent.com

# Email (SMTP) – verification & password reset (e.g. Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=Wedly <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
# For Gmail: use an App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal password.

# Prisma (MongoDB)
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/wedly?retryWrites=true&w=majority"
```

## 🗄️ Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to MongoDB
npm run prisma:push
```

## 🏃 Running the App

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

The API will be available at:

- **API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/docs
- **OpenAPI JSON**: http://localhost:4000/openapi.json

## 📚 API Documentation

Interactive API documentation is available at `/docs` when the server is running.

### Key Endpoints

#### Authentication

- `POST /auth/register` - Register with email/password
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/google` - Google One-Tap / Sign-In

#### Users

- `GET /users/me` - Get current user profile

#### Events

- `POST /events` - Create event
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

#### Budget

- `POST /events/:eventId/budget-items` - Create budget item
- `GET /events/:eventId/budget-items` - List budget items
- `PATCH /events/:eventId/budget-items/:id` - Update budget item
- `DELETE /events/:eventId/budget-items/:id` - Delete budget item

#### Checklist

- `POST /events/:eventId/checklist` - Create checklist item
- `GET /events/:eventId/checklist` - List checklist items
- `PATCH /events/:eventId/checklist/:id` - Update checklist item
- `DELETE /events/:eventId/checklist/:id` - Delete checklist item

#### Guests

- `POST /events/:eventId/guests` - Create guest
- `GET /events/:eventId/guests` - List guests
- `PATCH /events/:eventId/guests/:id` - Update guest
- `DELETE /events/:eventId/guests/:id` - Delete guest

#### Seating

- `POST /events/:eventId/tables` - Create table
- `GET /events/:eventId/tables` - List tables
- `POST /events/:eventId/seats` - Create seat assignment
- `GET /events/:eventId/seats` - List seat assignments

## 🔒 Security

All endpoints except authentication routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## 🌍 Internationalization

Events support bilingual content (Serbian/English) through:

- `locale` field: Primary language (`sr` or `en`)
- `sectionsI18n` field: JSON object with localized content

## 📝 Validation

All request/response validation is handled by **Zod schemas** (no class-validator/class-transformer). Validation errors return structured error messages with field-specific issues.

## 🏗️ Project Structure

```
src/
├── auth/               # Authentication (JWT + Google)
├── users/              # User management
├── events/             # Event management
├── budget/             # Budget tracking
├── checklist/          # Task checklist
├── guests/             # Guest management
├── seating/            # Seating arrangements
├── common/
│   ├── guards/         # Auth guards
│   ├── pipes/          # Zod validation pipe
│   ├── schemas/        # Common enums
│   └── strategies/     # Passport strategies
├── openapi/            # OpenAPI doc generator
├── app.module.ts       # Root module
└── main.ts             # Bootstrap
```

## 📄 License

MIT License

Copyright (c) 2025 Wedly

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**Made with ❤️ for couples planning their special day**
