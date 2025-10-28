# Wedly Backend - Quick Setup Guide

## ✅ What Was Built

A complete NestJS backend with:

### Core Modules
- ✅ **Auth**: JWT + Google One-Tap Sign-In (`/auth/*`)
- ✅ **Users**: User profile management (`/users/me`)
- ✅ **Events**: Event CRUD (`/events/*`)
- ✅ **Budget**: Budget tracking (`/events/:eventId/budget-items/*`)
- ✅ **Checklist**: Task management (`/events/:eventId/checklist/*`)
- ✅ **Guests**: Guest list (`/events/:eventId/guests/*`)
- ✅ **Seating**: Tables & seats (`/events/:eventId/tables/*`, `/events/:eventId/seats/*`)

### Technical Features
- ✅ **Zod-only validation** (no class-validator)
- ✅ **OpenAPI/Swagger** auto-generated from Zod schemas at `/docs`
- ✅ **Prisma ORM** with MongoDB
- ✅ **JWT authentication** with refresh tokens
- ✅ **Google One-Tap** ID token verification
- ✅ **Argon2** password hashing
- ✅ **Helmet** security headers
- ✅ **CORS** enabled

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update your `.env` file with:
- MongoDB connection string
- JWT secrets (change from defaults!)
- Google OAuth credentials

### 3. Setup Database

```bash
npm run prisma:generate
npm run prisma:push
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the API

- **API Base**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/docs ⭐
- **OpenAPI JSON**: http://localhost:4000/openapi.json

## 🧪 Testing the API

### Register a User

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Profile (with JWT)

```bash
curl http://localhost:4000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Event

```bash
curl -X POST http://localhost:4000/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Wedding","locale":"sr"}'
```

## 📁 Project Structure

```
wedly/
├── prisma/
│   └── schema.prisma          # MongoDB models
├── src/
│   ├── auth/                  # JWT + Google auth
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── schemas.ts         # Zod schemas
│   ├── users/                 # User management
│   ├── events/                # Event CRUD
│   ├── budget/                # Budget tracking
│   ├── checklist/             # Task checklist
│   ├── guests/                # Guest management
│   ├── seating/               # Seating arrangements
│   ├── common/
│   │   ├── guards/            # JWT auth guard
│   │   ├── pipes/             # Zod validation pipe
│   │   ├── schemas/           # Common enums
│   │   ├── strategies/        # JWT strategy
│   │   └── prisma.service.ts  # Prisma client
│   ├── openapi/
│   │   └── openapi.ts         # OpenAPI generator
│   ├── app.module.ts          # Root module
│   └── main.ts                # Bootstrap
├── .env                       # Environment config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Full documentation
```

## 🔑 Key Features

### Zod-Only Validation

All DTOs use Zod schemas (no class-validator):

```typescript
// src/events/schemas.ts
export const CreateEventSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date().optional(),
  locale: z.enum(['sr', 'en']).default('sr'),
});
```

Applied via pipe:

```typescript
@Post()
@UsePipes(new ZodValidationPipe(CreateEventSchema))
create(@Body() dto: any) { ... }
```

### Auto-Generated Swagger

OpenAPI is generated from Zod schemas using `zod-to-openapi`:

```typescript
// src/openapi/openapi.ts
registry.register('CreateEvent', CreateEventSchema.openapi({ ref: 'CreateEvent' }));
```

View at: http://localhost:4000/docs

### Google One-Tap Support

Server-side ID token verification:

```typescript
// POST /auth/google
{ "credential": "eyJhbGc..." }  // Google ID token
```

Returns JWT tokens like regular login.

## 🌍 Bilingual Support (SR/EN)

Events support Serbian and English:

```json
{
  "title": "Venčanje",
  "locale": "sr",
  "sectionsI18n": {
    "sr": { "welcome": "Dobrodošli" },
    "en": { "welcome": "Welcome" }
  }
}
```

## 🔒 Security

- ✅ JWT access tokens (15 min TTL)
- ✅ JWT refresh tokens (14 day TTL)
- ✅ Argon2 password hashing
- ✅ Helmet security headers
- ✅ CORS configured
- ✅ Google ID token verification

## 📝 Next Steps

1. **Update `.env`** with real credentials
2. **Run Prisma migrations** (`npm run prisma:push`)
3. **Test endpoints** via Swagger UI at `/docs`
4. **Configure Google OAuth** for One-Tap
5. **Deploy to production** (update API_BASE_URL)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or kill the process
lsof -ti:4000 | xargs kill
```

### MongoDB Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure network access

### Google Auth Not Working
- Verify `GOOGLE_CLIENT_ID` matches frontend
- Set `GOOGLE_AUDIENCE` correctly
- Check Google Cloud Console credentials

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma MongoDB Guide](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Zod Documentation](https://zod.dev)
- [Google Sign-In Guide](https://developers.google.com/identity/gsi/web)

---

**Built with NestJS + Prisma + MongoDB + Zod + OpenAPI** 🚀

