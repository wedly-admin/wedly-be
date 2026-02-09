# Quick API Testing Guide

This guide provides copy-paste ready commands to test the integrated backend API.

## Prerequisites

```bash
# Backend should be running
cd wedly-backend
npm run dev

# Backend will be available at http://localhost:4000
# Swagger docs at http://localhost:4000/docs
```

---

## 1. Register & Get Token

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bride@wedding.com",
    "password": "secure123",
    "name": "Jane & John"
  }' | jq
```

**Copy the `token` value from the response for subsequent requests.**

---

## 2. Login (Alternative to Register)

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bride@wedding.com",
    "password": "secure123"
  }' | jq
```

---

## 3. Get User Profile

```bash
# Replace YOUR_TOKEN with the actual token from login/register
export TOKEN="YOUR_TOKEN"

curl http://localhost:4000/users/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected**: User object with wedding details structure

---

## 4. Create Tasks

```bash
# Task 1: Venue
curl -X POST http://localhost:4000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Book wedding venue",
    "note": "Research and finalize the venue for the ceremony",
    "price": 8000,
    "advancePayment": 3000
  }' | jq

# Task 2: Catering
curl -X POST http://localhost:4000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hire caterer",
    "note": "Menu tasting and finalize food options",
    "price": 5000,
    "advancePayment": 1500
  }' | jq

# Task 3: Photography
curl -X POST http://localhost:4000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Book photographer",
    "note": "Review portfolios and book photographer",
    "price": 3000,
    "advancePayment": 1000
  }' | jq
```

---

## 5. Get All Tasks

```bash
curl http://localhost:4000/tasks \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected**: Array of tasks with `_id`, `title`, `note`, `price`, `advancePayment`, `status`, `createdAt`

---

## 6. Update a Task

```bash
# First, get the task ID from the list above
# Replace TASK_ID with the actual _id

curl -X PUT http://localhost:4000/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "note": "Venue booked and deposit paid!"
  }' | jq
```

---

## 7. Get Dashboard Statistics

```bash
curl http://localhost:4000/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected**:

```json
{
  "data": {
    "totalBudget": 16000,
    "totalTasks": 3,
    "finishedTasks": 1,
    "totalGuests": 0,
    "weddingProgress": 33,
    "currency": "RSD"
  }
}
```

---

## 8. Delete a Task

```bash
curl -X DELETE http://localhost:4000/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Full Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"

echo "=== 1. Registering user ==="
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@wedding.com",
    "password": "secure123",
    "name": "Test User"
  }')

echo $RESPONSE | jq

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

echo -e "\n=== 2. Getting user profile ==="
curl -s $BASE_URL/users/me \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n=== 3. Creating tasks ==="
TASK_RESPONSE=$(curl -s -X POST $BASE_URL/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Book venue",
    "note": "Find and book the perfect venue",
    "price": 5000,
    "advancePayment": 2000
  }')

echo $TASK_RESPONSE | jq
TASK_ID=$(echo $TASK_RESPONSE | jq -r '._id')

echo -e "\n=== 4. Getting all tasks ==="
curl -s $BASE_URL/tasks \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n=== 5. Updating task ==="
curl -s -X PUT $BASE_URL/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }' | jq

echo -e "\n=== 6. Getting dashboard ==="
curl -s $BASE_URL/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n=== Test completed! ==="
```

Make it executable and run:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Testing with Frontend

1. **Start backend**:

   ```bash
   cd wedly-backend
   npm run dev
   ```

2. **Create frontend env file**:

   ```bash
   cd wedly-fe
   echo "NEXT_PUBLIC_BASE_API_URL=http://localhost:4000" > .env.local
   ```

3. **Start frontend**:

   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:3000

5. **Test flow**:
   - Register a new account
   - Login
   - View dashboard
   - Create tasks in the budget page
   - Verify dashboard updates

---

## Verification Checklist

✅ **Auth**

- [ ] Register returns `token` field
- [ ] Login returns `token` field
- [ ] Token can be used for authenticated requests

✅ **User Profile**

- [ ] `/users/me` returns nested `user` object
- [ ] Response includes `_id` (not `id`)
- [ ] Wedding details structure is present

✅ **Tasks**

- [ ] Can create task with budget fields
- [ ] Tasks list returns array with `_id`
- [ ] Field mapping works (`note` accepted)
- [ ] Update works with PUT method
- [ ] Delete removes task

✅ **Dashboard**

- [ ] Returns aggregated statistics
- [ ] Budget sum is correct
- [ ] Task counts are accurate
- [ ] Progress percentage calculates properly

✅ **General**

- [ ] All endpoints return `_id` instead of `id`
- [ ] CORS allows frontend requests
- [ ] No 401 errors with valid token
- [ ] Frontend displays data correctly

---

## Common Issues

### 401 Unauthorized

- Token expired or invalid
- Solution: Login again to get fresh token

### CORS Error

- Backend `CLIENT_ORIGIN` doesn't match frontend URL
- Solution: Set `CLIENT_ORIGIN=http://localhost:3000` in backend `.env`

### "User primary event not found"

- User created before integration changes
- Solution: Login once to auto-create primary event

### Empty dashboard data

- No tasks/guests created yet
- Solution: Create some tasks first, then check dashboard

---

## API Documentation

For full API documentation, visit: http://localhost:4000/docs

This provides interactive Swagger UI for testing all endpoints.
