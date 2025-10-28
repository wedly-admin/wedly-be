# Wedly Backend — Cursor Prompt (NestJS + Prisma + MongoDB + Zod + OpenAPI + JWT + Google One-Tap)
You are **Claude 4.5 Sonnet** running in Cursor. Generate or modify files exactly as specified. Keep changes atomic and production-grade.

---

## 🎯 Objective
Build a **NestJS** backend with **Prisma (MongoDB)** that exposes JWT auth + Google Sign-In (incl. **Google One-Tap**), event microsites, and core features (**Budget / Checklist / Guests / Seating**).  
**Validation** must be **Zod-only**; expose **OpenAPI** generated from Zod schemas using **zod-to-openapi** + **Swagger UI** at `/docs`.

**Key rules**
- Do **NOT** use `class-validator` / `class-transformer`. Only Zod with our `ZodValidationPipe`.
- All request/response DTOs are Zod schemas in `src/**/schemas.ts`.
- Controllers must apply `@UsePipes(new ZodValidationPipe(Schema))`.
- Generate OpenAPI from Zod schemas (no `@nestjs/swagger`).
- Two languages are required (Serbian/English) — see i18n notes below.

---

## 🧱 Tech & Packages
- **NestJS**: HTTP server, modules.
- **Prisma** (MongoDB): schema & queries.
- **Auth**: JWT (access/refresh), Google Sign-In ID token verify (supports One-Tap).
- **Validation**: `zod`
- **OpenAPI**: `zod-to-openapi` + `swagger-ui-express`
- **Misc**: `helmet`, `cookie-parser`, CORS, `argon2` for password hashing.

Install:
```bash
npm i @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/jwt passport passport-jwt passport-google-oauth20 cookie-parser helmet argon2
npm i zod zod-to-openapi swagger-ui-express
npm i @prisma/client
npm i -D prisma typescript ts-node @types/express @types/passport-jwt @types/cookie-parser
```

---

## 🗂️ File/Folder Plan
Create/ensure the following (omit files that already exist; otherwise modify as instructed):

```
.
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app.module.ts
│  ├─ main.ts
│  ├─ common/
│  │  ├─ pipes/zod-validation.pipe.ts
│  │  └─ schemas/enums.ts
│  ├─ openapi/
│  │  └─ openapi.ts
│  ├─ auth/
│  │  ├─ auth.module.ts
│  │  ├─ auth.controller.ts
│  │  ├─ auth.service.ts
│  │  └─ schemas.ts
│  ├─ users/
│  │  ├─ users.module.ts
│  │  ├─ users.service.ts
│  │  └─ users.controller.ts
│  ├─ events/
│  │  ├─ events.module.ts
│  │  ├─ events.service.ts
│  │  ├─ events.controller.ts
│  │  └─ schemas.ts
│  ├─ budget/
│  │  ├─ budget.module.ts
│  │  ├─ budget.service.ts
│  │  ├─ budget.controller.ts
│  │  └─ schemas.ts
│  ├─ checklist/
│  │  ├─ checklist.module.ts
│  │  ├─ checklist.service.ts
│  │  ├─ checklist.controller.ts
│  │  └─ schemas.ts
│  ├─ guests/
│  │  ├─ guests.module.ts
│  │  ├─ guests.service.ts
│  │  ├─ guests.controller.ts
│  │  └─ schemas.ts
│  └─ seating/
│     ├─ seating.module.ts
│     ├─ seating.service.ts
│     ├─ seating.controller.ts
│     └─ schemas.ts
├─ .env
└─ package.json (scripts)
```

---

## 🔐 Environment Variables (`.env`)
```env
# Server
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000

# JWT
JWT_ACCESS_SECRET=dev_access_secret_change_me
JWT_REFRESH_SECRET=dev_refresh_secret_change_me
JWT_ACCESS_TTL=900         # 15m
JWT_REFRESH_TTL=1209600    # 14d

# Google (OAuth & One-Tap)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxx
GOOGLE_AUDIENCE=xxxxxxxxxxxxxxxx.apps.googleusercontent.com  # for ID token verification

# Prisma (Mongo)
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/wedly?retryWrites=true&w=majority"
```

---

## 🗄️ Prisma (MongoDB) — `prisma/schema.prisma`
> Keep models minimal; add fields as needed later. Strings hold ObjectId values.
```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["mongoDb"]
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  passwordHash  String?  // for email/password
  googleId      String?  @unique
  name          String?
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Event {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  ownerId       String   @db.ObjectId
  title         String
  date          DateTime?
  locale        String    // "sr" | "en"
  // Optional i18n payload for microsite sections:
  sectionsI18n  Json?     // { sr: {...}, en: {...} }
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model BudgetItem {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String   @db.ObjectId
  category  String
  title     String
  planned   Int      @default(0)
  paid      Int      @default(0)
  vendorId  String?
  dueDate   DateTime?
  status    String   // TODO | IN_PROGRESS | DONE
  notes     String?
  order     Int      @default(0)
}

model ChecklistItem {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String   @db.ObjectId
  title     String
  description String?
  status    String   // TODO | IN_PROGRESS | DONE
  dueDate   DateTime?
  assigneeId String?
  order     Int      @default(0)
}

model Guest {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String   @db.ObjectId
  groupId   String?
  firstName String
  lastName  String
  phone     String?
  email     String?
  side      String   // BRIDE | GROOM | BOTH | OTHER
  status    String   // PENDING | COMING | NOT_COMING
  guests    Int      @default(1)
  tags      String[]
  notes     String?
  seatId    String?
}

model Table {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String   @db.ObjectId
  name      String
  capacity  Int      @default(8)
  side      String?  // optional alignment
  order     Int      @default(0)
}

model SeatAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  eventId   String   @db.ObjectId
  tableId   String   @db.ObjectId
  guestId   String   @db.ObjectId
  position  Int      @default(0)
}
```

Add scripts:
```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push"
  }
}
```

---

## 🧩 Common — Enums + Zod Pipe

### `src/common/schemas/enums.ts`
```ts
import { z } from 'zod';

export const CurrencyEnum    = z.enum(['RSD', 'EUR', 'USD']);
export const ItemStatusEnum  = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const GuestSideEnum   = z.enum(['BRIDE', 'GROOM', 'BOTH', 'OTHER']);
export const GuestStatusEnum = z.enum(['PENDING', 'COMING', 'NOT_COMING']);
```

### `src/common/pipes/zod-validation.pipe.ts`
```ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}
  transform(value: any) {
    const res = this.schema.safeParse(value);
    if (!res.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        issues: res.error.issues,
      });
    }
    return res.data;
  }
}
```

---

## 🔑 Auth (JWT + Google Sign-In & One-Tap)

### `src/auth/schemas.ts`
```ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(10),
});

// Google One-Tap / Sign-In: frontend sends Google ID token
export const GoogleIdSchema = z.object({
  credential: z.string().min(20), // the ID token
});
```

### `src/auth/auth.module.ts`
Create a standard Nest module wiring `AuthService`, `AuthController`, and JWT module.

### `src/auth/auth.service.ts`
- Register: hash password (argon2), create user.
- Login: verify, return `{ accessToken, refreshToken }`.
- Refresh: verify refresh token, reissue access.

- **Google verify**: verify **ID token** server-side using Google certs:
  - Either `google-auth-library` (`OAuth2Client.verifyIdToken`) **or** manual JWKS verification; to keep deps small, prefer `google-auth-library`.

Install:
```bash
npm i google-auth-library
```

Implement:
```ts
import { OAuth2Client, TokenPayload } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string, audience?: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audience ?? process.env.GOOGLE_AUDIENCE,
  });
  return ticket.getPayload() as TokenPayload | null;
}
```

On success: find-or-create user by `payload.sub` (googleId) and `payload.email`. Issue JWTs.

### `src/auth/auth.controller.ts`
Use Zod pipe on routes:
- `POST /auth/register` (`RegisterSchema`)
- `POST /auth/login` (`LoginSchema`)
- `POST /auth/refresh` (`RefreshSchema`)
- `POST /auth/google` (`GoogleIdSchema`) — accepts `{ credential }` from One-Tap or button flow.

Return:
```ts
{ user: { id, email, name, image }, accessToken, refreshToken }
```

---

## 👤 Users (minimal)

`users.service.ts` exposes CRUD finders; `users.controller.ts` can provide `GET /me` using JWT guard.

---

## 📅 Events

### `src/events/schemas.ts`
```ts
import { z } from 'zod';

const zDate = z.coerce.date();
export const CreateEventSchema = z.object({
  title: z.string().min(1),
  date: zDate.optional(),
  // language for main event (sr/en)
  locale: z.enum(['sr','en']).default('sr'),
  // optional i18n payload for microsite sections
  sectionsI18n: z.record(z.enum(['sr','en']), z.any()).optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();
```

Controller endpoints (sketch):
- `POST /events` (create)
- `PATCH /events/:id`
- `GET /events/:id`
- `GET /events?ownerId=...`
- `DELETE /events/:id`

Use JWT guard + Zod pipe.

---

## 💸 Budget

### `src/budget/schemas.ts`
```ts
import { z } from 'zod';
import { CurrencyEnum, ItemStatusEnum } from '../common/schemas/enums';

const zDate = z.coerce.date();

export const BudgetSchema = z.object({
  currency: CurrencyEnum.default('RSD'),
  totalBudget: z.number().int().min(0).default(0),
});

export type BudgetInput = z.infer<typeof BudgetSchema>

export const BudgetItemSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  planned: z.number().int().nonnegative().default(0),
  paid: z.number().int().nonnegative().default(0),
  vendorId: z.string().optional(),
  dueDate: zDate.optional(),
  status: ItemStatusEnum.default('TODO'),
  notes: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
});

export type BudgetItemInput = z.infer<typeof BudgetItemSchema>;
```

Controller (sketch):
- `POST /events/:eventId/budget` (upsert event budget meta)
- `POST /events/:eventId/budget-items` (+ list, patch, delete)

---

## ☑️ Checklist

### `src/checklist/schemas.ts`
```ts
import { z } from 'zod';
import { ItemStatusEnum } from '../common/schemas/enums';
const zDate = z.coerce.date();

export const ChecklistItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: ItemStatusEnum.default('TODO'),
  dueDate: zDate.optional(),
  assigneeId: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
});
export type ChecklistItemInput = z.infer<typeof ChecklistItemSchema>;
```

Routes under `/events/:eventId/checklist*`.

---

## 🧑‍🤝‍🧑 Guests

### `src/guests/schemas.ts`
```ts
import { z } from 'zod';
import { GuestSideEnum, GuestStatusEnum } from '../common/schemas/enums';

export const GuestGroupSchema = z.object({
  label: z.string().min(1),
  notes: z.string().optional(),
});
export type GuestGroupInput = z.infer<typeof GuestGroupSchema>;

export const GuestSchema = z.object({
  groupId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  side: GuestSideEnum.default('OTHER'),
  status: GuestStatusEnum.default('PENDING'),
  guests: z.number().int().positive().default(1),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  seatId: z.string().optional(),
});
export type GuestInput = z.infer<typeof GuestSchema>;
```

Routes under `/events/:eventId/guests*`.

---

## 🍽️ Seating

### `src/seating/schemas.ts`
```ts
import { z } from 'zod';
import { GuestSideEnum } from '../common/schemas/enums';

export const TableSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive().default(8),
  side: GuestSideEnum.optional(),
  order: z.number().int().nonnegative().default(0),
});
export type TableInput = z.infer<typeof TableSchema>;

export const SeatAssignmentSchema = z.object({
  tableId: z.string().min(1),
  guestId: z.string().min(1),
  position: z.number().int().nonnegative().default(0),
});
export type SeatAssignmentInput = z.infer<typeof SeatAssignmentSchema>;
```

Routes under `/events/:eventId/tables*` and `/events/:eventId/seats*`.

---

## 📜 OpenAPI from Zod — `src/openapi/openapi.ts`
```ts
import { OpenAPIRegistry, extendZodWithOpenApi, generateOpenApiDocument } from 'zod-to-openapi';
import { z } from 'zod';

import { BudgetSchema, BudgetItemSchema } from '../budget/schemas';
import { ChecklistItemSchema } from '../checklist/schemas';
import { GuestSchema, GuestGroupSchema } from '../guests/schemas';
import { TableSchema, SeatAssignmentSchema } from '../seating/schemas';
import { CreateEventSchema, UpdateEventSchema } from '../events/schemas';
import { RegisterSchema, LoginSchema, RefreshSchema, GoogleIdSchema } from '../auth/schemas';

extendZodWithOpenApi(z);

export function buildOpenAPIDocument() {
  const registry = new OpenAPIRegistry();

  // Models
  registry.register('Budget', BudgetSchema.openapi({ ref: 'Budget' }));
  registry.register('BudgetItem', BudgetItemSchema.openapi({ ref: 'BudgetItem' }));
  registry.register('ChecklistItem', ChecklistItemSchema.openapi({ ref: 'ChecklistItem' }));
  registry.register('Guest', GuestSchema.openapi({ ref: 'Guest' }));
  registry.register('GuestGroup', GuestGroupSchema.openapi({ ref: 'GuestGroup' }));
  registry.register('Table', TableSchema.openapi({ ref: 'Table' }));
  registry.register('SeatAssignment', SeatAssignmentSchema.openapi({ ref: 'SeatAssignment' }));
  registry.register('CreateEvent', CreateEventSchema.openapi({ ref: 'CreateEvent' }));
  registry.register('UpdateEvent', UpdateEventSchema.openapi({ ref: 'UpdateEvent' }));
  registry.register('Register', RegisterSchema.openapi({ ref: 'Register' }));
  registry.register('Login', LoginSchema.openapi({ ref: 'Login' }));
  registry.register('Refresh', RefreshSchema.openapi({ ref: 'Refresh' }));
  registry.register('GoogleOneTap', GoogleIdSchema.openapi({ ref: 'GoogleOneTap' }));

  // Minimal paths (example auth & events). Add others similarly.
  registry.registerPath({
    method: 'post',
    path: '/auth/google',
    request: { body: { content: { 'application/json': { schema: GoogleIdSchema } } } },
    responses: {
      200: { description: 'OK' },
      400: { description: 'Bad Request' },
    },
    summary: 'Google One-Tap / Sign-In',
  });

  registry.registerPath({
    method: 'post',
    path: '/events',
    request: { body: { content: { 'application/json': { schema: CreateEventSchema } } } },
    responses: { 201: { description: 'Created' } },
    summary: 'Create Event',
  });

  const doc = generateOpenApiDocument(registry.definitions, {
    openapi: '3.0.3',
    info: { title: 'Wedly API', version: '1.0.0', description: 'OpenAPI iz Zod šema.' },
    servers: [{ url: process.env.API_BASE_URL ?? 'http://localhost:4000' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
    security: [{ bearerAuth: [] }],
  });

  return doc;
}
```

---

## 🚀 Main bootstrap — `src/main.ts`
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as swaggerUi from 'swagger-ui-express';
import { buildOpenAPIDocument } from './openapi/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: process.env.CLIENT_ORIGIN, credentials: true });

  const openapi = buildOpenAPIDocument();
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  app.getHttpAdapter().get('/openapi.json', (req, res) => res.json(openapi));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 http://localhost:${port}`);
  console.log(`📜 Swagger: http://localhost:${port}/docs`);
}
bootstrap();
```

---

## 🧩 App module — `src/app.module.ts`
Wire up modules (Auth, Users, Events, Budget, Checklist, Guests, Seating) and PrismaService if you use a wrapper. (If you already have a Prisma module/service, reuse it.)

---

## 🌍 i18n Strategy (SR/EN)
- **Database stays the same** for numeric/date/ids.
- For content that varies by language (microsite sections, textual titles/descriptions), use either:
  1) **Single language per event** via `event.locale` (simplest), and create a second event for the other language, **or**
  2) Store **i18n fields** as `sectionsI18n: { sr: {...}, en: {...} }` and select at runtime.
- Zod example already allows `sectionsI18n`.

---

## 🔒 JWT Guards (note)
Implement a standard JWT auth guard using `@nestjs/jwt` and `passport-jwt`. Protect all event/feature routes with `@UseGuards(JwtAuthGuard)`.

---

## 🧪 Minimal Controller Patterns (example)
Apply `ZodValidationPipe` per route.
```ts
// budget.controller.ts
@UseGuards(JwtAuthGuard)
@Post('events/:eventId/budget-items')
@UsePipes(new ZodValidationPipe(BudgetItemSchema))
createBudgetItem(@Param('eventId') eventId: string, @Body() dto: any) {
  return this.budgetService.createItem(eventId, dto);
}
```

---

## ▶️ Dev Commands
```bash
npm run prisma:generate
npm run prisma:push
npm run dev
# Swagger at /docs
```

---

## ✅ Cursor Instructions
1. **Read this file fully** and follow exactly.  
2. Create any missing files and update existing ones to match this spec.  
3. Ensure **Zod-only** validation and **zod-to-openapi** generation are working.  
4. Implement Google ID token verification (`/auth/google`) and return JWTs.  
5. Add CRUD for **Events / Budget / Checklist / Guests / Seating** using provided Zod schemas and Prisma models.  
6. Keep code clean, typed, and production-ready (errors, DTO boundaries, guards).  
7. After generation, output a concise **diff summary** and **test instructions**.

---
